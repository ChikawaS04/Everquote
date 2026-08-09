import type { DistributionType, ProductScope, RequirementFlag } from "@oaqa/schema";

/**
 * Pre-enrichment seed shape. One entry per legal entity / distinct route.
 * `build.ts` turns these into full RegistryRecord objects (deriving
 * registryId / distinctRateSourceId, stamping status/timestamps).
 */
export interface RegistrySeedInput {
  legalUnderwriter: string;
  insurerGroup: string;
  brandOrProgram: string;
  distributionType: DistributionType;
  productScope: ProductScope;
  requirements: RequirementFlag[];
  /** Only set when we're genuinely confident in a real, current public domain. */
  quoteUrl?: string;
  automationNotes?: string;
  /** "appendix_a" = from the brief's 32-group seed list; "supplemental" = added from Route Strategy / gap-fill notes. */
  origin: "appendix_a" | "supplemental";
  /** Set only when this row merges >1 raw Appendix A token — see RegistryRecord.mergedAliases. */
  mergedAliases?: string[];
}
