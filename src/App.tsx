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
  getMaxHandSize
} from './types/game';
import { ALL_CARDS, createShuffledDeck, generateUniqueCardUid } from './data/cards';
import { CHARACTER_LIST, CHARACTERS } from './data/characters';
import { DEFAULT_CHAPTERS } from './data/campaign';
import { sound } from './audio/soundManager';
import { music } from './audio/musicManager';
import { narrator } from './audio/narratorManager';
import { collectionManager } from './data/collectionManager';
import { dailyMissionsManager } from './data/dailyMissionsManager';

import { TitleScreen } from './screens/TitleScreen';
import { SetupScreen } from './screens/SetupScreen';
import { PassAndPlaySetupScreen } from './screens/PassAndPlaySetupScreen';
import { CampaignScreen } from './screens/CampaignScreen';
import { RosterScreen } from './screens/RosterScreen';
import { EncyclopediaScreen } from './screens/EncyclopediaScreen';
import { ArenaScreen } from './screens/ArenaScreen';
import { DraftScreen } from './screens/DraftScreen';
import { OnlineLobbyScreen } from './screens/OnlineLobbyScreen';
import { DiceSpecialChoiceModal } from './components/DiceSpecialChoiceModal';
import { CubinarcaOrderModal } from './components/CubinarcaOrderModal';
import { CombatClashData } from './components/CartoonCombatClash';

