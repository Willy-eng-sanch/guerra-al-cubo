import React, { useState } from 'react';
import { CharacterType } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { sound } from '../audio/soundManager';
import { Dice3DVisual } from './Dice3DVisual';
import { Sparkles, Swords, X, HelpCircle, Dices } from 'lucide-react';

interface DiceCupShakerProps {
  team: CharacterType[];
  maxCapacity?: number;
  onDropDie: (charType: CharacterType) => void;
  onRemoveDie?: (charType: CharacterType) => void;
  onLaunch: () => void;
  isReadyToLaunch: boolean;
  disabled?: boolean;
  cupTitle?: string;
  cupSubtitle?: string;
  className?: string;
}

export const DiceCupShaker: React.FC<DiceCupShakerProps> = ({
  team,
  maxCapacity = 3,
  onDropDie,
  onRemoveDie,
  onLaunch,
  isReadyToLaunch,
  disabled = false,
  cupTitle = "VASO DE DADOS URBANOS",
  cupSubtitle = "Arrastra dados aquí o haz doble clic para agregarlos",
  className = ""
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled || team.length >= maxCapacity) return;
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || team.length >= maxCapacity) return;

    const charType = e.dataTransfer.getData('text/plain') as CharacterType;
    if (charType && CHARACTERS[charType]) {
      onDropDie(charType);
      sound.playCupShake();
    }
  };

  const handleLaunchClick = () => {
    if (!isReadyToLaunch || isShaking) return;
    setIsShaking(true);
    sound.playCupShake();

    setTimeout(() => {
      sound.playCupDump();
    }, 600);

    setTimeout(() => {
      setIsShaking(false);
      onLaunch();
    }, 900);
  };

  return (
    <div
      className={`relative flex flex-col items-center p-3 md:p-4 rounded-3xl bg-[#121622] border-2 transition-all select-none ${
        isDragOver
          ? 'border-yellow-400 ring-4 ring-yellow-400/40 bg-[#1a2030] scale-[1.02]'
          : 'border-[#2d3850]'
      } ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Cup Title Header */}
      <div className="w-full flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <span className="p-1 rounded-lg bg-yellow-950/80 border border-yellow-500/60 text-yellow-400">
            <Dices className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-wider font-bungee">
              {cupTitle}
            </h3>
            <p className="text-[10px] text-neutral-400">
              {cupSubtitle}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono font-black px-2.5 py-0.5 rounded-full border border-yellow-500/50 bg-black/60 text-yellow-300">
          {team.length} / {maxCapacity} DADOS
        </span>
      </div>

      {/* Main 3D Cup Container and Drop Zone */}
      <div className="relative w-full max-w-md h-56 md:h-64 rounded-2xl overflow-hidden border-2 border-[#2b354c] bg-black flex flex-col items-center justify-between shadow-2xl p-3">
        {/* Real 3D Rendered Leather Dice Cup Image Background */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 opacity-80"
          style={{
            backgroundImage: `radial-gradient(ellipse at 50% 30%, rgba(18,22,34,0.35) 0%, rgba(8,10,14,0.95) 90%), url('/src/assets/images/dice_cup_3d_1793105147820.jpg')`
          }}
        />

        {/* Shaker Vibration CSS Animation */}
        <div
          className={`relative z-10 w-full flex flex-col items-center transition-transform ${
            isShaking ? 'animate-cup-shake scale-105' : ''
          }`}
        >
          {/* Cup Interior Mouth Drop Zone Banner */}
          <div
            className={`w-full max-w-xs py-2 px-3 rounded-xl border-2 text-center transition-all ${
              isDragOver
                ? 'bg-yellow-500/90 border-white text-black font-black scale-105 shadow-[0_0_20px_rgba(250,204,21,0.8)]'
                : 'bg-black/75 border-amber-500/40 text-amber-200'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>
                {isDragOver
                  ? '¡SUELTA AQUÍ TU DADO HÉROE!'
                  : team.length >= maxCapacity
                  ? '¡VASO LLENO! LISTO PARA AGITAR Y LANZAR'
                  : 'BOCA DEL VASO: ARRASTRA O HAZ 2º CLIC'}
              </span>
            </div>
          </div>
        </div>

        {/* Dice Inside Cup Slots Display */}
        <div className="relative z-10 w-full flex items-center justify-center gap-3 my-auto">
          {Array.from({ length: maxCapacity }).map((_, idx) => {
            const charType = team[idx];
            const hero = charType ? CHARACTERS[charType] : null;

            return (
              <div
                key={idx}
                className={`relative w-20 h-24 md:w-24 md:h-28 rounded-2xl border-2 flex flex-col items-center justify-center p-1.5 transition-all ${
                  hero
                    ? 'bg-[#182030]/95 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.35)] animate-clay'
                    : 'bg-black/60 border-dashed border-neutral-600'
                }`}
              >
                {hero ? (
                  <>
                    {/* Remove button */}
                    {onRemoveDie && !disabled && (
                      <button
                        onClick={() => onRemoveDie(charType)}
                        className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-md z-20 cursor-pointer"
                        title="Sacar del vaso"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}

                    {/* 3D Die Visual with Hero Face */}
                    <Dice3DVisual
                      character={charType}
                      size={44}
                      glowColor={hero.primaryColor}
                    />

                    <span className="text-[10px] font-black text-white truncate w-full text-center mt-1">
                      {hero.displayName}
                    </span>
                    <span className="text-[8px] text-amber-300 font-bold truncate w-full text-center">
                      ★ {hero.abilityName.slice(0, 10)}
                    </span>
                  </>
                ) : (
                  <div className="text-center text-neutral-500">
                    <span className="text-xl opacity-30">🎲</span>
                    <p className="text-[9px] font-bold mt-1">
                      Dado #{idx + 1}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Status Ticker */}
        <div className="relative z-10 w-full text-center">
          <span className="text-[10px] text-neutral-300 font-bold bg-black/60 px-3 py-1 rounded-full border border-white/10">
            {team.length === 0 && 'Selecciona un dado con 1 clic para ver detalles, y 2º clic para meterlo.'}
            {team.length > 0 && team.length < maxCapacity && `Faltan ${maxCapacity - team.length} dado(s) en el vaso.`}
            {team.length >= maxCapacity && '¡Vaso cargado! Agita para lanzar los dados a la arena callejera.'}
          </span>
        </div>
      </div>

      {/* Shake & Launch Button */}
      <button
        onClick={handleLaunchClick}
        disabled={!isReadyToLaunch || isShaking || disabled}
        className={`w-full mt-3 py-3.5 px-4 rounded-2xl font-black text-xs md:text-sm tracking-wider flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
          isReadyToLaunch && !disabled
            ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 hover:brightness-110 active:scale-[0.98] text-black border-yellow-200 shadow-[0_0_20px_rgba(250,204,21,0.5)] animate-bounce'
            : 'bg-[#181d28] text-neutral-500 border-[#263044] cursor-not-allowed opacity-60'
        }`}
      >
        <Swords className="w-4 h-4 text-black" />
        <span>
          {isShaking
            ? '¡AGITANDO VASO Y LANZANDO A LA ARENA...!'
            : isReadyToLaunch
            ? '¡AGITAR VASO Y LANZAR A LA ARENA!'
            : `METE LOS ${maxCapacity} DADOS AL VASO PARA COMBATIR`}
        </span>
      </button>
    </div>
  );
};
