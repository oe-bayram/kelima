/** Zentrale TanStack-Query-Key-Konvention. */
export const queryKeys = {
  chapters: ['chapters'] as const,
  chapterMemberships: ['chapterMemberships'] as const,
  chapterEntries: (chapterId: string) => ['chapterEntries', chapterId] as const,
  entry: (id: string) => ['entry', id] as const,
  forms: (entryId: string) => ['forms', entryId] as const,
  examples: (entryId: string) => ['examples', entryId] as const,
  progress: ['progress'] as const,
  favorites: ['favorites'] as const,
  sessions: ['sessions'] as const,
};
