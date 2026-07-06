import { Ionicons } from '@expo/vector-icons';
import { type PropsWithChildren, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

/**
 * Einklappbare Sektion. Kinder werden nur bei `open` gemountet → schwere
 * Paradigma-Tabellen (Erweiterte Formen) werden lazy berechnet.
 */
export function Accordion({
  title,
  subtitle,
  defaultOpen = false,
  className,
  children,
}: PropsWithChildren<{
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  className?: string;
}>) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View
      className={cn(
        'overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800',
        className,
      )}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((o) => !o)}
        className="flex-row items-center justify-between px-4 py-3"
      >
        <View className="flex-1">
          <Text className="font-sans-semibold">{title}</Text>
          {subtitle ? (
            <Text variant="caption" className="mt-0.5">
              {subtitle}
            </Text>
          ) : null}
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#77839A" />
      </Pressable>
      {open ? <View className="px-4 pb-3">{children}</View> : null}
    </View>
  );
}
