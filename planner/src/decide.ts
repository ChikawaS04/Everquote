import type { PlannedRouteAction, RegistryRecord, RoutePlan, TerminalStatus } from "@oaqa/schema";
import { PARTICIPANT_CAPABILITIES } from "./capabilities.js";

interface Decision {
  predictedStatus: TerminalStatus;
  plannedAction: PlannedRouteAction;
  rationale: string;
}

/**
 * Deterministic policy engine (BUILD_SPEC.md §4 step 3): requirements ×
 * capabilities -> route + predicted terminal status. Rules are checked in
 * order and the first match wins — order encodes priority (e.g. a row the
 * registry already resolved as a duplicate is never re-routed, no matter
 * what its requirements say).
 */
function decide(record: RegistryRecord): Decision {
  if (record.status === "duplicate_rate_source") {
    return {
      predictedStatus: "duplicate_rate_source",
      plannedAction: "skip_duplicate",
      rationale: `Registry reconciliation already resolved this row to distinct_rate_source_id "${record.distinctRateSourceId}" — not a new route to plan.`,
    };
  }

  if (
    record.productScope === "collector" ||
    record.productScope === "high_net_worth" ||
    record.productScope === "commercial_specialty"
  ) {
    return {
      predictedStatus: "specialty_only",
      plannedAction: "specialty_ineligible",
      rationale: `Route is scoped to ${record.productScope}, which this profile (G1 licence, no vehicle) does not match — it does not write standard PPA for this applicant regardless of underwriting depth.`,
    };
  }

  if (record.distributionType === "residual") {
    return {
      predictedStatus: "manual_handoff",
      plannedAction: "manual_handoff",
      rationale: "Residual-market pool: accessible only via a licensed broker placing a risk the standard market has declined, never directly quotable by an applicant.",
    };
  }

  if (record.requirements.includes("membership")) {
    const membershipNote =
      PARTICIPANT_CAPABILITIES.membershipsHeld.length === 0
        ? "participant holds no group/employer/membership relationship"
        : "participant's held memberships do not cover this route";
    return {
      predictedStatus: "affinity_restricted",
      plannedAction: "affinity_verification_required",
      rationale: `Route requires a group/employer/membership relationship; ${membershipNote}.`,
    };
  }

  if (record.productScope === "unknown") {
    return {
      predictedStatus: "unresolved",
      plannedAction: "needs_validation",
      rationale: "Product scope not yet confirmed against Ontario standard PPA — routing here would be a guess, not a prediction; needs live validation first.",
    };
  }

  if (record.requirements.includes("human")) {
    return {
      predictedStatus: "manual_handoff",
      plannedAction: "manual_handoff",
      rationale: "Route requires a human or licensed intermediary before any rate becomes available.",
    };
  }

  return {
    predictedStatus: "estimate_only",
    plannedAction: "attempt_online_estimate",
    rationale: "Self-service route with no human or membership gate in its stated requirements and a known product scope — plan to attempt an online estimate up to whatever verification/licence wall it hits.",
  };
}

export function planRoute(record: RegistryRecord, plannedAt: string): RoutePlan {
  const { predictedStatus, plannedAction, rationale } = decide(record);
  return {
    registryId: record.registryId,
    distinctRateSourceId: record.distinctRateSourceId,
    plannedAction,
    predictedStatus,
    rationale,
    requirementsConsidered: record.requirements,
    plannedAt,
  };
}
