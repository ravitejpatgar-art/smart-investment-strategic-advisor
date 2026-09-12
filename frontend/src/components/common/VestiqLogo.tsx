import React from 'react';

export interface VestiqMarkProps {
  size?: number;
  className?: string;
}

/**
 * Original Fintech/AI Logo Mark for VestIQ
 * Features an intelligent converging geometric 'V' with dual alpha facets,
 * institutional precision shielding, and a central quantum intelligence core.
 */
export const VestiqMark: React.FC<VestiqMarkProps> = ({ size = 20, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="VestIQ Logo Mark"
    >
      <defs>
        <linearGradient id="vestiqAlphaGrad" x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00E5BE" />
          <stop offset="50%" stopColor="#00D4AA" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="vestiqCoreGrad" x1="12" y1="2" x2="12" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#00D4AA" />
        </linearGradient>
      </defs>

      {/* Left Dynamic Alpha Facet */}
      <path
        d="M3 4.5H7.5L12 16.5L9.5 21L3 4.5Z"
        fill="url(#vestiqAlphaGrad)"
      />

      {/* Right Institutional Shielding Wing */}
      <path
        d="M21 4.5H16.5L12 16.5L14.5 21L21 4.5Z"
        fill="#0F172A"
      />

      {/* Central Neural Quantum Core / Intelligence Spark */}
      <path
        d="M12 2.5L14.5 7L12 11.5L9.5 7L12 2.5Z"
        fill="url(#vestiqCoreGrad)"
      />

      {/* Subtle Precision Interlock Nodes */}
      <circle cx="12" cy="7" r="1" fill="#FFFFFF" />
      <circle cx="12" cy="18.5" r="0.8" fill="#00D4AA" />
    </svg>
  );
};

export interface VestiqLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  subtitleText?: string;
  onClick?: () => void;
  className?: string;
}

export const VestiqLogo: React.FC<VestiqLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  subtitleText = 'AI STRATEGIC ADVISOR',
  onClick,
  className = '',
}) => {
  const iconDimensions = {
    sm: { box: 'w-7 h-7', svg: 18, radius: 'rounded-lg', text: 'text-[15px]', sub: 'text-[8px]' },
    md: { box: 'w-9 h-9', svg: 22, radius: 'rounded-xl', text: 'text-[18px]', sub: 'text-[9px]' },
    lg: { box: 'w-11 h-11', svg: 26, radius: 'rounded-xl', text: 'text-[22px]', sub: 'text-[10px]' },
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* VestIQ Icon Container */}
      <div
        className={`${iconDimensions.box} ${iconDimensions.radius} flex items-center justify-center shrink-0 border border-teal-200 bg-teal-50 shadow-2xs`}
      >
        <VestiqMark size={iconDimensions.svg} />
      </div>

      {/* VestIQ Wordmark */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1">
          <span
            className={`${iconDimensions.text} font-black tracking-[-0.03em] text-[#0F172A]`}
            style={{ fontFamily: "'Inter Tight', 'Inter', sans-serif" }}
          >
            Vest<span className="text-[#00A884]">IQ</span>
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`${iconDimensions.sub} font-bold tracking-[0.20em] text-[#64748B] uppercase mt-1`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );
};
