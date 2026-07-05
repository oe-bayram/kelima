import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets, type EdgeInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { QueryBoundary } from '@/components/ui/query-boundary';
import { Segmented } from '@/components/ui/segmented';
import { CardSkeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
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
import type { EntryRow, ExampleRow } from '@/lib/dataClient';
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
          <OverviewTab
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
              <ExamplesTab
                examples={examples}
                onSpeak={(s) => void speak(s)}
                noneLabel={t('card.noExamples')}
              />
            )}
          </QueryBoundary>
        ) : null}
        {tab === 'grammar' ? <GrammarTab entry={entry} /> : null}
      </ScrollView>
    </View>
  );
}

function OverviewTab({
  entry,
  status,
  chapterTitles,
}: {
  entry: EntryRow;
  status: ReturnType<typeof statusOf>;
  chapterTitles: string[];
}) {
  const { t } = useTranslation();
  return (
    <View className="gap-4">
      {entry.hinweis ? (
        <Card>
          <CardContent>
            <Text>{entry.hinweis}</Text>
          </CardContent>
        </Card>
      ) : null}
      <View className="gap-1">
        <Text variant="caption">{t('card.status')}</Text>
        <Badge
          className={STATUS_BG_CLASS[status]}
          textClassName="text-white"
          label={t(`status.${status}`)}
        />
      </View>
      {chapterTitles.length ? (
        <View className="gap-1">
          <Text variant="caption">{t('card.chapters')}</Text>
          {chapterTitles.map((title, i) => (
            <Text key={`${title}-${i}`}>{title}</Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function ExamplesTab({
  examples,
  onSpeak,
  noneLabel,
}: {
  examples: ExampleRow[];
  onSpeak: (text: string) => void;
  noneLabel: string;
}) {
  if (!examples.length) return <Text variant="caption">{noneLabel}</Text>;
  return (
    <View className="gap-3">
      {examples.map((ex) => (
        <View key={ex.id} className="flex-row items-start gap-2">
          <View className="flex-1">
            <Text className="font-semibold">{ex.textDe}</Text>
            {ex.textTr ? <Text variant="caption">{ex.textTr}</Text> : null}
          </View>
          <Pressable hitSlop={8} onPress={() => onSpeak(ex.textDe)}>
            <Ionicons name="volume-medium-outline" size={18} color="#9ca3af" />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

function GrammarField({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View className="flex-row justify-between gap-4 py-1">
      <Text variant="caption">{label}</Text>
      <Text className="flex-1 text-right">{value}</Text>
    </View>
  );
}

function GrammarTab({ entry }: { entry: EntryRow }) {
  const { t } = useTranslation('grammar');
  const badges: string[] = [];
  if (entry.trennbar) badges.push(t('badge.trennbar'));
  if (entry.reflexiv) badges.push(t('badge.reflexiv'));
  if (entry.nurPlural) badges.push(t('badge.nurPlural'));
  if (entry.unzaehlbar) badges.push(t('badge.unzaehlbar'));
  if (entry.steigerbar === false) badges.push(t('badge.nichtSteigerbar'));

  return (
    <Card>
      <CardContent className="gap-1">
        <GrammarField label={t('field.wortart')} value={t(`wortart.${entry.wortart}`)} />
        <GrammarField label={t('field.artikel')} value={entry.artikel} />
        <GrammarField label={t('field.plural')} value={entry.plural} />
        <GrammarField label={t('field.pluralOriginal')} value={entry.pluralOriginal} />
        <GrammarField label={t('field.hilfsverb')} value={entry.hilfsverb} />
        <GrammarField
          label={t('field.rektion')}
          value={entry.praepositionRektion || entry.verbRektion}
        />
        <GrammarField label={t('field.hauptwort')} value={entry.hauptwort} />
        <GrammarField label={t('section.weiblicheForm')} value={entry.femininForm} />
        {badges.length ? (
          <View className="mt-2 flex-row flex-wrap gap-2">
            {badges.map((b, i) => (
              <Badge key={`${b}-${i}`} variant="outline" label={b} />
            ))}
          </View>
        ) : null}
      </CardContent>
    </Card>
  );
}
