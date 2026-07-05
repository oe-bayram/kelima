import { describe, expect, it } from '@jest/globals';

import {
  applyRating,
  buildQueue,
  computeDueAt,
  DUE_INTERVALS,
  isProblemWord,
  type ProgressLike,
  ratingToStatus,
  selectCandidates,
  wrongRate,
} from '@/features/session/sessionLogic';

const NOW = Date.UTC(2026, 0, 1, 12, 0, 0);
const DAY = 24 * 60 * 60 * 1000;

/** Progress-Fixture mit vernünftigen Defaults. */
function prog(overrides: Partial<ProgressLike> = {}): ProgressLike {
  return {
    status: 'neu',
    seenCount: 0,
    testCount: 0,
    correctCount: 0,
    wrongCount: 0,
    hardCount: 0,
    ...overrides,
  };
}

describe('ratingToStatus', () => {
  it('bildet nicht_gewusst/schwer/kann_ich identisch ab', () => {
    expect(ratingToStatus('nicht_gewusst')).toBe('nicht_gewusst');
    expect(ratingToStatus('schwer')).toBe('schwer');
    expect(ratingToStatus('kann_ich')).toBe('kann_ich');
  });

  it('sicher promoviert erst nach 2 konsekutiven korrekten Bewertungen', () => {
    // kein/kein-korrektes Vorher → nur kann_ich
    expect(ratingToStatus('sicher')).toBe('kann_ich');
    expect(ratingToStatus('sicher', prog({ lastRating: 'nicht_gewusst' }))).toBe('kann_ich');
    expect(ratingToStatus('sicher', prog({ lastRating: 'schwer' }))).toBe('kann_ich');
    // vorige Bewertung war korrekt → sicher
    expect(ratingToStatus('sicher', prog({ lastRating: 'kann_ich' }))).toBe('sicher');
    expect(ratingToStatus('sicher', prog({ lastRating: 'sicher' }))).toBe('sicher');
  });
});

describe('DUE_INTERVALS / computeDueAt', () => {
  it('hat die v1-§13.2-Intervalle', () => {
    expect(DUE_INTERVALS).toEqual({ nicht_gewusst: 0, schwer: 1, kann_ich: 3, sicher: 7 });
  });

  it('nicht_gewusst ist sofort fällig', () => {
    expect(computeDueAt('nicht_gewusst', NOW)).toBe(new Date(NOW).toISOString());
  });

  it('addiert die richtigen Tage', () => {
    expect(computeDueAt('schwer', NOW)).toBe(new Date(NOW + 1 * DAY).toISOString());
    expect(computeDueAt('kann_ich', NOW)).toBe(new Date(NOW + 3 * DAY).toISOString());
    expect(computeDueAt('sicher', NOW)).toBe(new Date(NOW + 7 * DAY).toISOString());
  });
});

describe('wrongRate', () => {
  it('ist 0 ohne Bewertungen', () => {
    expect(wrongRate(undefined)).toBe(0);
    expect(wrongRate(prog())).toBe(0);
  });

  it('rechnet (falsch + schwer) / gesamt', () => {
    expect(wrongRate(prog({ seenCount: 8, testCount: 2, wrongCount: 3, hardCount: 1 }))).toBeCloseTo(
      0.4,
    );
    expect(wrongRate(prog({ seenCount: 10, wrongCount: 0, hardCount: 0 }))).toBe(0);
  });
});

describe('isProblemWord (v1 §13.3)', () => {
  it('true bei schwachem Status', () => {
    expect(isProblemWord(prog({ status: 'nicht_gewusst' }), NOW)).toBe(true);
    expect(isProblemWord(prog({ status: 'schwer' }), NOW)).toBe(true);
  });

  it('true bei Fehlerquote >= 0.4', () => {
    expect(
      isProblemWord(prog({ status: 'kann_ich', seenCount: 10, wrongCount: 4 }), NOW),
    ).toBe(true);
  });

  it('true wenn fällig', () => {
    expect(
      isProblemWord(prog({ status: 'sicher', dueAt: new Date(NOW - DAY).toISOString() }), NOW),
    ).toBe(true);
  });

  it('false für sichere, nicht fällige, fehlerarme Wörter', () => {
    expect(
      isProblemWord(
        prog({ status: 'sicher', seenCount: 10, correctCount: 10, dueAt: new Date(NOW + DAY).toISOString() }),
        NOW,
      ),
    ).toBe(false);
  });

  it('behandelt fehlenden Progress als "neu" (kein Problemwort ohne dueAt)', () => {
    expect(isProblemWord(undefined, NOW)).toBe(false);
  });
});

