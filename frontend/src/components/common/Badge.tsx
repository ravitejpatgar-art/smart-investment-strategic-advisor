import React from 'react';
import { cn } from '../../utils/cn';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'teal'
  | 'blue'
  | 'live'
  | 'delayed'
  | 'stale'
  | 'fallback'
  | 'demo'
  | 'unavailable';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  showDot = false,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center select-none font-bold tracking-wider uppercase rounded-full transition-colors duration-150 ease-out';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-0.5 text-[11px] gap-1.5',
  }[size];

  const variantClasses: Record<BadgeVariant, { bg: string; dot: string }> = {
    success: { bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500' },
    warning: { bg: 'bg-amber-50 text-amber-800 border border-amber-200', dot: 'bg-amber-500' },
    danger: { bg: 'bg-red-50 text-red-700 border border-red-200', dot: 'bg-red-500' },
    info: { bg: 'bg-blue-50 text-blue-700 border border-blue-200', dot: 'bg-blue-500' },
    neutral: { bg: 'bg-slate-100 text-slate-700 border border-slate-200', dot: 'bg-slate-500' },
    teal: { bg: 'bg-teal-50 text-teal-800 border border-teal-200', dot: 'bg-teal-600' },
    blue: { bg: 'bg-blue-50 text-blue-700 border border-blue-200', dot: 'bg-blue-600' },
    live: { bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500 animate-pulse' },
    delayed: { bg: 'bg-amber-50 text-amber-800 border border-amber-200', dot: 'bg-amber-500' },
    stale: { bg: 'bg-slate-100 text-slate-600 border border-slate-200', dot: 'bg-slate-400' },
    fallback: { bg: 'bg-blue-50 text-blue-700 border border-blue-200', dot: 'bg-blue-500' },
    demo: { bg: 'bg-purple-50 text-purple-700 border border-purple-200', dot: 'bg-purple-500' },
    unavailable: { bg: 'bg-red-50 text-red-700 border border-red-200', dot: 'bg-red-500' },
  };

  const currentVariant = variantClasses[variant] || variantClasses.neutral;

  return (
    <span
      className={cn(baseClasses, sizeClasses, currentVariant.bg, className)}
      {...props}
    >
      {showDot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', currentVariant.dot)}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
};
