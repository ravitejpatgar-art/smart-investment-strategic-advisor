import * as Sentry from '@sentry/react';

let isInitialized = false;

// List of keys to scrub/redact from any telemetry payload
const SENSITIVE_KEY_PATTERNS = [
  /pass(word)?/i,
  /token/i,
  /secret/i,
  /auth(orization)?/i,
  /key/i,
  /api[-_]?key/i,
  /bearer/i,
  /salary/i,
  /income/i,
  /expense(s)?/i,
  /portfolio/i,
  /holding(s)?/i,
  /goal(s)?/i,
  /balance/i,
  /account/i,
  /credit/i,
  /card/i,
  /pan/i,
  /aadhaar/i,
  /prompt/i,
  /response/i,
  /message(s)?/i,
  /email/i
];

/**
 * Recursively sanitizes any object or array to ensure no sensitive financial data,
 * credentials, or PII are transmitted to external monitoring.
 */
export function sanitizeData(data: unknown, depth = 0): unknown {
  if (depth > 5 || data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    // Redact JWT-like strings
    if (/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(data)) {
      return '[REDACTED_JWT]';
    }
    // Redact bearer tokens
    if (/^Bearer\s+[A-Za-z0-9-_.]+$/i.test(data)) {
      return 'Bearer [REDACTED_TOKEN]';
    }
    return data;
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item, depth + 1));
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
      const isSensitive = SENSITIVE_KEY_PATTERNS.some((pat) => pat.test(k));
      if (isSensitive) {
        sanitized[k] = '[REDACTED]';
      } else {
        sanitized[k] = sanitizeData(v, depth + 1);
      }
    }
    return sanitized;
  }

  return String(data);
}

/**
 * Initializes Sentry monitoring safely if VITE_SENTRY_DSN is configured.
 * Degrades to a safe no-op when DSN is absent.
 */
export function initSentry(): boolean {
  if (isInitialized) return true;

  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn || typeof dsn !== 'string' || dsn.trim() === '') {
    return false;
  }

  try {
    const environment = import.meta.env.MODE || (import.meta.env.PROD ? 'production' : 'development');
    const release = 'smartvest@1.0.0';

    Sentry.init({
      dsn: dsn.trim(),
      environment,
      release,
      tracesSampleRate: import.meta.env.PROD ? 0.05 : 0.1,
      // Strictly avoid session replay to protect user privacy
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      beforeSend(event) {
        // Strip IP and PII user details
        if (event.user) {
          event.user = { id: event.user.id ? '[ANONYMIZED_SESSION]' : undefined };
        }

        // Sanitize breadcrumb data
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.map((b) => ({
            ...b,
            data: b.data ? (sanitizeData(b.data) as Record<string, unknown>) : undefined
          }));
        }

        // Sanitize extra context
        if (event.extra) {
          event.extra = sanitizeData(event.extra) as Record<string, unknown>;
        }

        return event;
      }
    });

    isInitialized = true;
    return true;
  } catch {
    // Fail-safe: never crash application initialization due to monitoring failure
    isInitialized = false;
    return false;
  }
}

export function isSentryReady(): boolean {
  return isInitialized;
}

export function captureSentryException(error: unknown, context?: Record<string, unknown>): void {
  if (!isInitialized) return;
  try {
    const sanitizedContext = context ? (sanitizeData(context) as Record<string, unknown>) : undefined;
    if (error instanceof Error) {
      Sentry.captureException(error, { extra: sanitizedContext });
    } else {
      Sentry.captureMessage(String(error), { level: 'error', extra: sanitizedContext });
    }
  } catch {
    // Silent fail-safe
  }
}

export function addSentryBreadcrumb(breadcrumb: {
  category: string;
  message: string;
  level?: 'info' | 'warning' | 'error' | 'debug';
  data?: Record<string, unknown>;
}): void {
  if (!isInitialized) return;
  try {
    Sentry.addBreadcrumb({
      category: breadcrumb.category,
      message: breadcrumb.message,
      level: breadcrumb.level || 'info',
      data: breadcrumb.data ? (sanitizeData(breadcrumb.data) as Record<string, unknown>) : undefined
    });
  } catch {
    // Silent fail-safe
  }
}
