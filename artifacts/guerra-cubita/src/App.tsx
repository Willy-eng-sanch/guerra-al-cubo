import React, { useState, useEffect, useRef } from 'react';
import {
  ActiveDiceRoll,
  CampaignChapter,
  CardType,
  CharacterType,
  CombatLogEntry,
  CurrentScreen,
  FloatingCombatText,
  GameCard,
  GameMode,
  MatchPhase,
  PlayerState,
  TrickTiming
} from './types/game';
import { ALL_CARDS, createShuffledDeck } from './data/cards';
import { CHARACTER_LIST, CHARACTERS } from './data/characters';
import { DEFAULT_CHAPTERS } from './data/campaign';
import { sound } from './audio/soundManager';

import { TitleScreen } from './screens/TitleScreen';
import { SetupScreen } from './screens/SetupScreen';
import { PassAndPlaySetupScreen } from './screens/PassAndPlaySetupScreen';
import { CampaignScreen } from './screens/CampaignScreen';
import { RosterScreen } from './screens/RosterScreen';
import { EncyclopediaScreen } from './screens/EncyclopediaScreen';
import { ArenaScreen } from './screens/ArenaScreen';
import { DraftScreen } from './screens/DraftScreen';

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
  const [campaignChapters, setCampaignChapters] = useState<CampaignChapter[]>(DEFAULT_CHAPTERS);
  const [reactionPlayer, setReactionPlayer] = useState<PlayerState | null>(null);
  const [isDeckDrawing, setIsDeckDrawing] = useState<boolean>(false);
  const [isMatchIntroPlaying, setIsMatchIntroPlaying] = useState<boolean>(false);
  const matchIntroCompletedRef = useRef(true);

  const speedMultiplier = isFastSpeed ? 0.5 : 1;

  const completeMatchIntro = () => {
    if (matchIntroCompletedRef.current) return;
    matchIntroCompletedRef.current = true;
    setIsMatchIntroPlaying(false);
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
        d = [...disc].sort(() => Math.random() - 0.5);
        disc = [];
      } else {
        return { card: null, newDeck: d, newDiscard: disc };
      }
    }

    const card = d.shift() || null;
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
        teamId: 1
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
        teamId: 2
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
  };

  // Start Quick Battle
  const startQuickMatch = (playerCount: number = 3, chosenHero: CharacterType = CharacterType.TRAMCUBOSO) => {
    setIsMatchIntroPlaying(false);
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
      isEliminated: false
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
        isEliminated: false
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
  };

  // Start Campaign Match
  const startCampaignMatch = (chapter: CampaignChapter, chosenHero: CharacterType = CharacterType.TRAMCUBOSO) => {
    setIsMatchIntroPlaying(false);
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
      isEliminated: false
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
      isEliminated: false
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
        isEliminated: false
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
  };

  // Start Pass and Play
  const startPassAndPlayMatch = (playerCount: number, heroList: CharacterType[]) => {
    setIsMatchIntroPlaying(false);
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
        isEliminated: false
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
  };

  const currentTurnPlayer = players[turnIndex] || null;

  // Execute Attack
  const handleAttack = (targetId: number) => {
    const attacker = currentTurnPlayer;
    if (!attacker || attacker.actionPoints <= 0 || attacker.isFrozen) return;
    const target = players.find(p => p.id === targetId);
    if (!target || target.isEliminated || target.id === attacker.id) return;

    setIsRollingAnimation(true);
    sound.playDiceRoll();

    setTimeout(() => {
      // 1. Attacker Roll
      const attackerHero = attacker.activeMorphCharacter || attacker.characterType;
      const attackerRolls: number[] = [];
      let attackerFinalVal: number;

      if (attackerHero === CharacterType.TRAMCUBOSO) {
        const r1 = Math.floor(Math.random() * 5) + 1;
        const r2 = Math.floor(Math.random() * 5) + 1;
        attackerRolls.push(r1, r2);
        attackerFinalVal = Math.max(r1, r2);
      } else if (attackerHero === CharacterType.CUBINJA) {
        const r1 = Math.floor(Math.random() * 5) + 1;
        const r2 = Math.floor(Math.random() * 5) + 1;
        attackerRolls.push(r1, r2);
        attackerFinalVal = r1 + r2;
      } else if (attackerHero === CharacterType.CUBOGRO) {
        const r = Math.floor(Math.random() * 5) + 1;
        attackerRolls.push(r);
        attackerFinalVal = r === 1 ? 2 : r === 2 ? 4 : r === 3 ? 6 : r;
      } else {
        const r = Math.floor(Math.random() * 5) + 1;
        attackerRolls.push(r);
        attackerFinalVal = r;
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

      // 2. Defender Roll
      const defenderHero = target.activeMorphCharacter || target.characterType;
      const defenderRolls: number[] = [];
      let defenderFinalVal: number;
      let isPerfectBlock = false;

      const hasReflejoFelino = target.preparedStance?.id === 53;
      const hasElComodin = target.preparedStance?.id === 60;

      if (hasReflejoFelino || hasElComodin) {
        defenderFinalVal = Math.min(5, Math.max(1, attackerFinalVal));
        defenderRolls.push(defenderFinalVal);
        isPerfectBlock = true;
        addLog(`${target.name} activa su postura defensiva y bloquea a la perfección!`);
      } else if (target.isFrozen || defenderHero === CharacterType.CUBINJA) {
        const r = Math.floor(Math.random() * 5) + 1;
        defenderRolls.push(r);
        defenderFinalVal = r;
        isPerfectBlock = false; // Cubinja or Frozen cannot avoid damage
      } else if (defenderHero === CharacterType.TRAMCUBOSO) {
        const r1 = Math.floor(Math.random() * 5) + 1;
        const r2 = Math.floor(Math.random() * 5) + 1;
        defenderRolls.push(r1, r2);
        isPerfectBlock = r1 === attackerFinalVal || r2 === attackerFinalVal;
        defenderFinalVal = isPerfectBlock ? attackerFinalVal : Math.max(r1, r2);
      } else {
        const r = Math.floor(Math.random() * 5) + 1;
        defenderRolls.push(r);
        defenderFinalVal = r;
        isPerfectBlock = r === attackerFinalVal;
      }

      // 3. Resolve Damage
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
        addFloatingText(target.id, "¡BLOQUEO!", "#00e5ff");
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

      // Perfect Block rewards for defender: draws 1 card from Global Deck + reaction window
      let defenderCardsToAdd = 0;
      let defenderHpHeal = 0;
      if (isPerfectBlock) {
        defenderCardsToAdd = 1;
        triggerDeckAnimation();
        sound.playCardDraw();
        if (target.equippedWeapons.some(w => w.id === 2)) {
          defenderHpHeal = 1;
          addLog(`${target.name} cura 1 HP con su Tapa de Alcantarilla al bloquear.`);
        }
        addLog(
          `¡Bloqueo Perfecto! ${target.name} roba 1 carta del Mazo Global y se activa la ventana de Reacción para equipar o activar de inmediato.`,
          true
        );
        addFloatingText(target.id, "¡BLOQUEO PERFECTO! +1 CARTA", "#00e5ff");
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
      const chosenNum = extraOption || Math.floor(Math.random() * 5) + 1;
      const roll = Math.floor(Math.random() * 5) + 1;
      sound.playDiceRoll();

      if (roll === chosenNum) {
        sound.playPunchHit();
        setPlayers(prev =>
          prev.map(p => {
            if (p.id === actor.id) return { ...p, hp: Math.min(p.maxHp, p.hp + 2) };
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
          prev.map(p => (p.id === actor.id ? { ...p, hp: Math.max(0, p.hp - selfDamage) } : p))
        );
        addLog(`Flaucubista desafinó (apostó ${chosenNum}, sacó ${roll}) y sufre ${selfDamage} de daño.`);
      }
    } else {
      addLog(`¡${actor.name} activa el efecto de [${CHARACTERS[hero].abilityName}]! ${CHARACTERS[hero].abilityDescription}`, true);
    }
  };

  // End Turn
  const handleEndTurn = () => {
    if (players.length === 0) return;
    const nextIdx = (turnIndex + 1) % players.length;
    const nextRound = nextIdx === 0 ? round + 1 : round;

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
    if (nextP.isEliminated) {
      handleEndTurn();
      return;
    }

    addLog(`Turno de ${nextP.name} (Ronda ${nextRound})`, false, "Árbitro");

    // Auto-select lowest HP rival as default target (prioritizing opposing team)
    const opposingTeamId = nextP.teamId === 1 ? 2 : nextP.teamId === 2 ? 1 : null;
    const rivals = updated.filter(
      p => !p.isEliminated && p.id !== nextP.id && (!opposingTeamId || p.teamId === opposingTeamId)
    );
    if (rivals.length > 0) {
      const best = rivals.reduce((prev, curr) => (curr.hp < prev.hp ? curr : prev));
      setSelectedTargetId(best.id);
    }
  };

  // Check Victory (Squad Team vs Team or Free-For-All)
  const checkVictory = () => {
    const hasTeams = players.some(p => p.teamId === 1) && players.some(p => p.teamId === 2);

    if (hasTeams) {
      const aliveTeam1 = players.filter(p => p.teamId === 1 && !p.isEliminated && p.hp > 0);
      const aliveTeam2 = players.filter(p => p.teamId === 2 && !p.isEliminated && p.hp > 0);

      if (aliveTeam1.length === 0 && aliveTeam2.length > 0) {
        setWinner(aliveTeam2[0]);
        setPhase(MatchPhase.MATCH_OVER);
        addLog(`¡¡EL BANDO RIVAL (ROJO) HA DERROTADO A TODA TU ESCUADRA!!`, true, "Árbitro");
        return;
      } else if (aliveTeam2.length === 0 && aliveTeam1.length > 0) {
        setWinner(aliveTeam1[0]);
        setPhase(MatchPhase.MATCH_OVER);
        addLog(`¡¡VICTORIA TOTAL! TU BANDO (AZUL) HA DERROTADO A TODOS LOS RIVALES!!`, true, "Árbitro");
        return;
      }
    }

    const alive = players.filter(p => !p.hp || (p.hp > 0 && !p.isEliminated));
    if (alive.length <= 1 && players.length > 1) {
      const champ = alive[0] || null;
      setWinner(champ);
      setPhase(MatchPhase.MATCH_OVER);
      if (champ) {
        addLog(`¡¡${champ.name} ES EL CAMPEÓN SUPREMO DE GUERRA CUBITA!!`, true, "Árbitro");
      }
    }
  };

  // Bot AI Turn execution
  useEffect(() => {
    if (currentScreen !== CurrentScreen.ARENA || winner || isMatchIntroPlaying) return;
    const activePlayer = players[turnIndex];
    if (!activePlayer || !activePlayer.isBot || activePlayer.isEliminated) return;

    const timer = setTimeout(() => {
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
        if (currentP && currentP.actionPoints > 0 && !currentP.isFrozen) {
          const opposingTeamId = activePlayer.teamId === 1 ? 2 : activePlayer.teamId === 2 ? 1 : null;
          const rivals = players.filter(
            p => !p.isEliminated && p.id !== activePlayer.id && (!opposingTeamId || p.teamId === opposingTeamId)
          );
          if (rivals.length > 0) {
            const target = rivals.reduce(
              (prev, curr) => (curr.hp < prev.hp ? curr : prev),
              rivals[0]
            );
            if (target) {
              setSelectedTargetId(target.id);
              handleAttack(target.id);
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
  }, [turnIndex, players, currentScreen, winner, isMatchIntroPlaying]);

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
