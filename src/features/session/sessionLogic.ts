import type { Rating, SessionType, VocabularyStatus } from '@/lib/enums';
import { isDue, statusOf } from '@/lib/vocab';

/**
 * Reine Session-Logik — KEINE React-/Amplify-Imports, damit sie (wie
 * `@/lib/vocab` und `grouping.ts`) in Jest ohne native Abhängigkeiten testbar
 * bleibt. Kapselt v1 §13.2 (Status-Mapping), die dueAt-Intervalltabelle und
 * v1 §13.3 (Problemwort-Kriterien).
 */

/** Nur die Progress-Felder, die die Logik liest — `ProgressRow` ist kompatibel. */
export interface ProgressLike {
  status?: VocabularyStatus | null;
  dueAt?: string | null;
  intervalDays?: number | null;
  seenCount?: number | null;
  testCount?: number | null;
  correctCount?: number | null;
  wrongCount?: number | null;
  hardCount?: number | null;
  lastSeenAt?: string | null;
  lastTestedAt?: string | null;
  lastRatingAt?: string | null;
  lastRating?: Rating | null;
}

/** Feldwerte, die eine Bewertung am Progress setzt (ohne id/entryId/Meta). */
export interface ProgressPatch {
  status: VocabularyStatus;
  dueAt: string;
  intervalDays: number;
  seenCount: number;
  testCount: number;
  correctCount: number;
  wrongCount: number;
  hardCount: number;
  lastSeenAt: string | null;
  lastTestedAt: string | null;
  lastRatingAt: string;
  lastRating: Rating;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** dueAt-Intervalle je Bewertung in Tagen (v1 §13.2). */
export const DUE_INTERVALS: Record<Rating, number> = {
  nicht_gewusst: 0, // sofort wieder fällig
  schwer: 1,
  kann_ich: 3,
  sicher: 7,
};

/**
 * v1 §13.2 + Could-have: Bewertung → Status. `sicher` promoviert erst dann zum
 * Status `sicher`, wenn bereits die vorige Bewertung korrekt war (= 2 konsekutive
 * korrekte Bewertungen) – sonst nur `kann_ich`. `prev.lastRating` dient als
 * Streak-Proxy, daher ohne zusätzliches Schema-Feld. Rückgabe ⊂ VocabularyStatus.
 */
export function ratingToStatus(rating: Rating, prev?: ProgressLike): Rating {
  if (rating === 'sicher') {
    const prevCorrect = prev?.lastRating === 'kann_ich' || prev?.lastRating === 'sicher';
    return prevCorrect ? 'sicher' : 'kann_ich';
  }
  return rating;
}

/** Nächster Fälligkeitszeitpunkt als ISO-String (nach resultierendem Status). */
export function computeDueAt(status: Rating, now: number): string {
  return new Date(now + DUE_INTERVALS[status] * DAY_MS).toISOString();
}

const n = (v?: number | null): number => v ?? 0;

/** Fehlerquote = (falsch + schwer) / Gesamtbewertungen. 0 wenn nie bewertet. */
export function wrongRate(p?: ProgressLike): number {
  const total = n(p?.seenCount) + n(p?.testCount);
  if (total <= 0) return 0;
  return (n(p?.wrongCount) + n(p?.hardCount)) / total;
}

/** v1 §13.3: Problemwort, wenn schwach im Status, hohe Fehlerquote oder fällig. */
export function isProblemWord(p: ProgressLike | undefined, now: number): boolean {
  const status = statusOf(p);
  return (
    status === 'nicht_gewusst' ||
    status === 'schwer' ||
    wrongRate(p) >= 0.4 ||
    isDue(p, now)
  );
}

/**
 * Reiner Reducer: berechnet die neuen Progress-Feldwerte nach einer Bewertung.
 * Wird von der Mutation (Server-Write) UND vom Optimistic-Update genutzt, damit
 * beide exakt denselben Zustand erzeugen.
 */
export function applyRating(
  prev: ProgressLike | undefined,
  rating: Rating,
  type: SessionType,
  now: number,
): ProgressPatch {
  const nowIso = new Date(now).toISOString();
  const isLearn = type === 'lernen';
  const isCorrect = rating === 'kann_ich' || rating === 'sicher';
  const status = ratingToStatus(rating, prev);

  return {
    status,
    dueAt: computeDueAt(status, now),
    intervalDays: DUE_INTERVALS[status],
    seenCount: n(prev?.seenCount) + (isLearn ? 1 : 0),
    testCount: n(prev?.testCount) + (isLearn ? 0 : 1),
    correctCount: n(prev?.correctCount) + (isCorrect ? 1 : 0),
    wrongCount: n(prev?.wrongCount) + (rating === 'nicht_gewusst' ? 1 : 0),
    hardCount: n(prev?.hardCount) + (rating === 'schwer' ? 1 : 0),
    lastSeenAt: isLearn ? nowIso : (prev?.lastSeenAt ?? null),
    lastTestedAt: isLearn ? (prev?.lastTestedAt ?? null) : nowIso,
    lastRatingAt: nowIso,
    lastRating: rating,
  };
}

/** Kleiner deterministischer PRNG (für reproduzierbare Queues in Tests). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Mischt die Kandidaten (Fisher-Yates) und begrenzt auf `limit` (10/20/50).
 * `limit <= 0` oder `>= Länge` → alle. Mit `seed` deterministisch (Tests).
 */
export function buildQueue(candidateIds: string[], limit: number, seed?: number): string[] {
  const arr = [...candidateIds];
  const rand = seed === undefined ? Math.random : mulberry32(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return limit > 0 && limit < arr.length ? arr.slice(0, limit) : arr;
}

export type SessionSourceKind = 'chapter' | 'favorites' | 'problem' | 'due' | 'all';

/** Statusfilter aus der Kapitel-Detail-Ansicht (`all` = ohne Einschränkung). */
export type SessionStatusFilter = VocabularyStatus | 'all';

export interface SelectInput {
  kind: SessionSourceKind;
  statusFilter?: SessionStatusFilter;
  /** Bereits aufgelöste entryIds des Kapitels (für kind='chapter'). */
  chapterEntryIds?: string[];
  /** Alle entryIds des Nutzers (für kind='all'|'problem'|'due'). */
  allEntryIds?: string[];
  favoriteIds?: ReadonlySet<string>;
  progress?: ReadonlyMap<string, ProgressLike>;
  now: number;
}

/** Löst Quelle + optionalen Statusfilter in eine entryId-Liste auf. */
export function selectCandidates(input: SelectInput): string[] {
  const {
    kind,
    statusFilter,
    chapterEntryIds = [],
    allEntryIds = [],
    favoriteIds,
    progress,
    now,
  } = input;
  const prog = (id: string): ProgressLike | undefined => progress?.get(id);

  let base: string[];
  switch (kind) {
    case 'chapter':
      base = chapterEntryIds;
      break;
    case 'favorites':
      base = favoriteIds ? [...favoriteIds] : [];
      break;
    case 'all':
      base = allEntryIds;
      break;
    case 'problem':
      base = allEntryIds.filter((id) => isProblemWord(prog(id), now));
      break;
    case 'due':
      base = allEntryIds.filter((id) => isDue(prog(id), now));
      break;
  }

  if (statusFilter && statusFilter !== 'all') {
    base = base.filter((id) => statusOf(prog(id)) === statusFilter);
  }
  return base;
}
