import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchUserAttributes } from 'aws-amplify/auth';

import { isAmplifyConfigured } from '@/lib/amplify';
import {
  dataClient,
  type FavoriteRow,
  listAll,
  type ProgressRow,
  type SessionRow,
} from '@/lib/dataClient';
import { hapticLight } from '@/lib/haptics';
import { queryKeys } from '@/lib/queryKeys';

export function useProgressMap() {
  return useQuery({
    enabled: isAmplifyConfigured,
    queryKey: queryKeys.progress,
    queryFn: async (): Promise<Map<string, ProgressRow>> => {
      const rows = await listAll<ProgressRow>((args) =>
        dataClient.models.UserVocabularyProgress.list(args),
      );
      return new Map(rows.map((r) => [r.entryId, r]));
    },
  });
}

export interface FavoritesData {
  ids: Set<string>;
  recordByEntry: Map<string, string>;
}

export function useFavorites() {
  return useQuery({
    enabled: isAmplifyConfigured,
    queryKey: queryKeys.favorites,
    queryFn: async (): Promise<FavoritesData> => {
      const rows = await listAll<FavoriteRow>((args) =>
        dataClient.models.UserFavoriteVocabulary.list(args),
      );
      return {
        ids: new Set(rows.map((r) => r.entryId)),
        recordByEntry: new Map(rows.map((r) => [r.entryId, r.id])),
      };
    },
  });
}

/** E-Mail des angemeldeten Nutzers (aus den Cognito-Attributen). */
export function useUserEmail() {
  return useQuery({
    enabled: isAmplifyConfigured,
    queryKey: queryKeys.userAttributes,
    staleTime: Infinity,
    queryFn: async (): Promise<string | null> => {
      const attrs = await fetchUserAttributes();
      return attrs.email ?? null;
    },
  });
}

/** Letzte abgeschlossene/gestartete Sessions, absteigend nach Startzeit. */
export function useRecentSessions(limit = 10) {
  return useQuery({
    enabled: isAmplifyConfigured,
    queryKey: queryKeys.sessions,
    queryFn: async (): Promise<SessionRow[]> => {
      const rows = await listAll<SessionRow>((args) => dataClient.models.LearningSession.list(args));
      return rows
        .filter((r) => r.startedAt)
        .sort((a, b) => (b.startedAt ?? '').localeCompare(a.startedAt ?? ''))
        .slice(0, limit);
    },
  });
}

/** Favorit umschalten mit optimistischem Update der `favorites`-Query. */
export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      entryId,
      isFav,
      favId,
    }: {
      entryId: string;
      isFav: boolean;
      favId?: string;
    }) => {
      if (isFav) {
        if (favId) await dataClient.models.UserFavoriteVocabulary.delete({ id: favId });
        return;
      }
      await dataClient.models.UserFavoriteVocabulary.create({
        entryId,
        createdAt: new Date().toISOString(),
      });
    },
    onMutate: async ({ entryId, isFav }) => {
      hapticLight();
      await qc.cancelQueries({ queryKey: queryKeys.favorites });
      const prev = qc.getQueryData<FavoritesData>(queryKeys.favorites);
      const ids = new Set(prev?.ids ?? []);
      const recordByEntry = new Map(prev?.recordByEntry ?? []);
      if (isFav) {
        ids.delete(entryId);
        recordByEntry.delete(entryId);
      } else {
        ids.add(entryId);
        recordByEntry.set(entryId, `temp_${entryId}`);
      }
      qc.setQueryData<FavoritesData>(queryKeys.favorites, { ids, recordByEntry });
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.favorites, ctx.prev);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.favorites });
    },
  });
}
