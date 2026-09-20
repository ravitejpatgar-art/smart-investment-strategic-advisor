import React from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { BrandLogo } from './BrandLogo';

export interface VestiqMarkProps {
  size?: number;
  className?: string;
}

/**
 * Official SV Monogram for VestIQ and Assistant contexts.
 * Uses official theme-aware SmartVest monogram assets.
 */
export const VestiqMark: React.FC<VestiqMarkProps> = ({ size = 20, className = '' }) => {
  const storeTheme = useFintechStore((state) => state.theme);
  const isDark = storeTheme !== 'light';
  const monoSrc = isDark ? '/smartvest-monogram.png' : '/smartvest-monogram-light.png';

  return (
    <img
      src={monoSrc}
      alt="SmartVest SV"
      width={size}
      height={size}
      className={`object-contain shrink-0 ${className}`}
      loading="eager"
      decoding="async"
    />
  );
};

export interface VestiqLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  subtitleText?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * Official SmartVest Brand Logo for VestIQ headers and views.
 * Uses approved BrandLogo system:
 * - Desktop/tablet: Full horizontal lockup (SV Monogram + SmartVest wordmark)
 * - Mobile: Compact SV Monogram
 */
export const VestiqLogo: React.FC<VestiqLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  subtitleText = 'PORTFOLIO ADVISORY',
  onClick,
  className = '',
}) => {
  return (
    <BrandLogo
      size={size}
      variant="responsive"
      showSubtitle={showSubtitle}
      subtitleText={subtitleText}
      onClick={onClick}
      className={className}
    />
  );
};
