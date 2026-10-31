import test from 'node:test';
import assert from 'node:assert/strict';
import { GameplayRandomController, ReplayRandomMismatchError } from '../../src/gameplay/random.js';
import {
  appendReplayCheckpoint, appendReplayEvent, createMatchReplay, getReplayRandomResults,
  getReplayCommands, hashReplayState, parseMatchReplay, serializeMatchReplay, setReplayFinalResult, setReplayInitialState, validateMatchReplay
} from '../../src/gameplay/replay.js';

test('una semilla reproduce exactamente la secuencia y el barajado', () => {
  const a = new GameplayRandomController({ mode: 'record', seed: 93842 });
  const b = new GameplayRandomController({ mode: 'record', seed: 93842 });
  assert.deepEqual(a.shuffle([1,2,3,4,5,6], 'deck.initial'), b.shuffle([1,2,3,4,5,6], 'deck.initial'));
  assert.deepEqual(a.getEvents(), b.getEvents());
});
test('RECORD conserva propósito, rango y resultado de cada tirada', () => {
  const random = new GameplayRandomController({ mode: 'record', seed: 42 });
  const roll = random.int(1, 6, 'combat.attack.d6'); random.int(0, 1, 'trick.coin-flip');
  const event = random.getEvents()[0];
  assert.ok(roll >= 1 && roll <= 6); assert.equal(event.purpose, 'combat.attack.d6');
  assert.equal(event.min, 1); assert.equal(event.max, 6); assert.equal(event.value, roll);
});
test('REPLAY consume los resultados guardados en lugar de generar azar', () => {
  const record = new GameplayRandomController({ mode: 'record', seed: 193842 });
  const expected = [record.int(1,6,'dice.attacker'), record.int(1,6,'dice.defender'), record.int(0,49,'deck.index'), record.float('effect.probability')];
  const replay = new GameplayRandomController({ mode: 'replay', seed: 9, recordedEvents: record.getEvents() });
  assert.deepEqual([replay.int(1,6,'dice.attacker'), replay.int(1,6,'dice.defender'), replay.int(0,49,'deck.index'), replay.float('effect.probability')], expected);
  assert.equal(replay.assertFullyConsumed(), true);
});
test('REPLAY se detiene si cambia el propósito o el rango', () => {
  const record = new GameplayRandomController({ mode: 'record', seed: 12 }); record.int(1, 6, 'dice.attack');
  const replay = new GameplayRandomController({ mode: 'replay', seed: 12, recordedEvents: record.getEvents() });
  assert.throws(() => replay.int(1, 5, 'dice.attack'), ReplayRandomMismatchError);
});
test('REPLAY detecta resultados que el motor nunca consumió', () => {
  const record = new GameplayRandomController({ mode: 'record', seed: 12 });
  record.int(1,6,'attack'); record.int(1,6,'defense');
  const replay = new GameplayRandomController({ mode: 'replay', seed: 12, recordedEvents: record.getEvents() });
  replay.int(1,6,'attack'); assert.throws(() => replay.assertFullyConsumed(), ReplayRandomMismatchError);
});
test('pick y shuffle no mutan la colección recibida', () => {
  const items = ['a','b','c','d']; const random = new GameplayRandomController({ mode: 'record', seed: 57 });
  const shuffled = random.shuffle(items, 'test.shuffle');
  assert.deepEqual(items, ['a','b','c','d']); assert.notEqual(shuffled, items);
  assert.ok(items.includes(random.pick(items, 'test.pick')));
});
test('el archivo .gcreplay serializa, carga y valida eventos y checkpoints', () => {
  const replay = createMatchReplay({ seed: 1234, mode: 'TEAM_BATTLE' });
  setReplayInitialState(replay, { players: [{ id: 1, hp: 20 }], deck: [{ uid: 'card-1', id: 1 }] });
  appendReplayEvent(replay, 'PLAYER_ACTION', { actorId: 1, action: 'ATTACK', targetId: 2 });
  appendReplayEvent(replay, 'RANDOM_RESULT', { sequence: 1, kind: 'INT', purpose: 'dice.attack', min: 1, max: 6, value: 4 });
  appendReplayCheckpoint(replay, 'after-attack', { player1Hp: 20, player2Hp: 16 });
  setReplayFinalResult(replay, { winnerId: 1 });
  const loaded = parseMatchReplay(serializeMatchReplay(replay));
  assert.deepEqual(loaded, replay); assert.equal(validateMatchReplay(loaded).length, 0);
  assert.equal(getReplayRandomResults(loaded).length, 1);
});
test('la validación rechaza versiones y secuencias corruptas', () => {
  const replay = createMatchReplay({ seed: 77 }); setReplayInitialState(replay, { players: [], deck: [] });
  appendReplayEvent(replay, 'MATCH_STARTED', {}); replay.events[0].sequence = 9;
  assert.ok(validateMatchReplay(replay).some(error => error.includes('Evento inválido')));
  assert.throws(() => parseMatchReplay({ ...replay, formatVersion: 99 }));
});
test('el generador rechaza rangos y colecciones vacías', () => {
  const random = new GameplayRandomController({ mode: 'record', seed: 3 });
  assert.throws(() => random.int(2,1,'bad-range'), RangeError);
  assert.throws(() => random.pick([], 'empty-pick'), RangeError);
});

test('las huellas de estado son estables aunque cambie el orden de las claves', () => {
  const first = { round: 3, players: [{ id: 1, hp: 12, hand: ['a', 'b'] }], turnIndex: 2 };
  const second = { turnIndex: 2, players: [{ hand: ['a', 'b'], hp: 12, id: 1 }], round: 3 };
  const third = { ...second, round: 4 };
  assert.equal(hashReplayState(first), hashReplayState(second));
  assert.notEqual(hashReplayState(first), hashReplayState(third));
});

test('el archivo expone comandos en el orden exacto para reproducir ambos bandos', () => {
  const replay = createMatchReplay({ seed: 101, mode: 'TEAM_BATTLE' });
  setReplayInitialState(replay, { players: [], deck: [] });
  appendReplayEvent(replay, 'PLAYER_ACTION', { kind: 'ATTACK', actorId: 1, targetId: 2 });
  appendReplayEvent(replay, 'RANDOM_RESULT', { sequence: 1, kind: 'INT', purpose: 'attack.d6', min: 1, max: 6, raw: 0.5, value: 4 });
  appendReplayEvent(replay, 'BOT_DECISION', { kind: 'END_TURN', actorId: 2 });
  assert.deepEqual(getReplayCommands(replay).map(item => item.type), ['PLAYER_ACTION', 'BOT_DECISION']);
  assert.deepEqual(getReplayCommands(replay).map(item => item.sequence), [1, 3]);
});
