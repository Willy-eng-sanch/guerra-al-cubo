export enum CharacterType {
  FLAUCUBISTA_DESAFINADO = "FLAUCUBISTA_DESAFINADO",
  CUBITO_DE_HIELO = "CUBITO_DE_HIELO",
  HADA_AL_CUBO = "HADA_AL_CUBO",
  CUBOGRO = "CUBOGRO",
  GLADIACUBON = "GLADIACUBON",
  DRACUBON = "DRACUBON",
  RACUBITERO = "RACUBITERO",
  PIRATA = "PIRATA",
  CUBINARCA = "CUBINARCA",
  CUBINJA = "CUBINJA",
  CUBICULA = "CUBICULA",
  TRAMCUBOSO = "TRAMCUBOSO",
  CAMBIAFORMAS = "CAMBIAFORMAS"
}

export enum CardType {
  WEAPON = "WEAPON",
  TRICK = "TRICK"
}

export enum TrickTiming {
  RITUAL_ACTION = "RITUAL_ACTION",
  PREPARED_STANCE = "PREPARED_STANCE"
}

// ============================================================
// LAS 5 CLASES DEL BARRIO (GDD Oficial "Guerra Cubita")
// Rojo Bruta · Azul Protección · Verde Economía · Púrpura Táctica · Amarillo Astucia
// ============================================================
export enum CardCategory {
  BRUTA = "BRUTA",             // 🔴 Rojo: Impacto y fuerza física
  PROTECCION = "PROTECCION",   // 🔵 Azul: Muros y supervivencia
  ECONOMIA = "ECONOMIA",       // 🟢 Verde: Abasto y robos
  TACTICA = "TACTICA",         // 🟣 Púrpura: Control y anulación
  ASTUCIA = "ASTUCIA"          // 🟡 Amarillo: Robo y evasión
}

// ADN del Barrio: afinidad de un personaje hacia una clase de carta
export type DnaAffinity = 'PRIMARIA' | 'SECUNDARIA' | 'NEUTRA' | 'ANTI';

export interface CharacterDna {
  primaria: CardCategory;   // Define su Habilidad Activa. Sinergia con sus cartas.
  secundaria: CardCategory; // Define su Habilidad Pasiva. Sinergia con sus cartas.
  neutra: CardCategory;     // Funciona normal. Ni sinergia ni antisinergia.
  antiClases: [CardCategory, CardCategory]; // Debilidad: Antisinergia (Rechazo).
}

export enum CardRarity {
  BASICA = "BASICA",
  RARA = "RARA",
  SUPER_RARA = "SUPER_RARA",
  LEGENDARIA = "LEGENDARIA"
}

export interface CategoryInfo {
  name: string;
  badge: string;
  symbol: string;
  color: string;
  borderColor: string;
  bgGlow: string;
  description: string;
  synergyBonus: string;
  antiPenalty: string; // Antisinergia (Rechazo) según el ADN del Barrio
}

