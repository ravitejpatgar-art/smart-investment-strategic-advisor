import React from 'react';
import { useFintechStore } from '../../store/useFintechStore';

export interface BrandLogoProps {
  /**
   * Logo display size
   * sm: 28px height, md: 36px height (default), lg: 44px height, xl: 56px height
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Layout presentation:
   * - 'horizontal': SV Monogram + 'SmartVest' Wordmark + 'INVEST SMARTER. LIVE BRIGHTER.' (standard for headers/nav)
   * - 'stacked': Centered vertical lockup with monogram, wordmark, tagline, and bottom accent
   * - 'icon': Monogram alone (for compact mobile, collapsed sidebars, icons)
   * - 'responsive': Monogram alone on mobile (< sm), full horizontal lockup on tablet/desktop (>= sm)
   */
  variant?: 'horizontal' | 'stacked' | 'icon' | 'responsive';
  /**
   * Optional contextual badge/indicator (e.g. 'CLIENT PORTAL', 'QUANTITATIVE ADVISORY ENGINE')
   */
  showSubtitle?: boolean;
  subtitleText?: string;
  onClick?: () => void;
  className?: string;
  /**
   * Explicit theme override if rendering inside fixed-theme containers
   */
  forceTheme?: 'dark' | 'light';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'horizontal',
  showSubtitle = false,
  subtitleText,
  onClick,
  className = '',
  forceTheme,
}) => {
  const storeTheme = useFintechStore((state) => state.theme);
  const activeTheme = forceTheme || storeTheme || 'dark';
  const isDark = activeTheme === 'dark';

  // Height definitions for visual balance and zero layout shift
  const isStacked = variant === 'stacked';
  const sizeClasses = {
    sm: {
      container: isStacked ? 'h-12' : 'h-7',
      img: isStacked ? 'h-12 w-auto max-h-12' : 'h-7 w-auto max-h-7',
      badge: 'text-[8.5px] px-1.5 py-0.5',
    },
    md: {
      container: isStacked ? 'h-16' : 'h-9',
      img: isStacked ? 'h-16 w-auto max-h-16' : 'h-9 w-auto max-h-9',
      badge: 'text-[9.5px] px-2 py-0.5',
    },
    lg: {
      container: isStacked ? 'h-20' : 'h-11',
      img: isStacked ? 'h-20 w-auto max-h-20' : 'h-11 w-auto max-h-11',
      badge: 'text-[10.5px] px-2.5 py-1',
    },
    xl: {
      container: isStacked ? 'h-24 sm:h-28' : 'h-14 sm:h-16',
      img: isStacked ? 'h-24 sm:h-28 w-auto max-h-28' : 'h-14 sm:h-16 w-auto max-h-16',
      badge: 'text-xs px-3 py-1',
    },
  }[size];

  // Resolve assets
  const monoSrc = isDark ? '/smartvest-monogram.png' : '/smartvest-monogram-light.png';
  const horizSrc = isDark ? '/smartvest-logo-horizontal.png' : '/smartvest-logo-horizontal-light.png';
  const stackedSrc = isDark ? '/smartvest-logo-stacked.png' : '/smartvest-logo-stacked-light.png';

  // Show contextual badge only if explicitly requested or custom non-default subtitle provided
  const hasCustomSubtitle =
    showSubtitle &&
    subtitleText &&
    subtitleText !== 'WEALTH MANAGEMENT' &&
    subtitleText !== 'INVEST SMARTER. LIVE BRIGHTER.' &&
    subtitleText !== 'SMARTVEST';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${
        onClick ? 'cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded-lg' : ''
      } ${className}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      aria-label="SmartVest Home"
    >
      <div className={`relative flex items-center justify-center shrink-0 ${sizeClasses.container} transition-all duration-150 group-hover:opacity-95 group-hover:scale-[1.01] group-active:scale-[0.99]`}>
        {variant === 'responsive' ? (
          <>
            {/* Mobile: SV Monogram alone */}
            <img
              key={`resp-m-${isDark ? 'dark' : 'light'}`}
              src={monoSrc}
              alt="SmartVest"
              className={`${sizeClasses.img} object-contain sm:hidden`}
              loading="eager"
              decoding="async"
            />
            {/* Desktop: Full horizontal lockup */}
            <img
              key={`resp-d-${isDark ? 'dark' : 'light'}`}
              src={horizSrc}
              alt="SmartVest"
              className={`${sizeClasses.img} object-contain hidden sm:block`}
              loading="eager"
              decoding="async"
            />
          </>
        ) : (
          <img
            key={`${variant}-${isDark ? 'dark' : 'light'}`}
            src={
              variant === 'icon'
                ? monoSrc
                : variant === 'stacked'
                ? stackedSrc
                : horizSrc
            }
            alt="SmartVest"
            className={`${sizeClasses.img} object-contain transition-opacity duration-200`}
            loading="eager"
            decoding="async"
          />
        )}
      </div>

      {/* Optional Contextual Subtitle / Badge */}
      {hasCustomSubtitle && (
        <span
          className={`hidden sm:inline-flex items-center font-mono font-bold uppercase tracking-wider rounded-md border border-[var(--color-border)] bg-[var(--color-surface-3)] text-[var(--color-text-muted)] ${sizeClasses.badge}`}
        >
          {subtitleText}
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
