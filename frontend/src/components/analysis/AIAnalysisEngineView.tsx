import React, { useState, useEffect } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { Sparkles, Brain, CheckCircle2, TrendingUp, ShieldCheck, PieChart, Layers } from 'lucide-react';

const ANALYSIS_STEPS = [
  { id: 1, title: 'Analyzing monthly income & cashflow stability...', icon: TrendingUp },
  { id: 2, title: 'Analyzing spending patterns & discretionary leaks...', icon: PieChart },
  { id: 3, title: 'Evaluating risk profile & drawdown tolerance...', icon: ShieldCheck },
  { id: 4, title: 'Calculating investable surplus & emergency runway...', icon: Layers },
  { id: 5, title: 'Building custom multi-asset investment strategy...', icon: Brain },
  { id: 6, title: 'Generating personalized instrument recommendations...', icon: Sparkles },
];

export const AIAnalysisEngineView: React.FC = () => {
  const { user, setActiveView } = useFintechStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const stepDuration = 700; // ms per step
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < ANALYSIS_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, stepDuration);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 85);

    const timer = setTimeout(() => {
      setActiveView('recommendations');
    }, 4600);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [setActiveView]);

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full text-center relative z-10 space-y-8">
        
        {/* Animated AI Brain Emblem */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-emerald-500 to-cyan-500 opacity-20 blur-xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-slate-900 border border-emerald-500/40 flex items-center justify-center shadow-2xl">
            <Brain className="w-10 h-10 text-emerald-400 animate-bounce" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
          </div>
        </div>

        {/* Title & User Context */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            SmartVest AI Strategic Engine v2.4
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Synthesizing Strategic Investment Plan
          </h2>
          <p className="text-slate-400 text-sm">
            Evaluating financial DNA for <span className="text-emerald-400 font-semibold">{user?.name || 'Investor'}</span> ({user?.age || 28}y, {user?.riskTolerance || 'Moderate'} Risk)
          </p>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-400">
            <span>AI Synthesis Pipeline</span>
            <span className="text-emerald-400 font-mono font-bold">{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step by Step Execution Timeline */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 text-left space-y-3 shadow-xl backdrop-blur-md">
          {ANALYSIS_STEPS.map((stepItem, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const Icon = stepItem.icon;

            return (
              <div 
                key={stepItem.id}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all duration-300 ${
                  isCurrent 
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold' 
                    : isCompleted 
                    ? 'text-slate-300 opacity-90' 
                    : 'text-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isCurrent ? 'text-emerald-400 animate-spin' : isCompleted ? 'text-emerald-400' : 'text-slate-600'}`} />
                  <span>{stepItem.title}</span>
                </div>
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <span className="text-[10px] text-emerald-400 font-mono animate-pulse">Running...</span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-800 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Status Tip */}
        <div className="text-[11px] text-slate-500">
          SmartVest AI runs 10,000+ stochastic Monte Carlo simulations to optimize risk-adjusted CAGR for your specific horizon.
        </div>

      </div>
    </div>
  );
};
