import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StartSheet, type StartSheetHandle } from '@/components/session/StartSheet';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { QueryBoundary } from '@/components/ui/query-boundary';
import { Text } from '@/components/ui/text';
import { useChapterEntries } from '@/hooks/content';
import { useFavorites, useProgressMap, useToggleFavorite } from '@/hooks/userData';
import type { EntryRow } from '@/lib/dataClient';
import type { VocabularyStatus } from '@/lib/enums';
import { cn } from '@/lib/utils';
import {
  genusOf,
  GENUS_TEXT_CLASS,
  isDue,
  normalizeSearch,
  STATUS_BG_CLASS,
  statusOf,
  WORTART_ABBR,
} from '@/lib/vocab';

type FilterKey = 'all' | VocabularyStatus | 'faellig' | 'favoriten';

function EntryRowItem({
  entry,
  status,
  isFav,
  onToggleFav,
}: {
  entry: EntryRow;
  status: VocabularyStatus;
  isFav: boolean;
  onToggleFav: () => void;
}) {
  const genus = genusOf(entry);
  return (
    <Pressable
      testID="entry-row"
      onPress={() => router.push({ pathname: '/vocab/[id]', params: { id: entry.id } })}
      className="mx-4 my-1 flex-row items-center gap-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800"
    >
      <View className="flex-1">
        <Text className={cn('text-base font-sans-medium', genus ? GENUS_TEXT_CLASS[genus] : undefined)}>
          {entry.artikel ? `${entry.artikel} ` : ''}
          {entry.lemma}
        </Text>
        {entry.translationTr ? <Text variant="caption">{entry.translationTr}</Text> : null}
      </View>
      <Text variant="caption">{WORTART_ABBR[entry.wortart]}</Text>
      <View className={cn('h-2.5 w-2.5 rounded-full', STATUS_BG_CLASS[status])} />
      <Pressable hitSlop={8} onPress={onToggleFav} accessibilityRole="button">
        <Ionicons
          name={isFav ? 'star' : 'star-outline'}
          size={20}
          color={isFav ? '#2CAF88' : '#77839A'}
        />
      </Pressable>
    </Pressable>
  );
}

export default function ChapterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const entriesQ = useChapterEntries(id ?? '');
  const progressQ = useProgressMap();
  const favQ = useFavorites();
  const toggleFav = useToggleFavorite();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');
  const sheetRef = useRef<StartSheetHandle>(null);

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: t('filter.all') },
    { key: 'neu', label: t('filter.neu') },
    { key: 'nicht_gewusst', label: t('filter.nichtGewusst') },
    { key: 'schwer', label: t('filter.schwer') },
    { key: 'kann_ich', label: t('filter.kannIch') },
    { key: 'sicher', label: t('filter.sicher') },
    { key: 'faellig', label: t('filter.faellig') },
    { key: 'favoriten', label: t('filter.favoriten') },
  ];

  const entries = entriesQ.data ?? [];
  const q = normalizeSearch(search.trim());
  const filtered = entries.filter((e) => {
    const prog = progressQ.data?.get(e.id);
    const st = statusOf(prog);
    if (filter === 'faellig') {
      if (!isDue(prog)) return false;
    } else if (filter === 'favoriten') {
      if (!favQ.data?.ids.has(e.id)) return false;
    } else if (filter !== 'all' && st !== filter) {
      return false;
    }
    if (
      q &&
      !normalizeSearch(e.lemma).includes(q) &&
      !normalizeSearch(e.translationTr ?? '').includes(q)
    ) {
      return false;
    }
    return true;
  });

  const emptyState =
    filter === 'favoriten' ? (
      <EmptyState
        icon="star-outline"
        title={t('empty.favoritesTitle')}
        subtitle={t('empty.favoritesSubtitle')}
      />
    ) : filter === 'faellig' ? (
      <EmptyState
        icon="checkmark-done-outline"
        title={t('empty.dueTitle')}
        subtitle={t('empty.dueSubtitle')}
      />
    ) : (
      <EmptyState icon="search-outline" title={t('chapters.empty')} />
    );

  return (
    <View className="flex-1 bg-white dark:bg-neutral-950" style={{ paddingTop: insets.top }}>
      <View className="gap-2 px-4 pb-2 pt-2">
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t('filter.search')}
          placeholderTextColor="#77839A"
          autoCapitalize="none"
          className="rounded-xl border border-neutral-300 px-3 py-2 text-base text-neutral-900 dark:border-neutral-700 dark:text-white"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 pr-4"
        >
          {filters.map((f) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                className={cn(
                  'rounded-full border px-3 py-1',
                  active ? 'border-brand bg-brand' : 'border-neutral-300 dark:border-neutral-700',
                )}
              >
                <Text className={cn('text-sm', active ? 'font-sans-semibold text-white' : undefined)}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <QueryBoundary query={entriesQ}>
        {() => (
          <FlashList
            data={filtered}
            keyExtractor={(e) => e.id}
            contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
            ListEmptyComponent={emptyState}
            renderItem={({ item }) => {
              const isFav = !!favQ.data?.ids.has(item.id);
              return (
                <EntryRowItem
                  entry={item}
                  status={statusOf(progressQ.data?.get(item.id))}
                  isFav={isFav}
                  onToggleFav={() =>
                    toggleFav.mutate({
                      entryId: item.id,
                      isFav,
                      favId: favQ.data?.recordByEntry.get(item.id),
                    })
                  }
                />
              );
            }}
          />
        )}
      </QueryBoundary>

      <View
        className="absolute inset-x-0 bottom-0 border-t border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950"
        style={{ paddingBottom: insets.bottom + 8 }}
      >
        <Button
          label={t('session.start')}
          disabled={!filtered.length}
          onPress={() =>
            sheetRef.current?.present({
              candidateIds: filtered.map((e) => e.id),
              label: t('session.source.chapter'),
              chapterId: id,
            })
          }
        />
      </View>

      <StartSheet ref={sheetRef} />
    </View>
  );
}
