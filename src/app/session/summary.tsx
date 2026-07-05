import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { dispatchOp } from '@/features/session/outbox';
import { buildSessionCreateInput } from '@/features/session/sessionApi';
import { buildQueue } from '@/features/session/sessionLogic';
import { useSessionStore } from '@/features/session/useSessionStore';
import { useVocabEntry } from '@/hooks/content';
import type { Rating } from '@/lib/enums';
import { cn } from '@/lib/utils';
import { genusOf, GENUS_TEXT_CLASS, STATUS_BG_CLASS } from '@/lib/vocab';

const RATINGS: Rating[] = ['nicht_gewusst', 'schwer', 'kann_ich', 'sicher'];

function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

/** Zusammenfassung nach einer Session: Zähler, Dauer, schwache Wörter. */
export default function SummaryScreen() {
  const { t } = useTranslation();
  const ratings = useSessionStore((s) => s.ratings);
  const startedAt = useSessionStore((s) => s.startedAt);
  const endedAt = useSessionStore((s) => s.endedAt);
  const start = useSessionStore((s) => s.start);
  const reset = useSessionStore((s) => s.reset);

  const counts = RATINGS.reduce<Record<Rating, number>>(
    (acc, r) => ({ ...acc, [r]: 0 }),
    { nicht_gewusst: 0, schwer: 0, kann_ich: 0, sicher: 0 },
  );
  for (const r of Object.values(ratings)) counts[r] += 1;
  const weakIds = Object.entries(ratings)
    .filter(([, r]) => r === 'nicht_gewusst' || r === 'schwer')
    .map(([id]) => id);

  const durationMs =
    startedAt && endedAt ? new Date(endedAt).getTime() - new Date(startedAt).getTime() : 0;

  const goHome = () => {
    reset();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const repeatWeak = () => {
    if (!weakIds.length) return;
    const sessionId = start({
      type: 'lernen',
      source: 'problem',
      sourceLabel: t('session.source.problem'),
      queue: buildQueue(weakIds, 0),
    });
    void dispatchOp({
      key: `sessionCreate:${sessionId}`,
      kind: 'sessionCreate',
      input: buildSessionCreateInput({ sessionId, type: 'lernen', startedAt: Date.now() }),
    }).catch(() => {});
    router.replace('/session/learn');
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingVertical: 16 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          <Text variant="title">{t('session.summary.title')}</Text>

          <View className="flex-row flex-wrap gap-2">
            {RATINGS.map((r) => (
              <View
                key={r}
                className={cn('flex-row items-center gap-2 rounded-full px-3 py-1.5', STATUS_BG_CLASS[r])}
              >
                <Text className="text-sm font-sans-semibold text-white">{t(`status.${r}`)}</Text>
                <Text className="text-sm font-sans-bold text-white">{counts[r]}</Text>
              </View>
            ))}
          </View>

          <View className="flex-row justify-between">
            <Text variant="caption">{t('session.summary.duration')}</Text>
            <Text className="font-sans-semibold">{formatDuration(durationMs)}</Text>
          </View>

          <View className="gap-2">
            <Text variant="subtitle">{t('session.summary.weakWords')}</Text>
            {weakIds.length ? (
              weakIds.map((id) => <WeakWordRow key={id} entryId={id} />)
            ) : (
              <Text variant="caption">{t('session.summary.noWeak')}</Text>
            )}
          </View>

          <View className="gap-3 pt-2">
            {weakIds.length ? (
              <Button label={t('session.summary.again')} onPress={repeatWeak} />
            ) : null}
            <Button variant="secondary" label={t('session.summary.done')} onPress={goHome} />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function WeakWordRow({ entryId }: { entryId: string }) {
  const entryQ = useVocabEntry(entryId);
  const entry = entryQ.data;
  if (!entry) return null;
  const genus = genusOf(entry);
  const displayLemma = `${entry.artikel ? `${entry.artikel} ` : ''}${entry.lemma}`;
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/vocab/[id]', params: { id: entry.id } })}
      className="flex-row items-center justify-between gap-2 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800"
    >
      <Text className={cn('font-sans-medium', genus ? GENUS_TEXT_CLASS[genus] : undefined)}>
        {displayLemma}
      </Text>
      {entry.translationTr ? <Text variant="caption">{entry.translationTr}</Text> : null}
    </Pressable>
  );
}
