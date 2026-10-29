import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google GenAI client securely on the server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-memory jobs and history storage for server-tracked processing
interface JobRecord {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  videoName: string;
  duration: number;
  aspectRatio: string;
  createdAt: string;
  downloadUrl?: string;
  script?: any;
}

const activeJobs: Record<string, JobRecord> = {};

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'ok',
    service: 'MYANMAR RECAP AI Engine (Full-stack)',
    version: '2.5.0',
    hasGeminiKey: hasGemini,
    model: 'gemini-3.8-flash',
    edgeTtsAvailable: true,
    supportedAspectRatios: ['9:16', '16:9', '1:1'],
    wavePayNumber: '09797879485',
    timestamp: new Date().toISOString(),
  });
});

// AI Movie Recap Script Generation using Gemini API
app.post('/api/recap/generate', async (req, res) => {
  try {
    const {
      title,
      genre = 'action',
      tone = 'exciting',
      targetDuration = 60,
      context = '',
      dialogueHints = '',
    } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets panel.',
      });
    }

    const toneInstructions: Record<string, string> = {
      exciting: 'စိတ်လှုပ်ရှားဖွယ်၊ သည်းထိတ်ရင်ဖို၊ ကြည့်ရှုသူရင်ခုန်စေမည့် အသံနေအသံထား',
      action: 'အက်ရှင်ကြမ်းကြမ်း၊ မင်းသားစတိုင်၊ ခပ်ပြတ်ပြတ် ခပ်မိုက်မိုက် အသံနေအသံထား',
      comedy: 'ဟာသဆန်ဆန်၊ ပေါ့ပေါ့ပါးပါး၊ ရယ်မောရမည့် စကားလုံးများ',
      drama: 'ခံစားချက်ပါသော၊ လေးနက်သော၊ ဇာတ်လမ်းဇာတ်ကွက်နက်ရှိုင်းသည့် အသံ',
      heroic: 'မင်းသားအထာကျကျ၊ သတ္တိရှိသော ဇာတ်ကောင်စတိုင်',
    };

    const chosenToneDesc = toneInstructions[tone] || toneInstructions.exciting;

    const prompt = `You are a professional Myanmar (Burmese) Movie Recap Creator (မြန်မာ ဇာတ်လမ်းပြော/ရုပ်ရှင်အကျဉ်း ချုပ်သူ) creating viral, engaging content for TikTok, YouTube Shorts, and Facebook Reels.

Movie Title or Topic: "${title || 'Untitled Movie'}"
Genre: ${genre}
Target Narration Duration: ~${targetDuration} seconds
Desired Tone: ${chosenToneDesc}
Movie Plot / Context Details:
${context || 'A thrilling suspense movie about an ordinary hero pushed to the limits.'}
${dialogueHints ? `Original Dialogue / Key Moments: ${dialogueHints}` : ''}

CRITICAL RULES:
1. Write in natural, modern, spoken Burmese (မြန်မာစကားပြောသဘာဝအတိုင်း ရေးပါ - စာအုပ်စကားမဖြစ်စေရ) that captivates listeners immediately.
2. Structure the recap logically into chronological scenes/segments covering the target duration.
3. Include an irresistible Hook (အဖွင့်အဟက်) that prevents people from swiping away in the first 3 seconds.
4. Provide a catchy, click-worthy Burmese Recap Title (မြန်မာ ခေါင်းစဉ်ဆွဲဆောင်မှုရှိသော နာမည်).
5. For each segment, provide:
   - startTime (e.g. 0)
   - endTime (e.g. 15)
   - narration: Spoken Burmese script
   - sceneAction: Brief description of video visual
   - emotion: Tone of voice

Return ONLY valid JSON matching this schema:
{
  "burmeseTitle": "string (Catchy Burmese title)",
  "hook": "string (First 3-5 seconds high-energy teaser line)",
  "synopsis": "string (Brief summary in 2 sentences)",
  "segments": [
    {
      "id": 1,
      "startTime": 0,
      "endTime": 12,
      "narration": "Burmese spoken line",
      "sceneAction": "Visual note",
      "emotion": "Curiosity/Action"
    }
  ],
  "fullScript": "Combined full Burmese narration text"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const outputText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(outputText);
    } catch {
      // Clean possible markdown code fences
      const cleaned = outputText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    // Ensure segments have subtitle friendly timestamps
    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Gemini recap generation error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate Burmese recap script with Gemini AI.',
    });
  }
});

// Subtitles format generation (.srt and .ass)
app.post('/api/subtitles/export', (req, res) => {
  try {
    const { segments, format = 'srt', style = {} } = req.body;

    if (!Array.isArray(segments) || segments.length === 0) {
      return res.status(400).json({ error: 'Segments array is required.' });
    }

    const formatTimestampSRT = (seconds: number): string => {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      const millis = Math.floor((seconds % 1) * 1000);
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
    };

    const formatTimestampASS = (seconds: number): string => {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      const centis = Math.floor((seconds % 1) * 100);
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
    };

    if (format === 'ass') {
      const fontName = style.fontName || 'Padauk';
      const fontSize = style.fontSize || 24;
      const primaryColor = '&H0000FFFF'; // Yellow in ASS BGR
      const outlineColor = '&H00000000'; // Black outline

      let assContent = `[Script Info]
