import React, { useState, useEffect } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  PieChart, 
  Layers,
  Cpu,
  BarChart3
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

const ANALYSIS_STEPS = [
  { id: 1, title: 'Analyzing cashflow stability & net investable surplus...', icon: TrendingUp },
  { id: 2, title: 'Evaluating multi-factor drawdown limits & risk mandate...', icon: ShieldCheck },
  { id: 3, title: 'Simulating 10,000+ stochastic Monte Carlo market pathways...', icon: Cpu },
  { id: 4, title: 'Optimizing Modern Portfolio Theory (MPT) asset frontier...', icon: PieChart },
  { id: 5, title: 'Calibrating multi-asset core & satellite capital allocations...', icon: Layers },
  { id: 6, title: 'Generating customized instrument recommendations...', icon: BarChart3 },
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
    <div className="min-h-screen bg-[#050816] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Subtle Ambient Gradients */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00D4AA]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-[#1E88E5]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full text-center relative z-10 space-y-7">
        
        {/* Institutional Monogram Centerpiece */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <BrandLogo size="lg" subtitleText="QUANTITATIVE ADVISORY ENGINE" />
        </div>

        {/* Title & Investor Mandate Context */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#0A1022] border border-white/[0.08] text-[#00D4AA] text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-ping" />
            <span>SmartVest Portfolio Strategy Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-serif">
            Synthesizing Strategic Investment Allocation
          </h2>
          <p className="text-[#8A94A6] text-xs">
            Evaluating financial DNA for <span className="text-white font-semibold">{user?.name || 'Investor'}</span> ({user?.age || 28}y, <span className="text-[#00D4AA] font-semibold">{user?.riskTolerance || 'Moderate'} Mandate</span>)
          </p>
        </div>

        {/* Dynamic Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-[#8A94A6]">
            <span>Portfolio Optimization Progress</span>
            <span className="text-[#00D4AA] font-mono font-bold">{progress}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#0A1022] border border-white/[0.06] overflow-hidden">
            <div 
              className="h-full bg-[#00D4AA] rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step-by-Step Execution Sequence */}
        <div className="bg-[#101827] border border-white/[0.08] rounded-xl p-5 text-left space-y-2.5 shadow-2xl">
          {ANALYSIS_STEPS.map((stepItem, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const Icon = stepItem.icon;

            return (
              <div 
                key={stepItem.id}
                className={`flex items-center justify-between p-2.5 rounded-lg text-xs transition-all duration-300 ${
                  isCurrent 
                    ? 'bg-[#00D4AA]/10 border border-[#00D4AA]/30 text-white font-semibold' 
                    : isCompleted 
                    ? 'text-[#8A94A6] opacity-90' 
                    : 'text-[#5A667A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isCurrent ? 'text-[#00D4AA]' : isCompleted ? 'text-[#00D4AA]' : 'text-[#5A667A]'}`} />
                  <span>{stepItem.title}</span>
                </div>
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-[#00D4AA] shrink-0" />
                ) : isCurrent ? (
                  <span className="text-[10px] text-[#00D4AA] font-mono animate-pulse">Running...</span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-white/[0.1] shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Institutional Fiduciary Note */}
        <div className="text-[11px] text-[#8A94A6]">
          Stochastic simulations apply Modern Portfolio Theory (MPT) to optimize risk-adjusted alpha for your investment horizon.
        </div>

      </div>
    </div>
  );
};
