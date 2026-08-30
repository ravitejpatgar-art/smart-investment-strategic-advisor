import React from 'react';
import { 
  Sparkles, 
  Layers, 
  Search, 
  ArrowRight,
  Zap,
  Globe,
  Compass
} from 'lucide-react';
import { VestiqInput } from './VestiqInput';
import { VestiqMarketStrip } from './VestiqMarketStrip';

interface VestiqEmptyStateProps {
  onSend: (prompt: string) => void;
  loading: boolean;
}

const SUGGESTED_QUESTIONS = [
  'Suggest some US stocks for me',
  'Explain ETFs',
  'Why is Nvidia moving?',
  'Compare Apple and Microsoft',
  'How much SIP do I need for ₹1 crore?',
  'Review my portfolio',
  'Can I afford a ₹10 lakh car?'
];

const INTELLIGENCE_CATEGORIES = [
  {
    id: 'market',
    title: 'Market Intelligence',
    icon: Globe,
    color: '#0284c7',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
    description: 'Ask about NIFTY, SENSEX, NASDAQ, Gold trends, and macroeconomic movements.',
    samplePrompts: ['What is Nifty doing today?', 'Why is gold rising as a hedge?', 'US market tech outlook']
  },
  {
    id: 'portfolio',
    title: 'Portfolio Intelligence',
    icon: Layers,
    color: '#6366f1',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: 'Evaluate portfolio diversification, risk capacity, asset overlap, and mandate alignment.',
    samplePrompts: ['Review my portfolio', 'Am I too concentrated in Nifty?', 'Explain my asset allocation']
  },
  {
    id: 'research',
    title: 'Investment Research',
    icon: Search,
    color: '#0d9488',
    badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
    description: 'Deep-dive into individual direct index funds, ETFs, stocks, global tech, and bonds.',
    samplePrompts: ['Suggest some US stocks', 'Is MON100 a good ETF?', 'Explain direct index fund benefits']
  },
  {
    id: 'planning',
    title: 'Financial Planning',
    icon: Compass,
    color: '#ea580c',
    badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
    description: 'Simulate monthly SIPs, milestone target dates, emergency fund runways, and affordability.',
    samplePrompts: ['How much SIP for ₹1 crore?', 'Can I afford a ₹10 lakh car?', 'Where should I invest surplus?']
  }
];

export const VestiqEmptyState: React.FC<VestiqEmptyStateProps> = ({ onSend, loading }) => {
  return (
    <div className="w-full max-w-[860px] mx-auto space-y-6 sm:space-y-7 py-4 sm:py-6 font-sans animate-fade-in">
      
      {/* 1. Hero Title & Subtitle */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-teal-50 to-indigo-50 border border-teal-200 text-[12px] font-bold text-teal-900 shadow-xs mb-1">
          <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
          <span>VestIQ Intelligence Workspace</span>
        </div>

        <h1 className="text-[28px] sm:text-[38px] lg:text-[44px] font-black text-[#172033] tracking-tight leading-tight">
          How can <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-indigo-600">VestIQ</span> help?
        </h1>

        <p className="text-[14.5px] sm:text-[16px] text-[#667085] max-w-[620px] mx-auto leading-relaxed">
          Analyze markets, explore institutional research, optimize portfolio allocation, and simulate your wealth milestones.
        </p>
      </div>

      {/* 2. Large AI Input Area */}
      <div className="w-full">
        <VestiqInput onSend={onSend} loading={loading} autoFocus />
      </div>

      {/* 3. Suggested Questions Pills */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#98A2B3] uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Suggested Questions:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onSend(q)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-[#E7EAF0] text-[#172033] text-[13px] font-medium transition-all hover:border-teal-400 hover:shadow-xs flex items-center gap-1.5 cursor-pointer text-left"
            >
              <span>{q}</span>
              <ArrowRight className="w-3 h-3 text-teal-600 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* 4. Live Market Intelligence Strip */}
      <div>
        <VestiqMarketStrip onSelectSymbol={(sym) => onSend(`What is ${sym} doing today and what is the market outlook?`)} />
      </div>

      {/* 5. 4 Quick Intelligence Categories */}
      <div className="space-y-3">
        <div className="text-[12.5px] font-bold text-[#172033] uppercase tracking-wider flex items-center gap-1.5">
          <span>Financial Intelligence Categories</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {INTELLIGENCE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="p-4 rounded-xl bg-white border border-[#E7EAF0] hover:border-teal-400 hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-[#172033] text-[15px]">{cat.title}</h3>
                    </div>
                  </div>

                  <p className="text-[13px] text-[#667085] leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[#F8FAFC]">
                  <span className="text-[11px] font-semibold text-[#98A2B3] uppercase">Try Asking:</span>
                  <div className="flex flex-col gap-1">
                    {cat.samplePrompts.map((p, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => onSend(p)}
                        className="text-left text-[12.5px] text-teal-800 hover:text-teal-950 hover:underline flex items-center justify-between font-medium cursor-pointer py-0.5 group"
                      >
                        <span className="truncate">"{p}"</span>
                        <ArrowRight className="w-3 h-3 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
