import { signOut } from 'aws-amplify/auth';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { useSettingsStore } from '@/features/settings/useSettingsStore';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { queryClient } from '@/lib/queryClient';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  return (
    <Screen>
      <View className="flex-1 gap-8 pt-6">
        <Text variant="title">{t('settings.title')}</Text>

        <View className="gap-3">
          <Text variant="subtitle">{t('settings.language')}</Text>
          <View className="flex-row gap-3">
            {SUPPORTED_LANGUAGES.map((lng) => {
              const active = language === lng;
              return (
                <Pressable
                  key={lng}
                  onPress={() => setLanguage(lng)}
                  accessibilityRole="button"
                  className={`flex-1 items-center rounded-xl border px-4 py-3 ${
                    active ? 'border-brand bg-brand' : 'border-neutral-300 dark:border-neutral-700'
                  }`}
                >
                  <Text className={active ? 'font-semibold text-white' : ''}>
                    {lng === 'de' ? t('settings.languageGerman') : t('settings.languageTurkish')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mt-auto pb-4">
          <Button
            variant="destructive"
            label={t('actions.signOut')}
            onPress={() => {
              // Nach dem Logout den Query-Cache (inkl. Persistenz) leeren, damit
              // der nächste Nutzer keine fremden/veralteten Daten sieht.
              void signOut().finally(() => queryClient.clear());
            }}
          />
        </View>
      </View>
    </Screen>
  );
}
