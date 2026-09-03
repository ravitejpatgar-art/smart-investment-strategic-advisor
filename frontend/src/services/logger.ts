import { sanitizeData, captureSentryException, addSentryBreadcrumb, isSentryReady } from './sentry';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogMetadata {
  service?: string;
  operation?: string;
  status?: string;
  error?: unknown;
  errorType?: string;
  durationMs?: number;
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  service?: string;
  operation?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

class StructuredLogger {
  private isDevelopment: boolean;

  constructor() {
    try {
      this.isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
    } catch {
      this.isDevelopment = false;
    }
  }

  public createEntry(level: LogLevel, message: string, metadata?: LogMetadata): LogEntry {
    const sanitized = metadata ? (sanitizeData(metadata) as Record<string, unknown>) : undefined;
    return {
      level,
      message,
      service: typeof metadata?.service === 'string' ? metadata.service : undefined,
      operation: typeof metadata?.operation === 'string' ? metadata.operation : undefined,
      timestamp: new Date().toISOString(),
      metadata: sanitized
    };
  }

  public debug(message: string, metadata?: LogMetadata): void {
    if (!this.isDevelopment) return;
    try {
      const entry = this.createEntry('DEBUG', message, metadata);
      const prefix = entry.service ? `[SmartVest:DEBUG][${entry.service}]` : '[SmartVest:DEBUG]';
      if (entry.metadata && Object.keys(entry.metadata).length > 0) {
        console.debug(`${prefix} ${message}`, entry.metadata);
      } else {
        console.debug(`${prefix} ${message}`);
      }
    } catch {
      // Fail-safe
    }
  }

  public info(message: string, metadata?: LogMetadata): void {
    try {
      const entry = this.createEntry('INFO', message, metadata);
      const prefix = entry.service ? `[SmartVest:INFO][${entry.service}]` : '[SmartVest:INFO]';

      if (this.isDevelopment) {
        if (entry.metadata && Object.keys(entry.metadata).length > 0) {
          console.info(`${prefix} ${message}`, entry.metadata);
        } else {
          console.info(`${prefix} ${message}`);
        }
      }

      if (isSentryReady()) {
        addSentryBreadcrumb({
          category: entry.service || 'app',
          message: entry.message,
          level: 'info',
          data: entry.metadata
        });
      }
    } catch {
      // Fail-safe
    }
  }

  public warn(message: string, metadata?: LogMetadata): void {
    try {
      const entry = this.createEntry('WARN', message, metadata);
      const prefix = entry.service ? `[SmartVest:WARN][${entry.service}]` : '[SmartVest:WARN]';

      if (this.isDevelopment) {
        if (entry.metadata && Object.keys(entry.metadata).length > 0) {
          console.warn(`${prefix} ${message}`, entry.metadata);
        } else {
          console.warn(`${prefix} ${message}`);
        }
      }

      if (isSentryReady()) {
        addSentryBreadcrumb({
          category: entry.service || 'app',
          message: entry.message,
          level: 'warning',
          data: entry.metadata
        });
      }
    } catch {
      // Fail-safe
    }
  }

  public error(message: string, metadata?: LogMetadata): void {
    try {
      const entry = this.createEntry('ERROR', message, metadata);
      const prefix = entry.service ? `[SmartVest:ERROR][${entry.service}]` : '[SmartVest:ERROR]';

      if (this.isDevelopment) {
        if (entry.metadata && Object.keys(entry.metadata).length > 0) {
          console.error(`${prefix} ${message}`, entry.metadata);
        } else {
          console.error(`${prefix} ${message}`);
        }
      }

      if (isSentryReady()) {
        addSentryBreadcrumb({
          category: entry.service || 'app',
          message: entry.message,
          level: 'error',
          data: entry.metadata
        });

        const errorObj = metadata?.error || new Error(message);
        captureSentryException(errorObj, entry.metadata);
      }
    } catch {
      // Fail-safe
    }
  }
}

export const logger = new StructuredLogger();
