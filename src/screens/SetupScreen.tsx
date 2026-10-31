import React, { useState, useEffect } from 'react';
import { GcSpriteIcon } from '../ui/SpriteUI';
import { CharacterType } from '../types/game';
import { CHARACTER_LIST, CHARACTERS } from '../data/characters';
import { DiceCupShaker } from '../components/DiceCupShaker';
import { HeroDiceCard } from '../components/HeroDiceCard';
import { Dice3DVisual } from '../components/Dice3DVisual';
import { sound } from '../audio/soundManager';

interface SetupScreenProps {
  onStartBattle: (playerTeam: CharacterType[], rivalTeam: CharacterType[]) => void;
  onGoToDraft: () => void;
  onBack: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStartBattle, onGoToDraft, onBack }) => {
  // Player squad: 3 dice
  const [playerTeam, setPlayerTeam] = useState<CharacterType[]>([
    CharacterType.CUBOGRO,
    CharacterType.FLAUCUBISTA_DESAFINADO,
    CharacterType.GLADIACUBON
  ]);
  const [inspectedCharType, setInspectedCharType] = useState<CharacterType | null>(null);

  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Add die to cup (max 3)
  const handleAddDieToCup = (charType: CharacterType) => {
    sound.playCupShake();
    setInspectedCharType(null);

    setPlayerTeam(prev => {
      if (prev.includes(charType)) return prev;
      if (prev.length >= 3) {
        // Swap last
        return [prev[1], prev[2], charType];
      }
      return [...prev, charType];
    });
  };

  // Remove die from cup
  const handleRemoveDieFromCup = (charType: CharacterType) => {
    sound.playCardDraw();
    setPlayerTeam(prev => prev.filter(c => c !== charType));
  };

  // Launch battle with the 3 chosen characters
  const handleLaunchBattle = () => {
    if (playerTeam.length < 3) return;

    // Generate rival team of 3 characters from the 10 remaining characters (no duplicates!)
    const remainingPool = CHARACTER_LIST
      .map(c => c.type)
      .filter(type => !playerTeam.includes(type))
      .sort(() => Math.random() - 0.5);

    const rivalTeam: CharacterType[] = [
      remainingPool[0],
      remainingPool[1],
      remainingPool[2]
    ];

    onStartBattle(playerTeam, rivalTeam);
  };

  const inspectedHero = inspectedCharType ? CHARACTERS[inspectedCharType] : null;

  return (
    <div
      className="gc-screen relative w-full min-h-screen bg-[#0d0f14] p-3 sm:p-5 text-white flex flex-col justify-between max-w-6xl mx-auto select-none overflow-y-auto"
      style={{
        backgroundImage: `radial-gradient(ellipse at 50% 50%, rgba(13, 15, 20, 0.85) 0%, rgba(10, 12, 16, 0.96) 85%), url('/assets/aistudio/Gemini_Generated_Image_mexdy9mexdy9mexd_2dc8e00b.jpeg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 35%'
      }}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#232b3d] pb-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-[#171c26] hover:bg-[#202736] border border-[#2c374d] text-neutral-300 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
        >
          <GcSpriteIcon name="icon-back" className="w-4 h-4"  />
          <span>Volver al Menú</span>
        </button>

        <h2 className="text-base md:text-lg font-black tracking-wide text-white font-bungee flex items-center gap-2">
          <span>VASO DE DADOS HEROICOS (3 VS 3)</span>
        </h2>

        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700 px-2.5 py-1 rounded-full font-mono font-bold hidden sm:inline">
            BANDO AZUL ({playerTeam.length}/3 DADOS)
          </span>

          <button
            onClick={handleLaunchBattle}
            disabled={playerTeam.length < 3}
            className={`py-1.5 px-3 rounded-xl font-black text-xs uppercase tracking-wide flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              playerTeam.length === 3
                ? 'bg-yellow-400 hover:bg-yellow-300 text-black border border-yellow-200 animate-pulse'
                : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed opacity-50'
            }`}
          >
            <GcSpriteIcon name="icon-swords" className="w-3.5 h-3.5"  />
            <span>INICIAR ({playerTeam.length}/3)</span>
          </button>
        </div>
      </div>

      <div className="space-y-4 my-3 pr-1">

        {/* Central Shaker Cup for Setup */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <div className="md:col-span-8">
            <DiceCupShaker
              team={playerTeam}
              maxCapacity={3}
              onDropDie={handleAddDieToCup}
              onRemoveDie={handleRemoveDieFromCup}
              onLaunch={handleLaunchBattle}
              isReadyToLaunch={playerTeam.length === 3}
              cupTitle="TU VASO DE COMBATE"
              cupSubtitle="Arrastra tus dados aquí o haz clic para ver info y 2do clic para agregarlo"
            />
          </div>

          <div className="md:col-span-4 bg-[#141824] border-2 border-[#263148] rounded-3xl p-4 space-y-3">
            <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider font-bungee flex items-center gap-1.5">
              <GcSpriteIcon name="icon-spark" className="w-4 h-4 text-amber-400"  />
              <span>Modo Selección Libre</span>
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Mete 3 dados en el vaso para iniciar la batalla. También puedes optar por el sorteo D6 por iniciativa y turnos de reclutamiento.
            </p>

            <button
              onClick={onGoToDraft}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 active:scale-[0.98] text-black font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 border border-amber-300 transition-all cursor-pointer"
            >
              <GcSpriteIcon name="icon-dice" className="w-4 h-4 text-black"  />
              <span>Ir al Modo Aleatorio (Iniciativa D6 & Reparto)</span>
            </button>
          </div>
        </div>

        {/* Inspected Hero Die Spotlight Banner */}
        {inspectedHero && (
          <div className="bg-gradient-to-r from-[#172033] via-[#1b253b] to-[#121927] border-2 border-yellow-400 rounded-3xl p-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <Dice3DVisual
                character={inspectedHero.type}
                size={58}
                glowColor={inspectedHero.primaryColor}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-yellow-400 bg-yellow-950 px-2 py-0.5 rounded-full border border-yellow-600">
                    DADO INSPECCIONADO
                  </span>
                  <h3 className="text-base font-black text-white font-bungee">
                    {inspectedHero.displayName}
                  </h3>
                </div>
                <p className="text-xs text-cyan-300 font-bold mt-0.5">
                  {inspectedHero.title} · Habilidad: ★ {inspectedHero.abilityName}
                </p>
                <p className="text-[11px] text-neutral-200 mt-1 max-w-xl leading-relaxed">
                  {inspectedHero.description}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleAddDieToCup(inspectedHero.type)}
              disabled={playerTeam.includes(inspectedHero.type)}
              className="w-full md:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black font-black text-xs md:text-sm shadow-xl flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <GcSpriteIcon name="icon-dice" className="w-4 h-4 text-black"  />
              <span>{playerTeam.includes(inspectedHero.type) ? 'YA EN EL VASO' : 'LLEVAR AL VASO (2º CLIC)'}</span>
            </button>
          </div>
        )}

        {/* 13 Available Characters Grid */}
        <div className="bg-[#121622] border-2 border-[#263148] rounded-3xl p-3 md:p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2 px-1">
            <label className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5 font-bungee">
              <GcSpriteIcon name="icon-spark" className="w-4 h-4 text-yellow-400"  />
              <span>Pool de Dados Héroe (13 Disponibles)</span>
            </label>
            <span className="text-[10px] text-neutral-400">
              1er clic = info & clases · 2do clic o arrastrar = al vaso
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {CHARACTER_LIST.map(char => {
              const isInCup = playerTeam.includes(char.type);
              const isInspected = inspectedCharType === char.type;

              return (
                <HeroDiceCard
                  key={char.type}
                  char={char}
                  isInspected={isInspected}
                  isPickedByPlayer={isInCup}
                  isPickedByRival={false}
                  canPick={true}
                  onFirstClickInspect={() => {
                    setInspectedCharType(char.type);
                    sound.playCardDraw();
                  }}
                  onSecondClickAddToCup={() => {
                    handleAddDieToCup(char.type);
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Persistent Bottom Launch Bar */}
      <div className="sticky bottom-0 z-30 pt-3 pb-1 bg-gradient-to-t from-[#0d0f14] via-[#0d0f14]/95 to-transparent">
        <div className="p-3.5 rounded-2xl bg-[#141926] border-2 border-yellow-400/80 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-yellow-400 text-black">
              <GcSpriteIcon name="icon-dice" className="w-5 h-5"  />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white font-bungee">
                  VASO DE COMBATE ({playerTeam.length}/3 DADOS)
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  playerTeam.length === 3 ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' : 'bg-amber-950 text-amber-300 border border-amber-600'
                }`}>
                  {playerTeam.length === 3 ? '¡Listo para pelear!' : `Elige ${3 - playerTeam.length} más`}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {playerTeam.map(t => (
                  <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#1f283c] text-neutral-200 border border-[#334263]">
                    {CHARACTERS[t].displayName}
                  </span>
                ))}
                {playerTeam.length === 0 && (
                  <span className="text-[11px] text-neutral-400">Haz clic en los dados del pool para agregarlos</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleLaunchBattle}
            disabled={playerTeam.length < 3}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl ${
              playerTeam.length === 3
                ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 hover:brightness-110 active:scale-95 text-black border-2 border-white animate-bounce'
                : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed opacity-60'
            }`}
          >
            <GcSpriteIcon name="icon-swords" className="w-5 h-5"  />
            <span>
              {playerTeam.length === 3
                ? '⚔️ ¡INICIAR PARTIDA EN LA ARENA!'
                : `METE ${3 - playerTeam.length} DADO(S) MÁS AL VASO`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
