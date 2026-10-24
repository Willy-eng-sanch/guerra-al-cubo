import React, { useState, useEffect } from 'react';
import { CharacterDef, CharacterType, DraftState } from '../types/game';
import { CHARACTER_LIST, CHARACTERS } from '../data/characters';
import { Cube3DCanvas } from '../components/Cube3DCanvas';
import { DiceD5Canvas } from '../components/DiceD5Canvas';
import { Model3DViewerModal } from '../components/Model3DViewerModal';
import { CinematicCutsceneModal } from '../components/CinematicCutsceneModal';
import { sound } from '../audio/soundManager';
import { ArrowLeft, Dices, Shield, Swords, Sparkles, Check, Lock, Users, Eye, Video } from 'lucide-react';

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

  const [inspectingCharType, setInspectingCharType] = useState<CharacterType | null>(null);
  const [activeCutscene, setActiveCutscene] = useState<{
    character: CharacterDef;
    picker: 'PLAYER' | 'RIVAL';
    actionTitle: string;
  } | null>(null);
  const [previewVideoChar, setPreviewVideoChar] = useState<CharacterDef | null>(null);
  const [recentPickBanner, setRecentPickBanner] = useState<{
    name: string;
    picker: 'PLAYER' | 'RIVAL';
  } | null>(null);

  const [initiativeMessage, setInitiativeMessage] = useState<string>(
    "Lanza el dado D5 para determinar quién tiene la primera elección."
  );

  useEffect(() => {
    // Silence any synthetic browser TTS so only the authentic video audio plays
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Roll D5 to determine initiative
  const handleRollInitiative = () => {
    if (draftState.isRolling) return;
    setDraftState(prev => ({ ...prev, isRolling: true }));
    sound.playDiceRoll();

    setTimeout(() => {
      let pRoll = Math.floor(Math.random() * 5) + 1;
      let rRoll = Math.floor(Math.random() * 5) + 1;

      // Handle tie with automatic re-roll to always have a decisive winner
      while (pRoll === rRoll) {
        pRoll = Math.floor(Math.random() * 5) + 1;
        rRoll = Math.floor(Math.random() * 5) + 1;
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

  // Bot drafting AI: Only acts when it is legitimately RIVAL's turn and no animation is active!
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

        // Trigger animation for the bot's pick!
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

  // Player chooses a character
  const handlePlayerPick = (charType: CharacterType) => {
    if (draftState.stage !== 'DRAFTING' || draftState.turn !== 'PLAYER') return;
    if (draftState.playerTeam.length >= 3) return;
    if (activeCutscene || recentPickBanner) return;

    const taken = new Set([...draftState.playerTeam, ...draftState.rivalTeam]);
    if (taken.has(charType)) return;

    const pickedDef = CHARACTERS[charType];
    sound.playPunchHit();

    setDraftState(prev => {
      const newPlayerTeam = [...prev.playerTeam, charType];
      const newHistory = [...prev.pickHistory, { picker: 'PLAYER' as const, character: charType }];

      if (pickedDef.selectionVideo) {
        setTimeout(() => {
          setActiveCutscene({
            character: pickedDef,
            picker: 'PLAYER',
            actionTitle: `¡HAS SELECCIONADO A ${pickedDef.displayName.toUpperCase()}!`
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

  const takenSet = new Set([...draftState.playerTeam, ...draftState.rivalTeam]);
  const isDraftComplete = draftState.playerTeam.length === 3 && draftState.rivalTeam.length === 3;

  return (
    <div className="relative w-full min-h-screen bg-[#0d0f14] p-3 md:p-6 text-white flex flex-col justify-between max-w-4xl mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#232a3b] pb-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-[#171c26] hover:bg-[#202736] border border-[#2c374d] text-neutral-300 transition-all flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Menú</span>
        </button>

        <h2 className="text-sm md:text-lg font-black tracking-wide text-white font-bungee flex items-center gap-2">
          <span>DRAFT 3 VS 3 · SORTEO D5</span>
        </h2>

        <div className="text-right">
          <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-600 px-2.5 py-1 rounded-full font-mono font-bold">
            13 CUBOS · 3 POR BANDO
          </span>
        </div>
      </div>

      {/* Main Draft Area */}
      <div className="space-y-4 my-3 overflow-y-auto pr-1">

        {/* Phase 1: Initiative Roll */}
        {draftState.stage === 'ROLL_INITIATIVE' && (
          <div className="bg-[#141824] border-2 border-[#29354d] rounded-2xl p-5 md:p-8 text-center space-y-6 shadow-2xl">
            <div className="max-w-md mx-auto space-y-2">
              <span className="text-xs font-black text-yellow-400 uppercase tracking-widest bg-yellow-950/60 px-3 py-1 rounded-full border border-yellow-700">
                Paso 1: Iniciativa de Elección
              </span>
              <h3 className="text-xl md:text-2xl font-black text-white">
                ¿Quién Elige Primero?
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {initiativeMessage}
              </p>
            </div>

            <div className="flex items-center justify-center gap-6 md:gap-14 py-4">
              {/* Player D5 */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-black text-cyan-400">TU DADO (D5)</span>
                <div className="p-3 bg-[#0d1017] rounded-2xl border-2 border-cyan-500/60 shadow-lg">
                  <DiceD5Canvas
                    value={draftState.playerRoll}
                    size={84}
                    isRolling={draftState.isRolling}
                  />
                </div>
                <span className="text-lg font-black text-white font-mono">
                  {draftState.isRolling ? '?' : draftState.playerRoll}
                </span>
              </div>

              <div className="text-lg font-black text-neutral-500 font-bungee">VS</div>

              {/* Rival D5 */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-black text-red-400">RIVAL (D5)</span>
                <div className="p-3 bg-[#0d1017] rounded-2xl border-2 border-red-500/60 shadow-lg">
                  <DiceD5Canvas
                    value={draftState.rivalRoll}
                    size={84}
                    isRolling={draftState.isRolling}
                  />
                </div>
                <span className="text-lg font-black text-white font-mono">
                  {draftState.isRolling ? '?' : draftState.rivalRoll}
                </span>
              </div>
            </div>

            <button
              onClick={handleRollInitiative}
              disabled={draftState.isRolling}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 active:scale-95 text-black font-black text-sm md:text-base rounded-xl shadow-xl border-2 border-amber-300 transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
            >
              <Dices className="w-5 h-5" />
              <span>{draftState.isRolling ? 'Tirando Dados...' : '¡LANZAR DADO D5 PARA ORDEN!'}</span>
            </button>
          </div>
        )}

        {/* Phase 2: Turn-based Draft & Teams Display */}
        {(draftState.stage === 'DRAFTING' || draftState.stage === 'READY') && (
          <div className="space-y-4">

            {/* Current Turn Indicator Bar */}
            <div className={`p-3 rounded-xl border-2 flex items-center justify-between shadow-lg transition-all ${
              draftState.stage === 'READY'
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                : draftState.turn === 'PLAYER'
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 animate-pulse'
                : draftState.turn === 'ANIMATING'
                ? 'bg-pink-950/80 border-pink-400 text-pink-300 animate-pulse'
                : 'bg-red-950/80 border-red-500 text-red-300'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${
                  draftState.stage === 'READY'
                    ? 'bg-emerald-400'
                    : draftState.turn === 'PLAYER'
                    ? 'bg-cyan-400'
                    : draftState.turn === 'ANIMATING'
                    ? 'bg-pink-400'
                    : 'bg-red-400'
                }`} />
                <span className="text-xs md:text-sm font-black tracking-wide">
                  {draftState.stage === 'READY'
                    ? '¡EQUIPOS COMPLETOS! LISTOS PARA EL COMBATE 3 VS 3'
                    : draftState.turn === 'PLAYER'
                    ? '👉 TU TURNO: Elige un personaje disponible de la cuadrícula'
                    : draftState.turn === 'ANIMATING'
                    ? '🎬 ANIMACIÓN DE SELECCIÓN EN CURSO (ESPERA A QUE TERMINE)...'
                    : '⏳ TURNO DEL RIVAL: El bot está seleccionando su personaje...'}
                </span>
              </div>

              <span className="text-[10px] font-mono font-bold bg-black/40 px-2.5 py-1 rounded-md">
                {draftState.playerTeam.length + draftState.rivalTeam.length} / 6 Escogidos
              </span>
            </div>

            {/* Squads Showcase (Player vs Rival) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

              {/* Player's Squad */}
              <div className="bg-[#121926] border-2 border-cyan-500/50 rounded-2xl p-3 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span>TU BANDO (AZUL)</span>
                  </span>
                  <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-700 font-bold">
                    {draftState.playerTeam.length} / 3 Elegidos
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map(slotIdx => {
                    const heroType = draftState.playerTeam[slotIdx];
                    const hero = heroType ? CHARACTERS[heroType] : null;

                    return (
                      <div
                        key={slotIdx}
                        className={`h-24 md:h-28 rounded-xl border-2 flex flex-col items-center justify-center p-1 relative text-center transition-all ${
                          hero
                            ? 'bg-[#182030] border-cyan-400 shadow-md'
                            : 'bg-[#0f131a] border-dashed border-[#242d3d]'
                        }`}
                      >
                        {hero ? (
                          <>
                            {hero.model3dImage ? (
                              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg border border-cyan-400 overflow-hidden relative shadow bg-[#0a0d13]">
                                <div
                                  className="w-full h-full"
                                  style={{
                                    backgroundImage: `url(${hero.model3dImage})`,
                                    backgroundSize: '300% 100%',
                                    backgroundPosition: '50% center',
                                    backgroundRepeat: 'no-repeat'
                                  }}
                                />
                                <span className="absolute bottom-0 inset-x-0 bg-black/85 text-[6px] text-cyan-300 font-mono text-center font-black">
                                  3D
                                </span>
                              </div>
                            ) : (
                              <img
                                src={hero.avatar}
                                alt={hero.displayName}
                                className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover border border-cyan-400 shadow"
                              />
                            )}
                            <span className="text-[10px] md:text-[11px] font-black text-white truncate w-full mt-1">
                              {hero.displayName}
                            </span>
                            <span className="text-[8px] text-cyan-300 truncate w-full">
                              {hero.title}
                            </span>
                          </>
                        ) : (
                          <div className="text-neutral-500 flex flex-col items-center">
                            <Users className="w-5 h-5 mb-1 opacity-40" />
                            <span className="text-[9px] font-bold">Slot {slotIdx + 1}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rival's Squad */}
              <div className="bg-[#1b1216] border-2 border-red-500/50 rounded-2xl p-3 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Swords className="w-4 h-4 text-red-400" />
                    <span>BANDO RIVAL (ROJO)</span>
                  </span>
                  <span className="text-[10px] bg-red-950 text-red-300 px-2 py-0.5 rounded-full border border-red-700 font-bold">
                    {draftState.rivalTeam.length} / 3 Elegidos
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map(slotIdx => {
                    const heroType = draftState.rivalTeam[slotIdx];
                    const hero = heroType ? CHARACTERS[heroType] : null;

                    return (
                      <div
                        key={slotIdx}
                        className={`h-24 md:h-28 rounded-xl border-2 flex flex-col items-center justify-center p-1 relative text-center transition-all ${
                          hero
                            ? 'bg-[#29171d] border-red-500 shadow-md'
                            : 'bg-[#150d11] border-dashed border-[#3d242c]'
                        }`}
                      >
                        {hero ? (
                          <>
                            {hero.model3dImage ? (
                              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg border border-red-500 overflow-hidden relative shadow bg-[#0a0d13]">
                                <div
                                  className="w-full h-full"
                                  style={{
                                    backgroundImage: `url(${hero.model3dImage})`,
                                    backgroundSize: '300% 100%',
                                    backgroundPosition: '50% center',
                                    backgroundRepeat: 'no-repeat'
                                  }}
                                />
                                <span className="absolute bottom-0 inset-x-0 bg-black/85 text-[6px] text-red-300 font-mono text-center font-black">
                                  3D
                                </span>
                              </div>
                            ) : (
                              <img
                                src={hero.avatar}
                                alt={hero.displayName}
                                className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover border border-red-500 shadow"
                              />
                            )}
                            <span className="text-[10px] md:text-[11px] font-black text-white truncate w-full mt-1">
                              {hero.displayName}
                            </span>
                            <span className="text-[8px] text-red-300 truncate w-full">
                              {hero.title}
                            </span>
                          </>
                        ) : (
                          <div className="text-neutral-500 flex flex-col items-center">
                            <Users className="w-5 h-5 mb-1 opacity-40" />
                            <span className="text-[9px] font-bold">Slot {slotIdx + 1}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 13 Available Characters Grid */}
            <div className="bg-[#121622] border-2 border-[#263148] rounded-2xl p-3 md:p-4 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Pool de Selección (13 Personajes Únicos)</span>
                </span>
                <span className="text-[10px] text-neutral-400">
                  Los personajes escogidos se bloquean para ambos bandos
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {CHARACTER_LIST.map(char => {
                  const isPlayerPicked = draftState.playerTeam.includes(char.type);
                  const isRivalPicked = draftState.rivalTeam.includes(char.type);
                  const isTaken = isPlayerPicked || isRivalPicked;
                  const canPick = draftState.stage === 'DRAFTING' && draftState.turn === 'PLAYER' && !isTaken && draftState.playerTeam.length < 3 && !activeCutscene && !recentPickBanner;

                  return (
                    <button
                      key={char.type}
                      onClick={() => {
                        if (canPick) handlePlayerPick(char.type);
                      }}
                      disabled={isTaken || !canPick}
                      className={`relative p-2.5 rounded-xl border text-left transition-all ${
                        isPlayerPicked
                          ? 'bg-[#182337] border-cyan-400 ring-1 ring-cyan-400/50 opacity-90'
                          : isRivalPicked
                          ? 'bg-[#29171c] border-red-500/80 opacity-60'
                          : canPick
                          ? 'bg-[#131722] border-[#29344c] hover:border-yellow-400 hover:scale-[1.02] cursor-pointer'
                          : 'bg-[#0f1219] border-[#1e2536] opacity-40 cursor-not-allowed'
                      }`}
                    >
                      {/* Badge status */}
                      {isPlayerPicked && (
                        <span className="absolute top-1 right-1 bg-cyan-500 text-black text-[8px] font-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" />
                          <span>TU BANDO</span>
                        </span>
                      )}
                      {isRivalPicked && (
                        <span className="absolute top-1 right-1 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" />
                          <span>RIVAL</span>
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        {char.model3dImage ? (
                          <div className="w-10 h-10 rounded-lg border border-amber-400 overflow-hidden relative shrink-0 shadow bg-[#0a0d13]">
                            <div
                              className="w-full h-full"
                              style={{
                                backgroundImage: `url(${char.model3dImage})`,
                                backgroundSize: '300% 100%',
                                backgroundPosition: '50% center',
                                backgroundRepeat: 'no-repeat'
                              }}
                            />
                            <span className="absolute bottom-0 inset-x-0 bg-black/85 text-[6px] text-amber-300 font-mono text-center font-black">
                              3D
                            </span>
                          </div>
                        ) : (
                          <img
                            src={char.avatar}
                            alt={char.displayName}
                            className="w-10 h-10 rounded-lg object-cover border border-neutral-700 shrink-0"
                          />
                        )}

                        <div className="overflow-hidden flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1 min-w-0">
                              <h4 className="text-[11px] font-black text-white truncate">
                                {char.displayName}
                              </h4>
                              {char.hasCustom3DModel && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                              )}
                            </div>

                            {char.selectionVideo && (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewVideoChar(char);
                                }}
                                className="bg-pink-600 hover:bg-pink-500 text-white px-1.5 py-0.5 rounded text-[8px] font-black flex items-center gap-0.5 shadow shrink-0 cursor-pointer transition-all"
                                title="Previsualizar video cinemático"
                              >
                                <Video className="w-2.5 h-2.5" />
                                <span>VIDEO</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-yellow-400 truncate block">
                            {char.title}
                          </span>
                        </div>
                      </div>

                      <p className="text-[9px] text-neutral-300 mt-1.5 line-clamp-2 leading-tight">
                        {char.description}
                      </p>

                      <div className="mt-1 pt-1 border-t border-neutral-800 text-[8px] text-cyan-300 font-bold truncate">
                        ★ {char.abilityName}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action CTA when Ready */}
            {isDraftComplete && (
              <button
                onClick={() => onStartBattle(draftState.playerTeam, draftState.rivalTeam)}
                className="w-full py-4 bg-gradient-to-r from-[#ff1744] to-[#d50000] hover:brightness-110 active:scale-[0.98] text-white font-black text-base rounded-2xl shadow-2xl border-2 border-yellow-400 flex items-center justify-center gap-2.5 tracking-wider transition-all animate-bounce"
              >
                <Swords className="w-5 h-5 text-yellow-300" />
                <span>¡ENTRAR A LA GUERRA 3 VS 3 CON LOS EQUIPOS!</span>
              </button>
            )}

          </div>
        )}

      </div>

      {/* Pick Banner Toast */}
      {recentPickBanner && (
        <div className="fixed top-16 inset-x-4 max-w-md mx-auto z-40 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 text-black font-black px-5 py-3 rounded-2xl shadow-2xl border-2 border-white text-center animate-bounce flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-black" />
          <span className="text-sm">
            {recentPickBanner.picker === 'PLAYER'
              ? `¡Has reclutado a ${recentPickBanner.name}!`
              : `¡El Rival ha reclutado a ${recentPickBanner.name}!`}
          </span>
        </div>
      )}

      {/* Model 3D Viewer Modal */}
      {inspectingCharType && (
        <Model3DViewerModal
          character={CHARACTERS[inspectingCharType]}
          onClose={() => setInspectingCharType(null)}
        />
      )}

      {/* Pure Preview Video Modal */}
      {previewVideoChar && previewVideoChar.selectionVideo && (
        <CinematicCutsceneModal
          videoUrl={previewVideoChar.selectionVideo}
          characterName={previewVideoChar.displayName}
          actionTitle={`PREVISUALIZACIÓN: ${previewVideoChar.displayName.toUpperCase()}`}
          quote={previewVideoChar.selectionQuote}
          onClose={() => setPreviewVideoChar(null)}
        />
      )}

      {/* Official Pick Cutscene Video Modal - Advance turn only on close! */}
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
