import React, { useState, useEffect, useRef } from 'react';
import {
  ActiveDiceRoll,
  CampaignChapter,
  CardCategory,
  CardType,
  CATEGORY_INFO,
  CharacterType,
  CombatLogEntry,
  CurrentScreen,
  FloatingCombatText,
  GameCard,
  GameMode,
  MatchPhase,
  PlayerState,
  CubinarcaOrder,
  CubinarcaOrderKind,
  TrickTiming,
  CubiculaMode,
  getMaxHandSize,
  getMaxPreparedStanceSlots,
  getMaxWeaponSlots
} from './types/game';
import { ALL_CARDS, createShuffledDeck, generateUniqueCardUid, getCardUidCounter, resetCardUidCounter } from './data/cards';
import { CHARACTER_LIST, CHARACTERS } from './data/characters';
import { DEFAULT_CHAPTERS } from './data/campaign';
import { sound } from './audio/soundManager';
import { music } from './audio/musicManager';
import { narrator } from './audio/narratorManager';
import { collectionManager } from './data/collectionManager';
import { dailyMissionsManager } from './data/dailyMissionsManager';
import { advanceTurnState, getMatchOutcome, resolveCubiculaTransfer, shouldAwardDefenderSixReward, takeFirstWeaponFromDeck } from './gameplay/rules.js';
import { createMatchSeed, gameplayRandomInt, gameplayRandomPick, gameplayShuffle, getGameplayRandomSession, startGameplayRandomRecording, startGameplayRandomReplay, stopGameplayRandomSession } from './gameplay/random.js';
import { appendReplayCheckpoint, appendReplayEvent, createMatchReplay, downloadMatchReplay, getReplayRandomResults, hashReplayState, parseMatchReplay, setReplayFinalResult, setReplayInitialState } from './gameplay/replay.js';
import { findFirstReplayDifference, ReplayExecutionController } from './gameplay/replay-engine.js';
import { downloadReplayLog, saveCompletedReplay } from './gameplay/replay-storage.js';

import { TitleScreen } from './screens/TitleScreen';
import { SetupScreen } from './screens/SetupScreen';
import { PassAndPlaySetupScreen } from './screens/PassAndPlaySetupScreen';
import { CampaignScreen } from './screens/CampaignScreen';
import { RosterScreen } from './screens/RosterScreen';
import { EncyclopediaScreen } from './screens/EncyclopediaScreen';
import { ArenaScreen } from './screens/ArenaScreen';
import { DraftScreen } from './screens/DraftScreen';
import { OnlineLobbyScreen } from './screens/OnlineLobbyScreen';
import { ReplayArchiveScreen } from './screens/ReplayArchiveScreen';
import { DiceSpecialChoiceModal } from './components/DiceSpecialChoiceModal';
import { TramcubosoCardChoiceModal } from './components/TramcubosoCardChoiceModal';
import { TramcubosoRerollModal } from './components/TramcubosoRerollModal';
import { RacubiteroLootModal } from './components/RacubiteroLootModal';
import { CubinjaTransferModal } from './components/CubinjaTransferModal';
import { MorphFormSelectionModal } from './components/MorphFormSelectionModal';
import { MorphInventoryChoiceModal } from './components/MorphInventoryChoiceModal';
import { CombatClashData } from './components/CartoonCombatClash';

interface TramcubosoCardChoice {
  playerId: number;
  playerName: string;
  initialCard: GameCard;
  alternativeCard: GameCard;
  source: string;
}

interface PendingDiceReroll {
  tramcubosoId: number;
  attackerId: number;
  defenderId: number;
  targetId: number;
  secondaryTargetId?: number;
  isCubiculaAbility: boolean;
  isCubogroAbility: boolean;
  attackerRolls: number[];
  defenderRolls: number[];
}

interface CombatDiceOverride {
  attackerRolls: number[];
  defenderRolls: number[];
  skipTramcubosoPrompt?: boolean;
  spentCubitPlayerId?: number;
}

const getCharacterMaxHp = (characterType: CharacterType): number =>
  characterType === CharacterType.CUBOGRO ? 25 : 20;

const isCubinjaHero = (player: PlayerState): boolean =>
  (player.activeMorphCharacter || player.characterType) === CharacterType.CUBINJA;

