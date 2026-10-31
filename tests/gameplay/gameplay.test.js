import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceTurnState, getMatchOutcome, resolveCubiculaTransfer, shouldAwardDefenderSixReward, takeFirstWeaponFromDeck } from '../../src/gameplay/rules.js';

const p = (id, teamId, overrides = {}) => ({
  id, name: 'Jugador ' + id, teamId,
  characterType: id === 1 ? 'CUBICULA' : 'CUBOGRO',
  hp: 15, maxHp: 20, actionPoints: 2, isEliminated: false, isFrozen: false,
  abilityCooldownRemaining: 0, cubiculaModesUsedThisTurn: [],
  borrowedEquipmentEffects: [], borrowedEquipmentSourceId: null, ...overrides
});
const match = () => [p(1, 1, { hp: 10 }), p(2, 2, { hp: 20 }), p(3, 1, { hp: 8 })];
const transfer = (players, target, mode, amount = 1) => resolveCubiculaTransfer(players, 1, target, mode, amount);

test('Drenaje limita a 3 HP, cura a Cubícula y consume 1 Cúbit', () => {
  const before = match();
  const r = transfer(before, 2, 'DRAIN', 6);
  assert.equal(r.ok, true); assert.equal(r.transferred, 3);
  assert.equal(r.players[0].hp, 13); assert.equal(r.players[1].hp, 17);
  assert.equal(r.players[0].actionPoints, 1); assert.equal(before[0].hp, 10);
});
test('Drenaje deja al rival con 1 HP como mínimo', () => {
  const players = match(); players[1].hp = 2;
  const r = transfer(players, 2, 'DRAIN', 3);
  assert.equal(r.transferred, 1); assert.equal(r.players[1].hp, 1);
});
test('Drenaje no se ejecuta si Cubícula ya está al máximo de HP', () => {
  const players = match(); players[0].hp = 20;
  const r = transfer(players, 2, 'DRAIN', 3);
  assert.equal(r.reason, 'no-transferable-hp'); assert.equal(r.players[0].actionPoints, 2);
});
test('Drenaje rechaza aliados', () => assert.equal(transfer(match(), 3, 'DRAIN', 2).reason, 'invalid-team'));
test('Donación limita a 6 HP y transfiere vida al aliado', () => {
  const players = match(); players[0].hp = 18;
  const r = transfer(players, 3, 'DONATE', 9);
  assert.equal(r.ok, true); assert.equal(r.transferred, 6);
  assert.equal(r.players[0].hp, 12); assert.equal(r.players[2].hp, 14);
  assert.equal(r.players[0].actionPoints, 1);
});
test('Donación conserva al menos 1 HP de Cubícula', () => {
  const players = match(); players[0].hp = 3;
  const r = transfer(players, 3, 'DONATE', 6);
  assert.equal(r.transferred, 2); assert.equal(r.players[0].hp, 1); assert.equal(r.players[2].hp, 10);
});
test('Donación rechaza rivales', () => assert.equal(transfer(match(), 2, 'DONATE', 3).reason, 'invalid-team'));
test('Donación no supera el máximo de HP del aliado', () => {
  const players = match(); players[0].hp = 18; players[2].hp = 19;
  const r = transfer(players, 3, 'DONATE', 6);
  assert.equal(r.transferred, 1); assert.equal(r.players[2].hp, 20);
});
test('Drenaje y Donación pueden usarse en el mismo turno con 2 Cúbits', () => {
  const a = transfer(match(), 2, 'DRAIN', 3);
  const b = transfer(a.players, 3, 'DONATE', 6);
  assert.equal(b.ok, true); assert.equal(b.players[0].actionPoints, 0);
  assert.deepEqual(b.players[0].cubiculaModesUsedThisTurn, ['DRAIN', 'DONATE']);
});
test('cada modo solo puede usarse una vez por turno', () => {
  const a = transfer(match(), 2, 'DRAIN', 2);
  assert.equal(transfer(a.players, 2, 'DRAIN', 2).reason, 'mode-already-used');
});
test('la habilidad respeta cooldown y Cúbits disponibles', () => {
  const cooling = match(); cooling[0].abilityCooldownRemaining = 1;
  assert.equal(transfer(cooling, 2, 'DRAIN').reason, 'cooldown');
  const empty = match(); empty[0].actionPoints = 0;
  assert.equal(transfer(empty, 2, 'DRAIN').reason, 'no-action-points');
});
test('la habilidad rechaza héroe incorrecto, objetivo muerto y modo no permitido', () => {
  const wrong = match(); wrong[0].characterType = 'GLADIACUBON';
  assert.equal(transfer(wrong, 2, 'DRAIN').reason, 'wrong-hero');
  const dead = match(); dead[1].hp = 0;
  assert.equal(transfer(dead, 2, 'DRAIN').reason, 'invalid-target');
  assert.equal(transfer(match(), 2, 'HEAL').reason, 'invalid-mode');
});

test('el siguiente jugador inicia con exactamente 2 Cúbits; no acumula sobrantes', () => {
  const r = advanceTurnState([p(1, 1, { actionPoints: 0 }), p(2, 2, { actionPoints: 7 })], 0, 1);
  assert.equal(r.turnIndex, 1); assert.equal(r.round, 1); assert.equal(r.players[1].actionPoints, 2);
});
test('un jugador congelado pierde su turno y se entrega el turno al siguiente vivo', () => {
  const players = [
    p(1, 1),
    p(2, 2, { isFrozen: true, actionPoints: 0, abilityCooldownRemaining: 2 }),
    p(3, 1, { actionPoints: 0 })
  ];
  const r = advanceTurnState(players, 0, 3);
  assert.equal(r.turnIndex, 2);
  assert.equal(r.round, 3);
  assert.equal(r.players[1].isFrozen, false);
  assert.equal(r.players[1].actionPoints, 0);
  assert.equal(r.players[1].abilityCooldownRemaining, 1);
  assert.equal(r.players[2].actionPoints, 2);
});

