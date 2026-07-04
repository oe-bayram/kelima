export interface ModelCounters {
  toCreate: number;
  toUpdate: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
}

function emptyCounters(): ModelCounters {
  return { toCreate: 0, toUpdate: 0, created: 0, updated: 0, skipped: 0, errors: 0 };
}

/** Sammelt Zähler, unbekannte Merkmale, Fehler und Timing des Imports. */
export class ImportReport {
  startedAt = 0;
  durationMs = 0;
  version = '';
  sourceFile = '';
  dryRun = false;
  perModel: Record<string, ModelCounters> = {};
  unknownMerkmale: Record<string, { count: number; sample?: string }> = {};
  missingTranslations = { entries: 0, forms: 0, examples: 0 };
  validationIssues: { path: string; message: string }[] = [];
  skippedMembers: { group: string; reason: string }[] = [];
  errorSamples: string[] = [];
  notes: string[] = [];

  count(model: string): ModelCounters {
    return (this.perModel[model] ??= emptyCounters());
  }

  recordUnknownMerkmal(merkmal: string, sampleEntryId?: string): void {
    const entry = (this.unknownMerkmale[merkmal] ??= { count: 0, sample: sampleEntryId });
    entry.count++;
  }

  recordMissingTranslation(kind: 'entries' | 'forms' | 'examples'): void {
    this.missingTranslations[kind]++;
  }

  addSkippedMember(group: string, reason: string): void {
    this.skippedMembers.push({ group, reason });
  }

  addError(model: string, message: string): void {
    this.count(model).errors++;
    if (this.errorSamples.length < 25) this.errorSamples.push(`[${model}] ${message}`);
  }

  note(message: string): void {
    this.notes.push(message);
  }

  toJSON(): Record<string, unknown> {
    return {
      version: this.version,
      sourceFile: this.sourceFile,
      dryRun: this.dryRun,
      durationMs: this.durationMs,
      perModel: this.perModel,
      unknownMerkmaleCount: Object.keys(this.unknownMerkmale).length,
      unknownMerkmale: this.unknownMerkmale,
      missingTranslations: this.missingTranslations,
      validationIssueCount: this.validationIssues.length,
      validationIssues: this.validationIssues.slice(0, 100),
      skippedMemberCount: this.skippedMembers.length,
      skippedMembers: this.skippedMembers.slice(0, 100),
      errorSamples: this.errorSamples,
      notes: this.notes,
    };
  }

  printSummary(): void {
    const line = '─'.repeat(64);
    console.log(`\n${line}`);
    console.log(
      `Import-Report${this.dryRun ? ' (DRY-RUN)' : ''} — Version ${this.version || '(?)'}`,
    );
    console.log(line);
    const models = Object.keys(this.perModel);
    const width = Math.max(16, ...models.map((m) => m.length));
    console.log(`${'Modell'.padEnd(width)}  toCreate  toUpdate  created  updated  skipped  errors`);
    for (const m of models) {
      const c = this.perModel[m];
      console.log(
        `${m.padEnd(width)}  ${String(c.toCreate).padStart(8)}  ${String(c.toUpdate).padStart(8)}  ` +
          `${String(c.created).padStart(7)}  ${String(c.updated).padStart(7)}  ${String(c.skipped).padStart(7)}  ${String(c.errors).padStart(6)}`,
      );
    }
    const unknownCount = Object.keys(this.unknownMerkmale).length;
    console.log(line);
    console.log(`Unbekannte Merkmale: ${unknownCount}`);
    if (unknownCount > 0) {
      for (const [m, info] of Object.entries(this.unknownMerkmale)) {
        console.log(`  • "${m}" ×${info.count}${info.sample ? ` (z.B. ${info.sample})` : ''}`);
      }
    }
    console.log(
      `Fehlende Übersetzungen — Einträge: ${this.missingTranslations.entries}, ` +
        `Formen: ${this.missingTranslations.forms}, Beispiele: ${this.missingTranslations.examples}`,
    );
    console.log(`Validierungsfehler: ${this.validationIssues.length}`);
    console.log(`Übersprungene Wortgruppen-Mitglieder: ${this.skippedMembers.length}`);
    if (this.notes.length) {
      console.log('Hinweise:');
      this.notes.forEach((n) => console.log(`  • ${n}`));
    }
    console.log(`Dauer: ${(this.durationMs / 1000).toFixed(1)} s`);
    console.log(`${line}\n`);
  }
}
