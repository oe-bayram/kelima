// Polyfills, die aws-amplify auf React Native benötigt – MÜSSEN vor dem
// ersten Amplify-Import laufen.
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import { Amplify } from 'aws-amplify';

/**
 * `amplify_outputs.json` wird von `npx ampx sandbox` erzeugt und ist gitignored
 * (fehlt also in CI und vor dem ersten Sandbox-Lauf). Deshalb wird die Datei
 * per `require` in einem try/catch geladen – `require`-Pfade werden von
 * TypeScript/Jest nicht zur Build-Zeit aufgelöst, sodass Typecheck, Lint und
 * Tests grün bleiben, solange das Backend noch nicht deployt ist.
 */
function loadAmplifyOutputs(): Parameters<typeof Amplify.configure>[0] | undefined {
  try {
    return require('../../amplify_outputs.json');
  } catch {
    return undefined;
  }
}

const outputs = loadAmplifyOutputs();

if (outputs) {
  Amplify.configure(outputs);
} else if (__DEV__) {
  console.warn(
    '[amplify] amplify_outputs.json fehlt – führe `npx ampx sandbox` aus, damit Login/Daten funktionieren.',
  );
}

/** Ob Amplify konfiguriert werden konnte (Backend deployt / Sandbox läuft). */
export const isAmplifyConfigured = Boolean(outputs);
