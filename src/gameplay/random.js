/**
 * Randomness del gameplay: RECORD genera y registra; REPLAY consume exactamente
 * los resultados guardados. La aleatoriedad cosmética debe quedar fuera.
 */
const UINT32_RANGE = 0x100000000;
const normalizeSeed = seed => {
  const value = Number(seed);
  if (!Number.isFinite(value)) throw new TypeError('La semilla debe ser numérica.');
  return Math.trunc(value) >>> 0;
};
function mulberry32(seed) {
  let state = normalizeSeed(seed);
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / UINT32_RANGE;
  };
}
export class ReplayRandomMismatchError extends Error {
  constructor(message, details = {}) { super(message); this.name = 'ReplayRandomMismatchError'; this.details = details; }
}
export class GameplayRandomController {
  constructor({ mode = 'record', seed = 1, recordedEvents = [], onEvent = null } = {}) {
    if (!['record', 'replay'].includes(mode)) throw new TypeError('Modo aleatorio no soportado.');
    this.mode = mode; this.seed = normalizeSeed(seed); this.generator = mulberry32(this.seed);
    this.recordedEvents = [...recordedEvents]; this.generatedEvents = []; this.cursor = 0;
    this.onEvent = typeof onEvent === 'function' ? onEvent : null;
  }
  _value(kind, purpose, constraints, calculate) {
    if (typeof purpose !== 'string' || !purpose.trim()) throw new TypeError('Falta el propósito de la operación aleatoria.');
    if (this.mode === 'replay') {
      const expected = this.recordedEvents[this.cursor];
      if (!expected) throw new ReplayRandomMismatchError('Replay agotado en ' + purpose + ' (' + (this.cursor + 1) + ').', { cursor: this.cursor, kind, purpose, constraints });
      const matches = expected.kind === kind && expected.purpose === purpose &&
        Object.keys(constraints).every(key => expected[key] === constraints[key]);
      if (!matches || typeof expected.value !== 'number' || !Number.isFinite(expected.value)) {
        throw new ReplayRandomMismatchError(
          'Desincronización aleatoria en ' + (this.cursor + 1) + ': ' + expected.kind + '/' + expected.purpose + ' != ' + kind + '/' + purpose + '.',
          { cursor: this.cursor, expected, actual: { kind, purpose, ...constraints } }
        );
      }
      this.cursor += 1; return expected.value;
    }
    const raw = this.generator();
    const event = { sequence: this.generatedEvents.length + 1, kind, purpose, ...constraints, raw, value: calculate(raw) };
    this.generatedEvents.push(event); this.onEvent?.(event); return event.value;
  }
  float(purpose) { return this._value('FLOAT', purpose, {}, raw => raw); }
  int(min, max, purpose) {
    if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || max < min) throw new RangeError('Rango inválido: ' + min + '..' + max);
    return this._value('INT', purpose, { min, max }, raw => min + Math.floor(raw * (max - min + 1)));
  }
  pick(items, purpose) {
    if (!Array.isArray(items) || !items.length) throw new RangeError('Colección vacía.');
    return items[this.int(0, items.length - 1, purpose)];
  }
  shuffle(items, purpose) {
    if (!Array.isArray(items)) throw new TypeError('shuffle espera un array.');
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = this.int(0, i, purpose + '.swap.' + i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  getEvents() { return this.mode === 'record' ? [...this.generatedEvents] : [...this.recordedEvents]; }
  getConsumedCount() { return this.mode === 'record' ? this.generatedEvents.length : this.cursor; }
  assertFullyConsumed() {
    if (this.mode === 'replay' && this.cursor !== this.recordedEvents.length) {
      throw new ReplayRandomMismatchError('Replay incompleto: ' + this.cursor + '/' + this.recordedEvents.length + ' resultados consumidos.', { consumed: this.cursor, total: this.recordedEvents.length });
    }
    return true;
  }
}
let activeSession = null;
export function createMatchSeed() {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && cryptoApi.getRandomValues) {
    const value = new Uint32Array(1); cryptoApi.getRandomValues(value); return value[0] >>> 0;
  }
  return (Date.now() ^ 0x9E3779B9) >>> 0;
}
export function startGameplayRandomRecording(seed, onEvent) {
  activeSession = new GameplayRandomController({ mode: 'record', seed, onEvent }); return activeSession;
}
export function startGameplayRandomReplay(seed, recordedEvents) {
  activeSession = new GameplayRandomController({ mode: 'replay', seed, recordedEvents }); return activeSession;
}
export function stopGameplayRandomSession() { const previous = activeSession; activeSession = null; return previous; }
export function getGameplayRandomSession() { return activeSession; }
export function gameplayRandomInt(min, max, purpose) {
  return activeSession ? activeSession.int(min, max, purpose) : min + Math.floor(Math.random() * (max - min + 1));
}
export function gameplayRandomFloat(purpose) { return activeSession ? activeSession.float(purpose) : Math.random(); }
export function gameplayRandomPick(items, purpose) {
  if (!Array.isArray(items) || !items.length) throw new RangeError('Colección vacía.');
  return items[gameplayRandomInt(0, items.length - 1, purpose)];
}
export function gameplayShuffle(items, purpose) {
  if (!Array.isArray(items)) throw new TypeError('shuffle espera un array.');
  if (activeSession) return activeSession.shuffle(items, purpose);
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
