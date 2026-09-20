import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  disabled,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider select-none"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3.5 text-[var(--color-text-muted)] pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={cn(
            'w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-xl text-[var(--color-input-text)] font-sans text-sm transition-all duration-200 outline-none placeholder:text-[var(--color-input-placeholder)]',
            'focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            leftIcon ? 'pl-10' : '',
            rightIcon ? 'pr-10' : '',
            error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/15' : '',
            className
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3.5 text-[var(--color-text-muted)] flex items-center">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <span className="text-xs text-red-500 font-medium">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-[var(--color-text-muted)]">{helperText}</span>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';