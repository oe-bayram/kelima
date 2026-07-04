import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 *
 * Die Gruppe `admin` wird von den Content-Modell-Autorisierungsregeln
 * (`allow.group('admin')`) benötigt: der Import-Nutzer (Phase 2) muss Mitglied
 * dieser Gruppe sein, um schreiben zu dürfen. User werden manuell zugeordnet
 * (siehe scripts/import/README.md).
 *
 * @see https://docs.amplify.aws/react/build-a-backend/auth/
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  groups: ['admin'],
});
