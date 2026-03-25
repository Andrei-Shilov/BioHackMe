import { cn } from '../../utils/cn';

interface ProgressBarProps {
  value:       number;    // 0–100
  max?:        number;
  label?:      string;
  showValue?:  boolean;
  size?:       'sm' | 'md' | 'lg';
  color?:      'blue' | 'coral' | 'green' | 'yellow' | 'red';
  animated?:   boolean;
  className?:  string;
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const colorStyles = {
  blue:   'bg-soft-blue',
  coral:  'bg-warm-coral',
  green:  'bg-green-health',
  yellow: 'bg-yellow-health',
  red:    'bg-red-health',
};

export function ProgressBar({
  value,
  max        = 100,
  label,
  showValue  = false,
  size       = 'md',
  color      = 'blue',
  animated   = false,
  className,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label    && <span className="text-sm font-medium text-text-muted">{label}</span>}
          {showValue && <span className="text-sm font-semibold text-calm-blue">{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        className={cn('w-full bg-calm-blue-50 rounded-full overflow-hidden', sizeStyles[size])}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            colorStyles[color],
            animated && 'animate-pulse-soft'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Confidence Indicator (for AI responses) ──────────────────────
interface ConfidenceIndicatorProps {
  value:     number; // 0–100
  className?: string;
}

export function ConfidenceIndicator({ value, className }: ConfidenceIndicatorProps) {
  const color = value >= 75 ? 'green' : value >= 50 ? 'yellow' : 'red';
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-xs text-text-muted whitespace-nowrap font-body">Уверенность AI:</span>
      <ProgressBar value={value} size="sm" color={color} className="flex-1" />
      <span className="text-xs font-semibold text-calm-blue font-body w-8 text-right">{value}%</span>
    </div>
  );
}
