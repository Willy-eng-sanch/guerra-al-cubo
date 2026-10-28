import React from 'react';
import { CharacterType } from '../types/game';
import { CHARACTERS } from '../data/characters';

interface Dice3DVisualProps {
  value?: number;
  character?: CharacterType;
  teamId?: number;
  teamColor?: 'blue' | 'red';
  size?: number;
  isRolling?: boolean;
  className?: string;
  glowColor?: string;
}

export const Dice3DVisual: React.FC<Dice3DVisualProps> = ({
  value = 1,
  character,
  teamId,
  teamColor,
  size = 56,
  isRolling = false,
  className = "",
  glowColor
}) => {
  const charDef = character ? CHARACTERS[character] : null;
  const displayVal = Math.min(6, Math.max(1, value));

  // Determine team color
  const isBlueTeam = teamColor === 'blue' || teamId === 1;
  const isRedTeam = teamColor === 'red' || teamId === 2;

  const accentColor =
    glowColor ||
    (isBlueTeam ? '#38bdf8' : isRedTeam ? '#f87171' : charDef ? charDef.primaryColor : '#f59e0b');

  const dieBg = isBlueTeam
    ? 'linear-gradient(145deg, #2563eb 0%, #1d4ed8 50%, #0f172a 100%)'
    : isRedTeam
    ? 'linear-gradient(145deg, #dc2626 0%, #991b1b 50%, #2a080c 100%)'
    : 'linear-gradient(145deg, #2b303d 0%, #161922 60%, #0d0f14 100%)';

  // Pip coordinates for faces 1-6
  const renderPips = (val: number) => {
    switch (val) {
      case 1:
        return (
          <div className="flex items-center justify-center w-full h-full">
            <span
              className="w-3.5 h-3.5 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.9)]"
              style={{ backgroundColor: isBlueTeam ? '#38bdf8' : '#ef4444' }}
            />
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
            <span
              className="absolute inset-0 m-auto w-3 h-3 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.9)]"
              style={{ backgroundColor: isBlueTeam ? '#38bdf8' : '#ef4444' }}
            />
            <span className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
            <span className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
          </div>
        );
      case 6:
      default:
        return (
          <div className="grid grid-cols-2 gap-1.5 w-full h-full p-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.8)] justify-self-end" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.8)] justify-self-end" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.8)] self-end" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.8)] self-end justify-self-end" />
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
        <div className="absolute -bottom-2 inset-x-1 h-3 rounded-full bg-black/65 blur-xs pointer-events-none" />

        {/* 3D Beveled Cube Body with metallic/resin bevels */}
        <div
          className="w-full h-full rounded-xl overflow-hidden relative border-2 shadow-[0_8px_16px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.3)] flex items-center justify-center transition-transform"
          style={{
            borderColor: accentColor,
            background: dieBg,
            boxShadow: `0 0 12px ${accentColor}44, inset 0 2px 2px rgba(255,255,255,0.35), inset 0 -3px 4px rgba(0,0,0,0.8)`
          }}
        >
          {/* Subtle Isometric Top-Edge Highlight */}
          <div className="absolute top-0 inset-x-0 h-[22%] bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />

          {/* If character is specified and not rolling, show hero face on die with Rotoscope filter */}
          {charDef && !isRolling ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-1 overflow-hidden">
              <img
                src={charDef.avatar}
                alt={charDef.displayName}
                className="w-full h-full object-cover rounded-lg"
                style={{
                  filter: `contrast(1.25) saturate(1.15) drop-shadow(1px 0px 0px #000) drop-shadow(-1px 0px 0px #000) drop-shadow(0px 1px 0px #000) drop-shadow(0px -1px 0px #000)`
                }}
              />
              {/* Rotoscope cross-hatch overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
                style={{
                  backgroundImage: `repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.4) 0px, rgba(0, 0, 0, 0.4) 1px, transparent 1px, transparent 3px)`
                }}
              />
              {/* Corner pip marks */}
              <span className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-white shadow" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white shadow" />

              <span
                className="absolute bottom-0 inset-x-0 bg-black/90 text-[8px] font-mono font-black text-center truncate px-0.5 border-t border-white/10"
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
          <div className="absolute inset-0 rounded-xl pointer-events-none border border-white/20" />
        </div>
      </div>
    </div>
  );
};
