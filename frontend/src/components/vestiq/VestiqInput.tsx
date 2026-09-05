import React, { useState, useRef } from 'react';
import { Send, Mic, CornerDownLeft } from 'lucide-react';

interface VestiqInputProps {
  onSend: (text: string) => void;
  loading: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export const VestiqInput: React.FC<VestiqInputProps> = ({
  onSend,
  loading,
  placeholder = 'Ask VestIQ anything about markets, funds, goals, or affordability...',
  autoFocus = false,
}) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!query.trim() || loading) return;
    onSend(query.trim());
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
        if (transcript) {
          setQuery(transcript);
          onSend(transcript);
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
        <div className="text-[12px] text-amber-300 px-3.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 animate-fade-in">
          {speechError}
        </div>
      )}

      <div className="relative rounded-xl bg-[#0A1022] border border-white/[0.08] shadow-sm hover:border-white/20 focus-within:border-[#00D4AA]/60 focus-within:ring-1 focus-within:ring-[#00D4AA]/20 transition-all p-2.5 sm:p-3">
        <textarea
          ref={textareaRef}
          autoFocus={autoFocus}
          rows={2}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent text-white placeholder:text-[#5A667A] text-[14px] sm:text-[15px] resize-none outline-none focus:outline-none p-1 font-normal leading-relaxed"
        />

        <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.06]">
          
          <div className="flex items-center gap-2 text-[11px] text-[#5A667A]">
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
              className={`p-2 rounded-lg border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00D4AA] ${
                isListening 
                  ? 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse motion-reduce:animate-none' 
                  : 'bg-[#101827] text-[#8A94A6] border-white/[0.08] hover:text-white hover:border-white/20'
              }`}
              title={isListening ? 'Stop listening' : 'Voice Input'}
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!query.trim() || loading}
              className="px-3.5 py-1.5 rounded-lg bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#050816] font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4AA]"
            >
              <span>Ask VestIQ</span>
              <Send className="w-3 h-3" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
