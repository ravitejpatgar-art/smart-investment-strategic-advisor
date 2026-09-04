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
  const baseClasses = 'inline-flex items-center select-none font-bold tracking-wider uppercase rounded-md transition-colors duration-150 ease-out';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-[11px] gap-1.5',
  }[size];

  const variantClasses: Record<BadgeVariant, { bg: string; dot: string }> = {
    success: { bg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', dot: 'bg-emerald-400' },
    warning: { bg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20', dot: 'bg-amber-400' },
    danger: { bg: 'bg-red-500/10 text-red-400 border border-red-500/20', dot: 'bg-red-400' },
    info: { bg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', dot: 'bg-blue-400' },
    neutral: { bg: 'bg-white/6 text-[#A0AEC0] border border-white/8', dot: 'bg-[#A0AEC0]' },
    teal: { bg: 'bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/20', dot: 'bg-[#00D4AA]' },
    blue: { bg: 'bg-[#1E88E5]/10 text-[#1E88E5] border border-[#1E88E5]/20', dot: 'bg-[#1E88E5]' },
    live: { bg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25', dot: 'bg-emerald-400 animate-pulse' },
    delayed: { bg: 'bg-amber-500/10 text-amber-400 border border-amber-500/25', dot: 'bg-amber-400' },
    stale: { bg: 'bg-slate-500/10 text-slate-400 border border-slate-500/25', dot: 'bg-slate-400' },
    fallback: { bg: 'bg-blue-500/10 text-blue-400 border border-blue-500/25', dot: 'bg-blue-400' },
    demo: { bg: 'bg-purple-500/10 text-purple-400 border border-purple-500/25', dot: 'bg-purple-400' },
    unavailable: { bg: 'bg-red-500/10 text-red-400 border border-red-500/25', dot: 'bg-red-400' },
  };

  const currentVariant = variantClasses[variant];

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
