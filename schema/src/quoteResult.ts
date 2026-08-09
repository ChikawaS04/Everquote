import type { TerminalStatus, ConfidenceLevel } from "./status.js";
import type { DistributionType } from "./registry.js";
import type { CoverageBenchmark, CoverageVarianceFlag } from "./benchmark.js";

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

/** Per-attempt evidence (BUILD_SPEC.md §4 step 5). */
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
 * Quote result record (BUILD_SPEC.md §5) — the unit the normalizer,
 * evidence store, and dashboard all operate on.
 */
export interface QuoteResult {
  resultId: string;
  source: SourceIdentity;
  status: TerminalStatus;
  price?: PriceInfo;
  coverage: QuoteCoverage;
  discounts: DiscountApplied[];
  validity?: QuoteValidity;
  evidence: EvidenceRef;
  confidence: ConfidenceLevel;
  privacy: PrivacyRecord;
  notes?: string;
  attemptedAt: string;
}
