import React, { useState, useEffect } from 'react';
import { collectionManager, BoxOpeningResult, AuraRankInfo } from '../data/collectionManager';
import { Cube3DCanvas } from './Cube3DCanvas';
import { sound } from '../audio/soundManager';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Package,
  Coins,
  Shield,
  Zap,
  Flame,
  Crown,
  Heart,
  Gift,
  Check,
  X,
  ArrowRight,
  TrendingUp,
  Award,
  Coffee,
  HelpCircle
} from 'lucide-react';

interface AuraShopModalProps {
  onClose: () => void;
  onSquadUpdated?: () => void;
  initialTab?: 'AURA' | 'OPEN_BOX' | 'PAY_WHAT_YOU_WANT';
}

export const AuraShopModal: React.FC<AuraShopModalProps> = ({
  onClose,
  onSquadUpdated,
  initialTab = 'AURA'
}) => {
  const [activeTab, setActiveTab] = useState<'AURA' | 'OPEN_BOX' | 'PAY_WHAT_YOU_WANT'>(initialTab);
  const [auraInfo, setAuraInfo] = useState<AuraRankInfo>(() => collectionManager.getAuraRank());
  const [unopenedBoxes, setUnopenedBoxes] = useState<number>(() => collectionManager.getUnopenedBoxes());
  const [coins, setCoins] = useState<number>(() => collectionManager.getCoins());
  const [isPatron, setIsPatron] = useState<boolean>(() => collectionManager.getIsPatron());

  // Crate Opening State
  const [openingStage, setOpeningStage] = useState<'READY' | 'SHAKING' | 'REVEALED'>('READY');
  const [boxResult, setBoxResult] = useState<BoxOpeningResult | null>(null);

  // Pay What You Want State
  const [selectedContribution, setSelectedContribution] = useState<number>(3);
  const [customAmount, setCustomAmount] = useState<string>('5');
  const [patronSuccessMsg, setPatronSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = collectionManager.subscribe(() => {
      setAuraInfo(collectionManager.getAuraRank());
      setUnopenedBoxes(collectionManager.getUnopenedBoxes());
      setCoins(collectionManager.getCoins());
      setIsPatron(collectionManager.getIsPatron());
    });
    return unsub;
  }, []);

  // Handle Box Opening
  const handleOpenCrate = () => {
    if (!collectionManager.canOpenBox()) return;
    setOpeningStage('SHAKING');
    sound.playCupShake();

    setTimeout(() => {
      const drop = collectionManager.openBoxOfThree();
      setBoxResult(drop);
      setOpeningStage('REVEALED');
      sound.playDiceRoll();
      sound.playStanceActivate();

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onSquadUpdated) onSquadUpdated();
    }, 1200);
  };

  // Handle Pay What You Want purchase
  const handleSupportBeta = (amountUSD: number) => {
    sound.playCardDraw();
    const boxes = amountUSD >= 10 ? 8 : amountUSD >= 5 ? 4 : amountUSD >= 3 ? 2 : 1;
    const auraBonus = amountUSD * 50;

    collectionManager.supportPayWhatYouWant(amountUSD, boxes, auraBonus);

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 }
    });

    setPatronSuccessMsg(
      `¡GRACIAS POR APOYAR LA BETA! Has recibido +${boxes} Cajas de 3 Dados, +${auraBonus} de Aura y el distintivo de Mecenas Fundador.`
    );
    sound.playDiceRoll();

    setTimeout(() => {
      setActiveTab('OPEN_BOX');
      setOpeningStage('READY');
    }, 1800);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#0f131c] border-2 border-yellow-400 rounded-3xl p-4 sm:p-6 shadow-2xl text-white text-center cursor-default overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Street Neon Vignette */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-[#222b3d] pb-3 mb-3 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-yellow-400/20 border border-yellow-400 flex items-center justify-center shadow">
              <Crown className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest bg-yellow-950 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-600">
                  BETA 1.0 OFICIAL
                </span>
                {isPatron && (
                  <span className="text-[9px] font-black uppercase tracking-widest bg-red-950 text-red-300 px-2 py-0.5 rounded-full border border-red-500 flex items-center gap-1">
                    <Heart className="w-2.5 h-2.5 fill-current text-red-400" /> MECENAS
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black font-bungee text-white leading-tight mt-0.5">
                AURA & TIENDA "PAGA LO QUE QUIERAS"
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#182030] px-2.5 py-1 rounded-xl border border-yellow-500/40 text-yellow-300 text-xs font-mono font-bold">
              <Package className="w-3.5 h-3.5 text-yellow-400" />
              <span>{unopenedBoxes} Cajas</span>
            </div>
            <div className="flex items-center gap-1 bg-[#182030] px-2.5 py-1 rounded-xl border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>{auraInfo.currentAura} Aura</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-[#1b2232] hover:bg-[#283248] text-neutral-400 hover:text-white border border-[#2f3b52] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-1.5 mb-4 p-1 bg-[#141926] rounded-2xl border border-[#263148] shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('AURA')}
            className={`py-2 px-1 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'AURA'
                ? 'bg-cyan-500 text-black shadow-md font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Nivel de Aura</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('OPEN_BOX');
              setOpeningStage('READY');
            }}
            className={`py-2 px-1 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 relative ${
              activeTab === 'OPEN_BOX'
                ? 'bg-yellow-400 text-black shadow-md font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Abrir Cajas</span>
            {unopenedBoxes > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center ml-0.5">
                {unopenedBoxes}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('PAY_WHAT_YOU_WANT')}
            className={`py-2 px-1 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'PAY_WHAT_YOU_WANT'
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-pink-400" />
            <span>Paga lo que Quieras</span>
          </button>
        </div>

        {/* =========================================================================
            TAB 1: NIVEL DE AURA Y PROGRESIÓN
           ========================================================================= */}
        {activeTab === 'AURA' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-left py-1">
            {/* Main Aura Badge Banner */}
            <div
              className="p-4 rounded-3xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl"
              style={{
                borderColor: auraInfo.colorHex,
                background: `linear-gradient(135deg, ${auraInfo.colorHex}22 0%, #121824 70%)`
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 text-2xl shadow-lg shrink-0"
                  style={{
                    backgroundColor: '#0a0d14',
                    borderColor: auraInfo.colorHex,
                    boxShadow: `0 0 20px ${auraInfo.auraGlowCss}`
                  }}
                >
                  <Zap className="w-8 h-8" style={{ color: auraInfo.colorHex }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[9px] font-black px-2 py-0.5 rounded-full border text-black font-mono"
                      style={{ backgroundColor: auraInfo.colorHex, borderColor: auraInfo.colorHex }}
                    >
                      {auraInfo.badge}
                    </span>
                    <span className="text-xs font-mono font-bold text-neutral-400">
                      Rango Actual
                    </span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-black font-bungee text-white mt-0.5">
                    {auraInfo.rankTitle}
                  </h4>
                  <p className="text-xs text-neutral-300">
                    {auraInfo.perkDescription}
                  </p>
                </div>
              </div>

              <div className="text-center sm:text-right shrink-0 bg-black/40 px-4 py-2.5 rounded-2xl border border-white/10">
                <span className="text-[10px] font-mono text-neutral-400 block uppercase">
                  Puntos de Aura
                </span>
                <span className="text-2xl font-black font-mono" style={{ color: auraInfo.colorHex }}>
                  {auraInfo.currentAura}
                </span>
                <span className="text-xs text-neutral-400 block font-mono">
                  / {auraInfo.nextAuraThreshold} Aura
                </span>
              </div>
            </div>

            {/* Aura Progress Bar */}
            <div className="bg-[#141a27] p-4 rounded-2xl border border-[#243048] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-neutral-300">Progreso a la Siguiente Liga de Aura:</span>
                <span className="font-mono" style={{ color: auraInfo.colorHex }}>
                  {auraInfo.progressPercent}% ({auraInfo.nextAuraThreshold - auraInfo.currentAura} pts restantes)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-black/60 overflow-hidden border border-white/10">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${auraInfo.progressPercent}%`,
                    backgroundColor: auraInfo.colorHex,
                    boxShadow: `0 0 10px ${auraInfo.colorHex}`
                  }}
                />
              </div>
            </div>

            {/* How to Earn Aura & Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#141a27] p-3.5 rounded-2xl border border-[#25324c] space-y-1.5">
                <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs">
                  <Award className="w-4 h-4" />
                  <span>¿Cómo ganar Aura y Cajas?</span>
                </div>
                <ul className="text-[11px] text-neutral-300 space-y-1">
                  <li>• <b>Victoria en combate:</b> +35 Aura y <b>+1 Caja de 3 Dados</b>.</li>
                  <li>• <b>Derrota honorable:</b> +15 Aura y +20 monedas.</li>
                  <li>• <b>Abrir cualquier caja:</b> +15 Aura garantizada.</li>
                </ul>
              </div>

              <div className="bg-[#141a27] p-3.5 rounded-2xl border border-[#25324c] space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                  <Package className="w-4 h-4" />
                  <span>Cajas de Botín Disponibles</span>
                </div>
                <p className="text-[11px] text-neutral-300">
                  Tienes <b>{unopenedBoxes} caja(s) de 3 dados</b> ganadas listas para abrir sin ningún coste.
                </p>
                <button
                  onClick={() => {
                    setActiveTab('OPEN_BOX');
                    setOpeningStage('READY');
                  }}
                  className="w-full mt-1 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs rounded-xl transition-all cursor-pointer shadow"
                >
                  Abrir Mis Cajas ({unopenedBoxes})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: ABRIR CAJAS DE 3 DADOS
           ========================================================================= */}
        {activeTab === 'OPEN_BOX' && (
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col items-center justify-center py-2">
            {openingStage === 'READY' && (
              <div className="space-y-4 my-auto max-w-md text-center">
                <div className="relative mx-auto w-36 h-36 flex items-center justify-center">
                  <div className="absolute inset-0 bg-yellow-400/15 rounded-3xl blur-2xl animate-pulse" />
                  <div
                    onClick={handleOpenCrate}
                    className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-amber-600 via-yellow-700 to-amber-950 border-4 border-yellow-400 shadow-[0_10px_30px_rgba(250,204,21,0.3)] flex flex-col items-center justify-center p-3 text-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Package className="w-14 h-14 text-yellow-200 drop-shadow-md animate-bounce" />
                    <span className="text-[9px] font-black font-bungee text-yellow-200 mt-1 uppercase tracking-wider">
                      PACK 3 DADOS
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-cyan-300 tracking-widest bg-blue-950/80 px-3 py-1 rounded-full border border-cyan-400/40">
                    {unopenedBoxes > 0
                      ? `🎁 ¡TIENES ${unopenedBoxes} CAJA(S) GANADAS GRATIS!`
                      : collectionManager.getBoxCost() === 0
                      ? '🎁 ¡PRIMERA CAJA DE BIENVENIDA GRATIS!'
                      : `COSTE: ${collectionManager.getBoxCost()} MONEDAS`}
                  </span>
                  <p className="text-xs text-neutral-300 mt-2">
                    Cada caja contiene <b>3 dados de personajes únicos</b> con sus colmillos, alas, cascos, ADN y superpoderes de manual táctico.
                  </p>
                </div>

                <button
                  onClick={handleOpenCrate}
                  disabled={!collectionManager.canOpenBox()}
                  className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl transition-all cursor-pointer font-bungee flex items-center justify-center gap-2 ${
                    collectionManager.canOpenBox()
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 text-black border-2 border-yellow-200 animate-pulse'
                      : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  <span>
                    {unopenedBoxes > 0
                      ? 'ABRIR CAJA GANADA (GRATIS)'
                      : `ABRIR CAJA DE 3 DADOS (${collectionManager.getBoxCost()} MONEDAS)`}
                  </span>
                </button>
              </div>
            )}

            {openingStage === 'SHAKING' && (
              <div className="space-y-4 my-auto text-center animate-pulse">
                <div className="w-32 h-32 mx-auto rounded-3xl bg-yellow-500/20 border-4 border-yellow-400 flex items-center justify-center animate-cup-shake shadow-2xl">
                  <Package className="w-16 h-16 text-yellow-300 animate-spin" />
                </div>
                <h4 className="text-lg font-black font-bungee text-yellow-300">
                  ¡AGITANDO EL VASO DE LA SUERTE...!
                </h4>
                <p className="text-xs text-neutral-400 font-mono">
                  Calculando dados D6 y sinergias de clase...
                </p>
              </div>
            )}

            {openingStage === 'REVEALED' && boxResult && (
              <div className="space-y-4 my-auto w-full max-w-xl text-center animate-fadeIn">
                <div className="flex items-center justify-center gap-2 text-yellow-400">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <h4 className="text-lg font-black font-bungee text-white">
                    ¡3 DADOS DESBLOQUEADOS!
                  </h4>
                  <Sparkles className="w-5 h-5 animate-spin" />
                </div>

                {/* 3 Revealed Character Dice */}
                <div className="grid grid-cols-3 gap-3">
                  {boxResult.characters.map((char, idx) => {
                    const isNew = boxResult.isNew[idx];
                    return (
                      <div
                        key={char.type + idx}
                        className="bg-[#151a26] border-2 border-yellow-400/80 rounded-2xl p-2.5 flex flex-col items-center justify-between shadow-xl relative overflow-hidden"
                      >
                        {isNew ? (
                          <span className="absolute top-1 right-1 bg-emerald-500 text-black text-[8px] font-black px-1.5 py-0.2 rounded-full shadow">
                            ¡NUEVO!
                          </span>
                        ) : (
                          <span className="absolute top-1 right-1 bg-amber-500/90 text-black text-[8px] font-black px-1.5 py-0.2 rounded-full shadow">
                            +35 Fichas
                          </span>
                        )}

                        <Cube3DCanvas
                          character={char.type}
                          teamId={1}
                          size={70}
                          hasPreparedStance={isNew}
                        />

                        <div className="mt-1 w-full text-center">
                          <h5 className="text-xs font-black text-white truncate">
                            {char.displayName}
                          </h5>
                          <span className="text-[9px] text-yellow-400 font-bold block truncate">
                            ★ {char.abilityName}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setOpeningStage('READY')}
                    className="flex-1 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase font-bungee shadow cursor-pointer transition-all"
                  >
                    Abrir Otra Caja
                  </button>
                  <button
                    onClick={onClose}
                    className="py-3 px-5 rounded-xl bg-[#1d2537] hover:bg-[#27324b] text-neutral-200 font-bold text-xs transition-all cursor-pointer"
                  >
                    Listo
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: PAGA LO QUE QUIERAS (INDIE BETA SUPPORT)
           ========================================================================= */}
        {activeTab === 'PAY_WHAT_YOU_WANT' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-left py-1">
            <div className="bg-gradient-to-r from-pink-950/40 via-[#181f2f] to-purple-950/40 p-4 rounded-3xl border-2 border-pink-500/50 space-y-2">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400 fill-current" />
                <h4 className="text-base font-black font-bungee text-white">
                  MODELO "PAGA LO QUE QUIERAS" · BETA 1.0
                </h4>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                <b>Guerra Cubita</b> es un juego independiente táctico de dados D6. La <b>Demo Aleatoria</b> es completamente gratuita para todos los jugadores.
              </p>
              <p className="text-xs text-pink-200/90">
                Si deseas apoyar el lanzamiento y conseguir <b>Cajas de 3 Dados</b> adicionales y un empujón de <b>Aura</b>, puedes aportar el importe simbólico que prefieras:
              </p>
            </div>

            {patronSuccessMsg && (
              <div className="bg-emerald-950/80 border border-emerald-400 text-emerald-200 text-xs p-3 rounded-2xl flex items-center gap-2 animate-fadeIn">
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{patronSuccessMsg}</span>
              </div>
            )}

            {/* Quick Donation Tiers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { amount: 1, label: '$1 USD', title: 'Café Callejero', boxes: 1, aura: 50, icon: '☕' },
                { amount: 3, label: '$3 USD', title: 'Cajetilla & Dados', boxes: 2, aura: 150, icon: '🎲' },
                { amount: 5, label: '$5 USD', title: 'Apuesta Fuerte', boxes: 4, aura: 300, icon: '👑' },
                { amount: 10, label: '$10 USD', title: 'Padrino de Asfalto', boxes: 8, aura: 800, icon: '💎' }
              ].map(tier => (
                <button
                  key={tier.amount}
                  onClick={() => handleSupportBeta(tier.amount)}
                  className="bg-[#141a27] hover:bg-[#1d273a] active:scale-95 border-2 border-pink-500/30 hover:border-pink-400 rounded-2xl p-3 text-center flex flex-col items-center justify-between transition-all cursor-pointer shadow-md group"
                >
                  <span className="text-2xl mb-1">{tier.icon}</span>
                  <span className="text-sm font-black font-bungee text-pink-300 group-hover:text-pink-200">
                    {tier.label}
                  </span>
                  <span className="text-[10px] text-neutral-300 font-bold block mt-0.5">
                    {tier.title}
                  </span>
                  <div className="mt-2 text-[9px] font-mono text-yellow-300 bg-black/60 px-2 py-1 rounded-lg w-full">
                    +{tier.boxes} Caja(s) · +{tier.aura} Aura
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Amount Option */}
            <div className="bg-[#131824] p-3.5 rounded-2xl border border-[#25324c] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white block">
                  ¿Prefieres elegir otra cantidad personalizada?
                </span>
                <span className="text-[10px] text-neutral-400">
                  Introduce cualquier monto en USD para simular tu apoyo de Mecenas.
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-20 pl-6 pr-2 py-1.5 bg-[#0a0d14] border border-pink-500/50 rounded-xl text-white font-mono text-xs font-bold text-center"
                  />
                </div>

                <button
                  onClick={() => {
                    const amt = Math.max(1, parseInt(customAmount, 10) || 1);
                    handleSupportBeta(amt);
                  }}
                  className="py-1.5 px-3 bg-pink-600 hover:bg-pink-500 text-white font-black text-xs rounded-xl shadow cursor-pointer transition-all"
                >
                  Aportar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