// Devuelve al Gladiacubon vivo que cubre a un aliado, sin permitir que el atacante
// se redirija daño a sí mismo mediante una cobertura propia.
const findGladiacubonCovering = (
  players: PlayerState[],
  protectedPlayerId: number,
  excludedPlayerId?: number
): PlayerState | null =>
  players.find(player =>
    player.id !== excludedPlayerId &&
    player.guardingAllyId === protectedPlayerId &&
    !player.isEliminated &&
    player.hp > 0 &&
    (player.activeMorphCharacter || player.characterType) === CharacterType.GLADIACUBON
  ) || null;

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<CurrentScreen>(CurrentScreen.TITLE);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.QUICK_BATTLE);
  const [activeClash, setActiveClash] = useState<CombatClashData | null>(null);

  // Match State
  const [round, setRound] = useState<number>(1);
  const [turnIndex, setTurnIndex] = useState<number>(0);
  // StrictMode replays effects in development; prevent duplicate random morphs/logs.
  const processedMorphRoundRef = useRef<string | null>(null);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [deck, setDeckState] = useState<GameCard[]>([]);
  const [discardPile, setDiscardPile] = useState<GameCard[]>([]);
  const [log, setLog] = useState<CombatLogEntry[]>([]);
  const [phase, setPhase] = useState<MatchPhase>(MatchPhase.IDLE);
  const [activeDiceRoll, setActiveDiceRoll] = useState<ActiveDiceRoll | null>(null);
  const [isRollingAnimation, setIsRollingAnimation] = useState<boolean>(false);
  const [winner, setWinner] = useState<PlayerState | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null);
  const [isFastSpeed, setIsFastSpeed] = useState<boolean>(false);
  const [floatingTexts, setFloatingTexts] = useState<FloatingCombatText[]>([]);
  const [campaignChapters, setCampaignChapters] = useState<CampaignChapter[]>(DEFAULT_CHAPTERS);
  const [reactionPlayer, setReactionPlayer] = useState<PlayerState | null>(null);
  const [isDeckDrawing, setIsDeckDrawing] = useState<boolean>(false);
  const [isMatchIntroPlaying, setIsMatchIntroPlaying] = useState<boolean>(false);
  const [specialSixChoice, setSpecialSixChoice] = useState<{
    playerId: number;
    actorName: string;
    isAttacker: boolean;
  } | null>(null);
  const [specialSixQueue, setSpecialSixQueue] = useState<Array<{
    playerId: number;
    actorName: string;
    isAttacker: boolean;
  }>>([]);
  const [supplyMagicOffer, setSupplyMagicOffer] = useState<{ actorId: number; cards: GameCard[] } | null>(null);
  const [tramcubosoCardChoices, setTramcubosoCardChoices] = useState<TramcubosoCardChoice[]>([]);
  const [cubinarcaOrderOffer, setCubinarcaOrderOffer] = useState<{ issuerId: number; victimId: number } | null>(null);
  const [pendingDiceReroll, setPendingDiceReroll] = useState<PendingDiceReroll | null>(null);
  const [racubiteroLootOffer, setRacubiteroLootOffer] = useState<{ actorId: number; cards: GameCard[] } | null>(null);
  const [cubinjaTransferOffer, setCubinjaTransferOffer] = useState<{ actorId: number; card: GameCard } | null>(null);
  const [morphSelectionPlayerId, setMorphSelectionPlayerId] = useState<number | null>(null);
  const [morphInventoryOffer, setMorphInventoryOffer] = useState<{
    playerId: number; form: CharacterType; hand: GameCard[]; weapons: GameCard[];
    stances: GameCard[]; weaponLimit: number; stanceLimit: number;
  } | null>(null);
  const eliminatedInventoryReturnedRef = useRef<Set<number>>(new Set());
  const botOrderTurnRef = useRef<number | null>(null);
  const playersRef = useRef<PlayerState[]>([]);
  const deckRef = useRef<GameCard[]>([]);
  const setDeck = (value: GameCard[] | ((previous: GameCard[]) => GameCard[])) => {
    const nextDeck = typeof value === 'function'
      ? (value as (previous: GameCard[]) => GameCard[])(deckRef.current)
      : value;
    deckRef.current = nextDeck;
    setDeckState(nextDeck);
  };
  const replayRecorderRef = useRef<any>(null);
  const replayUiEventCounterRef = useRef(0);
  const replayExecutionRef = useRef<ReplayExecutionController | null>(null);
  const replayCommandDispatcherRef = useRef<((payload: any, event: any) => Promise<void>) | null>(null);
  const replayStateSnapshotRef = useRef<any>(null);
  const replayObservedEventsRef = useRef<Array<{ type: string; payload: any }>>([]);
  const replayPlaybackActiveRef = useRef(false);
  const persistedReplayMatchIdsRef = useRef<Set<string>>(new Set());
  const matchFinalizedRef = useRef(false);
  const [replaySaveStatus, setReplaySaveStatus] = useState<'IDLE' | 'SAVING' | 'SAVED' | 'ERROR'>('IDLE');
  const [replaySaveError, setReplaySaveError] = useState<string | null>(null);
  const [isReplayPlayback, setIsReplayPlayback] = useState(false);
  const [replayProgress, setReplayProgress] = useState<any>(null);
  const [replayFailure, setReplayFailure] = useState<string | null>(null);
  useEffect(() => { playersRef.current = players; }, [players]);

  const recordReplayEvent = (type: string, payload: Record<string, unknown> = {}) => {
    if (replayPlaybackActiveRef.current) {
      replayObservedEventsRef.current.push({
        type,
        payload: JSON.parse(JSON.stringify(payload))
      });
    }
    if (replayRecorderRef.current) appendReplayEvent(replayRecorderRef.current, type, payload);
  };

  const beginMatchRecording = (mode: string, metadata: Record<string, unknown> = {}) => {
    matchFinalizedRef.current = false;
    setReplaySaveStatus('IDLE');
    setReplaySaveError(null);
    const seed = createMatchSeed();
    const replay = createMatchReplay({ seed, mode, metadata, engineVersion: '1.0.0' });
    replayRecorderRef.current = replay;
    startGameplayRandomRecording(seed, randomResult => appendReplayEvent(replay, 'RANDOM_RESULT', randomResult));
    appendReplayEvent(replay, 'MATCH_RECORDING_STARTED', { mode, seed });
  };

  const captureMatchInitialState = (
    gameModeAtStart: GameMode,
    initialPlayers: PlayerState[],
    initialDeck: GameCard[],
    additional: Record<string, unknown> = {}
  ) => {
    const deckOrder = initialDeck.map(card => ({ id: card.id, uid: card.uid }));
    setReplayInitialState(replayRecorderRef.current, {
      gameMode: gameModeAtStart,
      round: 1,
      turnIndex: 0,
      cardUidCounter: getCardUidCounter(),
      selectedTargetId: initialPlayers.find(player => player.teamId === 2)?.id ?? initialPlayers[1]?.id ?? null,
      players: initialPlayers,
      deck: initialDeck,
      discardPile: [],
      deckOrder,
      ...additional
    });
    recordReplayEvent('MATCH_STARTED', { gameMode: gameModeAtStart, deckOrder });
    recordReplayCheckpoint('match-start', { gameMode: gameModeAtStart, players: initialPlayers, deckOrder, cardUidCounter: getCardUidCounter() });
  };

  const recordPlayerAction = (kind: string, payload: Record<string, unknown> = {}) => {
    recordReplayEvent('PLAYER_ACTION', {
      kind,
      actorId: players[turnIndex]?.id ?? null,
      round,
      ...payload
    });
  };

  const recordReplayCheckpoint = (label: string, state: Record<string, unknown>) => {
    if (!replayRecorderRef.current) return;
    appendReplayCheckpoint(replayRecorderRef.current, label, {
      state,
      stateHash: hashReplayState(state)
    });
  };

  const exportMatchReplay = () => {
    const replay = replayRecorderRef.current;
    if (!replay || !replay.initialState) return;
    appendReplayEvent(replay, 'REPLAY_EXPORTED', { eventCount: replay.events.length });
    downloadMatchReplay(replay);
  };

  const persistCompletedMatchReplay = async (replay: any) => {
    const matchId = replay?.metadata?.matchId;
    if (!replay?.finalResult || !matchId || persistedReplayMatchIdsRef.current.has(matchId)) return;
    persistedReplayMatchIdsRef.current.add(matchId);
    setReplaySaveStatus('SAVING');
    setReplaySaveError(null);
    try {
      await saveCompletedReplay(replay);
      setReplaySaveStatus('SAVED');
    } catch (error: any) {
      persistedReplayMatchIdsRef.current.delete(matchId);
      setReplaySaveStatus('ERROR');
      setReplaySaveError(error?.message || 'No se pudo guardar la partida en este dispositivo.');
    }
  };

  const retrySaveCompletedMatchReplay = () => {
    const replay = replayRecorderRef.current;
    if (replay?.finalResult) void persistCompletedMatchReplay(replay);
  };

  const exportCompletedMatchLog = () => {
    const replay = replayRecorderRef.current;
    if (!replay?.finalResult) return;
    downloadReplayLog(replay);
  };

  const nextReplayUiEventId = () => {
    replayUiEventCounterRef.current += 1;
    return replayUiEventCounterRef.current;
  };


  // Pila única: toda carta consumida, reemplazada o desequipada vuelve a mezclarse aquí.
  const returnCardsToGlobalPile = (cards: GameCard[]) => {
    if (cards.length === 0) return;
    const currentDeck = deckRef.current.length > 0 ? deckRef.current : deck;
    const shuffledDeck = gameplayShuffle([...currentDeck, ...cards], 'deck.return-cards');
    deckRef.current = shuffledDeck;
    setDeck(shuffledDeck);
    setDiscardPile([]);
    recordReplayEvent('DECK_SHUFFLED', {
      purpose: 'deck.return-cards',
      cardOrder: shuffledDeck.map(card => ({ id: card.id, uid: card.uid }))
    });
  };

  useEffect(() => {
    const eliminated = players.filter(player =>
      (player.isEliminated || player.hp <= 0) &&
      !eliminatedInventoryReturnedRef.current.has(player.id) &&
      (player.hand.length > 0 || player.equippedWeapons.length > 0 || player.preparedStance || player.preparedStanceSecondary)
    );
    if (eliminated.length === 0) return;
    eliminated.forEach(player => eliminatedInventoryReturnedRef.current.add(player.id));
    const ids = new Set(eliminated.map(player => player.id));
    const returned = eliminated.flatMap(player => [
      ...player.hand,
      ...player.equippedWeapons,
      ...(player.preparedStance ? [player.preparedStance] : []),
      ...(player.preparedStanceSecondary ? [player.preparedStanceSecondary] : [])
    ]);
    setPlayers(previous => previous.map(player => ids.has(player.id) ? {
      ...player, hand: [], equippedWeapons: [], preparedStance: null, preparedStanceSecondary: null,
      borrowedEquipmentEffects: [], borrowedEquipmentSourceId: null
    } : player));
    returnCardsToGlobalPile(returned);
    eliminated.forEach(player => addLog("El inventario de " + player.name + " regresa a la Pila General tras su eliminación.", true, "Árbitro"));
  }, [players]);

  // Release a stale cover if its ally was eliminated or the guardian changed into another hero.
  useEffect(() => {
    const staleCoverageIds = players
      .filter(player => {
        if (player.guardingAllyId == null) return false;
        const protectedAlly = players.find(ally => ally.id === player.guardingAllyId);
        const activeHero = player.activeMorphCharacter || player.characterType;
        return activeHero !== CharacterType.GLADIACUBON || !protectedAlly || protectedAlly.isEliminated || protectedAlly.hp <= 0;
      })
      .map(player => player.id);
    if (staleCoverageIds.length === 0) return;
    setPlayers(previous => previous.map(player => staleCoverageIds.includes(player.id)
      ? { ...player, guardingAllyId: null }
      : player
    ));
  }, [players]);

  const matchIntroCompletedRef = useRef(true);

  const speedMultiplier = isFastSpeed ? 0.5 : 1;

  const triggerMatchIntro = () => {
    matchIntroCompletedRef.current = false;
    setIsMatchIntroPlaying(true);
  };

  const completeMatchIntro = () => {
    if (matchIntroCompletedRef.current) return;
    matchIntroCompletedRef.current = true;
    setIsMatchIntroPlaying(false);
  };

  const handleApplySixChoice = (playerId: number, choice: 'CARD' | 'EXTRA_TURN') => {
    recordPlayerAction('SPECIAL_SIX_CHOICE', { playerId, choice });
    const latestPlayers = playersRef.current.length > 0 ? playersRef.current : players;
    const actor = latestPlayers.find(p => p.id === playerId);
    const actorName = actor ? actor.name : 'Jugador';
    if (!actor) {
      setSpecialSixChoice(null);
      return;
    }
    if (choice === 'CARD' && actor.hand.length >= getMaxHandSize(actor)) {
      addLog(actorName + " no tiene espacio para robar una carta.", true);
      setSpecialSixChoice(null);
      return;
    }

    if (choice === 'EXTRA_TURN') {
      setPlayers(prev => prev.map(p => {
        if (p.id !== playerId) return p;
        return { ...p, actionPoints: p.actionPoints + 1 };
      }));
      addFloatingText(playerId, "+1 CÚBIT", "#ffd600");
      addLog(`¡Cara Especial 6! ${actorName} elige ACCIÓN ADICIONAL (+1 Cúbit).`, true);
      sound.playStanceActivate();
      narrator.narrateSpecialFaceSix(actorName, "Acción adicional");
    } else {
      const drawResult = drawForPlayer(actor, deckRef.current, [], "Cara Especial 6");
      if (drawResult.cards.length === 0) {
        setPlayers(prev => prev.map(p => p.id === playerId
          ? { ...p, actionPoints: p.actionPoints + 1 }
          : p
        ));
        addLog("La Pila General quedó vacía; la recompensa se convierte en +1 Cúbit.", true);
        addFloatingText(playerId, "+1 CÚBIT", "#ffd600");
        sound.playStanceActivate();
        narrator.narrateSpecialFaceSix(actorName, "Acción adicional");
      } else {
        setDeck(drawResult.newDeck);
        setDiscardPile([]);
        setPlayers(prev => prev.map(p => p.id === playerId ? {
          ...p,
          hand: [...p.hand, ...drawResult.cards],
          cardsDrawn: (p.cardsDrawn || 0) + drawResult.cards.length
        } : p));
        if (drawResult.choices.length > 0) {
          setTramcubosoCardChoices(prev => [...prev, ...drawResult.choices]);
        }
        addFloatingText(playerId, "+1 CARTA MAZO", "#00e5ff");
        addLog("¡Cara Especial 6! " + actorName + " roba del Pila General.", true);
        triggerDeckAnimation();
        sound.playCardDraw();
        narrator.narrateSpecialFaceSix(actorName, "Robar Carta");
      }
    }

    setSpecialSixChoice(null);
  };

  const triggerDeckAnimation = () => {
    setIsDeckDrawing(true);
    setTimeout(() => setIsDeckDrawing(false), 1000);
  };

  // Helper: Gladiacubon starts with 1 random weapon equipped from the global deck
  const getInitialWeapons = (hero: CharacterType, deckArr: GameCard[]): GameCard[] => {
    if (hero !== CharacterType.GLADIACUBON) return [];
    const result = takeFirstWeaponFromDeck(deckArr, generateUniqueCardUid);
    if (!result.card) return [];
    deckArr.splice(0, deckArr.length, ...result.remainingDeck);
    return [result.card as GameCard];
  };

  // Add floating combat text
  const addFloatingText = (playerId: number, text: string, colorHex: string) => {
    const newText: FloatingCombatText = {
      id: nextReplayUiEventId(),
      playerId,
      text,
      colorHex,
      createdAt: Date.now()
    };
    setFloatingTexts(prev => [...prev, newText]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== newText.id));
    }, 1600);
  };

  // Add log entry
  const addLog = (message: string, isCritical: boolean = false, actorOverride?: string) => {
    const logPlayers = replayPlaybackActiveRef.current && replayStateSnapshotRef.current?.players
      ? replayStateSnapshotRef.current.players as PlayerState[]
      : players;
    const logTurnIndex = replayPlaybackActiveRef.current
      ? replayStateSnapshotRef.current?.turnIndex ?? turnIndex
      : turnIndex;
    const actor = actorOverride || (logPlayers[logTurnIndex]?.name ?? "Árbitro");
    const entry: CombatLogEntry = {
      id: nextReplayUiEventId(),
      round,
      actorName: actor,
      message,
      isCritical
    };
    recordReplayEvent('GAME_LOG', { round, actorName: actor, message, isCritical });
    setLog(prev => [entry, ...prev.slice(0, 35)]);
  };

  // La Pila General es única: no existe zona de descarte separada.
  const drawCardFromDeck = (currentDeck: GameCard[], _currentDiscard: GameCard[]): { card: GameCard | null; newDeck: GameCard[]; newDiscard: GameCard[] } => {
    const cards = [...currentDeck];
    if (cards.length === 0) return { card: null, newDeck: cards, newDiscard: [] };
    const rawCard = cards.shift() || null;
    const card = rawCard ? { ...rawCard, uid: generateUniqueCardUid(rawCard.id) } : null;
    if (card) recordReplayEvent('CARD_DRAWN', { cardId: card.id, cardUid: card.uid });
    return { card, newDeck: cards, newDiscard: [] };
  };

  // Tramcuboso's Selección Afortunada applies to each draw from the global pile.
  const scoreTramcubosoCard = (player: PlayerState, card: GameCard): number => {
    const rarityScore: Record<string, number> = { LEGENDARIA: 5, SUPER_RARA: 4, RARA: 3 };
    let score = rarityScore[card.rarity] ?? 1;
    const activeHero = player.activeMorphCharacter || player.characterType;
    const heroDef = CHARACTERS[activeHero];
    if (heroDef && heroDef.classes.includes(card.category)) score += 1.5;
    if (card.type === CardType.WEAPON) score += player.equippedWeapons.length < getMaxWeaponSlots(player) ? 2 : -1;
    if (card.type === CardType.TRICK && card.timing === TrickTiming.PREPARED_STANCE) {
      const occupied = [player.preparedStance, player.preparedStanceSecondary].filter(Boolean).length;
      score += occupied < getMaxPreparedStanceSlots(player) ? 2 : -0.5;
    }
    return score;
  };

  const drawForPlayer = (
    player: PlayerState,
    currentDeck: GameCard[],
    currentDiscard: GameCard[],
    source: string
  ): { cards: GameCard[]; choices: TramcubosoCardChoice[]; newDeck: GameCard[]; newDiscard: GameCard[] } => {
    const first = drawCardFromDeck(currentDeck, currentDiscard);
    if (first.card) recordReplayEvent('CARD_OFFERED', { recipientId: player.id, source, cardUid: first.card.uid });
    if (!first.card) return { cards: [], choices: [], newDeck: first.newDeck, newDiscard: first.newDiscard };
    const activeHero = player.activeMorphCharacter || player.characterType;
    if (activeHero !== CharacterType.TRAMCUBOSO) {
      return { cards: [first.card], choices: [], newDeck: first.newDeck, newDiscard: first.newDiscard };
    }
    const second = drawCardFromDeck(first.newDeck, first.newDiscard);
    if (second.card) recordReplayEvent('CARD_OFFERED', { recipientId: player.id, source, cardUid: second.card.uid, alternative: true });
    if (!second.card) return { cards: [first.card], choices: [], newDeck: second.newDeck, newDiscard: second.newDiscard };
    const offer: TramcubosoCardChoice = {
      playerId: player.id,
      playerName: player.name,
      initialCard: first.card,
      alternativeCard: second.card,
      source
    };
    if (!player.isBot) {
      return { cards: [first.card], choices: [offer], newDeck: second.newDeck, newDiscard: second.newDiscard };
    }
    const chooseAlternative = scoreTramcubosoCard(player, second.card) > scoreTramcubosoCard(player, first.card);
    const selectedCard = chooseAlternative ? second.card : first.card;
    const discardedCard = chooseAlternative ? first.card : second.card;
    const reshuffledDeck = gameplayShuffle([...second.newDeck, discardedCard], 'deck.tramcuboso-rejected-card');
    recordReplayEvent('DECK_SHUFFLED', { purpose: 'deck.tramcuboso-rejected-card', cardOrder: reshuffledDeck.map(card => ({ id: card.id, uid: card.uid })) });
    recordReplayEvent('BOT_DECISION', { kind: 'TRAMCUBOSO_CARD_CHOICE', playerId: player.id, selectedCardUid: selectedCard.uid, rejectedCardUid: discardedCard.uid });
    return { cards: [selectedCard], choices: [], newDeck: reshuffledDeck, newDiscard: [] };
  };

  const resolveTramcubosoCardChoice = (choiceIndex: 0 | 1) => {
    const offer = tramcubosoCardChoices[0];
    if (!offer) return;
    recordPlayerAction('TRAMCUBOSO_CARD_CHOICE', { playerId: offer.playerId, choiceIndex, initialCardUid: offer.initialCard.uid, alternativeCardUid: offer.alternativeCard.uid });
    const selectedCard = choiceIndex === 0 ? offer.initialCard : offer.alternativeCard;
    const discardedCard = choiceIndex === 0 ? offer.alternativeCard : offer.initialCard;
    if (choiceIndex === 1) {
      setPlayers(prev => prev.map(player => {
        if (player.id !== offer.playerId) return player;
        const hasInitial = player.hand.some(card => card.uid === offer.initialCard.uid);
        return {
          ...player,
          hand: hasInitial
            ? player.hand.map(card => card.uid === offer.initialCard.uid ? selectedCard : card)
            : player.hand.length < getMaxHandSize(player) ? [...player.hand, selectedCard] : player.hand
        };
      }));
      // A perfect-block reaction can be waiting behind this modal; keep its snapshot in sync.
      setReactionPlayer(prev => {
        if (!prev || prev.id !== offer.playerId) return prev;
        const hasInitial = prev.hand.some(card => card.uid === offer.initialCard.uid);
        return hasInitial
          ? { ...prev, hand: prev.hand.map(card => card.uid === offer.initialCard.uid ? selectedCard : card) }
          : prev;
      });
    }
    returnCardsToGlobalPile([discardedCard]);
    setTramcubosoCardChoices(prev => prev.slice(1));
    addLog("¡Selección Afortunada! " + offer.playerName + " conserva [" + selectedCard.name + "] y descarta [" + discardedCard.name + "] (" + offer.source + ").", true, offer.playerName);
    sound.playCardDraw();
  };

  // Start 3 vs 3 Draft Battle
  const startDraftMatch = (playerTeam: CharacterType[], rivalTeam: CharacterType[]) => {
    matchIntroCompletedRef.current = false;
    setIsMatchIntroPlaying(true);
    beginMatchRecording('TEAM_DRAFT_3V3', { playerTeam, rivalTeam });
    let currentDeck = createShuffledDeck();
    let currentDiscard: GameCard[] = [];

    const newPlayers: PlayerState[] = [];

    // Interleave turn order for thrilling alternating team battle:
    // P1, R1, P2, R2, P3, R3
    for (let i = 0; i < 3; i++) {
      // Player hero
      const pHero = playerTeam[i];
      const pWeapons = getInitialWeapons(pHero, currentDeck);

      newPlayers.push({
        id: (i * 2) + 1,
        name: `Tú: ${CHARACTERS[pHero].displayName.slice(0, 8)}`,
        characterType: pHero,
        hp: getCharacterMaxHp(pHero),
        maxHp: getCharacterMaxHp(pHero),
        actionPoints: 2,
        hand: [], // Empieza sin cartas en mano
        equippedWeapons: pWeapons,
        preparedStance: null,
        isBot: false,
        isFrozen: false,
        skipNextTurn: false,
        forcedTargetPlayerId: null,
        abilityCooldownRemaining: 0,
        isEliminated: false,
        teamId: 1,
        superBlockMeter: 0,
        shieldBarrier: 0,
        damageDealt: 0,
        perfectBlocks: 0,
        cardsDrawn: 0
      });

      // Rival hero
      const rHero = rivalTeam[i];
      const rWeapons = getInitialWeapons(rHero, currentDeck);

      newPlayers.push({
        id: (i * 2) + 2,
        name: `Rival: ${CHARACTERS[rHero].displayName.slice(0, 7)}`,
        characterType: rHero,
        hp: getCharacterMaxHp(rHero),
        maxHp: getCharacterMaxHp(rHero),
        actionPoints: 2,
        hand: [], // Empieza sin cartas en mano
        equippedWeapons: rWeapons,
        preparedStance: null,
        isBot: true,
        isFrozen: false,
        skipNextTurn: false,
        forcedTargetPlayerId: null,
        abilityCooldownRemaining: 0,
        isEliminated: false,
        teamId: 2,
        superBlockMeter: 0,
        shieldBarrier: 0,
        damageDealt: 0,
        perfectBlocks: 0,
        cardsDrawn: 0
      });
    }

    setDeck(currentDeck);
    setDiscardPile([]);
    eliminatedInventoryReturnedRef.current.clear();
    newPlayers.forEach(player => {
      if (player.characterType === CharacterType.CUBOGRO) player.cubogroAbilityCharges = 1;
      if (player.characterType === CharacterType.CAMBIAFORMAS) player.morphFormsUsed = [];
    });
    captureMatchInitialState(GameMode.QUICK_BATTLE, newPlayers, currentDeck, { matchType: 'DRAFT_3V3' });
    setPlayers(newPlayers);
    setRound(1);
    setTurnIndex(0);
    setWinner(null);
    setSelectedTargetId(newPlayers.find(p => p.teamId === 2)?.id || null);
    setActiveDiceRoll(null);
    setGameMode(GameMode.QUICK_BATTLE);
    setLog([
      {
        id: Date.now(),
        round: 1,
        actorName: "Árbitro",
        message: `¡Modo Aleatorio 3 vs 3! Dados barajados y repartidos a cada escuadrón. Manos vacías al inicio. Cartas se obtienen del Pila General por Bloqueo Perfecto o al quebrar umbrales de vida (≤15, ≤10, ≤5 HP).`,
        isCritical: true
      }
    ]);
    setCurrentScreen(CurrentScreen.ARENA);
    sound.playDiceRoll();
    music.play();
    narrator.narrateMatchStart("Modo Aleatorio de Escuadras");
  };

  // Start Quick Battle
  const startQuickMatch = (playerCount: number = 3, chosenHero: CharacterType = CharacterType.TRAMCUBOSO) => {
    triggerMatchIntro();
    beginMatchRecording('QUICK_BATTLE', { playerCount, chosenHero });
    let currentDeck = createShuffledDeck();
    let currentDiscard: GameCard[] = [];

    const otherHeroes = gameplayShuffle(CHARACTER_LIST.filter(c => c.type !== chosenHero), 'match.quick.other-heroes');
    const newPlayers: PlayerState[] = [];

    // Player 1 (Human)
    const p1Weapons = getInitialWeapons(chosenHero, currentDeck);
    newPlayers.push({
      id: 1,
      name: `Tú (${CHARACTERS[chosenHero].displayName.slice(0, 8)})`,
      characterType: chosenHero,
      hp: getCharacterMaxHp(chosenHero),
      maxHp: getCharacterMaxHp(chosenHero),
      actionPoints: 2,
      hand: [], // Empieza sin cartas
      equippedWeapons: p1Weapons,
      preparedStance: null,
      isBot: false,
      isFrozen: false,
      skipNextTurn: false,
      forcedTargetPlayerId: null,
      abilityCooldownRemaining: 0,
      isEliminated: false,
      superBlockMeter: 0,
      shieldBarrier: 0,
      damageDealt: 0,
      perfectBlocks: 0,
      cardsDrawn: 0
    });

    // Bots
    for (let i = 2; i <= playerCount; i++) {
      const botHero = otherHeroes[i - 2].type;
      const bWeapons = getInitialWeapons(botHero, currentDeck);

      newPlayers.push({
        id: i,
        name: `Bot ${i} (${CHARACTERS[botHero].displayName.slice(0, 7)})`,
        characterType: botHero,
        hp: getCharacterMaxHp(botHero),
        maxHp: getCharacterMaxHp(botHero),
        actionPoints: 2,
        hand: [], // Empieza sin cartas
        equippedWeapons: bWeapons,
        preparedStance: null,
        isBot: true,
        isFrozen: false,
        skipNextTurn: false,
        forcedTargetPlayerId: null,
        abilityCooldownRemaining: 0,
        isEliminated: false,
        superBlockMeter: 0,
        shieldBarrier: 0,
        damageDealt: 0,
        perfectBlocks: 0,
        cardsDrawn: 0
      });
    }

    setDeck(currentDeck);
    setDiscardPile([]);
    eliminatedInventoryReturnedRef.current.clear();
    newPlayers.forEach(player => {
      if (player.characterType === CharacterType.CUBOGRO) player.cubogroAbilityCharges = 1;
      if (player.characterType === CharacterType.CAMBIAFORMAS) player.morphFormsUsed = [];
    });
    captureMatchInitialState(GameMode.QUICK_BATTLE, newPlayers, currentDeck, { matchType: 'QUICK_BATTLE' });
    setPlayers(newPlayers);
    setRound(1);
    setTurnIndex(0);
    setWinner(null);
    setSelectedTargetId(newPlayers[1]?.id || null);
    setActiveDiceRoll(null);
    setGameMode(GameMode.QUICK_BATTLE);
    setLog([
      {
        id: Date.now(),
        round: 1,
        actorName: "Árbitro",
        message: `¡Inicia la pelea! Manos vacías al inicio. Cartas se obtienen del Pila General por Bloqueo Perfecto o al cruzar múltiplos de 5.`,
        isCritical: true
      }
    ]);
    setCurrentScreen(CurrentScreen.ARENA);
    sound.playDiceRoll();
    music.play();
    narrator.narrateMatchStart("Batalla Rápida Callejera");
  };

  // Start Campaign Match
  const startCampaignMatch = (chapter: CampaignChapter, chosenHero: CharacterType = CharacterType.TRAMCUBOSO) => {
    triggerMatchIntro();
    beginMatchRecording('STREET_CAMPAIGN', { chapterTitle: chapter.title, chosenHero });
    let currentDeck = createShuffledDeck();
    let currentDiscard: GameCard[] = [];

    const newPlayers: PlayerState[] = [];

    // Player 1
    const pWeapons = getInitialWeapons(chosenHero, currentDeck);
    newPlayers.push({
      id: 1,
      name: `Tú (${CHARACTERS[chosenHero].displayName.slice(0, 8)})`,
      characterType: chosenHero,
      hp: getCharacterMaxHp(chosenHero),
      maxHp: getCharacterMaxHp(chosenHero),
      actionPoints: 2,
      hand: [], // Empieza sin cartas
      equippedWeapons: pWeapons,
      preparedStance: null,
      isBot: false,
      isFrozen: false,
      skipNextTurn: false,
      forcedTargetPlayerId: null,
      abilityCooldownRemaining: 0,
      isEliminated: false,
      superBlockMeter: 0,
      shieldBarrier: 0,
      damageDealt: 0,
      perfectBlocks: 0,
      cardsDrawn: 0
    });

    // Boss
    const bossHero = chapter.bossCharacter;
    const bossWeapons = getInitialWeapons(bossHero, currentDeck);
    newPlayers.push({
      id: 2,
      name: `JEFE: ${CHARACTERS[bossHero].displayName.slice(0, 7)}`,
      characterType: bossHero,
      hp: getCharacterMaxHp(bossHero),
      maxHp: getCharacterMaxHp(bossHero),
      actionPoints: 2,
      hand: [], // Empieza sin cartas
      equippedWeapons: bossWeapons,
      preparedStance: null,
      isBot: true,
      isFrozen: false,
      skipNextTurn: false,
      forcedTargetPlayerId: null,
      abilityCooldownRemaining: 0,
      isEliminated: false,
      superBlockMeter: 0,
      shieldBarrier: 0,
      damageDealt: 0,
      perfectBlocks: 0,
      cardsDrawn: 0
    });

    // Minions
    chapter.minionCharacters.forEach((mHero, idx) => {
      const mWeapons = getInitialWeapons(mHero, currentDeck);
      newPlayers.push({
        id: 3 + idx,
        name: `Esbirro: ${CHARACTERS[mHero].displayName.slice(0, 7)}`,
        characterType: mHero,
        hp: getCharacterMaxHp(mHero),
        maxHp: getCharacterMaxHp(mHero),
        actionPoints: 2,
        hand: [], // Empieza sin cartas
        equippedWeapons: mWeapons,
        preparedStance: null,
        isBot: true,
        isFrozen: false,
        skipNextTurn: false,
        forcedTargetPlayerId: null,
        abilityCooldownRemaining: 0,
        isEliminated: false,
        superBlockMeter: 0,
        shieldBarrier: 0,
        damageDealt: 0,
        perfectBlocks: 0,
        cardsDrawn: 0
      });
    });

    setDeck(currentDeck);
    setDiscardPile([]);
    eliminatedInventoryReturnedRef.current.clear();
    newPlayers.forEach(player => {
      if (player.characterType === CharacterType.CUBOGRO) player.cubogroAbilityCharges = 1;
      if (player.characterType === CharacterType.CAMBIAFORMAS) player.morphFormsUsed = [];
    });
    captureMatchInitialState(GameMode.STREET_CAMPAIGN, newPlayers, currentDeck, { matchType: 'STREET_CAMPAIGN' });
    setPlayers(newPlayers);
    setRound(1);
    setTurnIndex(0);
    setWinner(null);
    setSelectedTargetId(newPlayers[1]?.id || null);
    setActiveDiceRoll(null);
    setGameMode(GameMode.STREET_CAMPAIGN);
    setLog([
      {
        id: Date.now(),
        round: 1,
        actorName: "Árbitro",
        message: `¡CAMPAÑA: ${chapter.title}! Derrota al Jefe. Robas del Pila General por Bloqueo Perfecto o al cruzar múltiplos de 5.`,
        isCritical: true
      }
    ]);
    setCurrentScreen(CurrentScreen.ARENA);
    sound.playDiceRoll();
    music.play();
    narrator.narrateMatchStart(`Campaña: ${chapter.title}`);
  };

  // Start Pass and Play
  const startPassAndPlayMatch = (playerCount: number, heroList: CharacterType[]) => {
    triggerMatchIntro();
    beginMatchRecording('PASS_AND_PLAY', { playerCount, heroList });
    let currentDeck = createShuffledDeck();
    let currentDiscard: GameCard[] = [];

    const newPlayers: PlayerState[] = [];
    for (let i = 1; i <= playerCount; i++) {
      const hero = heroList[i - 1] || CharacterType.TRAMCUBOSO;
      const hWeapons = getInitialWeapons(hero, currentDeck);

      newPlayers.push({
        id: i,
        name: `Jugador ${i} (${CHARACTERS[hero].displayName.slice(0, 7)})`,
        characterType: hero,
        hp: getCharacterMaxHp(hero),
        maxHp: getCharacterMaxHp(hero),
        actionPoints: 2,
        hand: [], // Empieza sin cartas
        equippedWeapons: hWeapons,
        preparedStance: null,
        isBot: false, // all human
        isFrozen: false,
        skipNextTurn: false,
        forcedTargetPlayerId: null,
        abilityCooldownRemaining: 0,
        isEliminated: false,
        superBlockMeter: 0,
        shieldBarrier: 0,
        damageDealt: 0,
        perfectBlocks: 0,
        cardsDrawn: 0
      });
    }

    setDeck(currentDeck);
    setDiscardPile([]);
    eliminatedInventoryReturnedRef.current.clear();
    newPlayers.forEach(player => {
      if (player.characterType === CharacterType.CUBOGRO) player.cubogroAbilityCharges = 1;
      if (player.characterType === CharacterType.CAMBIAFORMAS) player.morphFormsUsed = [];
    });
    captureMatchInitialState(GameMode.PASS_AND_PLAY, newPlayers, currentDeck, { matchType: 'PASS_AND_PLAY' });
    setPlayers(newPlayers);
    setRound(1);
    setTurnIndex(0);
    setWinner(null);
    setSelectedTargetId(newPlayers[1]?.id || null);
    setActiveDiceRoll(null);
    setGameMode(GameMode.PASS_AND_PLAY);
    setLog([
      {
        id: Date.now(),
        round: 1,
        actorName: "Árbitro",
        message: `¡Modo Pase y Juega iniciado con ${playerCount} jugadores locales!`,
        isCritical: true
      }
    ]);
    setCurrentScreen(CurrentScreen.ARENA);
    sound.playDiceRoll();
    music.play();
    narrator.narrateMatchStart("Pase y Juega Callejero");
  };

  // Start Online Multiplayer Match (Escuadrón Azul 3vs3 vs Escuadrón Rojo 3vs3)
  const startOnlineMatch = (
    playerTeam: CharacterType[],
    rivalTeam: CharacterType[],
    rivalName: string = 'Rival Online'
  ) => {
    triggerMatchIntro();
    beginMatchRecording('ONLINE_PVP', { playerTeam, rivalTeam, rivalName });
    let currentDeck = createShuffledDeck();
    let currentDiscard: GameCard[] = [];

    const newPlayers: PlayerState[] = [];

    // Ensure teams have 3 characters each
    const pSquad = playerTeam.length >= 3 ? playerTeam.slice(0, 3) : [
      playerTeam[0] || CharacterType.CUBINJA,
      playerTeam[1] || CharacterType.TRAMCUBOSO,
      playerTeam[2] || CharacterType.GLADIACUBON
    ];
    const rSquad = rivalTeam.length >= 3 ? rivalTeam.slice(0, 3) : [
      rivalTeam[0] || CharacterType.CUBOGRO,
      rivalTeam[1] || CharacterType.DRACUBON,
      rivalTeam[2] || CharacterType.HADA_AL_CUBO
    ];

    // Interleave turn order for alternating team battle:
    // P1, R1, P2, R2, P3, R3
    for (let i = 0; i < 3; i++) {
      // Player hero (Escuadrón Azul - Team 1)
      const pHero = pSquad[i];
      const pWeapons = getInitialWeapons(pHero, currentDeck);

      newPlayers.push({
        id: (i * 2) + 1,
        name: `Tú: ${CHARACTERS[pHero].displayName.slice(0, 8)}`,
        characterType: pHero,
        hp: getCharacterMaxHp(pHero),
        maxHp: getCharacterMaxHp(pHero),
        actionPoints: 2,
        hand: [],
        equippedWeapons: pWeapons,
        preparedStance: null,
        isBot: false,
        isFrozen: false,
        skipNextTurn: false,
        forcedTargetPlayerId: null,
        abilityCooldownRemaining: 0,
        isEliminated: false,
        teamId: 1, // Azul
        superBlockMeter: 0,
        shieldBarrier: 0,
        damageDealt: 0,
        perfectBlocks: 0,
        cardsDrawn: 0
      });

      // Rival hero (Escuadrón Rojo - Team 2)
      const rHero = rSquad[i];
      const rWeapons = getInitialWeapons(rHero, currentDeck);

      newPlayers.push({
        id: (i * 2) + 2,
        name: `${rivalName}: ${CHARACTERS[rHero].displayName.slice(0, 7)}`,
        characterType: rHero,
        hp: getCharacterMaxHp(rHero),
        maxHp: getCharacterMaxHp(rHero),
        actionPoints: 2,
        hand: [],
        equippedWeapons: rWeapons,
        preparedStance: null,
        isBot: true,
        isFrozen: false,
        skipNextTurn: false,
        forcedTargetPlayerId: null,
        abilityCooldownRemaining: 0,
        isEliminated: false,
        teamId: 2, // Rojo
        superBlockMeter: 0,
        shieldBarrier: 0,
        damageDealt: 0,
        perfectBlocks: 0,
        cardsDrawn: 0
      });
    }

    setDeck(currentDeck);
    setDiscardPile([]);
    eliminatedInventoryReturnedRef.current.clear();
    newPlayers.forEach(player => {
      if (player.characterType === CharacterType.CUBOGRO) player.cubogroAbilityCharges = 1;
      if (player.characterType === CharacterType.CAMBIAFORMAS) player.morphFormsUsed = [];
    });
    captureMatchInitialState(GameMode.ONLINE_PVP, newPlayers, currentDeck, { matchType: 'ONLINE_PVP' });
    setPlayers(newPlayers);
    setRound(1);
    setTurnIndex(0);
    setWinner(null);
    setSelectedTargetId(newPlayers.find(p => p.teamId === 2)?.id || 2);
    setActiveDiceRoll(null);
    setGameMode(GameMode.ONLINE_PVP);
    setLog([
      {
        id: Date.now(),
        round: 1,
        actorName: "Árbitro Online",
        message: `¡Duelo Online 3 vs 3 iniciado! Escuadrón Azul (Tú) vs Escuadrón Rojo (${rivalName}).`,
        isCritical: true
      }
    ]);
    setCurrentScreen(CurrentScreen.ARENA);
    sound.playDiceRoll();
    music.play();
    narrator.narrateMatchStart("Duelo Online 3 vs 3");
  };

  const currentTurnPlayer = players[turnIndex] || null;
  replayStateSnapshotRef.current = {
    isReplayPlayback, currentScreen, players, deck, discardPile, round, turnIndex, gameMode,
    phase, activeClash, activeDiceRoll, isRollingAnimation, winner,
    specialSixChoice, tramcubosoCardChoices, pendingDiceReroll, reactionPlayer,
    supplyMagicOffer, cubinarcaOrderOffer, racubiteroLootOffer, cubinjaTransferOffer,
    morphSelectionPlayerId, morphInventoryOffer
  };

  const issueCubinarcaOrder = (kind: CubinarcaOrderKind, attackTargetId?: number) => {
    if (!cubinarcaOrderOffer) return;
    const issuer = players.find(player => player.id === cubinarcaOrderOffer.issuerId);
    const victim = players.find(player => player.id === cubinarcaOrderOffer.victimId);
    if (!issuer || !victim || issuer.isEliminated || victim.isEliminated || victim.cubinarcaOrder) return;
    if (kind === 'ATTACK_TARGET' && (!attackTargetId || !players.some(player =>
      player.id === attackTargetId && player.id !== victim.id && !player.isEliminated && player.hp > 0
    ))) return;
    if (kind === 'TRANSFER_CARD' &&
      (victim.hand.length === 0 || issuer.hand.length >= getMaxHandSize(issuer))) return;
    if (kind === 'UNEQUIP_WEAPON' && victim.equippedWeapons.length === 0) return;

    const order: CubinarcaOrder = { issuerId: issuer.id, kind, attackTargetId };
    recordPlayerAction('CUBINARCA_ORDER', { issuerId: issuer.id, victimId: victim.id, kind, attackTargetId: attackTargetId ?? null });
    setPlayers(prev => prev.map(player => player.id === victim.id
      ? { ...player, cubinarcaOrder: order, blocksDisabledByOrder: false, cubinarcaOrderDefiedThisTurn: false }
      : player
    ));
    setCubinarcaOrderOffer(null);
    const label = kind === 'ATTACK_TARGET'
      ? `atacar a ${players.find(player => player.id === attackTargetId)?.name ?? 'un objetivo'}`
      : kind === 'TRANSFER_CARD'
      ? `transferir una carta a ${issuer.name}`
      : 'desequipar un arma';
    addLog(`¡Discordia! ${issuer.name} ordena a ${victim.name} ${label}. Si desobedece, no podrá bloquear hasta cumplir.`, true, issuer.name);
  };

  const openCubinarcaOrder = (issuer: PlayerState, victim: PlayerState) => {
    if (
      issuer.id === victim.id || issuer.isEliminated || victim.isEliminated ||
      victim.hp <= 0 || victim.cubinarcaOrder
    ) return;

    if (!issuer.isBot) {
      setCubinarcaOrderOffer({ issuerId: issuer.id, victimId: victim.id });
      return;
    }

    const aliveTargets = players.filter(player =>
      player.id !== victim.id && !player.isEliminated && player.hp > 0
    );
    let kind: CubinarcaOrderKind;
    let attackTargetId: number | undefined;
    if (victim.equippedWeapons.length > 0) {
      kind = 'UNEQUIP_WEAPON';
    } else if (victim.hand.length > 0 && issuer.hand.length < getMaxHandSize(issuer)) {
      kind = 'TRANSFER_CARD';
    } else {
      kind = 'ATTACK_TARGET';
      const weakest = aliveTargets.reduce(
        (best, player) => !best || player.hp < best.hp ? player : best,
        null as PlayerState | null
      );
      attackTargetId = weakest?.id;
    }
    if (kind === 'ATTACK_TARGET' && attackTargetId === undefined) return;
    const order: CubinarcaOrder = { issuerId: issuer.id, kind, attackTargetId };
    recordReplayEvent('BOT_DECISION', { kind: 'CUBINARCA_ORDER', issuerId: issuer.id, victimId: victim.id, order });
    setPlayers(prev => prev.map(player => player.id === victim.id
      ? { ...player, cubinarcaOrder: order, blocksDisabledByOrder: false, cubinarcaOrderDefiedThisTurn: false }
      : player
    ));
    addLog(`¡Discordia! ${issuer.name} impone una orden a ${victim.name}.`, true, issuer.name);
  };

  const fulfillCubinarcaTransfer = (cardIndex: number) => {
    const victim = currentTurnPlayer;
    const order = victim?.cubinarcaOrder;
    if (!victim || order?.kind !== 'TRANSFER_CARD' || getMaxHandSize(victim) === 0) return;
    const issuer = players.find(player => player.id === order.issuerId);
    const card = victim.hand[cardIndex];
    if (!issuer || issuer.isEliminated || !card || issuer.hand.length >= getMaxHandSize(issuer)) return;
    recordPlayerAction('CUBINARCA_TRANSFER_CARD', { victimId: victim.id, issuerId: issuer.id, cardUid: card.uid, cardIndex });
    setPlayers(prev => prev.map(player => {
      if (player.id === victim.id) return {
        ...player,
        hand: player.hand.filter((_, index) => index !== cardIndex),
        cubinarcaOrder: null,
        blocksDisabledByOrder: false,
        cubinarcaOrderDefiedThisTurn: false
      };
      if (player.id === issuer.id) return { ...player, hand: [...player.hand, card] };
      return player;
    }));
    addLog(`${victim.name} cumple la orden y transfiere [${card.name}] a ${issuer.name}.`, true, victim.name);
    sound.playStanceActivate();
  };

  const fulfillCubinarcaUnequip = (weaponIndex: number) => {
    const victim = currentTurnPlayer;
    const order = victim?.cubinarcaOrder;
    if (!victim || order?.kind !== 'UNEQUIP_WEAPON') return;
    const weapon = victim.equippedWeapons[weaponIndex];
    if (!weapon) return;
    recordPlayerAction('CUBINARCA_UNEQUIP_WEAPON', { victimId: victim.id, weaponUid: weapon.uid, weaponIndex });
    const hasHandSpace = victim.hand.length < getMaxHandSize(victim);
    setPlayers(prev => prev.map(player => player.id === victim.id ? {
      ...player,
      equippedWeapons: player.equippedWeapons.filter((_, index) => index !== weaponIndex),
      hand: hasHandSpace ? [...player.hand, weapon] : player.hand,
      cubinarcaOrder: null,
      blocksDisabledByOrder: false,
      cubinarcaOrderDefiedThisTurn: false
    } : player));
    if (!hasHandSpace) returnCardsToGlobalPile([weapon]);
    addLog(`${victim.name} cumple la orden y desequipa [${weapon.name}]${hasHandSpace ? ', devolviéndola a su mano.' : '; su mano está llena y el arma va a la Pila General.'}`, true, victim.name);
    sound.playStanceActivate();
  };

  const defyCubinarcaOrder = () => {
    const victim = currentTurnPlayer;
    if (!victim?.cubinarcaOrder) return;
    recordPlayerAction('CUBINARCA_DEFY_ORDER', { victimId: victim.id, order: victim.cubinarcaOrder });
    setPlayers(prev => prev.map(player => player.id === victim.id
      ? { ...player, blocksDisabledByOrder: true, cubinarcaOrderDefiedThisTurn: true }
      : player
    ));
    addLog(`${victim.name} desobedece la orden de Cubinarca: Discordia le impide bloquear hasta cumplirla.`, true, victim.name);
  };

  useEffect(() => {
    const invalidOrders = players.filter(player => {
      const order = player.cubinarcaOrder;
      if (order?.kind !== 'ATTACK_TARGET' || order.attackTargetId === undefined) return false;
      const target = players.find(candidate => candidate.id === order.attackTargetId);
      return !target || target.isEliminated || target.hp <= 0;
    });
    if (invalidOrders.length === 0) return;
    const ids = new Set(invalidOrders.map(player => player.id));
    setPlayers(previous => previous.map(player => ids.has(player.id) ? {
      ...player, cubinarcaOrder: null, blocksDisabledByOrder: false, cubinarcaOrderDefiedThisTurn: false
    } : player));
    invalidOrders.forEach(player => addLog("La orden de Cubinarca de " + player.name + " queda anulada porque el objetivo ya no está disponible. Discordia se retira.", true, player.name));
  }, [players]);

  // Apply Heroic Class Synergy (Plants vs. Zombies Heroes Style)
  const applyCardClassSynergy = (actorId: number, card: GameCard, targetId?: number | null) => {
    const actor = players.find(p => p.id === actorId);
    if (!actor) return;
    const heroKey = actor.activeMorphCharacter || actor.characterType;
    const heroDef = CHARACTERS[heroKey];
    if (!heroDef) return;

    const hasSynergy = heroDef.classes.includes(card.category);
    if (!hasSynergy) return;

    const catInfo = CATEGORY_INFO[card.category];
    addFloatingText(actorId, `¡SINERGIA ${catInfo.badge.split(' ')[1]}!`, catInfo.color);
    sound.playStanceActivate();
    narrator.narrateClassSynergy(heroDef.displayName, catInfo.name.split(' ')[0], catInfo.synergyBonus);

    switch (card.category) {
      case CardCategory.SOLAR: {
        setPlayers(prev => prev.map(p => {
          if (p.id !== actorId) return p;
          const newHp = Math.min(p.maxHp, p.hp + 1);
          return { ...p, hp: newHp };
        }));
        addLog(`🌿 ¡Sinergia Solar de ${heroDef.displayName}! Recupera +1 HP al jugar [${card.name}].`, true, actor.name);
        addFloatingText(actorId, "+1 HP SOLAR", "#4ade80");
        break;
      }
      case CardCategory.GUARDIAN: {
        setPlayers(prev => prev.map(p => {
          if (p.id !== actorId) return p;
          const currentBarrier = p.shieldBarrier || 0;
          return { ...p, shieldBarrier: currentBarrier + 1 };
        }));
        addLog(`🛡️ ¡Sinergia Guardián de ${heroDef.displayName}! Gana +1 Barrera de Escudo para absorber el siguiente golpe.`, true, actor.name);
        addFloatingText(actorId, "+1 BARRERA ESCUDO", "#60a5fa");
        break;
      }
      case CardCategory.KABOOM: {
        const opposingTeam = actor.teamId === 1 ? 2 : actor.teamId === 2 ? 1 : null;
        const target = (targetId ? players.find(p => p.id === targetId && !p.isEliminated && p.id !== actorId) : null) ||
                       players.find(p => !p.isEliminated && p.id !== actorId && (!opposingTeam || p.teamId === opposingTeam));
        if (target) {
          const coverageGuardian = findGladiacubonCovering(players, target.id, actorId);
          const damageRecipient = coverageGuardian || target;
          setPlayers(prev => prev.map(p => {
            if (p.id === actorId) {
              return { ...p, damageDealt: (p.damageDealt || 0) + 1 };
            }
            if (p.id !== damageRecipient.id) return p;
            const newHp = Math.max(0, p.hp - 1);
            return {
              ...p,
              hp: newHp,
              isEliminated: newHp <= 0,
              guardingAllyId: newHp <= 0 ? null : p.guardingAllyId
            };
          }));
          if (coverageGuardian) {
            addLog(`⚡ ¡Sinergia Kaboom! La cobertura de ${coverageGuardian.name} recibe el daño ineludible destinado a ${target.name}.`, true, coverageGuardian.name);
          } else {
            addLog(`⚡ ¡Sinergia Kaboom de ${heroDef.displayName}! Dispara una chispa explosiva de 1 daño a ${target.name}.`, true, actor.name);
          }
          addFloatingText(damageRecipient.id, "-1 DAÑO KABOOM", "#f97316");
          sound.playPunchHit();
        }
        break;
      }
      case CardCategory.CEREBRAL: {
        const getsAp = gameplayRandomInt(0, 1, 'card.tactics.extra-cubit') === 1;
        if (getsAp) {
          setPlayers(prev => prev.map(p => {
            if (p.id !== actorId) return p;
            return { ...p, actionPoints: p.actionPoints + 1 };
          }));
          addLog(`🧠 ¡Sinergia Cerebral de ${heroDef.displayName}! Reembolsa +1 Cúbit con ingenio táctico.`, true, actor.name);
          addFloatingText(actorId, "+1 CÚBIT CEREBRAL", "#c084fc");
        } else {
          if (actor.hand.length >= getMaxHandSize(actor)) {
            addLog("🧠 La Sinergia Cerebral de " + heroDef.displayName + " no encuentra espacio libre en la mano.", false, actor.name);
            break;
          }
          const drawResult = drawForPlayer(actor, deck, discardPile, "Sinergia Cerebral");
          if (drawResult.cards.length > 0) {
            setDeck(drawResult.newDeck);
            setDiscardPile([]);
            setPlayers(prev => prev.map(p => p.id === actorId ? {
              ...p,
              hand: [...p.hand, ...drawResult.cards],
              cardsDrawn: (p.cardsDrawn || 0) + drawResult.cards.length
            } : p));
            if (drawResult.choices.length > 0) {
              setTramcubosoCardChoices(prev => [...prev, ...drawResult.choices]);
            }
            triggerDeckAnimation();
            sound.playCardDraw();
            addLog("🧠 ¡Sinergia Cerebral de " + heroDef.displayName + "! Roba del Pila General.", true, actor.name);
            addFloatingText(actorId, "+1 CARTA CEREBRAL", "#c084fc");
          } else {
            addLog("La Sinergia Cerebral no pudo robar: no quedan cartas disponibles.", false, actor.name);
          }
        }
        break;
      }
      case CardCategory.FURTIVO: {
        addLog(`🥷 ¡Sinergia Furtiva de ${heroDef.displayName}! Despliega una cortina de sombras tácticas sobre los rivales.`, true, actor.name);
        addFloatingText(actorId, "¡SOMBRA FURTIVA!", "#22d3ee");
        break;
      }
    }
  };

  // Execute Attack
  const handleAttack = (
    targetId: number,
    isCubiculaAbility: boolean = false,
    secondaryTargetId?: number,
    diceOverride?: CombatDiceOverride,
    isCubogroAbility: boolean = false
  ) => {
    if (matchFinalizedRef.current) return;
    const attacker = currentTurnPlayer;
    if (!attacker || attacker.actionPoints <= 0 || attacker.isFrozen) return;
    const intendedTarget = players.find(p => p.id === targetId);
    if (!intendedTarget || intendedTarget.isEliminated || intendedTarget.hp <= 0 || intendedTarget.id === attacker.id) return;
    if (!isCubiculaAbility && !isCubogroAbility && secondaryTargetId === undefined && !diceOverride) recordPlayerAction('ATTACK', { targetId });
    if (attacker.cubinarcaOrder?.kind === 'ATTACK_TARGET' && attacker.cubinarcaOrder.attackTargetId !== intendedTarget.id) {
      addLog(`Discordia obliga a ${attacker.name} a atacar a ${players.find(player => player.id === attacker.cubinarcaOrder?.attackTargetId)?.name ?? 'su objetivo señalado'}.`);
      return;
    }

    // A live Gladiacubon covering this ally becomes the actual defender and rolls its own die.
    const coveringGladiacubon = findGladiacubonCovering(players, intendedTarget.id, attacker.id);
    const target = coveringGladiacubon || intendedTarget;
    const wasInterceptedByGladiacubon = Boolean(coveringGladiacubon);
    if (wasInterceptedByGladiacubon) {
      addLog(`¡Intercepción! ${coveringGladiacubon.name} intercepta el ataque dirigido a ${intendedTarget.name} y realizará la tirada de bloqueo con su propio dado.`, true, coveringGladiacubon.name);
      addFloatingText(coveringGladiacubon.id, `¡INTERCEPCIÓN POR ${intendedTarget.name.toUpperCase()}!`, "#60a5fa");
    }

    const secondaryTarget = secondaryTargetId === undefined
      ? null
      : players.find(p => p.id === secondaryTargetId) || null;
    const secondaryCoverGuardian = secondaryTarget
      ? findGladiacubonCovering(players, secondaryTarget.id, attacker.id)
      : null;
    const secondaryDamageRecipient = secondaryCoverGuardian || secondaryTarget;
    const secondarySharesPrimaryRecipient = Boolean(
      secondaryDamageRecipient && secondaryDamageRecipient.id === target.id
    );
    const attackerCombatWeapons = [...attacker.equippedWeapons, ...(attacker.borrowedEquipmentEffects || [])];
    const targetCombatWeapons = [...target.equippedWeapons, ...(target.borrowedEquipmentEffects || [])];
    const secondaryCombatWeapons = secondaryDamageRecipient
      ? [...secondaryDamageRecipient.equippedWeapons, ...(secondaryDamageRecipient.borrowedEquipmentEffects || [])]
      : [];

    // 1. Pre-calculate Attacker Roll
    const attackerHero = attacker.activeMorphCharacter || attacker.characterType;
    if (
      secondaryTargetId !== undefined &&
      (attackerHero !== CharacterType.DRACUBON ||
        !secondaryTarget ||
        secondaryTarget.id === intendedTarget.id ||
        secondaryTarget.id === target.id ||
        secondaryTarget.id === attacker.id ||
        secondaryTarget.isEliminated ||
        secondaryTarget.hp <= 0)
    ) return;
    const opposingTeamId = attacker.teamId === 1 ? 2 : attacker.teamId === 2 ? 1 : null;
    if (secondaryTarget && opposingTeamId !== null && secondaryTarget.teamId !== opposingTeamId) return;
    const useDracubonBreath = attackerHero === CharacterType.DRACUBON && secondaryTarget !== null;
    if (attacker.cubinarcaOrder?.kind === 'ATTACK_TARGET') {
      setPlayers(prev => prev.map(player => player.id === attacker.id
        ? { ...player, cubinarcaOrder: null, blocksDisabledByOrder: false, cubinarcaOrderDefiedThisTurn: false }
        : player
      ));
    }
    const attackerRolls: number[] = diceOverride ? [...diceOverride.attackerRolls] : [];
    let attackerFinalVal: number;

    if (diceOverride) {
      attackerFinalVal = attackerHero === CharacterType.CUBINJA
        ? attackerRolls.reduce((sum, value) => sum + value, 0)
        : attackerHero === CharacterType.TRAMCUBOSO
        ? Math.max(...attackerRolls)
        : (attackerRolls[0] || 1);
    } else if (attackerHero === CharacterType.TRAMCUBOSO) {
      const r1 = gameplayRandomInt(1, 6, 'combat.attack.tramcuboso.first');
      const r2 = gameplayRandomInt(1, 6, 'combat.attack.tramcuboso.second');
      attackerRolls.push(r1, r2);
      attackerFinalVal = Math.max(r1, r2);
    } else if (attackerHero === CharacterType.CUBINJA) {
      const r1 = gameplayRandomInt(1, 6, 'combat.attack.cubinja.first');
      const r2 = gameplayRandomInt(1, 6, 'combat.attack.cubinja.second');
      attackerRolls.push(r1, r2);
      attackerFinalVal = r1 + r2;
    } else if (attackerHero === CharacterType.CUBOGRO) {
      const r = gameplayRandomInt(1, 6, 'combat.attack.cubogro');
      attackerRolls.push(r);
      attackerFinalVal = r;
    } else {
      const r = gameplayRandomInt(1, 6, 'combat.attack.standard');
      attackerRolls.push(r);
      attackerFinalVal = r;
    }

    // The special-face reward is resolved only after the optional reroll window;
    // replaced initial dice never grant rewards.
    
    // Attacker Weapon Modifiers
    let modifiedAttackDamage = isCubogroAbility
      ? Math.max(1, Math.floor(target.hp / 2))
      : attackerFinalVal;
    if (!isCubogroAbility && attackerCombatWeapons.some(w => w.id === 1) && modifiedAttackDamage >= 3) {
      modifiedAttackDamage += 1; // Bate de aluminio
    }
    if (!isCubogroAbility && attackerCombatWeapons.some(w => w.id === 6)) {
      modifiedAttackDamage += 2; // Puño de hierro
    }
    if (!isCubogroAbility && attackerCombatWeapons.some(w => w.id === 22)) {
      modifiedAttackDamage += 1; // Batería de coche
    }

    const flaucubistaBonus = attackerHero === CharacterType.FLAUCUBISTA_DESAFINADO
      ? (attacker.nextAttackBonus || 0)
      : 0;
    modifiedAttackDamage += flaucubistaBonus;
    if (flaucubistaBonus > 0) {
      addLog(`Acorde Violento añade +${flaucubistaBonus} al próximo ataque de ${attacker.name}.`);
    }

    // 2. Pre-calculate Defender Roll
    const defenderHero = target.activeMorphCharacter || target.characterType;
    const defenderRolls: number[] = [];
    let defenderFinalVal: number;
    let isPerfectBlock = false;
    let isCubinjaCardBlock = false;
    let dracubonReflectTriggered = false;

    // Avaricia suspende cualquier postura Truco que ya estuviera preparada.
    // Se conserva en el estado del jugador, pero no produce efectos mientras Cubinja esté activa.
    const defenderStances = target.isFrozen || isCubinjaHero(target) ? [] :
      [target.preparedStance, target.preparedStanceSecondary].filter((stance): stance is GameCard => Boolean(stance));
    const activeDefenderStance = defenderStances.find(stance => stance.id === 19) ||
      defenderStances.find(stance => stance.id === 17) || defenderStances[0] || null;
    const hasAutomaticPerfectBlock = activeDefenderStance?.id === 19; // El Esquive de Callejón
    const consumedPreparedActivables: GameCard[] = [];

    if (target.blocksDisabledByOrder) {
      defenderFinalVal = 0;
      defenderRolls.push(0);
      isPerfectBlock = false;
      addLog(`Discordia: ${target.name} no puede lanzar dado de bloqueo hasta obedecer la orden pendiente.`, true);
    } else if (hasAutomaticPerfectBlock) {
      defenderFinalVal = attackerFinalVal;
      defenderRolls.push(defenderFinalVal);
      isPerfectBlock = true;
      addLog(`¡${target.name} activa El Esquive de Callejón y consigue un Bloqueo Perfecto!`, true, target.name);
    } else if (target.isFrozen) {
      // Un defensor congelado no tira dado ni ejecuta reacciones defensivas.
      // El turno de ese jugador se consumirá al llegar su posición en el orden.
      defenderFinalVal = 0;
      isPerfectBlock = false;
    } else if (diceOverride) {
      defenderRolls.push(...diceOverride.defenderRolls);
      if (defenderHero === CharacterType.TRAMCUBOSO) {
        const matches = defenderRolls.filter(value => attackerRolls.includes(value));
        isPerfectBlock = matches.length > 0;
        defenderFinalVal = matches.length > 0 ? Math.max(...matches) : Math.max(...defenderRolls);
      } else {
        defenderFinalVal = defenderRolls[0] ?? 0;
        const matchedAttack = attackerRolls.includes(defenderFinalVal);
        if (defenderHero === CharacterType.CUBINJA) isCubinjaCardBlock = matchedAttack;
        else if (defenderHero === CharacterType.DRACUBON) dracubonReflectTriggered = matchedAttack;
        else isPerfectBlock = matchedAttack;
        if (isCubinjaCardBlock) addLog(`¡Arsenal Ilimitado! ${target.name} coincide en defensa: obtiene una carta, pero el daño no se bloquea ni se reduce.`, true, target.name);
      }
    } else if (defenderHero === CharacterType.CUBINJA) {
      const r = gameplayRandomInt(1, 6, 'combat.defense.cubinja');
      defenderRolls.push(r);
      defenderFinalVal = r;
      isCubinjaCardBlock = attackerRolls.includes(r);
      if (isCubinjaCardBlock) {
        addLog(`¡Avaricia! ${target.name} iguala el ataque con ${r}; la coincidencia no bloquea el daño y solo concede el robo de una carta.`, true, target.name);
      }
    } else if (defenderHero === CharacterType.TRAMCUBOSO) {
      const r1 = gameplayRandomInt(1, 6, 'combat.defense.tramcuboso.first');
      const r2 = gameplayRandomInt(1, 6, 'combat.defense.tramcuboso.second');
      defenderRolls.push(r1, r2);
      isPerfectBlock =
        attackerRolls.includes(r1) ||
        attackerRolls.includes(r2);
      defenderFinalVal = isPerfectBlock
        ? Math.max(...[r1, r2].filter(value => attackerRolls.includes(value)))
        : Math.max(r1, r2);
    } else {
      const r = gameplayRandomInt(1, 6, 'combat.defense.standard');
      defenderRolls.push(r);
      defenderFinalVal = r;
      const matchedAttack = attackerRolls.includes(r);
      if (defenderHero === CharacterType.DRACUBON) {
        // Dracubon has no normal perfect block: a matching die reflects damage instead.
        dracubonReflectTriggered = matchedAttack;
        isPerfectBlock = false;
      } else {
        isPerfectBlock = matchedAttack;
      }
    }

    const tramcubosoCandidate =
      attackerHero === CharacterType.TRAMCUBOSO &&
      attacker.actionPoints > 1 &&
      attacker.abilityCooldownRemaining === 0 &&
      !attacker.isFrozen
        ? attacker
        : defenderHero === CharacterType.TRAMCUBOSO &&
          defenderRolls.some(value => value > 0) &&
          target.actionPoints > 0 &&
          target.abilityCooldownRemaining === 0 &&
          !target.isFrozen
        ? target
        : null;

    if (!diceOverride?.skipTramcubosoPrompt && tramcubosoCandidate) {
      if (tramcubosoCandidate.isBot) {
        const botIsAttacker = tramcubosoCandidate.id === attacker.id;
        const attackPeak = Math.max(...attackerRolls);
        const botWantsReroll = botIsAttacker ? (isPerfectBlock || attackPeak < 6) : !isPerfectBlock;
        if (botWantsReroll) {
          const rollMany = (count: number) => Array.from({ length: count }, () => gameplayRandomInt(1, 6, 'combat.tramcuboso.automatic-reroll'));
          addLog("Revolución de la Mesa: " + tramcubosoCandidate.name + " decide relanzar automáticamente los dados del enfrentamiento.", true, tramcubosoCandidate.name);
          handleAttack(intendedTarget.id, isCubiculaAbility, secondaryTargetId, {
            attackerRolls: rollMany(attackerRolls.length),
            defenderRolls: rollMany(defenderRolls.length),
            skipTramcubosoPrompt: true,
            spentCubitPlayerId: tramcubosoCandidate.id
          }, isCubogroAbility);
          return;
        }
      } else {
        setPendingDiceReroll({
          tramcubosoId: tramcubosoCandidate.id,
          attackerId: attacker.id,
          defenderId: target.id,
          targetId: intendedTarget.id,
          secondaryTargetId,
          isCubiculaAbility,
          isCubogroAbility,
          attackerRolls: [...attackerRolls],
          defenderRolls: [...defenderRolls]
        });
        addLog("Revolución de la Mesa: " + tramcubosoCandidate.name + " puede conservar la tirada o pagar 1 Cúbit para relanzar todos los dados del enfrentamiento.", true, tramcubosoCandidate.name);
        return;
      }
    }

    const defenderShowsSix = shouldAwardDefenderSixReward({
      isFrozen: target.isFrozen,
      hasAutomaticPerfectBlock,
      blocksDisabledByOrder: Boolean(target.blocksDisabledByOrder),
      defenderRolls
    });

    if (wasInterceptedByGladiacubon) {
      if (isPerfectBlock) {
        addLog(`¡Cobertura cumplida! ${target.name} consiguió el Bloqueo Perfecto usando su propio dado y protegió a ${intendedTarget.name}. La cobertura queda liberada.`, true, target.name);
      } else {
        addLog(`La cobertura de ${target.name} sobre ${intendedTarget.name} continúa activa: aún debe conseguir un Bloqueo Perfecto para liberarla.`, false, target.name);
      }
    }

    // 3. Resolve Damage & Shield Barrier
    let finalDamage = isPerfectBlock ? 0 : modifiedAttackDamage;

    if (!isPerfectBlock && activeDefenderStance?.id === 17) { // La Cortina de Mugre (Vape)
      finalDamage = 0;
      addLog(`${target.name} se desvanece en su Humo de Vape preparado!`);
    }

    if (finalDamage === 1 && targetCombatWeapons.some(w => w.id === 4)) {
      finalDamage = 0;
      addLog(`La Chaqueta de Cuero de ${target.name} anuló el daño de 1.`);
    }

    if (defenderHero === CharacterType.GLADIACUBON && finalDamage >= 3) {
      finalDamage = Math.max(1, Math.floor(finalDamage / 2));
      addLog(`Gladiacubon mitiga el impacto a ${finalDamage} de daño.`);
    }

    // Shield Barrier absorbs damage
    let targetBarrierRemaining = target.shieldBarrier || 0;
    if (!isPerfectBlock && finalDamage > 0 && targetBarrierRemaining > 0) {
      const absorbed = Math.min(targetBarrierRemaining, finalDamage);
      targetBarrierRemaining -= absorbed;
      finalDamage -= absorbed;
      addLog(`🛡️ ¡La Barrera de Escudo de ${target.name} absorbió ${absorbed} de daño! (Quedan: ${targetBarrierRemaining})`);
      addFloatingText(target.id, `🛡️ -${absorbed} BARRERA`, "#60a5fa");
    }

    // Consume only the one-use defensive postures resolved by this attack.
    // A posture stored on Cubinja remains dormant and is not consumed while Avaricia is active.
    let updatedTargetStance = target.preparedStance;
    let updatedTargetSecondaryStance = target.preparedStanceSecondary ?? null;
    const primaryStanceWasUsed = Boolean(
      activeDefenderStance &&
      ((activeDefenderStance.id === 19 && isPerfectBlock) ||
        (activeDefenderStance.id === 17 && !isPerfectBlock))
    );
    if (activeDefenderStance && primaryStanceWasUsed) {
      if (target.preparedStance?.uid === activeDefenderStance.uid) updatedTargetStance = null;
      else if (target.preparedStanceSecondary?.uid === activeDefenderStance.uid) updatedTargetSecondaryStance = null;
      consumedPreparedActivables.push(activeDefenderStance);
    }

    // Aliento conserva una sola tirada defensiva compartida, pero el daño del
    // segundo objetivo también se redirige a su Gladiacubon si tiene cobertura.
    // Cuando ambos impactos llegan al mismo guardián, se consumen barrera y postura
    // de forma secuencial, sin aplicar dos veces una protección de un solo uso.
    let secondaryFinalDamage = 0;
    let secondaryBarrierRemaining = secondarySharesPrimaryRecipient
      ? targetBarrierRemaining
      : (secondaryDamageRecipient?.shieldBarrier || 0);
    let updatedSecondaryStance = secondarySharesPrimaryRecipient
      ? updatedTargetStance
      : (secondaryDamageRecipient?.preparedStance ?? null);
    let updatedSecondarySecondaryStance = secondarySharesPrimaryRecipient
      ? updatedTargetSecondaryStance
      : (secondaryDamageRecipient?.preparedStanceSecondary ?? null);
    const secondaryStances = secondaryDamageRecipient && !isCubinjaHero(secondaryDamageRecipient)
      ? [secondaryDamageRecipient.preparedStance, secondaryDamageRecipient.preparedStanceSecondary].filter((stance): stance is GameCard => Boolean(stance))
      : [];
    const activeSecondaryStance = secondaryStances.find(stance => stance.id === 19) ||
      secondaryStances.find(stance => stance.id === 17) || null;
    if (useDracubonBreath && secondaryTarget && secondaryDamageRecipient && !isPerfectBlock) {
      secondaryFinalDamage = modifiedAttackDamage;
      if (activeSecondaryStance?.id === 17 || activeSecondaryStance?.id === 19) {
        secondaryFinalDamage = 0;
        if (secondaryDamageRecipient.preparedStance?.uid === activeSecondaryStance.uid) updatedSecondaryStance = null;
        else if (secondaryDamageRecipient.preparedStanceSecondary?.uid === activeSecondaryStance.uid) updatedSecondarySecondaryStance = null;
        if (!consumedPreparedActivables.some(card => card.uid === activeSecondaryStance.uid)) {
          consumedPreparedActivables.push(activeSecondaryStance);
        }
        addLog("La postura activable de " + secondaryDamageRecipient.name + " anula el impacto secundario.", true);
      }
      if (secondaryFinalDamage === 1 && secondaryCombatWeapons.some(w => w.id === 4)) {
        secondaryFinalDamage = 0;
        addLog(`La Chaqueta de Cuero de ${secondaryDamageRecipient.name} anuló el daño de 1.`);
      }
      const secondaryHero = secondaryDamageRecipient.activeMorphCharacter || secondaryDamageRecipient.characterType;
      if (secondaryHero === CharacterType.GLADIACUBON && secondaryFinalDamage >= 3) {
        secondaryFinalDamage = Math.max(1, Math.floor(secondaryFinalDamage / 2));
        addLog(`Coraza de ${secondaryDamageRecipient.name} mitiga el impacto a ${secondaryFinalDamage} de daño.`);
      }
      if (secondaryFinalDamage > 0 && secondaryBarrierRemaining > 0) {
        const absorbed = Math.min(secondaryBarrierRemaining, secondaryFinalDamage);
        secondaryBarrierRemaining -= absorbed;
        secondaryFinalDamage -= absorbed;
        addLog(`🛡️ ¡La Barrera de Escudo de ${secondaryDamageRecipient.name} absorbió ${absorbed} de daño! (Quedan: ${secondaryBarrierRemaining})`);
        addFloatingText(secondaryDamageRecipient.id, `🛡️ -${absorbed} BARRERA`, "#60a5fa");
      }
      if (secondaryCoverGuardian) {
        addLog(`¡Intercepción! ${secondaryCoverGuardian.name} recibe el daño de Aliento dirigido a ${secondaryTarget.name}.`, true, secondaryCoverGuardian.name);
      }
    }

    // Shared reflection and life-steal resolution (Dracubon + Cubícula).
    let attackerBarrierRemaining = attacker.shieldBarrier || 0;
    let dracubonReflectedTaken = dracubonReflectTriggered ? finalDamage : 0;

    const cubiculaReflectRoll: number | null = null;
    const cubiculaReflectHeal = 0;
    const cubiculaReflectDamage = 0;

    let reflectedDamageTaken = dracubonReflectedTaken;
    // Coraza applies to every incoming damage instance, including reflected damage.
    if (attackerHero === CharacterType.GLADIACUBON && reflectedDamageTaken >= 3) {
      const damageBeforeCoraza = reflectedDamageTaken;
      reflectedDamageTaken = Math.max(1, Math.floor(reflectedDamageTaken / 2));
      addLog(
        `¡Coraza! Gladiacubon ${attacker.name} reduce el daño reflejado de ${damageBeforeCoraza} a ${reflectedDamageTaken}.`,
        true,
        attacker.name
      );
    }
    if (reflectedDamageTaken > 0 && attackerBarrierRemaining > 0) {
      const absorbed = Math.min(attackerBarrierRemaining, reflectedDamageTaken);
      attackerBarrierRemaining -= absorbed;
      reflectedDamageTaken -= absorbed;
      addLog(`La barrera de ${attacker.name} absorbe ${absorbed} del daño reflejado.`);
    }

    if (dracubonReflectTriggered && reflectedDamageTaken > 0) {
      addLog(`¡Escamas de Dracubon! ${target.name} devuelve ${reflectedDamageTaken} de daño a ${attacker.name}.`, true, target.name);
    }

    const cubiculaActualHpLoss = Math.min(target.hp, Math.max(0, finalDamage));
    const attackerLifeStealHeal = attackerHero === CharacterType.CUBICULA &&
      cubiculaActualHpLoss >= 1 && cubiculaActualHpLoss <= 3
      ? cubiculaActualHpLoss
      : 0;
    if (attackerLifeStealHeal > 0) {
      addLog(`¡Vampirismo! ${attacker.name} recupera ${attackerLifeStealHeal} HP por la pérdida real de vida causada.`, true, attacker.name);
    }

    const attackerNewHp = Math.min(
      attacker.maxHp,
      Math.max(0, attacker.hp - reflectedDamageTaken) + attackerLifeStealHeal
    );

    const dracubonTrueDamage = useDracubonBreath && attacker.nextBreathBonus ? 1 : 0;
    const primaryDamageTotal = finalDamage + dracubonTrueDamage;
    const secondaryDamageTotal = secondaryFinalDamage + dracubonTrueDamage;
    const damageAssignedToPrimaryRecipient = primaryDamageTotal +
      (secondarySharesPrimaryRecipient ? secondaryDamageTotal : 0);
    const oldHp = target.hp;
    const newHp = Math.max(0, oldHp - damageAssignedToPrimaryRecipient);
    const secondaryOldHp = secondaryDamageRecipient && !secondarySharesPrimaryRecipient
      ? secondaryDamageRecipient.hp
      : 0;
    const secondaryNewHp = secondaryDamageRecipient && !secondarySharesPrimaryRecipient
      ? Math.max(0, secondaryOldHp - secondaryDamageTotal)
      : 0;

    if (useDracubonBreath && secondaryTarget) {
      addLog(
        `¡ALIENTO! ${attacker.name} alcanza a ${target.name} y ${secondaryTarget.name} con una sola tirada. ${target.name} realiza el bloqueo por ambos${isPerfectBlock ? " y detiene el daño normal" : ""}.`,
        true,
        attacker.name
      );
      if (dracubonTrueDamage > 0) {
        addLog(`¡Llamarada Doble! El bono ineludible añade 1 de daño a cada rival.`, true, attacker.name);
      }
    }

    // =========================================================================
    // MULTI-STAGE CARTOON CLASH ANIMATION SEQUENCE
    // 1. RUSH TO CENTER OF TABLE (350ms)
    // 2. CARTOON FIGHT BRAWL DUST CLOUD + CARTOON SOUNDS (1250ms)
    // 3. REVEAL DICE RESULTS ON TABLE (1200ms)
    // 4. RESOLVE STATE & CLOSE
    // =========================================================================
    setIsRollingAnimation(true);
    sound.playDiceRoll();

    // Stage 1: Both dice rush to center table
    setActiveClash({
      attackerId: attacker.id,
      defenderId: target.id,
      attackerHero,
      defenderHero,
      attackerTeamId: attacker.teamId,
      defenderTeamId: target.teamId,
      attackerName: attacker.name,
      defenderName: useDracubonBreath ? `${target.name} (bloquea por ambos)` : target.name,
      attackerRolls,
      attackerFinalVal,
      defenderRolls,
      defenderFinalVal,
      isPerfectBlock,
      damageDealt: damageAssignedToPrimaryRecipient,
      phase: 'RUSH_TO_CENTER'
    });

    // Stage 1 -> 2: Collision into Fight Dust Cloud
    setTimeout(() => {
      setActiveClash(prev => prev ? { ...prev, phase: 'BRAWL_CLOUD' } : null);
      sound.playCartoonFightBrawl();

      // Stage 2 -> 3: Cloud poofs away, revealing dice on table
      setTimeout(() => {
        setActiveClash(prev => prev ? { ...prev, phase: 'REVEAL_DICE' } : null);

        // Sound & Floating combat text
        if (isPerfectBlock) {
          sound.playPerfectBlock();
          addFloatingText(target.id, "¡SUPER-BLOQUEO HEROICO!", "#00e5ff");
        } else if (damageAssignedToPrimaryRecipient > 0) {
          sound.playPunchHit();
          const primaryCoverageLabel = wasInterceptedByGladiacubon ||
            (secondarySharesPrimaryRecipient && Boolean(secondaryCoverGuardian))
            ? " · COBERTURA"
            : "";
          addFloatingText(target.id, `-${damageAssignedToPrimaryRecipient} HP${primaryCoverageLabel}`, primaryCoverageLabel ? "#60a5fa" : "#ff1744");
        } else {
          sound.playCartoonBoing(260);
          addFloatingText(target.id, "¡EVADIDO!", "#7c4dff");
        }
        if (useDracubonBreath && secondaryTarget && secondaryDamageRecipient && !secondarySharesPrimaryRecipient) {
          addFloatingText(
            secondaryDamageRecipient.id,
            secondaryDamageTotal > 0
              ? `-${secondaryDamageTotal} HP${secondaryCoverGuardian ? " · COBERTURA" : " ALIENTO"}`
              : `¡BLOQUEADO POR ${target.name}!`,
            secondaryDamageTotal > 0
              ? (secondaryCoverGuardian ? "#60a5fa" : "#ff1744")
              : "#7c4dff"
          );
        }
        if (dracubonReflectTriggered) {
          addFloatingText(target.id, "¡ESCAMAS: REFLEJO!", "#fb923c");
          if (dracubonReflectedTaken > 0) {
            addFloatingText(attacker.id, `-${dracubonReflectedTaken} REFLEJADO`, "#ef4444");
          }
        }
        if (attackerLifeStealHeal > 0) {
          addFloatingText(attacker.id, `+${attackerLifeStealHeal} HP FESTÍN`, "#f472b6");
        }
        if (cubiculaReflectRoll !== null) {
          addFloatingText(target.id, `+${cubiculaReflectHeal} HP REFLEJO`, "#c084fc");
          if (reflectedDamageTaken > 0) {
            addFloatingText(attacker.id, `-${reflectedDamageTaken} REFLEJADO`, "#ef4444");
          }
        }

        // Stage 3 -> 4: Complete clash and commit state
        setTimeout(() => {
          setActiveClash(null);
          setIsRollingAnimation(false);

          setActiveDiceRoll({
            attackerRolls,
            attackerFinalVal,
            defenderRolls,
            defenderFinalVal,
            isPerfectBlock,
            isCubinjaCardBlock,
            damageDealt: damageAssignedToPrimaryRecipient,
            attackerName: attacker.name,
            defenderName: useDracubonBreath ? `${target.name} (bloquea por ambos)` : target.name
          });

          // Threshold check: multiples of 5 (20, 15, 10, 5)
          const multiplesOf5 = [20, 15, 10, 5];
          const crossedMultiples = [
            ...multiplesOf5.filter(m => oldHp >= m && newHp < m).map(m => `${m} HP (${target.name})`),
            ...(secondaryDamageRecipient && !secondarySharesPrimaryRecipient
              ? multiplesOf5.filter(m => secondaryOldHp >= m && secondaryNewHp < m).map(m => `${m} HP (${secondaryDamageRecipient.name})`)
              : [])
          ];

          let attackerCardsToAdd = 0;

          // Hurto Sigiloso: only steal after the primary defender actually loses HP.
          // Damage absorbed entirely by an external shield/barrier is not effective damage.
          let attackerCardsToSteal = 0;
          if (attackerHero === CharacterType.RACUBITERO && newHp < oldHp) {
            attackerCardsToSteal = attackerRolls.includes(5) ? 2 : 1;
          }

          // Desarme en Cadena: on a perfect block, steal up to two cards from
          // the attacker's hand and return every equipped weapon to the Pila General.
          // The remaining hand is preserved; there is no secondary global hand wipe.
          const isRacubiteroPerfectBlock =
            defenderHero === CharacterType.RACUBITERO && isPerfectBlock;
          const racubiteroStolenCards: GameCard[] = [];
          const racubiteroDiscardedCards: GameCard[] = [];
          let attackerHandAfterRacubitero = [...attacker.hand];
          let attackerWeaponsAfterRacubitero = [...attacker.equippedWeapons];

          if (isRacubiteroPerfectBlock) {
            const defenderFreeSlots = Math.max(0, getMaxHandSize(target) - target.hand.length);
            const cardsToPocket = Math.min(2, defenderFreeSlots, attackerHandAfterRacubitero.length);
            for (let i = 0; i < cardsToPocket; i++) {
              const randomIndex = gameplayRandomInt(0, attackerHandAfterRacubitero.length - 1, 'racubitero.pocket.random-card-index');
              const [card] = attackerHandAfterRacubitero.splice(randomIndex, 1);
              if (card) racubiteroStolenCards.push(card);
            }
            if (racubiteroStolenCards.length > 0) {
              addLog(`¡Desarme en Cadena! ${target.name} roba ${racubiteroStolenCards.length} carta(s) de la mano de ${attacker.name} y devuelve todas sus armas a la Pila General.`, true, target.name);
              addFloatingText(target.id, `+${racubiteroStolenCards.length} CARTA(S) HURTADA(S)`, "#f59e0b");
              sound.playCardDraw();
            } else {
              addLog(`Desarme en Cadena: ${attacker.name} no tenía cartas en la mano o Racubitero no tenía espacio.`, true, target.name);
            }
            racubiteroDiscardedCards.push(...attackerWeaponsAfterRacubitero);
            attackerWeaponsAfterRacubitero = [];
            if (racubiteroDiscardedCards.length > 0) {
              addLog(`Desarme en Cadena devuelve ${racubiteroDiscardedCards.length} arma(s) a la Pila General; la mano restante de ${attacker.name} se conserva.`, true, target.name);
            }
          }

          // Threshold rewards use the attacker's post-disarm inventory. A Racubitero
          // Perfect Block can empty the attacker's hand and equipment before this draw.
          const attackerHandLimitAfterRacubitero = getMaxHandSize({
            ...attacker,
            equippedWeapons: attackerWeaponsAfterRacubitero
          });
          const attackerFreeSlotsAfterRacubitero = Math.max(
            0,
            attackerHandLimitAfterRacubitero - attackerHandAfterRacubitero.length
          );
          if (
            crossedMultiples.length > 0 &&
            !attackerWeaponsAfterRacubitero.some(w => w.id === 6)
          ) {
            attackerCardsToAdd = Math.min(crossedMultiples.length, attackerFreeSlotsAfterRacubitero);
          }
          if (attackerCardsToAdd > 0) {
            triggerDeckAnimation();
            sound.playCardDraw();
            addLog(
              `¡Umbral de vida quebrado! ${attacker.name} cruzó múltiplos de 5 de ${target.name}${secondaryDamageRecipient && !secondarySharesPrimaryRecipient ? ` y ${secondaryDamageRecipient.name}` : ""} (umbrales: ${crossedMultiples.join(', ')}) y roba ${attackerCardsToAdd} carta(s) del Pila General.`,
              true
            );
            addFloatingText(attacker.id, `+${attackerCardsToAdd} CARTA MAZO`, "#ffd600");
          }

          // Super-Bloqueo Heroico / Bloqueo Perfecto rewards for defender:
          let defenderCardsToAdd = 0;
          let defenderHpHeal = 0;
          if (isCubinjaCardBlock) {
            defenderCardsToAdd = target.hand.length < getMaxHandSize(target) ? 1 : 0;
            if (defenderCardsToAdd > 0) {
              triggerDeckAnimation();
              sound.playCardDraw();
            }
            addLog(
              defenderCardsToAdd > 0
                ? `Avaricia: ${target.name} roba 1 carta por coincidir en defensa; la coincidencia no reduce el daño, aunque las protecciones externas siguen aplicando.`
                : `Avaricia: ${target.name} iguala el ataque, pero su mano está llena; recibe el daño y no roba carta.`,
              true,
              target.name
            );
          } else if (isPerfectBlock) {
            const defenderHandAfterVaciado = target.hand.length + racubiteroStolenCards.length;
            const defenderFreeSlotsAfterVaciado = Math.max(
              0,
              getMaxHandSize(target) - defenderHandAfterVaciado
            );
            const standardPerfectBlockDraw = Math.min(2, defenderFreeSlotsAfterVaciado);
            defenderCardsToAdd = standardPerfectBlockDraw;
            defenderHpHeal = 2; // Recuperación heroica por Super-Bloqueo
            if (defenderCardsToAdd > 0) {
              triggerDeckAnimation();
              sound.playCardDraw();
            }
            const targetHeroDef = CHARACTERS[defenderHero];
            if (targetCombatWeapons.some(w => w.id === 2)) {
              defenderHpHeal += 1;
              addLog(`${target.name} cura +1 HP extra con su Tapa de Alcantarilla al bloquear.`);
            }
            addLog(
              `🛡️⚡ ¡¡SUPER-BLOQUEO HEROICO!! ${target.name} igualó el número del atacante (${defenderFinalVal})! Anula el 100% del daño y desata su Superpoder [${targetHeroDef.signatureSuperpowerName}]: ${targetHeroDef.signatureSuperpowerDesc}! Recupera +${defenderHpHeal} HP${defenderCardsToAdd > 0
                ? ` y puede robar hasta ${defenderCardsToAdd} carta(s) del Pila General.`
                : getMaxHandSize(target) === 0
                ? '. Piel de Piedra impide robar cartas.'
                : ', pero no tiene espacio en la mano para robar.'}`,
              true
            );
            narrator.narrateSuperBlock(target.name, defenderFinalVal, targetHeroDef.signatureSuperpowerName);
            if (defenderHero === CharacterType.DRACUBON) {
              addLog(`¡Llamarada Doble preparada! El próximo Aliento de ${target.name} hará 1 de daño ineludible a ambos objetivos.`, true, target.name);
            }
          } else if (damageAssignedToPrimaryRecipient > 0) {
            narrator.narrateAttack(attacker.name, target.name, damageAssignedToPrimaryRecipient, attackerFinalVal);
          }

          // Resolve card rewards outside the React state updater to keep deck mutations deterministic.
          let currentDeckState = gameplayShuffle([...deck, ...racubiteroDiscardedCards], 'deck.racubitero.reorganize');
          recordReplayEvent('DECK_SHUFFLED', { purpose: 'deck.racubitero.reorganize', cardOrder: currentDeckState.map(card => ({ id: card.id, uid: card.uid })) });
          let currentDiscardState: GameCard[] = [];
          const prepareCombatDraws = (player: PlayerState, count: number, source: string) => {
            const cards: GameCard[] = [];
            const choices: TramcubosoCardChoice[] = [];
            let simulatedPlayer = player;
            for (let i = 0; i < count && simulatedPlayer.hand.length < getMaxHandSize(simulatedPlayer); i++) {
              const result = drawForPlayer(simulatedPlayer, currentDeckState, currentDiscardState, source);
              currentDeckState = result.newDeck;
              currentDiscardState = result.newDiscard;
              if (result.cards.length === 0) break;
              cards.push(...result.cards);
              choices.push(...result.choices);
              simulatedPlayer = { ...simulatedPlayer, hand: [...simulatedPlayer.hand, ...result.cards] };
            }
            return { cards, choices, drawnCount: cards.length };
          };
          // Transfer cards first, then calculate ordinary deck rewards against the updated hand sizes.
          const attackerFreeSlots = Math.max(0, getMaxHandSize(attacker) - attacker.hand.length);
          const stealCount = Math.min(attackerCardsToSteal, attackerFreeSlots, target.hand.length);
          const targetHandAfterTheft = [...target.hand];
          const stolenCards: GameCard[] = [];

          for (let i = 0; i < stealCount; i++) {
            const randomIndex = gameplayRandomInt(0, targetHandAfterTheft.length - 1, 'weapon.theft.random-card-index');
            const [stolenCard] = targetHandAfterTheft.splice(randomIndex, 1);
            if (stolenCard) stolenCards.push(stolenCard);
          }

          if (stolenCards.length > 0) {
            triggerDeckAnimation();
            sound.playCardDraw();
            addLog(
              `¡Hurto Sigiloso! ${attacker.name} transfiere ${stolenCards.length} carta(s) de la mano de ${target.name}${attackerRolls.includes(5) ? " tras obtener un 5 natural" : " por infligir daño efectivo"}.`,
              true,
              attacker.name
            );
            addFloatingText(attacker.id, `+${stolenCards.length} CARTA(S) HURTADA(S)`, "#f59e0b");
          } else if (attackerCardsToSteal > 0) {
            const reason = attackerFreeSlots <= 0
              ? "su mano está llena"
              : "el rival no tiene cartas disponibles";
            addLog(`Hurto Sigiloso no transfiere cartas: ${reason}.`, true, attacker.name);
          }

          const attackerWithStolenCards: PlayerState = {
            ...attacker,
            hand: [...attackerHandAfterRacubitero, ...stolenCards],
            equippedWeapons: attackerWeaponsAfterRacubitero
          };
          const defenderAfterTheft: PlayerState = {
            ...target,
            hand: [...targetHandAfterTheft, ...racubiteroStolenCards]
          };
          const attackerDrawSource = crossedMultiples.length > 0 ? "Umbral de vida" : "Recompensa de combate";
          const attackerDrawResult = prepareCombatDraws(attackerWithStolenCards, attackerCardsToAdd, attackerDrawSource);
          const defenderDrawResult = prepareCombatDraws(defenderAfterTheft, defenderCardsToAdd, "Bloqueo Perfecto");

          setPlayers(prevPlayers =>
            prevPlayers.map(p => {
              if (p.id === attacker.id) {
                const newHand = [
                  ...attackerHandAfterRacubitero,
                  ...stolenCards,
                  ...attackerDrawResult.cards
                ];
                const fulfilledAttackOrder = p.cubinarcaOrder?.kind === 'ATTACK_TARGET' && p.cubinarcaOrder.attackTargetId === target.id;
                return {
                  ...p,
                  hp: attackerNewHp,
                  isEliminated: attackerNewHp <= 0,
                  cubinarcaOrder: fulfilledAttackOrder ? null : p.cubinarcaOrder,
                  blocksDisabledByOrder: fulfilledAttackOrder ? false : p.blocksDisabledByOrder,
                  shieldBarrier: attackerBarrierRemaining,
                  actionPoints: Math.max(0, p.actionPoints - 1 - (diceOverride?.spentCubitPlayerId === p.id ? 1 : 0)),
                  abilityCooldownRemaining: diceOverride?.spentCubitPlayerId === p.id ? 2 : p.abilityCooldownRemaining,
                  cubogroAbilityCharges: attackerHero === CharacterType.CUBOGRO
                    ? Math.min(2, Math.max(0, (p.cubogroAbilityCharges ?? 1) - (isCubogroAbility ? 1 : 0) + (!isCubogroAbility && attackerRolls.includes(6) ? 1 : 0)))
                    : p.cubogroAbilityCharges,
                  hand: newHand,
                  equippedWeapons: attackerWeaponsAfterRacubitero,
                  damageDealt: (p.damageDealt || 0) + primaryDamageTotal + secondaryDamageTotal,
                  nextBreathBonus: useDracubonBreath && p.nextBreathBonus ? false : p.nextBreathBonus,
                  cardsDrawn: (p.cardsDrawn || 0) + attackerDrawResult.drawnCount,
                  nextAttackBonus: attackerHero === CharacterType.FLAUCUBISTA_DESAFINADO && flaucubistaBonus > 0
                    ? 0
                    : p.nextAttackBonus
                };
              } else if (p.id === target.id) {
                const newHand = [
                  ...p.hand.filter(card => !stolenCards.includes(card)),
                  ...racubiteroStolenCards,
                  ...defenderDrawResult.cards
                ];
                return {
                  ...p,
                  hp: Math.min(p.maxHp, newHp + defenderHpHeal + cubiculaReflectHeal),
                  actionPoints: diceOverride?.spentCubitPlayerId === p.id ? Math.max(0, p.actionPoints - 1) : p.actionPoints,
                  abilityCooldownRemaining: diceOverride?.spentCubitPlayerId === p.id ? 2 : p.abilityCooldownRemaining,
                  cubogroAbilityCharges: defenderHero === CharacterType.CUBOGRO
                    ? Math.min(2, Math.max(0, (p.cubogroAbilityCharges ?? 1) + ((isPerfectBlock || defenderRolls.includes(6)) ? 1 : 0)))
                    : p.cubogroAbilityCharges,
                  damageDealt: (p.damageDealt || 0) + reflectedDamageTaken,
                  nextAttackBonus: defenderHero === CharacterType.FLAUCUBISTA_DESAFINADO && primaryDamageTotal > 0
                    ? (p.nextAttackBonus || 0) + 1
                    : p.nextAttackBonus,
                  nextBreathBonus: defenderHero === CharacterType.DRACUBON && isPerfectBlock
                    ? true
                    : p.nextBreathBonus,
                  hand: newHand,
                  preparedStance: updatedTargetStance,
                  preparedStanceSecondary: updatedTargetSecondaryStance,
                  shieldBarrier: secondarySharesPrimaryRecipient ? secondaryBarrierRemaining : targetBarrierRemaining,
                  guardingAllyId: (
                    wasInterceptedByGladiacubon ||
                    (secondarySharesPrimaryRecipient && Boolean(secondaryCoverGuardian))
                  ) && (isPerfectBlock || newHp <= 0)
                    ? null
                    : p.guardingAllyId,
                  isEliminated: newHp <= 0,
                  perfectBlocks: (p.perfectBlocks || 0) + (isPerfectBlock || isCubinjaCardBlock ? 1 : 0),
                  cardsDrawn: (p.cardsDrawn || 0) + defenderDrawResult.drawnCount
                };
              } else if (
                secondaryDamageRecipient &&
                !secondarySharesPrimaryRecipient &&
                p.id === secondaryDamageRecipient.id
              ) {
                const secondaryHero = secondaryDamageRecipient.activeMorphCharacter || secondaryDamageRecipient.characterType;
                return {
                  ...p,
                  hp: secondaryNewHp,
                  isEliminated: secondaryNewHp <= 0,
                  shieldBarrier: secondaryBarrierRemaining,
                  preparedStance: updatedSecondaryStance,
                  preparedStanceSecondary: updatedSecondarySecondaryStance,
                  guardingAllyId: secondaryCoverGuardian && secondaryNewHp <= 0 ? null : p.guardingAllyId,
                  nextAttackBonus: secondaryHero === CharacterType.FLAUCUBISTA_DESAFINADO && secondaryDamageTotal > 0
                    ? (p.nextAttackBonus || 0) + 1
                    : p.nextAttackBonus
                };
              }
              return p;
            })
          );

          if (defenderShowsSix) {
            setTimeout(() => {
              const latestDefender = playersRef.current.find(player => player.id === target.id);
              if (!latestDefender) return;
              if (latestDefender.isBot) {
                const canDrawCard = latestDefender.hand.length < getMaxHandSize(latestDefender) && deckRef.current.length > 0;
                handleApplySixChoice(latestDefender.id, canDrawCard ? 'CARD' : 'EXTRA_TURN');
              } else {
                setSpecialSixChoice({
                  playerId: latestDefender.id,
                  actorName: latestDefender.name,
                  isAttacker: false
                });
              }
            }, 60);
          }

          const alientoDamageTotal = primaryDamageTotal + secondaryDamageTotal;
          if (!replayPlaybackActiveRef.current && !attacker.isBot && alientoDamageTotal > 0) {
            dailyMissionsManager.recordDamage(alientoDamageTotal);
          }
          if (!replayPlaybackActiveRef.current && (isPerfectBlock || isCubinjaCardBlock)) {
            dailyMissionsManager.recordPerfectBlock();
          }

          const shuffledCombatDeck = gameplayShuffle([...currentDeckState, ...currentDiscardState], 'deck.combat-resolution.shuffle');
          setDeck(shuffledCombatDeck);
          deckRef.current = shuffledCombatDeck;
          recordReplayEvent('DECK_SHUFFLED', { purpose: 'deck.combat-resolution.shuffle', cardOrder: shuffledCombatDeck.map(card => ({ id: card.id, uid: card.uid })) });
          setDiscardPile([]);
          if (consumedPreparedActivables.length > 0) returnCardsToGlobalPile(consumedPreparedActivables);
          const combatChoices = [...attackerDrawResult.choices, ...defenderDrawResult.choices];
          if (combatChoices.length > 0) {
            setTramcubosoCardChoices(prev => [...prev, ...combatChoices]);
          }

          if (attackerNewHp <= 0 && !attacker.isEliminated) {
            sound.playElimination();
            addLog(`¡K.O.! ${attacker.name} cayó por el daño devuelto por ${dracubonReflectTriggered ? "las Escamas de Dracubon" : "el Reflejo de Noche de Cubícula"}.`, true);
            narrator.narrateElimination(attacker.name);
          }

          if (
            secondaryDamageRecipient &&
            !secondarySharesPrimaryRecipient &&
            secondaryNewHp <= 0
          ) {
            sound.playElimination();
            addLog(`¡K.O.! ${secondaryDamageRecipient.name} ha sido eliminado por el segundo impacto de Aliento.`, true);
            narrator.narrateElimination(secondaryDamageRecipient.name);
          }

          if (newHp <= 0) {
            sound.playElimination();
            addLog(`¡K.O.! ${target.name} ha sido eliminado de la arena!`, true);
            narrator.narrateElimination(target.name);

            setTimeout(() => {
              setPlayers(currPlayers => {
                const opposingTeam = attacker.teamId === 1 ? 2 : attacker.teamId === 2 ? 1 : null;
                const liveEnemies = currPlayers.filter(
                  p => !p.isEliminated && p.hp > 0 && p.id !== attacker.id && (!opposingTeam || p.teamId === opposingTeam)
                );
                if (liveEnemies.length > 0) {
                  const bestTarget = liveEnemies.reduce((prev, curr) => (curr.hp < prev.hp ? curr : prev));
                  setSelectedTargetId(bestTarget.id);
                } else {
                  setSelectedTargetId(null);
                }
                checkVictory(currPlayers);
                return currPlayers;
              });
            }, 100);
          }

          // Perfect Block immediate Reaction Window
          if (isPerfectBlock) {
            setTimeout(() => {
              setPlayers(latestPlayers => {
                const defender = latestPlayers.find(p => p.id === target.id);
                if (
                  !defender || defender.isEliminated || defender.hand.length === 0 ||
                  getMaxHandSize(defender) === 0
                ) return latestPlayers;

                if (!defender.isBot) {
                  setReactionPlayer(defender);
                  return latestPlayers;
                } else {
                  const weapon = defender.hand.find(c => c.type === CardType.WEAPON);
                  const stance = isCubinjaHero(defender)
                    ? undefined
                    : defender.hand.find(c => c.type === CardType.TRICK && c.timing === TrickTiming.PREPARED_STANCE);
                  const maxSlots = getMaxWeaponSlots(defender);

                  if (weapon && maxSlots > 0 && defender.equippedWeapons.length < maxSlots) {
                    sound.playCardDraw();
                    addLog(`¡Reacción! ${defender.name} aprovecha su Bloqueo Perfecto y equipa [${weapon.name}] de inmediato!`, true);
                    return latestPlayers.map(p => p.id === defender.id ? {
                      ...p,
                      hand: p.hand.filter(c => c.id !== weapon.id),
                      equippedWeapons: [...p.equippedWeapons, weapon]
                    } : p);
                  } else if (stance && [defender.preparedStance, defender.preparedStanceSecondary].filter(Boolean).length < getMaxPreparedStanceSlots(defender)) {
                    sound.playStanceActivate();
                    const useSecondary = Boolean(defender.preparedStance);
                    addLog("¡Reacción! " + defender.name + " prepara [" + stance.name + "] en un espacio activable.", true);
                    return latestPlayers.map(p => p.id === defender.id ? {
                      ...p,
                      hand: p.hand.filter(c => c.id !== stance.id),
                      preparedStance: useSecondary ? p.preparedStance : stance,
                      preparedStanceSecondary: useSecondary ? stance : p.preparedStanceSecondary
                    } : p);
                  }
                  return latestPlayers;
                }
              });
            }, 350 * speedMultiplier);
          }

          // Cubinarca dicta una orden tras infligir daño efectivo o conseguir un Bloqueo Perfecto.
          if (attackerHero === CharacterType.CUBINARCA && finalDamage > 0 && newHp > 0) {
            openCubinarcaOrder(attacker, target);
          } else if (defenderHero === CharacterType.CUBINARCA && isPerfectBlock && attackerNewHp > 0) {
            openCubinarcaOrder(target, attacker);
          }

          // Check match victory
          setTimeout(() => {
            checkVictory();
          }, 300);
        }, 1400 * speedMultiplier);
      }, 1350 * speedMultiplier);
    }, 450 * speedMultiplier);
  };

  const resolveTramcubosoReroll = (shouldReroll: boolean) => {
    const pending = pendingDiceReroll;
    if (!pending) return;
    recordPlayerAction('TRAMCUBOSO_REROLL_CHOICE', { shouldReroll, targetId: pending.targetId });
    const tramcuboso = players.find(player => player.id === pending.tramcubosoId);
    if (!tramcuboso) { setPendingDiceReroll(null); return; }
    if (shouldReroll && (tramcuboso.actionPoints <= 0 || tramcuboso.abilityCooldownRemaining > 0 || tramcuboso.isFrozen)) return;
    const rollMany = (count: number) => Array.from({ length: count }, () => gameplayRandomInt(1, 6, 'combat.tramcuboso.player-reroll'));
    const attackerRolls = shouldReroll ? rollMany(pending.attackerRolls.length) : pending.attackerRolls;
    const defenderRolls = shouldReroll ? rollMany(pending.defenderRolls.length) : pending.defenderRolls;
    setPendingDiceReroll(null);
    addLog(shouldReroll
      ? `¡Revolución de la Mesa! ${tramcuboso.name} reemplaza todos los dados iniciales. La nueva tirada será definitiva.`
      : `${tramcuboso.name} conserva los resultados iniciales.`, true, tramcuboso.name);
    handleAttack(pending.targetId, pending.isCubiculaAbility, pending.secondaryTargetId, {
      attackerRolls,
      defenderRolls,
      skipTramcubosoPrompt: true,
      spentCubitPlayerId: shouldReroll ? tramcuboso.id : undefined
    }, pending.isCubogroAbility);
  };

  // Reaction handlers for Perfect Block
  const handleEquipReaction = (cardId: number, cardUid?: string) => {
    if (!reactionPlayer || getMaxHandSize(reactionPlayer) === 0) return;
    const card = reactionPlayer.hand.find(c => c.id === cardId && c.type === CardType.WEAPON && (!cardUid || c.uid === cardUid));
    if (!card) return;
    recordPlayerAction('PERFECT_BLOCK_EQUIP_WEAPON', { playerId: reactionPlayer.id, cardUid: card.uid, cardId });
    sound.playCardDraw();
    const newHand = reactionPlayer.hand.filter(c => c.id !== cardId);
    const newWeapons = [...reactionPlayer.equippedWeapons];
    const maxSlots = getMaxWeaponSlots(reactionPlayer);
    if (maxSlots === 0) return;

    let discarded: GameCard | null = null;
    if (newWeapons.length >= maxSlots) {
      discarded = newWeapons.shift() || null;
    }
    newWeapons.push(card);
    if (discarded) returnCardsToGlobalPile([discarded!]);

    setPlayers(prev =>
      prev.map(p =>
        p.id === reactionPlayer.id
          ? { ...p, hand: newHand, equippedWeapons: newWeapons }
          : p
      )
    );
    addLog(`¡Reacción! ${reactionPlayer.name} equipó [${card.name}] inmediatamente tras su Bloqueo Perfecto!`, true);
    applyCardClassSynergy(reactionPlayer.id, card);
    setReactionPlayer(null);
  };

  const handleActivateReaction = (cardId: number, cardUid?: string) => {
    if (!reactionPlayer || getMaxHandSize(reactionPlayer) === 0 || isCubinjaHero(reactionPlayer)) return;
    const card = reactionPlayer.hand.find(
      c => c.id === cardId && c.type === CardType.TRICK && c.timing === TrickTiming.RITUAL_ACTION && (!cardUid || c.uid === cardUid) && (!cardUid || c.uid === cardUid)
    );
    if (!card) return;
    recordPlayerAction('PERFECT_BLOCK_PLAY_TRICK', { playerId: reactionPlayer.id, cardUid: card.uid, cardId });
    sound.playCardDraw();
    const newHand = reactionPlayer.hand.filter(c => c.id !== cardId);
    returnCardsToGlobalPile([card]);

    let heal = 0;
    if (card.id === 33) heal = 3;
    if (card.id === 38) heal = 5;
    if (card.id === 49 && reactionPlayer.hp <= 5) heal = 4;

    setPlayers(prev =>
      prev.map(p =>
        p.id === reactionPlayer.id
          ? { ...p, hp: Math.min(p.maxHp, p.hp + heal), hand: newHand }
          : p
      )
    );
    addLog(`¡Reacción! ${reactionPlayer.name} activó el truco [${card.name}] tras su Bloqueo Perfecto!`, true);
    applyCardClassSynergy(reactionPlayer.id, card);
    setReactionPlayer(null);
  };

  const handlePrepareReaction = (cardId: number, cardUid?: string) => {
    if (!reactionPlayer || getMaxHandSize(reactionPlayer) === 0 || isCubinjaHero(reactionPlayer)) return;
    const card = reactionPlayer.hand.find(
      c => c.id === cardId && c.type === CardType.TRICK && c.timing === TrickTiming.PREPARED_STANCE && (!cardUid || c.uid === cardUid) && (!cardUid || c.uid === cardUid)
    );
    if (!card) return;
    recordPlayerAction('PERFECT_BLOCK_PREPARE_STANCE', { playerId: reactionPlayer.id, cardUid: card.uid, cardId });
    sound.playStanceActivate();
    const newHand = reactionPlayer.hand.filter(c => c.id !== cardId);
    const occupied = [reactionPlayer.preparedStance, reactionPlayer.preparedStanceSecondary].filter(Boolean);
    const limit = getMaxPreparedStanceSlots(reactionPlayer);
    const useSecondary = limit > 1 && Boolean(reactionPlayer.preparedStance) && occupied.length < limit;
    const replaced = occupied.length >= limit ? (reactionPlayer.preparedStanceSecondary || reactionPlayer.preparedStance) : null;
    if (replaced) returnCardsToGlobalPile([replaced]);
    setPlayers(prev => prev.map(p => p.id === reactionPlayer.id ? {
      ...p, hand: newHand,
      preparedStance: limit === 1 ? card : useSecondary ? p.preparedStance : p.preparedStance || card,
      preparedStanceSecondary: limit === 1 ? null : useSecondary ? card : replaced ? null : p.preparedStanceSecondary
    } : p));
    addLog(`¡Reacción! ${reactionPlayer.name} preparó la postura [${card.name}] tras su Bloqueo Perfecto!`, true);
    applyCardClassSynergy(reactionPlayer.id, card);
    setReactionPlayer(null);
  };

  const handleSkipReaction = () => {
    if (reactionPlayer) recordPlayerAction('SKIP_PERFECT_BLOCK_REACTION', { playerId: reactionPlayer.id });
    setReactionPlayer(null);
  };

  // Equip Weapon
  const handleEquipWeapon = (cardId: number, cardUid?: string) => {
    if (matchFinalizedRef.current) return;
    const attacker = currentTurnPlayer;
    if (!attacker || attacker.actionPoints <= 0 || getMaxHandSize(attacker) === 0) return;
    const card = attacker.hand.find(c => c.id === cardId && c.type === CardType.WEAPON && (!cardUid || c.uid === cardUid));
    if (!card) return;
    recordPlayerAction('EQUIP_WEAPON', { cardId, cardUid: card.uid });

    sound.playCardDraw();
    const isFreeAction = card.id === 25; // Navaja Suiza
    const newHand = attacker.hand.filter(c => c.id !== cardId);
    const newWeapons = [...attacker.equippedWeapons];

    const maxSlots = getMaxWeaponSlots(attacker);
    if (maxSlots === 0) return;

    let discarded: GameCard | null = null;
    if (newWeapons.length >= maxSlots) {
      discarded = newWeapons.shift() || null;
    }
    newWeapons.push(card);

    if (discarded) {
      returnCardsToGlobalPile([discarded!]);
    }

    setPlayers(prev =>
      prev.map(p =>
        p.id === attacker.id
          ? {
              ...p,
              actionPoints: isFreeAction ? p.actionPoints : Math.max(0, p.actionPoints - 1),
              hand: newHand,
              equippedWeapons: newWeapons
            }
          : p
      )
    );

    addLog(`${attacker.name} equipó el arma: [${card.name}]`);
    if (!replayPlaybackActiveRef.current && !attacker.isBot) dailyMissionsManager.recordCardPlayed();
    applyCardClassSynergy(attacker.id, card, selectedTargetId);
  };

  // Prepare Stance
  const handlePrepareStance = (cardId: number, cardUid?: string) => {
    if (matchFinalizedRef.current) return;
    const attacker = currentTurnPlayer;
    if (!attacker || attacker.actionPoints <= 0 || getMaxHandSize(attacker) === 0 || isCubinjaHero(attacker)) return;
    const card = attacker.hand.find(
      c => c.id === cardId && c.type === CardType.TRICK && c.timing === TrickTiming.PREPARED_STANCE
    );
    if (!card) return;
    recordPlayerAction('PREPARE_STANCE', { cardId, cardUid: card.uid });

    sound.playStanceActivate();
    const newHand = attacker.hand.filter(c => c.id !== cardId);

    const stanceLimit = getMaxPreparedStanceSlots(attacker);
    const occupiedStances = [attacker.preparedStance, attacker.preparedStanceSecondary].filter(Boolean);
    const useSecondaryStance = stanceLimit > 1 && Boolean(attacker.preparedStance) && occupiedStances.length < stanceLimit;
    const replacedStance = occupiedStances.length >= stanceLimit ? (attacker.preparedStanceSecondary || attacker.preparedStance) : null;
    if (replacedStance) returnCardsToGlobalPile([replacedStance]);
    setPlayers(prev => prev.map(p => p.id === attacker.id ? {
      ...p,
      actionPoints: Math.max(0, p.actionPoints - 1),
      hand: newHand,
      preparedStance: stanceLimit === 1 ? card : useSecondaryStance ? p.preparedStance : p.preparedStance || card,
      preparedStanceSecondary: stanceLimit === 1 ? null : useSecondaryStance ? card : replacedStance ? null : p.preparedStanceSecondary
    } : p));

    addLog(`${attacker.name} preparó la postura: [${card.name}]`, true);
    if (!replayPlaybackActiveRef.current && !attacker.isBot) dailyMissionsManager.recordCardPlayed();
    applyCardClassSynergy(attacker.id, card, selectedTargetId);
  };

  // Play Action Trick
  const handlePlayActionTrick = (cardId: number, targetId?: number, cardUid?: string) => {
    if (matchFinalizedRef.current) return;
    const attacker = currentTurnPlayer;
    if (!attacker || attacker.actionPoints <= 0 || getMaxHandSize(attacker) === 0 || isCubinjaHero(attacker)) return;
    const card = attacker.hand.find(
      c => c.id === cardId && c.type === CardType.TRICK && c.timing === TrickTiming.RITUAL_ACTION
    );
    if (!card) return;
    recordPlayerAction('PLAY_ACTION_TRICK', { cardId, cardUid: card.uid, targetId: targetId ?? null });

    sound.playCardDraw();
    if (!replayPlaybackActiveRef.current && !attacker.isBot) dailyMissionsManager.recordCardPlayed();
    const newHand = attacker.hand.filter(c => c.id !== cardId);
    returnCardsToGlobalPile([card]);

    let heal = 0;
    let extraAp = 0;
    if (card.id === 33) heal = 3; // Recarga de Adrenalina
    if (card.id === 38) heal = 5; // Botiquín Robado
    if (card.id === 41) extraAp = 1; // Café Alterado
    if (card.id === 49 && attacker.hp <= 5) heal = 4; // Bebida Energética

    setPlayers(prev =>
      prev.map(p =>
        p.id === attacker.id
          ? {
              ...p,
              hp: Math.min(p.maxHp, p.hp + heal),
              actionPoints: Math.max(0, p.actionPoints - 1 + extraAp),
              hand: newHand
            }
          : p
      )
    );

    addLog(`${attacker.name} activó el truco: [${card.name}]`);
    applyCardClassSynergy(attacker.id, card, targetId);
  };

  // Complete Hada al Cubo's card transfer after the human selects a card and ally.
  const handleConfirmSupplyMagic = (cardIndex: number, allyId: number) => {
    const offer = supplyMagicOffer;
    if (!offer || offer.cards.length !== 2 || cardIndex < 0 || cardIndex > 1) return;

    const actor = players.find(p => p.id === offer.actorId);
    const ally = players.find(p => p.id === allyId);
    const allyHero = ally?.activeMorphCharacter || ally?.characterType;
    if (
      !actor ||
      !ally ||
      actor.id === ally.id ||
      actor.teamId === undefined ||
      ally.teamId !== actor.teamId ||
      actor.isEliminated ||
      actor.hp <= 0 ||
      ally.isEliminated ||
      ally.hp <= 0 ||
      allyHero === CharacterType.CUBOGRO ||
      actor.hand.length >= getMaxHandSize(actor) ||
      ally.hand.length >= getMaxHandSize(ally)
    ) {
      return;
    }

    const giftedCard = offer.cards[cardIndex];
    const retainedCard = offer.cards[1 - cardIndex];
    recordPlayerAction('HADA_SUPPLY_TRANSFER', { actorId: actor.id, allyId: ally.id, giftedCardUid: giftedCard.uid, retainedCardUid: retainedCard.uid, cardIndex });
    setPlayers(prev => prev.map(p => {
      if (p.id === actor.id) return { ...p, hand: [...p.hand, retainedCard] };
      if (p.id === ally.id) return { ...p, hand: [...p.hand, giftedCard] };
      return p;
    }));
    setSupplyMagicOffer(null);
    addLog(`¡Suministro Mágico! ${actor.name} entregó [${giftedCard.name}] a ${ally.name} y conservó [${retainedCard.name}].`, true, actor.name);
    addFloatingText(actor.id, "+1 CARTA CONSERVADA", "#34d399");
    addFloatingText(ally.id, "+1 CARTA RECIBIDA", "#22d3ee");
    sound.playStanceActivate();
  };

  // Hero Ability
  const handleUseHeroAbility = (targetId?: number, extraOption?: number, cubiculaMode?: CubiculaMode) => {
    if (matchFinalizedRef.current) return;
    const actor = currentTurnPlayer;
    if (!actor || actor.abilityCooldownRemaining > 0) return;
    const hero = actor.activeMorphCharacter || actor.characterType;
    recordPlayerAction('HERO_ABILITY', { targetId: targetId ?? null, extraOption: extraOption ?? null, cubiculaMode: cubiculaMode ?? null, hero });

    if (hero === CharacterType.HADA_AL_CUBO) {
      const availableAllies = actor.teamId !== undefined
        ? players.filter(p => {
            const allyHero = p.activeMorphCharacter || p.characterType;
            return p.id !== actor.id &&
              p.teamId === actor.teamId &&
              !p.isEliminated &&
              p.hp > 0 &&
              allyHero !== CharacterType.CUBOGRO &&
              p.hand.length < getMaxHandSize(p);
          })
        : [];

      if (
        actor.actionPoints <= 0 ||
        actor.hand.length >= getMaxHandSize(actor) ||
        availableAllies.length === 0
      ) return;

      const firstDraw = drawCardFromDeck(deck, discardPile);
      if (!firstDraw.card) {
        addLog("Suministro Mágico no pudo activarse: el Pila General están vacíos.");
        return;
      }
      const secondDraw = drawCardFromDeck(firstDraw.newDeck, firstDraw.newDiscard);
      if (!secondDraw.card) {
        addLog("Suministro Mágico necesita dos cartas; no hay suficientes cartas disponibles.");
        return;
      }

      const drawnCards = [firstDraw.card, secondDraw.card];
      recordReplayEvent('CARD_OFFERED', { recipientId: actor.id, source: 'HADA_SUPPLY_MAGIC', cardUids: drawnCards.map(card => card.uid) });
      setDeck(secondDraw.newDeck);
      setDiscardPile([]);
      triggerDeckAnimation();
      sound.playCardDraw();

      if (actor.isBot) {
        const ally = gameplayRandomPick(availableAllies, 'hada.supply.random-ally');
        const giftIndex = gameplayRandomInt(0, drawnCards.length - 1, 'hada.supply.random-gift-index');
        const giftedCard = drawnCards[giftIndex];
        const retainedCard = drawnCards[1 - giftIndex];
        setPlayers(prev => prev.map(p => {
          if (p.id === actor.id) {
            return {
              ...p,
              actionPoints: Math.max(0, p.actionPoints - 1),
              hand: [...p.hand, retainedCard],
              cardsDrawn: (p.cardsDrawn || 0) + 2
            };
          }
          if (p.id === ally.id) return { ...p, hand: [...p.hand, giftedCard] };
          return p;
        }));
        addLog(`Suministro Mágico automático: ${actor.name} entregó [${giftedCard.name}] a ${ally.name} y conservó [${retainedCard.name}].`, true, actor.name);
        addFloatingText(actor.id, "+1 CARTA", "#34d399");
        addFloatingText(ally.id, "+1 CARTA RECIBIDA", "#22d3ee");
      } else {
        setPlayers(prev => prev.map(p => p.id === actor.id
          ? {
              ...p,
              actionPoints: Math.max(0, p.actionPoints - 1),
              cardsDrawn: (p.cardsDrawn || 0) + 2
            }
          : p
        ));
        setSupplyMagicOffer({ actorId: actor.id, cards: drawnCards });
        addLog(`${actor.name} usó Suministro Mágico: robó dos cartas y debe entregar una a un compañero.`, true, actor.name);
      }
    } else if (hero === CharacterType.CUBITO_DE_HIELO) {
      const target = players.find(p => p.id === targetId && !p.isEliminated && p.id !== actor.id);
      if (!target) return;
      sound.playStanceActivate();
      setPlayers(prev =>
        prev.map(p => {
          if (p.id === actor.id) return { ...p, abilityCooldownRemaining: 2 };
          if (p.id === target.id) return { ...p, isFrozen: true };
          return p;
        })
      );
      addLog(`¡${actor.name} usó [Congelación Glacial] sobre ${target.name}! Pierde turno y bloqueos.`, true);
    } else if (hero === CharacterType.PIRATA) {
      const target = players.find(p => p.id === targetId && !p.isEliminated && p.id !== actor.id);
      if (!target) return;
      sound.playStanceActivate();
      setPlayers(prev =>
        prev.map(p => {
          if (p.id === actor.id) return { ...p, abilityCooldownRemaining: 3 };
          if (p.id === target.id) return { ...p, isFrozen: true };
          return p;
        })
      );
      addLog(`¡${actor.name} usó [Abordaje Cúbico] sobre ${target.name}! Anula su próximo turno.`, true);
    } else if (hero === CharacterType.GLADIACUBON) {
      const ally = players.find(p =>
        p.id === targetId &&
        p.id !== actor.id &&
        !p.isEliminated &&
        p.hp > 0 &&
        actor.teamId !== undefined &&
        p.teamId === actor.teamId &&
        !players.some(guardian => guardian.guardingAllyId === p.id)
      );
      if (
        !ally ||
        actor.actionPoints <= 0 ||
        actor.isFrozen ||
        actor.guardingAllyId != null ||
        (actor.interceptionAvailableRound || 0) > round
      ) return;

      sound.playStanceActivate();
      setPlayers(prev => prev.map(p => p.id === actor.id
        ? {
            ...p,
            actionPoints: Math.max(0, p.actionPoints - 1),
            guardingAllyId: ally.id,
            interceptionAvailableRound: round + 2
          }
        : p
      ));
      addLog(
        `¡Intercepción! ${actor.name} gasta 1 Cúbit y activa Cobertura sobre ${ally.name}. El siguiente ataque dirigido a ese aliado será interceptado con el dado de ${actor.name}; no podrá reactivar en la próxima ronda ni antes de consumir esta cobertura.`,
        true,
        actor.name
      );
      addFloatingText(actor.id, `CUBRIENDO A ${ally.name.toUpperCase()}`, "#60a5fa");
    } else if (hero === CharacterType.DRACUBON) {
      const blocker = players.find(p => p.id === targetId && !p.isEliminated && p.hp > 0 && p.id !== actor.id);
      const secondTarget = players.find(p => p.id === extraOption && !p.isEliminated && p.hp > 0 && p.id !== actor.id);
      const opposingTeamId = actor.teamId === 1 ? 2 : actor.teamId === 2 ? 1 : null;
      const validEnemy = (p: PlayerState | undefined): p is PlayerState => Boolean(
        p && !p.isEliminated && p.hp > 0 && p.id !== actor.id &&
        (opposingTeamId === null || p.teamId === opposingTeamId)
      );
      if (actor.actionPoints <= 0 || !validEnemy(blocker) || !validEnemy(secondTarget) || blocker.id === secondTarget.id) return;
      addLog(`¡${actor.name} activa [Aliento]! ${blocker.name} realizará una única tirada de bloqueo para proteger a ambos rivales.`, true, actor.name);
      handleAttack(blocker.id, false, secondTarget.id);
    } else if (hero === CharacterType.CUBOGRO) {
      const target = players.find(p => p.id === targetId && !p.isEliminated && p.hp > 0 && p.id !== actor.id &&
        (actor.teamId === undefined || p.teamId !== actor.teamId));
      if (!target || actor.actionPoints <= 0 || (actor.cubogroAbilityCharges || 0) <= 0) return;
      addLog(`¡${actor.name} prepara [Paliza Demoledora]! Consume 1 Cúbit y una carga; el golpe equivale a la mitad de los HP actuales de ${target.name} si no iguala el dado de ataque.`, true, actor.name);
      handleAttack(target.id, false, undefined, undefined, true);
    } else if (hero === CharacterType.RACUBITERO) {
      if (actor.actionPoints <= 0) return;
      const roll = gameplayRandomInt(1, 6, 'racubitero.collective.d6');
      const rivals = players.filter(p => p.id !== actor.id && !p.isEliminated && p.hp > 0 &&
        (actor.teamId === undefined || p.teamId !== actor.teamId));
      setPlayers(prev => prev.map(p => {
        if (p.id === actor.id) {
          return { ...p, actionPoints: Math.max(0, p.actionPoints - 1), abilityCooldownRemaining: 3 };
        }
        if (roll === 6 && rivals.some(rival => rival.id === p.id)) return { ...p, hand: [] };
        return p;
      }));
      addLog(roll === 6
        ? `¡Saqueo Colectivo! ${actor.name} obtiene 6: las manos rivales quedan reunidas para distribuirlas.`
        : `Saqueo Colectivo: ${actor.name} obtiene ${roll}; no consigue reunir las manos rivales.`,
        true, actor.name);
      if (roll === 6) {
        const pooledCards = rivals.flatMap(rival => rival.hand);
        if (pooledCards.length > 0) {
          if (!actor.isBot) {
            setRacubiteroLootOffer({ actorId: actor.id, cards: pooledCards });
          } else {
            let remaining = [...pooledCards];
            const selfSlots = Math.max(0, getMaxHandSize(actor) - actor.hand.length);
            const retained = remaining.splice(0, selfSlots);
            const gifts = new Map<number, GameCard>();
            const botAllies = actor.teamId === undefined ? [] : players.filter(player =>
              player.id !== actor.id && player.teamId === actor.teamId && !player.isEliminated &&
              player.hp > 0 && player.hand.length < getMaxHandSize(player)
            );
            botAllies.forEach(ally => {
              if (remaining.length > 0) gifts.set(ally.id, remaining.shift()!);
            });
            setPlayers(prev => prev.map(player => {
              if (player.id === actor.id) return { ...player, hand: [...player.hand, ...retained] };
              const gift = gifts.get(player.id);
              return gift ? { ...player, hand: [...player.hand, gift] } : player;
            }));
            if (remaining.length > 0) returnCardsToGlobalPile(remaining);
            addLog(`Saqueo Colectivo automático: ${actor.name} conserva ${retained.length}, reparte ${gifts.size} y devuelve ${remaining.length} a la Pila General.`, true, actor.name);
          }
        } else addLog("Saqueo Colectivo: los rivales no tenían cartas en sus manos.", false, actor.name);
      }
      sound.playDiceRoll();
    } else if (hero === CharacterType.CUBINJA) {
      const ally = players.find(p => p.id === targetId && p.id !== actor.id && !p.isEliminated && p.hp > 0 &&
        actor.teamId !== undefined && p.teamId === actor.teamId);
      if (!ally || actor.actionPoints <= 0 || actor.equippedWeapons.length === 0 || ally.borrowedEquipmentEffects?.length) return;
      setPlayers(prev => prev.map(p => {
        if (p.id === actor.id) return { ...p, actionPoints: Math.max(0, p.actionPoints - 1), abilityCooldownRemaining: 2 };
        if (p.id === ally.id) return { ...p, borrowedEquipmentEffects: [...actor.equippedWeapons], borrowedEquipmentSourceId: actor.id };
        return p;
      }));
      addLog(`¡Préstamo de Arsenal! ${actor.name} presta los efectos de ${actor.equippedWeapons.length} arma(s) a ${ally.name} sin mover las cartas. Termina al finalizar el siguiente turno de ${ally.name}.`, true, actor.name);
      sound.playStanceActivate();
    } else if (hero === CharacterType.CUBICULA) {
      const mode = cubiculaMode || 'DRAIN';
      const transfer = resolveCubiculaTransfer(players, actor.id, targetId, mode, extraOption || 1);
      if (!transfer.ok) {
        if (transfer.reason === 'no-transferable-hp') {
          addLog("Transfusión Nocturna no puede transferir vida: el donante debe conservar 1 HP y el receptor no tiene espacio.", false, actor.name);
        }
        return;
      }

      setPlayers(transfer.players);
      const target = players.find(p => p.id === targetId)!;
      addLog(`${actor.name} usa Transfusión Nocturna · ${mode === 'DRAIN' ? 'Drenaje' : 'Donación'}: transfiere ${transfer.transferred} HP ${mode === 'DRAIN' ? 'desde el rival' : 'hacia el aliado'} ${target.name}. El donante conserva al menos 1 HP. Ambos modos comparten enfriamiento de 3 rondas al terminar el turno.`, true, actor.name);
      addFloatingText(mode === 'DRAIN' ? actor.id : target.id, `+${transfer.transferred} HP`, "#f472b6");
      addFloatingText(mode === 'DRAIN' ? target.id : actor.id, `-${transfer.transferred} HP`, "#ef4444");
    } else if (hero === CharacterType.FLAUCUBISTA_DESAFINADO) {
      // La apuesta del Flaucubista es una excepción explícita: usa D5, no el D6 general.
      const chosenNum = extraOption && extraOption >= 1 && extraOption <= 5
        ? extraOption
        : gameplayRandomInt(1, 5, 'flaucubista.d5');
      const roll = gameplayRandomInt(1, 5, 'flaucubista.d5');
      sound.playDiceRoll();

      if (roll === chosenNum) {
        const affectedPlayers = players.filter(p => p.id !== actor.id && !p.isEliminated);
        const damageByRecipient = new Map<number, number>();
        const interceptedDamageByGuardian = new Map<number, { name: string; protectedNames: string[] }>();
        affectedPlayers.forEach(protectedPlayer => {
          const guardian = findGladiacubonCovering(players, protectedPlayer.id, actor.id);
          const recipientId = guardian?.id ?? protectedPlayer.id;
          damageByRecipient.set(recipientId, (damageByRecipient.get(recipientId) || 0) + 2);
          if (guardian) {
            const entry = interceptedDamageByGuardian.get(guardian.id) || {
              name: guardian.name,
              protectedNames: []
            };
            entry.protectedNames.push(protectedPlayer.name);
            interceptedDamageByGuardian.set(guardian.id, entry);
          }
        });
        setPlayers(prev => prev.map(p => {
          if (p.id === actor.id) {
            return {
              ...p,
              hp: Math.min(p.maxHp, p.hp + 2),
              damageDealt: (p.damageDealt || 0) + (affectedPlayers.length * 2)
            };
          }
          const incomingDamage = damageByRecipient.get(p.id) || 0;
          if (incomingDamage <= 0) return p;
          const nextHp = Math.max(0, p.hp - incomingDamage);
          return {
            ...p,
            hp: nextHp,
            isEliminated: nextHp <= 0,
            guardingAllyId: nextHp <= 0 ? null : p.guardingAllyId
          };
        }));
        interceptedDamageByGuardian.forEach((entry, guardianId) => {
          addLog(
            `¡Intercepción! ${entry.name} recibe 2 de daño ineludible por cada protegido alcanzado (${entry.protectedNames.join(", ")}); se acumula con el impacto directo que también reciba.`,
            true,
            entry.name
          );
          addFloatingText(guardianId, `INTERCEPCIÓN ×${entry.protectedNames.length}`, "#60a5fa");
        });
        damageByRecipient.forEach((damage, recipientId) => {
          addFloatingText(recipientId, `-${damage} DAÑO INELUDIBLE`, "#ff1744");
        });
        addLog(`¡Flaucubista acertó su número apostado (${chosenNum}) con un ${roll}! 2 de daño ineludible a todos y se cura 2 HP.`, true);
      } else {
        const selfDamage = Math.max(1, Math.floor(roll / 2));
        setPlayers(prev =>
          prev.map(p => (p.id === actor.id ? {
            ...p,
            hp: Math.max(0, p.hp - selfDamage),
            nextAttackBonus: (p.nextAttackBonus || 0) + 1,
            isEliminated: Math.max(0, p.hp - selfDamage) <= 0
          } : p))
        );
        addLog(`Flaucubista desafinó (apostó ${chosenNum}, sacó ${roll}) y sufre ${selfDamage} de daño.`);
      }
      setTimeout(() => checkVictory(), 300);
    } else {
      addLog(`¡${actor.name} activa el efecto de [${CHARACTERS[hero].abilityName}]! ${CHARACTERS[hero].abilityDescription}`, true);
    }
  };

  const resolveRacubiteroLoot = (assignments: string[]) => {
    const offer = racubiteroLootOffer;
    const actor = offer ? players.find(player => player.id === offer.actorId) : null;
    if (!offer || !actor || assignments.length !== offer.cards.length) return;
    const selfCards: GameCard[] = [];
    const pileCards: GameCard[] = [];
    const gifts = new Map<number, GameCard>();
    offer.cards.forEach((card, index) => {
      const destination = assignments[index] || 'PILE';
      if (destination === 'SELF') selfCards.push(card);
      else if (destination.startsWith('ALLY:')) {
        const allyId = Number(destination.slice(5));
        if (!gifts.has(allyId)) gifts.set(allyId, card);
        else pileCards.push(card);
      } else pileCards.push(card);
    });
    recordPlayerAction('RACUBITERO_LOOT_DISTRIBUTION', { actorId: actor.id, assignments: [...assignments], cardUids: offer.cards.map(card => card.uid) });
    const selfCapacity = Math.max(0, getMaxHandSize(actor) - actor.hand.length);
    const acceptedSelf = selfCards.slice(0, selfCapacity);
    pileCards.push(...selfCards.slice(selfCapacity));
    const acceptedGifts = new Map<number, GameCard>();
    gifts.forEach((card, allyId) => {
      const ally = players.find(player => player.id === allyId);
      if (ally && !ally.isEliminated && ally.hp > 0 && ally.hand.length < getMaxHandSize(ally)) acceptedGifts.set(allyId, card);
      else pileCards.push(card);
    });
    setPlayers(prev => prev.map(player => {
      if (player.id === actor.id) return { ...player, hand: [...player.hand, ...acceptedSelf] };
      const gift = acceptedGifts.get(player.id);
      return gift ? { ...player, hand: [...player.hand, gift] } : player;
    }));
    if (pileCards.length > 0) returnCardsToGlobalPile(pileCards);
    setRacubiteroLootOffer(null);
    addLog(`Saqueo Colectivo: ${acceptedSelf.length} carta(s) conservadas, ${acceptedGifts.size} entregadas a aliados y ${pileCards.length} devueltas a la Pila General.`, true, actor.name);
    sound.playCardDraw();
  };

  const openCubinjaTransfer = (cardId: number) => {
    const actor = currentTurnPlayer;
    if (!actor || (actor.activeMorphCharacter || actor.characterType) !== CharacterType.CUBINJA ||
        actor.actionPoints <= 0 || actor.isFrozen) return;
    const card = actor.hand.find(item => item.id === cardId && item.type === CardType.TRICK);
    if (card) setCubinjaTransferOffer({ actorId: actor.id, card });
  };

  const applyCubinjaTransfer = (actorId: number, cardUid: string, targetId: number) => {
    const currentPlayers = playersRef.current.length > 0 ? playersRef.current : players;
    const actor = currentPlayers.find(player => player.id === actorId);
    const target = currentPlayers.find(player => player.id === targetId);
    const card = actor?.hand.find(item => item.uid === cardUid);
    if (!actor || !card || !target || actor.actionPoints <= 0 ||
        target.isEliminated || target.hp <= 0 || target.hand.length >= getMaxHandSize(target) ||
        (target.activeMorphCharacter || target.characterType) === CharacterType.CUBOGRO) return;
    recordPlayerAction('CUBINJA_TRANSFER_TRICK', { actorId: actor.id, targetId: target.id, cardUid: card.uid });
    setPlayers(prev => prev.map(player => {
      if (player.id === actor.id) return {
        ...player,
        actionPoints: Math.max(0, player.actionPoints - 1),
        hand: player.hand.filter(item => item.uid !== card.uid)
      };
      if (player.id === target.id) return { ...player, hand: [...player.hand, card] };
      return player;
    }));
    setCubinjaTransferOffer(null);
    addLog(`Arsenal Ilimitado: ${actor.name} transfiere [${card.name}] a ${target.name} por 1 Cúbit.`, true, actor.name);
  };

  const confirmCubinjaTransfer = (targetId: number) => {
    const offer = cubinjaTransferOffer;
    if (!offer) return;
    applyCubinjaTransfer(offer.actorId, offer.card.uid || '', targetId);
  };

  // End Turn
  const handleEndTurn = () => {
    if (matchFinalizedRef.current) return;
    recordPlayerAction('END_TURN', { playerId: players[turnIndex]?.id ?? null });
    const turnPlayers = playersRef.current.length > 0 ? playersRef.current : players;
    if (turnPlayers.length === 0) return;
    const endingPlayer = turnPlayers[turnIndex];
    if (endingPlayer?.cubinarcaOrder && !endingPlayer.blocksDisabledByOrder) {
      addLog(`${endingPlayer.name} terminó su turno sin cumplir la orden: Discordia le quita la capacidad de bloquear.`, true, endingPlayer.name);
    }

    // 1. Check if only 1 survivor or 1 team remains
    const alivePlayers = turnPlayers.filter(p => !p.isEliminated && p.hp > 0);
    if (alivePlayers.length <= 1) {
      checkVictory(turnPlayers);
      return;
    }

    // The shared gameplay rule owns turn order, round rollover and per-turn resets.
    const transition = advanceTurnState(turnPlayers, turnIndex, round);
    if (transition.finished) {
      checkVictory(turnPlayers);
      return;
    }
    const { players: updated, turnIndex: nextIdx, round: nextRound } = transition;
    const skippedFrozenPlayers = turnPlayers.filter((player, index) =>
      index !== nextIdx && player.isFrozen && !updated[index]?.isFrozen
    );
    skippedFrozenPlayers.forEach(player => {
      recordReplayEvent('TURN_SKIPPED', { playerId: player.id, reason: 'FROZEN' });
      addLog(`${player.name} pierde su turno por Congelación.`, true, player.name);
    });
    recordReplayEvent('TURN_ADVANCED', {
      endingPlayerId: turnPlayers[turnIndex]?.id ?? null,
      nextPlayerId: updated[nextIdx]?.id ?? null,
      skippedFrozenPlayerIds: skippedFrozenPlayers.map(player => player.id),
      turnIndex: nextIdx,
      round: nextRound
    });
    recordReplayCheckpoint('round-' + nextRound + '-turn-' + (updated[nextIdx]?.id ?? 'unknown'), {
      players: updated,
      turnIndex: nextIdx,
      round: nextRound,
      deck: deckRef.current
    });
    setPlayers(updated);
    setTurnIndex(nextIdx);
    setRound(nextRound);
    setActiveDiceRoll(null);

    const nextP = updated[nextIdx];
    addLog(`Turno de ${nextP.name} (Ronda ${nextRound})`, false, "Árbitro");

    // Auto-select lowest HP rival as default target (prioritizing opposing team)
    const opposingTeamId = nextP.teamId === 1 ? 2 : nextP.teamId === 2 ? 1 : null;
    const rivals = updated.filter(
      p => !p.isEliminated && p.hp > 0 && p.id !== nextP.id && (!opposingTeamId || p.teamId === opposingTeamId)
    );
    if (rivals.length > 0) {
      const orderedTarget = nextP.cubinarcaOrder?.kind === 'ATTACK_TARGET'
        ? updated.find(player => player.id === nextP.cubinarcaOrder?.attackTargetId && !player.isEliminated && player.hp > 0)
        : null;
      const best = orderedTarget || rivals.reduce((prev, curr) => (curr.hp < prev.hp ? curr : prev));
      setSelectedTargetId(best.id);
    } else {
      setSelectedTargetId(null);
    }
  };

  // Check Victory (Squad Team vs Team or Free-For-All)
  const checkVictory = (playersList: PlayerState[] = players) => {
    const outcome = getMatchOutcome(playersList);
    if (!outcome || matchFinalizedRef.current) return;
    matchFinalizedRef.current = true;

    // Finalize after all outcome messages have been recorded. MATCH_FINISHED must
    // be the last event, and delayed bot callbacks must not resolve the match twice.
    const finalizeReplayCapture = () => {
      const replay = replayRecorderRef.current;
      if (!replay || replay.finalResult) return;
      recordReplayCheckpoint('match-finished', { players: playersList, winnerId: outcome.winner?.id ?? null, kind: outcome.kind });
      setReplayFinalResult(replay, { kind: outcome.kind, winningTeamId: outcome.winningTeamId ?? null, winnerId: outcome.winner?.id ?? null, finalPlayers: playersList });
      void persistCompletedMatchReplay(replay);
    };

    if (outcome.kind === 'TEAM' && outcome.winningTeamId === 2) {
      const winnerPlayer = outcome.winner;
      setWinner(winnerPlayer);
      setPhase(MatchPhase.MATCH_OVER);
      addLog(`¡¡EL BANDO RIVAL (ROJO) HA DERROTADO A TODA TU ESCUADRA!!`, true, "Árbitro");
      narrator.narrateVictory("El Bando Rojo");
      if (!replayPlaybackActiveRef.current) {
        collectionManager.recordMatchResult(false);
        dailyMissionsManager.recordMatch(false);
      }
      addLog(`+15 Aura de Calle obtenida por aguantar la refriega.`, true, "Aura");
      if (gameMode === GameMode.ONLINE_PVP) {
        if (!replayPlaybackActiveRef.current) collectionManager.addCoins(25);
        addFloatingText(playersList[0]?.id || 1, "+25 Cubi-Monedas de Consuelo", "#fbbf24");
      }
      finalizeReplayCapture();
      return;
    }

    if (outcome.kind === 'TEAM' && outcome.winningTeamId === 1) {
      const winnerPlayer = outcome.winner;
      setWinner(winnerPlayer);
      setPhase(MatchPhase.MATCH_OVER);
      addLog(`¡¡VICTORIA TOTAL! TU BANDO (AZUL) HA DERROTADO A TODOS LOS RIVALES!!`, true, "Árbitro");
      narrator.narrateVictory("Tu Escuadra Azul");
      if (!replayPlaybackActiveRef.current) {
        collectionManager.recordMatchResult(true);
        dailyMissionsManager.recordMatch(true);
      }
      addLog(`¡¡+35 AURA DE CALLE Y +1 CAJA DE 3 DADOS DESBLOQUEADA!!`, true, "Aura");
      addFloatingText(playersList[0]?.id || 1, "¡+1 CAJA DE 3 DADOS!", "#ffd600");
      if (gameMode === GameMode.ONLINE_PVP) {
        if (!replayPlaybackActiveRef.current) collectionManager.addCoins(60);
        addFloatingText(playersList[0]?.id || 1, "¡+60 Cubi-Monedas de Victoria!", "#ffd600");
      }
      finalizeReplayCapture();
      return;
    }

    if (outcome.kind === 'DRAW') {
      setWinner(null);
      setPhase(MatchPhase.MATCH_OVER);
      finalizeReplayCapture();
      return;
    }

    if (outcome.kind === 'FREE_FOR_ALL') {
      const champ = outcome.winner;
      setWinner(champ);
      setPhase(MatchPhase.MATCH_OVER);
      if (champ) {
        addLog(`¡¡${champ.name} ES EL CAMPEÓN SUPREMO DE GUERRA CUBITA!!`, true, "Árbitro");
        narrator.narrateVictory(champ.name);
        const isHumanChamp = !champ.isBot;
        if (!replayPlaybackActiveRef.current) {
          collectionManager.recordMatchResult(isHumanChamp);
          dailyMissionsManager.recordMatch(isHumanChamp);
        }
        if (isHumanChamp) {
          addLog(`¡¡+35 AURA DE COMBATE Y +1 CAJA DE 3 DADOS GANADA!!`, true, "Aura");
          addFloatingText(champ.id, "¡+1 CAJA DE 3 DADOS!", "#ffd600");
          if (gameMode === GameMode.ONLINE_PVP) {
            if (!replayPlaybackActiveRef.current) collectionManager.addCoins(60);
          }
        } else {
          addLog(`+15 Aura de combate disputado.`, true, "Aura");
          if (gameMode === GameMode.ONLINE_PVP) {
            if (!replayPlaybackActiveRef.current) collectionManager.addCoins(25);
          }
        }
      }
    }
    finalizeReplayCapture();
  };
    const finalizeMorphForm = (
    playerId: number,
    nextForm: CharacterType,
    nextHand: GameCard[],
    nextWeapons: GameCard[],
    nextStances: GameCard[]
  ) => {
    const player = playersRef.current.find(item => item.id === playerId) || players.find(item => item.id === playerId);
    if (!player || (player.morphFormsUsed || []).includes(nextForm)) return;
    const returned = [
      ...player.hand.filter(card => !nextHand.includes(card)),
      ...player.equippedWeapons.filter(card => !nextWeapons.includes(card)),
      ...[player.preparedStance, player.preparedStanceSecondary].filter((card): card is GameCard => Boolean(card) && !nextStances.includes(card!))
    ];
    const newMaxHp = getCharacterMaxHp(nextForm);
    setPlayers(previous => previous.map(item => item.id === playerId ? {
      ...item,
      activeMorphCharacter: nextForm,
      activeMorphRound: round,
      morphFormsUsed: [...(item.morphFormsUsed || []), nextForm],
      morphExhausted: false,
      maxHp: newMaxHp,
      hp: Math.min(item.hp, newMaxHp),
      abilityCooldownRemaining: 0,
      cubogroAbilityCharges: nextForm === CharacterType.CUBOGRO ? (item.cubogroAbilityCharges ?? 1) : item.cubogroAbilityCharges,
      hand: nextHand,
      equippedWeapons: nextWeapons,
      preparedStance: nextStances[0] || null,
      preparedStanceSecondary: nextStances[1] || null
    } : item));
    if (returned.length > 0) returnCardsToGlobalPile(returned);
    const formName = CHARACTERS[nextForm]?.displayName || nextForm;
    addLog("¡Mimetismo! " + player.name + " adopta la forma de " + formName + " para la ronda " + round + ".", true, player.name);
    if (returned.length > 0) addLog("La forma nueva devuelve " + returned.length + " carta(s)/arma(s) excedentes a la Pila General.", true, player.name);
    setMorphInventoryOffer(null);
    setMorphSelectionPlayerId(null);
  };

  const applyMorphForm = (playerId: number, nextForm: CharacterType) => {
    const player = playersRef.current.find(item => item.id === playerId) || players.find(item => item.id === playerId);
    if (!player || (player.morphFormsUsed || []).includes(nextForm) || nextForm === CharacterType.CAMBIAFORMAS) return;
    recordPlayerAction('MORPH_FORM_SELECTED', { playerId, nextForm });
    const projected = { ...player, activeMorphCharacter: nextForm };
    const weaponLimit = getMaxWeaponSlots(projected);
    const stanceLimit = getMaxPreparedStanceSlots(projected);
    const defaultWeapons = weaponLimit > 0 ? player.equippedWeapons.slice(-weaponLimit) : [];
    const handLimit = getMaxHandSize({ ...projected, equippedWeapons: defaultWeapons });
    const hand = [...player.hand];
    const weapons = [...player.equippedWeapons];
    const stances = [player.preparedStance, player.preparedStanceSecondary].filter((card): card is GameCard => Boolean(card));
    const needsChoice = hand.length > handLimit || weapons.length > weaponLimit || stances.length > stanceLimit;

    if (!player.isBot && needsChoice) {
      setMorphInventoryOffer({ playerId, form: nextForm, hand, weapons, stances, weaponLimit, stanceLimit });
      setMorphSelectionPlayerId(null);
      return;
    }
    const score = (card: GameCard) => {
      const rarity: Record<string, number> = { LEGENDARIA: 5, SUPER_RARA: 4, RARA: 3 };
      return (rarity[card.rarity] || 1) +
        (CHARACTERS[nextForm]?.classes.includes(card.category) ? 2 : 0) +
        (card.type === CardType.WEAPON && card.id === 13 ? 3 : card.type === CardType.WEAPON ? 1 : 0) +
        (card.timing === TrickTiming.PREPARED_STANCE ? 1 : 0);
    };
    const selectTop = (cards: GameCard[], max: number) => cards
      .map((card, index) => ({ index, score: score(card) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, max)
      .map(entry => entry.index)
      .sort((a, b) => a - b);
    const keptWeapons = selectTop(weapons, weaponLimit).map(index => weapons[index]);
    const actualHandLimit = getMaxHandSize({ ...projected, equippedWeapons: keptWeapons });
    const keptHand = selectTop(hand, actualHandLimit).map(index => hand[index]);
    const keptStances = selectTop(stances, stanceLimit).map(index => stances[index]);
    finalizeMorphForm(playerId, nextForm, keptHand, keptWeapons, keptStances);
  };

  const confirmMorphInventory = (selection: { hand: number[]; weapons: number[]; stances: number[] }) => {
    const offer = morphInventoryOffer;
    if (!offer) return;
    recordPlayerAction('MORPH_INVENTORY_SELECTION', { playerId: offer.playerId, form: offer.form, selection });
    const player = playersRef.current.find(item => item.id === offer.playerId);
    if (!player) return;
    const keptWeapons = selection.weapons.slice(0, offer.weaponLimit).map(index => offer.weapons[index]).filter(Boolean);
    const actualHandLimit = getMaxHandSize({ ...player, activeMorphCharacter: offer.form, equippedWeapons: keptWeapons });
    const keptHand = selection.hand.slice(0, actualHandLimit).map(index => offer.hand[index]).filter(Boolean);
    const keptStances = selection.stances.slice(0, offer.stanceLimit).map(index => offer.stances[index]).filter(Boolean);
    finalizeMorphForm(offer.playerId, offer.form, keptHand, keptWeapons, keptStances);
  };

  const waitForReplaySnapshot = (
    predicate: (snapshot: any) => boolean,
    description: string,
    timeoutMs: number = 12000
  ): Promise<any> => new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const poll = () => {
      const snapshot = replayStateSnapshotRef.current;
      if (snapshot && predicate(snapshot)) {
        resolve(snapshot);
        return;
      }
      if (Date.now() - startedAt >= timeoutMs) {
        reject(new Error('Tiempo agotado esperando ' + description + '.'));
        return;
      }
      setTimeout(poll, 25);
    };
    poll();
  });

  const dispatchReplayPlayerAction = async (payload: any) => {
    const state = replayStateSnapshotRef.current;
    const activePlayer = state?.players?.[state.turnIndex];
    const requireOffer = async (predicate: (snapshot: any) => boolean, label: string) =>
      waitForReplaySnapshot(predicate, label, 10000);

    switch (payload.kind) {
      case 'ATTACK':
        if (!Number.isInteger(payload.targetId)) throw new Error('ATTACK no contiene targetId.');
        setActiveDiceRoll(null);
        await new Promise(resolve => setTimeout(resolve, 35));
        handleAttack(payload.targetId);
        return;
      case 'EQUIP_WEAPON': {
        const player = replayStateSnapshotRef.current?.players?.[replayStateSnapshotRef.current.turnIndex];
        const card = player?.hand?.find((item: GameCard) => item.uid === payload.cardUid);
        if (!card) throw new Error('No se encontró el arma ' + payload.cardUid + ' en la mano del jugador activo.');
        handleEquipWeapon(card.id, card.uid);
        return;
      }
      case 'PREPARE_STANCE': {
        const player = replayStateSnapshotRef.current?.players?.[replayStateSnapshotRef.current.turnIndex];
        const card = player?.hand?.find((item: GameCard) => item.uid === payload.cardUid);
        if (!card) throw new Error('No se encontró la postura ' + payload.cardUid + ' en la mano del jugador activo.');
        handlePrepareStance(card.id, card.uid);
        return;
      }
      case 'PLAY_ACTION_TRICK': {
        const player = replayStateSnapshotRef.current?.players?.[replayStateSnapshotRef.current.turnIndex];
        const card = player?.hand?.find((item: GameCard) => item.uid === payload.cardUid);
        if (!card) throw new Error('No se encontró el truco ' + payload.cardUid + ' en la mano del jugador activo.');
        handlePlayActionTrick(card.id, payload.targetId ?? undefined, card.uid);
        return;
      }
      case 'HERO_ABILITY':
        if (payload.hero === CharacterType.DRACUBON || payload.hero === CharacterType.CUBOGRO) {
          setActiveDiceRoll(null);
          await new Promise(resolve => setTimeout(resolve, 35));
        }
        handleUseHeroAbility(payload.targetId ?? undefined, payload.extraOption ?? undefined, payload.cubiculaMode ?? undefined);
        return;
      case 'END_TURN':
        handleEndTurn();
        return;
      case 'SPECIAL_SIX_CHOICE': {
        const actor = replayStateSnapshotRef.current?.players?.find((player: PlayerState) => player.id === payload.playerId);
        if (!actor) throw new Error('No existe el jugador de la elección de Cara Especial 6.');
        // Los bots ya resuelven esta elección dentro de la resolución del combate.
        if (actor.isBot) return;
        await requireOffer(s => s.specialSixChoice?.playerId === payload.playerId, 'la elección de Cara Especial 6');
        handleApplySixChoice(payload.playerId, payload.choice);
        return;
      }
      case 'TRAMCUBOSO_CARD_CHOICE':
        await requireOffer(s => s.tramcubosoCardChoices?.[0]?.playerId === payload.playerId, 'la oferta de Selección Afortunada');
        resolveTramcubosoCardChoice(payload.choiceIndex);
        return;
      case 'TRAMCUBOSO_REROLL_CHOICE':
        await requireOffer(s => Boolean(s.pendingDiceReroll) && s.pendingDiceReroll.targetId === payload.targetId, 'la ventana de relanzamiento de Tramcuboso');
        setActiveDiceRoll(null);
        await new Promise(resolve => setTimeout(resolve, 35));
        resolveTramcubosoReroll(payload.shouldReroll);
        return;
      case 'CUBINARCA_ORDER':
        await requireOffer(s =>
          s.cubinarcaOrderOffer?.issuerId === payload.issuerId &&
          s.cubinarcaOrderOffer?.victimId === payload.victimId,
          'la elección de orden de Cubinarca'
        );
        issueCubinarcaOrder(payload.kind, payload.attackTargetId ?? undefined);
        return;
      case 'CUBINARCA_TRANSFER_CARD': {
        await requireOffer(s => s.players?.[s.turnIndex]?.cubinarcaOrder?.kind === 'TRANSFER_CARD', 'la orden de transferencia de Cubinarca');
        const victim = replayStateSnapshotRef.current.players[replayStateSnapshotRef.current.turnIndex];
        const cardIndex = victim.hand.findIndex((card: GameCard) => card.uid === payload.cardUid);
        if (cardIndex < 0) throw new Error('La carta ordenada por Cubinarca ya no está en la mano.');
        fulfillCubinarcaTransfer(cardIndex);
        return;
      }
      case 'CUBINARCA_UNEQUIP_WEAPON': {
        await requireOffer(s => s.players?.[s.turnIndex]?.cubinarcaOrder?.kind === 'UNEQUIP_WEAPON', 'la orden de desequipar de Cubinarca');
        const victim = replayStateSnapshotRef.current.players[replayStateSnapshotRef.current.turnIndex];
        const weaponIndex = victim.equippedWeapons.findIndex((card: GameCard) => card.uid === payload.weaponUid);
        if (weaponIndex < 0) throw new Error('El arma ordenada por Cubinarca ya no está equipada.');
        fulfillCubinarcaUnequip(weaponIndex);
        return;
      }
      case 'CUBINARCA_DEFY_ORDER':
        await requireOffer(s => Boolean(s.players?.[s.turnIndex]?.cubinarcaOrder), 'la orden pendiente de Cubinarca');
        defyCubinarcaOrder();
        return;
      case 'PERFECT_BLOCK_EQUIP_WEAPON':
        await requireOffer(s => s.reactionPlayer?.id === payload.playerId, 'la ventana de reacción de Bloqueo Perfecto');
        handleEquipReaction(payload.cardId, payload.cardUid);
        return;
      case 'PERFECT_BLOCK_PLAY_TRICK':
        await requireOffer(s => s.reactionPlayer?.id === payload.playerId, 'la ventana de reacción de Bloqueo Perfecto');
        handleActivateReaction(payload.cardId, payload.cardUid);
        return;
      case 'PERFECT_BLOCK_PREPARE_STANCE':
        await requireOffer(s => s.reactionPlayer?.id === payload.playerId, 'la ventana de reacción de Bloqueo Perfecto');
        handlePrepareReaction(payload.cardId, payload.cardUid);
        return;
      case 'SKIP_PERFECT_BLOCK_REACTION':
        await requireOffer(s => s.reactionPlayer?.id === payload.playerId, 'la ventana de reacción de Bloqueo Perfecto');
        handleSkipReaction();
        return;
      case 'HADA_SUPPLY_TRANSFER':
        await requireOffer(s => s.supplyMagicOffer?.actorId === payload.actorId, 'la oferta de Suministro Mágico');
        {
          const offer = replayStateSnapshotRef.current.supplyMagicOffer;
          const gifted = offer.cards[payload.cardIndex];
          const retained = offer.cards[1 - payload.cardIndex];
          if (gifted?.uid !== payload.giftedCardUid || retained?.uid !== payload.retainedCardUid) {
            throw new Error('Las cartas de Suministro Mágico no coinciden con la repetición.');
          }
        }
        handleConfirmSupplyMagic(payload.cardIndex, payload.allyId);
        return;
      case 'RACUBITERO_LOOT_DISTRIBUTION':
        await requireOffer(s => s.racubiteroLootOffer?.actorId === payload.actorId, 'la distribución de Saqueo Colectivo');
        resolveRacubiteroLoot(payload.assignments);
        return;
      case 'CUBINJA_TRANSFER_TRICK':
        applyCubinjaTransfer(payload.actorId, payload.cardUid, payload.targetId);
        return;
      case 'MORPH_FORM_SELECTED':
        applyMorphForm(payload.playerId, payload.nextForm);
        return;
      case 'MORPH_INVENTORY_SELECTION':
        await requireOffer(s => s.morphInventoryOffer?.playerId === payload.playerId, 'la selección de inventario de Mimetismo');
        confirmMorphInventory(payload.selection);
        return;
      default:
        throw new Error('Acción de replay no soportada: ' + String(payload.kind));
    }
  };

  const applyReplayBotDecision = async (payload: any, alreadyObserved: boolean = false) => {
    if (!alreadyObserved) recordReplayEvent('BOT_DECISION', payload);
    if (payload.kind === 'TRAMCUBOSO_CARD_CHOICE') {
      const state = await waitForReplaySnapshot(snapshot =>
        snapshot.players.some((candidate: PlayerState) =>
          candidate.id === payload.playerId &&
          candidate.hand.some((card: GameCard) => card.uid === payload.selectedCardUid)
        ),
        'la carta elegida automáticamente por Tramcuboso'
      );
      const player = state.players.find((candidate: PlayerState) => candidate.id === payload.playerId);
      if (!player) throw new Error('La decisión automática de Tramcuboso no tiene jugador asociado.');
      return;
    }
    if (payload.kind === 'CUBINARCA_ORDER') {
      await waitForReplaySnapshot(snapshot => {
        const victim = snapshot.players.find((candidate: PlayerState) => candidate.id === payload.victimId);
        return Boolean(victim?.cubinarcaOrder &&
          victim.cubinarcaOrder.issuerId === payload.order?.issuerId &&
          victim.cubinarcaOrder.kind === payload.order?.kind &&
          (victim.cubinarcaOrder.attackTargetId ?? null) === (payload.order?.attackTargetId ?? null));
      }, 'la orden automática de Cubinarca');
      return;
    }
    const state = replayStateSnapshotRef.current;
    if (payload.kind === 'CUBINARCA_FULFILL_TRANSFER') {
      const victim = state.players.find((player: PlayerState) => player.id === payload.victimId);
      const issuer = state.players.find((player: PlayerState) => player.id === payload.issuerId);
      const card = victim?.hand.find((item: GameCard) => item.uid === payload.cardUid);
      if (!victim || !issuer || !card) throw new Error('No se puede reconstruir la transferencia automática de Cubinarca.');
      setPlayers(prev => prev.map(player => {
        if (player.id === victim.id) return {
          ...player,
          hand: player.hand.filter(item => item.uid !== card.uid),
          cubinarcaOrder: null,
          blocksDisabledByOrder: false,
          cubinarcaOrderDefiedThisTurn: false
        };
        if (player.id === issuer.id) return { ...player, hand: [...player.hand, card] };
        return player;
      }));
      addLog(`${victim.name} obedece la orden y entrega [${card.name}] a ${issuer.name}.`, true, victim.name);
      return;
    }
    if (payload.kind === 'CUBINARCA_FULFILL_UNEQUIP') {
      const victim = state.players.find((player: PlayerState) => player.id === payload.victimId);
      const weapon = victim?.equippedWeapons.find(card => card.uid === payload.weaponUid);
      if (!victim || !weapon) throw new Error('No se puede reconstruir el desequipamiento automático de Cubinarca.');
      const hasSpace = victim.hand.length < getMaxHandSize(victim);
      setPlayers(prev => prev.map(player => player.id === victim.id ? {
        ...player,
        equippedWeapons: player.equippedWeapons.filter(card => card.uid !== weapon.uid),
        hand: hasSpace ? [...player.hand, weapon] : player.hand,
        cubinarcaOrder: null,
        blocksDisabledByOrder: false,
        cubinarcaOrderDefiedThisTurn: false
      } : player));
      if (!hasSpace) returnCardsToGlobalPile([weapon]);
      addLog(`${victim.name} obedece la orden y desequipa [${weapon.name}].`, true, victim.name);
      return;
    }
    if (payload.kind === 'CUBINARCA_AUTO_DEFY') {
      const victim = state.players.find((player: PlayerState) => player.id === payload.victimId);
      if (!victim) throw new Error('No existe el jugador que desobedeció la orden de Cubinarca.');
      setPlayers(prev => prev.map(player => player.id === victim.id
        ? { ...player, blocksDisabledByOrder: true, cubinarcaOrderDefiedThisTurn: true }
        : player
      ));
      return;
    }
    throw new Error('Decisión automática de replay no soportada: ' + String(payload.kind));
  };

  const startReplayPlayback = async (input: unknown) => {
    try {
      const replay = parseMatchReplay(input as any);
      const initial = replay.initialState as any;
      if (!Array.isArray(initial.players) || !Array.isArray(initial.deck)) {
        throw new Error('La repetición no incluye la lista inicial de jugadores y el mazo.');
      }

      setReplayFailure(null);
      replayExecutionRef.current = null;
      setReplayProgress({ status: 'RESTORING', consumedEvents: 0, totalEvents: replay.events.length });
      matchFinalizedRef.current = false;
      replayRecorderRef.current = null;
      replayObservedEventsRef.current = [];
      replayPlaybackActiveRef.current = true;
      stopGameplayRandomSession();
      resetCardUidCounter(initial.cardUidCounter ?? 0);
      const restoredPlayers = JSON.parse(JSON.stringify(initial.players)) as PlayerState[];
      const restoredDeck = JSON.parse(JSON.stringify(initial.deck)) as GameCard[];
      playersRef.current = restoredPlayers;
      deckRef.current = restoredDeck;
      startGameplayRandomReplay(replay.metadata.seed, getReplayRandomResults(replay));

      setIsReplayPlayback(true);
      setCurrentScreen(CurrentScreen.ARENA);
      setIsMatchIntroPlaying(false);
      matchIntroCompletedRef.current = true;
      setPlayers(restoredPlayers);
      setDeck(restoredDeck);
      setDiscardPile(initial.discardPile || []);
      setRound(initial.round ?? 1);
      setTurnIndex(initial.turnIndex ?? 0);
      setGameMode(initial.gameMode as GameMode);
      setSelectedTargetId(initial.selectedTargetId ?? null);
      setWinner(null);
      setPhase(MatchPhase.IDLE);
      setActiveClash(null);
      setActiveDiceRoll(null);
      setIsRollingAnimation(false);
      setIsFastSpeed(false);
      setLog([]);
      setSpecialSixChoice(null);
      setSpecialSixQueue([]);
      setSupplyMagicOffer(null);
      setTramcubosoCardChoices([]);
      setCubinarcaOrderOffer(null);
      setPendingDiceReroll(null);
      setRacubiteroLootOffer(null);
      setCubinjaTransferOffer(null);
      setMorphSelectionPlayerId(null);
      setMorphInventoryOffer(null);
      setReactionPlayer(null);
      eliminatedInventoryReturnedRef.current.clear();
      botOrderTurnRef.current = null;
      processedMorphRoundRef.current = null;

      await new Promise(resolve => setTimeout(resolve, 100));
      const controller = new ReplayExecutionController(replay, {
        executeCommand: async (payload: any, event: any) => {
          if (!replayCommandDispatcherRef.current) throw new Error('El dispatcher de comandos de replay no está disponible.');
          await replayCommandDispatcherRef.current(payload, event);
        },
        applyRuleEffect: async (payload: any) => {
          recordReplayEvent('RULE_EFFECT', payload);
          if (payload.kind !== 'MORPH_EXHAUSTED') {
            throw new Error('Efecto de regla de replay no soportado: ' + String(payload.kind));
          }
          const player = replayStateSnapshotRef.current?.players?.find(
            (candidate: PlayerState) => candidate.id === payload.playerId
          );
          if (!player || !player.morphFormsUsed || player.morphFormsUsed.length < 12) {
            throw new Error('Cambiaformas no tiene agotadas las 12 formas como indica la repetición.');
          }
          setPlayers(previous => previous.map(candidate => candidate.id === player.id
            ? { ...candidate, activeMorphRound: payload.round, morphExhausted: true }
            : candidate
          ));
          addLog(player.name + " ha agotado sus 12 formas y conservará la última hasta terminar la partida.", true, player.name);
        },
        verifyBotDecision: async (payload: any, event: any) => {
          const matchStarted = replay.events.find((candidate: any) => candidate.type === 'MATCH_STARTED');
          if (matchStarted && event.sequence < matchStarted.sequence) return;
          const observed = replayObservedEventsRef.current[0];
          if (observed?.type === event.type) {
            const difference = findFirstReplayDifference(event.payload, observed.payload);
            if (difference) {
              throw new Error(
                'La decisión automática diverge en ' + difference.path +
                ': esperado=' + JSON.stringify(difference.expected) +
                ', observado=' + JSON.stringify(difference.actual)
              );
            }
            // verifyEvent consume este evento una sola vez después de waitForIdle.
            await applyReplayBotDecision(payload, true);
            return;
          }
          await applyReplayBotDecision(payload, false);
        },
        waitForIdle: async (event: any) => {
          const isCombatAction = event.type === 'PLAYER_ACTION' && (
            event.payload?.kind === 'ATTACK' ||
            event.payload?.kind === 'TRAMCUBOSO_REROLL_CHOICE' ||
            (event.payload?.kind === 'HERO_ABILITY' &&
              [CharacterType.DRACUBON, CharacterType.CUBOGRO].includes(event.payload?.hero))
          );
          if (isCombatAction) {
            setActiveDiceRoll(null);
            if (event.payload?.kind === 'ATTACK' || event.payload?.kind === 'TRAMCUBOSO_REROLL_CHOICE' ||
                [CharacterType.DRACUBON, CharacterType.CUBOGRO].includes(event.payload?.hero)) {
              await waitForReplaySnapshot(s => Boolean(s.pendingDiceReroll) || Boolean(s.activeDiceRoll), 'la resolución del combate', 15000);
              if (!replayStateSnapshotRef.current?.pendingDiceReroll) {
                await new Promise(resolve => setTimeout(resolve, 380));
                setActiveDiceRoll(null);
              }
            }
          } else {
            await new Promise(resolve => setTimeout(resolve, 45));
          }

          const eventIndex = replay.events.findIndex((candidate: any) => candidate.sequence === event.sequence);
          const laterCommands = replay.events.slice(eventIndex + 1).some((candidate: any) =>
            candidate.type === 'PLAYER_ACTION' || candidate.type === 'BOT_DECISION'
          );
          if (!laterCommands && replay.finalResult) {
            await waitForReplaySnapshot(s => Boolean(s.winner) || s.phase === MatchPhase.MATCH_OVER, 'el resultado final de la partida', 8000);
          }
        },
        captureCheckpoint: async (checkpoint: any) => {
          const snapshot = replayStateSnapshotRef.current;
          const expectedState = checkpoint.state?.state ?? checkpoint.state;
          if (Object.prototype.hasOwnProperty.call(expectedState, 'deckOrder')) {
            return {
              gameMode: snapshot.gameMode,
              players: snapshot.players,
              deckOrder: snapshot.deck.map((card: GameCard) => ({ id: card.id, uid: card.uid })),
              cardUidCounter: getCardUidCounter()
            };
          }
          if (Object.prototype.hasOwnProperty.call(expectedState, 'winnerId')) {
            const outcome = getMatchOutcome(snapshot.players);
            return {
              players: snapshot.players,
              winnerId: outcome?.winner?.id ?? null,
              kind: outcome?.kind ?? null
            };
          }
          return {
            players: snapshot.players,
            turnIndex: snapshot.turnIndex,
            round: snapshot.round,
            deck: snapshot.deck
          };
        },
        verifyEvent: async (event: any) => {
          const matchStarted = replay.events.find((candidate: any) => candidate.type === 'MATCH_STARTED');
          if (
            event.type === 'RANDOM_RESULT' ||
            event.type === 'MATCH_RECORDING_STARTED' ||
            event.type === 'MATCH_STARTED' ||
            event.type === 'MATCH_FINISHED' ||
            event.type === 'REPLAY_EXPORTED' ||
            (matchStarted && event.sequence < matchStarted.sequence)
          ) return;

          const startedAt = Date.now();
          while (replayObservedEventsRef.current.length === 0 && Date.now() - startedAt < 12000) {
            await new Promise(resolve => setTimeout(resolve, 25));
          }
          const observed = replayObservedEventsRef.current.shift();
          if (!observed) {
            throw new Error('Falta el evento observado ' + event.type + ' en la secuencia ' + event.sequence + '.');
          }
          const difference = findFirstReplayDifference(
            { type: event.type, payload: event.payload },
            { type: observed.type, payload: observed.payload }
          );
          if (difference) {
            throw new Error(
              'Primer evento divergente en la secuencia ' + event.sequence +
              ' en ' + difference.path +
              ': esperado=' + JSON.stringify(difference.expected) +
              ', observado=' + JSON.stringify(difference.actual)
            );
          }
        },
        assertRandomFullyConsumed: () => {
          const randomSession = getGameplayRandomSession();
          if (!randomSession) throw new Error('La sesión aleatoria de replay se cerró antes de verificar el final.');
          return randomSession.assertFullyConsumed();
        },
        assertEventsFullyObserved: () => {
          if (replayObservedEventsRef.current.length > 0) {
            const extra = replayObservedEventsRef.current[0];
            throw new Error(
              'La reproducción generó eventos adicionales no presentes en el archivo. ' +
              'Primer evento extra: ' + extra.type + ' ' + JSON.stringify(extra.payload)
            );
          }
          return true;
        },
        onProgress: (progress: any) => setReplayProgress(progress)
      });
      replayExecutionRef.current = controller;
      await controller.run();
      setReplayProgress(controller.getProgress());
      // Mantener el modo de reproducción protegido hasta que el usuario salga.
      stopGameplayRandomSession();
    } catch (error: any) {
      setReplayFailure(error?.message || String(error));
      setReplayProgress(replayExecutionRef.current?.getProgress?.() ?? { status: 'FAILED' });
      // No reactivar bots ni acciones autónomas sobre una reconstrucción fallida.
      stopGameplayRandomSession();
    }
  };

  const handleReplayFile = async (file: File) => {
    try {
      const serialized = await file.text();
      await startReplayPlayback(serialized);
    } catch (error: any) {
      setReplayFailure(error?.message || 'No se pudo leer el archivo .gcreplay.');
    }
  };

  replayCommandDispatcherRef.current = dispatchReplayPlayerAction;

  // Cambiaformas selecciona una forma cualquiera de los otros 12 héroes y no puede repetirla.
  useEffect(() => {
    if (currentScreen !== CurrentScreen.ARENA) {
      processedMorphRoundRef.current = null;
      setMorphSelectionPlayerId(null);
      setMorphInventoryOffer(null);
      return;
    }
    if (isReplayPlayback || winner || phase === MatchPhase.MATCH_OVER || isMatchIntroPlaying || players.length === 0 || morphSelectionPlayerId !== null || morphInventoryOffer) return;
    const morph = players.find(player =>
      player.characterType === CharacterType.CAMBIAFORMAS && !player.isEliminated && player.hp > 0 &&
      player.activeMorphRound !== round && !player.morphExhausted
    );
    if (!morph) return;
    const used = morph.morphFormsUsed || [];
    const key = round + ":" + morph.id + ":" + used.length;
    if (processedMorphRoundRef.current === key) return;
    processedMorphRoundRef.current = key;
    const available = CHARACTER_LIST.filter(character =>
      character.type !== CharacterType.CAMBIAFORMAS && !used.includes(character.type)
    );
    if (available.length === 0) {
      recordReplayEvent('RULE_EFFECT', { kind: 'MORPH_EXHAUSTED', playerId: morph.id, round });
      setPlayers(previous => previous.map(player => player.id === morph.id
        ? { ...player, activeMorphRound: round, morphExhausted: true }
        : player
      ));
      addLog(morph.name + " ha agotado sus 12 formas y conservará la última hasta terminar la partida.", true, morph.name);
      return;
    }
    if (morph.isBot) {
      const priority = morph.hp <= 8
        ? available.find(form => form.type === CharacterType.CUBICULA)
        : morph.equippedWeapons.length >= 2
        ? available.find(form => form.type === CharacterType.CUBINJA)
        : morph.hand.length === 0
        ? available.find(form => form.type === CharacterType.HADA_AL_CUBO)
        : null;
      const chosen = priority || gameplayRandomPick(available, 'cambiaformas.random-form');
      applyMorphForm(morph.id, chosen.type);
    } else setMorphSelectionPlayerId(morph.id);
  }, [currentScreen, winner, phase, isMatchIntroPlaying, players, round, morphSelectionPlayerId, morphInventoryOffer]);

