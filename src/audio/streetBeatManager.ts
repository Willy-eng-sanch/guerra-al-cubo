// Street Lo-Fi Beat Synthesizer for Guerra Cubita using Web Audio API
class StreetBeatManager {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private volume = 0.25;
  private tempo = 84; // chill lo-fi street tempo
  private timerId: number | null = null;
  private currentStep = 0;
  private masterGain: GainNode | null = null;
  private listeners: (() => void)[] = [];

  constructor() {
    try {
      const savedVol = localStorage.getItem('gc_music_volume');
      const savedPlaying = localStorage.getItem('gc_music_enabled');
      if (savedVol !== null) this.volume = parseFloat(savedVol);
      if (savedPlaying === 'false') this.isPlaying = false;
    } catch (e) {
      // ignore
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getVolume(): number {
    return this.volume;
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    try {
      localStorage.setItem('gc_music_volume', String(this.volume));
    } catch (e) {}
    this.notify();
  }

  toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }

  start() {
    this.initContext();
    if (this.isPlaying || !this.ctx || !this.masterGain) return;
    this.isPlaying = true;
    try {
      localStorage.setItem('gc_music_enabled', 'true');
    } catch (e) {}

    const stepDurationMs = (60 / this.tempo / 4) * 1000; // 16th notes
    this.currentStep = 0;

    this.timerId = window.setInterval(() => {
      this.tickStep();
      this.currentStep = (this.currentStep + 1) % 16;
    }, stepDurationMs);

    this.notify();
  }

  stop() {
    if (this.timerId) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isPlaying = false;
    try {
      localStorage.setItem('gc_music_enabled', 'false');
    } catch (e) {}
    this.notify();
  }

  private tickStep() {
    if (!this.ctx || !this.masterGain || this.volume <= 0) return;
    const now = this.ctx.currentTime;
    const step = this.currentStep;

    // Pattern: 16-step street boom-bap rhythm
    // Kick on steps 0, 8, 10
    if (step === 0 || step === 8 || step === 10) {
      this.playKick(now, step === 0 ? 0.9 : 0.7);
    }

    // Snare on steps 4, 12
    if (step === 4 || step === 12) {
      this.playSnare(now, 0.85);
    }

    // Closed Hi-Hat on even steps (0, 2, 4, 6, 8, 10, 12, 14) + slight accent
    if (step % 2 === 0) {
      const isAccent = step % 4 === 2;
      this.playHiHat(now, isAccent ? 0.45 : 0.3);
    }

    // Bass note progression (steps 0, 6, 8, 14)
    if (step === 0 || step === 6 || step === 8 || step === 14) {
      const notes = [65.41, 58.27, 49.0, 73.42]; // C2, Bb1, G1, D2
      const note = notes[Math.floor(step / 4) % notes.length];
      this.playSubBass(now, note, 0.6);
    }
  }

  private playKick(time: number, velocity: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);

    gain.gain.setValueAtTime(velocity * 0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.2);
  }

  private playSnare(time: number, velocity: number) {
    if (!this.ctx || !this.masterGain) return;

    // Filtered noise buffer
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, time);
    filter.Q.setValueAtTime(1.2, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(velocity * 0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.13);
  }

  private playHiHat(time: number, velocity: number) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7500, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(velocity * 0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.05);
  }

  private playSubBass(time: number, freq: number, velocity: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(velocity * 0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.38);
  }
}

export const streetBeat = new StreetBeatManager();
