import React from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { Sparkles } from 'lucide-react';

export const FloatingAIAssistantButton: React.FC = () => {
  const { setActiveView } = useFintechStore();

  return (
    <div className="fixed bottom-5 right-5 z-40 animate-fade-in">
      <button
        onClick={() => setActiveView('ai')}
        className="group relative flex items-center gap-2 px-3.5 py-2.5 rounded-full glow-btn-primary text-white font-bold text-xs shadow-lg shadow-teal-900/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="Open VestIQ Financial Intelligence Workspace"
      >
        <div className="w-5 h-5 rounded-full bg-black/30 text-teal-300 flex items-center justify-center">
          <Sparkles className="w-3 h-3 stroke-[2.5]" />
        </div>
        <span className="tracking-tight">Open VestIQ</span>
        <Sparkles className="w-3.5 h-3.5 text-teal-200 group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
};
