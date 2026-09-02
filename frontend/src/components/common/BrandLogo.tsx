import React from 'react';
import { TrendingUp } from 'lucide-react';

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
  subtitleText = 'STRATEGIC ADVISOR',
  onClick,
  className = '',
}) => {
  const iconDimensions = {
    sm: { box: 'w-7 h-7', iconSize: 'w-4 h-4', radius: 'rounded-lg', text: 'text-[15px]', sub: 'text-[8.5px]' },
    md: { box: 'w-9 h-9', iconSize: 'w-5 h-5', radius: 'rounded-xl', text: 'text-[17px]', sub: 'text-[9.5px]' },
    lg: { box: 'w-11 h-11', iconSize: 'w-6 h-6', radius: 'rounded-xl', text: 'text-[21px]', sub: 'text-[10.5px]' },
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Mint Icon Box */}
      <div
        className={`${iconDimensions.box} ${iconDimensions.radius} flex items-center justify-center shrink-0 bg-[#E6FDF7] dark:bg-[#00D4AA]/15 border border-[#99F6E4] dark:border-[#00D4AA]/30 shadow-xs`}
      >
        <TrendingUp className={`${iconDimensions.iconSize} text-[#00D4AA] dark:text-[#00D4AA] stroke-[2.5]`} />
      </div>

      {/* Wordmark */}
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span
            className={`${iconDimensions.text} font-black tracking-tight text-slate-900 dark:text-white`}
            style={{ fontFamily: "'Inter Tight', 'Inter', sans-serif" }}
          >
            SmartVest
          </span>
          <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-[#E6FDF7] dark:bg-[#00D4AA]/20 text-[#0F766E] dark:text-[#00D4AA] border border-[#99F6E4] dark:border-[#00D4AA]/30 uppercase">
            AI
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`${iconDimensions.sub} font-bold tracking-[0.14em] text-slate-400 dark:text-slate-400 uppercase mt-0.5`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );
};
