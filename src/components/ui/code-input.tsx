import { useRef, useState } from 'react';
import { TextInput, type TextInputProps, View } from 'react-native';

import { cn } from '@/lib/utils';

type KeyPressEvent = Parameters<NonNullable<TextInputProps['onKeyPress']>>[0];

type CodeInputProps = {
  value: string;
  onChangeText: (code: string) => void;
  /** Anzahl der Ziffern (Standard 6). */
  length?: number;
  autoFocus?: boolean;
  /** Färbt alle Felder rot. */
  error?: boolean;
  editable?: boolean;
};

/**
 * Segmentierte Bestätigungscode-Eingabe (Cognito E-Mail-/Reset-Codes) nach dem
 * Design-System: Ziffern springen automatisch weiter, Backspace geht zurück,
 * eingefügte Codes verteilen sich auf alle Felder. Nur Ziffern, Mono-Optik.
 */
export function CodeInput({
  value,
  onChangeText,
  length = 6,
  autoFocus = false,
  error = false,
  editable = true,
}: CodeInputProps) {
  const refs = useRef<(TextInput | null)[]>([]);
  const [focusIdx, setFocusIdx] = useState(-1);
  const chars = Array.from({ length }, (_, i) => value[i] ?? '');

  const handleChange = (i: number, text: string) => {
    const digits = text.replace(/\D/g, '');
    const next = chars.slice();
    if (!digits) {
      next[i] = '';
      onChangeText(next.join(''));
      return;
    }
    let p = i;
    for (const d of digits) {
      if (p >= length) break;
      next[p] = d;
      p++;
    }
    onChangeText(next.join('').slice(0, length));
    const last = Math.min(i + digits.length, length - 1);
    refs.current[last]?.focus();
  };

  const handleKeyPress = (i: number, e: KeyPressEvent) => {
    if (e.nativeEvent.key === 'Backspace' && !chars[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  return (
    <View className="flex-row gap-2">
      {chars.map((c, i) => (
        <TextInput
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={c}
          editable={editable}
          onChangeText={(text) => handleChange(i, text)}
          onKeyPress={(e) => handleKeyPress(i, e)}
          onFocus={() => setFocusIdx(i)}
          onBlur={() => setFocusIdx(-1)}
          keyboardType="number-pad"
          maxLength={i === 0 ? length : 1}
          autoFocus={autoFocus && i === 0}
          textContentType="oneTimeCode"
          autoComplete={i === 0 ? 'sms-otp' : 'off'}
          accessibilityLabel={`Ziffer ${i + 1}`}
          className={cn(
            'h-14 flex-1 rounded-xl border-[1.5px] bg-white text-center text-2xl font-mono-bold text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100',
            error
              ? 'border-status-nichtGewusst'
              : focusIdx === i
                ? 'border-primary-500'
                : 'border-neutral-300 dark:border-neutral-700',
          )}
        />
      ))}
    </View>
  );
}
