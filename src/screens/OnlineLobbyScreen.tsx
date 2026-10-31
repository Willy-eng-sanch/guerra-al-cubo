import React, { useState, useEffect } from 'react';
import { GcSpriteIcon } from '../ui/SpriteUI';
import { CharacterType, CATEGORY_INFO } from '../types/game';
import { CHARACTER_LIST, CHARACTERS } from '../data/characters';
import { Cube3DCanvas } from '../components/Cube3DCanvas';
import { onlineManager, OnlineRoomState } from '../network/onlineMatchManager';
import { collectionManager } from '../data/collectionManager';
import { dailyMissionsManager } from '../data/dailyMissionsManager';
import { CrateOpeningModal } from '../components/CrateOpeningModal';
import { AuraShopModal } from '../components/AuraShopModal';
import { DailyMissionsModal } from '../components/DailyMissionsModal';
import { sound } from '../audio/soundManager';
interface OnlineLobbyScreenProps {
  onBack: () => void;
  onStartOnlineMatch: (playerTeam: CharacterType[], rivalTeam: CharacterType[], rivalName: string) => void;
}

const QUICK_TAUNTS = [
  "¡Que rueden los 6 dados!",
  "¡Mi trío de dados te va a demoler!",
  "¡Cuidado con mi Super-Bloqueo de Escuadra!",
  "¡Sinergia táctica en marcha!",
  "¡Los dados no perdonan en el asfalto!"
];

