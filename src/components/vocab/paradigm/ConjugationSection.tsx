import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Accordion } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { FormRow } from '@/components/vocab/paradigm/FormRow';
import {
  buildFiniteTable,
  buildImperative,
  type FiniteRow,
  findByKategorie,
  findFinite,
  type ParadigmForm,
} from '@/components/vocab/paradigm/grouping';
import type { EntryRow } from '@/lib/dataClient';
import type { Tempus } from '@/lib/enums';

function FiniteTable({ rows }: { rows: FiniteRow[] | null }) {
  if (!rows) return null;
  return (
    <View className="gap-0.5">
      {rows.map((r) => (
        <FormRow
          key={`${r.person}-${r.numerus}`}
          label={r.pronoun}
          form={r.form.form}
          translationTr={r.form.translationTr}
        />
      ))}
    </View>
  );
}

/** Verb-Konjugation nach Masterplan §5. */
export function ConjugationSection({ forms, entry }: { forms: ParadigmForm[]; entry: EntryRow }) {
  const { t } = useTranslation('grammar');

  const infinitiv = findByKategorie(forms, 'grundform');
  const p1 = findByKategorie(forms, 'partizip1');
  const p2 = findByKategorie(forms, 'partizip2');
  const zuInf = findByKategorie(forms, 'zu_infinitiv');
  const infPerf = findByKategorie(forms, 'infinitiv_perfekt');
  const imperative = buildImperative(forms);
  const indik = (tempus: Tempus) =>
    buildFiniteTable(forms, { tempus, modus: 'indikativ', genusVerbi: 'aktiv' });
  const passiv = (tempus: Tempus) =>
    buildFiniteTable(forms, { tempus, modus: 'indikativ', genusVerbi: 'passiv' });
  const konj1 = buildFiniteTable(forms, { modus: 'konjunktiv1', genusVerbi: 'aktiv' });
  const konj2 = buildFiniteTable(forms, { modus: 'konjunktiv2', genusVerbi: 'aktiv' });

  const kern = [
    infinitiv && { label: t('section.infinitiv'), f: infinitiv },
    findFinite(forms, { tempus: 'praesens', person: 3, numerus: 'singular' }) && {
      label: t('tempus.praesens'),
      f: findFinite(forms, { tempus: 'praesens', person: 3, numerus: 'singular' })!,
    },
    findFinite(forms, { tempus: 'praeteritum', person: 3, numerus: 'singular' }) && {
      label: t('tempus.praeteritum'),
      f: findFinite(forms, { tempus: 'praeteritum', person: 3, numerus: 'singular' })!,
    },
    findFinite(forms, { tempus: 'perfekt', person: 3, numerus: 'singular' }) && {
      label: t('tempus.perfekt'),
      f: findFinite(forms, { tempus: 'perfekt', person: 3, numerus: 'singular' })!,
    },
  ].filter(Boolean) as { label: string; f: ParadigmForm }[];

  return (
    <View className="gap-3">
      <Card>
        <CardContent className="gap-1">
          <View className="mb-1 flex-row flex-wrap gap-2">
            {entry.hilfsverb ? (
              <Badge variant="outline" label={t('badge.hilfsverb', { value: entry.hilfsverb })} />
            ) : null}
            {entry.trennbar ? <Badge variant="outline" label={t('badge.trennbar')} /> : null}
            {entry.reflexiv ? <Badge variant="outline" label={t('badge.reflexiv')} /> : null}
            {entry.verbRektion ? (
              <Badge variant="outline" label={t('badge.rektion', { value: entry.verbRektion })} />
            ) : null}
          </View>
          {kern.map((k) => (
            <FormRow
              key={k.label}
              label={k.label}
              form={k.f.form}
              translationTr={k.f.translationTr}
            />
          ))}
        </CardContent>
      </Card>

      {(['praesens', 'praeteritum', 'perfekt'] as Tempus[]).map((tp) => {
        const rows = indik(tp);
        return rows ? (
          <Accordion key={tp} title={t(`tempus.${tp}`)} defaultOpen>
            <FiniteTable rows={rows} />
          </Accordion>
        ) : null;
      })}

      {imperative.length ? (
        <Accordion title={t('section.imperativ')} defaultOpen>
          <View className="gap-0.5">
            {imperative.map((f) => (
              <FormRow
                key={f.anrede ?? f.form}
                label={t(`anrede.${f.anrede ?? 'du'}`)}
                form={f.form}
                translationTr={f.translationTr}
              />
            ))}
          </View>
        </Accordion>
      ) : null}

      {p1 || p2 ? (
        <Accordion title={t('section.partizip')} defaultOpen>
          <View className="gap-0.5">
            {p1 ? (
              <FormRow
                label={t('section.partizip1')}
                form={p1.form}
                translationTr={p1.translationTr}
              />
            ) : null}
            {p2 ? (
              <FormRow
                label={t('section.partizip2')}
                form={p2.form}
                translationTr={p2.translationTr}
              />
            ) : null}
          </View>
        </Accordion>
      ) : null}

      <Accordion title={t('section.erweiterteFormen')}>
        <View className="gap-3">
          {(['plusquamperfekt', 'futur1', 'futur2'] as Tempus[]).map((tp) => {
            const rows = indik(tp);
            return rows ? (
              <View key={tp}>
                <Text className="mb-1 font-sans-semibold">{t(`tempus.${tp}`)}</Text>
                <FiniteTable rows={rows} />
              </View>
            ) : null;
          })}
          {konj1 ? (
            <View>
              <Text className="mb-1 font-sans-semibold">{t('modus.konjunktiv1')}</Text>
              <FiniteTable rows={konj1} />
            </View>
          ) : null}
          {konj2 ? (
            <View>
              <Text className="mb-1 font-sans-semibold">{t('modus.konjunktiv2')}</Text>
              <FiniteTable rows={konj2} />
            </View>
          ) : null}
          {(['praesens', 'praeteritum', 'perfekt'] as Tempus[]).map((tp) => {
            const rows = passiv(tp);
            return rows ? (
              <View key={`passiv-${tp}`}>
                <Text className="mb-1 font-sans-semibold">
                  {t('genusVerbi.passiv')} · {t(`tempus.${tp}`)}
                </Text>
                <FiniteTable rows={rows} />
              </View>
            ) : null;
          })}
          {zuInf ? (
            <FormRow
              label={t('section.zuInfinitiv')}
              form={zuInf.form}
              translationTr={zuInf.translationTr}
            />
          ) : null}
          {infPerf ? (
            <FormRow
              label={t('section.infinitivPerfekt')}
              form={infPerf.form}
              translationTr={infPerf.translationTr}
            />
          ) : null}
        </View>
      </Accordion>
    </View>
  );
}
