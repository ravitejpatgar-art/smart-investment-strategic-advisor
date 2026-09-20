import React from 'react';
import { 
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
    color: 'var(--color-accent)',
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
    color: 'var(--color-accent)',
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
      
      {/* 1. Centered Hero */}
      <div className="text-center space-y-3 pt-2 sm:pt-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-accent)]">
          <span>Institutional Wealth Advisory</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-[var(--color-text-primary)] tracking-tight leading-tight">
          Ask anything about <br className="hidden sm:inline" />
          <span className="text-[var(--color-text-accent)]">
            Markets, Stocks & Asset Allocation
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-[620px] mx-auto leading-relaxed">
          Analyze real-time market data, explore quantitative research, optimize portfolio allocation, and simulate your wealth milestones.
        </p>
      </div>

      {/* 2. Prominent Center Ask Bar */}
      <div className="w-full">
        <VestiqInput onSend={onSend} loading={loading} autoFocus />
      </div>

      {/* 3. Suggested Inquiries - Open Ledger */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--color-text-secondary)] uppercase tracking-wider pb-1">
          <TrendingUp className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span>Suggested Research Queries</span>
        </div>

        <div className="divide-y divide-[var(--color-border-subtle)] border-y border-[var(--color-border-subtle)]">
          {SMART_INVESTOR_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onSend(q.title)}
              className="py-3 px-2 w-full text-left transition-colors hover:bg-[var(--color-surface-soft)]/50 flex items-center justify-between gap-4 group cursor-pointer focus:outline-none"
            >
              <div className="space-y-0.5 min-w-0 flex-1">
                <span className="text-[10px] font-mono font-bold text-[var(--color-accent)] uppercase tracking-wider block">
                  {q.category}
                </span>
                <p className="text-[13.5px] font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors leading-snug">
                  {q.title}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] shrink-0 transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      </div>

      {/* 4. Live Market Intelligence Strip */}
      <div className="pt-1">
        <VestiqMarketStrip onSelectSymbol={(sym) => onSend(`What is ${sym} doing today and what is the market outlook?`)} />
      </div>

      {/* 5. Advisory Capabilities - Open Grid */}
      <div className="space-y-3 pt-2">
        <div className="text-xs font-mono font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-[var(--color-border-subtle)]">
          <span>Advisory Capabilities</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
          {INTELLIGENCE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="space-y-2.5 pb-4 border-b border-[var(--color-border-subtle)]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                    <h3 className="font-bold text-[var(--color-text-primary)] text-sm">{cat.title}</h3>
                  </div>

                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-mono font-semibold text-[var(--color-text-muted)] uppercase">Example Inquiries:</span>
                  <div className="flex flex-col gap-1">
                    {cat.samplePrompts.map((p, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => onSend(p)}
                        className="text-left text-xs text-[var(--color-accent)] hover:underline flex items-center justify-between font-medium cursor-pointer py-0.5 group"
                      >
                        <span className="truncate">"{p}"</span>
                        <ArrowRight className="w-3 h-3 text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
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
