import { Component, type ReactNode, type ErrorInfo } from 'react';
import { logger } from '../../services/logger';
import { auditLogger } from '../../services/auditLogger';
import { captureSentryException } from '../../services/sentry';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('Unhandled React render error captured by ErrorBoundary', {
      service: 'ErrorBoundary',
      operation: 'render',
      error: error.message
    });

    auditLogger.system('SYSTEM_ERROR_BOUNDARY_TRIGGERED', 'error', {
      errorType: error.name || 'RenderError'
    });

    captureSentryException(error, {
      componentStack: errorInfo.componentStack
    });
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/dashboard';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#050814] text-white flex items-center justify-center p-4 font-sans antialiased">
          <div className="max-w-md w-full bg-[#101827] border border-white/[0.08] rounded-xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-white tracking-tight">
                System Interface Paused
              </h2>
              <p className="text-xs text-[#8A94A6] leading-relaxed">
                An unexpected interface state occurred. Your financial profile and secure session data remain completely safe.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#00D4AA] text-[#050816] font-bold text-xs hover:bg-[#00D4AA]/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Application</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#0A1022] hover:bg-[#141F36] text-white border border-white/[0.08] font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-[#8A94A6]" />
                <span>Return to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
