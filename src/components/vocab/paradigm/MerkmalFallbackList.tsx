import { View } from 'react-native';

import { FormRow } from '@/components/vocab/paradigm/FormRow';
import type { ParadigmForm } from '@/components/vocab/paradigm/grouping';

/** Fallback: unstrukturierte Formen einfach per merkmalText auflisten. */
export function MerkmalFallbackList({ forms }: { forms: ParadigmForm[] }) {
  return (
    <View className="gap-1">
      {forms.map((f, i) => (
        <FormRow
          key={`${f.form}-${i}`}
          label={f.merkmalText}
          form={f.form}
          translationTr={f.translationTr}
        />
      ))}
    </View>
  );
}
