import { sanitizeData, addSentryBreadcrumb, isSentryReady } from './sentry';
import { logger } from './logger';

export type AuditEventType =
  // Auth Events
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILURE'
  | 'AUTH_LOGOUT'
  | 'AUTH_SIGNUP_SUCCESS'
  | 'AUTH_SIGNUP_FAILURE'
  // Profile & Onboarding Events
  | 'PROFILE_SAVED'
  | 'PROFILE_UPDATED'
  | 'ONBOARDING_COMPLETED'
  // Financial Planning Events
  | 'STRATEGY_ANALYSIS_REQUESTED'
  | 'RECOMMENDATION_ANALYSIS_REQUESTED'
  | 'GOAL_CREATED'
  | 'GOAL_UPDATED'
  | 'GOAL_DELETED'
  | 'EXPENSE_CREATED'
  | 'EXPENSE_UPDATED'
  | 'EXPENSE_DELETED'
  // AI & Advisory Events
  | 'VESTIQ_REQUEST_INITIATED'
  | 'VESTIQ_REQUEST_COMPLETED'
  | 'VESTIQ_REQUEST_FAILED'
  // Market Events
  | 'MARKET_FALLBACK_ACTIVATED'
  | 'MARKET_DATA_UNAVAILABLE'
  | 'MARKET_REFRESH_COMPLETED'
  | 'SCENARIO_ANALYSIS_RUN'
  | 'REBALANCE_ANALYSIS_RUN'
  // System Events
  | 'SYSTEM_ERROR_BOUNDARY_TRIGGERED';

export type AuditEventStatus = 'success' | 'warning' | 'error' | 'info';

export interface AuditEvent {
  eventType: AuditEventType;
  timestamp: string;
  source: string;
  status: AuditEventStatus;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogOptions {
  eventType: AuditEventType;
  source: string;
  status?: AuditEventStatus;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

class AuditLoggerService {
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Creates a validated and strictly sanitized AuditEvent record.
   */
  public createAuditEvent(options: AuditLogOptions): AuditEvent {
    const rawStatus: AuditEventStatus = options.status || 'info';
    const sanitizedMetadata = options.metadata
      ? (sanitizeData(options.metadata) as Record<string, unknown>)
      : undefined;

    return {
      eventType: options.eventType,
      timestamp: new Date().toISOString(),
      source: options.source || 'system',
      status: rawStatus,
      sessionId: options.sessionId || this.sessionId,
      metadata: sanitizedMetadata
    };
  }

  /**
   * Records a security, compliance, or critical lifecycle audit event.
   * Guaranteed to never throw uncaught errors or block application execution.
   */
  public log(options: AuditLogOptions): AuditEvent | null {
    try {
      const event = this.createAuditEvent(options);

      // 1. Forward to structured logger
      const logMetadata = {
        service: 'Audit',
        operation: event.eventType,
        source: event.source,
        status: event.status,
        sessionId: event.sessionId,
        ...event.metadata
      };

      if (event.status === 'error') {
        logger.error(`[AUDIT] ${event.eventType}`, logMetadata);
      } else if (event.status === 'warning') {
        logger.warn(`[AUDIT] ${event.eventType}`, logMetadata);
      } else {
        logger.info(`[AUDIT] ${event.eventType}`, logMetadata);
      }

      // 2. Record Sentry telemetry breadcrumb if active
      if (isSentryReady()) {
        addSentryBreadcrumb({
          category: 'audit',
          message: `${event.source}: ${event.eventType}`,
          level: event.status === 'error' ? 'error' : event.status === 'warning' ? 'warning' : 'info',
          data: {
            eventType: event.eventType,
            status: event.status,
            source: event.source,
            sessionId: event.sessionId,
            ...event.metadata
          }
        });
      }

      return event;
    } catch {
      // Fail-safe: Audit logging MUST never break user operations
      return null;
    }
  }

  // Convenience helper methods
  public auth(eventType: AuditEventType, status: AuditEventStatus = 'info', metadata?: Record<string, unknown>): AuditEvent | null {
    return this.log({ eventType, source: 'auth', status, metadata });
  }

  public profile(eventType: AuditEventType, status: AuditEventStatus = 'info', metadata?: Record<string, unknown>): AuditEvent | null {
    return this.log({ eventType, source: 'profile', status, metadata });
  }

  public financialPlanning(eventType: AuditEventType, status: AuditEventStatus = 'info', metadata?: Record<string, unknown>): AuditEvent | null {
    return this.log({ eventType, source: 'financialPlanning', status, metadata });
  }

  public ai(eventType: AuditEventType, status: AuditEventStatus = 'info', metadata?: Record<string, unknown>): AuditEvent | null {
    return this.log({ eventType, source: 'vestiqAi', status, metadata });
  }

  public market(eventType: AuditEventType, status: AuditEventStatus = 'info', metadata?: Record<string, unknown>): AuditEvent | null {
    return this.log({ eventType, source: 'marketEngine', status, metadata });
  }

  public system(eventType: AuditEventType, status: AuditEventStatus = 'info', metadata?: Record<string, unknown>): AuditEvent | null {
    return this.log({ eventType, source: 'system', status, metadata });
  }
}

export const auditLogger = new AuditLoggerService();
