import type { CoverageBenchmark } from "@oaqa/schema";

/**
 * The single frozen instance of the coverage benchmark (BUILD_SPEC.md §6,
 * locked 🔒 per §3a.4). Every comparability judgment across the pipeline
 * imports THIS object — never hardcode these values inline anywhere else.
 *
 * Optional accident benefits and non-44R endorsements are all "excluded"
 * here deliberately: the frozen demo package holds only the mandatory
 * medical/rehab/attendant-care benefits plus OPCF 44R, nothing more. A quote
 * that includes an optional benefit anyway is a real variance from this
 * target, not an oversight in this config.
 */
export const COVERAGE_BENCHMARK: CoverageBenchmark = {
  benchmarkId: "oaqa-demo-benchmark-2026",
  version: "1.0.0",
  thirdPartyLiability: 2_000_000,
  dcpdIncluded: true,
  mandatoryAccidentBenefits: "medical_rehab_attendant_care_only",
  collisionDeductible: 1_000,
  comprehensiveDeductible: 1_000,
  familyProtectionOpcf44R: true,
  telematicsOptIn: false,
  termMonths: 12,
  optionalAccidentBenefits: {
    incomeReplacement: "excluded",
    nonEarner: "excluded",
    caregiver: "excluded",
    housekeeping: "excluded",
    death: "excluded",
    funeral: "excluded",
    dependantCare: "excluded",
    indexation: "excluded",
    catastrophicImpairment: "excluded",
  },
  endorsements: {
    opcf20TransportationReplacement: "excluded",
    opcf27NonOwnedAutos: "excluded",
    opcf43RemovingDepreciation: "excluded",
    opcf44rFamilyProtection: "included",
    opcf49DcpdOptOut: "excluded",
  },
};
