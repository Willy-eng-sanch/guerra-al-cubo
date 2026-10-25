import React, { useEffect, useRef } from 'react';
import { X, Volume2, Sparkles, Swords, Play } from 'lucide-react';

interface CinematicCutsceneModalProps {
  videoUrl: string;
  characterName: string;
  actionTitle: string;
  quote?: string;
  onClose: () => void;
  autoCloseMs?: number;
}

export const CinematicCutsceneModal: React.FC<CinematicCutsceneModalProps> = ({
  videoUrl,
  characterName,
  actionTitle,
  quote,
  onClose,
  autoCloseMs = 25000 // Safety fallback only, normally onEnded closes it
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Attempt to play with unmuted audio
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Fallback to muted if browser blocks unmuted autoplay
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play();
        }
      });
    }

    if (autoCloseMs && autoCloseMs > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseMs);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [videoUrl, autoCloseMs, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 animate-fadeIn select-none">
      {/* Cinematic Frame */}
      <div className="relative w-full max-w-3xl bg-[#090b10] border-2 border-yellow-400/80 rounded-2xl shadow-[0_0_50px_rgba(255,215,0,0.3)] overflow-hidden flex flex-col">
        
        {/* Top dramatic banner */}
        <div className="bg-gradient-to-r from-red-950 via-[#181124] to-amber-950 border-b border-yellow-500/40 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-yellow-400 text-black font-black text-[10px] tracking-wider uppercase flex items-center gap-1">
              <Swords className="w-3 h-3" />
              CINEMÁTICA DE ACCIÓN
            </span>
            <h3 className="text-sm sm:text-base font-black text-white tracking-wide font-bungee">
              {characterName}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-[#222a3d] hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-bold transition-all border border-neutral-700 flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Saltar</span>
          </button>
        </div>

        {/* Video Viewport with Arcade Overlay */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            src={videoUrl}
            playsInline
            controls
            onEnded={onClose}
            className="w-full h-full object-contain"
          />

          {/* Subtitle / Quote Banner */}
          <div className="absolute bottom-3 inset-x-3 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl p-2.5 flex items-center justify-between pointer-events-none">
            <div className="space-y-0.5">
              <div className="text-[11px] font-black text-yellow-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                <span>{actionTitle}</span>
              </div>
              {quote && (
                <p className="text-xs italic text-neutral-200 font-medium line-clamp-1">
                  "{quote}"
                </p>
              )}
            </div>

            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/70 border border-cyan-800 px-2 py-0.5 rounded">
              3D ANIMATION
            </span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-[#0f131c] px-4 py-2.5 border-t border-[#20293b] flex items-center justify-between text-xs">
          <span className="text-neutral-400 text-[11px]">
            Modelado 3D, animación y doblaje integrados en tiempo real.
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 active:scale-95 text-black font-black text-xs rounded-xl shadow-md transition-all"
          >
            Continuar Combate
          </button>
        </div>

      </div>
    </div>
  );
};
