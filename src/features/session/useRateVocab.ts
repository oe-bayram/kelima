import { onlineManager, useMutation, useQueryClient } from '@tanstack/react-query';

import { sessionItemId } from '@/features/session/ids';
import { dispatchOp } from '@/features/session/outbox';
import { buildRatingInputs } from '@/features/session/sessionApi';
import { applyRating } from '@/features/session/sessionLogic';
import type { ProgressRow } from '@/lib/dataClient';
import type { Rating, SessionType } from '@/lib/enums';
import { queryKeys } from '@/lib/queryKeys';

export interface RateVariables {
  entryId: string;
  rating: Rating;
  sessionId: string;
  type: SessionType;
  /** Epoch-ms der Antwort; vom Aufrufer gesetzt (stabil für Item-ID/Replay). */
  answeredAt: number;
  /** Progress-Stand VOR der Bewertung (aus der ProgressMap). */
  prev?: ProgressRow;
}

type ProgressCache = Map<string, ProgressRow>;
interface RateContext {
  prev?: ProgressCache;
}

/**
 * Bewertungs-Mutation: schreibt Session-Item + Progress-Upsert und aktualisiert
 * die ProgressMap optimistisch. Offline/Netzfehler landen in der Outbox
 * (`dispatchOp` schluckt sie), sodass das Optimistic-Update **bestehen bleibt**;
 * nur echte Fehler lösen einen Rollback aus. onMutate UND der Server-Write
 * basieren auf demselben `variables.prev`, damit Zähler nicht doppelt zählen.
 */
export function useRateVocab() {
  const qc = useQueryClient();

  return useMutation<void, Error, RateVariables, RateContext>({
    mutationFn: async (v) => {
      const { item, progress } = await buildRatingInputs({
        entryId: v.entryId,
        rating: v.rating,
        sessionId: v.sessionId,
        type: v.type,
        answeredAt: v.answeredAt,
        prev: v.prev ?? undefined,
      });
      await dispatchOp({
        key: `item:${sessionItemId(v.sessionId, v.entryId, v.answeredAt)}`,
        kind: 'item',
        input: item,
      });
      await dispatchOp({ key: `progress:${progress.id}`, kind: 'progress', input: progress });
    },

    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: queryKeys.progress });
      const prev = qc.getQueryData<ProgressCache>(queryKeys.progress);
      const patch = applyRating(v.prev ?? undefined, v.rating, v.type, v.answeredAt);
      const next: ProgressCache = new Map(prev ?? []);
      const existing = next.get(v.entryId);
      next.set(v.entryId, { ...existing, entryId: v.entryId, ...patch } as unknown as ProgressRow);
      qc.setQueryData(queryKeys.progress, next);
      return { prev };
    },

    onError: (_err, _v, ctx) => {
      // Nur echte Fehler landen hier (Netzfehler → Outbox in dispatchOp).
      if (ctx?.prev) qc.setQueryData(queryKeys.progress, ctx.prev);
    },

    onSettled: () => {
      // Offline nicht invalidieren (würde das Optimistic-Update verwerfen);
      // nach dem Reconnect lädt replayOutbox die ProgressMap neu.
      if (onlineManager.isOnline()) void qc.invalidateQueries({ queryKey: queryKeys.progress });
    },
  });
}
