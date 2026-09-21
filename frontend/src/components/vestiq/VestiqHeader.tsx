import { 
  Plus, 
  ArrowLeft, 
  ShieldCheck, 
  Menu, 
  SlidersHorizontal,
  Copy,
  Download,
  Check,
  Loader2
} from 'lucide-react';
import { useFintechStore } from '../../store/useFintechStore';
import { VestiqLogo } from '../common/VestiqLogo';
import { ThemeToggle } from '../common';

interface VestiqHeaderProps {
  onNewAnalysis: () => void;
  onBackToSmartVest: () => void;
  onToggleSidebar?: () => void;
  onToggleContext?: () => void;
  onCopyChat?: () => void;
  onDownloadPdf?: () => void;
  hasMessages?: boolean;
  copiedChat?: boolean;
  isDownloadingPdf?: boolean;
}

export const VestiqHeader: React.FC<VestiqHeaderProps> = ({
  onNewAnalysis,
  onBackToSmartVest,
  onToggleSidebar,
  onToggleContext,
  onCopyChat,
  onDownloadPdf,
  hasMessages = false,
  copiedChat = false,
  isDownloadingPdf = false,
}) => {
  const { user } = useFintechStore();

  return (
    <header className="h-[60px] min-h-[60px] bg-[var(--color-surface)] border-b border-[var(--color-border)] text-[var(--color-text-primary)] px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 font-sans shadow-xs">
      
      {/* Left: Branding & Tagline */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-card)] border border-[var(--color-border)] cursor-pointer"
            title="Toggle Sessions Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <VestiqLogo size="md" subtitleText="PORTFOLIO ADVISORY" onClick={onBackToSmartVest} />
      </div>

      {/* Center / Context indicator (Desktop) */}
      <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]">
        <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-accent-strong)]" />
        <span>Portfolio Mandate: <strong className="text-[var(--color-text-primary)]">{user?.name || 'Investor'}</strong></span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        
        {/* Copy Chat Button */}
        {onCopyChat && (
          <button
            onClick={onCopyChat}
            disabled={!hasMessages}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[var(--color-card)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
            title="Copy entire conversation to clipboard"
            aria-label="Copy conversation"
          >
            {copiedChat ? (
              <Check className="w-3.5 h-3.5 text-[var(--color-accent-strong)]" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            )}
            <span className={copiedChat ? 'text-[var(--color-accent-strong)] font-bold' : 'hidden md:inline'}>
              {copiedChat ? 'Copied' : 'Copy Chat'}
            </span>
          </button>
        )}

        {/* Download PDF Button */}
        {onDownloadPdf && (
          <button
            onClick={onDownloadPdf}
            disabled={!hasMessages || isDownloadingPdf}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[var(--color-card)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
            title="Download conversation as PDF report"
            aria-label="Download conversation as PDF"
          >
            {isDownloadingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--color-accent-strong)]" />
            ) : (
              <Download className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            )}
            <span className="hidden md:inline">
              {isDownloadingPdf ? 'Preparing PDF...' : 'Download PDF'}
            </span>
          </button>
        )}

        {/* Global Theme Toggle */}
        <ThemeToggle variant="header" />

        {/* New Analysis Button */}
        <button
          onClick={onNewAnalysis}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--color-card)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-semibold transition-colors cursor-pointer"
          title="Start Fresh Analysis"
        >
          <Plus className="w-3.5 h-3.5 text-[var(--color-accent-strong)] stroke-[2.5]" />
          <span>New Session</span>
        </button>

        {/* Toggle Context Panel for small desktop/tablet */}
        {onToggleContext && (
          <button
            onClick={onToggleContext}
            className="xl:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-card)] border border-[var(--color-border)] cursor-pointer"
            title="Toggle SmartVest Context"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        )}

        {/* Back to SmartVest Button */}
        <button
          onClick={onBackToSmartVest}
          className="px-3.5 py-1.5 rounded-lg bg-[var(--color-accent)] hover:opacity-90 text-[var(--color-accent-text)] font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          title="Return to Main SmartVest Dashboard"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Dashboard</span>
        </button>

      </div>

    </header>
  );
};
