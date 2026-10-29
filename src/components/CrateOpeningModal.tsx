import React, { useState } from 'react';
import { collectionManager, BoxOpeningResult } from '../data/collectionManager';
import { Cube3DCanvas } from './Cube3DCanvas';
import { sound } from '../audio/soundManager';
import { CATEGORY_INFO } from '../types/game';
import confetti from 'canvas-confetti';
import {
  Package,
  Sparkles,
  X,
  Coins,
  Check,
  RotateCw,
  Gift,
  Shield,
  Zap,
  ArrowRight
} from 'lucide-react';

interface CrateOpeningModalProps {
  onClose: () => void;
  onSquadUpdated?: () => void;
}

export const CrateOpeningModal: React.FC<CrateOpeningModalProps> = ({
  onClose,
  onSquadUpdated
}) => {
  const [openingStage, setOpeningStage] = useState<'READY' | 'SHAKING' | 'REVEALED'>('READY');
  const [result, setResult] = useState<BoxOpeningResult | null>(null);
  const coins = collectionManager.getCoins();
  const boxCost = collectionManager.getBoxCost();
  const canAfford = collectionManager.canOpenBox();

  const handleOpenCrate = () => {
    if (!canAfford) return;
    setOpeningStage('SHAKING');
    sound.playCupShake();

    setTimeout(() => {
      const drop = collectionManager.openBoxOfThree();
      setResult(drop);
      setOpeningStage('REVEALED');
      sound.playDiceRoll();
      sound.playStanceActivate();

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      if (onSquadUpdated) onSquadUpdated();
    }, 1200);
  };

  const handleOpenAnother = () => {
    if (!collectionManager.canOpenBox()) return;
    handleOpenCrate();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#121622] border-2 border-yellow-400 rounded-3xl p-5 sm:p-7 shadow-2xl text-white text-center cursor-default overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Street Neon Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#232c40] pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-yellow-400/20 border border-yellow-400 flex items-center justify-center shadow">
              <Package className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-left">
              <h3 className="text-base sm:text-lg font-black font-bungee text-white leading-tight">
                CAJA CALLEJERA DE 3 DADOS
              </h3>
              <p className="text-[10px] sm:text-xs text-neutral-400">
                Desbloquea 3 personajes aleatorios para tu escuadrón
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#181d2a] px-3 py-1.5 rounded-xl border border-yellow-500/40 text-yellow-300 text-xs font-mono font-bold">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span>{collectionManager.getCoins()} Monedas</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-[#1b2232] hover:bg-[#283248] text-neutral-400 hover:text-white border border-[#2f3b52] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col items-center justify-center py-2">
          {/* =========================================================================
              STAGE 1: READY TO OPEN
             ========================================================================= */}
          {openingStage === 'READY' && (
            <div className="space-y-5 my-auto max-w-md">
              <div className="relative mx-auto w-40 h-40 flex items-center justify-center">
                <div className="absolute inset-0 bg-yellow-400/15 rounded-3xl blur-2xl animate-pulse" />
                <div className="relative w-36 h-36 rounded-3xl bg-gradient-to-br from-amber-600 via-yellow-700 to-amber-950 border-4 border-yellow-400 shadow-[0_10px_30px_rgba(250,204,21,0.3)] flex flex-col items-center justify-center p-3 text-center transition-transform hover:scale-105 cursor-pointer">
                  <Package className="w-16 h-16 text-yellow-200 drop-shadow-md animate-bounce" />
                  <span className="text-[10px] font-black font-bungee text-yellow-200 mt-1 uppercase tracking-wider">
                    PACK DE 3 DADOS
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-cyan-300 tracking-widest bg-blue-950/80 px-3 py-1 rounded-full border border-cyan-400/40">
                  {boxCost === 0 ? '🎁 ¡PRIMERA CAJA GRATIS!' : `COSTE: ${boxCost} MONEDAS`}
                </span>
                <p className="text-xs text-neutral-300 mt-2">
                  Cada caja contiene <b>3 dados de personajes</b> con ADN exclusivo, superpoderes heroicos y sinergias de clase.
                </p>
                {collectionManager.getUnlockedCharacters().length < 3 && (
                  <p className="text-[11px] text-amber-300 font-bold mt-1">
                    ⚡ Necesitas al menos 3 dados para competir en el Modo Online.
                  </p>
                )}
              </div>

              <button
                onClick={handleOpenCrate}
                disabled={!canAfford}
                className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl transition-all cursor-pointer font-bungee flex items-center justify-center gap-2 ${
                  canAfford
                    ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:brightness-110 active:scale-95 text-black border-2 border-yellow-200 shadow-[0_0_20px_rgba(250,204,21,0.4)]'
                    : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed opacity-60'
                }`}
              >
                {boxCost === 0 ? (
                  <>
                    <Gift className="w-5 h-5 text-black" />
                    <span>¡ABRIR CAJA INICIAL GRATUITA!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-black" />
                    <span>ABRIR CAJA DE 3 (100 🪙)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* =========================================================================
              STAGE 2: SHAKING ANIMATION
             ========================================================================= */}
          {openingStage === 'SHAKING' && (
            <div className="space-y-4 my-auto">
              <div className="w-40 h-40 mx-auto rounded-3xl bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-900 border-4 border-yellow-300 shadow-[0_0_40px_rgba(250,204,21,0.6)] flex items-center justify-center animate-spin">
                <Package className="w-20 h-20 text-yellow-200" />
              </div>
              <h4 className="text-lg font-black font-bungee text-yellow-300 animate-pulse">
                ¡ABRIENDO CAJA DE 3 DADOS...!
              </h4>
              <p className="text-xs text-neutral-400">
                Barajando dados y revelando ADN heroico...
              </p>
            </div>
          )}

          {/* =========================================================================
              STAGE 3: REVEALED 3 CHARACTERS
             ========================================================================= */}
          {openingStage === 'REVEALED' && result && (
            <div className="space-y-4 w-full animate-fadeIn">
              <div className="flex items-center justify-center gap-2 text-xs font-black text-yellow-400 uppercase tracking-widest font-bungee">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>¡3 DADOS EXTRAÍDOS DE LA CAJA!</span>
              </div>

              {/* 3 Revealed Character Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {result.characters.map((char, idx) => {
                  const isNew = result.isNew[idx];
                  return (
                    <div
                      key={`revealed-char-${char.type}-${idx}`}
                      className={`p-3.5 rounded-2xl border-2 flex flex-col items-center text-center justify-between transition-all relative overflow-hidden ${
                        isNew
                          ? 'bg-gradient-to-b from-[#1b253b] to-[#111724] border-yellow-400/90 shadow-[0_0_15px_rgba(250,204,21,0.3)] ring-1 ring-yellow-400/40'
                          : 'bg-[#151923] border-[#252f44] text-neutral-300'
                      }`}
                    >
                      {/* Ribbon */}
                      <div className="absolute top-0 right-0">
                        {isNew ? (
                          <span className="text-[9px] font-black uppercase text-black bg-yellow-400 px-2 py-0.5 rounded-bl-lg shadow-sm">
                            ¡NUEVO!
                          </span>
                        ) : (
                          <span className="text-[8px] font-black uppercase text-yellow-300 bg-yellow-950 px-1.5 py-0.5 rounded-bl-lg border-b border-l border-yellow-600">
                            +30 🪙 DUPLICADO
                          </span>
                        )}
                      </div>

                      {/* 3D Dice Preview */}
                      <div className="my-2">
                        <Cube3DCanvas
                          character={char.type}
                          teamColor="blue"
                          size={70}
                        />
                      </div>

                      <div className="w-full">
                        <h5 className="font-black font-bungee text-sm text-white truncate">
                          {char.displayName}
                        </h5>
                        <p className="text-[10px] text-cyan-300 font-bold truncate mt-0.5">
                          {char.title}
                        </p>
                        <p className="text-[9px] text-neutral-300 line-clamp-2 mt-1 leading-tight">
                          {char.description}
                        </p>

                        {/* Classes */}
                        <div className="flex items-center justify-center gap-1 mt-2">
                          {char.classes.map(cat => {
                            const info = CATEGORY_INFO[cat];
                            return (
                              <span
                                key={cat}
                                className="text-[9px] font-black px-1.5 py-0.2 rounded border"
                                style={{
                                  backgroundColor: info.bgGlow,
                                  color: info.color,
                                  borderColor: info.borderColor
                                }}
                              >
                                {info.badge}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status / Duplicate message */}
              {result.bonusCoinsEarned > 0 && (
                <div className="bg-yellow-950/50 border border-yellow-600/40 rounded-xl p-2 text-xs text-yellow-300 flex items-center justify-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span>Obtuviste +{result.bonusCoinsEarned} Monedas de compensación por dados repetidos.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        {openingStage === 'REVEALED' && (
          <div className="border-t border-[#232c40] pt-3 mt-3 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-neutral-400 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Colección actualizada: <b>{collectionManager.getUnlockedCharacters().length}/13 dados</b></span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {collectionManager.canOpenBox() && (
                <button
                  onClick={handleOpenAnother}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#1e2535] hover:bg-[#283248] border border-[#3b4760] text-yellow-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>ABRIR OTRA (100 🪙)</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 text-black font-black text-xs sm:text-sm font-bungee tracking-wide shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>¡LISTO, IR A COMBATIR!</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