describe('applyRating', () => {
  it('initialisiert einen neuen Lern-Eintrag (kann_ich)', () => {
    const p = applyRating(undefined, 'kann_ich', 'lernen', NOW);
    expect(p.status).toBe('kann_ich');
    expect(p.intervalDays).toBe(3);
    expect(p.dueAt).toBe(new Date(NOW + 3 * DAY).toISOString());
    expect(p.seenCount).toBe(1);
    expect(p.testCount).toBe(0);
    expect(p.correctCount).toBe(1);
    expect(p.wrongCount).toBe(0);
    expect(p.hardCount).toBe(0);
    expect(p.lastSeenAt).toBe(new Date(NOW).toISOString());
    expect(p.lastTestedAt).toBeNull();
    expect(p.lastRatingAt).toBe(new Date(NOW).toISOString());
    expect(p.lastRating).toBe('kann_ich');
  });

  it('zählt Testsession-Bewertungen in testCount (nicht_gewusst)', () => {
    const p = applyRating(undefined, 'nicht_gewusst', 'test', NOW);
    expect(p.status).toBe('nicht_gewusst');
    expect(p.dueAt).toBe(new Date(NOW).toISOString());
    expect(p.seenCount).toBe(0);
    expect(p.testCount).toBe(1);
    expect(p.wrongCount).toBe(1);
    expect(p.correctCount).toBe(0);
    expect(p.lastSeenAt).toBeNull();
    expect(p.lastTestedAt).toBe(new Date(NOW).toISOString());
  });

  it('inkrementiert vorhandene Zähler und erhält den jeweils anderen Zeitstempel', () => {
    const prev = prog({
      seenCount: 2,
      testCount: 1,
      correctCount: 1,
      hardCount: 1,
      lastSeenAt: '2025-12-01T00:00:00.000Z',
      lastTestedAt: '2025-12-02T00:00:00.000Z',
    });
    const p = applyRating(prev, 'schwer', 'lernen', NOW);
    expect(p.seenCount).toBe(3);
    expect(p.testCount).toBe(1);
    expect(p.hardCount).toBe(2);
    expect(p.lastSeenAt).toBe(new Date(NOW).toISOString());
    expect(p.lastTestedAt).toBe('2025-12-02T00:00:00.000Z'); // unverändert
  });

  it('sicher ohne vorherige korrekte Bewertung bleibt kann_ich (dueAt +3 Tage)', () => {
    const p = applyRating(undefined, 'sicher', 'lernen', NOW);
    expect(p.status).toBe('kann_ich');
    expect(p.intervalDays).toBe(3);
    expect(p.dueAt).toBe(new Date(NOW + 3 * DAY).toISOString());
    expect(p.correctCount).toBe(1); // Rohbewertung zählt trotzdem als korrekt
    expect(p.lastRating).toBe('sicher');
  });

  it('sicher nach vorheriger korrekter Bewertung promoviert zu sicher (dueAt +7 Tage)', () => {
    const prev = prog({ lastRating: 'kann_ich', seenCount: 1, correctCount: 1 });
    const p = applyRating(prev, 'sicher', 'lernen', NOW);
    expect(p.status).toBe('sicher');
    expect(p.intervalDays).toBe(7);
    expect(p.dueAt).toBe(new Date(NOW + 7 * DAY).toISOString());
    expect(p.correctCount).toBe(2);
  });
});

describe('buildQueue', () => {
  const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];

  it('begrenzt auf das Limit', () => {
    expect(buildQueue(ids, 3, 1)).toHaveLength(3);
  });

  it('gibt alle zurück bei Limit 0 oder >= Länge', () => {
    expect(buildQueue(ids, 0, 1)).toHaveLength(ids.length);
    expect(buildQueue(ids, 99, 1)).toHaveLength(ids.length);
  });

  it('ist mit gleichem Seed deterministisch', () => {
    expect(buildQueue(ids, 5, 42)).toEqual(buildQueue(ids, 5, 42));
  });

  it('enthält nur Original-Elemente (Permutation)', () => {
    const q = buildQueue(ids, 0, 7);
    expect([...q].sort()).toEqual([...ids].sort());
  });

  it('mutiert das Eingabe-Array nicht', () => {
    const input = [...ids];
    buildQueue(input, 3, 1);
    expect(input).toEqual(ids);
  });
});

describe('selectCandidates', () => {
  const progress = new Map<string, ProgressLike>([
    ['a', prog({ status: 'neu' })],
    ['b', prog({ status: 'nicht_gewusst' })],
    ['c', prog({ status: 'sicher', dueAt: new Date(NOW - DAY).toISOString() })], // fällig
    ['d', prog({ status: 'kann_ich', dueAt: new Date(NOW + DAY).toISOString() })],
  ]);

  it('kind=chapter liefert die Kapitel-Einträge', () => {
    expect(selectCandidates({ kind: 'chapter', chapterEntryIds: ['a', 'b'], now: NOW })).toEqual([
      'a',
      'b',
    ]);
  });

  it('kind=favorites liefert die Favoriten', () => {
    const res = selectCandidates({ kind: 'favorites', favoriteIds: new Set(['a', 'd']), now: NOW });
    expect(res.sort()).toEqual(['a', 'd']);
  });

  it('kind=problem filtert Problemwörter (§13.3)', () => {
    const res = selectCandidates({
      kind: 'problem',
      allEntryIds: ['a', 'b', 'c', 'd'],
      progress,
      now: NOW,
    });
    expect(res.sort()).toEqual(['b', 'c']); // b: nicht_gewusst, c: fällig
  });

  it('kind=due filtert fällige Wörter', () => {
    const res = selectCandidates({
      kind: 'due',
      allEntryIds: ['a', 'b', 'c', 'd'],
      progress,
      now: NOW,
    });
    expect(res).toEqual(['c']);
  });

  it('wendet den Statusfilter zusätzlich an', () => {
    const res = selectCandidates({
      kind: 'chapter',
      chapterEntryIds: ['a', 'b', 'c', 'd'],
      statusFilter: 'nicht_gewusst',
      progress,
      now: NOW,
    });
    expect(res).toEqual(['b']);
  });
});
