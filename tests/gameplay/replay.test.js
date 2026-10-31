import test from 'node:test';
import assert from 'node:assert/strict';
import { GameplayRandomController, ReplayRandomMismatchError } from '../../src/gameplay/random.js';
import { findFirstReplayDifference, ReplayExecutionController, ReplayExecutionError } from '../../src/gameplay/replay-engine.js';
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


test('las tiradas de configuración quedan fuera del flujo aleatorio reproducible', () => {
  const replay = createMatchReplay({ seed: 42, mode: 'QUICK_BATTLE' });
  setReplayInitialState(replay, { players: [], deck: [{ uid: 'initial-card' }] });
  appendReplayEvent(replay, 'RANDOM_RESULT', { sequence: 1, kind: 'INT', purpose: 'deck.initial', min: 0, max: 9, raw: 0.3, value: 3 });
  appendReplayEvent(replay, 'MATCH_STARTED', {});
  appendReplayEvent(replay, 'RANDOM_RESULT', { sequence: 2, kind: 'INT', purpose: 'combat.attack', min: 1, max: 6, raw: 0.5, value: 4 });
  appendReplayEvent(replay, 'RANDOM_RESULT', { sequence: 3, kind: 'INT', purpose: 'combat.defense', min: 1, max: 6, raw: 0.2, value: 2 });

  const results = getReplayRandomResults(replay);
  assert.deepEqual(results.map(item => item.purpose), ['combat.attack', 'combat.defense']);
  assert.deepEqual(results.map(item => item.sequence), [1, 2]);
  assert.deepEqual(results.map(item => item.originalSequence), [2, 3]);
});

test('el ejecutor aplica comandos en orden y verifica checkpoints', async () => {
  const replay = createMatchReplay({ seed: 7, mode: 'QUICK_BATTLE' });
  setReplayInitialState(replay, { marker: 0 });
  appendReplayEvent(replay, 'MATCH_STARTED', {});
  appendReplayEvent(replay, 'PLAYER_ACTION', { kind: 'SET_MARKER', value: 1 });
  appendReplayEvent(replay, 'BOT_DECISION', { kind: 'BOT_TARGET', targetId: 2 });
  appendReplayCheckpoint(replay, 'after-bot-choice', {
    state: { marker: 1 },
    stateHash: hashReplayState({ marker: 1 })
  });
  appendReplayEvent(replay, 'PLAYER_ACTION', { kind: 'SET_MARKER', value: 2 });
  appendReplayCheckpoint(replay, 'end', {
    state: { marker: 2 },
    stateHash: hashReplayState({ marker: 2 })
  });

  let marker = 0;
  const decisions = [];
  const execution = new ReplayExecutionController(replay, {
    executeCommand: async command => { marker = command.value; },
    verifyBotDecision: async decision => { decisions.push(decision.targetId); assert.equal(marker, 1); },
    captureCheckpoint: async () => ({ marker }),
    assertRandomFullyConsumed: () => true
  });

  const result = await execution.run();
  assert.equal(result.status, 'FINISHED');
  assert.equal(result.consumedEvents, replay.events.length);
  assert.deepEqual(decisions, [2]);
  assert.equal(result.consumedCheckpoints, 2);
});

test('el ejecutor se detiene en el primer checkpoint divergente', async () => {
  const replay = createMatchReplay({ seed: 8, mode: 'QUICK_BATTLE' });
  setReplayInitialState(replay, { marker: 0 });
  appendReplayEvent(replay, 'MATCH_STARTED', {});
  appendReplayEvent(replay, 'PLAYER_ACTION', { kind: 'SET_MARKER', value: 1 });
  appendReplayCheckpoint(replay, 'wrong-state', {
    state: { marker: 99 },
    stateHash: hashReplayState({ marker: 99 })
  });

  let marker = 0;
  const execution = new ReplayExecutionController(replay, {
    executeCommand: command => { marker = command.value; },
    captureCheckpoint: () => ({ marker })
  });
  await assert.rejects(
    () => execution.run(),
    error => error instanceof ReplayExecutionError &&
      error.kind === 'CHECKPOINT_MISMATCH' &&
      error.sequence === 2 &&
      error.details.firstDifference?.path === 'root.marker'
  );
  assert.equal(execution.getProgress().status, 'FAILED');
  assert.equal(execution.getProgress().consumedEvents, 2);
});

test('el ejecutor no finaliza si quedan resultados aleatorios sin consumir', async () => {
  const replay = createMatchReplay({ seed: 9, mode: 'QUICK_BATTLE' });
  setReplayInitialState(replay, { marker: 0 });
  appendReplayEvent(replay, 'MATCH_STARTED', {});
  appendReplayEvent(replay, 'RANDOM_RESULT', { sequence: 1, kind: 'INT', purpose: 'dice', min: 1, max: 6, raw: 0.3, value: 2 });
  const random = new GameplayRandomController({
    mode: 'replay',
    seed: replay.metadata.seed,
    recordedEvents: getReplayRandomResults(replay)
  });
  const execution = new ReplayExecutionController(replay, {
    executeCommand: () => {},
    assertRandomFullyConsumed: () => random.assertFullyConsumed()
  });
  await assert.rejects(
    () => execution.run(),
    error => error instanceof ReplayExecutionError &&
      error.kind === 'COMMAND_EXECUTION_FAILED'
  );
});


