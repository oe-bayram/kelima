import { router } from 'expo-router';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StatusBar } from '@/components/stats/StatusBar';
import { StartSheet, type StartSheetHandle } from '@/components/session/StartSheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import {
  chapterProgress,
  formatDuration,
  overviewStats,
  problemWordIds,
  type StatusCounts,
} from '@/features/stats/statsLogic';
import { useChapterMemberships, useChapters } from '@/hooks/content';
import { useFavorites, useProgressMap, useRecentSessions } from '@/hooks/userData';
import type { SessionRow } from '@/lib/dataClient';
import { cn } from '@/lib/utils';
import { STATUS_HEX, STATUS_ORDER } from '@/lib/vocab';

export default function StatsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<StartSheetHandle>(null);

  const chaptersQ = useChapters();
  const membershipsQ = useChapterMemberships();
  const progressQ = useProgressMap();
  const favQ = useFavorites();
  const recentQ = useRecentSessions();

  const allEntryIds = [...(membershipsQ.data?.byEntry.keys() ?? [])];
  const overview = overviewStats(allEntryIds, progressQ.data);
  const favorites = favQ.data?.ids.size ?? 0;
  const problemIds = problemWordIds(allEntryIds, progressQ.data);

  const openProblemSheet = () =>
    sheetRef.current?.present({ candidateIds: problemIds, label: t('session.source.problem') });

  return (
    <View className="flex-1 bg-white dark:bg-neutral-950" style={{ paddingTop: insets.top }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="title">{t('stats.title')}</Text>

        {overview.total === 0 ? (
          <View className="gap-3">
            <Text variant="caption">{t('stats.empty')}</Text>
            <Button label={t('dashboard.openChapters')} onPress={() => router.push('/chapters')} />
          </View>
        ) : (
          <>
            {/* Gesamtübersicht */}
            <Card>
              <CardContent className="gap-3">
                <View className="flex-row items-end justify-between">
                  <Text variant="subtitle">{t('stats.progress')}</Text>
                  <Text className="text-2xl font-bold text-brand">
                    {Math.round(overview.progressPct * 100)}%
                  </Text>
                </View>
                <StatusBar counts={overview.byStatus} />
                <Legend counts={overview.byStatus} />
                <View className="mt-1 flex-row gap-2">
                  <MiniStat label={t('stats.due')} value={overview.due} />
                  <MiniStat label={t('stats.favorites')} value={favorites} />
                  <MiniStat label={t('stats.learned')} value={overview.learned} />
                </View>
              </CardContent>
            </Card>

            {/* Problemwörter */}
            {problemIds.length > 0 ? (
              <View className="gap-2">
                <Text variant="subtitle">{t('stats.problemWords')}</Text>
                <Text variant="caption">{t('stats.words', { count: problemIds.length })}</Text>
                <Button label={t('session.start')} onPress={openProblemSheet} />
              </View>
            ) : null}

            {/* Kapitelstatistik */}
            <View className="gap-2">
              <Text variant="subtitle">{t('stats.chapters')}</Text>
              {(chaptersQ.data ?? []).map((chapter) => {
                const entryIds = (membershipsQ.data?.byChapter.get(chapter.id) ?? []).map(
                  (m) => m.entryId,
                );
                const cp = chapterProgress(entryIds, progressQ.data);
                return (
                  <Pressable
                    key={chapter.id}
                    onPress={() =>
                      router.push({ pathname: '/chapters/[id]', params: { id: chapter.id } })
                    }
                    className="gap-2 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800"
                  >
                    <View className="flex-row items-center justify-between gap-2">
                      <Text className="flex-1 font-medium">{chapter.title}</Text>
                      <Text variant="caption">
                        {cp.learned}/{cp.total}
                      </Text>
                    </View>
                    <StatusBar counts={cp.byStatus} />
                  </Pressable>
                );
              })}
            </View>

            {/* Letzte Sessions */}
            <View className="gap-2">
              <Text variant="subtitle">{t('stats.recentSessions')}</Text>
              {recentQ.data && recentQ.data.length > 0 ? (
                recentQ.data.map((s) => <SessionRowItem key={s.id} session={s} />)
              ) : (
                <Text variant="caption">{t('stats.noSessions')}</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <StartSheet ref={sheetRef} />
    </View>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-1 items-center gap-0.5 rounded-xl bg-neutral-100 py-2 dark:bg-neutral-800">
      <Text className="text-lg font-bold">{value}</Text>
      <Text variant="caption" className="text-center">
        {label}
      </Text>
    </View>
  );
}

function Legend({ counts }: { counts: StatusCounts }) {
  const { t } = useTranslation();
  return (
    <View className="flex-row flex-wrap gap-x-3 gap-y-1">
      {STATUS_ORDER.filter((st) => counts[st] > 0).map((st) => (
        <View key={st} className="flex-row items-center gap-1.5">
          <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_HEX[st] }} />
          <Text variant="caption">
            {t(`status.${st}`)} {counts[st]}
          </Text>
        </View>
      ))}
    </View>
  );
}

function SessionRowItem({ session }: { session: SessionRow }) {
  const { t } = useTranslation();
  const date = session.startedAt ? new Date(session.startedAt).toLocaleDateString() : '';
  const duration =
    session.startedAt && session.endedAt
      ? formatDuration(new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime())
      : null;
  const typeLabel = t(session.sessionType === 'test' ? 'session.test' : 'session.learn');

  return (
    <View
      className={cn(
        'flex-row items-center justify-between gap-2 rounded-xl border border-neutral-200 p-3',
        'dark:border-neutral-800',
      )}
    >
      <View className="gap-0.5">
        <Text className="font-medium">{typeLabel}</Text>
        <Text variant="caption">
          {date}
          {duration ? ` · ${duration}` : ''}
        </Text>
      </View>
      <Text variant="caption">
        {t('stats.sessionResult', {
          correct: session.correctCount ?? 0,
          total: session.totalCount ?? 0,
        })}
      </Text>
    </View>
  );
}
