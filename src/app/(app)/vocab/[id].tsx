import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets, type EdgeInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { QueryBoundary } from '@/components/ui/query-boundary';
import { Segmented } from '@/components/ui/segmented';
import { CardSkeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { ExamplesSection } from '@/components/vocab/ExamplesSection';
import { GrammarSection } from '@/components/vocab/GrammarSection';
import { OverviewSection } from '@/components/vocab/OverviewSection';
import { FormsTab } from '@/components/vocab/paradigm/FormsTab';
import {
  useChapterMemberships,
  useChapters,
  useExamples,
  useForms,
  useVocabEntry,
} from '@/hooks/content';
import { useTts } from '@/hooks/useTts';
import { useFavorites, useProgressMap, useToggleFavorite } from '@/hooks/userData';
import type { EntryRow } from '@/lib/dataClient';
import { cn } from '@/lib/utils';
import { genusOf, GENUS_TEXT_CLASS, STATUS_BG_CLASS, statusOf } from '@/lib/vocab';

type TabKey = 'overview' | 'forms' | 'examples' | 'grammar';

export default function VocabCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const entryQ = useVocabEntry(id ?? '');
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabKey>('overview');

  return (
    <View className="flex-1 bg-white dark:bg-neutral-950" style={{ paddingTop: insets.top }}>
      <QueryBoundary query={entryQ} loading={<CardSkeleton />}>
        {(entry) =>
          entry ? (
            <CardBody entry={entry} tab={tab} setTab={setTab} insets={insets} />
          ) : (
            <Text className="p-6">{t('errors.loadFailed')}</Text>
          )
        }
      </QueryBoundary>
    </View>
  );
}

function CardBody({
  entry,
  tab,
  setTab,
  insets,
}: {
  entry: EntryRow;
  tab: TabKey;
  setTab: (t: TabKey) => void;
  insets: EdgeInsets;
}) {
  const { t } = useTranslation();
  const { t: tg } = useTranslation('grammar');
  const formsQ = useForms(entry.id);
  const examplesQ = useExamples(entry.id);
  const favQ = useFavorites();
  const toggleFav = useToggleFavorite();
  const progressQ = useProgressMap();
  const membershipsQ = useChapterMemberships();
  const chaptersQ = useChapters();
  const { speak } = useTts();

  const genus = genusOf(entry);
  const status = statusOf(progressQ.data?.get(entry.id));
  const isFav = !!favQ.data?.ids.has(entry.id);
  const displayLemma = `${entry.artikel ? `${entry.artikel} ` : ''}${entry.lemma}`;

  const tabs = [
    { value: 'overview' as const, label: t('card.tabsOverview') },
    { value: 'forms' as const, label: t('card.tabsForms') },
    { value: 'examples' as const, label: t('card.tabsExamples') },
    { value: 'grammar' as const, label: t('card.tabsGrammar') },
  ];

  return (
    <View className="flex-1">
      <View className="gap-1 px-4 pb-3">
        <View className="flex-row items-start gap-2">
          <Text
            className={cn('flex-1 text-2xl font-bold', genus ? GENUS_TEXT_CLASS[genus] : undefined)}
          >
            {displayLemma}
          </Text>
          <Pressable
            hitSlop={8}
            onPress={() =>
              toggleFav.mutate({
                entryId: entry.id,
                isFav,
                favId: favQ.data?.recordByEntry.get(entry.id),
              })
            }
          >
            <Ionicons
              name={isFav ? 'star' : 'star-outline'}
              size={24}
              color={isFav ? '#f59e0b' : '#9ca3af'}
            />
          </Pressable>
          <Pressable hitSlop={8} onPress={() => void speak(displayLemma)}>
            <Ionicons name="volume-medium-outline" size={24} color="#9ca3af" />
          </Pressable>
        </View>
        {entry.translationTr ? (
          <Text className="text-neutral-600 dark:text-neutral-300">{entry.translationTr}</Text>
        ) : null}
        <View className="mt-1 flex-row items-center gap-2">
          <Badge label={tg(`wortart.${entry.wortart}`)} />
          <Badge
            className={STATUS_BG_CLASS[status]}
            textClassName="text-white"
            label={t(`status.${status}`)}
          />
        </View>
      </View>

      <View className="px-4 pb-2">
        <Segmented options={tabs} value={tab} onChange={setTab} />
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {tab === 'overview' ? (
          <OverviewSection
            entry={entry}
            status={status}
            chapterTitles={(membershipsQ.data?.byEntry.get(entry.id) ?? [])
              .map((cid) => chaptersQ.data?.find((c) => c.id === cid)?.title)
              .filter((x): x is string => !!x)}
          />
        ) : null}
        {tab === 'forms' ? (
          <QueryBoundary query={formsQ}>
            {(forms) => <FormsTab entry={entry} forms={forms} />}
          </QueryBoundary>
        ) : null}
        {tab === 'examples' ? (
          <QueryBoundary query={examplesQ}>
            {(examples) => (
              <ExamplesSection
                examples={examples}
                onSpeak={(s) => void speak(s)}
                noneLabel={t('card.noExamples')}
              />
            )}
          </QueryBoundary>
        ) : null}
        {tab === 'grammar' ? <GrammarSection entry={entry} /> : null}
      </ScrollView>
    </View>
  );
}

