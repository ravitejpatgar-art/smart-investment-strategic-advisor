import { describe, it, expect } from 'vitest';
import React from 'react';
import { OverviewDashboard } from '../components/dashboard/OverviewDashboard';
import { colorTokens, spacingTokens, typographyTokens } from '../tokens';

describe('SmartVest P6.3 Dashboard Visual Hierarchy Refinement', () => {
  it('exports OverviewDashboard functional component successfully', () => {
    expect(OverviewDashboard).toBeDefined();
    expect(typeof OverviewDashboard).toBe('function');
  });

  it('creates OverviewDashboard React element without throwing', () => {
    const el = React.createElement(OverviewDashboard);
    expect(el).toBeDefined();
    expect(el.type).toBe(OverviewDashboard);
  });

  it('verifies dark palette color tokens are available for the dashboard hierarchy', () => {
    expect(colorTokens.BACKGROUND).toBe('#101217');
    expect(colorTokens.SURFACE).toBe('#181C23');
    expect(colorTokens.CARD).toBe('#1C2129');
    expect(colorTokens.ACCENT_TEAL).toBe('#C1E8FF');
    expect(colorTokens.SUCCESS).toBe('#00C853');
    expect(colorTokens.WARNING).toBe('#F59E0B');
  });

  it('verifies spacing scale aligns with institutional dashboard grid', () => {
    expect(spacingTokens.xs).toBe('4px');
    expect(spacingTokens.sm).toBe('8px');
    expect(spacingTokens.md).toBe('12px');
    expect(spacingTokens.base).toBe('16px');
    expect(spacingTokens.lg).toBe('24px');
    expect(spacingTokens.xl).toBe('32px');
  });

  it('verifies tabular numerals typography role for financial surplus and inflows', () => {
    expect(typographyTokens.roles.MONO_NUMBER).toContain('tabular-nums');
  });
});
