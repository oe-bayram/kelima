import { I18n } from 'aws-amplify/utils';

/**
 * Deutsch/Türkisch-Vokabular für die Oberfläche des Amplify-Authenticators
 * (Anmeldung, Registrierung, Bestätigungscode …). Der Authenticator nutzt
 * Amplifys eigenes `I18n`, nicht i18next – daher die separate Registrierung.
 */
const authVocabularies: Record<string, Record<string, string>> = {
  de: {
    'Sign In': 'Anmelden',
    'Sign in': 'Anmelden',
    'Sign Up': 'Registrieren',
    'Create Account': 'Konto erstellen',
    Email: 'E-Mail',
    Password: 'Passwort',
    'Confirm Password': 'Passwort bestätigen',
    'Enter your Email': 'E-Mail eingeben',
    'Enter your Password': 'Passwort eingeben',
    'Please confirm your Password': 'Bitte Passwort bestätigen',
    'Forgot your password?': 'Passwort vergessen?',
    'Reset Password': 'Passwort zurücksetzen',
    'Reset your Password': 'Passwort zurücksetzen',
    'Send code': 'Code senden',
    'Send Code': 'Code senden',
    'Back to Sign In': 'Zurück zur Anmeldung',
    Confirm: 'Bestätigen',
    'Confirm Sign Up': 'Registrierung bestätigen',
    'Confirmation Code': 'Bestätigungscode',
    'Enter your code': 'Code eingeben',
    'Resend Code': 'Code erneut senden',
    'Sign Out': 'Abmelden',
    Submit: 'Absenden',
    Skip: 'Überspringen',
    'Change Password': 'Passwort ändern',
    Code: 'Code',
    'We Emailed You': 'Wir haben dir eine E-Mail geschickt',
    'Your code is on the way. To log in, enter the code we emailed to':
      'Dein Code ist unterwegs. Gib zum Anmelden den Code ein, den wir gesendet haben an',
    'It may take a minute to arrive.': 'Es kann eine Minute dauern.',
  },
  tr: {
    'Sign In': 'Giriş yap',
    'Sign in': 'Giriş yap',
    'Sign Up': 'Kayıt ol',
    'Create Account': 'Hesap oluştur',
    Email: 'E-posta',
    Password: 'Şifre',
    'Confirm Password': 'Şifreyi onayla',
    'Enter your Email': 'E-postanızı girin',
    'Enter your Password': 'Şifrenizi girin',
    'Please confirm your Password': 'Lütfen şifrenizi onaylayın',
    'Forgot your password?': 'Şifreni mi unuttun?',
    'Reset Password': 'Şifreyi sıfırla',
    'Reset your Password': 'Şifreni sıfırla',
    'Send code': 'Kod gönder',
    'Send Code': 'Kod gönder',
    'Back to Sign In': 'Girişe dön',
    Confirm: 'Onayla',
    'Confirm Sign Up': 'Kaydı onayla',
    'Confirmation Code': 'Onay kodu',
    'Enter your code': 'Kodu girin',
    'Resend Code': 'Kodu tekrar gönder',
    'Sign Out': 'Çıkış yap',
    Submit: 'Gönder',
    Skip: 'Atla',
    'Change Password': 'Şifre değiştir',
    Code: 'Kod',
    'We Emailed You': 'Sana e-posta gönderdik',
    'Your code is on the way. To log in, enter the code we emailed to':
      'Kodun yolda. Giriş yapmak için gönderdiğimiz kodu gir:',
    'It may take a minute to arrive.': 'Gelmesi bir dakika sürebilir.',
  },
};

export function registerAuthenticatorVocabularies(): void {
  I18n.putVocabularies(authVocabularies);
}

export function syncAuthenticatorLanguage(lng: string): void {
  I18n.setLanguage(lng);
}
