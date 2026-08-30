import React from 'react';
import { Star, ShieldCheck, Quote } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'Aditya Sharma',
      role: 'Principal Software Architect, Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      rating: 5,
      content: 'SmartVest AI completely transformed my wealth strategy. The automated asset allocation across Indian index funds and US tech equities helped me achieve a 22.4% portfolio CAGR while keeping downside risk strictly buffered.'
    },
    {
      name: 'Priya Narang',
      role: 'VP Product Management, Mumbai',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      rating: 5,
      content: 'The emergency fund runway analyzer and financial health score provided the exact clarity I needed before purchasing my home. The AI advisor gives institutional-level advice without any pushy sales calls.'
    },
    {
      name: 'Vikram Mehta',
      role: 'Founder & Angel Investor, New Delhi',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      rating: 5,
      content: 'The stock research dashboard with real-time RSI, MACD, and AI Buy/Sell confidence ratings rivals Bloomberg and Zerodha combined. It is an indispensable part of my morning market routine.'
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-slate-950 relative border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 lg:px-12">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
            <ShieldCheck className="w-3.5 h-3.5" /> Backed by 150,000+ Investors
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Trusted by Leaders & <span className="gradient-text-emerald">Savvy Investors</span>
          </h2>
          <p className="text-slate-400 text-base">
            See how smart investors, technology professionals, and entrepreneurs rely on SmartVest AI for daily wealth intelligence.
          </p>
        </div>

        {/* Testimonials 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div 
              key={idx}
              className="glass-panel rounded-2xl p-7 border border-slate-800/80 flex flex-col justify-between relative group hover:border-emerald-500/30 transition-all"
            >
              <div>
                {/* Rating stars */}
                <div className="flex items-center gap-1 mb-4 text-amber-400">
                  {[...Array(t.rating)].map((_, rIdx) => (
                    <Star key={rIdx} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <Quote className="w-8 h-8 text-slate-700/60 mb-2" />

                <p className="text-slate-300 text-sm leading-relaxed mb-6 font-normal">
                  "{t.content}"
                </p>
              </div>

              <div className="flex items-center gap-3.5 pt-4 border-t border-slate-800/80">
                <img 
                  src={t.avatar} 
                  alt={t.name}
                  className="w-11 h-11 rounded-full object-cover border border-emerald-500/30"
                />
                <div>
                  <div className="text-sm font-bold text-white">{t.name}</div>
                  <div className="text-xs text-slate-400">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
