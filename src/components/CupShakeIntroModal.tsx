import React, { useState, useEffect } from 'react';
import { CharacterType } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { sound } from '../audio/soundManager';
import { Swords, Sparkles, FastForward, Shield } from 'lucide-react';

interface CupShakeIntroModalProps {
  playerTeam: CharacterType[];
  rivalTeam: CharacterType[];
  onComplete: () => void;
}

type Stage = 'GATHER' | 'SHAKE' | 'DUMP' | 'SETTLE';

export const CupShakeIntroModal: React.FC<CupShakeIntroModalProps> = ({
  playerTeam,
  rivalTeam,
  onComplete
}) => {
  const [stage, setStage] = useState<Stage>('GATHER');
  const [shakeCount, setShakeCount] = useState<number>(0);

  useEffect(() => {
    // 1. Gather into cup (0 - 800ms)
    const t1 = setTimeout(() => {
      setStage('SHAKE');
      sound.playCupShake();
    }, 800);

    // 2. Additional shake sound midway
    const t2 = setTimeout(() => {
      setShakeCount(prev => prev + 1);
      sound.playCupShake();
    }, 1500);

    // 3. Dump out of cup onto the arena (2300ms)
    const t3 = setTimeout(() => {
      setStage('DUMP');
      sound.playCupDump();
    }, 2300);

    // 4. Settle 3 on left and 3 on right (3400ms)
    const t4 = setTimeout(() => {
      setStage('SETTLE');
      sound.playPerfectBlock();
    }, 3400);

    // 5. Auto proceed to arena (4800ms)
    const t5 = setTimeout(() => {
      onComplete();
    }, 4800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none overflow-hidden animate-fade-in">
      {/* Background Wood Clay Table Arena Surface */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#2b201a_0%,_#17120f_60%,_#090706_100%)] opacity-95 pointer-events-none" />

      {/* Skipping button */}
      <button
        onClick={onComplete}
        className="absolute top-4 right-4 z-40 px-3.5 py-1.5 rounded-full bg-[#1b2230]/80 hover:bg-[#2b374e] border border-neutral-600 text-xs font-bold text-neutral-300 flex items-center gap-1.5 transition-all cursor-pointer"
      >
        <span>Omitir animación</span>
        <FastForward className="w-3.5 h-3.5" />
      </button>

      {/* Arena Title Badge Top */}
      <div className="absolute top-5 inset-x-0 mx-auto text-center z-30 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/70 border border-yellow-500/50 shadow-xl">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="font-bungee text-xs md:text-sm text-yellow-300 tracking-wider">
            {stage === 'GATHER' && 'REUNIENDO LOS CUBOS EN EL CUBILETE...'}
            {stage === 'SHAKE' && '¡BATIENDO LOS PERSONAJES EN EL VASO!'}
            {stage === 'DUMP' && '¡ARROJANDO A LA ARENA!'}
            {stage === 'SETTLE' && '¡3 A LA IZQUIERDA VS 3 A LA DERECHA!'}
          </span>
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </div>
      </div>

      {/* Main Center Stage */}
      <div className="relative w-full max-w-3xl h-[420px] md:h-[480px] flex items-center justify-center">

        {/* --- THE SHAKER CUP (EL VASO / CUBILETE) --- */}
        {(stage === 'GATHER' || stage === 'SHAKE' || stage === 'DUMP') && (
          <div
            className={`relative z-20 flex flex-col items-center transition-all duration-300 ${
              stage === 'SHAKE' ? 'animate-cup-shake scale-110' : ''
            } ${stage === 'DUMP' ? 'animate-cup-dump' : ''}`}
          >
            {/* Cup Body (Clay / Stitched Leather Shaker) */}
            <div className="relative w-36 h-48 md:w-44 md:h-56 rounded-t-3xl rounded-b-xl bg-gradient-to-b from-[#8d5b4c] via-[#5d3a30] to-[#3a221a] border-4 border-[#a87463] shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col items-center justify-between p-3 overflow-hidden">
              {/* Cup Rim highlight */}
              <div className="w-full h-4 rounded-full bg-[#c98e7b] border border-[#ffbca9] shadow-inner" />

              {/* Decorative Stitched Band */}
              <div className="w-full py-1 border-y-2 border-dashed border-amber-300/40 flex items-center justify-center gap-1 text-[10px] font-black text-amber-200 tracking-widest uppercase">
                <span>✦ GUERRA CUBITA ✦</span>
              </div>

              {/* Shaker Dice Noise dots when vibrating */}
              {stage === 'SHAKE' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-20 h-20 rounded-full bg-yellow-400/10 blur-xl animate-ping" />
                  <span className="text-2xl font-black font-bungee text-yellow-300/60 animate-bounce">
                    🎲
                  </span>
                </div>
              )}

              {/* Cup Base */}
              <div className="w-24 h-3 rounded-full bg-[#271510] border-t border-[#46281e]" />
            </div>

            {/* Cup Shadow */}
            <div className="w-32 h-6 rounded-full bg-black/60 blur-md mt-2" />
          </div>
        )}

        {/* --- CUBES GATHERING INTO CUP (STAGE 0) --- */}
        {stage === 'GATHER' && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Player Cubes flying towards the cup from left */}
            {playerTeam.map((cType, i) => {
              const def = CHARACTERS[cType];
              return (
                <div
                  key={`gather-p-${i}`}
                  style={{
                    left: `${15 + i * 8}%`,
                    top: `${30 + i * 18}%`,
                    animation: `gatherIntoCup 0.7s forwards ease-in ${i * 0.1}s`
                  }}
                  className="absolute flex flex-col items-center gap-1 transition-all"
                >
                  <img
                    src={def.avatar}
                    alt={def.displayName}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 border-cyan-400 object-cover shadow-lg"
                  />
                  <span className="text-[9px] font-black bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500">
                    {def.displayName.slice(0, 8)}
                  </span>
                </div>
              );
            })}

            {/* Rival Cubes flying towards the cup from right */}
            {rivalTeam.map((cType, i) => {
              const def = CHARACTERS[cType];
              return (
                <div
                  key={`gather-r-${i}`}
                  style={{
                    right: `${15 + i * 8}%`,
                    top: `${30 + i * 18}%`,
                    animation: `gatherIntoCup 0.7s forwards ease-in ${i * 0.12}s`
                  }}
                  className="absolute flex flex-col items-center gap-1 transition-all"
                >
                  <img
                    src={def.avatar}
                    alt={def.displayName}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 border-red-500 object-cover shadow-lg"
                  />
                  <span className="text-[9px] font-black bg-red-950 text-red-300 px-1.5 py-0.5 rounded border border-red-500">
                    {def.displayName.slice(0, 8)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* --- CUBES TUMBLING OUT: 3 TO THE LEFT, 3 TO THE RIGHT (STAGES DUMP & SETTLE) --- */}
        {(stage === 'DUMP' || stage === 'SETTLE') && (
          <div className="absolute inset-0 w-full h-full flex justify-between items-center px-4 md:px-12 pointer-events-none">
            {/* LEFT SIDE: 3 PLAYER HEROES (BANDO AZUL) */}
            <div className="flex flex-col gap-5 md:gap-8 items-start z-30 animate-fade-in">
              <div className="flex items-center gap-1.5 bg-cyan-950/90 text-cyan-300 border-2 border-cyan-500 px-3 py-1 rounded-xl shadow-lg">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span className="text-xs md:text-sm font-black tracking-wider">
                  BANDO AZUL (TU ESCUADRA)
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {playerTeam.map((cType, idx) => {
                  const def = CHARACTERS[cType];
                  return (
                    <div
                      key={`p-team-${idx}`}
                      style={{
                        animation: `slideInLeft 0.6s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards ${idx * 0.15}s`
                      }}
                      className="flex items-center gap-3 bg-[#111622]/90 border-2 border-cyan-500/70 p-2.5 rounded-2xl shadow-xl hover:scale-105 transition-all"
                    >
                      <div className="relative">
                        <img
                          src={def.avatar}
                          alt={def.displayName}
                          className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover border-2 border-cyan-400 shadow-md animate-clay"
                        />
                        <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-cyan-500 text-black font-black text-xs flex items-center justify-center border border-white">
                          #{idx + 1}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs md:text-sm font-black text-white">
                          {def.displayName}
                        </div>
                        <div className="text-[10px] text-cyan-300 font-semibold">
                          {def.title}
                        </div>
                        <div className="text-[9px] text-neutral-400">
                          20 HP · ★ {def.abilityName}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CENTER CLASH VS BADGE */}
            <div className="hidden sm:flex flex-col items-center justify-center z-30 mx-2">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-[#ff1744] via-amber-500 to-cyan-400 p-1 shadow-2xl flex items-center justify-center animate-pulse">
                <div className="w-full h-full rounded-full bg-neutral-950 flex flex-col items-center justify-center">
                  <Swords className="w-6 h-6 text-yellow-300" />
                  <span className="font-bungee text-xs font-black text-white">VS</span>
                </div>
              </div>
              <span className="mt-2 text-[10px] font-black text-neutral-400 tracking-widest uppercase">
                3 VS 3
              </span>
            </div>

            {/* RIGHT SIDE: 3 RIVAL HEROES (BANDO ROJO) */}
            <div className="flex flex-col gap-5 md:gap-8 items-end z-30 animate-fade-in">
              <div className="flex items-center gap-1.5 bg-red-950/90 text-red-300 border-2 border-red-500 px-3 py-1 rounded-xl shadow-lg">
                <span className="text-xs md:text-sm font-black tracking-wider">
                  BANDO ROJO (ESCUADRA RIVAL)
                </span>
                <Shield className="w-4 h-4 text-red-400" />
              </div>

              <div className="flex flex-col gap-4">
                {rivalTeam.map((cType, idx) => {
                  const def = CHARACTERS[cType];
                  return (
                    <div
                      key={`r-team-${idx}`}
                      style={{
                        animation: `slideInRight 0.6s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards ${idx * 0.15}s`
                      }}
                      className="flex items-center gap-3 bg-[#201215]/90 border-2 border-red-500/70 p-2.5 rounded-2xl shadow-xl hover:scale-105 transition-all flex-row-reverse text-right"
                    >
                      <div className="relative">
                        <img
                          src={def.avatar}
                          alt={def.displayName}
                          className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover border-2 border-red-400 shadow-md animate-clay"
                        />
                        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white font-black text-xs flex items-center justify-center border border-white">
                          #{idx + 1}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs md:text-sm font-black text-white">
                          {def.displayName}
                        </div>
                        <div className="text-[10px] text-red-300 font-semibold">
                          {def.title}
                        </div>
                        <div className="text-[9px] text-neutral-400">
                          20 HP · ★ {def.abilityName}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA Button */}
      {stage === 'SETTLE' && (
        <div className="absolute bottom-6 inset-x-0 mx-auto max-w-xs text-center z-40">
          <button
            onClick={onComplete}
            className="w-full py-3.5 bg-gradient-to-r from-[#ff1744] to-[#c51162] hover:brightness-110 active:scale-95 text-white font-black text-sm md:text-base rounded-2xl shadow-2xl border-2 border-yellow-300 flex items-center justify-center gap-2 cursor-pointer transition-all animate-bounce"
          >
            <Swords className="w-5 h-5 text-yellow-300" />
            <span>¡INICIAR COMBATE 3 VS 3!</span>
          </button>
        </div>
      )}
    </div>
  );
};
