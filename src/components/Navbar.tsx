import React from 'react';
import { Crown, Sparkles, Smartphone } from 'lucide-react';

interface NavbarProps {
  activeTab: 'studio' | 'history' | 'settings';
  setActiveTab: (tab: 'studio' | 'history' | 'settings') => void;
  onOpenWavePay: () => void;
  isProUser: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenWavePay,
  isProUser,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-sky-100 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => setActiveTab('studio')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-400/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-slate-900 leading-none">
              MYANMAR RECAP <span className="text-sky-600">AI</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium">မြန်မာ AI ဇာတ်လမ်းပြော</span>
          </div>
        </div>

        {/* Zone 2: Clean Single-Line Nav Links (Desktop/Tablet) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('studio')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'studio' ? 'text-sky-600 font-bold border-b-2 border-sky-600' : 'hover:text-slate-900'
            }`}
          >
            ဗီဒီယိုစတူဒီယို
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'history' ? 'text-sky-600 font-bold border-b-2 border-sky-600' : 'hover:text-slate-900'
            }`}
          >
            မှတ်တမ်းဟောင်း
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'settings' ? 'text-sky-600 font-bold border-b-2 border-sky-600' : 'hover:text-slate-900'
            }`}
          >
            ဆက်တင်များ
          </button>
        </nav>

        {/* Zone 3: 1 Primary CTA Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenWavePay}
            className={`h-9 px-3.5 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-all shadow-sm ${
              isProUser
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sky-500/20 active:scale-95'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap shrink-0">
              {isProUser ? 'PRO VIP' : 'PRO အဆင့်မြှင့်ရန်'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
