import { useQuery } from '@tanstack/react-query';

import { isAmplifyConfigured } from '@/lib/amplify';
import { mapWithConcurrency } from '@/lib/async';
import {
  type ChapterLinkRow,
  type ChapterRow,
  dataClient,
  type EntryRow,
  type ExampleRow,
  type FormRow,
  listAll,
} from '@/lib/dataClient';
import { queryKeys } from '@/lib/queryKeys';

// Content ändert sich nur per Import → praktisch nie neu holen; MMKV-Persister
// zeigt Inhalte beim zweiten (auch offline) Kaltstart.
const contentOptions = { enabled: isAmplifyConfigured, staleTime: Infinity } as const;

const CHAPTER_TYPE_RANK: Record<string, number> = { wortgruppe: 0, auto: 1, manuell: 2 };

export function useChapters() {
  return useQuery({
    ...contentOptions,
    queryKey: queryKeys.chapters,
    queryFn: async () => {
      const rows = await listAll<ChapterRow>((args) => dataClient.models.Chapter.list(args));
      return rows.sort(
        (a, b) =>
          (CHAPTER_TYPE_RANK[a.chapterType ?? 'manuell'] ?? 9) -
            (CHAPTER_TYPE_RANK[b.chapterType ?? 'manuell'] ?? 9) ||
          (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      );
    },
  });
}

export interface Memberships {
  byChapter: Map<string, { entryId: string; sortOrder: number }[]>;
  byEntry: Map<string, string[]>;
}

export function useChapterMemberships() {
  return useQuery({
    ...contentOptions,
    queryKey: queryKeys.chapterMemberships,
    queryFn: async (): Promise<Memberships> => {
      const links = await listAll<ChapterLinkRow>((args) =>
        dataClient.models.VocabularyChapter.list(args),
      );
      const byChapter = new Map<string, { entryId: string; sortOrder: number }[]>();
      const byEntry = new Map<string, string[]>();
      for (const l of links) {
        const list = byChapter.get(l.chapterId) ?? [];
        list.push({ entryId: l.entryId, sortOrder: l.sortOrder ?? 0 });
        byChapter.set(l.chapterId, list);
        const chapters = byEntry.get(l.entryId) ?? [];
        chapters.push(l.chapterId);
        byEntry.set(l.entryId, chapters);
      }
      for (const list of byChapter.values()) list.sort((a, b) => a.sortOrder - b.sortOrder);
      return { byChapter, byEntry };
    },
  });
}

export function useChapterEntries(chapterId: string) {
  const memberships = useChapterMemberships();
  return useQuery({
    enabled: isAmplifyConfigured && !!memberships.data,
    staleTime: Infinity,
    queryKey: queryKeys.chapterEntries(chapterId),
    queryFn: async (): Promise<EntryRow[]> => {
      const ids = (memberships.data?.byChapter.get(chapterId) ?? []).map((m) => m.entryId);
      const rows = await mapWithConcurrency(ids, 10, async (id) => {
        const res = await dataClient.models.VocabularyEntry.get({ id });
        if (res.errors?.length) throw new Error(res.errors.map((e) => e.message ?? '').join('; '));
        return res.data;
      });
      // Amplify-Get liefert einen Lazy-Typ; die Felder sind zur Laufzeit identisch.
      return rows.filter((r) => r != null) as unknown as EntryRow[];
    },
  });
}

export function useVocabEntry(id: string) {
  return useQuery({
    ...contentOptions,
    queryKey: queryKeys.entry(id),
    queryFn: async (): Promise<EntryRow | null> => {
      const res = await dataClient.models.VocabularyEntry.get({ id });
      if (res.errors?.length) throw new Error(res.errors.map((e) => e.message ?? '').join('; '));
      return (res.data ?? null) as unknown as EntryRow | null;
    },
  });
}

export function useForms(entryId: string) {
  return useQuery({
    ...contentOptions,
    queryKey: queryKeys.forms(entryId),
    queryFn: () =>
      listAll<FormRow>((args) =>
        dataClient.models.VocabularyForm.listFormsByEntry({ entryId }, args),
      ),
  });
}

export function useExamples(entryId: string) {
  return useQuery({
    ...contentOptions,
    queryKey: queryKeys.examples(entryId),
    queryFn: () =>
      listAll<ExampleRow>((args) =>
        dataClient.models.VocabularyExample.listExamplesByEntry({ entryId }, args),
      ),
  });
}
