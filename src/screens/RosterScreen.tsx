import React, { useState } from 'react';
import { CHARACTER_LIST } from '../data/characters';
import { CharacterDef, CATEGORY_INFO } from '../types/game';
import { Cube3DCanvas } from '../components/Cube3DCanvas';
import { Model3DViewerModal } from '../components/Model3DViewerModal';
import { ArrowLeft, Sparkles, Box, Eye, Volume2, Video, CheckCircle2, Shield, Zap } from 'lucide-react';

interface RosterScreenProps {
  onBack: () => void;
}

export const RosterScreen: React.FC<RosterScreenProps> = ({ onBack }) => {
  const [selectedChar, setSelectedChar] = useState<CharacterDef>(CHARACTER_LIST[0]);
  const [inspectingModelChar, setInspectingModelChar] = useState<CharacterDef | null>(null);

  const custom3DCount = CHARACTER_LIST.filter(c => c.hasCustom3DModel).length;
  const videoCount = CHARACTER_LIST.filter(c => !!c.selectionVideo).length;

  React.useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const playVoiceLine = (char: CharacterDef) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    // For character with video, open video inspector directly
    setInspectingModelChar(char);
  };

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
          ROSTER: 13 DADOS HÉROES
        </h2>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-600/60 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            {custom3DCount}/13 3D
          </span>
          <span className="text-[10px] bg-pink-950 text-pink-300 border border-pink-600/60 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
            <Video className="w-3 h-3 text-pink-400" />
            {videoCount}/13 Cinemáticas
          </span>
        </div>
      </div>

      <div className="space-y-4 my-4 overflow-y-auto pr-1">
        
        {/* Model 3D Banner Callout */}
        <div className="bg-gradient-to-r from-[#172033] via-[#1a2336] to-[#25172e] border border-cyan-500/40 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-400 text-cyan-300">
              <Box className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>Modelado 3D & Cinemáticas con Audio</span>
                <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.2 rounded font-black">NUEVO</span>
              </h4>
              <p className="text-[11px] text-neutral-300">
                Videos y modelos 3D aplicados a <strong className="text-emerald-400">Cubogro</strong>, <strong className="text-amber-400">Flaucubista</strong>, <strong className="text-orange-400">Gladiacubon</strong>, <strong className="text-pink-400">Hada al Cubo</strong> y <strong className="text-purple-400">Cubícula</strong>. Pásame los otros 8 personajes para activarlos todos.
              </p>
            </div>
          </div>

          <button
            onClick={() => setInspectingModelChar(selectedChar)}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-black font-black text-xs transition-all flex items-center gap-1.5 shrink-0 shadow-md"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Inspeccionar 3D & Video</span>
          </button>
        </div>

        {/* Selected Hero Showcase Card */}
        <div className="bg-[#151a25] border-2 border-[#2b354c] rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row items-center gap-6">
          <div className="flex flex-col items-center">
            {selectedChar.model3dImage ? (
              <div 
                onClick={() => setInspectingModelChar(selectedChar)}
                className="relative w-36 h-36 rounded-xl border-2 border-amber-400/80 overflow-hidden cursor-pointer group shadow-[0_0_20px_rgba(255,167,38,0.25)] bg-[#0a0d13]"
              >
                <div 
                  className="w-full h-full transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: `url(${selectedChar.model3dImage})`,
                    backgroundSize: '300% 100%',
                    backgroundPosition: '50% center',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-black text-amber-300 gap-1 backdrop-blur-xs">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Vistas 3D</span>
                </div>
                <span className="absolute bottom-1 right-1 bg-black/70 text-amber-300 text-[8px] font-mono px-1 rounded border border-amber-400/40">
                  3D RENDER
                </span>
              </div>
            ) : (
              <Cube3DCanvas character={selectedChar.type} size={135} hasPreparedStance={true} />
            )}

            <span
              className="text-xs font-black px-3 py-1 rounded-full mt-2 border"
              style={{
                backgroundColor: `${selectedChar.primaryColor}22`,
                borderColor: selectedChar.primaryColor,
                color: selectedChar.primaryColor
              }}
            >
              {selectedChar.title}
            </span>

            {/* PvZ Heroes Classes Badges */}
            <div className="flex items-center gap-1 mt-2">
              {selectedChar.classes.map(cat => {
                const info = CATEGORY_INFO[cat];
                return (
                  <span
                    key={cat}
                    className="text-[10px] font-black px-2 py-0.5 rounded-md border flex items-center gap-0.5"
                    style={{
                      backgroundColor: info.bgGlow,
                      color: info.color,
                      borderColor: info.borderColor
                    }}
                    title={`Clase ${info.name}: ${info.synergyBonus}`}
                  >
                    {info.badge}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="flex-1 text-left space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black text-white">{selectedChar.displayName}</h3>
                  {selectedChar.hasCustom3DModel && (
                    <span className="bg-emerald-950 text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500">
                      MODELO 3D ACTIVO
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                  {selectedChar.description}
                </p>
              </div>
            </div>

            {/* Special Ability Box */}
            <div className="bg-[#0f121a] p-3 rounded-xl border border-[#263045]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-yellow-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{selectedChar.abilityName}</span>
                </span>
                {selectedChar.abilityCooldownMax > 0 && (
                  <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    Cooldown: {selectedChar.abilityCooldownMax} turnos
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                {selectedChar.abilityDescription}
              </p>
            </div>

            {/* PvZ Heroes Superpower Box */}
            <div className="bg-[#121626] p-3 rounded-xl border border-yellow-500/40 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-yellow-400" />
                  <span>SUPERPODER HEROICO: {selectedChar.signatureSuperpowerName}</span>
                </span>
                <span className="text-[9px] bg-yellow-950 text-yellow-300 font-bold px-1.5 py-0.5 rounded border border-yellow-600/50">
                  Desata al 3/3 de Bloqueo
                </span>
              </div>
              <p className="text-[11px] text-yellow-100/80 mt-1">
                {selectedChar.signatureSuperpowerDesc}
              </p>
            </div>

            {/* Quote and Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#20293d]">
              <div className="flex items-center gap-2 text-xs italic text-neutral-300">
                <span className="text-neutral-500 font-bold">Frase:</span>
                <span className="text-amber-300 font-medium">"{selectedChar.selectionQuote}"</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => playVoiceLine(selectedChar)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#1f283a] hover:bg-[#2b374f] text-cyan-300 text-xs font-bold flex items-center gap-1.5 border border-cyan-800/60 transition-all"
                  title="Escuchar voz"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Escuchar</span>
                </button>

                {selectedChar.selectionVideo && (
                  <button
                    onClick={() => setInspectingModelChar(selectedChar)}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 hover:brightness-110 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-md animate-pulse"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Ver Cinemática</span>
                  </button>
                )}

                <button
                  onClick={() => setInspectingModelChar(selectedChar)}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-black font-black text-xs flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>Inspeccionar 3D & Videos</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Character Thumbnails Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {CHARACTER_LIST.map(char => {
            const active = selectedChar.type === char.type;
            return (
              <button
                key={char.type}
                onClick={() => setSelectedChar(char)}
                className={`relative p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  active
                    ? 'bg-[#1e273c] border-yellow-400 shadow-md ring-1 ring-yellow-400 scale-[1.02]'
                    : 'bg-[#131721] border-[#222a3a] opacity-80 hover:opacity-100 hover:border-[#384661]'
                }`}
              >
                {char.model3dImage ? (
                  <div className="w-11 h-11 rounded-lg border border-amber-400/80 overflow-hidden relative shrink-0 bg-[#0a0d13]">
                    <div 
                      className="w-full h-full"
                      style={{
                        backgroundImage: `url(${char.model3dImage})`,
                        backgroundSize: '300% 100%',
                        backgroundPosition: '50% center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[7px] text-amber-300 font-mono text-center font-black">
                      3D
                    </span>
                  </div>
                ) : (
                  <img
                    src={char.avatar}
                    alt={char.displayName}
                    className="w-11 h-11 rounded-lg object-cover border border-neutral-700 shrink-0"
                  />
                )}

                <div className="overflow-hidden flex-1">
                  <div className="flex items-center gap-1">
                    <h4 className="text-xs font-bold text-white truncate">{char.displayName}</h4>
                    {char.hasCustom3DModel && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    )}
                    {char.selectionVideo && (
                      <span className="bg-pink-600/90 text-white p-0.5 rounded text-[8px] shrink-0" title="Video cinemático disponible">
                        <Video className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-neutral-400 mt-0.5">
                    <span className="truncate">{char.title}</span>
                    <span className="shrink-0 tracking-tighter ml-1">
                      {char.classes.map(c => CATEGORY_INFO[c]?.symbol || '').join('')}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-center text-[11px] text-neutral-500 py-2">
        Todos los personajes tienen 20 HP base y participan en combates con dados D5
      </div>

      {/* Model 3D & Video Inspector Modal */}
      {inspectingModelChar && (
        <Model3DViewerModal
          character={inspectingModelChar}
          onClose={() => setInspectingModelChar(null)}
        />
      )}
    </div>
  );
};
