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
  const baseClasses = 'bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-150 ease-out text-[#0F172A]';
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }[padding];
  const variantClasses = {
    default: '',
    elevated: 'bg-white border-[#E2E8F0] shadow-[0_4px_20px_rgba(0,0,0,0.06)]',
    interactive: 'hover:border-[#CBD5E1] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:-translate-y-px cursor-pointer active:scale-[0.99]',
    accent: 'border-[#00D4AA]/40 shadow-[0_4px_20px_rgba(0,212,170,0.12)]',
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