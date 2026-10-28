// ============================================================
// Persistencia local de Guerra Cubita (localStorage)
// Progreso de campaña, estadísticas y récords del jugador.
// ============================================================

export interface GameStats {
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  totalDamageDealt: number;
  totalPerfectBlocks: number;
  bestStreak: number;      // Mejor racha de victorias consecutivas (global)
  currentStreak: number;   // Racha actual de victorias consecutivas
  fastestWinRound: number | null; // Ronda más baja en la que has ganado
  campaignWins: number;    // Capítulos de campaña ganados
  winsByDifficulty: Record<number, number>; // Victorias por nivel de dificultad (1..3)
}

export interface CampaignProgress {
  unlockedChapterId: number; // 1..N
  completedChapterIds: number[];
}

const STATS_KEY = 'guerra_cubita_stats_v1';
const CAMPAIGN_KEY = 'guerra_cubita_campaign_v1';

export const DEFAULT_STATS: GameStats = {
  totalMatches: 0,
  totalWins: 0,
  totalLosses: 0,
  totalDamageDealt: 0,
  totalPerfectBlocks: 0,
  bestStreak: 0,
  currentStreak: 0,
  fastestWinRound: null,
  campaignWins: 0,
  winsByDifficulty: { 1: 0, 2: 0, 3: 0 }
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return { ...fallback, ...parsed } as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento no disponible */
  }
}

export function loadStats(): GameStats {
  return safeGet<GameStats>(STATS_KEY, DEFAULT_STATS);
}

export function saveStats(stats: GameStats) {
  safeSet(STATS_KEY, stats);
}

export function recordMatchResult(result: {
  won: boolean;
  damageDealt: number;
  perfectBlocks: number;
  roundsPlayed: number;
  isCampaign: boolean;
  difficultyLevel?: number; // 1..3 (para victorias contadas por dificultad)
}): GameStats {
  const s = loadStats();
  // Reparar progreso antiguo que no traía winsByDifficulty
  if (!s.winsByDifficulty) s.winsByDifficulty = { 1: 0, 2: 0, 3: 0 };
  s.totalMatches += 1;
  s.totalDamageDealt += Math.max(0, result.damageDealt);
  s.totalPerfectBlocks += Math.max(0, result.perfectBlocks);

  if (result.won) {
    s.totalWins += 1;
    s.currentStreak += 1;
    s.bestStreak = Math.max(s.bestStreak, s.currentStreak);
    if (result.isCampaign) s.campaignWins += 1;
    const lvl = result.difficultyLevel ?? 1;
    s.winsByDifficulty[lvl] = (s.winsByDifficulty[lvl] || 0) + 1;
    if (s.fastestWinRound === null || result.roundsPlayed < s.fastestWinRound) {
      s.fastestWinRound = result.roundsPlayed;
    }
  } else {
    s.totalLosses += 1;
    s.currentStreak = 0;
  }

  saveStats(s);
  return s;
}

export const DEFAULT_CAMPAIGN_PROGRESS: CampaignProgress = {
  unlockedChapterId: 1,
  completedChapterIds: []
};

export function loadCampaignProgress(): CampaignProgress {
  return safeGet<CampaignProgress>(CAMPAIGN_KEY, DEFAULT_CAMPAIGN_PROGRESS);
}

export function saveCampaignProgress(progress: CampaignProgress) {
  safeSet(CAMPAIGN_KEY, progress);
}

export function resetAllProgress() {
  try {
    localStorage.removeItem(STATS_KEY);
    localStorage.removeItem(CAMPAIGN_KEY);
  } catch {
    /* noop */
  }
}
