import React, { useState } from 'react';
import {
  ActiveDiceRoll,
  CombatLogEntry,
  FloatingCombatText,
  GameCard,
  MatchPhase,
  PlayerState,
  TrickTiming,
  CardType,
  getMaxHandSize
} from '../types/game';
import { CHARACTERS } from '../data/characters';
import { ArenaRing } from '../components/ArenaRing';
import { DiceRollModal } from '../components/DiceRollModal';
import { GlobalDeckView } from '../components/GlobalDeckView';
import { ReactionModal } from '../components/ReactionModal';
import { CinematicCutsceneModal } from '../components/CinematicCutsceneModal';
import { HeroAbilityModal } from '../components/HeroAbilityModal';
import {
  Sword,
  Shield,
  Zap,
  RotateCw,
  LogOut,
  FastForward,
  Trophy,
  History,
  Info,
  Sparkles,
  Video
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ArenaScreenProps {
  round: number;
  players: PlayerState[];
  currentTurnPlayer: PlayerState | null;
  selectedTargetId: number | null;
  deckCount: number;
  discardPileCount: number;
  log: CombatLogEntry[];
  phase: MatchPhase;
  activeDiceRoll: ActiveDiceRoll | null;
  isRollingAnimation: boolean;
  winner: PlayerState | null;
  floatingTexts: FloatingCombatText[];
  isFastSpeed: boolean;
  isDeckDrawing?: boolean;
  isMatchIntroPlaying: boolean;
  onMatchIntroComplete: () => void;
  reactionPlayer: PlayerState | null;
  onSelectTarget: (playerId: number) => void;
  onAttack: (targetPlayerId: number) => void;
  onEquipWeapon: (cardId: number) => void;
  onPrepareStance: (cardId: number) => void;
  onPlayActionTrick: (cardId: number, targetId?: number) => void;
  onUseHeroAbility: (targetId?: number, extraOption?: number) => void;
  onEndTurn: () => void;
  onDismissDiceRoll: () => void;
  onToggleSpeed: () => void;
  onExitBattle: () => void;
  onRestartMatch: () => void;
  onEquipReaction: (cardId: number) => void;
  onActivateReaction: (cardId: number) => void;
  onPrepareReaction: (cardId: number) => void;
  onSkipReaction: () => void;
}

export const ArenaScreen: React.FC<ArenaScreenProps> = ({
  round,
  players,
  currentTurnPlayer,
  selectedTargetId,
  deckCount,
  discardPileCount,
  log,
  phase,
  activeDiceRoll,
  isRollingAnimation,
  winner,
  floatingTexts,
  isFastSpeed,
  isDeckDrawing = false,
  isMatchIntroPlaying,
  onMatchIntroComplete,
  reactionPlayer,
  onSelectTarget,
  onAttack,
  onEquipWeapon,
  onPrepareStance,
  onPlayActionTrick,
  onUseHeroAbility,
  onEndTurn,
  onDismissDiceRoll,
  onToggleSpeed,
  onExitBattle,
  onRestartMatch,
  onEquipReaction,
  onActivateReaction,
  onPrepareReaction,
  onSkipReaction
}) => {
  const [showLogModal, setShowLogModal] = useState(false);
  const [showAbilityModal, setShowAbilityModal] = useState(false);
  const [selectedHandCard, setSelectedHandCard] = useState<GameCard | null>(null);
  const [activeCinematic, setActiveCinematic] = useState<{
    videoUrl: string;
    characterName: string;
    actionTitle: string;
    quote?: string;
  } | null>(null);

  // Trigger confetti on victory
  React.useEffect(() => {
    if (winner) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [winner]);

  const actorHeroDef = currentTurnPlayer
    ? CHARACTERS[currentTurnPlayer.activeMorphCharacter || currentTurnPlayer.characterType]
    : null;

  const validTargets = players.filter(
    p =>
      !p.isEliminated &&
      p.id !== currentTurnPlayer?.id &&
      (!currentTurnPlayer?.teamId || !p.teamId || p.teamId !== currentTurnPlayer.teamId)
  );

  const selectedTarget = players.find(p => p.id === selectedTargetId);

  const isHumanTurn = currentTurnPlayer && !currentTurnPlayer.isBot && !currentTurnPlayer.isEliminated;

  return (
    <div className="relative w-full min-h-screen bg-[#0a0c10] text-white flex flex-col justify-between p-3 md:p-5 select-none overflow-x-hidden">
      {isMatchIntroPlaying && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 bg-transparent"
        />
      )}
      {/* 1. Header Toolbar */}
      <header className="flex items-center justify-between border-b border-[#1f2636] pb-2.5">
        <div className="flex items-center gap-2">
          <button
            onClick={onExitBattle}
            className="p-1.5 rounded-xl bg-[#141822] hover:bg-[#1e2433] border border-[#263044] text-neutral-400 hover:text-white transition-all"
            title="Salir al Menú"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <div className="bg-[#1b212f] px-3 py-1 rounded-xl border border-[#283449] flex items-center gap-2">
            <span className="text-xs font-black text-yellow-400 tracking-wider">
              RONDA {round}
            </span>
            <span className="text-neutral-500">•</span>
            {currentTurnPlayer?.teamId && (
              <span
                className={`text-[9px] font-black px-1.5 py-0.2 rounded-full border ${
                  currentTurnPlayer.teamId === 1
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500'
                    : 'bg-red-950 text-red-300 border-red-500'
                }`}
              >
                {currentTurnPlayer.teamId === 1 ? 'BANDO AZUL' : 'BANDO ROJO'}
              </span>
            )}
            <span className="text-[11px] font-bold text-cyan-300">
              Turno: {currentTurnPlayer?.name || "---"}
            </span>
          </div>
        </div>

        {/* Deck, Discard and Speed Toggle */}
        <div className="flex items-center gap-2 text-xs">
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-neutral-400 bg-[#121620] px-2.5 py-1 rounded-lg border border-[#21293a]">
            <span>Mazo: <b className="text-white">{deckCount}</b>/60</span>
            <span>|</span>
            <span>Descarte: <b className="text-white">{discardPileCount}</b></span>
          </div>

          <button
            onClick={onToggleSpeed}
            className={`p-1.5 px-2.5 rounded-xl border flex items-center gap-1 font-bold text-[11px] transition-all ${
              isFastSpeed
                ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                : 'bg-[#151922] text-neutral-400 border-[#263044]'
            }`}
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{isFastSpeed ? '2x' : '1x'}</span>
          </button>

          <button
            onClick={() => setShowLogModal(true)}
            className="p-1.5 rounded-xl bg-[#141822] hover:bg-[#1e2433] border border-[#263044] text-neutral-300"
            title="Historial de Combate"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Main Arena Stage */}
      <main className="my-2 flex-1 flex flex-col justify-center items-center relative w-full max-w-4xl mx-auto">
        <div className="w-full flex justify-between items-center px-1 mb-2">
          <GlobalDeckView
            deckCount={deckCount}
            discardPileCount={discardPileCount}
            isDrawingAnimation={isDeckDrawing}
            className="w-full sm:w-auto"
          />
        </div>

        <ArenaRing
          players={players}
          activePlayerId={currentTurnPlayer?.id || null}
          selectedTargetId={selectedTargetId}
          floatingTexts={floatingTexts}
          onSelectTarget={onSelectTarget}
          isRollingAnimation={isRollingAnimation}
          isMatchIntroPlaying={isMatchIntroPlaying}
          onMatchIntroComplete={onMatchIntroComplete}
        />

        {/* Live Combat Log Ticker */}
        {log.length > 0 && (
          <div className="w-full max-w-xl mt-2 bg-[#121620]/90 border border-[#232c3d] rounded-xl px-3 py-1.5 flex items-center justify-between text-[11px] backdrop-blur-md">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-yellow-400 font-bold font-mono">
                [R{log[0].round}]
              </span>
              <span
                className={`truncate ${
                  log[0].isCritical ? 'text-red-400 font-black' : 'text-neutral-200'
                }`}
              >
                {log[0].message}
              </span>
            </div>
            <button
              onClick={() => setShowLogModal(true)}
              className="text-[10px] text-cyan-400 font-bold hover:underline whitespace-nowrap ml-2"
            >
              Ver más
            </button>
          </div>
        )}
      </main>

      {/* 3. Turn Actions & Cards Dock (Human Player Control) */}
      <footer className="border-t border-[#1f2636] pt-3 max-w-2xl mx-auto w-full">
        {isHumanTurn ? (
          <div className="space-y-3">
            {/* Player info & optional cinematic button */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-extrabold text-white flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: actorHeroDef?.primaryColor || '#ff7043' }} />
                <span>{currentTurnPlayer.name} ({currentTurnPlayer.hp}/{currentTurnPlayer.maxHp} HP)</span>
              </span>

              {actorHeroDef?.selectionVideo && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveCinematic({
                      videoUrl: actorHeroDef.actionVideos?.attack || actorHeroDef.selectionVideo!,
                      characterName: actorHeroDef.displayName,
                      actionTitle: `¡CINEMÁTICA 3D: ${actorHeroDef.displayName.toUpperCase()}!`,
                      quote: actorHeroDef.selectionQuote
                    });
                  }}
                  className="px-2.5 py-0.5 rounded-full bg-pink-950/80 hover:bg-pink-900 border border-pink-500/60 text-pink-300 font-bold text-[10px] flex items-center gap-1 shadow-sm transition-all animate-pulse"
                >
                  <Video className="w-3 h-3 text-pink-400" />
                  <span>Ver Cinemática 3D</span>
                </button>
              )}
            </div>

            {/* Top action row: Attack, Ability, End Turn */}
            <div className="grid grid-cols-3 gap-2">
              {/* Attack Button */}
              <button
                disabled={
                  currentTurnPlayer.actionPoints <= 0 ||
                  currentTurnPlayer.isFrozen ||
                  !selectedTargetId
                }
                onClick={() => selectedTargetId && onAttack(selectedTargetId)}
                className={`py-3 px-2 rounded-xl font-black text-xs md:text-sm flex items-center justify-center gap-1.5 transition-all shadow-md ${
                  currentTurnPlayer.actionPoints > 0 &&
                  !currentTurnPlayer.isFrozen &&
                  selectedTargetId
                    ? 'bg-[#ff1744] hover:bg-[#d50000] active:scale-[0.98] text-white border border-[#ff5252]'
                    : 'bg-[#181c26] text-neutral-500 border border-[#232938] cursor-not-allowed'
                }`}
              >
                <Sword className="w-4 h-4" />
                <span>
                  {selectedTarget
                    ? `ATACAR A ${selectedTarget.name.slice(0, 6)}`
                    : 'ELIGE OBJETIVO'}
                </span>
              </button>

              {/* Character Special Ability */}
              <button
                disabled={currentTurnPlayer.isFrozen}
                onClick={() => setShowAbilityModal(true)}
                className={`py-3 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all border ${
                  !currentTurnPlayer.isFrozen
                    ? 'bg-[#1a233a] hover:bg-[#253252] text-yellow-300 border-yellow-500/50 shadow-md active:scale-95'
                    : 'bg-[#161922] text-neutral-500 border-[#232938] cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span className="truncate">
                  {actorHeroDef?.abilityName || 'Habilidad'}
                </span>
                {currentTurnPlayer.abilityCooldownRemaining > 0 ? (
                  <span className="text-[10px] bg-red-950 text-red-300 px-1.5 rounded font-mono border border-red-800">
                    ({currentTurnPlayer.abilityCooldownRemaining})
                  </span>
                ) : (
                  <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 rounded font-bold border border-emerald-700">
                    Ver
                  </span>
                )}
              </button>

              {/* End Turn */}
              <button
                onClick={onEndTurn}
                className="py-3 px-2 bg-[#1f2736] hover:bg-[#2a3549] active:scale-[0.98] text-neutral-200 border border-[#37445c] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>TERMINAR TURNO</span>
              </button>
            </div>

            {/* Hand Cards Horizontal Carousel */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-neutral-400 font-semibold mb-1.5 px-1">
                <span>
                  TUS CARTAS EN MANO ({currentTurnPlayer.hand.length}/{getMaxHandSize(currentTurnPlayer)})
                </span>
                <span className="text-yellow-400">
                  Acciones restantes: <b>{currentTurnPlayer.actionPoints} AP</b>
                </span>
              </div>

              {currentTurnPlayer.hand.length === 0 ? (
                <div className="bg-[#12151e] border border-dashed border-[#242b3b] rounded-xl p-3 text-center text-xs text-neutral-500">
                  Mano vacía. Golpea a rivales cruzando múltiplos de 5 para robar cartas.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {currentTurnPlayer.hand.map(card => {
                    const isWeapon = card.type === CardType.WEAPON;
                    const isStance = card.timing === TrickTiming.PREPARED_STANCE;

                    return (
                      <div
                        key={card.id}
                        className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                          isWeapon
                            ? 'bg-[#1c1a14] border-amber-600/60'
                            : isStance
                            ? 'bg-[#121c26] border-cyan-500/60'
                            : 'bg-[#1a1424] border-purple-500/60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between text-[9px] font-mono mb-1">
                            <span className="font-bold text-neutral-400">#{card.id}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded font-black ${
                                isWeapon
                                  ? 'bg-amber-950 text-amber-300'
                                  : isStance
                                  ? 'bg-cyan-950 text-cyan-300'
                                  : 'bg-purple-950 text-purple-300'
                              }`}
                            >
                              {isWeapon ? 'ARMA' : isStance ? 'POSTURA' : 'TRUCO'}
                            </span>
                          </div>
                          <h5 className="text-[11px] font-extrabold text-white line-clamp-1">
                            {card.name}
                          </h5>
                          <p className="text-[10px] text-neutral-300 line-clamp-2 mt-0.5 leading-tight">
                            {card.description}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-2 pt-1.5 border-t border-neutral-800/80">
                          {isWeapon ? (
                            <button
                              disabled={currentTurnPlayer.actionPoints <= 0}
                              onClick={() => onEquipWeapon(card.id)}
                              className="w-full py-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-black font-black text-[10px] rounded-lg tracking-wider"
                            >
                              EQUIPAR
                            </button>
                          ) : isStance ? (
                            <button
                              disabled={currentTurnPlayer.actionPoints <= 0}
                              onClick={() => onPrepareStance(card.id)}
                              className="w-full py-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-black text-[10px] rounded-lg tracking-wider"
                            >
                              PREPARAR
                            </button>
                          ) : (
                            <button
                              disabled={currentTurnPlayer.actionPoints <= 0}
                              onClick={() => onPlayActionTrick(card.id, selectedTargetId || undefined)}
                              className="w-full py-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-black text-[10px] rounded-lg tracking-wider"
                            >
                              ACTIVAR
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#141822] border border-[#242c3d] rounded-2xl p-4 text-center">
            <span className="text-sm font-black text-yellow-400 animate-pulse flex items-center justify-center gap-2">
              <RotateCw className="w-4 h-4 animate-spin" />
              <span>
                {currentTurnPlayer
                  ? `Turno de ${currentTurnPlayer.name}... Pensando táctica...`
                  : 'Cargando combate...'}
              </span>
            </span>
          </div>
        )}
      </footer>

      {/* 4. Active Dice Roll Resolution Modal */}
      {activeDiceRoll && (
        <DiceRollModal
          roll={activeDiceRoll}
          isRolling={isRollingAnimation}
          onDismiss={onDismissDiceRoll}
        />
      )}

      {/* 5. Full Combat Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg max-h-[75vh] bg-[#141823] border border-[#2b354b] rounded-2xl p-5 flex flex-col">
            <div className="flex items-center justify-between border-b border-[#252f44] pb-2.5 mb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <History className="w-5 h-5 text-yellow-400" />
                <span>HISTORIAL DE LA GUERRA</span>
              </h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-neutral-400 hover:text-white text-xs font-bold px-2 py-1 bg-[#1e2433] rounded-lg"
              >
                Cerrar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {log.map(item => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border ${
                    item.isCritical
                      ? 'bg-red-950/40 border-red-500/50 text-red-200 font-bold'
                      : 'bg-[#181d29] border-[#252f44] text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-0.5">
                    <span>Ronda {item.round}</span>
                    <span className="font-semibold text-yellow-400">{item.actorName}</span>
                  </div>
                  <div>{item.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5.5 Reaction Modal on Perfect Block */}
      {reactionPlayer && (
        <ReactionModal
          player={reactionPlayer}
          onEquipReaction={onEquipReaction}
          onActivateReaction={onActivateReaction}
          onPrepareReaction={onPrepareReaction}
          onSkipReaction={onSkipReaction}
        />
      )}

      {/* 6. Victory Overlay (Match Over) */}
      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-[#161a25] border-2 border-yellow-400 rounded-3xl p-6 text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-yellow-400/20 border-2 border-yellow-400 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-yellow-400 animate-bounce" />
            </div>

            <div>
              <span className="text-xs font-black tracking-widest text-cyan-400 uppercase">
                ¡BATALLA FINALIZADA!
              </span>
              <h2 className="text-2xl font-black text-white font-bungee mt-1">
                {winner.name}
              </h2>
              <p className="text-xs text-neutral-300 mt-1">
                Es el campeón supremo del asfalto y domina la Guerra Cubita.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                onClick={onRestartMatch}
                className="w-full py-3.5 bg-[#ff1744] hover:bg-[#d50000] active:scale-[0.98] text-white font-black text-sm rounded-xl tracking-wider shadow-lg transition-all"
              >
                JUGAR DE NUEVO
              </button>
              <button
                onClick={onExitBattle}
                className="w-full py-3 bg-[#1e2535] hover:bg-[#283248] text-neutral-300 font-bold text-xs rounded-xl border border-[#2b354b] transition-all"
              >
                VOLVER AL MENÚ PRINCIPAL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Cinematic Battle Cutscene */}
      {activeCinematic && (
        <CinematicCutsceneModal
          videoUrl={activeCinematic.videoUrl}
          characterName={activeCinematic.characterName}
          actionTitle={activeCinematic.actionTitle}
          quote={activeCinematic.quote}
          onClose={() => setActiveCinematic(null)}
        />
      )}

      {/* 7. Hero Ability Details & Activation Modal */}
      {showAbilityModal && actorHeroDef && currentTurnPlayer && (
        <HeroAbilityModal
          character={actorHeroDef}
          player={currentTurnPlayer}
          validTargets={validTargets}
          selectedTargetId={selectedTargetId}
          onClose={() => setShowAbilityModal(false)}
          onActivate={(targetId, extraOption) => {
            setShowAbilityModal(false);

            // Play cinematic cutscene with real video audio if available
            if (actorHeroDef.actionVideos?.ability || actorHeroDef.selectionVideo) {
              setActiveCinematic({
                videoUrl: actorHeroDef.actionVideos?.ability || actorHeroDef.selectionVideo!,
                characterName: actorHeroDef.displayName,
                actionTitle: `¡HABILIDAD: ${actorHeroDef.abilityName.toUpperCase()}!`,
                quote: actorHeroDef.selectionQuote
              });
            }

            onUseHeroAbility(targetId, extraOption);
          }}
        />
      )}
    </div>
  );
};
