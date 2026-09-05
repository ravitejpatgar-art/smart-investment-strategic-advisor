import React, { useState, useRef } from 'react';
import { Send, Mic, CornerDownLeft, Sparkles } from 'lucide-react';

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
        <div className="text-[12px] text-amber-800 px-3.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 animate-fade-in">
          {speechError}
        </div>
      )}

      {/* StockGro-Inspired Large Central Ask Container */}
      <div className="relative rounded-2xl bg-white border border-[#E2E8F0] shadow-sm hover:border-teal-400 focus-within:border-teal-500 focus-within:ring-3 focus-within:ring-teal-500/10 transition-all p-3 sm:p-4">
        
        <div className="flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-1" />
          <textarea
            ref={textareaRef}
            autoFocus={autoFocus}
            rows={2}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-transparent text-[#0F172A] placeholder:text-[#94A3B8] text-[14px] sm:text-[15px] resize-none outline-none focus:outline-none font-normal leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-2 mt-1 border-t border-[#F1F5F9]">
          
          <div className="flex items-center gap-2 text-[11px] text-[#94A3B8]">
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
              className={`p-2 rounded-xl border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                isListening 
                  ? 'bg-red-50 text-red-600 border-red-300 animate-pulse motion-reduce:animate-none' 
                  : 'bg-slate-50 text-[#64748B] border-[#E2E8F0] hover:text-[#0F172A] hover:bg-slate-100'
              }`}
              title={isListening ? 'Stop listening' : 'Voice Input'}
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!query.trim() || loading}
              className="px-4 py-2 rounded-xl bg-[#00D4AA] hover:bg-teal-400 text-[#0F172A] font-bold text-xs sm:text-[13px] flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0F172A]" />
              <span>Ask VestIQ</span>
              <Send className="w-3 h-3 ml-0.5" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
