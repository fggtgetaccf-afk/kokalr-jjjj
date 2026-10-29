import React from 'react';
import { Play, Download, Trash2, FileText, ArrowRight, Video, Calendar, Sparkles } from 'lucide-react';
import { RecapProject } from '../types/index.ts';

interface HistoryViewProps {
  history: RecapProject[];
  onSelectProject: (proj: RecapProject) => void;
  onDeleteProject: (id: string) => void;
  onStartNew: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectProject,
  onDeleteProject,
  onStartNew,
}) => {
  const downloadFile = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const exportSrt = (proj: RecapProject) => {
    let srt = '';
    proj.segments.forEach((seg, i) => {
      const sSec = seg.startTime;
      const eSec = seg.endTime;
      const sStr = `00:${String(Math.floor(sSec / 60)).padStart(2, '0')}:${String(Math.floor(sSec % 60)).padStart(2, '0')},000`;
      const eStr = `00:${String(Math.floor(eSec / 60)).padStart(2, '0')}:${String(Math.floor(eSec % 60)).padStart(2, '0')},000`;
      srt += `${i + 1}\n${sStr} --> ${eStr}\n${seg.narration}\n\n`;
    });
    const blob = new Blob([srt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, `${proj.burmeseTitle || 'subtitles'}.srt`);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Title & Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">မှတ်တမ်းဟောင်းများ (Project History)</h2>
          <p className="text-xs text-slate-500">ယခင် ဖန်တီးထားသော မြန်မာဇာတ်လမ်းအကျဉ်းများ ({history.length} ခု)</p>
        </div>
        <button
          onClick={onStartNew}
          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          အသစ်ဖန်တီးမည်
        </button>
      </div>

      {history.length === 0 ? (
        <div className="card-3d rounded-3xl p-8 text-center border border-dashed border-sky-200">
          <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Video className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">မှတ်တမ်း မရှိသေးပါ</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            ဗီဒီယိုစတူဒီယိုသို့ သွား၍ ရုပ်ရှင်ဖိုင်တင်ကာ ပထမဆုံး မြန်မာဇာတ်လမ်းအကျဉ်း ဗီဒီယိုကို ဖန်တီးလိုက်ပါ။
          </p>
          <button
            onClick={onStartNew}
            className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-500/25 active:scale-95"
          >
            စတင်ဖန်တီးရန် နှိပ်ပါ
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {history.map((proj) => (
            <div
              key={proj.id}
              className="card-3d rounded-2xl p-4 border border-sky-100 flex flex-col justify-between hover:border-sky-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md inline-block mb-1">
                      {proj.aspectRatio} · {proj.genre.toUpperCase()}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {proj.burmeseTitle || proj.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                      {proj.hook || proj.synopsis}
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteProject(proj.id)}
                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                    title="ဖျက်မည်"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-3">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(proj.createdAt).toLocaleDateString()}</span>
                  <span>·</span>
                  <span>{proj.segments.length} အခန်း</span>
                  <span>·</span>
                  <span>ကြာချိန် ~{Math.round(proj.videoDuration || 30)}s</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => onSelectProject(proj)}
                  className="flex-1 h-8 bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-xs rounded-lg flex items-center justify-center gap-1 transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  ဖွင့်၍ ပြင်မည်
                </button>

                {proj.renderedVideoUrl && (
                  <button
                    onClick={() => downloadFile(proj.renderedVideoUrl!, `${proj.burmeseTitle || 'recap'}.mp4`)}
                    className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    MP4
                  </button>
                )}

                <button
                  onClick={() => exportSrt(proj)}
                  className="h-8 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg flex items-center gap-1 transition-colors"
                  title="SRT ဒေါင်းလုဒ်"
                >
                  <FileText className="w-3.5 h-3.5" />
                  SRT
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
