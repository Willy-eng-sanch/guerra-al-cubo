import React from 'react';
import { GcSpriteIcon } from '../ui/SpriteUI';
import { CharacterDef, CharacterType } from '../types/game';
interface MorphFormSelectionModalProps {
  playerName: string;
  availableForms: CharacterDef[];
  usedCount: number;
  onChoose: (form: CharacterType) => void;
}

export const MorphFormSelectionModal: React.FC<MorphFormSelectionModalProps> = ({
  playerName, availableForms, usedCount, onChoose
}) => (
  <div className="gc-modal-overlay fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-3 backdrop-blur-md">
    <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border-2 border-violet-400/70 bg-gradient-to-b from-[#1b1628] to-[#10121c] p-5 text-white shadow-2xl">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/40 bg-violet-500/10 px-3 py-1 text-[10px] font-black tracking-widest text-violet-200">
          <GcSpriteIcon name="icon-spark" className="h-4 w-4"  /> MIMETISMO · CAMBIAFORMAS
        </span>
        <h2 className="mt-3 text-2xl font-black">Elige tu nueva forma</h2>
        <p className="mt-1 text-sm text-neutral-300">{playerName} puede adoptar cualquiera de los otros 12 héroes, aunque no estén presentes en la partida.</p>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-violet-300">{usedCount}/12 formas utilizadas · No puedes repetir una forma durante la partida</p>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {availableForms.map(form => (
          <button key={form.type} type="button" onClick={() => onChoose(form.type)}
            className="rounded-2xl border p-3 text-left transition-all hover:-translate-y-0.5 hover:brightness-125"
            style={{ borderColor: form.primaryColor + '90', background: 'linear-gradient(150deg, ' + form.primaryColor + '22, #111827)' }}>
            <span className="block text-[9px] font-black uppercase tracking-wider" style={{ color: form.primaryColor }}>{form.title}</span>
            <span className="mt-1 block text-sm font-black">{form.displayName}</span>
            <span className="mt-1 block text-[10px] leading-snug text-neutral-300 line-clamp-3">{form.abilityName}: {form.abilityDescription}</span>
            <span className="mt-2 block text-[9px] font-bold text-violet-200">{form.classes.join(' / ')}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);
