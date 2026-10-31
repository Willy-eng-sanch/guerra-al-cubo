import React from 'react';
import { Dices, RefreshCw, ShieldCheck } from 'lucide-react';

interface TramcubosoRerollModalProps {
  actorName: string;
  attackerName: string;
  defenderName: string;
  attackerRolls: number[];
  defenderRolls: number[];
  onReroll: () => void;
  onKeep: () => void;
}

const DiceRow: React.FC<{ label: string; values: number[] }> = ({ label, values }) => (
  <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3">
    <div className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</div>
    <div className="flex flex-wrap gap-2">
      {values.map((value, index) => (
        <span key={index} className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-emerald-400/70 bg-emerald-950 text-xl font-black text-white shadow">
          {value}
        </span>
      ))}
    </div>
  </div>
);

export const TramcubosoRerollModal: React.FC<TramcubosoRerollModalProps> = ({
  actorName, attackerName, defenderName, attackerRolls, defenderRolls, onReroll, onKeep
}) => (
  <div className="gc-modal-overlay fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
    <div className="w-full max-w-lg rounded-3xl border-2 border-emerald-400/70 bg-gradient-to-b from-[#17251f] to-[#0d1311] p-5 text-white shadow-2xl">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/50 bg-emerald-400/10 px-3 py-1 text-[10px] font-black tracking-widest text-emerald-300">
          <Dices className="h-4 w-4" /> REVOLUCIÓN DE LA MESA
        </span>
        <h2 className="mt-3 text-xl font-black">¡Los dados ya están sobre la mesa!</h2>
        <p className="mt-1 text-xs text-neutral-300">{actorName} puede pagar 1 Cúbit para cambiar todos los resultados de este enfrentamiento.</p>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DiceRow label={`Ataque · ${attackerName}`} values={attackerRolls} />
        <DiceRow label={`Defensa · ${defenderName}`} values={defenderRolls} />
      </div>
      <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/30 p-3 text-[11px] leading-relaxed text-amber-100">
        Si relanzas, los dados mostrados quedan reemplazados: no producen bloqueo, daño ni recompensas. La nueva tirada será definitiva y se resolverá una sola vez.
      </div>
      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button onClick={onKeep} className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-xs font-black text-slate-200 hover:bg-slate-700">
          CONSERVAR TIRADA
        </button>
        <button onClick={onReroll} className="flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-300 bg-emerald-400 px-4 py-3 text-xs font-black text-emerald-950 hover:bg-emerald-300">
          <RefreshCw className="h-4 w-4" /> RELANZAR · 1 CÚBIT
        </button>
      </div>
      <p className="mt-3 flex items-center justify-center gap-1 text-[10px] text-neutral-500">
        <ShieldCheck className="h-3 w-3" /> Solo se resuelve la tirada definitiva.
      </p>
    </div>
  </div>
);
