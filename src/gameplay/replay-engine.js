/**
 * Ejecutor secuencial del historial .gcreplay.
 *
 * El motor no elige acciones ni genera resultados aleatorios nuevos:
 * entrega las acciones registradas al adaptador del juego, verifica las
 * decisiones automáticas y comprueba checkpoints en el orden original.
 */
import { hashReplayState, validateMatchReplay } from './replay.js';

export class ReplayExecutionError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ReplayExecutionError';
    this.details = details;
    this.sequence = details.sequence ?? null;
    this.kind = details.kind ?? 'REPLAY_EXECUTION_ERROR';
  }
}

export class ReplayExecutionController {
  constructor(replay, adapter = {}) {
    const errors = validateMatchReplay(replay);
    if (errors.length) {
      throw new ReplayExecutionError('No se puede ejecutar esta repetición: ' + errors.join(' '), { kind: 'INVALID_REPLAY' });
    }
    if (typeof adapter.executeCommand !== 'function') {
      throw new TypeError('El adaptador debe implementar executeCommand(command, event).');
    }
    this.replay = replay;
    this.adapter = adapter;
    this.cursor = 0;
    this.status = 'READY';
    this.error = null;
    this.checkpointCursor = 0;
    this.checkpoints = [...replay.checkpoints].sort((a, b) => a.sequence - b.sequence);
    this.onProgress = typeof adapter.onProgress === 'function' ? adapter.onProgress : () => {};
  }

  getProgress() {
    return {
      status: this.status,
      consumedEvents: this.cursor,
      totalEvents: this.replay.events.length,
      consumedCheckpoints: this.checkpointCursor,
      totalCheckpoints: this.checkpoints.length,
      error: this.error
    };
  }

  async _verifyCheckpoint(checkpoint) {
    if (typeof this.adapter.captureCheckpoint !== 'function') {
      throw new ReplayExecutionError('No hay adaptador para capturar el estado de los checkpoints.', {
        kind: 'CHECKPOINT_ADAPTER_MISSING', sequence: checkpoint.sequence, label: checkpoint.label
      });
    }
    const actualState = await this.adapter.captureCheckpoint(checkpoint);
    const expectedHash = checkpoint.state?.stateHash || hashReplayState(checkpoint.state);
    const actualHash = hashReplayState(actualState);
    if (actualHash !== expectedHash) {
      throw new ReplayExecutionError('La reconstrucción diverge en el checkpoint "' + checkpoint.label + '".', {
        kind: 'CHECKPOINT_MISMATCH',
        sequence: checkpoint.sequence,
        label: checkpoint.label,
        expectedHash,
        actualHash,
        expectedState: checkpoint.state?.state ?? checkpoint.state,
        actualState
      });
    }
    this.checkpointCursor += 1;
    await this.adapter.onCheckpoint?.(checkpoint, actualState);
  }

  async _verifyCheckpointsAt(sequence) {
    while (
      this.checkpointCursor < this.checkpoints.length &&
      this.checkpoints[this.checkpointCursor].sequence === sequence
    ) {
      await this._verifyCheckpoint(this.checkpoints[this.checkpointCursor]);
    }
    const next = this.checkpoints[this.checkpointCursor];
    if (next && next.sequence < sequence) {
      throw new ReplayExecutionError('Un checkpoint quedó atrás en la secuencia de reproducción.', {
        kind: 'CHECKPOINT_SEQUENCE_GAP', sequence, pendingCheckpoint: next
      });
    }
  }

  async step() {
    if (this.status === 'FINISHED') return this.getProgress();
    if (this.status === 'FAILED') throw this.error;
    try {
      if (this.status === 'READY') {
        this.status = 'RUNNING';
        await this._verifyCheckpointsAt(0);
      }
      const event = this.replay.events[this.cursor];
      if (!event) {
        await this._verifyCheckpointsAt(this.replay.events.length);
        await this.adapter.assertRandomFullyConsumed?.();
        if (this.checkpointCursor !== this.checkpoints.length) {
          throw new ReplayExecutionError('La repetición terminó con checkpoints sin verificar.', {
            kind: 'UNVERIFIED_CHECKPOINTS',
            pendingCheckpoints: this.checkpoints.slice(this.checkpointCursor)
          });
        }
        this.status = 'FINISHED';
        this.onProgress(this.getProgress());
        return this.getProgress();
      }

      if (event.type === 'PLAYER_ACTION') {
        await this.adapter.executeCommand(event.payload, event);
      } else if (event.type === 'BOT_DECISION') {
        if (typeof this.adapter.verifyBotDecision !== 'function') {
          throw new ReplayExecutionError('No hay verificador para una decisión automática registrada.', {
            kind: 'BOT_DECISION_ADAPTER_MISSING', sequence: event.sequence, payload: event.payload
          });
        }
        await this.adapter.verifyBotDecision(event.payload, event);
      }

      await this.adapter.waitForIdle?.(event);
      await this.adapter.verifyEvent?.(event);
      this.cursor += 1;
      await this._verifyCheckpointsAt(event.sequence);
      this.onProgress(this.getProgress());
      return this.getProgress();
    } catch (error) {
      this.status = 'FAILED';
      this.error = error instanceof ReplayExecutionError
        ? error
        : new ReplayExecutionError('La reproducción se detuvo en el primer error: ' + (error?.message || String(error)), {
            kind: 'COMMAND_EXECUTION_FAILED',
            sequence: this.replay.events[this.cursor]?.sequence ?? null,
            event: this.replay.events[this.cursor] ?? null,
            cause: error
          });
      this.onProgress(this.getProgress());
      throw this.error;
    }
  }

  async run() {
    while (this.status !== 'FINISHED' && this.status !== 'FAILED') await this.step();
    return this.getProgress();
  }

  stop() {
    if (this.status === 'FINISHED' || this.status === 'FAILED') return this.getProgress();
    this.status = 'STOPPED';
    this.onProgress(this.getProgress());
    return this.getProgress();
  }
}
