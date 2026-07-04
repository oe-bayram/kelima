import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * Phase-1-Minimalschema.
 *
 * Für das Fundament reicht ein einzelnes Content-Modell, damit der Data-Client
 * generiert wird und der userPool-Autorisierungsmodus (Cognito) verifiziert ist.
 * Das vollständige Schema (VocabularyEntry, VocabularyForm, Chapter, Progress …)
 * folgt in Phase 2 – siehe docs/plan/phase-2-daten-import.md.
 *
 * Autorisierung: eingeloggte Nutzer dürfen lesen, die Gruppe "admin"
 * (Import-Skript, Phase 2) darf schreiben.
 *
 * @see https://docs.amplify.aws/react-native/build-a-backend/data/
 */
const schema = a.schema({
  ContentVersion: a
    .model({
      version: a.integer().required(),
      description: a.string(),
      importedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.group('admin'),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
