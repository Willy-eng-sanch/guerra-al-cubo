import React, { useState, useEffect } from 'react';
import { dailyMissionsManager, DailyMission, DayStreakReward } from '../data/dailyMissionsManager';
import { sound } from '../audio/soundManager';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Swords,
  Shield,
  Layers,
  Zap,
  Flame,
  Calendar,
  Gift,
  CheckCircle2,
  Lock,
  Sparkles,
  X,
  Coins,
  Package,
  Clock
} from 'lucide-react';

interface DailyMissionsModalProps {
  onClose: () => void;
}

export const DailyMissionsModal: React.FC<DailyMissionsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'MISSIONS' | 'STREAK'>('MISSIONS');
  const [missions, setMissions] = useState<DailyMission[]>(() => dailyMissionsManager.getMissions());
  const [currentStreak, setCurrentStreak] = useState<number>(() => dailyMissionsManager.getCurrentStreak());
  const [canClaimStreak, setCanClaimStreak] = useState<boolean>(() => dailyMissionsManager.canClaimStreakToday());
  const streakRewards = dailyMissionsManager.getStreakRewards();

  useEffect(() => {
    const unsub = dailyMissionsManager.subscribe(() => {
      setMissions(dailyMissionsManager.getMissions());
      setCurrentStreak(dailyMissionsManager.getCurrentStreak());
      setCanClaimStreak(dailyMissionsManager.canClaimStreakToday());
    });
    return unsub;
  }, []);

  const handleClaimMission = (missionId: string) => {
    sound.playCardDraw();
    const ok = dailyMissionsManager.claimMission(missionId);
    if (ok) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const handleClaimStreak = () => {
    sound.playDiceRoll();
    const reward = dailyMissionsManager.claimDailyStreak();
    if (reward) {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.5 }
      });
    }
  };

  const getMissionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trophy':
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 'Swords':
        return <Swords className="w-5 h-5 text-red-400" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-cyan-400" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-emerald-400" />;
      default:
        return <Zap className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="gc-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-xl bg-[#11141c] border-2 border-yellow-400/80 rounded-3xl p-4 sm:p-6 shadow-2xl text-white relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Subtle street background glows */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#222a3a] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-yellow-400/20 border border-yellow-400 flex items-center justify-center text-yellow-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-yellow-400 tracking-wider">
                RETENCIÓN & RECOMPENSAS CALLEJERAS
              </div>
              <h2 className="text-lg sm:text-xl font-black font-bungee text-white">
                MISIONES & RACHA DIARIA
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#1b2230] hover:bg-[#263145] text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => setActiveTab('MISSIONS')}
            className={`py-2.5 rounded-xl font-black text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'MISSIONS'
                ? 'bg-yellow-400 text-black shadow-lg font-bungee'
                : 'bg-[#181f2c] text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>MISIONES DE HOY</span>
            {missions.filter(m => m.isCompleted && !m.isClaimed).length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('STREAK')}
            className={`py-2.5 rounded-xl font-black text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'STREAK'
                ? 'bg-yellow-400 text-black shadow-lg font-bungee'
                : 'bg-[#181f2c] text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>RACHA DE 7 DÍAS</span>
            {canClaimStreak && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>
        </div>

        {/* Tab 1: Daily Missions */}
        {activeTab === 'MISSIONS' && (
          <div className="space-y-3 overflow-y-auto pr-1">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-blue-500/30 flex items-center justify-between text-xs text-neutral-300">
              <span className="flex items-center gap-1.5 font-bold">
                <Clock className="w-4 h-4 text-cyan-400" />
                Se reinician diariamente a la medianoche
              </span>
              <span className="text-yellow-400 font-bold font-mono">
                {missions.filter(m => m.isClaimed).length} / {missions.length} Reclamadas
              </span>
            </div>

            {missions.map(mission => {
              const pct = Math.min(100, Math.floor((mission.currentProgress / mission.targetProgress) * 100));

              return (
                <div
                  key={mission.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    mission.isClaimed
                      ? 'bg-[#131720]/60 border-neutral-800 opacity-60'
                      : mission.isCompleted
                      ? 'bg-gradient-to-r from-emerald-950/50 to-[#121926] border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-[#151a24] border-[#252f42]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-black/40 border border-neutral-700 flex items-center justify-center shrink-0">
                        {getMissionIcon(mission.iconName)}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-white font-bungee">
                          {mission.title}
                        </h4>
                        <p className="text-[11px] text-neutral-300">
                          {mission.description}
                        </p>
                      </div>
                    </div>

                    {/* Reward Badge */}
                    <div className="shrink-0 text-right">
                      <div className="text-[10px] font-black uppercase text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-lg border border-yellow-400/30 flex items-center gap-1">
                        {mission.rewardType === 'COINS' && <Coins className="w-3 h-3 text-yellow-400" />}
                        {mission.rewardType === 'AURA' && <Zap className="w-3 h-3 text-yellow-400" />}
                        {mission.rewardType === 'BOX' && <Package className="w-3 h-3 text-yellow-400" />}
                        <span>+{mission.rewardAmount} {mission.rewardType === 'BOX' ? 'Caja' : mission.rewardType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar & Claim Button */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="flex-1">
                      <div className="flex justify-between text-[10px] font-bold text-neutral-400 mb-1">
                        <span>Progreso</span>
                        <span className="font-mono text-white">{mission.currentProgress} / {mission.targetProgress}</span>
                      </div>
                      <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-neutral-700">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      {mission.isClaimed ? (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Reclamada</span>
                        </div>
                      ) : mission.isCompleted ? (
                        <button
                          onClick={() => handleClaimMission(mission.id)}
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs shadow-lg animate-pulse cursor-pointer transform active:scale-95"
                        >
                          ¡RECLAMAR!
                        </button>
                      ) : (
                        <div className="text-[10px] font-bold text-neutral-500 px-3 py-1.5 bg-black/30 rounded-xl border border-neutral-800">
                          En curso ({pct}%)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: 7-Day Login Streak */}
        {activeTab === 'STREAK' && (
          <div className="space-y-3 overflow-y-auto pr-1">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/50 via-purple-950/50 to-amber-950/50 border border-yellow-400/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-yellow-300">Racha Actual</span>
                <div className="text-base sm:text-lg font-black font-bungee text-white flex items-center gap-1.5">
                  <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-bounce" />
                  <span>DÍA {currentStreak} DE 7</span>
                </div>
              </div>

              {canClaimStreak ? (
                <button
                  onClick={handleClaimStreak}
                  className="px-5 py-2.5 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 hover:brightness-110 text-black font-black font-bungee text-xs rounded-xl shadow-lg animate-pulse cursor-pointer transform active:scale-95"
                >
                  ¡RECLAMAR HOY!
                </button>
              ) : (
                <div className="text-xs text-neutral-400 bg-black/40 px-3 py-1.5 rounded-xl border border-neutral-700 flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>¡Reclamado hoy! Vuelve mañana</span>
                </div>
              )}
            </div>

            {/* 7 Days Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {streakRewards.map(reward => {
                const isClaimed = reward.day < currentStreak || (!canClaimStreak && reward.day === currentStreak);
                const isToday = reward.day === currentStreak && canClaimStreak;
                const isFuture = reward.day > currentStreak;

                return (
                  <div
                    key={reward.day}
                    className={`p-3 rounded-2xl border text-center transition-all relative overflow-hidden flex flex-col justify-between ${
                      reward.isSpecial
                        ? 'col-span-2 sm:col-span-2 bg-gradient-to-br from-yellow-950/80 via-amber-900/60 to-purple-950/70 border-yellow-400 shadow-[0_0_20px_rgba(251,191,36,0.3)]'
                        : isToday
                        ? 'bg-gradient-to-br from-yellow-500/20 to-amber-600/30 border-yellow-400 ring-2 ring-yellow-400/50 shadow-lg'
                        : isClaimed
                        ? 'bg-[#121620]/70 border-emerald-500/40 opacity-75'
                        : 'bg-[#151922] border-[#242e40] opacity-60'
                    }`}
                  >
                    <div>
                      <div className="text-[10px] font-black uppercase text-neutral-400 mb-1">
                        DÍA {reward.day}
                      </div>

                      <div className="w-10 h-10 mx-auto rounded-xl bg-black/40 border border-neutral-700 flex items-center justify-center my-1">
                        {reward.boxes > 0 ? (
                          <Package className="w-6 h-6 text-yellow-400 animate-bounce" />
                        ) : (
                          <Coins className="w-5 h-5 text-amber-400" />
                        )}
                      </div>

                      <div className="text-xs font-black text-white font-bungee">
                        {reward.boxes > 0 ? '1 CAJA (3 DADOS)' : `+${reward.coins} MONEDAS`}
                      </div>

                      <div className="text-[10px] text-cyan-300 font-bold">
                        +{reward.aura} Aura
                      </div>
                    </div>

                    <div className="mt-2 pt-1 border-t border-white/10">
                      {isClaimed ? (
                        <span className="text-[10px] text-emerald-400 font-black flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Reclamado
                        </span>
                      ) : isToday ? (
                        <span className="text-[10px] text-yellow-400 font-black animate-pulse">
                          ¡DISPONIBLE HOY!
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-500 flex items-center justify-center gap-1 font-bold">
                          <Lock className="w-3 h-3" /> Bloqueado
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="border-t border-[#222a3a] pt-3 mt-3 flex items-center justify-between text-[11px] text-neutral-400">
          <span>Gana combates para completar misiones automáticamente.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#1b2230] hover:bg-[#263145] text-neutral-300 font-bold text-xs transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