// Auto-skip turn if current active player is eliminated or dead (CRITICAL FIX FOR STUCK 'PENSANDO')
  useEffect(() => {
    if (isReplayPlayback || currentScreen !== CurrentScreen.ARENA || winner || phase === MatchPhase.MATCH_OVER || isMatchIntroPlaying) return;
    const currentP = players[turnIndex];
    if (currentP && (currentP.isEliminated || currentP.hp <= 0)) {
      const skipTimer = setTimeout(() => {
        handleEndTurn();
      }, 300 * speedMultiplier);
      return () => clearTimeout(skipTimer);
    }
  }, [turnIndex, players, currentScreen, winner, phase, isMatchIntroPlaying, speedMultiplier]);

  // Bot AI Turn execution
  useEffect(() => {
    if (isReplayPlayback || currentScreen !== CurrentScreen.ARENA || winner || phase === MatchPhase.MATCH_OVER || isMatchIntroPlaying) return;
    const activePlayer = players[turnIndex];
    if (!activePlayer || !activePlayer.isBot || activePlayer.isEliminated || activePlayer.hp <= 0) return;

    const timer = setTimeout(() => {
      if (botOrderTurnRef.current === turnIndex) return;
      if (botOrderTurnRef.current !== null && botOrderTurnRef.current !== turnIndex) botOrderTurnRef.current = null;
      const activeHero = activePlayer.activeMorphCharacter || activePlayer.characterType;

      // Los bots obedecen las órdenes al comenzar su turno. Si no pueden cumplirlas,
      // conservan la orden y pierden la capacidad de bloquear hasta resolverla.
      const pendingOrder = activePlayer.cubinarcaOrder;
      if (pendingOrder) {
        botOrderTurnRef.current = turnIndex;
        const issuer = players.find(player => player.id === pendingOrder.issuerId);
        if (pendingOrder.kind === 'ATTACK_TARGET') {
          const orderedTarget = players.find(player =>
            player.id === pendingOrder.attackTargetId && player.id !== activePlayer.id &&
            !player.isEliminated && player.hp > 0
          ) || players.find(player =>
            player.id !== activePlayer.id && !player.isEliminated && player.hp > 0
          );
          if (orderedTarget && activePlayer.actionPoints > 0) {
            if (orderedTarget.id !== pendingOrder.attackTargetId) {
              setPlayers(prev => prev.map(player => player.id === activePlayer.id
                ? { ...player, cubinarcaOrder: { ...pendingOrder, attackTargetId: orderedTarget.id } }
                : player
              ));
            }
            handleAttack(orderedTarget.id);
          } else {
            setPlayers(prev => prev.map(player => player.id === activePlayer.id
              ? { ...player, blocksDisabledByOrder: true, cubinarcaOrderDefiedThisTurn: true }
              : player
            ));
          }
        } else if (pendingOrder.kind === 'TRANSFER_CARD') {
          const card = activePlayer.hand[0];
          if (
            issuer && !issuer.isEliminated && card &&
            getMaxHandSize(activePlayer) > 0 &&
            issuer.hand.length < getMaxHandSize(issuer)
          ) {
            recordReplayEvent('BOT_DECISION', {
              kind: 'CUBINARCA_FULFILL_TRANSFER',
              victimId: activePlayer.id,
              issuerId: issuer.id,
              cardUid: card.uid
            });
            setPlayers(prev => prev.map(player => {
              if (player.id === activePlayer.id) return {
                ...player,
                hand: player.hand.slice(1),
                cubinarcaOrder: null,
                blocksDisabledByOrder: false,
                cubinarcaOrderDefiedThisTurn: false
              };
              if (player.id === issuer.id) return { ...player, hand: [...player.hand, card] };
              return player;
            }));
            addLog(`${activePlayer.name} obedece la orden y entrega [${card.name}] a ${issuer.name}.`, true, activePlayer.name);
          } else {
            recordReplayEvent('BOT_DECISION', { kind: 'CUBINARCA_AUTO_DEFY', victimId: activePlayer.id, order: pendingOrder });
            setPlayers(prev => prev.map(player => player.id === activePlayer.id
              ? { ...player, blocksDisabledByOrder: true, cubinarcaOrderDefiedThisTurn: true }
              : player
            ));
          }
        } else if (pendingOrder.kind === 'UNEQUIP_WEAPON') {
          const weapon = activePlayer.equippedWeapons[0];
          if (weapon) {
            const hasSpace = activePlayer.hand.length < getMaxHandSize(activePlayer);
            recordReplayEvent('BOT_DECISION', {
              kind: 'CUBINARCA_FULFILL_UNEQUIP',
              victimId: activePlayer.id,
              weaponUid: weapon.uid
            });
            setPlayers(prev => prev.map(player => player.id === activePlayer.id ? {
              ...player,
              equippedWeapons: player.equippedWeapons.slice(1),
              hand: hasSpace ? [...player.hand, weapon] : player.hand,
              cubinarcaOrder: null,
              blocksDisabledByOrder: false,
              cubinarcaOrderDefiedThisTurn: false
            } : player));
            if (!hasSpace) returnCardsToGlobalPile([weapon]);
            addLog(`${activePlayer.name} obedece la orden y desequipa [${weapon.name}].`, true, activePlayer.name);
          } else {
            recordReplayEvent('BOT_DECISION', { kind: 'CUBINARCA_AUTO_DEFY', victimId: activePlayer.id, order: pendingOrder });
            setPlayers(prev => prev.map(player => player.id === activePlayer.id
              ? { ...player, blocksDisabledByOrder: true, cubinarcaOrderDefiedThisTurn: true }
              : player
            ));
          }
        }
        setTimeout(() => handleEndTurn(), pendingOrder.kind === 'ATTACK_TARGET' ? 3600 * speedMultiplier : 900 * speedMultiplier);
        return;
      }

      const botCoverageAlly = activeHero === CharacterType.GLADIACUBON && activePlayer.teamId !== undefined
        ? players.find(p =>
            p.id !== activePlayer.id &&
            p.teamId === activePlayer.teamId &&
            !p.isEliminated &&
            p.hp > 0 &&
            !players.some(guardian => guardian.guardingAllyId === p.id)
          )
        : undefined;
      if (
        botCoverageAlly &&
        activePlayer.actionPoints > 0 &&
        activePlayer.guardingAllyId == null &&
        (activePlayer.interceptionAvailableRound || 0) <= round
      ) {
        handleUseHeroAbility(botCoverageAlly.id);
        return;
      }

      const botHasSupplyAlly = activePlayer.teamId !== undefined && players.some(p => {
        const allyHero = p.activeMorphCharacter || p.characterType;
        return p.id !== activePlayer.id &&
          p.teamId === activePlayer.teamId &&
          !p.isEliminated &&
          p.hp > 0 &&
          allyHero !== CharacterType.CUBOGRO &&
          p.hand.length < getMaxHandSize(p);
      });
      if (
        activeHero === CharacterType.HADA_AL_CUBO &&
        activePlayer.actionPoints === 2 &&
        activePlayer.hand.length < getMaxHandSize(activePlayer) &&
        botHasSupplyAlly &&
        deck.length >= 2
      ) {
        handleUseHeroAbility();
        return;
      }

      // 1. Try to equip weapon or prepare stance
      const weapon = activePlayer.hand.find(c => c.type === CardType.WEAPON);
      const stance = isCubinjaHero(activePlayer)
        ? undefined
        : activePlayer.hand.find(
            c => c.type === CardType.TRICK && c.timing === TrickTiming.PREPARED_STANCE
          );

      const maxSlots = getMaxWeaponSlots(activePlayer);

      if (weapon && activePlayer.equippedWeapons.length < maxSlots && activePlayer.actionPoints > 0) {
        handleEquipWeapon(weapon.id);
      } else if (stance && [activePlayer.preparedStance, activePlayer.preparedStanceSecondary].filter(Boolean).length < getMaxPreparedStanceSlots(activePlayer) && activePlayer.actionPoints > 0) {
        handlePrepareStance(stance.id);
      }

      // 2. Pick target & attack
      setTimeout(() => {
        const currentP = players.find(p => p.id === activePlayer.id);
        if (currentP && currentP.actionPoints > 0 && !currentP.isFrozen && !currentP.isEliminated && currentP.hp > 0) {
          const opposingTeamId = activePlayer.teamId === 1 ? 2 : activePlayer.teamId === 2 ? 1 : null;
          const rivals = players.filter(
            p => !p.isEliminated && p.hp > 0 && p.id !== activePlayer.id && (!opposingTeamId || p.teamId === opposingTeamId)
          );
          if (rivals.length > 0) {
            const activeHero = currentP.activeMorphCharacter || currentP.characterType;
            // Cubicula drains the healthiest rival first, matching Drenaje Nocturno's
            // "rival más fuerte" rule; other bots continue prioritizing the weakest rival.
            const target = activeHero === CharacterType.CUBICULA
              ? rivals.reduce((prev, curr) => (curr.hp > prev.hp ? curr : prev), rivals[0])
              : rivals.reduce((prev, curr) => (curr.hp < prev.hp ? curr : prev), rivals[0]);
            if (target) {
              setSelectedTargetId(target.id);
              if (activeHero === CharacterType.DRACUBON && rivals.length >= 2) {
                const secondTarget = rivals.find(p => p.id !== target.id);
                if (secondTarget) handleUseHeroAbility(target.id, secondTarget.id);
                else handleAttack(target.id);
              } else if (
                activeHero === CharacterType.CUBICULA &&
                currentP.actionPoints >= 1 &&
                currentP.hp < currentP.maxHp &&
                target.hp > 1
              ) {
                handleUseHeroAbility(target.id);
              } else {
                handleAttack(target.id);
              }
            }
          }
        }

        // End bot turn
        setTimeout(() => {
          handleEndTurn();
        }, 800 * speedMultiplier);
      }, 500 * speedMultiplier);
    }, 700 * speedMultiplier);

    return () => clearTimeout(timer);
  }, [turnIndex, players, currentScreen, winner, phase, isMatchIntroPlaying, speedMultiplier]);

  return (
    <div className="w-full min-h-screen bg-[#0f1116] text-white">
      {(isReplayPlayback || replayFailure || replayProgress?.status === 'FINISHED') && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/55 px-3 pt-4">
          <div className="w-full max-w-[560px] rounded-xl border border-cyan-500/50 bg-slate-950 px-4 py-4 shadow-2xl">
            {!replayFailure && replayProgress?.status !== 'FINISHED' && replayProgress?.status !== 'STOPPED' ? (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-extrabold tracking-wider text-cyan-300">RECONSTRUYENDO PARTIDA</div>
                  <div className="mt-1 text-[11px] text-slate-300">
                    {replayProgress?.consumedEvents ?? 0} / {replayProgress?.totalEvents ?? 0} eventos · {replayProgress?.consumedCheckpoints ?? 0} / {replayProgress?.totalCheckpoints ?? 0} checkpoints
                  </div>
                </div>
                <button
                  onClick={() => {
                    const progress = replayExecutionRef.current?.stop();
                    if (progress) setReplayProgress(progress);
                    stopGameplayRandomSession();
                  }}
                  className="shrink-0 rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-800"
                >
                  Detener
                </button>
              </div>
            ) : (
              <>
                {replayFailure ? (
                  <>
                    <div className="text-xs font-extrabold tracking-wider text-rose-300">REPLAY DETENIDO · DIVERGENCIA</div>
                    <div className="mt-2 break-words text-xs text-slate-200">{replayFailure}</div>
                    {replayProgress?.error?.details?.firstDifference && (
                      <div className="mt-2 break-words rounded bg-slate-900 px-2 py-1 text-[11px] text-amber-200">
                        Campo: {replayProgress.error.details.firstDifference.path}
                      </div>
                    )}
                  </>
                ) : replayProgress?.status === 'STOPPED' ? (
                  <>
                    <div className="text-xs font-extrabold tracking-wider text-amber-300">REPRODUCCIÓN DETENIDA</div>
                    <div className="mt-1 text-xs text-slate-300">La partida quedó en el último estado ejecutado. No se reanudará automáticamente.</div>
                  </>
                ) : (
                  <>
                    <div className="text-xs font-extrabold tracking-wider text-emerald-300">RECONSTRUCCIÓN COMPLETADA</div>
                    <div className="mt-1 text-xs text-slate-300">Se verificaron los eventos, checkpoints y resultados aleatorios registrados.</div>
                  </>
                )}
                <button
                  onClick={() => {
                    replayExecutionRef.current = null;
                    replayPlaybackActiveRef.current = false;
                    setIsReplayPlayback(false);
                    setReplayFailure(null);
                    setReplayProgress(null);
                    stopGameplayRandomSession();
                    setCurrentScreen(CurrentScreen.TITLE);
                  }}
                  className="mt-3 w-full rounded-lg bg-cyan-700 px-3 py-2 text-xs font-extrabold text-white hover:bg-cyan-600"
                >
                  Salir de la repetición
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {currentScreen === CurrentScreen.TITLE && (
        <TitleScreen
          onStartClick={() => setCurrentScreen(CurrentScreen.SETUP)}
          onDraftClick={() => setCurrentScreen(CurrentScreen.DRAFT)}
          onCampaignClick={() => setCurrentScreen(CurrentScreen.CAMPAIGN)}
          onPassAndPlayClick={() => setCurrentScreen(CurrentScreen.PASS_AND_PLAY_SETUP)}
          onRosterClick={() => setCurrentScreen(CurrentScreen.ROSTER)}
          onCardsClick={() => setCurrentScreen(CurrentScreen.ENCYCLOPEDIA)}
          onOnlineClick={() => setCurrentScreen(CurrentScreen.ONLINE_LOBBY)}
          onReplayArchiveClick={() => setCurrentScreen(CurrentScreen.REPLAY_ARCHIVE)}
        />
      )}

      {currentScreen === CurrentScreen.REPLAY_ARCHIVE && (
        <ReplayArchiveScreen
          showDiagnostics={import.meta.env.DEV}
          onImportReplay={handleReplayFile}
          onBack={() => setCurrentScreen(CurrentScreen.TITLE)}
          onReplay={replay => { void startReplayPlayback(replay); }}
        />
      )}

      {currentScreen === CurrentScreen.ONLINE_LOBBY && (
        <OnlineLobbyScreen
          onBack={() => setCurrentScreen(CurrentScreen.TITLE)}
          onStartOnlineMatch={startOnlineMatch}
        />
      )}

      {currentScreen === CurrentScreen.DRAFT && (
        <DraftScreen
          onStartBattle={(playerTeam, rivalTeam) => startDraftMatch(playerTeam, rivalTeam)}
          onBack={() => setCurrentScreen(CurrentScreen.TITLE)}
        />
      )}

      {currentScreen === CurrentScreen.SETUP && (
        <SetupScreen
          onStartBattle={(playerTeam, rivalTeam) => startDraftMatch(playerTeam, rivalTeam)}
          onGoToDraft={() => setCurrentScreen(CurrentScreen.DRAFT)}
          onBack={() => setCurrentScreen(CurrentScreen.TITLE)}
        />
      )}

      {currentScreen === CurrentScreen.PASS_AND_PLAY_SETUP && (
        <PassAndPlaySetupScreen
          onStartBattle={(count, heroes) => startPassAndPlayMatch(count, heroes)}
          onBack={() => setCurrentScreen(CurrentScreen.TITLE)}
        />
      )}

      {currentScreen === CurrentScreen.CAMPAIGN && (
        <CampaignScreen
          chapters={campaignChapters}
          onStartChapter={(chap, hero) => startCampaignMatch(chap, hero)}
          onBack={() => setCurrentScreen(CurrentScreen.TITLE)}
        />
      )}

      {currentScreen === CurrentScreen.ROSTER && (
        <RosterScreen onBack={() => setCurrentScreen(CurrentScreen.TITLE)} />
      )}

      {currentScreen === CurrentScreen.ENCYCLOPEDIA && (
        <EncyclopediaScreen onBack={() => setCurrentScreen(CurrentScreen.TITLE)} />
      )}

      {currentScreen === CurrentScreen.ARENA && (
        <ArenaScreen
          showDiagnostics={import.meta.env.DEV}
          round={round}
          players={players}
          currentTurnPlayer={currentTurnPlayer}
          selectedTargetId={selectedTargetId}
          supplyMagicOffer={supplyMagicOffer}
          onConfirmSupplyMagic={handleConfirmSupplyMagic}
          deckCount={deck.length}
          log={log}
          phase={phase}
          activeDiceRoll={activeDiceRoll}
          isRollingAnimation={isRollingAnimation}
          winner={winner}
          floatingTexts={floatingTexts}
          isFastSpeed={isFastSpeed}
          isDeckDrawing={isDeckDrawing}
          isMatchIntroPlaying={isMatchIntroPlaying}
          onMatchIntroComplete={completeMatchIntro}
          reactionPlayer={reactionPlayer}
          activeClash={activeClash}
          cubinarcaOrderOffer={cubinarcaOrderOffer}
          onIssueCubinarcaOrder={issueCubinarcaOrder}
          onFulfillCubinarcaTransfer={fulfillCubinarcaTransfer}
          onFulfillCubinarcaUnequip={fulfillCubinarcaUnequip}
          onDefyCubinarcaOrder={defyCubinarcaOrder}
          onSelectTarget={id => {
            if (currentTurnPlayer?.cubinarcaOrder?.kind === 'ATTACK_TARGET' && currentTurnPlayer.cubinarcaOrder.attackTargetId !== id) return;
            setSelectedTargetId(id);
          }}
          onAttack={id => handleAttack(id)}
          onEquipWeapon={id => handleEquipWeapon(id)}
          onPrepareStance={id => handlePrepareStance(id)}
          onPlayActionTrick={(cId, tId) => handlePlayActionTrick(cId, tId)}
          onUseHeroAbility={(tId, opt, mode) => handleUseHeroAbility(tId, opt, mode)}
          onTransferTrick={openCubinjaTransfer}
          onEndTurn={handleEndTurn}
          onDismissDiceRoll={() => setActiveDiceRoll(null)}
          onToggleSpeed={() => setIsFastSpeed(!isFastSpeed)}
          onExitBattle={() => {
            setIsMatchIntroPlaying(false);
            setCurrentScreen(CurrentScreen.TITLE);
          }}
          onRestartMatch={() => {
            const pTeam = players.filter(p => p.teamId === 1).map(p => p.characterType);
            const rTeam = players.filter(p => p.teamId === 2).map(p => p.characterType);
            if (pTeam.length === 3 && rTeam.length === 3) {
              startDraftMatch(pTeam, rTeam);
            } else {
              startQuickMatch(players.length, players[0]?.characterType || CharacterType.TRAMCUBOSO);
            }
          }}
          onEquipReaction={handleEquipReaction}
          onActivateReaction={handleActivateReaction}
          onPrepareReaction={handlePrepareReaction}
          onSkipReaction={handleSkipReaction}
          onExportReplay={exportMatchReplay}
          onExportReplayLog={exportCompletedMatchLog}
          replaySaveStatus={replaySaveStatus}
          replaySaveError={replaySaveError}
          onRetrySaveReplay={retrySaveCompletedMatchReplay}
        />
      )}

      {morphSelectionPlayerId !== null && (() => {
        const morph = players.find(player => player.id === morphSelectionPlayerId);
        if (!morph) return null;
        const used = morph.morphFormsUsed || [];
        return <MorphFormSelectionModal
          playerName={morph.name}
          usedCount={used.length}
          availableForms={CHARACTER_LIST.filter(form => form.type !== CharacterType.CAMBIAFORMAS && !used.includes(form.type))}
          onChoose={form => applyMorphForm(morph.id, form)}
        />;
      })()}
      {morphInventoryOffer && (() => {
        const player = players.find(item => item.id === morphInventoryOffer.playerId);
        if (!player) return null;
        return <MorphInventoryChoiceModal
          playerName={player.name}
          formName={CHARACTERS[morphInventoryOffer.form]?.displayName || morphInventoryOffer.form}
          hand={morphInventoryOffer.hand}
          weapons={morphInventoryOffer.weapons}
          stances={morphInventoryOffer.stances}
          form={morphInventoryOffer.form}
          weaponLimit={morphInventoryOffer.weaponLimit}
          stanceLimit={morphInventoryOffer.stanceLimit}
          onConfirm={confirmMorphInventory}
        />;
      })()}
      {pendingDiceReroll && (() => {
        const tram = players.find(player => player.id === pendingDiceReroll.tramcubosoId);
        const attacker = players.find(player => player.id === pendingDiceReroll.attackerId);
        const defender = players.find(player => player.id === (activeClash?.defenderId ?? -1));
        return tram && attacker ? (
          <TramcubosoRerollModal
            actorName={tram.name}
            attackerName={attacker.name}
            defenderName={players.find(player => player.id === pendingDiceReroll.defenderId)?.name || 'Defensor'}
            attackerRolls={pendingDiceReroll.attackerRolls}
            defenderRolls={pendingDiceReroll.defenderRolls}
            onKeep={() => resolveTramcubosoReroll(false)}
            onReroll={() => resolveTramcubosoReroll(true)}
          />
        ) : null;
      })()}
      {racubiteroLootOffer && (() => {
        const actor = players.find(player => player.id === racubiteroLootOffer.actorId);
        if (!actor) return null;
        const allies = players.filter(player =>
          player.id !== actor.id && !player.isEliminated && player.hp > 0 &&
          actor.teamId !== undefined && player.teamId === actor.teamId &&
          player.hand.length < getMaxHandSize(player)
        );
        return <RacubiteroLootModal cards={racubiteroLootOffer.cards} actor={actor} allies={allies} onConfirm={resolveRacubiteroLoot} />;
      })()}
      {cubinjaTransferOffer && (() => {
        const actor = players.find(player => player.id === cubinjaTransferOffer.actorId);
        return actor ? <CubinjaTransferModal actor={actor} card={cubinjaTransferOffer.card} players={players} onConfirm={confirmCubinjaTransfer} onCancel={() => setCubinjaTransferOffer(null)} /> : null;
      })()}
      {specialSixChoice && (
        <DiceSpecialChoiceModal
          actorName={specialSixChoice.actorName}
          isAttacker={specialSixChoice.isAttacker}
          canDrawCard={deck.length > 0 && players.some(p => p.id === specialSixChoice.playerId && p.hand.length < getMaxHandSize(p))}
          onChoose={(choice) => {
            handleApplySixChoice(specialSixChoice.playerId, choice);
            const nextChoice = specialSixQueue[0];
            setSpecialSixQueue(previous => previous.slice(1));
            if (nextChoice) setSpecialSixChoice(nextChoice);
          }}
        />
      )}
      {!specialSixChoice && tramcubosoCardChoices.length > 0 && (
        <TramcubosoCardChoiceModal
          playerName={tramcubosoCardChoices[0].playerName}
          initialCard={tramcubosoCardChoices[0].initialCard}
          alternativeCard={tramcubosoCardChoices[0].alternativeCard}
          source={tramcubosoCardChoices[0].source}
          onChoose={resolveTramcubosoCardChoice}
        />
      )}
    </div>
  );
}
