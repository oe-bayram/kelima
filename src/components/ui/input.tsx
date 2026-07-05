import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useState } from 'react';
import {
  Pressable,
  TextInput,
  type TextInputProps,
  useColorScheme,
  View,
} from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

type InputProps = TextInputProps & {
  label?: string;
  /** Fehlermeldung unter dem Feld; färbt zusätzlich den Rahmen. */
  error?: string;
  className?: string;
  containerClassName?: string;
};

/**
 * Beschriftetes Textfeld auf NativeWind-Basis. Bei `secureTextEntry` wird ein
 * Auge-Icon zum Ein-/Ausblenden des Passworts eingeblendet.
 */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, className, containerClassName, secureTextEntry, ...props },
  ref,
) {
  const scheme = useColorScheme();
  const [hidden, setHidden] = useState(true);
  const placeholderColor = scheme === 'dark' ? '#6b7280' : '#9ca3af';

  return (
    <View className={cn('gap-1.5', containerClassName)}>
      {label ? (
        <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</Text>
      ) : null}

      <View
        className={cn(
          'flex-row items-center rounded-xl border bg-white px-4 dark:bg-neutral-900',
          error
            ? 'border-status-nichtGewusst'
            : 'border-neutral-300 dark:border-neutral-700',
        )}
      >
        <TextInput
          ref={ref}
          placeholderTextColor={placeholderColor}
          secureTextEntry={secureTextEntry ? hidden : false}
          className={cn('flex-1 py-3 text-base text-neutral-900 dark:text-neutral-100', className)}
          {...props}
        />

        {secureTextEntry ? (
          <Pressable
            onPress={() => setHidden((value) => !value)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Passwort anzeigen' : 'Passwort verbergen'}
            hitSlop={8}
            className="pl-2"
          >
            <Ionicons
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={placeholderColor}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? <Text className="text-sm text-status-nichtGewusst">{error}</Text> : null}
    </View>
  );
});
