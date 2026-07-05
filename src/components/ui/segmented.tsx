import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

/** Pill-Umschalter mit gleich breiten Segmenten (4-Tab-Card-Switcher). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <View className={cn('flex-row rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800', className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            className={cn(
              'flex-1 items-center rounded-lg px-1 py-2',
              active && 'bg-white dark:bg-neutral-700',
            )}
          >
            <Text
              className={cn(
                'text-center text-sm',
                active
                  ? 'font-sans-semibold text-neutral-900 dark:text-white'
                  : 'text-neutral-500 dark:text-neutral-400',
              )}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
