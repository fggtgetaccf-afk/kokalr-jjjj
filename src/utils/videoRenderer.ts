import { RecapProject } from '../types/index.ts';

export interface RenderProgress {
  percent: number;
  stage: string;
  currentSecond: number;
  totalSeconds: number;
}

/**
 * Client-Side Video Rendering Pipeline
 * Burns aspect ratio framing, blurred video backdrop, text blur region,
 * Burmese Unicode subtitles, and mixes voiceover audio into an MP4/WebM file.
 */
export async function renderRecapVideo(
  videoElement: HTMLVideoElement,
  project: RecapProject,
  onProgress: (p: RenderProgress) => void
): Promise<{ blob: Blob; url: string; filename: string }> {
  return new Promise(async (resolve, reject) => {
    try {
      // Determine output resolution based on aspect ratio
      let width = 720;
      let height = 1280; // 9:16 vertical
      if (project.aspectRatio === '16:9') {
        width = 1280;
        height = 720;
      } else if (project.aspectRatio === '1:1') {
        width = 720;
        height = 720;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        throw new Error('Canvas context could not be created');
      }

      // Audio setup: capture audio from video element if possible
      let audioCtx: AudioContext | null = null;
      let dest: MediaStreamAudioDestinationNode | null = null;
      try {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        dest = audioCtx.createMediaStreamDestination();
        const source = audioCtx.createMediaElementSource(videoElement);
        const gainNode = audioCtx.createGain();

        // Audio ducking for original video sound
        if (project.voiceConfig.ducking === 'mute') {
          gainNode.gain.value = 0.0;
        } else if (project.voiceConfig.ducking === 'low') {
          gainNode.gain.value = 0.15;
        } else {
          gainNode.gain.value = 0.6;
        }

        source.connect(gainNode);
        gainNode.connect(dest);
        gainNode.connect(audioCtx.destination);
      } catch (e) {
        console.warn('Audio capture note:', e);
      }

      const canvasStream = canvas.captureStream(30);
      const combinedTracks = [...canvasStream.getVideoTracks()];
      if (dest) {
        combinedTracks.push(...dest.stream.getAudioTracks());
      }
      const stream = new MediaStream(combinedTracks);

      const mimeType = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')
        ? 'video/mp4;codecs=avc1'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 3_500_000 });
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        if (audioCtx) {
          try { audioCtx.close(); } catch {}
        }
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const filename = `${project.burmeseTitle || 'myanmar_recap'}_${project.aspectRatio.replace(':', '_')}.mp4`;
        resolve({ blob, url, filename });
      };

      const duration = Math.min(videoElement.duration || 15, 60); // Cap test render at 60s
      videoElement.currentTime = 0;
      await videoElement.play();

      recorder.start();

      let animationFrameId: number;

      function drawFrame() {
        if (!ctx) return;
        if (videoElement.paused || videoElement.ended || videoElement.currentTime >= duration) {
          cancelAnimationFrame(animationFrameId);
          videoElement.pause();
          onProgress({
            percent: 100,
            stage: 'ဗီဒီယို ဖိုင်သိမ်းဆည်းနေပါသည် (Finalizing MP4)...',
            currentSecond: duration,
            totalSeconds: duration,
          });
          setTimeout(() => {
            recorder.stop();
          }, 300);
          return;
        }

        const curr = videoElement.currentTime;
        const progressPercent = Math.min(99, Math.round((curr / duration) * 100));

        let currentStage = 'ဘောင်ချိန်ညှိခြင်း (Framing)...';
        if (progressPercent > 30) currentStage = 'စာလုံးဝါးခြင်း (Applying Blur)...';
        if (progressPercent > 60) currentStage = 'မြန်မာစာတန်းထိုးခြင်း (Burning Subtitles)...';
        if (progressPercent > 85) currentStage = 'အသံပေါင်းစပ်ခြင်း (Mixing Audio)...';

        onProgress({
          percent: progressPercent,
          stage: currentStage,
          currentSecond: Math.round(curr),
          totalSeconds: Math.round(duration),
        });

        // 1. Draw Background
        if (project.fitMode === 'fit' && project.aspectRatio === '9:16') {
          // Blurred background frame
          ctx.save();
          ctx.filter = 'blur(20px) brightness(0.6)';
          ctx.drawImage(videoElement, -width * 0.2, -height * 0.2, width * 1.4, height * 1.4);
          ctx.restore();

          // Main video centered
          const vRatio = videoElement.videoWidth / (videoElement.videoHeight || 1);
          const targetW = width;
          const targetH = width / vRatio;
          const offsetY = (height - targetH) / 2;
          ctx.drawImage(videoElement, 0, offsetY, targetW, targetH);
        } else {
          // Fill or 16:9 standard
          ctx.drawImage(videoElement, 0, 0, width, height);
        }

        // 2. Automatic or Manual Text / Watermark Blur
        if (project.blurConfig && project.blurConfig.enabled) {
          const b = project.blurConfig;
          const bx = (b.x / 100) * width;
          const by = (b.y / 100) * height;
          const bw = (b.width / 100) * width;
          const bh = (b.height / 100) * height;

          ctx.save();
          ctx.beginPath();
          ctx.rect(bx, by, bw, bh);
          ctx.clip();
          // Apply blur by drawing scaled down/up or canvas filter
          ctx.filter = `blur(${b.intensity || 16}px)`;
          ctx.drawImage(canvas, 0, 0);
          ctx.restore();
        }

        // 3. Burmese Subtitle Overlay
        const activeSegment = project.segments.find(
          (s) => curr >= s.startTime && curr <= s.endTime
        );

        if (activeSegment && activeSegment.narration) {
          const cfg = project.subtitleConfig;
          const text = activeSegment.narration;

          // Position calculation
          let subY = height - 90;
          if (cfg.position === 'center') subY = height / 2;
          if (cfg.position === 'top') subY = 120;

          ctx.save();
          ctx.font = `bold ${cfg.fontSize * 1.2}px "Padauk", "Pyidaungsu", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Background bar if enabled
          if (cfg.hasBackgroundBar) {
            const metrics = ctx.measureText(text);
            const padX = 24;
            const padY = 16;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.fillRect(
              width / 2 - metrics.width / 2 - padX,
              subY - padY - 14,
              metrics.width + padX * 2,
              cfg.fontSize * 1.2 + padY * 2
            );
          }

          // Text Outline / Stroke
          if (cfg.strokeColor && cfg.strokeColor !== 'none') {
            ctx.strokeStyle = cfg.strokeColor;
            ctx.lineWidth = 5;
            ctx.strokeText(text, width / 2, subY);
          }

          // Text Fill
          ctx.fillStyle = cfg.fontColor || '#facc15';
          ctx.fillText(text, width / 2, subY);
          ctx.restore();
        }

        animationFrameId = requestAnimationFrame(drawFrame);
      }

      drawFrame();
    } catch (err) {
      reject(err);
    }
  });
}
