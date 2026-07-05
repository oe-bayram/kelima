import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Segmented, type SegmentedOption } from '@/components/ui/segmented';
import { Text } from '@/components/ui/text';
import { dispatchOp } from '@/features/session/outbox';
import { buildSessionCreateInput } from '@/features/session/sessionApi';
import { buildQueue } from '@/features/session/sessionLogic';
import { useSessionStore } from '@/features/session/useSessionStore';
import type { SessionType } from '@/lib/enums';

export interface StartConfig {
  /** Bereits vom Aufrufer aufgelöste Kandidaten-entryIds. */
  candidateIds: string[];
  /** Menschlich lesbares Quellen-Label (Titel + für die Zusammenfassung). */
  label: string;
  /** Optionale Kapitel-ID (für die LearningSession-Metadaten). */
  chapterId?: string;
}

export interface StartSheetHandle {
  present: (config: StartConfig) => void;
}

/** Segmented ist auf `string` beschränkt → Count-Werte als Strings ('all' = ohne Limit). */
type CountValue = string;
const COUNT_STEPS = [10, 20, 50];

/**
 * Start-Dialog (Bottom Sheet): wählt Anzahl und Lernen/Testen. Die Quelle
 * (Kandidaten) kommt fertig vom Aufrufer (Dashboard/Kapitel), damit dort die
 * vorhandenen Filter/Daten wiederverwendet werden.
 */
export const StartSheet = forwardRef<StartSheetHandle>(function StartSheet(_props, ref) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const modalRef = useRef<BottomSheetModal>(null);
  const [config, setConfig] = useState<StartConfig | null>(null);
  const [count, setCount] = useState<CountValue>('all');
  const start = useSessionStore((s) => s.start);

  useImperativeHandle(
    ref,
    () => ({
      present: (cfg) => {
        setConfig(cfg);
        setCount('all');
        modalRef.current?.present();
      },
    }),
    [],
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
    ),
    [],
  );

  const total = config?.candidateIds.length ?? 0;
  const countOptions: SegmentedOption<CountValue>[] = [
    ...COUNT_STEPS.filter((c) => c < total).map((c) => ({ value: String(c), label: String(c) })),
    { value: 'all', label: t('session.countAll') },
  ];

  const onStart = (type: SessionType) => {
    if (!config) return;
    const limit = count === 'all' ? 0 : Number(count);
    const queue = buildQueue(config.candidateIds, limit);
    if (!queue.length) return;
    const sessionId = start({
      type,
      source: config.chapterId ? `chapter:${config.chapterId}` : 'mixed',
      sourceLabel: config.label,
      queue,
    });
    modalRef.current?.dismiss();
    void dispatchOp({
      key: `sessionCreate:${sessionId}`,
      kind: 'sessionCreate',
      input: buildSessionCreateInput({ sessionId, type, chapterId: config.chapterId, startedAt: Date.now() }),
    }).catch(() => {
      /* Offline: liegt in der Outbox; Bewertungen laufen lokal weiter. */
    });
    router.push(type === 'lernen' ? '/session/learn' : '/session/test');
  };

  return (
    <BottomSheetModal
      ref={modalRef}
      enableDynamicSizing
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: scheme === 'dark' ? '#0a0a0a' : '#ffffff' }}
      handleIndicatorStyle={{ backgroundColor: scheme === 'dark' ? '#525252' : '#d4d4d4' }}
    >
      <BottomSheetView style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 32 }}>
        <View className="gap-5">
          <View className="gap-1">
            <Text variant="subtitle">{config?.label}</Text>
            <Text variant="caption">{t('session.wordsAvailable', { count: total })}</Text>
          </View>

          {total > 0 ? (
            <>
              <View className="gap-2">
                <Text variant="caption">{t('session.count')}</Text>
                <Segmented options={countOptions} value={count} onChange={setCount} />
              </View>

              <View className="flex-row gap-3">
                <Button
                  className="flex-1"
                  label={t('session.learn')}
                  onPress={() => onStart('lernen')}
                />
                <Button
                  className="flex-1"
                  variant="secondary"
                  label={t('session.test')}
                  onPress={() => onStart('test')}
                />
              </View>
            </>
          ) : (
            <Text variant="caption">{t('session.empty')}</Text>
          )}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});
