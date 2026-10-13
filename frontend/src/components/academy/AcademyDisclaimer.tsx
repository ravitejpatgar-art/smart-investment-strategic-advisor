import React from 'react';
import { AlertCircle } from 'lucide-react';

export const AcademyDisclaimer: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`flex items-start gap-2.5 p-3.5 rounded-xl bg-[var(--color-surface-soft)]/60 border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] ${className}`}
      role="note"
      aria-label="Educational content disclaimer"
    >
      <AlertCircle className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
      <div className="leading-relaxed">
        <span className="font-semibold text-[var(--color-text-primary)]">Educational content only.</span> This lesson is for foundational learning and is not investment advice or a financial recommendation. Investments involve market risk and may lose value.
      </div>
    </div>
  );
};
