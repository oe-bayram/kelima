import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { type AuthMode, useAuthFlow } from '@/features/auth/useAuthFlow';
import { isAmplifyConfigured } from '@/lib/amplify';
import type { TranslationKey } from '@/lib/i18n';

const TITLE_KEY: Record<AuthMode, TranslationKey> = {
  signIn: 'auth.signInTitle',
  signUp: 'auth.signUpTitle',
  confirm: 'auth.confirmTitle',
  forgot: 'auth.forgotTitle',
  reset: 'auth.resetTitle',
};

const ACTION_KEY: Record<AuthMode, TranslationKey> = {
  signIn: 'auth.signInAction',
  signUp: 'auth.signUpAction',
  confirm: 'auth.confirmAction',
  forgot: 'auth.sendCodeAction',
  reset: 'auth.resetAction',
};

/** Textlink für Modus-Wechsel (Registrieren, zurück zur Anmeldung, …). */
function AuthLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="link" hitSlop={8}>
      <Text className="text-sm font-semibold text-brand">{label}</Text>
    </Pressable>
  );
}

/**
 * Eigener E-Mail/Passwort-Auth-Screen (ersetzt den Amplify-`<Authenticator>`,
 * dessen eingebaute UI auf diesem Stack den Submit-Button unsichtbar rendert).
 * Logik in `useAuthFlow`; nach erfolgreicher Anmeldung wechselt das Gate im
 * Root-Layout automatisch in die (app)-Gruppe.
 */
export default function SignInScreen() {
  const { t } = useTranslation();
  const { mode, setMode, fields, setField, loading, error, info, submit, resend } = useAuthFlow();

  const showEmail = mode !== 'reset';
  const showPassword = mode === 'signIn' || mode === 'signUp';
  const showCode = mode === 'confirm' || mode === 'reset';
  const showNewPassword = mode === 'reset';
  const showHint = mode === 'confirm' || mode === 'reset';

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center gap-6 py-10">
            <View className="gap-2">
              <Text variant="title">{t(TITLE_KEY[mode])}</Text>
              {showHint ? (
                <Text variant="caption">{t('auth.confirmHint', { email: fields.email })}</Text>
              ) : null}
            </View>

            {!isAmplifyConfigured ? (
              <Text className="text-sm text-status-schwer">{t('auth.errors.notConfigured')}</Text>
            ) : null}

            <View className="gap-4">
              {showEmail ? (
                <Input
                  label={t('auth.email')}
                  value={fields.email}
                  onChangeText={(value) => setField('email', value)}
                  placeholder={t('auth.emailPlaceholder')}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  editable={!loading}
                  returnKeyType={mode === 'forgot' ? 'go' : 'next'}
                  onSubmitEditing={mode === 'forgot' ? submit : undefined}
                />
              ) : null}

              {showPassword ? (
                <Input
                  label={t('auth.password')}
                  value={fields.password}
                  onChangeText={(value) => setField('password', value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
                  editable={!loading}
                  returnKeyType="go"
                  onSubmitEditing={submit}
                />
              ) : null}

              {showCode ? (
                <Input
                  label={t('auth.code')}
                  value={fields.code}
                  onChangeText={(value) => setField('code', value)}
                  placeholder={t('auth.codePlaceholder')}
                  keyboardType="number-pad"
                  autoComplete="one-time-code"
                  textContentType="oneTimeCode"
                  editable={!loading}
                  returnKeyType={mode === 'confirm' ? 'go' : 'next'}
                  onSubmitEditing={mode === 'confirm' ? submit : undefined}
                />
              ) : null}

              {showNewPassword ? (
                <Input
                  label={t('auth.newPassword')}
                  value={fields.newPassword}
                  onChangeText={(value) => setField('newPassword', value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="new-password"
                  editable={!loading}
                  returnKeyType="go"
                  onSubmitEditing={submit}
                />
              ) : null}

              {mode === 'signIn' ? (
                <View className="items-end">
                  <AuthLink label={t('auth.forgotPassword')} onPress={() => setMode('forgot')} />
                </View>
              ) : null}
            </View>

            {error ? <Text className="text-sm text-status-nichtGewusst">{t(error)}</Text> : null}
            {info && !error ? (
              <Text className="text-sm text-status-sicher">{t(info)}</Text>
            ) : null}

            <Button
              label={t(ACTION_KEY[mode])}
              loading={loading}
              disabled={!isAmplifyConfigured}
              onPress={submit}
            />

            <View className="items-center gap-3">
              {mode === 'signIn' ? (
                <AuthLink label={t('auth.toSignUp')} onPress={() => setMode('signUp')} />
              ) : null}

              {showCode ? (
                <AuthLink label={t('auth.resendCode')} onPress={resend} />
              ) : null}

              {mode !== 'signIn' ? (
                <AuthLink label={t('auth.toSignIn')} onPress={() => setMode('signIn')} />
              ) : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
