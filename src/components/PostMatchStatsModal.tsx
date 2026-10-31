import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { PlayerState, CharacterType } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { DiceCharacterSprite } from './DiceCharacterSprite';
import { collectionManager } from '../data/collectionManager';
import { AuraShopModal } from './AuraShopModal';
import {
  Trophy,
  Swords,
  ShieldAlert,
  Layers,
  RotateCw,
  LogOut,
  Eye,
  Crown,
  Flame,
  Award,
  Sparkles,
  Skull,
  Heart,
  Package,
  Zap,
  FileText,
  Save,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface PostMatchStatsModalProps {
  players: PlayerState[];
  winner: PlayerState | null;
  round: number;
  onRestartMatch: () => void;
  onExitBattle: () => void;
  onClose?: () => void;
  onExportReplayLog?: () => void;
  replaySaveStatus?: 'IDLE' | 'SAVING' | 'SAVED' | 'ERROR';
  replaySaveError?: string | null;
  onRetrySaveReplay?: () => void;
}

export const PostMatchStatsModal: React.FC<PostMatchStatsModalProps> = ({
  players,
  winner,
  round,
  onRestartMatch,
  onExitBattle,
  onClose,
  onExportReplayLog,
  replaySaveStatus = 'IDLE',
  replaySaveError,
  onRetrySaveReplay
}) => {
  const isTeamMatch = players.some(p => p.teamId === 1) && players.some(p => p.teamId === 2);
  const [selectedTab, setSelectedTab] = useState<'ALL' | 'TEAM_BLUE' | 'TEAM_RED'>('ALL');
  const [showAuraShop, setShowAuraShop] = useState(false);
  const [auraInfo, setAuraInfo] = useState(() => collectionManager.getAuraRank());
  const [unopenedBoxes, setUnopenedBoxes] = useState(() => collectionManager.getUnopenedBoxes());

  // Compute Aggregates
  const teamBluePlayers = players.filter(p => p.teamId === 1);
  const teamRedPlayers = players.filter(p => p.teamId === 2);

  const teamBlueDamage = teamBluePlayers.reduce((acc, p) => acc + (p.damageDealt || 0), 0);
  const teamBlueBlocks = teamBluePlayers.reduce((acc, p) => acc + (p.perfectBlocks || 0), 0);
  const teamBlueCards = teamBluePlayers.reduce((acc, p) => acc + (p.cardsDrawn || 0), 0);

  const teamRedDamage = teamRedPlayers.reduce((acc, p) => acc + (p.damageDealt || 0), 0);
  const teamRedBlocks = teamRedPlayers.reduce((acc, p) => acc + (p.perfectBlocks || 0), 0);
  const teamRedCards = teamRedPlayers.reduce((acc, p) => acc + (p.cardsDrawn || 0), 0);

  // Highest values for badges
  const maxDamage = Math.max(...players.map(p => p.damageDealt || 0), 1);
  const maxBlocks = Math.max(...players.map(p => p.perfectBlocks || 0), 0);
  const maxCards = Math.max(...players.map(p => p.cardsDrawn || 0), 0);

  // Determine MVP (highest combined tactical score: damage * 1.5 + blocks * 4 + cards * 2)
  const mvpPlayer = [...players].sort((a, b) => {
    const scoreA = (a.damageDealt || 0) * 1.5 + (a.perfectBlocks || 0) * 4 + (a.cardsDrawn || 0) * 2;
    const scoreB = (b.damageDealt || 0) * 1.5 + (b.perfectBlocks || 0) * 4 + (b.cardsDrawn || 0) * 2;
    return scoreB - scoreA;
  })[0];

  // Determine match outcome banner for human player (team 1 or player 1)
  const humanPlayer = players.find(p => !p.isBot);
  const isHumanWinner = humanPlayer && winner && (
    humanPlayer.id === winner.id ||
    (humanPlayer.teamId && humanPlayer.teamId === winner.teamId)
  );

  const displayedPlayers = players.filter(p => {
    if (selectedTab === 'TEAM_BLUE') return p.teamId === 1;
    if (selectedTab === 'TEAM_RED') return p.teamId === 2;
    return true;
  });

  return createPortal((
    <div className="fixed inset-0 z-[80] flex items-start justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto overscroll-contain animate-fadeIn select-none">
      <div className="w-full max-w-3xl my-2 sm:my-4 bg-[#121620] border-2 border-yellow-400/80 rounded-3xl p-3 sm:p-6 shadow-2xl text-white relative flex flex-col max-h-[calc(100dvh-1rem)] overflow-y-auto overscroll-contain">
        {/* Street Comic Background Texture & Glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#242d40] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-yellow-400/20 border border-yellow-400 flex items-center justify-center shadow-md">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-yellow-400">
                <span>ESTADÍSTICAS DE POST-PARTIDA</span>
                <span className="text-neutral-500">·</span>
                <span className="text-neutral-400">Ronda {round}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-bungee leading-tight">
                {winner ? (
                  isTeamMatch ? (
                    winner.teamId === 1 ? '¡VICTORIA DEL ESCUADRÓN AZUL!' : '¡VICTORIA DEL ESCUADRÓN ROJO!'
                  ) : (
                    `¡${winner.name} ES EL CAMPEÓN!`
                  )
                ) : (
                  '¡BATALLA FINALIZADA!'
                )}
              </h2>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              title="Inspeccionar mesa de combate"
              className="px-3 py-1.5 rounded-xl bg-[#1c2333] hover:bg-[#283248] border border-[#2e3a55] text-xs font-bold text-neutral-300 flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Ver Tablero</span>
            </button>
          )}
        </div>

        {/* Aura & Beta Box Gain Banner */}
        <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-cyan-500/20 border border-yellow-400/50 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-yellow-400/20 border border-yellow-400 flex items-center justify-center text-yellow-300">
              <Zap className="w-5 h-5 text-yellow-400 animate-bounce" />
            </div>
            <div>
              <div className="text-xs font-black text-yellow-300 flex items-center gap-1.5">
                <span>{isHumanWinner ? '¡RECOMPENSA DE VICTORIA BETA!' : 'RECOMPENSA DE REFRIGA'}</span>
                <span className="text-[10px] bg-yellow-400/20 px-1.5 py-0.5 rounded text-yellow-200 border border-yellow-400/30">
                  {auraInfo.rankTitle}
                </span>
              </div>
              <div className="text-xs text-neutral-200">
                {isHumanWinner ? (
                  <span className="font-bold text-emerald-300">
                    +35 Aura de Calle <span className="text-white">·</span> +1 Caja de 3 Dados Desbloqueada 🎁
                  </span>
                ) : (
                  <span className="text-neutral-300">+15 Aura de Calle acumulada</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowAuraShop(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transform active:scale-95"
          >
            <Package className="w-4 h-4 text-black" />
            <span>ABRIR CAJAS ({unopenedBoxes})</span>
          </button>
        </div>

        {/* Team Battle Aggregate Scoreboard (If Squad Mode) */}
        {isTeamMatch && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Blue Squad */}
            <div className={`p-3 rounded-2xl border transition-all ${
              winner?.teamId === 1
                ? 'bg-gradient-to-br from-blue-950/70 to-blue-900/40 border-blue-400/80 ring-1 ring-blue-400/40 shadow-lg'
                : 'bg-[#181f2f]/80 border-blue-500/30'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shadow-sm" />
                  <span className="font-bungee text-xs sm:text-sm text-blue-300">ESCUADRÓN AZUL</span>
                </div>
                {winner?.teamId === 1 && (
                  <span className="text-[10px] font-black uppercase text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-md border border-yellow-400/40 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-yellow-400" />
                    Ganador
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1 text-center bg-black/30 p-2 rounded-xl">
                <div>
                  <div className="text-[10px] text-neutral-400 flex items-center justify-center gap-1">
                    <Swords className="w-2.5 h-2.5 text-red-400" /> Daño
                  </div>
                  <div className="text-sm sm:text-base font-black text-red-400 font-bungee">{teamBlueDamage}</div>
                </div>
                <div>
                  <div className="text-[10px] text-neutral-400 flex items-center justify-center gap-1">
                    <ShieldAlert className="w-2.5 h-2.5 text-cyan-400" /> Bloqueos
                  </div>
                  <div className="text-sm sm:text-base font-black text-cyan-400 font-bungee">{teamBlueBlocks}</div>
                </div>
                <div>
                  <div className="text-[10px] text-neutral-400 flex items-center justify-center gap-1">
                    <Layers className="w-2.5 h-2.5 text-yellow-400" /> Cartas
                  </div>
                  <div className="text-sm sm:text-base font-black text-yellow-400 font-bungee">{teamBlueCards}</div>
                </div>
              </div>
            </div>

            {/* Red Squad */}
            <div className={`p-3 rounded-2xl border transition-all ${
              winner?.teamId === 2
                ? 'bg-gradient-to-br from-red-950/70 to-red-900/40 border-red-400/80 ring-1 ring-red-400/40 shadow-lg'
                : 'bg-[#22181d]/80 border-red-500/30'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block shadow-sm" />
                  <span className="font-bungee text-xs sm:text-sm text-red-300">ESCUADRÓN ROJO</span>
                </div>
                {winner?.teamId === 2 && (
                  <span className="text-[10px] font-black uppercase text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-md border border-yellow-400/40 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-yellow-400" />
                    Ganador
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1 text-center bg-black/30 p-2 rounded-xl">
                <div>
                  <div className="text-[10px] text-neutral-400 flex items-center justify-center gap-1">
                    <Swords className="w-2.5 h-2.5 text-red-400" /> Daño
                  </div>
                  <div className="text-sm sm:text-base font-black text-red-400 font-bungee">{teamRedDamage}</div>
                </div>
                <div>
                  <div className="text-[10px] text-neutral-400 flex items-center justify-center gap-1">
                    <ShieldAlert className="w-2.5 h-2.5 text-cyan-400" /> Bloqueos
                  </div>
                  <div className="text-sm sm:text-base font-black text-cyan-400 font-bungee">{teamRedBlocks}</div>
                </div>
                <div>
                  <div className="text-[10px] text-neutral-400 flex items-center justify-center gap-1">
                    <Layers className="w-2.5 h-2.5 text-yellow-400" /> Cartas
                  </div>
                  <div className="text-sm sm:text-base font-black text-yellow-400 font-bungee">{teamRedCards}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Squad Filter Tabs (for Team Mode) */}
        {isTeamMatch && (
          <div className="flex items-center gap-1.5 p-1 bg-[#181d29] rounded-xl mb-3 border border-[#232b3c] self-start">
            <button
              onClick={() => setSelectedTab('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedTab === 'ALL'
                  ? 'bg-yellow-400 text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Todos los Dados ({players.length})
            </button>
            <button
              onClick={() => setSelectedTab('TEAM_BLUE')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedTab === 'TEAM_BLUE'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-300/70 hover:text-blue-200'
              }`}
            >
              Escuadrón Azul ({teamBluePlayers.length})
            </button>
            <button
              onClick={() => setSelectedTab('TEAM_RED')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedTab === 'TEAM_RED'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-red-300/70 hover:text-red-200'
              }`}
            >
              Escuadrón Rojo ({teamRedPlayers.length})
            </button>
          </div>
        )}

        {/* Players Detailed Performance Table */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-2.5 pr-1">
          {displayedPlayers.map((player) => {
            const charDef = CHARACTERS[player.characterType] || CHARACTERS[CharacterType.TRAMCUBOSO];
            const isWinnerDie = winner && (
              winner.id === player.id || (isTeamMatch && winner.teamId === player.teamId)
            );
            const isMvp = mvpPlayer && mvpPlayer.id === player.id;
            const isAlive = !player.isEliminated && player.hp > 0;
            const damage = player.damageDealt || 0;
            const blocks = player.perfectBlocks || 0;
            const cards = player.cardsDrawn || 0;

            const isBlue = player.teamId === 1;
            const isRed = player.teamId === 2;

            return (
              <div
                key={`post-match-player-${player.id}`}
                className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isMvp
                    ? 'bg-gradient-to-r from-yellow-950/40 via-[#1a2233] to-[#181d29] border-yellow-400/70 shadow-md ring-1 ring-yellow-400/30'
                    : isBlue
                    ? 'bg-[#151d2d]/90 border-blue-500/40'
                    : isRed
                    ? 'bg-[#221820]/90 border-red-500/40'
                    : 'bg-[#181d29] border-[#252f44]'
                }`}
              >
                {/* Left: Avatar & Identity */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <div className="relative">
                    <DiceCharacterSprite
                      character={player.activeMorphCharacter || player.characterType}
                      teamId={player.teamId}
                      size={54}
                      isEliminated={!isAlive}
                    />
                    {isMvp && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-yellow-400 text-black flex items-center justify-center shadow-lg font-black text-[10px]">
                        ★
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bungee text-sm sm:text-base text-white tracking-wide">
                        {player.name}
                      </span>
                      {isMvp && (
                        <span className="text-[9px] font-black uppercase text-yellow-300 bg-yellow-400/20 px-1.5 py-0.5 rounded border border-yellow-400/40">
                          MVP
                        </span>
                      )}
                      {isWinnerDie && !isMvp && (
                        <span className="text-[9px] font-black uppercase text-cyan-300 bg-cyan-400/20 px-1.5 py-0.5 rounded border border-cyan-400/40">
                          Campeón
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                      <span>{charDef.displayName}</span>
                      <span className="text-neutral-600">·</span>
                      {isAlive ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Heart className="w-3 h-3 fill-emerald-400" />
                          {player.hp}/{player.maxHp} HP
                        </span>
                      ) : (
                        <span className="text-red-400 font-bold flex items-center gap-1">
                          <Skull className="w-3 h-3" />
                          K.O. Eliminado
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: 3 Requested Stats */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full sm:w-auto text-center bg-black/40 px-3 py-2 rounded-xl border border-white/5">
                  {/* Metric 1: Daño Infligido */}
                  <div className="min-w-[65px]">
                    <div className="text-[10px] text-neutral-400 flex items-center justify-center gap-1">
                      <Swords className="w-3 h-3 text-red-400" />
                      <span>Daño</span>
                    </div>
                    <div className="text-base sm:text-lg font-black text-red-400 font-bungee">
                      {damage}
                    </div>
                    {damage === maxDamage && damage > 0 && (
                      <div className="text-[8px] font-bold text-red-300 uppercase tracking-tight">
                        Máx. Daño
                      </div>
                    )}
                  </div>

                  {/* Metric 2: Bloqueos Perfectos */}
                  <div className="min-w-[65px]">
                    <div className="text-[10px] text-neutral-400 flex items-center justify-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-cyan-400" />
                      <span>Bloqueos</span>
                    </div>
                    <div className="text-base sm:text-lg font-black text-cyan-400 font-bungee">
                      {blocks}
                    </div>
                    {blocks === maxBlocks && blocks > 0 && (
                      <div className="text-[8px] font-bold text-cyan-300 uppercase tracking-tight">
                        Muro
                      </div>
                    )}
                  </div>

                  {/* Metric 3: Cartas Robadas */}
                  <div className="min-w-[65px]">
                    <div className="text-[10px] text-neutral-400 flex items-center justify-center gap-1">
                      <Layers className="w-3 h-3 text-yellow-400" />
                      <span>Cartas</span>
                    </div>
                    <div className="text-base sm:text-lg font-black text-yellow-400 font-bungee">
                      {cards}
                    </div>
                    {cards === maxCards && cards > 0 && (
                      <div className="text-[8px] font-bold text-yellow-300 uppercase tracking-tight">
                        Saqueador
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions — always reachable by scrolling the result panel */}
        <div className="sticky bottom-0 z-10 -mx-3 sm:-mx-6 mt-3 shrink-0 border-t border-[#242d40] bg-[#121620]/98 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 sm:px-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-[11px] text-neutral-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Combate concluido bajo las reglas de la Guerra Cúbita.</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold">
              {replaySaveStatus === 'SAVING' && <span className="text-amber-300">Guardando partida…</span>}
              {replaySaveStatus === 'SAVED' && <span className="inline-flex items-center gap-1 text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" /> Partida guardada</span>}
              {replaySaveStatus === 'ERROR' && <span className="inline-flex items-center gap-1 text-rose-300"><AlertTriangle className="h-3.5 w-3.5" /> No se pudo guardar</span>}
              {replaySaveStatus === 'ERROR' && onRetrySaveReplay && (
                <button onClick={onRetrySaveReplay} className="rounded-md border border-rose-400/40 px-2 py-1 text-rose-200 hover:bg-rose-950/50">Reintentar</button>
              )}
              {replaySaveStatus === 'IDLE' && <span className="text-neutral-500">Registro de partida disponible</span>}
            </div>
          </div>
          {replaySaveError && replaySaveStatus === 'ERROR' && (
            <p className="mb-2 break-words text-[10px] text-rose-300">{replaySaveError}</p>
          )}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button
              onClick={onExportReplayLog}
              disabled={!onExportReplayLog}
              className="min-h-11 rounded-xl border border-emerald-500/50 bg-emerald-950/50 px-3 py-3 text-xs font-black text-emerald-200 hover:bg-emerald-900/70 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <FileText className="h-4 w-4" />
              EXPORTAR LOG PARA ANÁLISIS
            </button>
            <button
              onClick={onRestartMatch}
              className="min-h-11 rounded-xl bg-[#ff1744] px-3 py-3 text-white font-black text-xs tracking-wider shadow-lg flex items-center justify-center gap-2 hover:bg-[#d50000] active:scale-[0.98] font-bungee"
            >
              <RotateCw className="w-4 h-4" />
              <span>JUGAR DE NUEVO</span>
            </button>
            <button
              onClick={onExitBattle}
              className="min-h-11 rounded-xl border border-[#2b354b] bg-[#1e2535] px-3 py-3 text-neutral-200 hover:bg-[#283248] font-black text-xs flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4" />
              <span>MENÚ PRINCIPAL</span>
            </button>
          </div>
        </div>
      </div>
      {showAuraShop && <AuraShopModal onClose={() => setShowAuraShop(false)} />}
    </div>
  ), document.body);
};
