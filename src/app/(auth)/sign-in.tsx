import { Authenticator } from '@aws-amplify/ui-react-native';
import { Redirect } from 'expo-router';

/**
 * Anmeldung/Registrierung über den Amplify-Authenticator (E-Mail + Passwort,
 * Sign-up mit Bestätigungscode; DE/TR über I18n lokalisiert – siehe
 * src/lib/authenticator-i18n.ts).
 *
 * Ausgeloggt rendert <Authenticator> seine eigene Oberfläche. Nach erfolgreicher
 * Anmeldung wechselt das Gate im Root-Layout automatisch in die (app)-Gruppe;
 * das <Redirect> ist nur eine Absicherung für diesen Übergang.
 */
export default function SignInScreen() {
  return (
    <Authenticator>
      <Redirect href="/" />
    </Authenticator>
  );
}
