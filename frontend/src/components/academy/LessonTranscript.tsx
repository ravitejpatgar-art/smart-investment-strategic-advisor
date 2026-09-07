import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface LessonTranscriptProps {
  transcript: string;
  durationSeconds: number;
}

export const LessonTranscript: React.FC<LessonTranscriptProps> = ({
  transcript,
  durationSeconds,
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
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
      {/* Header / Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-white hover:bg-[#F8FAFC] transition-colors text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-sm font-semibold text-[#0F172A]">Lesson Transcript</span>
            <span className="text-xs text-[#64748B] ml-2">({Math.ceil(durationSeconds / 60)} min read)</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-[#64748B]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#64748B]" />
          )}
        </div>
      </button>

      {/* Transcript Body */}
      {isOpen && (
        <div className="px-5 pb-5 pt-1 border-t border-[#F1F5F9]">
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#64748B] hover:text-[#0F172A] bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-md transition-colors border border-[#E2E8F0]"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy text</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-3.5 text-sm text-[#334155] leading-relaxed">
            {paragraphs.map((para, idx) => (
              <p key={idx} className="whitespace-pre-line">
                {para}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
