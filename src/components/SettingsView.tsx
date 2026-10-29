import React, { useState, useEffect } from 'react';
import { Server, Cpu, Volume2, Type, Sliders, ShieldCheck, CheckCircle2, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { BackendHealth } from '../types/index.ts';

interface SettingsViewProps {
  onOpenWavePay: () => void;
  isProUser: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenWavePay, isProUser }) => {
  const [engineType, setEngineType] = useState<'internal' | 'external'>('internal');
  const [flaskUrl, setFlaskUrl] = useState('http://localhost:5000');
  const [healthStatus, setHealthStatus] = useState<BackendHealth | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState('');

  // Default AI & Video configs
  const [aiModel, setAiModel] = useState('gemini-3.8-flash');
  const [defaultVoice, setDefaultVoice] = useState('my-MM-NilarNeural');
  const [defaultSpeed, setDefaultSpeed] = useState(1.0);
  const [defaultResolution, setDefaultResolution] = useState('1080p');
  const [autoBlurDefault, setAutoBlurDefault] = useState(true);

  const checkHealth = async () => {
    setChecking(true);
    setCheckError('');
    try {
      const url = engineType === 'internal' ? '/api/health' : `${flaskUrl.replace(/\/$/, '')}/api/health`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();
      setHealthStatus(data);
    } catch (err: any) {
      setCheckError(err.message || 'ဆာဗာနှင့် ချိတ်ဆက်၍ မရပါ။ Backend လည်ပတ်နေခြင်း ရှိမရှိ စစ်ဆေးပါ။');
      setHealthStatus(null);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, [engineType]);

  return (
    <div className="space-y-4 pb-24">
      {/* Page Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">ဆက်တင်များ (Settings & Engine)</h2>
        <p className="text-xs text-slate-500">AI စနစ်၊ ဘာသာစကားအသံနှင့် ဆာဗာချိတ်ဆက်မှုများ</p>
      </div>

      {/* Plan Status Banner */}
      <div className="card-3d-glow rounded-3xl p-4 border border-sky-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isProUser ? 'bg-amber-400 text-slate-900' : 'bg-sky-500 text-white'
            }`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">လက်ရှိအဆင့်:</span>
                <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                  isProUser ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                }`}>
                  {isProUser ? 'PRO VIP MEMBER' : 'FREE PLAN (အခမဲ့)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isProUser
                  ? 'အကန့်အသတ်မရှိ 1080p Export နှင့် မြန်မာ AI အသံများ အားလုံးဖွင့်ထားပါသည်'
                  : 'တစ်ရက်လျှင် ဗီဒီယို ၃ ခု အခမဲ့ဖန်တီးနိုင်သည်'}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenWavePay}
            className="px-3.5 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95"
          >
            {isProUser ? 'အချက်အလက်' : 'WavePay အဆင့်မြှင့်'}
          </button>
        </div>
      </div>

      {/* Backend Engine Architecture Selection */}
      <div className="card-3d rounded-3xl p-4 border border-sky-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">Backend Processing Engine</h3>
          </div>
          <button
            onClick={checkHealth}
            disabled={checking}
            className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin' : ''}`} />
            ပြန်လည်စစ်ဆေး
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setEngineType('internal')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              engineType === 'internal'
                ? 'border-sky-500 bg-sky-50/60 shadow-xs'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900">Cloud Engine</span>
              {engineType === 'internal' && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
            </div>
            <p className="text-[10px] text-slate-500">
              AI Studio Full-stack Server (Gemini 3.8 Flash ပါဝင်ပြီး အသင့်သုံးနိုင်)
            </p>
          </button>

          <button
            type="button"
            onClick={() => setEngineType('external')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              engineType === 'external'
                ? 'border-sky-500 bg-sky-50/60 shadow-xs'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900">Self-Hosted Flask</span>
              {engineType === 'external' && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
            </div>
            <p className="text-[10px] text-slate-500">
              မိမိကိုယ်ပိုင် Python Server (Faster-Whisper, Edge-TTS, FFmpeg)
            </p>
          </button>
        </div>

        {engineType === 'external' && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Flask Server URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={flaskUrl}
                onChange={(e) => setFlaskUrl(e.target.value)}
                placeholder="http://localhost:5000"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
              <button
                onClick={checkHealth}
                className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-medium"
              >
                Connect
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              `/backend` folder ထဲရှိ Docker သို့မဟုတ် Flask `app.py` ကို Run ပြီး URL ချိတ်ဆက်ပါ။
            </p>
          </div>
        )}

        {/* Live Engine Status Badge */}
        {healthStatus && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{healthStatus.service} - ချိတ်ဆက်မှု အောင်မြင်သည်</span>
            </div>
            <div className="text-[11px] text-emerald-700 flex flex-wrap gap-x-3 gap-y-0.5">
              <span>Gemini API: {healthStatus.hasGeminiKey ? '✅ အသင့်ဖြစ်သည်' : '⚠️ စစ်ဆေးရန်'}</span>
              <span>Model: {healthStatus.model || 'gemini-3.8-flash'}</span>
              <span>Edge-TTS: အသင့်ရှိ</span>
            </div>
          </div>
        )}

        {checkError && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">ချိတ်ဆက်မှု မှတ်ချက်:</div>
              <p className="text-[11px] text-amber-700">{checkError}</p>
            </div>
          </div>
        )}
      </div>

      {/* AI Model Configuration */}
      <div className="card-3d rounded-3xl p-4 border border-sky-100 space-y-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-bold text-slate-900">AI Model Settings (Gemini)</h3>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            AI ဇာတ်ညွှန်းရေးမည့် Model
          </label>
          <select
            value={aiModel}
            onChange={(e) => setAiModel(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500"
          >
            <option value="gemini-3.8-flash">gemini-3.8-flash (အမြန်ဆန်ဆုံးနှင့် မြန်မာစကား အကောင်းဆုံး)</option>
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (ပေါ့ပါးမြန်ဆန်သောဗားရှင်း)</option>
          </select>
          <p className="text-[10px] text-slate-400 mt-1">
            * Gemini API Key ကို Server-side Environment Variables ထဲတွင် လုံခြုံစွာ သိမ်းဆည်းထားပါသည်။
          </p>
        </div>
      </div>

      {/* Voice & Video Defaults */}
      <div className="card-3d rounded-3xl p-4 border border-sky-100 space-y-3">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-bold text-slate-900">အသံနှင့် ဗီဒီယို ပုံသေဆက်တင်များ</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              မူရင်း မြန်မာ AI အသံ
            </label>
            <select
              value={defaultVoice}
              onChange={(e) => setDefaultVoice(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
            >
              <option value="my-MM-NilarNeural">မြန်မာအမျိုးသမီးသံ (Nilar Neural - ချိုသာကြည်လင်)</option>
              <option value="my-MM-ThihaNeural">မြန်မာအမျိုးသားသံ (Thiha Neural - တည်ကြည်အားမာန်)</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>ပုံသေ အသံပြောနှုန်း (Speed)</span>
              <span>{defaultSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.4"
              step="0.1"
              value={defaultSpeed}
              onChange={(e) => setDefaultSpeed(parseFloat(e.target.value))}
              className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ဗီဒီယို ထုတ်ယူမှု အရည်အသွေး (Resolution)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDefaultResolution('1080p')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                  defaultResolution === '1080p'
                    ? 'border-sky-500 bg-sky-50 text-sky-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                1080p Full HD (Recommended)
              </button>
              <button
                type="button"
                onClick={() => setDefaultResolution('720p')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                  defaultResolution === '720p'
                    ? 'border-sky-500 bg-sky-50 text-sky-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                720p HD (ဖုန်းနိမ့်များအတွက်)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
