import React from 'react';
import { TrendingUp, Mail, ShieldCheck } from 'lucide-react';
import { useFintechStore } from '../../store/useFintechStore';

export const Footer: React.FC = () => {
  const { setActiveView } = useFintechStore();

  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-sm pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-12">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand & Mission Col (2 cols wide) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <TrendingUp className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-white">SmartVest</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  AI
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              SmartVest AI is an independent AI-powered Investment Strategic Advisor. We help individuals understand their finances and receive personalized investment recommendations based on their unique profile.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="mailto:advisor@smartvest.ai" aria-label="Support Email" className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-emerald-400 hover:border-emerald-500/40 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Advisory Only • Non-Broker</span>
              </div>
            </div>
          </div>

          {/* Strategic Navigation Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Strategic Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li><button onClick={() => setActiveView('dashboard')} className="hover:text-emerald-400 transition-colors">Strategic Dashboard</button></li>
              <li><button onClick={() => setActiveView('expenses')} className="hover:text-emerald-400 transition-colors">Expense Tracker</button></li>
              <li><button onClick={() => setActiveView('goals')} className="hover:text-emerald-400 transition-colors">Goal SIP Planner</button></li>
              <li><button onClick={() => setActiveView('recommendations')} className="hover:text-emerald-400 transition-colors">Investment Recommendations</button></li>
              <li><button onClick={() => setActiveView('advisor')} className="hover:text-emerald-400 transition-colors">AI Financial Advisor</button></li>
              <li><button onClick={() => setActiveView('profile')} className="hover:text-emerald-400 transition-colors">Profile & Settings</button></li>
            </ul>
          </div>

          {/* Legal Disclosures */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Disclosures</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              SmartVest AI does not execute trades, receive commissions, or hold client funds. All recommendations are for strategic planning purposes.
            </p>
          </div>

        </div>

        {/* Regulatory & Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} SmartVest AI. All rights reserved. Built for intelligent, data-driven investing.
          </p>
          <div className="flex items-center gap-6">
            <span>Non-Custodial Advisory</span>
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
