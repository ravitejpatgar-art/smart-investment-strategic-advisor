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
        <div className="text-[12px] text-amber-300 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 animate-fade-in">
          {speechError}
        </div>
      )}

      <div className="relative rounded-2xl bg-[#0F172A] border border-white/[0.08] shadow-2xl hover:border-[#00D4AA]/40 focus-within:border-[#00D4AA] focus-within:ring-4 focus-within:ring-[#00D4AA]/10 transition-all p-3 sm:p-4">
        <textarea
          ref={textareaRef}
          autoFocus={autoFocus}
          rows={2}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent text-white placeholder:text-slate-500 text-[14px] sm:text-[15px] resize-none outline-none focus:outline-none p-1 font-normal leading-relaxed"
        />

        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] mt-1">
          
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="hidden sm:inline-flex items-center gap-1 font-mono">
              <CornerDownLeft className="w-3 h-3 text-slate-400" /> Enter to send
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Shift+Enter for new line</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isListening 
                  ? 'bg-[#FF5252]/20 text-[#FF5252] border-[#FF5252]/40 animate-pulse' 
                  : 'bg-[#0B1120] text-slate-400 border-white/[0.08] hover:text-white hover:border-white/[0.16]'
              }`}
              title={isListening ? 'Stop listening' : 'Voice Input'}
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!query.trim() || loading}
              className="px-4 py-2 rounded-xl bg-[#00D4AA] text-[#060811] font-bold text-[13px] flex items-center gap-1.5 shadow-md hover:shadow-[#00D4AA]/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#00D4AA]/90"
            >
              <span>Ask VestIQ</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
