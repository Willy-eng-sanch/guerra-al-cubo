import React from 'react';
import { CharacterType } from '../types/game';
import { DiceCharacterSprite } from './DiceCharacterSprite';

interface Cube3DCanvasProps {
  character: CharacterType;
  teamId?: number; // 1 = Azul (Player), 2 = Rojo (Rival)
  teamColor?: 'blue' | 'red';
  size?: number;
  isAttacking?: boolean;
  isHit?: boolean;
  hasPreparedStance?: boolean;
  isFrozen?: boolean;
  isEliminated?: boolean;
  className?: string;
  diceValue?: number;
}

export const Cube3DCanvas: React.FC<Cube3DCanvasProps> = ({
  character,
  teamId,
  teamColor,
  size = 110,
  isAttacking = false,
  isHit = false,
  hasPreparedStance = false,
  isFrozen = false,
  isEliminated = false,
  className = "",
  diceValue
}) => {
  return (
    <DiceCharacterSprite
      character={character}
      teamId={teamId}
      teamColor={teamColor}
      size={size}
      isAttacking={isAttacking}
      isHit={isHit}
      hasPreparedStance={hasPreparedStance}
      isFrozen={isFrozen}
      isEliminated={isEliminated}
      className={className}
      diceValue={diceValue}
    />
  );
};
