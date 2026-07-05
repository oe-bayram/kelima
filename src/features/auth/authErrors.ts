import type { TranslationKey } from '@/lib/i18n';

/**
 * Bildet bekannte Cognito-/Amplify-Fehlernamen auf i18n-Keys unter
 * `auth.errors.*` ab. Unbekannte Fehler fallen auf `auth.errors.generic` zurück,
 * damit der Nutzer nie eine rohe englische Ausnahmemeldung sieht.
 */
const ERROR_KEYS: Record<string, TranslationKey> = {
  UserNotFoundException: 'auth.errors.UserNotFoundException',
  NotAuthorizedException: 'auth.errors.NotAuthorizedException',
  UserNotConfirmedException: 'auth.errors.UserNotConfirmedException',
  UsernameExistsException: 'auth.errors.UsernameExistsException',
  CodeMismatchException: 'auth.errors.CodeMismatchException',
  ExpiredCodeException: 'auth.errors.ExpiredCodeException',
  InvalidPasswordException: 'auth.errors.InvalidPasswordException',
  InvalidParameterException: 'auth.errors.InvalidParameterException',
  LimitExceededException: 'auth.errors.LimitExceededException',
  TooManyRequestsException: 'auth.errors.TooManyRequestsException',
  CodeDeliveryFailureException: 'auth.errors.CodeDeliveryFailureException',
};

export function authErrorKey(error: unknown): TranslationKey {
  const name = error instanceof Error ? error.name : undefined;
  const key = name ? ERROR_KEYS[name] : undefined;
  return key ?? 'auth.errors.generic';
}