export const CATEGORY_INFO: Record<CardCategory, CategoryInfo> = {
  [CardCategory.BRUTA]: {
    name: "Bruta",
    badge: "🔴 BRUTA",
    symbol: "🔴",
    color: "#EF4444",
    borderColor: "#DC2626",
    bgGlow: "rgba(239, 68, 68, 0.25)",
    description: "Impacto y fuerza física pura. Golpes demoledores del barrio.",
    synergyBonus: "+1 de Daño extra al impacto.",
    antiPenalty: "Sufres 1 HP de autodaño al usarla/equiparla."
  },
  [CardCategory.PROTECCION]: {
    name: "Protección",
    badge: "🔵 PROTECCIÓN",
    symbol: "🔵",
    color: "#3B82F6",
    borderColor: "#2563EB",
    bgGlow: "rgba(59, 130, 246, 0.25)",
    description: "Muros y supervivencia. Escudos, armaduras y evasiones.",
    synergyBonus: "Te curas 1 HP al usar/equipar.",
    antiPenalty: "Tu próximo ataque sufre -1 al dado por lentitud."
  },
  [CardCategory.ECONOMIA]: {
    name: "Economía",
    badge: "🟢 ECONOMÍA",
    symbol: "🟢",
    color: "#22C55E",
    borderColor: "#16A34A",
    bgGlow: "rgba(34, 197, 94, 0.25)",
    description: "Abasto y robos. Domina el Mazo Global y el flujo de cartas.",
    synergyBonus: "Robas 1 carta adicional de la pila.",
    antiPenalty: "Debes descartar 1 carta de tu mano."
  },
  [CardCategory.TACTICA]: {
    name: "Táctica",
    badge: "🟣 TÁCTICA",
    symbol: "🟣",
    color: "#A855F7",
    borderColor: "#9333EA",
    bgGlow: "rgba(168, 85, 247, 0.25)",
    description: "Control y anulación. Silencios, órdenes y trampa táctica.",
    synergyBonus: "El rival objetivo pierde su Acción Libre.",
    antiPenalty: "Quedas Silenciado (sin habilidades) por 1 turno."
  },
  [CardCategory.ASTUCIA]: {
    name: "Astucia",
    badge: "🟡 ASTUCIA",
    symbol: "🟡",
    color: "#EAB308",
    borderColor: "#CA8A04",
    bgGlow: "rgba(234, 179, 8, 0.25)",
    description: "Robo y evasión. Golpes bajos, hurtos e impactos ineludibles.",
    synergyBonus: "El impacto de este turno se vuelve ineludible.",
    antiPenalty: "Revelas toda tu mano al rival."
  }
};

export interface GameCard {
  id: number;
  uid?: string;
  name: string;
  type: CardType;
  timing: TrickTiming;
  description: string;
  iconKey: string;
  category: CardCategory;
  rarity: CardRarity;
  synergyEffect: string;
}

export interface CharacterDef {
  type: CharacterType;
  displayName: string;
  title: string;
  description: string;
  abilityName: string;
  abilityDescription: string;
  abilityCooldownMax: number;
  passiveName: string;           // Habilidad Pasiva (definida por su clase Secundaria)
  passiveDescription: string;
  primaryColor: string;
  secondaryColor: string;
  avatar: string;
  dna: CharacterDna;             // ADN del Barrio (Primaria / Secundaria / Neutra / Anti-clases)
  classes: CardCategory[];       // Derivada del ADN: [primaria, secundaria] (+ todas si es Comodín)
  signatureSuperpowerName: string;
  signatureSuperpowerDesc: string;
  model3dImage?: string;
  hasCustom3DModel?: boolean;
  selectionQuote?: string;
  selectionVideo?: string;
  actionVideos?: {
    attack?: string;
    ability?: string;
    perfectBlock?: string;
    victory?: string;
  };
}

export interface PlayerState {
  id: number;
  name: string;
  characterType: CharacterType;
  hp: number;
  maxHp: number;
  actionPoints: number;
  hand: GameCard[];
  equippedWeapons: GameCard[];
  preparedStance: GameCard | null;
  isBot: boolean;
  isFrozen: boolean;          // "Mal de Ojo" / Congelamiento: pierde su próximo turno
  skipNextTurn: boolean;
  forcedTargetPlayerId: number | null;
  abilityCooldownRemaining: number;
  isEliminated: boolean;
  activeMorphCharacter?: CharacterType | null;
  teamId?: number;
  superBlockMeter?: number; // Opcional
  shieldBarrier?: number;   // Puntos de escudo defensivo acumulados (Sinergia/Posturas)
  coverForId?: number | null;      // Acción 1 "Cubrir Aliado": el cubo recibe los impactos del aliado
  silencedUntilRound?: number;     // Antisinergia Táctica: sin habilidades hasta esa ronda
  attackPenaltyNext?: number;      // Antisinergia Protección: -N al dado del próximo ataque
  unavoidableThisTurn?: boolean;   // Sinergia Astucia: el impacto de este turno es ineludible
  cannotRollBlocks?: boolean;      // Cubinarca (Discordia): el rival desobedeció y no bloquea
  lastDamageTaken?: number;        // Para la pasiva Acorde Violento del Flaucubista
  nextAttackBonus?: number;        // Flaucubista: +1 daño base tras sufrir daño
  forcedAttackAllyId?: number | null; // Cubinarca: debe atacar a su propio aliado en su turno
  tricksLockedUntilRound?: number; // El Vencedor a Ciegas: nadie usa Trucos hasta esa ronda
}

