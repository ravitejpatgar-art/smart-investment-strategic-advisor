import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
import { 
  generateExpensePdfReport, 
  getExpensePdfFilename, 
  type ExpensePdfReportData 
} from '../services/pdfReportGenerator';
import * as pdfGenModule from '../services/pdfReportGenerator';
import type { ExpenseItem, UserProfile } from '../types';
import { ExpenseTrackerView } from '../components/expenses/ExpenseTrackerView';
import { useFintechStore } from '../store/useFintechStore';

describe('Expense Tracker PDF Export System', () => {
  let mockWindow: {
    document: {
      open: ReturnType<typeof vi.fn>;
      write: ReturnType<typeof vi.fn>;
      close: ReturnType<typeof vi.fn>;
    };
  };

  const sampleUser: UserProfile = {
    id: 'usr_test_1',
    name: 'Rajesh Sharma',
    email: 'rajesh@example.com',
    salaryIncome: 120000,
    otherIncome: 15000,
    monthlyExpenses: 45000,
    riskTolerance: 'Moderate',
  };

  const sampleExpenses: ExpenseItem[] = [
    { id: '1', category: 'Food', amount: 15000, date: '2026-09-01', description: 'Grocery and dining' },
    { id: '2', category: 'Rent', amount: 25000, date: '2026-09-02', description: 'Apartment rent' },
    { id: '3', category: 'Utilities', amount: 5000, date: '2026-09-05', description: 'Electricity and fiber internet' },
    { id: '4', category: 'Shopping', amount: 8000, date: '2026-09-10', description: 'Festive shopping' },
  ];

  beforeEach(() => {
    mockWindow = {
      document: {
        open: vi.fn(),
        write: vi.fn(),
        close: vi.fn(),
      },
    };
    vi.spyOn(window, 'open').mockReturnValue(mockWindow as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Filename Generation', () => {
    it('generates filename with format SmartVest-Expense-Report-YYYY-MM-DD.pdf', () => {
      const fixedDate = new Date(2026, 8, 27); // Sept 27, 2026
      const filename = getExpensePdfFilename(fixedDate);
      expect(filename).toBe('SmartVest-Expense-Report-2026-09-27.pdf');
    });

    it('generates filename with runtime date when no date is provided', () => {
      const filename = getExpensePdfFilename();
      expect(filename).toMatch(/^SmartVest-Expense-Report-\d{4}-\d{2}-\d{2}\.pdf$/);
    });
  });

  describe('PDF Report Generation & Content', () => {
    it('invokes PDF generation and writes structured HTML to popup window', () => {
      const data: ExpensePdfReportData = {
        user: sampleUser,
        currency: 'INR',
        currencySymbol: '₹',
        totalIncome: 135000,
        totalExpenses: 53000,
        netSavings: 82000,
        savingsRate: 61,
        burnRate: 39,
        needsTotal: 40000,
        wantsTotal: 8000,
        fixedTotal: 5000,
        expenses: sampleExpenses,
      };

      const result = generateExpensePdfReport(data);

      expect(result).toBe(true);
      expect(window.open).toHaveBeenCalledWith('', '_blank');
      expect(mockWindow.document.open).toHaveBeenCalled();
      expect(mockWindow.document.write).toHaveBeenCalled();
      expect(mockWindow.document.close).toHaveBeenCalled();

      const html = mockWindow.document.write.mock.calls[0][0];

      // Header
      expect(html).toContain('SmartVest Expense & Cash Flow Report');
      expect(html).toContain('Rajesh Sharma');
      expect(html).toContain('Selected Currency: <strong>INR (₹)</strong>');

      // Cash flow summary
      expect(html).toContain('Monthly Inflow');
      expect(html).toContain('Monthly Outflow');
      expect(html).toContain('Investable Surplus');
      expect(html).toContain('Savings Rate');
      expect(html).toContain('61%');
      expect(html).toContain('Burn Ratio: 39%');

      // Essentiality Allocation
      expect(html).toContain('Essentiality Allocation (50 / 30 / 20 Rule)');
      expect(html).toContain('Needs (Core)');
      expect(html).toContain('Wants (Discretionary)');
      expect(html).toContain('Fixed Commitments');

      // Category breakdown
      expect(html).toContain('Food &amp; Dining');
      expect(html).toContain('Housing &amp; Rent');
      expect(html).toContain('Bills &amp; Utilities');
      expect(html).toContain('Shopping &amp; Lifestyle');

      // Transaction items
      expect(html).toContain('Grocery and dining');
      expect(html).toContain('Apartment rent');
      expect(html).toContain('Electricity and fiber internet');
      expect(html).toContain('Festive shopping');

      // Financial Health Insights
      expect(html).toContain('Financial Health & Cash-Flow Insights');

      // Disclaimer
      expect(html).toContain('SmartVest is an advisory decision-support platform.');
    });

    it('uses custom formatCurrency if provided', () => {
      const customFormatCurrency = vi.fn((amt: number) => `CUSTOM-${amt}`);

      const data: ExpensePdfReportData = {
        user: sampleUser,
        currency: 'USD',
        currencySymbol: '$',
        formatCurrency: customFormatCurrency,
        totalIncome: 5000,
        totalExpenses: 2000,
        netSavings: 3000,
        savingsRate: 60,
        burnRate: 40,
        needsTotal: 1200,
        wantsTotal: 500,
        fixedTotal: 300,
        expenses: [
          { id: 'u1', category: 'Food', amount: 1200, date: '2026-09-15', description: 'Groceries' }
        ],
      };

      const result = generateExpensePdfReport(data);

      expect(result).toBe(true);
      expect(customFormatCurrency).toHaveBeenCalled();
      const html = mockWindow.document.write.mock.calls[0][0];
      expect(html).toContain('CUSTOM-5000');
      expect(html).toContain('CUSTOM-2000');
      expect(html).toContain('CUSTOM-3000');
    });

    it('handles USD currency and $ symbol correctly', () => {
      const data: ExpensePdfReportData = {
        user: { ...sampleUser, name: 'Alice Smith' },
        currency: 'USD',
        currencySymbol: '$',
        totalIncome: 8000,
        totalExpenses: 3200,
        netSavings: 4800,
        savingsRate: 60,
        burnRate: 40,
        needsTotal: 2000,
        wantsTotal: 700,
        fixedTotal: 500,
        expenses: [
          { id: '1', category: 'Rent', amount: 2000, date: '2026-09-01', description: 'Studio rent' },
        ],
      };

      const result = generateExpensePdfReport(data);
      expect(result).toBe(true);

      const html = mockWindow.document.write.mock.calls[0][0];
      expect(html).toContain('USD ($)');
      expect(html).toContain('$8,000');
      expect(html).toContain('$3,200');
      expect(html).toContain('$4,800');
    });

    it('handles empty expense state safely without fabricating records', () => {
      const emptyData: ExpensePdfReportData = {
        user: null,
        currency: 'INR',
        currencySymbol: '₹',
        totalIncome: 0,
        totalExpenses: 0,
        netSavings: 0,
        savingsRate: 0,
        burnRate: 0,
        needsTotal: 0,
        wantsTotal: 0,
        fixedTotal: 0,
        expenses: [],
      };

      const result = generateExpensePdfReport(emptyData);
      expect(result).toBe(true);

      const html = mockWindow.document.write.mock.calls[0][0];
      expect(html).toContain('Investor: <strong>N/A</strong>');
      expect(html).toContain('No expense transactions recorded.');
      expect(html).toContain('No category outflows recorded.');
    });

    it('escapes potentially dangerous characters in expense descriptions', () => {
      const maliciousExpense: ExpenseItem = {
        id: 'xss1',
        category: 'Other',
        amount: 100,
        date: '2026-09-01',
        description: '<script>alert("xss")</script>',
      };

      const data: ExpensePdfReportData = {
        user: sampleUser,
        currency: 'INR',
        currencySymbol: '₹',
        expenses: [maliciousExpense],
      };

      const result = generateExpensePdfReport(data);
      expect(result).toBe(true);

      const html = mockWindow.document.write.mock.calls[0][0];
      expect(html).not.toContain('<script>alert("xss")</script>');
      expect(html).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('returns false safely when popup window cannot be opened', () => {
      vi.spyOn(window, 'open').mockReturnValue(null);
      const alertMock = vi.fn();
      window.alert = alertMock;

      const result = generateExpensePdfReport({
        user: sampleUser,
        currency: 'INR',
        currencySymbol: '₹',
        expenses: sampleExpenses,
      });

      expect(result).toBe(false);
      expect(alertMock).toHaveBeenCalled();
    });

    it('returns false safely when document write throws', () => {
      mockWindow.document.write.mockImplementation(() => {
        throw new Error('Disk full');
      });

      const result = generateExpensePdfReport({
        user: sampleUser,
        currency: 'INR',
        currencySymbol: '₹',
        expenses: sampleExpenses,
      });

      expect(result).toBe(false);
    });
  });

  describe('ExpenseTrackerView Export PDF UI Integration', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    afterEach(() => {
      if (container && container.parentNode) {
        document.body.removeChild(container);
      }
    });

    it('renders the Export PDF button and triggers generateExpensePdfReport on click', async () => {
      const generateSpy = vi.spyOn(pdfGenModule, 'generateExpensePdfReport').mockReturnValue(true);

      useFintechStore.setState({
        user: sampleUser,
        expenses: sampleExpenses,
        currency: 'INR',
        currencySymbol: '₹',
      });

      const root = createRoot(container);
      await act(async () => {
        root.render(<ExpenseTrackerView />);
      });

      const exportButton = Array.from(container.querySelectorAll('button')).find(
        (btn) => btn.textContent?.includes('Export PDF')
      );

      expect(exportButton).toBeDefined();

      await act(async () => {
        exportButton?.click();
      });

      expect(generateSpy).toHaveBeenCalledTimes(1);
      const callArg = generateSpy.mock.calls[0][0];
      expect(callArg.user?.name).toBe('Rajesh Sharma');
      expect(callArg.currency).toBe('INR');
      expect(callArg.expenses.length).toBe(sampleExpenses.length);
      expect(callArg.totalIncome).toBe(135000); // 120000 + 15000
      expect(callArg.totalExpenses).toBe(53000);
      expect(callArg.netSavings).toBe(82000);
    });

    it('displays user-friendly error message if PDF generation fails', async () => {
      vi.spyOn(pdfGenModule, 'generateExpensePdfReport').mockReturnValue(false);

      const root = createRoot(container);
      await act(async () => {
        root.render(<ExpenseTrackerView />);
      });

      const exportButton = Array.from(container.querySelectorAll('button')).find(
        (btn) => btn.textContent?.includes('Export PDF')
      );

      await act(async () => {
        exportButton?.click();
      });

      const alertBanner = container.querySelector('[role="alert"]');
      expect(alertBanner).not.toBeNull();
      expect(alertBanner?.textContent).toContain('Unable to generate the PDF. Please try again.');
    });
  });
});
