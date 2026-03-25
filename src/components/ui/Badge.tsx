import React from 'react';
import { cn } from '../../utils/cn';

type BadgeVariant =
  | 'default'
  | 'soft-blue'
  | 'coral'
  | 'green'
  | 'yellow'
  | 'red'
  | 'calm-blue'
  | 'pro-bono'
  | 'verified'
  | 'ethics';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?:    'sm' | 'md';
  dot?:     boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  'default':   'bg-gray-100 text-gray-700',
  'soft-blue': 'bg-soft-blue-50 text-soft-blue border border-soft-blue-100',
  'coral':     'bg-coral-50 text-coral-600 border border-coral-100',
  'green':     'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'yellow':    'bg-amber-50 text-amber-700 border border-amber-200',
  'red':       'bg-red-50 text-red-700 border border-red-200',
  'calm-blue': 'bg-calm-blue-50 text-calm-blue border border-calm-blue-100',
  'pro-bono':  'bg-purple-50 text-purple-700 border border-purple-200',
  'verified':  'bg-emerald-50 text-emerald-700 border border-emerald-300',
  'ethics':    'bg-indigo-50 text-indigo-700 border border-indigo-200',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function Badge({
  variant = 'default',
  size    = 'sm',
  dot     = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium font-body',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', {
            'bg-soft-blue':    variant === 'soft-blue',
            'bg-warm-coral':   variant === 'coral',
            'bg-emerald-500':  variant === 'green' || variant === 'verified',
            'bg-amber-500':    variant === 'yellow',
            'bg-red-500':      variant === 'red',
            'bg-calm-blue':    variant === 'calm-blue',
            'bg-purple-500':   variant === 'pro-bono',
            'bg-indigo-500':   variant === 'ethics',
          })}
        />
      )}
      {children}
    </span>
  );
}

// ─── Subscription Tier Badge ──────────────────────────────────────
import type { SubscriptionTier } from '../../types';

const tierConfig: Record<SubscriptionTier, { label: string; variant: BadgeVariant }> = {
  essential:  { label: 'Essential',  variant: 'default'   },
  plus:       { label: 'Plus',       variant: 'soft-blue' },
  premium:    { label: 'Premium',    variant: 'calm-blue' },
  pro_bono:   { label: 'Pro Bono',   variant: 'pro-bono'  },
  corporate:  { label: 'Corporate',  variant: 'ethics'    },
};

export function SubscriptionBadge({ tier }: { tier: SubscriptionTier }) {
  const config = tierConfig[tier];
  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}

// ─── Ethics Badge ─────────────────────────────────────────────────
export function EthicsBadge({ label }: { label: string }) {
  return (
    <Badge variant="ethics" size="sm">
      ✓ {label}
    </Badge>
  );
}

// ─── Verification Badge ───────────────────────────────────────────
export function VerificationBadge() {
  return (
    <Badge variant="verified" size="sm">
      ✓ Проверен этическим комитетом
    </Badge>
  );
}
