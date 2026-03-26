import type { AIMessage, TriageResult, TriageLevel } from '../types';

// ─── System Prompt ────────────────────────────────────────────────
const SYSTEM_PROMPT = `Ты медицинский AI-ассистент Lumina Health.

СТРОГИЕ ПРАВИЛА:
1. Ты НИКОГДА не ставишь диагнозы — только гипотезы
2. Всегда указывай источник данных и уровень уверенности (%)
3. Всегда рекомендуй обратиться к врачу при желтом/красном уровне
4. Используй простой язык без медицинского жаргона
5. Задавай уточняющие вопросы по одному, не списком
6. При угрозе жизни — немедленно указывай 911/скорую
7. НИКОГДА не используй слова "диагноз", "у вас точно", "вылечит"
8. Все формулировки гендерно-нейтральные

ФОРМАТ ФИНАЛЬНОГО ОТВЕТА (только когда собрано достаточно информации):
Верни JSON-блок внутри тега <triage>:
<triage>
{
  "level": "green" | "yellow" | "red",
  "hypothesis": "краткое описание гипотезы",
  "confidence": 75,
  "source": "источник данных (напр. WHO Guidelines 2024)",
  "selfCareGuide": "советы самопомощи (только для green)",
  "urgency": "описание срочности",
  "transferToDoctor": true | false,
  "suggestedProtocols": []
}
</triage>

До финального ответа — задавай уточняющие вопросы по одному.`;

// ─── Types ─────────────────────────────────────────────────────────
export interface OpenAIConfig {
  apiKey: string;
  model?: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// ─── Parse triage from response ───────────────────────────────────
export function parseTriageResult(content: string): TriageResult | null {
  const match = content.match(/<triage>([\s\S]*?)<\/triage>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1].trim()) as TriageResult;
  } catch {
    return null;
  }
}

export function stripTriageTag(content: string): string {
  return content.replace(/<triage>[\s\S]*?<\/triage>/g, '').trim();
}

// ─── OpenAI Service ───────────────────────────────────────────────
export class OpenAIService {
  private apiKey: string;
  private model: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(config: OpenAIConfig) {
    this.apiKey = config.apiKey;
    this.model  = config.model ?? 'gpt-4o-mini';
  }

  async chat(
    messages: AIMessage[],
    onChunk?: (chunk: string) => void
  ): Promise<{ content: string; triage: TriageResult | null }> {
    const chatMessages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
        .filter((m) => !m.isLoading)
        .map((m) => ({
          role:    m.role as 'user' | 'assistant',
          content: m.content,
        })),
    ];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model:       this.model,
        messages:    chatMessages,
        stream:      !!onChunk,
        temperature: 0.3,
        max_tokens:  1024,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { error?: { message?: string } }).error?.message ?? 'OpenAI API error');
    }

    // Streaming
    if (onChunk && response.body) {
      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data) as {
              choices: { delta: { content?: string } }[];
            };
            const chunk = parsed.choices[0]?.delta?.content ?? '';
            if (chunk) {
              fullContent += chunk;
              onChunk(chunk);
            }
          } catch {
            // ignore malformed chunks
          }
        }
      }

      return {
        content: stripTriageTag(fullContent),
        triage:  parseTriageResult(fullContent),
      };
    }

    // Non-streaming
    const data = await response.json() as {
      choices: { message: { content: string } }[];
    };
    const content = data.choices[0]?.message?.content ?? '';
    return {
      content: stripTriageTag(content),
      triage:  parseTriageResult(content),
    };
  }
}

// ─── Triage level helpers ──────────────────────────────────────────
export const TRIAGE_CONFIG: Record<
  TriageLevel,
  { label: string; color: string; bgColor: string; borderColor: string; icon: string; urgency: string }
> = {
  green: {
    label:       'Самопомощь',
    color:       'text-emerald-700',
    bgColor:     'bg-emerald-50',
    borderColor: 'border-emerald-300',
    icon:        '🟢',
    urgency:     'Не срочно',
  },
  yellow: {
    label:       'Нужен врач',
    color:       'text-amber-700',
    bgColor:     'bg-amber-50',
    borderColor: 'border-amber-300',
    icon:        '🟡',
    urgency:     'В течение 4 часов',
  },
  red: {
    label:       'Срочная помощь',
    color:       'text-red-700',
    bgColor:     'bg-red-50',
    borderColor: 'border-red-300',
    icon:        '🔴',
    urgency:     'Немедленно — 112',
  },
};

// ─── Singleton factory (uses env var or passed key) ───────────────
let _instance: OpenAIService | null = null;

export function getOpenAIService(apiKey?: string): OpenAIService {
  if (!_instance || apiKey) {
    const key = apiKey ?? import.meta.env.VITE_OPENAI_API_KEY ?? '';
    _instance = new OpenAIService({ apiKey: key });
  }
  return _instance;
}
