import React, { useEffect, useState } from 'react';
import { CharacterType } from '../types/game';
import { DiceCharacterSprite } from './DiceCharacterSprite';
import { Dice3DVisual } from './Dice3DVisual';
import { Shield, Sparkles, Sword } from 'lucide-react';

export interface CombatClashData {
  attackerId: number;
  defenderId: number;
  attackerHero: CharacterType;
  defenderHero: CharacterType;
  attackerTeamId?: number;
  defenderTeamId?: number;
  attackerName: string;
  defenderName: string;
  attackerRolls: number[];
  attackerFinalVal: number;
  defenderRolls: number[];
  defenderFinalVal: number;
  isPerfectBlock: boolean;
  damageDealt: number;
  phase: 'RUSH_TO_CENTER' | 'BRAWL_CLOUD' | 'REVEAL_DICE';
}

interface CartoonCombatClashProps {
  clash: CombatClashData;
}

const ONOMATOPOEIAS = ["¡POW!", "¡BAM!", "¡WHACK!", "¡ZAP!", "¡BOING!", "¡KAPOW!"];

export const CartoonCombatClash: React.FC<CartoonCombatClashProps> = ({ clash }) => {
  const [currentWordIdx, setCurrentWordIdx] = useState(0);

  // Cycle onomatopoeias during the fight cloud phase
  useEffect(() => {
    if (clash.phase === 'BRAWL_CLOUD') {
      const interval = setInterval(() => {
        setCurrentWordIdx(prev => (prev + 1) % ONOMATOPOEIAS.length);
      }, 160);
      return () => clearInterval(interval);
    }
  }, [clash.phase]);

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
      {/* 1. PHASE: RUSH TO CENTER */}
      {clash.phase === 'RUSH_TO_CENTER' && (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Attacker rushing from left to center */}
          <div
            className="absolute z-30 transition-all duration-300 ease-out flex flex-col items-center"
            style={{
              left: '42%',
              top: '50%',
              transform: 'translate(-50%, -50%) scale(1.15) rotate(15deg)'
            }}
          >
            <div className="animate-pulse">
              <DiceCharacterSprite
                character={clash.attackerHero}
                teamId={clash.attackerTeamId}
                size={82}
                isAttacking={true}
              />
            </div>
            {/* Speed lines */}
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-70">
              <span className="w-8 h-1 bg-yellow-400 rounded-full" />
              <span className="w-12 h-1 bg-white rounded-full" />
              <span className="w-6 h-1 bg-yellow-400 rounded-full" />
            </div>
          </div>

          {/* Defender leaping to center */}
          <div
            className="absolute z-30 transition-all duration-300 ease-out flex flex-col items-center"
            style={{
              left: '58%',
              top: '50%',
              transform: 'translate(-50%, -50%) scale(1.15) rotate(-15deg)'
            }}
          >
            <DiceCharacterSprite
              character={clash.defenderHero}
              teamId={clash.defenderTeamId}
              size={82}
            />
            {/* Speed lines */}
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-70">
              <span className="w-8 h-1 bg-cyan-400 rounded-full" />
              <span className="w-12 h-1 bg-white rounded-full" />
              <span className="w-6 h-1 bg-cyan-400 rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* 2. PHASE: CARTOON FIGHT BRAWL DUST CLOUD */}
      {clash.phase === 'BRAWL_CLOUD' && (
        <div className="relative flex items-center justify-center w-72 h-72">
          {/* Animated Comic Dust Clouds (Nube de Pelea de Caricatura) */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Back dark smoke */}
            <div className="absolute inset-2 rounded-full bg-neutral-900/60 blur-md animate-ping" />

            {/* Cloud Puffs SVG */}
            <svg
              className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] animate-spin"
              style={{ animationDuration: '3s' }}
              viewBox="0 0 200 200"
            >
              {/* Outer billowy cloud puffs */}
              <circle cx="70" cy="60" r="38" fill="#f8fafc" stroke="#18181b" strokeWidth="4" />
              <circle cx="130" cy="65" r="42" fill="#f1f5f9" stroke="#18181b" strokeWidth="4" />
              <circle cx="150" cy="120" r="36" fill="#e2e8f0" stroke="#18181b" strokeWidth="4" />
              <circle cx="100" cy="150" r="40" fill="#f8fafc" stroke="#18181b" strokeWidth="4" />
              <circle cx="50" cy="120" r="36" fill="#f1f5f9" stroke="#18181b" strokeWidth="4" />
              <circle cx="100" cy="100" r="50" fill="#ffffff" stroke="#18181b" strokeWidth="3" />
            </svg>

            {/* Secondary counter-rotating puff layer */}
            <svg
              className="absolute inset-4 w-4/5 h-4/5 drop-shadow-md animate-spin"
              style={{ animationDuration: '2s', animationDirection: 'reverse' }}
              viewBox="0 0 200 200"
            >
              <circle cx="80" cy="70" r="30" fill="#fed7aa" opacity="0.4" />
              <circle cx="120" cy="80" r="32" fill="#fed7aa" opacity="0.4" />
              <circle cx="100" cy="130" r="34" fill="#fef08a" opacity="0.3" />
            </svg>

            {/* Dice corners popping out of the fight cloud */}
            <div className="absolute top-2 left-6 -rotate-12 animate-bounce">
              <span className="text-2xl">🎲</span>
            </div>
            <div className="absolute bottom-4 right-8 rotate-45 animate-pulse">
              <span className="text-2xl">💥</span>
            </div>
            <div className="absolute top-6 right-6 rotate-12">
              <span className="text-xl">🥊</span>
            </div>
            <div className="absolute bottom-6 left-8 -rotate-45">
              <span className="text-xl">👞</span>
            </div>

            {/* Spinning Impact Stars & Spirals */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="absolute top-2 right-12 animate-spin text-yellow-300 text-2xl font-black">
                ⭐
              </div>
              <div className="absolute bottom-8 left-12 animate-bounce text-yellow-400 text-xl font-black">
                🌟
              </div>
              <div className="absolute top-12 left-4 animate-spin text-amber-300 text-lg">
                ✨
              </div>
              <div className="absolute bottom-4 right-12 animate-pulse text-amber-400 text-xl">
                💫
              </div>
            </div>

            {/* Dynamic Comic Onomatopoeia Speech Bubble */}
            <div className="absolute z-40 animate-bounce">
              <div className="relative bg-yellow-400 text-black font-black font-bungee text-2xl md:text-3xl px-4 py-1.5 rounded-2xl border-4 border-black shadow-[4px_4px_0px_#000000] rotate-[-6deg] tracking-wider uppercase">
                {ONOMATOPOEIAS[currentWordIdx]}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. PHASE: REVEAL DICE RESULT */}
      {clash.phase === 'REVEAL_DICE' && (
        <div className="relative flex flex-col items-center justify-center animate-fadeIn z-30">
          {/* Comic Outcome Banner above table */}
          <div className="mb-4 animate-bounce">
            {clash.isPerfectBlock ? (
              <div className="bg-cyan-500 text-black font-black font-bungee text-sm md:text-base px-4 py-1.5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000] flex items-center gap-2">
                <Shield className="w-5 h-5 text-black" />
                <span>¡SUPER-BLOQUEO HEROICO!</span>
              </div>
            ) : clash.damageDealt > 0 ? (
              <div className="bg-red-500 text-white font-black font-bungee text-sm md:text-base px-4 py-1.5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000] flex items-center gap-2">
                <Sword className="w-5 h-5 text-yellow-300" />
                <span>¡IMPACTO! -{clash.damageDealt} HP</span>
              </div>
            ) : (
              <div className="bg-amber-400 text-black font-black font-bungee text-sm md:text-base px-4 py-1.5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000]">
                ¡GOLPE AMORTIGUADO!
              </div>
            )}
          </div>

          {/* Both dice resting on the central table */}
          <div className="flex items-center justify-center gap-6 md:gap-12 bg-black/60 p-4 rounded-3xl border-2 border-amber-400/60 shadow-2xl backdrop-blur-md">
            {/* Attacker Die & Roll Result */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-black text-cyan-300 uppercase tracking-widest">
                {clash.attackerName} (D6)
              </span>
              <div className="relative">
                <Dice3DVisual
                  value={clash.attackerFinalVal}
                  size={64}
                  teamColor={clash.attackerTeamId === 1 ? 'blue' : 'red'}
                  glowColor={clash.attackerTeamId === 1 ? '#38bdf8' : '#ef4444'}
                />
                {/* Dice Roll Badge */}
                <span className="absolute -bottom-2 -right-2 bg-yellow-400 text-black font-black font-mono text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-black shadow">
                  {clash.attackerFinalVal}
                </span>
              </div>
              <span className="text-[11px] font-black text-white mt-1">
                Ataque: {clash.attackerFinalVal}
              </span>
            </div>

            <div className="text-xl font-black font-bungee text-yellow-400">VS</div>

            {/* Defender Die & Roll Result */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-black text-red-300 uppercase tracking-widest">
                {clash.defenderName} (D6)
              </span>
              <div className="relative">
                <Dice3DVisual
                  value={clash.defenderFinalVal}
                  size={64}
                  teamColor={clash.defenderTeamId === 1 ? 'blue' : 'red'}
                  glowColor={clash.defenderTeamId === 1 ? '#38bdf8' : '#ef4444'}
                />
                {/* Dice Roll Badge */}
                <span className="absolute -bottom-2 -right-2 bg-yellow-400 text-black font-black font-mono text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-black shadow">
                  {clash.defenderFinalVal}
                </span>
              </div>
              <span className="text-[11px] font-black text-white mt-1">
                Bloqueo: {clash.defenderFinalVal}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
