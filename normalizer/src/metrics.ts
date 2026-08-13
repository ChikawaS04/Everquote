import type { CoverageMetrics, QuoteResult, RegistryRecord } from "@oaqa/schema";

export interface RegistrySummaryMergedGroup {
  legalUnderwriter: string;
  rawTokens: string[];
}

export interface RegistrySummary {
  appendixA: {
    rawTokenCount: number;
    mergedGroups: RegistrySummaryMergedGroup[];
  };
}

/**
 * Honest-accounting rule (BUILD_SPEC.md §8): market completion, comparable
 * yield, and evidence rate move ONLY on `live_evidence` results — planner
 * predictions populate the status-distribution / routing view (the
 * dashboard's group-by-status layout), never these metrics. On Day 2, with
 * zero live evidence, that means these three read ~0 — correct and honest,
 * not a bug, and it gives Day 3 a visible "metrics climb as evidence lands"
 * demo beat.
 *
 * Duplicate suppression is the deliberate exception: it is a registry
 * reconciliation fact from Day 1 (raw Appendix A tokens correctly merged
 * into one distinct_rate_source_id rather than double-counted), not an
 * attempt outcome — so it is computed from the registry summary, never from
 * results, and can honestly be non-zero today.
 */
export function computeMetrics(
  results: QuoteResult[],
  registryRecords: RegistryRecord[],
  registrySummary: RegistrySummary,
  computedAt: string,
): CoverageMetrics {
  const distinctRateSourceCount = new Set(registryRecords.map((r) => r.distinctRateSourceId)).size;

  const liveResults = results.filter((r) => r.provenance === "live_evidence");
  const liveDistinctSourcesWithEvidence = new Set(liveResults.map((r) => r.source.distinctRateSourceId)).size;
  const comparableCount = liveResults.filter((r) => r.status === "quoted_comparable").length;

  const marketCompletion = distinctRateSourceCount === 0 ? 0 : liveDistinctSourcesWithEvidence / distinctRateSourceCount;
  const comparableQuoteYield = distinctRateSourceCount === 0 ? 0 : comparableCount / distinctRateSourceCount;
  const evidenceRate = results.length === 0 ? 0 : liveResults.length / results.length;

  const suppressedTokenCount = registrySummary.appendixA.mergedGroups.reduce(
    (sum, group) => sum + (group.rawTokens.length - 1),
    0,
  );
  const duplicateSuppression =
    registrySummary.appendixA.rawTokenCount === 0 ? 0 : suppressedTokenCount / registrySummary.appendixA.rawTokenCount;

  const verifiedCount = registryRecords.filter((r) => r.verifiedDuringHackathonWindow).length;
  const freshness = registryRecords.length === 0 ? 0 : verifiedCount / registryRecords.length;

  return {
    marketCompletion,
    comparableQuoteYield,
    evidenceRate,
    duplicateSuppression,
    freshness,
    computedAt,
  };
}
