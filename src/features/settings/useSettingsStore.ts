import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import i18n, { type AppLanguage } from '@/lib/i18n';
import { storage } from '@/lib/storage';

type SettingsState = {
  language: AppLanguage;
  ttsRate: number;
  setLanguage: (language: AppLanguage) => void;
  setTtsRate: (rate: number) => void;
};

/** StateStorage-Adapter über die synchrone MMKV-Instanz. */
const mmkvStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => {
    storage.set(name, value);
  },
  removeItem: (name) => {
    storage.remove(name); // v4: `delete` → `remove`
  },
};

/**
 * UI-Einstellungen (Zustand v5). Die Sprache ist auch hier persistiert; beim
 * Setzen wird i18next umgeschaltet (das seinerseits die Wahl in MMKV ablegt),
 * sodass Store und i18next konsistent bleiben. `ttsRate` ist ein Platzhalter
 * für Phase 3 (TTS-Tempo).
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: (i18n.language as AppLanguage) ?? 'de',
      ttsRate: 1,
      setLanguage: (language) => {
        void i18n.changeLanguage(language);
        set({ language });
      },
      setTtsRate: (ttsRate) => set({ ttsRate }),
    }),
    {
      name: 'kelima-settings',
      storage: createJSONStorage(() => mmkvStorage),
      version: 1,
      // Nach Rehydrierung i18next an die gespeicherte Sprache angleichen.
      onRehydrateStorage: () => (state) => {
        if (state?.language && state.language !== i18n.language) {
          void i18n.changeLanguage(state.language);
        }
      },
    },
  ),
);
