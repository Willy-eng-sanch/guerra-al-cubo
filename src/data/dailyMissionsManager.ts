import { collectionManager } from './collectionManager';

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  iconName: string;
  currentProgress: number;
  targetProgress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  rewardType: 'COINS' | 'AURA' | 'BOX';
  rewardAmount: number;
}

export interface DayStreakReward {
  day: number;
  label: string;
  coins: number;
  aura: number;
  boxes: number;
  isSpecial?: boolean;
}

const STREAK_REWARDS: DayStreakReward[] = [
  { day: 1, label: 'Día 1: Bienvenida al Asfalto', coins: 35, aura: 15, boxes: 0 },
  { day: 2, label: 'Día 2: Primer Trío de Dados', coins: 50, aura: 20, boxes: 0 },
  { day: 3, label: 'Día 3: Mano Firme', coins: 75, aura: 35, boxes: 0 },
  { day: 4, label: 'Día 4: Respeto Callejero', coins: 90, aura: 45, boxes: 0 },
  { day: 5, label: 'Día 5: Tahúr Consagrado', coins: 120, aura: 60, boxes: 0 },
  { day: 6, label: 'Día 6: Guardia de Acero', coins: 150, aura: 80, boxes: 0 },
  { day: 7, label: 'Día 7: ¡GRAN CAJA DE 3 DADOS ORO!', coins: 250, aura: 150, boxes: 1, isSpecial: true }
];

const MISSION_POOL: Omit<DailyMission, 'currentProgress' | 'isCompleted' | 'isClaimed'>[] = [
  {
    id: 'win_matches',
    title: 'Dominio de la Esquina',
    description: 'Gana 1 combate en cualquier modo de juego',
    iconName: 'Trophy',
    targetProgress: 1,
    rewardType: 'AURA',
    rewardAmount: 40
  },
  {
    id: 'deal_damage',
    title: 'Puñetazos de Resina',
    description: 'Inflige al menos 20 puntos de daño total a dados rivales',
    iconName: 'Swords',
    targetProgress: 20,
    rewardType: 'COINS',
    rewardAmount: 60
  },
  {
    id: 'perfect_blocks',
    title: 'Muro Callejero',
    description: 'Realiza 2 bloqueos perfectos con dados iguales o superiores',
    iconName: 'Shield',
    targetProgress: 2,
    rewardType: 'COINS',
    rewardAmount: 50
  },
  {
    id: 'play_cards',
    title: 'Mano Oculta',
    description: 'Juega 3 cartas tácticas durante tus combates',
    iconName: 'Layers',
    targetProgress: 3,
    rewardType: 'AURA',
    rewardAmount: 30
  },
  {
    id: 'play_demo',
    title: 'Fogueo en la Demo',
    description: 'Disputa 2 combates (Demo Rápida, Campaña o Versus)',
    iconName: 'Zap',
    targetProgress: 2,
    rewardType: 'COINS',
    rewardAmount: 70
  }
];

class DailyMissionsManager {
  private missions: DailyMission[] = [];
  private currentStreak = 1;
  private lastClaimDate = '';
  private lastLoginDate = '';
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private getTodayString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  private loadFromStorage() {
    try {
      const today = this.getTodayString();
      const savedDate = localStorage.getItem('gc_missions_date');
      const savedMissions = localStorage.getItem('gc_daily_missions');
      const savedStreak = localStorage.getItem('gc_daily_streak');
      const savedLastClaim = localStorage.getItem('gc_last_streak_claim');
      const savedLastLogin = localStorage.getItem('gc_last_login_date');

      this.lastClaimDate = savedLastClaim || '';
      this.lastLoginDate = savedLastLogin || '';

      // Check Streak Continuity
      if (savedStreak) {
        this.currentStreak = parseInt(savedStreak, 10) || 1;
      }

      if (this.lastLoginDate && this.lastLoginDate !== today) {
        const last = new Date(this.lastLoginDate);
        const curr = new Date(today);
        const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));

        if (diffDays === 1) {
          // Continuous login streak
          if (this.lastClaimDate === this.lastLoginDate) {
            // Already claimed yesterday, streak progresses
          }
        } else if (diffDays > 1) {
          // Streak broken, reset to day 1
          this.currentStreak = 1;
        }
      }

      this.lastLoginDate = today;
      localStorage.setItem('gc_last_login_date', today);
      localStorage.setItem('gc_daily_streak', String(this.currentStreak));

