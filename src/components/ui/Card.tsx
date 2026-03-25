import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  breathe?:  boolean;
  glass?:    boolean;
  padding?:  'none' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
}

const paddingStyles = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
};

export function Card({
  breathe   = false,
  glass     = false,
  padding   = 'md',
  bordered  = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white shadow-card',
        paddingStyles[padding],
        breathe && 'card-breathe cursor-default',
        glass && 'glass-card',
        bordered && 'border border-calm-blue-100',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?:    string;
  subtitle?: string;
  action?:   React.ReactNode;
}

export function CardHeader({ title, subtitle, action, className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-4', className)} {...props}>
      <div>
        {title    && <h3 className="font-display text-lg text-calm-blue">{title}</h3>}
        {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
        {children}
      </div>
      {action && <div className="shrink-0 ml-4">{action}</div>}
    </div>
  );
}