test('el ejecutor verifica también los eventos derivados del comando', async () => {
  const replay = createMatchReplay({ seed: 10, mode: 'QUICK_BATTLE' });
  setReplayInitialState(replay, { marker: 0 });
  appendReplayEvent(replay, 'MATCH_STARTED', {});
  appendReplayEvent(replay, 'PLAYER_ACTION', { kind: 'SET_MARKER', value: 1 });
  appendReplayEvent(replay, 'GAME_LOG', { message: 'marker set', actorName: 'Jugador' });

  const observed = [];
  const execution = new ReplayExecutionController(replay, {
    executeCommand: command => {
      observed.push({ type: 'PLAYER_ACTION', payload: command });
      observed.push({ type: 'GAME_LOG', payload: { message: 'marker set', actorName: 'Jugador' } });
    },
    verifyEvent: event => {
      if (event.type === 'MATCH_STARTED') return;
      const actual = observed.shift();
      assert.deepEqual(actual, { type: event.type, payload: event.payload });
    }
  });
  const result = await execution.run();
  assert.equal(result.status, 'FINISHED');
  assert.deepEqual(observed, []);
});

test('el ejecutor detecta el primer campo divergente de un evento', async () => {
  const replay = createMatchReplay({ seed: 11, mode: 'QUICK_BATTLE' });
  setReplayInitialState(replay, { marker: 0 });
  appendReplayEvent(replay, 'MATCH_STARTED', {});
  appendReplayEvent(replay, 'PLAYER_ACTION', { kind: 'SET_MARKER', value: 1 });
  appendReplayEvent(replay, 'GAME_LOG', { message: 'expected message' });

  const execution = new ReplayExecutionController(replay, {
    executeCommand: () => {},
    verifyEvent: event => {
      if (event.type === 'GAME_LOG') {
        const difference = findFirstReplayDifference(
          event.payload,
          { message: 'different message' }
        );
        throw new ReplayExecutionError('event mismatch', {
          kind: 'EVENT_MISMATCH', sequence: event.sequence, firstDifference: difference
        });
      }
    }
  });
  await assert.rejects(
    () => execution.run(),
    error => error instanceof ReplayExecutionError &&
      error.kind === 'EVENT_MISMATCH' &&
      error.details.firstDifference.path === 'root.message'
  );
});


test('el ejecutor aplica efectos automáticos de reglas registrados', async () => {
  const replay = createMatchReplay({ seed: 12, mode: 'QUICK_BATTLE' });
  setReplayInitialState(replay, { marker: 0 });
  appendReplayEvent(replay, 'MATCH_STARTED', {});
  appendReplayEvent(replay, 'RULE_EFFECT', { kind: 'MORPH_EXHAUSTED', playerId: 2, round: 13 });

  const applied = [];
  const execution = new ReplayExecutionController(replay, {
    executeCommand: () => {},
    applyRuleEffect: async effect => { applied.push(effect); }
  });
  const result = await execution.run();
  assert.equal(result.status, 'FINISHED');
  assert.deepEqual(applied, [{ kind: 'MORPH_EXHAUSTED', playerId: 2, round: 13 }]);
});


test('una decisión automática se valida antes de consumir una sola vez su evento observado', async () => {
  const replay = createMatchReplay({ seed: 13, mode: 'QUICK_BATTLE' });
  setReplayInitialState(replay, { marker: 0 });
  appendReplayEvent(replay, 'MATCH_STARTED', {});
  appendReplayEvent(replay, 'BOT_DECISION', { kind: 'BOT_CHOICE', value: 'A' });

  const observed = [{ type: 'BOT_DECISION', payload: { kind: 'BOT_CHOICE', value: 'A' } }];
  let validated = 0;
  let consumed = 0;
  const execution = new ReplayExecutionController(replay, {
    executeCommand: () => {},
    verifyBotDecision: async decision => {
      validated += 1;
      assert.equal(decision.value, 'A');
      assert.equal(observed.length, 1, 'la validación no consume el evento');
    },
    verifyEvent: event => {
      const item = observed.shift();
      assert.deepEqual(item, { type: event.type, payload: event.payload });
      consumed += 1;
    }
  });
  const result = await execution.run();
  assert.equal(result.status, 'FINISHED');
  assert.equal(validated, 1);
  assert.equal(consumed, 1);
  assert.deepEqual(observed, []);
});
