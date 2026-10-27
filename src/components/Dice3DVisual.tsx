import React from 'react';
import { CharacterType } from '../types/game';
import { CHARACTERS } from '../data/characters';

interface Dice3DVisualProps {
  value?: number;
  character?: CharacterType;
  size?: number;
  isRolling?: boolean;
  className?: string;
  glowColor?: string;
}

export const Dice3DVisual: React.FC<Dice3DVisualProps> = ({
  value = 1,
  character,
  size = 56,
  isRolling = false,
  className = "",
  glowColor
}) => {
  const charDef = character ? CHARACTERS[character] : null;
  const displayVal = Math.min(6, Math.max(1, value));
  const accentColor = glowColor || (charDef ? charDef.primaryColor : '#f59e0b');

  // Pip coordinates for faces 1-6
  const renderPips = (val: number) => {
    switch (val) {
      case 1:
        return (
          <div className="flex items-center justify-center w-full h-full">
            <span className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
          </div>
        );
      case 2:
        return (
          <div className="flex justify-between w-full h-full p-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
            <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm self-end" />
          </div>
        );
      case 3:
        return (
          <div className="flex justify-between w-full h-full p-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
            <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm self-center" />
            <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm self-end" />
          </div>
        );
      case 4:
        return (
          <div className="grid grid-cols-2 gap-1.5 w-full h-full p-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
            <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm justify-self-end" />
            <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm self-end" />
            <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm self-end justify-self-end" />
          </div>
        );
      case 5:
        return (
          <div className="relative w-full h-full p-1.5">
            <span className="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
            <span className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
            <span className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
            <span className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
          </div>
        );
      case 6:
      default:
        return (
          <div className="grid grid-cols-2 gap-1.5 w-full h-full p-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)] justify-self-end" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)] justify-self-end" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)] self-end" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)] self-end justify-self-end" />
          </div>
        );
    }
  };

  return (
    <div
      className={`relative inline-block select-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* 3D Isometric Die Container */}
      <div
        className={`w-full h-full rounded-2xl relative transition-all duration-300 ${
          isRolling ? 'animate-dice' : ''
        }`}
        style={{
          perspective: '600px'
        }}
      >
        {/* Soft Contact Shadow beneath 3D die */}
        <div
          className="absolute -bottom-2 inset-x-1 h-3 rounded-full bg-black/65 blur-xs pointer-events-none"
        />

        {/* 3D Beveled Cube Body with metallic/clay bevels */}
        <div
          className="w-full h-full rounded-xl overflow-hidden relative border-2 shadow-[0_8px_16px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.3)] flex items-center justify-center transition-transform"
          style={{
            borderColor: accentColor,
            background: 'linear-gradient(145deg, #2b303d 0%, #161922 60%, #0d0f14 100%)',
            boxShadow: `0 0 12px ${accentColor}33, inset 0 2px 2px rgba(255,255,255,0.25), inset 0 -3px 4px rgba(0,0,0,0.8)`
          }}
        >
          {/* Subtle Isometric Top-Edge Highlight */}
          <div className="absolute top-0 inset-x-0 h-[22%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

          {/* If character is specified and not rolling, show hero face on die */}
          {charDef && !isRolling ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-1">
              <img
                src={charDef.avatar}
                alt={charDef.displayName}
                className="w-full h-full object-cover rounded-lg"
              />
              <span
                className="absolute bottom-0 inset-x-0 bg-black/85 text-[8px] font-mono font-black text-center truncate px-0.5"
                style={{ color: accentColor }}
              >
                {charDef.displayName.slice(0, 7)}
              </span>
            </div>
          ) : (
            /* Standard 3D Die Pip Layout */
            <div className="w-full h-full p-2 flex items-center justify-center">
              {renderPips(isRolling ? Math.floor(Math.random() * 6) + 1 : displayVal)}
            </div>
          )}

          {/* 3D Dice Rim Edge Bevel */}
          <div
            className="absolute inset-0 rounded-xl pointer-events-none border border-white/15"
          />
        </div>
      </div>
    </div>
  );
};
