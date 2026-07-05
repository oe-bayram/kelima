import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useChapterMemberships } from '@/hooks/content';
import { useFavorites, useProgressMap } from '@/hooks/userData';
import { isDue } from '@/lib/vocab';

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="flex-1">
      <CardContent className="items-center gap-1 p-3">
        <Text className="text-2xl font-bold">{value}</Text>
        <Text variant="caption" className="text-center">
          {label}
        </Text>
      </CardContent>
    </Card>
  );
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const membershipsQ = useChapterMemberships();
  const progressQ = useProgressMap();
  const favQ = useFavorites();

  const total = membershipsQ.data?.byEntry.size ?? 0;
  const progress = progressQ.data;
  const neu = Math.max(0, total - (progress?.size ?? 0));
  const faellig = progress ? [...progress.values()].filter((p) => isDue(p)).length : 0;
  const favoriten = favQ.data?.ids.size ?? 0;

  return (
    <View className="flex-1 bg-white dark:bg-neutral-950" style={{ paddingTop: insets.top }}>
      <View className="gap-5 p-4">
        <View className="gap-1">
          <Text variant="title">{t('appName')}</Text>
          <Text variant="caption">{t('dashboard.greeting')}</Text>
        </View>

        <View className="flex-row gap-2">
          <Stat label={t('dashboard.total')} value={total} />
          <Stat label={t('dashboard.neu')} value={neu} />
        </View>
        <View className="flex-row gap-2">
          <Stat label={t('dashboard.faellig')} value={faellig} />
          <Stat label={t('dashboard.favoriten')} value={favoriten} />
        </View>

        <Button label={t('dashboard.openChapters')} onPress={() => router.push('/chapters')} />

        <View className="gap-2">
          <Text variant="caption">{t('dashboard.phase4Hint')}</Text>
          <View className="flex-row gap-2">
            <Button
              className="flex-1"
              variant="secondary"
              label={t('dashboard.continueLearn')}
              disabled
              onPress={() => {}}
            />
            <Button
              className="flex-1"
              variant="secondary"
              label={t('dashboard.testSession')}
              disabled
              onPress={() => {}}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
