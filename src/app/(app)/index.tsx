import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';

/**
 * Start-/Dashboard-Screen – vollständig mit NativeWind (Tailwind) gestylt.
 * Zeigt die durchgängige Genus-Farbcodierung (der=blau, die=rot, das=grün).
 * Das eigentliche Dashboard folgt in Phase 3.
 */
export default function HomeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-white dark:bg-neutral-950"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="flex-1 items-center justify-center gap-3 px-6">
        <Text variant="title">{t('appName')}</Text>
        <Text variant="caption" className="text-center">
          {t('tagline')}
        </Text>

        <View className="mt-6 flex-row gap-2">
          <GenusBadge label="der" className="bg-genus-der" />
          <GenusBadge label="die" className="bg-genus-die" />
          <GenusBadge label="das" className="bg-genus-das" />
        </View>

        <Text variant="caption" className="mt-8 text-center">
          {t('home.placeholder')}
        </Text>
      </View>
    </View>
  );
}

function GenusBadge({ label, className }: { label: string; className: string }) {
  return (
    <View className={`rounded-full px-4 py-1.5 ${className}`}>
      <Text className="text-xs font-bold text-white">{label}</Text>
    </View>
  );
}
