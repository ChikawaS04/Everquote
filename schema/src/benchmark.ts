/**
 * Coverage benchmark — the normalization target (BUILD_SPEC.md §6).
 * FROZEN 🔒 per §3a.4: this file defines the *shape* only. The single
 * frozen instance lives in /normalizer as a config object that the
 * normalizer imports — never hardcode benchmark values inline elsewhere.
 */

export type AccidentBenefitStatus = "included" | "excluded" | "unavailable" | "unknown";

/**
 * Post–July 1, 2026 Ontario rule: only medical/rehab/attendant-care remain
 * mandatory. Every other accident benefit must be tracked explicitly.
 */
export interface OptionalAccidentBenefits {
  incomeReplacement: AccidentBenefitStatus;
  nonEarner: AccidentBenefitStatus;
  caregiver: AccidentBenefitStatus;
  housekeeping: AccidentBenefitStatus;
  death: AccidentBenefitStatus;
  funeral: AccidentBenefitStatus;
  dependantCare: AccidentBenefitStatus;
  indexation: AccidentBenefitStatus;
  catastrophicImpairment: AccidentBenefitStatus;
}

/** Endorsements tracked at minimum when offered/requested (BUILD_SPEC.md §6). */
export interface EndorsementTracking {
  opcf20TransportationReplacement: AccidentBenefitStatus;
  opcf27NonOwnedAutos: AccidentBenefitStatus;
  opcf43RemovingDepreciation: AccidentBenefitStatus;
  opcf44rFamilyProtection: AccidentBenefitStatus;
  opcf49DcpdOptOut: AccidentBenefitStatus;
}

export interface CoverageBenchmark {
  benchmarkId: string;
  version: string;
  /** e.g. 2_000_000 — Ontario legal minimum is 200,000 but ours is held fixed */
  thirdPartyLiability: number;
  dcpdIncluded: boolean;
  mandatoryAccidentBenefits: "medical_rehab_attendant_care_only";
  collisionDeductible: number;
  comprehensiveDeductible: number;
  familyProtectionOpcf44R: boolean;
  telematicsOptIn: boolean;
  termMonths: number;
  optionalAccidentBenefits: OptionalAccidentBenefits;
  endorsements: EndorsementTracking;
}

/** One flagged difference between an observed result and the frozen benchmark. */
export interface CoverageVarianceFlag {
  /** Dot-path into CoverageBenchmark, e.g. "collisionDeductible" */
  field: string;
  benchmarkValue: string;
  observedValue: string;
  materiality: "minor" | "material";
}
