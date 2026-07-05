import { onlineManager } from '@tanstack/react-query';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import { type OutboxOp, removeOp, upsertOp } from '@/features/session/outboxLogic';
import {
  isNetworkError,
  writeItemInput,
  writeProgressInput,
  writeSessionCreateInput,
  writeSessionFinalizeInput,
} from '@/features/session/sessionApi';
import { queryClient } from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';
import { storage } from '@/lib/storage';

/**
 * Offline-Outbox für Bewertungs-/Session-Writes. Fehlgeschlagene Writes (offline
 * oder Netzfehler) landen als serialisierbare Ops in einer MMKV-Queue und werden
 * bei Reconnect idempotent nachgespielt (deterministische IDs verhindern
 * Duplikate). Queue-Logik + Typen: `outboxLogic.ts` (rein/testbar).
 */
export type { OutboxOp } from '@/features/session/outboxLogic';
export { pendingRatingCount } from '@/features/session/outboxLogic';

const mmkvStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => {
    storage.set(name, value);
  },
  removeItem: (name) => {
    storage.remove(name);
  },
};

interface OutboxState {
  ops: OutboxOp[];
  enqueue: (op: OutboxOp) => void;
  remove: (key: string) => void;
  clear: () => void;
}

export const useOutboxStore = create<OutboxState>()(
  persist(
    (set) => ({
      ops: [],
      enqueue: (op) => set((s) => ({ ops: upsertOp(s.ops, op) })),
      remove: (key) => set((s) => ({ ops: removeOp(s.ops, key) })),
      clear: () => set({ ops: [] }),
    }),
    {
      name: 'kelima-outbox',
      storage: createJSONStorage(() => mmkvStorage),
      version: 1,
    },
  ),
);

async function writeOp(op: OutboxOp): Promise<void> {
  switch (op.kind) {
    case 'item':
      return writeItemInput(op.input);
    case 'progress':
      return writeProgressInput(op.input);
    case 'sessionCreate':
      return writeSessionCreateInput(op.input);
    case 'sessionFinalize':
      return writeSessionFinalizeInput(op.input);
  }
}

/**
 * Versucht den Op sofort zu schreiben. Bei Offline/Netzfehler → Outbox (der
 * Aufrufer behält sein Optimistic-Update). Bei echtem Fehler → wirft weiter.
 */
export async function dispatchOp(op: OutboxOp): Promise<void> {
  if (!onlineManager.isOnline()) {
    useOutboxStore.getState().enqueue(op);
    return;
  }
  try {
    await writeOp(op);
  } catch (e) {
    if (isNetworkError(e)) {
      useOutboxStore.getState().enqueue(op);
      return;
    }
    throw e;
  }
}

let replaying = false;

/** Spielt die Queue der Reihe nach ab (idempotent). Bei Netzfehler: später erneut. */
export async function replayOutbox(): Promise<void> {
  if (replaying || !onlineManager.isOnline()) return;
  replaying = true;
  try {
    const { ops, remove } = useOutboxStore.getState();
    let changed = false;
    for (const op of ops) {
      try {
        await writeOp(op);
        remove(op.key);
        changed = true;
      } catch (e) {
        if (isNetworkError(e)) break; // wieder offline → beim nächsten Reconnect
        remove(op.key); // „poison" Op verwerfen, sonst blockiert die Queue
        changed = true;
      }
    }
    if (changed) void queryClient.invalidateQueries({ queryKey: queryKeys.progress });
  } finally {
    replaying = false;
  }
}

let subscribed = false;

/** Startet das automatische Nachspielen bei (Wieder-)Verbindung. Einmal aufrufen. */
export function startOutboxAutoReplay(): void {
  if (subscribed) return;
  subscribed = true;
  onlineManager.subscribe(() => {
    if (onlineManager.isOnline()) void replayOutbox();
  });
  if (onlineManager.isOnline()) void replayOutbox();
}
