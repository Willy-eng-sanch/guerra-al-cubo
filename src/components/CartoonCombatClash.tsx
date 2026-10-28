import React, { useEffect, useState } from 'react';
import { CharacterType } from '../types/game';
import { DiceCharacterSprite } from './DiceCharacterSprite';
import { Dice3DVisual } from './Dice3DVisual';
import { sound } from '../audio/soundManager';
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

const ONOMATOPOEIAS = ["¡POW!", "¡BAM!", "¡WHACK!", "¡ZAP!", "¡KAPOW!", "¡SMACK!"];

export const CartoonCombatClash: React.FC<CartoonCombatClashProps> = ({ clash }) => {
  const [currentWordIdx, setCurrentWordIdx] = useState(0);

  // Play audio cues when entering phases
  useEffect(() => {
    if (clash.phase === 'RUSH_TO_CENTER') {
      sound.playLeapWhoosh();
    } else if (clash.phase === 'BRAWL_CLOUD') {
      const interval = setInterval(() => {
        setCurrentWordIdx(prev => (prev + 1) % ONOMATOPOEIAS.length);
      }, 150);
      return () => clearInterval(interval);
    } else if (clash.phase === 'REVEAL_DICE') {
      sound.playPaperTapeSlap();
    }
  }, [clash.phase]);

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center overflow-hidden">
      {/* =========================================================================
          FASE 1: SALTO AL CENTRO DE LA MESA (LEAP TO TABLE CENTER)
          El dado atacante y el defensor saltan describiendo un arco hacia el centro.
         ========================================================================= */}
      {clash.phase === 'RUSH_TO_CENTER' && (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Sombra de salto en el centro de la mesa */}
          <div className="absolute w-44 h-8 bg-black/80 rounded-full blur-md animate-ping" />

          {/* Dado Atacante: Salto parabólico desde la izquierda hacia el centro */}
          <div
            className="absolute z-30 animate-leap-attacker flex flex-col items-center"
            style={{
              left: '43%',
              top: '48%',
            }}
          >
            <div className="relative">
              <DiceCharacterSprite
                character={clash.attackerHero}
                teamId={clash.attackerTeamId}
                size={88}
                isAttacking={true}
              />
              {/* Estelas de velocidad y líneas de viento cómicas */}
              <div className="absolute -left-14 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 opacity-80 pointer-events-none">
                <span className="w-12 h-1.5 bg-yellow-400 rounded-full shadow-sm" />
                <span className="w-16 h-2 bg-white rounded-full shadow-sm" />
                <span className="w-10 h-1.5 bg-cyan-400 rounded-full shadow-sm" />
              </div>
            </div>
            <span className="text-[10px] font-black font-bungee text-cyan-300 drop-shadow mt-1">
              {clash.attackerName} (SALTO)
            </span>
          </div>

          {/* Dado Defensor: Salto parabólico desde la derecha hacia el centro */}
          <div
            className="absolute z-30 animate-leap-defender flex flex-col items-center"
            style={{
              left: '57%',
              top: '48%',
            }}
          >
            <div className="relative">
              <DiceCharacterSprite
                character={clash.defenderHero}
                teamId={clash.defenderTeamId}
                size={88}
              />
              {/* Estelas de velocidad del defensor */}
              <div className="absolute -right-14 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 opacity-80 pointer-events-none">
                <span className="w-12 h-1.5 bg-red-400 rounded-full shadow-sm" />
                <span className="w-16 h-2 bg-white rounded-full shadow-sm" />
                <span className="w-10 h-1.5 bg-yellow-400 rounded-full shadow-sm" />
              </div>
            </div>
            <span className="text-[10px] font-black font-bungee text-red-300 drop-shadow mt-1">
              {clash.defenderName} (DEFENSA)
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          FASE 2: NUBE DE COMBATE CÓMICA ESTILO CARICATURA (CARTOON BRAWL DUST CLOUD)
          Nube gigante de humo con onomatopeyas, estrellas, guantes y patadas volando.
         ========================================================================= */}
      {clash.phase === 'BRAWL_CLOUD' && (
        <div className="relative flex items-center justify-center w-80 h-80 animate-brawl-shake">
          {/* Humo oscuro y polvo base */}
          <div className="absolute inset-4 rounded-full bg-black/60 blur-lg animate-pulse" />

          {/* Nube de pelea estilo caricatura (Puffs de humo blancos con bordes negros gruesos) */}
          <div className="relative w-72 h-72 flex items-center justify-center">
            {/* Capa principal de nubes rotatorias */}
            <svg
              className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.95)] animate-spin"
              style={{ animationDuration: '2.5s' }}
              viewBox="0 0 200 200"
            >
              <circle cx="65" cy="55" r="40" fill="#f8fafc" stroke="#09090b" strokeWidth="5" />
              <circle cx="135" cy="60" r="44" fill="#f1f5f9" stroke="#09090b" strokeWidth="5" />
              <circle cx="155" cy="125" r="38" fill="#e2e8f0" stroke="#09090b" strokeWidth="5" />
              <circle cx="105" cy="155" r="42" fill="#f8fafc" stroke="#09090b" strokeWidth="5" />
              <circle cx="45" cy="125" r="38" fill="#f1f5f9" stroke="#09090b" strokeWidth="5" />
              <circle cx="100" cy="100" r="54" fill="#ffffff" stroke="#09090b" strokeWidth="4" />
            </svg>

            {/* Capa interior de humo de polvo amarillento/asfalto */}
            <svg
              className="absolute inset-5 w-4/5 h-4/5 drop-shadow-md animate-spin"
              style={{ animationDuration: '1.8s', animationDirection: 'reverse' }}
              viewBox="0 0 200 200"
            >
              <circle cx="75" cy="65" r="32" fill="#fed7aa" opacity="0.5" />
              <circle cx="125" cy="75" r="34" fill="#fed7aa" opacity="0.5" />
              <circle cx="100" cy="135" r="36" fill="#fef08a" opacity="0.4" />
            </svg>

            {/* Elementos cómicos asomándose de la pelea callejera */}
            <div className="absolute top-1 left-5 -rotate-12 animate-bounce">
              <span className="text-3xl filter drop-shadow">🎲</span>
            </div>
            <div className="absolute bottom-3 right-6 rotate-45 animate-pulse">
              <span className="text-3xl filter drop-shadow">💥</span>
            </div>
            <div className="absolute top-4 right-5 rotate-12 animate-bounce">
              <span className="text-2xl filter drop-shadow">🥊</span>
            </div>
            <div className="absolute bottom-4 left-6 -rotate-45 animate-bounce">
              <span className="text-2xl filter drop-shadow">👞</span>
            </div>
            <div className="absolute top-1/2 left-2 -translate-y-1/2">
              <span className="text-2xl filter drop-shadow">⚡</span>
            </div>
            <div className="absolute top-1/2 right-2 -translate-y-1/2">
              <span className="text-2xl filter drop-shadow">💦</span>
            </div>

            {/* Estrellas y espirales de impacto girando alrededor */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="absolute top-3 right-10 animate-spin text-yellow-300 text-3xl font-black">
                ⭐
              </div>
              <div className="absolute bottom-7 left-10 animate-bounce text-yellow-400 text-2xl font-black">
                🌟
              </div>
              <div className="absolute top-10 left-3 animate-spin text-amber-300 text-2xl">
                ✨
              </div>
              <div className="absolute bottom-3 right-10 animate-pulse text-amber-400 text-2xl">
                💫
              </div>
            </div>

            {/* Bocadillo de Onomatopeya Cómica Dinámica */}
            <div className="absolute z-40 animate-bounce">
              <div className="relative bg-yellow-400 text-black font-black font-bungee text-2xl md:text-3xl px-5 py-2 rounded-2xl border-4 border-black shadow-[5px_5px_0px_#000000] rotate-[-5deg] tracking-wider uppercase">
                {ONOMATOPOEIAS[currentWordIdx]}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          FASE 3: SALIDA DEL RESULTADO Y ESTABILIZACIÓN EN LA MESA
          La nube se disipa con un "POOF", los dados se estabilizan con sus
          recortes collage papercraft y cinta adhesiva, y se desvela el resultado.
         ========================================================================= */}
      {clash.phase === 'REVEAL_DICE' && (
        <div className="relative flex flex-col items-center justify-center animate-fadeIn z-30">
          {/* Banner de Resultado Cómico de Combate */}
          <div className="mb-4 animate-bounce">
            {clash.isPerfectBlock ? (
              <div className="bg-cyan-500 text-black font-black font-bungee text-sm md:text-base px-5 py-2 rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000] flex items-center gap-2">
                <Shield className="w-5 h-5 text-black animate-pulse" />
                <span>¡SUPER-BLOQUEO HEROICO! (IGUALÓ EL DADO)</span>
              </div>
            ) : clash.damageDealt > 0 ? (
              <div className="bg-red-500 text-white font-black font-bungee text-sm md:text-base px-5 py-2 rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000] flex items-center gap-2">
                <Sword className="w-5 h-5 text-yellow-300" />
                <span>¡IMPACTO CRÍTICO! -{clash.damageDealt} HP</span>
              </div>
            ) : (
              <div className="bg-amber-400 text-black font-black font-bungee text-sm md:text-base px-5 py-2 rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000]">
                ¡GOLPE AMORTIGUADO!
              </div>
            )}
          </div>

          {/* Ambos Dados Estabilizados sobre el Tablero Central */}
          <div className="flex items-center justify-center gap-6 md:gap-14 bg-black/75 p-5 rounded-3xl border-2 border-amber-400/70 shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-md">
            {/* Dado Atacante: Estabilizado con Pegatina Papercraft y Cinta Adhesiva */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-black text-cyan-300 uppercase tracking-widest bg-blue-950/80 px-2 py-0.5 rounded border border-cyan-400">
                {clash.attackerName} (D6)
              </span>
              <div className="relative">
                <DiceCharacterSprite
                  character={clash.attackerHero}
                  teamId={clash.attackerTeamId}
                  diceValue={clash.attackerFinalVal}
                  size={76}
                  isStabilized={true}
                />
                {/* Badge con el número final sacado en el dado */}
                <span className="absolute -bottom-2 -right-2 bg-yellow-400 text-black font-black font-mono text-sm w-7 h-7 rounded-full flex items-center justify-center border-2 border-black shadow-lg">
                  {clash.attackerFinalVal}
                </span>
              </div>
              <span className="text-[11px] font-black font-mono text-white mt-0.5">
                Ataque: {clash.attackerFinalVal}
              </span>
            </div>

            <div className="text-2xl font-black font-bungee text-yellow-400 drop-shadow">
              VS
            </div>

            {/* Dado Defensor: Estabilizado con Pegatina Papercraft y Cinta Adhesiva */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-black text-red-300 uppercase tracking-widest bg-red-950/80 px-2 py-0.5 rounded border border-red-500">
                {clash.defenderName} (D6)
              </span>
              <div className="relative">
                <DiceCharacterSprite
                  character={clash.defenderHero}
                  teamId={clash.defenderTeamId}
                  diceValue={clash.defenderFinalVal}
                  size={76}
                  isStabilized={true}
                />
                {/* Badge con el número de bloqueo sacado en el dado */}
                <span className="absolute -bottom-2 -right-2 bg-yellow-400 text-black font-black font-mono text-sm w-7 h-7 rounded-full flex items-center justify-center border-2 border-black shadow-lg">
                  {clash.defenderFinalVal}
                </span>
              </div>
              <span className="text-[11px] font-black font-mono text-white mt-0.5">
                Bloqueo: {clash.defenderFinalVal}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
