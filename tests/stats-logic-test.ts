import { describe, expect, it } from '@jest/globals';

import type { ProgressLike } from '@/features/session/sessionLogic';
import {
  chapterProgress,
  emptyCounts,
  formatDuration,
  overviewStats,
  statusDistribution,
  vocabStats,
} from '@/features/stats/statsLogic';

const NOW = Date.UTC(2026, 0, 1, 12, 0, 0);
const DAY = 24 * 60 * 60 * 1000;

const progress = new Map<string, ProgressLike>([
  ['a', { status: 'neu' }],
  ['b', { status: 'nicht_gewusst' }],
  ['c', { status: 'kann_ich' }],
  ['d', { status: 'sicher', dueAt: new Date(NOW - DAY).toISOString() }], // fällig
  ['e', { status: 'sicher', dueAt: new Date(NOW + DAY).toISOString() }],
]);
const ids = ['a', 'b', 'c', 'd', 'e', 'f']; // f hat keinen Progress → neu

describe('statusDistribution', () => {
  it('zählt nach Status; fehlender Progress = neu', () => {
    expect(statusDistribution(ids, progress)).toEqual({
      neu: 2, // a + f
      nicht_gewusst: 1,
      schwer: 0,
      kann_ich: 1,
      sicher: 2,
    });
  });

  it('leere Liste → alles 0', () => {
    expect(statusDistribution([], progress)).toEqual(emptyCounts());
  });
});

describe('overviewStats', () => {
  it('berechnet gelernt, Fortschritt und fällige Wörter', () => {
    const s = overviewStats(ids, progress, NOW);
    expect(s.total).toBe(6);
    expect(s.learned).toBe(3); // c(kann_ich) + d,e(sicher)
    expect(s.progressPct).toBeCloseTo(3 / 6);
    expect(s.due).toBe(1); // nur d
  });

  it('ohne Wörter → 0 % (keine Division durch 0)', () => {
    const s = overviewStats([], undefined, NOW);
    expect(s.total).toBe(0);
    expect(s.progressPct).toBe(0);
  });
});

describe('chapterProgress', () => {
  it('fasst ein Kapitel zusammen', () => {
    const s = chapterProgress(['c', 'd'], progress);
    expect(s.total).toBe(2);
    expect(s.learned).toBe(2);
    expect(s.progressPct).toBe(1);
  });
});

describe('vocabStats', () => {
  it('liest Zähler + Fehlerquote; reviewed-Flag', () => {
    const s = vocabStats({
      seenCount: 8,
      testCount: 2,
      correctCount: 6,
      wrongCount: 3,
      hardCount: 1,
      lastTestedAt: '2025-12-31T00:00:00.000Z',
      dueAt: '2026-01-05T00:00:00.000Z',
    });
    expect(s.seen).toBe(8);
    expect(s.tested).toBe(2);
    expect(s.reviewed).toBe(true);
    expect(s.wrongRate).toBeCloseTo(0.4); // (3+1)/(8+2)
  });

  it('ohne Progress → reviewed=false, alles 0', () => {
    const s = vocabStats(undefined);
    expect(s.reviewed).toBe(false);
    expect(s.wrongRate).toBe(0);
    expect(s.dueAt).toBeNull();
  });
});

describe('formatDuration', () => {
  it('formatiert m:ss', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(65_000)).toBe('1:05');
    expect(formatDuration(600_000)).toBe('10:00');
    expect(formatDuration(-5)).toBe('0:00');
  });
});
