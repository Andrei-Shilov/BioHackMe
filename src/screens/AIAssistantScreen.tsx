import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Mic, MicOff, RotateCcw, Settings, Phone } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import { ChatMessage } from '../components/ai/ChatMessage';
import { AIDisclaimer } from '../components/ai/AIDisclaimer';
import { Button } from '../components/ui/Button';
import { TRIAGE_CONFIG } from '../services/openai';
import { cn } from '../utils/cn';

// ─── Suggested starter prompts ─────────────────────────────────────
const STARTERS = [
  'У меня болит голова уже 3 дня',
  'Сильная усталость и слабость',
  'Боль в груди при дыхании',
  'Тошнота и рвота с утра',
  'Повышенная температура 38°C',
  'Боль в спине, не могу разогнуться',
];

export function AIAssistantScreen() {
  const navigate                      = useNavigate();
  const { messages, isLoading, error, triage, sendMessage, reset } = useAI();
  const [input,       setInput]       = useState('');
  const [isListening, setIsListening] = useState(false);
  const apiKeyMissing = !import.meta.env.VITE_OPENAI_API_KEY;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<{ abort: () => void; start: () => void } | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Setup speech recognition
  useEffect(() => {
    type AnyRecognition = {
      lang: string; continuous: boolean;
      onresult: ((e: { results: { 0: { 0: { transcript: string } } }[] }) => void) | null;
      onend: (() => void) | null;
      abort(): void; start(): void;
    };
    type SR = { new(): AnyRecognition };
    const SRCtor: SR | undefined =
      (window as unknown as { SpeechRecognition?: SR }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: SR }).webkitSpeechRecognition;
    if (!SRCtor) return;

    const recognition      = new SRCtor();
    recognition.lang       = 'ru-RU';
    recognition.continuous = false;

    recognition.onresult = (e) => {
      const transcript = (e.results[0][0] as unknown as { transcript: string }).transcript;
      setInput((prev) => prev + (prev ? ' ' : '') + transcript);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput('');
    inputRef.current?.focus();
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.abort();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto px-4 sm:px-6">

      {/* ── Header ── */}
      <div className="py-4 border-b border-calm-blue-50 flex items-center justify-between shrink-0">
        <div>
          <h1 className="font-display text-2xl text-calm-blue">AI-ассистент</h1>
          <p className="text-sm text-text-muted font-body">Опишите симптомы — я помогу разобраться</p>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={reset}
              className="p-2 rounded-xl text-text-muted hover:bg-calm-blue-50 hover:text-calm-blue transition-colors"
              aria-label="Начать новый диалог"
              title="Новый диалог"
            >
              <RotateCcw size={18} />
            </button>
          )}
          <button
            onClick={() => navigate('/profile')}
            className="p-2 rounded-xl text-text-muted hover:bg-calm-blue-50 hover:text-calm-blue transition-colors"
            aria-label="Настройки API ключа"
            title="Настройки"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <AIDisclaimer className="mt-4 shrink-0" />

      {/* ── API Key Warning ── */}
      {apiKeyMissing && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 font-body shrink-0">
          <strong>VITE_OPENAI_API_KEY</strong> не задан — режим демо (ответы симулируются).
          Добавьте ключ в <code className="bg-amber-100 px-1 rounded">.env</code>.
        </div>
      )}

      {/* ── Triage status bar (when active) ── */}
      {triage && (
        <div
          className={cn(
            'mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-body font-semibold shrink-0',
            TRIAGE_CONFIG[triage.level].bgColor,
            TRIAGE_CONFIG[triage.level].color,
            'border',
            TRIAGE_CONFIG[triage.level].borderColor
          )}
        >
          <span>{TRIAGE_CONFIG[triage.level].icon}</span>
          Текущий уровень: {TRIAGE_CONFIG[triage.level].label}
          {triage.level === 'red' && (
            <a
              href="tel:112"
              className="ml-auto flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-lg text-xs hover:bg-red-700 transition-colors"
            >
              <Phone size={12} /> 112
            </a>
          )}
        </div>
      )}

      {/* ── Messages area ── */}
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4 min-h-0">

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-soft-blue to-calm-blue rounded-3xl flex items-center justify-center shadow-glow-blue">
              <span className="text-3xl">🩺</span>
            </div>
            <div>
              <h2 className="font-display text-xl text-calm-blue mb-2">
                Расскажите о своих симптомах
              </h2>
              <p className="text-text-muted font-body text-sm max-w-xs">
                Я задам несколько уточняющих вопросов и помогу понять, нужна ли консультация врача.
              </p>
            </div>

            {/* Starter prompts */}
            <div className="flex flex-wrap justify-center gap-2 max-w-md stagger-children">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  className="px-3 py-1.5 bg-white border border-calm-blue-100 rounded-full text-sm text-text-muted font-body hover:border-soft-blue hover:text-soft-blue transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Error */}
        {error && (
          <div className="p-3 bg-coral-50 border border-coral-100 rounded-xl text-sm text-coral-600 font-body animate-fade-up">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input area ── */}
      <div className="py-3 border-t border-calm-blue-50 shrink-0">
        <div className="flex items-end gap-2 bg-white border border-calm-blue-100 rounded-2xl p-2 focus-within:border-soft-blue focus-within:ring-2 focus-within:ring-soft-blue/20 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Опишите симптомы…"
            rows={1}
            className="flex-1 resize-none bg-transparent px-2 py-1.5 text-base text-text-primary font-body placeholder:text-text-muted focus:outline-none max-h-32"
            style={{ lineHeight: '1.5' }}
            aria-label="Введите симптомы"
            disabled={isLoading}
          />

          {/* Voice input */}
          <button
            onClick={toggleVoice}
            className={cn(
              'p-2 rounded-xl transition-colors shrink-0',
              isListening
                ? 'bg-warm-coral text-white animate-pulse-soft'
                : 'text-text-muted hover:bg-calm-blue-50 hover:text-soft-blue'
            )}
            aria-label={isListening ? 'Остановить запись' : 'Голосовой ввод'}
            title={isListening ? 'Остановить' : 'Голос'}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Send */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            loading={isLoading}
            className="shrink-0 rounded-xl"
            aria-label="Отправить сообщение"
          >
            <Send size={16} />
          </Button>
        </div>
        <p className="text-xs text-text-muted font-body text-center mt-2">
          Enter — отправить · Shift+Enter — новая строка
        </p>
      </div>
    </div>
  );
}
