import React from 'react';
import { ActiveDiceRoll } from '../types/game';
import { Dice3DVisual } from './Dice3DVisual';
import { ShieldCheck, Sword, Zap, X, Dices } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-md bg-[#121622] border-2 border-[#ff1744] rounded-3xl p-5 md:p-6 shadow-2xl text-center overflow-hidden">
        {/* Subtle 3D dice background texture */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-center"
          style={{
            backgroundImage: `url('/src/assets/images/dice_combat_3d_1793105186984.jpg')`
          }}
        />

        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-neutral-400 hover:text-white p-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 z-10 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10">
          <h3 className="text-lg md:text-xl font-black text-white tracking-wider flex items-center justify-center gap-2 font-bungee">
            <Dices className="w-5 h-5 text-[#ff1744]" />
            <span>LANZAMIENTO DE DADOS 3D</span>
          </h3>
          <p className="text-xs text-neutral-300 mt-0.5">
            <b className="text-red-400">{roll.attackerName}</b> vs <b className="text-cyan-400">{roll.defenderName}</b>
          </p>

          {/* Dice Comparison Stage */}
          <div className="flex items-center justify-around my-6 bg-black/40 p-4 rounded-2xl border border-white/10 shadow-inner">
            {/* Attacker Dice */}
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-black text-red-400 mb-2 tracking-wider">
                ATACANTE (D6)
              </span>
              <div className="flex gap-2">
                {roll.attackerRolls.map((val, idx) => (
                  <Dice3DVisual
                    key={idx}
                    value={val}
                    isRolling={isRolling}
                    size={64}
                    glowColor="#ef4444"
                  />
                ))}
              </div>
              <span className="mt-2.5 text-xs font-mono font-black text-white bg-red-950/90 px-3 py-1 rounded-lg border border-red-500/50 shadow">
                Impacto: {roll.attackerFinalVal}
              </span>
            </div>

            <div className="text-lg font-black text-yellow-400 font-bungee px-2">VS</div>

            {/* Defender Dice */}
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-black text-cyan-400 mb-2 tracking-wider">
                DEFENSOR (D6)
              </span>
              <div className="flex gap-2">
                {roll.defenderRolls.map((val, idx) => (
                  <Dice3DVisual
                    key={idx}
                    value={val}
                    isRolling={isRolling}
                    size={64}
                    glowColor="#06b6d4"
                  />
                ))}
              </div>
              <span className="mt-2.5 text-xs font-mono font-black text-white bg-cyan-950/90 px-3 py-1 rounded-lg border border-cyan-500/50 shadow">
                Bloqueo: {roll.defenderFinalVal}
              </span>
            </div>
          </div>

          {/* Result Outcome Banner */}
          <div className="rounded-2xl p-3.5 border my-3 transition-all">
            {roll.isPerfectBlock ? (
              <div className="bg-cyan-950/80 border-cyan-400 text-cyan-200 p-3.5 rounded-xl border-2 shadow-[0_0_20px_rgba(0,229,255,0.3)]">
                <div className="flex items-center justify-center gap-2 text-base font-black">
                  <ShieldCheck className="w-6 h-6 text-cyan-300 animate-bounce" />
                  <span>¡SUPER-BLOQUEO HEROICO!</span>
                </div>
                <p className="text-xs text-white font-bold mt-1.5 leading-relaxed">
                  ¡Tu tiro de bloqueo ({roll.defenderFinalVal}) coincidió exactamente con el atacante!
                  0 daño recibido · Desatas tu Superpoder · Robas 1 carta del Mazo Global.
                </p>
              </div>
            ) : (
              <div className="bg-red-950/70 border-red-500 text-red-200 p-3 rounded-xl border">
                <div className="flex items-center justify-center gap-2 text-base font-black">
                  <Zap className="w-5 h-5 text-red-400 animate-pulse" />
                  <span>¡GOLPE EFECTIVO!</span>
                </div>
                <p className="text-xs text-red-100 mt-1 font-bold">
                  {roll.damageDealt > 0
                    ? `Se infligen ${roll.damageDealt} puntos de daño a ${roll.defenderName}.`
                    : `El ataque fue completamente mitigado por la defensa.`}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={onDismiss}
            className={`w-full mt-2 py-3.5 active:scale-[0.98] font-black text-sm rounded-2xl tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              roll.isPerfectBlock
                ? 'bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-black border-2 border-cyan-200 shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                : 'bg-[#ff1744] hover:bg-[#d50000] text-white border border-[#ff5252]'
            }`}
          >
            {roll.isPerfectBlock ? (
              <>
                <ShieldCheck className="w-4 h-4 text-black" />
                <span>CONTINUAR Y REACCIONAR (EQUIPAR / TRUCO)</span>
              </>
            ) : (
              <span>CONTINUAR COMBATE</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
