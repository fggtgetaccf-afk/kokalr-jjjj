import React from 'react';
import { Film, History, Sliders, Sparkles } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'studio' | 'history' | 'settings';
  setActiveTab: (tab: 'studio' | 'history' | 'settings') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-sky-100 shadow-lg md:hidden">
      <div className="grid grid-cols-3 h-16 max-w-md mx-auto items-center px-4">
        <button
          onClick={() => setActiveTab('studio')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeTab === 'studio' ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Film className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight">စတူဒီယို</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeTab === 'history' ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <History className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight">မှတ်တမ်း</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeTab === 'settings' ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sliders className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight">ဆက်တင်</span>
        </button>
      </div>
    </div>
  );
};
