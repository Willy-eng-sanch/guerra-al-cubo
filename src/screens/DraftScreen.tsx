import React, { useState, useEffect } from 'react';
import { CharacterDef, CharacterType, DraftState, CATEGORY_INFO } from '../types/game';
import { CHARACTER_LIST, CHARACTERS } from '../data/characters';
import { Dice3DVisual } from '../components/Dice3DVisual';
import { DiceCupShaker } from '../components/DiceCupShaker';
import { HeroDiceCard } from '../components/HeroDiceCard';
import { sound } from '../audio/soundManager';
import { ArrowLeft, Dices, Shield, Swords, Sparkles, Check, Lock, Users, Info } from 'lucide-react';

interface DraftScreenProps {
  onStartBattle: (playerTeam: CharacterType[], rivalTeam: CharacterType[]) => void;
  onBack: () => void;
}

export const DraftScreen: React.FC<DraftScreenProps> = ({ onStartBattle, onBack }) => {
  const [draftState, setDraftState] = useState<DraftState>({
    stage: 'ROLL_INITIATIVE',
    playerRoll: 1,
    rivalRoll: 1,
    isRolling: false,
    rollWinner: null,
    turn: 'PLAYER',
    playerTeam: [],
    rivalTeam: [],
    pickHistory: [],
    finalPlayerTeam: [],
    finalRivalTeam: []
  });

  // Inspected die type for the 1st click
  const [inspectedCharType, setInspectedCharType] = useState<CharacterType | null>(null);

  const [activeCutscene, setActiveCutscene] = useState<{
    character: CharacterDef;
    picker: 'PLAYER' | 'RIVAL';
    actionTitle: string;
  } | null>(null);

  const [recentPickBanner, setRecentPickBanner] = useState<{
    name: string;
    picker: 'PLAYER' | 'RIVAL';
  } | null>(null);

  const [initiativeMessage, setInitiativeMessage] = useState<string>(
    "Lanza el dado D6 para determinar quién tiene la primera elección de dados."
  );

  const [isShufflingAnimation, setIsShufflingAnimation] = useState(false);

  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Roll D6 to determine initiative
  const handleRollInitiative = () => {
    if (draftState.isRolling) return;
    setDraftState(prev => ({ ...prev, isRolling: true }));
    sound.playDiceRoll();

    setTimeout(() => {
      let pRoll = Math.floor(Math.random() * 6) + 1;
      let rRoll = Math.floor(Math.random() * 6) + 1;

      // Handle tie with automatic re-roll to always have a decisive winner
      while (pRoll === rRoll) {
        pRoll = Math.floor(Math.random() * 6) + 1;
        rRoll = Math.floor(Math.random() * 6) + 1;
      }

      const winner: 'PLAYER' | 'RIVAL' = pRoll > rRoll ? 'PLAYER' : 'RIVAL';

      setDraftState(prev => ({
        ...prev,
        playerRoll: pRoll,
        rivalRoll: rRoll,
        isRolling: false,
        rollWinner: winner,
        turn: winner
      }));

      sound.playPerfectBlock();

      if (winner === 'PLAYER') {
        setInitiativeMessage(`¡Sacaste ${pRoll} vs ${rRoll} del Rival! Ganas la iniciativa y escoges el primer dado.`);
      } else {
        setInitiativeMessage(`¡El Rival sacó ${rRoll} vs ${pRoll} tuyo! El Rival tiene la iniciativa y escoge el primer dado.`);
      }

      setTimeout(() => {
        setDraftState(prev => ({ ...prev, stage: 'DRAFTING' }));
      }, 1500);
    }, 700);
  };

  // Perform the random shuffle and deal of the 6 selected dice (3 to Player, 3 to Rival)
  const triggerRandomDeal = (pPicks: CharacterType[], rPicks: CharacterType[]) => {
    setDraftState(prev => ({ ...prev, stage: 'SHUFFLING_DEAL', turn: 'ANIMATING' }));
    setIsShufflingAnimation(true);
    sound.playCupShake();

    setTimeout(() => {
      sound.playDiceRoll();
    }, 700);

    setTimeout(() => {
      const allSix = [...pPicks, ...rPicks];
      // Fisher-Yates shuffle
      const pool = [...allSix];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }

      const dealtPlayerTeam = pool.slice(0, 3);
      const dealtRivalTeam = pool.slice(3, 6);

      sound.playCupDump();
      sound.playStanceActivate();
      setIsShufflingAnimation(false);

      setDraftState(prev => ({
        ...prev,
        stage: 'DEALT_READY',
        turn: 'PLAYER',
        finalPlayerTeam: dealtPlayerTeam,
        finalRivalTeam: dealtRivalTeam
      }));
    }, 2000);
  };

  // Advance turn ONLY after the animation or video has finished
  const handleCutsceneFinished = (lastPicker: 'PLAYER' | 'RIVAL') => {
    setActiveCutscene(null);
    setRecentPickBanner(null);

    setDraftState(prev => {
      const isSixPicksDone = prev.playerTeam.length >= 3 && prev.rivalTeam.length >= 3;
      if (isSixPicksDone) {
        // Trigger the automatic random deal!
        setTimeout(() => {
          triggerRandomDeal(prev.playerTeam, prev.rivalTeam);
        }, 100);
        return {
          ...prev,
          stage: 'SHUFFLING_DEAL',
          turn: 'ANIMATING'
        };
      }

      const nextTurn: 'PLAYER' | 'RIVAL' = lastPicker === 'PLAYER'
        ? (prev.rivalTeam.length < 3 ? 'RIVAL' : 'PLAYER')
        : (prev.playerTeam.length < 3 ? 'PLAYER' : 'RIVAL');

      return {
        ...prev,
        stage: 'DRAFTING',
        turn: nextTurn
      };
    });
  };

  // Bot drafting AI
  useEffect(() => {
    if (draftState.stage !== 'DRAFTING') return;
    if (draftState.turn !== 'RIVAL') return;
    if (draftState.rivalTeam.length >= 3) return;
    if (activeCutscene || recentPickBanner) return;

    const timer = setTimeout(() => {
      setDraftState(prev => {
        if (prev.stage !== 'DRAFTING' || prev.turn !== 'RIVAL' || prev.rivalTeam.length >= 3) {
          return prev;
        }

        const taken = new Set([...prev.playerTeam, ...prev.rivalTeam]);
        const available = CHARACTER_LIST.filter(c => !taken.has(c.type));
        if (available.length === 0) return prev;

        const chosen = available[Math.floor(Math.random() * available.length)].type;
        const chosenDef = CHARACTERS[chosen];

        sound.playCardDraw();

        const newRivalTeam = [...prev.rivalTeam, chosen];
        const newHistory = [...prev.pickHistory, { picker: 'RIVAL' as const, character: chosen }];

        setRecentPickBanner({ name: chosenDef.displayName, picker: 'RIVAL' });
        setTimeout(() => {
          handleCutsceneFinished('RIVAL');
        }, 1100);

        return {
          ...prev,
          rivalTeam: newRivalTeam,
          turn: 'ANIMATING',
          pickHistory: newHistory
        };
      });
    }, 1100);

    return () => clearTimeout(timer);
  }, [draftState.turn, draftState.stage, draftState.rivalTeam.length, activeCutscene, recentPickBanner]);

  // Player picks a character (via drag-and-drop or 2nd click)
  const handlePlayerPick = (charType: CharacterType) => {
    if (draftState.stage !== 'DRAFTING' || draftState.turn !== 'PLAYER') return;
    if (draftState.playerTeam.length >= 3) return;
    if (activeCutscene || recentPickBanner) return;

    const taken = new Set([...draftState.playerTeam, ...draftState.rivalTeam]);
    if (taken.has(charType)) return;

    const pickedDef = CHARACTERS[charType];
    sound.playCupShake();

    // Clear inspection
    setInspectedCharType(null);

    setDraftState(prev => {
      const newPlayerTeam = [...prev.playerTeam, charType];
      const newHistory = [...prev.pickHistory, { picker: 'PLAYER' as const, character: charType }];

      setRecentPickBanner({ name: pickedDef.displayName, picker: 'PLAYER' });
      setTimeout(() => {
        handleCutsceneFinished('PLAYER');
      }, 1200);

      return {
        ...prev,
        playerTeam: newPlayerTeam,
        turn: 'ANIMATING',
        pickHistory: newHistory
      };
    });
  };

  const isDraftComplete = draftState.playerTeam.length === 3 && draftState.rivalTeam.length === 3;
  const inspectedHero = inspectedCharType ? CHARACTERS[inspectedCharType] : null;

    return (
    <div
      className="gc-screen relative w-full min-h-screen bg-[#0d0f14] p-3 sm:p-5 text-white flex flex-col justify-between max-w-6xl mx-auto select-none overflow-y-auto"
      style={{
        backgroundImage: `radial-gradient(ellipse at 50% 50%, rgba(13, 15, 20, 0.84) 0%, rgba(10, 12, 16, 0.96) 85%), url('/assets/aistudio/Gemini_Generated_Image_mexdy9mexdy9mexd_2dc8e00b.jpeg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 35%'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#232a3b] pb-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-[#171c26] hover:bg-[#202736] border border-[#2c374d] text-neutral-300 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Menú</span>
        </button>

        <div className="text-center">
          <h2 className="text-sm md:text-lg font-black tracking-wide text-white font-bungee flex items-center justify-center gap-2">
            <Dices className="w-5 h-5 text-yellow-400" />
            <span>MODO ALEATORIO · DADOS D6</span>
          </h2>
          <p className="text-[10px] text-cyan-300 hidden sm:block">
            Iniciativa D6 → Elección de 6 dados (3 cada uno) → ¡Reparto aleatorio al azar a cada equipo!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-600 px-2.5 py-1 rounded-full font-mono font-bold">
            {draftState.stage === 'DEALT_READY'
              ? '6 DADOS REPARTIDOS'
              : `${draftState.playerTeam.length + draftState.rivalTeam.length} / 6 DADOS`}
          </span>
        </div>
      </div>

      {/* Main Mode Area */}
      <div className="space-y-4 my-3 pr-1 flex-1">

        {/* Phase 1: Initiative Roll */}
        {draftState.stage === 'ROLL_INITIATIVE' && (
          <div className="bg-[#141824]/90 border-2 border-[#29354d] rounded-3xl p-5 md:p-8 text-center space-y-6 shadow-2xl backdrop-blur-md">
            <div className="max-w-md mx-auto space-y-2">
              <span className="text-xs font-black text-yellow-400 uppercase tracking-widest bg-yellow-950/60 px-3 py-1 rounded-full border border-yellow-700">
                Paso 1: Tirada de Iniciativa D6
              </span>
              <h3 className="text-xl md:text-2xl font-black text-white font-bungee">
                ¿Quién Empieza a Escoger?
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {initiativeMessage}
              </p>
              <p className="text-[11px] text-amber-300/90 italic">
                El mayor empieza a escoger, luego el siguiente, hasta que cada uno elija 3 dados (6 en total).
              </p>
            </div>

            <div className="flex items-center justify-center gap-8 md:gap-16 py-4">
              {/* Player D6 */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-black text-cyan-400 tracking-wider">TU DADO (AZUL)</span>
                <div className="p-3 bg-[#0d1017] rounded-3xl border-2 border-cyan-500/60 shadow-lg">
                  <Dice3DVisual
                    value={draftState.playerRoll}
                    size={84}
                    teamColor="blue"
                    isRolling={draftState.isRolling}
                    glowColor="#38bdf8"
                  />
                </div>
                <span className="text-xl font-black text-white font-mono">
                  {draftState.isRolling ? '?' : draftState.playerRoll}
                </span>
              </div>

              <div className="text-2xl font-black text-yellow-400 font-bungee">VS</div>

              {/* Rival D6 */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-black text-red-400 tracking-wider">RIVAL (ROJO)</span>
                <div className="p-3 bg-[#0d1017] rounded-3xl border-2 border-red-500/60 shadow-lg">
                  <Dice3DVisual
                    value={draftState.rivalRoll}
                    size={84}
                    teamColor="red"
                    isRolling={draftState.isRolling}
                    glowColor="#ef4444"
                  />
                </div>
                <span className="text-xl font-black text-white font-mono">
                  {draftState.isRolling ? '?' : draftState.rivalRoll}
                </span>
              </div>
            </div>

            <button
              onClick={handleRollInitiative}
              disabled={draftState.isRolling}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 active:scale-95 text-black font-black text-sm md:text-base rounded-2xl shadow-xl border-2 border-amber-300 transition-all flex items-center gap-2 mx-auto disabled:opacity-50 cursor-pointer"
            >
              <Dices className="w-5 h-5 text-black" />
              <span>{draftState.isRolling ? 'Tirando Dados...' : '¡LANZAR DADOS PARA DECIDIR ORDEN!'}</span>
            </button>
          </div>
        )}

        {/* Phase 2: Turn-based Alternating Picks for the 6 Dice Pool */}
        {draftState.stage === 'DRAFTING' && (
          <div className="space-y-4">

            {/* Mode rules reminder & Turn indicator */}
            <div className={`p-3 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-lg transition-all ${
              draftState.turn === 'PLAYER'
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300'
                : draftState.turn === 'ANIMATING'
                ? 'bg-pink-950/80 border-pink-400 text-pink-300 animate-pulse'
                : 'bg-red-950/80 border-red-500 text-red-300'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-3.5 h-3.5 rounded-full ${
                  draftState.turn === 'PLAYER'
                    ? 'bg-cyan-400 animate-ping'
                    : draftState.turn === 'ANIMATING'
                    ? 'bg-pink-400'
                    : 'bg-red-400'
                }`} />
                <span className="text-xs md:text-sm font-black tracking-wide">
                  {draftState.turn === 'PLAYER'
                    ? '👉 TU TURNO: Escoge 1 dado para el pozo común de 6 dados (1er clic = ver info, 2do clic = seleccionar)'
                    : draftState.turn === 'ANIMATING'
                    ? '🎬 AGREGANDO DADO AL POZO DE 6...'
                    : '⏳ TURNO DEL RIVAL: El rival está seleccionando 1 dado...'}
                </span>
              </div>

              <span className="text-[10px] font-mono font-bold bg-black/60 px-3 py-1 rounded-lg border border-white/10">
                Paso 2: {draftState.playerTeam.length + draftState.rivalTeam.length} de 6 dados seleccionados
              </span>
            </div>

            {/* Explanatory Banner for Modo Aleatorio */}
            <div className="bg-gradient-to-r from-blue-950/60 via-purple-950/50 to-red-950/60 p-2.5 rounded-2xl border border-[#3b4865] flex items-center justify-between gap-3 text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎲</span>
                <span>
                  <b>Regla del Modo Aleatorio:</b> Ambos eligen 3 dados alternadamente (6 en total). Al completar los 6, <b>¡el cubilete los barajará y repartirá 3 dados al azar a cada equipo!</b>
                </span>
              </div>
            </div>

            {/* Central Area: Current Picks Breakdown (Player's 3 picks vs Rival's 3 picks) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Player Picks */}
              <div className="bg-[#101726] border-2 border-cyan-500/60 rounded-3xl p-4 shadow-xl">
                <div className="flex items-center justify-between mb-3 border-b border-cyan-900/60 pb-2">
                  <span className="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 font-bungee">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span>Tus 3 Elecciones ({draftState.playerTeam.length} / 3)</span>
                  </span>
                  <span className="text-[10px] bg-cyan-950 text-cyan-200 px-2.5 py-0.5 rounded-full border border-cyan-700 font-bold">
                    {draftState.turn === 'PLAYER' ? 'Te toca elegir' : 'Esperando rival'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map(slotIdx => {
                    const heroType = draftState.playerTeam[slotIdx];
                    const hero = heroType ? CHARACTERS[heroType] : null;

                    return (
                      <div
                        key={slotIdx}
                        className={`h-24 md:h-28 rounded-2xl border-2 flex flex-col items-center justify-center p-1.5 relative text-center transition-all ${
                          hero
                            ? 'bg-[#15233c] border-cyan-400 shadow-md animate-clay'
                            : 'bg-[#0a0f18] border-dashed border-[#233554]'
                        }`}
                      >
                        {hero ? (
                          <>
                            <Dice3DVisual
                              character={hero.type}
                              size={44}
                              glowColor="#38bdf8"
                            />
                            <span className="text-[10px] font-black text-white truncate w-full mt-1">
                              {hero.displayName}
                            </span>
                            <span className="text-[8px] text-cyan-300 truncate w-full">
                              ★ {hero.abilityName.slice(0, 10)}
                            </span>
                          </>
                        ) : (
                          <div className="text-neutral-500 flex flex-col items-center">
                            <span className="text-lg opacity-40">🎲</span>
                            <span className="text-[9px] font-bold mt-1">Tu #{slotIdx + 1}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rival Picks */}
              <div className="bg-[#1b1216] border-2 border-red-500/50 rounded-3xl p-4 shadow-xl">
                <div className="flex items-center justify-between mb-3 border-b border-red-950 pb-2">
                  <span className="text-xs font-black text-red-400 uppercase tracking-wider flex items-center gap-1.5 font-bungee">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span>Elecciones del Rival ({draftState.rivalTeam.length} / 3)</span>
                  </span>
                  <span className="text-[10px] bg-red-950 text-red-300 px-2.5 py-0.5 rounded-full border border-red-700 font-bold">
                    {draftState.turn === 'RIVAL' ? 'Rival pensando...' : 'Turno cumplido'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map(slotIdx => {
                    const heroType = draftState.rivalTeam[slotIdx];
                    const hero = heroType ? CHARACTERS[heroType] : null;

                    return (
                      <div
                        key={slotIdx}
                        className={`h-24 md:h-28 rounded-2xl border-2 flex flex-col items-center justify-center p-1.5 relative text-center transition-all ${
                          hero
                            ? 'bg-[#29171d] border-red-500 shadow-md animate-clay'
                            : 'bg-[#150d11] border-dashed border-[#3d242c]'
                        }`}
                      >
                        {hero ? (
                          <>
                            <Dice3DVisual
                              character={hero.type}
                              size={44}
                              glowColor="#ef4444"
                            />
                            <span className="text-[10px] font-black text-white truncate w-full mt-1">
                              {hero.displayName}
                            </span>
                            <span className="text-[8px] text-red-300 truncate w-full">
                              ★ {hero.abilityName.slice(0, 10)}
                            </span>
                          </>
                        ) : (
                          <div className="text-neutral-600 flex flex-col items-center">
                            <span className="text-lg opacity-30">🎲</span>
                            <span className="text-[9px] font-bold mt-1">Rival #{slotIdx + 1}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Inspected Hero Die Spotlight Banner (Shown on 1st click) */}
            {inspectedHero && (
              <div className="bg-gradient-to-r from-[#172033] via-[#1b253b] to-[#121927] border-2 border-yellow-400 rounded-3xl p-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <Dice3DVisual
                    character={inspectedHero.type}
                    size={58}
                    glowColor={inspectedHero.primaryColor}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-yellow-400 bg-yellow-950 px-2 py-0.5 rounded-full border border-yellow-600">
                        DADO INSPECCIONADO
                      </span>
                      <h3 className="text-base font-black text-white font-bungee">
                        {inspectedHero.displayName}
                      </h3>
                    </div>
                    <p className="text-xs text-cyan-300 font-bold mt-0.5">
                      {inspectedHero.title} · Habilidad: ★ {inspectedHero.abilityName}
                    </p>
                    <p className="text-[11px] text-neutral-200 mt-1 max-w-xl leading-relaxed">
                      {inspectedHero.description}
                    </p>
                    
                    {/* Classes & synergies with cards */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] font-bold text-neutral-400">Sinergias con cartas:</span>
                      {inspectedHero.classes.map(cat => {
                        const info = CATEGORY_INFO[cat];
                        return (
                          <span
                            key={cat}
                            className="text-[10px] font-black px-2 py-0.5 rounded-lg border flex items-center gap-1"
                            style={{
                              backgroundColor: info.bgGlow,
                              color: info.color,
                              borderColor: info.borderColor
                            }}
                          >
                            <span>{info.symbol}</span>
                            <span>{info.name}:</span>
                            <span className="font-normal text-white">{info.synergyBonus}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Direct Action Button */}
                <button
                  onClick={() => handlePlayerPick(inspectedHero.type)}
                  disabled={draftState.turn !== 'PLAYER' || draftState.playerTeam.length >= 3}
                  className="w-full md:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black font-black text-xs md:text-sm shadow-xl flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95 transition-all"
                >
                  <Dices className="w-4 h-4 text-black" />
                  <span>SELECCIONAR DADO (2º CLIC)</span>
                </button>
              </div>
            )}

            {/* 13 Available Hero Dice Pool */}
            <div className="bg-[#121622] border-2 border-[#263148] rounded-3xl p-3 md:p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5 font-bungee">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Pool de Dados Disponibles (13 Personajes)</span>
                </span>
                <span className="text-[10px] text-neutral-400">
                  1er clic = info & sinergias · 2do clic = seleccionar para el pozo
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {CHARACTER_LIST.map(char => {
                  const isPlayerPicked = draftState.playerTeam.includes(char.type);
                  const isRivalPicked = draftState.rivalTeam.includes(char.type);
                  const isInspected = inspectedCharType === char.type;
                  const canPick = draftState.stage === 'DRAFTING' && draftState.turn === 'PLAYER' && !isPlayerPicked && !isRivalPicked && draftState.playerTeam.length < 3 && !activeCutscene && !recentPickBanner;

                  return (
                    <HeroDiceCard
                      key={char.type}
                      char={char}
                      isInspected={isInspected}
                      isPickedByPlayer={isPlayerPicked}
                      isPickedByRival={isRivalPicked}
                      canPick={canPick}
                      onFirstClickInspect={() => {
                        setInspectedCharType(char.type);
                        sound.playCardDraw();
                      }}
                      onSecondClickAddToCup={() => {
                        handlePlayerPick(char.type);
                      }}
                    />
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* Phase 3: The Big Random Deal Shuffle Animation */}
        {draftState.stage === 'SHUFFLING_DEAL' && (
          <div className="bg-[#121624]/95 border-2 border-yellow-400 rounded-3xl p-6 md:p-10 text-center space-y-6 shadow-2xl backdrop-blur-md animate-fadeIn my-auto">
            <span className="text-xs font-black text-yellow-400 uppercase tracking-widest bg-yellow-950/80 px-4 py-1.5 rounded-full border border-yellow-600">
              ¡6 DADOS COMPLETADOS!
            </span>

            <h3 className="text-2xl md:text-3xl font-black text-white font-bungee animate-pulse">
              🎲 BARAJANDO Y REPARTIENDO AL AZAR 🎲
            </h3>

            <p className="text-xs md:text-sm text-neutral-300 max-w-lg mx-auto leading-relaxed">
              Los 6 dados escogidos (3 tuyos y 3 del rival) entran al cubilete. La suerte los baraja y reparte 3 dados aleatoriamente a cada equipo.
            </p>

            {/* Shuffling Dice Animation Showcase */}
            <div className="py-6 flex flex-wrap items-center justify-center gap-3">
              {[...draftState.playerTeam, ...draftState.rivalTeam].map((cType, idx) => (
                <div
                  key={idx}
                  className="animate-bounce"
                  style={{ animationDelay: `${idx * 150}ms`, animationDuration: '0.8s' }}
                >
                  <Dice3DVisual
                    character={cType}
                    size={64}
                    isRolling={true}
                    glowColor={idx < 3 ? '#38bdf8' : '#ef4444'}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 text-yellow-400 font-mono text-xs font-black animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Agitando cubilete y repartiendo dados al azar...</span>
            </div>
          </div>
        )}

        {/* Phase 4: Final Deal Presentation (Dealt Teams Ready) */}
        {draftState.stage === 'DEALT_READY' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Success Banner */}
            <div className="bg-gradient-to-r from-emerald-950/90 via-[#13221d] to-emerald-950/90 border-2 border-emerald-400 rounded-3xl p-4 shadow-xl text-center space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest bg-black/50 px-3 py-1 rounded-full border border-emerald-600 inline-block">
                ¡REPARTO ALEATORIO COMPLETADO!
              </span>
              <h3 className="text-lg md:text-xl font-black text-white font-bungee">
                La Suerte Ha Decidido los Escuadrones
              </h3>
              <p className="text-xs text-neutral-300">
                Los 6 dados elegidos fueron barajados: 3 dados asignados a tu Escuadrón Aliado y 3 dados al Escuadrón Rival.
              </p>
            </div>

            {/* Comparison Grid: Dealt Player Team vs Dealt Rival Team */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Dealt Player Squad (Azul) */}
              <div className="bg-[#101726] border-2 border-cyan-400 rounded-3xl p-4 shadow-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-cyan-900 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                    <h4 className="text-sm font-black text-white font-bungee">
                      TU ESCUADRÓN (BANDO AZUL)
                    </h4>
                  </div>
                  <span className="text-[10px] bg-cyan-950 text-cyan-200 border border-cyan-600 px-2 py-0.5 rounded-full font-bold">
                    3 Dados Aliados
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(draftState.finalPlayerTeam || []).map((heroType, idx) => {
                    const hero = CHARACTERS[heroType];
                    const originallyPlayerPick = draftState.playerTeam.includes(heroType);

                    return (
                      <div
                        key={idx}
                        className="bg-[#162138] border-2 border-cyan-500 rounded-2xl p-2 flex flex-col items-center text-center shadow-lg hover:scale-105 transition-all"
                      >
                        <Dice3DVisual character={hero.type} size={50} glowColor="#38bdf8" />
                        <span className="text-[11px] font-black text-white mt-1.5 truncate w-full">
                          {hero.displayName}
                        </span>
                        <span className="text-[9px] font-bold text-cyan-300">
                          {hero.title.slice(0, 14)}
                        </span>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md mt-1 w-full truncate ${
                          originallyPlayerPick
                            ? 'bg-blue-950 text-cyan-300 border border-cyan-700'
                            : 'bg-purple-950 text-purple-300 border border-purple-600'
                        }`}>
                          {originallyPlayerPick ? '★ Tu elección' : '⚡ Del rival'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Sinergias del Bando Azul */}
                <div className="p-2.5 rounded-xl bg-black/40 border border-cyan-900/60 space-y-1">
                  <span className="text-[9px] font-black uppercase text-cyan-300 block">
                    ADN Colectivo del Bando Azul:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(draftState.finalPlayerTeam || []).map(hType => CHARACTERS[hType].classes).flat().filter((v, i, a) => a.indexOf(v) === i).map(cat => {
                      const info = CATEGORY_INFO[cat];
                      return (
                        <span key={cat} className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-200 font-bold">
                          {info.symbol} {info.name.split(' ')[0]}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Dealt Rival Squad (Rojo) */}
              <div className="bg-[#1b1216] border-2 border-red-500 rounded-3xl p-4 shadow-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-red-950 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />
                    <h4 className="text-sm font-black text-white font-bungee">
                      ESCUADRÓN RIVAL (BANDO ROJO)
                    </h4>
                  </div>
                  <span className="text-[10px] bg-red-950 text-red-200 border border-red-600 px-2 py-0.5 rounded-full font-bold">
                    3 Dados Rivales
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(draftState.finalRivalTeam || []).map((heroType, idx) => {
                    const hero = CHARACTERS[heroType];
                    const originallyRivalPick = draftState.rivalTeam.includes(heroType);

                    return (
                      <div
                        key={idx}
                        className="bg-[#29171d] border-2 border-red-500 rounded-2xl p-2 flex flex-col items-center text-center shadow-lg hover:scale-105 transition-all"
                      >
                        <Dice3DVisual character={hero.type} size={50} glowColor="#ef4444" />
                        <span className="text-[11px] font-black text-white mt-1.5 truncate w-full">
                          {hero.displayName}
                        </span>
                        <span className="text-[9px] font-bold text-red-300">
                          {hero.title.slice(0, 14)}
                        </span>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md mt-1 w-full truncate ${
                          originallyRivalPick
                            ? 'bg-red-950 text-red-300 border border-red-700'
                            : 'bg-amber-950 text-amber-300 border border-amber-600'
                        }`}>
                          {originallyRivalPick ? '★ Elección rival' : '⚡ Tu elección'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Sinergias del Bando Rojo */}
                <div className="p-2.5 rounded-xl bg-black/40 border border-red-950 space-y-1">
                  <span className="text-[9px] font-black uppercase text-red-400 block">
                    ADN Colectivo del Bando Rojo:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(draftState.finalRivalTeam || []).map(hType => CHARACTERS[hType].classes).flat().filter((v, i, a) => a.indexOf(v) === i).map(cat => {
                      const info = CATEGORY_INFO[cat];
                      return (
                        <span key={cat} className="text-[9px] px-1.5 py-0.5 rounded bg-red-950 border border-red-800 text-red-200 font-bold">
                          {info.symbol} {info.name.split(' ')[0]}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* Launch or Re-deal Action Dock */}
            <div className="p-4 rounded-3xl bg-[#141824] border-2 border-yellow-400 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => triggerRandomDeal(draftState.playerTeam, draftState.rivalTeam)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#1d2436] hover:bg-[#252f47] text-neutral-300 font-bold text-xs border border-neutral-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="Volver a barajar los mismos 6 dados escogidos"
              >
                <Dices className="w-4 h-4 text-amber-400" />
                <span>Volver a Repartir los 6 Dados</span>
              </button>

              <button
                onClick={() => onStartBattle(
                  draftState.finalPlayerTeam && draftState.finalPlayerTeam.length === 3
                    ? draftState.finalPlayerTeam
                    : draftState.playerTeam,
                  draftState.finalRivalTeam && draftState.finalRivalTeam.length === 3
                    ? draftState.finalRivalTeam
                    : draftState.rivalTeam
                )}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 hover:brightness-110 active:scale-95 text-black font-black text-sm uppercase tracking-wider border-2 border-white shadow-[0_0_25px_rgba(250,204,21,0.6)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Swords className="w-5 h-5 text-black" />
                <span>¡ENTRAR A LA ARENA DE COMBATE!</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Pick Banner Toast */}
      {recentPickBanner && (
        <div className="fixed top-16 inset-x-4 max-w-md mx-auto z-40 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 text-black font-black px-5 py-3 rounded-2xl shadow-2xl border-2 border-white text-center animate-bounce flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-black" />
          <span className="text-sm">
            {recentPickBanner.picker === 'PLAYER'
              ? `¡Has seleccionado a ${recentPickBanner.name}!`
              : `¡El Rival ha seleccionado a ${recentPickBanner.name}!`}
          </span>
        </div>
      )}
    </div>
  );
};