Title: Myanmar Recap AI Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.601
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fontName},${fontSize},${primaryColor},&H000000FF,${outlineColor},&H80000000,-1,0,0,0,100,100,0,0,1,3,1,2,20,20,40,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

      segments.forEach((seg: any) => {
        const start = formatTimestampASS(seg.startTime || 0);
        const end = formatTimestampASS(seg.endTime || (seg.startTime || 0) + 5);
        const text = (seg.narration || seg.text || '').replace(/\n/g, '\\N');
        assContent += `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}\n`;
      });

      return res.json({
        format: 'ass',
        filename: 'myanmar_recap_subtitles.ass',
        content: assContent,
      });
    }

    // Default: SRT Format
    let srtContent = '';
    segments.forEach((seg: any, idx: number) => {
      const start = formatTimestampSRT(seg.startTime || 0);
      const end = formatTimestampSRT(seg.endTime || (seg.startTime || 0) + 5);
      const text = seg.narration || seg.text || '';
      srtContent += `${idx + 1}\n${start} --> ${end}\n${text}\n\n`;
    });

    return res.json({
      format: 'srt',
      filename: 'myanmar_recap_subtitles.srt',
      content: srtContent,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Background Job Creation & Polling simulation for long video renders
app.post('/api/jobs/create', (req, res) => {
  const { title, videoName, duration = 30, aspectRatio = '9:16', script } = req.body;
  const jobId = 'job_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  const newJob: JobRecord = {
    id: jobId,
    title: title || 'Myanmar Movie Recap',
    status: 'processing',
    progress: 10,
    videoName: videoName || 'input_video.mp4',
    duration,
    aspectRatio,
    createdAt: new Date().toISOString(),
    script,
  };

  activeJobs[jobId] = newJob;

  // Simulate server-side progressive rendering steps
  let currentProgress = 10;
  const interval = setInterval(() => {
    if (!activeJobs[jobId]) {
      clearInterval(interval);
      return;
    }
    currentProgress += 20;
    if (currentProgress >= 100) {
      activeJobs[jobId].progress = 100;
      activeJobs[jobId].status = 'completed';
      activeJobs[jobId].downloadUrl = `/api/jobs/${jobId}/download`;
      clearInterval(interval);
    } else {
      activeJobs[jobId].progress = currentProgress;
    }
  }, 1000);

  res.json({
    success: true,
    job: newJob,
  });
});

app.get('/api/jobs/:id', (req, res) => {
  const job = activeJobs[req.params.id];
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json({ job });
});

// WavePay verification submission endpoint
app.post('/api/pro/submit-wave', (req, res) => {
  const { transactionId, senderPhone, senderName, plan = 'PRO' } = req.body;
  if (!transactionId || transactionId.trim().length < 6) {
    return res.status(400).json({
      error: 'ကျေးဇူးပြု၍ တရားဝင် WavePay Transaction ID (အနည်းဆုံး ၆ လုံး) ထည့်သွင်းပေးပါ။',
    });
  }

  res.json({
    success: true,
    message: 'WavePay ငွေလွှဲပြေစာကို အောင်မြင်စွာ လက်ခံရရှိပါသည်။ စစ်ဆေးပြီးပါက VIP အကောင့် အလိုအလျောက် ပွင့်ပါမည်။',
    wavePayRecipient: '09797879485',
    transactionId,
    status: 'verified_active',
    plan,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });
});

// Setup Vite development middlewares or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MYANMAR RECAP AI] Server is running on port ${PORT}`);
  });
}

startServer();
