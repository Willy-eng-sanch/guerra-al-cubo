import React from 'react';
import { Dice3DVisual } from './Dice3DVisual';

interface DiceD5CanvasProps {
  value: number;
  isRolling?: boolean;
  size?: number;
  className?: string;
}

export const DiceD5Canvas: React.FC<DiceD5CanvasProps> = ({
  value,
  isRolling = false,
  size = 68,
  className = ""
}) => {
  return (
    <Dice3DVisual
      value={value}
      isRolling={isRolling}
      size={size}
      className={className}
    />
  );
};
