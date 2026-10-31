/**
 * Persistent local archive for completed Guerra Cúbita matches.
 * IndexedDB keeps full replay payloads without localStorage quota pressure.
 */
import { validateMatchReplay, serializeMatchReplay } from './replay.js';

const DB_NAME = 'guerra-cubita-replay-archive';
const DB_VERSION = 1;
const STORE_NAME = 'completed-matches';

function getIndexedDB(factory) {
  const candidate = factory ?? globalThis.indexedDB;
  if (!candidate) {
    throw new Error('Este navegador no permite guardar partidas localmente (IndexedDB no disponible).');
  }
  return candidate;
}

export function openReplayArchive(factory) {
  const indexedDB = getIndexedDB(factory);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'matchId' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('No se pudo abrir el archivo de partidas.'));
    request.onblocked = () => reject(new Error('El archivo de partidas está ocupado por otra pestaña. Cierra otras pestañas del juego y vuelve a intentarlo.'));
  });
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Falló una operación del archivo de partidas.'));
  });
}

export async function saveCompletedReplay(replay, factory) {
  const errors = validateMatchReplay(replay);
  if (errors.length) throw new TypeError('No se puede guardar una repetición incompleta: ' + errors.join(' '));

  // Capture an immutable point-in-time copy before the first await. Victory
  // messages and delayed callbacks must not mutate the replay while IndexedDB
  // is opening its connection or writing the transaction.
  const replaySnapshot = JSON.parse(serializeMatchReplay(replay));
  if (!replaySnapshot.finalResult) throw new TypeError('Solo se guardan partidas que ya tengan resultado final.');

  const matchId = replaySnapshot.metadata?.matchId;
  if (!matchId) throw new TypeError('La partida no tiene identificador.');
  const record = {
    matchId,
    createdAt: replaySnapshot.metadata.createdAt || new Date().toISOString(),
    savedAt: new Date().toISOString(),
    mode: replaySnapshot.metadata.mode || replaySnapshot.initialState?.matchType || 'UNKNOWN',
    seed: replaySnapshot.metadata.seed,
    round: replaySnapshot.finalResult.finalPlayers?.[0]?.round ?? null,
    winnerId: replaySnapshot.finalResult.winnerId ?? null,
    winningTeamId: replaySnapshot.finalResult.winningTeamId ?? null,
    playerCount: replaySnapshot.initialState?.players?.length ?? 0,
    eventCount: replaySnapshot.events.length,
    checkpointCount: replaySnapshot.checkpoints.length,
    replay: replaySnapshot
  };

  const db = await openReplayArchive(factory);
  try {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const done = new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error || new Error('No se pudo confirmar el guardado de la partida.'));
      tx.onabort = () => reject(tx.error || new Error('Se canceló el guardado de la partida.'));
    });
    tx.objectStore(STORE_NAME).put(record);
    await done;
    return { ...record, replay: undefined };
  } finally {
    db.close();
  }
}

export async function listSavedReplays(factory) {
  const db = await openReplayArchive(factory);
  try {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const records = await requestResult(tx.objectStore(STORE_NAME).getAll());
    return records
      .map(({ replay, ...summary }) => summary)
      .sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt)));
  } finally {
    db.close();
  }
}

export async function getSavedReplay(matchId, factory) {
  const db = await openReplayArchive(factory);
  try {
    const tx = db.transaction(STORE_NAME, 'readonly');
    return (await requestResult(tx.objectStore(STORE_NAME).get(matchId))) || null;
  } finally {
    db.close();
  }
}

export async function deleteSavedReplay(matchId, factory) {
  const db = await openReplayArchive(factory);
  try {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const done = new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error || new Error('No se pudo eliminar la partida.'));
      tx.onabort = () => reject(tx.error || new Error('Se canceló la eliminación de la partida.'));
    });
    tx.objectStore(STORE_NAME).delete(matchId);
    await done;
    return true;
  } finally {
    db.close();
  }
}

const pretty = value => value == null ? '—' : String(value);
const compactJson = value => JSON.stringify(value ?? {});

