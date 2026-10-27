import React, { useState } from 'react';
import { CharacterType } from '../types/game';
import { CHARACTER_LIST, CHARACTERS } from '../data/characters';
import { ArrowLeft, Play, Users } from 'lucide-react';

interface PassAndPlaySetupScreenProps {
  onStartBattle: (playerCount: number, heroes: CharacterType[]) => void;
  onBack: () => void;
}

export const PassAndPlaySetupScreen: React.FC<PassAndPlaySetupScreenProps> = ({
  onStartBattle,
  onBack
}) => {
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [chosenHeroes, setChosenHeroes] = useState<CharacterType[]>([
    CharacterType.TRAMCUBOSO,
    CharacterType.CUBINJA,
    CharacterType.CUBOGRO,
    CharacterType.FLAUCUBISTA_DESAFINADO
  ]);

  const updatePlayerHero = (playerIdx: number, hero: CharacterType) => {
    const updated = [...chosenHeroes];
    updated[playerIdx] = hero;
    setChosenHeroes(updated);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#0f1116] p-4 md:p-6 text-white flex flex-col justify-between max-w-2xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#232b3d] pb-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-[#171c26] hover:bg-[#202736] border border-[#2c374d] text-neutral-300 transition-all flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </button>

        <h2 className="text-base md:text-lg font-black tracking-wide text-white font-bungee">
          PASE Y JUEGA LOCAL
        </h2>

        <div className="w-16" />
      </div>

      <div className="space-y-4 my-4 overflow-y-auto pr-1">
        <div>
          <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1 mb-2">
            <Users className="w-4 h-4" />
            <span>Número de Jugadores Humanos (2 a 4)</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[2, 3, 4].map(count => (
              <button
                key={count}
                onClick={() => setPlayerCount(count)}
                className={`py-3 rounded-xl border text-sm font-black transition-all ${
                  playerCount === count
                    ? 'bg-[#00695c] text-white border-emerald-400 shadow-md scale-105'
                    : 'bg-[#151922] text-neutral-400 border-[#283248]'
                }`}
              >
                {count} Jugadores
              </button>
            ))}
          </div>
        </div>

        {/* Players Card List */}
        <div className="space-y-3">
          {Array.from({ length: playerCount }).map((_, idx) => {
            const currentHero = chosenHeroes[idx];
            const def = CHARACTERS[currentHero];
            return (
              <div
                key={idx}
                className="bg-[#151a24] p-3 rounded-xl border border-[#2a3449] flex items-center justify-between gap-3 shadow"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={def.avatar}
                    alt={def.displayName}
                    className="w-12 h-12 rounded-xl object-cover border-2"
                    style={{ borderColor: def.primaryColor }}
                  />
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">
                      Jugador {idx + 1}
                    </span>
                    <h4 className="text-sm font-extrabold text-white">{def.displayName}</h4>
                    <span className="text-[10px] text-yellow-400 font-medium">{def.title}</span>
                  </div>
                </div>

                {/* Dropdown Hero Selector */}
                <select
                  value={currentHero}
                  onChange={e => updatePlayerHero(idx, e.target.value as CharacterType)}
                  className="bg-[#0f1219] text-xs font-bold text-neutral-200 border border-[#3b4763] rounded-lg p-2 focus:ring-1 focus:ring-emerald-400 outline-none"
                >
                  {CHARACTER_LIST.map(c => (
                    <option key={c.type} value={c.type}>
                      {c.displayName}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => onStartBattle(playerCount, chosenHeroes.slice(0, playerCount))}
        className="w-full py-4 bg-[#00695c] hover:bg-[#004d40] active:scale-[0.98] text-white font-black text-base rounded-2xl shadow-xl border border-emerald-400 flex items-center justify-center gap-2 tracking-wider transition-all"
      >
        <Play className="w-5 h-5 fill-white" />
        <span>INICIAR DUELO LOCAL</span>
      </button>
    </div>
  );
};
