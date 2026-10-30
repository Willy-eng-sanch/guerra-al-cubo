import React, { useState } from 'react';
import { CharacterDef, CharacterType, PlayerState, CubiculaMode } from '../types/game';
import { Sparkles, Zap, Shield, X, Check, Dices, Target, Snowflake, Info, Swords } from 'lucide-react';

interface HeroAbilityModalProps {
  character: CharacterDef;
  player: PlayerState;
  validTargets: PlayerState[];
  selectedTargetId: number | null;
  onClose: () => void;
  onActivate: (targetId?: number, extraOption?: number, mode?: CubiculaMode) => void;
  canUseSupplyMagic: boolean;
  supplyMagicUnavailableReason: string;
  validAllies: PlayerState[];
  canUseInterception: boolean;
  interceptionUnavailableReason: string;
}

export const HeroAbilityModal: React.FC<HeroAbilityModalProps> = ({
  character,
  player,
  validTargets,
  selectedTargetId,
  onClose,
  onActivate,
  canUseSupplyMagic,
  supplyMagicUnavailableReason,
  validAllies,
  canUseInterception,
  interceptionUnavailableReason
}) => {
  const [currentTargetId, setCurrentTargetId] = useState<number | null>(() =>
    character.type === CharacterType.GLADIACUBON
      ? (validAllies[0]?.id ?? null)
      : (selectedTargetId || (validTargets.length > 0 ? validTargets[0].id : null))
  );
  const [fluteBet, setFluteBet] = useState<number>(3);
  const [cubiculaMode, setCubiculaMode] = useState<CubiculaMode>('DRAIN');
  const [transferAmount, setTransferAmount] = useState<number>(3);
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
  const isGladiacubon = heroType === CharacterType.GLADIACUBON;
  const isRacubitero = heroType === CharacterType.RACUBITERO;
  const isCubogro = heroType === CharacterType.CUBOGRO;
  const isCubicula = heroType === CharacterType.CUBICULA;
  const isCubinja = heroType === CharacterType.CUBINJA;
  const isTramcuboso = heroType === CharacterType.TRAMCUBOSO;
  const abilityTargets = isGladiacubon || isCubicula || isCubinja ? validAllies : validTargets;

  // Does this ability require choosing a rival or an ally?
  const needsTarget = heroType === CharacterType.CUBITO_DE_HIELO || heroType === CharacterType.PIRATA || isCubicula || isGladiacubon || isCubogro || isCubinja;
  const needsActionPoint = isCubicula || isDracubon || isGladiacubon || isCubogro || isCubinja || isRacubitero;
  // Does this ability have a betting mechanic?
  const isFlute = heroType === CharacterType.FLAUCUBISTA_DESAFINADO;
  const isSupplyMagic = heroType === CharacterType.HADA_AL_CUBO;

  const cubiculaModesUsed = player.cubiculaModesUsedThisTurn || [];
  const isCubogroReady = !isCubogro || ((player.cubogroAbilityCharges || 0) > 0);
  const hasCubinjaEquipment = !isCubinja || player.equippedWeapons.length > 0;
  const isTramcubosoManualActivation = !isTramcuboso;
  const canActivate = !isCooldown && !isFrozen && isTramcubosoManualActivation &&
    (!needsTarget || (currentTargetId !== null && abilityTargets.some(target => target.id === currentTargetId))) &&
    (!isDracubon || (validTargets.length >= 2 && dracubonBlockerId !== null && dracubonSecondTargetId !== null && dracubonBlockerId !== dracubonSecondTargetId)) &&
    (!needsActionPoint || player.actionPoints > 0) &&
    (!isGladiacubon || canUseInterception) &&
    (!isSupplyMagic || canUseSupplyMagic) &&
    isCubogroReady && hasCubinjaEquipment &&
    (!isCubicula || !cubiculaModesUsed.includes(cubiculaMode));

  const handleConfirmActivate = () => {
    if (!canActivate) return;
    if (isDracubon) {
      // targetId = quien tira bloqueo por ambos; extraOption = segundo rival alcanzado.
      onActivate(dracubonBlockerId ?? undefined, dracubonSecondTargetId ?? undefined);
      return;
    }
    onActivate(
      needsTarget ? (currentTargetId || undefined) : undefined,
      isCubicula ? transferAmount : isFlute ? fluteBet : undefined,
      isCubicula ? cubiculaMode : undefined
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
                  {character.abilityCooldownMax > 0 ? 'Activa con Cooldown' : isRacubitero ? 'Pasiva automática' : 'Habilidad Especial'}
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
                  Enfriamiento: {player.abilityCooldownRemaining} ronda(s)
                </span>
              ) : isFrozen ? (
                <span className="bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Snowflake className="w-3 h-3" />
                  Congelado
                </span>
              ) : isRacubitero ? (
                <span className="bg-amber-950 text-amber-200 border border-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Automática
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

          {isGladiacubon && (
            <div className="rounded-xl border border-blue-500/40 bg-blue-950/30 p-3 text-xs text-blue-100 space-y-1">
              <p className="font-black text-blue-200">Intercepción · Coste: 1 Cúbit</p>
              <p>El aliado elegido queda bajo Cobertura. El siguiente ataque dirigido a él será recibido por Gladiacubon, que lanzará su propio dado.</p>
              <p>La cobertura solo se libera cuando Gladiacubon consigue un Bloqueo Perfecto. Si falla, sigue protegiendo al mismo aliado.</p>
              <p>Tras activar, no puede volver a usarse durante la ronda siguiente y tampoco mientras exista una cobertura pendiente.</p>
            </div>
          )}

          {isSupplyMagic && !canUseSupplyMagic && !isCooldown && !isFrozen && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 text-xs text-amber-200">
              {supplyMagicUnavailableReason}
            </div>
          )}

          {isRacubitero && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 text-xs text-amber-100 space-y-1">
              <p className="font-black text-amber-200">Saqueo Colectivo · Coste: 1 Cúbit · Enfriamiento: 3 rondas</p>
              <p>Lanza un D6. Con 6, reúne las cartas de la mano de todos los rivales para conservar hasta dos, repartir una a cada aliado con espacio y devolver el resto a la Pila General. Con 1–5, recibe ese número como daño.</p>
            </div>
          )}
          {isCubogro && (
            <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-100 space-y-1">
              <p className="font-black text-red-200">Paliza Demoledora · Coste: 1 Cúbit y 1 carga</p>
              <p>Cargas disponibles: {player.cubogroAbilityCharges || 0}/2. Si no hay coincidencia exacta entre los dados, el objetivo pierde la mitad de sus HP actuales.</p>
            </div>
          )}
          {isCubicula && (
            <div className="rounded-xl border border-pink-500/40 bg-pink-950/30 p-3 text-xs text-pink-100 space-y-2">
              <p className="font-black text-pink-200">Transfusión Nocturna · Coste: 1 Cúbit por modo</p>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" disabled={cubiculaModesUsed.includes('DRAIN')} onClick={() => setCubiculaMode('DRAIN')} className={`rounded-lg border p-2 font-black ${cubiculaMode === 'DRAIN' ? 'border-pink-300 bg-pink-500/20' : 'border-pink-900'} disabled:opacity-40`}>DRENAJE</button>
                <button type="button" disabled={cubiculaModesUsed.includes('DONATE')} onClick={() => setCubiculaMode('DONATE')} className={`rounded-lg border p-2 font-black ${cubiculaMode === 'DONATE' ? 'border-pink-300 bg-pink-500/20' : 'border-pink-900'} disabled:opacity-40`}>DONACIÓN</button>
              </div>
              <label className="block">Cantidad: <b>{transferAmount} HP</b></label>
              <input type="range" min={1} max={6} value={transferAmount} onChange={event => setTransferAmount(Number(event.target.value))} className="w-full" />
              {cubiculaModesUsed.length > 0 && <p>Ya utilizaste {cubiculaModesUsed.join(' y ')} en este turno; el otro modo sigue disponible y ambos comparten el enfriamiento posterior.</p>}
            </div>
          )}
          {isCubinja && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 text-xs text-amber-100 space-y-1">
              <p className="font-black text-amber-200">Préstamo de Arsenal · Coste: 1 Cúbit · Enfriamiento: 2 rondas</p>
              <p>Presta los efectos de todas tus armas al aliado elegido sin mover las cartas. Necesitas tener al menos un arma equipada.</p>
            </div>
          )}
          {isTramcuboso && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-xs text-emerald-100">
              <p className="font-black text-emerald-200">Revolución de la Mesa · Coste: 1 Cúbit · Enfriamiento: 2 rondas</p>
              <p>Se activa automáticamente desde la ventana posterior a la tirada inicial de un combate, nunca desde este botón.</p>
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

          {/* Interactive Input 2: Select target for control or coverage abilities. */}
          {needsTarget && !isCooldown && !isFrozen && (
            <div className="bg-[#151c2b] border-2 border-cyan-500/50 p-4 rounded-xl space-y-2.5">
              <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>{isGladiacubon ? "Selecciona al aliado que quieres escudar:" : isCubicula ? "Selecciona al aliado que recibe la transferencia:" : isCubinja ? "Selecciona al aliado que recibirá el préstamo:" : "Selecciona el objetivo para tu habilidad:"}</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {abilityTargets.map(target => {
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
              {isGladiacubon && !canUseInterception && (
                <p className="text-[11px] text-amber-200">{interceptionUnavailableReason}</p>
              )}
              {isGladiacubon && validAllies.length === 0 && (
                <p className="text-[11px] text-amber-200">No hay aliados vivos elegibles para proteger.</p>
              )}
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
                : isGladiacubon && !canUseInterception
                ? 'INTERCEPCIÓN NO DISPONIBLE'
                : isRacubitero
                ? 'PASIVA AUTOMÁTICA'
                : isDracubon && validTargets.length < 2
                ? 'SE NECESITAN 2 RIVALES VIVOS'
                : needsActionPoint && player.actionPoints <= 0
                ? 'SIN CÚBITS'
                : isCubogro && !isCubogroReady
                ? 'SIN CARGAS'
                : isCubinja && !hasCubinjaEquipment
                ? 'EQUIPA UN ARMA PRIMERO'
                : isTramcuboso
                ? 'SE ACTIVA DESPUÉS DE LA TIRADA'
                : '¡ACTIVAR HABILIDAD AHORA!'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
