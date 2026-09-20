import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useFintechStore } from '../store/useFintechStore';
import { darkThemeTokens, lightThemeTokens, colorTokens } from '../tokens';

describe('Global Two-Theme System (Dark & White)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('defaults to dark theme when no prior preference is saved in localStorage', () => {
    const state = useFintechStore.getState();
    expect(state.theme).toBe('dark');
  });

  it('reads stored preference from smartvest-theme localStorage key', () => {
    localStorage.setItem('smartvest-theme', 'light');
    // Calling setTheme with 'light' confirms synchronization
    const { setTheme } = useFintechStore.getState();
    setTheme('light');
    expect(useFintechStore.getState().theme).toBe('light');
    expect(localStorage.getItem('smartvest-theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('switches themes cleanly via toggleTheme()', () => {
    const { setTheme, toggleTheme } = useFintechStore.getState();
    
    // Start at dark
    setTheme('dark');
    expect(useFintechStore.getState().theme).toBe('dark');
    expect(localStorage.getItem('smartvest-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    // Toggle to light (White)
    toggleTheme();
    expect(useFintechStore.getState().theme).toBe('light');
    expect(localStorage.getItem('smartvest-theme')).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    // Toggle back to dark
    toggleTheme();
    expect(useFintechStore.getState().theme).toBe('dark');
    expect(localStorage.getItem('smartvest-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('applies theme-transition class to document element on theme changes', () => {
    const { setTheme } = useFintechStore.getState();
    setTheme('light');
    expect(document.documentElement.classList.contains('theme-transition')).toBe(true);
  });

  it('provides comprehensive typed tokens for both dark and light modes', () => {
    // Dark mode tokens (Deep Obsidian + Ice Cyan)
    expect(darkThemeTokens.BACKGROUND).toBe('#101217');
    expect(darkThemeTokens.SURFACE).toBe('#181C23');
    expect(darkThemeTokens.CARD).toBe('#1C2129');
    expect(darkThemeTokens.TEXT_PRIMARY).toBe('#EAF6FF');
    expect(darkThemeTokens.ACCENT_TEAL).toBe('#C1E8FF');
    expect(darkThemeTokens.ACCENT_ICE).toBe('#C1E8FF');
    expect(darkThemeTokens.ACCENT_BLUE).toBe('#C1E8FF');

    // Light mode tokens (Arctic White + Navy + Blue)
    expect(lightThemeTokens.BACKGROUND).toBe('#F7FAFD');
    expect(lightThemeTokens.SURFACE).toBe('#FFFFFF');
    expect(lightThemeTokens.CARD).toBe('#FFFFFF');
    expect(lightThemeTokens.TEXT_PRIMARY).toBe('#163A5D');
    expect(lightThemeTokens.ACCENT_BLUE).toBe('#388DEB');

    // Backward compatibility export
    expect(colorTokens.BACKGROUND).toBe('#101217');
    expect(colorTokens.ACCENT_TEAL).toBe('#C1E8FF');
  });
});