export const OnlineLobbyScreen: React.FC<OnlineLobbyScreenProps> = ({
  onBack,
  onStartOnlineMatch
}) => {
  const [networkState, setNetworkState] = useState<OnlineRoomState>(() => onlineManager['state']);
  const [inputRoomCode, setInputRoomCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isOpeningCrate, setIsOpeningCrate] = useState(false);
  const [showAuraShop, setShowAuraShop] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [auraInfo, setAuraInfo] = useState(() => collectionManager.getAuraRank());
  const [unopenedBoxes, setUnopenedBoxes] = useState(() => collectionManager.getUnopenedBoxes());
  const [unclaimedMissions, setUnclaimedMissions] = useState(() => dailyMissionsManager.getUnclaimedMissionsCount());
  const [streakDay, setStreakDay] = useState(() => dailyMissionsManager.getCurrentStreak());
  const [canClaimStreak, setCanClaimStreak] = useState(() => dailyMissionsManager.canClaimStreakToday());

  // Collection State
  const [unlockedHeroes, setUnlockedHeroes] = useState<CharacterType[]>(() =>
    collectionManager.getUnlockedCharacters()
  );
  const [coins, setCoins] = useState<number>(() => collectionManager.getCoins());
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);

  // Selected 3-dice squad
  const [selectedSquad, setSelectedSquad] = useState<CharacterType[]>(() => {
    const unlocked = collectionManager.getUnlockedCharacters();
    if (unlocked.length >= 3) {
      return [unlocked[0], unlocked[1], unlocked[2]];
    } else if (unlocked.length > 0) {
      return [...unlocked];
    }
    return [];
  });

  // Subscribe to network and collection updates
  useEffect(() => {
    const unsubNet = onlineManager.subscribe(setNetworkState);
    const unsubCol = collectionManager.subscribe(() => {
      const updatedUnlocked = collectionManager.getUnlockedCharacters();
      setUnlockedHeroes(updatedUnlocked);
      setCoins(collectionManager.getCoins());
      setAuraInfo(collectionManager.getAuraRank());
      setUnopenedBoxes(collectionManager.getUnopenedBoxes());

      // Auto-fill squad if squad has fewer than 3 and we now have unlocked heroes
      setSelectedSquad(prev => {
        if (prev.length < 3 && updatedUnlocked.length >= 3) {
          const newSquad: CharacterType[] = [...prev];
          for (const u of updatedUnlocked) {
            if (!newSquad.includes(u) && newSquad.length < 3) {
              newSquad.push(u);
            }
          }
          return newSquad;
        }
        return prev;
      });
    });

    const unsubMis = dailyMissionsManager.subscribe(() => {
      setUnclaimedMissions(dailyMissionsManager.getUnclaimedMissionsCount());
      setStreakDay(dailyMissionsManager.getCurrentStreak());
      setCanClaimStreak(dailyMissionsManager.canClaimStreakToday());
    });

    return () => {
      unsubNet();
      unsubCol();
      unsubMis();
    };
  }, []);

  // Synchronize local squad with onlineManager
  useEffect(() => {
    if (selectedSquad.length === 3) {
      onlineManager.selectSquad(selectedSquad);
    }
  }, [selectedSquad]);

  const hasMinimumSquad = unlockedHeroes.length >= 3;

  const handlePlayDemoRandomSquad = () => {
    sound.playDiceRoll();
    const demoPool = [
      CharacterType.CUBOGRO,
      CharacterType.DRACUBON,
      CharacterType.TRAMCUBOSO,
      CharacterType.HADA_AL_CUBO,
      CharacterType.GLADIACUBON,
      CharacterType.CUBINJA
    ];
    const shuffled = [...demoPool].sort(() => Math.random() - 0.5);
    const trio = [shuffled[0], shuffled[1], shuffled[2]];
    setSelectedSquad(trio);
    onlineManager.startQuickMatchmaking(trio);
  };

  const handleHeroSelectForSlot = (hero: CharacterType) => {
    if (!collectionManager.isUnlocked(hero)) {
      sound.playClashBlocked();
      return;
    }
    sound.playDiceRoll();

    const newSquad = [...selectedSquad];
    // Check if hero is already in another slot, swap them if so
    const existingIndex = newSquad.indexOf(hero);
    if (existingIndex !== -1) {
      const temp = newSquad[activeSlotIndex];
      newSquad[activeSlotIndex] = hero;
      if (temp) newSquad[existingIndex] = temp;
    } else {
      newSquad[activeSlotIndex] = hero;
    }

    setSelectedSquad(newSquad);
    // Cycle to next slot
    setActiveSlotIndex((activeSlotIndex + 1) % 3);
  };

  const handleRandomizeSquad = () => {
    if (unlockedHeroes.length < 3) return;
    sound.playCupShake();
    const shuffled = [...unlockedHeroes].sort(() => Math.random() - 0.5);
    const trio = [shuffled[0], shuffled[1], shuffled[2]];
    setSelectedSquad(trio);
  };

  const handleCreateRoom = () => {
    if (!hasMinimumSquad || selectedSquad.length < 3) return;
    sound.playDiceRoll();
    onlineManager.createRoom(selectedSquad);
  };

  const handleJoinRoom = () => {
    if (!hasMinimumSquad || selectedSquad.length < 3 || !inputRoomCode.trim()) return;
    sound.playDiceRoll();
    onlineManager.joinRoom(inputRoomCode, selectedSquad);
  };

  const handleQuickMatch = () => {
    if (!hasMinimumSquad || selectedSquad.length < 3) return;
    sound.playDiceRoll();
    onlineManager.startQuickMatchmaking(selectedSquad);
  };

  const handleToggleReady = () => {
    sound.playStanceActivate();
    onlineManager.toggleReady();
  };

  const handleSendTaunt = (text: string) => {
    sound.playCardDraw();
    onlineManager.sendTaunt(text);
  };

  const handleLaunchMatch = () => {
    if (!networkState.remotePlayer) return;
    sound.playDiceRoll();
    onlineManager.launchMatch();

    const localTeam = networkState.localPlayer.heroes && networkState.localPlayer.heroes.length === 3
      ? networkState.localPlayer.heroes
      : selectedSquad;

    const rivalTeam = networkState.remotePlayer.heroes && networkState.remotePlayer.heroes.length === 3
      ? networkState.remotePlayer.heroes
      : [CharacterType.CUBOGRO, CharacterType.DRACUBON, CharacterType.TRAMCUBOSO];

    onStartOnlineMatch(
      localTeam,
      rivalTeam,
      networkState.remotePlayer.name
    );
  };

  const copyRoomCode = () => {
    if (networkState.roomCode) {
      navigator.clipboard?.writeText(networkState.roomCode).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      sound.playCardDraw();
    }
  };

  return (
    <div
      className="gc-screen relative w-full min-h-screen bg-[#0a0c12] text-white flex flex-col justify-between p-3 sm:p-5 select-none overflow-x-hidden bg-cover bg-center"
      style={{
        backgroundImage: `radial-gradient(ellipse at 50% 50%, rgba(10, 12, 18, 0.82) 0%, rgba(5, 7, 10, 0.96) 85%), url('/assets/aistudio/Gemini_Generated_Image_mexdy9mexdy9mexd_2dc8e00b.jpeg')`
      }}
    >
      {/* 1. Header Toolbar */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#212b3d] pb-3 shrink-0">
        <button
          onClick={() => {
            onlineManager.leaveRoom();
            onBack();
          }}
          className="p-2 sm:px-3 rounded-xl bg-[#161b26] hover:bg-[#202738] border border-[#2c374d] text-neutral-300 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
        >
          <GcSpriteIcon name="icon-back" className="w-4 h-4"  />
          <span>Volver al Menú</span>
        </button>

        <div className="text-center">
          <h2 className="text-sm sm:text-xl font-black tracking-wide text-white font-bungee flex items-center justify-center gap-2">
            <GcSpriteIcon name="icon-radio" className="w-4 sm:w-5 h-4 sm:h-5 text-cyan-400 animate-pulse"  />
            <span>MODO ONLINE // DUELOS DE ESCUADRAS 3 VS 3</span>
          </h2>
          <p className="text-[10px] sm:text-xs text-yellow-400 font-bold">
            Escoge 3 dados antes de buscar partida • Escuadrón Azul (Tú) vs Escuadrón Rojo (Rival)
          </p>
        </div>

        {/* Aura, Cajas, Currency & Store Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Aura Rank Pill */}
          <button
            onClick={() => {
              sound.playCardDraw();
              setShowAuraShop(true);
            }}
            style={{ boxShadow: `0 0 12px ${auraInfo.auraGlowCss}` }}
            className="flex items-center gap-1.5 bg-[#141923] hover:bg-[#1e2638] border border-cyan-500/60 hover:border-cyan-400 px-3 py-1.5 rounded-xl text-xs font-black shadow transition-all cursor-pointer"
            title="Ver tu Nivel de Aura y Progresión"
          >
            <span className="text-[10px]">{auraInfo.badge}</span>
            <span style={{ color: auraInfo.colorHex }}>{auraInfo.tierName}</span>
            <span className="text-yellow-400 text-[10px] font-mono">({auraInfo.currentAura} Aura)</span>
          </button>

          {/* Street Coins pill */}
          <div className="flex items-center gap-1.5 bg-[#141923] border border-amber-500/50 px-3 py-1.5 rounded-xl text-amber-300 font-black text-xs shadow">
            <GcSpriteIcon name="icon-coins" className="w-4 h-4 text-amber-400 animate-bounce"  />
            <span>{coins}</span>
            <span className="text-[10px] text-amber-400/80 font-normal">Monedas</span>
          </div>

          {/* 3-Dice Box & Pay-What-You-Want Store Trigger */}
          <button
            onClick={() => {
              sound.playCardDraw();
              setShowAuraShop(true);
            }}
            className="px-3 py-1.5 rounded-xl border border-yellow-300 font-black text-xs flex items-center gap-1.5 transition-all shadow-lg cursor-pointer bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 text-black hover:brightness-110 active:scale-95"
            title="Abrir Cajas de 3 dados o apoyar el juego con 'Paga lo que quieras'"
          >
            <GcSpriteIcon name="icon-package" className="w-4 h-4 text-black animate-pulse"  />
            <span>Cajas: {unopenedBoxes}</span>
            <span className="text-[9px] bg-black/20 text-black px-1.5 py-0.5 rounded font-black uppercase">
              Tienda
            </span>
          </button>

          {/* Daily Streak & Missions Button */}
          <button
            onClick={() => {
              sound.playCardDraw();
              setShowMissions(true);
            }}
            className="px-2.5 py-1.5 rounded-xl border border-yellow-400/50 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 text-yellow-300 font-black text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer"
            title="Misiones Diarias y Racha de 7 Días"
          >
            <GcSpriteIcon name="icon-flame" className="w-3.5 h-3.5 text-orange-400 fill-orange-400 animate-bounce"  />
            <span>Misiones</span>
            {(canClaimStreak || unclaimedMissions > 0) && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>

          {/* Latency */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#121620] px-2.5 py-1.5 rounded-xl border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
            <GcSpriteIcon name="icon-wifi" className="w-3.5 h-3.5 text-emerald-400"  />
            <span>{networkState.pingMs}ms</span>
          </div>
        </div>
      </header>

      {/* 2. Main Area */}
      <main className="my-3 flex-1 flex flex-col items-center justify-center max-w-6xl w-full mx-auto">
        {/* =========================================================================
            STATE A: IDLE / NOT IN ROOM (SQUAD PICKER + LOCK GATE + COLLECTION + ROOM SELECTOR)
           ========================================================================= */}
        {networkState.status === 'IDLE' && (
          <div className="w-full space-y-4 animate-fadeIn">
            {/* ALERT: If Player has fewer than 3 characters */}
            {!hasMinimumSquad && (
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-950/90 via-amber-950/80 to-red-950/90 border-2 border-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.3)] text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-yellow-400">
                  <GcSpriteIcon name="icon-warning" className="w-6 h-6 animate-bounce"  />
                  <h3 className="text-base sm:text-lg font-black font-bungee tracking-wide">
                    ¡ESCUADRÓN INCOMPLETO PARA PARTIDAS CLASIFICATORIAS!
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-neutral-200 max-w-xl mx-auto font-medium">
                  Para armar tu propio trío necesitas tener al menos <strong className="text-yellow-300 font-bold">3 dados en tu colección</strong>.
                  ¡Abre tu caja gratuita de bienvenida o salta directo a la <span className="text-cyan-300 font-bold">Demo Aleatoria con dados de prueba</span>!
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  <button
                    onClick={() => {
                      sound.playCardDraw();
                      setShowAuraShop(true);
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-black font-bungee text-xs sm:text-sm tracking-wider shadow-[0_0_20px_rgba(251,191,36,0.5)] transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <GcSpriteIcon name="icon-gift" className="w-4 h-4 text-black animate-pulse"  />
                    <span>¡ABRIR PRIMERA CAJA DE 3 DADOS GRATIS!</span>
                  </button>

                  <button
                    onClick={handlePlayDemoRandomSquad}
                    className="px-5 py-2.5 rounded-2xl bg-[#004d40] hover:bg-[#00695c] border-2 border-emerald-400/80 text-emerald-200 font-black font-bungee text-xs sm:text-sm tracking-wider shadow-lg transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <GcSpriteIcon name="icon-zap" className="w-4 h-4 text-emerald-300 animate-bounce"  />
                    <span>ENTRAR A LA DEMO CON DADOS DE PRUEBA</span>
                  </button>
                </div>
              </div>
            )}

            {/* SQUAD BUILDER (3 SLOTS) */}
            <div className="p-4 sm:p-5 bg-[#121622]/90 border-2 border-[#2b374e] rounded-3xl shadow-xl backdrop-blur-md space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#212b3d] pb-2.5">
                <div>
                  <span className="text-[10px] font-black uppercase text-cyan-300 tracking-widest bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-cyan-400/40">
                    ESCUADRÓN AZUL (3 DADOS TITULARES)
                  </span>
                  <h3 className="text-lg sm:text-xl font-black font-bungee text-white mt-1">
                    TU TRÍO DE COMBATE ONLINE
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">
                    Slot activo para asignar: <strong className="text-yellow-400">Slot {activeSlotIndex + 1}</strong>
                  </span>
                  <button
                    onClick={handleRandomizeSquad}
                    disabled={!hasMinimumSquad}
                    className="px-2.5 py-1 rounded-xl bg-[#1c2433] hover:bg-[#253044] disabled:opacity-30 border border-neutral-700 text-neutral-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <GcSpriteIcon name="icon-refresh" className="w-3.5 h-3.5"  />
                    <span>Aleatorizar</span>
                  </button>
                </div>
              </div>

              {/* 3 Squad Slots Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[0, 1, 2].map(slotIdx => {
                  const heroType = selectedSquad[slotIdx];
                  const heroDef = heroType ? CHARACTERS[heroType] : null;
                  const isActiveSlot = activeSlotIndex === slotIdx;
                  const slotLabels = ["LÍDER DE ESCUADRA", "ESCOLTA TÁCTICO", "VANGUARDIA"];

                  return (
                    <div
                      key={slotIdx}
                      onClick={() => setActiveSlotIndex(slotIdx)}
                      className={`relative p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center ${
                        isActiveSlot
                          ? 'bg-blue-950/70 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] ring-2 ring-cyan-400/40'
                          : 'bg-[#0f131c] hover:bg-[#151b27] border-[#252f44]'
                      }`}
                    >
                      <div className="w-full flex items-center justify-between text-[10px] font-black uppercase mb-1">
                        <span className={`px-2 py-0.5 rounded-md ${isActiveSlot ? 'bg-cyan-400 text-black font-black' : 'bg-[#1b2230] text-neutral-400'}`}>
                          SLOT {slotIdx + 1}
                        </span>
                        <span className="text-neutral-400 tracking-wider">
                          {slotLabels[slotIdx]}
                        </span>
                      </div>

                      {heroDef ? (
                        <>
                          <div className="my-1">
                            <Cube3DCanvas
                              character={heroType}
                              teamColor="blue"
                              size={85}
                            />
                          </div>
                          <h4 className="text-sm font-black font-bungee text-white">
                            {heroDef.displayName}
                          </h4>
                          <span className="text-[10px] text-cyan-300 font-bold">
                            HP 20 • {heroDef.abilityName}
                          </span>

                          {/* ADN synergy badges */}
                          <div className="flex gap-1 mt-1.5 flex-wrap justify-center">
                            {heroDef.classes.map(cls => (
                              <span
                                key={cls}
                                className="text-[9px] font-black px-1.5 py-0.5 rounded border"
                                style={{
                                  backgroundColor: `${CATEGORY_INFO[cls].color}25`,
                                  borderColor: CATEGORY_INFO[cls].color,
                                  color: CATEGORY_INFO[cls].color
                                }}
                              >
                                {CATEGORY_INFO[cls].badge}
                              </span>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="my-6 flex flex-col items-center justify-center text-neutral-500 space-y-1">
                          <GcSpriteIcon name="icon-help" className="w-8 h-8 stroke-1 text-neutral-600"  />
                          <span className="text-xs font-bold">Ranura vacía</span>
                          <span className="text-[10px]">Toca un dado abajo</span>
                        </div>
                      )}

                      {isActiveSlot && (
                        <div className="mt-2 text-[9px] font-black text-cyan-300 uppercase tracking-widest bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/40">
                          SELECCIONANDO AQUÍ
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3 CONNECTION / MATCHMAKING OPTIONS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Quick Matchmaking / Demo Mode */}
              <button
                onClick={hasMinimumSquad && selectedSquad.length === 3 ? handleQuickMatch : handlePlayDemoRandomSquad}
                className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500/25 via-amber-600/30 to-yellow-600/20 hover:from-yellow-500/35 hover:via-amber-600/40 border-2 border-yellow-400 shadow-[0_0_20px_rgba(251,191,36,0.35)] transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer relative overflow-hidden text-center"
              >
                <div className="absolute top-2 right-2 bg-yellow-400 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow">
                  DEMO GRATIS
                </div>
                <GcSpriteIcon name="icon-zap" className="w-8 h-8 text-yellow-300 group-hover:scale-110 transition-transform animate-pulse"  />
                <span className="font-black font-bungee text-sm text-yellow-300">
                  DEMO: DUELO RÁPIDO ALEATORIO
                </span>
                <span className="text-[10px] text-neutral-200">
                  {hasMinimumSquad && selectedSquad.length === 3
                    ? 'Buscar rival aleatorio con tu trío seleccionado'
                    : 'Jugar instantáneamente con 3 dados de prueba aleatorios'}
                </span>
              </button>

              {/* Option 2: Create Private Room */}
              <button
                onClick={handleCreateRoom}
                disabled={!hasMinimumSquad || selectedSquad.length < 3}
                className="p-4 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-700/30 hover:from-blue-600/30 hover:to-cyan-700/40 border-2 border-cyan-400/60 disabled:opacity-40 disabled:pointer-events-none shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer"
              >
                <GcSpriteIcon name="icon-players" className="w-8 h-8 text-cyan-300 group-hover:scale-110 transition-transform"  />
                <span className="font-black font-bungee text-sm text-cyan-300">
                  CREAR SALA PRIVADA
                </span>
                <span className="text-[10px] text-neutral-300">
                  Generar código de sala para amigos
                </span>
              </button>

              {/* Option 3: Join with Room Code */}
              <div className="p-4 rounded-2xl bg-[#161c28] border-2 border-[#2d3950] flex flex-col justify-between gap-2 text-left">
                <span className="text-[10px] font-black uppercase text-neutral-300">
                  UNIRSE CON CÓDIGO
                </span>
                <input
                  type="text"
                  placeholder="Ej: CUBITA-892"
                  value={inputRoomCode}
                  onChange={e => setInputRoomCode(e.target.value.toUpperCase())}
                  disabled={!hasMinimumSquad}
                  className="w-full bg-[#0d1017] border border-[#2d3950] disabled:opacity-40 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-neutral-600 font-mono font-bold uppercase focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={!hasMinimumSquad || !inputRoomCode.trim() || selectedSquad.length < 3}
                  className="w-full py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Unirse a Sala
                </button>
              </div>
            </div>

            {/* FULL COLLECTION ROSTER GRID (13 CHARACTERS) */}
            <div className="p-4 sm:p-5 bg-[#121622]/90 border-2 border-[#2b374e] rounded-3xl shadow-xl backdrop-blur-md space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#212b3d] pb-2">
                <div>
                  <h4 className="text-sm sm:text-base font-black font-bungee text-white flex items-center gap-2">
                    <GcSpriteIcon name="icon-dice" className="w-4 h-4 text-yellow-400"  />
                    <span>COLECCIÓN DE DADOS ({unlockedHeroes.length} / {CHARACTER_LIST.length} DESBLOQUEADOS)</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Los dados bloqueados se compran en Cajas de a 3. Haz clic en un dado desbloqueado para asignarlo a la ranura seleccionada.
                  </p>
                </div>

                <button
                  onClick={() => {
                    sound.playCardDraw();
                    setIsOpeningCrate(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-yellow-400/20 hover:bg-yellow-400/30 border border-yellow-400/60 text-yellow-300 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
                >
                  <GcSpriteIcon name="icon-package" className="w-3.5 h-3.5"  />
                  <span>Comprar Caja de 3 Dados</span>
                </button>
              </div>

              {/* Grid of 13 Characters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {CHARACTER_LIST.map(char => {
                  const isUnlocked = collectionManager.isUnlocked(char.type);
                  const squadSlot = selectedSquad.indexOf(char.type);
                  const isInSquad = squadSlot !== -1;

                  return (
                    <div
                      key={char.type}
                      onClick={() => {
                        if (isUnlocked) {
                          handleHeroSelectForSlot(char.type);
                        } else {
                          sound.playClashBlocked();
                          setIsOpeningCrate(true);
                        }
                      }}
                      className={`relative p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center ${
                        !isUnlocked
                          ? 'bg-[#0d1017]/80 border-neutral-800 opacity-60 hover:opacity-80'
                          : isInSquad
                          ? 'bg-blue-950/80 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                          : 'bg-[#151b27] hover:bg-[#1e2738] border-neutral-700/80'
                      }`}
                    >
                      {/* Status badge */}
                      <div className="w-full flex items-center justify-between text-[9px] mb-1 font-bold">
                        {isUnlocked ? (
                          isInSquad ? (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-400 text-black font-black uppercase text-[8px]">
                              SLOT {squadSlot + 1}
                            </span>
                          ) : (
                            <span className="text-emerald-400 flex items-center gap-0.5 text-[8px]">
                              <GcSpriteIcon name="icon-check" className="w-2.5 h-2.5"  /> Disponible
                            </span>
                          )
                        ) : (
                          <span className="text-amber-400 flex items-center gap-0.5 text-[8px] font-black">
                            <GcSpriteIcon name="icon-lock" className="w-2.5 h-2.5"  /> En Cajas
                          </span>
                        )}
                        <span className="text-[8px] font-mono text-neutral-400">
                          D6
                        </span>
                      </div>

                      {/* Mascot Preview */}
                      <div className={`my-0.5 ${!isUnlocked ? 'filter grayscale brightness-50' : ''}`}>
                        <Cube3DCanvas
                          character={char.type}
                          teamColor={isInSquad ? "blue" : undefined}
                          size={54}
                        />
                      </div>

                      <span className="text-xs font-black font-bungee truncate w-full text-white">
                        {char.displayName}
                      </span>
                      <span className="text-[9px] text-neutral-400 truncate w-full">
                        {char.abilityName}
                      </span>

                      {/* ADN Badges */}
                      <div className="flex gap-1 mt-1">
                        {char.classes.map(cls => (
                          <span
                            key={cls}
                            className="text-[8px] px-1 py-0.2 rounded font-bold"
                            style={{
                              backgroundColor: `${CATEGORY_INFO[cls].color}20`,
                              color: CATEGORY_INFO[cls].color
                            }}
                          >
                            {CATEGORY_INFO[cls].badge.split(' ')[0]}
                          </span>
                        ))}
                      </div>

                      {/* Overlay when locked */}
                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center p-2 text-center backdrop-blur-[1px]">
                          <GcSpriteIcon name="icon-lock" className="w-5 h-5 text-amber-400 mb-0.5"  />
                          <span className="text-[9px] font-black uppercase text-amber-300">
                            Bloqueado
                          </span>
                          <span className="text-[8px] text-neutral-300">
                            Toca para abrir caja
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE B: SEARCHING MATCHMAKING
           ========================================================================= */}
        {networkState.status === 'SEARCHING_MATCHMAKING' && (
          <div className="w-full max-w-md bg-[#121622]/95 border-2 border-yellow-400/60 rounded-3xl p-6 text-center shadow-2xl space-y-5 animate-pulse">
            <div className="w-16 h-16 rounded-full border-4 border-dashed border-yellow-400 animate-spin mx-auto flex items-center justify-center">
              <GcSpriteIcon name="icon-zap" className="w-7 h-7 text-yellow-300"  />
            </div>

            <div>
              <h3 className="text-xl font-black font-bungee text-white">
                BUSCANDO ESCUADRA RIVAL EN EL ASFALTO...
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                Conectando a la red de dados callejeros (Ping: 22ms) • Duelo 3 vs 3
              </p>
            </div>

            {/* Displaying your 3 search dice */}
            <div className="flex items-center justify-center gap-3 p-2 bg-[#0c0f16] rounded-2xl border border-yellow-400/40">
              {selectedSquad.map((h, i) => (
                <div key={i} className="flex flex-col items-center">
                  <Cube3DCanvas character={h} teamColor="blue" size={48} />
                  <span className="text-[9px] font-bold text-neutral-300">{CHARACTERS[h].displayName.slice(0, 7)}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onlineManager.leaveRoom()}
              className="px-4 py-2 rounded-xl bg-[#1e2536] hover:bg-[#283248] text-neutral-300 text-xs font-bold transition-all border border-neutral-700 cursor-pointer"
            >
              Cancelar Búsqueda
            </button>
          </div>
        )}

        {/* =========================================================================
            STATE C: IN ROOM LOBBY / WAITING FOR OPPONENT (3 VS 3 SQUADS READY)
           ========================================================================= */}
        {(networkState.status === 'WAITING_FOR_OPPONENT' || networkState.status === 'ROOM_LOBBY') && (
          <div className="w-full max-w-5xl bg-[#121622]/95 border-2 border-[#2b3850] rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md space-y-4 animate-fadeIn">
            {/* Room Code & Share Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-[#0a0d14] rounded-2xl border border-yellow-400/40">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded border border-yellow-400/40">
                  CÓDIGO DE SALA ONLINE
                </span>
                <span className="text-base sm:text-lg font-black font-mono tracking-widest text-white">
                  {networkState.roomCode}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyRoomCode}
                  className="px-3 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow cursor-pointer"
                >
                  {copied ? <GcSpriteIcon name="icon-check" className="w-3.5 h-3.5"  /> : <GcSpriteIcon name="icon-copy" className="w-3.5 h-3.5"  />}
                  <span>{copied ? '¡Copiado!' : 'Copiar Código'}</span>
                </button>

                <button
                  onClick={() => onlineManager.leaveRoom()}
                  className="px-3 py-1.5 rounded-xl bg-red-950 hover:bg-red-900 border border-red-500/60 text-red-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Abandonar
                </button>
              </div>
            </div>

            {/* Duelists Split Arena (Blue 3vs3 vs Red 3vs3) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Local Player: Escuadrón Azul (3 Dados) */}
              <div className="p-4 rounded-2xl bg-blue-950/40 border-2 border-cyan-400/60 flex flex-col items-center text-center relative overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded bg-blue-600 text-[10px] font-black uppercase text-white">
                    ESCUADRÓN AZUL (TÚ)
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    networkState.localPlayer.isReady ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {networkState.localPlayer.isReady ? '¡LISTO!' : 'PREPARANDO'}
                  </span>
                </div>

                {/* 3 Squad Dice Display */}
                <div className="grid grid-cols-3 gap-2 w-full my-2">
                  {selectedSquad.map((h, i) => (
                    <div key={i} className="p-2 rounded-xl bg-[#0d121c] border border-cyan-500/30 flex flex-col items-center">
                      <Cube3DCanvas character={h} teamColor="blue" size={62} />
                      <span className="text-[10px] font-black font-bungee text-white mt-1 truncate w-full">
                        {CHARACTERS[h].displayName}
                      </span>
                      <span className="text-[8px] text-cyan-300">Slot {i + 1}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-2 w-full flex gap-2">
                  <button
                    onClick={handleToggleReady}
                    className={`flex-1 py-2 rounded-xl font-black font-bungee text-xs uppercase tracking-wider transition-all shadow cursor-pointer ${
                      networkState.localPlayer.isReady
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-black'
                    }`}
                  >
                    {networkState.localPlayer.isReady ? 'LISTO (Toca para desmarcar)' : '¡MARCAR COMO LISTO!'}
                  </button>
                </div>
              </div>

              {/* Remote Player: Escuadrón Rojo (3 Dados) */}
              <div className="p-4 rounded-2xl bg-red-950/30 border-2 border-red-500/60 flex flex-col items-center text-center relative overflow-hidden shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded bg-red-600 text-[10px] font-black uppercase text-white">
                    ESCUADRÓN ROJO (RIVAL)
                  </span>
                  {networkState.remotePlayer && (
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      networkState.remotePlayer.isReady ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {networkState.remotePlayer.isReady ? '¡LISTO!' : 'PREPARANDO'}
                    </span>
                  )}
                </div>

                {networkState.remotePlayer ? (
                  <>
                    {/* 3 Rival Dice Display */}
                    <div className="grid grid-cols-3 gap-2 w-full my-2">
                      {(networkState.remotePlayer.heroes || [
                        CharacterType.CUBOGRO,
                        CharacterType.DRACUBON,
                        CharacterType.TRAMCUBOSO
                      ]).map((h, i) => (
                        <div key={i} className="p-2 rounded-xl bg-[#140b0e] border border-red-500/30 flex flex-col items-center">
                          <Cube3DCanvas character={h} teamColor="red" size={62} />
                          <span className="text-[10px] font-black font-bungee text-white mt-1 truncate w-full">
                            {CHARACTERS[h].displayName}
                          </span>
                          <span className="text-[8px] text-red-300">Rival {i + 1}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-2 text-xs font-bold text-neutral-300">
                      Rival: <span className="text-red-400 font-bungee">{networkState.remotePlayer.name}</span>
                    </div>
                  </>
                ) : (
                  <div className="my-auto py-8 flex flex-col items-center justify-center space-y-2">
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-red-400 animate-spin flex items-center justify-center" />
                    <span className="text-xs font-bold text-neutral-400">Esperando que se una el rival...</span>
                    <span className="text-[10px] text-neutral-500">Comparte el código arriba</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Taunts / Emotes Bar */}
            <div className="p-3 bg-[#0a0d14] rounded-2xl border border-neutral-800 space-y-2">
              <span className="text-[10px] font-black uppercase text-neutral-400 flex items-center gap-1.5">
                <GcSpriteIcon name="icon-message" className="w-3.5 h-3.5 text-yellow-400"  />
                <span>FRASES TÁCTICAS CALLEJERAS (ENVÍO RÁPIDO)</span>
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {QUICK_TAUNTS.map((taunt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendTaunt(taunt)}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#161d2b] hover:bg-[#222c40] border border-neutral-700 text-neutral-300 transition-all cursor-pointer"
                  >
                    "{taunt}"
                  </button>
                ))}
              </div>

              {/* Chat Message feed */}
              <div className="max-h-24 overflow-y-auto space-y-1 pt-1 border-t border-neutral-800/80">
                {networkState.messages.map(m => (
                  <div key={m.id} className="text-[11px] text-neutral-300 flex items-start gap-1.5">
                    <span className="text-[9px] text-neutral-500 font-mono">[{m.time}]</span>
                    <strong className="text-yellow-400">{m.sender}:</strong>
                    <span>{m.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar (Launch Match) */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleLaunchMatch}
                disabled={!networkState.remotePlayer}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 disabled:opacity-40 text-black font-black font-bungee text-sm tracking-wider shadow-[0_0_20px_rgba(251,191,36,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <GcSpriteIcon name="icon-swords" className="w-5 h-5 text-black"  />
                <span>¡INICIAR COMBATE 3 VS 3!</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 3. Crate Opening Modal */}
      {isOpeningCrate && (
        <CrateOpeningModal
          onClose={() => setIsOpeningCrate(false)}
          onSquadUpdated={() => {
            const updated = collectionManager.getUnlockedCharacters();
            setUnlockedHeroes(updated);
            setCoins(collectionManager.getCoins());
          }}
        />
      )}

      {/* 4. Aura & Pay What You Want Store Modal */}
      {showAuraShop && (
        <AuraShopModal
          onClose={() => setShowAuraShop(false)}
          onSquadUpdated={() => {
            const updated = collectionManager.getUnlockedCharacters();
            setUnlockedHeroes(updated);
            setCoins(collectionManager.getCoins());
          }}
        />
      )}

      {/* 5. Daily Missions & Streak Modal */}
      {showMissions && (
        <DailyMissionsModal
          onClose={() => setShowMissions(false)}
        />
      )}
    </div>
  );
};
