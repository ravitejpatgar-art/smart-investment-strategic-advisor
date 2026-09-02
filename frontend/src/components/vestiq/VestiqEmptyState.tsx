import React from 'react';
import { 
  TrendingUp, 
  ChevronRight 
} from 'lucide-react';
import { VestiqInput } from './VestiqInput';

interface VestiqEmptyStateProps {
  onSend: (prompt: string) => void;
  loading: boolean;
}

const SMART_INVESTOR_QUESTIONS = [
  {
    id: 'q1',
    text: "IndiGo and SBI among today's top losers. Sell or hold your stake?",
  },
  {
    id: 'q2',
    text: "PVR Inox okays Rs300 cr buyback at Rs1,450. Buy or book profit?",
  },
  {
    id: 'q3',
    text: "Hy-Tech Engineers lists today. GMP hints 83% gain. Should you buy?",
  },
  {
    id: 'q4',
    text: "Nifty Pharma falls 1.4%. Should you sell pharma stocks or hold?",
  }
];

export const VestiqEmptyState: React.FC<VestiqEmptyStateProps> = ({ onSend, loading }) => {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col justify-between min-h-[calc(100vh-140px)] py-8 px-4 font-sans animate-fade-in">
      
      <div className="w-full space-y-6 flex-1 flex flex-col justify-center">
        
        {/* 1. Hero Title */}
        <div className="text-center space-y-2 my-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Ask anything about your portfolio, markets & money
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time multi-asset intelligence, macroeconomic analysis, and portfolio governance
          </p>
        </div>

        {/* 2. Main Prompt Card */}
        <div className="w-full">
          <VestiqInput onSend={onSend} loading={loading} autoFocus />
        </div>

        {/* 3. Simple Suggested Question Buttons */}
        <div className="w-full space-y-2 pt-2">
          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Suggested topics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SMART_INVESTOR_QUESTIONS.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => onSend(q.text)}
                className="p-3 rounded-lg bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.16] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors flex items-center justify-between gap-2 text-left group cursor-pointer"
              >
                <span className="text-xs font-normal text-slate-700 dark:text-slate-300">
                  {q.text}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Minimalist Bottom Footnote */}
      <div className="w-full text-center text-[11px] text-slate-400 dark:text-slate-500 pt-6 mt-auto">
        ✦ AI Powered Financial Intelligence · Built for Indian & Global Wealth Management
      </div>

    </div>
  );
};
