import React, { useEffect } from 'react';
import { X, Sparkles, Swords } from 'lucide-react';

interface CinematicCutsceneModalProps {
  videoUrl?: string;
  characterName: string;
  actionTitle: string;
  quote?: string;
  onClose: () => void;
  autoCloseMs?: number;
}

export const CinematicCutsceneModal: React.FC<CinematicCutsceneModalProps> = ({
  characterName,
  actionTitle,
  quote,
  onClose,
  autoCloseMs = 2500
}) => {
  useEffect(() => {
    if (autoCloseMs && autoCloseMs > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseMs);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [autoCloseMs, onClose]);

  return (
    <div className="gc-modal-overlay fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fadeIn select-none">
      <div className="relative w-full max-w-lg bg-[#0e121a] border-2 border-yellow-400 rounded-3xl p-6 shadow-[0_0_40px_rgba(250,204,21,0.3)] text-center space-y-4">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-neutral-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400 text-black text-xs font-black uppercase tracking-wider">
          <Swords className="w-3.5 h-3.5" />
          <span>¡ACCIÓN TÁCTICA!</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white font-bungee tracking-wide">
          {actionTitle}
        </h2>

        <h3 className="text-sm font-bold text-yellow-400">
          {characterName}
        </h3>

        {quote && (
          <p className="text-xs italic text-amber-200 bg-[#161c28] p-3 rounded-2xl border border-yellow-500/30">
            "{quote}"
          </p>
        )}

        <button
          onClick={onClose}
          className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs rounded-xl uppercase tracking-wider transition-all"
        >
          Continuar
        </button>
      </div>
    </div>
  );
};
