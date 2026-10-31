import React, { useState, useEffect } from 'react';
import { music, MUSIC_TRACKS } from '../audio/musicManager';
import { sound } from '../audio/soundManager';
import { narrator, NarratorVoiceOption } from '../audio/narratorManager';
import {
  Music,
  Volume2,
  VolumeX,
  Volume1,
  Mic,
  MicOff,
  Settings2,
  Play,
  Pause,
  X,
  Disc3,
  Dices,
  Sliders,
  Check
} from 'lucide-react';

interface AudioControlBarProps {
  className?: string;
}

export const AudioControlBar: React.FC<AudioControlBarProps> = ({ className = '' }) => {
  // Music state
  const [isPlaying, setIsPlaying] = useState(music.getIsPlaying());
  const [isMusicMuted, setIsMusicMuted] = useState(music.getIsMuted());
  const [musicVolume, setMusicVolume] = useState(music.getVolume());
  const [currentTrack, setCurrentTrack] = useState(music.getCurrentTrack());

  // SFX (Sound effects) state
  const [isSfxMuted, setIsSfxMuted] = useState(sound.getIsMuted());
  const [sfxVolume, setSfxVolume] = useState(sound.getVolume());

  // Narrator state
  const [isNarratorEnabled, setIsNarratorEnabled] = useState(narrator.getIsEnabled());
  const [narratorVolume, setNarratorVolume] = useState(narrator.getVolume());
  const [voiceOptions, setVoiceOptions] = useState<NarratorVoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(narrator.getSelectedVoiceName());

  // Modal state
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const unsubMusic = music.subscribe(() => {
      if (!isMounted) return;
      setIsPlaying(music.getIsPlaying());
      setIsMusicMuted(music.getIsMuted());
      setCurrentTrack(music.getCurrentTrack());
      setMusicVolume(music.getVolume());
    });

    const unsubSound = sound.subscribe(() => {
      if (!isMounted) return;
      setIsSfxMuted(sound.getIsMuted());
      setSfxVolume(sound.getVolume());
    });

    const unsubNarrator = narrator.subscribe(() => {
      if (!isMounted) return;
      setIsNarratorEnabled(narrator.getIsEnabled());
      setNarratorVolume(narrator.getVolume());
      setSelectedVoice(narrator.getSelectedVoiceName());
      setVoiceOptions(narrator.getVoiceOptions());
    });

    setVoiceOptions(narrator.getVoiceOptions());

    return () => {
      isMounted = false;
      unsubMusic();
      unsubSound();
      unsubNarrator();
    };
  }, []);

  // Close settings on Escape key
  useEffect(() => {
    if (!showSettings) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSettings(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSettings]);

  const handleToggleMusic = () => {
    music.togglePlay();
  };

  const handleToggleMusicMute = () => {
    music.toggleMute();
  };

  const handleToggleSfxMute = () => {
    sound.toggleMute();
  };

  const handleToggleNarrator = () => {
    narrator.setEnabled(!isNarratorEnabled);
  };

  const handleTestSfx = () => {
    sound.playTestSound();
  };

  const handleTestNarrator = () => {
    narrator.speak('¡Damas y caballeros! ¡Bienvenidos a la acera, soy el árbitro oficial de Guerra Cubita!', 'HIGH');
  };

  // Master mute toggle (mutes or unmutes both SFX and Music)
  const areAllMuted = isMusicMuted && isSfxMuted;
  const handleToggleMasterMute = () => {
    if (areAllMuted) {
      sound.setMuted(false);
      music.setMuted(false);
    } else {
      sound.setMuted(true);
      music.setMuted(true);
    }
  };

  return (
    <>
      <div className={`flex items-center gap-1 sm:gap-1.5 bg-[#121622]/90 backdrop-blur-md px-2 py-1 rounded-xl border border-[#273247] shadow-lg select-none ${className}`}>
        {/* Music Play / Pause */}
        <button
          onClick={handleToggleMusic}
          className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-[11px] font-bold ${
            isPlaying && !isMusicMuted
              ? 'bg-amber-500/20 text-yellow-300 border-yellow-500/60 shadow-[0_0_10px_rgba(250,204,21,0.25)]'
              : 'bg-[#181d28] text-neutral-400 border-neutral-700 hover:text-white'
          }`}
          title={isPlaying ? 'Pausar Música Urbana' : 'Reproducir Música Urbana'}
        >
          {isPlaying && !isMusicMuted ? (
            <>
              <Disc3 className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
              <span className="hidden sm:inline text-[10px] truncate max-w-[90px]">{currentTrack.name}</span>
            </>
          ) : (
            <>
              <Music className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px]">Música</span>
            </>
          )}
        </button>

        {/* SFX Quick Mute Toggle */}
        <button
          onClick={handleToggleSfxMute}
          className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-[11px] font-bold ${
            !isSfxMuted
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/50 hover:bg-amber-500/25'
              : 'bg-[#181d28] text-neutral-500 border-neutral-800 hover:text-neutral-400'
          }`}
          title={isSfxMuted ? 'Efectos de Sonido: Silenciados (clic para activar)' : 'Efectos de Sonido: Activos (clic para silenciar)'}
        >
          {isSfxMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-red-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="hidden md:inline text-[10px] font-mono">SFX</span>
        </button>

        {/* Narrator Toggle Button */}
        <button
          onClick={handleToggleNarrator}
          className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-[11px] font-bold ${
            isNarratorEnabled
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
              : 'bg-[#181d28] text-neutral-500 border-neutral-800'
          }`}
          title={isNarratorEnabled ? 'Narrador Activo (Voz de árbitro)' : 'Narrador Silenciado'}
        >
          {isNarratorEnabled ? (
            <Mic className="w-3.5 h-3.5 text-cyan-400" />
          ) : (
            <MicOff className="w-3.5 h-3.5 text-neutral-500" />
          )}
          <span className="hidden lg:inline text-[10px]">Voz</span>
        </button>

        {/* Settings button */}
        <button
          onClick={() => setShowSettings(true)}
          className="p-1.5 rounded-lg bg-[#181d28] hover:bg-[#222a3a] border border-[#2c374d] text-neutral-400 hover:text-white transition-all cursor-pointer"
          title="Ajustes de Sonido, Música y Volumen"
        >
          <Settings2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Audio Settings Modal */}
      {showSettings && (
        <div
          onClick={() => setShowSettings(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[#141824] border-2 border-yellow-500/70 rounded-3xl shadow-2xl text-left text-white max-h-[90vh] flex flex-col overflow-hidden cursor-default"
          >
            {/* Sticky Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#242d40] shrink-0 bg-[#141824]">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-yellow-400" />
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white font-bungee tracking-wide">
                    AJUSTES DE AUDIO
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-medium">
                    Control de volumen y silenciamiento para efectos, música y voz
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Master quick toggle */}
                <button
                  onClick={handleToggleMasterMute}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-black border transition-all flex items-center gap-1 ${
                    areAllMuted
                      ? 'bg-red-950/80 text-red-300 border-red-500'
                      : 'bg-[#1b2233] text-neutral-300 border-neutral-700 hover:border-yellow-400'
                  }`}
                  title={areAllMuted ? 'Restaurar todo el audio' : 'Silenciar todo el audio'}
                >
                  {areAllMuted ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3 text-yellow-400" />}
                  <span>{areAllMuted ? 'TODO MUDO' : 'SILENCIAR TODO'}</span>
                </button>

                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1.5 rounded-xl bg-[#1e2535] hover:bg-[#2e3a50] text-neutral-300 hover:text-white border border-[#3b4760] transition-colors cursor-pointer"
                  title="Cerrar ventana de ajustes"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Settings Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {/* --- 1. Sound Effects (SFX) Section --- */}
              <div className="bg-[#0f121a] p-4 rounded-2xl border border-[#242d40] space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30">
                      <Dices className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-amber-300 block">
                        EFECTOS DE SONIDO (SFX)
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        Dados en mesa, choques, cartas, saltos y golpes de plastilina
                      </span>
                    </div>
                  </div>

                  {/* SFX Mute Toggle Button */}
                  <button
                    onClick={handleToggleSfxMute}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer ${
                      isSfxMuted
                        ? 'bg-red-950/80 text-red-300 border-red-600 hover:bg-red-900'
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-500 hover:bg-emerald-900'
                    }`}
                    title={isSfxMuted ? 'Activar Efectos de Sonido' : 'Silenciar Efectos de Sonido'}
                  >
                    {isSfxMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isSfxMuted ? 'SILENCIADO' : 'ACTIVO'}</span>
                  </button>
                </div>

                {/* SFX Volume Slider */}
                <div className="bg-[#151924] p-3 rounded-xl border border-[#222a3d] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-semibold text-[11px] flex items-center gap-1">
                      <span>Nivel de Volumen SFX:</span>
                    </span>
                    <span className={`font-mono font-bold text-xs ${isSfxMuted ? 'text-red-400' : 'text-amber-300'}`}>
                      {isSfxMuted ? '0% (Silenciado)' : `${Math.round(sfxVolume * 100)}%`}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleToggleSfxMute}
                      className="p-1 rounded text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      title={isSfxMuted ? 'Desilenciar' : 'Silenciar'}
                    >
                      {isSfxMuted || sfxVolume === 0 ? (
                        <VolumeX className="w-4 h-4 text-red-400" />
                      ) : sfxVolume < 0.5 ? (
                        <Volume1 className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-amber-400" />
                      )}
                    </button>

                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isSfxMuted ? 0 : sfxVolume}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (isSfxMuted) sound.setMuted(false);
                        sound.setVolume(val);
                      }}
                      className="w-full accent-amber-400 h-2 bg-neutral-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Test SFX Button */}
                <button
                  onClick={handleTestSfx}
                  className="w-full py-2 rounded-xl bg-[#1b2233] hover:bg-[#252f47] active:scale-98 text-amber-300 border border-amber-500/40 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
                >
                  <Dices className="w-4 h-4 text-amber-400" />
                  <span>PROBAR SONIDO DE DADOS (SFX)</span>
                </button>
              </div>

              {/* --- 2. Music Section --- */}
              <div className="bg-[#0f121a] p-4 rounded-2xl border border-[#242d40] space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-yellow-500/15 border border-yellow-500/30">
                      <Music className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-yellow-300 block">
                        MÚSICA CALLEJERA (BGM)
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        Pistas urbanas, breakbeat y funk de sintetizador
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Music Mute Toggle Button */}
                    <button
                      onClick={handleToggleMusicMute}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 border transition-all cursor-pointer ${
                        isMusicMuted
                          ? 'bg-red-950/80 text-red-300 border-red-600 hover:bg-red-900'
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-500 hover:bg-emerald-900'
                      }`}
                      title={isMusicMuted ? 'Activar Música' : 'Silenciar Música'}
                    >
                      {isMusicMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{isMusicMuted ? 'MUTE' : 'ON'}</span>
                    </button>

                    {/* Play/Pause Button */}
                    <button
                      onClick={handleToggleMusic}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-red-950 text-red-300 border-red-600 hover:bg-red-900'
                          : 'bg-yellow-400 text-black border-yellow-500 hover:bg-yellow-300'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-black" />}
                      <span>{isPlaying ? 'PAUSAR' : 'REPRODUCIR'}</span>
                    </button>
                  </div>
                </div>

                {/* Music Volume Slider */}
                <div className="bg-[#151924] p-3 rounded-xl border border-[#222a3d] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-semibold text-[11px] flex items-center gap-1">
                      <span>Nivel de Volumen Música:</span>
                    </span>
                    <span className={`font-mono font-bold text-xs ${isMusicMuted ? 'text-red-400' : 'text-yellow-300'}`}>
                      {isMusicMuted ? '0% (Silenciado)' : `${Math.round(musicVolume * 100)}%`}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleToggleMusicMute}
                      className="p-1 rounded text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      title={isMusicMuted ? 'Desilenciar' : 'Silenciar'}
                    >
                      {isMusicMuted || musicVolume === 0 ? (
                        <VolumeX className="w-4 h-4 text-red-400" />
                      ) : musicVolume < 0.5 ? (
                        <Volume1 className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-yellow-400" />
                      )}
                    </button>

                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMusicMuted ? 0 : musicVolume}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (isMusicMuted) music.setMuted(false);
                        music.setVolume(val);
                      }}
                      className="w-full accent-yellow-400 h-2 bg-neutral-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Track Selector */}
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 block mb-1.5">
                    Seleccionar Pista Urbana:
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {MUSIC_TRACKS.map(t => (
                      <button
                        key={t.id}
                        onClick={() => {
                          music.selectTrack(t.id);
                          if (!isPlaying) music.play();
                        }}
                        className={`p-2.5 rounded-xl text-left text-xs flex items-center justify-between border transition-all cursor-pointer ${
                          currentTrack.id === t.id
                            ? 'bg-[#1e273c] border-yellow-400 text-yellow-300 font-bold shadow-md'
                            : 'bg-[#151923] border-[#252f44] text-neutral-300 hover:border-neutral-600'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold">{t.name}</span>
                            {t.badge && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                {t.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-neutral-400 mt-0.5">{t.style}</div>
                        </div>
                        {currentTrack.id === t.id && isPlaying && !isMusicMuted && (
                          <span className="text-[10px] text-yellow-400 font-mono animate-pulse flex items-center gap-1">
                            <Disc3 className="w-3 h-3 animate-spin" />
                            <span>SONANDO</span>
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* --- 3. Narrator Section --- */}
              <div className="bg-[#0f121a] p-4 rounded-2xl border border-[#242d40] space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30">
                      <Mic className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-cyan-300 block">
                        NARRADOR DE LA CALLE
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        Voz de réferi para tiros, bloqueos y K.O.s (atenúa la música)
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleToggleNarrator}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer ${
                      isNarratorEnabled
                        ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500 hover:bg-cyan-900'
                        : 'bg-neutral-900 text-neutral-500 border-neutral-700 hover:text-neutral-400'
                    }`}
                  >
                    {isNarratorEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                    <span>{isNarratorEnabled ? 'ACTIVO' : 'SILENCIADO'}</span>
                  </button>
                </div>

                {/* Narrator Volume Slider */}
                <div className="bg-[#151924] p-3 rounded-xl border border-[#222a3d] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-semibold text-[11px]">
                      Nivel de Volumen Voz:
                    </span>
                    <span className="font-mono font-bold text-xs text-cyan-300">
                      {Math.round(narratorVolume * 100)}%
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mic className="w-4 h-4 text-cyan-400" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={narratorVolume}
                      onChange={(e) => narrator.setVolume(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 h-2 bg-neutral-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Voice Selector */}
                {voiceOptions.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-neutral-400 block mb-1">
                      Voz del Réferi:
                    </span>
                    <select
                      value={selectedVoice || ''}
                      onChange={(e) => narrator.setSelectedVoice(e.target.value)}
                      className="w-full bg-[#161c28] border border-[#2c374e] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      {voiceOptions.map((opt, idx) => (
                        <option key={idx} value={opt.voice.name}>
                          {opt.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={handleTestNarrator}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 active:scale-98 text-black font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-black" />
                  <span>PROBAR VOZ DEL NARRADOR</span>
                </button>
              </div>
            </div>

            {/* Sticky Footer Button */}
            <div className="p-4 border-t border-[#242d40] bg-[#141824] shrink-0">
              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98] text-black font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer font-bungee tracking-wider flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>LISTO · GUARDAR Y CERRAR</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
