// Web Audio API Procedural Urban Music Manager for Guerra Cubita
// Delivers authentic street hip-hop, funk and battle grooves with zero network latency.

export interface MusicTrack {
  id: string;
  name: string;
  style: string;
  bpm: number;
  audioUrl?: string;
  badge?: string;
}

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'pangea',
    name: 'Beat Callejero Pangea (Audio Subido)',
    style: 'Urban Breakbeat & Sintetizador Callejero • 120 BPM',
    bpm: 120,
    audioUrl: '/assets/aistudio/pangea_93d720f9.wav',
    badge: '★ SUBIDO'
  },
  { id: 'asfalto', name: 'Ritmo de Asfalto', style: 'Boom-Bap Callejero 92 BPM', bpm: 92 },
  { id: 'furia', name: 'Furia de Dados', style: 'Breakbeat Funk 116 BPM', bpm: 116 },
  { id: 'heroico', name: 'Groove Heroico PvZ', style: 'Slap-Bass & Brass 105 BPM', bpm: 105 }
];

class UrbanMusicManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private duckingGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private currentTrackId: string = 'pangea';
  private timerId: number | null = null;
  private currentStep: number = 0;
  private volume: number = 0.50;
  private isMuted: boolean = false;
  private duckFactor: number = 1.0;
  private audioEl: HTMLAudioElement | null = null;
  private listeners: Array<() => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('guerra_cubita_music_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
      const savedVol = localStorage.getItem('guerra_cubita_music_volume');
      if (savedVol !== null) {
        this.volume = parseFloat(savedVol) || 0.50;
      }
    }
  }

  private initAudioElement() {
    if (typeof window === 'undefined' || this.audioEl) return;
    this.audioEl = new Audio();
    this.audioEl.loop = true;
    this.audioEl.preload = 'auto';
    this.updateAudioElVolume();
  }

  private updateAudioElVolume() {
    if (!this.audioEl) return;
    const finalVol = this.isMuted ? 0 : Math.max(0, Math.min(1, this.volume * this.duckFactor));
    this.audioEl.volume = finalVol;
  }

  private initContext() {
    this.initAudioElement();
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.duckingGain = this.ctx.createGain();

    this.duckingGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);

    this.duckingGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  // Duck music volume when narrator speaks
  duck(isSpeaking: boolean) {
    this.duckFactor = isSpeaking ? 0.2 : 1.0;
    this.updateAudioElVolume();

    if (!this.ctx || !this.duckingGain) return;
    const now = this.ctx.currentTime;
    this.duckingGain.gain.cancelScheduledValues(now);
    if (isSpeaking) {
      this.duckingGain.gain.setTargetAtTime(0.2, now, 0.08);
    } else {
      this.duckingGain.gain.setTargetAtTime(1.0, now, 0.25);
    }
  }

  play() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const track = this.getCurrentTrack();
    this.isPlaying = true;

    if (track.audioUrl) {
      // Stop procedural beat if running
      if (this.timerId !== null) {
        window.clearTimeout(this.timerId);
        this.timerId = null;
      }
      if (this.audioEl) {
        if (!this.audioEl.src.endsWith(track.audioUrl)) {
          this.audioEl.src = track.audioUrl;
          this.audioEl.currentTime = 0;
        }
        this.updateAudioElVolume();
        this.audioEl.play().catch(err => {
          console.warn('Audio play prevented by browser autoplay policy:', err);
        });
      }
    } else {
      // Stop file audio if running
      if (this.audioEl) {
        this.audioEl.pause();
      }
      this.currentStep = 0;
      this.scheduleBeat();
    }

    this.notify();
  }

  pause() {
    this.isPlaying = false;
    if (this.audioEl) {
      this.audioEl.pause();
    }
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.notify();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('guerra_cubita_music_muted', String(muted));
    }
    this.updateAudioElVolume();
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(muted ? 0 : this.volume, now, 0.05);
    }
    this.notify();
  }

  toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      localStorage.setItem('guerra_cubita_music_volume', String(this.volume));
    }
    this.updateAudioElVolume();
    if (this.ctx && this.masterGain && !this.isMuted) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(this.volume, now, 0.05);
    }
    this.notify();
  }

  selectTrack(trackId: string) {
    if (this.currentTrackId === trackId) return;
    const wasPlaying = this.isPlaying;
    if (this.audioEl) {
      this.audioEl.pause();
    }
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.currentTrackId = trackId;
    this.currentStep = 0;
    if (wasPlaying) {
      this.isPlaying = false;
      this.play();
    } else {
      this.notify();
    }
  }

  getIsPlaying() { return this.isPlaying; }
  getIsMuted() { return this.isMuted; }
  getVolume() { return this.volume; }
  getCurrentTrack() {
    return MUSIC_TRACKS.find(t => t.id === this.currentTrackId) || MUSIC_TRACKS[0];
  }

  subscribe(fn: () => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notify() {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.listeners.forEach(fn => {
          try {
            fn();
          } catch (e) {
            console.warn('music subscriber error:', e);
          }
        });
      }, 0);
    } else {
      this.listeners.forEach(fn => fn());
    }
  }

  // Procedural Drum & Bass & Rhodes synthesis
  private scheduleBeat() {
    if (!this.isPlaying || !this.ctx || !this.duckingGain) return;

    const track = this.getCurrentTrack();
    const stepDuration = (60 / track.bpm) / 4; // 16th note in seconds
    const now = this.ctx.currentTime;

    const step = this.currentStep % 16;
    const bar = Math.floor(this.currentStep / 16) % 4;

    // --- Kick Drum ---
    const isKick =
      step === 0 ||
      step === 6 ||
      step === 10 ||
      (track.id === 'furia' && (step === 3 || step === 12));
    if (isKick) {
      this.playKick(now);
    }

    // --- Snare / Rimshot ---
    const isSnare = step === 4 || step === 12;
    if (isSnare) {
      this.playSnare(now);
    }

    // --- Hi-Hats ---
    const isHiHat = step % 2 === 0;
    const isAccent = step % 4 === 2;
    if (isHiHat) {
      this.playHiHat(now, isAccent ? 0.08 : 0.04, isAccent);
    }

    // --- Street Bassline ---
    this.playBassStep(now, step, bar, track.id);

    // --- Rhodes / Synth Chords ---
    if (step === 0 || step === 6 || step === 10) {
      this.playChords(now, bar, track.id);
    }

    this.currentStep++;

    const nextDelayMs = stepDuration * 1000;
    this.timerId = window.setTimeout(() => {
      this.scheduleBeat();
    }, nextDelayMs);
  }

  private playKick(time: number) {
    if (!this.ctx || !this.duckingGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    osc.connect(gain);
    gain.connect(this.duckingGain);

    osc.start(time);
    osc.stop(time + 0.15);
  }

  private playSnare(time: number) {
    if (!this.ctx || !this.duckingGain) return;

    // Noise component
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.duckingGain);

    noise.start(time);

    // Tone punch
    const osc = this.ctx.createOscillator();
    const toneGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(110, time + 0.07);

    toneGain.gain.setValueAtTime(0.28, time);
    toneGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    osc.connect(toneGain);
    toneGain.connect(this.duckingGain);

    osc.start(time);
    osc.stop(time + 0.08);
  }

  private playHiHat(time: number, vol: number, isOpen: boolean) {
    if (!this.ctx || !this.duckingGain) return;
    const dur = isOpen ? 0.08 : 0.035;
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, isOpen ? 1.5 : 3);
    }

    const node = this.ctx.createBufferSource();
    node.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7500;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    node.connect(filter);
    filter.connect(gain);
    gain.connect(this.duckingGain);

    node.start(time);
  }

  private playBassStep(time: number, step: number, bar: number, trackId: string) {
    if (!this.ctx || !this.duckingGain) return;

    // Bass notes progression (Cm -> Ab -> Fm -> G)
    const roots = [65.41, 51.91, 43.65, 49.0]; // C2, Ab1, F1, G1
    const root = roots[bar % roots.length];

    let freq = 0;
    if (step === 0 || step === 3 || step === 6 || step === 10 || step === 14) {
      if (step === 0) freq = root;
      else if (step === 3) freq = root * 1.5; // 5th
      else if (step === 6) freq = root;
      else if (step === 10) freq = root * 1.2; // Minor 3rd
      else if (step === 14) freq = root * 1.06; // Slide
    }

    if (freq === 0) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = trackId === 'furia' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, time);
    filter.frequency.exponentialRampToValueAtTime(140, time + 0.16);

    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.duckingGain);

    osc.start(time);
    osc.stop(time + 0.19);
  }

  private playChords(time: number, bar: number, trackId: string) {
    if (!this.ctx || !this.duckingGain) return;

    // Chords (Cm7, Abmaj7, Fm7, G7)
    const chordPitches = [
      [130.81, 155.56, 196.0, 233.08], // Cm7
      [103.83, 130.81, 155.56, 196.0], // Abmaj7
      [87.31, 103.83, 130.81, 155.56], // Fm7
      [98.0, 123.47, 146.83, 174.61]   // G7
    ];
    const notes = chordPitches[bar % chordPitches.length];

    notes.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = trackId === 'heroico' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.035, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

      osc.connect(gain);
      gain.connect(this.duckingGain!);

      osc.start(time);
      osc.stop(time + 0.36);
    });
  }
}

export const music = new UrbanMusicManager();
