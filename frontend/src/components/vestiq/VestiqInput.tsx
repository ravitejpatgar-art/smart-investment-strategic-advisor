import React, { useState, useRef } from 'react';
import { Sparkles, Mic } from 'lucide-react';

interface VestiqInputProps {
  onSend: (text: string) => void;
  loading: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export const VestiqInput: React.FC<VestiqInputProps> = ({
  onSend,
  loading,
  placeholder = 'Best mutual fund',
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
        <div className="text-[12px] text-amber-700 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 animate-fade-in">
          {speechError}
        </div>
      )}

      {/* Main Clean Prompt Card */}
      <div className="relative rounded-xl bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/[0.08] p-4 flex flex-col justify-between min-h-[130px]">
        
        <div className="flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
          <textarea
            ref={textareaRef}
            autoFocus={autoFocus}
            rows={2}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-transparent text-slate-800 dark:text-white placeholder:text-slate-400 text-[15px] resize-none outline-none focus:outline-none font-normal leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-100 dark:border-white/[0.04]">
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isListening 
                  ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse' 
                  : 'bg-slate-50 dark:bg-[#0F172A] text-slate-400 border-slate-200 dark:border-white/[0.06] hover:text-slate-700'
              }`}
              title={isListening ? 'Stop listening' : 'Voice Input'}
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!query.trim() || loading}
            className="px-4 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask VestIQ</span>
          </button>

        </div>
      </div>

    </div>
  );
};
