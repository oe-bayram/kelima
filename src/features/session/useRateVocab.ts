import { useMutation, useQueryClient } from '@tanstack/react-query';

import { writeRating } from '@/features/session/sessionApi';
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
 * Bewertungs-Mutation: schreibt Session-Item + Progress-Upsert (via
 * `writeRating`) und aktualisiert die ProgressMap optimistisch. Muster wie
 * `useToggleFavorite`. Wichtig: onMutate UND der Server-Write basieren beide auf
 * demselben `variables.prev`, damit die Zähler nicht doppelt hochgezählt werden.
 */
export function useRateVocab() {
  const qc = useQueryClient();

  return useMutation<void, Error, RateVariables, RateContext>({
    mutationFn: (v) =>
      writeRating({
        entryId: v.entryId,
        rating: v.rating,
        sessionId: v.sessionId,
        type: v.type,
        answeredAt: v.answeredAt,
        prev: v.prev ?? undefined,
      }),

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
      if (ctx?.prev) qc.setQueryData(queryKeys.progress, ctx.prev);
    },

    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.progress });
    },
  });
}
