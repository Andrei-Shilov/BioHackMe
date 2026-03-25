import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:     string;
  error?:     string;
  hint?:      string;
  leftIcon?:  React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-text-primary font-body"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5 text-text-muted pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-xl border border-calm-blue-100 bg-white',
              'px-4 py-3 text-base text-text-primary font-body',
              'placeholder:text-text-muted',
              'transition-all duration-200',
              'focus:outline-none focus:border-soft-blue focus:ring-2 focus:ring-soft-blue/20',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-light',
              error && 'border-red-health focus:border-red-health focus:ring-red-health/20',
              leftIcon  && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3.5 text-text-muted">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-health font-body" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-sm text-text-muted font-body">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ─── Textarea ──────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?:  string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-text-primary font-body">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-xl border border-calm-blue-100 bg-white',
            'px-4 py-3 text-base text-text-primary font-body',
            'placeholder:text-text-muted resize-vertical min-h-[100px]',
            'transition-all duration-200',
            'focus:outline-none focus:border-soft-blue focus:ring-2 focus:ring-soft-blue/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-red-health',
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error && <p className="text-sm text-red-health font-body">{error}</p>}
        {hint && !error && <p className="text-sm text-text-muted font-body">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
