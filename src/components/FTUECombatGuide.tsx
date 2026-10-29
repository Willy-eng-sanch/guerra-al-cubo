import React, { useState, useEffect } from 'react';
import { MatchPhase } from '../types/game';
import { Sparkles, X, ChevronRight, HelpCircle, Check } from 'lucide-react';

interface FTUECombatGuideProps {
  phase: MatchPhase;
  isHumanTurn: boolean;
  hasSelectedTarget: boolean;
  round: number;
}

export const FTUECombatGuide: React.FC<FTUECombatGuideProps> = ({
  phase,
  isHumanTurn,
  hasSelectedTarget,
  round
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('gc_ftue_guide_dismissed') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  if (isDismissed || round > 3) return null;

  const handleDismissPermanently = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem('gc_ftue_guide_dismissed', 'true');
    } catch (e) {}
  };

  const getStepAdvice = () => {
    if (!isHumanTurn) {
      return {
        step: 'TURNO RIVAL',
        title: 'Atento a la jugada rival',
        desc: 'El contrincante está lanzando sus dados o jugando cartas. Prepárate para el bloqueo táctico.',
        accentColor: 'text-neutral-400',
        badgeBg: 'bg-neutral-800'
      };
    }

    if (phase === MatchPhase.ROLLING_ATTACK || phase === MatchPhase.DEFENDER_ROLLING || phase === MatchPhase.RESOLVING) {
      return {
        step: 'COMBATE ACTIVO',
        title: '¡Refriega en el Centro!',
        desc: 'Los dados colisionan en la mesa con nube de combate de caricatura y choque de valores D6.',
        accentColor: 'text-amber-400',
        badgeBg: 'bg-amber-400/20 text-amber-300'
      };
    }

    if (phase === MatchPhase.SELECTING_TARGET_ATTACK || phase === MatchPhase.SELECTING_TARGET_ABILITY || phase === MatchPhase.SELECTING_TARGET_CARD || !hasSelectedTarget) {
      return {
        step: 'PASO 1 DE 2',
        title: 'Selecciona un Dado Rival',
        desc: 'Toca uno de los dados rojos en la arena para marcarlo como objetivo de tu ataque o habilidad.',
        accentColor: 'text-cyan-400',
        badgeBg: 'bg-cyan-400/20 text-cyan-300'
      };
    }

    return {
      step: 'PASO 2 DE 2',
      title: '¡Ataca o Juega Cartas!',
      desc: 'Toca el botón amarillo "ATACAR" para lanzar tus dados D6, o activa una carta o truco de tu mano.',
      accentColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-400/20 text-emerald-300'
    };
  };

  const advice = getStepAdvice();

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-3 left-3 z-40 px-3 py-1.5 bg-[#141924]/90 hover:bg-[#1e2638] border border-yellow-400/60 rounded-xl text-yellow-300 text-xs font-bold shadow-xl flex items-center gap-1.5 backdrop-blur-md cursor-pointer animate-pulse"
      >
        <HelpCircle className="w-3.5 h-3.5 text-yellow-400" />
        <span>Guía de Turno</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-40 animate-slideUp select-none pointer-events-auto">
      <div className="bg-[#10141d]/95 border-2 border-yellow-400/80 rounded-2xl p-3 shadow-[0_0_25px_rgba(0,0,0,0.8)] backdrop-blur-md text-white">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-current ${advice.badgeBg}`}>
              {advice.step}
            </span>
            <span className={`text-xs font-black font-bungee ${advice.accentColor}`}>
              {advice.title}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="text-[10px] text-neutral-400 hover:text-white px-1.5 py-0.5 rounded bg-black/40 hover:bg-black/60 transition-colors"
              title="Minimizar guía"
            >
              Minimizar
            </button>
            <button
              onClick={handleDismissPermanently}
              className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
              title="Ya sé jugar, no mostrar más"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-[11px] text-neutral-300 leading-snug">
          {advice.desc}
        </p>
      </div>
    </div>
  );
};
