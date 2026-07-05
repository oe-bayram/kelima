import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import type { ProgressLike } from '@/features/session/sessionLogic';
import { vocabStats } from '@/features/stats/statsLogic';
import type { EntryRow } from '@/lib/dataClient';
import type { VocabularyStatus } from '@/lib/enums';
import { STATUS_BG_CLASS } from '@/lib/vocab';

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between gap-4 py-0.5">
      <Text variant="caption">{label}</Text>
      <Text className="text-right">{value}</Text>
    </View>
  );
}

/** Übersichts-Sektion einer Vokabelkarte (Hinweis, Status, Lernstatistik, Kapitel). */
export function OverviewSection({
  entry,
  status,
  chapterTitles,
  progress,
}: {
  entry: EntryRow;
  status: VocabularyStatus;
  chapterTitles: string[];
  progress?: ProgressLike;
}) {
  const { t } = useTranslation();
  const stats = vocabStats(progress);
  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString() : t('stats.vocab.never');

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

      {stats.reviewed ? (
        <View className="gap-1">
          <Text variant="caption">{t('stats.vocab.title')}</Text>
          <Card>
            <CardContent className="gap-0.5">
              <StatRow label={t('stats.vocab.seen')} value={String(stats.seen)} />
              <StatRow label={t('stats.vocab.tested')} value={String(stats.tested)} />
              <StatRow label={t('stats.vocab.correct')} value={String(stats.correct)} />
              <StatRow label={t('stats.vocab.wrong')} value={String(stats.wrong)} />
              <StatRow label={t('stats.vocab.hard')} value={String(stats.hard)} />
              <StatRow
                label={t('stats.vocab.wrongRate')}
                value={`${Math.round(stats.wrongRate * 100)}%`}
              />
              <StatRow label={t('stats.vocab.lastTested')} value={fmtDate(stats.lastTestedAt)} />
              <StatRow label={t('stats.vocab.nextDue')} value={fmtDate(stats.dueAt)} />
            </CardContent>
          </Card>
        </View>
      ) : null}

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
