import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { CodeInput } from '@/components/ui/code-input';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/ui/logo';
import { Screen } from '@/components/ui/screen';
import { Segmented } from '@/components/ui/segmented';
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

/** Textlink für Modus-Wechsel (Passwort vergessen, zurück zur Anmeldung, …). */
function AuthLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="link" hitSlop={8}>
      <Text className="text-sm font-sans-semibold text-brand">{label}</Text>
    </Pressable>
  );
}

/**
 * Eigener E-Mail/Passwort-Auth-Screen im Kelima-Design (Logo, Segmented-
 * Umschalter Anmelden/Registrieren, Code-Boxen, Passwort-Anzeigen-Toggle).
 * Ersetzt den Amplify-`<Authenticator>`. Logik in `useAuthFlow`; nach
 * erfolgreicher Anmeldung wechselt das Gate im Root-Layout in die (app)-Gruppe.
 */
export default function SignInScreen() {
  const { t } = useTranslation();
  const { mode, setMode, fields, setField, loading, error, info, submit, resend } = useAuthFlow();

  const isPrimary = mode === 'signIn' || mode === 'signUp';
  const showEmail = mode !== 'reset';
  const showPassword = mode === 'signIn' || mode === 'signUp';
  const showCode = mode === 'confirm' || mode === 'reset';
  const showNewPassword = mode === 'reset';
  const showHint = mode === 'confirm' || mode === 'reset';
  const codeError = error === 'auth.errors.CodeMismatchException' || error === 'auth.errors.ExpiredCodeException';

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
          <View className="flex-1 justify-center gap-7 py-8">
            {/* Zurück (nur in den Unter-Flows) */}
            {!isPrimary ? (
              <Pressable
                onPress={() => setMode('signIn')}
                accessibilityRole="button"
                accessibilityLabel={t('auth.toSignIn')}
                hitSlop={8}
                className="-ml-1 h-10 w-10 items-center justify-center self-start rounded-xl"
              >
                <Ionicons name="chevron-back" size={24} color="#6A6760" />
              </Pressable>
            ) : null}

            {/* Kopfbereich */}
            <View className="gap-8">
              <View className="items-center">
                <Logo height={200} />
              </View>
              <View className="gap-1">
                <Text variant="title">{t(TITLE_KEY[mode])}</Text>
                {showHint ? (
                  <Text className="text-base text-neutral-600 dark:text-neutral-400">
                    {t('auth.confirmHint', { email: fields.email })}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Anmelden / Registrieren */}
            {isPrimary ? (
              <Segmented<'signIn' | 'signUp'>
                options={[
                  { value: 'signIn', label: t('auth.signInAction') },
                  { value: 'signUp', label: t('auth.signUpAction') },
                ]}
                value={mode as 'signIn' | 'signUp'}
                onChange={setMode}
              />
            ) : null}

            {!isAmplifyConfigured ? (
              <Text className="text-sm text-status-nichtGewusst">{t('auth.errors.notConfigured')}</Text>
            ) : null}

            <View className="gap-4">
              {showEmail ? (
                <Input
                  iconLeft="mail-outline"
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
                  iconLeft="lock-closed-outline"
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
                <View className="gap-2">
                  <Text className="text-sm font-sans-medium text-neutral-600 dark:text-neutral-300">
                    {t('auth.code')}
                  </Text>
                  <CodeInput
                    value={fields.code}
                    onChangeText={(value) => setField('code', value)}
                    autoFocus={mode === 'confirm'}
                    error={codeError}
                    editable={!loading}
                  />
                </View>
              ) : null}

              {showNewPassword ? (
                <Input
                  iconLeft="lock-closed-outline"
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
            {info && !error ? <Text className="text-sm text-status-kannIch">{t(info)}</Text> : null}

            <Button
              testID="auth-submit"
              label={t(ACTION_KEY[mode])}
              size="lg"
              iconRight={showCode ? 'checkmark' : 'arrow-forward'}
              loading={loading}
              disabled={!isAmplifyConfigured}
              onPress={submit}
            />

            {showCode ? (
              <View className="items-center">
                <AuthLink label={t('auth.resendCode')} onPress={resend} />
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
