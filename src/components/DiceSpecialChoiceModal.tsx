import React from 'react';
import { DiceD5Canvas } from './DiceD5Canvas';
import { Layers, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import { sound } from '../audio/soundManager';

interface DiceSpecialChoiceModalProps {
  actorName: string;
  isAttacker: boolean;
  canDrawCard: boolean;
  onChoose: (choice: 'CARD' | 'EXTRA_TURN') => void;
}

export const DiceSpecialChoiceModal: React.FC<DiceSpecialChoiceModalProps> = ({
  actorName,
  isAttacker,
  canDrawCard,
  onChoose
}) => {
  const handleSelect = (choice: 'CARD' | 'EXTRA_TURN') => {
    if (choice === 'CARD' && !canDrawCard) return;
    if (choice === 'CARD') {
      sound.playCardDraw();
    } else {
      sound.playStanceActivate();
    }
    onChoose(choice);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#181d2a] to-[#0f121a] border-2 border-yellow-400 rounded-3xl p-6 shadow-[0_0_40px_rgba(250,204,21,0.25)] text-center">
        {/* Glow Header */}
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/50 text-yellow-300 font-black text-xs tracking-wider mb-2">
          <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
          <span>¡REGLA D6: CARA ESPECIAL 6!</span>
          <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
        </div>

        <div className="my-3 flex justify-center">
          <div className="relative p-2 bg-[#232b3d] rounded-2xl border-2 border-yellow-400 shadow-xl animate-bounce">
            <DiceD5Canvas value={6} size={84} />
          </div>
        </div>

        <h3 className="text-xl font-black text-white tracking-wide">
          ¡{actorName.toUpperCase()} SACÓ UN 6!
        </h3>
        <p className="text-xs text-neutral-300 mt-1 max-w-xs mx-auto">
          El 6 no es un número común: ha sido <b className="text-yellow-300">reemplazado por una ventaja táctica</b> a tu elección.
        </p>

        {/* The 2 choices */}
        <div className="grid grid-cols-1 gap-3 my-5">
          {/* Option 1: Draw Card */}
          <button
            disabled={!canDrawCard}
            onClick={() => handleSelect('CARD')}
            className={`p-4 rounded-2xl bg-gradient-to-r from-[#17263c] to-[#1e3454] hover:from-[#213554] hover:to-[#284672] active:scale-[0.98] border-2 border-cyan-400/70 text-left flex items-center gap-3.5 transition-all shadow-lg group ${canDrawCard ? 'cursor-pointer' : 'opacity-45 cursor-not-allowed grayscale'}`}
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-white text-sm group-hover:text-cyan-300 transition-colors">
                  ROBAR 1 CARTA DEL MAZO
                </span>
                <span className="text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/50 px-2 py-0.5 rounded-full">
                  MAZO GLOBAL
                </span>
              </div>
              <p className="text-[11px] text-neutral-300 mt-0.5">
                {canDrawCard
                  ? 'Roba de inmediato una carta de truco o arma para tu mano.'
                  : 'Piel de Piedra impide robar cartas. Elige el punto de acción adicional.'}
              </p>
            </div>
          </button>

          {/* Option 2: Extra Turn / Action Point */}
          <button
            onClick={() => handleSelect('EXTRA_TURN')}
            className="p-4 rounded-2xl bg-gradient-to-r from-[#2f1b1b] to-[#452222] hover:from-[#3e2424] hover:to-[#5a2c2c] active:scale-[0.98] border-2 border-amber-400/70 text-left flex items-center gap-3.5 transition-all shadow-lg cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-white text-sm group-hover:text-amber-300 transition-colors">
                  TURNO EXTRA (+1 ACCIÓN)
                </span>
                <span className="text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded-full">
                  +1 PA
                </span>
              </div>
              <p className="text-[11px] text-neutral-300 mt-0.5">
                {isAttacker
                  ? 'Ganas 1 punto de acción adicional para volver a atacar o jugar cartas.'
                  : 'Ganas 1 acción extra que se sumará al inicio de tu siguiente turno.'}
              </p>
            </div>
          </button>
        </div>

        <div className="text-[11px] text-neutral-400 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" />
          <span>Toca una opción para confirmar tu recompensa</span>
        </div>
      </div>
    </div>
  );
};
