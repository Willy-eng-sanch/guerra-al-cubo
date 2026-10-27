import React, { useRef, useEffect } from 'react';
import { FloatingCombatText, PlayerState, CATEGORY_INFO } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { Cube3DCanvas } from './Cube3DCanvas';
import { MatchIntroAnimation } from './MatchIntroAnimation';
import { Shield, Sword, Snowflake, Zap, Skull } from 'lucide-react';

interface ArenaRingProps {
  players: PlayerState[];
  activePlayerId: number | null;
  selectedTargetId: number | null;
  floatingTexts: FloatingCombatText[];
  onSelectTarget: (playerId: number) => void;
  isRollingAnimation: boolean;
  isMatchIntroPlaying: boolean;
  onMatchIntroComplete: () => void;
}

export const ArenaRing: React.FC<ArenaRingProps> = ({
  players,
  activePlayerId,
  selectedTargetId,
  floatingTexts,
  onSelectTarget,
  isRollingAnimation,
  isMatchIntroPlaying,
  onMatchIntroComplete
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw Arena Floor (Gritty Urban Sidewalk Asphalt & Chalk Arena)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const rx = Math.max(20, width * 0.44);
    const ry = Math.max(20, height * 0.38);

    // Gritty Asphalt Pavement Gradient
    const floorGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, rx);
    floorGrad.addColorStop(0, '#1E1F26');
    floorGrad.addColorStop(0.65, '#14151B');
    floorGrad.addColorStop(1, 'rgba(10, 11, 15, 0.95)');

    ctx.fillStyle = floorGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sidewalk Concrete Curb / Painted Ring Border (Bold Urban Street Curbs)
    ctx.strokeStyle = '#383E4E';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Vibrant Yellow Chalk Duel Circle (Street Fight Markings)
    ctx.save();
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx - 6, ry - 5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Neon Magenta / Cyan Street Reflections on Wet Asphalt
    const neonPink = ctx.createRadialGradient(cx - rx * 0.4, cy, 5, cx - rx * 0.4, cy, 90);
    neonPink.addColorStop(0, 'rgba(236, 72, 153, 0.16)');
    neonPink.addColorStop(1, 'rgba(236, 72, 153, 0)');
    ctx.fillStyle = neonPink;
    ctx.beginPath();
    ctx.arc(cx - rx * 0.4, cy, 90, 0, Math.PI * 2);
    ctx.fill();

    const neonCyan = ctx.createRadialGradient(cx + rx * 0.4, cy, 5, cx + rx * 0.4, cy, 90);
    neonCyan.addColorStop(0, 'rgba(6, 182, 212, 0.16)');
    neonCyan.addColorStop(1, 'rgba(6, 182, 212, 0)');
    ctx.fillStyle = neonCyan;
    ctx.beginPath();
    ctx.arc(cx + rx * 0.4, cy, 90, 0, Math.PI * 2);
    ctx.fill();

    // Inner Chalk Battle Zone Box (Chalked street dice boundary)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1.5;
    const boxW = rx * 0.9;
    const boxH = ry * 0.85;
    ctx.strokeRect(cx - boxW / 2, cy - boxH / 2, boxW, boxH);

    // Chalk Crosshair in Center for Dice Throw Pit
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 36, cy);
    ctx.lineTo(cx + 36, cy);
    ctx.moveTo(cx, cy - 24);
    ctx.lineTo(cx, cy + 24);
    ctx.stroke();

    // Chalk Street Corner Marks
    ctx.font = '900 10px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ ARENA CALLEJERA // D6 BATTLE ⚡', cx, cy + ry * 0.65);
  }, [players.length]);

  const total = Math.max(1, players.length);
  const isTeamMatch = players.some(player => player.teamId !== undefined);
  const activePlayer = players.find(player => player.id === activePlayerId);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isMatchIntroPlaying ? 'z-20' : ''} ${
        isTeamMatch ? 'h-[460px] md:h-[500px]' : 'h-[340px] md:h-[420px]'
      } rounded-3xl overflow-hidden bg-[#0d0f15] border-2 border-[#ff1744]/40 shadow-[0_0_30px_rgba(255,23,68,0.2)] select-none flex items-center justify-center`}
      style={{
        backgroundImage: `radial-gradient(ellipse at 50% 50%, rgba(13, 15, 21, 0.65) 0%, rgba(10, 12, 16, 0.92) 85%), url('/assets/street_sidewalk_crowd_bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%'
      }}
    >
      <canvas
        ref={canvasRef}
        width={700}
        height={420}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Team rows leave a clear center lane; free-for-all retains its radial formation. */}
      {!isMatchIntroPlaying && players.map((player, index) => {
        const isTeamPositioned = isTeamMatch && player.teamId !== undefined;
        const teamMembers = isTeamPositioned
          ? players.filter(member => member.teamId === player.teamId)
          : [];
        const teamSlot = isTeamPositioned
          ? teamMembers.findIndex(member => member.id === player.id)
          : -1;
        const angle = (2.0 * Math.PI * index) / total - Math.PI / 2.0;
        const radiusX = 38;
        const radiusY = 34;
        const posX = isTeamPositioned
          ? player.teamId === 1 ? 19 : 81
          : 50 + radiusX * Math.cos(angle);
        const posY = isTeamPositioned
          ? teamMembers.length <= 1
            ? 50
            : 18 + (64 * teamSlot) / (teamMembers.length - 1)
          : 50 + radiusY * Math.sin(angle);
        const isTurn = player.id === activePlayerId;
        const isTarget = player.id === selectedTargetId;
        const charDef = CHARACTERS[player.activeMorphCharacter || player.characterType] || CHARACTERS[player.characterType];
        const isOpponent = !activePlayer?.teamId || !player.teamId || activePlayer.teamId !== player.teamId;
        const isTargetable = !player.isEliminated && player.id !== activePlayerId && isOpponent;

        const playerFloatingTexts = floatingTexts.filter(t => t.playerId === player.id);

        return (
          <div
            key={player.id}
            style={{
              left: `${posX}%`,
              top: `${posY}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={() => {
              if (isTargetable) onSelectTarget(player.id);
            }}
            className={`absolute flex flex-col items-center z-10 transition-transform duration-200 ${
              isTargetable ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'
            } ${player.isEliminated ? 'opacity-40 grayscale' : ''}`}
          >
            {/* Team Affiliation Badge */}
            {player.teamId && (
              <span
                className={`text-[8px] font-black px-1.5 py-0.2 rounded-full mb-0.5 border ${
                  player.teamId === 1
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500'
                    : 'bg-red-950 text-red-300 border-red-500'
                }`}
              >
                {player.teamId === 1 ? 'AZUL' : 'ROJO'}
              </span>
            )}
            {/* Target Reticle Indicator */}
            {isTarget && !player.isEliminated && (
              <div className="absolute -top-6 animate-bounce bg-[#ff1744] text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-yellow-300 shadow-lg flex items-center gap-1 z-20">
                <Sword className="w-3 h-3" />
                <span>OBJETIVO</span>
              </div>
            )}

            {/* Active Turn Halo */}
            {isTurn && !player.isEliminated && (
              <div className="absolute -inset-3 rounded-full border-2 border-yellow-400 animate-pulse pointer-events-none shadow-[0_0_15px_rgba(255,214,0,0.6)]" />
            )}

            {/* Cube Clay Avatar */}
            <div className={`relative ${isTurn ? 'scale-110' : ''}`}>
              <Cube3DCanvas
                character={player.activeMorphCharacter || player.characterType}
                size={isTeamPositioned ? 68 : 84}
                hasPreparedStance={!!player.preparedStance}
                isFrozen={player.isFrozen}
                isAttacking={isTurn && isRollingAnimation}
                className={isTeamPositioned && player.teamId !== 1 ? 'scale-x-[-1]' : ''}
              />

              {/* Status Icons Overlay */}
              {player.isFrozen && (
                <div className="absolute top-0 right-0 bg-cyan-600/90 text-white p-1 rounded-full border border-cyan-300">
                  <Snowflake className="w-3 h-3 animate-spin" />
                </div>
              )}
              {player.isEliminated && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                  <Skull className="w-8 h-8 text-red-500 animate-pulse" />
                </div>
              )}
            </div>

            {/* Player Info Badge */}
            <div
              className={`mt-[-4px] px-2 py-1 rounded-lg border text-center shadow-md backdrop-blur-md min-w-[88px] max-w-[120px] transition-all ${
                isTarget
                  ? 'bg-red-950/90 border-[#ff1744] ring-2 ring-[#ff1744]/40'
                  : isTurn
                  ? 'bg-amber-950/90 border-yellow-400 ring-2 ring-yellow-400/40'
                  : 'bg-[#151922]/90 border-[#2c3345]'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: charDef.primaryColor }}
                />
                <span className="text-[11px] font-extrabold text-white truncate">
                  {player.name}
                </span>
                <span className="text-[10px] tracking-tighter" title={`Clases: ${charDef.classes.map(c => CATEGORY_INFO[c].name).join(', ')}`}>
                  {charDef.classes.map(c => CATEGORY_INFO[c]?.symbol || '').join('')}
                </span>
              </div>

              {/* Health Bar */}
              <div className="w-full bg-neutral-900 rounded-full h-2 mt-1 overflow-hidden border border-neutral-700 relative">
                <div
                  className={`h-full transition-all duration-300 ${
                    player.hp > 10 ? 'bg-emerald-500' : player.hp > 5 ? 'bg-amber-500' : 'bg-red-600'
                  }`}
                  style={{ width: `${Math.max(0, (player.hp / player.maxHp) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[9px] font-mono text-neutral-300 mt-0.5">
                <span className="font-bold text-white">{player.hp}/{player.maxHp} HP</span>
                <span className="text-yellow-400 font-bold">{player.actionPoints} AP</span>
              </div>

              {/* Barrier Row if active */}
              {player.shieldBarrier !== undefined && player.shieldBarrier > 0 && (
                <div className="flex items-center justify-center text-[8px] mt-0.5 px-0.5">
                  <span className="text-blue-300 font-extrabold text-[8px] flex items-center gap-0.5 bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-600/50">
                    <Shield className="w-2.5 h-2.5 text-blue-400" />
                    <span>+{player.shieldBarrier} Barrera</span>
                  </span>
                </div>
              )}

              {/* Mini Equipment & Stance Indicator */}
              <div className="flex items-center justify-center gap-1 mt-1">
                {player.equippedWeapons.map((w, idx) => (
                  <span
                    key={`weapon-${player.id}-${w.id}-${idx}`}
                    title={w.name}
                    className="text-[8px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded border border-amber-500/40 truncate max-w-[50px]"
                  >
                    {w.name.slice(0, 5)}
                  </span>
                ))}
                {player.preparedStance && (
                  <span
                    title={`Postura: ${player.preparedStance.name}`}
                    className="text-[8px] bg-cyan-500/20 text-cyan-300 px-1 py-0.2 rounded border border-cyan-500/40 flex items-center gap-0.5"
                  >
                    <Shield className="w-2 h-2" />
                  </span>
                )}
              </div>
            </div>

            {/* Floating Combat Damage / Block Text */}
            {playerFloatingTexts.map(fText => (
              <div
                key={fText.id}
                className="absolute -top-8 pointer-events-none z-30 font-black text-sm tracking-wider animate-float-damage whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                style={{ color: fText.colorHex }}
              >
                {fText.text}
              </div>
            ))}
          </div>
        );
      })}

      {isMatchIntroPlaying && (
        <MatchIntroAnimation
          players={players}
          onComplete={onMatchIntroComplete}
        />
      )}
    </div>
  );
};
