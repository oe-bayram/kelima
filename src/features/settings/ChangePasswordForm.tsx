import { updatePassword } from 'aws-amplify/auth';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { authErrorKey } from '@/features/auth/authErrors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import type { TranslationKey } from '@/lib/i18n';

/** Inline-Formular „Passwort ändern" über den Amplify-`updatePassword`-Flow. */
export function ChangePasswordForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<TranslationKey | null>(null);

  const submit = async () => {
    setError(null);
    if (!oldPassword || !newPassword) {
      setError('auth.errors.emptyFields');
      return;
    }
    setLoading(true);
    try {
      await updatePassword({ oldPassword, newPassword });
      onSuccess();
    } catch (caught) {
      setError(authErrorKey(caught));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="gap-3">
      <Input
        label={t('settings.currentPassword')}
        value={oldPassword}
        onChangeText={setOldPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        editable={!loading}
      />
      <Input
        label={t('settings.newPassword')}
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        editable={!loading}
        returnKeyType="go"
        onSubmitEditing={() => void submit()}
      />
      {error ? <Text className="text-sm text-status-nichtGewusst">{t(error)}</Text> : null}
      <View className="flex-row gap-2">
        <Button
          className="flex-1"
          variant="secondary"
          label={t('settings.cancel')}
          disabled={loading}
          onPress={onCancel}
        />
        <Button
          className="flex-1"
          label={t('settings.save')}
          loading={loading}
          onPress={() => void submit()}
        />
      </View>
    </View>
  );
}
