import { currentUserId, progressId, sessionItemId } from '@/features/session/ids';
import { applyRating, type ProgressLike } from '@/features/session/sessionLogic';
import { dataClient } from '@/lib/dataClient';
import type { Rating, SessionType } from '@/lib/enums';

/**
 * Rohe, idempotente Amplify-Schreibfunktionen für Sessions/Bewertungen.
 * Getrennt von React (kein Hook), damit die Offline-Outbox (§4) dieselben
 * Funktionen zum Nachspielen verwenden kann.
 */

type AmplifyErrors = { message?: string }[] | undefined;

function errMsg(errors: AmplifyErrors): string {
  return errors?.map((e) => e.message ?? '').join('; ') ?? '';
}

/** Konflikt = Datensatz existiert bereits (Replay/Race) → als Erfolg werten. */
function isAlreadyExists(errors: AmplifyErrors): boolean {
  const m = errMsg(errors).toLowerCase();
  return m.includes('already exists') || m.includes('conditional request failed');
}

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

/** Schreibt eine Bewertung: Session-Item (append-only) + Progress-Upsert. */
export async function writeRating(w: RatingWrite): Promise<void> {
  const userId = await currentUserId();
  const nowIso = new Date(w.answeredAt).toISOString();

  const itemRes = await dataClient.models.LearningSessionItem.create({
    id: sessionItemId(w.sessionId, w.entryId, w.answeredAt),
    sessionId: w.sessionId,
    entryId: w.entryId,
    rating: w.rating,
    shownAt: nowIso,
    answeredAt: nowIso,
    clientTimestamp: nowIso,
  });
  if (itemRes.errors?.length && !isAlreadyExists(itemRes.errors)) {
    throw new Error(errMsg(itemRes.errors));
  }

  // Progress-Upsert per deterministischer ID: update-first, sonst create,
  // bei Race (existiert bereits) → erneut update.
  const patch = applyRating(w.prev, w.rating, w.type, w.answeredAt);
  const id = progressId(userId, w.entryId);

  const updated = await dataClient.models.UserVocabularyProgress.update({
    id,
    entryId: w.entryId,
    ...patch,
  });
  if (updated.data && !updated.errors?.length) return;

  const created = await dataClient.models.UserVocabularyProgress.create({
    id,
    entryId: w.entryId,
    ...patch,
  });
  if (!created.errors?.length) return;
  if (!isAlreadyExists(created.errors)) throw new Error(errMsg(created.errors));

  const retry = await dataClient.models.UserVocabularyProgress.update({
    id,
    entryId: w.entryId,
    ...patch,
  });
  if (retry.errors?.length) throw new Error(errMsg(retry.errors));
}

export interface SessionCreate {
  sessionId: string;
  type: SessionType;
  chapterId?: string;
  startedAt: number;
}

/** Legt die LearningSession an (idempotent über die stabile sessionId). */
export async function createSession(s: SessionCreate): Promise<void> {
  const res = await dataClient.models.LearningSession.create({
    id: s.sessionId,
    sessionType: s.type,
    chapterId: s.chapterId,
    startedAt: new Date(s.startedAt).toISOString(),
  });
  if (res.errors?.length && !isAlreadyExists(res.errors)) throw new Error(errMsg(res.errors));
}

export interface SessionFinalize {
  sessionId: string;
  totalCount: number;
  correctCount: number;
  endedAt: number;
}

/** Schließt die LearningSession ab (Zähler + endedAt). */
export async function finalizeSession(s: SessionFinalize): Promise<void> {
  const res = await dataClient.models.LearningSession.update({
    id: s.sessionId,
    endedAt: new Date(s.endedAt).toISOString(),
    totalCount: s.totalCount,
    correctCount: s.correctCount,
  });
  if (res.errors?.length) throw new Error(errMsg(res.errors));
}
