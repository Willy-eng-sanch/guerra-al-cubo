import React from 'react';
import { CharacterDef, CATEGORY_INFO } from '../types/game';
import { X, Sparkles, Shield, Swords, Zap, AlertTriangle, BookOpen } from 'lucide-react';

interface Model3DViewerModalProps {
  character: CharacterDef;
  onClose: () => void;
}

export const Model3DViewerModal: React.FC<Model3DViewerModalProps> = ({ character, onClose }) => {
  const adn = character.adn;
  const primInfo = CATEGORY_INFO[adn.primaria];
  const secInfo = CATEGORY_INFO[adn.secundaria];
  const neuInfo = CATEGORY_INFO[adn.neutra];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-2xl bg-[#11151f] border-2 border-[#2c3850] rounded-3xl p-5 shadow-2xl text-left overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#212b3e]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
              EXPEDIENTE TÁCTICO DE COMBATE
            </span>
            <span className="text-xs text-neutral-400 font-bold">{character.displayName}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="my-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div 
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-2 overflow-hidden shrink-0 shadow-lg bg-[#0a0d13]"
              style={{ borderColor: character.primaryColor }}
            >
              <img
                src={character.avatar}
                alt={character.displayName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-white font-bungee">{character.displayName}</h3>
              <p className="text-xs text-yellow-400 font-bold">{character.title}</p>
              <p className="text-xs text-neutral-300 leading-relaxed">{character.description}</p>
              <p className="text-xs italic text-amber-300 mt-1">"{character.selectionQuote}"</p>
            </div>
          </div>

          {/* ADN Grid */}
          <div className="p-3 bg-[#0d1017] rounded-2xl border border-[#232c40] space-y-2">
            <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              ADN DEL BARRIO (SISTEMA DE 5 CLASES)
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-[#151a26] border border-amber-500/40">
                <span className="text-[9px] text-amber-400 font-bold block">⭐ Primaria</span>
                <span className="font-black text-amber-300">{primInfo.symbol} {primInfo.name.split(' ')[0]}</span>
                <span className="text-[8px] text-neutral-400 block mt-0.5">Sinergia Activa</span>
              </div>

              <div className="p-2 rounded-xl bg-[#151a26] border border-cyan-500/40">
                <span className="text-[9px] text-cyan-400 font-bold block">🛡️ Secundaria</span>
                <span className="font-black text-cyan-300">{secInfo.symbol} {secInfo.name.split(' ')[0]}</span>
                <span className="text-[8px] text-neutral-400 block mt-0.5">Sinergia Pasiva</span>
              </div>

              <div className="p-2 rounded-xl bg-[#151a26] border border-neutral-700">
                <span className="text-[9px] text-neutral-400 font-bold block">⚪ Neutra</span>
                <span className="font-black text-neutral-200">{neuInfo.symbol} {neuInfo.name.split(' ')[0]}</span>
                <span className="text-[8px] text-neutral-400 block mt-0.5">Sin efecto extra</span>
              </div>

              <div className="p-2 rounded-xl bg-red-950/30 border border-red-500/60">
                <span className="text-[9px] text-red-400 font-bold block">⚠️ Anti-Clases</span>
                <span className="font-black text-red-300 text-[10px]">
                  {adn.antiClases.map(ac => CATEGORY_INFO[ac].name.split(' ')[0]).join(', ')}
                </span>
                <span className="text-[8px] text-red-300/80 block mt-0.5">¡Rechazo!</span>
              </div>
            </div>
          </div>

          {/* Active and Passive Abilities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-[#131724] rounded-xl border border-yellow-500/40 space-y-1">
              <span className="font-black text-yellow-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Habilidad Activa: {character.abilityName}
              </span>
              <p className="text-neutral-300 text-[11px] leading-snug">{character.abilityDescription}</p>
            </div>

            <div className="p-3 bg-[#131724] rounded-xl border border-cyan-500/40 space-y-1">
              <span className="font-black text-cyan-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                Habilidad Pasiva: {character.passiveName}
              </span>
              <p className="text-neutral-300 text-[11px] leading-snug">{character.passiveDescription}</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-2 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
        >
          Cerrar Expediente
        </button>
      </div>
    </div>
  );
};
