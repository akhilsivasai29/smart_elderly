// Audio Utility using Web Audio API and Web Speech API

class SoundManager {
  constructor() {
    this.audioCtx = null;
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Play gentle chime (e.g. for menu click or soft reminder)
  playChime() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.3); // G5

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {
      console.warn("Audio play error", e);
    }
  }

  // Play repeating reminder alarm sound
  playAlarm() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const playPulse = (time, freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.25);
      };

      const now = ctx.currentTime;
      playPulse(now, 880);      // A5
      playPulse(now + 0.3, 880);
      playPulse(now + 0.6, 1046.5); // C6
    } catch (e) {
      console.warn("Alarm play error", e);
    }
  }

  // Play urgent escalation beep when missed / caregiver alert
  playUrgentAlert() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(950, now + i * 0.25);
        
        gain.gain.setValueAtTime(0.5, now + i * 0.25);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.25 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.25);
        osc.stop(now + i * 0.25 + 0.2);
      }
    } catch (e) {
      console.warn("Urgent audio error", e);
    }
  }

  // Play celebratory success sound when medicine taken
  playSuccess() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0.3, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.3);
      });
    } catch (e) {
      console.warn("Success audio error", e);
    }
  }
}

export const soundManager = new SoundManager();

// Text to speech function using Web Speech API
export const speakText = (text, rate = 0.9, pitch = 1.0) => {
  if (!('speechSynthesis' in window)) {
    console.warn("Speech Synthesis not supported in this browser.");
    return;
  }

  // Stop previous speaking
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate; // Slightly slower for elderly clarity
  utterance.pitch = pitch;

  // Try to pick a friendly English voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Female')));
  if (preferVoice) {
    utterance.voice = preferVoice;
  }

  window.speechSynthesis.speak(utterance);
};
