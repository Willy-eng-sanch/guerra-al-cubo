import { CharacterType, CharacterDef } from '../types/game';
import { CHARACTER_LIST, CHARACTERS } from './characters';

const STORAGE_UNLOCKED_KEY = 'guerra_cubita_unlocked_heroes';
const STORAGE_COINS_KEY = 'guerra_cubita_street_coins';
const STORAGE_STARTER_OPENED_KEY = 'guerra_cubita_starter_box_opened';

export interface BoxOpeningResult {
  characters: CharacterDef[];
  isNew: boolean[];
  bonusCoinsEarned: number;
}

class CollectionManager {
  private unlockedTypes: Set<CharacterType>;
  private coins: number;
  private hasOpenedStarterBox: boolean;
  private listeners: Array<() => void> = [];

  constructor() {
    this.unlockedTypes = new Set<CharacterType>();
    this.coins = 300;
    this.hasOpenedStarterBox = false;
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
        // Initially empty so they experience the crate opening to get their first 3!
        this.unlockedTypes = new Set<CharacterType>();
      }

      const savedCoins = localStorage.getItem(STORAGE_COINS_KEY);
      if (savedCoins !== null) {
        this.coins = parseInt(savedCoins, 10) || 0;
      } else {
        this.coins = 300; // Starting funds for 3 crates
      }

      const savedStarter = localStorage.getItem(STORAGE_STARTER_OPENED_KEY);
      this.hasOpenedStarterBox = savedStarter === 'true';
    } catch (e) {
      console.warn('Could not load collection from storage', e);
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        STORAGE_UNLOCKED_KEY,
        JSON.stringify(Array.from(this.unlockedTypes))
      );
      localStorage.setItem(STORAGE_COINS_KEY, String(this.coins));
      localStorage.setItem(STORAGE_STARTER_OPENED_KEY, String(this.hasOpenedStarterBox));
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
    // If player has fewer than 3 characters, first box is always free!
    if (this.unlockedTypes.size < 3) return true;
    return this.coins >= 100;
  }

  getBoxCost(): number {
    if (this.unlockedTypes.size < 3 && !this.hasOpenedStarterBox) return 0;
    return 100;
  }

  // Open a Mystery Crate of 3 Characters (Caja de a 3)
  openBoxOfThree(): BoxOpeningResult {
    const cost = this.getBoxCost();
    if (cost > 0) {
      this.coins = Math.max(0, this.coins - cost);
    }
    this.hasOpenedStarterBox = true;

    // Pick 3 distinct characters from the pool of 13
    // Smart loot: prioritize characters not yet unlocked!
    const allTypes = CHARACTER_LIST.map(c => c.type);
    const lockedPool = allTypes.filter(t => !this.unlockedTypes.has(t));
    const alreadyUnlockedPool = allTypes.filter(t => this.unlockedTypes.has(t));

    const selectedTypes: CharacterType[] = [];
    const isNew: boolean[] = [];
    let bonusCoins = 0;

    // Shuffle pools
    const shuffledLocked = [...lockedPool].sort(() => Math.random() - 0.5);
    const shuffledUnlocked = [...alreadyUnlockedPool].sort(() => Math.random() - 0.5);

    // Pick 3 characters
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
        bonusCoins += 30; // +30 monedas por duplicado
      } else {
        // Fallback if all 13 unlocked
        const rand = allTypes[Math.floor(Math.random() * allTypes.length)];
        selectedTypes.push(rand);
        isNew.push(false);
        bonusCoins += 30;
      }
    }

    if (bonusCoins > 0) {
      this.coins += bonusCoins;
    }

    this.saveToStorage();

    return {
      characters: selectedTypes.map(t => CHARACTERS[t]),
      isNew,
      bonusCoinsEarned: bonusCoins
    };
  }

  resetCollectionForTesting() {
    this.unlockedTypes.clear();
    this.coins = 300;
    this.hasOpenedStarterBox = false;
    this.saveToStorage();
  }
}

export const collectionManager = new CollectionManager();
