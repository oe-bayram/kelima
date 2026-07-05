import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RatingBar } from '@/components/session/RatingBar';
import { SessionCard } from '@/components/session/SessionCard';
import { SessionProgress } from '@/components/session/SessionProgress';
import { useSessionRunner } from '@/features/session/useSessionRunner';

/** Lernsession: Karte mit Hide/Reveal + Bewertungsleiste. */
export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const { currentId, index, total, submit, done } = useSessionRunner();

  if (done || !currentId) return null;

  return (
    <View className="flex-1 bg-white dark:bg-neutral-950" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-3 px-4 pb-2 pt-1">
        <Pressable hitSlop={8} onPress={() => router.back()} accessibilityRole="button">
          <Ionicons name="close" size={26} color="#8A867A" />
        </Pressable>
        <View className="flex-1">
          <SessionProgress index={index} total={total} />
        </View>
      </View>

      <View className="flex-1 px-4">
        <SessionCard key={currentId} entryId={currentId} />
      </View>

      <View
        className="border-t border-neutral-200 px-4 pt-3 dark:border-neutral-800"
        style={{ paddingBottom: insets.bottom + 8 }}
      >
        <RatingBar onRate={submit} />
      </View>
    </View>
  );
}
