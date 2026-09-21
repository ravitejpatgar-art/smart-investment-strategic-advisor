import React, { useState } from 'react';
import { 
  User, 
  Copy, 
  Check, 
  ArrowRight,
  Pencil,
  Trash2
} from 'lucide-react';
import { VestiqAnalysisCard, type CalculationData } from './VestiqAnalysisCard';
import { VestiqMark } from '../common/VestiqLogo';

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
  onEdit?: (messageId: string, newText: string) => void;
  onDelete?: (messageId: string) => void;
  loading?: boolean;
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
        parts.push(<span key={keyIdx++} className="text-[var(--color-text-primary)]">{remaining.substring(0, firstMatch.index)}</span>);
      }

      if (matchType === 'bold') {
        parts.push(
          <strong key={keyIdx++} className="font-bold text-[var(--color-text-primary)]">
            {firstMatch[1]}
          </strong>
        );
      } else if (matchType === 'code') {
        parts.push(
          <code key={keyIdx++} className="px-1.5 py-0.5 rounded bg-slate-100 text-teal-800 font-mono text-[12px] border border-slate-200">
            {firstMatch[1]}
          </code>
        );
      }

      remaining = remaining.substring(firstMatch.index + firstMatch[0].length);
    } else {
      parts.push(<span key={keyIdx++} className="text-[var(--color-text-primary)]">{remaining}</span>);
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
      <div key={`tbl_${index}`} className="my-2.5 overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-slate-50 text-[var(--color-text-primary)] font-semibold">
              {headers.map((h, i) => (
                <th key={i} className="p-2.5">
                  {renderFormattedText(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[var(--color-text-primary)]">
            {bodyRows.map((r, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-slate-50/80 transition-colors">
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
          className="text-[11px] font-bold text-[var(--color-text-accent)] tracking-wider uppercase pt-2 pb-1 border-b border-[#E2E8F0]"
        >
          {line.trim()}
        </div>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      renderedElements.push(
        <h3 key={`h3_${i}`} className="text-[14.5px] font-bold text-[var(--color-text-primary)] mt-2 mb-0.5">
          {renderFormattedText(line.replace('### ', ''))}
        </h3>
      );
      continue;
    }

    if (line.startsWith('#### ')) {
      renderedElements.push(
        <h4 key={`h4_${i}`} className="text-[13.5px] font-semibold text-[var(--color-text-accent)] mt-1.5 mb-0.5">
          {renderFormattedText(line.replace('#### ', ''))}
        </h4>
      );
      continue;
    }

    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const text = line.trim().replace(/^[*|-]\s+/, '');
      renderedElements.push(
        <div key={`li_${i}`} className="flex items-start gap-2 pl-0.5 py-0.5 text-[var(--color-text-primary)] text-[13.5px]">
          <span className="text-[var(--color-accent)] font-bold shrink-0 mt-0.5 text-[12px]">•</span>
          <div className="flex-1 leading-relaxed">{renderFormattedText(text)}</div>
        </div>
      );
      continue;
    }

    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      renderedElements.push(
        <div key={`num_${i}`} className="flex items-start gap-2 pl-0.5 py-0.5 text-[var(--color-text-primary)] text-[13.5px]">
          <span className="text-[var(--color-accent)] font-mono font-bold shrink-0 text-[12px]">{numMatch[1]}.</span>
          <div className="flex-1 leading-relaxed">{renderFormattedText(numMatch[2])}</div>
        </div>
      );
      continue;
    }

    if (line.trim() === '---' || line.trim() === '***') {
      renderedElements.push(<hr key={`hr_${i}`} className="my-2 border-[#E2E8F0]" />);
      continue;
    }

    renderedElements.push(
      <p key={`p_${i}`} className="leading-relaxed text-[var(--color-text-primary)] text-[13.5px]">
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
  onEdit,
  onDelete,
  loading = false,
}) => {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const handleStartEdit = () => {
    setEditText(message.text);
    setIsEditing(true);
    setConfirmDelete(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(message.text);
  };

  const handleSaveEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = editText.trim();
    if (!trimmed || loading) return;
    setIsEditing(false);
    onEdit?.(message.id, trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const handleDeleteClick = () => {
    setConfirmDelete(true);
    setIsEditing(false);
  };

  const handleConfirmDelete = () => {
    setConfirmDelete(false);
    onDelete?.(message.id);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
  };

  return (
    <div className={`group/msg flex gap-2.5 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-up font-sans relative`}>
      
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-[#101827] border border-[var(--color-border-accent)] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <VestiqMark size={18} />
        </div>
      )}

      {/* Message Bubble Container */}
      <div className={`max-w-[92%] sm:max-w-[780px] rounded-2xl p-4 sm:p-5 text-[13.5px] sm:text-[14px] leading-relaxed space-y-3 relative shadow-xs ${
        isUser 
          ? 'bg-[var(--accent-teal-dim)] border border-[var(--border-accent)] text-[var(--color-text-primary)] rounded-tr-none font-normal min-w-[240px] sm:min-w-[280px] max-w-[85%] sm:max-w-[560px]' 
          : 'bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-tl-none'
      }`}>
        
        {/* Message Content or Edit Input */}
        {isEditing ? (
          <div className="space-y-3 min-w-[260px] sm:min-w-[420px] animate-scale-in">
            <div className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
              <Pencil className="w-3.5 h-3.5 text-[var(--color-accent-strong)]" />
              <span>Edit message (everything below will be reset)</span>
            </div>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              autoFocus
              className="w-full p-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-accent)] text-[var(--color-text-primary)] text-[13.5px] leading-relaxed outline-none resize-y min-h-[70px] shadow-inner"
              placeholder="Edit your message..."
            />
            <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-[var(--color-text-secondary)]">
              <span className="hidden sm:inline">Enter to save • Esc to cancel</span>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-2.5 py-1 rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveEdit()}
                  disabled={!editText.trim() || loading}
                  className="px-3 py-1 rounded-md bg-[var(--color-accent)] text-[var(--color-accent-text)] font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer transition-all shadow-xs"
                >
                  Save & Submit
                </button>
              </div>
            </div>
          </div>
        ) : isUser ? (
          <div className="whitespace-pre-wrap break-words text-[13.5px] sm:text-[14px] text-[var(--color-text-primary)] leading-relaxed">
            {message.text}
          </div>
        ) : (
          renderMarkdownContent(message.text)
        )}

        {/* Structured Financial Cards */}
        {!isEditing && message.calculations && (
          <VestiqAnalysisCard calc={message.calculations} />
        )}

        {/* Dynamic Suggested Follow-ups */}
        {!isEditing && message.followUps && message.followUps.length > 0 && (
          <div className="pt-2.5 border-t border-[var(--color-border-subtle)] space-y-1.5">
            <span className="text-[10.5px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block">
              Suggested Next Steps:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {message.followUps.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectFollowUp?.(chip)}
                  className="px-3 py-1.5 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-left hover:border-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] shadow-2xs"
                >
                  <span>{chip}</span>
                  <ArrowRight className="w-3 h-3 text-[var(--color-accent-strong)] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer: Timestamp + Actions */}
        {!isEditing && (
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--color-border-subtle)] text-[11px] text-[var(--color-text-secondary)]">
            <span className="font-mono text-[10.5px] text-[var(--color-text-secondary)] shrink-0">{message.timestamp}</span>

            {/* Action Buttons: Visible, accessible, high contrast */}
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {/* Delete confirmation inline pill */}
              {confirmDelete ? (
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-rose-500/15 border border-rose-500/30 text-rose-500 animate-fade-in text-[11px]">
                  <span className="font-medium text-rose-500">Delete turn & below?</span>
                  <button
                    onClick={handleConfirmDelete}
                    className="font-bold text-rose-500 hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-0.5 rounded transition-colors cursor-pointer"
                    aria-label="Confirm delete message"
                  >
                    Delete
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                    aria-label="Cancel delete"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  {/* Copy Button (Both User and Assistant) */}
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface-2)]/80 hover:bg-[var(--color-surface-hover)] border border-[var(--color-border-subtle)] cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] min-h-[30px] sm:min-h-[26px]"
                    title={isUser ? 'Copy message' : 'Copy answer'}
                    aria-label={isUser ? 'Copy message' : 'Copy answer'}
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[var(--color-accent-strong)]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className={copied ? 'text-[var(--color-accent-strong)] font-semibold' : ''}>
                      {copied ? 'Copied' : 'Copy'}
                    </span>
                  </button>

                  {/* Edit Button (User only) */}
                  {isUser && onEdit && !loading && (
                    <button
                      onClick={handleStartEdit}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent-strong)] bg-[var(--color-surface-2)]/80 hover:bg-[var(--color-surface-hover)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-accent)] cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] min-h-[30px] sm:min-h-[26px]"
                      title="Edit message"
                      aria-label="Edit message"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}

                  {/* Delete Button (User only) */}
                  {isUser && onDelete && !loading && (
                    <button
                      onClick={handleDeleteClick}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium text-[var(--color-text-secondary)] hover:text-rose-500 bg-[var(--color-surface-2)]/80 hover:bg-rose-500/10 border border-[var(--color-border-subtle)] hover:border-rose-500/30 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500 min-h-[30px] sm:min-h-[26px]"
                      title="Delete message"
                      aria-label="Delete message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-accent-strong)] flex items-center justify-center shrink-0 mt-0.5 shadow-xs font-bold text-xs">
          <User className="w-4 h-4" />
        </div>
      )}

    </div>
  );
};
