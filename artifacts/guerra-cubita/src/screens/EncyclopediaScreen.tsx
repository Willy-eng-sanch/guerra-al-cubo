import React, { useState } from 'react';
import { ALL_CARDS } from '../data/cards';
import { CardType, TrickTiming } from '../types/game';
import { ArrowLeft, Shield, Sword, Sparkles, Filter, Search } from 'lucide-react';

interface EncyclopediaScreenProps {
  onBack: () => void;
}

export const EncyclopediaScreen: React.FC<EncyclopediaScreenProps> = ({ onBack }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredCards = ALL_CARDS.filter(card => {
    const matchesSearch =
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'WEAPON') return card.type === CardType.WEAPON;
    if (filterType === 'TRICK_ACTION')
      return card.type === CardType.TRICK && card.timing === TrickTiming.RITUAL_ACTION;
    if (filterType === 'TRICK_STANCE')
      return card.type === CardType.TRICK && card.timing === TrickTiming.PREPARED_STANCE;
    return true;
  });

  return (
    <div className="relative w-full min-h-screen bg-[#0f1116] p-4 md:p-6 text-white flex flex-col justify-between max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#232b3d] pb-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-[#171c26] hover:bg-[#202736] border border-[#2c374d] text-neutral-300 transition-all flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </button>

        <h2 className="text-base md:text-lg font-black tracking-wide text-white font-bungee">
          ENCICLOPEDIA: 60 CARTAS
        </h2>

        <div className="w-16" />
      </div>

      {/* Search and Filters */}
      <div className="my-3 space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o efecto..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#151922] border border-[#2b354b] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-yellow-400"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: 'Todas (60)' },
            { id: 'WEAPON', label: 'Armas (1-30)' },
            { id: 'TRICK_ACTION', label: 'Trucos Acción' },
            { id: 'TRICK_STANCE', label: 'Posturas Defensivas' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border whitespace-nowrap transition-all ${
                filterType === f.id
                  ? 'bg-yellow-400 text-black border-yellow-300 shadow'
                  : 'bg-[#151922] text-neutral-400 border-[#2b354b] hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Catalog Grid */}
      <div className="flex-1 overflow-y-auto pr-1 my-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredCards.map(card => {
            const isWeapon = card.type === CardType.WEAPON;
            const isStance = card.timing === TrickTiming.PREPARED_STANCE;

            return (
              <div
                key={card.id}
                className={`p-3.5 rounded-2xl border transition-all hover:scale-[1.01] shadow-lg flex flex-col justify-between ${
                  isWeapon
                    ? 'bg-[#1a1c18] border-amber-600/50'
                    : isStance
                    ? 'bg-[#131b26] border-cyan-500/50'
                    : 'bg-[#181520] border-purple-500/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-neutral-400 font-bold">
                      #{card.id}
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        isWeapon
                          ? 'bg-amber-950 text-amber-300 border-amber-700'
                          : isStance
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                          : 'bg-purple-950 text-purple-300 border-purple-700'
                      }`}
                    >
                      {isWeapon
                        ? 'Arma / Mesa'
                        : isStance
                        ? 'Postura Preventiva'
                        : 'Truco de Acción'}
                    </span>
                  </div>

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

                  <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-400">
                  <span>Costo: 1 Acción</span>
                  <span>{isWeapon ? 'Equipable permanente' : 'Consumible'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center text-[11px] text-neutral-500 py-2 border-t border-[#232b3d]">
        Mostrando {filteredCards.length} de 60 cartas oficiales
      </div>
    </div>
  );
};
