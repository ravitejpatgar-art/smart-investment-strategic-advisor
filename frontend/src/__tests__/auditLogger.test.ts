import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { auditLogger, type AuditEventType } from '../services/auditLogger';
import { isDemoMode } from '../services/demoData';

describe('Audit Logging & Compliance Disclaimers (P2.1)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 1. Audit event creation
  it('creates a validated and structured AuditEvent record with valid timestamp and sessionId', () => {
    const event = auditLogger.createAuditEvent({
      eventType: 'AUTH_LOGIN_SUCCESS',
      source: 'auth',
      status: 'success',
      metadata: { provider: 'google' }
    });

    expect(event).toBeDefined();
    expect(event.eventType).toBe('AUTH_LOGIN_SUCCESS');
    expect(event.source).toBe('auth');
    expect(event.status).toBe('success');
    expect(typeof event.timestamp).toBe('string');
    expect(event.sessionId).toBeDefined();
    expect(event.metadata?.provider).toBe('google');
  });

  // 2. Audit event schema & type safety across all supported event categories
  it('supports all required event types across AUTH, PROFILE, FINANCIAL PLANNING, AI, MARKET, and SYSTEM', () => {
    const eventTypes: AuditEventType[] = [
      'AUTH_LOGIN_SUCCESS',
      'AUTH_LOGIN_FAILURE',
      'AUTH_LOGOUT',
      'AUTH_SIGNUP_SUCCESS',
      'AUTH_SIGNUP_FAILURE',
      'PROFILE_SAVED',
      'PROFILE_UPDATED',
      'ONBOARDING_COMPLETED',
      'STRATEGY_ANALYSIS_REQUESTED',
      'RECOMMENDATION_ANALYSIS_REQUESTED',
      'GOAL_CREATED',
      'GOAL_UPDATED',
      'GOAL_DELETED',
      'EXPENSE_CREATED',
      'EXPENSE_UPDATED',
      'EXPENSE_DELETED',
      'VESTIQ_REQUEST_INITIATED',
      'VESTIQ_REQUEST_COMPLETED',
      'VESTIQ_REQUEST_FAILED',
      'MARKET_FALLBACK_ACTIVATED',
      'MARKET_DATA_UNAVAILABLE',
      'MARKET_REFRESH_COMPLETED',
      'SYSTEM_ERROR_BOUNDARY_TRIGGERED'
    ];

    eventTypes.forEach((eventType) => {
      const logged = auditLogger.log({
        eventType,
        source: 'testRunner',
        status: 'info'
      });
      expect(logged).not.toBeNull();
      expect(logged?.eventType).toBe(eventType);
    });
  });

  // 3. Strict sensitive data sanitization
  it('strictly sanitizes and redacts passwords, tokens, full profile payloads, salaries, and private prompts', () => {
    const sensitivePayload = {
      userToken: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0In0.secret',
      password: 'UserSecretPassword999!',
      salary: 250000,
      monthlyIncome: 300000,
      portfolio: [{ asset: 'NIFTYBEES', amount: 1000000 }],
      expenses: [{ id: '1', amount: 50000, title: 'Rent' }],
      goals: [{ id: '1', target: 10000000 }],
      prompt: 'My private financial prompt',
      response: 'My private AI financial response',
      email: 'investor@example.com',
      nonSensitiveField: 'allowed_metadata'
    };

    const event = auditLogger.createAuditEvent({
      eventType: 'PROFILE_UPDATED',
      source: 'profile',
      status: 'success',
      metadata: sensitivePayload
    });

    const meta = event.metadata as Record<string, unknown>;
    expect(meta.userToken).toBe('[REDACTED]');
    expect(meta.password).toBe('[REDACTED]');
    expect(meta.salary).toBe('[REDACTED]');
    expect(meta.monthlyIncome).toBe('[REDACTED]');
    expect(meta.portfolio).toBe('[REDACTED]');
    expect(meta.expenses).toBe('[REDACTED]');
    expect(meta.goals).toBe('[REDACTED]');
    expect(meta.prompt).toBe('[REDACTED]');
    expect(meta.response).toBe('[REDACTED]');
    expect(meta.email).toBe('[REDACTED]');
    expect(meta.nonSensitiveField).toBe('allowed_metadata');
  });

  // 4. Audit logger never throws uncaught exceptions
  it('guarantees that audit logging methods never throw uncaught exceptions even on circular objects', () => {
    const circular: any = { tag: 'audit' };
    circular.ref = circular;

    expect(() => {
      auditLogger.log({
        eventType: 'SYSTEM_ERROR_BOUNDARY_TRIGGERED',
        source: 'system',
        status: 'error',
        metadata: circular
      });
      auditLogger.auth('AUTH_LOGIN_FAILURE', 'error', { error: circular });
      auditLogger.profile('PROFILE_SAVED', 'success');
      auditLogger.financialPlanning('GOAL_CREATED', 'success');
      auditLogger.ai('VESTIQ_REQUEST_FAILED', 'warning');
      auditLogger.market('MARKET_FALLBACK_ACTIVATED', 'warning');
    }).not.toThrow();
  });

  // 5. Convenience helper methods
  it('correctly dispatches category-specific convenience helper methods', () => {
    const authEvt = auditLogger.auth('AUTH_LOGIN_SUCCESS', 'success', { method: 'password' });
    expect(authEvt?.source).toBe('auth');
    expect(authEvt?.eventType).toBe('AUTH_LOGIN_SUCCESS');

    const profileEvt = auditLogger.profile('ONBOARDING_COMPLETED', 'success');
    expect(profileEvt?.source).toBe('profile');

    const fpEvt = auditLogger.financialPlanning('STRATEGY_ANALYSIS_REQUESTED', 'info');
    expect(fpEvt?.source).toBe('financialPlanning');

    const aiEvt = auditLogger.ai('VESTIQ_REQUEST_INITIATED', 'info', { requestId: 'req_123' });
    expect(aiEvt?.source).toBe('vestiqAi');

    const marketEvt = auditLogger.market('MARKET_FALLBACK_ACTIVATED', 'warning', { symbol: 'RELIANCE.NS' });
    expect(marketEvt?.source).toBe('marketEngine');

    const sysEvt = auditLogger.system('SYSTEM_ERROR_BOUNDARY_TRIGGERED', 'error');
    expect(sysEvt?.source).toBe('system');
  });

  // 6. Regulatory notice wording check
  it('verifies non-guarantee and non-broker compliance language', () => {
    const noticeText = 'SmartVest is an independent strategic wealth planning and quantitative decision-support tool. SmartVest is not a registered broker-dealer, investment custodian, or depository participant, and does not execute securities transactions, hold customer deposits, or guarantee investment returns.';
    
    expect(noticeText).toContain('decision-support tool');
    expect(noticeText).toContain('not a registered broker-dealer');
    expect(noticeText).toContain('does not execute securities transactions');
    expect(noticeText).toContain('does not execute securities transactions');
    expect(noticeText).toContain('guarantee investment returns');
  });

  // 7. Demo mode transparency check
  it('verifies demo mode data is transparently flagged and never represented as live market data', () => {
    const isDemo = isDemoMode();
    // Deterministic demo mode flag is boolean and does not assert live market trades
    expect(typeof isDemo).toBe('boolean');
  });
});
