import React from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { Sparkles } from 'lucide-react';

export const FloatingAIAssistantButton: React.FC = () => {
  const { setActiveView } = useFintechStore();

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <button
        onClick={() => setActiveView('ai')}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/[0.1] text-slate-700 dark:text-slate-300 hover:text-[#0D9488] dark:hover:text-[#00D4AA] hover:border-[#0D9488]/40 text-xs font-medium shadow-sm transition-colors cursor-pointer"
        title="Open VestIQ"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#0D9488] dark:text-[#00D4AA]" />
        <span>VestIQ</span>
      </button>
    </div>
  );
};
