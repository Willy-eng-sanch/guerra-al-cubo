import React, { useState, useEffect } from 'react';
import { music, MUSIC_TRACKS } from '../audio/musicManager';
import { narrator, NarratorVoiceOption } from '../audio/narratorManager';
import { Music, Volume2, VolumeX, Mic, MicOff, Settings2, Play, Pause, X, Disc3 } from 'lucide-react';

interface AudioControlBarProps {
  className?: string;
}

export const AudioControlBar: React.FC<AudioControlBarProps> = ({ className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(music.getIsPlaying());
  const [isMusicMuted, setIsMusicMuted] = useState(music.getIsMuted());
  const [isNarratorEnabled, setIsNarratorEnabled] = useState(narrator.getIsEnabled());
  const [showSettings, setShowSettings] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(music.getCurrentTrack());
  const [musicVolume, setMusicVolume] = useState(music.getVolume());
  const [narratorVolume, setNarratorVolume] = useState(narrator.getVolume());
  const [voiceOptions, setVoiceOptions] = useState<NarratorVoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(narrator.getSelectedVoiceName());

  useEffect(() => {
    const unsubMusic = music.subscribe(() => {
      setIsPlaying(music.getIsPlaying());
      setIsMusicMuted(music.getIsMuted());
      setCurrentTrack(music.getCurrentTrack());
      setMusicVolume(music.getVolume());
    });

    const unsubNarrator = narrator.subscribe(() => {
      setIsNarratorEnabled(narrator.getIsEnabled());
      setNarratorVolume(narrator.getVolume());
      setSelectedVoice(narrator.getSelectedVoiceName());
      setVoiceOptions(narrator.getVoiceOptions());
    });

    setVoiceOptions(narrator.getVoiceOptions());

    return () => {
      unsubMusic();
      unsubNarrator();
    };
  }, []);

  const handleToggleMusic = () => {
    music.togglePlay();
  };

  const handleToggleNarrator = () => {
    narrator.setEnabled(!isNarratorEnabled);
  };

  const handleTestNarrator = () => {
    narrator.speak('¡Damas y caballeros! ¡Bienvenidos a la acera, soy el árbitro oficial de Guerra Cubita!', 'HIGH');
  };

  return (
    <>
      <div className={`flex items-center gap-1.5 bg-[#121622]/90 backdrop-blur-md px-2 py-1 rounded-xl border border-[#273247] shadow-lg select-none ${className}`}>
        {/* Music Play / Pause */}
        <button
          onClick={handleToggleMusic}
          className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-[11px] font-bold ${
            isPlaying && !isMusicMuted
              ? 'bg-amber-500/20 text-yellow-300 border-yellow-500/60 shadow-[0_0_10px_rgba(250,204,21,0.25)]'
              : 'bg-[#181d28] text-neutral-400 border-neutral-700 hover:text-white'
          }`}
          title={isPlaying ? 'Pausar Música' : 'Reproducir Música Callejera'}
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

        {/* Narrator Toggle Button */}
        <button
          onClick={handleToggleNarrator}
          className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-[11px] font-bold ${
            isNarratorEnabled
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
              : 'bg-[#181d28] text-neutral-500 border-neutral-800 line-through'
          }`}
          title={isNarratorEnabled ? 'Narrador Activo (Voz de árbitro)' : 'Narrador Silenciado'}
        >
          {isNarratorEnabled ? (
            <Mic className="w-3.5 h-3.5 text-cyan-400" />
          ) : (
            <MicOff className="w-3.5 h-3.5 text-neutral-500" />
          )}
          <span className="hidden md:inline text-[10px]">Narrador</span>
        </button>

        {/* Settings button */}
        <button
          onClick={() => setShowSettings(true)}
          className="p-1.5 rounded-lg bg-[#181d28] hover:bg-[#222a3a] border border-[#2c374d] text-neutral-400 hover:text-white transition-all"
          title="Ajustes de Música y Narrador"
        >
          <Settings2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Audio Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#141824] border-2 border-yellow-500/50 rounded-2xl p-5 shadow-2xl text-left text-white">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-3.5 right-3.5 text-neutral-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4 font-bungee">
              <Music className="w-5 h-5 text-yellow-400" />
              <span>SONIDO & NARRADOR</span>
            </h3>

            <div className="space-y-4">
              {/* --- Music Section --- */}
              <div className="bg-[#0f121a] p-3.5 rounded-xl border border-[#242d40] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-yellow-400" />
                    <span className="font-extrabold text-sm text-yellow-300">MÚSICA CALLEJERA</span>
                  </div>
                  <button
                    onClick={handleToggleMusic}
                    className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 border ${
                      isPlaying
                        ? 'bg-red-950 text-red-300 border-red-600'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-600'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? 'PAUSAR' : 'REPRODUCIR'}</span>
                  </button>
                </div>

                {/* Track Selector */}
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 block mb-1">
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
                        className={`p-2.5 rounded-lg text-left text-xs flex items-center justify-between border transition-all ${
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
                        {currentTrack.id === t.id && isPlaying && (
                          <span className="text-[10px] text-yellow-400 font-mono animate-pulse">
                            ♪ SONANDO
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Music Volume */}
                <div className="flex items-center justify-between gap-3 text-xs pt-1">
                  <button
                    onClick={() => music.setMuted(!isMusicMuted)}
                    className="p-1 rounded text-neutral-300 hover:text-white"
                  >
                    {isMusicMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-yellow-400" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMusicMuted ? 0 : musicVolume}
                    onChange={(e) => {
                      music.setMuted(false);
                      music.setVolume(parseFloat(e.target.value));
                    }}
                    className="w-full accent-yellow-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                  <span className="font-mono text-[11px] text-neutral-400 w-8 text-right">
                    {Math.round(isMusicMuted ? 0 : musicVolume * 100)}%
                  </span>
                </div>
              </div>

              {/* --- Narrator Section --- */}
              <div className="bg-[#0f121a] p-3.5 rounded-xl border border-[#242d40] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-cyan-400" />
                    <span className="font-extrabold text-sm text-cyan-300">NARRADOR DE LA CALLE</span>
                  </div>
                  <button
                    onClick={handleToggleNarrator}
                    className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 border ${
                      isNarratorEnabled
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-500'
                        : 'bg-neutral-900 text-neutral-500 border-neutral-700'
                    }`}
                  >
                    {isNarratorEnabled ? 'ACTIVO' : 'SILENCIADO'}
                  </button>
                </div>

                <p className="text-[11px] text-neutral-400 leading-tight">
                  Voz humana y expresiva para relatar tiros, Super-Bloqueos, sinergias y K.O.s. Se atenúa la música automáticamente al hablar.
                </p>

                {/* Voice Selector */}
                {voiceOptions.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-neutral-400 block mb-1">
                      Voz del Narrador:
                    </span>
                    <select
                      value={selectedVoice || ''}
                      onChange={(e) => narrator.setSelectedVoice(e.target.value)}
                      className="w-full bg-[#161c28] border border-[#2c374e] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      {voiceOptions.map((opt, idx) => (
                        <option key={idx} value={opt.voice.name}>
                          {opt.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Narrator Volume & Test Button */}
                <div className="flex items-center justify-between gap-3 text-xs pt-1">
                  <span className="text-[11px] text-neutral-400">Volumen:</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={narratorVolume}
                    onChange={(e) => narrator.setVolume(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                  <span className="font-mono text-[11px] text-neutral-400 w-8 text-right">
                    {Math.round(narratorVolume * 100)}%
                  </span>
                </div>

                <button
                  onClick={handleTestNarrator}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 active:scale-95 text-black font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow"
                >
                  <Volume2 className="w-3.5 h-3.5 text-black" />
                  <span>PROBAR VOZ DEL NARRADOR</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full mt-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs rounded-xl"
            >
              CERRAR
            </button>
          </div>
        </div>
      )}
    </>
  );
};
