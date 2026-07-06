import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useTts } from '@/hooks/useTts';
import { cn } from '@/lib/utils';

/** Atomare Formen-Zeile: (optionales Label) Form + optionale TR + TTS-Button. */
export function FormRow({
  label,
  form,
  translationTr,
  className,
}: {
  label?: string;
  form: string;
  translationTr?: string | null;
  className?: string;
}) {
  const { speak } = useTts();
  return (
    <View className={cn('flex-row items-center gap-3 py-1.5', className)}>
      {label ? (
        <Text variant="caption" className="w-24 shrink-0">
          {label}
        </Text>
      ) : null}
      <View className="flex-1">
        <Text className="text-base">{form}</Text>
        {translationTr ? <Text variant="caption">{translationTr}</Text> : null}
      </View>
      <Pressable
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => void speak(form)}
        className="p-1"
      >
        <Ionicons name="volume-medium-outline" size={18} color="#77839A" />
      </Pressable>
    </View>
  );
}
