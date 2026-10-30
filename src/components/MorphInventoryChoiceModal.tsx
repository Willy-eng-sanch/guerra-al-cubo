import React, { useState } from 'react';
import { CharacterType, GameCard, getMaxHandSizeForLoadout } from '../types/game';
import { Backpack, CheckCircle2, Shield, Sparkles } from 'lucide-react';

export interface MorphInventorySelection {
  hand: number[];
  weapons: number[];
  stances: number[];
}

interface MorphInventoryChoiceModalProps {
  playerName: string;
  formName: string;
  form: CharacterType;
  hand: GameCard[];
  weapons: GameCard[];
  stances: GameCard[];
  weaponLimit: number;
  stanceLimit: number;
  onConfirm: (selection: MorphInventorySelection) => void;
}

export const MorphInventoryChoiceModal: React.FC<MorphInventoryChoiceModalProps> = ({
  playerName, formName, form, hand, weapons, stances, weaponLimit, stanceLimit, onConfirm
}) => {
  const getHandLimitForWeapons = (weaponIndexes: number[]) =>
    getMaxHandSizeForLoadout(
      form,
      weaponIndexes.map(index => weapons[index]).filter((card): card is GameCard => Boolean(card))
    );
  const initialWeaponSelection = weaponLimit > 0
    ? weapons.slice(-weaponLimit).map((_, index) => index + Math.max(0, weapons.length - weaponLimit))
    : [];

  const [selection, setSelection] = useState<MorphInventorySelection>(() => ({
    hand: hand.slice(0, getHandLimitForWeapons(initialWeaponSelection)).map((_, index) => index),
    weapons: initialWeaponSelection,
    stances: stanceLimit > 0 ? stances.slice(-stanceLimit).map((_, index) => index + Math.max(0, stances.length - stanceLimit)) : []
  }));
  const activeHandLimit = getHandLimitForWeapons(selection.weapons);

  const toggle = (field: keyof MorphInventorySelection, index: number, limit: number) => {
    setSelection(previous => {
      const current = previous[field];
      const nextValues = current.includes(index)
        ? current.filter(value => value !== index)
        : current.length >= limit
          ? current
          : [...current, index];

      if (field === 'weapons') {
        const nextHandLimit = getHandLimitForWeapons(nextValues);
        return {
          ...previous,
          weapons: nextValues,
          hand: previous.hand.slice(0, nextHandLimit)
        };
      }

      return { ...previous, [field]: nextValues };
    });
  };

  const renderSection = (
    field: keyof MorphInventorySelection,
    heading: string,
    icon: React.ReactNode,
    cards: GameCard[],
    limit: number
  ) => (
    <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-black">{icon}{heading}</span>
        <span className="text-[10px] font-bold text-violet-200">{selection[field].length}/{limit}</span>
      </div>
      <div className="space-y-1.5">
        {cards.map((card, index) => {
          const checked = selection[field].includes(index);
          const blocked = !checked && selection[field].length >= limit;
          return (
            <button key={field + '-' + (card.uid || card.id) + '-' + index} type="button" disabled={blocked}
              onClick={() => toggle(field, index, limit)}
              className={'flex w-full items-center gap-2 rounded-lg border p-2 text-left ' +
                (checked ? 'border-violet-400 bg-violet-500/15' : 'border-slate-700 bg-slate-950/50') +
                (blocked ? ' opacity-35' : ' hover:border-violet-400/70')}>
              <span className={'flex h-5 w-5 shrink-0 items-center justify-center rounded border ' +
                (checked ? 'border-violet-300 bg-violet-400 text-violet-950' : 'border-slate-600 text-transparent')}>
                {checked ? <CheckCircle2 className="h-3.5 w-3.5" /> : '·'}
              </span>
              <span className="min-w-0 flex-1">
                <b className="block truncate text-[11px]">{card.name}</b>
                <span className="block truncate text-[9px] text-slate-400">{card.description}</span>
              </span>
            </button>
          );
        })}
        {cards.length === 0 && <p className="text-[10px] text-slate-500">No tienes cartas en esta categoría.</p>}
      </div>
      {cards.length > limit && <p className="mt-2 text-[9px] text-amber-200">Conserva hasta {limit}; el excedente volverá a la Pila General.</p>}
    </section>
  );

  return (
    <div className="fixed inset-0 z-[121] flex items-center justify-center bg-black/90 p-3 backdrop-blur-md">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border-2 border-violet-400/70 bg-gradient-to-b from-[#1b1628] to-[#10121c] p-5 text-white shadow-2xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/40 bg-violet-500/10 px-3 py-1 text-[10px] font-black tracking-widest text-violet-200"><Sparkles className="h-4 w-4" /> MIMETISMO · INVENTARIO</span>
          <h2 className="mt-3 text-xl font-black">Adapta tu inventario</h2>
          <p className="mt-1 text-xs text-neutral-300">{playerName} adopta {formName}. Elige qué conservar dentro de los nuevos límites.</p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {renderSection('hand', 'Mano', <Backpack className="h-4 w-4 text-amber-300" />, hand, activeHandLimit)}
          {renderSection('weapons', 'Equipables', <Shield className="h-4 w-4 text-cyan-300" />, weapons, weaponLimit)}
          {renderSection('stances', 'Activables preparados', <Sparkles className="h-4 w-4 text-pink-300" />, stances, stanceLimit)}
        </div>
        <button onClick={() => onConfirm(selection)} className="mt-4 w-full rounded-xl bg-violet-400 py-3 text-xs font-black text-violet-950 hover:bg-violet-300">CONFIRMAR NUEVO INVENTARIO</button>
      </div>
    </div>
  );
};
