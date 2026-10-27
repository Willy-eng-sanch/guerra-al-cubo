import React, { useState, useEffect } from 'react';
import { CharacterDef, CharacterType, DraftState, CATEGORY_INFO } from '../types/game';
import { CHARACTER_LIST, CHARACTERS } from '../data/characters';
import { Dice3DVisual } from '../components/Dice3DVisual';
import { DiceCupShaker } from '../components/DiceCupShaker';
import { HeroDiceCard } from '../components/HeroDiceCard';
import { CinematicCutsceneModal } from '../components/CinematicCutsceneModal';
import { sound } from '../audio/soundManager';
import { ArrowLeft, Dices, Shield, Swords, Sparkles, Check, Lock, Users, Video, Info } from 'lucide-react';

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
    pickHistory: []
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
    "Lanza el dado D6 para determinar quién tiene la primera elección."
  );

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
        setInitiativeMessage(`¡Sacaste ${pRoll} vs ${rRoll} del Rival! Ganas la iniciativa y eliges primero.`);
      } else {
        setInitiativeMessage(`¡El Rival sacó ${rRoll} vs ${pRoll} tuyo! El Rival tiene la iniciativa y elige primero.`);
      }

      setTimeout(() => {
        setDraftState(prev => ({ ...prev, stage: 'DRAFTING' }));
      }, 1600);
    }, 700);
  };

  // Advance turn ONLY after the animation or video has finished
  const handleCutsceneFinished = (lastPicker: 'PLAYER' | 'RIVAL') => {
    setActiveCutscene(null);
    setRecentPickBanner(null);

    setDraftState(prev => {
      const isDone = prev.playerTeam.length >= 3 && prev.rivalTeam.length >= 3;
      if (isDone) {
        return {
          ...prev,
          stage: 'READY',
          turn: 'PLAYER'
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

        if (chosenDef.selectionVideo) {
          setTimeout(() => {
            setActiveCutscene({
              character: chosenDef,
              picker: 'RIVAL',
              actionTitle: `¡EL RIVAL HA RECLUTADO A ${chosenDef.displayName.toUpperCase()}!`
            });
          }, 60);
        } else {
          setRecentPickBanner({ name: chosenDef.displayName, picker: 'RIVAL' });
          setTimeout(() => {
            handleCutsceneFinished('RIVAL');
          }, 1800);
        }

        return {
          ...prev,
          rivalTeam: newRivalTeam,
          turn: 'ANIMATING',
          pickHistory: newHistory
        };
      });
    }, 1200);

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

      if (pickedDef.selectionVideo) {
        setTimeout(() => {
          setActiveCutscene({
            character: pickedDef,
            picker: 'PLAYER',
            actionTitle: `¡HAS METIDO A ${pickedDef.displayName.toUpperCase()} EN EL VASO!`
          });
        }, 60);
      } else {
        setRecentPickBanner({ name: pickedDef.displayName, picker: 'PLAYER' });
        setTimeout(() => {
          handleCutsceneFinished('PLAYER');
        }, 1800);
      }

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
    <div className="relative w-full min-h-screen bg-[#0d0f14] p-3 md:p-6 text-white flex flex-col justify-between max-w-5xl mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#232a3b] pb-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-[#171c26] hover:bg-[#202736] border border-[#2c374d] text-neutral-300 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Menú</span>
        </button>

        <h2 className="text-sm md:text-lg font-black tracking-wide text-white font-bungee flex items-center gap-2">
          <span>DRAFT 3 VS 3 · VASO DE DADOS</span>
        </h2>

        <div className="text-right">
          <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-600 px-2.5 py-1 rounded-full font-mono font-bold">
            13 DADOS HÉROE · 3 POR BANDO
          </span>
        </div>
      </div>

      {/* Main Draft Area */}
      <div className="space-y-4 my-3 overflow-y-auto pr-1">

        {/* Phase 1: Initiative Roll */}
        {draftState.stage === 'ROLL_INITIATIVE' && (
          <div className="bg-[#141824] border-2 border-[#29354d] rounded-3xl p-5 md:p-8 text-center space-y-6 shadow-2xl">
            <div className="max-w-md mx-auto space-y-2">
              <span className="text-xs font-black text-yellow-400 uppercase tracking-widest bg-yellow-950/60 px-3 py-1 rounded-full border border-yellow-700">
                Paso 1: Iniciativa con Dados 3D
              </span>
              <h3 className="text-xl md:text-2xl font-black text-white font-bungee">
                ¿Quién Elige Primero?
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {initiativeMessage}
              </p>
            </div>

            <div className="flex items-center justify-center gap-8 md:gap-16 py-4">
              {/* Player D6 */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-black text-cyan-400 tracking-wider">TU DADO (D6)</span>
                <div className="p-3 bg-[#0d1017] rounded-3xl border-2 border-cyan-500/60 shadow-lg">
                  <Dice3DVisual
                    value={draftState.playerRoll}
                    size={84}
                    isRolling={draftState.isRolling}
                    glowColor="#06b6d4"
                  />
                </div>
                <span className="text-xl font-black text-white font-mono">
                  {draftState.isRolling ? '?' : draftState.playerRoll}
                </span>
              </div>

              <div className="text-2xl font-black text-yellow-400 font-bungee">VS</div>

              {/* Rival D6 */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-black text-red-400 tracking-wider">RIVAL (D6)</span>
                <div className="p-3 bg-[#0d1017] rounded-3xl border-2 border-red-500/60 shadow-lg">
                  <Dice3DVisual
                    value={draftState.rivalRoll}
                    size={84}
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

        {/* Phase 2: Turn-based Draft & Teams Display */}
        {(draftState.stage === 'DRAFTING' || draftState.stage === 'READY') && (
          <div className="space-y-4">

            {/* Current Turn Indicator Bar */}
            <div className={`p-3 rounded-2xl border-2 flex items-center justify-between shadow-lg transition-all ${
              draftState.stage === 'READY'
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                : draftState.turn === 'PLAYER'
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300'
                : draftState.turn === 'ANIMATING'
                ? 'bg-pink-950/80 border-pink-400 text-pink-300 animate-pulse'
                : 'bg-red-950/80 border-red-500 text-red-300'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-3.5 h-3.5 rounded-full ${
                  draftState.stage === 'READY'
                    ? 'bg-emerald-400'
                    : draftState.turn === 'PLAYER'
                    ? 'bg-cyan-400 animate-ping'
                    : draftState.turn === 'ANIMATING'
                    ? 'bg-pink-400'
                    : 'bg-red-400'
                }`} />
                <span className="text-xs md:text-sm font-black tracking-wide">
                  {draftState.stage === 'READY'
                    ? '¡DADOS COMPLETOS EN EL VASO! AGITA EL VASO PARA LANZAR A LA ARENA'
                    : draftState.turn === 'PLAYER'
                    ? '👉 TU TURNO: Haz 1er clic para ver habilidad y clase, 2do clic o arrastra al vaso'
                    : draftState.turn === 'ANIMATING'
                    ? '🎬 METIENDO DADO EN EL VASO...'
                    : '⏳ TURNO DEL RIVAL: El bot está seleccionando su dado...'}
                </span>
              </div>

              <span className="text-[10px] font-mono font-bold bg-black/50 px-2.5 py-1 rounded-md">
                {draftState.playerTeam.length + draftState.rivalTeam.length} / 6 Escogidos
              </span>
            </div>

            {/* Central Area: The Interactive Dice Cup (Vaso) and Rival Squad */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              
              {/* Player's Interactive Dice Cup (Vaso de Dados) */}
              <div className="lg:col-span-7">
                <DiceCupShaker
                  team={draftState.playerTeam}
                  maxCapacity={3}
                  onDropDie={handlePlayerPick}
                  onLaunch={() => onStartBattle(draftState.playerTeam, draftState.rivalTeam)}
                  isReadyToLaunch={isDraftComplete}
                  disabled={draftState.turn !== 'PLAYER' || draftState.stage !== 'DRAFTING'}
                  cupTitle="TU VASO DE DADOS (BANDO AZUL)"
                  cupSubtitle="Arrastra aquí tus dados héroe o haz doble clic sobre ellos"
                />
              </div>

              {/* Rival Squad Card */}
              <div className="lg:col-span-5 bg-[#1b1216] border-2 border-red-500/50 rounded-3xl p-4 shadow-xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3 border-b border-red-950 pb-2">
                  <span className="text-xs font-black text-red-400 uppercase tracking-wider flex items-center gap-1.5 font-bungee">
                    <Swords className="w-4 h-4 text-red-400" />
                    <span>VASO RIVAL (BANDO ROJO)</span>
                  </span>
                  <span className="text-[10px] bg-red-950 text-red-300 px-2.5 py-0.5 rounded-full border border-red-700 font-bold">
                    {draftState.rivalTeam.length} / 3 Dados
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
                            <span className="text-[9px] font-bold mt-1">Slot #{slotIdx + 1}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 p-2 rounded-xl bg-black/40 border border-red-950 text-[10px] text-neutral-400 text-center">
                  El Rival elige automáticamente en su turno tras cada selección tuya.
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

                {/* Direct Action Button to put into cup */}
                <button
                  onClick={() => handlePlayerPick(inspectedHero.type)}
                  disabled={draftState.turn !== 'PLAYER' || draftState.playerTeam.length >= 3}
                  className="w-full md:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black font-black text-xs md:text-sm shadow-xl flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95 transition-all"
                >
                  <Dices className="w-4 h-4 text-black" />
                  <span>LLEVAR AL VASO (2º CLIC)</span>
                </button>
              </div>
            )}

            {/* 13 Available Hero Dice Pool */}
            <div className="bg-[#121622] border-2 border-[#263148] rounded-3xl p-3 md:p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5 font-bungee">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Pool de Selección (13 Dados Cúbicos Únicos)</span>
                </span>
                <span className="text-[10px] text-neutral-400">
                  Arrastra al vaso o: 1er clic = info & sinergias · 2do clic = al vaso
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

      </div>

      {/* Pick Banner Toast */}
      {recentPickBanner && (
        <div className="fixed top-16 inset-x-4 max-w-md mx-auto z-40 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 text-black font-black px-5 py-3 rounded-2xl shadow-2xl border-2 border-white text-center animate-bounce flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-black" />
          <span className="text-sm">
            {recentPickBanner.picker === 'PLAYER'
              ? `¡Has metido al Vaso a ${recentPickBanner.name}!`
              : `¡El Rival ha reclutado a ${recentPickBanner.name}!`}
          </span>
        </div>
      )}

      {/* Video Cutscene on Pick if available */}
      {activeCutscene && activeCutscene.character.selectionVideo && (
        <CinematicCutsceneModal
          videoUrl={activeCutscene.character.selectionVideo}
          characterName={activeCutscene.character.displayName}
          actionTitle={activeCutscene.actionTitle}
          quote={activeCutscene.character.selectionQuote}
          onClose={() => handleCutsceneFinished(activeCutscene.picker)}
        />
      )}
    </div>
  );
};
