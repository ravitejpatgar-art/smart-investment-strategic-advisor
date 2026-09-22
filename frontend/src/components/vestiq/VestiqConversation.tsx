import React, { useRef, useEffect } from 'react';
import { 
  Loader2, 
  RotateCcw, 
  AlertCircle
} from 'lucide-react';
import { VestiqMessage, type VestiqChatMessage } from './VestiqMessage';
import { VestiqInput } from './VestiqInput';

interface VestiqConversationProps {
  messages: VestiqChatMessage[];
  loading: boolean;
  error?: string | null;
  onSend: (text: string) => void;
  onClear: () => void;
  onRetry?: () => void;
  onNewAnalysis: () => void;
  onEditMessage?: (messageId: string, newText: string) => void;
  onDeleteMessage?: (messageId: string) => void;
}

export const VestiqConversation: React.FC<VestiqConversationProps> = ({
  messages,
  loading,
  error,
  onSend,
  onClear,
  onRetry,
  onNewAnalysis,
  onEditMessage,
  onDeleteMessage,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex flex-col h-full w-full max-w-[880px] mx-auto font-sans">
      
      {/* Conversation Subheader */}
      <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-[var(--color-border-subtle)] shrink-0 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse motion-reduce:animate-none" />
          <span className="font-bold text-[var(--color-text-secondary)] uppercase tracking-wider text-[11px]">
            Active Advisory Thread
          </span>
        </div>

        <button
          onClick={onClear}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] rounded px-1.5 py-0.5"
          title="Clear Conversation Thread"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Thread</span>
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 py-2 pr-1 scrollbar-thin">
        {messages.map((msg) => (
          <VestiqMessage
            key={msg.id}
            message={msg}
            onSelectFollowUp={(prompt) => !loading && onSend(prompt)}
            onEdit={onEditMessage}
            onDelete={onDeleteMessage}
            loading={loading}
          />
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] max-w-[340px] shadow-sm animate-fade-in">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-teal-dim)] border border-[var(--border-accent)] flex items-center justify-center text-[var(--color-accent-strong)] shrink-0">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--color-accent-strong)]" />
            </div>
            <div className="space-y-0.5">
              <div className="text-[13px] font-bold text-[var(--color-text-primary)]">
                VestIQ is analyzing...
              </div>
              <div className="text-[11.5px] text-[var(--color-text-muted)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse motion-reduce:animate-none" />
                <span>Evaluating portfolio & market data</span>
              </div>
            </div>
          </div>
        )}

        {/* Error State with Retry */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-rose-500 space-y-2.5 animate-fade-in shadow-xs">
            <div className="flex items-center gap-2 font-bold text-[13.5px] text-rose-500">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>VestIQ couldn't complete that request.</span>
            </div>
            <p className="text-[12.5px] text-[var(--color-text-secondary)] leading-relaxed">
              {error || 'An unexpected connection issue occurred while communicating with the advisory engine.'}
            </p>
            <div className="flex items-center gap-2 pt-1">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  Retry
                </button>
              )}
              <button
                onClick={onNewAnalysis}
                className="px-3.5 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-semibold hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              >
                Start New Analysis
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Bottom Composer */}
      <div className="pt-3 shrink-0">
        <VestiqInput
          onSend={onSend}
          loading={loading}
          placeholder="Ask a follow-up, or explore a new financial topic..."
        />
      </div>

    </div>
  );
};
