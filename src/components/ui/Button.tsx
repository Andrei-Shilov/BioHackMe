import React from 'react';
import { cn } from '../../utils/cn';

type Variant = 'primary' | 'secondary' | 'coral' | 'ghost' | 'outline' | 'danger';
type Size    = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant;
  size?:      Size;
  loading?:   boolean;
  leftIcon?:  React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:   'bg-soft-blue text-white hover:bg-soft-blue-600 shadow-sm hover:shadow-glow-blue',
  secondary: 'bg-calm-blue text-white hover:bg-calm-blue-700',
  coral:     'bg-warm-coral text-white hover:bg-coral-600 shadow-sm hover:shadow-glow-coral',
  ghost:     'bg-transparent text-calm-blue hover:bg-calm-blue-50',
  outline:   'border-2 border-soft-blue text-soft-blue bg-transparent hover:bg-soft-blue-50',
  danger:    'bg-red-health text-white hover:bg-red-700',
};

const sizeStyles: Record<Size, string> = {
  xs: 'px-3 py-1.5 text-xs rounded-lg',
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-5 py-2.5 text-base rounded-xl',
  lg: 'px-6 py-3 text-base rounded-2xl',
  xl: 'px-8 py-4 text-lg rounded-2xl',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant   = 'primary',
      size      = 'md',
      loading   = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'font-body font-600 font-semibold',
          'transition-all duration-300 ease-smooth',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soft-blue focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'select-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <HeartbeatLoader />
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// ─── Heartbeat Loader (instead of a spinner) ──────────────────────
function HeartbeatLoader() {
  return (
    <span className="flex items-center gap-0.5" aria-label="Загрузка…">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="w-1 bg-current rounded-full"
          style={{
            height: `${[6, 12, 18, 12, 6][i]}px`,
            animationName: 'pulseSoft',
            animationDuration: '1s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </span>
  );
}
