import 'i18next';

import type de from '../lib/i18n/de/common.json';

// Macht t()-Schlüssel typsicher gegen de/common.json.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof de;
    };
  }
}
