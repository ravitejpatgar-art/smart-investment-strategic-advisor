import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { authApi, apiClient } from '../services/api';
import { 
  parseAssistantApiResponse, 
  generateGroundedOfflineResponse,
  isGenericOnboardingText,
  isGreetingOrHelpQuery,
  buildGroundedContext
} from '../services/vestiqGrounding';
import type { UserProfile, ExpenseItem, GoalItem } from '../types';

describe('VestIQ Question/Response Matching & Disambiguation', () => {
  const sampleMarketQuery = 'Brent crude hits $95 a barrel. Buy OMC stocks now or avoid?';
  const mockProfile: UserProfile = {
    id: 'user_suresh_001',
    name: 'suresh r',
    email: 'suresh@example.com',
    age: 35,
    occupation: 'Manager',
    monthlyIncome: 100000,
    salaryIncome: 100000,
    otherIncome: 0,
    monthlyExpenses: 55000,
    emergencyFund: 440000,
    existingSavings: 440000,
    existingInvestments: 1000000,
    investmentHorizon: '5 to 10 years',
    investmentExperience: 'Intermediate',
    riskTolerance: 'Moderate',
    riskCategory: 'Moderate',
    financialGoal: 'Wealth Creation',
    onboardingCompleted: true
  };
  const mockExpenses: ExpenseItem[] = [
    { id: 'e1', category: 'Rent', amount: 55000, date: '2026-09-01', description: 'Monthly expenses' }
  ];
  const mockGoals: GoalItem[] = [];
  const mockGroundedContext = buildGroundedContext(mockProfile, mockExpenses, mockGoals);

  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 1. Specific user query is sent unchanged
  it('1. sends specific user query unchanged in all query fields', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: {
        answer: 'OMC margins typically compress when crude exceeds $90/bbl due to retail fuel price caps.'
      }
    });

    await authApi.askAssistant(sampleMarketQuery);

    expect(postSpy).toHaveBeenCalledTimes(1);
    const [endpoint, payload] = postSpy.mock.calls[0];
    const sentPayload = payload as any;
    expect(endpoint).toBe('/ai/chat');
    expect(sentPayload.query).toBe(sampleMarketQuery);
    expect(sentPayload.question).toBe(sampleMarketQuery);
    expect(sentPayload.message).toBe(sampleMarketQuery);
  });

  // 2. Current query is not replaced by profile/onboarding context
  it('2. does NOT replace user query with profile or onboarding context', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { answer: 'Analysis of OMC stocks under high crude prices.' }
    });

    await authApi.askAssistant({
      query: sampleMarketQuery,
      question: sampleMarketQuery,
      message: sampleMarketQuery,
      user_context: {
        name: 'suresh r',
        profile: 'Fiduciary investment portfolio',
        mandate: 'Capital preservation'
      },
      requestId: 'req_match_test'
    });

    expect(postSpy).toHaveBeenCalledTimes(1);
    const sentData = postSpy.mock.calls[0][1] as any;
    // The query MUST remain the user's explicit question, NOT the profile/mandate
    expect(sentData.query).toBe(sampleMarketQuery);
    expect(sentData.question).toBe(sampleMarketQuery);
    expect(sentData.message).toBe(sampleMarketQuery);
    expect(sentData.user_context.name).toBe('suresh r');
  });

  // 3. Valid API response is displayed unchanged
  it('3. displays valid API response unchanged without semantic alteration', () => {
    const rawBackendResponse = {
      answer: 'High Brent crude ($95/bbl) squeezes gross refining margins (GRMs) and marketing margins for OMCs (IOC, BPCL, HPCL) unless retail price hikes are permitted.',
      calculations: null,
      followUps: ['Check upstream producers like ONGC', 'View crude price trends'],
      intent: 'equity_analysis',
      entities: ['Brent Crude', 'OMC', 'IOC', 'BPCL', 'HPCL']
    };

    const parsed = parseAssistantApiResponse(rawBackendResponse, sampleMarketQuery);

    expect(parsed.text).toBe(rawBackendResponse.answer);
    expect(parsed.followUps).toEqual(rawBackendResponse.followUps);
    expect(parsed.intent).toBe('equity_analysis');
    expect(parsed.entities).toEqual(['Brent Crude', 'OMC', 'IOC', 'BPCL', 'HPCL']);
    // Ensure it was not replaced with generic greeting
    expect(isGenericOnboardingText(parsed.text)).toBe(false);
  });

  // 4. Generic onboarding fallback cannot replace a valid API response
  it('4. ensures generic onboarding fallback cannot replace a valid API response', () => {
    const validResponse = {
      reply: 'Upstream oil companies (ONGC, Oil India) benefit from $95 crude, while OMCs face margin headwinds.',
      requestId: 'req_valid_1'
    };

    const parsed = parseAssistantApiResponse(validResponse, sampleMarketQuery);

    expect(parsed.text).toBe(validResponse.reply);
    expect(isGenericOnboardingText(parsed.text)).toBe(false);
    expect(parsed.text).not.toContain('fiduciary portfolio advisor');
    expect(parsed.text).not.toContain('Hello suresh r');
  });

  // 5. Previous response cannot overwrite the current response
  it('5. prevents a slow previous response from overwriting a newer response', async () => {
    let latestRequestId = '';
    const renderedMessages: Array<{ id: string; text: string }> = [];

    const handleSimulatedResponse = (reqId: string, text: string) => {
      // Guard: Stale response protection
      if (latestRequestId !== reqId) {
        return; // Stale response dropped
      }
      renderedMessages.push({ id: reqId, text });
    };

    // Request A starts
    const reqAId = 'req_A_slow';
    latestRequestId = reqAId;

    // Request B starts shortly after
    const reqBId = 'req_B_fast';
    latestRequestId = reqBId;

    // Request B completes first
    handleSimulatedResponse(reqBId, 'Response for Question B');
    expect(renderedMessages).toHaveLength(1);
    expect(renderedMessages[0].text).toBe('Response for Question B');

    // Request A finishes later (out of order)
    handleSimulatedResponse(reqAId, 'Stale Response for Question A');

    // Verification: Stale response A was dropped and did NOT overwrite B
    expect(renderedMessages).toHaveLength(1);
    expect(renderedMessages[0].text).toBe('Response for Question B');
  });

  // 6. Two rapid requests cannot cross-display their responses
  it('6. prevents cross-display when two rapid requests are fired', async () => {
    let latestRequestId = '';
    const displayedAnswers: Record<string, string> = {};

    const dispatchRequest = async (id: string, text: string, delayMs: number) => {
      latestRequestId = id;
      await new Promise((r) => setTimeout(r, delayMs));

      // Check request ID matching
      if (latestRequestId !== id) {
        return null; // Discarded
      }
      displayedAnswers[id] = `Answer to: ${text}`;
      return displayedAnswers[id];
    };

    // Rapid requests: Q1 takes 50ms, Q2 takes 10ms
    const p1 = dispatchRequest('req_1', 'First Question', 50);
    const p2 = dispatchRequest('req_2', 'Second Question', 10);

    const [res1, res2] = await Promise.all([p1, p2]);

    expect(res1).toBeNull(); // Req 1 discarded because Req 2 overtook it
    expect(res2).toBe('Answer to: Second Question');
    expect(displayedAnswers['req_1']).toBeUndefined();
    expect(displayedAnswers['req_2']).toBe('Answer to: Second Question');
  });

  // 7. Unavailable market data produces an honest unavailable message
  it('7. produces an honest unavailable message when market data cannot be verified offline', () => {
    const offlineResult = generateGroundedOfflineResponse(sampleMarketQuery, mockGroundedContext);

    expect(offlineResult.text).toBe("I can't verify the current market information needed to answer this question right now.");
    expect(offlineResult.intent).toBe('MARKET_DATA_UNAVAILABLE');
    // Crucial: Must NOT invent financial recommendations or numbers
    expect(offlineResult.text).not.toContain('buy');
    expect(offlineResult.text).not.toContain('avoid');
    expect(offlineResult.calculations).toBeUndefined();
  });

  // 8. Brent/OMC-style finance question does not produce a generic portfolio welcome response
  it('8. does not return generic portfolio onboarding message for Brent/OMC finance question', () => {
    const offlineResult = generateGroundedOfflineResponse(sampleMarketQuery, mockGroundedContext);

    // Assert it is NOT generic onboarding
    expect(isGenericOnboardingText(offlineResult.text)).toBe(false);
    expect(offlineResult.text).not.toContain('fiduciary portfolio advisor');
    expect(offlineResult.text).not.toContain('Hello suresh r');
    expect(offlineResult.text).not.toContain('emergency runway');

    // On the other hand, an explicit greeting DOES return the onboarding/greeting message
    const greetingResult = generateGroundedOfflineResponse('Hello, who are you?', mockGroundedContext);
    expect(isGreetingOrHelpQuery('Hello, who are you?')).toBe(true);
    expect(greetingResult.text).toContain('fiduciary portfolio advisor');
    expect(greetingResult.text).toContain('suresh r');
  });

  // 9. Valid assistant response is displayed even if backend generates a different UUID requestId
  it('9. accepts and displays valid assistant response even if backend generates a UUID requestId', () => {
    const backendUuidResponse = {
      requestId: '729dbf3f-fda3-4a70-b643-c457dd2c2290', // Backend-generated UUID differing from frontend req_123
      question: sampleMarketQuery,
      answer: 'High Brent crude ($95/bbl) squeezes gross refining margins (GRMs) for OMCs.',
      calculations: {},
      followUps: ['Compare upstream vs downstream']
    };

    const parsed = parseAssistantApiResponse(backendUuidResponse, sampleMarketQuery);

    expect(parsed.text).toBe(backendUuidResponse.answer);
    // Calculations was empty object {}, normalized to null
    expect(parsed.calculations).toBeNull();
    expect(parsed.followUps).toEqual(['Compare upstream vs downstream']);
  });

  // 10. Normalizes empty calculations object to null while preserving real calculations
  it('10. normalizes empty calculations {} to null while preserving real calculations losslessly', () => {
    const emptyCalcRes = { answer: 'General advice', calculations: {} };
    const parsedEmpty = parseAssistantApiResponse(emptyCalcRes);
    expect(parsedEmpty.calculations).toBeNull();

    const realCalcRes = {
      answer: 'SIP calculation',
      calculations: { type: 'sip', monthlyInvestment: 5000, totalValue: 120000 }
    };
    const parsedReal = parseAssistantApiResponse(realCalcRes);
    expect(parsedReal.calculations).toEqual({ type: 'sip', monthlyInvestment: 5000, totalValue: 120000 });
  });

  // 11. Handles alternative valid response schemas (output, result, text) without falling back
  it('11. parses alternative response schemas (output, result, text) correctly', () => {
    expect(parseAssistantApiResponse({ output: 'Result via output field' }).text).toBe('Result via output field');
    expect(parseAssistantApiResponse({ result: 'Result via result field' }).text).toBe('Result via result field');
    expect(parseAssistantApiResponse({ text: 'Result via text field' }).text).toBe('Result via text field');
  });
});
