/**
 * Audio Synthesizer for Burmese Movie Narration
 * Supports Web Speech API with natural Burmese voice adaptation,
 * speech rate, pitch, and voice gender profiles.
 */

let currentUtterance: SpeechSynthesisUtterance | null = null;

export interface VoiceOptions {
  voiceId: 'my-MM-NilarNeural' | 'my-MM-ThihaNeural';
  rate: number;
  pitch: number;
  volume: number;
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function speakBurmeseText(
  text: string,
  options: VoiceOptions,
  onStart?: () => void,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return false;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  currentUtterance = utterance;

  // Rate & pitch adjustment based on gender profile
  utterance.rate = Math.max(0.7, Math.min(1.5, options.rate || 1.0));
  utterance.volume = Math.max(0, Math.min(1.0, options.volume || 1.0));

  if (options.voiceId === 'my-MM-NilarNeural') {
    // Female profile: slightly higher pitch, melodic
    utterance.pitch = (options.pitch || 1.0) * 1.15;
  } else {
    // Male profile: deeper pitch, authoritative
    utterance.pitch = (options.pitch || 1.0) * 0.85;
  }

  // Find suitable voice if available (Burmese or Southeast Asian or default)
  const voices = window.speechSynthesis.getVoices();
  const burmeseVoice = voices.find(
    (v) =>
      v.lang.startsWith('my') ||
      v.name.toLowerCase().includes('burmese') ||
      v.name.toLowerCase().includes('myanmar')
  );

  if (burmeseVoice) {
    utterance.voice = burmeseVoice;
  } else {
    // Fallback to default, speech synth will still pronounce Unicode properly
    utterance.lang = 'my-MM';
  }

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;
  utterance.onerror = (e) => {
    console.error('TTS speech error:', e);
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
  return true;
}

/**
 * Preload voices so SpeechSynthesis is ready without delay
 */
export function initSpeechVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
  });
}
