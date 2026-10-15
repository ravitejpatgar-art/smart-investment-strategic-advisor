import React from 'react';
import { AlertCircle } from 'lucide-react';

export const AcademyDisclaimer: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`flex items-start gap-2.5 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#64748B] ${className}`}
      role="note"
      aria-label="Educational content disclaimer"
    >
      <AlertCircle className="w-4 h-4 text-[#0EA5E9] shrink-0 mt-0.5" />
      <div className="leading-relaxed">
        <span className="font-semibold text-[#334155]">Educational content only.</span> This lesson is for foundational learning and is not investment advice or a financial recommendation. Investments involve market risk and may lose value.
      </div>
    </div>
  );
};
