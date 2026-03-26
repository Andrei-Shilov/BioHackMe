import { AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface AIDisclaimerProps {
  compact?: boolean;
  className?: string;
}

export function AIDisclaimer({ compact = false, className }: AIDisclaimerProps) {
  if (compact) {
    return (
      <div className={cn('flex items-center gap-1.5 text-xs text-amber-700 font-body', className)}>
        <AlertTriangle size={12} className="shrink-0" />
        Гипотеза, не диагноз. AI помогает — врач решает.
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-xl',
        'bg-amber-50 border border-amber-200',
        className
      )}
      role="note"
      aria-label="Важное предупреждение об AI-ассистенте"
    >
      <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
      <p className="text-sm text-amber-800 font-body leading-snug">
        <strong>Это гипотеза, а не диагноз.</strong>{' '}
        AI помогает разобраться в симптомах — окончательное решение принимает врач.
        При угрозе жизни немедленно звоните <strong>112</strong>.
      </p>
    </div>
  );
}
