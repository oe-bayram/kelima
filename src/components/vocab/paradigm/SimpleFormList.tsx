import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { FormRow } from '@/components/vocab/paradigm/FormRow';
import type { ParadigmForm } from '@/components/vocab/paradigm/grouping';
import type { EntryRow } from '@/lib/dataClient';

/** Übrige Wortarten: Grundform + merkmalText; Präposition mit Rektion prominent. */
export function SimpleFormList({ forms, entry }: { forms: ParadigmForm[]; entry: EntryRow }) {
  const { t } = useTranslation('grammar');
  const rektion = entry.praepositionRektion || entry.verbRektion;
  return (
    <View className="gap-1">
      {entry.wortart === 'praeposition' && rektion ? (
        <Badge variant="outline" label={t('badge.rektion', { value: rektion })} />
      ) : null}
      {forms.map((f, i) => (
        <FormRow
          key={`${f.form}-${i}`}
          label={f.kategorie === 'grundform' ? undefined : f.merkmalText}
          form={f.form}
          translationTr={f.translationTr}
        />
      ))}
    </View>
  );
}
