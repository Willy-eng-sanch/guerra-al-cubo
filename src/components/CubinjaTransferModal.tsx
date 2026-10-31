import React from 'react';
import { CharacterType, GameCard, PlayerState, getMaxHandSize } from '../types/game';
import { Hand, Send } from 'lucide-react';

interface CubinjaTransferModalProps {
  actor: PlayerState;
  card: GameCard;
  players: PlayerState[];
  onConfirm: (targetId: number) => void;
  onCancel: () => void;
}

export const CubinjaTransferModal: React.FC<CubinjaTransferModalProps> = ({ actor, card, players, onConfirm, onCancel }) => {
  const targets = players.filter(player =>
    player.id !== actor.id && !player.isEliminated && player.hp > 0 &&
    player.hand.length < getMaxHandSize(player) &&
    (player.activeMorphCharacter || player.characterType) !== CharacterType.CUBOGRO
  );
  return (
    <div className="gc-modal-overlay fixed inset-0 z-[116] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl border-2 border-cyan-400/60 bg-[#101923] p-5 text-white shadow-2xl">
        <span className="text-[10px] font-black tracking-widest text-cyan-300">ARSENAL ILIMITADO</span>
        <h2 className="mt-2 text-lg font-black">Transferir Truco</h2>
        <p className="mt-1 text-xs text-neutral-300">Entregarás <b>{card.name}</b> por 1 Cúbit. La carta sale de tu mano y pasa a la del jugador elegido.</p>
        <div className="mt-4 space-y-2">
          {targets.map(target => (
            <button key={target.id} onClick={() => onConfirm(target.id)} className="flex w-full items-center justify-between rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 text-left hover:bg-cyan-900/40">
              <span><b className="block text-xs">{target.name}</b><span className="text-[10px] text-neutral-400">{target.hand.length}/{getMaxHandSize(target)} cartas</span></span>
              <Send className="h-4 w-4 text-cyan-300"/>
            </button>
          ))}
          {targets.length === 0 && <p className="rounded-xl bg-slate-900 p-3 text-xs text-neutral-400">No hay jugadores con espacio disponible para recibir la carta.</p>}
        </div>
        <button onClick={onCancel} className="mt-4 w-full rounded-xl border border-slate-600 bg-slate-800 py-2.5 text-xs font-bold text-neutral-200">CANCELAR</button>
      </div>
    </div>
  );
};
