import type { TerminalStatus, ConfidenceLevel } from "./status.js";
import type { DistributionType } from "./registry.js";
import type { CoverageBenchmark, CoverageVarianceFlag } from "./benchmark.js";
import type { PlannedRouteAction } from "./routePlan.js";

export interface SourceIdentity {
  registryId: string;
  distinctRateSourceId: string;
  brand: string;
  legalUnderwriter: string;
  insurerGroup: string;
  distributionType: DistributionType;
}

export interface PriceInfo {
  currency: "CAD";
  isRange: boolean;
  annualPremium?: number;
  monthlyPremium?: number;
  rangeLow?: number;
  rangeHigh?: number;
}

export interface QuoteCoverage {
  matchesBenchmark: boolean;
  varianceFlags: CoverageVarianceFlag[];
  observed: Partial<CoverageBenchmark>;
}

export interface DiscountApplied {
  name: string;
  description?: string;
}

export interface QuoteValidity {
  effectiveDate?: string;
  expiresAt?: string;
  termMonths?: number;
}

/**
 * Per-attempt evidence (BUILD_SPEC.md §4 step 5). Only ever present on a
 * `live_evidence` result — see the QuoteResult discriminated union below.
 */
export interface EvidenceRef {
  sourceUrl: string;
  /** ISO 8601 */
  timestamp: string;
  redactedScreenshotPath?: string;
  extractedFields?: Record<string, string>;
  evidenceHash?: string;
  /** How far the journey got and exactly what wall it hit, if any. */
  journeyNote?: string;
}

export interface PrivacyRecord {
  fieldsDisclosedToSource: string[];
  /** Always true — enforced by the vault/redaction boundary, not just declared. */
  sensitiveFieldsRedacted: true;
}

/**
 * What the route planner targeted for a prediction. Deliberately NOT shaped
 * like EvidenceRef and deliberately not named `evidence`: an
 * evidence.sourceUrl asserts a real attempt happened, this does not. The
 * registry's public quote URL here is the target, not proof of an attempt
 * (BUILD_SPEC.md §4 step 3 vs step 5 — planning precedes attempting).
 */
export interface PlanningTarget {
  plannedAction: PlannedRouteAction;
  rationale: string;
  /** The registry row's public quote URL, if any — a target, not evidence. */
  targetQuoteUrl?: string;
  /** ISO 8601 — when this prediction was made. */
  plannedAt: string;
}

interface QuoteResultCommon {
  resultId: string;
  source: SourceIdentity;
  status: TerminalStatus;
  price?: PriceInfo;
  coverage: QuoteCoverage;
  discounts: DiscountApplied[];
  validity?: QuoteValidity;
  privacy: PrivacyRecord;
  notes?: string;
}

/**
 * A planner prediction (BUILD_SPEC.md §4 step 3), not an attempt outcome.
 * Structurally cannot carry an evidence artifact — there is no `evidence` key
 * anywhere on this variant. Same discipline as IntakeProfile's
 * `hasLicenceNumber: false` (BUILD_SPEC.md §2): the type system makes the
 * guardrail impossible to violate by accident, not just discouraged by
 * convention. Confidence is always `low`: nothing has actually been
 * attempted, so there is nothing to be more confident about.
 */
export interface PlannerPredictionResult extends QuoteResultCommon {
  provenance: "planner_prediction";
  confidence: "low";
  planning: PlanningTarget;
}

/**
 * A real attempt outcome (BUILD_SPEC.md §4 steps 4–5) — requires a real
 * evidence artifact actually observed during an attempt, never optional.
 */
export interface LiveEvidenceResult extends QuoteResultCommon {
  provenance: "live_evidence";
  confidence: ConfidenceLevel;
  evidence: EvidenceRef;
  /** ISO 8601 — when the attempt happened. */
  attemptedAt: string;
}

/**
 * Quote result record (BUILD_SPEC.md §5) — the unit the normalizer, evidence
 * store, and dashboard all operate on. A discriminated union on `provenance`:
 * a planner prediction and a live evidence result are structurally distinct
 * shapes, not the same shape with a loose flag — narrow on `provenance`
 * before reading `evidence` or `planning`. See PlannerPredictionResult /
 * LiveEvidenceResult above.
 */
export type QuoteResult = PlannerPredictionResult | LiveEvidenceResult;
