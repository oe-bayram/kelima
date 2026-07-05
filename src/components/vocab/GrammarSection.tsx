import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import type { EntryRow } from '@/lib/dataClient';

function GrammarField({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View className="flex-row justify-between gap-4 py-1">
      <Text variant="caption">{label}</Text>
      <Text className="flex-1 text-right">{value}</Text>
    </View>
  );
}

/** Grammatik-Sektion: Feld/Wert-Zeilen + Merkmal-Badges. */
export function GrammarSection({ entry }: { entry: EntryRow }) {
  const { t } = useTranslation('grammar');
  const badges: string[] = [];
  if (entry.trennbar) badges.push(t('badge.trennbar'));
  if (entry.reflexiv) badges.push(t('badge.reflexiv'));
  if (entry.nurPlural) badges.push(t('badge.nurPlural'));
  if (entry.unzaehlbar) badges.push(t('badge.unzaehlbar'));
  if (entry.steigerbar === false) badges.push(t('badge.nichtSteigerbar'));

  return (
    <Card>
      <CardContent className="gap-1">
        <GrammarField label={t('field.wortart')} value={t(`wortart.${entry.wortart}`)} />
        <GrammarField label={t('field.artikel')} value={entry.artikel} />
        <GrammarField label={t('field.plural')} value={entry.plural} />
        <GrammarField label={t('field.pluralOriginal')} value={entry.pluralOriginal} />
        <GrammarField label={t('field.hilfsverb')} value={entry.hilfsverb} />
        <GrammarField
          label={t('field.rektion')}
          value={entry.praepositionRektion || entry.verbRektion}
        />
        <GrammarField label={t('field.hauptwort')} value={entry.hauptwort} />
        <GrammarField label={t('section.weiblicheForm')} value={entry.femininForm} />
        {badges.length ? (
          <View className="mt-2 flex-row flex-wrap gap-2">
            {badges.map((b, i) => (
              <Badge key={`${b}-${i}`} variant="outline" label={b} />
            ))}
          </View>
        ) : null}
      </CardContent>
    </Card>
  );
}
