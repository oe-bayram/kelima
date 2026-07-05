import { router } from 'expo-router';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StartSheet, type StartSheetHandle } from '@/components/session/StartSheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Text } from '@/components/ui/text';
import { selectCandidates } from '@/features/session/sessionLogic';
import { useChapterMemberships } from '@/hooks/content';
import { useFavorites, useProgressMap } from '@/hooks/userData';
import { isDue } from '@/lib/vocab';

type DashboardSource = 'due' | 'problem' | 'favorites';

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

  const sheetRef = useRef<StartSheetHandle>(null);

  const total = membershipsQ.data?.byEntry.size ?? 0;
  const progress = progressQ.data;
  const neu = Math.max(0, total - (progress?.size ?? 0));
  const faellig = progress ? [...progress.values()].filter((p) => isDue(p)).length : 0;
  const favoriten = favQ.data?.ids.size ?? 0;
  const noData = membershipsQ.isSuccess && total === 0;

  const openSheet = (kind: DashboardSource) => {
    const now = Date.now();
    const allEntryIds = [...(membershipsQ.data?.byEntry.keys() ?? [])];
    const candidateIds = selectCandidates({
      kind,
      allEntryIds,
      favoriteIds: favQ.data?.ids,
      progress: progressQ.data,
      now,
    });
    const label =
      kind === 'due'
        ? t('session.source.due')
        : kind === 'problem'
          ? t('session.source.problem')
          : t('session.source.favorites');
    sheetRef.current?.present({ candidateIds, label });
  };

  return (
    <View className="flex-1 bg-white dark:bg-neutral-950" style={{ paddingTop: insets.top }}>
      <View className="gap-5 p-4">
        <View className="gap-1">
          <Text variant="title">{t('appName')}</Text>
          <Text variant="caption">{t('dashboard.greeting')}</Text>
        </View>

        {noData ? (
          <EmptyState
            icon="book-outline"
            title={t('empty.dashboardTitle')}
            subtitle={t('empty.dashboardSubtitle')}
            actionLabel={t('dashboard.openChapters')}
            onAction={() => router.push('/chapters')}
          />
        ) : (
          <>
            <View className="flex-row gap-2">
              <Stat label={t('dashboard.total')} value={total} />
              <Stat label={t('dashboard.neu')} value={neu} />
            </View>
            <View className="flex-row gap-2">
              <Stat label={t('dashboard.faellig')} value={faellig} />
              <Stat label={t('dashboard.favoriten')} value={favoriten} />
            </View>

            <Button label={t('dashboard.openChapters')} onPress={() => router.push('/chapters')} />

            <View className="gap-3">
              <Button label={t('dashboard.continueLearn')} onPress={() => openSheet('due')} />
              <View className="flex-row gap-2">
                <Button
                  className="flex-1"
                  variant="secondary"
                  label={t('session.problemWords')}
                  onPress={() => openSheet('problem')}
                />
                <Button
                  className="flex-1"
                  variant="secondary"
                  label={t('dashboard.favoriten')}
                  onPress={() => openSheet('favorites')}
                />
              </View>
            </View>
          </>
        )}
      </View>

      <StartSheet ref={sheetRef} />
    </View>
  );
}
