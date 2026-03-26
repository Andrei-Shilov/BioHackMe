import { Phone, ArrowRight, BookOpen, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TRIAGE_CONFIG } from '../../services/openai';
import { ConfidenceIndicator } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import type { TriageResult } from '../../types';

interface TriageCardProps {
  triage:    TriageResult;
  className?: string;
}

export function TriageCard({ triage, className }: TriageCardProps) {
  const navigate = useNavigate();
  const cfg      = TRIAGE_CONFIG[triage.level];

  return (
    <div
      className={cn(
        'rounded-2xl border-2 p-4 animate-fade-up',
        cfg.bgColor,
        cfg.borderColor,
        className
      )}
      role="region"
      aria-label={`Результат оценки: ${cfg.label}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl" aria-hidden="true">{cfg.icon}</span>
        <div>
          <p className={cn('font-bold font-body text-base', cfg.color)}>{cfg.label}</p>
          <p className={cn('text-xs font-body', cfg.color, 'opacity-80')}>{cfg.urgency}</p>
        </div>
      </div>

      {/* Emergency banner for red */}
      {triage.level === 'red' && (
        <a
          href="tel:112"
          className="flex items-center gap-2 w-full mb-3 p-3 bg-red-600 text-white rounded-xl font-semibold font-body text-sm hover:bg-red-700 transition-colors"
          aria-label="Позвонить 112 — экстренная служба"
        >
          <Phone size={16} className="animate-heartbeat shrink-0" />
          Позвонить 112 — Экстренная служба
        </a>
      )}

      {/* Hypothesis */}
      <p className={cn('text-sm font-body mb-3', cfg.color)}>
        <span className="font-semibold">Гипотеза:</span> {triage.hypothesis}
      </p>

      {/* Confidence */}
      <ConfidenceIndicator value={triage.confidence} className="mb-2" />

      {/* Source */}
      <p className="text-xs text-text-muted font-body mb-3">
        Источник: {triage.source}
      </p>

      {/* Self-care guide (green only) */}
      {triage.level === 'green' && triage.selfCareGuide && (
        <div className="bg-white/70 rounded-xl p-3 mb-3">
          <p className="text-xs font-semibold text-emerald-700 font-body mb-1">Советы самопомощи:</p>
          <p className="text-sm text-text-primary font-body">{triage.selfCareGuide}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-3">
        {triage.transferToDoctor && (
          <Button
            variant="coral"
            size="sm"
            fullWidth
            onClick={() => navigate('/doctors')}
            leftIcon={<User size={14} />}
            rightIcon={<ArrowRight size={14} />}
          >
            Передать врачу
          </Button>
        )}
        {triage.suggestedProtocols.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => navigate('/protocols')}
            leftIcon={<BookOpen size={14} />}
          >
            Рекомендованные протоколы
          </Button>
        )}
      </div>
    </div>
  );
}
