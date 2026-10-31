import React, { useState } from 'react';
import { CubinarcaOrder, CubinarcaOrderKind, GameCard, PlayerState, getMaxHandSize } from '../types/game';
import { AlertTriangle, ArrowRight, Hand, ShieldOff, Swords } from 'lucide-react';

interface CubinarcaOrderModalProps {
  mode: 'ISSUE' | 'FULFILL';
  issuer: PlayerState;
  victim: PlayerState;
  players: PlayerState[];
  order?: CubinarcaOrder | null;
  onIssue?: (kind: CubinarcaOrderKind, attackTargetId?: number) => void;
  onFulfillAttack?: () => void;
  onTransferCard?: (cardIndex: number) => void;
  onUnequipWeapon?: (weaponIndex: number) => void;
  onDefy?: () => void;
}

export const CubinarcaOrderModal: React.FC<CubinarcaOrderModalProps> = ({
  mode,
  issuer,
  victim,
  players,
  order,
  onIssue,
  onFulfillAttack,
  onTransferCard,
  onUnequipWeapon,
  onDefy
}) => {
  const [selectedKind, setSelectedKind] = useState<CubinarcaOrderKind>('ATTACK_TARGET');
  const validAttackTargets = players.filter(
    player => player.id !== victim.id && !player.isEliminated && player.hp > 0
  );
  const [attackTargetId, setAttackTargetId] = useState<number | null>(
    validAttackTargets[0]?.id ?? null
  );
  const canTransfer = victim.hand.length > 0 && issuer.hand.length < getMaxHandSize(issuer);
  const canUnequip = victim.equippedWeapons.length > 0;
  const canAttack = validAttackTargets.length > 0;

  const confirmOrder = () => {
    if (!onIssue) return;
    if (selectedKind === 'ATTACK_TARGET' && (attackTargetId === null || !canAttack)) return;
    if (selectedKind === 'TRANSFER_CARD' && !canTransfer) return;
    if (selectedKind === 'UNEQUIP_WEAPON' && !canUnequip) return;
    onIssue(selectedKind, selectedKind === 'ATTACK_TARGET' ? attackTargetId ?? undefined : undefined);
  };

  const title = mode === 'ISSUE' ? 'DICTAR ORDEN' : 'ORDEN IMPERATIVA';
  const subtitle = mode === 'ISSUE'
    ? `${victim.name} debe obedecer a ${issuer.name}`
    : `${issuer.name} exige que ${victim.name} cumpla la orden`;

  return (
    <div className="gc-modal-overlay fixed inset-0 z-[90] bg-black/85 backdrop-blur-md flex items-center justify-center p-3">
      <div className="w-full max-w-lg max-h-[88vh] overflow-y-auto bg-[#101521] border-2 border-violet-500/70 rounded-2xl shadow-2xl text-white">
        <div className="p-4 border-b border-violet-500/30 bg-violet-950/40">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-violet-300" />
            <h3 className="font-black tracking-wide text-violet-200">{title}</h3>
          </div>
          <p className="text-xs text-neutral-300 mt-1">{subtitle}</p>
        </div>

        {mode === 'ISSUE' ? (
          <div className="p-4 space-y-3">
            <p className="text-xs text-neutral-300">
              Elige una orden. Si la víctima la desobedece, perderá la capacidad de bloquear hasta cumplirla.
            </p>

            <button
              type="button"
              disabled={!canAttack}
              onClick={() => setSelectedKind('ATTACK_TARGET')}
              className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 disabled:opacity-35 ${selectedKind === 'ATTACK_TARGET' ? 'border-violet-300 bg-violet-950/70' : 'border-[#30394d] bg-[#171e2c]'}`}
            >
              <Swords className="w-5 h-5 text-red-300" />
              <span className="flex-1">
                <b className="block text-sm">Ordenar un ataque</b>
                <span className="text-[11px] text-neutral-400">Puede designar a un rival o a un aliado: fuego amigo exclusivamente bajo este mandato.</span>
              </span>
            </button>
            {selectedKind === 'ATTACK_TARGET' && canAttack && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {validAttackTargets.map(target => (
                  <button
                    key={target.id}
                    type="button"
                    onClick={() => setAttackTargetId(target.id)}
                    className={`p-2 rounded-lg border text-left ${attackTargetId === target.id ? 'border-violet-300 bg-violet-950/70' : 'border-[#30394d] bg-[#171e2c]'}`}
                  >
                    <span className="block text-xs font-bold">{target.name}</span>
                    <span className="text-[10px] text-neutral-400">{target.hp}/{target.maxHp} HP</span>
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              disabled={!canTransfer}
              onClick={() => setSelectedKind('TRANSFER_CARD')}
              className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 disabled:opacity-35 ${selectedKind === 'TRANSFER_CARD' ? 'border-violet-300 bg-violet-950/70' : 'border-[#30394d] bg-[#171e2c]'}`}
            >
              <Hand className="w-5 h-5 text-cyan-300" />
              <span className="flex-1">
                <b className="block text-sm">Transferir una carta</b>
                <span className="text-[11px] text-neutral-400">La víctima entrega una carta de su mano a Cubinarca.</span>
              </span>
            </button>

            <button
              type="button"
              disabled={!canUnequip}
              onClick={() => setSelectedKind('UNEQUIP_WEAPON')}
              className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 disabled:opacity-35 ${selectedKind === 'UNEQUIP_WEAPON' ? 'border-violet-300 bg-violet-950/70' : 'border-[#30394d] bg-[#171e2c]'}`}
            >
              <ShieldOff className="w-5 h-5 text-amber-300" />
              <span className="flex-1">
                <b className="block text-sm">Desequipar un arma</b>
                <span className="text-[11px] text-neutral-400">La víctima retira un arma de su mesa y la devuelve a su mano; si no cabe, vuelve a la Pila General.</span>
              </span>
            </button>

            <button
              type="button"
              onClick={confirmOrder}
              className="w-full rounded-xl py-3 bg-violet-600 hover:bg-violet-500 font-black text-sm"
            >
              Dictar esta orden
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <div className="rounded-xl p-3 bg-amber-950/40 border border-amber-500/40 flex gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />
              <p className="text-xs text-amber-100">
                {order?.kind === 'ATTACK_TARGET'
                  ? (() => {
                      const target = players.find(player => player.id === order.attackTargetId);
                      const friendlyFire = target && victim.teamId !== undefined && target.teamId === victim.teamId;
                      return friendlyFire
                        ? `MANDATO DE FUEGO AMIGO: ataca a ${target.name}. Solo esta orden permite atacar a un aliado.`
                        : `Ataca a ${target?.name ?? 'el objetivo señalado'}.`;
                    })()
                  : order?.kind === 'TRANSFER_CARD'
                  ? `Entrega una carta de tu mano a ${issuer.name}.`
                  : `Retira un arma equipada y devuélvela a tu mano; si está llena, vuelve a la Pila General.`}
                {victim.blocksDisabledByOrder && ' Discordia ya te impide bloquear.'}
              </p>
            </div>

            {order?.kind === 'ATTACK_TARGET' && (
              <button
                type="button"
                disabled={!validAttackTargets.some(target => target.id === order.attackTargetId)}
                onClick={onFulfillAttack}
                className="w-full p-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 font-black text-sm flex items-center justify-center gap-2"
              >
                {(() => {
                  const target = players.find(player => player.id === order.attackTargetId);
                  const friendlyFire = target && victim.teamId !== undefined && target.teamId === victim.teamId;
                  return friendlyFire ? `Cumplir mandato: atacar aliado ${target.name}` : `Atacar a ${target?.name ?? 'objetivo'}`;
                })()}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {order?.kind === 'TRANSFER_CARD' && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-cyan-200">Elige qué carta entregar:</p>
                {victim.hand.map((card: GameCard, index) => (
                  <button
                    key={card.uid || `${card.id}-${index}`}
                    type="button"
                    disabled={issuer.hand.length >= getMaxHandSize(issuer)}
                    onClick={() => onTransferCard?.(index)}
                    className="w-full p-3 rounded-xl border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 disabled:opacity-40 text-left"
                  >
                    <b className="block text-xs">{card.name}</b>
                    <span className="text-[10px] text-neutral-400">{card.description}</span>
                  </button>
                ))}
              </div>
            )}

            {order?.kind === 'UNEQUIP_WEAPON' && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-amber-200">Elige qué arma retirar:</p>
                {victim.equippedWeapons.map((weapon, index) => (
                  <button
                    key={weapon.uid || `${weapon.id}-${index}`}
                    type="button"
                    onClick={() => onUnequipWeapon?.(index)}
                    className="w-full p-3 rounded-xl border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/60 text-left"
                  >
                    <b className="block text-xs">{weapon.name}</b>
                    <span className="text-[10px] text-neutral-400">{weapon.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {mode === 'FULFILL' && (
          <div className="px-4 pb-4">
            <button
              type="button"
              onClick={onDefy}
              className="w-full py-2.5 rounded-xl border border-red-500/40 bg-red-950/50 hover:bg-red-900/60 text-red-200 font-bold text-xs"
            >
              Desobedecer por ahora (perder capacidad de bloqueo)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
