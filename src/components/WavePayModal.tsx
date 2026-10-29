import React, { useState } from 'react';
import { X, Check, Copy, ShieldCheck, Smartphone, Zap, CheckCircle2 } from 'lucide-react';

interface WavePayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (txId: string) => void;
  isProUser: boolean;
}

export const WavePayModal: React.FC<WavePayModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isProUser,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'BASIC' | 'PRO'>('PRO');
  const [transactionId, setTransactionId] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const waveNumber = '09797879485';
  const accountName = 'MYANMAR RECAP PRO';

  const handleCopy = () => {
    navigator.clipboard.writeText(waveNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim() || transactionId.trim().length < 6) {
      setErrorMsg('ကျေးဇူးပြု၍ တရားဝင် WavePay Transaction ID (အနည်းဆုံး ၆ လုံး) ထည့်သွင်းပေးပါ။');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/pro/submit-wave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: transactionId.trim(),
          plan: selectedPlan,
          senderPhone: 'User Mobile',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'အချက်အလက် စစ်ဆေးမှု မအောင်မြင်ပါ။');
      }

      setSuccessMsg(data.message || 'VIP အကောင့်ကို အောင်မြင်စွာ ဖွင့်လှစ်လိုက်ပါပြီ။');
      setTimeout(() => {
        onSuccess(transactionId.trim());
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'ဆာဗာနှင့် ချိတ်ဆက်၍ မရပါ။');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar border border-sky-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-400 text-slate-900 flex items-center justify-center font-bold text-sm shadow-xs">
              W
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">WavePay အဆင့်မြှင့်တင်ခြင်း</h3>
              <p className="text-[11px] text-slate-500">Myanmar Recap AI VIP Member</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-2 gap-2 my-4">
          <button
            type="button"
            onClick={() => setSelectedPlan('BASIC')}
            className={`p-3 rounded-2xl text-left border transition-all ${
              selectedPlan === 'BASIC'
                ? 'border-sky-500 bg-sky-50/60 shadow-xs'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-bold text-slate-800">BASIC PLAN</span>
              {selectedPlan === 'BASIC' && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
            </div>
            <div className="text-sm font-extrabold text-sky-600 mb-1">၅,၀၀၀ ကျပ် / လ</div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              · 1080p Export (၁၅ ခု/ရက်)<br />
              · မြန်မာအမျိုးသမီး/အမျိုးသားသံ<br />
              · ရေစာမပါဘဲ ထုတ်ယူခြင်း
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPlan('PRO')}
            className={`p-3 rounded-2xl text-left border transition-all relative overflow-hidden ${
              selectedPlan === 'PRO'
                ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="absolute top-0 right-0 bg-yellow-400 text-slate-900 text-[9px] font-black px-2 py-0.5 rounded-bl-lg">
              လူကြိုက်အများဆုံး
            </div>
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-bold text-slate-800">PRO VIP PLAN</span>
              {selectedPlan === 'PRO' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
            </div>
            <div className="text-sm font-extrabold text-blue-600 mb-1">၁၀,၀၀၀ ကျပ် / လ</div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              · အကန့်အသတ်မရှိ ဗီဒီယိုထုတ်ခြင်း<br />
              · Auto Subtitle & Blur Remover<br />
              · Fast Server Rendering
            </p>
          </button>
        </div>

        {/* WavePay Transfer Info Box */}
        <div className="p-3.5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-yellow-200/80 mb-4">
          <div className="text-[11px] font-bold text-yellow-900 mb-1.5 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-yellow-700" />
            WavePay ငွေလွှဲရန် အချက်အလက်
          </div>
          <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-yellow-100 mb-1.5">
            <div>
              <div className="text-[10px] text-slate-400">Wave Money ဖုန်းနံပါတ်</div>
              <div className="text-sm font-black text-slate-900 tracking-wider">{waveNumber}</div>
              <div className="text-[10px] text-slate-600 font-medium">{accountName}</div>
            </div>
            <button
              onClick={handleCopy}
              type="button"
              className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 text-xs font-bold rounded-lg flex items-center gap-1 transition-transform active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'ကူးပြီး' : 'Copy'}
            </button>
          </div>
          <p className="text-[10px] text-slate-600 leading-tight">
            Wave Pay Application ထဲသို့သွား၍ သတ်မှတ်ငွေပမာဏ လွှဲပြီးပါက ရရှိလာသော <b>Transaction ID</b> ကို အောက်တွင် ဖြည့်သွင်းပါ။
          </p>
        </div>

        {/* Transaction ID Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              WavePay Transaction ID (ငွေလွှဲအမှတ်)
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="ဥပမာ - 984729184719"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-mono"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-1.5 font-medium">
              <Check className="w-4 h-4" />
              {successMsg}
            </div>
          )}

          <div className="pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-500/25 flex items-center justify-center gap-1.5 transition-transform active:scale-98 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              {submitting ? 'စစ်ဆေးနေပါသည်...' : 'ငွေလွှဲပြေစာ အတည်ပြုမည်'}
            </button>
          </div>
        </form>

        <p className="text-[10px] text-slate-400 text-center mt-3">
          ငွေလွှဲစနစ်နှင့် ပတ်သက်၍ အခက်အခဲရှိပါက WavePay ဖုန်း 09797879485 သို့ တိုက်ရိုက် ဆက်သွယ်မေးမြန်းနိုင်ပါသည်။
        </p>
      </div>
    </div>
  );
};
