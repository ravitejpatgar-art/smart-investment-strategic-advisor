import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, CornerDownLeft, MessageSquare } from 'lucide-react';

interface VestiqInputProps {
  onSend: (text: string) => void;
  loading: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export const VestiqInput: React.FC<VestiqInputProps> = ({
  onSend,
  loading,
  placeholder = 'Type / or Ask about a stock, sector, SIP goal, or investment idea...',
  autoFocus = false,
}) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSubmittingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!loading) {
      isSubmittingRef.current = false;
    }
  }, [loading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed || loading || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    onSend(trimmed);
    setQuery('');
  };

  const handleToggleVoice = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Voice input is not supported in this browser.');
      setTimeout(() => setSpeechError(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && !loading && !isSubmittingRef.current) {
          const trimmed = transcript.trim();
          if (trimmed) {
            isSubmittingRef.current = true;
            setQuery(trimmed);
            onSend(trimmed);
            setQuery('');
          }
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setSpeechError('Could not recognize voice. Please type your query.');
        setTimeout(() => setSpeechError(null), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setSpeechError('Could not start voice recognition.');
      setTimeout(() => setSpeechError(null), 4000);
    }
  };

  return (
    <div className="w-full space-y-2 font-sans">
      
      {speechError && (
        <div className="text-[12px] text-amber-800 px-3.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 animate-fade-in">
          {speechError}
        </div>
      )}

      {/* StockGro-Inspired Large Central Ask Container */}
      <div className="relative rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] shadow-sm hover:border-[var(--color-border-strong)] focus-within:border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[var(--color-accent)]/10 transition-all p-3 sm:p-4">
        
        <div className="flex items-start gap-2.5">
          <MessageSquare className="w-4 h-4 text-[var(--color-accent-strong)] shrink-0 mt-1" />
          <textarea
            ref={textareaRef}
            autoFocus={autoFocus}
            rows={2}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] text-[14px] sm:text-[15px] resize-none outline-none focus:outline-none font-normal leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-2 mt-1 border-t border-[var(--color-border-subtle)]">
          
          <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
            <span className="hidden sm:inline-flex items-center gap-1 font-mono">
              <CornerDownLeft className="w-3 h-3" /> Enter to send
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Shift+Enter for new line</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-2 rounded-xl border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                isListening 
                  ? 'bg-red-500/10 text-rose-500 border-red-500/30 animate-pulse motion-reduce:animate-none' 
                  : 'bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
              }`}
              title={isListening ? 'Stop listening' : 'Voice Input'}
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!query.trim() || loading}
              className="px-4 py-2 rounded-xl bg-[var(--color-accent)] hover:brightness-105 text-[var(--color-accent-text)] font-bold text-xs sm:text-[13px] flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              <span>Ask VestIQ</span>
              <Send className="w-3 h-3 ml-0.5" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
