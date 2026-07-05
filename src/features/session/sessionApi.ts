import { currentUserId, progressId, sessionItemId } from '@/features/session/ids';
import { applyRating, type ProgressLike } from '@/features/session/sessionLogic';
import { dataClient } from '@/lib/dataClient';
import type { Rating, SessionType } from '@/lib/enums';

/**
 * Sessions/Bewertungen als **Builder** (erzeugen serialisierbare Amplify-Inputs
 * mit deterministischen IDs) + **Writer** (idempotentes Schreiben). Die Trennung
 * erlaubt es der Offline-Outbox (`outbox.ts`), dieselben Inputs zu queuen und
 * später unverändert nachzuspielen.
 */

// Exakte Amplify-Input-Typen (nur serialisierbare Skalar-Felder).
export type ItemInput = Parameters<typeof dataClient.models.LearningSessionItem.create>[0];
export type ProgressInput = Parameters<
  typeof dataClient.models.UserVocabularyProgress.create
>[0] & { id: string };
export type SessionCreateInput = Parameters<typeof dataClient.models.LearningSession.create>[0];
export type SessionFinalizeInput = Parameters<typeof dataClient.models.LearningSession.update>[0];

type AmplifyErrors = { message?: string }[] | undefined;

function errMsg(errors: AmplifyErrors): string {
  return errors?.map((e) => e.message ?? '').join('; ') ?? '';
}

/** Konflikt = Datensatz existiert bereits (Replay/Race) → als Erfolg werten. */
function isAlreadyExists(errors: AmplifyErrors): boolean {
  const m = errMsg(errors).toLowerCase();
  return m.includes('already exists') || m.includes('conditional request failed');
}

/** Heuristik: Netz-/Offline-Fehler (→ Outbox) vs. echter Fehler (→ Rollback). */
export function isNetworkError(e: unknown): boolean {
  const m = (e instanceof Error ? e.message : String(e)).toLowerCase();
  return (
    m.includes('network') ||
    m.includes('failed to fetch') ||
    m.includes('timeout') ||
    m.includes('offline') ||
    m.includes('connection')
  );
}

// --- Builder -----------------------------------------------------------------

export interface RatingWrite {
  entryId: string;
  rating: Rating;
  sessionId: string;
  type: SessionType;
  /** Progress-Stand VOR der Bewertung (für korrekte Zähler-Inkremente). */
  prev?: ProgressLike;
  /** Epoch-Millisekunden der Antwort (stabil über Replays). */
  answeredAt: number;
}

/** Baut Session-Item- + Progress-Input für eine Bewertung (userId für Progress-PK). */
export async function buildRatingInputs(
  w: RatingWrite,
): Promise<{ item: ItemInput; progress: ProgressInput }> {
  const userId = await currentUserId();
  const nowIso = new Date(w.answeredAt).toISOString();
  const item: ItemInput = {
    id: sessionItemId(w.sessionId, w.entryId, w.answeredAt),
    sessionId: w.sessionId,
    entryId: w.entryId,
    rating: w.rating,
    shownAt: nowIso,
    answeredAt: nowIso,
    clientTimestamp: nowIso,
  };
  const patch = applyRating(w.prev, w.rating, w.type, w.answeredAt);
  const progress: ProgressInput = { id: progressId(userId, w.entryId), entryId: w.entryId, ...patch };
  return { item, progress };
}

export interface SessionCreate {
  sessionId: string;
  type: SessionType;
  chapterId?: string;
  startedAt: number;
}

export function buildSessionCreateInput(s: SessionCreate): SessionCreateInput {
  return {
    id: s.sessionId,
    sessionType: s.type,
    chapterId: s.chapterId,
    startedAt: new Date(s.startedAt).toISOString(),
  };
}

export interface SessionFinalize {
  sessionId: string;
  totalCount: number;
  correctCount: number;
  endedAt: number;
}

export function buildSessionFinalizeInput(s: SessionFinalize): SessionFinalizeInput {
  return {
    id: s.sessionId,
    endedAt: new Date(s.endedAt).toISOString(),
    totalCount: s.totalCount,
    correctCount: s.correctCount,
  };
}

// --- Writer (idempotent) -----------------------------------------------------

export async function writeItemInput(input: ItemInput): Promise<void> {
  const res = await dataClient.models.LearningSessionItem.create(input);
  if (res.errors?.length && !isAlreadyExists(res.errors)) throw new Error(errMsg(res.errors));
}

/** Progress-Upsert: update-first, sonst create, bei Race (existiert) → update. */
export async function writeProgressInput(input: ProgressInput): Promise<void> {
  const updated = await dataClient.models.UserVocabularyProgress.update(input);
  if (updated.data && !updated.errors?.length) return;

  const created = await dataClient.models.UserVocabularyProgress.create(input);
  if (!created.errors?.length) return;
  if (!isAlreadyExists(created.errors)) throw new Error(errMsg(created.errors));

  const retry = await dataClient.models.UserVocabularyProgress.update(input);
  if (retry.errors?.length) throw new Error(errMsg(retry.errors));
}

export async function writeSessionCreateInput(input: SessionCreateInput): Promise<void> {
  const res = await dataClient.models.LearningSession.create(input);
  if (res.errors?.length && !isAlreadyExists(res.errors)) throw new Error(errMsg(res.errors));
}

export async function writeSessionFinalizeInput(input: SessionFinalizeInput): Promise<void> {
  const res = await dataClient.models.LearningSession.update(input);
  if (res.errors?.length) throw new Error(errMsg(res.errors));
}
