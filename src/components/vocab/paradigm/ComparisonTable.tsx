import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { FormRow } from '@/components/vocab/paradigm/FormRow';
import { buildComparison, type ParadigmForm } from '@/components/vocab/paradigm/grouping';
import type { EntryRow } from '@/lib/dataClient';

/** Adjektiv/Adverb: Positiv/Komparativ/Superlativ. */
export function ComparisonTable({ forms, entry }: { forms: ParadigmForm[]; entry: EntryRow }) {
  const { t } = useTranslation('grammar');
  const rows = buildComparison(forms);
  return (
    <View className="gap-1">
      {entry.steigerbar === false ? (
        <Badge variant="outline" label={t('badge.nichtSteigerbar')} />
      ) : null}
      {rows?.map((r) => (
        <FormRow
          key={r.grad}
          label={t(`grad.${r.grad}`)}
          form={r.form.form}
          translationTr={r.form.translationTr}
        />
      ))}
    </View>
  );
}
