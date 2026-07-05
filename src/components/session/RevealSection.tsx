import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';

/**
 * Ein zunächst verdeckter Karten-Abschnitt (Hide/Reveal). Der Elternteil
 * (`SessionCard`) hält den Reveal-Zustand, damit „Alles anzeigen" und das
 * Auto-Verdecken beim Kartenwechsel (via `key`) zentral funktionieren.
 */
export function RevealSection({
  title,
  revealLabel,
  revealed,
  onReveal,
  children,
}: {
  title: string;
  revealLabel: string;
  revealed: boolean;
  onReveal: () => void;
  children: ReactNode;
}) {
  return (
    <View className="gap-2">
      <Text variant="subtitle">{title}</Text>
      {revealed ? (
        children
      ) : (
        <Pressable
          onPress={onReveal}
          accessibilityRole="button"
          className="items-center rounded-xl border border-dashed border-neutral-300 py-4 dark:border-neutral-700"
        >
          <Text className="font-semibold text-brand">{revealLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}
