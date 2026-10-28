import React from 'react';
import { CharacterType } from '../types/game';
import { CHARACTERS } from '../data/characters';

export interface DiceCharacterSpriteProps {
  character: CharacterType;
  teamId?: number; // 1 = Aliado (Azul), 2 = Rival (Rojo)
  teamColor?: 'blue' | 'red';
  size?: number;
  isAttacking?: boolean;
  isHit?: boolean;
  isFrozen?: boolean;
  isEliminated?: boolean;
  hasPreparedStance?: boolean;
  diceValue?: number;
  className?: string;
}

export const DiceCharacterSprite: React.FC<DiceCharacterSpriteProps> = ({
  character,
  teamId,
  teamColor,
  size = 110,
  isAttacking = false,
  isHit = false,
  isFrozen = false,
  isEliminated = false,
  hasPreparedStance = false,
  diceValue,
  className = ""
}) => {
  const charDef = CHARACTERS[character] || CHARACTERS[CharacterType.TRAMCUBOSO];

  // Determine team alignment:
  // Aliado = Azul (teamId 1 or teamColor 'blue' or default)
  // Rival = Rojo (teamId 2 or teamColor 'red')
  const isBlueTeam = teamColor === 'blue' || teamId === 1 || (!teamColor && teamId === undefined);
  const isRedTeam = teamColor === 'red' || teamId === 2;

  // Dice values / pips
  const pips = diceValue ? Math.min(6, Math.max(1, diceValue)) : 5;

  return (
    <div
      className={`relative select-none flex items-center justify-center transition-all ${
        isAttacking ? '-translate-y-4 scale-110' : ''
      } ${isHit ? 'brightness-150 saturate-50 animate-shake' : ''} ${
        isEliminated ? 'opacity-40 grayscale' : ''
      } ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* Soft Isometric Floor Contact Shadow */}
      <div className="absolute -bottom-1.5 w-[85%] h-3.5 rounded-full bg-black/80 blur-xs pointer-events-none" />

      {/* Prepared Stance Tactical Glow */}
      {hasPreparedStance && (
        <div
          className="absolute -inset-2.5 rounded-2xl border-2 border-cyan-400 animate-pulse pointer-events-none"
          style={{
            boxShadow: isBlueTeam
              ? '0 0 18px rgba(6, 182, 212, 0.75)'
              : '0 0 18px rgba(239, 68, 68, 0.75)'
          }}
        />
      )}

      {/* =========================================================================
          CHARACTER SPRITE OVERLAY: ACCESSORIES BEHIND THE DIE
          (e.g., Fairy Wings, Vampire Cape, Flute, Cards)
         ========================================================================= */}

      {/* 1. HADA AL CUBO: Translucent Iridescent Fairy Wings */}
      {character === CharacterType.HADA_AL_CUBO && (
        <div className="absolute -inset-3 pointer-events-none z-0 flex items-center justify-between">
          {/* Left Fairy Wing */}
          <svg
            className="w-8 h-12 -ml-5 opacity-90 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)] animate-pulse"
            viewBox="0 0 100 150"
            fill="none"
          >
            <path
              d="M95 75 C40 20, 10 40, 5 80 C0 110, 45 140, 95 95 Z"
              fill="url(#fairyWingGrad)"
              stroke="#67e8f9"
              strokeWidth="3"
            />
            <path d="M90 75 Q40 60 25 85" stroke="#bae6fd" strokeWidth="2" strokeDasharray="3 3" />
            <defs>
              <linearGradient id="fairyWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                <stop offset="60%" stopColor="#ec4899" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
              </linearGradient>
            </defs>
          </svg>

          {/* Right Fairy Wing */}
          <svg
            className="w-8 h-12 -mr-5 opacity-90 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)] scale-x-[-1] animate-pulse"
            viewBox="0 0 100 150"
            fill="none"
          >
            <path
              d="M95 75 C40 20, 10 40, 5 80 C0 110, 45 140, 95 95 Z"
              fill="url(#fairyWingGrad)"
              stroke="#67e8f9"
              strokeWidth="3"
            />
            <path d="M90 75 Q40 60 25 85" stroke="#bae6fd" strokeWidth="2" strokeDasharray="3 3" />
          </svg>
        </div>
      )}

      {/* 2. DRACUBÓN / CUBICULA: Vampire High-Collared Cape */}
      {(character === CharacterType.DRACUBON || character === CharacterType.CUBICULA) && (
        <div className="absolute -inset-2.5 pointer-events-none z-0 flex items-start justify-between">
          <svg className="w-full h-full drop-shadow-[0_6px_12px_rgba(0,0,0,0.9)]" viewBox="0 0 120 120">
            {/* Left High Collar Peak */}
            <path d="M15 10 L30 45 L10 65 Z" fill="#7f1d1d" stroke="#18080a" strokeWidth="2" />
            <path d="M15 10 L30 45 L20 45 Z" fill="#991b1b" />
            {/* Right High Collar Peak */}
            <path d="M105 10 L90 45 L110 65 Z" fill="#7f1d1d" stroke="#18080a" strokeWidth="2" />
            <path d="M105 10 L90 45 L100 45 Z" fill="#991b1b" />
            {/* Cape Backdrop */}
            <path d="M18 45 Q60 30 102 45 L108 95 Q60 110 12 95 Z" fill="#18080a" />
          </svg>
        </div>
      )}

      {/* 3. TRAMCUBOSO: Ace of Spades card tucked behind die */}
      {character === CharacterType.TRAMCUBOSO && (
        <div className="absolute -top-3 -right-2 w-6 h-9 bg-white rounded border border-black/80 shadow-md rotate-12 flex flex-col items-center justify-between p-0.5 z-0 pointer-events-none">
          <span className="text-[7px] font-black leading-none text-black">A</span>
          <span className="text-[9px] leading-none text-black">♠</span>
          <span className="text-[7px] font-black leading-none text-black self-end">A</span>
        </div>
      )}

      {/* =========================================================================
          THE D6 DIE PHOTO SPRITE BASE (DADO FOTORREALISTA)
          Con filtro azul para aliado o filtro rojo para rival
         ========================================================================= */}
      <div
        className="relative w-[86%] h-[86%] rounded-2xl overflow-hidden border-2 transition-all flex flex-col justify-between shadow-2xl z-10"
        style={{
          // Color Filter on Die Photo Sprite:
          background: isBlueTeam
            ? 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 45%, #0f172a 100%)'
            : 'linear-gradient(135deg, #b91c1c 0%, #dc2626 45%, #18080a 100%)',
          borderColor: isBlueTeam ? '#38bdf8' : '#f87171',
          boxShadow: isBlueTeam
            ? '0 10px 24px rgba(0,0,0,0.85), 0 0 16px rgba(56,189,248,0.5), inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -4px 6px rgba(0,0,0,0.7)'
            : '0 10px 24px rgba(0,0,0,0.85), 0 0 16px rgba(239,68,68,0.5), inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -4px 6px rgba(0,0,0,0.7)'
        }}
      >
        {/* Top Chamfer with Authentic Dice Pips (Puntos del Dado D6) */}
        <div className="relative z-10 w-full px-2 py-0.5 flex items-center justify-between border-b border-white/20 bg-white/10 backdrop-blur-xs">
          {/* Top-Left Dice Pips */}
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-white shadow-xs border border-black/40" />
            {pips >= 3 && <span className="w-1.5 h-1.5 rounded-full bg-white/90 shadow-xs" />}
          </div>

          {/* D6 Team Badge */}
          <span
            className={`text-[7px] font-black font-mono px-1 py-0.2 rounded tracking-widest border ${
              isBlueTeam
                ? 'bg-blue-950/90 text-cyan-200 border-cyan-400'
                : 'bg-red-950/90 text-red-200 border-red-500'
            }`}
          >
            {isBlueTeam ? 'AZUL' : 'ROJO'} • D6
          </span>

          {/* Top-Right Dice Pips */}
          <div className="flex items-center gap-1">
            {pips >= 4 && <span className="w-1.5 h-1.5 rounded-full bg-white/90 shadow-xs" />}
            <span className="w-2 h-2 rounded-full bg-white shadow-xs border border-black/40" />
          </div>
        </div>

        {/* Die Face Center: Base Die Texture + Rotoscope Hero Drawing */}
        <div className="relative flex-1 w-full overflow-hidden bg-black/35 flex items-center justify-center">
          {/* Traced Rotoscope Ink Character Portrait */}
          <img
            src={charDef.avatar}
            alt={charDef.displayName}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isFrozen ? 'hue-rotate-180 brightness-110' : ''
            }`}
            style={{
              // Rotoscope Comic Ink Filter:
              filter: `contrast(1.3) saturate(1.15) drop-shadow(1px 0px 0px #000) drop-shadow(-1px 0px 0px #000) drop-shadow(0px 1px 0px #000) drop-shadow(0px -1px 0px #000)`
            }}
          />

          {/* Color Tint Blend Layer (Azul para Aliado, Rojo para Rival) */}
          <div
            className={`absolute inset-0 pointer-events-none mix-blend-color opacity-35 ${
              isBlueTeam ? 'bg-cyan-500' : 'bg-red-600'
            }`}
          />

          {/* Comic Hatching Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25 mix-blend-overlay"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.4) 0px, rgba(0, 0, 0, 0.4) 1px, transparent 1px, transparent 4px)`
            }}
          />

          {/* =========================================================================
              SPRITE OVERLAY: EYES, EXPRESSIONS & UNIQUE IDENTITY FEATURES
             ========================================================================= */}

          {/* SVG SPRITE OVERLAY LAYER */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
            viewBox="0 0 100 100"
          >
            {/* A. EYES & REACTION EXPRESSIONS */}
            {isHit ? (
              /* Hurt / Hit: X eyes + grimace */
              <g className="animate-bounce">
                {/* Left X eye */}
                <line x1="28" y1="36" x2="40" y2="48" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="40" y1="36" x2="28" y2="48" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="28" y1="36" x2="40" y2="48" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
                <line x1="40" y1="36" x2="28" y2="48" stroke="#000000" strokeWidth="2" strokeLinecap="round" />

                {/* Right X eye */}
                <line x1="60" y1="36" x2="72" y2="48" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="72" y1="36" x2="60" y2="48" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="60" y1="36" x2="72" y2="48" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
                <line x1="72" y1="36" x2="60" y2="48" stroke="#000000" strokeWidth="2" strokeLinecap="round" />

                {/* Hurt Wavy Grimace */}
                <path d="M35 68 Q45 62 50 68 Q55 74 65 68" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M35 68 Q45 62 50 68 Q55 74 65 68" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </g>
            ) : isAttacking ? (
              /* Attacking / Angry: Fierce slanted eyebrows + intense eyes */
              <g>
                {/* Angry slanted brows */}
                <path d="M26 36 L44 42" stroke="#000" strokeWidth="4" strokeLinecap="round" />
                <path d="M26 36 L44 42" stroke={isBlueTeam ? '#38bdf8' : '#f87171'} strokeWidth="2" strokeLinecap="round" />

                <path d="M74 36 L56 42" stroke="#000" strokeWidth="4" strokeLinecap="round" />
                <path d="M74 36 L56 42" stroke={isBlueTeam ? '#38bdf8' : '#f87171'} strokeWidth="2" strokeLinecap="round" />

                {/* Fierce glowing pupils */}
                <circle cx="37" cy="46" r="4.5" fill="#ffffff" stroke="#000" strokeWidth="1.5" />
                <circle cx="38" cy="46" r="2" fill={isBlueTeam ? '#0284c7' : '#dc2626'} />

                <circle cx="63" cy="46" r="4.5" fill="#ffffff" stroke="#000" strokeWidth="1.5" />
                <circle cx="62" cy="46" r="2" fill={isBlueTeam ? '#0284c7' : '#dc2626'} />
              </g>
            ) : (
              /* Normal Animated Streetwise Eyes */
              <g>
                {/* Expressive cartoon eyes */}
                <ellipse cx="36" cy="44" rx="5" ry="6" fill="#ffffff" stroke="#000" strokeWidth="1.5" />
                <ellipse cx="64" cy="44" rx="5" ry="6" fill="#ffffff" stroke="#000" strokeWidth="1.5" />
                {/* Pupils */}
                <circle cx="37" cy="44" r="2.8" fill="#000000" />
                <circle cx="36" cy="42.5" r="1" fill="#ffffff" />
                <circle cx="65" cy="44" r="2.8" fill="#000000" />
                <circle cx="64" cy="42.5" r="1" fill="#ffffff" />
              </g>
            )}

            {/* =================================================================
                B. UNIQUE IDENTITY SPRITE OVERLAYS
               ================================================================= */}

            {/* 1. HADA AL CUBO: Floral Crown & Magic Stars */}
            {character === CharacterType.HADA_AL_CUBO && (
              <g>
                {/* Crown of wild glowing flowers */}
                <circle cx="35" cy="18" r="4" fill="#f472b6" stroke="#000" strokeWidth="1" />
                <circle cx="50" cy="15" r="5" fill="#fbbf24" stroke="#000" strokeWidth="1" />
                <circle cx="65" cy="18" r="4" fill="#a78bfa" stroke="#000" strokeWidth="1" />
                <circle cx="50" cy="15" r="2" fill="#ffffff" />
                {/* Twinkles */}
                <polygon points="20,25 22,29 26,30 22,31 20,35 18,31 14,30 18,29" fill="#fef08a" />
                <polygon points="80,25 82,29 86,30 82,31 80,35 78,31 74,30 78,29" fill="#fef08a" />
              </g>
            )}

            {/* 2. DRACUBÓN / CUBICULA: Vampire Fangs with Blood Droplets */}
            {(character === CharacterType.DRACUBON || character === CharacterType.CUBICULA) && (
              <g>
                {/* Smirking mouth */}
                <path d="M34 62 Q50 68 66 62" stroke="#000000" strokeWidth="3" fill="none" strokeLinecap="round" />
                {/* Left Vampire Fang */}
                <polygon points="40,62 44,72 46,62" fill="#ffffff" stroke="#000" strokeWidth="1" />
                {/* Right Vampire Fang */}
                <polygon points="54,62 56,72 60,62" fill="#ffffff" stroke="#000" strokeWidth="1" />
                {/* Blood Droplet on Left Fang */}
                <circle cx="44" cy="74" r="1.5" fill="#ef4444" />
                {/* Red Glowing Iris Accent */}
                <circle cx="37" cy="44" r="1.5" fill="#ef4444" />
                <circle cx="65" cy="44" r="1.5" fill="#ef4444" />
              </g>
            )}

            {/* 3. CUBOGRO: Protruding Lower Tusks & Wild Brow */}
            {character === CharacterType.CUBOGRO && (
              <g>
                {/* Giant lower tusks curving upwards */}
                <polygon points="32,68 36,54 40,68" fill="#fef08a" stroke="#000" strokeWidth="1.5" />
                <polygon points="60,68 64,54 68,68" fill="#fef08a" stroke="#000" strokeWidth="1.5" />
                {/* Heavy wild unibrow */}
                <path d="M26 34 Q50 42 74 34" stroke="#000" strokeWidth="5" fill="none" strokeLinecap="round" />
              </g>
            )}

            {/* 4. GLADIACUBÓN: Roman Helmet Crest Plume & Battle Scar */}
            {character === CharacterType.GLADIACUBON && (
              <g>
                {/* Red helmet crest plume waving on top */}
                <path
                  d="M44 8 C46 0, 54 0, 56 8 L54 18 L46 18 Z"
                  fill="#dc2626"
                  stroke="#000"
                  strokeWidth="1.5"
                />
                <circle cx="50" cy="5" r="3" fill="#f87171" />
                {/* Battle Scar over Right Eye */}
                <line x1="60" y1="36" x2="68" y2="52" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="61" y1="43" x2="67" y2="45" stroke="#991b1b" strokeWidth="1.5" />
              </g>
            )}

            {/* 5. CUBINJA: Ninja Mask & Forehead Metal Headband */}
            {character === CharacterType.CUBINJA && (
              <g>
                {/* Forehead Ninja Headband with Metal Plate */}
                <rect x="22" y="24" width="56" height="8" rx="2" fill="#18181b" stroke="#000" strokeWidth="1.5" />
                <rect x="38" y="25" width="24" height="6" rx="1.5" fill="#e4e4e7" stroke="#000" strokeWidth="1" />
                {/* Ninja Symbol on plate */}
                <circle cx="50" cy="28" r="1.5" fill="#18181b" />
                {/* Ninja Lower Face Mask covering mouth */}
                <path d="M22 55 Q50 68 78 55 L78 78 Q50 82 22 78 Z" fill="#18181b" stroke="#000" strokeWidth="1.5" />
              </g>
            )}

            {/* 6. FLAUCUBISTA DESAFINADO: Wooden Flute & Jaunty Beret */}
            {character === CharacterType.FLAUCUBISTA_DESAFINADO && (
              <g>
                {/* Wooden flute angled across mouth */}
                <rect
                  x="20"
                  y="62"
                  width="48"
                  height="6"
                  rx="2"
                  fill="#b45309"
                  stroke="#000"
                  strokeWidth="1.5"
                  transform="rotate(-15 44 65)"
                />
                <circle cx="34" cy="63" r="1" fill="#000" />
                <circle cx="42" cy="61" r="1" fill="#000" />
                <circle cx="50" cy="59" r="1" fill="#000" />
                {/* Floating crooked musical notes */}
                <text x="70" y="55" fontSize="12" fill="#f59e0b" fontWeight="black" stroke="#000" strokeWidth="0.5">♪</text>
                <text x="78" y="42" fontSize="14" fill="#fbbf24" fontWeight="black" stroke="#000" strokeWidth="0.5">♫</text>
              </g>
            )}

            {/* 7. TRAMCUBOSO: Dark Aviator Sunglasses & Smirk */}
            {character === CharacterType.TRAMCUBOSO && (
              <g>
                {/* Dark sunglasses */}
                <path d="M24 40 L45 40 L43 52 L26 52 Z" fill="#0a0a0a" stroke="#000" strokeWidth="1.5" />
                <path d="M55 40 L76 40 L74 52 L57 52 Z" fill="#0a0a0a" stroke="#000" strokeWidth="1.5" />
                <line x1="45" y1="44" x2="55" y2="44" stroke="#000" strokeWidth="2" />
                {/* Lens reflection glint */}
                <line x1="28" y1="42" x2="34" y2="50" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
                <line x1="59" y1="42" x2="65" y2="50" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
                {/* Toothpick in corner of smirk */}
                <line x1="62" y1="64" x2="78" y2="58" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
              </g>
            )}

            {/* 8. CUBITO DE HIELO: Icicles & Frost */}
            {character === CharacterType.CUBITO_DE_HIELO && (
              <g>
                <polygon points="30,15 34,26 38,15" fill="#e0f2fe" stroke="#000" strokeWidth="1" />
                <polygon points="46,12 50,28 54,12" fill="#bae6fd" stroke="#000" strokeWidth="1" />
                <polygon points="62,15 66,25 70,15" fill="#e0f2fe" stroke="#000" strokeWidth="1" />
              </g>
            )}

            {/* 9. PIRATA: Eyepatch & Gold Earring */}
            {character === CharacterType.PIRATA && (
              <g>
                {/* Eyepatch strap across face */}
                <line x1="20" y1="36" x2="52" y2="52" stroke="#000" strokeWidth="2" />
                {/* Eyepatch patch */}
                <circle cx="36" cy="44" r="7" fill="#000" stroke="#18181b" strokeWidth="1" />
                <text x="33" y="47" fontSize="7" fill="#fff">☠</text>
                {/* Gold hoop earring on side */}
                <circle cx="16" cy="50" r="4" fill="none" stroke="#fbbf24" strokeWidth="2" />
              </g>
            )}

            {/* 10. CUBINARCA: Golden Jeweled Crown */}
            {character === CharacterType.CUBINARCA && (
              <g>
                <polygon points="30,24 35,12 42,20 50,8 58,20 65,12 70,24" fill="#fbbf24" stroke="#000" strokeWidth="1.5" />
                <circle cx="50" cy="18" r="2" fill="#ef4444" />
                <circle cx="38" cy="20" r="1.5" fill="#3b82f6" />
                <circle cx="62" cy="20" r="1.5" fill="#10b981" />
              </g>
            )}

            {/* 11. RACUBITERO: Big DJ Headphones */}
            {character === CharacterType.RACUBITERO && (
              <g>
                {/* Headphone headband */}
                <path d="M18 45 Q50 12 82 45" stroke="#18181b" strokeWidth="4" fill="none" />
                {/* Earcups */}
                <rect x="14" y="38" width="6" height="16" rx="2" fill="#ef4444" stroke="#000" strokeWidth="1" />
                <rect x="80" y="38" width="6" height="16" rx="2" fill="#ef4444" stroke="#000" strokeWidth="1" />
              </g>
            )}
          </svg>

          {/* Isometric Specular Glint */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none z-30" />
        </div>

        {/* Bottom Chamfer with Character Name and Pips */}
        <div className="relative z-10 w-full px-1.5 py-0.5 bg-black/90 border-t border-white/15 flex items-center justify-between">
          <span className="w-1.5 h-1.5 rounded-full bg-white/80 shadow-xs" />
          <span
            className="text-[8px] font-black font-mono tracking-tight truncate px-1"
            style={{ color: isBlueTeam ? '#7dd3fc' : '#fca5a5' }}
          >
            {charDef.displayName.slice(0, 8)}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/80 shadow-xs" />
        </div>
      </div>
    </div>
  );
};
