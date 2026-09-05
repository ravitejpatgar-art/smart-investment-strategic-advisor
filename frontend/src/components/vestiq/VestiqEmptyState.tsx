import React from 'react';
import { 
  Sparkles, 
  Layers, 
  Search, 
  ChevronRight,
  TrendingUp,
  Globe,
  Compass,
  ArrowRight
} from 'lucide-react';
import { VestiqInput } from './VestiqInput';
import { VestiqMarketStrip } from './VestiqMarketStrip';

interface VestiqEmptyStateProps {
  onSend: (prompt: string) => void;
  loading: boolean;
}

const SMART_INVESTOR_QUESTIONS = [
  {
    title: 'Brent crude hits $95 a barrel. Buy OMC stocks now or avoid?',
    category: 'Market Intelligence'
  },
  {
    title: 'SoftBank sells 1.5% Meesho stake at Rs205. Buy the dip or avoid?',
    category: 'Stock Research'
  },
  {
    title: 'How much SIP do I need for ₹1 crore corpus in 10 years?',
    category: 'Financial Planning'
  },
  {
    title: 'Review my portfolio allocation & evaluate risk concentration',
    category: 'Portfolio Audit'
  }
];

const INTELLIGENCE_CATEGORIES = [
  {
    id: 'market',
    title: 'Market Intelligence',
    icon: Globe,
    color: '#00D4AA',
    description: 'Ask about NIFTY 50, SENSEX, NASDAQ, Gold hedges, and macroeconomic trends.',
    samplePrompts: ['What is Nifty doing today?', 'Why is gold rising as a hedge?', 'US market tech outlook']
  },
  {
    id: 'portfolio',
    title: 'Portfolio Intelligence',
    icon: Layers,
    color: '#1E88E5',
    description: 'Evaluate diversification, risk capacity, asset overlap, and mandate alignment.',
    samplePrompts: ['Review my portfolio', 'Am I too concentrated in Nifty?', 'Explain my asset allocation']
  },
  {
    id: 'research',
    title: 'Investment Research',
    icon: Search,
    color: '#00D4AA',
    description: 'Deep-dive into individual direct index funds, ETFs, bluechip stocks, and bonds.',
    samplePrompts: ['Suggest some US stocks', 'Is MON100 a good ETF?', 'Explain direct index fund benefits']
  },
  {
    id: 'planning',
    title: 'Financial Planning',
    icon: Compass,
    color: '#1E88E5',
    description: 'Simulate monthly SIPs, milestone target dates, emergency fund runway, and affordability.',
    samplePrompts: ['How much SIP for ₹1 crore?', 'Can I afford a ₹10 lakh car?', 'Where should I invest surplus?']
  }
];

export const VestiqEmptyState: React.FC<VestiqEmptyStateProps> = ({ onSend, loading }) => {
  return (
    <div className="w-full max-w-[860px] mx-auto space-y-7 py-4 sm:py-8 font-sans animate-fade-in">
      
      {/* 1. StockGro-inspired Centered Hero */}
      <div className="text-center space-y-3 pt-2 sm:pt-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-[#00A884]">
          <Sparkles className="w-3.5 h-3.5 text-[#00D4AA]" />
          <span>AI Powered Wealth Intelligence · Built for India 🇮🇳</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-[#0F172A] tracking-tight leading-tight">
          Ask anything about <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-teal-600 via-[#00D4AA] to-blue-600 bg-clip-text text-transparent">
            Markets, Stocks & Money
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-[#475569] max-w-[620px] mx-auto leading-relaxed">
          Analyze real-time market data, explore quantitative research, optimize portfolio allocation, and simulate your wealth milestones.
        </p>
      </div>

      {/* 2. Prominent StockGro-Style Center Ask Bar */}
      <div className="w-full">
        <VestiqInput onSend={onSend} loading={loading} autoFocus />
      </div>

      {/* 3. "What are smart investors asking..." 2x2 Grid (Direct StockGro Inspiration) */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#475569] uppercase tracking-wider">
          <TrendingUp className="w-4 h-4 text-teal-600" />
          <span>What are smart investors asking...</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SMART_INVESTOR_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onSend(q.title)}
              className="p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-[#E2E8F0] hover:border-teal-400 text-left transition-all shadow-xs flex items-center justify-between gap-3 group cursor-pointer"
            >
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                  {q.category}
                </span>
                <p className="text-[13px] font-medium text-[#0F172A] group-hover:text-teal-800 transition-colors leading-snug">
                  {q.title}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-teal-600 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      </div>

      {/* 4. Live Market Intelligence Strip */}
      <div className="pt-1">
        <VestiqMarketStrip onSelectSymbol={(sym) => onSend(`What is ${sym} doing today and what is the market outlook?`)} />
      </div>

      {/* 5. 4 Quick Intelligence Capabilities in Modern Light Cards */}
      <div className="space-y-3 pt-2">
        <div className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
          <span>Financial Intelligence Capabilities</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {INTELLIGENCE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="p-4 rounded-xl bg-white border border-[#E2E8F0] hover:border-teal-300 shadow-xs flex flex-col justify-between space-y-3 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-50 text-teal-700 border border-teal-100">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-[#0F172A] text-sm">{cat.title}</h3>
                  </div>

                  <p className="text-xs text-[#475569] leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2.5 border-t border-[#F1F5F9]">
                  <span className="text-[10.5px] font-semibold text-[#94A3B8] uppercase">Try Asking:</span>
                  <div className="flex flex-col gap-1">
                    {cat.samplePrompts.map((p, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => onSend(p)}
                        className="text-left text-xs text-teal-700 hover:text-teal-800 hover:underline flex items-center justify-between font-medium cursor-pointer py-0.5 group"
                      >
                        <span className="truncate">"{p}"</span>
                        <ArrowRight className="w-3 h-3 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
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
