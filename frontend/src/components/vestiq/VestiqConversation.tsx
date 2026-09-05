import React, { useRef, useEffect } from 'react';
import { 
  Sparkles, 
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
}

export const VestiqConversation: React.FC<VestiqConversationProps> = ({
  messages,
  loading,
  error,
  onSend,
  onClear,
  onRetry,
  onNewAnalysis,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex flex-col h-full w-full max-w-[880px] mx-auto font-sans">
      
      {/* Conversation Subheader */}
      <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-[#E2E8F0] shrink-0 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse motion-reduce:animate-none" />
          <span className="font-bold text-[#475569] uppercase tracking-wider text-[11px]">
            Active Financial Intelligence Thread
          </span>
        </div>

        <button
          onClick={onClear}
          className="text-[#64748B] hover:text-[#0F172A] flex items-center gap-1.5 font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 rounded px-1.5 py-0.5"
          title="Clear Conversation Thread"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Thread</span>
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1 scrollbar-thin">
        {messages.map((msg) => (
          <VestiqMessage
            key={msg.id}
            message={msg}
            onSelectFollowUp={(prompt) => onSend(prompt)}
          />
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-[#E2E8F0] max-w-[340px] shadow-sm animate-fade-in">
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
              <Sparkles className="w-4 h-4 animate-spin motion-reduce:animate-none" />
            </div>
            <div className="space-y-0.5">
              <div className="text-[13px] font-bold text-[#0F172A]">
                VestIQ is analyzing...
              </div>
              <div className="text-[11.5px] text-[#64748B] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse motion-reduce:animate-none" />
                <span>Evaluating portfolio & market data</span>
              </div>
            </div>
          </div>
        )}

        {/* Error State with Retry */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 space-y-2.5 animate-fade-in shadow-xs">
            <div className="flex items-center gap-2 font-bold text-[13.5px] text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>VestIQ couldn't complete that request.</span>
            </div>
            <p className="text-[12.5px] text-red-800 leading-relaxed">
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
                className="px-3.5 py-1.5 rounded-lg bg-white border border-red-200 text-red-800 text-xs font-semibold hover:bg-red-100 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
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
