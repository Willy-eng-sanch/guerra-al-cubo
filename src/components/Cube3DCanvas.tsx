import React from 'react';
import { CharacterType } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { Dice3DVisual } from './Dice3DVisual';

interface Cube3DCanvasProps {
  character: CharacterType;
  size?: number;
  isAttacking?: boolean;
  isHit?: boolean;
  hasPreparedStance?: boolean;
  isFrozen?: boolean;
  className?: string;
}

export const Cube3DCanvas: React.FC<Cube3DCanvasProps> = ({
  character,
  size = 110,
  isAttacking = false,
  isHit = false,
  hasPreparedStance = false,
  isFrozen = false,
  className = ""
}) => {
  const charDef = CHARACTERS[character] || CHARACTERS[CharacterType.TRAMCUBOSO];
  const primaryColor = isFrozen ? "#80DEEA" : charDef.primaryColor;

  return (
    <div
      className={`relative select-none flex flex-col items-center justify-center transition-all ${
        isAttacking ? '-translate-y-3 scale-110' : ''
      } ${isHit ? 'brightness-150 saturate-50' : ''} ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* 3D Contact Floor Shadow */}
      <div
        className="absolute bottom-1 w-[85%] h-3.5 rounded-full bg-black/70 blur-xs pointer-events-none"
      />

      {/* Prepared Stance Neon Ring */}
      {hasPreparedStance && (
        <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-pulse shadow-[0_0_15px_rgba(0,229,255,0.8)] pointer-events-none" />
      )}

      {/* 3D Hero Die Isometric Body */}
      <div
        className="relative w-[85%] h-[85%] rounded-2xl overflow-hidden border-2 shadow-[0_10px_25px_rgba(0,0,0,0.8)] transition-all"
        style={{
          borderColor: primaryColor,
          boxShadow: `0 0 16px ${primaryColor}40, inset 0 2px 4px rgba(255,255,255,0.3)`
        }}
      >
        {/* Hero Die Face Image */}
        <img
          src={charDef.avatar}
          alt={charDef.displayName}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isFrozen ? 'hue-rotate-180 brightness-110' : ''
          }`}
        />

        {/* 3D Isometric Top Reflection */}
        <div className="absolute top-0 inset-x-0 h-1/3 bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />

        {/* Die Face Corner Pip Badge */}
        <div
          className="absolute top-1 left-1 w-3 h-3 rounded-full border border-black/50 shadow flex items-center justify-center"
          style={{ backgroundColor: primaryColor }}
        >
          <span className="w-1 h-1 rounded-full bg-white" />
        </div>

        {/* Bottom Hero Name Ribbon */}
        <div className="absolute bottom-0 inset-x-0 bg-black/85 py-0.5 px-1 text-center border-t border-white/10">
          <span
            className="text-[8px] font-black font-mono tracking-tight truncate block"
            style={{ color: primaryColor }}
          >
            {charDef.displayName.slice(0, 8)}
          </span>
        </div>
      </div>
    </div>
  );
};
