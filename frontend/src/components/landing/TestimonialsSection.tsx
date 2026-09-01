import React from 'react';
import { Star, ShieldCheck, Quote } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'Aditya Sharma',
      role: 'Principal Systems Architect, Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      rating: 5,
      content: 'SmartVest transformed our wealth strategy. The multi-asset allocation across index funds and global equity satellites provides clear compounding visibility while keeping downside risk strictly budgeted.'
    },
    {
      name: 'Priya Narang',
      role: 'VP Product Strategy, Mumbai',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      rating: 5,
      content: 'The emergency fund runway analyzer and financial health audit provided the exact quantitative rigor I needed before planning property purchases. Institutional quality without distributor bias.'
    },
    {
      name: 'Vikram Mehta',
      role: 'Managing Partner, New Delhi',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      rating: 5,
      content: 'The market research terminal with real-time exchange feeds across NSE and US equities gives exceptional transparency. It has replaced scattered spreadsheets with institutional-grade discipline.'
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-[#050816] relative border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 lg:px-12">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#0A1022] border border-white/[0.08] text-[#8A94A6] text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00D4AA]" />
            <span>Client Endorsements</span>
          </div>
          <h2 
            className="text-3xl sm:text-4xl font-extrabold text-white tracking-[-0.02em]"
            style={{ fontFamily: "'Inter Tight', 'Inter', sans-serif" }}
          >
            Trusted By Technology & Business Leaders
          </h2>
          <p className="text-[#8A94A6] text-base">
            How technology executives, corporate professionals, and entrepreneurs use SmartVest for disciplined wealth governance.
          </p>
        </div>

        {/* Testimonials 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div 
              key={idx}
              className="bg-[#101827] rounded-xl p-6 border border-white/[0.08] flex flex-col justify-between"
            >
              <div>
                {/* Rating stars */}
                <div className="flex items-center gap-1 mb-3.5 text-amber-400">
                  {[...Array(t.rating)].map((_, rIdx) => (
                    <Star key={rIdx} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>

                <Quote className="w-6 h-6 text-[#5A667A] mb-2" />

                <p className="text-[#8A94A6] text-xs leading-relaxed mb-6 font-normal">
                  "{t.content}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                <img 
                  src={t.avatar} 
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-white/[0.12]"
                />
                <div>
                  <div className="text-sm font-bold text-white">{t.name}</div>
                  <div className="text-[11px] text-[#8A94A6]">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
