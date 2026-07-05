import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import type { Rating, SessionType } from '@/lib/enums';
import { storage } from '@/lib/storage';

/** StateStorage-Adapter über die synchrone MMKV-Instanz (wie useSettingsStore). */
const mmkvStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => {
    storage.set(name, value);
  },
  removeItem: (name) => {
    storage.remove(name); // v4: `delete` → `remove`
  },
};

export interface SessionConfig {
  type: SessionType;
  /** Serialisierte Quelle (kind[:chapterId]) – für Info/Folgesessions. */
  source: string;
  /** Menschlich lesbares Quellen-Label (für die Zusammenfassung). */
  sourceLabel: string;
  /** Bereits gemischte + begrenzte entryId-Liste. */
  queue: string[];
}

interface SessionState {
  sessionId: string | null;
  type: SessionType | null;
  source: string | null;
  sourceLabel: string | null;
  queue: string[];
  index: number;
  ratings: Record<string, Rating>;
  startedAt: string | null;
  endedAt: string | null;
  active: boolean;
  /** Startet eine neue Session; gibt die (stabile) sessionId zurück. */
  start: (config: SessionConfig) => string;
  /** Bewertung merken und zur nächsten Karte springen. */
  rate: (entryId: string, rating: Rating) => void;
  /** Session beenden (Daten bleiben für die Zusammenfassung erhalten). */
  finish: (endedAt: string) => void;
  /** Kompletten Session-Zustand verwerfen. */
  reset: () => void;
}

/** Stabile Client-Session-ID (offline-replay-fähig, da einmalig erzeugt). */
function makeSessionId(startedAt: number): string {
  return `sess_${startedAt}_${Math.floor(Math.random() * 1e9).toString(36)}`;
}

/**
 * Aktive Lern-/Testsession. Persistiert in MMKV → App-Abbruch mitten in einer
 * Session verliert höchstens die aktuelle (noch unbewertete) Karte; bereits
 * bewertete Karten sind serverseitig geschrieben. Muster wie `useSettingsStore`.
 */
export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessionId: null,
      type: null,
      source: null,
      sourceLabel: null,
      queue: [],
      index: 0,
      ratings: {},
      startedAt: null,
      endedAt: null,
      active: false,

      start: (config) => {
        const startedAtMs = Date.now();
        const sessionId = makeSessionId(startedAtMs);
        set({
          sessionId,
          type: config.type,
          source: config.source,
          sourceLabel: config.sourceLabel,
          queue: config.queue,
          index: 0,
          ratings: {},
          startedAt: new Date(startedAtMs).toISOString(),
          endedAt: null,
          active: true,
        });
        return sessionId;
      },

      rate: (entryId, rating) => {
        const { ratings, index } = get();
        set({ ratings: { ...ratings, [entryId]: rating }, index: index + 1 });
      },

      finish: (endedAt) => set({ active: false, endedAt }),

      reset: () =>
        set({
          sessionId: null,
          type: null,
          source: null,
          sourceLabel: null,
          queue: [],
          index: 0,
          ratings: {},
          startedAt: null,
          endedAt: null,
          active: false,
        }),
    }),
    {
      name: 'kelima-session',
      storage: createJSONStorage(() => mmkvStorage),
      version: 1,
    },
  ),
);

/** True, wenn eine unterbrochene Session wieder aufgenommen werden kann. */
export function hasResumableSession(s: Pick<SessionState, 'active' | 'index' | 'queue'>): boolean {
  return s.active && s.index < s.queue.length;
}