// ============================================================
// REGLA OFICIAL DEL DADO (GDD): el dado es un D6 normal.
// La única regla especial: si sale 6, el cubo ROBA 1 CARTA
// del Mazo Global y VOLVER A LANZAR el dado. El nuevo resultado
// es el que cuenta (el proceso se repite si vuelve a salir 6).
// ============================================================
export const D6_SIDES = 6;
export function rollD6(): number {
  return Math.floor(Math.random() * D6_SIDES) + 1; // 1..6
}

// Resultado de una tirada de combate con la regla del 6 aplicada.
export interface BattleDieResult {
  finalValue: number;   // valor efectivo (nunca 6: los 6 explotan en relanzadas)
  sixCount: number;     // cuántos 6 salieron (cada uno = 1 carta robada)
  rolls: number[];      // secuencia completa de tiradas para mostrar en pantalla
}

// Lanza el D6 aplicando la regla oficial: cada 6 otorga 1 carta del
// Mazo Global y obliga a relanzar hasta obtener un valor 1..5.
export function rollBattleDie(maxSixes = 4): BattleDieResult {
  const rolls: number[] = [];
  let sixCount = 0;
  let value = rollD6();
  rolls.push(value);
  while (value === 6 && sixCount < maxSixes) {
    sixCount += 1;
    value = rollD6();
    rolls.push(value);
  }
  // Si por mala suerte encadena el máximo de 6s, el último cuenta como 5.
  if (value === 6) value = 5;
  return { finalValue: value, sixCount, rolls };
}

export function getMaxHandSize(player: PlayerState): number {
  const activeChar = player.activeMorphCharacter || player.characterType;
  if (activeChar === CharacterType.HADA_AL_CUBO) return 4; // Monopolio Táctico
  if (player.equippedWeapons.some(w => w.id === 21)) return 3; // El Morral Vendedado
  return 2;
}

export function getMaxWeaponSlots(player: PlayerState): number {
  const activeChar = player.activeMorphCharacter || player.characterType;
  if (activeChar === CharacterType.CUBINJA) return 99;   // Avaricia: armas ilimitadas
  if (activeChar === CharacterType.GLADIACUBON) return 2; // Coraza: ranura extra permanente
  if (activeChar === CharacterType.HADA_AL_CUBO) return 2; // Monopolio Táctico
  if (activeChar === CharacterType.CUBOGRO) return 0;     // Piel de Piedra: sin inventario
  return 1;
}

// ============================================================
// ADN DEL BARRIO: afinidad de un personaje hacia una clase de carta
// ============================================================
export function getDnaAffinity(dna: CharacterDna, cat: CardCategory): DnaAffinity {
  if (dna.primaria === cat) return 'PRIMARIA';
  if (dna.secundaria === cat) return 'SECUNDARIA';
  if (dna.neutra === cat) return 'NEUTRA';
  return 'ANTI';
}

export interface CombatLogEntry {
  id: number;
  round: number;
  actorName: string;
  message: string;
  isCritical?: boolean;
}

export enum MatchPhase {
  IDLE = "IDLE",
  ROLLING_ATTACK = "ROLLING_ATTACK",
  DEFENDER_ROLLING = "DEFENDER_ROLLING",
  RESOLVING = "RESOLVING",
  SELECTING_TARGET_ATTACK = "SELECTING_TARGET_ATTACK",
  SELECTING_TARGET_ABILITY = "SELECTING_TARGET_ABILITY",
  SELECTING_TARGET_CARD = "SELECTING_TARGET_CARD",
  MATCH_OVER = "MATCH_OVER"
}

