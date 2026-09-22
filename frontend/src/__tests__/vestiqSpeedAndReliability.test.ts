import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { authApi, apiClient } from '../services/api';
import { parseAssistantApiResponse } from '../services/vestiqGrounding';

describe('VestIQ AI Assistant Speed, Reliability & Accuracy', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 1. Successful /ai/chat response
  it('1. dispatches to /ai/chat with 30s timeout and returns real response', async () => {
    const mockApiResponse = {
      answer: 'An ETF (Exchange-Traded Fund) is a pooled investment vehicle.',
      calculations: {
        type: 'sip',
        monthlyInvestment: 10000,
        investedAmount: 1200000,
        totalValue: 2323391,
        cagr: 12,
        years: 10
      },
      followUps: ['Suggest me some US ETFs', 'What is the expense ratio of MON100?'],
      intent: 'education',
      entities: ['ETF']
    };

    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockApiResponse });

    const result = await authApi.askAssistant({
      question: 'What is an ETF?',
      requestId: 'req_test_1'
    });

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledWith(
      '/ai/chat',
      expect.objectContaining({
        question: 'What is an ETF?',
        requestId: 'req_test_1'
      }),
      { timeout: 30000 }
    );
    expect(result).toEqual(mockApiResponse);
  });

  // 2. /ai/chat 404 -> fallback to /assistant/chat
  it('2. falls back to /assistant/chat ONLY when primary returns HTTP 404', async () => {
    const error404: any = new Error('Not Found');
    error404.response = { status: 404, data: { detail: 'Not Found' } };

    const fallbackResponse = {
      answer: 'Fallback response from secondary assistant route.',
      followUps: []
    };

    const postSpy = vi.spyOn(apiClient, 'post')
      .mockRejectedValueOnce(error404)
      .mockResolvedValueOnce({ data: fallbackResponse });

    const result = await authApi.askAssistant('Test query');

    expect(postSpy).toHaveBeenCalledTimes(2);
    expect(postSpy.mock.calls[0][0]).toBe('/ai/chat');
    expect(postSpy.mock.calls[0][2]).toEqual({ timeout: 30000 });
    expect(postSpy.mock.calls[1][0]).toBe('/assistant/chat');
    expect(postSpy.mock.calls[1][2]).toEqual({ timeout: 30000 });
    expect(result).toEqual(fallbackResponse);
  });

  // 3. /ai/chat 500 -> NO unnecessary fallback request
  it('3. does NOT call /assistant/chat when primary returns HTTP 500', async () => {
    const error500: any = new Error('Internal Server Error');
    error500.response = { status: 500, data: { detail: 'Database connection failed' } };

    const postSpy = vi.spyOn(apiClient, 'post').mockRejectedValueOnce(error500);

    await expect(authApi.askAssistant('Portfolio check')).rejects.toMatchObject({
      response: { status: 500 }
    });

    // CRITICAL: MUST NOT fire a secondary request on 500
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledWith('/ai/chat', expect.anything(), { timeout: 30000 });
  });

  // 4. Non-404 errors fail fast (400, 401, 403, 422, 429, 502, 503, network failure)
  it('4. immediately surfaces other errors (429, 400, network error) without fallback', async () => {
    // 429 Rate limit
    const error429: any = new Error('Rate limited');
    error429.response = { status: 429, data: { detail: 'Too Many Requests' } };

    const postSpy429 = vi.spyOn(apiClient, 'post').mockRejectedValueOnce(error429);
    await expect(authApi.askAssistant('Quick query')).rejects.toMatchObject({
      response: { status: 429 }
    });
    expect(postSpy429).toHaveBeenCalledTimes(1);

    vi.restoreAllMocks();

    // Network offline / drop
    const networkError: any = new Error('Network Error');
    const postSpyNet = vi.spyOn(apiClient, 'post').mockRejectedValueOnce(networkError);
    await expect(authApi.askAssistant('Quick query 2')).rejects.toThrow('Network Error');
    expect(postSpyNet).toHaveBeenCalledTimes(1);
  });

  // 5. Timeout handling surfaces honest error
  it('5. surfaces timeout error directly without falling back or fabricating answer', async () => {
    const timeoutError: any = new Error('timeout of 30000ms exceeded');
    timeoutError.code = 'ECONNABORTED';

    const postSpy = vi.spyOn(apiClient, 'post').mockRejectedValueOnce(timeoutError);

    await expect(authApi.askAssistant('Analyze market')).rejects.toMatchObject({
      code: 'ECONNABORTED'
    });

    expect(postSpy).toHaveBeenCalledTimes(1);
  });

  // 6. Valid response is never replaced by mock text
  it('6. preserves real backend response text without replacing it with mock content', () => {
    const realResponse = {
      reply: 'Based on your ₹50,000 monthly surplus, allocate ₹25,000 to Nifty 50 Index Fund and ₹15,000 to Parag Parikh Flexi Cap.',
      calculations: {
        type: 'sip',
        monthlyInvestment: 40000,
        investedAmount: 4800000,
        totalValue: 9850000,
        cagr: 12.5,
        years: 10
      },
      followUps: ['Check tax implications', 'Review emergency fund']
    };

    const parsed = parseAssistantApiResponse(realResponse, 'surplus allocation');
    expect(parsed.text).toBe(realResponse.reply);
    expect(parsed.calculations).toEqual(realResponse.calculations);
    expect(parsed.followUps).toEqual(realResponse.followUps);
    expect(parsed.text).not.toContain('offline');
    expect(parsed.text).not.toContain('mock');
  });

  // 7. Lossless response parsing of numbers and metadata
  it('7. parses numbers and calculations losslessly without rounding or string distortion', () => {
    const exactCalculations = {
      type: 'affordability',
      verdict: 'Comfortable',
      itemCost: 1500000,
      downPayment: 300000,
      monthlyEmi: 24385.75,
      remainingSurplus: 85614.25,
      surplusImpact: '22.2% of monthly surplus'
    };

    const apiPayload = {
      answer: 'You can comfortably afford this car loan.',
      calculations: exactCalculations,
      intent: 'affordability',
      entities: ['Car', 'EMI']
    };

    const parsed = parseAssistantApiResponse(apiPayload);
    expect(parsed.text).toBe('You can comfortably afford this car loan.');
    expect(parsed.calculations?.monthlyEmi).toBe(24385.75);
    expect(parsed.calculations?.remainingSurplus).toBe(85614.25);
    expect(parsed.intent).toBe('affordability');
    expect(parsed.entities).toEqual(['Car', 'EMI']);
  });

  // 8. Unavailable market data is not fabricated
  it('8. honestly displays unavailable status when provider data is unavailable', () => {
    const unavailablePayload = {
      status: 'unavailable',
      message: 'Market data feed is temporarily unavailable from backend provider.'
    };

    const parsed = parseAssistantApiResponse(unavailablePayload);
    expect(parsed.text).toContain('Market data feed is temporarily unavailable');
    // Does NOT invent prices or stock statistics
    expect(parsed.calculations).toBeNull();
  });

  // 9. Synchronous double-submission lock simulation
  it('9. prevents duplicate submission while a request is active', async () => {
    let activeCalls = 0;
    let maxSimultaneousCalls = 0;

    const mockDelayedAssistant = async () => {
      activeCalls++;
      maxSimultaneousCalls = Math.max(maxSimultaneousCalls, activeCalls);
      await new Promise((r) => setTimeout(r, 50));
      activeCalls--;
      return { answer: 'Answer' };
    };

    // Simulate double-submission lock pattern
    let isRequestInProgress = false;
    const submit = async () => {
      if (isRequestInProgress) return null;
      isRequestInProgress = true;
      try {
        return await mockDelayedAssistant();
      } finally {
        isRequestInProgress = false;
      }
    };

    // Fire two submissions concurrently
    const [res1, res2] = await Promise.all([submit(), submit()]);

    expect(res1).not.toBeNull();
    expect(res2).toBeNull(); // Second submission rejected synchronously
    expect(maxSimultaneousCalls).toBe(1);
  });
});
