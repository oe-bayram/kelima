import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { buildDeclension, type ParadigmForm } from '@/components/vocab/paradigm/grouping';
import { useTts } from '@/hooks/useTts';
import type { EntryRow } from '@/lib/dataClient';

function Cell({ form, translationTr }: { form?: string | null; translationTr?: string | null }) {
  const { speak } = useTts();
  if (!form) return <View className="flex-1" />;
  return (
    <Pressable className="flex-1" onPress={() => void speak(form)}>
      <Text className="text-sm">{form}</Text>
      {translationTr ? <Text variant="caption">{translationTr}</Text> : null}
    </Pressable>
  );
}

/** Nomen-Deklination 4 Kasus × Sg/Pl (bzw. einspaltig bei unzählbar/nur-Plural). */
export function DeclensionTable({
  forms,
  feminine,
  entry,
}: {
  forms: ParadigmForm[];
  feminine?: boolean;
  entry: EntryRow;
}) {
  const { t } = useTranslation('grammar');
  const view = buildDeclension(forms, { feminine });
  if (!view) return null;

  return (
    <View className="gap-2">
      {feminine ? <Text className="font-sans-semibold">{t('section.weiblicheForm')}</Text> : null}
      {!feminine && (entry.nurPlural || entry.unzaehlbar) ? (
        <View className="flex-row flex-wrap gap-2">
          {entry.nurPlural ? <Badge variant="outline" label={t('badge.nurPlural')} /> : null}
          {entry.unzaehlbar ? <Badge variant="outline" label={t('badge.unzaehlbar')} /> : null}
        </View>
      ) : null}

      <View className="flex-row gap-2 border-b border-neutral-200 pb-1 dark:border-neutral-800">
        <View className="w-20 shrink-0" />
        {view.showSingular ? (
          <Text variant="caption" className="flex-1">
            {t('numerus.singular')}
          </Text>
        ) : null}
        {view.showPlural ? (
          <Text variant="caption" className="flex-1">
            {t('numerus.plural')}
          </Text>
        ) : null}
      </View>

      {view.rows.map((r) => (
        <View key={r.kasus} className="flex-row items-start gap-2 py-1">
          <Text variant="caption" className="w-20 shrink-0">
            {t(`kasus.${r.kasus}`)}
          </Text>
          {view.showSingular ? (
            <Cell form={r.singular?.form} translationTr={r.singular?.translationTr} />
          ) : null}
          {view.showPlural ? (
            <Cell form={r.plural?.form} translationTr={r.plural?.translationTr} />
          ) : null}
        </View>
      ))}
    </View>
  );
}
