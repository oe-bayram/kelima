import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import type { Rating } from '@/lib/enums';
import { cn } from '@/lib/utils';
import { STATUS_BG_CLASS } from '@/lib/vocab';

const RATINGS: Rating[] = ['nicht_gewusst', 'schwer', 'kann_ich', 'sicher'];

/** Vierstufige Bewertungsleiste (Farben = Status-Tokens). */
export function RatingBar({
  onRate,
  disabled,
}: {
  onRate: (rating: Rating) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <View className="flex-row gap-2">
      {RATINGS.map((rating) => (
        <Pressable
          key={rating}
          disabled={disabled}
          onPress={() => onRate(rating)}
          accessibilityRole="button"
          className={cn(
            'flex-1 items-center justify-center rounded-xl px-1 py-3',
            STATUS_BG_CLASS[rating],
            disabled && 'opacity-50',
          )}
        >
          <Text className="text-center text-xs font-sans-semibold text-white">
            {t(`status.${rating}`)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
