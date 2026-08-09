import type { RegistryRecord } from "@oaqa/schema";

/**
 * Generic dedup safety net (BUILD_SPEC.md §4 step 2 "enrichment + dedup
 * logic"). Groups rows by distinct_rate_source_id; the first row curated
 * for an id is kept as-is, any later row resolving to the same id is a
 * genuine "different brand/route resolved to the same rate program" case
 * and gets its status flipped to `duplicate_rate_source` with a note on
 * which row it duplicates.
 *
 * Our hand-curated seed keeps one legal entity per distinct_rate_source_id
 * by design, so this pass is expected to be a no-op today — it exists to
 * catch drift as the registry grows and as live verification (e.g. an
 * aggregator surfacing a carrier already seeded directly) reveals real
 * collisions.
 */
export function dedupe(records: RegistryRecord[]): RegistryRecord[] {
  const seenByRateSourceId = new Map<string, RegistryRecord>();

  return records.map((record) => {
    const existing = seenByRateSourceId.get(record.distinctRateSourceId);
    if (!existing) {
      seenByRateSourceId.set(record.distinctRateSourceId, record);
      return record;
    }

    const duplicateNote = `Resolved to the same distinct_rate_source_id as ${existing.registryId} (${existing.brandOrProgram}). Suppressed as duplicate_rate_source per §8 duplicate-suppression metric.`;
    return {
      ...record,
      status: "duplicate_rate_source",
      automationNotes: record.automationNotes ? `${record.automationNotes} ${duplicateNote}` : duplicateNote,
    };
  });
}
