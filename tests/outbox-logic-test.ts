import { describe, expect, it } from '@jest/globals';

import {
  type OutboxOp,
  pendingRatingCount,
  removeOp,
  upsertOp,
} from '@/features/session/outboxLogic';

/** Minimaler Op (Input ist für die Queue-Logik irrelevant). */
function op(kind: OutboxOp['kind'], key: string): OutboxOp {
  return { key, kind, input: {} } as unknown as OutboxOp;
}

describe('upsertOp', () => {
  it('hängt neue Keys an', () => {
    const ops = upsertOp([op('item', 'item:a')], op('progress', 'progress:x'));
    expect(ops.map((o) => o.key)).toEqual(['item:a', 'progress:x']);
  });

  it('ersetzt gleichen Key (last-writer-wins, ans Ende)', () => {
    const first = op('progress', 'progress:x');
    const second = op('progress', 'progress:x');
    const ops = upsertOp([op('item', 'item:a'), first], second);
    expect(ops).toHaveLength(2);
    expect(ops[1]).toBe(second);
    expect(ops).not.toContain(first);
  });

  it('mutiert die Eingabe nicht', () => {
    const input = [op('item', 'item:a')];
    upsertOp(input, op('progress', 'progress:x'));
    expect(input).toHaveLength(1);
  });
});

describe('removeOp', () => {
  it('entfernt per Key', () => {
    const ops = removeOp([op('item', 'item:a'), op('progress', 'progress:x')], 'item:a');
    expect(ops.map((o) => o.key)).toEqual(['progress:x']);
  });
});

describe('pendingRatingCount', () => {
  it('zählt nur Item-Ops (= Bewertungen)', () => {
    const ops = [
      op('item', 'item:a'),
      op('item', 'item:b'),
      op('progress', 'progress:x'),
      op('sessionCreate', 'sessionCreate:s'),
      op('sessionFinalize', 'sessionFinalize:s'),
    ];
    expect(pendingRatingCount(ops)).toBe(2);
  });

  it('leere Queue → 0', () => {
    expect(pendingRatingCount([])).toBe(0);
  });
});
