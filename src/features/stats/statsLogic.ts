import { isProblemWord, type ProgressLike, wrongRate } from '@/features/session/sessionLogic';
import type { VocabularyStatus } from '@/lib/enums';
import { isDue, statusOf } from '@/lib/vocab';

/**
 * Reine Statistik-Aggregation aus der ProgressMap — KEINE React-/Amplify-Imports
 * (Jest-testbar). Alles clientseitig, kein Backend-Aggregat (Masterplan §4.3).
 */

export type StatusCounts = Record<VocabularyStatus, number>;

export function emptyCounts(): StatusCounts {
  return { neu: 0, nicht_gewusst: 0, schwer: 0, kann_ich: 0, sicher: 0 };
}

/** Zählt entryIds nach Status (fehlender/`neu`-Progress → `neu`). */
export function statusDistribution(
  entryIds: readonly string[],
  progress?: ReadonlyMap<string, ProgressLike>,
): StatusCounts {
  const counts = emptyCounts();
  for (const id of entryIds) counts[statusOf(progress?.get(id))] += 1;
  return counts;
}

export interface ProgressSummary {
  total: number;
  byStatus: StatusCounts;
  learned: number; // kann_ich + sicher
  progressPct: number; // learned / total (0..1)
}

function summarize(entryIds: readonly string[], progress?: ReadonlyMap<string, ProgressLike>): ProgressSummary {
  const byStatus = statusDistribution(entryIds, progress);
  const total = entryIds.length;
  const learned = byStatus.kann_ich + byStatus.sicher;
  return { total, byStatus, learned, progressPct: total ? learned / total : 0 };
}

export interface OverviewStats extends ProgressSummary {
  due: number;
}

/** Gesamtübersicht über alle Wörter des Nutzers. `now` defaultet auf jetzt. */
export function overviewStats(
  allEntryIds: readonly string[],
  progress: ReadonlyMap<string, ProgressLike> | undefined,
  now: number = Date.now(),
): OverviewStats {
  const base = summarize(allEntryIds, progress);
  let due = 0;
  for (const id of allEntryIds) if (isDue(progress?.get(id), now)) due += 1;
  return { ...base, due };
}

/** entryIds, die aktuell Problemwörter sind (v1 §13.3). `now` defaultet auf jetzt. */
export function problemWordIds(
  allEntryIds: readonly string[],
  progress: ReadonlyMap<string, ProgressLike> | undefined,
  now: number = Date.now(),
): string[] {
  return allEntryIds.filter((id) => isProblemWord(progress?.get(id), now));
}

/** Fortschritt eines Kapitels (Status-Verteilung + %). */
export function chapterProgress(
  entryIds: readonly string[],
  progress?: ReadonlyMap<string, ProgressLike>,
): ProgressSummary {
  return summarize(entryIds, progress);
}

export interface VocabStats {
  seen: number;
  tested: number;
  correct: number;
  wrong: number;
  hard: number;
  wrongRate: number;
  reviewed: boolean;
  lastTestedAt: string | null;
  lastRatingAt: string | null;
  dueAt: string | null;
}

/** Einzelvokabel-Statistik für den Karten-Übersichtstab. */
export function vocabStats(p?: ProgressLike): VocabStats {
  const seen = p?.seenCount ?? 0;
  const tested = p?.testCount ?? 0;
  return {
    seen,
    tested,
    correct: p?.correctCount ?? 0,
    wrong: p?.wrongCount ?? 0,
    hard: p?.hardCount ?? 0,
    wrongRate: wrongRate(p),
    reviewed: seen + tested > 0,
    lastTestedAt: p?.lastTestedAt ?? null,
    lastRatingAt: p?.lastRatingAt ?? null,
    dueAt: p?.dueAt ?? null,
  };
}

/** Formatiert eine Dauer in ms als `m:ss`. */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}
