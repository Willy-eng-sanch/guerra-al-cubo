import React from 'react';
import { ActiveDiceRoll } from '../types/game';
import { DiceD5Canvas } from './DiceD5Canvas';
import { ShieldCheck, Sword, Zap, X } from 'lucide-react';

interface DiceRollModalProps {
  roll: ActiveDiceRoll;
  isRolling: boolean;
  onDismiss: () => void;
}

export const DiceRollModal: React.FC<DiceRollModalProps> = ({
  roll,
  isRolling,
  onDismiss
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#161a24] border-2 border-[#ff1744] rounded-2xl p-6 shadow-2xl text-center">
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-neutral-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-black text-white tracking-wider flex items-center justify-center gap-2">
          <Sword className="w-5 h-5 text-[#ff1744]" />
          <span>DUELO DE DADOS D6</span>
        </h3>
        <p className="text-xs text-neutral-400 mt-0.5">
          {roll.attackerName} vs {roll.defenderName}
        </p>

        {/* Dice Comparison Stage */}
        <div className="flex items-center justify-around my-6">
          {/* Attacker Dice */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-bold text-red-400 mb-1">ATACANTE</span>
            <div className="flex gap-2">
              {roll.attackerRolls.map((val, idx) => (
                <DiceD5Canvas key={idx} value={val} isRolling={isRolling} size={64} />
              ))}
            </div>
            <span className="mt-2 text-xs font-mono font-bold text-white bg-red-950/80 px-2 py-0.5 rounded border border-red-500/40">
              Poder: {roll.attackerFinalVal}
            </span>
          </div>

          <div className="text-lg font-black text-yellow-400 font-bungee">VS</div>

          {/* Defender Dice */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-bold text-cyan-400 mb-1">DEFENSOR</span>
            <div className="flex gap-2">
              {roll.defenderRolls.map((val, idx) => (
                <DiceD5Canvas key={idx} value={val} isRolling={isRolling} size={64} />
              ))}
            </div>
            <span className="mt-2 text-xs font-mono font-bold text-white bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
              Bloqueo: {roll.defenderFinalVal}
            </span>
          </div>
        </div>

        {/* Result Outcome Banner */}
        <div className="rounded-xl p-3 border my-3 transition-all">
          {roll.isPerfectBlock ? (
            <div className="bg-cyan-950/70 border-cyan-400 text-cyan-300 p-3.5 rounded-xl border-2 shadow-[0_0_15px_rgba(0,229,255,0.25)]">
              <div className="flex items-center justify-center gap-2 text-base font-black">
                <ShieldCheck className="w-6 h-6 text-cyan-400 animate-bounce" />
                <span>¡BLOQUEO PERFECTO!</span>
              </div>
              <p className="text-xs text-white font-bold mt-1">
                0 de daño recibido · Robas 1 carta del Mazo Global.
              </p>
              <p className="text-[11px] text-cyan-200 mt-0.5">
                ¡Se abre tu ventana de reacción para equipar un arma o activar un truco de inmediato!
              </p>
            </div>
          ) : (
            <div className="bg-red-950/60 border-red-500 text-red-300 p-3 rounded-lg border">
              <div className="flex items-center justify-center gap-2 text-base font-black">
                <Zap className="w-6 h-6 text-red-400 animate-pulse" />
                <span>¡IMPACTO DIRECTO!</span>
              </div>
              <p className="text-xs text-red-200 mt-1 font-bold">
                {roll.damageDealt > 0
                  ? `Se infligen ${roll.damageDealt} puntos de daño a ${roll.defenderName}.`
                  : `El ataque fue mitigado o evadido por una postura.`}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onDismiss}
          className={`w-full mt-2 py-3 active:scale-[0.98] font-black text-sm rounded-xl tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 ${
            roll.isPerfectBlock
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-black border-2 border-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.4)]'
              : 'bg-[#ff1744] hover:bg-[#d50000] text-white border border-[#ff5252]'
          }`}
        >
          {roll.isPerfectBlock ? (
            <>
              <ShieldCheck className="w-4 h-4 text-black" />
              <span>CONTINUAR Y REACCIONAR (EQUIPAR / ACTIVAR)</span>
            </>
          ) : (
            <span>CONTINUAR COMBATE</span>
          )}
        </button>
      </div>
    </div>
  );
};
