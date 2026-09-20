import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'accent';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  variant = 'default',
  padding = 'md',
  className = '',
  children,
  ...props
}, ref) => {
  const baseClasses = 'bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-[var(--shadow-card)] transition-all duration-200 ease-out text-[var(--color-text-primary)]';
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }[padding];
  const variantClasses = {
    default: 'hover:border-[var(--color-border-hover)] hover:shadow-[var(--shadow-card-hover)]',
    elevated: 'bg-[var(--color-card-elevated)] border-[var(--color-border)] shadow-[var(--shadow-card)] hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-card-hover)]',
    interactive: 'hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 cursor-pointer active:scale-[0.99]',
    accent: 'border-[var(--color-accent)]/40 shadow-[0_4px_20px_var(--color-accent-soft)] hover:shadow-[var(--shadow-card-hover)]',
  }[variant];

  return (
    <div
      ref={ref}
      className={cn(baseClasses, paddingClasses, variantClasses, className)}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';