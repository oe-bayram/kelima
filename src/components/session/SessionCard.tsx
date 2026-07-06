import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { QueryBoundary } from '@/components/ui/query-boundary';
import { CardSkeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { ExamplesSection } from '@/components/vocab/ExamplesSection';
import { GrammarSection } from '@/components/vocab/GrammarSection';
import { RevealSection } from '@/components/session/RevealSection';
import { FormsTab } from '@/components/vocab/paradigm/FormsTab';
import { useExamples, useForms, useVocabEntry } from '@/hooks/content';
import { useTts } from '@/hooks/useTts';
import { useProgressMap } from '@/hooks/userData';
import type { EntryRow } from '@/lib/dataClient';
import { cn } from '@/lib/utils';
import { genusOf, GENUS_TEXT_CLASS, STATUS_BG_CLASS, statusOf } from '@/lib/vocab';

type SectionKey = 'translation' | 'forms' | 'examples' | 'grammar';

/**
 * Lernkarte mit Hide/Reveal je Abschnitt. Standard verdeckt: Übersetzung,
 * Formen, Beispiele, Grammatik. TTS (Lemma) ist immer verfügbar. Der Reveal-
 * Zustand lebt lokal → beim Kartenwechsel setzt der Aufrufer `key={entryId}`,
 * wodurch alles automatisch wieder verdeckt wird.
 */
export function SessionCard({ entryId }: { entryId: string }) {
  const entryQ = useVocabEntry(entryId);
  return (
    <QueryBoundary query={entryQ} loading={<CardSkeleton />}>
      {(entry) => (entry ? <CardInner entry={entry} /> : null)}
    </QueryBoundary>
  );
}

function CardInner({ entry }: { entry: EntryRow }) {
  const { t } = useTranslation();
  const formsQ = useForms(entry.id);
  const examplesQ = useExamples(entry.id);
  const progressQ = useProgressMap();
  const { speak } = useTts();

  const [revealed, setRevealed] = useState<Record<SectionKey, boolean>>({
    translation: false,
    forms: false,
    examples: false,
    grammar: false,
  });
  const reveal = (key: SectionKey) => setRevealed((r) => ({ ...r, [key]: true }));
  const revealAll = () =>
    setRevealed({ translation: true, forms: true, examples: true, grammar: true });

  const genus = genusOf(entry);
  const status = statusOf(progressQ.data?.get(entry.id));
  const displayLemma = `${entry.artikel ? `${entry.artikel} ` : ''}${entry.lemma}`;

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 16 }}>
      <View className="gap-5">
        <View className="gap-2">
          <View className="flex-row items-start gap-2">
            <Text
              className={cn('flex-1 text-3xl font-sans-bold', genus ? GENUS_TEXT_CLASS[genus] : undefined)}
            >
              {displayLemma}
            </Text>
            <Pressable hitSlop={8} onPress={() => void speak(displayLemma)}>
              <Ionicons name="volume-medium-outline" size={26} color="#77839A" />
            </Pressable>
          </View>
          <View className="flex-row items-center gap-2">
            <Badge
              className={STATUS_BG_CLASS[status]}
              textClassName="text-white"
              label={t(`status.${status}`)}
            />
            <Pressable onPress={revealAll} hitSlop={8}>
              <Text className="text-sm font-sans-semibold text-brand">{t('session.revealAll')}</Text>
            </Pressable>
          </View>
        </View>

        <RevealSection
          title={t('session.sectionTranslation')}
          revealLabel={t('session.reveal')}
          revealed={revealed.translation}
          onReveal={() => reveal('translation')}
        >
          <Text className="text-lg">{entry.translationTr || '—'}</Text>
        </RevealSection>

        <RevealSection
          title={t('session.sectionForms')}
          revealLabel={t('session.reveal')}
          revealed={revealed.forms}
          onReveal={() => reveal('forms')}
        >
          <QueryBoundary query={formsQ}>
            {(forms) => <FormsTab entry={entry} forms={forms} />}
          </QueryBoundary>
        </RevealSection>

        <RevealSection
          title={t('session.sectionExamples')}
          revealLabel={t('session.reveal')}
          revealed={revealed.examples}
          onReveal={() => reveal('examples')}
        >
          <QueryBoundary query={examplesQ}>
            {(examples) => (
              <ExamplesSection
                examples={examples}
                onSpeak={(s) => void speak(s)}
                noneLabel={t('card.noExamples')}
              />
            )}
          </QueryBoundary>
        </RevealSection>

        <RevealSection
          title={t('session.sectionGrammar')}
          revealLabel={t('session.reveal')}
          revealed={revealed.grammar}
          onReveal={() => reveal('grammar')}
        >
          <GrammarSection entry={entry} />
        </RevealSection>
      </View>
    </ScrollView>
  );
}
