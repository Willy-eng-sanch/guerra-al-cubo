import React, { useState, useEffect } from 'react';
import { CharacterType } from '../types/game';
import { CHARACTER_LIST, CHARACTERS } from '../data/characters';
import { Cube3DCanvas } from '../components/Cube3DCanvas';
import { Model3DViewerModal } from '../components/Model3DViewerModal';
import { 
  ArrowLeft, 
  Play, 
  Dices, 
  Shield, 
  Swords, 
  Sparkles, 
  Check, 
  Users, 
  Eye, 
  Volume2, 
  Box 
} from 'lucide-react';
import { sound } from '../audio/soundManager';

interface SetupScreenProps {
  onStartBattle: (playerTeam: CharacterType[], rivalTeam: CharacterType[]) => void;
  onGoToDraft: () => void;
  onBack: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStartBattle, onGoToDraft, onBack }) => {
  // Player squad: 3 slots for the 3 characters
  const [playerTeam, setPlayerTeam] = useState<[CharacterType, CharacterType, CharacterType]>([
    CharacterType.CUBOGRO,
    CharacterType.FLAUCUBISTA_DESAFINADO,
    CharacterType.GLADIACUBON
  ]);
  const [activeSlot, setActiveSlot] = useState<0 | 1 | 2>(0);
  const [inspectingCharType, setInspectingCharType] = useState<CharacterType | null>(null);

  const selectedHeroDef = CHARACTERS[playerTeam[activeSlot]];

  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Handle picking a character for the active slot
  const handleSelectCharacter = (charType: CharacterType) => {
    sound.playPunchHit();

    setPlayerTeam(prev => {
      const nextTeam = [...prev] as [CharacterType, CharacterType, CharacterType];
      // Check if already in another slot
      const existingIdx = nextTeam.indexOf(charType);
      if (existingIdx !== -1) {
        // Swap slots so there are never duplicates!
        nextTeam[existingIdx] = nextTeam[activeSlot];
      }
      nextTeam[activeSlot] = charType;
      return nextTeam;
    });

    // Advance to next slot in sequence
    setActiveSlot(prev => ((prev + 1) % 3) as 0 | 1 | 2);
  };

  // Launch battle with the 3 chosen characters
  const handleLaunchBattle = () => {
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

  return (
    <div className="relative w-full min-h-screen bg-[#0d0f14] p-4 md:p-6 text-white flex flex-col justify-between max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#232b3d] pb-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-[#171c26] hover:bg-[#202736] border border-[#2c374d] text-neutral-300 transition-all flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Menú</span>
        </button>

        <h2 className="text-base md:text-lg font-black tracking-wide text-white font-bungee flex items-center gap-2">
          <span>ELIGE TUS 3 CUBOS URBANOS</span>
        </h2>

        <div className="text-right">
          <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700 px-2.5 py-1 rounded-full font-mono font-bold">
            BANDO AZUL (3 HÉROES)
          </span>
        </div>
      </div>

      <div className="space-y-4 my-3 overflow-y-auto pr-1">

        {/* 3 Squad Slots Header */}
        <div className="bg-[#121622] border-2 border-[#263148] rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Tu Escuadrón (3 Integrantes)</span>
            </span>
            <span className="text-[11px] text-neutral-400">
              Haz clic en una ranura para editarla
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {playerTeam.map((charType, idx) => {
              const hero = CHARACTERS[charType];
              const isSelectedSlot = activeSlot === idx;

              return (
                <div
                  key={idx}
                  onClick={() => setActiveSlot(idx as 0 | 1 | 2)}
                  className={`relative p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-between ${
                    isSelectedSlot
                      ? 'bg-[#1e2638] border-yellow-400 shadow-[0_0_15px_rgba(255,214,0,0.3)] scale-[1.02]'
                      : 'bg-[#151a27] border-[#29344d] hover:border-cyan-400/60 opacity-90'
                  }`}
                >
                  <div className="w-full flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black text-amber-300 bg-black/40 px-2 py-0.5 rounded-full">
                      RANURA {idx + 1}
                    </span>
                    {isSelectedSlot && (
                      <span className="bg-cyan-500 text-black text-[8px] font-black px-1.5 py-0.2 rounded-full">
                        EDITANDO
                      </span>
                    )}
                  </div>

                  {hero.model3dImage ? (
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 border-amber-400 overflow-hidden relative shadow bg-[#0a0d13]">
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundImage: `url(${hero.model3dImage})`,
                          backgroundSize: '300% 100%',
                          backgroundPosition: '50% center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/85 text-[7px] text-amber-300 font-mono text-center font-black">
                        3D RENDER
                      </span>
                    </div>
                  ) : (
                    <img
                      src={hero.avatar}
                      alt={hero.displayName}
                      className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover border-2 border-cyan-400/80 shadow"
                    />
                  )}

                  <div className="text-center w-full mt-1.5">
                    <h4 className="text-xs md:text-sm font-black text-white truncate">
                      {hero.displayName}
                    </h4>
                    <span className="text-[9px] text-cyan-300 truncate block">
                      {hero.title}
                    </span>
                  </div>

                  {charType === CharacterType.GLADIACUBON && (
                    <span className="mt-1 text-[8px] bg-amber-950 text-amber-300 border border-amber-500 px-1.5 py-0.2 rounded-full font-bold">
                      Arma inicial extra
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Slot Detailed View */}
        <div className="bg-[#141824] border-2 border-yellow-400/50 rounded-2xl p-3 md:p-4 flex flex-col md:flex-row items-center gap-4 shadow-xl">
          <div className="flex-shrink-0 flex flex-col items-center">
            {selectedHeroDef.model3dImage ? (
              <div 
                onClick={() => setInspectingCharType(selectedHeroDef.type)}
                className="relative w-24 h-24 rounded-xl border-2 border-amber-400 overflow-hidden cursor-pointer group bg-[#0a0d13] shadow-md"
              >
                <div 
                  className="w-full h-full group-hover:scale-105 transition-transform"
                  style={{
                    backgroundImage: `url(${selectedHeroDef.model3dImage})`,
                    backgroundSize: '300% 100%',
                    backgroundPosition: '50% center',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] text-amber-300 font-mono text-center font-black">
                  VER 3D
                </span>
              </div>
            ) : (
              <Cube3DCanvas character={playerTeam[activeSlot]} size={96} />
            )}

            <span
              className="text-[10px] font-black px-2.5 py-0.5 rounded-full mt-1 border"
              style={{
                backgroundColor: `${selectedHeroDef.primaryColor}25`,
                borderColor: selectedHeroDef.primaryColor,
                color: selectedHeroDef.primaryColor
              }}
            >
              {selectedHeroDef.title}
            </span>
          </div>

          <div className="text-left flex-1 w-full space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base md:text-lg font-black text-white flex items-center gap-2">
                  <span>{selectedHeroDef.displayName}</span>
                  {selectedHeroDef.hasCustom3DModel && (
                    <span className="bg-emerald-950 text-emerald-300 text-[8px] font-bold px-1.5 py-0.2 rounded border border-emerald-500">
                      3D ACTIVO
                    </span>
                  )}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInspectingCharType(selectedHeroDef.type)}
                  className="p-1.5 rounded-lg bg-[#20293a] hover:bg-[#2c384e] text-cyan-300 text-xs border border-cyan-800"
                  title="Ver Modelo 3D & Video"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setInspectingCharType(selectedHeroDef.type)}
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-black flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Modelo 3D</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              {selectedHeroDef.description}
            </p>

            <div className="bg-[#0d1017] p-2 rounded-xl border border-[#252f44] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black text-yellow-400 block">
                  ★ {selectedHeroDef.abilityName}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {selectedHeroDef.abilityDescription}
                </span>
              </div>
              {selectedHeroDef.selectionQuote && (
                <span className="text-[10px] italic text-neutral-400 hidden sm:block max-w-[200px] truncate">
                  "{selectedHeroDef.selectionQuote}"
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 13 Available Characters Grid */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Elige un personaje para la Ranura {activeSlot + 1} (13 Disponibles)</span>
            </label>
            <span className="text-[10px] text-neutral-400">
              Sin repetición · Al elegir uno ya en equipo se intercambia
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {CHARACTER_LIST.map(char => {
              const inSlotIdx = playerTeam.indexOf(char.type);
              const isInTeam = inSlotIdx !== -1;
              const isCurrentSlot = playerTeam[activeSlot] === char.type;

              return (
                <button
                  key={char.type}
                  onClick={() => handleSelectCharacter(char.type)}
                  className={`relative p-2.5 rounded-xl border text-left transition-all ${
                    isCurrentSlot
                      ? 'bg-[#1f283d] border-yellow-400 shadow-md ring-1 ring-yellow-400 scale-[1.02]'
                      : isInTeam
                      ? 'bg-[#151c29] border-blue-600/60 opacity-90'
                      : 'bg-[#12151f] border-[#222a3a] hover:border-yellow-400 hover:scale-[1.01]'
                  }`}
                >
                  {isInTeam && (
                    <span className="absolute top-1 right-1 bg-cyan-500 text-black text-[7px] font-black px-1 rounded-full flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" />
                      <span>R{inSlotIdx + 1}</span>
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    {char.model3dImage ? (
                      <div className="w-9 h-9 rounded-lg border border-amber-400 overflow-hidden relative shrink-0 bg-[#0a0d13]">
                        <div
                          className="w-full h-full"
                          style={{
                            backgroundImage: `url(${char.model3dImage})`,
                            backgroundSize: '300% 100%',
                            backgroundPosition: '50% center',
                            backgroundRepeat: 'no-repeat'
                          }}
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-black/85 text-[6px] text-amber-300 font-mono text-center font-black">
                          3D
                        </span>
                      </div>
                    ) : (
                      <img
                        src={char.avatar}
                        alt={char.displayName}
                        className="w-9 h-9 rounded-lg object-cover border border-neutral-700 shrink-0"
                      />
                    )}

                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center gap-1">
                        <h4 className="text-[11px] font-black text-white truncate">
                          {char.displayName}
                        </h4>
                        {char.hasCustom3DModel && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        )}
                      </div>
                      <span className="text-[8px] text-neutral-400 truncate block">
                        {char.title}
                      </span>
                    </div>
                  </div>

                  <p className="text-[8px] text-neutral-300 mt-1 line-clamp-2 leading-tight">
                    {char.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="border-t border-[#232b3d] pt-3 flex flex-col sm:flex-row items-center gap-2.5">
        <button
          onClick={handleLaunchBattle}
          className="w-full sm:flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 active:scale-[0.98] text-black font-black text-sm md:text-base rounded-xl shadow-xl flex items-center justify-center gap-2 border-2 border-emerald-300 transition-all"
        >
          <Play className="w-5 h-5 fill-black" />
          <span>ENTRAR A LA BATALLA CON ESTE EQUIPO (3 VS 3)</span>
        </button>

        <button
          onClick={onGoToDraft}
          className="w-full sm:w-auto px-4 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 active:scale-[0.98] text-black font-black text-xs md:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 border-2 border-amber-300 transition-all shrink-0"
        >
          <Dices className="w-4 h-4" />
          <span>Sortear Selección con Dados (Draft D5)</span>
        </button>
      </div>

      {/* Model 3D Viewer Modal */}
      {inspectingCharType && (
        <Model3DViewerModal
          character={CHARACTERS[inspectingCharType]}
          onClose={() => setInspectingCharType(null)}
        />
      )}
    </div>
  );
};
