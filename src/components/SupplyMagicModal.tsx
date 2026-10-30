import React, { useState } from 'react';
import { CardType, GameCard, PlayerState, getMaxHandSize } from '../types/game';
import { Gift, Check, Users, Package } from 'lucide-react';

interface SupplyMagicModalProps {
  actor: PlayerState;
  cards: GameCard[];
  allies: PlayerState[];
  onConfirm: (cardIndex: number, allyId: number) => void;
}

export const SupplyMagicModal: React.FC<SupplyMagicModalProps> = ({
  actor,
  cards,
  allies,
  onConfirm
}) => {
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [selectedAllyId, setSelectedAllyId] = useState<number | null>(allies[0]?.id ?? null);
  const selectedCard = cards[selectedCardIndex];
  const selectedAlly = allies.find(ally => ally.id === selectedAllyId);

  return (
    <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#101722] border-2 border-emerald-400/70 rounded-2xl shadow-2xl text-white">
        <div className="p-4 sm:p-5 border-b border-emerald-500/30 bg-emerald-950/40">
          <div className="flex items-center gap-2 text-emerald-300">
            <Gift className="w-5 h-5" />
            <h3 className="text-lg font-black">SUMINISTRO MÁGICO</h3>
          </div>
          <p className="text-sm text-neutral-200 mt-1">
            Elige una de las dos cartas para entregársela a un compañero. La otra se queda en la mano de Hada al Cubo.
          </p>
          <p className="text-[11px] text-emerald-200/80 mt-2">
            La acción ya fue consumida; la transferencia no cuesta una acción adicional.
          </p>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <section>
            <h4 className="text-xs font-black uppercase tracking-wide text-amber-300 mb-2 flex items-center gap-2">
              <Package className="w-4 h-4" /> Cartas robadas
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cards.map((card, index) => {
                const selected = selectedCardIndex === index;
                return (
                  <button
                    key={card.uid || `${card.id}-${index}`}
                    type="button"
                    onClick={() => setSelectedCardIndex(index)}
                    className={`text-left p-3 rounded-xl border-2 transition-all ${selected
                      ? 'bg-emerald-950/70 border-emerald-300 ring-2 ring-emerald-400/40'
                      : 'bg-[#182231] border-[#334155] hover:border-emerald-500/70'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase text-emerald-300">
                        {card.type === CardType.WEAPON ? 'Arma / Fierro' : 'Truco'}
                      </span>
                      {selected && <Check className="w-4 h-4 text-emerald-300" />}
                    </div>
                    <p className="font-black text-sm mt-1">{card.name}</p>
                    <p className="text-[11px] leading-relaxed text-neutral-300 mt-1">{card.description}</p>
                    <p className="text-[10px] text-neutral-500 mt-2">{card.category} · {card.rarity}</p>
                    <span className="text-[9px] font-black text-emerald-200 mt-2 inline-block">
                      {selected ? 'SE ENTREGARÁ' : 'SELECCIONAR PARA ENTREGAR'}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h4 className="text-xs font-black uppercase tracking-wide text-cyan-300 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" /> Compañero que recibirá la carta
            </h4>
            <div className="space-y-2">
              {allies.map(ally => (
                <button
                  key={ally.id}
                  type="button"
                  onClick={() => setSelectedAllyId(ally.id)}
                  className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border-2 text-left transition-all ${selectedAllyId === ally.id
                    ? 'bg-cyan-950/60 border-cyan-300'
                    : 'bg-[#182231] border-[#334155] hover:border-cyan-500/70'}`}
                >
                  <span>
                    <span className="block text-sm font-black">{ally.name}</span>
                    <span className="block text-[10px] text-neutral-400">
                      {ally.hp}/{ally.maxHp} HP · Mano {ally.hand.length}/{getMaxHandSize(ally)}
                    </span>
                  </span>
                  {selectedAllyId === ally.id && <Check className="w-4 h-4 text-cyan-300" />}
                </button>
              ))}
            </div>
          </section>

          <div className="rounded-xl bg-[#182231] border border-[#334155] p-3 text-[11px] text-neutral-300">
            <span className="font-bold text-white">{selectedCard?.name || 'Carta seleccionada'}</span>
            {' '}irá a{' '}
            <span className="font-bold text-cyan-200">{selectedAlly?.name || 'el aliado elegido'}</span>.
            {' '}La otra carta quedará en la mano de {actor.name} ({actor.hand.length + 1}/{getMaxHandSize(actor)}).
          </div>
        </div>

        <div className="p-4 border-t border-[#293548] bg-[#121b28]">
          <button
            type="button"
            disabled={!selectedCard || !selectedAlly}
            onClick={() => selectedAlly && onConfirm(selectedCardIndex, selectedAlly.id)}
            className="w-full py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black text-sm transition-all"
          >
            ENTREGAR CARTA Y COMPLETAR HABILIDAD
          </button>
        </div>
      </div>
    </div>
  );
};
