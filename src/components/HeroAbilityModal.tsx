import React, { useState } from 'react';
import { CharacterDef, CharacterType, PlayerState } from '../types/game';
import { Sparkles, Zap, Shield, X, Check, Dices, Target, Snowflake, Info, Swords } from 'lucide-react';

interface HeroAbilityModalProps {
  character: CharacterDef;
  player: PlayerState;
  validTargets: PlayerState[];
  selectedTargetId: number | null;
  onClose: () => void;
  onActivate: (targetId?: number, extraOption?: number) => void;
  canUseSupplyMagic: boolean;
  supplyMagicUnavailableReason: string;
}

export const HeroAbilityModal: React.FC<HeroAbilityModalProps> = ({
  character,
  player,
  validTargets,
  selectedTargetId,
  onClose,
  onActivate,
  canUseSupplyMagic,
  supplyMagicUnavailableReason
}) => {
  const [currentTargetId, setCurrentTargetId] = useState<number | null>(
    selectedTargetId || (validTargets.length > 0 ? validTargets[0].id : null)
  );
  const [fluteBet, setFluteBet] = useState<number>(3);
  const [dracubonBlockerId, setDracubonBlockerId] = useState<number | null>(() =>
    validTargets.find(target => target.id === selectedTargetId)?.id ?? validTargets[0]?.id ?? null
  );
  const [dracubonSecondTargetId, setDracubonSecondTargetId] = useState<number | null>(() =>
    validTargets.find(target => target.id !== dracubonBlockerId)?.id ?? null
  );

  const heroType = character.type;
  const isCooldown = player.abilityCooldownRemaining > 0;
  const isFrozen = player.isFrozen;
  const isDracubon = heroType === CharacterType.DRACUBON;

  // Does this ability require choosing a rival?
  const needsTarget = heroType === CharacterType.CUBITO_DE_HIELO || heroType === CharacterType.PIRATA || heroType === CharacterType.CUBICULA;
  const needsActionPoint = heroType === CharacterType.CUBICULA || isDracubon;
  // Does this ability have a betting mechanic?
  const isFlute = heroType === CharacterType.FLAUCUBISTA_DESAFINADO;
  const isSupplyMagic = heroType === CharacterType.HADA_AL_CUBO;

  const canActivate = !isCooldown && !isFrozen &&
    (!needsTarget || currentTargetId !== null) &&
    (!isDracubon || (validTargets.length >= 2 && dracubonBlockerId !== null && dracubonSecondTargetId !== null && dracubonBlockerId !== dracubonSecondTargetId)) &&
    (!needsActionPoint || player.actionPoints > 0) &&
    (!isSupplyMagic || canUseSupplyMagic);

  const handleConfirmActivate = () => {
    if (!canActivate) return;
    if (isDracubon) {
      // targetId = quien tira bloqueo por ambos; extraOption = segundo rival alcanzado.
      onActivate(dracubonBlockerId ?? undefined, dracubonSecondTargetId ?? undefined);
      return;
    }
    onActivate(
      needsTarget ? (currentTargetId || undefined) : undefined,
      isFlute ? fluteBet : undefined
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn select-none">
      <div 
        className="relative w-full max-w-lg bg-[#0e121a] border-2 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white animate-scaleUp"
        style={{ borderColor: `${character.primaryColor}aa` }}
      >
        {/* Top Header */}
        <div 
          className="px-5 py-3.5 border-b border-[#21293c] flex items-center justify-between"
          style={{ background: `linear-gradient(90deg, ${character.primaryColor}25, #141924)` }}
        >
          <div className="flex items-center gap-2.5">
            {character.model3dImage ? (
              <div className="w-10 h-10 rounded-xl border border-yellow-400 overflow-hidden relative shadow bg-black shrink-0">
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${character.model3dImage})`,
                    backgroundSize: '300% 100%',
                    backgroundPosition: '50% center',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              </div>
            ) : (
              <img
                src={character.avatar}
                alt={character.displayName}
                className="w-10 h-10 rounded-xl object-cover border border-neutral-700 shrink-0"
              />
            )}

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">{character.displayName}</h3>
                <span 
                  className="text-[9px] font-black px-2 py-0.5 rounded-full border uppercase"
                  style={{ 
                    backgroundColor: `${character.primaryColor}30`,
                    borderColor: character.primaryColor,
                    color: character.primaryColor
                  }}
                >
                  {character.abilityCooldownMax > 0 ? 'Activa con Cooldown' : 'Habilidad Especial'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">{character.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#1a2130] hover:bg-[#253046] text-neutral-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Ability Title & Status */}
          <div className="bg-[#141a26] border border-[#232c40] p-3.5 rounded-xl space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-yellow-400 flex items-center gap-1.5 tracking-wider">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>{character.abilityName}</span>
              </span>

              {isCooldown ? (
                <span className="bg-red-950 text-red-300 border border-red-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                  Recarga: {player.abilityCooldownRemaining} turno(s)
                </span>
              ) : isFrozen ? (
                <span className="bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Snowflake className="w-3 h-3" />
                  Congelado
                </span>
              ) : (
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Lista para Usar
                </span>
              )}
            </div>

            <p className="text-sm font-bold text-neutral-100">
              {character.abilityDescription}
            </p>
          </div>

          {/* Full Rule & Detailed Description */}
          <div className="bg-[#10141f] border border-[#1e2536] p-3.5 rounded-xl space-y-1.5">
            <span className="text-[10px] font-black uppercase text-neutral-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Regla Detallada de Combate</span>
            </span>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {character.description}
            </p>
          </div>

          {isSupplyMagic && !canUseSupplyMagic && !isCooldown && !isFrozen && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 text-xs text-amber-200">
              {supplyMagicUnavailableReason}
            </div>
          )}

          {/* Interactive Input 1: Flaucubista Lucky Number Bet */}
          {isFlute && !isCooldown && !isFrozen && (
            <div className="bg-[#151c2b] border-2 border-yellow-500/50 p-4 rounded-xl space-y-2.5">
              <span className="text-xs font-black text-yellow-300 flex items-center gap-1.5">
                <Dices className="w-4 h-4 text-yellow-400" />
                <span>Elige tu número de la suerte para el D5 (1 a 5):</span>
              </span>
              <p className="text-[11px] text-neutral-300">
                Si tu tirada del D5 acierta tu número elegido, harás 2 de daño ineludible a todos los rivales y te curarás.
              </p>
              
              <div className="grid grid-cols-5 gap-2 pt-1">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFluteBet(num)}
                    className={`py-3 rounded-xl font-mono text-base font-black transition-all flex flex-col items-center justify-center border-2 ${
                      fluteBet === num
                        ? 'bg-yellow-400 text-black border-yellow-200 shadow-[0_0_15px_rgba(255,215,0,0.5)] scale-105'
                        : 'bg-[#1e2536] text-neutral-300 border-[#2f3a52] hover:bg-[#283348]'
                    }`}
                  >
                    <span>{num}</span>
                    <span className="text-[8px] font-sans opacity-70">D5</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Aliento: dos rivales y un defensor designado para una tirada compartida */}
          {isDracubon && !isCooldown && !isFrozen && (
            <div className="bg-[#151c2b] border-2 border-red-500/50 p-4 rounded-xl space-y-3">
              <div className="space-y-1">
                <span className="text-xs font-black text-red-300 flex items-center gap-1.5">
                  <Swords className="w-4 h-4 text-red-400" />
                  <span>Elige los dos rivales alcanzados por Aliento:</span>
                </span>
                <p className="text-[11px] text-neutral-300">Solo uno de ellos realizará la tirada de bloqueo; ese resultado se aplicará a ambos.</p>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-amber-300">1. Rival que bloquea por ambos</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {validTargets.map(target => {
                    const selected = dracubonBlockerId === target.id;
                    return (
                      <button
                        key={`dracubon-blocker-${target.id}`}
                        type="button"
                        onClick={() => {
                          setDracubonBlockerId(target.id);
                          if (dracubonSecondTargetId === target.id) {
                            setDracubonSecondTargetId(validTargets.find(candidate => candidate.id !== target.id)?.id ?? null);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${selected ? 'bg-red-950/80 border-red-400 ring-1 ring-red-400' : 'bg-[#1b2230] border-[#293448] hover:bg-[#232c3f]'}`}
                      >
                        <div>
                          <span className="text-xs font-black block text-white">{target.name}</span>
                          <span className="text-[10px] text-neutral-400">{target.hp} / {target.maxHp} HP</span>
                        </div>
                        {selected && <span className="text-[9px] font-black text-red-200">TIRA</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-cyan-300">2. Segundo rival alcanzado</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {validTargets.filter(target => target.id !== dracubonBlockerId).map(target => {
                    const selected = dracubonSecondTargetId === target.id;
                    return (
                      <button
                        key={`dracubon-second-${target.id}`}
                        type="button"
                        onClick={() => setDracubonSecondTargetId(target.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${selected ? 'bg-cyan-950/80 border-cyan-400 ring-1 ring-cyan-400' : 'bg-[#1b2230] border-[#293448] hover:bg-[#232c3f]'}`}
                      >
                        <div>
                          <span className="text-xs font-black block text-white">{target.name}</span>
                          <span className="text-[10px] text-neutral-400">{target.hp} / {target.maxHp} HP</span>
                        </div>
                        {selected && <Check className="w-4 h-4 text-cyan-300" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              {validTargets.length < 2 && (
                <p className="text-[11px] text-amber-200">Se necesitan al menos dos rivales vivos para usar Aliento.</p>
              )}
            </div>
          )}

          {/* Interactive Input 2: Target Selection (Cubito de Hielo / Pirata) */}
          {needsTarget && !isCooldown && !isFrozen && (
            <div className="bg-[#151c2b] border-2 border-cyan-500/50 p-4 rounded-xl space-y-2.5">
              <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>Selecciona el objetivo para tu habilidad:</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {validTargets.map(target => {
                  const isSelected = currentTargetId === target.id;
                  return (
                    <button
                      key={target.id}
                      type="button"
                      onClick={() => setCurrentTargetId(target.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-cyan-950/80 border-cyan-400 shadow-md ring-1 ring-cyan-400'
                          : 'bg-[#1b2230] border-[#293448] hover:bg-[#232c3f] text-neutral-300'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-black block text-white">{target.name}</span>
                        <span className="text-[10px] text-neutral-400">
                          {target.hp} / {target.maxHp} HP
                        </span>
                      </div>
                      {isSelected && (
                        <span className="bg-cyan-400 text-black p-1 rounded-full">
                          <Check className="w-3 h-3 font-black" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quote */}
          {character.selectionQuote && (
            <div className="text-center italic text-xs text-amber-300/80 px-2">
              "{character.selectionQuote}"
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-[#21293c] bg-[#121622] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[#1d2433] hover:bg-[#273248] text-neutral-300 font-bold text-xs transition-all border border-[#2d384f]"
          >
            Cerrar / Cancelar
          </button>

          <button
            disabled={!canActivate}
            onClick={handleConfirmActivate}
            className={`flex-1 py-3 px-4 rounded-xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
              canActivate
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:brightness-110 active:scale-95 text-black border-2 border-yellow-200 shadow-[0_0_20px_rgba(255,167,38,0.3)] animate-pulse'
                : 'bg-[#1b202c] text-neutral-500 border border-[#262c3d] cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {isCooldown
                ? `HABILIDAD EN RECARGA (${player.abilityCooldownRemaining})`
                : isFrozen
                ? 'NO DISPONIBLE (CONGELADO)'
                : isSupplyMagic && !canUseSupplyMagic
                ? 'SUMINISTRO NO DISPONIBLE'
                : isDracubon && validTargets.length < 2
                ? 'SE NECESITAN 2 RIVALES VIVOS'
                : needsActionPoint && player.actionPoints <= 0
                ? 'SIN ACCIONES (0 AP)'
                : '¡ACTIVAR HABILIDAD AHORA!'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
