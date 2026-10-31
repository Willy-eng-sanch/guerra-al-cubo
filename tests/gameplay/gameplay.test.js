import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceTurnState, getMatchOutcome, resolveCubiculaTransfer } from '../../src/gameplay/rules.js';

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
test('al comenzar turno se quita congelación y disminuye el cooldown', () => {
  const r = advanceTurnState([p(1, 1), p(2, 2, { isFrozen: true, abilityCooldownRemaining: 2 })], 0, 3);
  assert.equal(r.players[1].isFrozen, false); assert.equal(r.players[1].abilityCooldownRemaining, 1);
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
