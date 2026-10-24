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

export interface GameCard {
  id: number;
  name: string;
  type: CardType;
  timing: TrickTiming;
  description: string;
  iconKey: string;
}

export interface CharacterDef {
  type: CharacterType;
  displayName: string;
  title: string;
  description: string;
  abilityName: string;
  abilityDescription: string;
  abilityCooldownMax: number;
  primaryColor: string;
  secondaryColor: string;
  avatar: string;
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
  isFrozen: boolean;
  skipNextTurn: boolean;
  forcedTargetPlayerId: number | null;
  abilityCooldownRemaining: number;
  isEliminated: boolean;
  activeMorphCharacter?: CharacterType | null;
  teamId?: number;
}

export function getMaxHandSize(player: PlayerState): number {
  const activeChar = player.activeMorphCharacter || player.characterType;
  if (activeChar === CharacterType.HADA_AL_CUBO) return 4;
  if (player.equippedWeapons.some(w => w.id === 13)) return 3; // Mochila de Repartidor
  return 2;
}

export function getMaxWeaponSlots(player: PlayerState): number {
  const activeChar = player.activeMorphCharacter || player.characterType;
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
