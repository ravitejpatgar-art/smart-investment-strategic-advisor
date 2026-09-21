import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { DashboardLayout, formatInvestorRiskLabel } from '../components/dashboard/DashboardLayout';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    signOut: vi.fn(),
    user: null,
    loading: false
  })
}));

describe('Collapsible Desktop Sidebar & Fluid Layout', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('verifies formatInvestorRiskLabel formatting logic', () => {
    expect(formatInvestorRiskLabel('Aggressive')).toBe('Aggressive Investor');
    expect(formatInvestorRiskLabel('Moderate')).toBe('Medium Investor');
    expect(formatInvestorRiskLabel('Conservative')).toBe('Slow Investor');
    expect(formatInvestorRiskLabel()).toBe('Medium Investor');
  });

  it('renders sidebar expanded by default with brand logo and navigation labels', async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <DashboardLayout>
          <div data-testid="test-content">Dashboard Content</div>
        </DashboardLayout>
      );
    });

    const aside = container.querySelector('aside');
    expect(aside).not.toBeNull();
    expect(aside?.classList.contains('w-[260px]')).toBe(true);

    // Toggle button should be present with aria-label="Collapse sidebar"
    const collapseBtn = container.querySelector('button[aria-label="Collapse sidebar"]');
    expect(collapseBtn).not.toBeNull();
    expect(collapseBtn?.getAttribute('aria-expanded')).toBe('true');

    // Navigation items should have labels visible
    expect(container.textContent).toContain('Wealth Overview');
    expect(container.textContent).toContain('Market Terminal');
    expect(container.textContent).toContain('Investing Academy');
    expect(container.textContent).toContain('PORTFOLIO MODULES');
  });

  it('collapses the sidebar on toggle click and updates localStorage and width', async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <DashboardLayout>
          <div data-testid="test-content">Dashboard Content</div>
        </DashboardLayout>
      );
    });

    const collapseBtn = container.querySelector('button[aria-label="Collapse sidebar"]') as HTMLButtonElement;
    expect(collapseBtn).not.toBeNull();

    await act(async () => {
      collapseBtn.click();
    });

    const aside = container.querySelector('aside');
    expect(aside?.classList.contains('w-[76px]')).toBe(true);
    expect(aside?.classList.contains('w-[260px]')).toBe(false);

    // Should update localStorage
    expect(localStorage.getItem('smartvest-sidebar-collapsed')).toBe('true');

    // Expand button should now be available
    const expandBtn = container.querySelector('button[aria-label="Expand sidebar"]');
    expect(expandBtn).not.toBeNull();
    expect(expandBtn?.getAttribute('aria-expanded')).toBe('false');

    // Tooltips should be present on navigation items
    const tooltips = container.querySelectorAll('[role="tooltip"]');
    expect(tooltips.length).toBeGreaterThan(0);
  });

  it('initializes in collapsed state when smartvest-sidebar-collapsed is stored in localStorage', async () => {
    localStorage.setItem('smartvest-sidebar-collapsed', 'true');

    const root = createRoot(container);
    await act(async () => {
      root.render(
        <DashboardLayout>
          <div data-testid="test-content">Dashboard Content</div>
        </DashboardLayout>
      );
    });

    const aside = container.querySelector('aside');
    expect(aside?.classList.contains('w-[76px]')).toBe(true);

    const expandBtn = container.querySelector('button[aria-label="Expand sidebar"]');
    expect(expandBtn).not.toBeNull();
  });

  it('restores expanded state when expand button is clicked', async () => {
    localStorage.setItem('smartvest-sidebar-collapsed', 'true');

    const root = createRoot(container);
    await act(async () => {
      root.render(
        <DashboardLayout>
          <div data-testid="test-content">Dashboard Content</div>
        </DashboardLayout>
      );
    });

    const expandBtn = container.querySelector('button[aria-label="Expand sidebar"]') as HTMLButtonElement;
    expect(expandBtn).not.toBeNull();

    await act(async () => {
      expandBtn.click();
    });

    const aside = container.querySelector('aside');
    expect(aside?.classList.contains('w-[260px]')).toBe(true);
    expect(localStorage.getItem('smartvest-sidebar-collapsed')).toBe('false');
  });

  it('verifies content container is fluid with min-w-0 and no fixed max-width restriction', async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <DashboardLayout>
          <div data-testid="test-content">Fluid Content</div>
        </DashboardLayout>
      );
    });

    const main = container.querySelector('main');
    expect(main).not.toBeNull();
    expect(main?.classList.contains('min-w-0')).toBe(true);
    expect(main?.classList.contains('flex-1')).toBe(true);

    const innerDiv = main?.firstElementChild;
    expect(innerDiv?.classList.contains('w-full')).toBe(true);
    expect(innerDiv?.classList.contains('min-w-0')).toBe(true);
    // Should NOT contain the old max-w-[1440px]
    expect(innerDiv?.classList.contains('max-w-[1440px]')).toBe(false);
  });
});
