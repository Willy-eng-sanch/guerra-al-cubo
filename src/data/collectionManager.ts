import { CharacterType, CharacterDef } from '../types/game';
import { CHARACTER_LIST, CHARACTERS } from './characters';

const STORAGE_UNLOCKED_KEY = 'guerra_cubita_unlocked_heroes';
const STORAGE_COINS_KEY = 'guerra_cubita_street_coins';
const STORAGE_STARTER_OPENED_KEY = 'guerra_cubita_starter_box_opened';
const STORAGE_AURA_KEY = 'guerra_cubita_aura_points';
const STORAGE_BOXES_KEY = 'guerra_cubita_unopened_boxes';
const STORAGE_PATRON_KEY = 'guerra_cubita_is_patron';
const STORAGE_WINS_KEY = 'guerra_cubita_matches_won';
const STORAGE_MATCHES_KEY = 'guerra_cubita_matches_played';

export interface BoxOpeningResult {
  characters: CharacterDef[];
  isNew: boolean[];
  bonusCoinsEarned: number;
}

export interface AuraRankInfo {
  tierName: string;
  rankTitle: string;
  currentAura: number;
  nextAuraThreshold: number;
  progressPercent: number;
  colorHex: string;
  badge: string;
  auraGlowCss: string;
  perkDescription: string;
}

class CollectionManager {
  private unlockedTypes: Set<CharacterType>;
  private coins: number;
  private hasOpenedStarterBox: boolean;
  private auraPoints: number;
  private unopenedBoxes: number;
  private isBetaPatron: boolean;
  private matchesWon: number;
  private matchesPlayed: number;
  private listeners: Array<() => void> = [];

