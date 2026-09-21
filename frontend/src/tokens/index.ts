/**
 * =========================================================================
 * SMARTVEST DESIGN SYSTEM FOUNDATIONS - DESIGN TOKENS
 * Institutional Multi-Theme Architecture (Dark + White Standards)
 * =========================================================================
 */

export const spacingTokens = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  base: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;

export const typographyTokens = {
  fontFamily: {
    sans: '"Manrope", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    heading: '"Manrope", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  roles: {
    DISPLAY: 'font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)] leading-[1.12]',
    H1: 'font-sans text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-primary)] leading-tight',
    H2: 'font-sans text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)] leading-snug',
    H3: 'font-sans text-lg sm:text-xl font-semibold tracking-tight text-[var(--color-text-primary)] leading-snug',
    H4: 'font-sans text-base font-semibold text-[var(--color-text-primary)] leading-normal',
    BODY: 'font-sans text-sm sm:text-base font-normal text-[var(--color-text-secondary)] leading-relaxed',
    BODY_SMALL: 'font-sans text-xs sm:text-sm font-normal text-[var(--color-text-muted)] leading-normal',
    CAPTION: 'font-sans text-xs font-medium text-[var(--color-text-muted)] leading-tight',
    LABEL: 'font-sans text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] leading-tight',
    MONO_NUMBER: 'font-mono text-sm sm:text-base tabular-nums font-semibold tracking-tight text-[var(--color-text-primary)]',
  },
} as const;

export const darkThemeTokens = {
  BACKGROUND: '#101217',
  BACKGROUND_DEEP: '#12151B',
  SURFACE: '#181C23',
  SURFACE_ELEVATED: '#222831',
  SURFACE_SOFT: '#181C23',
  SURFACE_3: '#252C35',
  CARD: '#1C2129',
  CARD_ELEVATED: '#222831',
  HOVER: 'rgba(193, 232, 255, 0.06)',
  BORDER: '#303844',
  BORDER_SUBTLE: 'rgba(193, 232, 255, 0.08)',
  BORDER_STRONG: '#3E4856',
  BORDER_ACCENT: 'rgba(193, 232, 255, 0.28)',
  TEXT_PRIMARY: '#EAF6FF',
  TEXT_SECONDARY: '#B8C7D3',
  TEXT_MUTED: '#71808D',
  ACCENT_ICE: '#C1E8FF',
  ACCENT_ORANGE: '#C1E8FF', // Updated to Ice Blue / Pale Cyan
  ACCENT_DARK: '#222831',
  ACCENT_TEAL: '#C1E8FF', // Primary active accent
  PRIMARY_DARK_ACCENT: '#C1E8FF',
  ACCENT_SOFT: 'rgba(193, 232, 255, 0.12)',
  ACCENT_TEXT: '#0A1017',
  ACCENT_BLUE: '#C1E8FF',
  SUCCESS: '#00C853',
  WARNING: '#F59E0B',
  DANGER: '#FF5252',
  INFO: '#C1E8FF',
} as const;

export const lightThemeTokens = {
  BACKGROUND: '#F7FAFD',
  SURFACE: '#FFFFFF',
  SURFACE_ELEVATED: '#FFFFFF',
  SURFACE_SOFT: '#E4EDF7',
  SURFACE_3: '#E4EDF7',
  CARD: '#FFFFFF',
  CARD_ELEVATED: '#FFFFFF',
  HOVER: 'rgba(22, 58, 93, 0.04)',
  BORDER: '#C3D7EC',
  BORDER_SUBTLE: '#E4EDF7',
  BORDER_STRONG: '#9CBEDF',
  BORDER_ACCENT: 'rgba(56, 141, 235, 0.40)',
  TEXT_PRIMARY: '#163A5D',
  TEXT_SECONDARY: '#4B6680',
  TEXT_MUTED: '#7A8FA3',
  ACCENT_BLUE: '#388DEB',
  ACCENT_STRONG: '#1B86DC',
  ACCENT_DEEP: '#0D6AC4',
  ACCENT_SKY: '#5EB1EB',
  ACCENT_TEAL: '#388DEB', // Primary active accent
  SUCCESS: '#16A34A',
  WARNING: '#D97706',
  DANGER: '#DC2626',
  INFO: '#388DEB',
} as const;

// Backward-compatible alias (defaults to institutional dark tokens)
export const colorTokens = darkThemeTokens;

export const marketFreshnessTokens = {
  LIVE: {
    status: 'LIVE',
    color: '#00C853',
    bg: 'rgba(0, 200, 83, 0.12)',
    border: 'rgba(0, 200, 83, 0.25)',
    label: 'LIVE',
    badgeClass: 'badge-success',
  },
  DELAYED: {
    status: 'DELAYED',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.25)',
    label: '15M DELAYED',
    badgeClass: 'badge-warning',
  },
  STALE: {
    status: 'STALE',
    color: '#94A3B8',
    bg: 'rgba(148, 163, 184, 0.12)',
    border: 'rgba(148, 163, 184, 0.25)',
    label: 'STALE',
    badgeClass: 'badge-muted',
  },
  FALLBACK: {
    status: 'FALLBACK',
    color: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.25)',
    label: 'FALLBACK NAV',
    badgeClass: 'badge-blue',
  },
  DEMO: {
    status: 'DEMO',
    color: '#A855F7',
    bg: 'rgba(168, 85, 247, 0.12)',
    border: 'rgba(168, 85, 247, 0.25)',
    label: 'DEMO SYNTHETIC',
    badgeClass: 'badge-teal',
  },
  UNAVAILABLE: {
    status: 'UNAVAILABLE',
    color: '#FF5252',
    bg: 'rgba(255, 82, 82, 0.12)',
    border: 'rgba(255, 82, 82, 0.25)',
    label: 'UNAVAILABLE',
    badgeClass: 'badge-danger',
  },
} as const;

export const radiusTokens = {
  sm: '6px',
  md: '10px',
  lg: '16px',
  xl: '20px',
  full: '9999px',
} as const;

export const elevationTokens = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.35)',
  md: '0 4px 16px rgba(0, 0, 0, 0.40)',
  lg: '0 8px 30px rgba(0, 0, 0, 0.50)',
  card: '0 4px 20px rgba(0, 0, 0, 0.35)',
  overlay: '0 20px 50px rgba(0, 0, 0, 0.70)',
} as const;

export const borderTokens = {
  subtle: '1px solid var(--color-border-subtle)',
  default: '1px solid var(--color-border)',
  strong: '1px solid var(--color-border-strong)',
  accent: '1px solid var(--color-border-accent)',
} as const;

export type SpacingTokenKey = keyof typeof spacingTokens;
export type TypographyRole = keyof typeof typographyTokens.roles;
export type ColorTokenKey = keyof typeof darkThemeTokens;
export type MarketFreshnessStatus = keyof typeof marketFreshnessTokens;
export type RadiusTokenKey = keyof typeof radiusTokens;
export type ElevationTokenKey = keyof typeof elevationTokens;