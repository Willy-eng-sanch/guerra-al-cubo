import React from 'react';
import { CardCategory, CharacterDef, CharacterType, CATEGORY_INFO } from '../types/game';
import { Dice3DVisual } from './Dice3DVisual';
import { Sparkles, ArrowRight, Shield, Check, Lock, Info, Plus } from 'lucide-react';

interface HeroDiceCardProps {
  char: CharacterDef;
  isInspected: boolean;
  isPickedByPlayer: boolean;
  isPickedByRival: boolean;
  canPick: boolean;
  onFirstClickInspect: () => void;
  onSecondClickAddToCup: () => void;
}

export const HeroDiceCard: React.FC<HeroDiceCardProps> = ({
  char,
  isInspected,
  isPickedByPlayer,
  isPickedByRival,
  canPick,
  onFirstClickInspect,
  onSecondClickAddToCup
}) => {
  const isTaken = isPickedByPlayer || isPickedByRival;

  // Handle Drag Start
  const handleDragStart = (e: React.DragEvent) => {
    if (!canPick || isTaken) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', char.type);
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  // Click Handler implementing the 2-click mechanism
  const handleClick = () => {
    if (isTaken || !canPick) return;

    if (!isInspected) {
      // 1st click: Inspect name, ability, classes & synergies
      onFirstClickInspect();
    } else {
      // 2nd click on already inspected die: Send to cup!
      onSecondClickAddToCup();
    }
  };

  return (
    <div
      draggable={canPick && !isTaken}
      onDragStart={handleDragStart}
      onClick={handleClick}
      className={`relative rounded-2xl border-2 p-2.5 transition-all select-none cursor-pointer flex flex-col justify-between ${
        isPickedByPlayer
          ? 'bg-[#182337] border-cyan-400 ring-2 ring-cyan-400/40 opacity-90 cursor-default'
          : isPickedByRival
          ? 'bg-[#29171c] border-red-500/80 opacity-60 cursor-not-allowed'
          : isInspected
          ? 'bg-[#1e2536] border-yellow-400 ring-4 ring-yellow-400/50 scale-[1.03] shadow-[0_0_20px_rgba(250,204,21,0.4)] z-20'
          : canPick
          ? 'bg-[#131722] border-[#29344c] hover:border-yellow-400/70 hover:scale-[1.01] hover:bg-[#181d2c]'
          : 'bg-[#0f1219] border-[#1e2536] opacity-40 cursor-not-allowed'
      }`}
    >
      {/* Status Badges (Player, Rival, or 2nd-click CTA) */}
      {isPickedByPlayer && (
        <span className="absolute top-2 right-2 bg-cyan-500 text-black text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
          <Check className="w-2.5 h-2.5" />
          <span>EN TU VASO</span>
        </span>
      )}
      {isPickedByRival && (
        <span className="absolute top-2 right-2 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
          <Lock className="w-2.5 h-2.5" />
          <span>RIVAL</span>
        </span>
      )}
      {!isTaken && isInspected && (
        <span className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-yellow-300 text-black text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse shadow">
          <span>¡2º CLIC PARA VASO!</span>
          <ArrowRight className="w-2.5 h-2.5" />
        </span>
      )}

      {/* Main Die Row: 3D Die + Identity */}
      <div className="flex items-center gap-2.5">
        {/* 3D Isometric Die Representation */}
        <div className="shrink-0">
          <Dice3DVisual
            character={char.type}
            teamColor={isPickedByPlayer ? 'blue' : isPickedByRival ? 'red' : undefined}
            size={46}
            glowColor={isPickedByPlayer ? '#38bdf8' : isPickedByRival ? '#f87171' : char.primaryColor}
          />
        </div>

        <div className="overflow-hidden flex-1">
          <h4 className="text-xs font-black text-white truncate flex items-center gap-1">
            <span>{char.displayName}</span>
          </h4>
          <span className="text-[10px] text-yellow-400 font-bold truncate block">
            {char.title}
          </span>
          <span className="text-[9px] text-neutral-400 truncate block">
            ★ {char.abilityName}
          </span>
        </div>
      </div>

      {/* Hero Classes & Card Synergies Badges */}
      <div className="mt-2 pt-1.5 border-t border-[#232c3f] flex flex-wrap gap-1 items-center">
        {char.classes.map(cat => {
          const info = CATEGORY_INFO[cat];
          return (
            <span
              key={cat}
              className="text-[9px] font-black px-1.5 py-0.5 rounded-md border flex items-center gap-1 shadow-xs"
              style={{
                backgroundColor: info.bgGlow,
                color: info.color,
                borderColor: info.borderColor
              }}
              title={info.synergyBonus}
            >
              <span>{info.symbol}</span>
              <span>{info.name}</span>
            </span>
          );
        })}
      </div>

      {/* If Inspected: Full Details Box (Ability + Synergies Breakdown) */}
      {isInspected && !isTaken && (
        <div className="mt-2 p-2 rounded-xl bg-black/60 border border-yellow-500/50 space-y-1.5 animate-fadeIn">
          <div>
            <span className="text-[9px] font-black uppercase text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Habilidad de Dado: {char.abilityName}
            </span>
            <p className="text-[9px] text-neutral-200 leading-tight mt-0.5">
              {char.description}
            </p>
          </div>

          <div className="pt-1 border-t border-neutral-700">
            <span className="text-[9px] font-black text-cyan-300 uppercase block">
              Sinergias con Cartas del Mazo:
            </span>
            <ul className="text-[8px] text-neutral-300 space-y-0.5 list-disc list-inside mt-0.5">
              {char.classes.map(cat => (
                <li key={cat} className="leading-tight">
                  <b className="text-white">{CATEGORY_INFO[cat].name}:</b> {CATEGORY_INFO[cat].synergyBonus}
                </li>
              ))}
            </ul>
          </div>

          {/* Action button inside card */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSecondClickAddToCup();
            }}
            className="w-full mt-1.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black font-black text-[10px] flex items-center justify-center gap-1 shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>LLEVAR AL VASO DE DADOS</span>
          </button>
        </div>
      )}
    </div>
  );
};
