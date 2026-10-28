import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sound } from '../audio/soundManager';
import { CHARACTERS } from '../data/characters';
import { PlayerState } from '../types/game';
import { Cube3DCanvas } from './Cube3DCanvas';
import './MatchIntroAnimation.css';

interface MatchIntroAnimationProps {
  players: PlayerState[];
  onComplete: () => void;
}

type IntroPhase = 'tossing' | 'shaking' | 'launching';

const TOSS_DURATION_MS = 680;
const TOSS_START_DELAY_MS = 60;
const LAUNCH_DURATION_MS = 1120;
const PHASE_STAGGER_MS = 55;
const SHAKING_START_MS = 1100;
const LAUNCH_START_MS = 2450;
const SHAKING_SOUND_INTERVAL_MS = 230;
const MAX_INTRO_CUBES = 6;

interface CharacterOffset {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

const sourcePoints = [
  [17, 20],
  [43, 9],
  [82, 19],
  [14, 78],
  [58, 91],
  [86, 76],
] as const;

export const MatchIntroAnimation: React.FC<MatchIntroAnimationProps> = ({ players, onComplete }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const [phase, setPhase] = useState<IntroPhase>('tossing');
  const [offsets, setOffsets] = useState<CharacterOffset[]>([]);

  onCompleteRef.current = onComplete;

  const completeIntro = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onCompleteRef.current();
  }, []);

  const teamSlots = useMemo(() => {
    const slots = new Map<number, number>();
    return players.map((player) => {
      const team = player.teamId ?? 1;
      const slot = slots.get(team) ?? 0;
      slots.set(team, slot + 1);
      return slot;
    });
  }, [players]);

  useEffect(() => {
    const node = overlayRef.current;
    if (!node) return;

    const updateOffsets = () => {
      const { width, height } = node.getBoundingClientRect();
      if (!width || !height) return;
      setOffsets(players.map((player, index) => {
        const [sourceX, sourceY] = sourcePoints[index % sourcePoints.length];
        const slot = teamSlots[index];
        const teamCount = players.filter((member) => (member.teamId ?? 1) === (player.teamId ?? 1)).length;
        const targetY = teamCount <= 1 ? 50 : [18, 50, 82][Math.min(slot, 2)];
        const targetX = player.teamId === 1 ? 19 : 81;
        return {
          fromX: (sourceX / 100 - 0.5) * width,
          fromY: (sourceY / 100 - 0.53) * height,
          toX: (targetX / 100 - 0.5) * width,
          toY: (targetY / 100 - 0.53) * height,
        };
      }));
    };

    updateOffsets();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateOffsets) : null;
    observer?.observe(node);
    window.addEventListener('resize', updateOffsets);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateOffsets);
    };
  }, [players, teamSlots]);

  useEffect(() => {
    const timers: number[] = [];
    completedRef.current = false;

    const scheduleSound = (delay: number, play: () => void) => {
      timers.push(window.setTimeout(play, delay));
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('launching');
      timers.push(window.setTimeout(completeIntro, 300));
      return () => timers.forEach(window.clearTimeout);
    }

    const introCubeCount = Math.min(players.length, MAX_INTRO_CUBES);
    for (let index = 0; index < introCubeCount; index++) {
      const stagger = index * PHASE_STAGGER_MS;
      scheduleSound(
        TOSS_START_DELAY_MS + stagger + TOSS_DURATION_MS,
        () => sound.playIntroCubeDrop(index),
      );
      scheduleSound(
        LAUNCH_START_MS + LAUNCH_DURATION_MS + stagger,
        () => sound.playIntroCubeLand(index),
      );
    }

    for (let shake = 0; shake < 6; shake++) {
      scheduleSound(
        SHAKING_START_MS + shake * SHAKING_SOUND_INTERVAL_MS,
        () => sound.playCupShake(),
      );
    }

    timers.push(window.setTimeout(() => setPhase('shaking'), SHAKING_START_MS));
    timers.push(window.setTimeout(() => setPhase('launching'), LAUNCH_START_MS));
    timers.push(window.setTimeout(completeIntro, 4075));
    return () => timers.forEach(window.clearTimeout);
  }, [completeIntro, players.length]);

  return (
    <div
      ref={overlayRef}
      className={`gc-intro gc-intro--${phase}`}
      role="region"
      aria-label="Introducción del combate"
    >
      <button
        type="button"
        className="gc-intro__skip"
        onClick={completeIntro}
        aria-label="Saltar la animación de inicio"
      >
        Saltar intro
      </button>
      <div className="gc-intro__scrim" />
      <div className={`gc-intro__cup ${phase === 'shaking' ? 'gc-intro__cup--shaking' : ''}`} aria-hidden="true">
        <div className="gc-intro__cup-rim" />
        <div className="gc-intro__cup-body">
          <span className="gc-intro__cup-mark">GC</span>
          <span className="gc-intro__cup-stitch" />
        </div>
        <div className="gc-intro__cup-foot" />
      </div>

      <div className="gc-intro__heading" aria-live="polite">
        <span className="gc-intro__eyebrow">Guerra Cubita</span>
        <strong>{phase === 'launching' ? '¡A la arena!' : phase === 'shaking' ? 'Agita y reparte' : 'Que ruede la suerte'}</strong>
        <span className="gc-intro__rule" />
      </div>

      {players.map((player, index) => {
        const offset = offsets[index];
        const character = player.activeMorphCharacter || player.characterType;
        const characterDef = CHARACTERS[character] || CHARACTERS[player.characterType];
        const teamOne = player.teamId === 1;
        const style = {
          '--from-x': `${offset?.fromX ?? 0}px`,
          '--from-y': `${offset?.fromY ?? 0}px`,
          '--to-x': `${offset?.toX ?? 0}px`,
          '--to-y': `${offset?.toY ?? 0}px`,
          '--flight-delay': `${index * 55}ms`,
          '--clay-color': characterDef?.primaryColor || '#d4952b',
          '--tilt': `${index % 2 === 0 ? -1 : 1}${14 + index * 3}deg`,
        } as React.CSSProperties;

        return (
          <div
            key={player.id}
            className={`gc-intro__character ${phase === 'shaking' ? 'gc-intro__character--packed' : ''} ${phase === 'launching' ? 'gc-intro__character--launched' : ''}`}
            style={style}
            aria-hidden="true"
          >
            <div className="gc-intro__character-art">
              <Cube3DCanvas
                character={character}
                teamId={player.teamId}
                size={phase === 'launching' ? 62 : 48}
                hasPreparedStance={!!player.preparedStance}
                isFrozen={player.isFrozen}
              />
              <span className={`gc-intro__name ${teamOne ? 'gc-intro__name--blue' : 'gc-intro__name--red'}`}>
                {player.name}
              </span>
            </div>
          </div>
        );
      })}

      <div className="gc-intro__team-cue gc-intro__team-cue--blue">AZUL</div>
      <div className="gc-intro__team-cue gc-intro__team-cue--red">ROJO</div>
    </div>
  );
};
