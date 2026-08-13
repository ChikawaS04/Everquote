import type { PlannerPredictionResult, RegistryRecord, RoutePlan } from "@oaqa/schema";

/**
 * Lifts a planner RoutePlan into the QuoteResult shape the dashboard reads —
 * always the `planner_prediction` variant (BUILD_SPEC.md §4 step 3 output,
 * not step 5 evidence). No `evidence` field exists on this variant's type at
 * all, so there is nothing here that could accidentally be mistaken for an
 * attempt outcome.
 */
export function liftPrediction(record: RegistryRecord, plan: RoutePlan): PlannerPredictionResult {
  return {
    resultId: `prediction-${plan.registryId}`,
    source: {
      registryId: record.registryId,
      distinctRateSourceId: record.distinctRateSourceId,
      brand: record.brandOrProgram,
      legalUnderwriter: record.legalUnderwriter,
      insurerGroup: record.insurerGroup,
      distributionType: record.distributionType,
    },
    status: plan.predictedStatus,
    coverage: {
      // Nothing has been observed yet — a prediction cannot honestly claim
      // to match or vary from the benchmark. quoted_comparable is never a
      // predicted status (§4 step 3), so this is never misread as a match.
      matchesBenchmark: false,
      varianceFlags: [],
      observed: {},
    },
    discounts: [],
    privacy: {
      // No route has been attempted, so nothing has been disclosed to anyone yet.
      fieldsDisclosedToSource: [],
      sensitiveFieldsRedacted: true,
    },
    provenance: "planner_prediction",
    confidence: "low",
    planning: {
      plannedAction: plan.plannedAction,
      rationale: plan.rationale,
      targetQuoteUrl: record.quoteUrl,
      plannedAt: plan.plannedAt,
    },
  };
}
