import React from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { TrendingUp, Sparkles, ArrowRight, Sun, Moon } from 'lucide-react';
import { isAuthEnabled } from '../../services/firebase';

export const Navbar: React.FC = () => {
  const { currency, setCurrency, setActiveView, isAuthenticated, user, theme, toggleTheme } = useFintechStore();
  const authEnabled = isAuthEnabled();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/10 px-4 lg:px-12 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveView('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-white">SmartVest</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> AI
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Intelligent Wealth Platform</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
          <a href="#calculator" className="hover:text-emerald-400 transition-colors">SIP Simulator</a>
          <a href="#stats" className="hover:text-emerald-400 transition-colors">Performance</a>
          <a href="#testimonials" className="hover:text-emerald-400 transition-colors">Testimonials</a>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3.5">
          {/* Currency Switcher */}
          <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-lg p-1 text-xs">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                currency === 'INR' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ₹ INR
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                currency === 'USD' 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              $ USD
            </button>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-300" />
            )}
          </button>

          {/* Action Buttons */}
          {user?.onboardingCompleted ? (
            <button
              onClick={() => setActiveView('dashboard')}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:opacity-95 shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              Enter Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          ) : authEnabled && !isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView('auth')}
                className="px-3.5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveView('onboarding')}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:shadow-emerald-500/25 hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveView('onboarding')}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:shadow-emerald-500/25 hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              Start Financial Analysis <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
