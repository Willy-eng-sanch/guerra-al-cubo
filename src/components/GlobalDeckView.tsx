import React from 'react';
import { Layers, Trash2, Sparkles, ShieldCheck } from 'lucide-react';

interface GlobalDeckViewProps {
  deckCount: number;
  discardPileCount: number;
  isDrawingAnimation?: boolean;
  className?: string;
}

export const GlobalDeckView: React.FC<GlobalDeckViewProps> = ({
  deckCount,
  discardPileCount,
  isDrawingAnimation = false,
  className = ""
}) => {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 bg-[#131722]/95 border-2 border-[#2b374f] p-2.5 px-4 rounded-2xl shadow-xl backdrop-blur-md select-none ${className}`}>
      {/* 3D Visual Deck Stack */}
      <div className="flex items-center gap-3">
        <div className="relative group cursor-pointer" title="Mazo Global compartido de 60 cartas">
          {/* Deck card shadow layers */}
          <div className="absolute top-1 left-1 w-11 h-15 bg-[#1a1318] rounded-lg border border-[#3b2a32] shadow-sm transform rotate-3" />
          <div className="absolute top-0.5 left-0.5 w-11 h-15 bg-[#2a1b24] rounded-lg border border-[#4d3240] shadow-sm transform -rotate-2" />

          {/* Top Card of Global Deck */}
          <div
            className={`relative w-11 h-15 bg-gradient-to-br from-[#8e24aa] via-[#512da8] to-[#311b92] rounded-lg border-2 border-yellow-400 shadow-md flex flex-col items-center justify-between p-1 transition-all ${
              isDrawingAnimation
                ? 'scale-110 ring-4 ring-yellow-400 shadow-[0_0_20px_rgba(255,214,0,0.6)] animate-bounce'
                : 'group-hover:scale-105'
            }`}
          >
            <div className="w-full flex justify-between items-center text-[7px] text-yellow-300 font-bold font-mono">
              <span>D5</span>
              <span>★</span>
            </div>

            <div className="w-5 h-5 rounded-full bg-yellow-400/20 border border-yellow-300 flex items-center justify-center">
              <Layers className="w-3 h-3 text-yellow-300" />
            </div>

            <div className="text-[7px] text-yellow-200 font-extrabold uppercase tracking-tighter">
              MAZO
            </div>
          </div>

          {isDrawingAnimation && (
            <div className="absolute -top-3 -right-3 bg-yellow-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-lg animate-ping pointer-events-none">
              +1
            </div>
          )}
        </div>

        {/* Deck Count and Rules */}
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm font-black text-white font-bungee">
              MAZO GLOBAL
            </span>
            <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.2 rounded-full border border-purple-700 font-mono font-bold">
              {deckCount} / 60 cartas
            </span>
            {isDrawingAnimation && (
              <span className="text-[9px] bg-yellow-400 text-black px-1.5 py-0.2 rounded-full font-black animate-pulse">
                ¡ROBO ACTIVADO!
              </span>
            )}
          </div>
          <div className="text-[10px] text-neutral-300 flex flex-col sm:flex-row sm:items-center gap-x-2 gap-y-0.5 mt-0.5">
            <span className="flex items-center gap-1 text-yellow-400 font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>Robas por umbral (≤20, ≤15, ≤10, ≤5 HP)</span>
            </span>
            <span className="hidden sm:inline text-neutral-600">•</span>
            <span className="flex items-center gap-1 text-cyan-300 font-semibold">
              <ShieldCheck className="w-3 h-3" />
              <span>Robas + Reacción por Bloqueo Perfecto</span>
            </span>
          </div>
        </div>
      </div>

      {/* Discard Pile */}
      <div className="flex items-center gap-2 pl-3 border-l border-[#273248]">
        <div className="w-8 h-11 rounded-lg bg-[#181c26] border border-dashed border-neutral-600 flex flex-col items-center justify-center text-neutral-500">
          <Trash2 className="w-3 h-3" />
          <span className="text-[8px] font-mono font-bold text-neutral-400 mt-0.5">
            {discardPileCount}
          </span>
        </div>
        <div className="text-[10px] text-neutral-400 leading-tight">
          <span className="block font-bold text-neutral-300">Descartes</span>
          <span>{discardPileCount} usadas</span>
        </div>
      </div>
    </div>
  );
};
