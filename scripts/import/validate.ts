import { z } from 'zod';

import type { RawSource } from './types';

// Validierung sammelt Fehler (bricht nicht beim ersten ab). transform liest
// anschließend die Rohdaten; die Schemas erlauben unbekannte Zusatzfelder
// (zod strippt sie, ohne zu meckern) — wichtig für die heterogenen Wortgruppen.

const FormSchema = z.object({
  form: z.string(),
  merkmal: z.string(),
  tr: z.string().nullish(),
});

const BeispielSchema = z.object({
  de: z.string(),
  tr: z.string().nullish(),
});

const NomenSchema = z.object({
  artikel: z.string().nullish(),
  genus: z.string().nullish(),
  plural: z.string().nullish(),
  plural_original: z.string().nullish(),
  nur_plural: z.boolean().optional(),
  weiblich: z
    .object({
      lemma: z.string().optional(),
      artikel: z.string().nullish(),
      plural: z.string().nullish(),
      plural_original: z.string().nullish(),
    })
    .optional(),
});

const VerbSchema = z.object({
  trennbar: z.boolean().optional(),
  hilfsverb: z.string().nullish(),
  reflexiv: z.boolean().optional(),
  rektion: z.string().nullish(),
  // Einige Verben haben null-Werte in der Kurz-Konjugation; transform leitet
  // ohnehin aus `formen` ab, daher hier tolerant.
  konjugation: z.record(z.string(), z.string().nullable()).optional(),
});

const EntrySchema = z.object({
  lemma: z.string().min(1),
  wortart: z.string().min(1),
  uebersetzung_tr: z.string().nullish(),
  hauptwort: z.string().nullish(),
  formen: z.array(FormSchema),
  beispiele: z.array(BeispielSchema),
  nomen: NomenSchema.optional(),
  verb: VerbSchema.optional(),
});

// Wortgruppen-Mitglieder sind heterogen (10 Formen + verschachtelt) → nur als
// Objekt prüfen; die konkrete Form-Erkennung passiert in chapters.ts.
const MemberSchema = z.record(z.string(), z.unknown());

const WordGroupSchema = z.object({
  typ: z.string().optional(),
  gruppe: z.string().min(1),
  uebersetzung_tr: z.string().nullish(),
  mitglieder: z.array(MemberSchema),
});

const SourceSchema = z.object({
  metadata: z.record(z.string(), z.unknown()).optional(),
  eintraege: z.array(EntrySchema),
  wortgruppen: z.array(WordGroupSchema),
});

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  issues: ValidationIssue[];
  /** Rohdaten unverändert (auch bei Fehlern für Teil-Reports nutzbar). */
  data: RawSource;
}

export function validateSource(raw: unknown): ValidationResult {
  const result = SourceSchema.safeParse(raw);
  if (result.success) {
    return { ok: true, issues: [], data: raw as RawSource };
  }
  const issues: ValidationIssue[] = result.error.issues.map((issue) => ({
    path: issue.path.map(String).join('.') || '(root)',
    message: issue.message,
  }));
  return { ok: false, issues, data: raw as RawSource };
}
