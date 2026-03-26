import { Bot, User } from 'lucide-react';
import { TriageCard } from './TriageCard';
import { AIDisclaimer } from './AIDisclaimer';
import type { AIMessage } from '../../types';

interface ChatMessageProps {
  message: AIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end gap-2 animate-fade-up">
        <div className="max-w-[80%] bg-soft-blue text-white rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="text-sm font-body leading-relaxed">{message.content}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-calm-blue-50 flex items-center justify-center shrink-0 mt-auto">
          <User size={16} className="text-calm-blue" />
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex gap-2 animate-fade-up">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-soft-blue to-calm-blue flex items-center justify-center shrink-0 mt-auto shadow-glow-blue">
        <Bot size={16} className="text-white" />
      </div>

      <div className="max-w-[85%] flex flex-col gap-2">
        {/* Loading state */}
        {message.isLoading && !message.content ? (
          <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-soft border border-calm-blue-50">
            <HeartbeatTyping />
          </div>
        ) : (
          <>
            {message.content && (
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-soft border border-calm-blue-50">
                <p className="text-sm font-body leading-relaxed text-text-primary whitespace-pre-wrap">
                  {message.content}
                  {message.isLoading && (
                    <span className="inline-block w-0.5 h-4 bg-soft-blue ml-0.5 animate-pulse-soft align-middle" />
                  )}
                </p>
                <AIDisclaimer compact className="mt-2" />
              </div>
            )}

            {/* Triage card */}
            {message.triageResult && !message.isLoading && (
              <TriageCard triage={message.triageResult} />
            )}
          </>
        )}

        {/* Timestamp */}
        {!message.isLoading && (
          <p className="text-xs text-text-muted font-body pl-1">
            {new Date(message.timestamp).toLocaleTimeString('ru', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Heartbeat typing indicator ────────────────────────────────────
function HeartbeatTyping() {
  return (
    <div className="flex items-center gap-1" aria-label="AI печатает…">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="w-1 bg-soft-blue rounded-full"
          style={{
            height:                   `${[4, 10, 16, 10, 4][i]}px`,
            animationName:            'pulseSoft',
            animationDuration:        '0.9s',
            animationTimingFunction:  'ease-in-out',
            animationIterationCount:  'infinite',
            animationDelay:           `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}