export function createReplayLogText(replay) {
  const errors = validateMatchReplay(replay);
  if (errors.length) throw new TypeError('No se puede generar el log: ' + errors.join(' '));

  const metadata = replay.metadata || {};
  const initialPlayers = replay.initialState?.players || [];
  const lines = [
    'GUERRA CÚBITA — REGISTRO DE PARTIDA',
    '==================================',
    'ID: ' + pretty(metadata.matchId),
    'Fecha: ' + pretty(metadata.createdAt),
    'Modo: ' + pretty(metadata.mode),
    'Semilla: ' + pretty(metadata.seed),
    'Versión del motor: ' + pretty(metadata.engineVersion),
    'Jugadores: ' + initialPlayers.length,
    'Eventos: ' + replay.events.length,
    'Checkpoints: ' + replay.checkpoints.length,
    '',
    'ESTADO INICIAL',
    '--------------',
    ...initialPlayers.map(player =>
      `Jugador ${player.id}: ${player.name} | personaje=${player.activeMorphCharacter || player.characterType} | equipo=${pretty(player.teamId)} | bot=${Boolean(player.isBot)} | HP=${player.hp}/${player.maxHp}`
    ),
    'Orden inicial del mazo: ' + compactJson((replay.initialState?.deck || []).map(card => ({ id: card.id, uid: card.uid }))),
    '',
    'SECUENCIA CRONOLÓGICA',
    '--------------------'
  ];

  replay.events.forEach(event => {
    const payload = event.payload || {};
    const prefix = String(event.sequence).padStart(5, '0') + ' [' + event.type + ']';
    if (event.type === 'GAME_LOG') {
      lines.push(prefix + ' ' + pretty(payload.message) + ' (actor: ' + pretty(payload.actorName) + ', ronda: ' + pretty(payload.round) + ')');
    } else if (event.type === 'RANDOM_RESULT') {
      lines.push(prefix + ' ' + pretty(payload.purpose) + ' => ' + pretty(payload.value) +
        ' [' + pretty(payload.min) + '..' + pretty(payload.max) + '; seq=' + pretty(payload.sequence) + ']');
    } else if (event.type === 'PLAYER_ACTION' || event.type === 'BOT_DECISION' || event.type === 'RULE_EFFECT') {
      lines.push(prefix + ' ' + pretty(payload.kind) + ' ' + compactJson(payload));
    } else if (event.type === 'DECK_SHUFFLED') {
      lines.push(prefix + ' ' + pretty(payload.purpose) + ' orden=' + compactJson(payload.cardOrder));
    } else {
      lines.push(prefix + ' ' + compactJson(payload));
    }
  });

  lines.push('', 'CHECKPOINTS', '------------');
  replay.checkpoints.forEach(checkpoint => {
    lines.push(
      `seq=${checkpoint.sequence} etiqueta=${checkpoint.label} hash=${checkpoint.state?.stateHash || 'sin-hash'}`
    );
  });

  lines.push('', 'RESULTADO FINAL', '---------------', compactJson(replay.finalResult));
  return lines.join('\n');
}

export function downloadReplayLog(replay, filename) {
  const log = createReplayLogText(replay);
  if (typeof document === 'undefined' || typeof URL === 'undefined' || typeof Blob === 'undefined') {
    throw new Error('La descarga del log solo está disponible en un navegador.');
  }
  const blob = new Blob([log], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  const base = replay.metadata?.matchId || 'guerra-cubita-partida';
  anchor.download = filename || (base + '.gclog.txt');
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return anchor.download;
}

export function downloadStoredReplay(replay, filename) {
  const serialized = serializeMatchReplay(replay);
  if (typeof document === 'undefined' || typeof URL === 'undefined' || typeof Blob === 'undefined') {
    throw new Error('La descarga del replay solo está disponible en un navegador.');
  }
  const blob = new Blob([serialized], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename || ((replay.metadata?.matchId || 'partida') + '.gcreplay');
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return anchor.download;
}
