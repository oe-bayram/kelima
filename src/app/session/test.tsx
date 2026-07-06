import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RatingBar } from '@/components/session/RatingBar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QueryBoundary } from '@/components/ui/query-boundary';
import { CardSkeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { ExamplesSection } from '@/components/vocab/ExamplesSection';
import { GrammarSection } from '@/components/vocab/GrammarSection';
import { FormsTab } from '@/components/vocab/paradigm/FormsTab';
import { SessionProgress } from '@/components/session/SessionProgress';
import { useSessionRunner } from '@/features/session/useSessionRunner';
import { useExamples, useForms, useVocabEntry } from '@/hooks/content';
import { useTts } from '@/hooks/useTts';
import type { Rating } from '@/lib/enums';
import { cn } from '@/lib/utils';
import { genusOf, GENUS_TEXT_CLASS } from '@/lib/vocab';

/** Testsession: Prüferansicht — nur Lemma, dann „Antwort anzeigen" → Bewertung. */
export default function TestScreen() {
  const insets = useSafeAreaInsets();
  const { currentId, index, total, submit, done } = useSessionRunner();

  if (done || !currentId) return null;

  return (
    <View className="flex-1 bg-white dark:bg-neutral-950" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-3 px-4 pb-2 pt-1">
        <Pressable hitSlop={8} onPress={() => router.back()} accessibilityRole="button">
          <Ionicons name="close" size={26} color="#77839A" />
        </Pressable>
        <View className="flex-1">
          <SessionProgress index={index} total={total} />
        </View>
      </View>

      <TestQuestion key={currentId} entryId={currentId} onRate={submit} bottomInset={insets.bottom} />
    </View>
  );
}

function TestQuestion({
  entryId,
  onRate,
  bottomInset,
}: {
  entryId: string;
  onRate: (rating: Rating) => void;
  bottomInset: number;
}) {
  const { t } = useTranslation();
  const { t: tg } = useTranslation('grammar');
  const entryQ = useVocabEntry(entryId);
  const formsQ = useForms(entryId);
  const examplesQ = useExamples(entryId);
  const { speak } = useTts();
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <QueryBoundary query={entryQ} loading={<CardSkeleton />}>
      {(entry) => {
        if (!entry) return null;
        const genus = genusOf(entry);
        const displayLemma = `${entry.artikel ? `${entry.artikel} ` : ''}${entry.lemma}`;
        return (
          <View className="flex-1">
            <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 16 }}>
              <View className="items-center gap-3 py-8">
                <Text
                  className={cn(
                    'text-center text-4xl font-sans-bold',
                    genus ? GENUS_TEXT_CLASS[genus] : undefined,
                  )}
                >
                  {displayLemma}
                </Text>
                <View className="flex-row items-center gap-2">
                  <Badge variant="outline" label={tg(`wortart.${entry.wortart}`)} />
                  <Pressable hitSlop={8} onPress={() => void speak(displayLemma)}>
                    <Ionicons name="volume-medium-outline" size={24} color="#77839A" />
                  </Pressable>
                </View>
              </View>

              {showAnswer ? (
                <View className="gap-5">
                  <View className="gap-1">
                    <Text variant="subtitle">{t('session.sectionTranslation')}</Text>
                    <Text className="text-lg">{entry.translationTr || '—'}</Text>
                  </View>
                  <View className="gap-1">
                    <Text variant="subtitle">{t('session.sectionForms')}</Text>
                    <QueryBoundary query={formsQ}>
                      {(forms) => <FormsTab entry={entry} forms={forms} />}
                    </QueryBoundary>
                  </View>
                  <View className="gap-1">
                    <Text variant="subtitle">{t('session.sectionExamples')}</Text>
                    <QueryBoundary query={examplesQ}>
                      {(examples) => (
                        <ExamplesSection
                          examples={examples}
                          onSpeak={(s) => void speak(s)}
                          noneLabel={t('card.noExamples')}
                        />
                      )}
                    </QueryBoundary>
                  </View>
                  <View className="gap-1">
                    <Text variant="subtitle">{t('session.sectionGrammar')}</Text>
                    <GrammarSection entry={entry} />
                  </View>
                </View>
              ) : null}
            </ScrollView>

            <View
              className="border-t border-neutral-200 px-4 pt-3 dark:border-neutral-800"
              style={{ paddingBottom: bottomInset + 8 }}
            >
              {showAnswer ? (
                <RatingBar onRate={onRate} />
              ) : (
                <Button label={t('session.showAnswer')} onPress={() => setShowAnswer(true)} />
              )}
            </View>
          </View>
        );
      }}
    </QueryBoundary>
  );
}
