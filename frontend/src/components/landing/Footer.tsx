import React from 'react';
import { Mail, ShieldCheck } from 'lucide-react';
import { useFintechStore } from '../../store/useFintechStore';
import { BrandLogo } from '../common/BrandLogo';

export const Footer: React.FC = () => {
  const { setActiveView } = useFintechStore();

  return (
    <footer className="bg-[var(--color-bg)] border-t border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-12">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[var(--color-border)]">
          
          {/* Brand & Mission Col (2 cols wide) */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="md" subtitleText="INSTITUTIONAL WEALTH MANAGEMENT" onClick={() => setActiveView('landing')} />
            <p className="text-[var(--color-text-secondary)] text-xs max-w-sm leading-relaxed">
              SmartVest is an independent fiduciary wealth planning platform providing multi-asset strategic allocation, risk profiling, and goal modeling based on modern portfolio theory.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="mailto:advisory@smartvest.com" 
                aria-label="Support Email" 
                className="w-8 h-8 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                <ShieldCheck className="w-4 h-4 text-[#00D4AA]" />
                <span>Non-Custodial Advisory Only · Non-Broker</span>
              </div>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-[var(--color-text-primary)] font-bold text-xs uppercase tracking-wider mb-4">Platform Modules</h4>
            <ul className="space-y-2.5 text-xs">
              <li><button onClick={() => setActiveView('dashboard')} className="hover:text-[var(--color-text-primary)] transition-colors cursor-pointer">Portfolio Dashboard</button></li>
              <li><button onClick={() => setActiveView('market')} className="hover:text-[var(--color-text-primary)] transition-colors cursor-pointer">Market Terminal</button></li>
              <li><button onClick={() => setActiveView('recommendations')} className="hover:text-[var(--color-text-primary)] transition-colors cursor-pointer">Asset Allocation Blueprint</button></li>
              <li><button onClick={() => setActiveView('goals')} className="hover:text-[var(--color-text-primary)] transition-colors cursor-pointer">Lifecycle Goal Planner</button></li>
              <li><button onClick={() => setActiveView('expenses')} className="hover:text-[var(--color-text-primary)] transition-colors cursor-pointer">Expense Tracker</button></li>
              <li><button onClick={() => setActiveView('profile')} className="hover:text-[var(--color-text-primary)] transition-colors cursor-pointer">Investor Mandate</button></li>
            </ul>
          </div>

          {/* Regulatory & Compliance Disclosures */}
          <div>
            <h4 className="text-[var(--color-text-primary)] font-bold text-xs uppercase tracking-wider mb-4">Regulatory Notice</h4>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              SmartVest is an independent strategic wealth planning and quantitative decision-support tool. SmartVest is not a registered broker-dealer, investment custodian, or depository participant, and does not execute securities transactions, hold customer deposits, or guarantee investment returns. All projections and compounding models are estimates for planning purposes.
            </p>
          </div>

        </div>

        {/* Regulatory & Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--color-text-muted)]">
          <p>
            © {new Date().getFullYear()} SmartVest Capital Advisory. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span>Non-Custodial Architecture</span>
            <span>256-Bit SSL Encryption</span>
            <span>Independent Strategic Advisory</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
