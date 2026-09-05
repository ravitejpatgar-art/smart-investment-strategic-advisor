import React, { useState } from 'react';
import { 
  Sparkles, 
  User, 
  Copy, 
  Check, 
  ArrowRight
} from 'lucide-react';
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

const renderFormattedText = (text: string): React.ReactNode => {
  const parts = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
    const codeMatch = remaining.match(/`([^`]+)`/);

    let firstMatch = null;
    let matchType = null;

    if (boldMatch && boldMatch.index !== undefined) {
      firstMatch = boldMatch;
      matchType = 'bold';
    }

    if (codeMatch && codeMatch.index !== undefined) {
      if (!firstMatch || (codeMatch.index < (firstMatch.index ?? 0))) {
        firstMatch = codeMatch;
        matchType = 'code';
      }
    }

    if (firstMatch && firstMatch.index !== undefined && matchType) {
      if (firstMatch.index > 0) {
        parts.push(<span key={keyIdx++}>{remaining.substring(0, firstMatch.index)}</span>);
      }

      if (matchType === 'bold') {
        parts.push(
          <strong key={keyIdx++} className="font-semibold text-white">
            {firstMatch[1]}
          </strong>
        );
      } else if (matchType === 'code') {
        parts.push(
          <code key={keyIdx++} className="px-1.5 py-0.5 rounded bg-white/5 text-[#00D4AA] font-mono text-[12px] border border-white/10">
            {firstMatch[1]}
          </code>
        );
      }

      remaining = remaining.substring(firstMatch.index + firstMatch[0].length);
    } else {
      parts.push(<span key={keyIdx++}>{remaining}</span>);
      break;
    }
  }

  return <>{parts}</>;
};

const renderMarkdownContent = (content: string): React.ReactNode => {
  if (!content) return null;

  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let currentTable: string[] = [];
  let inTable = false;

  const flushTable = (tableLines: string[], index: number) => {
    if (tableLines.length === 0) return null;
    const validRows = tableLines.filter(l => !l.match(/^\|\s*[-:]+[-|\s:]*\|$/));
    if (validRows.length === 0) return null;

    const headers = validRows[0].split('|').map(s => s.trim()).filter(Boolean);
    const bodyRows = validRows.slice(1).map(row => row.split('|').map(s => s.trim()).filter(Boolean));

    return (
      <div key={`tbl_${index}`} className="my-2.5 overflow-x-auto rounded-lg border border-white/[0.08] bg-[#0A1022]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/[0.08] bg-[#0A1022] text-white font-semibold">
              {headers.map((h, i) => (
                <th key={i} className="p-2.5">
                  {renderFormattedText(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-[#CBD5E1]">
            {bodyRows.map((r, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-white/[0.02] transition-colors">
                {r.map((cell, cellIdx) => (
                  <td key={cellIdx} className="p-2.5">
                    {renderFormattedText(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      currentTable.push(line.trim());
      continue;
    } else if (inTable) {
      inTable = false;
      renderedElements.push(flushTable(currentTable, i));
      currentTable = [];
    }

    if (!line.trim()) {
      renderedElements.push(<div key={`sp_${i}`} className="h-1.5" />);
      continue;
    }

    // Section Header keywords
    const sectionKeywords = [
      'BOTTOM LINE',
      'ANALYSIS',
      'ANALYSIS & CALCULATION',
      'CALCULATION',
      'RECOMMENDATION',
      'RECOMMENDED ALLOCATION',
      'RISKS',
      'KEY RISKS',
      'WHY',
      'NEXT STEP',
      'PORTFOLIO SELECTION RATIONALE',
      'FIDUCIARY DIRECT-PLAN ADVANTAGE'
    ];

    if (sectionKeywords.includes(line.trim())) {
      renderedElements.push(
        <div
          key={`sec_${i}`}
          className="text-[11px] font-bold text-[#00D4AA] tracking-wider uppercase pt-2 pb-1 border-b border-white/[0.08]"
        >
          {line.trim()}
        </div>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      renderedElements.push(
        <h3 key={`h3_${i}`} className="text-[14px] font-bold text-white mt-2 mb-0.5">
          {renderFormattedText(line.replace('### ', ''))}
        </h3>
      );
      continue;
    }

    if (line.startsWith('#### ')) {
      renderedElements.push(
        <h4 key={`h4_${i}`} className="text-[13px] font-semibold text-[#00D4AA] mt-1.5 mb-0.5">
          {renderFormattedText(line.replace('#### ', ''))}
        </h4>
      );
      continue;
    }

    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const text = line.trim().replace(/^[*|-]\s+/, '');
      renderedElements.push(
        <div key={`li_${i}`} className="flex items-start gap-2 pl-0.5 py-0.5 text-[#CBD5E1] text-[13.5px]">
          <span className="text-[#00D4AA] font-bold shrink-0 mt-0.5 text-[12px]">•</span>
          <div className="flex-1 leading-relaxed">{renderFormattedText(text)}</div>
        </div>
      );
      continue;
    }

    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      renderedElements.push(
        <div key={`num_${i}`} className="flex items-start gap-2 pl-0.5 py-0.5 text-[#CBD5E1] text-[13.5px]">
          <span className="text-[#00D4AA] font-mono font-bold shrink-0 text-[12px]">{numMatch[1]}.</span>
          <div className="flex-1 leading-relaxed">{renderFormattedText(numMatch[2])}</div>
        </div>
      );
      continue;
    }

    if (line.trim() === '---' || line.trim() === '***') {
      renderedElements.push(<hr key={`hr_${i}`} className="my-2 border-white/[0.08]" />);
      continue;
    }

    renderedElements.push(
      <p key={`p_${i}`} className="leading-relaxed text-[#E2E8F0] text-[13.5px]">
        {renderFormattedText(line)}
      </p>
    );
  }

  if (inTable && currentTable.length > 0) {
    renderedElements.push(flushTable(currentTable, lines.length));
  }

  return <div className="space-y-1.5 text-[13.5px] leading-relaxed">{renderedElements}</div>;
};

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
    <div className={`flex gap-2.5 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in font-sans`}>
      
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-[#0A1022] border border-white/[0.08] text-[#00D4AA] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 stroke-[2]" />
        </div>
      )}

      {/* Message Bubble Container */}
      <div className={`max-w-[92%] sm:max-w-[780px] rounded-xl p-4 sm:p-5 text-[13.5px] sm:text-[14px] leading-relaxed space-y-3 relative shadow-sm ${
        isUser 
          ? 'bg-[#141F36] border border-white/[0.10] text-white rounded-tr-none font-normal max-w-[85%] sm:max-w-[560px]' 
          : 'bg-[#101827] border border-white/[0.08] text-[#E2E8F0] rounded-tl-none'
      }`}>
        
        {/* Message Content */}
        {isUser ? (
          <div className="whitespace-pre-wrap break-words text-[13.5px] sm:text-[14px] text-white leading-relaxed">
            {message.text}
          </div>
        ) : (
          renderMarkdownContent(message.text)
        )}

        {/* Structured Financial Cards */}
        {message.calculations && (
          <VestiqAnalysisCard calc={message.calculations} />
        )}

        {/* Dynamic Suggested Follow-ups */}
        {message.followUps && message.followUps.length > 0 && (
          <div className="pt-2.5 border-t border-white/[0.08] space-y-1.5">
            <span className="text-[10.5px] font-bold text-[#8A94A6] uppercase tracking-wider block">
              Suggested Next Steps:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {message.followUps.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectFollowUp?.(chip)}
                  className="px-2.5 py-1 rounded-lg bg-[#0A1022] hover:bg-[#141F36] border border-white/[0.08] text-[#E2E8F0] text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-left hover:border-[#00D4AA]/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00D4AA]"
                >
                  <span>{chip}</span>
                  <ArrowRight className="w-3 h-3 text-[#00D4AA] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer: Timestamp + Copy */}
        <div className={`flex items-center justify-between pt-1.5 border-t text-[11px] ${
          isUser ? 'border-white/[0.06] text-[#8A94A6] justify-end' : 'border-white/[0.06] text-[#5A667A]'
        }`}>
          <span className="font-mono text-[10.5px]">{message.timestamp}</span>

          {!isUser && (
            <button
              onClick={handleCopy}
              className="text-[#8A94A6] hover:text-[#00D4AA] flex items-center gap-1 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00D4AA] rounded px-1"
              title="Copy answer"
            >
              {copied ? <Check className="w-3 h-3 text-[#00D4AA]" /> : <Copy className="w-3 h-3" />}
              <span className={copied ? 'text-[#00D4AA]' : ''}>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>

      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-7 h-7 rounded-lg bg-[#141F36] border border-white/[0.10] text-[#00D4AA] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <User className="w-3.5 h-3.5 stroke-[2]" />
        </div>
      )}

    </div>
  );
};
