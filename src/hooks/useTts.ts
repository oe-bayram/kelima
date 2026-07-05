import * as Speech from 'expo-speech';
import { useCallback, useEffect, useRef } from 'react';

import { useSettingsStore } from '@/features/settings/useSettingsStore';

/**
 * TTS-Wrapper (expo-speech). Re-Tap desselben Textes stoppt (Toggle), Tap eines
 * anderen Textes stoppt+startet neu; stoppt beim Unmount. Rate aus den Settings.
 */
export function useTts() {
  const rate = useSettingsStore((s) => s.ttsRate);
  const speakingRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      void Speech.stop();
    };
  }, []);

  const speak = useCallback(
    async (text: string, language: 'de-DE' | 'tr-TR' = 'de-DE') => {
      const wasSpeaking = await Speech.isSpeakingAsync();
      if (wasSpeaking) {
        await Speech.stop();
        if (speakingRef.current === text) {
          speakingRef.current = null;
          return; // gleicher Text → nur stoppen (Toggle)
        }
      }
      speakingRef.current = text;
      Speech.speak(text, {
        language,
        rate,
        onDone: () => {
          if (speakingRef.current === text) speakingRef.current = null;
        },
        onError: () => {
          speakingRef.current = null;
        },
      });
    },
    [rate],
  );

  const stop = useCallback(() => {
    void Speech.stop();
    speakingRef.current = null;
  }, []);

  return { speak, stop };
}
