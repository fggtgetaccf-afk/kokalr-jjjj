/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { StudioView } from './components/StudioView.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { WavePayModal } from './components/WavePayModal.tsx';
import { RecapProject } from './types/index.ts';

const DEFAULT_PROJECT: RecapProject = {
  id: 'proj_default',
  title: 'မြန်မာ ဇာတ်လမ်းအကျဉ်း',
  burmeseTitle: 'အဆုံးစွန်သော တိုက်ပွဲ',
  hook: 'ဒီလူကြီးက သာမန်စားဖိုမှူးတစ်ယောက်လို့ အားလုံးထင်နေကြပေမယ့်... တကယ်တော့ သူဟာ အစိုးရရဲ့ လျှို့ဝှက်အေးဂျင့်ဟောင်းတစ်ယောက် ဖြစ်နေခဲ့ပါတယ်!',
  synopsis: 'အေးဆေးနေထိုင်လိုသော စားဖိုမှူးဟောင်းသည် အပြစ်မဲ့မိန်းကလေးကို ကယ်တင်ရန်အတွက် မိုက်ရိုင်းသောဂိုဏ်းစတားများကို တစ်ယောက်တည်း ပြန်လည်တိုက်ခိုက်ရသည့် အက်ရှင်ဇာတ်ကား။',
  genre: 'action',
  tone: 'heroic',
  videoUrl: '',
  videoName: '',
  videoDuration: 15,
  videoResolution: '1080x1920',
  videoSizeMb: 0,
  aspectRatio: '9:16',
  fitMode: 'fit',
  voiceConfig: {
    voiceId: 'my-MM-NilarNeural',
    speed: 1.0,
    pitch: 1.0,
    volume: 1.0,
    ducking: 'mute',
  },
  subtitleConfig: {
    fontFamily: 'Padauk',
    fontSize: 22,
    fontColor: '#facc15',
    strokeColor: '#000000',
    position: 'bottom',
    hasBackgroundBar: true,
  },
  blurConfig: {
    enabled: true,
    autoDetect: false,
    x: 10,
    y: 82,
    width: 80,
    height: 12,
    intensity: 18,
  },
  segments: [
    {
      id: 1,
      startTime: 0,
      endTime: 5,
      narration: 'ဒီလူကြီးက သာမန်စားဖိုမှူးတစ်ယောက်လို့ အားလုံးထင်နေကြပေမယ့်...',
      sceneAction: 'စားဖိုမှူး အဝတ်အစားဖြင့် အေးဆေးထမင်းကြော်နေပုံ',
      emotion: 'လျှို့ဝှက်ဆန်းကြယ်',
    },
    {
      id: 2,
      startTime: 5,
      endTime: 10,
      narration: 'တကယ်တော့ သူဟာ ကမ္ဘာ့အန္တရာယ်အရှိဆုံး အေးဂျင့်ဟောင်းတစ်ယောက် ဖြစ်နေခဲ့ပါတယ်!',
      sceneAction: 'လူဆိုးများ ရောက်လာပြီး သေနတ်များဖြင့် ချိန်ထားပုံ',
      emotion: 'ရင်ခုန်လှုပ်ရှားဖွယ်',
    },
    {
      id: 3,
      startTime: 10,
      endTime: 15,
      narration: 'ဓားတစ်ချောင်းတည်းနဲ့ ရန်သူတွေကို တစ်ယောက်တည်း ရင်ဆိုင်ရှင်းထုတ်ပြလိုက်တဲ့အခါ...',
      sceneAction: 'ဓားဖြင့် အက်ရှင်တိုက်ခိုက်မှု အပြင်းအထန် စတင်ပုံ',
      emotion: 'အက်ရှင်အထာကျကျ',
    },
  ],
  status: 'draft',
  createdAt: new Date().toISOString(),
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'history' | 'settings'>('studio');
  const [project, setProject] = useState<RecapProject>(DEFAULT_PROJECT);
  const [history, setHistory] = useState<RecapProject[]>([]);
  const [isProUser, setIsProUser] = useState<boolean>(false);
  const [isWavePayOpen, setIsWavePayOpen] = useState<boolean>(false);

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('myanmar_recap_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }

      const savedPro = localStorage.getItem('myanmar_recap_is_pro');
      if (savedPro === 'true') {
        setIsProUser(true);
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  // Save project to history
  const handleSaveProject = (proj: RecapProject) => {
    const newHistory = [proj, ...history.filter((h) => h.id !== proj.id)];
    setHistory(newHistory);
    try {
      localStorage.setItem('myanmar_recap_history', JSON.stringify(newHistory));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  };

  // Delete project from history
  const handleDeleteProject = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    try {
      localStorage.setItem('myanmar_recap_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage delete error:', e);
    }
  };

  // Handle Pro Activation via WavePay
  const handleProActivated = (txId: string) => {
    setIsProUser(true);
    try {
      localStorage.setItem('myanmar_recap_is_pro', 'true');
      localStorage.setItem('myanmar_recap_tx_id', txId);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  // Start new project
  const handleStartNew = () => {
    setProject({
      ...DEFAULT_PROJECT,
      id: 'proj_' + Date.now(),
      videoUrl: '',
      videoName: '',
      title: 'ရုပ်ရှင်အသစ်',
      burmeseTitle: '',
      segments: [],
    });
    setActiveTab('studio');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/80 via-blue-50/30 to-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenWavePay={() => setIsWavePayOpen(true)}
        isProUser={isProUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3.5 sm:px-6 pt-4 pb-12">
        {activeTab === 'studio' && (
          <StudioView
            project={project}
            setProject={setProject}
            onSaveProject={handleSaveProject}
            onOpenWavePay={() => setIsWavePayOpen(true)}
            isProUser={isProUser}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onSelectProject={(selected) => {
              setProject(selected);
              setActiveTab('studio');
            }}
            onDeleteProject={handleDeleteProject}
            onStartNew={handleStartNew}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            onOpenWavePay={() => setIsWavePayOpen(true)}
            isProUser={isProUser}
          />
        )}
      </main>

      {/* Persistent Bottom Tab Navigation for Mobile Thumb Zones */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* WavePay VIP Upgrade Modal */}
      <WavePayModal
        isOpen={isWavePayOpen}
        onClose={() => setIsWavePayOpen(false)}
        onSuccess={handleProActivated}
        isProUser={isProUser}
      />
    </div>
  );
}
