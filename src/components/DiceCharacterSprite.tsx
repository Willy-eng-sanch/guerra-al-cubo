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
  isStabilized?: boolean; // triggers papercraft tape slap on stabilization
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
  isStabilized = true,
  className = ""
}) => {
  const charDef = CHARACTERS[character] || CHARACTERS[CharacterType.TRAMCUBOSO];

  // 1. BASE DINÁMICA: Tinte de color según escuadrón (Azul = Aliado, Rojo = Rival)
  const isBlueTeam = teamColor === 'blue' || teamId === 1 || (!teamColor && teamId === undefined);
  const isRedTeam = teamColor === 'red' || teamId === 2;

  // Dice value / pips
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
      {/* CAPA 0: Sombra de contacto sobre la mesa (Ground Shadow) */}
      <div className="absolute -bottom-1.5 w-[85%] h-3.5 rounded-full bg-black/80 blur-xs pointer-events-none" />

      {/* Postura táctica preparada (Glow de Postura) */}
      {hasPreparedStance && (
        <div
          className="absolute -inset-2 rounded-2xl border-2 border-cyan-400 animate-pulse pointer-events-none"
          style={{
            boxShadow: isBlueTeam
              ? '0 0 18px rgba(6, 182, 212, 0.75)'
              : '0 0 18px rgba(239, 68, 68, 0.75)'
          }}
        />
      )}

      {/* =========================================================================
          CAPA 1: ACCESORIOS EXTERNOS DEL PERSONAJE DETRÁS DEL DADO (Alas, Capa, Cartas)
         ========================================================================= */}

      {/* HADA AL CUBO: Alas translúcidas detrás del dado */}
      {character === CharacterType.HADA_AL_CUBO && (
        <div className="absolute -inset-3 pointer-events-none z-0 flex items-center justify-between">
          <svg className="w-8 h-12 -ml-5 opacity-90 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)] animate-pulse" viewBox="0 0 100 150" fill="none">
            <path d="M95 75 C40 20, 10 40, 5 80 C0 110, 45 140, 95 95 Z" fill="url(#fairyWingGrad)" stroke="#67e8f9" strokeWidth="3" />
            <path d="M90 75 Q40 60 25 85" stroke="#bae6fd" strokeWidth="2" strokeDasharray="3 3" />
            <defs>
              <linearGradient id="fairyWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                <stop offset="60%" stopColor="#ec4899" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
              </linearGradient>
            </defs>
          </svg>
          <svg className="w-8 h-12 -mr-5 opacity-90 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)] scale-x-[-1] animate-pulse" viewBox="0 0 100 150" fill="none">
            <path d="M95 75 C40 20, 10 40, 5 80 C0 110, 45 140, 95 95 Z" fill="url(#fairyWingGrad)" stroke="#67e8f9" strokeWidth="3" />
            <path d="M90 75 Q40 60 25 85" stroke="#bae6fd" strokeWidth="2" strokeDasharray="3 3" />
          </svg>
        </div>
      )}

      {/* DRACUBÓN / CUBICULA: Capa de vampiro de cuello alto */}
      {(character === CharacterType.DRACUBON || character === CharacterType.CUBICULA) && (
        <div className="absolute -inset-2.5 pointer-events-none z-0 flex items-start justify-between">
          <svg className="w-full h-full drop-shadow-[0_6px_12px_rgba(0,0,0,0.9)]" viewBox="0 0 120 120">
            <path d="M15 10 L30 45 L10 65 Z" fill="#7f1d1d" stroke="#18080a" strokeWidth="2" />
            <path d="M15 10 L30 45 L20 45 Z" fill="#991b1b" />
            <path d="M105 10 L90 45 L110 65 Z" fill="#7f1d1d" stroke="#18080a" strokeWidth="2" />
            <path d="M105 10 L90 45 L100 45 Z" fill="#991b1b" />
            <path d="M18 45 Q60 30 102 45 L108 95 Q60 110 12 95 Z" fill="#18080a" />
          </svg>
        </div>
      )}

      {/* TRAMCUBOSO: As de Picas asomado detrás del dado */}
      {character === CharacterType.TRAMCUBOSO && (
        <div className="absolute -top-3 -right-2 w-6 h-9 bg-white rounded border border-black/80 shadow-md rotate-12 flex flex-col items-center justify-between p-0.5 z-0 pointer-events-none">
          <span className="text-[7px] font-black leading-none text-black">A</span>
          <span className="text-[9px] leading-none text-black">♠</span>
          <span className="text-[7px] font-black leading-none text-black self-end">A</span>
        </div>
      )}

      {/* =========================================================================
          CAPA 2: BASE DINÁMICA DEL CUERPO DEL DADO (DADO NEUTRO + SHADER DE COLOR)
          Usa una estructura de dado fotorrealista neutra y le aplica el tinte azul/rojo.
         ========================================================================= */}
      <div
        className="relative w-[88%] h-[88%] rounded-2xl overflow-hidden border-2 transition-all flex flex-col justify-between shadow-2xl z-10"
        style={{
          // Base dinámica neutra con shader de color de escuadrón:
          background: isBlueTeam
            ? 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 45%, #0f172a 100%)'
            : 'linear-gradient(135deg, #b91c1c 0%, #dc2626 45%, #18080a 100%)',
          borderColor: isBlueTeam ? '#38bdf8' : '#f87171',
          boxShadow: isBlueTeam
            ? '0 10px 24px rgba(0,0,0,0.85), 0 0 16px rgba(56,189,248,0.5), inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -4px 6px rgba(0,0,0,0.7)'
            : '0 10px 24px rgba(0,0,0,0.85), 0 0 16px rgba(239,68,68,0.5), inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -4px 6px rgba(0,0,0,0.7)'
        }}
      >
        {/* Bisel superior del dado con pips auténticos de D6 y badge de escuadrón */}
        <div className="relative z-10 w-full px-2 py-0.5 flex items-center justify-between border-b border-white/20 bg-white/10 backdrop-blur-xs">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-white shadow-xs border border-black/40" />
            {pips >= 3 && <span className="w-1.5 h-1.5 rounded-full bg-white/90 shadow-xs" />}
          </div>

          <span
            className={`text-[7px] font-black font-mono px-1.5 py-0.2 rounded tracking-widest border ${
              isBlueTeam
                ? 'bg-blue-950/90 text-cyan-200 border-cyan-400'
                : 'bg-red-950/90 text-red-200 border-red-500'
            }`}
          >
            {isBlueTeam ? 'AZUL' : 'ROJO'} • D6
          </span>

          <div className="flex items-center gap-1">
            {pips >= 4 && <span className="w-1.5 h-1.5 rounded-full bg-white/90 shadow-xs" />}
            <span className="w-2 h-2 rounded-full bg-white shadow-xs border border-black/40" />
          </div>
        </div>

        {/* =========================================================================
            CAPA 3: EFECTO COLLAGE PAPERCRAFT (PIEZAS SUPERPUESTAS INDEPENDIENTES)
            El personaje aparece como un recorte de papel pegado rápidamente con cinta adhesiva.
           ========================================================================= */}
        <div className="relative flex-1 w-full overflow-hidden bg-black/40 flex items-center justify-center p-1">
          {/* Contenedor del recorte Collage Papercraft */}
          <div
            className={`relative w-[92%] h-[92%] rounded-xl overflow-hidden border-2 border-white/90 shadow-[0_4px_10px_rgba(0,0,0,0.8)] rotate-[-1.5deg] transition-all ${
              isStabilized ? 'animate-paper-slap' : ''
            }`}
            style={{
              backgroundColor: '#1c1917',
              boxShadow: '0 4px 10px rgba(0,0,0,0.85), inset 0 0 4px rgba(0,0,0,0.6)'
            }}
          >
            {/* Retrato del personaje con filtro de cómic / rotoscopia */}
            <img
              src={charDef.avatar}
              alt={charDef.displayName}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isFrozen ? 'hue-rotate-180 brightness-110' : ''
              }`}
              style={{
                filter: `contrast(1.3) saturate(1.2) drop-shadow(1px 0px 0px #000) drop-shadow(-1px 0px 0px #000) drop-shadow(0px 1px 0px #000) drop-shadow(0px -1px 0px #000)`
              }}
            />

            {/* Tinte dinámico de escuadrón (Modificador de color tipo Shader) */}
            <div
              className={`absolute inset-0 pointer-events-none mix-blend-color opacity-30 ${
                isBlueTeam ? 'bg-cyan-500' : 'bg-red-600'
              }`}
            />

            {/* Textura de papel / trama de cómic del recorte */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.4) 0px, rgba(0, 0, 0, 0.4) 1px, transparent 1px, transparent 4px)`
              }}
            />

            {/* Borde troquelado blanco estilo pegatina recortada a mano */}
            <div className="absolute inset-0 rounded-xl border border-dashed border-white/60 pointer-events-none" />

            {/* =========================================================================
                CAPA 4: CINTA ADHESIVA (WASHI TAPE TRANSLÚCIDA PEGADA RÁPIDAMENTE)
               ========================================================================= */}
            {/* Tira de cinta adhesiva superior izquierda */}
            <div
              className="absolute -top-1.5 -left-2 w-8 h-3.5 bg-amber-100/50 backdrop-blur-[0.5px] border-y border-white/60 shadow-xs rotate-[-18deg] pointer-events-none z-30"
              style={{
                boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                background: 'linear-gradient(90deg, rgba(254,240,138,0.45) 0%, rgba(255,255,255,0.65) 50%, rgba(254,240,138,0.4) 100%)'
              }}
            >
              {/* Líneas sutiles de la cinta adhesiva */}
              <div className="w-full h-full opacity-40 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)]" />
            </div>

            {/* Segunda tira de cinta adhesiva inferior derecha (simula collage artesanal) */}
            <div
              className="absolute -bottom-1 -right-2 w-7 h-3 bg-amber-100/45 backdrop-blur-[0.5px] border-y border-white/60 shadow-xs rotate-[14deg] pointer-events-none z-30"
              style={{
                boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                background: 'linear-gradient(90deg, rgba(254,240,138,0.4) 0%, rgba(255,255,255,0.6) 50%, rgba(254,240,138,0.4) 100%)'
              }}
            />

            {/* =========================================================================
                CAPA 5: SPRITE OVERLAY DE RASGOS, OJOS, SOMBREROS Y EXPRESIONES
               ========================================================================= */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
              viewBox="0 0 100 100"
            >
              {/* EXPRESIONES Y OJOS DINÁMICOS */}
              {isHit ? (
                <g className="animate-bounce">
                  <line x1="28" y1="36" x2="40" y2="48" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1="40" y1="36" x2="28" y2="48" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1="28" y1="36" x2="40" y2="48" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
                  <line x1="40" y1="36" x2="28" y2="48" stroke="#000000" strokeWidth="2" strokeLinecap="round" />

                  <line x1="60" y1="36" x2="72" y2="48" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1="72" y1="36" x2="60" y2="48" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1="60" y1="36" x2="72" y2="48" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
                  <line x1="72" y1="36" x2="60" y2="48" stroke="#000000" strokeWidth="2" strokeLinecap="round" />

                  <path d="M35 68 Q45 62 50 68 Q55 74 65 68" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <path d="M35 68 Q45 62 50 68 Q55 74 65 68" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </g>
              ) : isAttacking ? (
                <g>
                  <path d="M26 36 L44 42" stroke="#000" strokeWidth="4" strokeLinecap="round" />
                  <path d="M26 36 L44 42" stroke={isBlueTeam ? '#38bdf8' : '#f87171'} strokeWidth="2" strokeLinecap="round" />
                  <path d="M74 36 L56 42" stroke="#000" strokeWidth="4" strokeLinecap="round" />
                  <path d="M74 36 L56 42" stroke={isBlueTeam ? '#38bdf8' : '#f87171'} strokeWidth="2" strokeLinecap="round" />

                  <circle cx="37" cy="46" r="4.5" fill="#ffffff" stroke="#000" strokeWidth="1.5" />
                  <circle cx="38" cy="46" r="2" fill={isBlueTeam ? '#0284c7' : '#dc2626'} />
                  <circle cx="63" cy="46" r="4.5" fill="#ffffff" stroke="#000" strokeWidth="1.5" />
                  <circle cx="62" cy="46" r="2" fill={isBlueTeam ? '#0284c7' : '#dc2626'} />
                </g>
              ) : (
                <g>
                  <ellipse cx="36" cy="44" rx="5" ry="6" fill="#ffffff" stroke="#000" strokeWidth="1.5" />
                  <ellipse cx="64" cy="44" rx="5" ry="6" fill="#ffffff" stroke="#000" strokeWidth="1.5" />
                  <circle cx="37" cy="44" r="2.8" fill="#000000" />
                  <circle cx="36" cy="42.5" r="1" fill="#ffffff" />
                  <circle cx="65" cy="44" r="2.8" fill="#000000" />
                  <circle cx="64" cy="42.5" r="1" fill="#ffffff" />
                </g>
              )}

              {/* RASGOS Y ACCESORIOS ESPECÍFICOS DE PERSONAJES */}
              {/* 1. HADA AL CUBO: Corona floral, destellos y Varita Mágica con estrella dorada */}
              {character === CharacterType.HADA_AL_CUBO && (
                <g>
                  {/* Corona floral */}
                  <circle cx="35" cy="18" r="4" fill="#f472b6" stroke="#000" strokeWidth="1" />
                  <circle cx="50" cy="15" r="5" fill="#fbbf24" stroke="#000" strokeWidth="1" />
                  <circle cx="65" cy="18" r="4" fill="#a78bfa" stroke="#000" strokeWidth="1" />
                  <circle cx="50" cy="15" r="2" fill="#ffffff" />
                  {/* Varita Mágica con Estrella Dorada */}
                  <g transform="rotate(18 80 50)">
                    {/* Mango de madera de la varita */}
                    <line x1="72" y1="35" x2="88" y2="78" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
                    {/* Estrella mágica dorada con resplandor */}
                    <polygon points="72,25 75,32 82,33 77,38 78,45 72,41 66,45 67,38 62,33 69,32" fill="#fde047" stroke="#000" strokeWidth="1" />
                    <circle cx="72" cy="35" r="2.5" fill="#ffffff" />
                  </g>
                  <polygon points="20,25 22,29 26,30 22,31 20,35 18,31 14,30 18,29" fill="#fef08a" />
                  <polygon points="84,20 86,24 90,25 86,26 84,30 82,26 78,25 82,24" fill="#fef08a" />
                </g>
              )}

              {(character === CharacterType.DRACUBON || character === CharacterType.CUBICULA) && (
                <g>
                  <path d="M34 62 Q50 68 66 62" stroke="#000000" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <polygon points="40,62 44,72 46,62" fill="#ffffff" stroke="#000" strokeWidth="1" />
                  <polygon points="54,62 56,72 60,62" fill="#ffffff" stroke="#000" strokeWidth="1" />
                  <circle cx="44" cy="74" r="1.5" fill="#ef4444" />
                </g>
              )}

              {character === CharacterType.CUBOGRO && (
                <g>
                  <polygon points="32,68 36,54 40,68" fill="#fef08a" stroke="#000" strokeWidth="1.5" />
                  <polygon points="60,68 64,54 68,68" fill="#fef08a" stroke="#000" strokeWidth="1.5" />
                  <path d="M26 34 Q50 42 74 34" stroke="#000" strokeWidth="5" fill="none" strokeLinecap="round" />
                </g>
              )}

              {character === CharacterType.GLADIACUBON && (
                <g>
                  <path d="M44 8 C46 0, 54 0, 56 8 L54 18 L46 18 Z" fill="#dc2626" stroke="#000" strokeWidth="1.5" />
                  <circle cx="50" cy="5" r="3" fill="#f87171" />
                  <line x1="60" y1="36" x2="68" y2="52" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round" />
                </g>
              )}

              {/* CUBINJA: Bandana con placa metálica y cintas ondeando */}
              {character === CharacterType.CUBINJA && (
                <g>
                  {/* Cintas de la bandana ondeando a la izquierda */}
                  <path d="M20 28 Q8 32 4 45 Q12 40 22 34 Z" fill="#18181b" stroke="#000" strokeWidth="1" />
                  <path d="M19 32 Q6 40 2 54 Q10 46 20 37 Z" fill="#27272a" stroke="#000" strokeWidth="1" />
                  {/* Banda principal de la bandana */}
                  <rect x="18" y="22" width="64" height="10" rx="2" fill="#18181b" stroke="#000" strokeWidth="1.5" />
                  {/* Placa metálica protectora */}
                  <rect x="36" y="23" width="28" height="8" rx="2" fill="#e4e4e7" stroke="#000" strokeWidth="1.5" />
                  {/* Símbolo ninja en la placa */}
                  <circle cx="50" cy="27" r="2" fill="#18181b" />
                  <circle cx="50" cy="27" r="1" fill="#e4e4e7" />
                  {/* Máscara inferior de ninja */}
                  <path d="M22 55 Q50 68 78 55 L78 78 Q50 82 22 78 Z" fill="#18181b" stroke="#000" strokeWidth="1.5" />
                </g>
              )}

              {character === CharacterType.FLAUCUBISTA_DESAFINADO && (
                <g>
                  <rect x="20" y="62" width="48" height="6" rx="2" fill="#b45309" stroke="#000" strokeWidth="1.5" transform="rotate(-15 44 65)" />
                  <circle cx="34" cy="63" r="1" fill="#000" />
                  <circle cx="42" cy="61" r="1" fill="#000" />
                  <circle cx="50" cy="59" r="1" fill="#000" />
                  <text x="70" y="55" fontSize="12" fill="#f59e0b" fontWeight="black" stroke="#000" strokeWidth="0.5">♪</text>
                  <text x="78" y="42" fontSize="14" fill="#fbbf24" fontWeight="black" stroke="#000" strokeWidth="0.5">♫</text>
                </g>
              )}

              {character === CharacterType.TRAMCUBOSO && (
                <g>
                  <path d="M24 40 L45 40 L43 52 L26 52 Z" fill="#0a0a0a" stroke="#000" strokeWidth="1.5" />
                  <path d="M55 40 L76 40 L74 52 L57 52 Z" fill="#0a0a0a" stroke="#000" strokeWidth="1.5" />
                  <line x1="45" y1="44" x2="55" y2="44" stroke="#000" strokeWidth="2" />
                  <line x1="28" y1="42" x2="34" y2="50" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
                  <line x1="59" y1="42" x2="65" y2="50" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
                  <line x1="62" y1="64" x2="78" y2="58" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
                </g>
              )}

              {character === CharacterType.CUBITO_DE_HIELO && (
                <g>
                  <polygon points="30,15 34,26 38,15" fill="#e0f2fe" stroke="#000" strokeWidth="1" />
                  <polygon points="46,12 50,28 54,12" fill="#bae6fd" stroke="#000" strokeWidth="1" />
                  <polygon points="62,15 66,25 70,15" fill="#e0f2fe" stroke="#000" strokeWidth="1" />
                </g>
              )}

              {character === CharacterType.PIRATA && (
                <g>
                  <line x1="20" y1="36" x2="52" y2="52" stroke="#000" strokeWidth="2" />
                  <circle cx="36" cy="44" r="7" fill="#000" stroke="#18181b" strokeWidth="1" />
                  <text x="33" y="47" fontSize="7" fill="#fff">☠</text>
                  <circle cx="16" cy="50" r="4" fill="none" stroke="#fbbf24" strokeWidth="2" />
                </g>
              )}

              {/* CUBINARCA: Corona Dorada con Gemas Enjoyadas */}
              {character === CharacterType.CUBINARCA && (
                <g>
                  {/* Corona de 5 puntas afiladas */}
                  <polygon points="26,22 32,10 40,18 50,6 60,18 68,10 74,22" fill="#f59e0b" stroke="#000" strokeWidth="1.5" />
                  <rect x="25" y="20" width="50" height="5" rx="1" fill="#d97706" stroke="#000" strokeWidth="1" />
                  {/* Gemas enjoyadas */}
                  <circle cx="50" cy="15" r="2.8" fill="#ef4444" stroke="#000" strokeWidth="0.5" />
                  <circle cx="36" cy="17" r="2.2" fill="#3b82f6" stroke="#000" strokeWidth="0.5" />
                  <circle cx="64" cy="17" r="2.2" fill="#10b981" stroke="#000" strokeWidth="0.5" />
                  <circle cx="50" cy="15" r="0.8" fill="#ffffff" />
                </g>
              )}

              {character === CharacterType.RACUBITERO && (
                <g>
                  <path d="M18 45 Q50 12 82 45" stroke="#18181b" strokeWidth="4" fill="none" />
                  <rect x="14" y="38" width="6" height="16" rx="2" fill="#ef4444" stroke="#000" strokeWidth="1" />
                  <rect x="80" y="38" width="6" height="16" rx="2" fill="#ef4444" stroke="#000" strokeWidth="1" />
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Bisel inferior con nombre del personaje recortado */}
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
