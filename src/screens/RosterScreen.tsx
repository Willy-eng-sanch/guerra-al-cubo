import React, { useState } from 'react';
import { CHARACTER_LIST } from '../data/characters';
import { CharacterDef, CATEGORY_INFO } from '../types/game';
import { ArrowLeft, Sparkles, Shield, Swords, Zap, AlertTriangle, BookOpen, UserCheck } from 'lucide-react';
import { sound } from '../audio/soundManager';
import { Model3DViewerModal } from '../components/Model3DViewerModal';

interface RosterScreenProps {
  onBack: () => void;
}

export const RosterScreen: React.FC<RosterScreenProps> = ({ onBack }) => {
  const [selectedChar, setSelectedChar] = useState<CharacterDef>(CHARACTER_LIST[0]);
  const [showViewerModal, setShowViewerModal] = useState<boolean>(false);

  const adn = selectedChar.adn;
  const primInfo = CATEGORY_INFO[adn.primaria];
  const secInfo = CATEGORY_INFO[adn.secundaria];
  const neuInfo = CATEGORY_INFO[adn.neutra];

  return (
    <div className="gc-screen relative w-full min-h-screen bg-[#0f1116] p-3 md:p-6 text-white flex flex-col justify-between max-w-5xl mx-auto select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#232b3d] pb-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-[#171c26] hover:bg-[#202736] border border-[#2c374d] text-neutral-300 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </button>

        <div className="text-center">
          <h2 className="text-base md:text-xl font-black tracking-wide text-white font-bungee">
            ROSTER OFICIAL: 13 CUBOS HEROICOS
          </h2>
          <p className="text-[10px] md:text-xs text-yellow-400 font-bold">
            ADN del Barrio: Afinidades, Sinergias & Anti-Clases (Manual Táctico)
          </p>
        </div>

        <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-600/60 px-2.5 py-1 rounded-full font-mono font-bold">
          13/13 Oficiales
        </span>
      </div>

      <div className="space-y-4 my-3 pr-1">

        {/* Selected Hero Showcase Dossier */}
        <div className="bg-[#151a25] border-2 border-[#2b354c] rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col md:flex-row items-start gap-5">
          {/* Portrait & Clay Badge */}
          <div className="flex flex-col items-center mx-auto md:mx-0 shrink-0">
            <div 
              className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl border-2 overflow-hidden shadow-xl bg-[#0d1017]"
              style={{ borderColor: selectedChar.primaryColor }}
            >
              <img
                src={selectedChar.avatar}
                alt={selectedChar.displayName}
                className="w-full h-full object-cover"
              />
              <div 
                className="absolute bottom-0 inset-x-0 py-1 text-center font-black text-[10px] tracking-wider uppercase text-black"
                style={{ backgroundColor: selectedChar.primaryColor }}
              >
                {selectedChar.title.split('·')[1]?.trim() || 'HÉROE'}
              </div>
            </div>

            <span className="text-xs text-amber-300 italic font-medium mt-2 max-w-[180px] text-center leading-snug">
              "{selectedChar.selectionQuote}"
            </span>

            <button
              onClick={() => setShowViewerModal(true)}
              className="mt-2.5 px-3 py-1.5 rounded-xl bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/70 text-cyan-300 text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.3)] cursor-pointer"
            >
              <span>📐 Inspeccionar Capas & Collage</span>
            </button>
          </div>

          {/* Details & ADN Breakdown */}
          <div className="flex-1 text-left space-y-3 w-full">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-white font-bungee">
                  {selectedChar.displayName}
                </h3>
                <span className="text-xs text-yellow-400 font-bold px-2 py-0.5 rounded bg-yellow-400/10 border border-yellow-400/30">
                  {selectedChar.title}
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                {selectedChar.description}
              </p>
            </div>

            {/* ADN del Barrio Box */}
            <div className="bg-[#10141f] p-3 rounded-2xl border border-[#263148] space-y-2">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                ADN DEL BARRIO (AFINIDADES A LAS 5 CLASES)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {/* Primaria */}
                <div 
                  className="p-2 rounded-xl border flex flex-col justify-between"
                  style={{ backgroundColor: `${primInfo.color}15`, borderColor: primInfo.borderColor }}
                >
                  <span className="text-[9px] font-bold text-amber-400 uppercase">⭐ Primaria</span>
                  <span className="font-black text-[11px]" style={{ color: primInfo.color }}>
                    {primInfo.symbol} {primInfo.name.split(' ')[0]}
                  </span>
                  <span className="text-[9px] text-neutral-300 mt-0.5">Activa Habilidad & Sinergia</span>
                </div>

                {/* Secundaria */}
                <div 
                  className="p-2 rounded-xl border flex flex-col justify-between"
                  style={{ backgroundColor: `${secInfo.color}15`, borderColor: secInfo.borderColor }}
                >
                  <span className="text-[9px] font-bold text-cyan-400 uppercase">🛡️ Secundaria</span>
                  <span className="font-black text-[11px]" style={{ color: secInfo.color }}>
                    {secInfo.symbol} {secInfo.name.split(' ')[0]}
                  </span>
                  <span className="text-[9px] text-neutral-300 mt-0.5">Activa Pasiva & Sinergia</span>
                </div>

                {/* Neutra */}
                <div className="p-2 rounded-xl border border-neutral-700 bg-neutral-900/60 flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase">⚪ Neutra</span>
                  <span className="font-black text-[11px] text-neutral-200">
                    {neuInfo.symbol} {neuInfo.name.split(' ')[0]}
                  </span>
                  <span className="text-[9px] text-neutral-400 mt-0.5">Uso sin bono ni penalización</span>
                </div>

                {/* Anti-Clases */}
                <div className="p-2 rounded-xl border border-red-600/60 bg-red-950/30 flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-red-400 uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                    Anti-Clases (2)
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {adn.antiClases.map(ac => {
                      const acInfo = CATEGORY_INFO[ac];
                      return (
                        <span key={ac} className="text-[10px] font-black text-red-300">
                          {acInfo.symbol} {acInfo.name.split(' ')[0]}
                        </span>
                      );
                    })}
                  </div>
                  <span className="text-[9px] text-red-300/80 mt-0.5">¡Rechazo inmediato!</span>
                </div>
              </div>
            </div>

            {/* Habilidad Activa & Pasiva */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Activa */}
              <div className="bg-[#10141f] p-3 rounded-2xl border border-yellow-500/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-yellow-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Activa: {selectedChar.abilityName}</span>
                  </span>
                  {selectedChar.abilityCooldownMax > 0 && (
                    <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                      CD: {selectedChar.abilityCooldownMax}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-300 mt-1 leading-snug">
                  {selectedChar.abilityDescription}
                </p>
              </div>

              {/* Pasiva */}
              <div className="bg-[#10141f] p-3 rounded-2xl border border-cyan-500/40">
                <span className="text-xs font-black text-cyan-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Pasiva: {selectedChar.passiveName}</span>
                </span>
                <p className="text-[11px] text-neutral-300 mt-1 leading-snug">
                  {selectedChar.passiveDescription}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Character Thumbnails Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {CHARACTER_LIST.map(char => {
            const active = selectedChar.type === char.type;
            const charPrim = CATEGORY_INFO[char.adn.primaria];
            const charSec = CATEGORY_INFO[char.adn.secundaria];

            return (
              <button
                key={char.type}
                onClick={() => {
                  setSelectedChar(char);
                  sound.playDiceRoll();
                }}
                className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  active
                    ? 'bg-[#1e2638] border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.25)] scale-[1.02]'
                    : 'bg-[#131722] border-[#252f44] hover:bg-[#181d2a] hover:border-neutral-500'
                }`}
              >
                <img
                  src={char.avatar}
                  alt={char.displayName}
                  className="w-10 h-10 rounded-xl object-cover shrink-0 border border-black"
                />
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-white truncate">{char.displayName}</h4>
                  <div className="flex items-center gap-1 mt-0.5 text-[10px]">
                    <span style={{ color: charPrim?.color }}>{charPrim?.symbol}</span>
                    <span style={{ color: charSec?.color }}>{charSec?.symbol}</span>
                    <span className="text-neutral-400 text-[9px] truncate">
                      {char.title.split('·')[1]?.trim() || ''}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

      </div>

      <div className="text-center text-[11px] text-neutral-400 py-2 border-t border-[#232b3d] flex items-center justify-between px-2">
        <span>Roster 100% fiel al <b>Manual Táctico de Guerra Cubita</b></span>
        <span className="text-yellow-400 font-bold">13 Cubos Urbanos con ADN Único</span>
      </div>

      {showViewerModal && (
        <Model3DViewerModal
          character={selectedChar}
          onClose={() => setShowViewerModal(false)}
        />
      )}
    </div>
  );
};
