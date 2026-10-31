/** Formato JSON de repetición de Guerra Cúbita (.gcreplay). */
export const REPLAY_FORMAT = 'guerra-cubita-replay';
export const REPLAY_FORMAT_VERSION = 1;

function stableSerialize(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(stableSerialize).join(',') + ']';
  const keys = Object.keys(value).filter(key => value[key] !== undefined).sort();
  return '{' + keys.map(key => JSON.stringify(key) + ':' + stableSerialize(value[key])).join(',') + '}';
}

/** Huella determinista para detectar divergencias entre checkpoints; no es una firma criptográfica. */
export function hashReplayState(state) {
  const serialized = stableSerialize(state);
  let hash = 0x811c9dc5;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
const cloneJson = value => value === undefined ? null : JSON.parse(JSON.stringify(value));
function assertReplay(replay) {
  if (!replay || replay.format !== REPLAY_FORMAT || !Array.isArray(replay.events)) throw new TypeError('Objeto de repetición inválido.');
}
export function createMatchReplay({ seed, mode = 'UNKNOWN', engineVersion = '1.0.0', metadata = {} }) {
  if (!Number.isInteger(seed)) throw new TypeError('La repetición necesita una semilla entera.');
  const createdAt = new Date().toISOString();
  return {
    format: REPLAY_FORMAT, formatVersion: REPLAY_FORMAT_VERSION,
    metadata: {
      matchId: 'GC-' + createdAt.replace(/[^0-9]/g, '').slice(0, 14) + '-' + (seed >>> 0),
      createdAt, engineVersion, mode, seed: seed >>> 0, ...cloneJson(metadata)
    },
    initialState: null, events: [], checkpoints: [], finalResult: null
  };
}
export function setReplayInitialState(replay, state) { assertReplay(replay); replay.initialState = cloneJson(state); return replay; }
export function appendReplayEvent(replay, type, payload = {}) {
  assertReplay(replay);
  if (typeof type !== 'string' || !type.trim()) throw new TypeError('Evento sin tipo.');
  const event = { sequence: replay.events.length + 1, type, payload: cloneJson(payload) };
  replay.events.push(event); return event;
}
export function appendReplayCheckpoint(replay, label, state) {
  assertReplay(replay);
  const checkpoint = { sequence: replay.events.length, label: String(label || 'checkpoint'), state: cloneJson(state) };
  replay.checkpoints.push(checkpoint); return checkpoint;
}
export function setReplayFinalResult(replay, result) {
  assertReplay(replay); replay.finalResult = cloneJson(result); appendReplayEvent(replay, 'MATCH_FINISHED', result); return replay;
}
export function validateMatchReplay(value) {
  const errors = [];
  if (!value || typeof value !== 'object') return ['El archivo no contiene un objeto de repetición.'];
  if (value.format !== REPLAY_FORMAT) errors.push('Formato de archivo desconocido.');
  if (value.formatVersion !== REPLAY_FORMAT_VERSION) errors.push('Versión de formato no compatible: ' + value.formatVersion + '.');
  if (!value.metadata || !Number.isInteger(value.metadata.seed)) errors.push('Falta la semilla de la partida.');
  if (!value.initialState || typeof value.initialState !== 'object') errors.push('Falta el estado inicial.');
  if (!Array.isArray(value.events)) errors.push('La secuencia de eventos no es válida.');
  if (!Array.isArray(value.checkpoints)) errors.push('La lista de checkpoints no es válida.');
  if (Array.isArray(value.events)) value.events.forEach((event, i) => {
    if (!event || event.sequence !== i + 1 || typeof event.type !== 'string') errors.push('Evento inválido en posición ' + (i + 1) + '.');
  });
  if (Array.isArray(value.checkpoints)) value.checkpoints.forEach((item, i) => {
    if (!item || !Number.isInteger(item.sequence) || !item.state) errors.push('Checkpoint inválido en posición ' + (i + 1) + '.');
  });
  return errors;
}
export function serializeMatchReplay(replay) {
  const errors = validateMatchReplay(replay);
  if (errors.length) throw new TypeError(errors.join(' '));
  return JSON.stringify(replay, null, 2);
}
export function parseMatchReplay(serialized) {
  let parsed;
  try { parsed = typeof serialized === 'string' ? JSON.parse(serialized) : serialized; }
  catch (error) { throw new TypeError('JSON de repetición inválido: ' + error.message); }
  const errors = validateMatchReplay(parsed);
  if (errors.length) throw new TypeError(errors.join(' '));
  return parsed;
}
export function getReplayRandomResults(replay) {
  assertReplay(replay);
  return replay.events.filter(event => event.type === 'RANDOM_RESULT').map(event => event.payload);
}
export function downloadMatchReplay(replay, filename) {
  const serialized = serializeMatchReplay(replay);
  if (typeof document === 'undefined' || typeof URL === 'undefined' || typeof Blob === 'undefined') throw new Error('La descarga solo está disponible en un navegador.');
  const blob = new Blob([serialized], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename || ((replay.metadata && replay.metadata.matchId) || 'partida') + '.gcreplay';
  document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
  return anchor.download;
}
