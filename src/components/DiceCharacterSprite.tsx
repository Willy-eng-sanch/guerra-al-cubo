import React from 'react';
import { CharacterType } from '../types/game';
import { CHARACTERS } from '../data/characters';

export interface LayerVisibility {
  shadow?: boolean;
  dieBase?: boolean;
  teamTint?: boolean;
  pips?: boolean;
  papercraft?: boolean;
  traits?: boolean;
  accessories?: boolean;
  tape?: boolean;
  battleFx?: boolean;
}

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
  layers?: LayerVisibility;
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
  layers,
  className = ""
}) => {
  const show = {
    shadow: layers?.shadow ?? true,
    dieBase: layers?.dieBase ?? true,
    teamTint: layers?.teamTint ?? true,
    pips: layers?.pips ?? true,
    papercraft: layers?.papercraft ?? true,
    traits: layers?.traits ?? true,
    accessories: layers?.accessories ?? true,
    tape: layers?.tape ?? true,
    battleFx: layers?.battleFx ?? true,
  };
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
      {show.shadow && (
        <div className="absolute -bottom-1.5 w-[85%] h-3.5 rounded-full bg-black/80 blur-xs pointer-events-none" />
      )}

      {/* Postura táctica preparada (Glow de Postura) */}
      {hasPreparedStance && show.battleFx && (
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
      {show.accessories && character === CharacterType.HADA_AL_CUBO && (
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
      {show.accessories && (character === CharacterType.DRACUBON || character === CharacterType.CUBICULA) && (
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
      {show.accessories && character === CharacterType.TRAMCUBOSO && (
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
          background: !show.dieBase
            ? 'transparent'
            : !show.teamTint
            ? 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 45%, #64748b 100%)'
            : isBlueTeam
            ? 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 45%, #0f172a 100%)'
            : 'linear-gradient(135deg, #b91c1c 0%, #dc2626 45%, #18080a 100%)',
          borderColor: !show.dieBase
            ? 'transparent'
            : !show.teamTint
            ? '#94a3b8'
            : isBlueTeam ? '#38bdf8' : '#f87171',
          boxShadow: !show.dieBase
            ? 'none'
            : isBlueTeam
            ? '0 10px 24px rgba(0,0,0,0.85), 0 0 16px rgba(56,189,248,0.5), inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -4px 6px rgba(0,0,0,0.7)'
            : '0 10px 24px rgba(0,0,0,0.85), 0 0 16px rgba(239,68,68,0.5), inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -4px 6px rgba(0,0,0,0.7)'
        }}
      >
        {/* Bisel superior del dado con pips auténticos de D6 y badge de escuadrón */}
        {show.pips && (
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
        )}

        {/* =========================================================================
            CAPA 3: EFECTO COLLAGE PAPERCRAFT (PIEZAS SUPERPUESTAS INDEPENDIENTES)
            El personaje aparece como un recorte de papel pegado rápidamente con cinta adhesiva.
           ========================================================================= */}
        <div className="relative flex-1 w-full overflow-hidden bg-black/40 flex items-center justify-center p-1">
          {/* Contenedor del recorte Collage Papercraft */}
          {show.papercraft && (
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
              {show.teamTint && (
                <div
                  className={`absolute inset-0 pointer-events-none mix-blend-color opacity-30 ${
                    isBlueTeam ? 'bg-cyan-500' : 'bg-red-600'
                  }`}
                />
              )}

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
              {show.tape && (
                <>
                  {/* Tira de cinta adhesiva superior izquierda */}
                  <div
                    className="absolute -top-1.5 -left-2 w-8 h-3.5 bg-amber-100/50 backdrop-blur-[0.5px] border-y border-white/60 shadow-xs rotate-[-18deg] pointer-events-none z-30"
                    style={{
                      boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                      background: 'linear-gradient(90deg, rgba(254,240,138,0.45) 0%, rgba(255,255,255,0.65) 50%, rgba(254,240,138,0.4) 100%)'
                    }}
                  >
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
                </>
              )}

              {/* =========================================================================
                  CAPA 5: SPRITE OVERLAY DE RASGOS, OJOS, SOMBREROS Y EXPRESIONES
                 ========================================================================= */}
              {(show.traits || show.accessories) && (
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

              {/* RASGOS Y ACCESORIOS ESPECÍFICOS DE LOS 13 PERSONAJES */}

              {/* 1. HADA AL CUBO: Corona floral, destellos mágicos y Varita Dorada de Estrella */}
              {character === CharacterType.HADA_AL_CUBO && (
                <g>
                  {/* Corona floral en la frente */}
                  <circle cx="32" cy="18" r="5" fill="#f472b6" stroke="#000" strokeWidth="1.2" />
                  <circle cx="44" cy="15" r="5.5" fill="#38bdf8" stroke="#000" strokeWidth="1.2" />
                  <circle cx="56" cy="14" r="6.5" fill="#facc15" stroke="#000" strokeWidth="1.2" />
                  <circle cx="68" cy="15" r="5.5" fill="#c084fc" stroke="#000" strokeWidth="1.2" />
                  <circle cx="80" cy="18" r="5" fill="#f472b6" stroke="#000" strokeWidth="1.2" />
                  <circle cx="56" cy="14" r="2.5" fill="#ffffff" />
                  {/* Varita Mágica con Estrella Dorada de 5 puntas */}
                  <g transform="rotate(18 80 50)">
                    <rect x="73" y="32" width="4.5" height="48" rx="2" fill="#b45309" stroke="#000" strokeWidth="1.2" />
                    <polygon points="75,22 78,29 86,30 80,36 82,44 75,39 68,44 70,36 64,30 72,29" fill="#fde047" stroke="#78350f" strokeWidth="1.5" />
                    <circle cx="75" cy="33" r="2.8" fill="#ffffff" />
                  </g>
                  <polygon points="18,25 20,29 24,30 20,31 18,35 16,31 12,30 16,29" fill="#fef08a" />
                  <polygon points="86,18 88,22 92,23 88,24 86,28 84,24 80,23 84,22" fill="#fef08a" />
                </g>
              )}

              {/* 2. DRACUBON: Cuello Alto de Capa Vampírica, Colmillos y Broche de Oro */}
              {character === CharacterType.DRACUBON && (
                <g>
                  {/* Cuello alto de vampiro */}
                  <path d="M14 16 L28 44 L16 60 Z" fill="#7f1d1d" stroke="#000" strokeWidth="1.5" />
                  <path d="M86 16 L72 44 L84 60 Z" fill="#7f1d1d" stroke="#000" strokeWidth="1.5" />
                  {/* Broche dorado */}
                  <circle cx="50" cy="58" r="5" fill="#f59e0b" stroke="#000" strokeWidth="1" />
                  <circle cx="50" cy="58" r="2.5" fill="#dc2626" />
                  {/* Colmillos afilados */}
                  <path d="M34 60 Q50 68 66 60" stroke="#000000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <polygon points="38,60 42,73 45,60" fill="#ffffff" stroke="#000" strokeWidth="1" />
                  <polygon points="55,60 58,73 62,60" fill="#ffffff" stroke="#000" strokeWidth="1" />
                  <circle cx="42" cy="75" r="1.8" fill="#ef4444" />
                </g>
              )}

              {/* 3. CUBICULA: Tiara Gótica, Antifaz de Encaje y Gargantilla de Sangre */}
              {character === CharacterType.CUBICULA && (
                <g>
                  {/* Tiara gótica de condesa */}
                  <polygon points="26,20 36,8 44,16 50,4 56,16 64,8 74,20" fill="#18181b" stroke="#991b1b" strokeWidth="1.5" />
                  <circle cx="50" cy="12" r="3.5" fill="#dc2626" stroke="#fff" strokeWidth="0.8" />
                  {/* Dainty fangs */}
                  <polygon points="40,62 43,72 46,62" fill="#ffffff" stroke="#000" strokeWidth="0.8" />
                  <polygon points="54,62 57,72 60,62" fill="#ffffff" stroke="#000" strokeWidth="0.8" />
                  {/* Velvet choker collar */}
                  <rect x="36" y="78" width="28" height="4" rx="1" fill="#7f1d1d" stroke="#000" strokeWidth="0.8" />
                  <circle cx="50" cy="80" r="2" fill="#ef4444" />
                </g>
              )}

              {/* 4. CUBOGRO: Colmillos Inferiores Gigantes, Aro en Nariz y Pintura de Guerra */}
              {character === CharacterType.CUBOGRO && (
                <g>
                  {/* Pintura de guerra roja */}
                  <polygon points="24,25 36,30 32,36" fill="#dc2626" />
                  <polygon points="76,25 64,30 68,36" fill="#dc2626" />
                  {/* Ceño de roca */}
                  <path d="M22 34 Q50 44 78 34" stroke="#09090b" strokeWidth="6" fill="none" strokeLinecap="round" />
                  {/* Aro en la nariz (Bull Nose Ring) */}
                  <circle cx="50" cy="54" r="6" fill="none" stroke="#d97706" strokeWidth="2.5" />
                  <circle cx="50" cy="54" r="6" fill="none" stroke="#fef08a" strokeWidth="1" strokeDasharray="4 8" />
                  {/* Colmillos de jabalí inferiores */}
                  <polygon points="28,72 35,46 42,72" fill="#fef08a" stroke="#000" strokeWidth="1.8" />
                  <polygon points="58,72 65,46 72,72" fill="#fef08a" stroke="#000" strokeWidth="1.8" />
                </g>
              )}

              {/* 5. GLADIACUBON: Penacho de Centurión Romano, Casco de Bronce y Cicatriz */}
              {character === CharacterType.GLADIACUBON && (
                <g>
                  {/* Cresta de plumas rojas altas (Penacho) */}
                  <path d="M42 2 C44 -6, 56 -6, 58 2 L56 22 L44 22 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="1.5" />
                  <line x1="45" y1="6" x2="55" y2="3" stroke="#f87171" strokeWidth="1.5" />
                  <line x1="45" y1="12" x2="55" y2="9" stroke="#f87171" strokeWidth="1.5" />
                  <line x1="45" y1="18" x2="55" y2="15" stroke="#f87171" strokeWidth="1.5" />
                  {/* Placa de bronce frontal del casco */}
                  <rect x="22" y="20" width="56" height="8" rx="2" fill="#b45309" stroke="#78350f" strokeWidth="1.2" />
                  <circle cx="50" cy="24" r="2.5" fill="#f59e0b" />
                  {/* Cicatriz de batalla cruzando el ojo */}
                  <line x1="62" y1="36" x2="70" y2="54" stroke="#991b1b" strokeWidth="3" strokeLinecap="round" />
                  <line x1="62" y1="36" x2="70" y2="54" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" />
                </g>
              )}

              {/* 6. CUBINJA: Bandana con Placa Metálica, Cintas al Viento y Máscara Ninja */}
              {character === CharacterType.CUBINJA && (
                <g>
                  {/* Cintas ondeando hacia la izquierda */}
                  <path d="M18 24 Q6 28 2 40 Q10 36 20 30 Z" fill="#18181b" stroke="#000" strokeWidth="1" />
                  <path d="M16 28 Q4 36 1 50 Q8 42 18 33 Z" fill="#27272a" stroke="#000" strokeWidth="1" />
                  {/* Cinta principal en la frente */}
                  <rect x="14" y="18" width="72" height="11" rx="2" fill="#18181b" stroke="#000" strokeWidth="1.5" />
                  {/* Placa metálica plateada con remaches */}
                  <rect x="34" y="19" width="32" height="9" rx="2" fill="#e4e4e7" stroke="#27272a" strokeWidth="1.2" />
                  <circle cx="50" cy="23.5" r="2.2" fill="#18181b" />
                  <circle cx="50" cy="23.5" r="1" fill="#e4e4e7" />
                  <circle cx="37" cy="23.5" r="0.8" fill="#71717a" />
                  <circle cx="63" cy="23.5" r="0.8" fill="#71717a" />
                  {/* Máscara inferior ninja */}
                  <path d="M20 54 Q50 68 80 54 L78 78 Q50 82 22 78 Z" fill="#18181b" stroke="#000" strokeWidth="1.5" />
                  <line x1="36" y1="64" x2="64" y2="64" stroke="#3f3f46" strokeWidth="1.5" />
                </g>
              )}

              {/* 7. FLAUCUBISTA DESAFINADO: Boina Parisina con Pluma + Flauta Travesera */}
              {character === CharacterType.FLAUCUBISTA_DESAFINADO && (
                <g>
                  {/* Boina parisina inclinada */}
                  <g transform="rotate(12 60 18)">
                    <ellipse cx="58" cy="18" width="34" rx="28" ry="9" fill="#0f766e" stroke="#042f2e" strokeWidth="1.5" />
                    <line x1="58" y1="9" x2="58" y2="4" stroke="#0f766e" strokeWidth="2" />
                    <polygon points="76,14 84,4 78,8" fill="#fbbf24" />
                  </g>
                  {/* Flauta travesera de madera cruzada */}
                  <rect x="18" y="60" width="56" height="7" rx="2" fill="#b45309" stroke="#451a03" strokeWidth="1.5" transform="rotate(-15 44 65)" />
                  <circle cx="30" cy="62" r="1.2" fill="#000" />
                  <circle cx="38" cy="60" r="1.2" fill="#000" />
                  <circle cx="46" cy="58" r="1.2" fill="#000" />
                  <circle cx="54" cy="56" r="1.2" fill="#000" />
                  {/* Notas musicales flotantes */}
                  <text x="74" y="52" fontSize="13" fill="#f59e0b" fontWeight="black" stroke="#000" strokeWidth="0.5">♪</text>
                  <text x="82" y="38" fontSize="15" fill="#fbbf24" fontWeight="black" stroke="#000" strokeWidth="0.5">♫</text>
                </g>
              )}

              {/* 8. TRAMCUBOSO: Sombrero Fedora con As de Picas ♠ + Gafas de Sol de Aviador + Palillo */}
              {character === CharacterType.TRAMCUBOSO && (
                <g>
                  {/* Sombrero fedora inclinado */}
                  <g transform="rotate(-6 50 16)">
                    <ellipse cx="50" cy="18" rx="38" ry="7" fill="#27272a" stroke="#09090b" strokeWidth="1.5" />
                    <path d="M28 17 Q24 2 36 -2 Q50 2 64 -2 Q76 2 72 17 Z" fill="#27272a" stroke="#09090b" strokeWidth="1.5" />
                    <rect x="28" y="14" width="44" height="4" fill="#f59e0b" />
                    {/* As de picas clavado en la cinta */}
                    <rect x="58" y="4" width="9" height="13" rx="1" fill="#fff" stroke="#000" strokeWidth="0.6" transform="rotate(14 62 10)" />
                    <text x="60" y="13" fontSize="8" fill="#000">♠</text>
                  </g>
                  {/* Gafas de aviador oscuras */}
                  <path d="M22 38 L45 38 L43 52 L25 52 Z" fill="#0a0a0c" stroke="#facc15" strokeWidth="1.8" />
                  <path d="M55 38 L78 38 L75 52 L57 52 Z" fill="#0a0a0c" stroke="#facc15" strokeWidth="1.8" />
                  <line x1="45" y1="42" x2="55" y2="42" stroke="#facc15" strokeWidth="2.2" />
                  {/* Reflejo en gafas */}
                  <line x1="26" y1="40" x2="33" y2="50" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
                  <line x1="59" y1="40" x2="66" y2="50" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
                  {/* Palillo de oro en la boca */}
                  <line x1="56" y1="64" x2="76" y2="58" stroke="#fef08a" strokeWidth="2.2" strokeLinecap="round" />
                  <circle cx="56" cy="64" r="1.5" fill="#facc15" />
                </g>
              )}

              {/* 9. CUBITO DE HIELO: Puntas de Hielo Glaciales y Dientes que Castañean */}
              {character === CharacterType.CUBITO_DE_HIELO && (
                <g>
                  {/* Puntas de hielo cristalinas en la parte superior */}
                  <polygon points="26,16 32,2 38,16" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.2" />
                  <polygon points="42,14 50, -2 58,14" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" />
                  <polygon points="62,16 68,4 74,16" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.2" />
                  {/* Brillo en puntas */}
                  <line x1="49" y1="2" x2="46" y2="12" stroke="#ffffff" strokeWidth="1" />
                  {/* Dientes de cubito de hielo */}
                  <rect x="38" y="62" width="6" height="6" fill="#e0f2fe" stroke="#0284c7" strokeWidth="0.8" />
                  <rect x="46" y="62" width="6" height="6" fill="#e0f2fe" stroke="#0284c7" strokeWidth="0.8" />
                  <rect x="54" y="62" width="6" height="6" fill="#e0f2fe" stroke="#0284c7" strokeWidth="0.8" />
                </g>
              )}

              {/* 10. PIRATA: Parche de Cuero con Calavera (☠), Sombrero Tricornio y Aro de Oro */}
              {character === CharacterType.PIRATA && (
                <g>
                  {/* Sombrero tricornio pirata */}
                  <path d="M16 22 Q32 10 50 18 Q68 10 84 22 Q50 12 16 22 Z" fill="#18181b" stroke="#09090b" strokeWidth="1.5" />
                  <path d="M22 21 Q50 13 78 21" stroke="#facc15" strokeWidth="1.2" fill="none" />
                  {/* Correa de parche */}
                  <line x1="18" y1="34" x2="52" y2="52" stroke="#000" strokeWidth="2.2" />
                  {/* Parche con calavera */}
                  <circle cx="36" cy="44" r="8" fill="#09090b" stroke="#27272a" strokeWidth="1.2" />
                  <text x="32.5" y="48" fontSize="9" fill="#ffffff">☠</text>
                  {/* Aro de oro grande */}
                  <circle cx="14" cy="50" r="5" fill="none" stroke="#facc15" strokeWidth="2.2" />
                  <circle cx="14" cy="50" r="5" fill="none" stroke="#fef08a" strokeWidth="0.8" strokeDasharray="3 4" />
                </g>
              )}

              {/* 11. CUBINARCA: Corona Dorada Real Enjoyada y Bigote Noble */}
              {character === CharacterType.CUBINARCA && (
                <g>
                  {/* Corona de 5 puntas afiladas */}
                  <polygon points="24,20 30,6 40,15 50,2 60,15 70,6 76,20" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
                  <rect x="23" y="18" width="54" height="6" rx="1" fill="#b45309" stroke="#78350f" strokeWidth="1" />
                  {/* Gemas enjoyadas */}
                  <circle cx="50" cy="12" r="3.2" fill="#ef4444" stroke="#fff" strokeWidth="0.6" />
                  <circle cx="35" cy="14" r="2.4" fill="#3b82f6" stroke="#fff" strokeWidth="0.5" />
                  <circle cx="65" cy="14" r="2.4" fill="#10b981" stroke="#fff" strokeWidth="0.5" />
                  <circle cx="50" cy="12" r="1" fill="#ffffff" />
                  {/* Bigote aristocrático */}
                  <path d="M34 58 Q45 54 50 60 Q55 54 66 58 Q72 52 70 62 Q50 68 30 62 Q28 52 34 58 Z" fill="#1c1917" stroke="#000" strokeWidth="1" />
                  <polygon points="47,64 50,70 53,64" fill="#1c1917" />
                </g>
              )}

              {/* 12. RACUBITERO: Auriculares DJ Rojos de Asfalto y Visera Urbana */}
              {character === CharacterType.RACUBITERO && (
                <g>
                  {/* Diadema superior de auriculares */}
                  <path d="M14 42 Q50 8 86 42" stroke="#18181b" strokeWidth="5" fill="none" />
                  {/* Visera urbana */}
                  <rect x="26" y="20" width="48" height="7" rx="2" fill="#1e3a8a" stroke="#000" strokeWidth="1.2" />
                  {/* Cascos DJ a los lados */}
                  <rect x="10" y="34" width="7" height="18" rx="3" fill="#dc2626" stroke="#000" strokeWidth="1.2" />
                  <rect x="83" y="34" width="7" height="18" rx="3" fill="#dc2626" stroke="#000" strokeWidth="1.2" />
                  <rect x="12" y="37" width="3" height="12" rx="1" fill="#18181b" />
                  <rect x="85" y="37" width="3" height="12" rx="1" fill="#18181b" />
                </g>
              )}

              {/* 13. CAMBIAFORMAS: Máscara Bicolor de Bufón Teatral con Cascabeles y Signo ? */}
              {character === CharacterType.CAMBIAFORMAS && (
                <g>
                  {/* Gorro de arlequín de 2 puntas con cascabeles */}
                  <path d="M50 18 Q30 0 22 14 Q32 10 50 18 Z" fill="#7e22ce" stroke="#000" strokeWidth="1.2" />
                  <circle cx="21" cy="14" r="3.5" fill="#facc15" stroke="#000" strokeWidth="0.8" />
                  <path d="M50 18 Q70 0 78 14 Q68 10 50 18 Z" fill="#0284c7" stroke="#000" strokeWidth="1.2" />
                  <circle cx="79" cy="14" r="3.5" fill="#facc15" stroke="#000" strokeWidth="0.8" />
                  {/* Línea divisoria teatral */}
                  <line x1="50" y1="20" x2="50" y2="76" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="3 3" />
                  {/* Signos de naipes en mejillas */}
                  <text x="26" y="56" fontSize="9" fill="#dc2626">♦</text>
                  <text x="70" y="56" fontSize="9" fill="#dc2626">♥</text>
                  {/* Signo de interrogación místico */}
                  <text x="47" y="14" fontSize="11" fill="#facc15" fontWeight="black" stroke="#000" strokeWidth="0.5">?</text>
                </g>
              )}
            </svg>
          )}
          </div>
        )}
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
