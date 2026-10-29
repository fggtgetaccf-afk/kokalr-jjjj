import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Sparkles,
  Volume2,
  Type,
  Eye,
  Download,
  Play,
  Pause,
  RefreshCw,
  Plus,
  Trash2,
  Sliders,
  Maximize2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Video as VideoIcon,
  Crop,
  Shield,
  Layers,
} from 'lucide-react';
import { RecapProject, ScriptSegment } from '../types/index.ts';
import { createCinematicSampleVideo } from '../utils/sampleVideo.ts';
import { speakBurmeseText, stopSpeaking } from '../utils/audioSynthesizer.ts';
import { renderRecapVideo, RenderProgress } from '../utils/videoRenderer.ts';

interface StudioViewProps {
  project: RecapProject;
  setProject: React.Dispatch<React.SetStateAction<RecapProject>>;
  onSaveProject: (proj: RecapProject) => void;
  onOpenWavePay: () => void;
  isProUser: boolean;
}

export const StudioView: React.FC<StudioViewProps> = ({
  project,
  setProject,
  onSaveProject,
  onOpenWavePay,
  isProUser,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Video playback
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  // Script generation state
  const [promptContext, setPromptContext] = useState('');
  const [dialogueHints, setDialogueHints] = useState('');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [scriptError, setScriptError] = useState('');

  // Voiceover testing
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Video Rendering modal state
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState<RenderProgress | null>(null);
  const [renderedBlobUrl, setRenderedBlobUrl] = useState<string | null>(null);
  const [renderFilename, setRenderFilename] = useState('');

  // Loading Sample Video
  const [loadingSample, setLoadingSample] = useState(false);

  // Handle Video File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|mkv)$/i)) {
      alert('ကျေးဇူးပြု၍ MP4, WebM, သို့မဟုတ် MOV ဗီဒီယိုဖိုင်ကိုသာ ရွေးချယ်ပေးပါ။');
      return;
    }

    const url = URL.createObjectURL(file);
    const sizeMb = Math.round((file.size / (1024 * 1024)) * 10) / 10;

    setProject((prev) => ({
      ...prev,
      videoUrl: url,
      videoName: file.name,
      videoSizeMb: sizeMb,
      title: file.name.replace(/\.[^/.]+$/, ''),
    }));
  };

  // Generate Sample Video
  const handleLoadSample = async () => {
    setLoadingSample(true);
    try {
      const sample = await createCinematicSampleVideo(15);
      setProject((prev) => ({
        ...prev,
        videoUrl: sample.url,
        videoName: sample.name,
        videoSizeMb: 4.2,
        title: 'Action Thriller Teaser',
        burmeseTitle: 'အဆုံးစွန်သော တိုက်ပွဲ',
        hook: 'ဒီလူကြီးက သာမန်စားဖိုမှူးတစ်ယောက်လို့ အားလုံးထင်နေကြပေမယ့်... တကယ်တော့ သူဟာ အစိုးရရဲ့ လျှို့ဝှက်အေးဂျင့်ဟောင်းတစ်ယောက် ဖြစ်နေခဲ့ပါတယ်!',
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
      }));
    } catch (err) {
      console.error(err);
      alert('နမူနာဗီဒီယို ဖန်တီးရာတွင် အမှားတစ်ခု ဖြစ်ပေါ်ခဲ့ပါသည်။');
    } finally {
      setLoadingSample(false);
    }
  };

  // Toggle Video Play/Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Handle Time Update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Handle Video Metadata Loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      const res = `${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`;
      setVideoDuration(dur);
      setProject((prev) => ({
        ...prev,
        videoDuration: dur,
        videoResolution: res,
      }));
    }
  };

  // AI Script Generation
  const handleGenerateScript = async () => {
    if (!project.title && !promptContext) {
      setScriptError('ဇာတ်ကားခေါင်းစဉ် သို့မဟုတ် အကြောင်းအရာကို ထည့်သွင်းပေးပါ။');
      return;
    }

    setIsGeneratingScript(true);
    setScriptError('');

    try {
      const res = await fetch('/api/recap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: project.title,
          genre: project.genre,
          tone: project.tone,
          targetDuration: Math.round(project.videoDuration || 60),
          context: promptContext,
          dialogueHints: dialogueHints,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI ဇာတ်ညွှန်း ထုတ်ယူမှု မအောင်မြင်ပါ။');
      }

      if (data.data) {
        const d = data.data;
        const mappedSegments = (d.segments || []).map((s: any, idx: number) => ({
          id: s.id || idx + 1,
          startTime: s.startTime || idx * 10,
          endTime: s.endTime || (idx + 1) * 10,
          narration: s.narration || '',
          sceneAction: s.sceneAction || '',
          emotion: s.emotion || '',
        }));

        setProject((prev) => ({
          ...prev,
          burmeseTitle: d.burmeseTitle || prev.burmeseTitle || prev.title,
          hook: d.hook || prev.hook,
          synopsis: d.synopsis || prev.synopsis,
          segments: mappedSegments.length > 0 ? mappedSegments : prev.segments,
        }));

        // Move smoothly to Step 2
        setActiveStep(2);
      }
    } catch (err: any) {
      setScriptError(err.message || 'ဆာဗာနှင့် ချိတ်ဆက်၍ မရပါ။');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Audio Narration Preview
  const handlePreviewVoice = (textToSpeak?: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const scriptText =
      textToSpeak ||
      project.hook ||
      project.segments.map((s) => s.narration).join(' ') ||
      'မြန်မာ ဇာတ်လမ်းအကျဉ်း ချုပ်ဗီဒီယို ဖန်တီးစနစ် ဖြစ်ပါသည်။';

    setIsSpeaking(true);
    speakBurmeseText(
      scriptText,
      {
        voiceId: project.voiceConfig.voiceId,
        rate: project.voiceConfig.speed,
        pitch: project.voiceConfig.pitch,
        volume: project.voiceConfig.volume,
      },
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  // Render Video
  const handleStartRender = async () => {
    if (!videoRef.current) {
      alert('ဗီဒီယိုဖိုင် မရှိသေးပါ။ ဦးစွာ ဗီဒီယိုတင်ပေးပါ။');
      return;
    }

    setIsRendering(true);
    setRenderProgress({
      percent: 0,
      stage: 'ပြင်ဆင်နေပါသည် (Preparing)...',
      currentSecond: 0,
      totalSeconds: Math.round(videoDuration || 30),
    });

    try {
      const result = await renderRecapVideo(
        videoRef.current,
        project,
        (p) => setRenderProgress(p)
      );

      setRenderedBlobUrl(result.url);
      setRenderFilename(result.filename);
      const updated = {
        ...project,
        renderedVideoUrl: result.url,
        status: 'completed' as const,
      };
      setProject(updated);
      onSaveProject(updated);
    } catch (err: any) {
      console.error('Render error:', err);
      alert('ဗီဒီယို ထုတ်ယူမှုတွင် အမှားတစ်ခု ဖြစ်ပေါ်ခဲ့ပါသည်။');
      setIsRendering(false);
    }
  };

  // Subtitle SRT download
  const handleDownloadSRT = async () => {
    try {
      const res = await fetch('/api/subtitles/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segments: project.segments,
          format: 'srt',
        }),
      });
      const data = await res.json();
      if (data.content) {
        const blob = new Blob([data.content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.burmeseTitle || 'myanmar_subtitles'}.srt`;
        a.click();
      }
    } catch (e) {
      alert('SRT ဒေါင်းလုဒ် မအောင်မြင်ပါ။');
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Step Indicator Tabs (Mobile-friendly thumb friendly horizontal scroll) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { step: 1, label: '၁။ ဗီဒီယိုတင်', icon: Upload },
          { step: 2, label: '၂။ AI ဇာတ်ညွှန်း', icon: Sparkles },
          { step: 3, label: '၃။ အသံထွက်', icon: Volume2 },
          { step: 4, label: '၄။ စာတန်း/ဝါးခြင်း', icon: Type },
          { step: 5, label: '၅။ ဗီဒီယိုထုတ်', icon: Download },
        ].map((s) => {
          const Icon = s.icon;
          const isActive = activeStep === s.step;
          return (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step as any)}
              className={`h-9 px-3 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Hidden/Active Video Source Element */}
      <div className="relative rounded-3xl overflow-hidden card-3d border border-sky-100 bg-slate-950 aspect-[9/16] max-h-[380px] sm:max-h-[460px] mx-auto flex items-center justify-center">
        {project.videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={project.videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              className={`w-full h-full ${
                project.fitMode === 'fill' ? 'object-cover' : 'object-contain'
              }`}
              playsInline
              loop
            />

            {/* Simulated Live Subtitle Overlay during playback */}
            {project.segments.map((seg) => {
              if (currentTime >= seg.startTime && currentTime <= seg.endTime) {
                return (
                  <div
                    key={seg.id}
                    className={`absolute left-4 right-4 text-center pointer-events-none transition-opacity ${
                      project.subtitleConfig.position === 'top'
                        ? 'top-8'
                        : project.subtitleConfig.position === 'center'
                        ? 'top-1/2 -translate-y-1/2'
                        : 'bottom-12'
                    }`}
                  >
                    <div
                      className={`inline-block px-3 py-1.5 rounded-lg text-sm font-bold ${
                        project.subtitleConfig.hasBackgroundBar ? 'bg-black/75' : ''
                      }`}
                      style={{
                        color: project.subtitleConfig.fontColor,
                        textShadow:
                          project.subtitleConfig.strokeColor !== 'none'
                            ? `0 0 4px ${project.subtitleConfig.strokeColor}, 0 0 6px #000000`
                            : 'none',
                        fontSize: `${project.subtitleConfig.fontSize}px`,
                      }}
                    >
                      {seg.narration}
                    </div>
                  </div>
                );
              }
              return null;
            })}

            {/* Visual Interactive Blur Box (Watermark remover overlay) */}
            {project.blurConfig.enabled && (
              <div
                className="absolute border-2 border-dashed border-amber-400 bg-amber-400/20 backdrop-blur-md rounded-lg flex items-center justify-center pointer-events-none"
                style={{
                  left: `${project.blurConfig.x}%`,
                  top: `${project.blurConfig.y}%`,
                  width: `${project.blurConfig.width}%`,
                  height: `${project.blurConfig.height}%`,
                }}
              >
                <span className="text-[10px] font-bold text-amber-200 bg-black/60 px-1.5 py-0.5 rounded">
                  ဝါးမည့်နေရာ (Blur)
                </span>
              </div>
            )}

            {/* Play/Pause Float Overlay Controls */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/30 transition-colors">
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-white/90 text-slate-900 shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
            </div>

            {/* Video duration & Aspect Ratio Badge */}
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1.5">
              <span>{project.aspectRatio}</span>
              <span>·</span>
              <span>
                {Math.floor(currentTime)}s / {Math.floor(videoDuration)}s
              </span>
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-slate-400">
            <VideoIcon className="w-12 h-12 mx-auto mb-2 text-sky-400 opacity-60" />
            <p className="text-xs text-slate-300 font-semibold mb-1">ဗီဒီယို မရှိသေးပါ</p>
            <p className="text-[11px] text-slate-400">အောက်ပါ ခလုတ်များဖြင့် ဗီဒီယိုတင်ပါ</p>
          </div>
        )}
      </div>

      {/* STEP 1: VIDEO UPLOAD & INFO */}
      {activeStep === 1 && (
        <div className="card-3d rounded-3xl p-4 border border-sky-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">၁။ ဗီဒီယို ရွေးချယ်ခြင်း (Video Source)</h3>
              <p className="text-[11px] text-slate-500">MP4, WebM ဖိုင် သို့မဟုတ် နမူနာဗီဒီယို သုံးပါ</p>
            </div>
            {project.videoUrl && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                အသင့်ဖြစ်သည်
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Real File Upload Input */}
            <label className="border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/50 hover:bg-sky-50 rounded-2xl p-4 text-center cursor-pointer flex flex-col items-center justify-center transition-all group">
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="w-7 h-7 text-sky-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800">ဖုန်းထဲမှ ဗီဒီယိုဖိုင် ရွေးမည်</span>
              <span className="text-[10px] text-slate-500 mt-0.5">MP4, WebM (Max 500MB)</span>
            </label>

            {/* 1-Click Sample Generator */}
            <button
              onClick={handleLoadSample}
              disabled={loadingSample}
              className="border border-sky-200 bg-gradient-to-br from-white to-sky-50 hover:to-sky-100 rounded-2xl p-4 text-center flex flex-col items-center justify-center transition-all shadow-xs group"
            >
              <Sparkles className="w-7 h-7 text-amber-500 mb-1.5 group-hover:rotate-12 transition-transform" />
              <span className="text-xs font-bold text-slate-800">
                {loadingSample ? 'နမူနာဗီဒီယို ပြုလုပ်နေသည်...' : 'နမူနာဗီဒီယိုဖြင့် စမ်းသပ်မည်'}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">
                ဖိုင်ရှာစရာမလိုဘဲ ချက်ချင်းစမ်းနိုင်သည်
              </span>
            </button>
          </div>

          {/* Video Metadata Card */}
          {project.videoUrl && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-800 truncate">{project.videoName}</div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                <span>ကြာချိန်: {Math.round(project.videoDuration || 0)} စက္ကန့်</span>
                <span>·</span>
                <span>အရွယ်အစား: {project.videoSizeMb} MB</span>
                <span>·</span>
                <span>Resolution: {project.videoResolution || '1080x1920'}</span>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setActiveStep(2)}
              disabled={!project.videoUrl}
              className="h-10 px-5 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            >
              <span>ရှေ့သို့ - AI ဇာတ်ညွှန်းရေးရန်</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: AI SCRIPT GENERATOR */}
      {activeStep === 2 && (
        <div className="card-3d rounded-3xl p-4 border border-sky-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">၂။ AI ဇာတ်ညွှန်းဖန်တီးခြင်း (Gemini AI Script)</h3>
              <p className="text-[11px] text-slate-500">မြန်မာစကားပြော သဘာဝအတိုင်း ရုပ်ရှင်အကျဉ်းရေးပါ</p>
            </div>
            <button
              onClick={handleGenerateScript}
              disabled={isGeneratingScript}
              className="px-3.5 py-1.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isGeneratingScript ? 'AI ရေးနေပါသည်...' : 'AI ဖြင့် ပြန်ထုတ်မည်'}
            </button>
          </div>

          {/* Form fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ဇာတ်ကားခေါင်းစဉ် / ဇာတ်လမ်းအမည်
              </label>
              <input
                type="text"
                value={project.title}
                onChange={(e) => setProject({ ...project, title: e.target.value })}
                placeholder="ဥပမာ - John Wick: Chapter 4"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">အမျိုးအစား (Genre)</label>
                <select
                  value={project.genre}
                  onChange={(e) => setProject({ ...project, genre: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                >
                  <option value="action">အက်ရှင် (Action)</option>
                  <option value="thriller">သည်းထိတ်ရင်ဖို (Thriller)</option>
                  <option value="comedy">ဟာသ (Comedy)</option>
                  <option value="drama">ဒရမ်မာ (Emotional Drama)</option>
                  <option value="scifi">သဘာဝလွန် (Sci-Fi)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">အသံနေအသံထား (Tone)</label>
                <select
                  value={project.tone}
                  onChange={(e) => setProject({ ...project, tone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                >
                  <option value="exciting">စိတ်လှုပ်ရှားဖွယ် (Exciting)</option>
                  <option value="heroic">မင်းသားစတိုင် အမိုက်စား</option>
                  <option value="intense">ခပ်ပြတ်ပြတ် ခပ်ကြမ်းကြမ်း</option>
                  <option value="casual">ပေါ့ပေါ့ပါးပါး စကားပြော</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ဇာတ်ကွက် အချက်အလက် / မူရင်းစကားပြော (ရွေးချယ်နိုင်သည်)
              </label>
              <textarea
                value={promptContext}
                onChange={(e) => setPromptContext(e.target.value)}
                placeholder="ဇာတ်လမ်း၏ အဓိက အဖြစ်အပျက်၊ ဇာတ်ကောင်နာမည်များကို ရေးထည့်နိုင်ပါသည်..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {scriptError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{scriptError}</span>
              </div>
            )}
          </div>

          {/* Generated Result: Title & Viral Hook */}
          {project.burmeseTitle && (
            <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-2">
              <div>
                <span className="text-[10px] font-bold text-sky-700">မြန်မာဇာတ်ကားခေါင်းစဉ်:</span>
                <input
                  type="text"
                  value={project.burmeseTitle}
                  onChange={(e) => setProject({ ...project, burmeseTitle: e.target.value })}
                  className="w-full mt-0.5 px-3 py-1.5 bg-white rounded-lg border border-sky-200 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <span className="text-[10px] font-bold text-sky-700">
                  Viral Hook (အဖွင့် အဆွဲဆောင်ဆုံးစကား):
                </span>
                <textarea
                  value={project.hook}
                  onChange={(e) => setProject({ ...project, hook: e.target.value })}
                  rows={2}
                  className="w-full mt-0.5 px-3 py-1.5 bg-white rounded-lg border border-sky-200 text-xs text-slate-800 font-medium"
                />
              </div>
            </div>
          )}

          {/* Scene breakdown list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                အခန်းလိုက် ဇာတ်လမ်းပြောစာသားများ ({project.segments.length} ခန်း)
              </span>
              <button
                onClick={() => {
                  const lastEnd = project.segments[project.segments.length - 1]?.endTime || 0;
                  setProject({
                    ...project,
                    segments: [
                      ...project.segments,
                      {
                        id: project.segments.length + 1,
                        startTime: lastEnd,
                        endTime: lastEnd + 5,
                        narration: 'နောက်ထပ် ဇာတ်ကွက်စာသား...',
                      },
                    ],
                  });
                }}
                className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> အခန်းထပ်တိုး
              </button>
            </div>

            {project.segments.map((seg, idx) => (
              <div key={seg.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-bold text-slate-700">အခန်း {idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <span>
                      {seg.startTime}s - {seg.endTime}s
                    </span>
                    <button
                      onClick={() => {
                        setProject({
                          ...project,
                          segments: project.segments.filter((s) => s.id !== seg.id),
                        });
                      }}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <textarea
                  value={seg.narration}
                  onChange={(e) => {
                    const newSegs = [...project.segments];
                    newSegs[idx].narration = e.target.value;
                    setProject({ ...project, segments: newSegs });
                  }}
                  rows={2}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-sky-500"
                />
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-between">
            <button
              onClick={() => setActiveStep(1)}
              className="px-4 py-2 border border-slate-300 text-slate-600 text-xs font-semibold rounded-xl"
            >
              နောက်သို့
            </button>
            <button
              onClick={() => setActiveStep(3)}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl shadow-xs"
            >
              ရှေ့သို့ - AI အသံထွက်ချိန်ညှိရန်
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: AI VOICEOVER */}
      {activeStep === 3 && (
        <div className="card-3d rounded-3xl p-4 border border-sky-100 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">၃။ မြန်မာ AI အသံထွက် (Voiceover Studio)</h3>
            <p className="text-[11px] text-slate-500">
              မြန်မာအမျိုးသမီးနှင့် အမျိုးသားသံ၊ အသံနှုန်းနှင့် မူရင်းအသံ ချိန်ညှိပါ
            </p>
          </div>

          {/* Voice Choice Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() =>
                setProject({
                  ...project,
                  voiceConfig: { ...project.voiceConfig, voiceId: 'my-MM-NilarNeural' },
                })
              }
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                project.voiceConfig.voiceId === 'my-MM-NilarNeural'
                  ? 'border-sky-500 bg-sky-50/70 shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-900">မြန်မာအမျိုးသမီးသံ</span>
                {project.voiceConfig.voiceId === 'my-MM-NilarNeural' && (
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                )}
              </div>
              <p className="text-[10px] text-slate-500">
                Nilar Neural (ချိုသာကြည်လင်ပြီး ဆွဲဆောင်မှုရှိသော ဇာတ်လမ်းပြောသံ)
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                setProject({
                  ...project,
                  voiceConfig: { ...project.voiceConfig, voiceId: 'my-MM-ThihaNeural' },
                })
              }
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                project.voiceConfig.voiceId === 'my-MM-ThihaNeural'
                  ? 'border-sky-500 bg-sky-50/70 shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-900">မြန်မာအမျိုးသားသံ</span>
                {project.voiceConfig.voiceId === 'my-MM-ThihaNeural' && (
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                )}
              </div>
              <p className="text-[10px] text-slate-500">
                Thiha Neural (တည်ကြည်အားမာန်ပါသော အက်ရှင်ဇာတ်လမ်းပြောသံ)
              </p>
            </button>
          </div>

          {/* Speed & Pitch Sliders */}
          <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>အသံအမြန်နှုန်း (Speaking Speed)</span>
                <span>{project.voiceConfig.speed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.05"
                value={project.voiceConfig.speed}
                onChange={(e) =>
                  setProject({
                    ...project,
                    voiceConfig: { ...project.voiceConfig, speed: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                မူရင်းဗီဒီယိုအသံ ထိန်းချုပ်မှု (Audio Ducking)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'mute', label: 'လုံးဝပိတ်မည် (Mute)' },
                  { id: 'low', label: 'နောက်ခံ ၁၅% (Low)' },
                  { id: 'normal', label: 'မူရင်းအတိုင်း (Normal)' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() =>
                      setProject({
                        ...project,
                        voiceConfig: { ...project.voiceConfig, ducking: d.id as any },
                      })
                    }
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold text-center border transition-all ${
                      project.voiceConfig.ducking === d.id
                        ? 'border-sky-500 bg-sky-50 text-sky-700'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Test Voiceover Button */}
          <div className="p-3 bg-white border border-sky-100 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800">အသံထွက် စမ်းသပ်နားထောင်မည်</div>
              <div className="text-[10px] text-slate-500">ရွေးချယ်ထားသော အသံဖြင့် ဇာတ်ညွှန်းကို ဖတ်ပြပါမည်</div>
            </div>
            <button
              onClick={() => handlePreviewVoice()}
              className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              <Volume2 className="w-3.5 h-3.5" />
              {isSpeaking ? 'ရပ်မည် (Stop)' : 'အသံဖွင့်မည်'}
            </button>
          </div>

          <div className="pt-2 flex justify-between">
            <button
              onClick={() => setActiveStep(2)}
              className="px-4 py-2 border border-slate-300 text-slate-600 text-xs font-semibold rounded-xl"
            >
              နောက်သို့
            </button>
            <button
              onClick={() => setActiveStep(4)}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl shadow-xs"
            >
              ရှေ့သို့ - စာတန်းထိုး/ဝါးခြင်း
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SUBTITLES & TEXT BLUR */}
      {activeStep === 4 && (
        <div className="card-3d rounded-3xl p-4 border border-sky-100 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">၄။ မြန်မာစာတန်းထိုးနှင့် မူရင်းစာလုံးဝါးခြင်း</h3>
            <p className="text-[11px] text-slate-500">
              Unicode စာတန်းထိုးဒီဇိုင်းနှင့် မူရင်း Subtitle/Watermark ဝါးခြင်း
            </p>
          </div>

          {/* Subtitle Style Controls */}
          <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-sky-600" />
              မြန်မာစာတန်းထိုး ဒီဇိုင်း (Subtitle Styling)
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">စာလုံးအရောင်</label>
                <div className="flex gap-2">
                  {[
                    { color: '#facc15', label: 'ဝါ' },
                    { color: '#ffffff', label: 'ဖြူ' },
                    { color: '#38bdf8', label: 'ပြာ' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() =>
                        setProject({
                          ...project,
                          subtitleConfig: { ...project.subtitleConfig, fontColor: c.color },
                        })
                      }
                      className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center font-bold text-[10px] ${
                        project.subtitleConfig.fontColor === c.color ? 'border-sky-600 scale-110' : 'border-slate-300'
                      }`}
                      style={{ backgroundColor: c.color, color: c.color === '#ffffff' ? '#000' : '#000' }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">တည်နေရာ (Position)</label>
                <select
                  value={project.subtitleConfig.position}
                  onChange={(e) =>
                    setProject({
                      ...project,
                      subtitleConfig: { ...project.subtitleConfig, position: e.target.value as any },
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-medium"
                >
                  <option value="bottom">အောက်ခြေ (Bottom)</option>
                  <option value="center">အလယ် (Center)</option>
                  <option value="top">ထိပ်ပိုင်း (Top)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={project.subtitleConfig.hasBackgroundBar}
                  onChange={(e) =>
                    setProject({
                      ...project,
                      subtitleConfig: { ...project.subtitleConfig, hasBackgroundBar: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded text-sky-600"
                />
                အနက်ရောင် နောက်ခံဘား ထည့်မည် (Highlight Bar)
              </label>

              <button
                onClick={handleDownloadSRT}
                className="text-[11px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> SRT ဒေါင်းလုဒ်
              </button>
            </div>
          </div>

          {/* Automatic / Manual Watermark & Subtitle Blur */}
          <div className="space-y-3 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                မူရင်းစာတန်းနှင့် Watermark ဖျက်/ဝါးခြင်း (Blur Tool)
              </div>
              <input
                type="checkbox"
                checked={project.blurConfig.enabled}
                onChange={(e) =>
                  setProject({
                    ...project,
                    blurConfig: { ...project.blurConfig, enabled: e.target.checked },
                  })
                }
                className="w-4 h-4 rounded text-amber-600"
              />
            </div>

            {project.blurConfig.enabled && (
              <div className="space-y-2.5 pt-1">
                <div className="text-[11px] text-slate-600">
                  မူရင်းစာတန်းရှိသော နေရာကို ရွေးချယ်ပါ:
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setProject({
                        ...project,
                        blurConfig: {
                          ...project.blurConfig,
                          x: 10,
                          y: 80,
                          width: 80,
                          height: 12,
                        },
                      })
                    }
                    className="py-1.5 px-2 bg-white border border-amber-300 rounded-xl text-[10px] font-bold text-slate-800 hover:bg-amber-100"
                  >
                    အောက်ခြေ Subtitles
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setProject({
                        ...project,
                        blurConfig: {
                          ...project.blurConfig,
                          x: 70,
                          y: 5,
                          width: 26,
                          height: 8,
                        },
                      })
                    }
                    className="py-1.5 px-2 bg-white border border-amber-300 rounded-xl text-[10px] font-bold text-slate-800 hover:bg-amber-100"
                  >
                    ထိပ်ဘက် Watermark
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setProject({
                        ...project,
                        blurConfig: {
                          ...project.blurConfig,
                          x: 5,
                          y: 40,
                          width: 90,
                          height: 20,
                        },
                      })
                    }
                    className="py-1.5 px-2 bg-white border border-amber-300 rounded-xl text-[10px] font-bold text-slate-800 hover:bg-amber-100"
                  >
                    အလယ်ပိုင်း စာတန်း
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                    <span>ဝါးမှုပြင်းအား (Blur Intensity)</span>
                    <span>{project.blurConfig.intensity}px</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="35"
                    value={project.blurConfig.intensity}
                    onChange={(e) =>
                      setProject({
                        ...project,
                        blurConfig: { ...project.blurConfig, intensity: parseInt(e.target.value) },
                      })
                    }
                    className="w-full accent-amber-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-between">
            <button
              onClick={() => setActiveStep(3)}
              className="px-4 py-2 border border-slate-300 text-slate-600 text-xs font-semibold rounded-xl"
            >
              နောက်သို့
            </button>
            <button
              onClick={() => setActiveStep(5)}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl shadow-xs"
            >
              ရှေ့သို့ - ဗီဒီယိုထုတ်ယူရန်
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: VIDEO FRAME & EXPORT */}
      {activeStep === 5 && (
        <div className="card-3d rounded-3xl p-4 border border-sky-100 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">၅။ ဗီဒီယို အချိုးအစားနှင့် ထုတ်ယူခြင်း (Export)</h3>
            <p className="text-[11px] text-slate-500">
              TikTok, Shorts, Reels အတွက် 9:16 စံနှုန်းဖြင့် MP4 ဗီဒီယို ထုတ်ယူပါ
            </p>
          </div>

          {/* Aspect Ratio Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Aspect Ratio ရွေးချယ်ခြင်း
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '9:16', name: '9:16 ဒေါင်လိုက်', desc: 'TikTok, Shorts, Reels (Default)' },
                { id: '16:9', name: '16:9 အလျားလိုက်', desc: 'YouTube, Facebook' },
                { id: '1:1', name: '1:1 လေးထောင့်', desc: 'Instagram Feed' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setProject({ ...project, aspectRatio: r.id as any })}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    project.aspectRatio === r.id
                      ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold">{r.name}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Fit Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ဗီဒီယို တင်ဆက်မှုပုံစံ (Fit Mode)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProject({ ...project, fitMode: 'fit' })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                  project.fitMode === 'fit'
                    ? 'border-sky-500 bg-sky-50 text-sky-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Fit (နောက်ခံဝါးပြီး အလယ်ထားခြင်း)
              </button>
              <button
                type="button"
                onClick={() => setProject({ ...project, fitMode: 'fill' })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                  project.fitMode === 'fill'
                    ? 'border-sky-500 bg-sky-50 text-sky-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Fill (မျက်နှာပြင်ပြည့် ဖြတ်ညှပ်ခြင်း)
              </button>
            </div>
          </div>

          {/* Export Action Card */}
          <div className="p-4 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-3xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {project.burmeseTitle || project.title || 'Myanmar Recap'}
                </div>
                <div className="text-[10px] text-slate-500">
                  အရည်အသွေး: 1080p · အချိုး: {project.aspectRatio} · အသံ: မြန်မာ
                </div>
              </div>
              <span className="text-[11px] font-bold text-sky-700 bg-white px-2.5 py-1 rounded-lg border border-sky-100">
                MP4 Format
              </span>
            </div>

            <button
              onClick={handleStartRender}
              disabled={isRendering || !project.videoUrl}
              className="w-full h-12 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 active:scale-98 transition-transform disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isRendering ? 'ဗီဒီယို ထုတ်ယူနေပါသည်...' : 'ဗီဒီယို ထုတ်ယူမည် (Render & Export MP4)'}</span>
            </button>
          </div>

          {/* Download Button if Rendered */}
          {renderedBlobUrl && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-2.5">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ဗီဒီယို အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ!
              </div>
              <a
                href={renderedBlobUrl}
                download={renderFilename || 'myanmar_recap.mp4'}
                className="inline-flex items-center justify-center gap-2 w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-transform"
              >
                <Download className="w-4 h-4" />
                <span>ဖုန်းထဲသို့ MP4 ဒေါင်းလုဒ် ရယူပါ</span>
              </a>
            </div>
          )}

          <div className="pt-2 flex justify-start">
            <button
              onClick={() => setActiveStep(4)}
              className="px-4 py-2 border border-slate-300 text-slate-600 text-xs font-semibold rounded-xl"
            >
              နောက်သို့
            </button>
          </div>
        </div>
      )}

      {/* RENDER PROGRESS MODAL */}
      {isRendering && renderProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-sky-100 text-center space-y-3">
            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs animate-pulse">
              <Download className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">ဗီဒီယို ဖန်တီးနေပါသည်</h3>
              <p className="text-xs text-slate-500 mt-0.5">{renderProgress.stage}</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-500 to-blue-600 h-full transition-all duration-300"
                style={{ width: `${renderProgress.percent}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>{renderProgress.currentSecond}s / {renderProgress.totalSeconds}s</span>
              <span className="font-bold text-sky-600">{renderProgress.percent}%</span>
            </div>

            <p className="text-[10px] text-slate-400">
              * ကျေးဇူးပြု၍ ဗီဒီယို ထုတ်ယူနေစဉ် ဤ tab ကို မပိတ်ပါနှင့်။
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
