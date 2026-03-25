import React from 'react';
import { cn } from '../../utils/cn';

interface PageLayoutProps {
  children:    React.ReactNode;
  className?:  string;
  maxWidth?:   'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  noPadding?:  boolean;
}

const maxWidthStyles = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-xl',
  '2xl':'max-w-2xl',
  '7xl':'max-w-7xl',
  full: 'max-w-full',
};

export function PageLayout({
  children,
  className,
  maxWidth   = '7xl',
  noPadding  = false,
}: PageLayoutProps) {
  return (
    <main
      className={cn(
        'flex-1 w-full mx-auto',
        maxWidthStyles[maxWidth],
        !noPadding && 'px-4 sm:px-6 lg:px-8 py-6 sm:py-8',
        className
      )}
    >
      {children}
    </main>
  );
}

// ─── Page Header ──────────────────────────────────────────────────
interface PageHeaderProps {
  title:       string;
  subtitle?:   string;
  action?:     React.ReactNode;
  className?:  string;
}

export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-6 gap-4', className)}>
      <div className="animate-fade-up">
        <h1 className="font-display text-3xl sm:text-4xl text-calm-blue">{title}</h1>
        {subtitle && <p className="text-text-muted font-body mt-2 text-base">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 animate-fade-up" style={{ animationDelay: '0.1s' }}>{action}</div>}
    </div>
  );
}
