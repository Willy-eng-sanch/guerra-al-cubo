import React, { useState } from 'react';
import { GcSpriteIcon } from '../ui/SpriteUI';
import { CampaignChapter, CharacterType } from '../types/game';
import { CHARACTERS } from '../data/characters';
interface CampaignScreenProps {
  chapters: CampaignChapter[];
  onStartChapter: (chapter: CampaignChapter, hero: CharacterType) => void;
  onBack: () => void;
}

export const CampaignScreen: React.FC<CampaignScreenProps> = ({
  chapters,
  onStartChapter,
  onBack
}) => {
  const [selectedChapter, setSelectedChapter] = useState<CampaignChapter>(chapters[0]);
  const [chosenHero, setChosenHero] = useState<CharacterType>(CharacterType.TRAMCUBOSO);

  const bossDef = CHARACTERS[selectedChapter.bossCharacter];

  return (
    <div className="gc-screen relative w-full min-h-screen bg-[#0f1116] p-4 md:p-6 text-white flex flex-col justify-between max-w-2xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#232b3d] pb-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-[#171c26] hover:bg-[#202736] border border-[#2c374d] text-neutral-300 transition-all flex items-center gap-1.5 text-xs font-bold"
        >
          <GcSpriteIcon name="icon-back" className="w-4 h-4"  />
          <span>Volver</span>
        </button>

        <h2 className="text-base md:text-lg font-black tracking-wide text-white font-bungee">
          CAMPAÑA CALLEJERA
        </h2>

        <div className="w-16" />
      </div>

      <div className="space-y-4 my-4 pr-1">
        {/* Chapter Selection Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {chapters.map(ch => {
            const active = selectedChapter.id === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => setSelectedChapter(ch)}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  active
                    ? 'bg-[#1e2746] border-cyan-400 shadow-md ring-1 ring-cyan-400'
                    : 'bg-[#141822] border-[#252f44] opacity-80 hover:opacity-100'
                }`}
              >
                {ch.isCompleted && (
                  <GcSpriteIcon name="icon-check" className="w-4 h-4 text-emerald-400 absolute top-2 right-2"  />
                )}
                <span className="text-[10px] font-extrabold text-cyan-400 block">
                  CAPÍTULO {ch.id}
                </span>
                <span className="text-xs font-bold text-white line-clamp-1 mt-0.5">
                  {ch.title.split(': ')[1] || ch.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Chapter Showcase */}
        <div className="bg-[#151a25] border border-[#2b354c] rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-yellow-400 tracking-wider">
              {selectedChapter.title}
            </span>
            <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2.5 py-0.5 rounded-full border border-neutral-700">
              {selectedChapter.rewardDescription}
            </span>
          </div>

          <p className="text-xs text-neutral-300 mb-4">{selectedChapter.subtitle}</p>

          {/* Boss and Minions */}
          <div className="bg-[#0f121a] p-3 rounded-xl border border-[#252f43] mb-4">
            <span className="text-[10px] font-black text-red-400 uppercase tracking-wider block mb-2">
              Jefe de Arena:
            </span>
            <div className="flex items-center gap-3">
              <img
                src={bossDef.avatar}
                alt={bossDef.displayName}
                className="w-14 h-14 rounded-xl object-cover border-2 border-red-500 shadow-lg"
              />
              <div>
                <h4 className="text-sm font-black text-white">{bossDef.displayName}</h4>
                <p className="text-[11px] text-yellow-400">{bossDef.title}</p>
                <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-2">
                  {bossDef.description}
                </p>
              </div>
            </div>

            {selectedChapter.minionCharacters.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[#252f43] flex items-center gap-2">
                <span className="text-[10px] font-bold text-neutral-400">Esbirros:</span>
                <div className="flex gap-2">
                  {selectedChapter.minionCharacters.map(m => {
                    const mDef = CHARACTERS[m];
                    return (
                      <span
                        key={m}
                        className="text-[10px] bg-[#1a2232] text-neutral-200 px-2 py-0.5 rounded border border-[#2c3850]"
                      >
                        {mDef.displayName}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Player Hero Choice */}
          <div>
            <label className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
              Tu Cubo Combatiente:
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {Object.values(CHARACTERS).map(c => {
                const active = chosenHero === c.type;
                return (
                  <button
                    key={c.type}
                    onClick={() => setChosenHero(c.type)}
                    className={`p-1.5 rounded-xl border flex flex-col items-center transition-all ${
                      active
                        ? 'bg-[#1f283c] border-cyan-400 ring-1 ring-cyan-400 scale-105'
                        : 'bg-[#11141c] border-[#202737] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={c.avatar}
                      alt={c.displayName}
                      className="w-9 h-9 rounded-lg object-cover"
                    />
                    <span className="text-[8px] font-bold text-neutral-300 truncate w-full mt-1 text-center">
                      {c.displayName.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => onStartChapter(selectedChapter, chosenHero)}
        className="w-full py-4 bg-[#1e2746] hover:bg-[#283561] active:scale-[0.98] text-cyan-300 font-black text-base rounded-2xl shadow-xl border border-cyan-400 flex items-center justify-center gap-2 tracking-wider transition-all"
      >
        <GcSpriteIcon name="icon-swords" className="w-5 h-5 text-cyan-300"  />
        <span>DESAFIAR JEFE DEL CAPÍTULO</span>
      </button>
    </div>
  );
};