export interface FloatingCombatText {
  id: number;
  playerId: number;
  text: string;
  colorHex: string;
  createdAt: number;
}

export interface ActiveDiceRoll {
  attackerRolls: number[];
  attackerFinalVal: number;
  defenderRolls: number[];
  defenderFinalVal: number;
  isPerfectBlock: boolean;
  damageDealt: number;
  attackerName: string;
  defenderName: string;
}

export enum GameMode {
  QUICK_BATTLE = "QUICK_BATTLE",
  PASS_AND_PLAY = "PASS_AND_PLAY",
  STREET_CAMPAIGN = "STREET_CAMPAIGN",
  BALANCE_LAB = "BALANCE_LAB"
}

// ============================================================
// Niveles de dificultad de la IA (MEJORA: selector visible en UI)
// ============================================================
export type BotSkillLevel = 'EASY' | 'NORMAL' | 'HARD';

export interface DifficultyInfo {
  level: number; // 1..3
  skill: BotSkillLevel;
  name: string;
  tagline: string;
  color: string;
  borderColor: string;
  bgActive: string;
}

export const DIFFICULTY_LEVELS: DifficultyInfo[] = [
  {
    level: 1,
    skill: 'EASY',
    name: 'NOVATO',
    tagline: 'Bots del callejón: decisiones simples, sin combos (curva de dificultad suave).',
    color: '#4ade80',
    borderColor: '#16a34a',
    bgActive: 'bg-emerald-950/70'
  },
  {
    level: 2,
    skill: 'NORMAL',
    name: 'RIVAL',
    tagline: 'Barrio equilibrado: equipan Fierros, usan Vueltas y atacan con criterio.',
    color: '#facc15',
    borderColor: '#ca8a04',
    bgActive: 'bg-yellow-950/70'
  },
  {
    level: 3,
    skill: 'HARD',
    name: 'JEFE DE CUADRA',
    tagline: 'Élite táctica: rematan, explotan sinergias de clase y te roban la iniciativa.',
    color: '#f87171',
    borderColor: '#dc2626',
    bgActive: 'bg-red-950/70'
  }
];

export function difficultyFromLevel(level: number): DifficultyInfo {
  return DIFFICULTY_LEVELS[Math.min(2, Math.max(0, level - 1))];
}

export interface MatchResultSummary {
  won: boolean;
  winnerName: string;
  isHumanWinner: boolean;
  roundsPlayed: number;
  damageDealt: number;
  perfectBlocks: number;
  isCampaign: boolean;
  chapterTitle?: string;
}

export interface CampaignChapter {
  id: number;
  title: string;
  subtitle: string;
  bossCharacter: CharacterType;
  minionCharacters: CharacterType[];
  rewardDescription: string;
  isUnlocked: boolean;
  isCompleted: boolean;
}

export enum CurrentScreen {
  TITLE = "TITLE",
  SETUP = "SETUP",
  DRAFT = "DRAFT",
  ARENA = "ARENA",
  ROSTER = "ROSTER",
  ENCYCLOPEDIA = "ENCYCLOPEDIA",
  CAMPAIGN = "CAMPAIGN",
  PASS_AND_PLAY_SETUP = "PASS_AND_PLAY_SETUP"
}

export interface DraftState {
  stage: 'ROLL_INITIATIVE' | 'DRAFTING' | 'READY';
  playerRoll: number;
  rivalRoll: number;
  isRolling: boolean;
  rollWinner: 'PLAYER' | 'RIVAL' | null;
  turn: 'PLAYER' | 'RIVAL' | 'ANIMATING';
  playerTeam: CharacterType[];
  rivalTeam: CharacterType[];
  pickHistory: { picker: 'PLAYER' | 'RIVAL'; character: CharacterType }[];
}
