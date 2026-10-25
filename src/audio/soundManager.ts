// Web Audio API implementation replicating SoundManager.kt synthesized tones and noise bursts

class SoundManager {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private vibrate(ms: number) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch {
        // ignore
      }
    }
  }

  private playImpact(frequency: number, duration: number, volume: number, noiseVolume: number) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const toneGain = ctx.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(45, frequency * 0.55), now + duration);
    toneGain.gain.setValueAtTime(volume, now);
    toneGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(toneGain);
    toneGain.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);

    const noiseDuration = Math.min(duration, 0.055);
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * noiseDuration));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    noise.buffer = buffer;
    noiseGain.gain.setValueAtTime(noiseVolume, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + noiseDuration);
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
  }

  playIntroCubeDrop(index: number) {
    this.playImpact(390 + (index % 6) * 32, 0.085, 0.11, 0.09);
  }

  playCupShake() {
    this.playImpact(235, 0.07, 0.055, 0.07);
  }

  playIntroCubeLand(index: number) {
    this.playImpact(175 + (index % 6) * 22, 0.12, 0.14, 0.12);
  }

  playDiceRoll() {
    this.vibrate(30);
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const tones = [
      { freq: 440, dur: 0.04 },
      { freq: 550, dur: 0.04 },
      { freq: 660, dur: 0.05 },
      { freq: 880, dur: 0.07 }
    ];

    let t = now;
    tones.forEach(({ freq, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
      t += dur;
    });
  }

  playPunchHit() {
    this.vibrate(70);
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Punch noise burst
    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const progress = i / bufferSize;
      const env = (1 - progress) * (1 - progress);
      const noise = (Math.random() * 2 - 1) * 0.4;
      const sub = Math.sin(2 * Math.PI * 110 * (i / ctx.sampleRate)) * 0.6;
      data[i] = (noise + sub) * env;
    }
    const node = ctx.createBufferSource();
    node.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    node.connect(gain);
    gain.connect(ctx.destination);
    node.start(now);
  }

  playPerfectBlock() {
    this.vibrate(120);
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const tones = [
      { freq: 1200, dur: 0.08 },
      { freq: 1760, dur: 0.16 }
    ];
    let t = now;
    tones.forEach(({ freq, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
      t += dur;
    });
  }

  playCardDraw() {
    this.vibrate(25);
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const tones = [
      { freq: 600, dur: 0.03 },
      { freq: 900, dur: 0.045 }
    ];
    let t = now;
    tones.forEach(({ freq, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
      t += dur;
    });
  }

  playStanceActivate() {
    this.vibrate(50);
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const tones = [
      { freq: 350, dur: 0.05 },
      { freq: 520, dur: 0.07 },
      { freq: 780, dur: 0.1 }
    ];
    let t = now;
    tones.forEach(({ freq, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
      t += dur;
    });
  }

  playElimination() {
    this.vibrate(250);
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.35;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const progress = i / bufferSize;
      const env = Math.pow(1 - progress, 1.5);
      const noise = (Math.random() * 2 - 1) * 0.5;
      const sub = Math.sin(2 * Math.PI * 65 * (i / ctx.sampleRate)) * 0.7;
      data[i] = (noise + sub) * env;
    }
    const node = ctx.createBufferSource();
    node.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    node.connect(gain);
    gain.connect(ctx.destination);
    node.start(now);
  }
}

export const sound = new SoundManager();
