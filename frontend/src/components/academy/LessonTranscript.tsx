import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface LessonTranscriptProps {
  transcript: string;
  durationSeconds: number;
  languageLabel?: string;
}

export const LessonTranscript: React.FC<LessonTranscriptProps> = ({
  transcript,
  durationSeconds,
  languageLabel,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  const paragraphs = transcript.split('\n\n').filter((p) => p.trim().length > 0);

  return (
    <div className="financial-section-card overflow-hidden">
      {/* Header / Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 bg-[var(--color-card)] hover:bg-[var(--color-surface-soft)]/50 transition-colors text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-[var(--color-text-primary)]">
              Educational Transcript {languageLabel ? `• ${languageLabel}` : ''}
            </span>
            <span className="text-xs text-[var(--color-text-muted)] ml-2">({Math.ceil(durationSeconds / 60)} min read)</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-[var(--color-text-muted)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
          )}
        </div>
      </button>

      {/* Transcript Body */}
      {isOpen && (
        <div className="px-5 pb-5 pt-2 border-t border-[var(--color-border-subtle)]">
          <div className="flex justify-end mb-3">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface-soft)] hover:bg-[var(--color-border-subtle)] rounded-md transition-colors border border-[var(--color-border)] cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied to clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  <span>Copy transcript</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-4 text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {paragraphs.map((para, idx) => (
              <p key={idx} className="whitespace-pre-line leading-relaxed">
                {para}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
