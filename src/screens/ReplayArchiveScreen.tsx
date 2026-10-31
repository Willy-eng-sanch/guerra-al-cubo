import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Play, FileText, Download, Trash2, RefreshCw, Swords, CalendarClock, Users } from 'lucide-react';
import { deleteSavedReplay, downloadReplayLog, downloadStoredReplay, getSavedReplay, listSavedReplays } from '../gameplay/replay-storage.js';
import { GcSpriteCard } from '../ui/SpriteUI';

interface ReplaySummary {
  matchId: string;
  createdAt: string;
  savedAt: string;
  mode: string;
  seed: number;
  winnerId: number | null;
  winningTeamId: number | null;
  playerCount: number;
  eventCount: number;
  checkpointCount: number;
}

interface ReplayArchiveScreenProps {
  showDiagnostics?: boolean;
  onImportReplay?: (file: File) => void;
  onBack: () => void;
  onReplay: (replay: unknown) => void;
}

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date);
};

const modeLabel = (mode: string) => ({
  QUICK_BATTLE: 'Batalla rápida',
  TEAM_DRAFT_3V3: 'Draft 3 vs 3',
  STREET_CAMPAIGN: 'Campaña callejera',
  PASS_AND_PLAY: 'Pase y juega',
  ONLINE_PVP: 'Multijugador'
}[mode] || mode);

export const ReplayArchiveScreen: React.FC<ReplayArchiveScreenProps> = ({ onBack, onReplay, showDiagnostics = false, onImportReplay }) => {
  const [matches, setMatches] = useState<ReplaySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMatches(await listSavedReplays() as ReplaySummary[]);
    } catch (cause: any) {
      setError(cause?.message || 'No se pudo abrir el archivo local de partidas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const withReplay = async (matchId: string, action: (replay: any) => void) => {
    setWorkingId(matchId);
    setError(null);
    try {
      const record = await getSavedReplay(matchId);
      if (!record?.replay) throw new Error('No se encontró el archivo completo de esta partida.');
      action(record.replay);
    } catch (cause: any) {
      setError(cause?.message || 'No se pudo abrir la partida.');
    } finally {
      setWorkingId(null);
    }
  };

  const remove = async (matchId: string) => {
    setWorkingId(matchId);
    setError(null);
    try {
      await deleteSavedReplay(matchId);
      setMatches(previous => previous.filter(match => match.matchId !== matchId));
    } catch (cause: any) {
      setError(cause?.message || 'No se pudo eliminar la partida.');
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <div className="gc-screen gc-screen--archive min-h-screen bg-[#0b0e15] px-3 py-4 sm:px-6 sm:py-6 text-white">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/70 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="rounded-xl border border-slate-600 bg-slate-900 p-2.5 text-slate-200 hover:bg-slate-800" aria-label="Volver al menú">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Laboratorio de partidas</div>
              <h1 className="text-2xl font-black sm:text-3xl">Mis partidas</h1>
              <p className="mt-1 text-xs text-slate-400">Tus partidas terminadas se guardan aquí automáticamente.</p>
            </div>
          </div>
          <button onClick={() => void refresh()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </header>

        {showDiagnostics && (
          <details className="mb-4 rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-xs text-amber-100">
            <summary className="cursor-pointer font-bold">Herramientas de diagnóstico (solo desarrollo)</summary>
            <p className="mt-2 text-slate-300">Importa una repetición externa únicamente para reproducir y depurar una sesión.</p>
            <label className="mt-3 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-amber-400/40 bg-slate-900 px-3 py-2 font-bold text-amber-100 hover:bg-slate-800">
              Importar replay de prueba (.gcreplay)
              <input
                type="file"
                accept=".gcreplay,application/json"
                className="sr-only"
                onChange={event => {
                  const file = event.currentTarget.files?.[0];
                  if (file) onImportReplay?.(file);
                  event.currentTarget.value = '';
                }}
              />
            </label>
          </details>
        )}

        {error && <div role="alert" className="mb-4 rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-sm text-rose-200">{error}</div>}

        {loading ? (
          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-8 text-center text-sm text-slate-300">Cargando partidas guardadas…</div>
        ) : matches.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-600 bg-slate-900/50 px-5 py-12 text-center">
            <Swords className="mx-auto mb-3 h-10 w-10 text-cyan-400" />
            <h2 className="text-lg font-black">Todavía no tienes partidas guardadas</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">Cuando termine una partida, aparecerá aquí para que puedas volver a verla.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map(match => (
              <GcSpriteCard key={match.matchId} className="rounded-2xl p-4 shadow-lg">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="break-all text-sm font-black text-white">{modeLabel(match.mode)}</h2>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
                      <span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" />{formatDate(match.createdAt)}</span>
                      <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{match.playerCount} participantes</span>
                      <span>{match.eventCount} eventos</span>
                      <span>{match.checkpointCount} checkpoints</span>
                    </div>
                    <div className="mt-2 font-mono text-[10px] text-slate-500">{match.matchId}</div>
                  </div>
                  <div className="rounded-lg border border-slate-700 bg-slate-950/70 px-2.5 py-1 text-[10px] font-bold text-cyan-200">
                    {match.winningTeamId != null ? `Ganador: equipo ${match.winningTeamId}` : match.winnerId != null ? `Ganador: jugador ${match.winnerId}` : 'Partida finalizada'}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                  <button disabled={workingId === match.matchId} onClick={() => void withReplay(match.matchId, onReplay)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-700 px-3 py-2.5 text-xs font-black text-white hover:bg-cyan-600 disabled:opacity-50">
                    <Play className="h-4 w-4" /> Ver repetición
                  </button>
                  {showDiagnostics && (
                    <>
                    <button disabled={workingId === match.matchId} onClick={() => void withReplay(match.matchId, replay => downloadReplayLog(replay))} className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-950/50 px-3 py-2.5 text-xs font-bold text-emerald-200 hover:bg-emerald-900/60 disabled:opacity-50">
                      <FileText className="h-4 w-4" /> Exportar log
                    </button>
                    <button disabled={workingId === match.matchId} onClick={() => void withReplay(match.matchId, replay => downloadStoredReplay(replay))} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-900 px-3 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 disabled:opacity-50">
                      <Download className="h-4 w-4" /> Exportar replay
                    </button>
                    </>
                  )}
                  <button disabled={workingId === match.matchId} onClick={() => void remove(match.matchId)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/30 px-3 py-2.5 text-xs font-bold text-rose-200 hover:bg-rose-900/50 disabled:opacity-50">
                    <Trash2 className="h-4 w-4" /> Eliminar
                  </button>
                </div>
              </GcSpriteCard>
            ))}
          </div>
        )}
        <p className="mt-5 text-center text-[10px] leading-relaxed text-slate-500">Tus partidas se conservan en este navegador y dispositivo.</p>
      </div>
    </div>
  );
};
