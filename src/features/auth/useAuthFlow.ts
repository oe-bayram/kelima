import {
  autoSignIn,
  confirmResetPassword,
  confirmSignUp,
  resendSignUpCode,
  resetPassword,
  signIn,
  signUp,
} from 'aws-amplify/auth';
import { useCallback, useMemo, useState } from 'react';

import { authErrorKey } from '@/features/auth/authErrors';
import { isAmplifyConfigured } from '@/lib/amplify';
import type { TranslationKey } from '@/lib/i18n';

export type AuthMode = 'signIn' | 'signUp' | 'confirm' | 'forgot' | 'reset';

type Fields = {
  email: string;
  password: string;
  code: string;
  newPassword: string;
};

const EMPTY_FIELDS: Fields = { email: '', password: '', code: '', newPassword: '' };

/** Pflichtfelder je Modus – Grundlage der clientseitigen Leer-Validierung. */
const REQUIRED_FIELDS: Record<AuthMode, (keyof Fields)[]> = {
  signIn: ['email', 'password'],
  signUp: ['email', 'password'],
  confirm: ['email', 'code'],
  forgot: ['email'],
  reset: ['email', 'code', 'newPassword'],
};

/**
 * Kapselt den kompletten E-Mail/Passwort-Auth-Flow (Anmelden, Registrieren,
 * E-Mail-Bestätigung, Passwort-Reset) über die `aws-amplify/auth`-APIs.
 *
 * Erfolgreiches Anmelden/Auto-Sign-in feuert ein Amplify-Hub-Event; das
 * Auth-Gate im Root-Layout (`useAuthSession`) reagiert darauf und blendet
 * die (app)-Gruppe ein – dieser Hook muss den Navigationswechsel also nicht
 * selbst auslösen.
 */
export function useAuthFlow() {
  const [mode, setModeState] = useState<AuthMode>('signIn');
  const [fields, setFields] = useState<Fields>(EMPTY_FIELDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<TranslationKey | null>(null);
  const [info, setInfo] = useState<TranslationKey | null>(null);

  const setField = useCallback((key: keyof Fields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setMode = useCallback((next: AuthMode) => {
    setError(null);
    setInfo(null);
    setModeState(next);
  }, []);

  /** Code erneut anfordern, ohne bei Fehlern den Flow zu unterbrechen. */
  const safeResend = useCallback(async (email: string) => {
    try {
      await resendSignUpCode({ username: email });
    } catch {
      /* Best effort – der Nutzer kann den Code manuell erneut anfordern. */
    }
  }, []);

  const submit = useCallback(async () => {
    setError(null);
    setInfo(null);

    if (!isAmplifyConfigured) {
      setError('auth.errors.notConfigured');
      return;
    }

    const email = fields.email.trim().toLowerCase();
    const code = fields.code.trim();
    const missing = REQUIRED_FIELDS[mode].some((key) =>
      key === 'email' ? !email : !fields[key].trim(),
    );
    if (missing) {
      setError('auth.errors.emptyFields');
      return;
    }

    setLoading(true);
    try {
      switch (mode) {
        case 'signIn': {
          const { isSignedIn, nextStep } = await signIn({
            username: email,
            password: fields.password,
          });
          if (isSignedIn) break; // Gate übernimmt via Hub-Event
          if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
            await safeResend(email);
            setInfo('auth.confirmSent');
            setModeState('confirm');
          } else if (nextStep.signInStep === 'RESET_PASSWORD') {
            setInfo('auth.resetCodeSent');
            setModeState('reset');
          } else {
            setError('auth.errors.unsupportedStep');
          }
          break;
        }

        case 'signUp': {
          const { nextStep } = await signUp({
            username: email,
            password: fields.password,
            options: { userAttributes: { email }, autoSignIn: true },
          });
          if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
            setInfo('auth.confirmSent');
            setModeState('confirm');
          } else if (nextStep.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
            await autoSignIn();
          } else {
            // Bereits bestätigt – normale Anmeldung nötig.
            setInfo('auth.confirmedSignIn');
            setModeState('signIn');
          }
          break;
        }

        case 'confirm': {
          const { nextStep } = await confirmSignUp({
            username: email,
            confirmationCode: code,
          });
          if (nextStep.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
            await autoSignIn();
          } else if (fields.password) {
            // Über den „nicht bestätigt"-Pfad hierher gelangt: direkt anmelden.
            await signIn({ username: email, password: fields.password });
          } else {
            setInfo('auth.confirmedSignIn');
            setModeState('signIn');
          }
          break;
        }

        case 'forgot': {
          await resetPassword({ username: email });
          setInfo('auth.resetCodeSent');
          setModeState('reset');
          break;
        }

        case 'reset': {
          await confirmResetPassword({
            username: email,
            confirmationCode: code,
            newPassword: fields.newPassword,
          });
          // Mit dem neuen Passwort direkt anmelden.
          await signIn({ username: email, password: fields.newPassword });
          break;
        }
      }
    } catch (caught) {
      // Unbestätigte Konten beim Anmelden gezielt in den Bestätigungs-Flow leiten.
      if (caught instanceof Error && caught.name === 'UserNotConfirmedException') {
        await safeResend(email);
        setInfo('auth.confirmSent');
        setModeState('confirm');
      } else {
        setError(authErrorKey(caught));
      }
    } finally {
      setLoading(false);
    }
  }, [mode, fields, safeResend]);

  /** „Code erneut senden" im Bestätigungs- bzw. Reset-Modus. */
  const resend = useCallback(async () => {
    setError(null);
    setInfo(null);
    const email = fields.email.trim().toLowerCase();
    if (!email) {
      setError('auth.errors.emptyFields');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'reset' || mode === 'forgot') {
        await resetPassword({ username: email });
      } else {
        await resendSignUpCode({ username: email });
      }
      setInfo('auth.codeResent');
    } catch (caught) {
      setError(authErrorKey(caught));
    } finally {
      setLoading(false);
    }
  }, [mode, fields.email]);

  return useMemo(
    () => ({ mode, setMode, fields, setField, loading, error, info, submit, resend }),
    [mode, setMode, fields, setField, loading, error, info, submit, resend],
  );
}
