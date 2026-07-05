import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'aws-amplify/auth';
import Constants from 'expo-constants';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Segmented, type SegmentedOption } from '@/components/ui/segmented';
import { Text } from '@/components/ui/text';
import { pendingRatingCount, replayOutbox, useOutboxStore } from '@/features/session/outbox';
import { ChangePasswordForm } from '@/features/settings/ChangePasswordForm';
import { useSettingsStore } from '@/features/settings/useSettingsStore';
import { useContentVersion } from '@/hooks/content';
import { useTts } from '@/hooks/useTts';
import { useUserEmail } from '@/hooks/userData';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { queryClient } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

type SpeechKey = 'slow' | 'normal' | 'fast';
const RATE_BY_KEY: Record<SpeechKey, number> = { slow: 0.8, normal: 1, fast: 1.25 };

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text variant="subtitle">{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between gap-4 py-0.5">
      <Text variant="caption">{label}</Text>
      <Text className="flex-1 text-right">{value}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const ttsRate = useSettingsStore((state) => state.ttsRate);
  const setTtsRate = useSettingsStore((state) => state.setTtsRate);
  const { speak } = useTts();

  const pending = pendingRatingCount(useOutboxStore((state) => state.ops));
  const emailQ = useUserEmail();
  const contentVersion = useContentVersion().data;

  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  const speechKey: SpeechKey = ttsRate < 0.95 ? 'slow' : ttsRate > 1.1 ? 'fast' : 'normal';
  const speechOptions: SegmentedOption<SpeechKey>[] = [
    { value: 'slow', label: t('settings.speechSlow') },
    { value: 'normal', label: t('settings.speechNormal') },
    { value: 'fast', label: t('settings.speechFast') },
  ];

  const appVersion = Constants.expoConfig?.version ?? '—';
  const contentVersionLabel = contentVersion
    ? `v${contentVersion.version}${contentVersion.label ? ` · ${contentVersion.label}` : ''}`
    : '—';

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingVertical: 24, gap: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="title">{t('settings.title')}</Text>

        <Section title={t('settings.language')}>
          <View className="flex-row gap-3">
            {SUPPORTED_LANGUAGES.map((lng) => {
              const active = language === lng;
              return (
                <Pressable
                  key={lng}
                  onPress={() => setLanguage(lng)}
                  accessibilityRole="button"
                  className={cn(
                    'flex-1 items-center rounded-xl border px-4 py-3',
                    active ? 'border-brand bg-brand' : 'border-neutral-300 dark:border-neutral-700',
                  )}
                >
                  <Text className={active ? 'font-semibold text-white' : ''}>
                    {lng === 'de' ? t('settings.languageGerman') : t('settings.languageTurkish')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title={t('settings.speech')}>
          <View className="flex-row items-center gap-2">
            <View className="flex-1">
              <Segmented
                options={speechOptions}
                value={speechKey}
                onChange={(key) => setTtsRate(RATE_BY_KEY[key])}
              />
            </View>
            <Pressable
              hitSlop={8}
              onPress={() => void speak('Beispiel')}
              accessibilityRole="button"
              accessibilityLabel={t('settings.speechPreview')}
              className="rounded-xl border border-neutral-300 p-2.5 dark:border-neutral-700"
            >
              <Ionicons name="volume-medium-outline" size={20} color="#9ca3af" />
            </Pressable>
          </View>
        </Section>

        <Section title={t('settings.account')}>
          <View className="gap-1">
            <Text variant="caption">{t('settings.email')}</Text>
            <Text>{emailQ.data ?? '—'}</Text>
          </View>

          {changingPassword ? (
            <ChangePasswordForm
              onCancel={() => setChangingPassword(false)}
              onSuccess={() => {
                setChangingPassword(false);
                setPasswordChanged(true);
              }}
            />
          ) : (
            <View className="gap-2">
              {passwordChanged ? (
                <Text className="text-sm text-status-sicher">{t('settings.passwordChanged')}</Text>
              ) : null}
              <Button
                variant="outline"
                label={t('settings.changePassword')}
                onPress={() => {
                  setPasswordChanged(false);
                  setChangingPassword(true);
                }}
              />
            </View>
          )}

          <Button
            variant="destructive"
            label={t('actions.signOut')}
            onPress={() => {
              // Nach dem Logout den Query-Cache (inkl. Persistenz) leeren.
              void signOut().finally(() => queryClient.clear());
            }}
          />
        </Section>

        {pending > 0 ? (
          <Section title={t('settings.sync')}>
            <Text variant="caption">{t('settings.pendingSync', { count: pending })}</Text>
            <Button
              variant="outline"
              label={t('settings.syncNow')}
              onPress={() => void replayOutbox()}
            />
          </Section>
        ) : null}

        <Section title={t('settings.appInfo')}>
          <View className="gap-0.5">
            <InfoRow label={t('settings.version')} value={appVersion} />
            <InfoRow label={t('settings.contentVersion')} value={contentVersionLabel} />
          </View>
          <Text variant="caption">{t('settings.license')}</Text>
        </Section>
      </ScrollView>
    </Screen>
  );
}
