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
    color: '#00D4AA',
    description: 'Ask about NIFTY, SENSEX, NASDAQ, Gold trends, and macroeconomic movements.',
    samplePrompts: ['What is Nifty doing today?', 'Why is gold rising as a hedge?', 'US market tech outlook']
  },
  {
    id: 'portfolio',
    title: 'Portfolio Intelligence',
    icon: Layers,
    color: '#1E88E5',
    description: 'Evaluate portfolio diversification, risk capacity, asset overlap, and mandate alignment.',
    samplePrompts: ['Review my portfolio', 'Am I too concentrated in Nifty?', 'Explain my asset allocation']
  },
  {
    id: 'research',
    title: 'Investment Research',
    icon: Search,
    color: '#00D4AA',
    description: 'Deep-dive into individual direct index funds, ETFs, stocks, global tech, and bonds.',
    samplePrompts: ['Suggest some US stocks', 'Is MON100 a good ETF?', 'Explain direct index fund benefits']
  },
  {
    id: 'planning',
    title: 'Financial Planning',
    icon: Compass,
    color: '#1E88E5',
    description: 'Simulate monthly SIPs, milestone target dates, emergency fund runways, and affordability.',
    samplePrompts: ['How much SIP for ₹1 crore?', 'Can I afford a ₹10 lakh car?', 'Where should I invest surplus?']
  }
];

export const VestiqEmptyState: React.FC<VestiqEmptyStateProps> = ({ onSend, loading }) => {
  const cardStyle = {
    background: '#101827',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
  };

  return (
    <div className="w-full max-w-[860px] mx-auto space-y-6 py-4 sm:py-6 font-sans animate-fade-in">
      
      {/* 1. Hero Title & Subtitle */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A1022] border border-white/[0.08] text-xs font-bold text-[#00D4AA] mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[#00D4AA]" />
          <span>VestIQ Intelligence Workspace</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
          How can <span className="text-[#00D4AA]">VestIQ</span> assist your wealth strategy?
        </h1>

        <p className="text-xs sm:text-sm text-[#8A94A6] max-w-[620px] mx-auto leading-relaxed">
          Analyze real-time market data, explore institutional research, optimize portfolio allocation, and simulate your wealth milestones.
        </p>
      </div>

      {/* 2. Large AI Input Area */}
      <div className="w-full">
        <VestiqInput onSend={onSend} loading={loading} autoFocus />
      </div>

      {/* 3. Suggested Questions Pills */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#8A94A6] uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Suggested Queries:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onSend(q)}
              className="px-3 py-1.5 rounded-lg bg-[#0A1022] hover:bg-[#141F36] border border-white/[0.08] text-white text-xs font-medium transition-all hover:border-[#00D4AA]/40 flex items-center gap-1.5 cursor-pointer text-left"
            >
              <span>{q}</span>
              <ArrowRight className="w-3 h-3 text-[#00D4AA] shrink-0" />
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
        <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <span>Financial Intelligence Capabilities</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {INTELLIGENCE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                style={cardStyle}
                className="p-4 flex flex-col justify-between space-y-3 hover:border-[#00D4AA]/30 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#0A1022] text-[#00D4AA]">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-white text-sm">{cat.title}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-[#8A94A6] leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                  <span className="text-[10.5px] font-semibold text-[#5A667A] uppercase">Try Asking:</span>
                  <div className="flex flex-col gap-1">
                    {cat.samplePrompts.map((p, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => onSend(p)}
                        className="text-left text-xs text-[#00D4AA] hover:underline flex items-center justify-between font-medium cursor-pointer py-0.5 group"
                      >
                        <span className="truncate">"{p}"</span>
                        <ArrowRight className="w-3 h-3 text-[#00D4AA] opacity-0 group-hover:opacity-100 transition-opacity" />
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
