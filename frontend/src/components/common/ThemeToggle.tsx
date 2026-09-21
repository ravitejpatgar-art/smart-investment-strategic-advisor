import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useFintechStore } from '../../store/useFintechStore';

export interface ThemeToggleProps {
  variant?: 'header' | 'pill' | 'icon';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { theme, toggleTheme } = useFintechStore();
  const isDark = theme === 'dark';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleTheme();
    }
  };

  const labelText = isDark ? 'Dark' : 'White';
  const nextThemeText = isDark ? 'White' : 'Dark';
  const titleText = `Current: ${labelText} theme. Click to switch to ${nextThemeText} theme.`;

  if (variant === 'pill') {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={`Theme switch: currently ${labelText} theme. Switch to ${nextThemeText}.`}
        title={titleText}
        onClick={toggleTheme}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer select-none border border-[var(--color-border)] bg-[var(--color-surface-3)] hover:bg-[var(--color-border-strong)] text-[var(--color-text-primary)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-hidden ${className}`}
      >
        <div className="flex items-center gap-2">
          {isDark ? (
            <Moon className="w-4 h-4 text-[var(--color-accent)] transition-transform duration-300 rotate-0" aria-hidden="true" />
          ) : (
            <Sun className="w-4 h-4 text-[var(--color-accent)] transition-transform duration-300 rotate-90" aria-hidden="true" />
          )}
          <span>{labelText} Mode</span>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]">
          {isDark ? 'Dark' : 'White'}
        </span>
      </button>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={`Theme switch: currently ${labelText} theme. Switch to ${nextThemeText}.`}
        title={titleText}
        onClick={toggleTheme}
        onKeyDown={handleKeyDown}
        className={`p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-3)] hover:bg-[var(--color-border-strong)] text-[var(--color-text-primary)] transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-hidden shadow-2xs ${className}`}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-[var(--color-accent)] transition-transform duration-300 hover:rotate-12" aria-hidden="true" />
        ) : (
          <Sun className="w-4 h-4 text-[var(--color-accent)] transition-transform duration-300 hover:rotate-45" aria-hidden="true" />
        )}
      </button>
    );
  }

  // Default 'header' variant: compact dual-state pill control matching Currency selector
  return (
    <div
      role="radiogroup"
      aria-label="Theme selector"
      className={`inline-flex items-center p-0.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-3)] text-xs select-none ${className}`}
    >
      <button
        type="button"
        role="radio"
        aria-checked={!isDark}
        aria-label="Switch to White theme"
        title="White theme"
        onClick={() => {
          if (isDark) toggleTheme();
        }}
        className={`flex items-center gap-1.5 px-2 py-1 sm:py-0.5 rounded-md text-[10.5px] sm:text-[11px] font-semibold transition-all duration-150 cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-hidden ${
          !isDark
            ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-2xs font-bold border border-[var(--color-border-subtle)]'
            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border border-transparent'
        }`}
      >
        <Sun className={`w-3.5 h-3.5 transition-transform duration-200 motion-reduce:transition-none ${!isDark ? 'text-[var(--color-accent)] rotate-0 scale-105' : 'text-current -rotate-12 scale-95 opacity-70'}`} aria-hidden="true" />
        <span className="hidden sm:inline">White</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={isDark}
        aria-label="Switch to Dark theme"
        title="Dark theme"
        onClick={() => {
          if (!isDark) toggleTheme();
        }}
        className={`flex items-center gap-1.5 px-2 py-1 sm:py-0.5 rounded-md text-[10.5px] sm:text-[11px] font-semibold transition-all duration-150 cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-hidden ${
          isDark
            ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-2xs font-bold border border-[var(--color-border-subtle)]'
            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border border-transparent'
        }`}
      >
        <Moon className={`w-3.5 h-3.5 transition-transform duration-200 motion-reduce:transition-none ${isDark ? 'text-[var(--color-accent)] rotate-0 scale-105' : 'text-current rotate-12 scale-95 opacity-70'}`} aria-hidden="true" />
        <span className="hidden sm:inline">Dark</span>
      </button>
    </div>
  );
};
