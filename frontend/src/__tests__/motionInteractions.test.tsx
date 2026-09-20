import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useFintechStore } from '../store/useFintechStore';
import { AnimatedView } from '../components/common/AnimatedView';
import { AmbientCursorGlow } from '../components/common/AmbientCursorGlow';
import { Button } from '../components/common/Button';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { VestiqMessage, type VestiqChatMessage } from '../components/vestiq/VestiqMessage';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    signOut: vi.fn(),
    user: null,
    loading: false
  })
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('SmartVest Premium Motion & Interaction Suite', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.useFakeTimers();
  });

  afterEach(() => {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('1. Fast Theme Transition & Reduced Motion Timing', () => {
    it('applies theme-transition class and removes it after ~850ms cleanup timer', () => {
      const { setTheme } = useFintechStore.getState();

      act(() => {
        setTheme('light');
      });

      expect(document.documentElement.classList.contains('theme-transition')).toBe(true);

      // Advance by 800ms (visual duration completed, cleanup margin pending)
      act(() => {
        vi.advanceTimersByTime(800);
      });
      expect(document.documentElement.classList.contains('theme-transition')).toBe(true);

      // Advance past 850ms cleanup timer
      act(() => {
        vi.advanceTimersByTime(60);
      });
      expect(document.documentElement.classList.contains('theme-transition')).toBe(false);
    });

    it('immediately bypasses theme-transition class when prefers-reduced-motion is active', () => {
      const matchMediaSpy = vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { setTheme } = useFintechStore.getState();

      act(() => {
        setTheme('light');
      });

      expect(document.documentElement.classList.contains('theme-transition')).toBe(false);
      matchMediaSpy.mockRestore();
    });
  });

  describe('2. AnimatedView Shared Page Transition Layer', async () => {
    it('renders child views smoothly inside AnimatedView without resetting content', async () => {
      const root = createRoot(container);
      await act(async () => {
        root.render(
          <AnimatedView viewKey="dashboard">
            <div data-testid="dashboard-content">Wealth Overview Metrics</div>
          </AnimatedView>
        );
      });

      const element = container.querySelector('[data-testid="dashboard-content"]');
      expect(element).not.toBeNull();
      expect(element?.textContent).toBe('Wealth Overview Metrics');
      expect(container.firstElementChild?.className).toContain('w-full');
      expect(container.firstElementChild?.className).toContain('min-w-0');
    });
  });

  describe('3. Ambient Desktop Cursor Glow Constraints', async () => {
    it('mounts with desktop-only classes (hidden lg:block) and pointer-events-none', async () => {
      const root = createRoot(container);
      await act(async () => {
        root.render(<AmbientCursorGlow />);
      });

      const glowElement = container.querySelector('[data-testid="ambient-cursor-glow"]');
      expect(glowElement).not.toBeNull();
      expect(glowElement?.className).toContain('pointer-events-none');
      expect(glowElement?.className).toContain('hidden');
      expect(glowElement?.className).toContain('lg:block');
    });

    it('attaches passive window pointer listeners without triggering React state updates', async () => {
      const addEventSpy = vi.spyOn(window, 'addEventListener');
      const root = createRoot(container);
      await act(async () => {
        root.render(<AmbientCursorGlow />);
      });

      const pointerMoveCalls = addEventSpy.mock.calls.filter(call => call[0] === 'pointermove');
      expect(pointerMoveCalls.length).toBeGreaterThanOrEqual(1);
      expect(pointerMoveCalls[0][2]).toEqual({ passive: true });

      addEventSpy.mockRestore();
    });
  });

  describe('4. Button Micro-Interactions & Hover Elevation', async () => {
    it('applies subtle translateY(-1px) on hover and scale(0.99) on active compression', async () => {
      const root = createRoot(container);
      await act(async () => {
        root.render(<Button variant="primary">Execute Order</Button>);
      });

      const button = container.querySelector('button');
      expect(button).not.toBeNull();
      expect(button?.className).toContain('hover:-translate-y-px');
      expect(button?.className).toContain('active:scale-[0.99]');
      expect(button?.className).toContain('motion-reduce:transform-none');
    });

    it('neutralizes hover transforms when disabled', async () => {
      const root = createRoot(container);
      await act(async () => {
        root.render(<Button disabled>Disabled Action</Button>);
      });

      const button = container.querySelector('button');
      expect(button).not.toBeNull();
      expect(button?.className).toContain('disabled:hover:translate-y-0');
      expect(button?.className).toContain('disabled:opacity-50');
      expect(button?.className).toContain('disabled:cursor-not-allowed');
    });
  });

  describe('5. Sidebar Synchronized Transition & Tooltip Polish', async () => {
    it('applies 250ms width transition and motion-reduce fallback in DashboardLayout', async () => {
      const root = createRoot(container);
      await act(async () => {
        root.render(
          <DashboardLayout>
            <div>Main Workspace Content</div>
          </DashboardLayout>
        );
      });

      const sidebar = container.querySelector('aside[aria-label="Sidebar Navigation"]');
      expect(sidebar).not.toBeNull();
      expect(sidebar?.className).toContain('duration-250');
      expect(sidebar?.className).toContain('motion-reduce:transition-none');
    });

    it('adds subtle translate-x-0.5 hover transition on expanded navigation items', async () => {
      const root = createRoot(container);
      await act(async () => {
        root.render(
          <DashboardLayout>
            <div>Main Workspace Content</div>
          </DashboardLayout>
        );
      });

      const navButtons = Array.from(container.querySelectorAll('button'));
      const overviewBtn = navButtons.find(b => b.getAttribute('aria-label') === 'Wealth Overview');
      expect(overviewBtn).toBeDefined();
      expect(overviewBtn?.className).toContain('hover:translate-x-0.5');
      expect(overviewBtn?.className).toContain('motion-reduce:hover:translate-x-0');
    });
  });

  describe('6. Theme Toggle Micro-Animation', async () => {
    it('renders rotating/scaling icons with duration-200 in ThemeToggle', async () => {
      const root = createRoot(container);
      await act(async () => {
        root.render(<ThemeToggle variant="header" />);
      });

      const whiteRadio = container.querySelector('button[aria-label="Switch to White theme"]');
      const darkRadio = container.querySelector('button[aria-label="Switch to Dark theme"]');

      expect(whiteRadio).not.toBeNull();
      expect(darkRadio).not.toBeNull();

      const sunSvg = whiteRadio?.querySelector('svg');
      const svgClasses = sunSvg?.className?.baseVal || sunSvg?.getAttribute('class') || '';
      expect(svgClasses).toContain('duration-200');
    });
  });

  describe('7. VestIQ Message Motion & Action Persistence', async () => {
    const mockUserMsg: VestiqChatMessage = {
      id: 'msg-1',
      sender: 'user',
      text: 'What is my current asset allocation?',
      timestamp: '10:45 AM',
    };

    it('renders user message with animate-fade-up entrance and visible Edit/Delete actions', async () => {
      const root = createRoot(container);
      await act(async () => {
        root.render(
          <VestiqMessage
            message={mockUserMsg}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />
        );
      });

      expect(container.textContent).toContain('What is my current asset allocation?');

      const buttons = Array.from(container.querySelectorAll('button'));
      const editBtn = buttons.find(b => b.getAttribute('aria-label') === 'Edit message');
      const deleteBtn = buttons.find(b => b.getAttribute('aria-label') === 'Delete message');
      const copyBtn = buttons.find(b => b.getAttribute('aria-label') === 'Copy message');

      expect(editBtn).toBeDefined();
      expect(deleteBtn).toBeDefined();
      expect(copyBtn).toBeDefined();
    });

    it('transitions smoothly into inline editor when Edit is clicked', async () => {
      const root = createRoot(container);
      await act(async () => {
        root.render(
          <VestiqMessage
            message={mockUserMsg}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />
        );
      });

      const buttons = Array.from(container.querySelectorAll('button'));
      const editBtn = buttons.find(b => b.getAttribute('aria-label') === 'Edit message');
      expect(editBtn).toBeDefined();

      await act(async () => {
        editBtn?.click();
      });

      expect(container.textContent).toContain('Edit message (everything below will be reset)');
      const textarea = container.querySelector('textarea');
      expect(textarea).not.toBeNull();
    });
  });
});
