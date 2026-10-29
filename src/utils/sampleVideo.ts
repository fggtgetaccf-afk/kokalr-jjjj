/**
 * Generates an animated cinematic movie teaser video clip directly in browser
 * using HTML5 Canvas & MediaRecorder so Android users can test the recap app instantly!
 */
export async function createCinematicSampleVideo(durationSeconds = 12): Promise<{ blob: Blob; url: string; name: string }> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 1280; // 9:16 vertical video
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas 2D context not available');
      }

      // Audio synth for background drone/tone
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const dest = audioCtx.createMediaStreamDestination();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(65, audioCtx.currentTime); // Low cinematic hum
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();

      const canvasStream = canvas.captureStream(30);
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks(),
      ]);

      const mimeType = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')
        ? 'video/mp4;codecs=avc1'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : 'video/webm';

      const recorder = new MediaRecorder(combinedStream, { mimeType });
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        osc.stop();
        audioCtx.close();
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        resolve({
          blob,
          url,
          name: 'sample_action_movie_teaser.mp4',
        });
      };

      recorder.start();

      const startTime = performance.now();
      const totalFrames = durationSeconds * 30;
      let frame = 0;

      const scenes = [
        { title: 'MYANMAR RECAP DEMO', sub: 'Action Teaser Scene 1', bg: '#090d16', accent: '#38bdf8' },
        { title: 'CRITICAL OPERATION', sub: 'City Underground Chase', bg: '#111827', accent: '#ef4444' },
        { title: 'DISCOVERING THE TRUTH', sub: 'The Master Plan Revealed', bg: '#0f172a', accent: '#eab308' },
        { title: 'THE FINAL CLASH', sub: 'Hero Never Surrenders', bg: '#030712', accent: '#10b981' },
      ];

      function renderFrame() {
        if (!ctx) return;
        if (frame >= totalFrames) {
          recorder.stop();
          return;
        }

        const elapsed = (performance.now() - startTime) / 1000;
        const sceneIndex = Math.min(Math.floor((elapsed / durationSeconds) * scenes.length), scenes.length - 1);
        const scene = scenes[sceneIndex];

        // Background
        ctx.fillStyle = scene.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Animated light circles (cinematic lens flare)
        const t = elapsed * 1.5;
        const gradient = ctx.createRadialGradient(
          canvas.width / 2 + Math.sin(t) * 120,
          canvas.height / 2 + Math.cos(t * 0.7) * 200,
          20,
          canvas.width / 2,
          canvas.height / 2,
          450
        );
        gradient.addColorStop(0, scene.accent + '33');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Center visual graphic (Film clapperboard or shield)
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2 - 80);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        ctx.arc(0, 0, 180, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = scene.accent;
        ctx.lineWidth = 4;
        ctx.stroke();

        // Pulsing core
        const pulse = 1 + Math.sin(t * 4) * 0.08;
        ctx.scale(pulse, pulse);
        ctx.fillStyle = scene.accent;
        ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CINEMA SCENE', 0, 10);
        ctx.restore();

        // Scene Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(scene.title, canvas.width / 2, canvas.height / 2 + 160);

        // Subtitle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '24px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(scene.sub, canvas.width / 2, canvas.height / 2 + 210);

        // Simulated Original Subtitle (to test blur remover feature!)
        ctx.fillStyle = '#fef08a'; // yellow subtitle
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('[Original Sub: "He was not an ordinary man."]', canvas.width / 2, canvas.height - 180);

        // Watermark top-right (to test blur feature)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('WATERMARK_STUDIO_HD', canvas.width - 30, 60);

        // Timecode
        ctx.textAlign = 'left';
        ctx.font = 'mono 16px monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const ss = String(Math.floor(elapsed % 60)).padStart(2, '0');
        const ms = String(Math.floor((elapsed % 1) * 100)).padStart(2, '0');
        ctx.fillText(`REC ${mm}:${ss}.${ms}`, 30, 60);

        frame++;
        requestAnimationFrame(renderFrame);
      }

      renderFrame();
    } catch (err) {
      reject(err);
    }
  });
}
