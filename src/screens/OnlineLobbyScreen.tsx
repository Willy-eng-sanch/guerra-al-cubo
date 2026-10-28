import React, { useState, useEffect } from 'react';
import { CharacterType } from '../types/game';
import { CHARACTER_LIST, CHARACTERS } from '../data/characters';
import { Cube3DCanvas } from '../components/Cube3DCanvas';
import { onlineManager, OnlineRoomState } from '../network/onlineMatchManager';
import { sound } from '../audio/soundManager';
import {
  ArrowLeft,
  Wifi,
  Users,
  Copy,
  Check,
  Play,
  Sparkles,
  MessageSquare,
  Shield,
  Zap,
  Swords,
  Radio
} from 'lucide-react';

interface OnlineLobbyScreenProps {
  onBack: () => void;
  onStartOnlineMatch: (playerHero: CharacterType, rivalHero: CharacterType, rivalName: string) => void;
}

const QUICK_TAUNTS = [
  "¡Que rueden los dados!",
  "¡Te voy a demoler en la acera!",
  "¡Cuidado con mi Super-Bloqueo!",
  "¡Buena tirada, pero no es suficiente!",
  "¡Los dados no perdonan!"
];

export const OnlineLobbyScreen: React.FC<OnlineLobbyScreenProps> = ({
  onBack,
  onStartOnlineMatch
}) => {
  const [networkState, setNetworkState] = useState<OnlineRoomState>(() => onlineManager['state']);
  const [inputRoomCode, setInputRoomCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [selectedHero, setSelectedHero] = useState<CharacterType>(CharacterType.CUBINJA);

  useEffect(() => {
    const unsubscribe = onlineManager.subscribe(setNetworkState);
    return () => unsubscribe();
  }, []);

  const handleCreateRoom = () => {
    sound.playDiceRoll();
    onlineManager.createRoom(selectedHero);
  };

  const handleJoinRoom = () => {
    if (!inputRoomCode.trim()) return;
    sound.playDiceRoll();
    onlineManager.joinRoom(inputRoomCode, selectedHero);
  };

  const handleQuickMatch = () => {
    sound.playDiceRoll();
    onlineManager.startQuickMatchmaking(selectedHero);
  };

  const handleToggleReady = () => {
    sound.playStanceActivate();
    onlineManager.toggleReady();
  };

  const handleSendTaunt = (text: string) => {
    sound.playCardDraw();
    onlineManager.sendTaunt(text);
  };

  const handleHeroChange = (hero: CharacterType) => {
    setSelectedHero(hero);
    onlineManager.selectHero(hero);
    sound.playDiceRoll();
  };

  const handleLaunchMatch = () => {
    if (!networkState.remotePlayer) return;
    sound.playDiceRoll();
    onlineManager.launchMatch();
    onStartOnlineMatch(
      networkState.localPlayer.hero,
      networkState.remotePlayer.hero,
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

  const localHeroDef = CHARACTERS[selectedHero];
  const remoteHero = networkState.remotePlayer?.hero || CharacterType.TRAMCUBOSO;
  const remoteHeroDef = CHARACTERS[remoteHero];

  return (
    <div
      className="relative w-full min-h-screen bg-[#0a0c12] text-white flex flex-col justify-between p-3 sm:p-5 select-none overflow-x-hidden bg-cover bg-center"
      style={{
        backgroundImage: `radial-gradient(ellipse at 50% 50%, rgba(10, 12, 18, 0.75) 0%, rgba(5, 7, 10, 0.95) 85%), url('/assets/aistudio/Gemini_Generated_Image_mexdy9mexdy9mexd_2dc8e00b.jpeg')`
      }}
    >
      {/* 1. Header Toolbar */}
      <header className="flex items-center justify-between border-b border-[#212b3d] pb-3 shrink-0">
        <button
          onClick={() => {
            onlineManager.leaveRoom();
            onBack();
          }}
          className="p-2 rounded-xl bg-[#161b26] hover:bg-[#202738] border border-[#2c374d] text-neutral-300 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Menú</span>
        </button>

        <div className="text-center">
          <h2 className="text-base sm:text-xl font-black tracking-wide text-white font-bungee flex items-center justify-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span>SALA DE DUELO ONLINE // P2P MULTIPLAYER</span>
          </h2>
          <p className="text-[10px] sm:text-xs text-yellow-400 font-bold">
            Interconexión en Vivo • Escuadrón Azul (Tú) vs Escuadrón Rojo (Rival)
          </p>
        </div>

        {/* Network latency status */}
        <div className="flex items-center gap-1.5 bg-[#121620] px-3 py-1.5 rounded-xl border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span>{networkState.pingMs}ms P2P</span>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="my-4 flex-1 flex flex-col items-center justify-center max-w-5xl w-full mx-auto">
        {/* =========================================================================
            STATE A: IDLE / NOT IN ROOM (MODES: QUICK MATCH, CREATE, JOIN)
           ========================================================================= */}
        {networkState.status === 'IDLE' && (
          <div className="w-full max-w-2xl bg-[#121622]/90 border-2 border-[#2b374e] rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-md space-y-6 text-center animate-fadeIn">
            <div>
              <span className="text-[10px] font-black uppercase text-cyan-300 tracking-widest bg-blue-950/80 px-2.5 py-1 rounded-full border border-cyan-400/40">
                LISTO PARA COMBATE EN RED
              </span>
              <h3 className="text-2xl font-black font-bungee text-white mt-2">
                ELIGE CÓMO CONECTARTE AL ASFALTO
              </h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1">
                Juega contra amigos creando una sala privada o busca rivales al instante con emparejamiento rápido.
              </p>
            </div>

            {/* Hero Selection Preview */}
            <div className="p-3 bg-[#0c0f17] rounded-2xl border border-cyan-500/30 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative shrink-0">
                <Cube3DCanvas
                  character={selectedHero}
                  teamColor="blue"
                  size={100}
                />
              </div>

              <div className="flex-1 text-left">
                <span className="text-[10px] font-black uppercase text-amber-400">
                  Tu Héroe Seleccionado (Escuadrón Azul):
                </span>
                <h4 className="text-lg font-black font-bungee text-white">
                  {localHeroDef.displayName}
                </h4>
                <p className="text-[11px] text-neutral-300">
                  {localHeroDef.description}
                </p>

                {/* Hero selector pills */}
                <div className="flex gap-1.5 mt-2 flex-wrap max-h-24 overflow-y-auto pr-1">
                  {CHARACTER_LIST.map(char => (
                    <button
                      key={char.type}
                      onClick={() => handleHeroChange(char.type)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                        selectedHero === char.type
                          ? 'bg-yellow-400 text-black border-yellow-300 font-black'
                          : 'bg-[#181d2a] text-neutral-400 border-neutral-700 hover:text-white'
                      }`}
                    >
                      {char.displayName.slice(0, 10)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3 Connection Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Option 1: Quick Matchmaking */}
              <button
                onClick={handleQuickMatch}
                className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-600/30 hover:from-yellow-500/30 hover:to-amber-600/40 border-2 border-yellow-400/60 shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer"
              >
                <Zap className="w-8 h-8 text-yellow-300 group-hover:scale-110 transition-transform" />
                <span className="font-black font-bungee text-sm text-yellow-300">
                  EMPAREJAMIENTO RÁPIDO
                </span>
                <span className="text-[10px] text-neutral-300">
                  Buscar rival aleatorio
                </span>
              </button>

              {/* Option 2: Create Private Room */}
              <button
                onClick={handleCreateRoom}
                className="p-4 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-700/30 hover:from-blue-600/30 hover:to-cyan-700/40 border-2 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer"
              >
                <Users className="w-8 h-8 text-cyan-300 group-hover:scale-110 transition-transform" />
                <span className="font-black font-bungee text-sm text-cyan-300">
                  CREAR SALA PRIVADA
                </span>
                <span className="text-[10px] text-neutral-300">
                  Generar código de sala
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
                  className="w-full bg-[#0d1017] border border-[#2d3950] rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-neutral-600 font-mono font-bold uppercase focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={!inputRoomCode.trim()}
                  className="w-full py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Unirse
                </button>
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
              <Zap className="w-7 h-7 text-yellow-300" />
            </div>

            <div>
              <h3 className="text-xl font-black font-bungee text-white">
                BUSCANDO RIVAL EN EL ASFALTO...
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                Conectando a la red de dados callejeros (Ping: 22ms)
              </p>
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
            STATE C: IN ROOM LOBBY / WAITING FOR OPPONENT
           ========================================================================= */}
        {(networkState.status === 'WAITING_FOR_OPPONENT' || networkState.status === 'ROOM_LOBBY') && (
          <div className="w-full max-w-4xl bg-[#121622]/95 border-2 border-[#2b3850] rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md space-y-4 animate-fadeIn">
            {/* Room Code & Share Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-[#0a0d14] rounded-2xl border border-yellow-400/40">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded border border-yellow-400/40">
                  CÓDIGO DE SALA
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
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
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

            {/* Duelists Split Arena (Blue Team vs Red Team) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Local Player: Escuadrón Azul */}
              <div className="p-4 rounded-2xl bg-blue-950/40 border-2 border-cyan-400/60 flex flex-col items-center text-center relative overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                <span className="absolute top-2 left-2 text-[8px] font-black uppercase bg-blue-900 text-cyan-200 px-2 py-0.5 rounded border border-cyan-400">
                  💙 ESCUADRÓN AZUL (TÚ)
                </span>

                <div className="my-2">
                  <Cube3DCanvas
                    character={selectedHero}
                    teamColor="blue"
                    size={110}
                  />
                </div>

                <h4 className="text-base font-black font-bungee text-white">
                  {networkState.localPlayer.name}
                </h4>
                <span className="text-xs text-cyan-300 font-bold">
                  {localHeroDef.displayName} • {localHeroDef.title}
                </span>

                {/* Hero selector options */}
                <div className="flex gap-1 mt-2 flex-wrap justify-center">
                  {CHARACTER_LIST.slice(0, 7).map(c => (
                    <button
                      key={c.type}
                      onClick={() => handleHeroChange(c.type)}
                      className={`text-[9px] px-1.5 py-0.5 rounded border ${
                        selectedHero === c.type
                          ? 'bg-cyan-400 text-black font-black border-white'
                          : 'bg-black/50 text-neutral-400 border-neutral-700'
                      }`}
                    >
                      {c.displayName.slice(0, 7)}
                    </button>
                  ))}
                </div>

                {/* Ready Toggle */}
                <button
                  onClick={handleToggleReady}
                  className={`mt-3 w-full py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all border shadow cursor-pointer ${
                    networkState.localPlayer.isReady
                      ? 'bg-emerald-500 text-black border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                      : 'bg-yellow-400 hover:bg-yellow-300 text-black border-yellow-300'
                  }`}
                >
                  {networkState.localPlayer.isReady ? '✓ ¡ESTÁS LISTO!' : 'PULSAR: ¡ESTOY LISTO!'}
                </button>
              </div>

              {/* Remote Player: Escuadrón Rojo */}
              <div className="p-4 rounded-2xl bg-red-950/40 border-2 border-red-500/60 flex flex-col items-center text-center relative overflow-hidden shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                <span className="absolute top-2 left-2 text-[8px] font-black uppercase bg-red-900 text-red-200 px-2 py-0.5 rounded border border-red-500">
                  ❤️ ESCUADRÓN ROJO (RIVAL)
                </span>

                {networkState.remotePlayer ? (
                  <>
                    <div className="my-2">
                      <Cube3DCanvas
                        character={remoteHero}
                        teamColor="red"
                        size={110}
                      />
                    </div>

                    <h4 className="text-base font-black font-bungee text-white">
                      {networkState.remotePlayer.name}
                    </h4>
                    <span className="text-xs text-red-300 font-bold">
                      {remoteHeroDef.displayName} • {remoteHeroDef.title}
                    </span>

                    <div className="mt-auto w-full pt-4">
                      <span
                        className={`inline-block w-full py-2 rounded-xl font-black text-xs uppercase tracking-wider border ${
                          networkState.remotePlayer.isReady
                            ? 'bg-emerald-500 text-black border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                            : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                        }`}
                      >
                        {networkState.remotePlayer.isReady ? '✓ RIVAL LISTO' : 'ESPERANDO AL RIVAL...'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-3">
                    <div className="w-12 h-12 rounded-full border-3 border-dashed border-red-400 animate-spin flex items-center justify-center">
                      <Users className="w-6 h-6 text-red-400" />
                    </div>
                    <span className="text-xs font-black uppercase text-red-300">
                      ESPERANDO A QUE SE UNA UN RIVAL...
                    </span>
                    <span className="text-[10px] text-neutral-400 max-w-xs">
                      Pásale el código <b>{networkState.roomCode}</b> a un amigo para que entre en la sala.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Street Taunts & Live Messages */}
            <div className="p-3 bg-[#0a0d14] rounded-2xl border border-[#232c40] space-y-2">
              <span className="text-[10px] font-black uppercase text-yellow-400 tracking-wider flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                CHAT Y PROVOCACIONES CALLEJERAS
              </span>

              {/* Quick Taunts Pills */}
              <div className="flex gap-1.5 flex-wrap">
                {QUICK_TAUNTS.map((taunt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendTaunt(taunt)}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-[#161c28] hover:bg-[#202738] border border-neutral-700 hover:border-yellow-400 text-neutral-300 hover:text-white transition-all cursor-pointer"
                  >
                    "{taunt}"
                  </button>
                ))}
              </div>

              {/* Recent messages log */}
              <div className="max-h-20 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
                {networkState.messages.map(msg => (
                  <div key={msg.id} className="text-neutral-300">
                    <span className="text-neutral-500 text-[9px] mr-1">[{msg.time}]</span>
                    <b className={msg.isSystem ? 'text-yellow-400' : 'text-cyan-400'}>{msg.sender}:</b> {msg.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Match Button (Host / when ready) */}
            <button
              onClick={handleLaunchMatch}
              disabled={!networkState.remotePlayer}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:brightness-110 disabled:opacity-40 text-black font-black font-bungee text-sm sm:text-base tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(251,191,36,0.4)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-black" />
              <span>¡ENTRAR A LA ARENA DE COMBATE ONLINE!</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
