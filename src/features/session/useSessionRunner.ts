import { router } from 'expo-router';
import { useCallback, useEffect } from 'react';

import { finalizeSession } from '@/features/session/sessionApi';
import { useRateVocab } from '@/features/session/useRateVocab';
import { useSessionStore } from '@/features/session/useSessionStore';
import { useProgressMap } from '@/hooks/userData';
import type { Rating } from '@/lib/enums';

/**
 * Gemeinsame Ablauf-Steuerung für Lern- und Testsession: aktuelle Karte,
 * Bewertung absenden, und beim Durchlaufen aller Karten die Session
 * finalisieren + zur Zusammenfassung navigieren. `learn.tsx`/`test.tsx`
 * unterscheiden sich nur in der Kartendarstellung.
 */
export function useSessionRunner() {
  const sessionId = useSessionStore((s) => s.sessionId);
  const type = useSessionStore((s) => s.type);
  const queue = useSessionStore((s) => s.queue);
  const index = useSessionStore((s) => s.index);
  const active = useSessionStore((s) => s.active);
  const ratings = useSessionStore((s) => s.ratings);
  const rate = useSessionStore((s) => s.rate);
  const finish = useSessionStore((s) => s.finish);

  const progressQ = useProgressMap();
  const rateVocab = useRateVocab();

  const done = !active || index >= queue.length;
  const currentId = done ? undefined : queue[index];

  // Kein aktiver Zustand → nichts zu tun (Direktaufruf ohne Session).
  useEffect(() => {
    if (!sessionId) router.replace('/');
  }, [sessionId]);

  // Alle Karten bewertet → Session abschließen und zur Zusammenfassung.
  useEffect(() => {
    if (!active || !sessionId || index < queue.length) return;
    const endedAt = Date.now();
    const correctCount = Object.values(ratings).filter(
      (r) => r === 'kann_ich' || r === 'sicher',
    ).length;
    void finalizeSession({
      sessionId,
      totalCount: queue.length,
      correctCount,
      endedAt,
    }).catch(() => {
      /* Offline: Finalisierung ist unkritisch; Bewertungen sind geschrieben. */
    });
    finish(new Date(endedAt).toISOString());
    router.replace('/session/summary');
  }, [active, sessionId, index, queue.length, ratings, finish]);

  const submit = useCallback(
    (rating: Rating) => {
      if (!currentId || !sessionId || !type) return;
      const answeredAt = Date.now();
      rateVocab.mutate({
        entryId: currentId,
        rating,
        sessionId,
        type,
        answeredAt,
        prev: progressQ.data?.get(currentId),
      });
      rate(currentId, rating);
    },
    [currentId, sessionId, type, rateVocab, rate, progressQ.data],
  );

  return { currentId, index, total: queue.length, type, done, submit };
}
