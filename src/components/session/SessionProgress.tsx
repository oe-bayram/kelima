import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Progress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';

/** Fortschrittsanzeige einer Session: „Karte x von y" + Balken. */
export function SessionProgress({ index, total }: { index: number; total: number }) {
  const { t } = useTranslation();
  return (
    <View className="gap-1">
      <Text variant="caption">{t('session.progress', { current: index + 1, total })}</Text>
      <Progress value={total > 0 ? index / total : 0} />
    </View>
  );
}
