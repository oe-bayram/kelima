import 'i18next';

import type common from '../lib/i18n/de/common.json';
import type grammar from '../lib/i18n/de/grammar.json';

// Macht t()-Schlüssel typsicher gegen die de-Ressourcen.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      grammar: typeof grammar;
    };
  }
}
