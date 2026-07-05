/* eslint-disable import/no-named-as-default-member -- i18next's default export intentionally exposes use()/changeLanguage() */
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import type { LanguageDetectorModule } from 'i18next';
import { initReactI18next } from 'react-i18next';

import {
  registerAuthenticatorVocabularies,
  syncAuthenticatorLanguage,
} from '../authenticator-i18n';
import { storage } from '../storage';
import de from './de/common.json';
import grammarDe from './de/grammar.json';
import tr from './tr/common.json';
import grammarTr from './tr/grammar.json';

export const LANGUAGE_STORAGE_KEY = 'settings.language';
export const SUPPORTED_LANGUAGES = ['de', 'tr'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const FALLBACK_LNG: AppLanguage = 'de';

function isSupported(lng?: string | null): lng is AppLanguage {
  return !!lng && (SUPPORTED_LANGUAGES as readonly string[]).includes(lng);
}

/**
 * Synchroner Sprach-Detektor: gespeicherte Wahl (MMKV) → Gerätesprache
 * (expo-localization) → Fallback `de`. i18next ruft `cacheUserLanguage`
 * bei jedem `changeLanguage` automatisch auf, daher ist die Persistenz automatisch.
 */
const mmkvLanguageDetector: LanguageDetectorModule = {
  type: 'languageDetector',
  init: () => {
    /* keine asynchronen Services nötig */
  },
  detect: (): string => {
    const saved = storage.getString(LANGUAGE_STORAGE_KEY);
    if (isSupported(saved)) return saved;

    const device = getLocales()[0]?.languageCode;
    if (isSupported(device)) return device;

    return FALLBACK_LNG;
  },
  cacheUserLanguage: (lng: string) => {
    if (isSupported(lng)) storage.set(LANGUAGE_STORAGE_KEY, lng);
  },
};

registerAuthenticatorVocabularies();

void i18n
  .use(mmkvLanguageDetector)
  .use(initReactI18next)
  .init({
    // Kein `lng` setzen – der Detektor entscheidet.
    fallbackLng: FALLBACK_LNG,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    ns: ['common', 'grammar'],
    defaultNS: 'common',
    resources: {
      de: { common: de, grammar: grammarDe },
      tr: { common: tr, grammar: grammarTr },
    },
    returnNull: false,
    interpolation: {
      escapeValue: false, // React escaped bereits selbst
    },
    // Kein compatibilityJSON: 'v3' – Hermes (SDK 57) hat Intl.PluralRules.
  });

// Authenticator-Oberfläche an die erkannte Sprache angleichen.
syncAuthenticatorLanguage(i18n.language);

/**
 * Sprache zur Laufzeit wechseln (und automatisch in MMKV persistieren).
 * Hält zusätzlich die Amplify-Authenticator-Sprache synchron.
 */
export function setAppLanguage(lng: AppLanguage): Promise<unknown> {
  syncAuthenticatorLanguage(lng);
  return i18n.changeLanguage(lng);
}

export default i18n;
