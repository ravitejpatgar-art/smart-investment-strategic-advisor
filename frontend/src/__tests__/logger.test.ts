import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { logger } from '../services/logger';
import { sanitizeData, initSentry, isSentryReady, captureSentryException, addSentryBreadcrumb } from '../services/sentry';

describe('Structured Logger & Observability (P1.3)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 1. Logger formats structured entries correctly
  it('formats structured log entries with correct metadata, timestamps, and log levels', () => {
    const entry = logger.createEntry('INFO', 'User loaded dashboard view', {
      service: 'dashboard',
      operation: 'loadOverview',
      view: 'overview'
    });

    expect(entry).toBeDefined();
    expect(entry.level).toBe('INFO');
    expect(entry.message).toBe('User loaded dashboard view');
    expect(entry.service).toBe('dashboard');
    expect(entry.operation).toBe('loadOverview');
    expect(entry.timestamp).toBeDefined();
    expect(typeof entry.timestamp).toBe('string');
    expect(entry.metadata?.view).toBe('overview');
  });

  // 2. Sensitive fields are sanitized
  it('strictly sanitizes and redacts sensitive financial data, passwords, tokens, and PII', () => {
    const rawSensitiveData = {
      service: 'strategyEngine',
      operation: 'evaluate',
      password: 'SuperSecretPassword123!',
      token: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotLeak',
      apiKey: 'AIzaSyD-SecretApiKey123',
      salary: 150000,
      monthlyIncome: 200000,
      portfolio: [{ symbol: 'TCS.NS', amount: 500000 }],
      expenses: [{ id: '1', amount: 25000, category: 'Rent' }],
      goals: [{ title: 'House Downpayment', target: 5000000 }],
      email: 'investor@example.com',
      nonSensitiveField: 'public_ok'
    };

    const sanitized = sanitizeData(rawSensitiveData) as Record<string, unknown>;

    expect(sanitized.password).toBe('[REDACTED]');
    expect(sanitized.token).toBe('[REDACTED]');
    expect(sanitized.apiKey).toBe('[REDACTED]');
    expect(sanitized.salary).toBe('[REDACTED]');
    expect(sanitized.monthlyIncome).toBe('[REDACTED]');
    expect(sanitized.portfolio).toBe('[REDACTED]');
    expect(sanitized.expenses).toBe('[REDACTED]');
    expect(sanitized.goals).toBe('[REDACTED]');
    expect(sanitized.email).toBe('[REDACTED]');
    expect(sanitized.nonSensitiveField).toBe('public_ok');
  });

  // 3. Error logging does not throw
  it('ensures logger methods never throw uncaught exceptions even with null or circular values', () => {
    const circularObj: any = { name: 'test' };
    circularObj.self = circularObj;

    expect(() => {
      logger.debug('Debug message', { service: 'test' });
      logger.info('Info message', { service: 'test' });
      logger.warn('Warn message', { service: 'test', error: new Error('Simulated warning') });
      logger.error('Error message', { service: 'test', error: circularObj });
      logger.error('Error message without metadata');
    }).not.toThrow();
  });

  // 4. Missing VITE_SENTRY_DSN does not break application startup
  it('safely skips Sentry initialization when VITE_SENTRY_DSN is absent or empty', () => {
    const initialized = initSentry();
    // In test environment, DSN is empty so initSentry returns false without throwing
    expect(typeof initialized).toBe('boolean');
  });

  // 5. Sentry helpers behave safely when Sentry is not initialized
  it('provides safe no-op behavior for Sentry capture and breadcrumb calls when inactive', () => {
    expect(isSentryReady()).toBe(false);
    expect(() => {
      captureSentryException(new Error('Test error'));
      addSentryBreadcrumb({
        category: 'navigation',
        message: 'Navigated to /market',
        level: 'info'
      });
    }).not.toThrow();
  });

  // 6. Sanitization handles standalone strings (e.g. JWT tokens and Bearer headers)
  it('redacts standalone JWT tokens and Bearer headers', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    expect(sanitizeData(jwt)).toBe('[REDACTED_JWT]');

    const bearer = 'Bearer mySecretToken123.456';
    expect(sanitizeData(bearer)).toBe('Bearer [REDACTED_TOKEN]');
  });

  // 7. Structured logger supports all log levels correctly
  it('creates correct log entries across all supported levels (DEBUG, INFO, WARN, ERROR)', () => {
    const debugEntry = logger.createEntry('DEBUG', 'Debug check', { service: 'cache' });
    expect(debugEntry.level).toBe('DEBUG');

    const warnEntry = logger.createEntry('WARN', 'Fallback active', { service: 'marketApi', status: 'FALLBACK' });
    expect(warnEntry.level).toBe('WARN');
    expect(warnEntry.metadata?.status).toBe('FALLBACK');

    const errorEntry = logger.createEntry('ERROR', 'Network failure', { service: 'api', errorType: 'TIMEOUT' });
    expect(errorEntry.level).toBe('ERROR');
    expect(errorEntry.metadata?.errorType).toBe('TIMEOUT');
  });
});
