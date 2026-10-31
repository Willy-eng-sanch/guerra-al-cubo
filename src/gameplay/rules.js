/**
 * Reglas puras del bucle de partida.
 * Este módulo no depende de React ni del navegador, para que la misma lógica
 * que ejecuta la aplicación pueda verificarse con node:test.
 */

export const isPlayerAlive = (player) => Boolean(
  player && !player.isEliminated && player.hp > 0
);

/**
 * Resuelve una transferencia de vida de Cubícula sin mutar el estado recibido.
 * @returns {{ ok: true, players: object[], transferred: number, mode: string } | { ok: false, players: object[], reason: string }}
 */
export function resolveCubiculaTransfer(players, actorId, targetId, mode, requested = 1) {
  const unchanged = { ok: false, players, reason: 'invalid-target' };
  const actor = players.find((player) => player.id === actorId);
  const target = players.find((player) => player.id === targetId);

  if (!actor || !target) return { ...unchanged, reason: 'missing-player' };
  if (mode !== 'DRAIN' && mode !== 'DONATE') return { ...unchanged, reason: 'invalid-mode' };
  if ((actor.activeMorphCharacter || actor.characterType) !== 'CUBICULA') {
    return { ...unchanged, reason: 'wrong-hero' };
  }
  if (!isPlayerAlive(actor)) return { ...unchanged, reason: 'actor-not-alive' };
  if (!isPlayerAlive(target) || target.id === actor.id) {
    return { ...unchanged, reason: 'invalid-target' };
  }
  if ((actor.abilityCooldownRemaining || 0) > 0) {
    return { ...unchanged, reason: 'cooldown' };
  }
  if ((actor.actionPoints || 0) < 1) return { ...unchanged, reason: 'no-action-points' };

  const usedModes = actor.cubiculaModesUsedThisTurn || [];
  if (usedModes.includes(mode)) return { ...unchanged, reason: 'mode-already-used' };

  if (mode === 'DRAIN') {
    if (actor.teamId !== undefined && target.teamId === actor.teamId) {
      return { ...unchanged, reason: 'invalid-team' };
    }
  } else if (actor.teamId === undefined || target.teamId !== actor.teamId) {
    return { ...unchanged, reason: 'invalid-team' };
  }

  const donor = mode === 'DRAIN' ? target : actor;
  const receiver = mode === 'DRAIN' ? actor : target;
  const transferLimit = mode === 'DRAIN' ? 3 : 6;
  const numericRequest = Number.isFinite(Number(requested)) ? Math.floor(Number(requested)) : 1;
  const amountRequested = Math.max(1, Math.min(transferLimit, numericRequest || 1));
  const transferred = Math.min(
    amountRequested,
    Math.max(0, donor.hp - 1),
    Math.max(0, receiver.maxHp - receiver.hp)
  );

  if (transferred <= 0) return { ...unchanged, reason: 'no-transferable-hp' };

  const nextPlayers = players.map((player) => {
    if (player.id === actor.id) {
      return {
        ...player,
        hp: mode === 'DRAIN'
          ? Math.min(player.maxHp, player.hp + transferred)
          : Math.max(1, player.hp - transferred),
        actionPoints: Math.max(0, player.actionPoints - 1),
        cubiculaModesUsedThisTurn: [...usedModes, mode]
      };
    }
    if (player.id === target.id) {
      return {
        ...player,
        hp: mode === 'DRAIN'
          ? Math.max(1, player.hp - transferred)
          : Math.min(player.maxHp, player.hp + transferred)
      };
    }
    return player;
  });

  return { ok: true, players: nextPlayers, transferred, mode };
}

/**
 * Avanza al siguiente jugador vivo y prepara el estado de inicio de turno.
 * Los Cúbits se reinician a 2 (no se acumulan); las rondas avanzan una sola vez
 * cuando el índice de turno vuelve al inicio de la lista.
 */
export function advanceTurnState(players, currentTurnIndex, round) {
  if (!players.length || players.filter(isPlayerAlive).length <= 1) {
    return { finished: true, players, turnIndex: currentTurnIndex, round };
  }

  const playerCount = players.length;
  let nextIndex = (currentTurnIndex + 1) % playerCount;
  let inspected = 0;

  while (inspected < playerCount && !isPlayerAlive(players[nextIndex])) {
    nextIndex = (nextIndex + 1) % playerCount;
    inspected += 1;
  }

  if (inspected >= playerCount || !isPlayerAlive(players[nextIndex])) {
    return { finished: true, players, turnIndex: currentTurnIndex, round };
  }

  const nextRound = round + (nextIndex <= currentTurnIndex ? 1 : 0);
  const nextPlayers = players.map((player, index) => {
    if (index === currentTurnIndex) {
      const nextPlayer = {
        ...player,
        abilityCooldownRemaining: player.cubiculaModesUsedThisTurn?.length
          ? 3
          : player.abilityCooldownRemaining,
        cubiculaModesUsedThisTurn: [],
        borrowedEquipmentEffects: player.borrowedEquipmentEffects ? [] : player.borrowedEquipmentEffects,
        borrowedEquipmentSourceId: player.borrowedEquipmentEffects ? null : player.borrowedEquipmentSourceId
      };

      if (player.cubinarcaOrder) {
        nextPlayer.blocksDisabledByOrder = true;
        nextPlayer.cubinarcaOrderDefiedThisTurn = player.blocksDisabledByOrder
          ? player.cubinarcaOrderDefiedThisTurn
          : false;
      }
      return nextPlayer;
    }

    if (index === nextIndex) {
      return {
        ...player,
        actionPoints: 2,
        isFrozen: false,
        cubiculaModesUsedThisTurn: [],
        abilityCooldownRemaining: Math.max(0, player.abilityCooldownRemaining - 1),
        cubinarcaOrderDefiedThisTurn: false
      };
    }
    return player;
  });

  return { finished: false, players: nextPlayers, turnIndex: nextIndex, round: nextRound };
}

/** Determina el resultado final sin ejecutar efectos secundarios de interfaz. */
export function getMatchOutcome(players) {
  const hasTeamOne = players.some((player) => player.teamId === 1);
  const hasTeamTwo = players.some((player) => player.teamId === 2);

  if (hasTeamOne && hasTeamTwo) {
    const teamOneAlive = players.filter((player) => player.teamId === 1 && isPlayerAlive(player));
    const teamTwoAlive = players.filter((player) => player.teamId === 2 && isPlayerAlive(player));

    if (teamOneAlive.length === 0 && teamTwoAlive.length > 0) {
      return { kind: 'TEAM', winningTeamId: 2, winner: teamTwoAlive[0] };
    }
    if (teamTwoAlive.length === 0 && teamOneAlive.length > 0) {
      return { kind: 'TEAM', winningTeamId: 1, winner: teamOneAlive[0] };
    }
    if (teamOneAlive.length === 0 && teamTwoAlive.length === 0) {
      return { kind: 'DRAW', winner: null };
    }
    return null;
  }

  const alivePlayers = players.filter(isPlayerAlive);
  if (players.length > 1 && alivePlayers.length <= 1) {
    return { kind: 'FREE_FOR_ALL', winner: alivePlayers[0] || null };
  }
  return null;
}
