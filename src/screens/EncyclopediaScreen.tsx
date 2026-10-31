import React, { useState } from 'react';
import { ALL_CARDS } from '../data/cards';
import { CardCategory, CardRarity, CardType, CATEGORY_INFO, TrickTiming } from '../types/game';
import { ArrowLeft, Shield, Sword, Sparkles, Search, Zap, Star } from 'lucide-react';

interface EncyclopediaScreenProps {
  onBack: () => void;
}

export const EncyclopediaScreen: React.FC<EncyclopediaScreenProps> = ({ onBack }) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredCards = ALL_CARDS.filter(card => {
    const matchesSearch =
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.synergyEffect?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterCategory !== 'ALL' && card.category !== filterCategory) return false;

    if (filterType === 'WEAPON') return card.type === CardType.WEAPON;
    if (filterType === 'TRICK') return card.type === CardType.TRICK;
    if (filterType === 'STANCE') return card.timing === TrickTiming.PREPARED_STANCE;

    return true;
  });

  const getRarityBadge = (rarity: CardRarity) => {
    switch (rarity) {
      case CardRarity.LEGENDARIA:
        return (
          <span className="flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/30 to-purple-500/30 text-amber-300 border border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]">
            <Star className="w-2.5 h-2.5 fill-amber-300" />
            <span>Legendaria</span>
          </span>
        );
      case CardRarity.SUPER_RARA:
        return (
          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500">
            Superrara
          </span>
        );
      case CardRarity.RARA:
        return (
          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500">
            Rara
          </span>
        );
      case CardRarity.BASICA:
      default:
        return (
          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-600">
            Básica
          </span>
        );
    }
  };

  return (
    <div className="gc-screen relative w-full min-h-screen bg-[#0f1116] p-3 md:p-6 text-white flex flex-col justify-between max-w-5xl mx-auto select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#232b3d] pb-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-[#171c26] hover:bg-[#202736] border border-[#2c374d] text-neutral-300 transition-all flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </button>

        <div className="text-center">
          <h2 className="text-base md:text-xl font-black tracking-wide text-white font-bungee">
            MANUAL TÁCTICO: 50 CARTAS OFICIALES
          </h2>
          <p className="text-[10px] md:text-xs text-yellow-400 font-bold">
            5 Clases: Bruta, Protección, Economía, Táctica & Astucia
          </p>
        </div>

        <a
          href="/assets/aistudio/Manual_T_ctico__Guerra_Cubita_226b4d3f.pdf"
          target="_blank"
          rel="noreferrer"
          className="p-1.5 px-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 text-xs font-bold transition-all hidden sm:flex items-center gap-1"
        >
          <span>PDF Oficial</span>
        </a>
      </div>

      {/* Class Category Filter (Manual Táctico) */}
      <div className="my-3 space-y-2">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, efecto o sinergia..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#151922] border border-[#2b354b] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-yellow-400"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setFilterCategory('ALL')}
            className={`text-xs font-black px-3 py-1.5 rounded-xl border whitespace-nowrap transition-all ${
              filterCategory === 'ALL'
                ? 'bg-yellow-400 text-black border-yellow-300 shadow'
                : 'bg-[#151922] text-neutral-400 border-[#2b354b] hover:text-white'
            }`}
          >
            TODAS ({ALL_CARDS.length})
          </button>

          {Object.entries(CATEGORY_INFO).map(([catKey, info]) => {
            const count = ALL_CARDS.filter(c => c.category === catKey).length;
            const isSelected = filterCategory === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setFilterCategory(catKey)}
                style={{
                  backgroundColor: isSelected ? info.color : undefined,
                  borderColor: isSelected ? '#FFFFFF' : info.borderColor,
                  color: isSelected ? '#000000' : info.color
                }}
                className={`text-xs font-black px-3 py-1.5 rounded-xl border whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected ? 'shadow-[0_0_12px_rgba(255,255,255,0.4)] scale-105' : 'bg-[#141824]'
                }`}
              >
                <span>{info.symbol}</span>
                <span>{info.name.split('/')[0].trim()}</span>
                <span className="text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Type Secondary Filter */}
        <div className="flex gap-2">
          {[
            { id: 'ALL', label: 'Todos los Tipos' },
            { id: 'WEAPON', label: '🗡️ Armas (Mesa)' },
            { id: 'TRICK', label: '✨ Trucos' },
            { id: 'STANCE', label: '🛡️ Posturas Defensivas' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                filterType === t.id
                  ? 'bg-neutral-200 text-black border-white'
                  : 'bg-[#12151e] text-neutral-400 border-[#222938] hover:text-neutral-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Catalog Grid */}
      <div className="flex-1 overflow-y-auto pr-1 my-2 max-h-[62vh]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredCards.map((card, idx) => {
            const isWeapon = card.type === CardType.WEAPON;
            const isStance = card.timing === TrickTiming.PREPARED_STANCE;
            const catInfo = CATEGORY_INFO[card.category] || CATEGORY_INFO[CardCategory.KABOOM];

            return (
              <div
                key={`encyclopedia-${card.id}-${idx}`}
                style={{
                  borderColor: `${catInfo.borderColor}80`,
                  boxShadow: `0 0 15px ${catInfo.bgGlow}`
                }}
                className="p-3.5 rounded-2xl border-2 transition-all hover:scale-[1.01] bg-[#141722] flex flex-col justify-between"
              >
                <div>
                  {/* Top Header: ID, Category & Rarity */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      style={{
                        backgroundColor: `${catInfo.color}20`,
                        color: catInfo.color,
                        borderColor: catInfo.borderColor
                      }}
                      className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md border flex items-center gap-1"
                    >
                      <span>{catInfo.symbol}</span>
                      <span>{catInfo.badge}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {getRarityBadge(card.rarity)}
                      <span className="text-[10px] font-mono text-neutral-500 font-bold">
                        #{card.id}
                      </span>
                    </div>
                  </div>

                  {/* Card Title */}
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    {isWeapon ? (
                      <Sword className="w-3.5 h-3.5 text-amber-400" />
                    ) : isStance ? (
                      <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    )}
                    <span>{card.name}</span>
                  </h4>

                  {/* Base Effect */}
                  <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                    {card.description}
                  </p>

                  {/* Hero Synergy Box (PvZ Heroes Style) */}
                  {card.synergyEffect && (
                    <div
                      style={{
                        backgroundColor: `${catInfo.color}15`,
                        borderColor: `${catInfo.borderColor}60`
                      }}
                      className="mt-2.5 p-2 rounded-xl border text-[11px] text-neutral-200"
                    >
                      <div
                        style={{ color: catInfo.color }}
                        className="font-black flex items-center gap-1 text-[10px] mb-0.5 uppercase tracking-wide"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Sinergia Heroica ({catInfo.name.split('/')[0]}):</span>
                      </div>
                      <span className="leading-snug block">{card.synergyEffect}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Footer */}
                <div className="mt-3 pt-2 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400">
                  <span className="font-bold text-yellow-400">Costo: 1 Acción (PA)</span>
                  <span className="bg-[#1c2230] px-2 py-0.5 rounded border border-[#2b354c]">
                    {isWeapon ? '🗡️ Arma (Ranura)' : isStance ? '🛡️ Postura Preventiva' : '✨ Ritual Inmediato'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center text-[11px] text-neutral-400 py-2 border-t border-[#232b3d] flex items-center justify-between px-2">
        <span>Mostrando <b>{filteredCards.length}</b> de {ALL_CARDS.length} cartas del Manual Táctico</span>
        <span className="text-yellow-400 font-bold">¡Combina con dados héroes compatibles para activar Sinergias!</span>
      </div>
    </div>
  );
};
