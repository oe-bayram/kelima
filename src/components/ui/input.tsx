import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useState } from 'react';
import { Pressable, TextInput, type TextInputProps, useColorScheme, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

type InputProps = TextInputProps & {
  label?: string;
  /** Fehlermeldung unter dem Feld; färbt zusätzlich den Rahmen. */
  error?: string;
  /** Optionales Ionicons-Symbol am Feldanfang (z. B. "mail-outline"). */
  iconLeft?: keyof typeof Ionicons.glyphMap;
  className?: string;
  containerClassName?: string;
};

/**
 * Beschriftetes Textfeld nach dem Design-System: warmer Rahmen, 1,5px, der bei
 * Fokus auf Pinien-Grün wechselt. Bei `secureTextEntry` erscheint ein Auge-Icon
 * zum Ein-/Ausblenden. `iconLeft` rendert ein führendes Symbol.
 */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, iconLeft, className, containerClassName, secureTextEntry, onFocus, onBlur, ...props },
  ref,
) {
  const scheme = useColorScheme();
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);
  const placeholderColor = scheme === 'dark' ? '#5C5F57' : '#B0AC9C';
  const iconColor = scheme === 'dark' ? '#8A8D83' : '#8A867A';

  const handleFocus: NonNullable<TextInputProps['onFocus']> = (e) => {
    setFocused(true);
    onFocus?.(e);
  };
  const handleBlur: NonNullable<TextInputProps['onBlur']> = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <View className={cn('gap-1.5', containerClassName)}>
      {label ? (
        <Text className="text-sm font-sans-medium text-neutral-600 dark:text-neutral-300">{label}</Text>
      ) : null}

      <View
        className={cn(
          'h-[50px] flex-row items-center rounded-xl border-[1.5px] bg-white px-3.5 dark:bg-neutral-900',
          error
            ? 'border-status-nichtGewusst'
            : focused
              ? 'border-primary-500'
              : 'border-neutral-300 dark:border-neutral-700',
        )}
      >
        {iconLeft ? (
          <Ionicons name={iconLeft} size={18} color={iconColor} style={{ marginRight: 10 }} />
        ) : null}

        <TextInput
          ref={ref}
          placeholderTextColor={placeholderColor}
          secureTextEntry={secureTextEntry ? hidden : false}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn('flex-1 text-base text-neutral-900 dark:text-neutral-100', className)}
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
              color={iconColor}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? <Text className="text-sm text-status-nichtGewusst">{error}</Text> : null}
    </View>
  );
});
