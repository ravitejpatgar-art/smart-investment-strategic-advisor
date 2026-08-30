import React, { useState } from 'react';
import { 
  Sparkles, 
  User, 
  Copy, 
  Check, 
  ArrowRight
} from 'lucide-react';
import { MarkdownRenderer } from '../assistant/MarkdownRenderer';
import { VestiqAnalysisCard, type CalculationData } from './VestiqAnalysisCard';

export interface VestiqChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  calculations?: CalculationData | null;
  followUps?: string[];
  intent?: string;
  entities?: string[];
}

interface VestiqMessageProps {
  message: VestiqChatMessage;
  onSelectFollowUp?: (prompt: string) => void;
}

export const VestiqMessage: React.FC<VestiqMessageProps> = ({
  message,
  onSelectFollowUp,
}) => {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 sm:gap-3.5 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in font-sans`}>
      
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <Sparkles className="w-4 h-4 stroke-[2.5]" />
        </div>
      )}

      {/* Message Bubble Container */}
      <div className={`max-w-[92%] sm:max-w-[800px] rounded-2xl p-4 sm:p-5 text-[15px] leading-relaxed space-y-3 relative shadow-xs ${
        isUser 
          ? 'bg-gradient-to-r from-teal-700 to-teal-800 text-white font-medium rounded-tr-none shadow-sm' 
          : 'bg-white border border-[#E7EAF0] text-[#172033] rounded-tl-none'
      }`}>
        
        {/* Message Content */}
        {isUser ? (
          <div className="whitespace-pre-wrap text-[15px]">{message.text}</div>
        ) : (
          <MarkdownRenderer content={message.text} />
        )}

        {/* Structured Financial Cards */}
        {message.calculations && (
          <VestiqAnalysisCard calc={message.calculations} />
        )}

        {/* Dynamic Suggested Follow-ups */}
        {message.followUps && message.followUps.length > 0 && (
          <div className="pt-3 border-t border-[#F1F5F9] space-y-2">
            <span className="text-[11.5px] font-bold text-[#667085] uppercase tracking-wider block">
              Suggested Next Steps:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {message.followUps.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectFollowUp?.(chip)}
                  className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 border border-[#E7EAF0] text-slate-700 text-[12.5px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-left shadow-2xs hover:border-teal-400"
                >
                  <span>{chip}</span>
                  <ArrowRight className="w-3 h-3 text-teal-600 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer: Timestamp + Copy */}
        <div className={`flex items-center justify-between pt-2 border-t text-[11px] ${
          isUser ? 'border-teal-600 text-teal-100' : 'border-[#F8FAFC] text-[#98A2B3]'
        }`}>
          <span>{message.timestamp}</span>

          {!isUser && (
            <button
              onClick={handleCopy}
              className="hover:text-teal-700 flex items-center gap-1 cursor-pointer transition-colors"
              title="Copy answer"
            >
              {copied ? <Check className="w-3 h-3 text-teal-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>

      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs shadow-xs">
          <User className="w-4 h-4" />
        </div>
      )}

    </div>
  );
};
