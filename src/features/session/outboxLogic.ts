import type {
  ItemInput,
  ProgressInput,
  SessionCreateInput,
  SessionFinalizeInput,
} from '@/features/session/sessionApi';

/**
 * Reine Outbox-Queue-Logik — nur `import type` (zur Laufzeit erased), daher
 * KEINE Amplify-/MMKV-Abhängigkeit → in Jest testbar. `outbox.ts` nutzt diese
 * Helfer für den zustand-Store; `key` ist der Dedup-Schlüssel.
 */
export type OutboxOp =
  | { key: string; kind: 'item'; input: ItemInput }
  | { key: string; kind: 'progress'; input: ProgressInput }
  | { key: string; kind: 'sessionCreate'; input: SessionCreateInput }
  | { key: string; kind: 'sessionFinalize'; input: SessionFinalizeInput };

/**
 * Fügt einen Op an oder ersetzt einen bestehenden gleichen Keys
 * (last-writer-wins): Progress-/Finalize-Ops kollabieren auf den neuesten Stand,
 * Items sind (dank answeredAt im Key) eindeutig und werden angehängt.
 */
export function upsertOp(ops: OutboxOp[], op: OutboxOp): OutboxOp[] {
  return [...ops.filter((o) => o.key !== op.key), op];
}

export function removeOp(ops: OutboxOp[], key: string): OutboxOp[] {
  return ops.filter((o) => o.key !== key);
}

/** Anzahl ausstehender Bewertungen (= Item-Ops) – für das Settings-Badge. */
export function pendingRatingCount(ops: OutboxOp[]): number {
  return ops.filter((o) => o.kind === 'item').length;
}
