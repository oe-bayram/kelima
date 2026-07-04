import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/lib/utils';

type ScreenProps = PropsWithChildren<{
  className?: string;
  /** Horizontales Standard-Padding (px-5). */
  padded?: boolean;
}>;

/**
 * Bildschirm-Wrapper mit Safe-Area-Insets und Theme-Hintergrund.
 * Insets werden per style gesetzt (zuverlässig), der Rest via NativeWind.
 */
export function Screen({ children, className, padded = true }: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className={cn('flex-1 bg-white dark:bg-neutral-950', padded && 'px-5', className)}
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {children}
    </View>
  );
}
