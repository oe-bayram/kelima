import '@/lib/amplify'; // Side-effect: Amplify.configure() muss vor generateClient laufen.

import { generateClient } from 'aws-amplify/data';

import type { Schema } from '../../amplify/data/resource';

/**
 * App-seitiger Amplify Data Client (userPool-Auth). `import type { Schema }` wird
 * zur Laufzeit entfernt – das Amplify-Backend landet NICHT im App-Bundle.
 */
export const dataClient = generateClient<Schema>({ authMode: 'userPool' });

export type EntryRow = Schema['VocabularyEntry']['type'];
export type FormRow = Schema['VocabularyForm']['type'];
export type ExampleRow = Schema['VocabularyExample']['type'];
export type ChapterRow = Schema['Chapter']['type'];
export type ChapterLinkRow = Schema['VocabularyChapter']['type'];
export type ProgressRow = Schema['UserVocabularyProgress']['type'];
export type FavoriteRow = Schema['UserFavoriteVocabulary']['type'];
export type SessionRow = Schema['LearningSession']['type'];
export type SessionItemRow = Schema['LearningSessionItem']['type'];

export interface ListResult<T> {
  data: T[];
  nextToken?: string | null;
  errors?: { message?: string }[];
}

/** Paginiert eine Amplify-`list`/Index-Query komplett aus (loopt nextToken). */
export async function listAll<T>(
  fn: (args: { limit: number; nextToken?: string | null }) => Promise<ListResult<T>>,
  limit = 1000,
): Promise<T[]> {
  const out: T[] = [];
  let nextToken: string | null | undefined;
  do {
    const res = await fn({ limit, nextToken });
    if (res.errors?.length) throw new Error(res.errors.map((e) => e.message ?? '').join('; '));
    out.push(...res.data);
    nextToken = res.nextToken;
  } while (nextToken);
  return out;
}
