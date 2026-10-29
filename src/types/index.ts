export interface ScriptSegment {
  id: number;
  startTime: number;
  endTime: number;
  narration: string;
  sceneAction?: string;
  emotion?: string;
}

export interface RecapProject {
  id: string;
  title: string;
  burmeseTitle: string;
  hook: string;
  synopsis: string;
  genre: string;
  tone: string;
  videoUrl: string;
  videoName: string;
  videoDuration: number;
  videoResolution: string;
  videoSizeMb: number;
  segments: ScriptSegment[];
  aspectRatio: '9:16' | '16:9' | '1:1';
  fitMode: 'fit' | 'fill' | 'crop';
  voiceConfig: {
    voiceId: 'my-MM-NilarNeural' | 'my-MM-ThihaNeural';
    speed: number;
    pitch: number;
    volume: number;
    ducking: 'mute' | 'low' | 'normal';
  };
  subtitleConfig: {
    fontFamily: string;
    fontSize: number;
    fontColor: string;
    strokeColor: string;
    position: 'bottom' | 'center' | 'top';
    hasBackgroundBar: boolean;
  };
  blurConfig: {
    enabled: boolean;
    autoDetect: boolean;
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    width: number; // percentage 0-100
    height: number; // percentage 0-100
    intensity: number; // 5 - 30
  };
  status: 'draft' | 'ready' | 'rendering' | 'completed';
  renderedVideoUrl?: string;
  createdAt: string;
}

export interface BackendHealth {
  status: string;
  service: string;
  version: string;
  hasGeminiKey: boolean;
  model: string;
  edgeTtsAvailable: boolean;
  timestamp: string;
}
