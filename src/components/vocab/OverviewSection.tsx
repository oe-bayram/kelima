import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import type { EntryRow } from '@/lib/dataClient';
import type { VocabularyStatus } from '@/lib/enums';
import { STATUS_BG_CLASS } from '@/lib/vocab';

/** Übersichts-Sektion einer Vokabelkarte (Hinweis, Status, Kapitel). */
export function OverviewSection({
  entry,
  status,
  chapterTitles,
}: {
  entry: EntryRow;
  status: VocabularyStatus;
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
