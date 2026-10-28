import { CharacterType } from '../types/game';

export interface CharacterOverlayOptions {
  character: CharacterType;
  isBlueTeam?: boolean;
  isHit?: boolean;
  isAttacking?: boolean;
  isFrozen?: boolean;
  diceValue?: number;
}

/**
 * Draws the character's facial features and distinctive accessories
 * onto a 2D canvas (512x512) with transparent or papercraft background.
 */
export function drawCharacterSpriteOverlay(
  ctx: CanvasRenderingContext2D,
  options: CharacterOverlayOptions,
  width: number = 512,
  height: number = 512
): void {
  const { character, isBlueTeam = true, isHit = false, isAttacking = false, isFrozen = false } = options;
  const cx = width / 2;
  const cy = height / 2;

  ctx.save();

  // ---------------------------------------------------------------------------
  // 1. BASE FACIAL EXPRESSIONS (EYES, BROWS, MOUTH)
  // ---------------------------------------------------------------------------
  if (isHit) {
    // KNOCKED OUT / HIT: Big comic cross X eyes & dizzy grimace
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    // Left eye X
    ctx.beginPath();
    ctx.moveTo(cx - 100, cy - 40); ctx.lineTo(cx - 30, cy + 30);
    ctx.moveTo(cx - 30, cy - 40); ctx.lineTo(cx - 100, cy + 30);
    ctx.stroke();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Right eye X
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(cx + 30, cy - 40); ctx.lineTo(cx + 100, cy + 30);
    ctx.moveTo(cx + 100, cy - 40); ctx.lineTo(cx + 30, cy + 30);
    ctx.stroke();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Dizzy wavy mouth
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(cx - 70, cy + 100);
    ctx.quadraticCurveTo(cx - 30, cy + 70, cx, cy + 100);
    ctx.quadraticCurveTo(cx + 30, cy + 130, cx + 70, cy + 100);
    ctx.stroke();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.stroke();
  } else if (isAttacking) {
    // AGGRESSIVE ATTACKING: Fierce slanted brows & fiery anime focus
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#000000';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 130, cy - 60); ctx.lineTo(cx - 20, cy - 25);
    ctx.moveTo(cx + 130, cy - 60); ctx.lineTo(cx + 20, cy - 25);
    ctx.stroke();
    ctx.strokeStyle = isBlueTeam ? '#38bdf8' : '#f87171';
    ctx.lineWidth = 7;
    ctx.stroke();

    // Sclera
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(cx - 75, cy - 5, 36, 28, -0.2, 0, Math.PI * 2);
    ctx.ellipse(cx + 75, cy - 5, 36, 28, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Irises
    ctx.fillStyle = isBlueTeam ? '#0284c7' : '#dc2626';
    ctx.beginPath();
    ctx.arc(cx - 65, cy - 5, 18, 0, Math.PI * 2);
    ctx.arc(cx + 65, cy - 5, 18, 0, Math.PI * 2);
    ctx.fill();
    // Inner black pupils
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cx - 65, cy - 5, 10, 0, Math.PI * 2);
    ctx.arc(cx + 65, cy - 5, 10, 0, Math.PI * 2);
    ctx.fill();

    // Open roaring mouth
    ctx.fillStyle = '#1e1b2e';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 95, 75, 45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    // NORMAL EXPRESSIVE STREETWISE EYES
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(cx - 75, cy - 10, 38, 50, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 75, cy - 10, 38, 50, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pupils
    ctx.fillStyle = '#0a0a0c';
    ctx.beginPath();
    ctx.arc(cx - 70, cy - 10, 22, 0, Math.PI * 2);
    ctx.arc(cx + 70, cy - 10, 22, 0, Math.PI * 2);
    ctx.fill();

    // Specular eye shine
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - 78, cy - 20, 8, 0, Math.PI * 2);
    ctx.arc(cx + 62, cy - 20, 8, 0, Math.PI * 2);
    ctx.arc(cx - 64, cy - 2, 4, 0, Math.PI * 2);
    ctx.arc(cx + 76, cy - 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Smirk mouth
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 55, cy + 95);
    ctx.quadraticCurveTo(cx, cy + 125, cx + 65, cy + 85);
    ctx.stroke();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  // ---------------------------------------------------------------------------
  // 2. CHARACTER-SPECIFIC ACCESSORIES & HEADWEAR (INSTANT SILHOUETTE RECOGNITION)
  // ---------------------------------------------------------------------------
  switch (character) {
    case CharacterType.CUBINJA: {
      // 1. CUBINJA: Shinobi Forehead Bandana with Metal Plate & Cloth Mask
      // Fluttering tails at the rear-left
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 180, cy - 130);
      ctx.quadraticCurveTo(cx - 240, cy - 100, cx - 250, cy - 40);
      ctx.quadraticCurveTo(cx - 200, cy - 70, cx - 170, cy - 110);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 175, cy - 115);
      ctx.quadraticCurveTo(cx - 250, cy - 60, cx - 230, cy + 20);
      ctx.quadraticCurveTo(cx - 190, cy - 20, cx - 165, cy - 95);
      ctx.fill();
      ctx.stroke();

      // Black forehead band
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(cx - 190, cy - 165, 380, 65, 8);
      ctx.fill();
      ctx.stroke();

      // Silver metal protector plate with rivets
      ctx.fillStyle = '#e4e4e7';
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(cx - 95, cy - 158, 190, 50, 8);
      ctx.fill();
      ctx.stroke();

      // Engraved Ninja Shuriken Insignia on plate
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(cx, cy - 133, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e4e4e7';
      ctx.beginPath();
      ctx.arc(cx, cy - 133, 5, 0, Math.PI * 2);
      ctx.fill();

      // Corner rivets on metal plate
      ctx.fillStyle = '#71717a';
      ctx.beginPath();
      ctx.arc(cx - 82, cy - 146, 3, 0, Math.PI * 2);
      ctx.arc(cx + 82, cy - 146, 3, 0, Math.PI * 2);
      ctx.arc(cx - 82, cy - 120, 3, 0, Math.PI * 2);
      ctx.arc(cx + 82, cy - 120, 3, 0, Math.PI * 2);
      ctx.fill();

      // Black lower face ninja mask
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - 150, cy + 50);
      ctx.quadraticCurveTo(cx, cy + 105, cx + 150, cy + 50);
      ctx.lineTo(cx + 140, cy + 180);
      ctx.quadraticCurveTo(cx, cy + 205, cx - 140, cy + 180);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Mask fold lines
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 80, cy + 100); ctx.lineTo(cx, cy + 120); ctx.lineTo(cx + 80, cy + 100);
      ctx.moveTo(cx - 60, cy + 135); ctx.lineTo(cx, cy + 150); ctx.lineTo(cx + 60, cy + 135);
      ctx.stroke();
      break;
    }

    case CharacterType.TRAMCUBOSO: {
      // 2. TRAMCUBOSO: Fedora Hat + Ace of Spades + Aviator Sunglasses + Gold Toothpick
      // Fedora Brim
      ctx.fillStyle = '#27272a';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 6;
      ctx.save();
      ctx.translate(cx, cy - 140);
      ctx.rotate(-0.08);

      // Hat brim ellipse
      ctx.beginPath();
      ctx.ellipse(0, 0, 220, 42, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Hat crown
      ctx.beginPath();
      ctx.moveTo(-120, 0);
      ctx.quadraticCurveTo(-140, -85, -80, -115);
      ctx.quadraticCurveTo(0, -95, 80, -115);
      ctx.quadraticCurveTo(140, -85, 120, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Hat Gold/Crimson Ribbon
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(-120, -5); ctx.lineTo(-115, -25);
      ctx.quadraticCurveTo(0, -20, 115, -25); ctx.lineTo(120, -5);
      ctx.closePath();
      ctx.fill();

      // Ace of Spades Card tucked in the ribbon
      ctx.save();
      ctx.translate(75, -55);
      ctx.rotate(0.3);
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.roundRect(-22, -35, 44, 70, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#000000';
      ctx.font = '900 16px sans-serif';
      ctx.fillText('A', -16, -18);
      ctx.font = '22px sans-serif';
      ctx.fillText('♠', 0, 10);
      ctx.restore();

      ctx.restore();

      // Dark Aviator Sunglasses over the eyes
      ctx.fillStyle = 'rgba(15, 15, 18, 0.95)';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(cx - 150, cy - 50, 130, 80, 22);
      ctx.roundRect(cx + 20, cy - 50, 130, 80, 22);
      ctx.fill();
      ctx.stroke();

      // Bridge connection
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy - 25);
      ctx.lineTo(cx + 20, cy - 25);
      ctx.stroke();

      // White glass specular reflection on lenses
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - 130, cy - 35); ctx.lineTo(cx - 95, cy + 15);
      ctx.moveTo(cx + 40, cy - 35); ctx.lineTo(cx + 75, cy + 15);
      ctx.stroke();

      // Smug smile with gold tooth & toothpick
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(cx - 40, cy + 90);
      ctx.quadraticCurveTo(cx + 20, cy + 130, cx + 80, cy + 80);
      ctx.stroke();

      // Gold tooth
      ctx.fillStyle = '#facc15';
      ctx.fillRect(cx + 15, cy + 92, 16, 14);

      // Gold toothpick
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx + 35, cy + 98); ctx.lineTo(cx + 120, cy + 70);
      ctx.stroke();
      break;
    }

    case CharacterType.CUBOGRO: {
      // 3. CUBOGRO: Giant Ivory Tusks, Bull Nose Ring & Stone War Paint
      // War Paint Lines across brow
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(cx - 140, cy - 80); ctx.lineTo(cx - 60, cy - 70); ctx.lineTo(cx - 80, cy - 50);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 140, cy - 80); ctx.lineTo(cx + 60, cy - 70); ctx.lineTo(cx + 80, cy - 50);
      ctx.fill();

      // Heavy monobrow
      ctx.strokeStyle = '#1c1917';
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 140, cy - 70);
      ctx.quadraticCurveTo(cx, cy - 30, cx + 140, cy - 70);
      ctx.stroke();

      // Golden/Bronze Bull Septum Nose Ring
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.arc(cx, cy + 45, 26, 0.2, Math.PI - 0.2);
      ctx.stroke();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy + 45, 26, 0.4, 1.2);
      ctx.stroke();

      // Giant Lower Jaw Tusks (Ivory) pointing up past eyes
      const drawTusk = (x: number, isLeft: boolean) => {
        ctx.fillStyle = '#fef08a';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x - 22, cy + 120);
        ctx.quadraticCurveTo(x + (isLeft ? -45 : 45), cy + 10, x + (isLeft ? -30 : 30), cy - 40);
        ctx.quadraticCurveTo(x + (isLeft ? -10 : 10), cy + 40, x + 22, cy + 120);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      };
      drawTusk(cx - 80, true);
      drawTusk(cx + 80, false);
      break;
    }

    case CharacterType.HADA_AL_CUBO: {
      // 4. HADA AL CUBO: Translucent Butterfly Wings, Floral Tiara & Magic Star Wand
      // Floral Garland Crown
      const flowers = [
        { x: cx - 110, y: cy - 145, color: '#f472b6' },
        { x: cx - 55, y: cy - 165, color: '#38bdf8' },
        { x: cx, y: cy - 175, color: '#facc15' },
        { x: cx + 55, y: cy - 165, color: '#c084fc' },
        { x: cx + 110, y: cy - 145, color: '#f472b6' }
      ];
      flowers.forEach(f => {
        ctx.fillStyle = f.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(f.x, f.y, 7, 0, Math.PI * 2);
        ctx.fill();
      });

      // Magic Fairy Wand with Glowing 5-point Star
      ctx.save();
      ctx.translate(cx + 125, cy + 30);
      ctx.rotate(-0.35);

      // Wand handle
      ctx.fillStyle = '#b45309';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(-8, -40, 16, 170, 8);
      ctx.fill();
      ctx.stroke();

      // Golden Star tip
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 5;
      ctx.beginPath();
      const points = 5;
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? 46 : 20;
        const a = (i * Math.PI) / points - Math.PI / 2;
        const sx = Math.cos(a) * r;
        const sy = -40 + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Magic sparkles around star
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -40, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Sparkles on cheeks
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.ellipse(cx - 85, cy + 40, 18, 10, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 85, cy + 40, 18, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case CharacterType.CUBINARCA: {
      // 5. CUBINARCA: 5-Spike Jeweled Crown, Imperial Handlebar Mustache & Goatee
      // Royal 5-spike Golden Crown
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx - 150, cy - 120);
      ctx.lineTo(cx - 130, cy - 200);
      ctx.lineTo(cx - 65, cy - 145);
      ctx.lineTo(cx, cy - 225);
      ctx.lineTo(cx + 65, cy - 145);
      ctx.lineTo(cx + 130, cy - 200);
      ctx.lineTo(cx + 150, cy - 120);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Crown base band
      ctx.fillStyle = '#b45309';
      ctx.fillRect(cx - 150, cy - 130, 300, 22);

      // Embedded Gems
      const gems = [
        { x: cx - 130, y: cy - 175, color: '#ef4444' }, // Ruby
        { x: cx - 65, y: cy - 130, color: '#3b82f6' },  // Sapphire
        { x: cx, y: cy - 190, color: '#ef4444' },       // Center Big Ruby
        { x: cx + 65, y: cy - 130, color: '#10b981' },  // Emerald
        { x: cx + 130, y: cy - 175, color: '#3b82f6' }  // Sapphire
      ];
      gems.forEach(g => {
        ctx.fillStyle = g.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(g.x, g.y, g.x === cx ? 14 : 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // Handlebar Mustache
      ctx.fillStyle = '#1c1917';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 95, cy + 60);
      ctx.quadraticCurveTo(cx - 50, cy + 50, cx, cy + 75);
      ctx.quadraticCurveTo(cx + 50, cy + 50, cx + 95, cy + 60);
      ctx.quadraticCurveTo(cx + 115, cy + 40, cx + 110, cy + 75);
      ctx.quadraticCurveTo(cx + 50, cy + 105, cx, cy + 85);
      ctx.quadraticCurveTo(cx - 50, cy + 105, cx - 110, cy + 75);
      ctx.quadraticCurveTo(cx - 115, cy + 40, cx - 95, cy + 60);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Goatee
      ctx.beginPath();
      ctx.moveTo(cx - 16, cy + 105); ctx.lineTo(cx, cy + 145); ctx.lineTo(cx + 16, cy + 105);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case CharacterType.GLADIACUBON: {
      // 6. GLADIACUBON: Roman Centurion Helmet Plume & Battle Scar
      // Tall crimson feathered crest plume
      ctx.fillStyle = '#dc2626';
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - 35, cy - 130);
      ctx.quadraticCurveTo(cx - 45, cy - 235, cx, cy - 245);
      ctx.quadraticCurveTo(cx + 45, cy - 235, cx + 35, cy - 130);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Feather striations
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 3;
      for (let y = cy - 220; y < cy - 130; y += 18) {
        ctx.beginPath();
        ctx.moveTo(cx - 25, y); ctx.lineTo(cx + 25, y - 8);
        ctx.stroke();
      }

      // Bronze helmet brow plate
      ctx.fillStyle = '#b45309';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(cx - 160, cy - 135, 320, 45, 8);
      ctx.fill();
      ctx.stroke();

      // Red battle scar slashing through right eye
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx + 70, cy - 60); ctx.lineTo(cx + 80, cy + 45);
      ctx.stroke();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.stroke();
      break;
    }

    case CharacterType.DRACUBON: {
      // 7. DRACUBON: Vampire High Velvet Collar, Razor Fangs & Red Hypnotic Gaze
      // High Vampire Collar behind head
      ctx.fillStyle = '#7f1d1d';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx - 160, cy - 130);
      ctx.lineTo(cx - 120, cy + 50);
      ctx.lineTo(cx + 120, cy + 50);
      ctx.lineTo(cx + 160, cy - 130);
      ctx.lineTo(cx + 110, cy - 60);
      ctx.lineTo(cx - 110, cy - 60);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Gold Brooch Medallion at collar base
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(cx, cy + 60, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(cx, cy + 60, 8, 0, Math.PI * 2);
      ctx.fill();

      // Sharp Vampire Fangs
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 45, cy + 85); ctx.lineTo(cx - 35, cy + 125); ctx.lineTo(cx - 25, cy + 85);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 25, cy + 85); ctx.lineTo(cx + 35, cy + 125); ctx.lineTo(cx + 45, cy + 85);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Blood drop
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx - 35, cy + 132, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case CharacterType.FLAUCUBISTA_DESAFINADO: {
      // 8. FLAUCUBISTA: French Green Beret with Feather + Wooden Flute with Notes
      // Tilted Beret
      ctx.save();
      ctx.translate(cx + 30, cy - 145);
      ctx.rotate(0.2);
      ctx.fillStyle = '#0f766e';
      ctx.strokeStyle = '#042f2e';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(0, 0, 140, 48, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Beret tip stem
      ctx.beginPath();
      ctx.moveTo(0, -45); ctx.lineTo(0, -65);
      ctx.stroke();
      ctx.restore();

      // Wooden Flute held across mouth
      ctx.save();
      ctx.translate(cx, cy + 70);
      ctx.rotate(-0.25);
      ctx.fillStyle = '#b45309';
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(-150, -14, 300, 28, 6);
      ctx.fill();
      ctx.stroke();

      // Flute finger holes
      ctx.fillStyle = '#000000';
      [-80, -45, -10, 25, 60, 95].forEach(hx => {
        ctx.beginPath();
        ctx.arc(hx, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // Floating Cartoon Music Notes
      ctx.fillStyle = '#f59e0b';
      ctx.font = '900 36px serif';
      ctx.fillText('♪', cx + 130, cy + 10);
      ctx.fillStyle = '#fbbf24';
      ctx.font = '900 44px serif';
      ctx.fillText('♫', cx + 160, cy - 35);
      break;
    }

    case CharacterType.RACUBITERO: {
      // 9. RACUBITERO: Street DJ Headphones, Backwards Snapback Cap & Equalizer Visor
      // Headphone Arch Band over the cube
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.arc(cx, cy - 90, 175, Math.PI, 0);
      ctx.stroke();

      // Headphone Earcups on left and right sides
      const drawEarcup = (ex: number) => {
        ctx.fillStyle = '#dc2626';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.roundRect(ex - 25, cy - 90, 50, 95, 16);
        ctx.fill();
        ctx.stroke();
        // Inner cushion
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.roundRect(ex - 15, cy - 75, 30, 65, 8);
        ctx.fill();
      };
      drawEarcup(cx - 180);
      drawEarcup(cx + 180);

      // Backwards snapback cap visor peak sticking backwards
      ctx.fillStyle = '#1e3a8a';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(cx - 130, cy - 170, 260, 48, 12);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case CharacterType.CUBITO_DE_HIELO: {
      // 10. CUBITO DE HIELO: Crystalline Glacial Ice Spikes, Frost Lashes & Chattering Teeth
      const iceSpikes = [
        { x: cx - 120, w: 40, h: 90 },
        { x: cx - 60, w: 50, h: 125 },
        { x: cx, w: 55, h: 155 },
        { x: cx + 60, w: 50, h: 120 },
        { x: cx + 120, w: 40, h: 85 }
      ];

      iceSpikes.forEach(s => {
        ctx.fillStyle = 'rgba(224, 242, 254, 0.9)';
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(s.x - s.w / 2, cy - 130);
        ctx.lineTo(s.x, cy - 130 - s.h);
        ctx.lineTo(s.x + s.w / 2, cy - 130);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Shimmer highlight
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s.x, cy - 130 - s.h + 10);
        ctx.lineTo(s.x - s.w / 4, cy - 130);
        ctx.stroke();
      });

      // Ice cube teeth chattering
      ctx.fillStyle = '#e0f2fe';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 3;
      for (let tx = cx - 50; tx <= cx + 40; tx += 20) {
        ctx.fillRect(tx, cy + 90, 16, 16);
        ctx.strokeRect(tx, cy + 90, 16, 16);
      }
      break;
    }

    case CharacterType.PIRATA: {
      // 11. PIRATA: Black Leather Eyepatch (☠), Gold Hoop Earring & Pirate Tricorne Hat
      // Eyepatch over right eye
      ctx.strokeStyle = '#0a0a0c';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 70); ctx.lineTo(cx + 150, cy + 40);
      ctx.stroke();

      // Eyepatch leather patch
      ctx.fillStyle = '#09090b';
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx + 75, cy - 10, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // White skull & crossbones on eyepatch
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('☠', cx + 75, cy);

      // Gold hoop pirate earring on left edge
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(cx - 170, cy + 30, 24, 0, Math.PI * 2);
      ctx.stroke();

      // Pirate Captain Tricorne Hat
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx - 200, cy - 110);
      ctx.quadraticCurveTo(cx - 90, cy - 200, cx, cy - 135);
      ctx.quadraticCurveTo(cx + 90, cy - 200, cx + 200, cy - 110);
      ctx.quadraticCurveTo(cx, cy - 175, cx - 200, cy - 110);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Gold rim trim
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 190, cy - 115);
      ctx.quadraticCurveTo(cx, cy - 180, cx + 190, cy - 115);
      ctx.stroke();
      break;
    }

    case CharacterType.CUBICULA: {
      // 12. CUBICULA: Gothic Countess Tiara with Blood Gem, Velvet Choker & Bat Eyelashes
      // Gothic Lace Tiara
      ctx.fillStyle = '#1e1b2e';
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - 130, cy - 135);
      ctx.lineTo(cx - 90, cy - 190);
      ctx.lineTo(cx - 45, cy - 150);
      ctx.lineTo(cx, cy - 215);
      ctx.lineTo(cx + 45, cy - 150);
      ctx.lineTo(cx + 90, cy - 190);
      ctx.lineTo(cx + 130, cy - 135);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Blood Ruby on center peak
      ctx.fillStyle = '#dc2626';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy - 180, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Countess dainty fangs
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx - 35, cy + 90); ctx.lineTo(cx - 28, cy + 120); ctx.lineTo(cx - 20, cy + 90);
      ctx.moveTo(cx + 20, cy + 90); ctx.lineTo(cx + 28, cy + 120); ctx.lineTo(cx + 35, cy + 90);
      ctx.fill();
      break;
    }

    case CharacterType.CAMBIAFORMAS: {
      // 13. CAMBIAFORMAS: Theatrical Jester Split Mask, Playing Card Suits & Question Mark
      // Split face line
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(cx, cy - 150); ctx.lineTo(cx, cy + 150);
      ctx.stroke();
      ctx.setLineDash([]);

      // Jester two-pronged curved cap with golden bells
      const drawJesterHorn = (hx: number, isLeft: boolean) => {
        ctx.fillStyle = isLeft ? '#7e22ce' : '#0284c7';
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 130);
        ctx.quadraticCurveTo(hx, cy - 230, hx + (isLeft ? -45 : 45), cy - 150);
        ctx.quadraticCurveTo(hx, cy - 180, cx, cy - 130);
        ctx.fill();
        ctx.stroke();

        // Bell at tip
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(hx + (isLeft ? -45 : 45), cy - 150, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      };
      drawJesterHorn(cx - 120, true);
      drawJesterHorn(cx + 120, false);

      // Card suits on cheeks
      ctx.fillStyle = '#dc2626';
      ctx.font = '28px sans-serif';
      ctx.fillText('♦', cx - 110, cy + 30);
      ctx.fillText('♥', cx + 110, cy + 30);

      // Glowing Question mark
      ctx.fillStyle = '#facc15';
      ctx.font = '900 36px monospace';
      ctx.fillText('?', cx, cy - 145);
      break;
    }
  }

  ctx.restore();
}

/**
 * Creates a standalone transparent PNG Data URL with only the character's unique traits and accessories.
 */
export function createCharacterSpriteOverlayDataUrl(
  options: CharacterOverlayOptions,
  width: number = 512,
  height: number = 512
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  drawCharacterSpriteOverlay(ctx, options, width, height);
  return canvas.toDataURL('image/png');
}
