import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { ComparisonTable } from '@/components/vocab/paradigm/ComparisonTable';
import { ConjugationSection } from '@/components/vocab/paradigm/ConjugationSection';
import { DeclensionTable } from '@/components/vocab/paradigm/DeclensionTable';
import { isFallbackForms, type ParadigmForm } from '@/components/vocab/paradigm/grouping';
import { MerkmalFallbackList } from '@/components/vocab/paradigm/MerkmalFallbackList';
import { SimpleFormList } from '@/components/vocab/paradigm/SimpleFormList';
import type { EntryRow } from '@/lib/dataClient';

/** Wählt die passende Paradigma-Darstellung je Wortart; Fallback bei basis/sonstige. */
export function FormsTab({ entry, forms }: { entry: EntryRow; forms: ParadigmForm[] }) {
  const { t } = useTranslation('grammar');

  if (isFallbackForms(forms, entry.formenStatus)) {
    if (forms.length === 0) {
      return <Text variant="caption">{t('section.keineFormen')}</Text>;
    }
    return <MerkmalFallbackList forms={forms} />;
  }

  switch (entry.wortart) {
    case 'nomen':
      return (
        <View className="gap-4">
          <DeclensionTable forms={forms} entry={entry} />
          <DeclensionTable forms={forms} feminine entry={entry} />
        </View>
      );
    case 'verb':
      return <ConjugationSection forms={forms} entry={entry} />;
    case 'adjektiv':
    case 'adverb':
      return <ComparisonTable forms={forms} entry={entry} />;
    default:
      return <SimpleFormList forms={forms} entry={entry} />;
  }
}
