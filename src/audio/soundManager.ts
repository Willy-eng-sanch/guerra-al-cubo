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

  playCupDump() {
    this.playImpact(180, 0.15, 0.12, 0.14);
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

  // Cartoon Fight Brawl Sound Sequence (Whack, Boing, Pow, Slap)
  playCartoonFightBrawl() {
    this.vibrate(150);
    const ctx = this.getContext();
    if (!ctx) return;

    // Series of 6 rapid comical comic impacts over ~1.2s
    const impacts = [
      { delay: 0.0, type: 'whack', freq: 480 },
      { delay: 0.18, type: 'boing', freq: 220 },
      { delay: 0.38, type: 'punch', freq: 160 },
      { delay: 0.58, type: 'slap', freq: 620 },
      { delay: 0.80, type: 'boing', freq: 280 },
      { delay: 1.05, type: 'pow', freq: 140 }
    ];

    impacts.forEach(({ delay, type, freq }) => {
      setTimeout(() => {
        if (!this.ctx) return;
        if (type === 'boing') {
          this.playCartoonBoing(freq);
        } else if (type === 'whack' || type === 'slap') {
          this.playCartoonWhack(freq);
        } else {
          this.playPunchHit();
        }
      }, delay * 1000);
    });
  }

  playCartoonBoing(startFreq = 220) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    // Frequency sweeps upwards like a comic spring
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 2.8, now + 0.18);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  playCartoonWhack(freq = 520) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.12);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Cartoon Leap Whoosh sound when jumping to table center
  playLeapWhoosh() {
    this.vibrate(35);
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(560, now + 0.18);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Papercraft collage tape slap sound when character sticker & tape adhere to die face
  playPaperTapeSlap() {
    this.vibrate(40);
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Crisp paper slap: high frequency click + subtle wood/die thump
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);

    // Subtle paper rustle noise
    const bufferSize = Math.floor(ctx.sampleRate * 0.04);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.15;
    }
    const noise = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    noise.buffer = buffer;
    noiseGain.gain.setValueAtTime(0.18, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
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
