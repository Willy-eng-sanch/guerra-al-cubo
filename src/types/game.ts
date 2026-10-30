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

// Las 5 Clases Oficiales del Manual Táctico (Guerra Cubita)
export enum CardCategory {
  BRUTA = "BRUTA",             // 💥 Rojo: Impacto y fuerza física
  PROTECCION = "PROTECCION",   // 🛡️ Azul: Muros y supervivencia
  ECONOMIA = "ECONOMIA",       // 💰 Verde: Abasto y robos
  TACTICA = "TACTICA",         // 🧠 Púrpura: Control y anulación
  ASTUCIA = "ASTUCIA",         // ⚡ Amarillo: Robo y evasión
  // Compatibilidad con referencias previas:
  SOLAR = "ECONOMIA",
  GUARDIAN = "PROTECCION",
  KABOOM = "BRUTA",
  CEREBRAL = "TACTICA",
  FURTIVO = "ASTUCIA"
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
  rejectionPenalty: string;
}

export const CATEGORY_INFO: Record<string, CategoryInfo> = {
  [CardCategory.BRUTA]: {
    name: "Bruta (Rojo)",
    badge: "💥 BRUTA",
    symbol: "💥",
    color: "#EF4444",
    borderColor: "#DC2626",
    bgGlow: "rgba(239, 68, 68, 0.25)",
    description: "Impacto y fuerza física demoledora.",
    synergyBonus: "+1 de Daño extra al impacto.",
    rejectionPenalty: "Sufres 1 HP de autodaño al usarla/equiparla."
  },
  [CardCategory.PROTECCION]: {
    name: "Protección (Azul)",
    badge: "🛡️ PROTECCIÓN",
    symbol: "🛡️",
    color: "#3B82F6",
    borderColor: "#2563EB",
    bgGlow: "rgba(59, 130, 246, 0.25)",
    description: "Muros, armaduras pesadas y supervivencia.",
    synergyBonus: "Te curas 1 HP al usar/equipar.",
    rejectionPenalty: "Tu próximo ataque sufre -1 al dado por lentitud."
  },
  [CardCategory.ECONOMIA]: {
    name: "Economía (Verde)",
    badge: "💰 ECONOMÍA",
    symbol: "💰",
    color: "#10B981",
    borderColor: "#059669",
    bgGlow: "rgba(16, 185, 129, 0.25)",
    description: "Abasto, administración y robos de cartas.",
    synergyBonus: "Robas 1 carta adicional de la pila general.",
    rejectionPenalty: "Debes descartar 1 carta de tu mano."
  },
  [CardCategory.TACTICA]: {
    name: "Táctica (Púrpura)",
    badge: "🧠 TÁCTICA",
    symbol: "🧠",
    color: "#8B5CF6",
    borderColor: "#7C3AED",
    bgGlow: "rgba(139, 92, 246, 0.25)",
    description: "Control, anulaciones y trampas calculadas.",
    synergyBonus: "El rival objetivo pierde su Acción Libre.",
    rejectionPenalty: "Silenciado (no usas habilidades por 1 turno)."
  },
  [CardCategory.ASTUCIA]: {
    name: "Astucia (Amarillo)",
    badge: "⚡ ASTUCIA",
    symbol: "⚡",
    color: "#F59E0B",
    borderColor: "#D97706",
    bgGlow: "rgba(245, 158, 11, 0.25)",
    description: "Robo de recursos, juego sucio y evasión letal.",
    synergyBonus: "El impacto de este turno se vuelve Ineludible (ignora armadura).",
    rejectionPenalty: "Revelas toda tu mano al rival."
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
  isFierro?: boolean; // Para identificar cartas Fierro (Equipamiento de mesa)
}

export interface CharacterADN {
  primaria: CardCategory;
  secundaria: CardCategory;
  neutra: CardCategory;
  antiClases: CardCategory[];
}

export interface CharacterDef {
  type: CharacterType;
  displayName: string;
  title: string;
  description: string;
  abilityName: string;
  abilityDescription: string;
  passiveName: string;
  passiveDescription: string;
  abilityCooldownMax: number;
  primaryColor: string;
  secondaryColor: string;
  avatar: string;
  classes: CardCategory[]; // Primaria y Secundaria
  adn: CharacterADN;
  signatureSuperpowerName?: string;
  signatureSuperpowerDesc?: string;
  model3dImage?: string;
  hasCustom3DModel?: boolean;
  selectionQuote?: string;
}

export type CubinarcaOrderKind = 'ATTACK_TARGET' | 'TRANSFER_CARD' | 'UNEQUIP_WEAPON';

export interface CubinarcaOrder {
  issuerId: number;
  kind: CubinarcaOrderKind;
  attackTargetId?: number;
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
  isFrozen: boolean;
  skipNextTurn: boolean;
  forcedTargetPlayerId: number | null;
  abilityCooldownRemaining: number;
  isEliminated: boolean;
  activeMorphCharacter?: CharacterType | null;
  guardingAllyId?: number | null; // Aliado cuya próxima agresión será interceptada por Gladiacubon.
  interceptionAvailableRound?: number; // Primera ronda en la que puede volver a activar Intercepción.
  teamId?: number;
  superBlockMeter?: number; // Opcional
  shieldBarrier?: number; // Puntos de escudo defensivo acumulados por Sinergia Guardián
  damageDealt?: number; // Total daño infligido en la partida
  perfectBlocks?: number; // Bloqueos perfectos realizados
  cardsDrawn?: number; // Cartas totales robadas del mazo
  nextAttackBonus?: number; // Bonificación acumulada de Acorde Violento
  nextBreathBonus?: boolean; // Llamarada Doble: +1 de daño ineludible a ambos en el siguiente Aliento
  cubinarcaOrder?: CubinarcaOrder | null; // Orden pendiente dictada por Cubinarca
  blocksDisabledByOrder?: boolean; // Penalización de Discordia mientras desobedezca
  cubinarcaOrderDefiedThisTurn?: boolean; // Oculta el aviso hasta el siguiente turno tras desobedecer
}

export function getMaxHandSize(player: PlayerState): number {
  const activeChar = player.activeMorphCharacter || player.characterType;
  if (activeChar === CharacterType.CUBOGRO) return 0; // Piel de Piedra: sin mano ni cartas.
  if (activeChar === CharacterType.HADA_AL_CUBO) return 4;
  if (player.equippedWeapons.some(w => w.id === 13)) return 3; // Mochila de Repartidor
  return 2;
}

export function getMaxWeaponSlots(player: PlayerState): number {
  const activeChar = player.activeMorphCharacter || player.characterType;
  if (activeChar === CharacterType.CUBOGRO) return 0; // Piel de Piedra: no puede equipar armas.
  if (activeChar === CharacterType.CUBINJA) return 99;
  if (activeChar === CharacterType.HADA_AL_CUBO || activeChar === CharacterType.GLADIACUBON) return 2;
  return 1;
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
  isCubinjaCardBlock?: boolean; // Coincidencia defensiva de Cubinja: roba carta, no mitiga daño.
  damageDealt: number;
  attackerName: string;
  defenderName: string;
}

export enum GameMode {
  QUICK_BATTLE = "QUICK_BATTLE",
  PASS_AND_PLAY = "PASS_AND_PLAY",
  STREET_CAMPAIGN = "STREET_CAMPAIGN",
  BALANCE_LAB = "BALANCE_LAB",
  ONLINE_PVP = "ONLINE_PVP"
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
  PASS_AND_PLAY_SETUP = "PASS_AND_PLAY_SETUP",
  ONLINE_LOBBY = "ONLINE_LOBBY"
}

export interface DraftState {
  stage: 'ROLL_INITIATIVE' | 'DRAFTING' | 'SHUFFLING_DEAL' | 'READY' | 'DEALT_READY';
  playerRoll: number;
  rivalRoll: number;
  isRolling: boolean;
  rollWinner: 'PLAYER' | 'RIVAL' | null;
  turn: 'PLAYER' | 'RIVAL' | 'ANIMATING';
  playerTeam: CharacterType[];
  rivalTeam: CharacterType[];
  pickHistory: { picker: 'PLAYER' | 'RIVAL'; character: CharacterType }[];
  finalPlayerTeam?: CharacterType[];
  finalRivalTeam?: CharacterType[];
}
