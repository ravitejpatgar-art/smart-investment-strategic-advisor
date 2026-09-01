import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  subtitleText?: string;
  onClick?: () => void;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  subtitleText = 'WEALTH MANAGEMENT',
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
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Institutional Geometric SV Monogram */}
      <div
        className={`${iconDimensions.box} ${iconDimensions.radius} flex items-center justify-center shrink-0 border border-white/10`}
        style={{
          background: '#0A1022',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
        }}
      >
        <svg
          width={iconDimensions.svg}
          height={iconDimensions.svg}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top Geometric Pillar: Alpha & Strategic Growth */}
          <path
            d="M3 4.5H13.5L19.5 10.5V13.5H15.5L10.5 8.5H3V4.5Z"
            fill="#00D4AA"
          />
          {/* Bottom Geometric Pillar: Capital Preservation & Value */}
          <path
            d="M21 19.5H10.5L4.5 13.5V10.5H8.5L13.5 15.5H21V19.5Z"
            fill="#FFFFFF"
          />
          {/* Central Strategic Interlock */}
          <path
            d="M10.5 10.5H13.5V13.5H10.5V10.5Z"
            fill="#1E88E5"
          />
        </svg>
      </div>

      {/* Corporate Wordmark */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span
            className={`${iconDimensions.text} font-black tracking-[-0.03em] text-white`}
            style={{ fontFamily: "'Inter Tight', 'Inter', sans-serif" }}
          >
            SMARTVEST
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`${iconDimensions.sub} font-semibold tracking-[0.24em] text-[#A0AEC0] uppercase mt-1`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );
};
