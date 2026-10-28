import React, { useState } from 'react';
import { CharacterDef, CATEGORY_INFO, CharacterType } from '../types/game';
import { DiceCharacterSprite } from './DiceCharacterSprite';
import { CartoonCombatClash, CombatClashData } from './CartoonCombatClash';
import { sound } from '../audio/soundManager';
import { X, Sparkles, Shield, Zap, Layers, Play, CheckCircle2, Sliders } from 'lucide-react';

interface Model3DViewerModalProps {
  character: CharacterDef;
  onClose: () => void;
}

export const Model3DViewerModal: React.FC<Model3DViewerModalProps> = ({ character, onClose }) => {
  const [activeTab, setActiveTab] = useState<'DOSSIER' | 'ARCHITECTURE'>('DOSSIER');
  const [selectedTeam, setSelectedTeam] = useState<'blue' | 'red'>('blue');
  const [diceVal, setDiceVal] = useState<number>(5);
  const [isStabilized, setIsStabilized] = useState<boolean>(true);
  const [testClash, setTestClash] = useState<CombatClashData | null>(null);

  const adn = character.adn;
  const primInfo = CATEGORY_INFO[adn.primaria];
  const secInfo = CATEGORY_INFO[adn.secundaria];
  const neuInfo = CATEGORY_INFO[adn.neutra];

  // Test independent Papercraft Tape Slap animation
  const handleTriggerTapeSlap = () => {
    setIsStabilized(false);
    setTimeout(() => {
      setIsStabilized(true);
      sound.playPaperTapeSlap();
    }, 40);
  };

  // Test full Cartoon Clash sequence
  const handleTriggerTestClash = () => {
    sound.playDiceRoll();
    setTestClash({
      attackerId: 1,
      defenderId: 2,
      attackerHero: character.type,
      defenderHero: CharacterType.GLADIACUBON,
      attackerTeamId: 1,
      defenderTeamId: 2,
      attackerName: character.displayName,
      defenderName: "Gladiacubón",
      attackerRolls: [5],
      attackerFinalVal: 5,
      defenderRolls: [3],
      defenderFinalVal: 3,
      isPerfectBlock: false,
      damageDealt: 4,
      phase: 'RUSH_TO_CENTER'
    });

    setTimeout(() => {
      setTestClash(prev => prev ? { ...prev, phase: 'BRAWL_CLOUD' } : null);
      sound.playCartoonFightBrawl();

      setTimeout(() => {
        setTestClash(prev => prev ? { ...prev, phase: 'REVEAL_DICE' } : null);
        sound.playPaperTapeSlap();

        setTimeout(() => {
          setTestClash(null);
        }, 1600);
      }, 1300);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-2xl bg-[#11151f] border-2 border-[#2c3850] rounded-3xl p-5 shadow-2xl text-left overflow-hidden max-h-[92vh] flex flex-col justify-between">
        
        {/* Header with Tab Switcher */}
        <div className="flex items-center justify-between pb-3 border-b border-[#212b3e] shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('DOSSIER')}
              className={`text-[10px] sm:text-xs font-black uppercase px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                activeTab === 'DOSSIER'
                  ? 'bg-yellow-400 text-black border-yellow-300 shadow'
                  : 'bg-[#181d29] text-neutral-400 border-[#2b354b] hover:text-white'
              }`}
            >
              Expediente Táctico
            </button>
            <button
              onClick={() => setActiveTab('ARCHITECTURE')}
              className={`text-[10px] sm:text-xs font-black uppercase px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ARCHITECTURE'
                  ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                  : 'bg-[#181d29] text-cyan-300 border-[#2b354b] hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Arquitectura Modular & Capas</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =========================================================================
            TAB 1: EXPEDIENTE TÁCTICO
           ========================================================================= */}
        {activeTab === 'DOSSIER' && (
          <div className="my-3 space-y-3.5 overflow-y-auto pr-1 flex-1">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div 
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-2 overflow-hidden shrink-0 shadow-lg bg-[#0a0d13]"
                style={{ borderColor: character.primaryColor }}
              >
                <img
                  src={character.avatar}
                  alt={character.displayName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1 text-center sm:text-left">
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
        )}

        {/* =========================================================================
            TAB 2: ARQUITECTURA MODULAR, CAPAS Y EFECTO COLLAGE PAPERCRAFT
           ========================================================================= */}
        {activeTab === 'ARCHITECTURE' && (
          <div className="my-3 space-y-3.5 overflow-y-auto pr-1 flex-1">
            {/* Live Interactive Die Demo */}
            <div className="p-4 bg-[#0d1017] rounded-2xl border border-cyan-500/50 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
              {/* Die Canvas Display */}
              <div className="flex flex-col items-center">
                <div className="relative p-2 rounded-2xl bg-black/40 border border-white/10 shadow-inner">
                  <DiceCharacterSprite
                    character={character.type}
                    teamColor={selectedTeam}
                    size={112}
                    diceValue={diceVal}
                    isStabilized={isStabilized}
                  />
                </div>
                <span className="text-[9px] font-mono text-neutral-400 mt-1">
                  Dado Neutro + Shader + Collage Papercraft
                </span>
              </div>

              {/* Live Interactive Controls */}
              <div className="flex-1 space-y-2.5 w-full">
                {/* 1. Base Dinámica: Tinte de Escuadrón */}
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-300 flex items-center gap-1">
                    <Sliders className="w-3 h-3" />
                    1. Base Dinámica: Tinte de Escuadrón
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => setSelectedTeam('blue')}
                      className={`flex-1 py-1 px-2 rounded-lg text-xs font-black transition-all border ${
                        selectedTeam === 'blue'
                          ? 'bg-blue-600 text-white border-cyan-300 shadow-[0_0_10px_rgba(56,189,248,0.6)]'
                          : 'bg-[#151a26] text-neutral-400 border-neutral-700'
                      }`}
                    >
                      💙 Escuadrón Aliado (Azul)
                    </button>
                    <button
                      onClick={() => setSelectedTeam('red')}
                      className={`flex-1 py-1 px-2 rounded-lg text-xs font-black transition-all border ${
                        selectedTeam === 'red'
                          ? 'bg-red-600 text-white border-red-300 shadow-[0_0_10px_rgba(239,68,68,0.6)]'
                          : 'bg-[#151a26] text-neutral-400 border-neutral-700'
                      }`}
                    >
                      ❤️ Escuadrón Rival (Rojo)
                    </button>
                  </div>
                </div>

                {/* 2. Valor de cara D6 */}
                <div>
                  <span className="text-[10px] font-black uppercase text-cyan-300 flex items-center gap-1">
                    Cara Visible D6
                  </span>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5, 6].map(v => (
                      <button
                        key={v}
                        onClick={() => setDiceVal(v)}
                        className={`flex-1 py-0.5 rounded text-xs font-mono font-bold border transition-all ${
                          diceVal === v
                            ? 'bg-yellow-400 text-black border-yellow-300'
                            : 'bg-[#151a26] text-neutral-400 border-neutral-800'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons: Tape Slap & Cartoon Clash */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    onClick={handleTriggerTapeSlap}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-[11px] uppercase tracking-wider transition-all shadow cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Pegar Recorte (Tape Slap)</span>
                  </button>

                  <button
                    onClick={handleTriggerTestClash}
                    className="flex-1 py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-[11px] uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(6,182,212,0.5)] cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Probar Choque Cómico</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Breakdown of the 6 Sorting Layers */}
            <div className="p-3 bg-[#0d1017] rounded-2xl border border-[#232c40] space-y-2">
              <span className="text-[10px] font-black uppercase text-yellow-400 tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                DESGLOSE DE LAS 6 SORTING LAYERS
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-[#141824] border border-neutral-700 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-neutral-800 text-white font-mono text-[9px] flex items-center justify-center shrink-0">0</span>
                  <div>
                    <span className="font-bold text-neutral-200 block">Ground Contact Shadow</span>
                    <span className="text-[10px] text-neutral-400 leading-tight">Sombra elíptica de contacto suave sobre el tablero.</span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-[#141824] border border-neutral-700 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-900 text-cyan-300 font-mono text-[9px] flex items-center justify-center shrink-0">1-2</span>
                  <div>
                    <span className="font-bold text-neutral-200 block">Base Neutra + Shader Tint</span>
                    <span className="text-[10px] text-neutral-400 leading-tight">Dado neutro con tinte dinámico Shader ({selectedTeam === 'blue' ? 'Azul' : 'Rojo'}).</span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-[#141824] border border-neutral-700 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-900 text-amber-300 font-mono text-[9px] flex items-center justify-center shrink-0">3</span>
                  <div>
                    <span className="font-bold text-neutral-200 block">Papercraft Cutout Sticker</span>
                    <span className="text-[10px] text-neutral-400 leading-tight">Troquelado blanco con sombra de papel despegado.</span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-[#141824] border border-neutral-700 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-900 text-purple-300 font-mono text-[9px] flex items-center justify-center shrink-0">4</span>
                  <div>
                    <span className="font-bold text-neutral-200 block">Traits & Expressive Overlay</span>
                    <span className="text-[10px] text-neutral-400 leading-tight">Ojos expresivos, sombreros, alas y rasgos transparentes.</span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-[#141824] border border-neutral-700 flex items-start gap-2 sm:col-span-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-900 text-emerald-300 font-mono text-[9px] flex items-center justify-center shrink-0">5</span>
                  <div>
                    <span className="font-bold text-neutral-200 block">Adhesive Tape / Washi Tape (Pegado Rápido)</span>
                    <span className="text-[10px] text-neutral-400 leading-tight">
                      Cinta adhesiva translúcida en la esquina superior que sujeta el recorte al estabilizarse el dado.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-2 border-t border-[#212b3e] shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Cerrar Expediente
          </button>
        </div>

        {/* Cartoon Clash Preview Overlay inside Modal */}
        {testClash && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-40 flex items-center justify-center">
            <CartoonCombatClash clash={testClash} />
          </div>
        )}
      </div>
    </div>
  );
};
