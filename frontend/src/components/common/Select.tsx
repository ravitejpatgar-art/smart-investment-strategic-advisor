import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  options,
  children,
  className = '',
  id,
  disabled,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider select-none"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center w-full">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={cn(
            'w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-xl text-[var(--color-input-text)] font-sans text-sm transition-all duration-200 outline-none appearance-none cursor-pointer',
            'focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/15' : '',
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className="bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <div className="absolute right-3.5 text-[var(--color-text-muted)] pointer-events-none flex items-center">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error ? (
        <span className="text-xs text-red-500 font-medium">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-[var(--color-text-muted)]">{helperText}</span>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';