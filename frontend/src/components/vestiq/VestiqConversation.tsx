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
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E7EAF0] shrink-0 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span className="font-bold text-[#172033] uppercase tracking-wider">
            Active Financial Intelligence Thread
          </span>
        </div>

        <button
          onClick={onClear}
          className="text-[#667085] hover:text-[#172033] flex items-center gap-1 font-semibold cursor-pointer transition-colors"
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
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#E7EAF0] max-w-[340px] shadow-xs animate-fade-in">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-teal-600 to-indigo-600 flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="space-y-1">
              <div className="text-[13px] font-bold text-[#172033]">
                VestIQ is analyzing...
              </div>
              <div className="text-[11.5px] text-[#667085] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                <span>Evaluating portfolio & market data</span>
              </div>
            </div>
          </div>
        )}

        {/* Error State with Retry */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2.5 animate-fade-in shadow-xs">
            <div className="flex items-center gap-2 font-bold text-[14px]">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>VestIQ couldn't complete that request.</span>
            </div>
            <p className="text-[13px] text-rose-700 leading-relaxed">
              {error || 'An unexpected connection issue occurred while communicating with the advisory engine.'}
            </p>
            <div className="flex items-center gap-2 pt-1">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[12.5px] font-bold cursor-pointer transition-colors shadow-2xs"
                >
                  Retry
                </button>
              )}
              <button
                onClick={onNewAnalysis}
                className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-800 text-[12.5px] font-semibold hover:bg-rose-100 cursor-pointer transition-colors"
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
