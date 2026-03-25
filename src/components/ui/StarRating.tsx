import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StarRatingProps {
  value:      number;  // 0–5
  max?:       number;
  count?:     number;
  size?:      'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?:  (value: number) => void;
  className?: string;
}

const sizeMap = { sm: 12, md: 16, lg: 20 };

export function StarRating({
  value,
  max         = 5,
  count,
  size        = 'md',
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const starSize = sizeMap[size];
  const display  = hovered ?? value;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < display;
          return (
            <button
              key={i}
              type={interactive ? 'button' : undefined}
              disabled={!interactive}
              onClick={interactive && onChange ? () => onChange(i + 1) : undefined}
              onMouseEnter={interactive ? () => setHovered(i + 1) : undefined}
              onMouseLeave={interactive ? () => setHovered(null) : undefined}
              className={cn(
                'p-0.5 rounded transition-colors',
                interactive && 'hover:scale-110 cursor-pointer',
                !interactive && 'cursor-default pointer-events-none'
              )}
              aria-label={`${i + 1} звезда`}
            >
              <Star
                size={starSize}
                className={cn(
                  'transition-colors',
                  filled ? 'fill-amber-400 text-amber-400' : 'fill-none text-gray-300'
                )}
              />
            </button>
          );
        })}
      </div>
      {count !== undefined && (
        <span className="text-sm text-text-muted font-body ml-1">
          ({count.toLocaleString('ru')})
        </span>
      )}
    </div>
  );
}