      // Generate or load daily missions
      if (savedDate === today && savedMissions) {
        this.missions = JSON.parse(savedMissions);
      } else {
        this.generateDailyMissions(today);
      }
    } catch (e) {
      this.generateDailyMissions(this.getTodayString());
    }
  }

  private generateDailyMissions(todayStr: string) {
    // Deterministic selection based on date string hash
    let hash = 0;
    for (let i = 0; i < todayStr.length; i++) {
      hash = (hash << 5) - hash + todayStr.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);

    // Pick 3 unique missions
    const shuffled = [...MISSION_POOL].sort((a, b) => {
      const charA = a.id.charCodeAt(0) + (seed % 7);
      const charB = b.id.charCodeAt(0) + (seed % 7);
      return charA - charB;
    });

    this.missions = shuffled.slice(0, 3).map(m => ({
      ...m,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false
    }));

    this.saveToStorage();
  }

  private saveToStorage() {
    try {
      const today = this.getTodayString();
      localStorage.setItem('gc_missions_date', today);
      localStorage.setItem('gc_daily_missions', JSON.stringify(this.missions));
      localStorage.setItem('gc_daily_streak', String(this.currentStreak));
      localStorage.setItem('gc_last_streak_claim', this.lastClaimDate);
    } catch (e) {
      // storage quota or incognito
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

  // --- QUERY METHODS ---
  getMissions(): DailyMission[] {
    return [...this.missions];
  }

  getUnclaimedMissionsCount(): number {
    return this.missions.filter(m => m.isCompleted && !m.isClaimed).length;
  }

  getCurrentStreak(): number {
    return this.currentStreak;
  }

  canClaimStreakToday(): boolean {
    return this.lastClaimDate !== this.getTodayString();
  }

  getStreakRewards(): DayStreakReward[] {
    return STREAK_REWARDS;
  }

  // --- PROGRESS TRACKING ---
  recordDamage(amount: number) {
    if (amount <= 0) return;
    let changed = false;
    this.missions.forEach(m => {
      if (m.id === 'deal_damage' && !m.isCompleted) {
        m.currentProgress = Math.min(m.targetProgress, m.currentProgress + amount);
        if (m.currentProgress >= m.targetProgress) {
          m.isCompleted = true;
        }
        changed = true;
      }
    });
    if (changed) this.saveToStorage();
  }

  recordPerfectBlock() {
    let changed = false;
    this.missions.forEach(m => {
      if (m.id === 'perfect_blocks' && !m.isCompleted) {
        m.currentProgress = Math.min(m.targetProgress, m.currentProgress + 1);
        if (m.currentProgress >= m.targetProgress) {
          m.isCompleted = true;
        }
        changed = true;
      }
    });
    if (changed) this.saveToStorage();
  }

  recordCardPlayed() {
    let changed = false;
    this.missions.forEach(m => {
      if (m.id === 'play_cards' && !m.isCompleted) {
        m.currentProgress = Math.min(m.targetProgress, m.currentProgress + 1);
        if (m.currentProgress >= m.targetProgress) {
          m.isCompleted = true;
        }
        changed = true;
      }
    });
    if (changed) this.saveToStorage();
  }

  recordMatch(isVictory: boolean) {
    let changed = false;
    this.missions.forEach(m => {
      if (m.id === 'play_demo' && !m.isCompleted) {
        m.currentProgress = Math.min(m.targetProgress, m.currentProgress + 1);
        if (m.currentProgress >= m.targetProgress) m.isCompleted = true;
        changed = true;
      }
      if (m.id === 'win_matches' && isVictory && !m.isCompleted) {
        m.currentProgress = Math.min(m.targetProgress, m.currentProgress + 1);
        if (m.currentProgress >= m.targetProgress) m.isCompleted = true;
        changed = true;
      }
    });
    if (changed) this.saveToStorage();
  }

  // --- CLAIM ACTIONS ---
  claimMission(missionId: string): boolean {
    const mission = this.missions.find(m => m.id === missionId);
    if (!mission || !mission.isCompleted || mission.isClaimed) return false;

    mission.isClaimed = true;

    if (mission.rewardType === 'COINS') {
      collectionManager.addCoins(mission.rewardAmount);
    } else if (mission.rewardType === 'AURA') {
      collectionManager.addAura(mission.rewardAmount);
    } else if (mission.rewardType === 'BOX') {
      collectionManager.recordMatchResult(true); // grants 1 box
    }

    this.saveToStorage();
    return true;
  }

  claimDailyStreak(): DayStreakReward | null {
    if (!this.canClaimStreakToday()) return null;

    const dayIndex = ((this.currentStreak - 1) % 7);
    const reward = STREAK_REWARDS[dayIndex];

    if (reward.coins > 0) collectionManager.addCoins(reward.coins);
    if (reward.aura > 0) collectionManager.addAura(reward.aura);
    if (reward.boxes > 0) {
      // Add boxes via patron/match result
      collectionManager.recordMatchResult(true);
    }

    this.lastClaimDate = this.getTodayString();
    // Advance streak for tomorrow up to 7, then loops
    this.currentStreak = (this.currentStreak % 7) + 1;
    this.saveToStorage();
    return reward;
  }
}

export const dailyMissionsManager = new DailyMissionsManager();
