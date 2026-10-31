import React from 'react';
import { CardType, GameCard, TrickTiming } from '../types/game';

interface TramcubosoCardChoiceModalProps {
  playerName: string;
  initialCard: GameCard;
  alternativeCard: GameCard;
  source: string;
  onChoose: (choiceIndex: 0 | 1) => void;
}

export const TramcubosoCardChoiceModal: React.FC<TramcubosoCardChoiceModalProps> = ({
  playerName, initialCard, alternativeCard, source, onChoose
}) => {
  const cards = [initialCard, alternativeCard];
  return (
    <div className="gc-modal-overlay fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-xl rounded-3xl border-2 border-emerald-400 bg-gradient-to-b from-[#17251f] to-[#0f1514] p-5 sm:p-6 shadow-[0_0_45px_rgba(16,185,129,0.25)]">
        <div className="text-center">
          <span className="inline-flex rounded-full border border-emerald-400/50 bg-emerald-400/10 px-3 py-1 text-[10px] font-black tracking-[0.18em] text-emerald-300">SELECCIÓN AFORTUNADA</span>
          <h2 className="mt-3 text-xl sm:text-2xl font-black text-white">¡La suerte te ofrece dos cartas!</h2>
          <p className="mt-1 text-sm text-neutral-300">{playerName}, conserva una carta y descarta la otra.</p>
          <p className="mt-1 text-[11px] text-neutral-500">Origen del robo: {source}</p>
        </div>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cards.map((card, index) => {
            const isWeapon = card.type === CardType.WEAPON;
            const isStance = card.timing === TrickTiming.PREPARED_STANCE;
            const accent = isWeapon ? 'border-amber-500/70 bg-amber-950/25' : isStance ? 'border-cyan-500/70 bg-cyan-950/25' : 'border-purple-500/70 bg-purple-950/25';
            return (
              <button key={card.uid || card.id} onClick={() => onChoose(index as 0 | 1)} className={'min-h-[205px] rounded-2xl border-2 ' + accent + ' p-4 text-left transition-all hover:-translate-y-1 hover:brightness-125 focus:outline-none focus:ring-2 focus:ring-emerald-300'}>
                <div className="flex items-center justify-between gap-2 text-[9px] font-black tracking-wider text-neutral-300">
                  <span>{isWeapon ? 'ARMA' : isStance ? 'POSTURA' : 'TRUCO'}</span>
                  <span>{card.rarity}</span>
                </div>
                <h3 className="mt-3 text-base font-black text-white">{card.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-neutral-300">{card.description}</p>
                <span className="mt-4 inline-flex rounded-lg bg-emerald-400 px-3 py-2 text-[10px] font-black tracking-wider text-emerald-950">CONSERVAR ESTA CARTA</span>
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-center text-[10px] font-semibold text-neutral-500">La carta no elegida irá al descarte. Solo una se añade a tu mano.</p>
      </div>
    </div>
  );
};