const getCharacterMaxHp = (characterType: CharacterType): number =>
  characterType === CharacterType.CUBOGRO ? 25 : 20;

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<CurrentScreen>(CurrentScreen.TITLE);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.QUICK_BATTLE);
  const [activeClash, setActiveClash] = useState<CombatClashData | null>(null);

  // Match State
  const [round, setRound] = useState<number>(1);
  const [turnIndex, setTurnIndex] = useState<number>(0);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [deck, setDeck] = useState<GameCard[]>([]);
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
  const [supplyMagicOffer, setSupplyMagicOffer] = useState<{ actorId: number; cards: GameCard[] } | null>(null);
  const [cubinarcaOrderOffer, setCubinarcaOrderOffer] = useState<{ issuerId: number; victimId: number } | null>(null);
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
    const actor = players.find(p => p.id === playerId);
    const actorName = actor ? actor.name : 'Jugador';

    if (choice === 'EXTRA_TURN') {
      setPlayers(prev => prev.map(p => {
        if (p.id !== playerId) return p;
        return { ...p, actionPoints: p.actionPoints + 1 };
      }));
      addFloatingText(playerId, "+1 TURNO EXTRA (PA)", "#ffd600");
      addLog(`¡Cara Especial 6! ${actorName} elige TURNO EXTRA (+1 Punto de Acción).`, true);
      sound.playStanceActivate();
      narrator.narrateSpecialFaceSix(actorName, "Turno Extra");
    } else {
      // Draw 1 card from deck
      setDeck(prevDeck => {
        if (prevDeck.length === 0) return prevDeck;
        const [drawn, ...rest] = prevDeck;
        const cardInstance: GameCard = {
          ...drawn,
          uid: generateUniqueCardUid(drawn.id)
        };
        setPlayers(prev => prev.map(p => {
          if (p.id !== playerId) return p;
          return {
            ...p,
            hand: [...p.hand, cardInstance],
            cardsDrawn: (p.cardsDrawn || 0) + 1
          };
        }));
        addFloatingText(playerId, "+1 CARTA MAZO", "#00e5ff");
        addLog(`¡Cara Especial 6! ${actorName} elige ROBAR CARTA y toma 1 del Mazo Global.`, true);
        triggerDeckAnimation();
        sound.playCardDraw();
        narrator.narrateSpecialFaceSix(actorName, "Robar Carta");
        return rest;
      });
    }

    setSpecialSixChoice(null);
  };

  const triggerDeckAnimation = () => {
    setIsDeckDrawing(true);
    setTimeout(() => setIsDeckDrawing(false), 1000);
  };

  // Helper: Gladiacubon starts with 1 random weapon equipped from the global deck
  const getInitialWeapons = (hero: CharacterType, deckArr: GameCard[]): GameCard[] => {
    if (hero === CharacterType.GLADIACUBON) {
      const idx = deckArr.findIndex(c => c.type === CardType.WEAPON);
      if (idx !== -1) {
        const weapon = deckArr.splice(idx, 1)[0];
        return [{
          ...weapon,
          uid: generateUniqueCardUid(weapon.id)
        }];
      }
    }
    return [];
  };

  // Add floating combat text
  const addFloatingText = (playerId: number, text: string, colorHex: string) => {
    const newText: FloatingCombatText = {
      id: Date.now() + Math.random(),
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
    const actor = actorOverride || (players[turnIndex]?.name ?? "Árbitro");
    const entry: CombatLogEntry = {
      id: Date.now() + Math.random(),
      round,
      actorName: actor,
      message,
      isCritical
    };
    setLog(prev => [entry, ...prev.slice(0, 35)]);
  };

  // Draw card helper
  const drawCardFromDeck = (currentDeck: GameCard[], currentDiscard: GameCard[]): { card: GameCard | null; newDeck: GameCard[]; newDiscard: GameCard[] } => {
    let d = [...currentDeck];
    let disc = [...currentDiscard];

    if (d.length === 0) {
      if (disc.length > 0) {
        d = disc
          .map(c => ({
            ...c,
            uid: generateUniqueCardUid(c.id)
          }))
          .sort(() => Math.random() - 0.5);
        disc = [];
      } else {
        return { card: null, newDeck: d, newDiscard: disc };
      }
    }

    const rawCard = d.shift() || null;
    const card: GameCard | null = rawCard
      ? {
          ...rawCard,
          uid: generateUniqueCardUid(rawCard.id)
        }
      : null;
    return { card, newDeck: d, newDiscard: disc };
  };

  // Start 3 vs 3 Draft Battle
  const startDraftMatch = (playerTeam: CharacterType[], rivalTeam: CharacterType[]) => {
    matchIntroCompletedRef.current = false;
    setIsMatchIntroPlaying(true);
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
    setDiscardPile(currentDiscard);
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
        message: `¡Modo Aleatorio 3 vs 3! Dados barajados y repartidos a cada escuadrón. Manos vacías al inicio. Cartas se obtienen del Mazo Global por Bloqueo Perfecto o al quebrar umbrales de vida (≤15, ≤10, ≤5 HP).`,
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
    let currentDeck = createShuffledDeck();
    let currentDiscard: GameCard[] = [];

    const otherHeroes = CHARACTER_LIST.filter(c => c.type !== chosenHero).sort(() => Math.random() - 0.5);
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
    setDiscardPile(currentDiscard);
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
        message: `¡Inicia la pelea! Manos vacías al inicio. Cartas se obtienen del Mazo Global por Bloqueo Perfecto o al cruzar múltiplos de 5.`,
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
    setDiscardPile(currentDiscard);
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
        message: `¡CAMPAÑA: ${chapter.title}! Derrota al Jefe. Robas del Mazo Global por Bloqueo Perfecto o al cruzar múltiplos de 5.`,
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
    setDiscardPile(currentDiscard);
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
    setDiscardPile(currentDiscard);
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
    setPlayers(prev => prev.map(player => player.id === victim.id
      ? { ...player, cubinarcaOrder: order, blocksDisabledByOrder: false }
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
    setPlayers(prev => prev.map(player => player.id === victim.id
      ? { ...player, cubinarcaOrder: order, blocksDisabledByOrder: false }
      : player
    ));
    addLog(`¡Discordia! ${issuer.name} impone una orden a ${victim.name}.`, true, issuer.name);
  };

  const fulfillCubinarcaTransfer = (cardIndex: number) => {
    const victim = currentTurnPlayer;
    const order = victim?.cubinarcaOrder;
    if (!victim || order?.kind !== 'TRANSFER_CARD') return;
    const issuer = players.find(player => player.id === order.issuerId);
    const card = victim.hand[cardIndex];
    if (!issuer || issuer.isEliminated || !card || issuer.hand.length >= getMaxHandSize(issuer)) return;
    setPlayers(prev => prev.map(player => {
      if (player.id === victim.id) return {
        ...player,
        hand: player.hand.filter((_, index) => index !== cardIndex),
        cubinarcaOrder: null,
        blocksDisabledByOrder: false
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
    const hasHandSpace = victim.hand.length < getMaxHandSize(victim);
    setPlayers(prev => prev.map(player => player.id === victim.id ? {
      ...player,
      equippedWeapons: player.equippedWeapons.filter((_, index) => index !== weaponIndex),
      hand: hasHandSpace ? [...player.hand, weapon] : player.hand,
      cubinarcaOrder: null,
      blocksDisabledByOrder: false
    } : player));
    if (!hasHandSpace) setDiscardPile(prev => [...prev, weapon]);
    addLog(`${victim.name} cumple la orden y desequipa [${weapon.name}]${hasHandSpace ? ', devolviéndola a su mano.' : '; su mano está llena y el arma va al descarte.'}`, true, victim.name);
    sound.playStanceActivate();
  };

  const defyCubinarcaOrder = () => {
    const victim = currentTurnPlayer;
    if (!victim?.cubinarcaOrder) return;
    setPlayers(prev => prev.map(player => player.id === victim.id
      ? { ...player, blocksDisabledByOrder: true }
      : player
    ));
    addLog(`${victim.name} desobedece la orden de Cubinarca: Discordia le impide bloquear hasta cumplirla.`, true, victim.name);
  };

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
          setPlayers(prev => prev.map(p => {
            if (p.id === actorId) {
              return { ...p, damageDealt: (p.damageDealt || 0) + 1 };
            }
            if (p.id !== target.id) return p;
            const newHp = Math.max(0, p.hp - 1);
            return { ...p, hp: newHp, isEliminated: newHp <= 0 };
          }));
          addLog(`⚡ ¡Sinergia Kaboom de ${heroDef.displayName}! Dispara una chispa explosiva de 1 daño a ${target.name}.`, true, actor.name);
          addFloatingText(target.id, "-1 DAÑO KABOOM", "#f97316");
          sound.playPunchHit();
        }
        break;
      }
      case CardCategory.CEREBRAL: {
        const getsAp = Math.random() < 0.5;
        if (getsAp) {
          setPlayers(prev => prev.map(p => {
            if (p.id !== actorId) return p;
            return { ...p, actionPoints: p.actionPoints + 1 };
          }));
          addLog(`🧠 ¡Sinergia Cerebral de ${heroDef.displayName}! Reembolsa +1 Punto de Acción con ingenio táctico.`, true, actor.name);
          addFloatingText(actorId, "+1 PA CEREBRAL", "#c084fc");
        } else {
          setDeck(prevDeck => {
            if (prevDeck.length === 0) return prevDeck;
            const [drawn, ...rest] = prevDeck;
            const maxH = getMaxHandSize(actor);
            const cardInstance: GameCard = {
              ...drawn,
              uid: generateUniqueCardUid(drawn.id)
            };
            setPlayers(prev => prev.map(p => {
              if (p.id !== actorId) return p;
              if (p.hand.length >= maxH) return p;
              return {
                ...p,
                hand: [...p.hand, cardInstance],
                cardsDrawn: (p.cardsDrawn || 0) + 1
              };
            }));
            triggerDeckAnimation();
            sound.playCardDraw();
            addLog(`🧠 ¡Sinergia Cerebral de ${heroDef.displayName}! Roba 1 carta táctica extra del Mazo Global.`, true, actor.name);
            addFloatingText(actorId, "+1 CARTA CEREBRAL", "#c084fc");
            return rest;
          });
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
    secondaryTargetId?: number
  ) => {
    const attacker = currentTurnPlayer;
    if (!attacker || attacker.actionPoints <= 0 || attacker.isFrozen) return;
    const target = players.find(p => p.id === targetId);
    if (!target || target.isEliminated || target.hp <= 0 || target.id === attacker.id) return;
    if (attacker.cubinarcaOrder?.kind === 'ATTACK_TARGET' && attacker.cubinarcaOrder.attackTargetId !== target.id) {
      addLog(`Discordia obliga a ${attacker.name} a atacar a ${players.find(player => player.id === attacker.cubinarcaOrder?.attackTargetId)?.name ?? 'su objetivo señalado'}.`);
      return;
    }
    const secondaryTarget = secondaryTargetId === undefined
      ? null
      : players.find(p => p.id === secondaryTargetId) || null;

    // 1. Pre-calculate Attacker Roll
    const attackerHero = attacker.activeMorphCharacter || attacker.characterType;
    if (
      secondaryTargetId !== undefined &&
      (attackerHero !== CharacterType.DRACUBON ||
        !secondaryTarget ||
        secondaryTarget.id === target.id ||
        secondaryTarget.id === attacker.id ||
        secondaryTarget.isEliminated ||
        secondaryTarget.hp <= 0)
    ) return;
    const opposingTeamId = attacker.teamId === 1 ? 2 : attacker.teamId === 2 ? 1 : null;
    if (secondaryTarget && opposingTeamId !== null && secondaryTarget.teamId !== opposingTeamId) return;
    const useDracubonBreath = attackerHero === CharacterType.DRACUBON && secondaryTarget !== null;
    const attackerRolls: number[] = [];
    let attackerFinalVal: number;

    if (attackerHero === CharacterType.TRAMCUBOSO) {
      const r1 = Math.floor(Math.random() * 6) + 1;
      const r2 = Math.floor(Math.random() * 6) + 1;
      attackerRolls.push(r1, r2);
      attackerFinalVal = Math.max(r1, r2);
    } else if (attackerHero === CharacterType.CUBINJA) {
      const r1 = Math.floor(Math.random() * 6) + 1;
      const r2 = Math.floor(Math.random() * 6) + 1;
      attackerRolls.push(r1, r2);
      attackerFinalVal = r1 + r2;
    } else if (attackerHero === CharacterType.CUBOGRO) {
      const r = Math.floor(Math.random() * 6) + 1;
      attackerRolls.push(r);
      attackerFinalVal = r === 1 ? 2 : r === 2 ? 4 : r === 3 ? 6 : r;
    } else {
      const r = Math.floor(Math.random() * 6) + 1;
      attackerRolls.push(r);
      attackerFinalVal = r;
    }

    // Special Face 6 Effect check for Attacker
    if (attackerRolls.includes(6)) {
      if (!attacker.isBot) {
        setSpecialSixChoice({
          playerId: attacker.id,
          actorName: attacker.name,
          isAttacker: true
        });
      } else {
        const botChoice = attacker.hand.length < 2 ? 'CARD' : 'EXTRA_TURN';
        handleApplySixChoice(attacker.id, botChoice);
      }
    }

    // Attacker Weapon Modifiers
    let modifiedAttackDamage = attackerFinalVal;
    if (attacker.equippedWeapons.some(w => w.id === 1) && modifiedAttackDamage >= 3) {
      modifiedAttackDamage += 1; // Bate de aluminio
    }
    if (attacker.equippedWeapons.some(w => w.id === 6)) {
      modifiedAttackDamage += 2; // Puño de hierro
    }
    if (attacker.equippedWeapons.some(w => w.id === 22)) {
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
    let dracubonReflectTriggered = false;

    const hasReflejoFelino = target.preparedStance?.id === 53;
    const hasElComodin = target.preparedStance?.id === 60;

    if (target.blocksDisabledByOrder) {
      defenderFinalVal = 0;
      defenderRolls.push(0);
      isPerfectBlock = false;
      addLog(`Discordia: ${target.name} no puede lanzar dado de bloqueo hasta obedecer la orden pendiente.`, true);
    } else if (hasReflejoFelino || hasElComodin) {
      defenderFinalVal = attackerFinalVal;
      defenderRolls.push(defenderFinalVal);
      isPerfectBlock = true;
      addLog(`${target.name} activa su postura defensiva y bloquea a la perfección!`);
    } else if (target.isFrozen) {
      const r = Math.floor(Math.random() * 6) + 1;
      defenderRolls.push(r);
      defenderFinalVal = r;
      isPerfectBlock = false; // Congelado no puede bloquear
    } else if (defenderHero === CharacterType.TRAMCUBOSO) {
      const r1 = Math.floor(Math.random() * 6) + 1;
      const r2 = Math.floor(Math.random() * 6) + 1;
      defenderRolls.push(r1, r2);
      isPerfectBlock =
        attackerRolls.includes(r1) ||
        attackerRolls.includes(r2) ||
        r1 === attackerFinalVal ||
        r2 === attackerFinalVal;
      defenderFinalVal = isPerfectBlock
        ? (attackerRolls.includes(r1) || r1 === attackerFinalVal ? r1 : r2)
        : Math.max(r1, r2);
    } else {
      const r = Math.floor(Math.random() * 6) + 1;
      defenderRolls.push(r);
      defenderFinalVal = r;
      const matchedAttack = attackerRolls.includes(r) || r === attackerFinalVal;
      if (defenderHero === CharacterType.DRACUBON) {
        // Dracubon has no normal perfect block: a matching die reflects damage instead.
        dracubonReflectTriggered = matchedAttack;
        isPerfectBlock = false;
      } else {
        isPerfectBlock = matchedAttack;
      }
    }

    // Special Face 6 Effect check for Defender
    if (defenderRolls.includes(6)) {
      if (!target.isBot) {
        setSpecialSixChoice({
          playerId: target.id,
          actorName: target.name,
          isAttacker: false
        });
      } else {
        const botChoice = target.hand.length < 2 ? 'CARD' : 'EXTRA_TURN';
        handleApplySixChoice(target.id, botChoice);
      }
    }

    // 3. Resolve Damage & Shield Barrier
    let finalDamage = isPerfectBlock ? 0 : modifiedAttackDamage;

    if (!isPerfectBlock && target.preparedStance?.id === 35) {
      finalDamage = 0;
      addLog(`${target.name} se desvanece en su Humo de Vape preparado!`);
    }

    if (finalDamage === 1 && target.equippedWeapons.some(w => w.id === 4)) {
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

    // Aliento usa la misma tirada y el mismo resultado de bloqueo para ambos rivales;
    // cada objetivo conserva sus propias reducciones y su propia Barrera de Escudo.
    let secondaryFinalDamage = 0;
    let secondaryBarrierRemaining = secondaryTarget?.shieldBarrier || 0;
    let updatedSecondaryStance = secondaryTarget?.preparedStance ?? null;
    if (useDracubonBreath && secondaryTarget && !isPerfectBlock) {
      secondaryFinalDamage = modifiedAttackDamage;
      if (secondaryTarget.preparedStance?.id === 35) {
        secondaryFinalDamage = 0;
        updatedSecondaryStance = null;
        addLog(`${secondaryTarget.name} se desvanece en su Humo de Vape preparado!`);
      }
      if (secondaryFinalDamage === 1 && secondaryTarget.equippedWeapons.some(w => w.id === 4)) {
        secondaryFinalDamage = 0;
        addLog(`La Chaqueta de Cuero de ${secondaryTarget.name} anuló el daño de 1.`);
      }
      const secondaryHero = secondaryTarget.activeMorphCharacter || secondaryTarget.characterType;
      if (secondaryHero === CharacterType.GLADIACUBON && secondaryFinalDamage >= 3) {
        secondaryFinalDamage = Math.max(1, Math.floor(secondaryFinalDamage / 2));
        addLog(`Gladiacubon de ${secondaryTarget.name} mitiga el impacto a ${secondaryFinalDamage} de daño.`);
      }
      if (secondaryFinalDamage > 0 && secondaryBarrierRemaining > 0) {
        const absorbed = Math.min(secondaryBarrierRemaining, secondaryFinalDamage);
        secondaryBarrierRemaining -= absorbed;
        secondaryFinalDamage -= absorbed;
        addLog(`🛡️ ¡La Barrera de Escudo de ${secondaryTarget.name} absorbió ${absorbed} de daño! (Quedan: ${secondaryBarrierRemaining})`);
        addFloatingText(secondaryTarget.id, `🛡️ -${absorbed} BARRERA`, "#60a5fa");
      }
    }

    // Shared reflection and life-steal resolution (Dracubon + Cubícula).
    let attackerBarrierRemaining = attacker.shieldBarrier || 0;
    let dracubonReflectedTaken = dracubonReflectTriggered ? finalDamage : 0;

    let cubiculaReflectRoll: number | null = null;
    let cubiculaReflectHeal = 0;
    let cubiculaReflectDamage = 0;
    if (defenderHero === CharacterType.CUBICULA && isPerfectBlock) {
      cubiculaReflectRoll = Math.floor(Math.random() * 6) + 1;
      cubiculaReflectHeal = cubiculaReflectRoll;
      cubiculaReflectDamage = Math.floor(cubiculaReflectRoll / 2);
      addLog(`¡Reflejo de Noche! Cubícula relanza D6 (${cubiculaReflectRoll}), devuelve ${cubiculaReflectDamage} de daño y se cura ${cubiculaReflectHeal} HP.`, true, target.name);
    }

    let reflectedDamageTaken = dracubonReflectedTaken + cubiculaReflectDamage;
    if (reflectedDamageTaken > 0 && attackerBarrierRemaining > 0) {
      const absorbed = Math.min(attackerBarrierRemaining, reflectedDamageTaken);
      attackerBarrierRemaining -= absorbed;
      reflectedDamageTaken -= absorbed;
      addLog(`La barrera de ${attacker.name} absorbe ${absorbed} del daño reflejado.`);
    }

    if (dracubonReflectTriggered && reflectedDamageTaken > 0) {
      addLog(`¡Escamas de Dracubon! ${target.name} devuelve ${reflectedDamageTaken} de daño a ${attacker.name}.`, true, target.name);
    }

    const attackerLifeStealHeal = isCubiculaAbility &&
      attackerHero === CharacterType.CUBICULA &&
      finalDamage >= 3
      ? finalDamage
      : 0;
    if (attackerLifeStealHeal > 0) {
      addLog(`¡Festín Sangriento! ${attacker.name} recupera ${attackerLifeStealHeal} HP por el daño efectivo causado.`, true, attacker.name);
    }

    const attackerNewHp = Math.min(
      attacker.maxHp,
      Math.max(0, attacker.hp - reflectedDamageTaken) + attackerLifeStealHeal
    );

    // Consume posture
    let updatedTargetStance = target.preparedStance;
    if (target.preparedStance && [35, 53, 55, 57, 59, 60].includes(target.preparedStance.id)) {
      updatedTargetStance = null;
    }

    const dracubonTrueDamage = useDracubonBreath && attacker.nextBreathBonus ? 1 : 0;
    const primaryDamageTotal = finalDamage + dracubonTrueDamage;
    const secondaryDamageTotal = secondaryFinalDamage + dracubonTrueDamage;
    const oldHp = target.hp;
    const newHp = Math.max(0, oldHp - primaryDamageTotal);
    const secondaryOldHp = secondaryTarget?.hp || 0;
    const secondaryNewHp = secondaryTarget
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
      damageDealt: primaryDamageTotal,
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
        } else if (primaryDamageTotal > 0) {
          sound.playPunchHit();
          addFloatingText(target.id, `-${primaryDamageTotal} HP`, "#ff1744");
        } else {
          sound.playCartoonBoing(260);
          addFloatingText(target.id, "¡EVADIDO!", "#7c4dff");
        }
        if (useDracubonBreath && secondaryTarget) {
          addFloatingText(
            secondaryTarget.id,
            secondaryDamageTotal > 0 ? `-${secondaryDamageTotal} HP ALIENTO` : `¡BLOQUEADO POR ${target.name}!`,
            secondaryDamageTotal > 0 ? "#ff1744" : "#7c4dff"
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
            damageDealt: primaryDamageTotal,
            attackerName: attacker.name,
            defenderName: useDracubonBreath ? `${target.name} (bloquea por ambos)` : target.name
          });

          // Threshold check: multiples of 5 (20, 15, 10, 5)
          const multiplesOf5 = [20, 15, 10, 5];
          const crossedMultiples = [
            ...multiplesOf5.filter(m => oldHp >= m && newHp < m).map(m => `${m} HP (${target.name})`),
            ...(secondaryTarget
              ? multiplesOf5.filter(m => secondaryOldHp >= m && secondaryNewHp < m).map(m => `${m} HP (${secondaryTarget.name})`)
              : [])
          ];

          let attackerCardsToAdd = 0;
          if (crossedMultiples.length > 0 && !attacker.equippedWeapons.some(w => w.id === 6)) {
            attackerCardsToAdd = crossedMultiples.length;
            triggerDeckAnimation();
            sound.playCardDraw();
            addLog(
              `¡Umbral de vida quebrado! ${attacker.name} cruzó múltiplos de 5 de ${target.name}${secondaryTarget ? ` y ${secondaryTarget.name}` : ""} (umbrales: ${crossedMultiples.join(', ')}) y roba ${attackerCardsToAdd} carta(s) del Mazo Global.`,
              true
            );
            addFloatingText(attacker.id, `+${attackerCardsToAdd} CARTA MAZO`, "#ffd600");
          }

          // Racubitero passive
          if (attackerHero === CharacterType.RACUBITERO && finalDamage > 0) {
            const stealCount = attackerRolls.includes(5) ? 2 : 1;
            attackerCardsToAdd += stealCount;
            triggerDeckAnimation();
            sound.playCardDraw();
            addLog(`¡El Racubitero saquea ${stealCount} carta(s) del Mazo por daño efectivo!`, true);
          }

          // Super-Bloqueo Heroico / Bloqueo Perfecto rewards for defender:
          let defenderCardsToAdd = 0;
          let defenderHpHeal = 0;
          if (isPerfectBlock) {
            defenderCardsToAdd = 1;
            defenderHpHeal = 2; // Recuperación heroica por Super-Bloqueo
            triggerDeckAnimation();
            sound.playCardDraw();
            const targetHeroDef = CHARACTERS[defenderHero];
            if (target.equippedWeapons.some(w => w.id === 2)) {
              defenderHpHeal += 1;
              addLog(`${target.name} cura +1 HP extra con su Tapa de Alcantarilla al bloquear.`);
            }
            addLog(
              `🛡️⚡ ¡¡SUPER-BLOQUEO HEROICO!! ${target.name} igualó el número del atacante (${defenderFinalVal})! Anula el 100% del daño y desata su Superpoder [${targetHeroDef.signatureSuperpowerName}]: ${targetHeroDef.signatureSuperpowerDesc}! Recupera +${defenderHpHeal} HP y roba 1 carta del Mazo Global.`,
              true
            );
            narrator.narrateSuperBlock(target.name, defenderFinalVal, targetHeroDef.signatureSuperpowerName);
            if (defenderHero === CharacterType.DRACUBON) {
              addLog(`¡Llamarada Doble preparada! El próximo Aliento de ${target.name} hará 1 de daño ineludible a ambos objetivos.`, true, target.name);
            }
          } else if (primaryDamageTotal > 0) {
            narrator.narrateAttack(attacker.name, target.name, primaryDamageTotal, attackerFinalVal);
          }

          // Update state
          let currentDeckState = [...deck];
          let currentDiscardState = [...discardPile];

          setPlayers(prevPlayers =>
            prevPlayers.map(p => {
              if (p.id === attacker.id) {
                const newHand = [...p.hand];
                const maxH =
                  p.characterType === CharacterType.HADA_AL_CUBO
                    ? 4
                    : p.equippedWeapons.some(w => w.id === 13)
                    ? 3
                    : 2;

                let attackerDrawnCount = 0;
                for (let i = 0; i < attackerCardsToAdd; i++) {
                  if (newHand.length < maxH) {
                    const drawRes = drawCardFromDeck(currentDeckState, currentDiscardState);
                    currentDeckState = drawRes.newDeck;
                    currentDiscardState = drawRes.newDiscard;
                    if (drawRes.card) {
                      newHand.push(drawRes.card);
                      attackerDrawnCount++;
                    }
                  }
                }

                const fulfilledAttackOrder = p.cubinarcaOrder?.kind === 'ATTACK_TARGET' && p.cubinarcaOrder.attackTargetId === target.id;
                return {
                  ...p,
                  hp: attackerNewHp,
                  isEliminated: attackerNewHp <= 0,
                  cubinarcaOrder: fulfilledAttackOrder ? null : p.cubinarcaOrder,
                  blocksDisabledByOrder: fulfilledAttackOrder ? false : p.blocksDisabledByOrder,
                  shieldBarrier: attackerBarrierRemaining,
                  actionPoints: Math.max(0, p.actionPoints - 1),
                  hand: newHand,
                  damageDealt: (p.damageDealt || 0) + primaryDamageTotal + secondaryDamageTotal,
                  nextBreathBonus: useDracubonBreath && p.nextBreathBonus ? false : p.nextBreathBonus,
                  cardsDrawn: (p.cardsDrawn || 0) + attackerDrawnCount,
                  nextAttackBonus: attackerHero === CharacterType.FLAUCUBISTA_DESAFINADO && flaucubistaBonus > 0
                    ? 0
                    : p.nextAttackBonus
                };
              } else if (p.id === target.id) {
                const newHand = [...p.hand];
                const maxH =
                  p.characterType === CharacterType.HADA_AL_CUBO
                    ? 4
                    : p.equippedWeapons.some(w => w.id === 13)
                    ? 3
                    : 2;

                let defenderDrawnCount = 0;
                for (let i = 0; i < defenderCardsToAdd; i++) {
                  if (newHand.length < maxH) {
                    const drawRes = drawCardFromDeck(currentDeckState, currentDiscardState);
                    currentDeckState = drawRes.newDeck;
                    currentDiscardState = drawRes.newDiscard;
                    if (drawRes.card) {
                      newHand.push(drawRes.card);
                      defenderDrawnCount++;
                    }
                  }
                }

                return {
                  ...p,
                  hp: Math.min(p.maxHp, newHp + defenderHpHeal + cubiculaReflectHeal),
                  damageDealt: (p.damageDealt || 0) + reflectedDamageTaken,
                  nextAttackBonus: defenderHero === CharacterType.FLAUCUBISTA_DESAFINADO && primaryDamageTotal > 0
                    ? (p.nextAttackBonus || 0) + 1
                    : p.nextAttackBonus,
                  nextBreathBonus: defenderHero === CharacterType.DRACUBON && isPerfectBlock
                    ? true
                    : p.nextBreathBonus,
                  hand: newHand,
                  preparedStance: updatedTargetStance,
                  shieldBarrier: targetBarrierRemaining,
                  isEliminated: newHp <= 0,
                  perfectBlocks: (p.perfectBlocks || 0) + (isPerfectBlock ? 1 : 0),
                  cardsDrawn: (p.cardsDrawn || 0) + defenderDrawnCount
                };
              } else if (secondaryTarget && p.id === secondaryTarget.id) {
                const secondaryHero = secondaryTarget.activeMorphCharacter || secondaryTarget.characterType;
                return {
                  ...p,
                  hp: secondaryNewHp,
                  isEliminated: secondaryNewHp <= 0,
                  shieldBarrier: secondaryBarrierRemaining,
                  preparedStance: updatedSecondaryStance,
                  nextAttackBonus: secondaryHero === CharacterType.FLAUCUBISTA_DESAFINADO && secondaryDamageTotal > 0
                    ? (p.nextAttackBonus || 0) + 1
                    : p.nextAttackBonus
                };
              }
              return p;
            })
          );

          const alientoDamageTotal = primaryDamageTotal + secondaryDamageTotal;
          if (!attacker.isBot && alientoDamageTotal > 0) {
            dailyMissionsManager.recordDamage(alientoDamageTotal);
          }
          if (isPerfectBlock) {
            dailyMissionsManager.recordPerfectBlock();
          }

          setDeck(currentDeckState);
          setDiscardPile(currentDiscardState);

          if (attackerNewHp <= 0 && !attacker.isEliminated) {
            sound.playElimination();
            addLog(`¡K.O.! ${attacker.name} cayó por el daño devuelto por ${dracubonReflectTriggered ? "las Escamas de Dracubon" : "el Reflejo de Noche de Cubícula"}.`, true);
            narrator.narrateElimination(attacker.name);
          }

          if (secondaryTarget && secondaryNewHp <= 0) {
            sound.playElimination();
            addLog(`¡K.O.! ${secondaryTarget.name} ha sido eliminado por el segundo impacto de Aliento.`, true);
            narrator.narrateElimination(secondaryTarget.name);
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
                if (!defender || defender.isEliminated || defender.hand.length === 0) return latestPlayers;

                if (!defender.isBot) {
                  setReactionPlayer(defender);
                  return latestPlayers;
                } else {
                  const weapon = defender.hand.find(c => c.type === CardType.WEAPON);
                  const stance = defender.hand.find(c => c.type === CardType.TRICK && c.timing === TrickTiming.PREPARED_STANCE);
                  const maxSlots = defender.characterType === CharacterType.CUBINJA ? 99 : 1;

                  if (weapon && defender.equippedWeapons.length < maxSlots) {
                    sound.playCardDraw();
                    addLog(`¡Reacción! ${defender.name} aprovecha su Bloqueo Perfecto y equipa [${weapon.name}] de inmediato!`, true);
                    return latestPlayers.map(p => p.id === defender.id ? {
                      ...p,
                      hand: p.hand.filter(c => c.id !== weapon.id),
                      equippedWeapons: [...p.equippedWeapons, weapon]
                    } : p);
                  } else if (stance && !defender.preparedStance) {
                    sound.playStanceActivate();
                    addLog(`¡Reacción! ${defender.name} aprovecha su Bloqueo Perfecto y prepara [${stance.name}] de inmediato!`, true);
                    return latestPlayers.map(p => p.id === defender.id ? {
                      ...p,
                      hand: p.hand.filter(c => c.id !== stance.id),
                      preparedStance: stance
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

  // Reaction handlers for Perfect Block
  const handleEquipReaction = (cardId: number) => {
    if (!reactionPlayer) return;
    const card = reactionPlayer.hand.find(c => c.id === cardId && c.type === CardType.WEAPON);
    if (!card) return;
    sound.playCardDraw();
    const newHand = reactionPlayer.hand.filter(c => c.id !== cardId);
    const newWeapons = [...reactionPlayer.equippedWeapons];
    const maxSlots =
      reactionPlayer.characterType === CharacterType.CUBINJA
        ? 99
        : reactionPlayer.characterType === CharacterType.HADA_AL_CUBO ||
          reactionPlayer.characterType === CharacterType.GLADIACUBON
        ? 2
        : 1;

    let discarded: GameCard | null = null;
    if (newWeapons.length >= maxSlots) {
      discarded = newWeapons.shift() || null;
    }
    newWeapons.push(card);
    if (discarded) setDiscardPile(prev => [...prev, discarded!]);

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

  const handleActivateReaction = (cardId: number) => {
    if (!reactionPlayer) return;
    const card = reactionPlayer.hand.find(
      c => c.id === cardId && c.type === CardType.TRICK && c.timing === TrickTiming.RITUAL_ACTION
    );
    if (!card) return;
    sound.playCardDraw();
    const newHand = reactionPlayer.hand.filter(c => c.id !== cardId);
    setDiscardPile(prev => [...prev, card]);

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

  const handlePrepareReaction = (cardId: number) => {
    if (!reactionPlayer) return;
    const card = reactionPlayer.hand.find(
      c => c.id === cardId && c.type === CardType.TRICK && c.timing === TrickTiming.PREPARED_STANCE
    );
    if (!card) return;
    sound.playStanceActivate();
    const newHand = reactionPlayer.hand.filter(c => c.id !== cardId);
    if (reactionPlayer.preparedStance) {
      setDiscardPile(prev => [...prev, reactionPlayer.preparedStance!]);
    }

    setPlayers(prev =>
      prev.map(p =>
        p.id === reactionPlayer.id
          ? { ...p, hand: newHand, preparedStance: card }
          : p
      )
    );
    addLog(`¡Reacción! ${reactionPlayer.name} preparó la postura [${card.name}] tras su Bloqueo Perfecto!`, true);
    applyCardClassSynergy(reactionPlayer.id, card);
    setReactionPlayer(null);
  };

  const handleSkipReaction = () => {
    setReactionPlayer(null);
  };

  // Equip Weapon
  const handleEquipWeapon = (cardId: number) => {
    const attacker = currentTurnPlayer;
    if (!attacker || attacker.actionPoints <= 0) return;
    const card = attacker.hand.find(c => c.id === cardId && c.type === CardType.WEAPON);
    if (!card) return;

    sound.playCardDraw();
    const isFreeAction = card.id === 25; // Navaja Suiza
    const newHand = attacker.hand.filter(c => c.id !== cardId);
    const newWeapons = [...attacker.equippedWeapons];

    const maxSlots =
      attacker.characterType === CharacterType.CUBINJA
        ? 99
        : attacker.characterType === CharacterType.HADA_AL_CUBO ||
          attacker.characterType === CharacterType.GLADIACUBON
        ? 2
        : 1;

    let discarded: GameCard | null = null;
    if (newWeapons.length >= maxSlots) {
      discarded = newWeapons.shift() || null;
    }
    newWeapons.push(card);

    if (discarded) {
      setDiscardPile(prev => [...prev, discarded!]);
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
    if (!attacker.isBot) dailyMissionsManager.recordCardPlayed();
    applyCardClassSynergy(attacker.id, card, selectedTargetId);
  };

  // Prepare Stance
  const handlePrepareStance = (cardId: number) => {
    const attacker = currentTurnPlayer;
    if (!attacker || attacker.actionPoints <= 0) return;
    const card = attacker.hand.find(
      c => c.id === cardId && c.type === CardType.TRICK && c.timing === TrickTiming.PREPARED_STANCE
    );
    if (!card) return;

    sound.playStanceActivate();
    const newHand = attacker.hand.filter(c => c.id !== cardId);

    if (attacker.preparedStance) {
      setDiscardPile(prev => [...prev, attacker.preparedStance!]);
    }

    setPlayers(prev =>
      prev.map(p =>
        p.id === attacker.id
          ? {
              ...p,
              actionPoints: Math.max(0, p.actionPoints - 1),
              hand: newHand,
              preparedStance: card
            }
          : p
      )
    );

    addLog(`${attacker.name} preparó la postura: [${card.name}]`, true);
    if (!attacker.isBot) dailyMissionsManager.recordCardPlayed();
    applyCardClassSynergy(attacker.id, card, selectedTargetId);
  };

  // Play Action Trick
  const handlePlayActionTrick = (cardId: number, targetId?: number) => {
    const attacker = currentTurnPlayer;
    if (!attacker || attacker.actionPoints <= 0) return;
    const card = attacker.hand.find(
      c => c.id === cardId && c.type === CardType.TRICK && c.timing === TrickTiming.RITUAL_ACTION
    );
    if (!card) return;

    sound.playCardDraw();
    if (!attacker.isBot) dailyMissionsManager.recordCardPlayed();
    const newHand = attacker.hand.filter(c => c.id !== cardId);
    setDiscardPile(prev => [...prev, card]);

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
  const handleUseHeroAbility = (targetId?: number, extraOption?: number) => {
    const actor = currentTurnPlayer;
    if (!actor || actor.abilityCooldownRemaining > 0) return;
    const hero = actor.activeMorphCharacter || actor.characterType;

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
        addLog("Suministro Mágico no pudo activarse: el mazo y el descarte están vacíos.");
        return;
      }
      const secondDraw = drawCardFromDeck(firstDraw.newDeck, firstDraw.newDiscard);
      if (!secondDraw.card) {
        addLog("Suministro Mágico necesita dos cartas; no hay suficientes cartas disponibles.");
        return;
      }

      const drawnCards = [firstDraw.card, secondDraw.card];
      setDeck(secondDraw.newDeck);
      setDiscardPile(secondDraw.newDiscard);
      triggerDeckAnimation();
      sound.playCardDraw();

      if (actor.isBot) {
        const ally = availableAllies[Math.floor(Math.random() * availableAllies.length)];
        const giftIndex = Math.floor(Math.random() * drawnCards.length);
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
    } else if (hero === CharacterType.CUBICULA) {
      const target = players.find(p => p.id === targetId && !p.isEliminated && p.hp > 0 && p.id !== actor.id);
      if (!target || actor.actionPoints <= 0) return;
      addLog(`${actor.name} activa [Festín Sangriento] contra ${target.name}. Si inflige al menos 3 de daño efectivo, recuperará esa cantidad de HP.`, true, actor.name);
      handleAttack(target.id, true);
    } else if (hero === CharacterType.FLAUCUBISTA_DESAFINADO) {
      // La apuesta del Flaucubista es una excepción explícita: usa D5, no el D6 general.
      const chosenNum = extraOption && extraOption >= 1 && extraOption <= 5
        ? extraOption
        : Math.floor(Math.random() * 5) + 1;
      const roll = Math.floor(Math.random() * 5) + 1;
      sound.playDiceRoll();

      if (roll === chosenNum) {
        const affectedEnemies = players.filter(p => p.id !== actor.id && !p.isEliminated).length;
        setPlayers(prev =>
          prev.map(p => {
            if (p.id === actor.id) {
              return {
                ...p,
                hp: Math.min(p.maxHp, p.hp + 2),
                damageDealt: (p.damageDealt || 0) + (affectedEnemies * 2)
              };
            }
            if (!p.isEliminated) {
              const nhp = Math.max(0, p.hp - 2);
              return { ...p, hp: nhp, isEliminated: nhp <= 0 };
            }
            return p;
          })
        );
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

  // End Turn
  const handleEndTurn = () => {
    if (players.length === 0) return;
    const endingPlayer = players[turnIndex];
    if (endingPlayer?.cubinarcaOrder && !endingPlayer.blocksDisabledByOrder) {
      setPlayers(prev => prev.map(player => player.id === endingPlayer.id
        ? { ...player, blocksDisabledByOrder: true }
        : player
      ));
      addLog(`${endingPlayer.name} terminó su turno sin cumplir la orden: Discordia le quita la capacidad de bloquear.`, true, endingPlayer.name);
    }

    // 1. Check if only 1 survivor or 1 team remains
    const alivePlayers = players.filter(p => !p.isEliminated && p.hp > 0);
    if (alivePlayers.length <= 1) {
      checkVictory(players);
      return;
    }

    // 2. Step forward in a single pass until we find the next non-eliminated player
    let nextIdx = (turnIndex + 1) % players.length;
    let cycles = 0;
    let roundsToAdd = 0;

    while ((players[nextIdx].isEliminated || players[nextIdx].hp <= 0) && cycles < players.length) {
      if (nextIdx === 0) {
        roundsToAdd++;
      }
      nextIdx = (nextIdx + 1) % players.length;
      cycles++;
    }

    if (cycles >= players.length) {
      checkVictory(players);
      return;
    }

    const nextRound = (nextIdx <= turnIndex) ? round + 1 + roundsToAdd : round + roundsToAdd;

    const updated = players.map((p, idx) => {
      if (idx === nextIdx) {
        return {
          ...p,
          actionPoints: 2,
          isFrozen: false,
          abilityCooldownRemaining: Math.max(0, p.abilityCooldownRemaining - 1)
        };
      }
      return p;
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
    const hasTeams = playersList.some(p => p.teamId === 1) && playersList.some(p => p.teamId === 2);

    if (hasTeams) {
      const aliveTeam1 = playersList.filter(p => p.teamId === 1 && !p.isEliminated && p.hp > 0);
      const aliveTeam2 = playersList.filter(p => p.teamId === 2 && !p.isEliminated && p.hp > 0);

      if (aliveTeam1.length === 0 && aliveTeam2.length > 0) {
        setWinner(aliveTeam2[0]);
        setPhase(MatchPhase.MATCH_OVER);
        addLog(`¡¡EL BANDO RIVAL (ROJO) HA DERROTADO A TODA TU ESCUADRA!!`, true, "Árbitro");
        narrator.narrateVictory("El Bando Rojo");
        collectionManager.recordMatchResult(false);
        dailyMissionsManager.recordMatch(false);
        addLog(`+15 Aura de Calle obtenida por aguantar la refriega.`, true, "Aura");
        if (gameMode === GameMode.ONLINE_PVP) {
          collectionManager.addCoins(25);
          addFloatingText(playersList[0]?.id || 1, "+25 Cubi-Monedas de Consuelo", "#fbbf24");
        }
        return;
      } else if (aliveTeam2.length === 0 && aliveTeam1.length > 0) {
        setWinner(aliveTeam1[0]);
        setPhase(MatchPhase.MATCH_OVER);
        addLog(`¡¡VICTORIA TOTAL! TU BANDO (AZUL) HA DERROTADO A TODOS LOS RIVALES!!`, true, "Árbitro");
        narrator.narrateVictory("Tu Escuadra Azul");
        collectionManager.recordMatchResult(true);
        dailyMissionsManager.recordMatch(true);
        addLog(`¡¡+35 AURA DE CALLE Y +1 CAJA DE 3 DADOS DESBLOQUEADA!!`, true, "Aura");
        addFloatingText(playersList[0]?.id || 1, "¡+1 CAJA DE 3 DADOS!", "#ffd600");
        if (gameMode === GameMode.ONLINE_PVP) {
          collectionManager.addCoins(60);
          addFloatingText(playersList[0]?.id || 1, "¡+60 Cubi-Monedas de Victoria!", "#ffd600");
        }
        return;
      }
    }

    const alive = playersList.filter(p => !p.isEliminated && p.hp > 0);
    if (alive.length <= 1 && playersList.length > 1) {
      const champ = alive[0] || null;
      setWinner(champ);
      setPhase(MatchPhase.MATCH_OVER);
      if (champ) {
        addLog(`¡¡${champ.name} ES EL CAMPEÓN SUPREMO DE GUERRA CUBITA!!`, true, "Árbitro");
        narrator.narrateVictory(champ.name);
        const isHumanChamp = !champ.isBot;
        collectionManager.recordMatchResult(isHumanChamp);
        dailyMissionsManager.recordMatch(isHumanChamp);
        if (isHumanChamp) {
          addLog(`¡¡+35 AURA DE COMBATE Y +1 CAJA DE 3 DADOS GANADA!!`, true, "Aura");
          addFloatingText(champ.id, "¡+1 CAJA DE 3 DADOS!", "#ffd600");
          if (gameMode === GameMode.ONLINE_PVP) {
            collectionManager.addCoins(60);
          }
        } else {
          addLog(`+15 Aura de combate disputado.`, true, "Aura");
          if (gameMode === GameMode.ONLINE_PVP) {
            collectionManager.addCoins(25);
          }
        }
      }
    }
  };

  // Auto-skip turn if current active player is eliminated or dead (CRITICAL FIX FOR STUCK 'PENSANDO')
  useEffect(() => {
    if (currentScreen !== CurrentScreen.ARENA || winner || isMatchIntroPlaying) return;
    const currentP = players[turnIndex];
    if (currentP && (currentP.isEliminated || currentP.hp <= 0)) {
      const skipTimer = setTimeout(() => {
        handleEndTurn();
      }, 300 * speedMultiplier);
      return () => clearTimeout(skipTimer);
    }
  }, [turnIndex, players, currentScreen, winner, isMatchIntroPlaying, speedMultiplier]);

  // Bot AI Turn execution
  useEffect(() => {
    if (currentScreen !== CurrentScreen.ARENA || winner || isMatchIntroPlaying) return;
    const activePlayer = players[turnIndex];
    if (!activePlayer || !activePlayer.isBot || activePlayer.isEliminated || activePlayer.hp <= 0) return;

    const timer = setTimeout(() => {
      const activeHero = activePlayer.activeMorphCharacter || activePlayer.characterType;

      // Los bots obedecen las órdenes al comenzar su turno. Si no pueden cumplirlas,
      // conservan la orden y pierden la capacidad de bloquear hasta resolverla.
      const pendingOrder = activePlayer.cubinarcaOrder;
      if (pendingOrder) {
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
              ? { ...player, blocksDisabledByOrder: true }
              : player
            ));
          }
        } else if (pendingOrder.kind === 'TRANSFER_CARD') {
          const card = activePlayer.hand[0];
          if (issuer && !issuer.isEliminated && card && issuer.hand.length < getMaxHandSize(issuer)) {
            setPlayers(prev => prev.map(player => {
              if (player.id === activePlayer.id) return {
                ...player,
                hand: player.hand.slice(1),
                cubinarcaOrder: null,
                blocksDisabledByOrder: false
              };
              if (player.id === issuer.id) return { ...player, hand: [...player.hand, card] };
              return player;
            }));
            addLog(`${activePlayer.name} obedece la orden y entrega [${card.name}] a ${issuer.name}.`, true, activePlayer.name);
          } else {
            setPlayers(prev => prev.map(player => player.id === activePlayer.id
              ? { ...player, blocksDisabledByOrder: true }
              : player
            ));
          }
        } else if (pendingOrder.kind === 'UNEQUIP_WEAPON') {
          const weapon = activePlayer.equippedWeapons[0];
          if (weapon) {
            const hasSpace = activePlayer.hand.length < getMaxHandSize(activePlayer);
            setPlayers(prev => prev.map(player => player.id === activePlayer.id ? {
              ...player,
              equippedWeapons: player.equippedWeapons.slice(1),
              hand: hasSpace ? [...player.hand, weapon] : player.hand,
              cubinarcaOrder: null,
              blocksDisabledByOrder: false
            } : player));
            if (!hasSpace) setDiscardPile(prev => [...prev, weapon]);
            addLog(`${activePlayer.name} obedece la orden y desequipa [${weapon.name}].`, true, activePlayer.name);
          } else {
            setPlayers(prev => prev.map(player => player.id === activePlayer.id
              ? { ...player, blocksDisabledByOrder: true }
              : player
            ));
          }
        }
        setTimeout(() => handleEndTurn(), pendingOrder.kind === 'ATTACK_TARGET' ? 3600 * speedMultiplier : 900 * speedMultiplier);
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
        deck.length + discardPile.length >= 2
      ) {
        handleUseHeroAbility();
        return;
      }

      // 1. Try to equip weapon or prepare stance
      const weapon = activePlayer.hand.find(c => c.type === CardType.WEAPON);
      const stance = activePlayer.hand.find(
        c => c.type === CardType.TRICK && c.timing === TrickTiming.PREPARED_STANCE
      );

      const maxSlots =
        activePlayer.characterType === CharacterType.CUBINJA
          ? 99
          : activePlayer.characterType === CharacterType.HADA_AL_CUBO ||
            activePlayer.characterType === CharacterType.GLADIACUBON
          ? 2
          : 1;

      if (weapon && activePlayer.equippedWeapons.length < maxSlots && activePlayer.actionPoints > 0) {
        handleEquipWeapon(weapon.id);
      } else if (stance && !activePlayer.preparedStance && activePlayer.actionPoints > 0) {
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
            const target = rivals.reduce(
              (prev, curr) => (curr.hp < prev.hp ? curr : prev),
              rivals[0]
            );
            if (target) {
              setSelectedTargetId(target.id);
              const activeHero = currentP.activeMorphCharacter || currentP.characterType;
              if (activeHero === CharacterType.DRACUBON && rivals.length >= 2) {
                const secondTarget = rivals.find(p => p.id !== target.id);
                if (secondTarget) handleUseHeroAbility(target.id, secondTarget.id);
                else handleAttack(target.id);
              } else if (activeHero === CharacterType.CUBICULA && currentP.actionPoints >= 2) {
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
  }, [turnIndex, players, currentScreen, winner, isMatchIntroPlaying, speedMultiplier]);

  return (
    <div className="w-full min-h-screen bg-[#0f1116] text-white">
      {currentScreen === CurrentScreen.TITLE && (
        <TitleScreen
          onStartClick={() => setCurrentScreen(CurrentScreen.SETUP)}
          onDraftClick={() => setCurrentScreen(CurrentScreen.DRAFT)}
          onCampaignClick={() => setCurrentScreen(CurrentScreen.CAMPAIGN)}
          onPassAndPlayClick={() => setCurrentScreen(CurrentScreen.PASS_AND_PLAY_SETUP)}
          onRosterClick={() => setCurrentScreen(CurrentScreen.ROSTER)}
          onCardsClick={() => setCurrentScreen(CurrentScreen.ENCYCLOPEDIA)}
          onOnlineClick={() => setCurrentScreen(CurrentScreen.ONLINE_LOBBY)}
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
          round={round}
          players={players}
          currentTurnPlayer={currentTurnPlayer}
          selectedTargetId={selectedTargetId}
          supplyMagicOffer={supplyMagicOffer}
          onConfirmSupplyMagic={handleConfirmSupplyMagic}
          deckCount={deck.length}
          discardPileCount={discardPile.length}
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
          onUseHeroAbility={(tId, opt) => handleUseHeroAbility(tId, opt)}
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
        />
      )}

      {specialSixChoice && (
        <DiceSpecialChoiceModal
          actorName={specialSixChoice.actorName}
          isAttacker={specialSixChoice.isAttacker}
          onChoose={(choice) => handleApplySixChoice(specialSixChoice.playerId, choice)}
        />
      )}
    </div>
  );
}
