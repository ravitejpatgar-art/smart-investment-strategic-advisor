import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  children,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-sans select-none transition-all duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] hover:-translate-y-px active:translate-y-0 active:scale-[0.99] motion-reduce:transform-none motion-reduce:transition-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:active:scale-100 disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:hover:brightness-100';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm font-semibold rounded-xl gap-2',
    lg: 'px-6 py-3 text-base font-bold rounded-xl gap-2.5',
  }[size];

  const variantClasses = {
    primary: 'bg-[var(--color-accent)] text-[var(--color-accent-text)] font-bold shadow-xs hover:brightness-105 active:scale-[0.99] border-none cursor-pointer',
    secondary: 'bg-[var(--btn-secondary-bg)] text-[var(--color-text-primary)] border border-[var(--btn-secondary-border)] hover:bg-[var(--btn-secondary-hover-bg)] hover:border-[var(--color-border-strong)] cursor-pointer',
    ghost: 'bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] border border-transparent hover:border-[var(--color-border-subtle)] cursor-pointer',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 hover:brightness-105 cursor-pointer',
    icon: 'p-2 bg-[var(--btn-secondary-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--btn-secondary-hover-bg)] border border-[var(--btn-secondary-border)] rounded-xl cursor-pointer',
  }[variant];

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(baseClasses, sizeClasses, variantClasses, className)}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-0.5 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
});

Button.displayName = 'Button';