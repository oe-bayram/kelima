import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

/** Freundlicher Leerzustand: Icon + Titel + optionaler Untertitel/CTA. */
export function EmptyState({
  icon = 'sparkles-outline',
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="items-center justify-center gap-3 px-8 py-12">
      <Ionicons name={icon} size={44} color="#77839A" />
      <Text variant="subtitle" className="text-center">
        {title}
      </Text>
      {subtitle ? (
        <Text variant="caption" className="text-center">
          {subtitle}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} className="mt-2" />
      ) : null}
    </View>
  );
}
