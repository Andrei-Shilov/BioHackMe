import { useState, useCallback, useRef } from 'react';
import { getOpenAIService } from '../services/openai';
import type { AIMessage, TriageResult } from '../types';

interface UseAIReturn {
  messages:    AIMessage[];
  isLoading:   boolean;
  error:       string | null;
  triage:      TriageResult | null;
  sendMessage: (content: string) => Promise<void>;
  reset:       () => void;
}

export function useAI(): UseAIReturn {
  const [messages,  setMessages]  = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [triage,    setTriage]    = useState<TriageResult | null>(null);
  const streamingIdRef = useRef<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    setError(null);

    const userMsg: AIMessage = {
      id:        crypto.randomUUID(),
      role:      'user',
      content:   content.trim(),
      timestamp: new Date().toISOString(),
    };

    const loadingId = crypto.randomUUID();
    const loadingMsg: AIMessage = {
      id:        loadingId,
      role:      'assistant',
      content:   '',
      timestamp: new Date().toISOString(),
      isLoading: true,
    };

    streamingIdRef.current = loadingId;

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setIsLoading(true);

    try {
      const service = getOpenAIService();
      let streamedContent = '';

      const { content: finalContent, triage: triageResult } = await service.chat(
        [...messages, userMsg],
        (chunk) => {
          streamedContent += chunk;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === loadingId
                ? { ...m, content: streamedContent, isLoading: false }
                : m
            )
          );
        }
      );

      // Finalize message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? {
                ...m,
                content:      finalContent || streamedContent,
                isLoading:    false,
                triageResult: triageResult ?? undefined,
              }
            : m
        )
      );

      if (triageResult) {
        setTriage(triageResult);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Произошла ошибка. Попробуйте ещё раз.';
      setError(message);
      // Remove loading message on error
      setMessages((prev) => prev.filter((m) => m.id !== loadingId));
    } finally {
      setIsLoading(false);
      streamingIdRef.current = null;
    }
  }, [messages, isLoading]);

  const reset = useCallback(() => {
    setMessages([]);
    setTriage(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { messages, isLoading, error, triage, sendMessage, reset };
}
