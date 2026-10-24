import React, { useEffect, useRef } from 'react';
import { CharacterType } from '../types/game';
import { CHARACTERS } from '../data/characters';

const imageCache = new Map<string, HTMLImageElement>();

function getModelImage(src: string): HTMLImageElement {
  if (imageCache.has(src)) {
    return imageCache.get(src)!;
  }
  const img = new Image();
  img.src = src;
  imageCache.set(src, img);
  return img;
}

interface Cube3DCanvasProps {
  character: CharacterType;
  size?: number;
  isAttacking?: boolean;
  isHit?: boolean;
  hasPreparedStance?: boolean;
  isFrozen?: boolean;
  className?: string;
}

export const Cube3DCanvas: React.FC<Cube3DCanvasProps> = ({
  character,
  size = 110,
  isAttacking = false,
  isHit = false,
  hasPreparedStance = false,
  isFrozen = false,
  className = ""
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let startTime: number | null = null;

    const charDef = CHARACTERS[character] || CHARACTERS[CharacterType.TRAMCUBOSO];
    const baseColor = isFrozen ? "#80DEEA" : charDef.primaryColor;
    const accentColor = isFrozen ? "#E0F7FA" : charDef.secondaryColor;

    const wobbleArr = [-1.5, 0.5, 2.0, -0.5];
    const breathArr = [0.98, 1.01, 1.0];

    const render = (time: number) => {
      if (startTime === null) {
        startTime = time;
      }
      const elapsed = Math.max(0, (time - startTime) / 1000);
      // 12 FPS stop-motion feel
      const stepFrame = Math.max(0, Math.floor(elapsed * 12));
      const clayWobble = wobbleArr[stepFrame % wobbleArr.length] ?? 0;
      const breathScale = breathArr[stepFrame % breathArr.length] ?? 1.0;

      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const groundY = size * 0.90;
      const cy = size * 0.44 + (isAttacking ? -12 : clayWobble);
      const cubeRadius = Math.max(1, size * 0.28 * breathScale);

      // 1. Soft Clay Ground Shadow
      ctx.save();
      const shadowRadius = Math.max(4, cubeRadius * 1.5);
      const shadowGrad = ctx.createRadialGradient(cx, groundY, 2, cx, groundY, shadowRadius);
      shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.55)");
      shadowGrad.addColorStop(0.6, "rgba(0, 0, 0, 0.25)");
      shadowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(cx, groundY, cubeRadius * 1.3, cubeRadius * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Prepared Stance Neon Ring
      if (hasPreparedStance) {
        ctx.save();
        ctx.strokeStyle = "#00E5FF";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#00E5FF";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(cx, groundY, cubeRadius * 1.4, cubeRadius * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 3. High-Fidelity 3D Textured Model Render (if available)
      if (charDef.model3dImage) {
        const modelImg = getModelImage(charDef.model3dImage);
        if (modelImg.complete && modelImg.naturalWidth > 0) {
          // Center textured 3D model
          const sx = modelImg.naturalWidth * 0.315;
          const sw = modelImg.naturalWidth * 0.37;
          const sy = 0;
          const sh = modelImg.naturalHeight;

          const renderSize = size * 0.95;
          const dx = cx - renderSize / 2;
          const dy = cy - renderSize * 0.52;

          ctx.save();
          if (isHit) {
            ctx.filter = "brightness(1.6) saturate(0.4)";
          } else if (isFrozen) {
            ctx.filter = "hue-rotate(180deg) brightness(1.2)";
          }
          ctx.drawImage(modelImg, sx, sy, sw, sh, dx, dy, renderSize, renderSize);
          ctx.restore();

          animId = requestAnimationFrame(render);
          return;
        }
      }

      // 4. Fallback Spindly Clay Legs & Boots (Procedural Cube)
      const legColor = "#D4952B";
      const bootColor = "#3E2723";
      const leftLegX = cx - cubeRadius * 0.45;
      const rightLegX = cx + cubeRadius * 0.35;
      const legStartY = cy + cubeRadius * 0.85;

      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = legColor;
      ctx.lineCap = 'round';

      // Left leg & boot
      ctx.beginPath();
      ctx.moveTo(leftLegX, legStartY);
      ctx.lineTo(leftLegX - 3, groundY - 4);
      ctx.stroke();

      ctx.fillStyle = bootColor;
      ctx.beginPath();
      ctx.ellipse(leftLegX - 4, groundY - 4, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Right leg & boot
      ctx.beginPath();
      ctx.moveTo(rightLegX, legStartY);
      ctx.lineTo(rightLegX + 4, groundY - 4);
      ctx.stroke();

      ctx.fillStyle = bootColor;
      ctx.beginPath();
      ctx.ellipse(rightLegX + 4, groundY - 4, 5.5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 4. Isometric Clay Cube Body
      const isoDx = cubeRadius * 0.866;
      const isoDy = cubeRadius * 0.5;
      const height = cubeRadius * 1.05;

      const pCenter = { x: cx, y: cy };
      const pTop = { x: cx, y: cy - cubeRadius };
      const pTopRight = { x: cx + isoDx, y: cy - isoDy };
      const pTopLeft = { x: cx - isoDx, y: cy - isoDy };
      const pBottom = { x: cx, y: cy + height };
      const pBottomRight = { x: cx + isoDx, y: cy + height - isoDy };
      const pBottomLeft = { x: cx - isoDx, y: cy + height - isoDy };

      // Top Face
      ctx.save();
      ctx.fillStyle = isHit ? "#ffffff" : baseColor;
      ctx.filter = isHit ? "none" : "brightness(1.2)";
      ctx.beginPath();
      ctx.moveTo(pCenter.x, pCenter.y);
      ctx.lineTo(pTopRight.x, pTopRight.y);
      ctx.lineTo(pTop.x, pTop.y);
      ctx.lineTo(pTopLeft.x, pTopLeft.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Left Face
      ctx.save();
      ctx.fillStyle = isHit ? "#FF5252" : baseColor;
      ctx.beginPath();
      ctx.moveTo(pCenter.x, pCenter.y);
      ctx.lineTo(pTopLeft.x, pTopLeft.y);
      ctx.lineTo(pBottomLeft.x, pBottomLeft.y);
      ctx.lineTo(pBottom.x, pBottom.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Right Face
      ctx.save();
      ctx.fillStyle = isHit ? "#B71C1C" : baseColor;
      ctx.filter = isHit ? "none" : "brightness(0.65)";
      ctx.beginPath();
      ctx.moveTo(pCenter.x, pCenter.y);
      ctx.lineTo(pTopRight.x, pTopRight.y);
      ctx.lineTo(pBottomRight.x, pBottomRight.y);
      ctx.lineTo(pBottom.x, pBottom.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // 5. Patched Burlap Yellow Coat around lower half
      const coatY = pCenter.y + cubeRadius * 0.45;
      ctx.save();
      ctx.fillStyle = "#D4952B";
      ctx.beginPath();
      ctx.moveTo(pBottomLeft.x - 2, coatY);
      ctx.lineTo(pCenter.x, coatY + cubeRadius * 0.15);
      ctx.lineTo(pBottomRight.x + 2, coatY);
      ctx.lineTo(pBottomRight.x, pBottomRight.y + 3);
      ctx.lineTo(pBottom.x, pBottom.y + 4);
      ctx.lineTo(pBottomLeft.x, pBottomLeft.y + 3);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Leather Patch
      const patchX = pCenter.x - cubeRadius * 0.42;
      const patchY = coatY + cubeRadius * 0.2;
      ctx.fillStyle = "#8D6E63";
      ctx.fillRect(patchX, patchY, cubeRadius * 0.28, cubeRadius * 0.24);
      ctx.strokeStyle = "#261C14";
      ctx.lineWidth = 1;
      ctx.strokeRect(patchX, patchY, cubeRadius * 0.28, cubeRadius * 0.24);

      // Buttons
      ctx.fillStyle = "#3E2723";
      ctx.beginPath();
      ctx.arc(pCenter.x - cubeRadius * 0.05, coatY + cubeRadius * 0.18, 2, 0, Math.PI * 2);
      ctx.arc(pCenter.x - cubeRadius * 0.05, coatY + cubeRadius * 0.35, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 6. Sculpted Clay Eyes and Face
      const faceCenterX = (pCenter.x + pTopLeft.x) / 2 + cubeRadius * 0.06;
      const faceCenterY = (pCenter.y + pTopLeft.y) / 2 + cubeRadius * 0.28;
      const eyeRadius = cubeRadius * 0.16;

      const leftSocketX = faceCenterX - eyeRadius * 1.1;
      const rightSocketX = faceCenterX + eyeRadius * 0.9;
      const socketY = faceCenterY - eyeRadius * 0.1;

      // Dark sunken eye sockets
      ctx.save();
      ctx.fillStyle = "rgba(38, 28, 20, 0.45)";
      ctx.beginPath();
      ctx.ellipse(leftSocketX, socketY, eyeRadius * 1.1, eyeRadius * 0.9, 0, 0, Math.PI * 2);
      ctx.ellipse(rightSocketX, socketY, eyeRadius * 1.0, eyeRadius * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();

      // Off-white eyeballs
      ctx.fillStyle = "#EFEBE9";
      ctx.beginPath();
      ctx.arc(leftSocketX, socketY, eyeRadius, 0, Math.PI * 2);
      ctx.arc(rightSocketX, socketY, eyeRadius * 0.95, 0, Math.PI * 2);
      ctx.fill();

      // Dark pupils
      ctx.fillStyle = "#1F1B18";
      ctx.beginPath();
      ctx.arc(leftSocketX + 1, socketY, eyeRadius * 0.45, 0, Math.PI * 2);
      ctx.arc(rightSocketX - 1, socketY, eyeRadius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Clay eyelids
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      ctx.arc(leftSocketX, socketY, eyeRadius, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(rightSocketX, socketY, eyeRadius * 0.95, Math.PI, 0);
      ctx.fill();

      // Bushy eyebrows
      ctx.strokeStyle = "#261C14";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(leftSocketX - eyeRadius * 1.1, socketY - eyeRadius * 1.1);
      ctx.lineTo(leftSocketX + eyeRadius * 0.8, socketY - eyeRadius * 0.9);
      ctx.moveTo(rightSocketX - eyeRadius * 0.8, socketY - eyeRadius * 0.9);
      ctx.lineTo(rightSocketX + eyeRadius * 1.1, socketY - eyeRadius * 1.1);
      ctx.stroke();

      // Sculpted clay nose
      ctx.fillStyle = "#8D6E63";
      ctx.beginPath();
      ctx.moveTo(faceCenterX - 1, socketY + eyeRadius * 0.2);
      ctx.lineTo(faceCenterX - 4, socketY + eyeRadius * 1.3);
      ctx.lineTo(faceCenterX + 3, socketY + eyeRadius * 1.2);
      ctx.closePath();
      ctx.fill();

      // Mouth
      ctx.strokeStyle = "#261C14";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(faceCenterX - eyeRadius * 0.6, socketY + eyeRadius * 1.7);
      ctx.lineTo(faceCenterX + eyeRadius * 0.7, socketY + eyeRadius * 1.6);
      ctx.stroke();
      ctx.restore();

      // Character-specific headgear
      if (character === CharacterType.CUBINJA) {
        // Ninja Red Bandana
        ctx.save();
        ctx.strokeStyle = "#B71C1C";
        ctx.lineWidth = cubeRadius * 0.22;
        ctx.beginPath();
        ctx.moveTo(pTopLeft.x, socketY - eyeRadius * 0.9);
        ctx.lineTo(pCenter.x, socketY - eyeRadius * 0.9 + cubeRadius * 0.12);
        ctx.stroke();
        ctx.restore();
      } else if (character === CharacterType.CUBINARCA) {
        // Golden Mafia Crown
        ctx.save();
        ctx.fillStyle = "#FFD54F";
        ctx.beginPath();
        ctx.moveTo(pTop.x - cubeRadius * 0.35, pTop.y);
        ctx.lineTo(pTop.x - cubeRadius * 0.45, pTop.y - cubeRadius * 0.35);
        ctx.lineTo(pTop.x - cubeRadius * 0.18, pTop.y - cubeRadius * 0.18);
        ctx.lineTo(pTop.x, pTop.y - cubeRadius * 0.42);
        ctx.lineTo(pTop.x + cubeRadius * 0.18, pTop.y - cubeRadius * 0.18);
        ctx.lineTo(pTop.x + cubeRadius * 0.45, pTop.y - cubeRadius * 0.35);
        ctx.lineTo(pTop.x + cubeRadius * 0.35, pTop.y);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else if (
        character === CharacterType.FLAUCUBISTA_DESAFINADO ||
        character === CharacterType.TRAMCUBOSO ||
        character === CharacterType.CUBICULA
      ) {
        // Crooked miniature Top Hat
        const hatBaseX = pTop.x - cubeRadius * 0.05;
        const hatBaseY = pTop.y - cubeRadius * 0.15;
        ctx.save();
        ctx.fillStyle = "#2E2724";
        ctx.beginPath();
        ctx.moveTo(hatBaseX - cubeRadius * 0.28, hatBaseY + 3);
        ctx.lineTo(hatBaseX + cubeRadius * 0.28, hatBaseY + 1);
        ctx.lineTo(hatBaseX + cubeRadius * 0.22, hatBaseY - cubeRadius * 0.45);
        ctx.lineTo(hatBaseX - cubeRadius * 0.20, hatBaseY - cubeRadius * 0.43);
        ctx.closePath();
        ctx.fill();
        // Red band
        ctx.strokeStyle = "#B71C1C";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(hatBaseX - cubeRadius * 0.25, hatBaseY - 2);
        ctx.lineTo(hatBaseX + cubeRadius * 0.25, hatBaseY - 4);
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [character, size, isAttacking, isHit, hasPreparedStance, isFrozen]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`block select-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
};
