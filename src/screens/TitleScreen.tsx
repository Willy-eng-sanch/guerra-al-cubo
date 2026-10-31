import React, { useState, useEffect } from 'react';
import { Cube3DCanvas } from '../components/Cube3DCanvas';
import { InteractiveTacticalTutorial } from '../components/InteractiveTacticalTutorial';
import { DownloadApkModal } from '../components/DownloadApkModal';
import { AuraShopModal } from '../components/AuraShopModal';
import { DailyMissionsModal } from '../components/DailyMissionsModal';
import { AudioControlBar } from '../components/AudioControlBar';
import { collectionManager } from '../data/collectionManager';
import { dailyMissionsManager } from '../data/dailyMissionsManager';
import { CharacterType } from '../types/game';
import { Swords, Trophy, Users, Shield, BookOpen, HelpCircle, Download, Zap, Package, Heart, Crown, Flame, Calendar, History } from 'lucide-react';

interface TitleScreenProps {
  onStartClick: () => void;
  onDraftClick: () => void;
  onCampaignClick: () => void;
  onPassAndPlayClick: () => void;
  onRosterClick: () => void;
  onCardsClick: () => void;
  onOnlineClick: () => void;
  onReplayArchiveClick: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartClick,
  onDraftClick,
  onCampaignClick,
  onPassAndPlayClick,
  onRosterClick,
  onCardsClick,
  onOnlineClick,
  onReplayArchiveClick
}) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showDownloadApk, setShowDownloadApk] = useState(false);
  const [showAuraShop, setShowAuraShop] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [auraRank, setAuraRank] = useState(() => collectionManager.getAuraRank());
  const [unopenedBoxes, setUnopenedBoxes] = useState(() => collectionManager.getUnopenedBoxes());
  const [unclaimedMissions, setUnclaimedMissions] = useState(() => dailyMissionsManager.getUnclaimedMissionsCount());
  const [canClaimStreak, setCanClaimStreak] = useState(() => dailyMissionsManager.canClaimStreakToday());
  const [streakDay, setStreakDay] = useState(() => dailyMissionsManager.getCurrentStreak());

  useEffect(() => {
    const unsubCol = collectionManager.subscribe(() => {
      setAuraRank(collectionManager.getAuraRank());
      setUnopenedBoxes(collectionManager.getUnopenedBoxes());
    });
    const unsubMis = dailyMissionsManager.subscribe(() => {
      setUnclaimedMissions(dailyMissionsManager.getUnclaimedMissionsCount());
      setCanClaimStreak(dailyMissionsManager.canClaimStreakToday());
      setStreakDay(dailyMissionsManager.getCurrentStreak());
    });
    return () => {
      unsubCol();
      unsubMis();
    };
  }, []);

  return (
    <div className="gc-screen gc-screen--menu relative w-full min-h-screen overflow-y-auto flex flex-col p-3 sm:p-5 bg-[#0f1116]">
      {/* Background Banner with Dark Vignette */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/aistudio/Gemini_Generated_Image_mexdy9mexdy9mexd_2dc8e00b.jpeg"
          alt="Guerra Cubita Street Dice Arena"
          className="w-full h-full object-cover opacity-30 filter blur-[0.5px] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f1116]/85 via-[#0f1116]/65 to-[#0f1116]/95" />
      </div>

      {/* Header Bar with Beta Badge & Aura Status */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-2 max-w-xl mx-auto w-full pt-1">
        <div className="flex items-center gap-2">
          <div className="bg-[#ff1744] text-white text-[10px] md:text-xs font-black tracking-widest px-2.5 py-1 rounded-full border-2 border-yellow-300 shadow-md flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
            <span>BETA 1.0 LANZAMIENTO</span>
          </div>
          <AudioControlBar />
        </div>

        {/* Aura, Misiones & Cajas Quick Status Buttons */}
        <div className="flex items-center gap-2">
          {/* Daily Streak & Missions Quick Button */}
          <button
            onClick={() => setShowMissions(true)}
            className="p-1 px-2.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-yellow-400/60 text-yellow-300 transition-all flex items-center gap-1.5 text-xs font-mono font-bold shadow cursor-pointer"
            title="Misiones Diarias y Racha de 7 Días"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400 animate-bounce" />
            <span>Día {streakDay}</span>
            {(canClaimStreak || unclaimedMissions > 0) && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setShowAuraShop(true)}
            className="p-1 px-2.5 rounded-full bg-[#161d2b] hover:bg-[#222c40] border border-cyan-400/50 text-cyan-300 transition-all flex items-center gap-1.5 text-xs font-mono font-bold shadow cursor-pointer"
            title="Ver tu Nivel de Aura y Cajas de Dados"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>{auraRank.currentAura} Aura</span>
            {unopenedBoxes > 0 && (
              <span className="bg-yellow-400 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full">
                {unopenedBoxes} 🎁
              </span>
            )}
          </button>

          <button
            onClick={() => setShowDownloadApk(true)}
            className="p-1.5 px-3 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 transition-all flex items-center gap-1.5 text-xs font-bold shadow"
            title="Descargar APK o Instalar en Android"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">APK</span>
          </button>

          <button
            onClick={() => setShowTutorial(true)}
            className="p-1.5 px-3 rounded-full bg-[#1b2130]/80 hover:bg-[#283248] border border-[#3b4765] text-yellow-400 transition-all flex items-center gap-1.5 text-xs font-bold shadow"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Reglas</span>
          </button>
        </div>
      </header>

      {/* Main Title & 3D Centerpiece */}
      <div className="relative z-10 flex flex-col items-center justify-center my-2 text-center max-w-xl mx-auto w-full">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-wider font-bungee drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
          GUERRA CUBITA
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-cyan-400 tracking-wide mt-0.5">
          Duelo Táctico de Dados D6 Callejeros · Rotoscopia
        </p>

        {/* Mascot 3D Combat Die with Aura Glow */}
        <div className="my-2 sm:my-3 relative flex items-center justify-center">
          <div
            className="absolute w-36 h-36 rounded-full blur-2xl pointer-events-none"
            style={{ backgroundColor: auraRank.auraGlowCss }}
          />
          <Cube3DCanvas
            character={CharacterType.CUBINJA}
            teamId={1}
            size={130}
            hasPreparedStance={true}
          />
        </div>

        <div className="flex items-center gap-2 max-w-xs mx-auto">
          <span
            className="text-[9px] font-black px-2 py-0.5 rounded-full border text-black font-mono shadow"
            style={{ backgroundColor: auraRank.colorHex, borderColor: auraRank.colorHex }}
          >
            {auraRank.rankTitle}
          </span>
          <span className="text-[11px] text-neutral-400">
            · Sube de Aura ganando partidas
          </span>
        </div>
      </div>

      {/* Navigation Buttons Dock */}
      <div className="gc-menu-actions relative z-10 flex flex-col gap-2.5 max-w-md mx-auto w-full pb-4">
        <div className="gc-menu-section-label">JUGAR</div>
        {/* MODO ALEATORIO (LA DEMO GRATUITA) */}
        <button
          onClick={onDraftClick}
          className="w-full py-3.5 bg-gradient-to-r from-[#ff1744] via-[#e11d48] to-[#c51162] hover:brightness-110 active:scale-[0.98] text-white font-black text-sm md:text-base rounded-2xl shadow-xl border-2 border-yellow-300 flex flex-col items-center justify-center gap-0.5 tracking-wider transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="bg-yellow-400 text-black text-[9px] font-black px-2 py-0.5 rounded-md font-mono tracking-widest">
              DEMO GRATIS
            </span>
            <Swords className="w-5 h-5 text-yellow-300" />
            <span>MODO ALEATORIO (INICIATIVA D6)</span>
          </div>
          <span className="text-[10px] text-yellow-200/90 font-mono font-medium tracking-normal">
            ¡Juega gratis sin coste! Tira iniciativa · 6 dados al azar · ¡Gana Aura y Cajas!
          </span>
        </button>

        {/* Online Multiplayer Beta */}
        <button
          onClick={onOnlineClick}
          className="w-full py-3 bg-gradient-to-r from-blue-600/40 via-cyan-600/30 to-blue-700/40 hover:brightness-125 active:scale-[0.98] text-cyan-300 font-black text-xs md:text-sm rounded-xl border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.35)] flex items-center justify-center gap-2 tracking-wide transition-all cursor-pointer"
        >
          <Users className="w-4 h-4 text-cyan-300" />
          <span>🌐 MULTIJUGADOR BETA (SALAS PRIVADAS & DEMO ONLINE)</span>
        </button>

        {/* Direct Squad Selection */}
        <button
          onClick={onStartClick}
          className="w-full py-3 bg-[#171c28] hover:bg-[#222a3d] active:scale-[0.98] text-yellow-300 font-extrabold text-xs md:text-sm rounded-xl border border-yellow-500/40 flex items-center justify-center gap-2 tracking-wide transition-all shadow-md"
        >
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>ELEGIR MIS 3 PERSONAJES</span>
        </button>

        <div className="gc-menu-section-label">TUS PARTIDAS</div>
        <button
          onClick={onReplayArchiveClick}
          aria-label="Abrir mis partidas guardadas"
          className="gc-menu-primary w-full py-3 bg-gradient-to-r from-cyan-950/90 to-blue-950/80 hover:brightness-125 active:scale-[0.98] text-cyan-100 font-black text-xs md:text-sm rounded-xl border border-cyan-400/60 flex items-center justify-center gap-2 transition-all shadow-lg"
        >
          <History className="w-4 h-4 text-cyan-300" />
          <span>MIS PARTIDAS · VER REPETICIONES</span>
        </button>

        <div className="gc-menu-section-label">GUÍA Y COLECCIÓN</div>
        {/* Tutorial & Manual Táctico */}
        <button
          onClick={() => setShowTutorial(true)}
          className="w-full py-2.5 bg-[#141824] hover:bg-[#1d2538] active:scale-[0.98] text-neutral-300 font-bold text-xs rounded-xl border border-[#263148] flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-yellow-400" />
          <span>Manual Táctico (50 Cartas & Clases)</span>
        </button>

        {/* Campaign & Pass and Play */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onCampaignClick}
            className="py-3 bg-[#1e2746] hover:bg-[#283561] active:scale-[0.98] text-cyan-300 border border-cyan-500/40 font-bold text-xs md:text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>CAMPAÑA</span>
          </button>

          <button
            onClick={onPassAndPlayClick}
            className="py-3 bg-[#004d40] hover:bg-[#00695c] active:scale-[0.98] text-emerald-300 border border-emerald-500/40 font-bold text-xs md:text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <Users className="w-4 h-4 text-emerald-300" />
            <span>PASE Y JUEGA</span>
          </button>
        </div>

        {/* Roster & Encyclopedia */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onRosterClick}
            className="py-2.5 bg-[#151922] hover:bg-[#1d2331] text-cyan-400 border border-[#2b354c] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
          >
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>13 CUBOS (ADN)</span>
          </button>

          <button
            onClick={onCardsClick}
            className="py-2.5 bg-[#151922] hover:bg-[#1d2331] text-yellow-400 border border-[#2b354c] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
          >
            <BookOpen className="w-4 h-4 text-yellow-400" />
            <span>50 CARTAS (GDD)</span>
          </button>
        </div>
      </div>

      {showTutorial && <InteractiveTacticalTutorial onDismiss={() => setShowTutorial(false)} />}
      {showDownloadApk && <DownloadApkModal onDismiss={() => setShowDownloadApk(false)} />}
      {showAuraShop && <AuraShopModal onClose={() => setShowAuraShop(false)} />}
      {showMissions && <DailyMissionsModal onClose={() => setShowMissions(false)} />}
    </div>
  );
};
