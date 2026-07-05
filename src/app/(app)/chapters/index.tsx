import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Progress } from '@/components/ui/progress';
import { QueryBoundary } from '@/components/ui/query-boundary';
import { Text } from '@/components/ui/text';
import { useChapterMemberships, useChapters } from '@/hooks/content';
import { useProgressMap } from '@/hooks/userData';
import type { ChapterRow } from '@/lib/dataClient';
import { isLearned, statusOf } from '@/lib/vocab';

type Row = { type: 'header'; title: string } | { type: 'chapter'; chapter: ChapterRow };

function ChapterRowItem({
  chapter,
  progress,
  typeLabel,
  wordsLabel,
}: {
  chapter: ChapterRow;
  progress: number;
  typeLabel: string;
  wordsLabel: string;
}) {
  return (
    <Pressable
      testID="chapter-row"
      onPress={() => router.push({ pathname: '/chapters/[id]', params: { id: chapter.id } })}
      className="mx-4 my-1 gap-2 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800"
    >
      <View className="flex-row items-center justify-between gap-2">
        <Text className="flex-1 font-semibold">{chapter.title}</Text>
        <Badge variant="outline" label={typeLabel} />
      </View>
      {chapter.titleTr ? <Text variant="caption">{chapter.titleTr}</Text> : null}
      <View className="flex-row items-center gap-3">
        <Progress value={progress} className="flex-1" />
        <Text variant="caption">{wordsLabel}</Text>
      </View>
    </Pressable>
  );
}

export default function ChaptersScreen() {
  const { t } = useTranslation();
  const chaptersQ = useChapters();
  const membershipsQ = useChapterMemberships();
  const progressQ = useProgressMap();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white dark:bg-neutral-950" style={{ paddingTop: insets.top }}>
      <QueryBoundary query={chaptersQ}>
        {(chapters) => {
          const wortgruppen = chapters.filter((c) => c.chapterType === 'wortgruppe');
          const auto = chapters.filter((c) => c.chapterType !== 'wortgruppe');
          const rows: Row[] = [];
          if (wortgruppen.length) {
            rows.push({ type: 'header', title: t('chapters.sectionWordgroups') });
            wortgruppen.forEach((c) => rows.push({ type: 'chapter', chapter: c }));
          }
          if (auto.length) {
            rows.push({ type: 'header', title: t('chapters.sectionLessons') });
            auto.forEach((c) => rows.push({ type: 'chapter', chapter: c }));
          }
          const stickyHeaderIndices = rows
            .map((r, i) => (r.type === 'header' ? i : -1))
            .filter((i) => i >= 0);

          const progressFor = (c: ChapterRow) => {
            const ids = membershipsQ.data?.byChapter.get(c.id)?.map((m) => m.entryId) ?? [];
            if (!ids.length) return 0;
            const learned = ids.filter((id) => isLearned(statusOf(progressQ.data?.get(id)))).length;
            return learned / ids.length;
          };

          return (
            <FlashList
              data={rows}
              keyExtractor={(r) => (r.type === 'header' ? `h-${r.title}` : r.chapter.id)}
              getItemType={(r) => r.type}
              stickyHeaderIndices={stickyHeaderIndices}
              contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
              ListEmptyComponent={
                <EmptyState
                  icon="library-outline"
                  title={t('empty.chaptersTitle')}
                  subtitle={t('empty.chaptersSubtitle')}
                />
              }
              renderItem={({ item }) =>
                item.type === 'header' ? (
                  <Text
                    variant="caption"
                    className="bg-white px-4 py-2 font-semibold uppercase dark:bg-neutral-950"
                  >
                    {item.title}
                  </Text>
                ) : (
                  <ChapterRowItem
                    chapter={item.chapter}
                    progress={progressFor(item.chapter)}
                    typeLabel={
                      item.chapter.chapterType === 'wortgruppe'
                        ? t('chapters.typeWortgruppe')
                        : t('chapters.typeAuto')
                    }
                    wordsLabel={t('chapters.words', { count: item.chapter.memberCount ?? 0 })}
                  />
                )
              }
            />
          );
        }}
      </QueryBoundary>
    </View>
  );
}
