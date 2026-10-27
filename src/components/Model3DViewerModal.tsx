import React, { useState, useEffect } from 'react';
import { CharacterDef } from '../types/game';
import { 
  X, 
  Sparkles, 
  Volume2, 
  Eye, 
  Video, 
  Layers, 
  Box, 
  Play, 
  ShieldCheck, 
  Swords, 
  Zap,
  CheckCircle2,
  Upload
} from 'lucide-react';

interface Model3DViewerModalProps {
  character: CharacterDef;
  onClose: () => void;
}

type ViewMode = 'textured' | 'clay' | 'wireframe' | 'full';

export const Model3DViewerModal: React.FC<Model3DViewerModalProps> = ({ character, onClose }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('textured');
  const [mainDisplay, setMainDisplay] = useState<'3d' | 'video'>('3d');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeActionTab, setActiveActionTab] = useState<'selection' | 'attack' | 'ability' | 'block'>('selection');
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);

  const has3DModel = !!character.model3dImage;
  const hasOfficialVideo = !!character.selectionVideo || !!character.actionVideos;

  // Resolve which video URL to play for current tab
  const getVideoForTab = (): string | null => {
    if (uploadedVideo) return uploadedVideo;
    if (activeActionTab === 'selection') return character.selectionVideo || character.actionVideos?.ability || null;
    if (activeActionTab === 'attack') return character.actionVideos?.attack || character.selectionVideo || null;
    if (activeActionTab === 'ability') return character.actionVideos?.ability || character.selectionVideo || null;
    if (activeActionTab === 'block') return character.actionVideos?.perfectBlock || character.selectionVideo || null;
    return character.selectionVideo || null;
  };

  const currentVideoSrc = getVideoForTab();

  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Switch to video mode to hear the authentic voice from the video
  const playCharacterVoice = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (currentVideoSrc) {
      setMainDisplay('video');
    }
  };

  // Handle temporary video upload test
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedVideo(url);
    }
  };

  // Compute CSS background-position or clipping for the 3 modes
  const getViewportStyle = () => {
    if (!character.model3dImage) return {};
    switch (viewMode) {
      case 'clay':
        // Focus left 33%
        return {
          backgroundImage: `url(${character.model3dImage})`,
          backgroundSize: '300% 100%',
          backgroundPosition: '0% center',
          backgroundRepeat: 'no-repeat'
        };
      case 'textured':
        // Focus center 33%
        return {
          backgroundImage: `url(${character.model3dImage})`,
          backgroundSize: '300% 100%',
          backgroundPosition: '50% center',
          backgroundRepeat: 'no-repeat'
        };
      case 'wireframe':
        // Focus right 33%
        return {
          backgroundImage: `url(${character.model3dImage})`,
          backgroundSize: '300% 100%',
          backgroundPosition: '100% center',
          backgroundRepeat: 'no-repeat'
        };
      case 'full':
      default:
        return {
          backgroundImage: `url(${character.model3dImage})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#10131b] border-2 border-[#2b354c] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#21293a] bg-[#141924]">
          <div className="flex items-center gap-3">
            <div 
              className="w-3.5 h-3.5 rounded-full" 
              style={{ backgroundColor: character.primaryColor }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base md:text-lg font-black text-white">{character.displayName}</h3>
                {has3DModel ? (
                  <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    MODELO 3D APLICADO
                  </span>
                ) : (
                  <span className="bg-amber-950/80 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-600/70">
                    PENDIENTE DE MODELO 3D
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400">{character.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#1f2637] hover:bg-[#2b354d] text-neutral-300 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          {/* Mode Switcher Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#141924] p-2.5 rounded-xl border border-[#242d40]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMainDisplay('3d')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                  mainDisplay === '3d'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-[#1b2230] text-neutral-300 hover:bg-[#252f44]'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>Hoja Técnica 3D</span>
              </button>

              <button
                onClick={() => setMainDisplay('video')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                  mainDisplay === 'video'
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'bg-[#1b2230] text-neutral-300 hover:bg-[#252f44]'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Cinemática / Video de Acción</span>
                {hasOfficialVideo && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </button>
            </div>

            {mainDisplay === '3d' && has3DModel && (
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setViewMode('textured')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                    viewMode === 'textured'
                      ? 'bg-amber-400 text-black'
                      : 'bg-[#1b2230] text-neutral-400 hover:bg-[#252f44]'
                  }`}
                >
                  Textura
                </button>
                <button
                  onClick={() => setViewMode('clay')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                    viewMode === 'clay'
                      ? 'bg-neutral-300 text-black'
                      : 'bg-[#1b2230] text-neutral-400 hover:bg-[#252f44]'
                  }`}
                >
                  Clay
                </button>
                <button
                  onClick={() => setViewMode('wireframe')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                    viewMode === 'wireframe'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#1b2230] text-neutral-400 hover:bg-[#252f44]'
                  }`}
                >
                  Wireframe
                </button>
                <button
                  onClick={() => setViewMode('full')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                    viewMode === 'full'
                      ? 'bg-purple-600 text-white'
                      : 'bg-[#1b2230] text-neutral-400 hover:bg-[#252f44]'
                  }`}
                >
                  Completa
                </button>
              </div>
            )}
          </div>

          {/* Main Stage (3D Viewport OR Video Cinema) */}
          <div className="relative w-full h-64 md:h-84 rounded-xl overflow-hidden border border-[#2b354c] bg-[#090b10] flex items-center justify-center shadow-inner group">
            {mainDisplay === 'video' ? (
              currentVideoSrc ? (
                <div className="w-full h-full relative bg-black flex items-center justify-center">
                  <video
                    key={currentVideoSrc + activeActionTab}
                    src={currentVideoSrc}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-lg border border-pink-500/40 text-xs font-mono text-pink-300 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-pink-400" />
                    <span>CINEMÁTICA HD EN VIVO · CON AUDIO ORIGINAL</span>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 space-y-3">
                  <Video className="w-12 h-12 text-pink-600/60 mx-auto animate-pulse" />
                  <p className="text-sm font-bold text-neutral-300">
                    Video para {character.displayName} pendiente
                  </p>
                  <p className="text-xs text-neutral-500 max-w-md">
                    Puedes adjuntarme el video MP4 o subirlo temporalmente abajo para probarlo.
                  </p>
                </div>
              )
            ) : has3DModel ? (
              <div 
                className="w-full h-full transition-all duration-300 transform group-hover:scale-[1.02]"
                style={getViewportStyle()}
              />
            ) : (
              <div className="text-center p-6 space-y-3">
                <Box className="w-12 h-12 text-neutral-600 mx-auto animate-bounce" />
                <p className="text-sm font-bold text-neutral-300">
                  Esperando archivo de modelo 3D para {character.displayName}
                </p>
                <p className="text-xs text-neutral-500 max-w-md">
                  Pásame la imagen con las 3 vistas (Clay, Texturado y Wireframe) como las de Cubogro y Flaucubista para activarlo inmediatamente.
                </p>
              </div>
            )}

            {/* View Mode Tag overlay in 3D */}
            {mainDisplay === '3d' && has3DModel && (
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 text-xs font-mono text-cyan-300">
                {viewMode === 'textured' && 'VISTA: TEXTURIZADO COMPLETO 3D'}
                {viewMode === 'clay' && 'VISTA: ESCULPIDO ARCILLA (CLAY)'}
                {viewMode === 'wireframe' && 'VISTA: MALLA POLIGONAL (WIREFRAME)'}
                {viewMode === 'full' && 'HOJA TÉCNICA 3D COMPLETA'}
              </div>
            )}
          </div>

          {/* Character Quote / Frase de Entrada */}
          <div className="bg-[#151a26] border border-[#252f43] p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Frase de Selección / Batalla
              </span>
              <p className="text-sm font-extrabold italic text-white">
                "{character.selectionQuote || '¡Listo para el combate urbano en la cuadrícula!'}"
              </p>
            </div>

            {currentVideoSrc ? (
              <button
                onClick={playCharacterVoice}
                className="px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shrink-0 bg-pink-950 hover:bg-pink-900 text-pink-300 border border-pink-700/70 shadow-md"
              >
                <Video className="w-4 h-4 text-pink-400" />
                <span>Ver y Escuchar Video Oficial</span>
              </button>
            ) : null}
          </div>

          {/* Videos de Acciones y Selección Preview Section */}
          <div className="bg-[#121620] border border-[#222b3d] p-4 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1f2738] pb-2.5">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-pink-400" />
                <h4 className="text-xs font-black uppercase tracking-wide text-white">
                  Módulo de Cinemáticas y Videos
                </h4>
                {hasOfficialVideo && (
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-500 text-[9px] font-bold px-2 py-0.5 rounded-full">
                    Video Oficial Aplicado
                  </span>
                )}
              </div>

              {/* Action Video Tabs */}
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setActiveActionTab('selection');
                    setMainDisplay('video');
                  }}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                    activeActionTab === 'selection' ? 'bg-pink-600 text-white' : 'bg-[#1b2230] text-neutral-400 hover:text-white'
                  }`}
                >
                  Selección
                </button>
                <button
                  onClick={() => {
                    setActiveActionTab('attack');
                    setMainDisplay('video');
                  }}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                    activeActionTab === 'attack' ? 'bg-red-600 text-white' : 'bg-[#1b2230] text-neutral-400 hover:text-white'
                  }`}
                >
                  Ataque
                </button>
                <button
                  onClick={() => {
                    setActiveActionTab('ability');
                    setMainDisplay('video');
                  }}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                    activeActionTab === 'ability' ? 'bg-amber-600 text-white' : 'bg-[#1b2230] text-neutral-400 hover:text-white'
                  }`}
                >
                  Habilidad
                </button>
                <button
                  onClick={() => {
                    setActiveActionTab('block');
                    setMainDisplay('video');
                  }}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                    activeActionTab === 'block' ? 'bg-cyan-600 text-white' : 'bg-[#1b2230] text-neutral-400 hover:text-white'
                  }`}
                >
                  Bloqueo
                </button>
              </div>
            </div>

            {/* Video Viewport / Simulator */}
            <div className="relative w-full h-52 rounded-lg bg-[#0a0d13] border border-[#1e2534] flex flex-col items-center justify-center overflow-hidden">
              {currentVideoSrc ? (
                <div className="w-full h-full relative group">
                  <video
                    key={currentVideoSrc + activeActionTab}
                    src={currentVideoSrc}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-2 left-2 pointer-events-none bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-300 border border-emerald-500/50">
                    {activeActionTab.toUpperCase()} · {character.displayName}
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 space-y-2">
                  <div className="inline-flex p-2.5 rounded-full bg-pink-950/40 border border-pink-700/50 text-pink-400">
                    {activeActionTab === 'selection' && <Play className="w-5 h-5" />}
                    {activeActionTab === 'attack' && <Swords className="w-5 h-5" />}
                    {activeActionTab === 'ability' && <Zap className="w-5 h-5" />}
                    {activeActionTab === 'block' && <ShieldCheck className="w-5 h-5" />}
                  </div>

                  <p className="text-xs font-bold text-neutral-200">
                    {activeActionTab === 'selection' && `Video de Selección para ${character.displayName}`}
                    {activeActionTab === 'attack' && `Cinemática de Ataque Impactante`}
                    {activeActionTab === 'ability' && `Animación Especial: ${character.abilityName}`}
                    {activeActionTab === 'block' && `Cinemática de Bloqueo Perfecto`}
                  </p>

                  <p className="text-[11px] text-neutral-500 max-w-sm">
                    Listo para vincular clips en MP4 o WebM cuando los crees. También puedes probar un video local aquí:
                  </p>

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f2738] hover:bg-[#2b354c] text-[11px] font-bold text-cyan-300 cursor-pointer border border-[#374461] transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Probar video MP4/WebM ahora</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      className="hidden"
                      onChange={handleVideoUpload}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#21293a] bg-[#141924] flex items-center justify-between">
          <span className="text-[11px] text-neutral-400">
            {has3DModel
              ? 'Modelo 3D integrado con soporte de render de alta fidelidad'
              : 'Envía los archivos de los 11 personajes restantes para activarlos'}
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 text-black font-black text-xs transition-all"
          >
            Aceptar
          </button>
        </div>

      </div>
    </div>
  );
};
