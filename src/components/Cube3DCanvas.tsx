import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CharacterType } from '../types/game';

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
  diceValue?: number;
  interactive?: boolean;
  className?: string;
}

// Generate procedural 2D canvas texture for the face with expressive eyes, mouth, and tape
function createCharacterFaceTexture(
  character: CharacterType,
  isBlueTeam: boolean,
  isHit: boolean,
  isAttacking: boolean,
  isFrozen: boolean,
  diceValue: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // 1. Base die face background (smooth clay/resin texture)
  const baseGrad = ctx.createLinearGradient(0, 0, 512, 512);
  if (isBlueTeam) {
    baseGrad.addColorStop(0, '#1e40af');
    baseGrad.addColorStop(0.5, '#2563eb');
    baseGrad.addColorStop(1, '#0f172a');
  } else {
    baseGrad.addColorStop(0, '#991b1b');
    baseGrad.addColorStop(0.5, '#dc2626');
    baseGrad.addColorStop(1, '#18080a');
  }
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle beveled inner shadow
  ctx.strokeStyle = isBlueTeam ? '#38bdf8' : '#f87171';
  ctx.lineWidth = 16;
  ctx.strokeRect(8, 8, 496, 496);

  // Top chamfer header with D6 squad badge
  ctx.fillStyle = isBlueTeam ? 'rgba(15, 23, 42, 0.85)' : 'rgba(24, 8, 10, 0.85)';
  ctx.fillRect(16, 16, 480, 56);
  ctx.fillStyle = isBlueTeam ? '#7dd3fc' : '#fca5a5';
  ctx.font = '900 24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(isBlueTeam ? 'ESCUADRÓN AZUL • D6' : 'ESCUADRÓN ROJO • D6', 256, 52);

  // Pips on top corners
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(56, 44, 12, 0, Math.PI * 2);
  ctx.arc(456, 44, 12, 0, Math.PI * 2);
  ctx.fill();

  // 2. Papercraft Collage Sticker Backdrop (Recorte troquelado blanco con sombra)
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(48, 88, 416, 380, 36);
  ctx.fill();
  ctx.restore();

  // Inner cutout background
  ctx.fillStyle = isBlueTeam ? '#0f172a' : '#1a0b0e';
  ctx.beginPath();
  ctx.roundRect(56, 96, 400, 364, 30);
  ctx.fill();

  // 3. Adhesive Washi Tape Strip across top corner (Cinta adhesiva translúcida)
  ctx.save();
  ctx.translate(80, 95);
  ctx.rotate(-0.18);
  ctx.fillStyle = 'rgba(254, 240, 138, 0.65)'; // Translucent masking tape
  ctx.fillRect(-60, -18, 140, 44);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 2;
  ctx.strokeRect(-60, -18, 140, 44);
  ctx.restore();

  // 4. Expressive Eyes & Mouth
  ctx.save();

  if (isHit) {
    // Hurt / Knocked Out: Big Comic X Eyes
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    // Left X
    ctx.beginPath();
    ctx.moveTo(140, 190); ctx.lineTo(210, 260);
    ctx.moveTo(210, 190); ctx.lineTo(140, 260);
    ctx.stroke();
    // Right X
    ctx.beginPath();
    ctx.moveTo(300, 190); ctx.lineTo(370, 260);
    ctx.moveTo(370, 190); ctx.lineTo(300, 260);
    ctx.stroke();

    // Wavy dizzy grimace mouth
    ctx.beginPath();
    ctx.moveTo(180, 360);
    ctx.quadraticCurveTo(220, 330, 256, 360);
    ctx.quadraticCurveTo(290, 390, 332, 360);
    ctx.stroke();
  } else if (isAttacking) {
    // Angry Fierce Slanted Eyes
    ctx.fillStyle = '#000000';
    // Angry Slanted Eyebrows
    ctx.lineWidth = 16;
    ctx.strokeStyle = isBlueTeam ? '#38bdf8' : '#f87171';
    ctx.beginPath();
    ctx.moveTo(120, 180); ctx.lineTo(230, 215);
    ctx.moveTo(392, 180); ctx.lineTo(282, 215);
    ctx.stroke();

    // Intense glowing eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(175, 240, 34, 0, Math.PI * 2);
    ctx.arc(337, 240, 34, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isBlueTeam ? '#0284c7' : '#dc2626';
    ctx.beginPath();
    ctx.arc(185, 240, 18, 0, Math.PI * 2);
    ctx.arc(327, 240, 18, 0, Math.PI * 2);
    ctx.fill();

    // Open fierce roaring mouth with sharp teeth
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(256, 360, 75, 45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Sharp teeth
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(220, 320); ctx.lineTo(235, 345); ctx.lineTo(250, 320);
    ctx.moveTo(260, 320); ctx.lineTo(275, 345); ctx.lineTo(290, 320);
    ctx.fill();
  } else {
    // Normal Expressive Streetwise Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(170, 225, 42, 54, 0, 0, Math.PI * 2);
    ctx.ellipse(342, 225, 42, 54, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Pupils looking slightly forward with specular highlights
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(176, 225, 24, 0, Math.PI * 2);
    ctx.arc(348, 225, 24, 0, Math.PI * 2);
    ctx.fill();

    // White eye shine glints
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(168, 215, 8, 0, Math.PI * 2);
    ctx.arc(340, 215, 8, 0, Math.PI * 2);
    ctx.fill();

    // Confident Street Smirk Mouth
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(190, 345);
    ctx.quadraticCurveTo(256, 385, 330, 335);
    ctx.stroke();
  }

  // Character specific facial touches on the face canvas
  if (character === CharacterType.DRACUBON || character === CharacterType.CUBICULA) {
    // Vampire Fangs
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(210, 345); ctx.lineTo(220, 385); ctx.lineTo(230, 345);
    ctx.moveTo(282, 345); ctx.lineTo(292, 385); ctx.lineTo(302, 345);
    ctx.fill();
    // Blood drop
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(220, 390, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  if (character === CharacterType.CUBOGRO) {
    // Giant bottom tusks pointing up
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(175, 370); ctx.lineTo(190, 290); ctx.lineTo(205, 370);
    ctx.moveTo(305, 370); ctx.lineTo(320, 290); ctx.lineTo(335, 370);
    ctx.fill();
    ctx.stroke();
  }

  if (character === CharacterType.TRAMCUBOSO) {
    // Dark Aviator sunglasses painted across eyes
    ctx.fillStyle = 'rgba(10, 10, 12, 0.95)';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(110, 190, 125, 75, 18);
    ctx.roundRect(275, 190, 125, 75, 18);
    ctx.fill();
    ctx.stroke();
    // Golden bridge
    ctx.beginPath();
    ctx.moveTo(235, 215); ctx.lineTo(275, 215);
    ctx.stroke();
    // Toothpick
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(300, 355); ctx.lineTo(365, 335);
    ctx.stroke();
  }

  if (character === CharacterType.PIRATA) {
    // Eyepatch on right eye
    ctx.fillStyle = '#0a0a0c';
    ctx.beginPath();
    ctx.arc(342, 225, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(270, 180); ctx.lineTo(410, 270);
    ctx.stroke();
    // Skull symbol
    ctx.fillStyle = '#ffffff';
    ctx.font = '32px sans-serif';
    ctx.fillText('☠', 342, 235);
  }

  ctx.restore();

  // Bottom chamfer character name
  ctx.fillStyle = '#000000';
  ctx.fillRect(16, 440, 480, 56);
  ctx.fillStyle = isBlueTeam ? '#38bdf8' : '#f87171';
  ctx.font = '900 24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`★ ${character.replace(/_/g, ' ').slice(0, 14)} ★`, 256, 476);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural standard pips texture for remaining sides
function createDicePipTexture(pipsCount: number, isBlueTeam: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = isBlueTeam ? '#1d4ed8' : '#b91c1c';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = isBlueTeam ? '#38bdf8' : '#f87171';
  ctx.lineWidth = 10;
  ctx.strokeRect(6, 6, 244, 244);

  const pipColor = '#ffffff';
  const drawPip = (x: number, y: number) => {
    ctx.fillStyle = pipColor;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fill();
  };

  const c = 128;
  const l = 64;
  const r = 192;
  const t = 64;
  const b = 192;

  switch (pipsCount) {
    case 1:
      drawPip(c, c);
      break;
    case 2:
      drawPip(l, t);
      drawPip(r, b);
      break;
    case 3:
      drawPip(l, t);
      drawPip(c, c);
      drawPip(r, b);
      break;
    case 4:
      drawPip(l, t);
      drawPip(r, t);
      drawPip(l, b);
      drawPip(r, b);
      break;
    case 5:
      drawPip(l, t);
      drawPip(r, t);
      drawPip(c, c);
      drawPip(l, b);
      drawPip(r, b);
      break;
    case 6:
    default:
      drawPip(l, t);
      drawPip(r, t);
      drawPip(l, c);
      drawPip(r, c);
      drawPip(l, b);
      drawPip(r, b);
      break;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
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
  diceValue = 6,
  interactive = true,
  className = ""
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.15, y: -0.35 });
  const currentRotationRef = useRef({ x: 0.15, y: -0.35 });

  const isBlueTeam = teamColor === 'blue' || teamId === 1 || (!teamColor && teamId === undefined);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || size;
    const height = container.clientHeight || size;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 4.4);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Studio Lighting (Warm key light, cool hemisphere fill, backlight)
    const hemiLight = new THREE.HemisphereLight(
      isBlueTeam ? 0x93c5fd : 0xfca5a5,
      0x0f172a,
      0.9
    );
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(isBlueTeam ? 0x38bdf8 : 0xef4444, 1.2);
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    // 3. Composite 3D Character Dice Model (THREE.Group)
    const diceHeroGroup = new THREE.Group();
    scene.add(diceHeroGroup);

    // Ground Contact Shadow (Soft Radial Shadow)
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d')!;
    const shadowGrad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 64);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    shadowGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.35)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = shadowGrad;
    sCtx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(2.6, 2.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.6
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.1;
    scene.add(shadowMesh);

    // Textures for 6 faces
    const faceTex = createCharacterFaceTexture(character, isBlueTeam, isHit, isAttacking, isFrozen, diceValue);
    const rightTex = createDicePipTexture(4, isBlueTeam);
    const leftTex = createDicePipTexture(3, isBlueTeam);
    const topTex = createDicePipTexture(diceValue, isBlueTeam);
    const bottomTex = createDicePipTexture(2, isBlueTeam);
    const backTex = createDicePipTexture(1, isBlueTeam);

    const dieMaterials = [
      new THREE.MeshStandardMaterial({ map: rightTex, roughness: 0.25, metalness: 0.15 }),  // +X
      new THREE.MeshStandardMaterial({ map: leftTex, roughness: 0.25, metalness: 0.15 }),   // -X
      new THREE.MeshStandardMaterial({ map: topTex, roughness: 0.25, metalness: 0.15 }),    // +Y
      new THREE.MeshStandardMaterial({ map: bottomTex, roughness: 0.25, metalness: 0.15 }), // -Y
      new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.2, metalness: 0.1 }),     // +Z (FRONT FACE)
      new THREE.MeshStandardMaterial({ map: backTex, roughness: 0.25, metalness: 0.15 }),   // -Z
    ];

    // Main Die Cube Geometry
    const cubeGeo = new THREE.BoxGeometry(1.8, 1.8, 1.8);
    const dieMesh = new THREE.Mesh(cubeGeo, dieMaterials);
    diceHeroGroup.add(dieMesh);

    // =========================================================================
    // 3D PROCEDURAL ACCESSORIES (ATTACHED TO DICE HERO GROUP)
    // =========================================================================

    // 1. CUBINJA: 3D Ninja Bandana with Silver Metal Plate + Flowing Ribbon Tails + Ninja Mask
    if (character === CharacterType.CUBINJA) {
      // Bandana band wrapped around top forehead
      const bandanaGeo = new THREE.BoxGeometry(1.86, 0.32, 1.86);
      const bandanaMat = new THREE.MeshStandardMaterial({
        color: 0x18181b,
        roughness: 0.5
      });
      const bandanaMesh = new THREE.Mesh(bandanaGeo, bandanaMat);
      bandanaMesh.position.set(0, 0.62, 0);
      diceHeroGroup.add(bandanaMesh);

      // Silver metal forehead protector plate
      const plateGeo = new THREE.BoxGeometry(0.78, 0.24, 0.08);
      const plateMat = new THREE.MeshStandardMaterial({
        color: 0xe4e4e7,
        metalness: 0.95,
        roughness: 0.15
      });
      const plateMesh = new THREE.Mesh(plateGeo, plateMat);
      plateMesh.position.set(0, 0.62, 0.94);
      diceHeroGroup.add(plateMesh);

      // Dual fluttering bandana ribbon tails from the rear
      const tail1Geo = new THREE.BoxGeometry(0.18, 0.75, 0.04);
      const tailMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 });
      const tail1 = new THREE.Mesh(tail1Geo, tailMat);
      tail1.position.set(-0.25, 0.3, -0.98);
      tail1.rotation.set(0.35, 0, -0.2);
      diceHeroGroup.add(tail1);

      const tail2 = new THREE.Mesh(tail1Geo, tailMat);
      tail2.position.set(0.2, 0.25, -0.98);
      tail2.rotation.set(0.45, 0, 0.25);
      diceHeroGroup.add(tail2);
    }

    // 2. HADA AL CUBO: 3D Translucent Fairy Wings + 3D Magic Star Wand
    if (character === CharacterType.HADA_AL_CUBO) {
      // Iridescent fairy wings attached behind the die
      const wingShape = new THREE.Shape();
      wingShape.moveTo(0, 0);
      wingShape.bezierCurveTo(0.6, 0.4, 0.9, 1.1, 0.3, 1.5);
      wingShape.bezierCurveTo(-0.2, 1.2, 0.1, 0.4, 0, 0);

      const wingGeo = new THREE.ShapeGeometry(wingShape);
      const wingMat = new THREE.MeshPhysicalMaterial({
        color: 0x67e8f9,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.35,
        transparent: true,
        opacity: 0.85,
        roughness: 0.1,
        transmission: 0.4,
        side: THREE.DoubleSide
      });

      // Left wing
      const leftWing = new THREE.Mesh(wingGeo, wingMat);
      leftWing.position.set(-0.85, 0.2, -0.85);
      leftWing.rotation.set(0.2, -0.65, 0.25);
      diceHeroGroup.add(leftWing);

      // Right wing
      const rightWing = new THREE.Mesh(wingGeo, wingMat);
      rightWing.position.set(0.85, 0.2, -0.85);
      rightWing.rotation.set(0.2, 0.65, -0.25);
      rightWing.scale.set(-1, 1, 1);
      diceHeroGroup.add(rightWing);

      // 3D Magic Wand held at the right side of the die
      const wandGroup = new THREE.Group();
      wandGroup.position.set(1.15, -0.1, 0.5);
      wandGroup.rotation.set(0.2, 0, -0.35);

      // Wand wooden handle
      const shaftGeo = new THREE.CylinderGeometry(0.04, 0.05, 1.2, 12);
      const shaftMat = new THREE.MeshStandardMaterial({
        color: 0xb45309,
        roughness: 0.4,
        metalness: 0.1
      });
      const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
      wandGroup.add(shaftMesh);

      // Wand golden star tip
      const starShape = new THREE.Shape();
      const points = 5;
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? 0.22 : 0.09;
        const a = (i * Math.PI) / points;
        const x = Math.sin(a) * r;
        const y = Math.cos(a) * r;
        if (i === 0) starShape.moveTo(x, y);
        else starShape.lineTo(x, y);
      }
      starShape.closePath();

      const starGeo = new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 });
      const starMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xfef08a,
        emissiveIntensity: 0.8,
        metalness: 0.8,
        roughness: 0.1
      });
      const starMesh = new THREE.Mesh(starGeo, starMat);
      starMesh.position.set(0, 0.68, -0.04);
      wandGroup.add(starMesh);

      diceHeroGroup.add(wandGroup);
    }

    // 3. CUBINARCA: 3D Golden Jeweled Crown on Top of the Die
    if (character === CharacterType.CUBINARCA) {
      const crownGroup = new THREE.Group();
      crownGroup.position.set(0, 0.95, 0);

      // Crown circular gold base
      const crownBaseGeo = new THREE.CylinderGeometry(0.72, 0.78, 0.22, 16);
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.9,
        roughness: 0.15
      });
      const crownBaseMesh = new THREE.Mesh(crownBaseGeo, goldMat);
      crownGroup.add(crownBaseMesh);

      // 5 Crown golden spikes
      const spikeGeo = new THREE.ConeGeometry(0.14, 0.42, 4);
      const rubyMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.4, roughness: 0.1, emissive: 0x7f1d1d });
      const sapphireMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.4, roughness: 0.1, emissive: 0x1e3a8a });
      const emeraldMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.4, roughness: 0.1, emissive: 0x064e3b });

      const gemMats = [rubyMat, sapphireMat, emeraldMat, rubyMat, sapphireMat];

      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5;
        const spike = new THREE.Mesh(spikeGeo, goldMat);
        spike.position.set(Math.sin(angle) * 0.65, 0.28, Math.cos(angle) * 0.65);
        crownGroup.add(spike);

        // Gem on spike
        const gemGeo = new THREE.OctahedronGeometry(0.08);
        const gemMesh = new THREE.Mesh(gemGeo, gemMats[i % gemMats.length]);
        gemMesh.position.set(Math.sin(angle) * 0.65, 0.25, Math.cos(angle) * 0.65);
        crownGroup.add(gemMesh);
      }

      diceHeroGroup.add(crownGroup);
    }

    // 4. GLADIACUBON: 3D Roman Helmet Crest Plume
    if (character === CharacterType.GLADIACUBON) {
      const plumeGeo = new THREE.BoxGeometry(0.24, 0.52, 1.82);
      const plumeMat = new THREE.MeshStandardMaterial({
        color: 0xdc2626,
        roughness: 0.7
      });
      const plume = new THREE.Mesh(plumeGeo, plumeMat);
      plume.position.set(0, 1.15, 0);
      diceHeroGroup.add(plume);
    }

    // 5. DRACUBON / CUBICULA: 3D Vampire High Collar Cape
    if (character === CharacterType.DRACUBON || character === CharacterType.CUBICULA) {
      const collarGeo = new THREE.CylinderGeometry(1.22, 1.0, 1.1, 16, 1, true, -Math.PI * 0.7, Math.PI * 1.4);
      const collarMat = new THREE.MeshStandardMaterial({
        color: 0x7f1d1d,
        roughness: 0.4,
        side: THREE.DoubleSide
      });
      const collar = new THREE.Mesh(collarGeo, collarMat);
      collar.position.set(0, 0.2, -0.3);
      diceHeroGroup.add(collar);
    }

    // 6. FLAUCUBISTA DESAFINADO: 3D Wooden Flute + Jaunty Beret
    if (character === CharacterType.FLAUCUBISTA_DESAFINADO) {
      // Wooden Flute angled in front
      const fluteGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.45, 12);
      const fluteMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.4 });
      const flute = new THREE.Mesh(fluteGeo, fluteMat);
      flute.position.set(0.1, -0.5, 0.96);
      flute.rotation.set(0.2, 0, -0.42);
      diceHeroGroup.add(flute);

      // Beret on top
      const beretGeo = new THREE.CylinderGeometry(0.72, 0.55, 0.2, 16);
      const beretMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.6 });
      const beret = new THREE.Mesh(beretGeo, beretMat);
      beret.position.set(0.25, 0.98, -0.1);
      beret.rotation.set(-0.15, 0, 0.2);
      diceHeroGroup.add(beret);
    }

    // 7. RACUBITERO: 3D DJ Headphones
    if (character === CharacterType.RACUBITERO) {
      const hpGroup = new THREE.Group();
      hpGroup.position.set(0, 0.7, 0);

      // Arc headband over top
      const arcCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.05, -0.5, 0),
        new THREE.Vector3(-0.8, 0.4, 0),
        new THREE.Vector3(0, 0.55, 0),
        new THREE.Vector3(0.8, 0.4, 0),
        new THREE.Vector3(1.05, -0.5, 0),
      ]);
      const bandGeo = new THREE.TubeGeometry(arcCurve, 32, 0.08, 8, false);
      const bandMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.5, roughness: 0.3 });
      hpGroup.add(new THREE.Mesh(bandGeo, bandMat));

      // Earcups on sides
      const cupGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.16, 16);
      const cupMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.3, roughness: 0.2 });
      const leftCup = new THREE.Mesh(cupGeo, cupMat);
      leftCup.position.set(-1.0, -0.5, 0);
      leftCup.rotation.z = Math.PI / 2;
      hpGroup.add(leftCup);

      const rightCup = new THREE.Mesh(cupGeo, cupMat);
      rightCup.position.set(1.0, -0.5, 0);
      rightCup.rotation.z = Math.PI / 2;
      hpGroup.add(rightCup);

      diceHeroGroup.add(hpGroup);
    }

    // 8. CUBITO DE HIELO: 3D Crystal Ice Spikes on Top
    if (character === CharacterType.CUBITO_DE_HIELO) {
      const crystalGeo = new THREE.ConeGeometry(0.18, 0.65, 6);
      const crystalMat = new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.85,
        roughness: 0.1,
        transmission: 0.6
      });

      const s1 = new THREE.Mesh(crystalGeo, crystalMat);
      s1.position.set(-0.4, 1.15, -0.2);
      diceHeroGroup.add(s1);

      const s2 = new THREE.Mesh(crystalGeo, crystalMat);
      s2.position.set(0.35, 1.2, 0.15);
      s2.scale.set(0.8, 0.8, 0.8);
      diceHeroGroup.add(s2);
    }

    // Interactive Drag rotation handlers
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (!interactive) return;
      isDraggingRef.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevPointerRef.current = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!interactive || !isDraggingRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const dx = clientX - prevPointerRef.current.x;
      const dy = clientY - prevPointerRef.current.y;
      prevPointerRef.current = { x: clientX, y: clientY };

      targetRotationRef.current.y += dx * 0.015;
      targetRotationRef.current.x = Math.max(-0.6, Math.min(0.6, targetRotationRef.current.x + dy * 0.015));
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handlePointerDown);
    domElement.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    domElement.addEventListener('touchstart', handlePointerDown, { passive: true });
    domElement.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    // 4. Animation Loop with Exponential Damping & Idle Breathing
    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Exponential damping towards target rotation
      const dampFactor = 1 - Math.exp(-12 * delta);
      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * dampFactor;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * dampFactor;

      diceHeroGroup.rotation.x = currentRotationRef.current.x;
      diceHeroGroup.rotation.y = currentRotationRef.current.y;

      // Gentle floating breathing bob
      const bobY = Math.sin(elapsed * 2.4) * 0.04;
      diceHeroGroup.position.y = bobY;

      // Attacking lunge animation
      if (isAttacking) {
        diceHeroGroup.position.z = 0.45;
        diceHeroGroup.scale.setScalar(1.08);
      } else {
        diceHeroGroup.position.z = 0;
        diceHeroGroup.scale.setScalar(1.0);
      }

      // Hit shake
      if (isHit) {
        diceHeroGroup.position.x = (Math.random() - 0.5) * 0.15;
      } else {
        diceHeroGroup.position.x = 0;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 5. Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      domElement.removeEventListener('mousedown', handlePointerDown);
      domElement.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      domElement.removeEventListener('touchstart', handlePointerDown);
      domElement.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);

      cubeGeo.dispose();
      dieMaterials.forEach(m => m.dispose());
      faceTex.dispose();
      rightTex.dispose();
      leftTex.dispose();
      topTex.dispose();
      bottomTex.dispose();
      backTex.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTex.dispose();
      renderer.dispose();
    };
  }, [character, isBlueTeam, isHit, isAttacking, isFrozen, diceValue, size, interactive]);

  return (
    <div
      ref={mountRef}
      className={`relative select-none flex items-center justify-center cursor-grab active:cursor-grabbing ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
};
