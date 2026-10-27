// Street Fighting Narrator ("El Árbitro de la Calle")
// Uses natural expressive neural voices with street sports commentary personality and music ducking.

import { music } from './musicManager';

export interface NarratorVoiceOption {
  voice: SpeechSynthesisVoice;
  displayName: string;
  isHighQuality: boolean;
}

class StreetNarratorManager {
  private isEnabled: boolean = true;
  private volume: number = 0.9;
  private selectedVoiceName: string | null = null;
  private availableVoices: SpeechSynthesisVoice[] = [];
  private speechQueue: string[] = [];
  private isSpeaking: boolean = false;
  private listeners: Array<() => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const savedEnabled = localStorage.getItem('guerra_cubita_narrator_enabled');
      if (savedEnabled !== null) {
        this.isEnabled = savedEnabled === 'true';
      }
      const savedVol = localStorage.getItem('guerra_cubita_narrator_volume');
      if (savedVol !== null) {
        this.volume = parseFloat(savedVol) || 0.9;
      }
      const savedVoice = localStorage.getItem('guerra_cubita_narrator_voice');
      if (savedVoice) {
        this.selectedVoiceName = savedVoice;
      }

      this.loadVoices();
      if (typeof window.speechSynthesis !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = () => {
          this.loadVoices();
        };
      }
    }
  }

  private loadVoices() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const all = window.speechSynthesis.getVoices();
    if (!all || all.length === 0) return;

    // Filter Spanish voices first
    const spanishVoices = all.filter(v => v.lang.toLowerCase().startsWith('es'));
    this.availableVoices = spanishVoices.length > 0 ? spanishVoices : all;

    this.notify();
  }

  // Find the highest quality, most natural human voice available
  getBestVoice(): SpeechSynthesisVoice | null {
    if (this.availableVoices.length === 0) {
      this.loadVoices();
    }
    if (this.availableVoices.length === 0) return null;

    if (this.selectedVoiceName) {
      const custom = this.availableVoices.find(v => v.name === this.selectedVoiceName);
      if (custom) return custom;
    }

    // Priority rank for natural / neural human-like voices
    const naturalKeywords = ['natural', 'neural', 'online', 'google', 'premium', 'enhanced', 'diego', 'jorge', 'alvaro', 'paulina'];

    for (const kw of naturalKeywords) {
      const found = this.availableVoices.find(v => v.name.toLowerCase().includes(kw) && v.lang.startsWith('es'));
      if (found) return found;
    }

    // Secondary: any Spanish voice
    const esVoice = this.availableVoices.find(v => v.lang.startsWith('es'));
    if (esVoice) return esVoice;

    return this.availableVoices[0] || null;
  }

  getVoiceOptions(): NarratorVoiceOption[] {
    return this.availableVoices.map(v => {
      const isHq = ['natural', 'neural', 'online', 'google', 'premium', 'enhanced'].some(kw =>
        v.name.toLowerCase().includes(kw)
      );
      return {
        voice: v,
        displayName: `${v.name} (${v.lang})${isHq ? ' ★ Voz Natural' : ''}`,
        isHighQuality: isHq
      };
    });
  }

  setSelectedVoice(voiceName: string) {
    this.selectedVoiceName = voiceName;
    if (typeof window !== 'undefined') {
      localStorage.setItem('guerra_cubita_narrator_voice', voiceName);
    }
    this.notify();
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.speechQueue = [];
      this.isSpeaking = false;
      music.duck(false);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('guerra_cubita_narrator_enabled', String(enabled));
    }
    this.notify();
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      localStorage.setItem('guerra_cubita_narrator_volume', String(this.volume));
    }
    this.notify();
  }

  getIsEnabled() { return this.isEnabled; }
  getVolume() { return this.volume; }
  getSelectedVoiceName() { return this.selectedVoiceName; }

  subscribe(fn: () => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  // Announce an event with human sports/street fight commentary
  speak(text: string, priority: 'HIGH' | 'NORMAL' = 'NORMAL') {
    if (!this.isEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    if (priority === 'HIGH') {
      window.speechSynthesis.cancel();
      this.speechQueue = [text];
    } else {
      // Don't accumulate more than 2 pending phrases
      if (this.speechQueue.length >= 2) {
        this.speechQueue.shift();
      }
      this.speechQueue.push(text);
    }

    if (!this.isSpeaking) {
      this.processQueue();
    }
  }

  private processQueue() {
    if (this.speechQueue.length === 0 || !this.isEnabled) {
      this.isSpeaking = false;
      music.duck(false);
      this.notify();
      return;
    }

    const text = this.speechQueue.shift()!;
    const voice = this.getBestVoice();
    const utterance = new SpeechSynthesisUtterance(text);

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = 'es-ES';
    }

    // Natural energetic human cadence (not robotic monotone)
    utterance.rate = 1.08;
    utterance.pitch = 1.04;
    utterance.volume = this.volume;

    this.isSpeaking = true;
    music.duck(true);
    this.notify();

    utterance.onend = () => {
      this.isSpeaking = false;
      music.duck(false);
      this.notify();
      setTimeout(() => this.processQueue(), 120);
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      music.duck(false);
      this.notify();
      setTimeout(() => this.processQueue(), 50);
    };

    window.speechSynthesis.speak(utterance);
  }

  // --- Narration Phrasing Presets for Battle Events ---

  narrateMatchStart(modeName: string) {
    const lines = [
      `¡Damas y caballeros, bienvenidos a la acera! ¡Arranca el combate de ${modeName}!`,
      `¡Suenan los dados en la calle! ¡Que comience la pelea!`,
      `¡Tensión máxima en el asfalto! ¡Ronda uno, a luchar!`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'HIGH');
  }

  narrateAttack(attackerName: string, defenderName: string, damage: number, attackerRoll: number) {
    if (damage <= 0) return;
    const lines = [
      `¡Pum! ¡${attackerName} clava un ${attackerRoll} y sacude a ${defenderName} con ${damage} de daño!`,
      `¡Tremendo golpe de ${attackerName}! ¡Le resta ${damage} puntos a ${defenderName}!`,
      `¡Impacto directo! ¡${attackerName} conecta con fuerza en la acera!`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'NORMAL');
  }

  narrateSuperBlock(defenderName: string, rolledNumber: number, superpowerName: string) {
    const lines = [
      `¡¡QUÉ PARADA!! ¡Super-Bloqueo Heroico de ${defenderName}! ¡Igualó el ${rolledNumber} y desata ${superpowerName}!`,
      `¡¡Bloqueo perfecto monumental!! ¡${defenderName} frenó el golpe al seco y activa su superpoder!`,
      `¡Increíble reflejo! ¡${defenderName} clavó el mismo número y no recibe ni un rasguño!`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'HIGH');
  }

  narrateClassSynergy(heroName: string, categoryName: string, bonus: string) {
    const lines = [
      `¡Sinergia Heroica de clase ${categoryName}! ¡${heroName} saca ventaja en el combate!`,
      `¡Combinación magistral! ¡${heroName} activa su sinergia de clase!`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'NORMAL');
  }

  narrateSpecialFaceSix(playerName: string, choiceText: string) {
    const lines = [
      `¡Cara Seis especial! ¡${playerName} saca el máximo y elige ${choiceText}!`,
      `¡Seis en el dado! ¡Jugada de maestro para ${playerName}!`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'NORMAL');
  }

  narrateElimination(playerName: string) {
    const lines = [
      `¡K.O.! ¡${playerName} cae al asfalto y queda fuera de la batalla!`,
      `¡A dormir! ¡${playerName} ha sido eliminado de la acera!`,
      `¡Fuera del combate! ¡${playerName} no resiste más la furia de los dados!`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'HIGH');
  }

  narrateVictory(winnerName: string) {
    const lines = [
      `¡¡SE ACABÓ!! ¡${winnerName} es el Campeón Indiscutible de la Calle!`,
      `¡Victoria total! ¡${winnerName} se corona en Guerra Cubita!`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'HIGH');
  }
}

export const narrator = new StreetNarratorManager();
