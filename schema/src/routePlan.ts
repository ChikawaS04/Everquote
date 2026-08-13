import type { TerminalStatus } from "./status.js";
import type { RequirementFlag } from "./registry.js";

/**
 * The route family the planner decided on (BUILD_SPEC.md §4 step 3) — this is
 * what makes the routing logic legible (e.g. in the Loom), distinct from the
 * predicted terminal status it leads to.
 */
export type PlannedRouteAction =
  | "attempt_online_estimate"
  | "manual_handoff"
  | "affinity_verification_required"
  | "specialty_ineligible"
  | "needs_validation"
  | "skip_duplicate";

export const PLANNED_ROUTE_ACTIONS: readonly PlannedRouteAction[] = [
  "attempt_online_estimate",
  "manual_handoff",
  "affinity_verification_required",
  "specialty_ineligible",
  "needs_validation",
  "skip_duplicate",
];

/**
 * Route planner output (BUILD_SPEC.md §4 step 3) — a deterministic
 * PREDICTION, not an attempt outcome. It never carries an evidence artifact;
 * see QuoteResult's `provenance` discriminated union in quoteResult.ts, which
 * is what keeps a prediction from ever wearing evidence's costume once it
 * flows downstream into the normalizer's output.
 */
export interface RoutePlan {
  registryId: string;
  /**
   * Carried through verbatim from RegistryRecord — dedup truth lives in
   * /registry's Appendix A reconciliation; the planner never re-derives it.
   */
  distinctRateSourceId: string;
  plannedAction: PlannedRouteAction;
  predictedStatus: TerminalStatus;
  rationale: string;
  requirementsConsidered: RequirementFlag[];
  /** ISO 8601 — when this prediction was made, not a claim that anything was attempted. */
  plannedAt: string;
}