  constructor() {
    this.unlockedTypes = new Set<CharacterType>();
    this.coins = 300;
    this.hasOpenedStarterBox = false;
    this.auraPoints = 50;
    this.unopenedBoxes = 1; // 1 Caja de bienvenida en la Beta
    this.isBetaPatron = false;
    this.matchesWon = 0;
    this.matchesPlayed = 0;
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const savedHeroes = localStorage.getItem(STORAGE_UNLOCKED_KEY);
      if (savedHeroes) {
        const parsed: CharacterType[] = JSON.parse(savedHeroes);
        this.unlockedTypes = new Set(parsed);
      } else {
        // Inicialmente con los 3 primeros héroes para jugar de inmediato
        this.unlockedTypes = new Set<CharacterType>([
          CharacterType.CUBOGRO,
          CharacterType.FLAUCUBISTA_DESAFINADO,
          CharacterType.GLADIACUBON
        ]);
      }

      const savedCoins = localStorage.getItem(STORAGE_COINS_KEY);
      if (savedCoins !== null) {
        this.coins = parseInt(savedCoins, 10) || 0;
      } else {
        this.coins = 300;
      }

      const savedStarter = localStorage.getItem(STORAGE_STARTER_OPENED_KEY);
      this.hasOpenedStarterBox = savedStarter === 'true';

      const savedAura = localStorage.getItem(STORAGE_AURA_KEY);
      this.auraPoints = savedAura !== null ? Math.max(0, parseInt(savedAura, 10) || 0) : 50;

      const savedBoxes = localStorage.getItem(STORAGE_BOXES_KEY);
      this.unopenedBoxes = savedBoxes !== null ? Math.max(0, parseInt(savedBoxes, 10) || 0) : 1;

      const savedPatron = localStorage.getItem(STORAGE_PATRON_KEY);
      this.isBetaPatron = savedPatron === 'true';

      const savedWins = localStorage.getItem(STORAGE_WINS_KEY);
      this.matchesWon = savedWins !== null ? parseInt(savedWins, 10) || 0 : 0;

      const savedMatches = localStorage.getItem(STORAGE_MATCHES_KEY);
      this.matchesPlayed = savedMatches !== null ? parseInt(savedMatches, 10) || 0 : 0;
    } catch (e) {
      console.warn('Could not load collection and aura from storage', e);
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_UNLOCKED_KEY, JSON.stringify(Array.from(this.unlockedTypes)));
      localStorage.setItem(STORAGE_COINS_KEY, String(this.coins));
      localStorage.setItem(STORAGE_STARTER_OPENED_KEY, String(this.hasOpenedStarterBox));
      localStorage.setItem(STORAGE_AURA_KEY, String(this.auraPoints));
      localStorage.setItem(STORAGE_BOXES_KEY, String(this.unopenedBoxes));
      localStorage.setItem(STORAGE_PATRON_KEY, String(this.isBetaPatron));
      localStorage.setItem(STORAGE_WINS_KEY, String(this.matchesWon));
      localStorage.setItem(STORAGE_MATCHES_KEY, String(this.matchesPlayed));
    } catch (e) {
      console.warn('Could not save collection to storage', e);
    }
    this.notify();
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

  // --- AURA & RANKS ---
  getAuraPoints(): number {
    return this.auraPoints;
  }

  getAuraRank(): AuraRankInfo {
    const pts = this.auraPoints;

    if (pts < 100) {
      return {
        tierName: 'Novato',
        rankTitle: 'Aura Novato de Esquina',
        currentAura: pts,
        nextAuraThreshold: 100,
        progressPercent: Math.min(100, Math.floor((pts / 100) * 100)),
        colorHex: '#94a3b8',
        badge: '🥉 BRONCE',
        auraGlowCss: 'rgba(148, 163, 184, 0.45)',
        perkDescription: 'Dados de resina básica. Emparejamiento en liga de novatos.'
      };
    } else if (pts < 300) {
      return {
        tierName: 'Buscalíos',
        rankTitle: 'Aura Buscalíos Urbano',
        currentAura: pts,
        nextAuraThreshold: 300,
        progressPercent: Math.min(100, Math.floor(((pts - 100) / 200) * 100)),
        colorHex: '#10b981',
        badge: '🥈 ESMERALDA',
        auraGlowCss: 'rgba(16, 185, 129, 0.55)',
        perkDescription: '+10% probabilidad de cartas raras en el mazo inicial.'
      };
    } else if (pts < 600) {
      return {
        tierName: 'Tahúr',
        rankTitle: 'Aura Tahúr de Asfalto',
        currentAura: pts,
        nextAuraThreshold: 600,
        progressPercent: Math.min(100, Math.floor(((pts - 300) / 300) * 100)),
        colorHex: '#38bdf8',
        badge: '🥇 ZAFIRO',
        auraGlowCss: 'rgba(56, 189, 248, 0.65)',
        perkDescription: 'Halo azul de choque en la mesa. Desbloquea partidas clasificatorias.'
      };
    } else if (pts < 1000) {
      return {
        tierName: 'Guapo',
        rankTitle: 'Aura Guapo Callejero',
        currentAura: pts,
        nextAuraThreshold: 1000,
        progressPercent: Math.min(100, Math.floor(((pts - 600) / 400) * 100)),
        colorHex: '#c084fc',
        badge: '💎 AMATISTA',
        auraGlowCss: 'rgba(192, 132, 252, 0.75)',
        perkDescription: 'Efecto de humo de vapor y chispas al rodar dados en la arena.'
      };
    } else if (pts < 2000) {
      return {
        tierName: 'Leyenda',
        rankTitle: 'Aura Leyenda de Asfalto',
        currentAura: pts,
        nextAuraThreshold: 2000,
        progressPercent: Math.min(100, Math.floor(((pts - 1000) / 1000) * 100)),
        colorHex: '#fbbf24',
        badge: '👑 ORO REAL',
        auraGlowCss: 'rgba(251, 191, 36, 0.85)',
        perkDescription: 'Corona dorada sobre tus dados y marco exclusivo de leyenda.'
      };
    } else {
      return {
        tierName: 'Dios',
        rankTitle: 'Aura Dios de la Guerra Cubita',
        currentAura: pts,
        nextAuraThreshold: 5000,
        progressPercent: 100,
        colorHex: '#ef4444',
        badge: '🔥 MÍTICO',
        auraGlowCss: 'rgba(239, 68, 68, 0.95)',
        perkDescription: 'Llamas carmesí en los lanzamientos de combate y respeto total.'
      };
    }
  }

  addAura(points: number): number {
    this.auraPoints = Math.max(0, this.auraPoints + points);
    this.saveToStorage();
    return this.auraPoints;
  }

  // --- MATCH RESULTS (Ganar partidas sube Aura y regala Cajas) ---
  recordMatchResult(isVictory: boolean): {
    auraGained: number;
    boxesGained: number;
    coinsGained: number;
    newAura: number;
    unopenedBoxes: number;
  } {
    this.matchesPlayed += 1;
    let auraGained = 15;
    let boxesGained = 0;
    let coinsGained = 20;

    if (isVictory) {
      this.matchesWon += 1;
      auraGained = 35; // +35 Aura por ganar
      boxesGained = 1; // +1 Caja de 3 Dados garantizada por victoria
      coinsGained = 60;
      this.unopenedBoxes += 1;
    }

    this.auraPoints += auraGained;
    this.coins += coinsGained;
    this.saveToStorage();

    return {
      auraGained,
      boxesGained,
      coinsGained,
      newAura: this.auraPoints,
      unopenedBoxes: this.unopenedBoxes
    };
  }

  // --- UNOPENED BOXES & INVENTORY ---
  getUnopenedBoxes(): number {
    return this.unopenedBoxes;
  }

  addUnopenedBoxes(count: number) {
    this.unopenedBoxes = Math.max(0, this.unopenedBoxes + count);
    this.saveToStorage();
  }

  // --- PAY WHAT YOU WANT / MECENAS BETA ---
  getIsPatron(): boolean {
    return this.isBetaPatron;
  }

  supportPayWhatYouWant(amountUSD: number, boxesToGrant: number, auraBonus: number) {
    this.isBetaPatron = true;
    this.unopenedBoxes += boxesToGrant;
    this.auraPoints += auraBonus;
    this.coins += Math.round(amountUSD * 100);
    this.saveToStorage();
  }

  // --- CHARACTERS & COINS ---
  getUnlockedCharacters(): CharacterType[] {
    return Array.from(this.unlockedTypes);
  }

  isUnlocked(type: CharacterType): boolean {
    return this.unlockedTypes.has(type);
  }

  getCoins(): number {
    return this.coins;
  }

  addCoins(amount: number): number {
    this.coins = Math.max(0, this.coins + amount);
    this.saveToStorage();
    return this.coins;
  }

  spendCoins(amount: number): boolean {
    if (this.coins < amount) return false;
    this.coins -= amount;
    this.saveToStorage();
    return true;
  }

  hasMinimumSquad(): boolean {
    return this.unlockedTypes.size >= 3;
  }

  canOpenBox(): boolean {
    if (this.unopenedBoxes > 0) return true;
    if (this.unlockedTypes.size < 3) return true;
    return this.coins >= 100;
  }

  getBoxCost(): number {
    if (this.unopenedBoxes > 0) return 0; // Gratis con caja ganada
    if (this.unlockedTypes.size < 3 && !this.hasOpenedStarterBox) return 0;
    return 100;
  }

  // Open a Mystery Crate of 3 Characters (Caja de 3 Dados)
  openBoxOfThree(): BoxOpeningResult {
    // Si tiene cajas ganadas acumuladas, gastamos 1 caja en vez de monedas
    if (this.unopenedBoxes > 0) {
      this.unopenedBoxes = Math.max(0, this.unopenedBoxes - 1);
    } else {
      const cost = this.getBoxCost();
      if (cost > 0) {
        this.coins = Math.max(0, this.coins - cost);
      }
    }
    this.hasOpenedStarterBox = true;

    // Pick 3 distinct characters from the pool of 13
    const allTypes = CHARACTER_LIST.map(c => c.type);
    const lockedPool = allTypes.filter(t => !this.unlockedTypes.has(t));
    const alreadyUnlockedPool = allTypes.filter(t => this.unlockedTypes.has(t));

    const selectedTypes: CharacterType[] = [];
    const isNew: boolean[] = [];
    let bonusCoins = 0;

    const shuffledLocked = [...lockedPool].sort(() => Math.random() - 0.5);
    const shuffledUnlocked = [...alreadyUnlockedPool].sort(() => Math.random() - 0.5);

    while (selectedTypes.length < 3) {
      if (shuffledLocked.length > 0) {
        const next = shuffledLocked.shift()!;
        selectedTypes.push(next);
        isNew.push(true);
        this.unlockedTypes.add(next);
      } else if (shuffledUnlocked.length > 0) {
        const next = shuffledUnlocked.shift()!;
        selectedTypes.push(next);
        isNew.push(false);
        bonusCoins += 35; // +35 monedas por duplicado
      } else {
        const rand = allTypes[Math.floor(Math.random() * allTypes.length)];
        selectedTypes.push(rand);
        isNew.push(false);
        bonusCoins += 35;
      }
    }

    if (bonusCoins > 0) {
      this.coins += bonusCoins;
    }

    // Cada apertura de caja otorga además +15 de Aura por abrir botín
    this.auraPoints += 15;

    this.saveToStorage();

    return {
      characters: selectedTypes.map(t => CHARACTERS[t]),
      isNew,
      bonusCoinsEarned: bonusCoins
    };
  }

  getStats() {
    return {
      matchesWon: this.matchesWon,
      matchesPlayed: this.matchesPlayed,
      unlockedCount: this.unlockedTypes.size,
      totalCount: CHARACTER_LIST.length,
      auraPoints: this.auraPoints,
      unopenedBoxes: this.unopenedBoxes,
      coins: this.coins,
      isPatron: this.isBetaPatron
    };
  }
}

export const collectionManager = new CollectionManager();
