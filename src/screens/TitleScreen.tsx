import React, { useState } from 'react';
import { Cube3DCanvas } from '../components/Cube3DCanvas';
import { InteractiveTacticalTutorial } from '../components/InteractiveTacticalTutorial';
import { DownloadApkModal } from '../components/DownloadApkModal';
import { AudioControlBar } from '../components/AudioControlBar';
import { CharacterType } from '../types/game';
import { Swords, Trophy, Users, Shield, BookOpen, HelpCircle, Download } from 'lucide-react';

interface TitleScreenProps {
  onStartClick: () => void;
  onDraftClick: () => void;
  onCampaignClick: () => void;
  onPassAndPlayClick: () => void;
  onRosterClick: () => void;
  onCardsClick: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartClick,
  onDraftClick,
  onCampaignClick,
  onPassAndPlayClick,
  onRosterClick,
  onCardsClick
}) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showDownloadApk, setShowDownloadApk] = useState(false);

  return (
    <div className="relative w-full min-h-screen overflow-hidden flex flex-col justify-between p-4 md:p-6 select-none bg-[#0f1116]">
      {/* Background Banner with Dark Vignette */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/aistudio/Gemini_Generated_Image_mexdy9mexdy9mexd_2dc8e00b.jpeg"
          alt="Guerra Cubita Street Dice Arena"
          className="w-full h-full object-cover opacity-30 filter blur-[0.5px] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f1116]/85 via-[#0f1116]/65 to-[#0f1116]/95" />
      </div>

      {/* Header Bar with Audio Controls */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-2 max-w-xl mx-auto w-full pt-2">
        <div className="flex items-center gap-2">
          <div className="bg-[#ff1744] text-white text-[10px] md:text-xs font-black tracking-widest px-3 py-1 rounded-full border-2 border-yellow-300 shadow-md">
            ARENA D6 TÁCTICA
          </div>
          <AudioControlBar />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDownloadApk(true)}
            className="p-1.5 px-3 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 transition-all flex items-center gap-1.5 text-xs font-bold shadow"
            title="Descargar APK o Instalar en Android"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Descargar APK</span>
          </button>

          <button
            onClick={() => setShowTutorial(true)}
            className="p-2 rounded-full bg-[#1b2130]/80 hover:bg-[#283248] border border-[#3b4765] text-yellow-400 transition-all flex items-center gap-1.5 text-xs font-bold px-3 shadow"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Reglas</span>
          </button>
        </div>
      </header>

      {/* Main Title & 3D Centerpiece */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center max-w-xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-wider font-bungee drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
          GUERRA CUBITA
        </h1>
        <p className="text-xs md:text-sm font-semibold text-cyan-400 tracking-wide mt-1">
          Duelo Táctico de Dados D6 Callejeros · Rotoscopia
        </p>

        {/* Mascot 3D Combat Die */}
        <div className="my-5 relative flex items-center justify-center">
          <div className="absolute w-44 h-44 rounded-full bg-cyan-500/15 blur-2xl pointer-events-none" />
          <Cube3DCanvas
            character={CharacterType.CUBINJA}
            teamId={1}
            size={160}
            hasPreparedStance={true}
          />
        </div>

        <p className="text-[11px] text-neutral-400 max-w-xs mx-auto">
          Dados D6 tácticos · Equipo Azul vs Equipo Rojo · Arte rotoscopia y manual de 50 cartas
        </p>
      </div>

      {/* Navigation Buttons Dock */}
      <div className="relative z-10 flex flex-col gap-2.5 max-w-md mx-auto w-full pb-4">
        {/* Draft 3 vs 3 Mode Button */}
        <button
          onClick={onDraftClick}
          className="w-full py-3.5 bg-gradient-to-r from-[#ff1744] to-[#c51162] hover:brightness-110 active:scale-[0.98] text-white font-black text-sm md:text-base rounded-2xl shadow-xl border-2 border-yellow-300 flex items-center justify-center gap-2.5 tracking-wider transition-all"
        >
          <Swords className="w-5 h-5 text-yellow-300" />
          <span>DRAFT 3 VS 3 (INICIATIVA D6)</span>
        </button>

        {/* Direct Squad Selection (Choose all 3 characters) */}
        <button
          onClick={onStartClick}
          className="w-full py-3 bg-[#171c28] hover:bg-[#222a3d] active:scale-[0.98] text-yellow-300 font-extrabold text-xs md:text-sm rounded-xl border border-yellow-500/40 flex items-center justify-center gap-2 tracking-wide transition-all shadow-md"
        >
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>SELECCIONAR TUS 3 PERSONAJES (DIRECTO)</span>
        </button>

        {/* Tutorial & Manual Táctico Button */}
        <button
          onClick={() => setShowTutorial(true)}
          className="w-full py-3 bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-orange-500/25 hover:brightness-125 active:scale-[0.98] text-yellow-300 font-extrabold text-xs md:text-sm rounded-xl border border-yellow-400/60 flex items-center justify-center gap-2 tracking-wide transition-all shadow-md cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-yellow-400" />
          <span>TUTORIAL RÁPIDO & MANUAL TÁCTICO (GDD)</span>
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
    </div>
  );
};
