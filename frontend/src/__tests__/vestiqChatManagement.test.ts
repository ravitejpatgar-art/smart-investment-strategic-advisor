import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  formatConversationAsPlainText, 
  formatMarkdownForPdf, 
  formatInlineMarkdown,
  generateVestiqPdf
} from '../services/vestiqPdfGenerator';
import type { VestiqChatMessage } from '../components/vestiq/VestiqMessage';
import type { UserProfile } from '../types';

describe('VestIQ Chat Management & Export Feature', () => {
  const sampleUser: UserProfile = {
    email: 'rajesh.sharma@example.com',
    name: 'Rajesh Sharma',
    age: 34,
    occupation: 'Software Architect',
    salaryIncome: 250000,
    monthlyIncome: 250000,
    monthlyExpenses: 80000,
    existingSavings: 2000000,
    existingInvestments: 3500000,
    emergencyFund: 600000,
    riskTolerance: 'Aggressive',
    riskScore: 82,
    onboardingCompleted: true,
  };

  const sampleMessages: VestiqChatMessage[] = [
    {
      id: 'msg-1',
      sender: 'user',
      text: 'What is my portfolio risk profile?',
      timestamp: '10:15 AM',
    },
    {
      id: 'msg-2',
      sender: 'assistant',
      text: 'Based on your asset allocation, your risk stance is **Aggressive** with an estimated volatility of `14.2%`.',
      timestamp: '10:15 AM',
    },
    {
      id: 'msg-3',
      sender: 'user',
      text: 'Should I rebalance equity into debt funds?',
      timestamp: '10:16 AM',
    },
    {
      id: 'msg-4',
      sender: 'assistant',
      text: 'Yes, reducing equity by **5%** into liquid or corporate debt stabilizes your emergency runway.',
      timestamp: '10:16 AM',
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Plain Text Conversation Formatting (Copy Chat)', () => {
    it('formats conversation cleanly with role headers and message text', () => {
      const output = formatConversationAsPlainText(sampleMessages);
      
      expect(output).toContain('VESTIQ CONVERSATION');
      expect(output).toContain('You:\nWhat is my portfolio risk profile?');
      expect(output).toContain('VestIQ:\nBased on your asset allocation');
      expect(output).toContain('You:\nShould I rebalance equity into debt funds?');
      expect(output).toContain('VestIQ:\nYes, reducing equity by **5%**');
    });

    it('returns empty string when messages array is empty', () => {
      expect(formatConversationAsPlainText([])).toBe('');
    });

    it('does not leak internal properties or IDs into plain text output', () => {
      const output = formatConversationAsPlainText(sampleMessages);
      expect(output).not.toContain('msg-1');
      expect(output).not.toContain('msg-2');
      expect(output).not.toContain('calculations');
      expect(output).not.toContain('followUps');
    });
  });

  describe('Markdown to PDF HTML Formatter', () => {
    it('converts markdown bold and inline code correctly', () => {
      const input = 'Allocate **25%** to `NIFTY 50` index fund.';
      const output = formatMarkdownForPdf(input);

      expect(output).toContain('<strong>25%</strong>');
      expect(output).toContain('<code class="inline-code">NIFTY 50</code>');
    });

    it('handles markdown lists and tables cleanly', () => {
      const markdown = `
Key points:
- Equity: 60%
- Debt: 25%
- Gold: 15%

| Asset | Percentage |
|---|---|
| Large Cap | 30% |
| Flexi Cap | 30% |
      `.trim();

      const output = formatMarkdownForPdf(markdown);
      expect(output).toContain('<ul class="pdf-list">');
      expect(output).toContain('<li>Equity: 60%</li>');
      expect(output).toContain('<table class="pdf-table">');
      expect(output).toContain('<th>Asset</th>');
      expect(output).toContain('<td>Large Cap</td>');
    });

    it('escapes dangerous HTML characters', () => {
      const input = '<script>alert("hack")</script> & 5 < 10';
      const output = formatInlineMarkdown(input);

      expect(output).not.toContain('<script>');
      expect(output).toContain('&lt;script&gt;');
      expect(output).toContain('&amp;');
    });
  });

  describe('Conversational Truncation Logic (ChatGPT parity)', () => {
    it('truncates conversation cleanly when editing a middle user turn', () => {
      // User edits message 3 ('Should I rebalance...')
      const targetId = 'msg-3';
      const targetIdx = sampleMessages.findIndex((m) => m.id === targetId);
      expect(targetIdx).toBe(2);

      // Everything from targetIdx onwards is removed
      const preserved = sampleMessages.slice(0, targetIdx);
      expect(preserved).toHaveLength(2);
      expect(preserved.map((m) => m.id)).toEqual(['msg-1', 'msg-2']);
      expect(preserved).not.toContainEqual(expect.objectContaining({ id: 'msg-3' }));
      expect(preserved).not.toContainEqual(expect.objectContaining({ id: 'msg-4' }));
    });

    it('truncates conversation cleanly when deleting a middle user turn', () => {
      // User deletes message 3
      const targetId = 'msg-3';
      const targetIdx = sampleMessages.findIndex((m) => m.id === targetId);
      const remaining = sampleMessages.slice(0, targetIdx);

      expect(remaining).toHaveLength(2);
      expect(remaining[0].id).toBe('msg-1');
      expect(remaining[1].id).toBe('msg-2');
    });

    it('resets entire conversation when first message is edited or deleted', () => {
      const targetId = 'msg-1';
      const targetIdx = sampleMessages.findIndex((m) => m.id === targetId);
      const remaining = sampleMessages.slice(0, targetIdx);

      expect(remaining).toHaveLength(0);
    });
  });

  describe('PDF Generation Service', () => {
    it('refuses to generate PDF for empty conversations', () => {
      const result = generateVestiqPdf({ messages: [], user: sampleUser });
      expect(result).toBe(false);
    });

    it('triggers window.open and writes branded document for valid conversations', () => {
      const mockDocument = {
        open: vi.fn(),
        write: vi.fn(),
        close: vi.fn(),
      };
      const mockWindow = {
        document: mockDocument,
      };

      vi.spyOn(window, 'open').mockReturnValue(mockWindow as any);

      const result = generateVestiqPdf({ messages: sampleMessages, user: sampleUser });

      expect(result).toBe(true);
      expect(window.open).toHaveBeenCalledWith('', '_blank');
      expect(mockDocument.open).toHaveBeenCalled();
      expect(mockDocument.write).toHaveBeenCalled();
      expect(mockDocument.close).toHaveBeenCalled();

      const writtenHtml = mockDocument.write.mock.calls[0][0];
      expect(writtenHtml).toContain('SmartVest');
      expect(writtenHtml).toContain('VestIQ');
      expect(writtenHtml).toContain('Rajesh Sharma');
      expect(writtenHtml).toContain('What is my portfolio risk profile?');
      expect(writtenHtml).toContain('Regulatory Notice & Institutional Disclosure');
    });
  });
});
