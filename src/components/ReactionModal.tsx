import React from 'react';
import { CardType, GameCard, PlayerState, TrickTiming } from '../types/game';
import { ShieldCheck, Sword, Shield, Sparkles, X, Check } from 'lucide-react';

interface ReactionModalProps {
  player: PlayerState;
  onEquipReaction: (cardId: number) => void;
  onActivateReaction: (cardId: number) => void;
  onPrepareReaction: (cardId: number) => void;
  onSkipReaction: () => void;
}

export const ReactionModal: React.FC<ReactionModalProps> = ({
  player,
  onEquipReaction,
  onActivateReaction,
  onPrepareReaction,
  onSkipReaction
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#141824] border-2 border-cyan-400 rounded-3xl p-5 shadow-2xl text-left space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#252f44] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.4)]">
              <ShieldCheck className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase">
                ¡REACCIÓN POR BLOQUEO PERFECTO!
              </span>
              <h3 className="text-base font-black text-white font-bungee">
                {player.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onSkipReaction}
            className="p-1 rounded-lg text-neutral-400 hover:text-white"
            title="Saltar reacción"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Explanation */}
        <div className="bg-cyan-950/40 border border-cyan-500/40 p-3 rounded-2xl text-xs text-cyan-200 leading-relaxed">
          <p>
            ¡Tu Bloqueo Perfecto abrió una <b className="text-white">ventana de reacción inmediata</b>!
            Robaste del Mazo Global y tienes la oportunidad de <b className="text-yellow-300">equipar un arma</b>, <b className="text-purple-300">activar un truco</b> o <b className="text-cyan-300">preparar una postura</b> ahora mismo sin costo de turno.
          </p>
        </div>

        {/* Hand Cards Available to React With */}
        <div>
          <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2">
            Tus cartas disponibles en mano ({player.hand.length}):
          </span>

          {player.hand.length === 0 ? (
            <div className="bg-[#0f121a] p-4 rounded-2xl border border-dashed border-neutral-700 text-center text-xs text-neutral-500">
              No tienes cartas en mano para activar en este momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
              {player.hand.map((card, idx) => {
                const isWeapon = card.type === CardType.WEAPON;
                const isStance = card.timing === TrickTiming.PREPARED_STANCE;

                return (
                  <div
                    key={card.uid || `reaction-card-${card.id}-${idx}`}
                    className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                      isWeapon
                        ? 'bg-[#1a1711] border-amber-600/60'
                        : isStance
                        ? 'bg-[#101925] border-cyan-500/60'
                        : 'bg-[#181222] border-purple-500/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[9px] font-mono mb-1">
                        <span className="font-bold text-neutral-400">#{card.id}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded font-black ${
                            isWeapon
                              ? 'bg-amber-950 text-amber-300'
                              : isStance
                              ? 'bg-cyan-950 text-cyan-300'
                              : 'bg-purple-950 text-purple-300'
                          }`}
                        >
                          {isWeapon ? 'ARMA' : isStance ? 'POSTURA' : 'TRUCO'}
                        </span>
                      </div>
                      <h4 className="text-xs font-extrabold text-white flex items-center gap-1">
                        {isWeapon ? (
                          <Sword className="w-3.5 h-3.5 text-amber-400" />
                        ) : isStance ? (
                          <Shield className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        )}
                        <span>{card.name}</span>
                      </h4>
                      <p className="text-[10px] text-neutral-300 mt-1 line-clamp-2">
                        {card.description}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-1.5 border-t border-neutral-800">
                      {isWeapon ? (
                        <button
                          onClick={() => onEquipReaction(card.id)}
                          className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-lg tracking-wider transition-all flex items-center justify-center gap-1 shadow"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>EQUIPAR DE INMEDIATO</span>
                        </button>
                      ) : isStance ? (
                        <button
                          onClick={() => onPrepareReaction(card.id)}
                          className="w-full py-1.5 bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs rounded-lg tracking-wider transition-all flex items-center justify-center gap-1 shadow"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>PREPARAR POSTURA</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onActivateReaction(card.id)}
                          className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-lg tracking-wider transition-all flex items-center justify-center gap-1 shadow"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>ACTIVAR EFECTO</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Skip button */}
        <button
          onClick={onSkipReaction}
          className="w-full py-2.5 bg-[#1b2230] hover:bg-[#252f44] text-neutral-300 font-bold text-xs rounded-xl border border-[#303d58] transition-all text-center"
        >
          No usar cartas ahora / Continuar combate
        </button>
      </div>
    </div>
  );
};
