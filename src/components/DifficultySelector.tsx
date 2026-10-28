import React from 'react';
import { DIFFICULTY_LEVELS } from '../types/game';
import { Brain, Swords, Skull } from 'lucide-react';

interface DifficultySelectorProps {
  value: number; // 1..3
  onChange: (level: number) => void;
  compact?: boolean;
  label?: string;
}

const LEVEL_ICONS = [Brain, Swords, Skull];

/**
 * MEJORA: Selector visual de dificultad de la IA.
 * Reutilizable en Campaña, Batalla Rápida y Draft. Persistente vía App.
 */
export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  value,
  onChange,
  compact = false,
  label = "Dificultad de la IA"
}) => {
  const activeInfo = DIFFICULTY_LEVELS[Math.min(2, Math.max(0, value - 1))];

  return (
    <div className={`bg-[#121622] border-2 border-[#263148] rounded-2xl ${compact ? 'p-3' : 'p-4'} shadow-xl`}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[11px] font-black text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
          <Skull className="w-4 h-4 text-red-400" />
          <span>{label}</span>
        </label>
        <span
          className="text-[9px] font-black px-2 py-0.5 rounded-full border"
          style={{ color: activeInfo.color, borderColor: activeInfo.borderColor }}
        >
          {activeInfo.name}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {DIFFICULTY_LEVELS.map((d, idx) => {
          const active = value === d.level;
          const Icon = LEVEL_ICONS[idx];
          return (
            <button
              key={d.level}
              onClick={() => onChange(d.level)}
              className={`rounded-xl border-2 px-2 py-2.5 flex flex-col items-center gap-1 transition-all active:scale-[0.97] cursor-pointer ${
                active
                  ? `${d.bgActive} shadow-lg scale-[1.03]`
                  : 'bg-[#0f121a] border-[#232b3d] opacity-70 hover:opacity-100'
              }`}
              style={{ borderColor: active ? d.borderColor : undefined }}
            >
              <Icon className="w-5 h-5" style={{ color: active ? d.color : '#9ca3af' }} />
              <span
                className="text-[10px] font-black tracking-wider"
                style={{ color: active ? d.color : '#d1d5db' }}
              >
                {d.name}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-[10px] text-neutral-400 mt-2 leading-relaxed">{activeInfo.tagline}</p>
    </div>
  );
};
