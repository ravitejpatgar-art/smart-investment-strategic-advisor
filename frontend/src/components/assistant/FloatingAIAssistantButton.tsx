import React from 'react';
import { useFintechStore } from '../../store/useFintechStore';

export const FloatingAIAssistantButton: React.FC = () => {
  const { activeView, setActiveView, theme } = useFintechStore();

  // Exclude when already inside VestIQ, landing, or onboarding to avoid redundant controls
  if (activeView === 'ai' || activeView === 'vestiq' || activeView === 'landing' || activeView === 'onboarding') {
    return null;
  }

  const isDark = theme !== 'light';
  const monoSrc = isDark ? '/smartvest-monogram.png' : '/smartvest-monogram-light.png';

  const handleClick = () => {
    setActiveView('ai');
  };

  return (
    <aside
      aria-label="Quick Advisory Assistant"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40"
      style={{
        bottom: 'max(1rem, calc(1rem + env(safe-area-inset-bottom, 0px)))',
        right: 'max(1rem, calc(1rem + env(safe-area-inset-right, 0px)))',
      }}
    >
      <button
        type="button"
        onClick={handleClick}
        aria-label="Ask VestIQ"
        title="Ask VestIQ Strategic Advisor"
        className="group relative inline-flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[var(--color-accent)] text-[var(--color-accent-text)] font-bold text-xs sm:text-[13px] tracking-tight shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] border border-[var(--color-border-accent)] cursor-pointer select-none transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] min-h-[44px] min-w-[44px] touch-manipulation"
      >
        <span className="w-5 h-5 flex items-center justify-center shrink-0">
          <img
            src={monoSrc}
            alt="SV"
            width={18}
            height={18}
            className="object-contain shrink-0 transition-transform duration-200 group-hover:scale-105"
            loading="eager"
            decoding="async"
          />
        </span>
        <span className="hidden sm:inline whitespace-nowrap">Ask VestIQ</span>
        <span className="inline sm:hidden whitespace-nowrap">Ask</span>
      </button>
    </aside>
  );
};
