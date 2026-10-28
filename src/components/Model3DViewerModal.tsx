import React, { useState } from 'react';
import { CharacterDef, CATEGORY_INFO, CharacterType } from '../types/game';
import { DiceCharacterSprite } from './DiceCharacterSprite';
import { Cube3DCanvas } from './Cube3DCanvas';
import { createCharacterSpriteOverlayDataUrl } from './characterSpriteLayers';
import { CartoonCombatClash, CombatClashData } from './CartoonCombatClash';
import { sound } from '../audio/soundManager';
import { X, Sparkles, Shield, Zap, Layers, Play, Sliders, Download, Box, Eye, Check } from 'lucide-react';

interface Model3DViewerModalProps {
  character: CharacterDef;
  onClose: () => void;
}

export const Model3DViewerModal: React.FC<Model3DViewerModalProps> = ({ character, onClose }) => {
  const [activeTab, setActiveTab] = useState<'DOSSIER' | 'ARCHITECTURE'>('DOSSIER');
  const [viewMode, setViewMode] = useState<'2D_LAYERS' | '3D_DECAL' | 'PNG_OVERLAY'>('2D_LAYERS');
  const [selectedTeam, setSelectedTeam] = useState<'blue' | 'red'>('blue');
  const [diceVal, setDiceVal] = useState<number>(5);
  const [isStabilized, setIsStabilized] = useState<boolean>(true);
  const [testClash, setTestClash] = useState<CombatClashData | null>(null);

  // Layer toggles for modular inspection
  const [layers, setLayers] = useState({
    shadow: true,
    dieBase: true,
    teamTint: true,
    pips: true,
    papercraft: true,
    traits: true,
    accessories: true,
    tape: true,
  });

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const adn = character.adn;
  const primInfo = CATEGORY_INFO[adn.primaria];
  const secInfo = CATEGORY_INFO[adn.secundaria];
  const neuInfo = CATEGORY_INFO[adn.neutra];

  // Export transparent PNG of character's unique traits and accessories overlay
  const handleDownloadOverlayPng = () => {
    const dataUrl = createCharacterSpriteOverlayDataUrl({
      character: character.type,
      isBlueTeam: selectedTeam === 'blue',
      diceValue: diceVal
    }, 512, 512);

    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `overlay_${character.type.toLowerCase()}_${selectedTeam}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

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
            {/* View Mode Switcher (2D Layers vs 3D Decal vs PNG Overlay) */}
            <div className="flex items-center gap-1.5 p-1 bg-[#0a0d13] rounded-xl border border-[#232c40]">
              <button
                onClick={() => setViewMode('2D_LAYERS')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === '2D_LAYERS'
                    ? 'bg-cyan-500 text-black shadow font-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>2D Sorting Layers</span>
              </button>

              <button
                onClick={() => setViewMode('3D_DECAL')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === '3D_DECAL'
                    ? 'bg-amber-400 text-black shadow font-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Box className="w-3 h-3" />
                <span>3D Decal Interactivo</span>
              </button>

              <button
                onClick={() => setViewMode('PNG_OVERLAY')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'PNG_OVERLAY'
                    ? 'bg-purple-500 text-white shadow font-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Sprite Overlay PNG</span>
              </button>
            </div>

            {/* Live Interactive Die Demo Box */}
            <div className="p-4 bg-[#0d1017] rounded-2xl border border-cyan-500/50 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
              {/* Die Canvas / Decal / Overlay Display */}
              <div className="flex flex-col items-center shrink-0">
                <div className="relative p-2 rounded-2xl bg-black/50 border border-white/10 shadow-inner flex items-center justify-center min-w-[140px] min-h-[140px]">
                  {viewMode === '2D_LAYERS' && (
                    <DiceCharacterSprite
                      character={character.type}
                      teamColor={selectedTeam}
                      size={120}
                      diceValue={diceVal}
                      isStabilized={isStabilized}
                      layers={layers}
                    />
                  )}

                  {viewMode === '3D_DECAL' && (
                    <Cube3DCanvas
                      character={character.type}
                      teamColor={selectedTeam}
                      size={135}
                      diceValue={diceVal}
                      interactive={true}
                    />
                  )}

                  {viewMode === 'PNG_OVERLAY' && (
                    <div
                      className="w-32 h-32 rounded-xl border border-dashed border-white/30 flex items-center justify-center relative overflow-hidden"
                      style={{
                        backgroundImage: `linear-gradient(45deg, #222 25%, transparent 25%), linear-gradient(-45deg, #222 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222 75%), linear-gradient(-45deg, transparent 75%, #222 75%)`,
                        backgroundSize: '16px 16px',
                        backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                        backgroundColor: '#111'
                      }}
                    >
                      <img
                        src={createCharacterSpriteOverlayDataUrl({
                          character: character.type,
                          isBlueTeam: selectedTeam === 'blue',
                          diceValue: diceVal
                        }, 256, 256)}
                        alt="Sprite Overlay Transparente"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>

                <span className="text-[9px] font-mono text-cyan-300 mt-1.5 text-center">
                  {viewMode === '2D_LAYERS' && 'Dado Neutro + Shader + Capas 2D'}
                  {viewMode === '3D_DECAL' && 'Cubo 3D + Decal Frontal + Mesh 3D'}
                  {viewMode === 'PNG_OVERLAY' && 'Fondo Transparente (PNG Decal)'}
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
                      className={`flex-1 py-1 px-2 rounded-lg text-xs font-black transition-all border cursor-pointer ${
                        selectedTeam === 'blue'
                          ? 'bg-blue-600 text-white border-cyan-300 shadow-[0_0_10px_rgba(56,189,248,0.6)]'
                          : 'bg-[#151a26] text-neutral-400 border-neutral-700'
                      }`}
                    >
                      💙 Escuadrón Aliado (Azul)
                    </button>
                    <button
                      onClick={() => setSelectedTeam('red')}
                      className={`flex-1 py-1 px-2 rounded-lg text-xs font-black transition-all border cursor-pointer ${
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
                        className={`flex-1 py-0.5 rounded text-xs font-mono font-bold border transition-all cursor-pointer ${
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

                {/* 3. Export PNG Button & Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    onClick={handleDownloadOverlayPng}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-[10px] uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(168,85,247,0.5)] cursor-pointer flex items-center justify-center gap-1.5"
                    title="Exportar rasgos, ojos, sombreros y accesorios en PNG transparente (512x512)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar Overlay PNG</span>
                  </button>

                  <button
                    onClick={handleTriggerTapeSlap}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-[10px] uppercase tracking-wider transition-all shadow cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Tape Slap</span>
                  </button>

                  <button
                    onClick={handleTriggerTestClash}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-[10px] uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(6,182,212,0.5)] cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-black" />
                    <span>Choque Cómico</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Layer Toggles (Sorting Layers Control) */}
            <div className="p-3 bg-[#0d1017] rounded-2xl border border-[#232c40] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-yellow-400 tracking-wider flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  CONTROL DE CAPAS INTERACTIVAS (SORTING LAYERS)
                </span>
                <span className="text-[9px] text-neutral-400 font-mono">
                  Haz clic para aislar cada capa
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
                <button
                  onClick={() => toggleLayer('shadow')}
                  className={`p-1.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                    layers.shadow ? 'bg-neutral-800/90 text-white border-neutral-600' : 'bg-black/30 text-neutral-500 border-neutral-800 line-through'
                  }`}
                >
                  <span>0. Sombra Base</span>
                  {layers.shadow && <Check className="w-3 h-3 text-cyan-400" />}
                </button>

                <button
                  onClick={() => toggleLayer('dieBase')}
                  className={`p-1.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                    layers.dieBase ? 'bg-neutral-800/90 text-white border-neutral-600' : 'bg-black/30 text-neutral-500 border-neutral-800 line-through'
                  }`}
                >
                  <span>1. Dado Neutro</span>
                  {layers.dieBase && <Check className="w-3 h-3 text-cyan-400" />}
                </button>

                <button
                  onClick={() => toggleLayer('teamTint')}
                  className={`p-1.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                    layers.teamTint ? 'bg-neutral-800/90 text-white border-neutral-600' : 'bg-black/30 text-neutral-500 border-neutral-800 line-through'
                  }`}
                >
                  <span>2. Tinte Shader</span>
                  {layers.teamTint && <Check className="w-3 h-3 text-cyan-400" />}
                </button>

                <button
                  onClick={() => toggleLayer('pips')}
                  className={`p-1.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                    layers.pips ? 'bg-neutral-800/90 text-white border-neutral-600' : 'bg-black/30 text-neutral-500 border-neutral-800 line-through'
                  }`}
                >
                  <span>3. Pips D6</span>
                  {layers.pips && <Check className="w-3 h-3 text-cyan-400" />}
                </button>

                <button
                  onClick={() => toggleLayer('papercraft')}
                  className={`p-1.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                    layers.papercraft ? 'bg-neutral-800/90 text-white border-neutral-600' : 'bg-black/30 text-neutral-500 border-neutral-800 line-through'
                  }`}
                >
                  <span>4. Troquelado</span>
                  {layers.papercraft && <Check className="w-3 h-3 text-cyan-400" />}
                </button>

                <button
                  onClick={() => toggleLayer('traits')}
                  className={`p-1.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                    layers.traits ? 'bg-neutral-800/90 text-white border-neutral-600' : 'bg-black/30 text-neutral-500 border-neutral-800 line-through'
                  }`}
                >
                  <span>5. Rasgos/Ojos</span>
                  {layers.traits && <Check className="w-3 h-3 text-cyan-400" />}
                </button>

                <button
                  onClick={() => toggleLayer('accessories')}
                  className={`p-1.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                    layers.accessories ? 'bg-neutral-800/90 text-white border-neutral-600' : 'bg-black/30 text-neutral-500 border-neutral-800 line-through'
                  }`}
                >
                  <span>6. Sombreros/Gear</span>
                  {layers.accessories && <Check className="w-3 h-3 text-cyan-400" />}
                </button>

                <button
                  onClick={() => toggleLayer('tape')}
                  className={`p-1.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                    layers.tape ? 'bg-neutral-800/90 text-white border-neutral-600' : 'bg-black/30 text-neutral-500 border-neutral-800 line-through'
                  }`}
                >
                  <span>7. Cinta Adhesiva</span>
                  {layers.tape && <Check className="w-3 h-3 text-cyan-400" />}
                </button>
              </div>
            </div>

            {/* Character Accessories Highlight Box */}
            <div className="p-3 bg-[#0d1017] rounded-2xl border border-purple-500/40 space-y-1.5">
              <span className="text-[10px] font-black uppercase text-purple-300 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                ACCESORIOS Y RASGOS EXCLUSIVOS DE {character.displayName.toUpperCase()}
              </span>
              <p className="text-[11px] text-neutral-300 leading-snug">
                Identificación visual instantánea mediante Sprite Overlay transparente sobre la cara superior del dado:
              </p>
              <div className="p-2 rounded-xl bg-purple-950/30 border border-purple-500/30 text-[11px] text-purple-200">
                {character.type === CharacterType.CUBINJA && "Bandana shinobi roja con placa metálica plateada grabada con shuriken, cintas ondeantes al viento y máscara ninja de tela negra."}
                {character.type === CharacterType.TRAMCUBOSO && "Sombrero fedora negro ladeado con carta As de Picas ♠ en la banda, gafas oscuras de aviador con puente dorado y colmillo/palillo de tramposo."}
                {character.type === CharacterType.CUBOGRO && "Colmillos gigantescos de marfil curvados hacia arriba, ceño fruncido pesado, aro de toro de bronce en la nariz y pintura de guerra carmesí."}
                {character.type === CharacterType.HADA_AL_CUBO && "Alas translúcidas iridiscentes de mariposa con brillo, diadema floral con tiara de capullos y varita mágica con estrella dorada luminosa."}
                {character.type === CharacterType.CUBINARCA && "Corona real de oro de 5 puntas engastada con gemas (rubí, zafiro, esmeralda), bigote aristocrático rizado y perilla monárquica."}
                {character.type === CharacterType.GLADIACUBON && "Casco de centurión romano con penacho curvo rojo carmesí, carrilleras de bronce y cicatriz de batalla cruzada sobre el ojo."}
                {character.type === CharacterType.DRACUBON && "Cuello alzado de terciopelo de vampiro con broche medallón dorado y colmillos blancos afilados con gota de sangre."}
                {character.type === CharacterType.FLAUCUBISTA_DESAFINADO && "Boina francesa verde ladeada con pluma de ave, flauta de madera travesera con orificios y notas musicales flotantes (♪ ♫)."}
                {character.type === CharacterType.RACUBITERO && "Auriculares DJ de asfalto rojos y negros, visera urbana tipo snapback invertida y visor estéreo."}
                {character.type === CharacterType.CUBITO_DE_HIELO && "Picos de cristal de hielo glaciar sobresalientes, pestañas de escarcha gélida y dientes congelados temblorosos."}
                {character.type === CharacterType.PIRATA && "Tricornio de capitán corsario con ribete dorado, parche de cuero negro con calavera blanca ☠ y pendiente de aro de oro."}
                {character.type === CharacterType.CUBICULA && "Tiara gótica de condesa con rubí de sangre colgante, colmillos finos de vampiresa y gargantilla de terciopelo."}
                {character.type === CharacterType.CAMBIAFORMAS && "Gorro bufonesco de dos cuernos con cascabeles dorados, naipes de póquer (♦ ♥) en mejillas y signo de interrogación místico."}
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
