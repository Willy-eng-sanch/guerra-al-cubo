import React, { useEffect, useRef } from 'react';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let rollAngle = 0;

    const render = () => {
      if (isRolling) {
        rollAngle += 15;
      }

      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const r = size * 0.38;
      const currentVal = isRolling ? (Math.floor(rollAngle / 50) % 6) + 1 : value;

      const dx = r * 0.866;
      const dy = r * 0.5;

      const pCenter = { x: cx, y: cy };
      const pTop = { x: cx, y: cy - r };
      const pTopRight = { x: cx + dx, y: cy - dy };
      const pTopLeft = { x: cx - dx, y: cy - dy };
      const pBottom = { x: cx, y: cy + r };
      const pBottomRight = { x: cx + dx, y: cy + r - dy };
      const pBottomLeft = { x: cx - dx, y: cy + r - dy };

      // Top Face (Soft warm ivory clay, golden if 6)
      ctx.save();
      ctx.fillStyle = currentVal === 6 ? "#FFF3C4" : "#F5F0E6";
      ctx.beginPath();
      ctx.moveTo(pCenter.x, pCenter.y);
      ctx.lineTo(pTopRight.x, pTopRight.y);
      ctx.lineTo(pTop.x, pTop.y);
      ctx.lineTo(pTopLeft.x, pTopLeft.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = currentVal === 6 ? "#B45309" : "#4E342E";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Left Face (Main number face)
      ctx.fillStyle = currentVal === 6 ? "#FEF3C7" : "#EFEBE1";
      ctx.beginPath();
      ctx.moveTo(pCenter.x, pCenter.y);
      ctx.lineTo(pTopLeft.x, pTopLeft.y);
      ctx.lineTo(pBottomLeft.x, pBottomLeft.y);
      ctx.lineTo(pBottom.x, pBottom.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = currentVal === 6 ? "#B45309" : "#4E342E";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Right Face (Shaded clay)
      ctx.fillStyle = currentVal === 6 ? "#FDE68A" : "#DDD4C5";
      ctx.beginPath();
      ctx.moveTo(pCenter.x, pCenter.y);
      ctx.lineTo(pTopRight.x, pTopRight.y);
      ctx.lineTo(pBottomRight.x, pBottomRight.y);
      ctx.lineTo(pBottom.x, pBottom.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = currentVal === 6 ? "#92400E" : "#3E2723";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Indented Clay Pips on Left Face
      const pipRadius = r * 0.08;
      const faceX = (pCenter.x + pTopLeft.x) / 2;
      const faceY = (pCenter.y + pBottom.y) / 2 - r * 0.05;
      const pipColor = currentVal === 6 ? "#D97706" : currentVal === 5 ? "#D32F2F" : "#261C14";

      ctx.fillStyle = pipColor;

      const drawCircle = (x: number, y: number, rad: number) => {
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      };

      switch (currentVal) {
        case 1:
          drawCircle(faceX, faceY, pipRadius * 1.5);
          break;
        case 2:
          drawCircle(faceX - r * 0.18, faceY - r * 0.18, pipRadius);
          drawCircle(faceX + r * 0.18, faceY + r * 0.18, pipRadius);
          break;
        case 3:
          drawCircle(faceX - r * 0.2, faceY - r * 0.2, pipRadius);
          drawCircle(faceX, faceY, pipRadius);
          drawCircle(faceX + r * 0.2, faceY + r * 0.2, pipRadius);
          break;
        case 4:
          drawCircle(faceX - r * 0.2, faceY - r * 0.2, pipRadius);
          drawCircle(faceX + r * 0.15, faceY - r * 0.1, pipRadius);
          drawCircle(faceX - r * 0.15, faceY + r * 0.15, pipRadius);
          drawCircle(faceX + r * 0.2, faceY + r * 0.25, pipRadius);
          break;
        case 5:
          drawCircle(faceX - r * 0.2, faceY - r * 0.2, pipRadius);
          drawCircle(faceX + r * 0.15, faceY - r * 0.1, pipRadius);
          drawCircle(faceX, faceY, pipRadius * 1.35); // Big Red Center pip for 5
          drawCircle(faceX - r * 0.15, faceY + r * 0.15, pipRadius);
          drawCircle(faceX + r * 0.2, faceY + r * 0.25, pipRadius);
          break;
        case 6:
        default:
          // Special 6 Face: 6 pips + Special Center Star badge
          drawCircle(faceX - r * 0.18, faceY - r * 0.22, pipRadius * 0.9);
          drawCircle(faceX - r * 0.18, faceY, pipRadius * 0.9);
          drawCircle(faceX - r * 0.18, faceY + r * 0.22, pipRadius * 0.9);
          drawCircle(faceX + r * 0.18, faceY - r * 0.22, pipRadius * 0.9);
          drawCircle(faceX + r * 0.18, faceY, pipRadius * 0.9);
          drawCircle(faceX + r * 0.18, faceY + r * 0.22, pipRadius * 0.9);
          // Golden star in center
          ctx.fillStyle = "#F59E0B";
          ctx.font = `bold ${Math.max(10, Math.floor(size * 0.24))}px Fredoka, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("★", faceX, faceY);
          break;
      }

      ctx.restore();

      if (isRolling) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [value, isRolling, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`inline-block ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
};
