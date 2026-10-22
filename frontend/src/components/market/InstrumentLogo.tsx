import React, { useState, useEffect } from 'react';
import {
  resolveInstrumentLogo,
  reportMissingLogo,
  type LogoResolutionResult
} from '../../utils/instrumentLogoResolver';

// Global in-memory set of failed logo URLs to avoid re-requesting dead endpoints
const globalFailedUrls = new Set<string>();

export function clearFailedLogoUrls(): void {
  globalFailedUrls.clear();
}

export interface InstrumentLogoProps {
  instrument: {
    symbol: string;
    name?: string;
    assetType?: string;
    fundHouse?: string;
    exchange?: string;
    country?: string;
    market?: string;
  };
  /**
   * Container size:
   * - 'sm': 24px (compact indicators)
   * - 'md': 28px (default table row, 28-32px specification)
   * - 'lg': 32px (modal header / hero view, 28-32px specification)
   */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const InstrumentLogo: React.FC<InstrumentLogoProps> = ({
  instrument,
  size = 'md',
  className = '',
}) => {
  const resolution: LogoResolutionResult = resolveInstrumentLogo(instrument);
  const logoUrl = resolution.logoUrl;

  // If already known to fail globally or no URL exists, start in error state
  const isInitiallyFailed = !logoUrl || globalFailedUrls.has(logoUrl);
  const [hasError, setHasError] = useState(isInitiallyFailed);
  const [isLoaded, setIsLoaded] = useState(false);

  // Synchronize error and loading state when instrument/logoUrl changes (e.g. modal reuse or list switching)
  useEffect(() => {
    const isFailed = !logoUrl || globalFailedUrls.has(logoUrl);
    setHasError(isFailed);
    setIsLoaded(false);
  }, [
    logoUrl,
    instrument.symbol,
    instrument.name,
    instrument.assetType,
    instrument.fundHouse,
    instrument.exchange
  ]);

  // Report missing logo when no URL is available
  useEffect(() => {
    if (!logoUrl) {
      reportMissingLogo(instrument.symbol, instrument.name, 'No verified logo URL found');
    }
  }, [logoUrl, instrument.symbol, instrument.name]);

  // Size specifications adhere to 28-32px requirement for table display
  const sizeClasses = {
    sm: 'w-6 h-6 min-w-6 min-h-6',
    md: 'w-7 h-7 min-w-7 min-h-7', // 28px
    lg: 'w-8 h-8 min-w-8 min-h-8', // 32px
  }[size];

  const handleImageError = () => {
    if (logoUrl) {
      globalFailedUrls.add(logoUrl);
    }
    reportMissingLogo(instrument.symbol, instrument.name, 'Image load failure from CDN');
    setHasError(true);
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  // Neutral missing-logo state: strictly NO initials, NO generic icons, NO placeholders
  if (hasError || !logoUrl) {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)]/50 dark:bg-slate-800/40 select-none shrink-0 ${sizeClasses} ${className}`}
        role="img"
        aria-label={`Logo unavailable for ${instrument.symbol}`}
        title={`No verified logo on file for ${instrument.symbol}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)]/30" />
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-white dark:bg-slate-900/90 shadow-2xs overflow-hidden shrink-0 select-none p-0.5 ${sizeClasses} ${className}`}
      title={resolution.brandName || instrument.name || instrument.symbol}
      aria-label={`${instrument.symbol} logo`}
    >
      {/* Neutral loading skeleton pulse while image is asynchronously decoding (NO initials) */}
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-[var(--color-surface-soft)]/60 animate-pulse rounded-md"
          aria-hidden="true"
        />
      )}

      <img
        src={logoUrl}
        alt={`${instrument.symbol} logo`}
        loading="lazy"
        decoding="async"
        onError={handleImageError}
        onLoad={handleImageLoad}
        className={`w-full h-full object-contain rounded-md transition-opacity duration-150 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
