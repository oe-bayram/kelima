import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { isAmplifyConfigured } from '@/lib/amplify';
import { dataClient, type FavoriteRow, listAll, type ProgressRow } from '@/lib/dataClient';
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
