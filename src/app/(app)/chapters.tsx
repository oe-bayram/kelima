import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';

export default function ChaptersScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-2">
        <Text variant="subtitle">{t('screens.chapters')}</Text>
        <Text variant="caption">{t('screens.comingSoon')}</Text>
      </View>
    </Screen>
  );
}
