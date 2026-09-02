import React from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { Sparkles } from 'lucide-react';

export const FloatingAIAssistantButton: React.FC = () => {
  const { setActiveView } = useFintechStore();

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <button
        onClick={() => setActiveView('ai')}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#0D9488] hover:bg-[#0F766E] dark:bg-[#00D4AA] dark:hover:bg-[#00D4AA]/90 text-white dark:text-[#060811] text-xs font-bold shadow-lg shadow-[#0D9488]/20 transition-all cursor-pointer"
        title="Open VestIQ"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Open VestIQ</span>
      </button>
    </div>
  );
};