test('salta varios congelados cruzando el inicio de ronda una sola vez', () => {
  const players = [
    p(1, 1, { isFrozen: true, abilityCooldownRemaining: 1 }),
    p(2, 2),
    p(3, 1),
    p(4, 2, { isFrozen: true, abilityCooldownRemaining: 3 })
  ];
  const r = advanceTurnState(players, 2, 7);
  assert.equal(r.turnIndex, 1);
  assert.equal(r.round, 8);
  assert.equal(r.players[3].isFrozen, false);
  assert.equal(r.players[0].isFrozen, false);
  assert.equal(r.players[3].abilityCooldownRemaining, 2);
  assert.equal(r.players[0].abilityCooldownRemaining, 0);
  assert.equal(r.players[1].actionPoints, 2);
});

test('el seis defensivo congelado no concede Cara Especial 6', () => {
  assert.equal(shouldAwardDefenderSixReward({ isFrozen: true, defenderRolls: [6] }), false);
});

test('un seis defensivo normal puede conceder Cara Especial 6', () => {
  assert.equal(shouldAwardDefenderSixReward({ defenderRolls: [6] }), true);
});

test('un seis defensivo no concede recompensa con bloqueo automático o Discordia', () => {
  assert.equal(shouldAwardDefenderSixReward({ hasAutomaticPerfectBlock: true, defenderRolls: [6] }), false);
  assert.equal(shouldAwardDefenderSixReward({ blocksDisabledByOrder: true, defenderRolls: [6] }), false);
});

test('el arma inicial de Gladiacubon sale del mazo y solo conserva una instancia', () => {
  const weapon = { id: 4, type: 'WEAPON', uid: 'original-weapon' };
  const trick = { id: 90, type: 'TRICK', uid: 'trick' };
  const deck = [trick, weapon, { ...weapon, uid: 'second-weapon' }];
  const result = takeFirstWeaponFromDeck(deck, id => 'equipped-' + id);
  assert.equal(result.card.uid, 'equipped-4');
  assert.deepEqual(result.remainingDeck.map(card => card.uid), ['trick', 'second-weapon']);
  assert.equal(result.remainingDeck.filter(card => card.id === weapon.id).length, 1);
  assert.equal(deck.length, 3, 'la función no muta el mazo recibido');
});

test('no se crea arma inicial si no hay armas en el mazo', () => {
  const result = takeFirstWeaponFromDeck([{ id: 7, type: 'TRICK' }], id => 'uid-' + id);
  assert.equal(result.card, null);
  assert.equal(result.remainingDeck.length, 1);
});
test('al terminar turno se vacían los modos de Cubícula y se fija cooldown de 3 rondas', () => {
  const r = advanceTurnState([p(1, 1, { cubiculaModesUsedThisTurn: ['DRAIN', 'DONATE'] }), p(2, 2)], 0, 1);
  assert.deepEqual(r.players[0].cubiculaModesUsedThisTurn, []); assert.equal(r.players[0].abilityCooldownRemaining, 3);
});
test('omite eliminados y suma una sola ronda tras cruzar el inicio de la lista', () => {
  const players = [p(1, 1, { hp: 0, isEliminated: true }), p(2, 2, { hp: 0, isEliminated: true }), p(3, 1), p(4, 2), p(5, 1), p(6, 2, { hp: 0, isEliminated: true })];
  const r = advanceTurnState(players, 4, 7);
  assert.equal(r.turnIndex, 2); assert.equal(r.round, 8); assert.equal(r.players[2].actionPoints, 2);
});
test('el paso del último al primer jugador incrementa la ronda una vez', () => {
  const r = advanceTurnState([p(1, 1), p(2, 2)], 1, 4);
  assert.equal(r.turnIndex, 0); assert.equal(r.round, 5);
});
test('no avanza cuando solo queda un jugador vivo', () => {
  const r = advanceTurnState([p(1, 1), p(2, 2, { hp: 0, isEliminated: true })], 0, 1);
  assert.equal(r.finished, true); assert.equal(r.turnIndex, 0);
});

test('detecta la victoria del equipo azul', () => {
  const players = [p(1, 1), p(2, 1), p(3, 2, { hp: 0, isEliminated: true })];
  assert.deepEqual(getMatchOutcome(players), { kind: 'TEAM', winningTeamId: 1, winner: players[0] });
});
test('detecta la victoria del equipo rival', () => {
  const players = [p(1, 1, { hp: 0, isEliminated: true }), p(2, 2)];
  const r = getMatchOutcome(players); assert.equal(r.kind, 'TEAM'); assert.equal(r.winningTeamId, 2); assert.equal(r.winner.id, 2);
});
test('no anuncia ganador mientras sobreviva alguien de ambos equipos', () => assert.equal(getMatchOutcome(match()), null));
test('detecta campeón en todos contra todos', () => {
  const r = getMatchOutcome([p(1, undefined, { hp: 0 }), p(2, undefined, { hp: 9 }), p(3, undefined, { hp: 0, isEliminated: true })]);
  assert.equal(r.kind, 'FREE_FOR_ALL'); assert.equal(r.winner.id, 2);
});
test('declara empate si ambos equipos quedan sin supervivientes', () => {
  const players = [p(1, 1, { hp: 0, isEliminated: true }), p(2, 2, { hp: 0, isEliminated: true })];
  assert.deepEqual(getMatchOutcome(players), { kind: 'DRAW', winner: null });
});
