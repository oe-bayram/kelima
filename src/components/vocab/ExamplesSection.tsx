import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import type { ExampleRow } from '@/lib/dataClient';

/** Beispielsätze mit TTS-Button je Satz. */
export function ExamplesSection({
  examples,
  onSpeak,
  noneLabel,
}: {
  examples: ExampleRow[];
  onSpeak: (text: string) => void;
  noneLabel: string;
}) {
  if (!examples.length) return <Text variant="caption">{noneLabel}</Text>;
  return (
    <View className="gap-3">
      {examples.map((ex) => (
        <View key={ex.id} className="flex-row items-start gap-2">
          <View className="flex-1">
            <Text className="font-sans-semibold">{ex.textDe}</Text>
            {ex.textTr ? <Text variant="caption">{ex.textTr}</Text> : null}
          </View>
          <Pressable hitSlop={8} onPress={() => onSpeak(ex.textDe)}>
            <Ionicons name="volume-medium-outline" size={18} color="#8A867A" />
          </Pressable>
        </View>
      ))}
    </View>
  );
}
