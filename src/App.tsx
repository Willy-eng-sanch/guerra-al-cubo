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
  MatchResultSummary,
  PlayerState,
  TrickTiming,
  getMaxHandSize,
  rollBattleDie,
  rollD6,
} from './types/game';
import { ALL_CARDS, createShuffledDeck } from './data/cards';
import { CHARACTER_LIST, CHARACTERS } from './data/characters';
import { DEFAULT_CHAPTERS } from './data/campaign';
import {
  CampaignProgress,
  GameStats,
  loadCampaignProgress,
  loadStats,
  recordMatchResult,
  saveCampaignProgress
} from './lib/persistence';
import { sound } from './audio/soundManager';
import { music } from './audio/musicManager';
import { narrator } from './audio/narratorManager';

import { TitleScreen } from './screens/TitleScreen';
import { SetupScreen } from './screens/SetupScreen';
import { PassAndPlaySetupScreen } from './screens/PassAndPlaySetupScreen';
import { CampaignScreen } from './screens/CampaignScreen';
import { RosterScreen } from './screens/RosterScreen';
import { EncyclopediaScreen } from './screens/EncyclopediaScreen';
import { ArenaScreen } from './screens/ArenaScreen';
import { DraftScreen } from './screens/DraftScreen';
import { DifficultySelector } from './components/DifficultySelector';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<CurrentScreen>(CurrentScreen.TITLE);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.QUICK_BATTLE);

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
  const [campaignChapters, setCampaignChapters] = useState<CampaignChapter[]>(() => {
    const progress = loadCampaignProgress();
    return DEFAULT_CHAPTERS.map(chap => ({
      ...chap,
      isUnlocked: chap.id <= progress.unlockedChapterId,
      isCompleted: progress.completedChapterIds.includes(chap.id)
    }));
  });
  const [playerStats, setPlayerStats] = useState<GameStats>(() => loadStats());
  // Tracking de estadísticas del combate actual (para el Jugador 1 / humano)
  const battleTrackRef = useRef({ damageDealt: 0, perfectBlocks: 0 });
  const resultRecordedRef = useRef(false);
  const activeChapterIdRef = useRef<number | null>(null);
  // MEJORA: resumen de resultado para pantalla de victoria enriquecida
  const [lastMatchResult, setLastMatchResult] = useState<MatchResultSummary | null>(null);
  const [reactionPlayer, setReactionPlayer] = useState<PlayerState | null>(null);
  const [isDeckDrawing, setIsDeckDrawing] = useState<boolean>(false);
  const [isMatchIntroPlaying, setIsMatchIntroPlaying] = useState<boolean>(false);
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

  // REGLA OFICIAL DEL D6: si sale 6, se ROBA 1 carta del Mazo Global
  // y se VUELVE A LANZAR el dado. El resultado que cuenta es el del
  // relanzamiento (y la cadena se repite si vuelve a salir 6).
  const applySixReroll = (
    playerId: number,
    actorName: string,
    res: { finalValue: number; sixCount: number; rolls: number[] }
  ): number => {
    if (res.sixCount <= 0) return res.finalValue;
    for (let i = 0; i < res.sixCount; i++) {
      setDeck(prevDeck => {
        let d = [...prevDeck];
        let disc: GameCard[] = [];
        if (d.length === 0) {
          // Si el mazo está vacío, rebaraja el descarte antes de robar
          setDiscardPile(prevDiscard => {
            disc = prevDiscard;
            return [];
          });
          d = disc
            .map(c => ({ ...c, uid: `${c.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` }))
            .sort(() => Math.random() - 0.5);
        }
        const drawn = d.shift();
        if (drawn) {
          const cardInstance: GameCard = {
            ...drawn,
            uid: `${drawn.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
          };
          setPlayers(prev =>
            prev.map(p => {
              if (p.id !== playerId) return p;
              const maxH = getMaxHandSize(p);
              if (p.hand.length >= maxH) {
                setDiscardPile(pd => [...pd, cardInstance]);
                addLog(`¡CARA 6! ${actorName} roba carta por el 6, pero su mano está llena: [${cardInstance.name}] va al descarte.`);
              } else {
                setPlayers(pp => pp.map(q => (q.id === playerId ? { ...q, hand: [...q.hand, cardInstance] } : q)));
                addFloatingText(playerId, "+1 CARTA (por el 6)", "#00e5ff");
                addLog(`¡CARA 6! ${actorName} roba [${cardInstance.name}] del Mazo Global y RELANZA el dado.`, true);
              }
              return p;
            })
          );
          triggerDeckAnimation();
          sound.playCardDraw();
        }
        return d;
      });
    }
    return res.finalValue;
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
        return [deckArr.splice(idx, 1)[0]];
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
        d = [...disc]
          .map(c => ({
            ...c,
            uid: `${c.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
          }))
          .sort(() => Math.random() - 0.5);
        disc = [];
      } else {
        return { card: null, newDeck: d, newDiscard: disc };
      }
    }

    const card = d.shift() || null;
    if (card && !card.uid) {
      card.uid = `${card.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
    return { card, newDeck: d, newDiscard: disc };
  };

  const resetBattleTrackers = (chapterId: number | null = null) => {
    battleTrackRef.current = { damageDealt: 0, perfectBlocks: 0 };
    resultRecordedRef.current = false;
    activeChapterIdRef.current = chapterId;
    setLastMatchResult(null);
  };

  // Start 3 vs 3 Draft Battle
  const startDraftMatch = (playerTeam: CharacterType[], rivalTeam: CharacterType[]) => {
    resetBattleTrackers();
    botSkillLevelRef.current = 'HARD'; // Batallas de escuadras: siempre al máximo desafío
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
        hp: 20,
        maxHp: 20,
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
        shieldBarrier: 0
      });

      // Rival hero
      const rHero = rivalTeam[i];
      const rWeapons = getInitialWeapons(rHero, currentDeck);

      newPlayers.push({
        id: (i * 2) + 2,
        name: `Rival: ${CHARACTERS[rHero].displayName.slice(0, 7)}`,
        characterType: rHero,
        hp: 20,
        maxHp: 20,
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
        shieldBarrier: 0
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
        message: `¡Guerra de Escuadras 3 vs 3! Manos vacías al inicio. Cartas se obtienen del Mazo Global por Bloqueo Perfecto o al quebrar umbrales de vida (≤15, ≤10, ≤5 HP).`,
        isCritical: true
      }
    ]);
    setCurrentScreen(CurrentScreen.ARENA);
    sound.playDiceRoll();
    music.play();
    narrator.narrateMatchStart("Guerra de Escuadras 3 contra 3");
  };

  // Start Quick Battle
  const startQuickMatch = (playerCount: number = 3, chosenHero: CharacterType = CharacterType.TRAMCUBOSO) => {
    resetBattleTrackers();
    botSkillLevelRef.current = 'HARD';
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
      hp: 20,
      maxHp: 20,
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
      shieldBarrier: 0
    });

    // Bots
    for (let i = 2; i <= playerCount; i++) {
      const botHero = otherHeroes[i - 2].type;
      const bWeapons = getInitialWeapons(botHero, currentDeck);

      newPlayers.push({
        id: i,
        name: `Bot ${i} (${CHARACTERS[botHero].displayName.slice(0, 7)})`,
        characterType: botHero,
        hp: 20,
        maxHp: 20,
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
        shieldBarrier: 0
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
    resetBattleTrackers(chapter.id);
    // Aplica la dificultad elegida + bonificación por capítulo avanzado
    const chapterBoost = Math.floor((chapter.id - 1) / 2); // cap 1-2: +0, cap 3-4: +1
    const effectiveLevel = Math.min(3, campaignDifficulty + chapterBoost);
    botSkillLevelRef.current = effectiveLevel >= 3 ? 'HARD' : effectiveLevel === 2 ? 'NORMAL' : 'EASY';
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
      hp: 20,
      maxHp: 20,
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
      shieldBarrier: 0
    });

    // Boss
    const bossHero = chapter.bossCharacter;
    const bossWeapons = getInitialWeapons(bossHero, currentDeck);
    newPlayers.push({
      id: 2,
      name: `JEFE: ${CHARACTERS[bossHero].displayName.slice(0, 7)}`,
      characterType: bossHero,
      hp: 20,
      maxHp: 20,
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
      shieldBarrier: 0
    });

    // Minions
    chapter.minionCharacters.forEach((mHero, idx) => {
      const mWeapons = getInitialWeapons(mHero, currentDeck);
      newPlayers.push({
        id: 3 + idx,
        name: `Esbirro: ${CHARACTERS[mHero].displayName.slice(0, 7)}`,
        characterType: mHero,
        hp: 20,
        maxHp: 20,
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
        shieldBarrier: 0
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
    resetBattleTrackers();
    botSkillLevelRef.current = 'NORMAL'; // Local: la IA solo interviene si queda algún bot
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
        hp: 20,
        maxHp: 20,
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
        shieldBarrier: 0
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

  const currentTurnPlayer = players[turnIndex] || null;

  // ============================================================
  // MEJORA: IA de bots con niveles (FÁCIL / NORMAL / DIFÍCIL)
  // - Fácil: decisiones aleatorias, a veces ni usa cartas.
  // - Normal: equilibra equipar/postura/ataque según su situación.
  // - Difícil: prioriza rematar enemigos débiles, se cura, prepara
  //   posturas defensivas y usa trucos ofensivos/iniciativa.
  // ============================================================
  const botSkillLevelRef = useRef<BotSkillLevel>('HARD');

  const applyBotSkillLevel = (level: number, chapterBoost = 0) => {
    const effective = Math.min(3, Math.max(1, level + chapterBoost));
    botSkillLevelRef.current = effective >= 3 ? 'HARD' : effective === 2 ? 'NORMAL' : 'EASY';
  };

  const getBotMaxWeaponSlots = (p: PlayerState): number => {
    const hero = p.activeMorphCharacter || p.characterType;
    if (hero === CharacterType.CUBINJA) return 99;
    if (hero === CharacterType.HADA_AL_CUBO || hero === CharacterType.GLADIACUBON) return 2;
    return 1;
  };

  const pickBotTarget = (bot: PlayerState, roster: PlayerState[]): PlayerState | null => {
    const opposingTeamId = bot.teamId === 1 ? 2 : bot.teamId === 2 ? 1 : null;
    const rivals = roster.filter(
      p => !p.isEliminated && p.hp > 0 && p.id !== bot.id && (!opposingTeamId || p.teamId === opposingTeamId)
    );
    if (rivals.length === 0) return null;

    if (botSkillLevelRef.current === 'EASY') {
      return rivals[Math.floor(Math.random() * rivals.length)];
    }

    if (botSkillLevelRef.current === 'HARD') {
      // 1) Buscar un golpe letal (daño esperado >= HP del rival)
      const lethal = rivals.find(r => r.hp <= 3);
      if (lethal && Math.random() < 0.85) return lethal;
      // 2) Sino, atacar al más débil, dando prioridad a objetivos congelados
      const frozenWeak = rivals.filter(r => r.isFrozen).sort((a, b) => a.hp - b.hp);
      if (frozenWeak.length > 0) return frozenWeak[0];
    }

    // NORMAL (y fallback): el de menor vida
    return rivals.reduce((prev, curr) => (curr.hp < prev.hp ? curr : prev), rivals[0]);
  };

  const runBotTurn = (bot: PlayerState, roster: PlayerState[]) => {
    const fresh = roster.find(p => p.id === bot.id);
    if (!fresh || fresh.isEliminated || fresh.hp <= 0) return;

    const weapon = fresh.hand.find(c => c.type === CardType.WEAPON);
    const stance = fresh.hand.find(
      c => c.type === CardType.TRICK && c.timing === TrickTiming.PREPARED_STANCE
    );
    const healTrick = fresh.hand.find(
      c => c.type === CardType.TRICK && c.timing === TrickTiming.RITUAL_ACTION && [33, 38, 49].includes(c.id)
    );
    // MEJORA: trucos ofensivos directos (Pedrada Volada / Golpe Bajo) para IA difícil
    const damageTrick = fresh.hand.find(
      c => c.type === CardType.TRICK && c.timing === TrickTiming.RITUAL_ACTION && [41, 60].includes(c.id)
    );
    // MEJORA: truco de iniciativa/acción extra (La Chicha Energética)
    const tempoTrick = fresh.hand.find(
      c => c.type === CardType.TRICK && c.timing === TrickTiming.RITUAL_ACTION && c.id === 36
    );
    const maxSlots = getBotMaxWeaponSlots(fresh);

    if (botSkillLevelRef.current === 'EASY') {
      // Decisiones simples y algo caóticas
      if (weapon && fresh.equippedWeapons.length < maxSlots && fresh.actionPoints > 0 && Math.random() < 0.6) {
        handleEquipWeapon(weapon.id);
      } else if (stance && !fresh.preparedStance && fresh.actionPoints > 0 && Math.random() < 0.4) {
        handlePrepareStance(stance.id);
      }
      return;
    }

    // NORMAL / HARD: uso inteligente de cartas
    const lowHp = fresh.hp <= fresh.maxHp * 0.4;

    // Curarse primero si está en peligro (Difícil siempre, Normal a veces)
    if (healTrick && lowHp && fresh.actionPoints > 0 && (botSkillLevelRef.current === 'HARD' || Math.random() < 0.7)) {
      handlePlayActionTrick(healTrick.id);
      return;
    }

    // MEJORA (DIFÍCIL): rematar con truco de daño directo si hay un rival a ≤2 HP
    if (botSkillLevelRef.current === 'HARD' && damageTrick && fresh.actionPoints > 0) {
      const myTeam = fresh.teamId ?? 0;
      const killable = roster.find(
        p => !p.isEliminated && p.hp > 0 && p.hp <= 2 && (myTeam === 0 || p.teamId !== myTeam) && p.id !== fresh.id
      );
      if (killable) {
        handlePlayActionTrick(damageTrick.id, killable.id);
        return;
      }
    }

    // MEJORA (DIFÍCIL): asegurar equipar arma usando truco de acción extra si le falta PA
    if (botSkillLevelRef.current === 'HARD' && weapon && fresh.equippedWeapons.length < maxSlots && fresh.actionPoints <= 0 && tempoTrick) {
      handlePlayActionTrick(tempoTrick.id);
      return;
    }

    // Preparar postura defensiva si está en peligro o ya tiene arma equipada
    if (stance && !fresh.preparedStance && fresh.actionPoints > 0 && (lowHp || fresh.equippedWeapons.length > 0)) {
      handlePrepareStance(stance.id);
      return;
    }

    // Equipar arma (priorizar en difícil las que más daño dan: id 6 Puño hierro, 1 Bate, 22 Batería)
    if (weapon && fresh.equippedWeapons.length < maxSlots && fresh.actionPoints > 0) {
      handleEquipWeapon(weapon.id);
      return;
    }

    // MEJORA (DIFÍCIL): usar truco de daño restante contra el rival más débil
    if (botSkillLevelRef.current === 'HARD' && damageTrick && fresh.actionPoints > 0) {
      const myTeam = fresh.teamId ?? 0;
      const rivals = roster.filter(
        p => !p.isEliminated && p.hp > 0 && (myTeam === 0 || p.teamId !== myTeam) && p.id !== fresh.id
      );
      if (rivals.length > 0) {
        const weakest = rivals.reduce((prev, curr) => (curr.hp < prev.hp ? curr : prev), rivals[0]);
        handlePlayActionTrick(damageTrick.id, weakest.id);
        return;
      }
    }

    // En difícil, si aún le quedan PA y no hay amenaza, preparar postura igualmente
    if (botSkillLevelRef.current === 'HARD' && stance && !fresh.preparedStance && fresh.actionPoints > 1) {
      handlePrepareStance(stance.id);
    }
  };

  // MEJORA: Dificultad de campaña seleccionable (los bots rivales se vuelven más agresivos)
  const [campaignDifficulty, setCampaignDifficulty] = useState<number>(() => {
    try {
      return Math.min(3, Math.max(1, Number(localStorage.getItem('guerra_cubita_campaign_difficulty')) || 1));
    } catch {
      return 1;
    }
  });

  // Bosses de capítulos avanzados suben la IA global del combate
  useEffect(() => {
    if (gameMode === GameMode.STREET_CAMPAIGN) {
      botSkillLevelRef.current = campaignDifficulty >= 3 ? 'HARD' : campaignDifficulty === 2 ? 'NORMAL' : 'EASY';
    }
  }, [gameMode, campaignDifficulty]);

  const handleSetCampaignDifficulty = (level: number) => {
    setCampaignDifficulty(level);
    try {
      localStorage.setItem('guerra_cubita_campaign_difficulty', String(level));
    } catch {
      /* noop */
    }
    sound.playStanceActivate();
  };

  // ============================================================
  // MEJORA: registro persistente de estadísticas y progreso
  // ============================================================
  const finalizeMatchResult = (wonByHuman: boolean | null, winnerName: string) => {
    if (resultRecordedRef.current) return;
    resultRecordedRef.current = true;
    // Solo contar partidas donde el jugador humano participa (no modo pase-y-juega puro)
    const human = players.find(p => !p.isBot);
    const isCampaign = gameMode === GameMode.STREET_CAMPAIGN;
    const won = wonByHuman ?? false;

    // MEJORA: resumen visible en la pantalla de fin de batalla
    setLastMatchResult({
      won,
      winnerName,
      isHumanWinner: wonByHuman ?? false,
      roundsPlayed: round,
      damageDealt: battleTrackRef.current.damageDealt,
      perfectBlocks: battleTrackRef.current.perfectBlocks,
      isCampaign,
      chapterTitle: isCampaign ? campaignChapters.find(c => c.id === activeChapterIdRef.current)?.title : undefined
    });

    if (!human) return;
    const updated = recordMatchResult({
      won,
      damageDealt: battleTrackRef.current.damageDealt,
      perfectBlocks: battleTrackRef.current.perfectBlocks,
      roundsPlayed: round,
      isCampaign,
      difficultyLevel: campaignDifficulty
    });
    setPlayerStats(updated);

    if (isCampaign && won) {
      const progress = loadCampaignProgress();
      const chapId = activeChapterIdRef.current;
      if (chapId && !progress.completedChapterIds.includes(chapId)) {
        const newCompleted = [...progress.completedChapterIds, chapId];
        const newProgress: CampaignProgress = {
          completedChapterIds: newCompleted,
          unlockedChapterId: Math.min(DEFAULT_CHAPTERS.length, Math.max(progress.unlockedChapterId, chapId + 1))
        };
        saveCampaignProgress(newProgress);
        setCampaignChapters(prev =>
          prev.map(ch => ({
            ...ch,
            isCompleted: newCompleted.includes(ch.id),
            isUnlocked: ch.id <= newProgress.unlockedChapterId
          }))
        );
        addLog(`🏆 ¡Progreso guardado! Capítulo ${chapId} completado y desbloqueado el siguiente.`, true, "Árbitro");
      }
    }
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
              uid: `${drawn.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
            };
            setPlayers(prev => prev.map(p => {
              if (p.id !== actorId) return p;
              if (p.hand.length >= maxH) return p;
              return { ...p, hand: [...p.hand, cardInstance] };
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
  const handleAttack = (targetId: number) => {
    const attacker = currentTurnPlayer;
    if (!attacker || attacker.actionPoints <= 0 || attacker.isFrozen) return;
    const target = players.find(p => p.id === targetId);
    if (!target || target.isEliminated || target.id === attacker.id) return;

    setIsRollingAnimation(true);
    sound.playDiceRoll();

    setTimeout(() => {
      // 1. Attacker Roll (D6 con regla oficial: cada 6 = robar carta + relanzar)
      const attackerHero = attacker.activeMorphCharacter || attacker.characterType;
      const attackerRolls: number[] = [];
      let attackerFinalVal: number;

      if (attackerHero === CharacterType.TRAMCUBOSO) {
        // Dados Trucados: lanza dos D6 y elige el que más le favorezca
        const a = rollBattleDie();
        const b = rollBattleDie();
        applySixReroll(attacker.id, attacker.name, a);
        applySixReroll(attacker.id, attacker.name, b);
        const chosen = a.finalValue >= b.finalValue ? a : b;
        attackerRolls.push(...chosen.rolls);
        attackerFinalVal = chosen.finalValue;
      } else if (attackerHero === CharacterType.CUBINJA) {
        // Danza de Hojas: lanza el D6 DOS veces y suma ambos dados
        const a = rollBattleDie();
        const b = rollBattleDie();
        applySixReroll(attacker.id, attacker.name, a);
        applySixReroll(attacker.id, attacker.name, b);
        attackerRolls.push(...a.rolls, ...b.rolls);
        attackerFinalVal = a.finalValue + b.finalValue;
      } else if (attackerHero === CharacterType.CUBOGRO) {
        // Aplastamiento: tiradas base ≤ 3 se duplican al impactar
        const res = rollBattleDie();
        applySixReroll(attacker.id, attacker.name, res);
        attackerRolls.push(...res.rolls);
        const r = res.finalValue;
        attackerFinalVal = r <= 3 ? r * 2 : r;
      } else {
        const res = rollBattleDie();
        applySixReroll(attacker.id, attacker.name, res);
        attackerRolls.push(...res.rolls);
        attackerFinalVal = res.finalValue;
      }

      // Flaucubista (Acorde Violento): +1 daño base tras sufrir daño
      if ((attacker.nextAttackBonus || 0) > 0) {
        attackerFinalVal += attacker.nextAttackBonus || 0;
        addLog(`¡Acorde Violento! ${attacker.name} canaliza el dolor: +${attacker.nextAttackBonus} al golpe.`);
      }
      // Antisinergia Protección: penalización al dado del próximo ataque
      if ((attacker.attackPenaltyNext || 0) < 0) {
        attackerFinalVal = Math.max(1, attackerFinalVal + (attacker.attackPenaltyNext || 0));
        addLog(`${attacker.name} ataca lento por el Rechazo Azul (${attacker.attackPenaltyNext} al dado).`);
      }

      // Attacker Weapon Modifiers
      let modifiedAttackDamage = attackerFinalVal;
      if (attacker.equippedWeapons.some(w => w.id === 1) && modifiedAttackDamage >= 3) {
        modifiedAttackDamage += 1; // El Dado-Garrote
      }
      if (attacker.equippedWeapons.some(w => w.id === 2)) {
        modifiedAttackDamage += 2; // La Manopla Dado-Pescueza
      }
      if (attacker.equippedWeapons.some(w => w.id === 3) && attackerFinalVal <= 2) {
        modifiedAttackDamage += 1; // La Chuzadora Dadomada: las tiradas bajas pegan más
      }

      // 2. Defender Roll (D6 con regla del 6: robar + relanzar)
      const defenderHero = target.activeMorphCharacter || target.characterType;
      const defenderRolls: number[] = [];
      let defenderFinalVal: number;
      let isPerfectBlock = false;

      const hasEsquiveCallejon = target.preparedStance?.id === 19 || target.preparedStance?.id === 53 || target.preparedStance?.id === 60;

      if (hasEsquiveCallejon) {
        defenderFinalVal = attackerFinalVal;
        defenderRolls.push(defenderFinalVal);
        isPerfectBlock = true;
        addLog(`${target.name} activa su postura defensiva y bloquea a la perfección!`);
      } else if (target.isFrozen || target.cannotRollBlocks) {
        // Congelado / Discordia de Cubinarca: no puede lanzar dados de bloqueo
        defenderFinalVal = 0;
        isPerfectBlock = false;
        addLog(`${target.name} está congelado/maldito y NO puede lanzar su dado de bloqueo!`);
      } else if (defenderHero === CharacterType.TRAMCUBOSO) {
        // Dados Trucados también en defensa
        const a = rollBattleDie();
        const b = rollBattleDie();
        applySixReroll(target.id, target.name, a);
        applySixReroll(target.id, target.name, b);
        defenderRolls.push(...a.rolls, ...b.rolls);
        const matchA = a.finalValue === attackerFinalVal;
        const matchB = b.finalValue === attackerFinalVal;
        isPerfectBlock = matchA || matchB;
        defenderFinalVal = isPerfectBlock ? (matchA ? a.finalValue : b.finalValue) : Math.max(a.finalValue, b.finalValue);
      } else {
        // Todos los demás héroes Y CUBINJA lanzan SOLO 1 DADO para bloquear
        const res = rollBattleDie();
        applySixReroll(target.id, target.name, res);
        defenderRolls.push(...res.rolls);
        defenderFinalVal = res.finalValue;
        // El tiro de bloqueo tiene que coincidir con el número final del atacante
        isPerfectBlock = res.finalValue === attackerFinalVal;
      }

      // 3. Resolve Damage & Shield Barrier
      let finalDamage = isPerfectBlock ? 0 : modifiedAttackDamage;

      if (!isPerfectBlock && target.preparedStance?.id === 35) {
        // Humo de Vape
        finalDamage = 0;
        addLog(`${target.name} se desvanece en su Humo de Vape preparado!`);
      }

      if (finalDamage === 1 && target.equippedWeapons.some(w => w.id === 4)) {
        // Chaqueta de Cuero
        finalDamage = 0;
        addLog(`La Chaqueta de Cuero de ${target.name} anuló el daño de 1.`);
      }

      if (defenderHero === CharacterType.GLADIACUBON && finalDamage >= 3) {
        finalDamage = Math.max(1, Math.floor(finalDamage / 2));
        addLog(`Gladiacubon mitiga el impacto a ${finalDamage} de daño.`);
      }

      // Shield Barrier (Sinergia Guardián) absorbs damage
      let targetBarrierRemaining = target.shieldBarrier || 0;
      if (!isPerfectBlock && finalDamage > 0 && targetBarrierRemaining > 0) {
        const absorbed = Math.min(targetBarrierRemaining, finalDamage);
        targetBarrierRemaining -= absorbed;
        finalDamage -= absorbed;
        addLog(`🛡️ ¡La Barrera de Escudo de ${target.name} absorbió ${absorbed} de daño! (Quedan: ${targetBarrierRemaining})`);
        addFloatingText(target.id, `🛡️ -${absorbed} BARRERA`, "#60a5fa");
      }

      // Consume posture
      let updatedTargetStance = target.preparedStance;
      if (target.preparedStance && [35, 53, 55, 57, 59, 60].includes(target.preparedStance.id)) {
        updatedTargetStance = null;
      }

      const oldHp = target.hp;
      const newHp = Math.max(0, oldHp - finalDamage);

      // Sound & visuals
      if (isPerfectBlock) {
        sound.playPerfectBlock();
        addFloatingText(target.id, "¡SUPER-BLOQUEO HEROICO!", "#00e5ff");
      } else if (finalDamage > 0) {
        sound.playPunchHit();
        addFloatingText(target.id, `-${finalDamage} HP`, "#ff1744");
      } else {
        addFloatingText(target.id, "¡EVADIDO!", "#7c4dff");
      }

      setActiveDiceRoll({
        attackerRolls,
        attackerFinalVal,
        defenderRolls,
        defenderFinalVal,
        isPerfectBlock,
        damageDealt: finalDamage,
        attackerName: attacker.name,
        defenderName: target.name
      });
      setIsRollingAnimation(false);

      // Threshold check: multiples of 5 (20, 15, 10, 5)
      // When lowering a rival's HP below a multiple of 5, the attacker draws cards from the Global Deck
      const multiplesOf5 = [20, 15, 10, 5];
      const crossedMultiples = multiplesOf5.filter(m => oldHp >= m && newHp < m);

      let attackerCardsToAdd = 0;
      if (crossedMultiples.length > 0 && !attacker.equippedWeapons.some(w => w.id === 6)) {
        attackerCardsToAdd = crossedMultiples.length;
        triggerDeckAnimation();
        sound.playCardDraw();
        addLog(
          `¡Umbral de vida quebrado! ${attacker.name} baja la vida de ${target.name} por debajo de múltiplo de 5 (cruzó: ${crossedMultiples.join(', ')} HP) y roba ${attackerCardsToAdd} carta(s) del Mazo Global.`,
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

      // MEJORA: Tracking de estadísticas del jugador humano (id 1)
      if (!attacker.isBot && attacker.id === 1 && finalDamage > 0) {
        battleTrackRef.current.damageDealt += finalDamage;
      }
      if (isPerfectBlock && !target.isBot && target.id === 1) {
        battleTrackRef.current.perfectBlocks += 1;
      }

      // Super-Bloqueo Heroico / Bloqueo Perfecto rewards for defender:
      // Se activa cuando el tiro de bloqueo coincide con el número del atacante
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
      } else if (finalDamage > 0) {
        narrator.narrateAttack(attacker.name, target.name, finalDamage, attackerFinalVal);
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

            for (let i = 0; i < attackerCardsToAdd; i++) {
              if (newHand.length < maxH) {
                const drawRes = drawCardFromDeck(currentDeckState, currentDiscardState);
                currentDeckState = drawRes.newDeck;
                currentDiscardState = drawRes.newDiscard;
                if (drawRes.card) newHand.push(drawRes.card);
              }
            }

            return {
              ...p,
              actionPoints: Math.max(0, p.actionPoints - 1),
              hand: newHand
            };
          } else if (p.id === target.id) {
            const newHand = [...p.hand];
            const maxH =
              p.characterType === CharacterType.HADA_AL_CUBO
                ? 4
                : p.equippedWeapons.some(w => w.id === 13)
                ? 3
                : 2;

            for (let i = 0; i < defenderCardsToAdd; i++) {
              if (newHand.length < maxH) {
                const drawRes = drawCardFromDeck(currentDeckState, currentDiscardState);
                currentDeckState = drawRes.newDeck;
                currentDiscardState = drawRes.newDiscard;
                if (drawRes.card) newHand.push(drawRes.card);
              }
            }

            return {
              ...p,
              hp: Math.min(p.maxHp, newHp + defenderHpHeal),
              hand: newHand,
              preparedStance: updatedTargetStance,
              shieldBarrier: targetBarrierRemaining,
              isEliminated: newHp <= 0
            };
          }
          return p;
        })
      );

      setDeck(currentDeckState);
      setDiscardPile(currentDiscardState);

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
              // Human defender reaction window
              setReactionPlayer(defender);
              return latestPlayers;
            } else {
              // Bot reaction immediately on perfect block
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

      // Check match victory
      setTimeout(() => {
        checkVictory();
      }, 300);
    }, 600 * speedMultiplier);
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

  // Hero Ability
  const handleUseHeroAbility = (targetId?: number, extraOption?: number) => {
    const actor = currentTurnPlayer;
    if (!actor || actor.abilityCooldownRemaining > 0) return;
    const hero = actor.activeMorphCharacter || actor.characterType;

    if (hero === CharacterType.CUBITO_DE_HIELO) {
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
    } else if (hero === CharacterType.FLAUCUBISTA_DESAFINADO) {
      // Apuesta Ineludible: apuesta un número del 1 al 5. El D6 se lanza con la
      // regla oficial: cada 6 = roba 1 carta del Mazo Global y relanza el dado.
      const chosenNum = extraOption || rollD6();
      const bet = ((chosenNum - 1) % 5) + 1; // 1..5
      const res = rollBattleDie();
      applySixReroll(actor.id, actor.name, res);
      const roll = res.finalValue;
      sound.playDiceRoll();

      if (roll === bet) {
        sound.playPunchHit();
        const healAmt = Math.max(1, Math.floor(bet / 2));
        setPlayers(prev =>
          prev.map(p => {
            if (p.id === actor.id) return { ...p, hp: Math.min(p.maxHp, p.hp + healAmt) };
            if (!p.isEliminated) {
              const nhp = Math.max(0, p.hp - 2);
              return { ...p, hp: nhp, isEliminated: nhp <= 0 };
            }
            return p;
          })
        );
        addLog(`¡Flaucubista acertó su número apostado (${bet}) con un ${roll}! 2 de daño ineludible a toda la mesa y se cura ${healAmt} HP.`, true);
      } else {
        const selfDamage = Math.max(1, Math.floor(bet / 2));
        setPlayers(prev =>
          prev.map(p => (p.id === actor.id ? { ...p, hp: Math.max(0, p.hp - selfDamage), isEliminated: Math.max(0, p.hp - selfDamage) <= 0 } : p))
        );
        addLog(`Flaucubista desafinó (apostó ${bet}, sacó ${roll}) y sufre ${selfDamage} de autodaño.`);
      }
      setTimeout(() => checkVictory(), 300);
    } else {
      addLog(`¡${actor.name} activa el efecto de [${CHARACTERS[hero].abilityName}]! ${CHARACTERS[hero].abilityDescription}`, true);
    }
  };

  // End Turn
  const handleEndTurn = () => {
    if (players.length === 0) return;

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
      const best = rivals.reduce((prev, curr) => (curr.hp < prev.hp ? curr : prev));
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
        finalizeMatchResult(false, aliveTeam2[0]?.name || 'El Bando Rojo');
        return;
      } else if (aliveTeam2.length === 0 && aliveTeam1.length > 0) {
        setWinner(aliveTeam1[0]);
        setPhase(MatchPhase.MATCH_OVER);
        addLog(`¡¡VICTORIA TOTAL! TU BANDO (AZUL) HA DERROTADO A TODOS LOS RIVALES!!`, true, "Árbitro");
        narrator.narrateVictory("Tu Escuadra Azul");
        finalizeMatchResult(true, aliveTeam1[0]?.name || 'Tu Escuadra Azul');
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
      }
      finalizeMatchResult(champ ? !champ.isBot : false, champ ? champ.name : 'La Arena');
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

  // Bot AI Turn execution (MEJORA: IA táctica con niveles de dificultad)
  useEffect(() => {
    if (currentScreen !== CurrentScreen.ARENA || winner || isMatchIntroPlaying) return;
    const activePlayer = players[turnIndex];
    if (!activePlayer || !activePlayer.isBot || activePlayer.isEliminated || activePlayer.hp <= 0) return;

    const timer = setTimeout(() => {
      // 1. Decisiones tácticas de cartas según nivel de IA
      runBotTurn(activePlayer, players);

      // 2. Pick target & attack (objetivo inteligente)
      setTimeout(() => {
        const currentP = players.find(p => p.id === activePlayer.id);
        if (currentP && currentP.actionPoints > 0 && !currentP.isFrozen && !currentP.isEliminated && currentP.hp > 0) {
          const target = pickBotTarget(activePlayer, players);
          if (target) {
            setSelectedTargetId(target.id);
            handleAttack(target.id);
          }
        }

        // MEJORA: los bots DIFÍCILES usan su habilidad de héroe si está disponible
        if (botSkillLevelRef.current === 'HARD') {
          const afterAttack = players.find(p => p.id === activePlayer.id);
          if (afterAttack && afterAttack.abilityCooldownRemaining === 0 && !afterAttack.isEliminated) {
            const hero = afterAttack.activeMorphCharacter || afterAttack.characterType;
            if (hero === CharacterType.CUBITO_DE_HIELO || hero === CharacterType.PIRATA) {
              const abilityTarget = pickBotTarget(afterAttack, players);
              if (abilityTarget && afterAttack.hp <= 12) {
                handleUseHeroAbility(abilityTarget.id);
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
          onSelectTarget={id => setSelectedTargetId(id)}
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
    </div>
  );
}
