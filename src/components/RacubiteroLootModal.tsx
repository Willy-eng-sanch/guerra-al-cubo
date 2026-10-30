import React, { useMemo, useState } from 'react';
import { GameCard, PlayerState, getMaxHandSize } from '../types/game';
import { Coins, Gift, Layers, Users } from 'lucide-react';

interface RacubiteroLootModalProps {
  cards: GameCard[];
  actor: PlayerState;
  allies: PlayerState[];
  onConfirm: (assignments: string[]) => void;
}

export const RacubiteroLootModal: React.FC<RacubiteroLootModalProps> = ({ cards, actor, allies, onConfirm }) => {
  const [assignments, setAssignments] = useState<string[]>(cards.map(() => 'PILE'));
  const selfCapacity = Math.max(0, getMaxHandSize(actor) - actor.hand.length);
  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    assignments.forEach(value => { result[value] = (result[value] || 0) + 1; });
    return result;
  }, [assignments]);
  const setAssignment = (index: number, value: string) => {
    const used = counts[value] || 0;
    const current = assignments[index] === value ? 1 : 0;
    if (value === 'SELF' && used - current >= selfCapacity) return;
    if (value.startsWith('ALLY:') && used - current >= 1) return;
    setAssignments(previous => previous.map((item, i) => i === index ? value : item));
  };
  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center bg-black/85 p-3 backdrop-blur-md">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-amber-400/70 bg-[#15120e] p-5 text-white shadow-2xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-[10px] font-black tracking-widest text-amber-300"><Coins className="h-4 w-4"/> SAQUEO COLECTIVO · ÉXITO</span>
          <h2 className="mt-3 text-xl font-black">¡Todas las manos quedan expuestas!</h2>
          <p className="mt-1 text-xs text-neutral-300">{cards.length} carta(s) reunidas. {actor.name} puede conservar hasta {selfCapacity} y entregar una a cada aliado con espacio.</p>
        </div>
        <div className="mt-4 space-y-2">
          {cards.map((card, index) => (
            <div key={card.uid || `${card.id}-${index}`} className="flex flex-col gap-2 rounded-xl border border-amber-700/40 bg-amber-950/20 p-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black">{card.name}</p>
                <p className="line-clamp-1 text-[10px] text-neutral-400">{card.description}</p>
              </div>
              <select value={assignments[index]} onChange={event => setAssignment(index, event.target.value)} className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs font-bold">
                <option value="PILE">Devolver a la Pila General</option>
                {selfCapacity > 0 && ((counts.SELF || 0) - (assignments[index] === 'SELF' ? 1 : 0) < selfCapacity) && <option value="SELF">Conservar en mi mano</option>}
                {allies.map(ally => {
                  const key = `ALLY:${ally.id}`;
                  const allyUsed = counts[key] || 0;
                  const available = ally.hand.length < getMaxHandSize(ally);
                  return available && (allyUsed === 0 || assignments[index] === key)
                    ? <option key={ally.id} value={key}>Entregar a {ally.name}</option>
                    : null;
                })}
              </select>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-900 p-3 text-[10px] text-neutral-300">
          <span className="flex items-center gap-1"><Gift className="h-3.5 w-3.5 text-amber-300"/> Para ti: {counts.SELF || 0}/{selfCapacity}</span>
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-cyan-300"/> Aliados beneficiados: {Object.keys(counts).filter(key => key.startsWith('ALLY:') && counts[key] > 0).length}</span>
          <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5 text-emerald-300"/> A la pila: {counts.PILE || 0}</span>
        </div>
        <button onClick={() => onConfirm(assignments)} className="mt-4 w-full rounded-xl bg-amber-400 py-3 text-xs font-black text-black hover:bg-amber-300">CONFIRMAR DISTRIBUCIÓN</button>
      </div>
    </div>
  );
};
