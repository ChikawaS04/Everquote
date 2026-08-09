import type { RegistrySeedInput } from "./seedTypes.js";

/**
 * Market registry seed — curated from BUILD_SPEC.md Appendix A (32 insurer
 * groups) plus supplemental routes named in the Route Strategy section
 * (RBC Insurance, aggregators, independent broker verifiers, gap-fill
 * programs). This is a SEED: every row requires live validation during the
 * hackathon window (see §Appendix). It does not by itself prove new-business
 * availability, standard-PPA scope, or a consumer-accessible quote path.
 *
 * Curation note: Appendix A contains exactly 60 raw entity tokens across
 * the 32 groups (verified by parsing the source document — see
 * appendixARawTokens.ts, which is the source of truth reconcile.ts checks
 * this seed against on every build). Of those 60, "S&Y" and "Scottish &
 * York" under Aviva are the same real-world legal entity (S&Y is the
 * standard market abbreviation), written as two tokens in the source text.
 * We list it once here rather than manufacturing a synthetic
 * duplicate_rate_source row for a same-name redundancy that isn't a
 * genuine second route — recorded structurally via `mergedAliases`, not
 * just this comment. That yields 59 distinct legal entities from Appendix
 * A, reconciled 1:1 against all 60 raw tokens, plus 9 supplemental routes
 * (a different layer — distribution channels the brief names in its Route
 * Strategy section, not additional rows in the regulator-facing Appendix A
 * seed) = 68 total registry rows. `npm run emit` fails loudly if this
 * reconciliation ever breaks.
 *
 * quoteUrl is left undefined wherever we are not genuinely confident of a
 * live, correct public domain — inventing a plausible-looking URL would
 * itself violate the project's no-fabrication ethos, even though it isn't
 * one of the hard guardrails in §2. Undefined quoteUrl + status
 * "unresolved" is the honest default; verification fills it in.
 */
export const SEED: RegistrySeedInput[] = [
  // ---- 1. AIG -------------------------------------------------------
  {
    legalUnderwriter: "AIG Insurance Company of Canada",
    insurerGroup: "AIG",
    brandOrProgram: "AIG",
    distributionType: "broker",
    productScope: "unknown",
    requirements: ["licence", "VIN", "human"],
    automationNotes:
      "Brief flags specialty/commercial-leaning; validate Ontario standard PPA relevance before treating as a viable consumer route.",
    origin: "appendix_a",
  },

  // ---- 2. Allstate ----------------------------------------------------
  {
    legalUnderwriter: "Allstate Insurance Company of Canada",
    insurerGroup: "Allstate",
    brandOrProgram: "Allstate",
    distributionType: "agent",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN", "human"],
    quoteUrl: "https://www.allstate.ca",
    origin: "appendix_a",
  },
  {
    legalUnderwriter: "Esurance Insurance Company of Canada",
    insurerGroup: "Allstate",
    brandOrProgram: "Esurance",
    distributionType: "broker",
    productScope: "unknown",
    requirements: ["licence", "VIN", "human"],
    automationNotes:
      "Brief explicitly flags for validation — confirm whether this legacy Allstate-family entity is still active for new Ontario PPA business.",
    origin: "appendix_a",
  },
  {
    legalUnderwriter: "Pafco Insurance Company",
    insurerGroup: "Allstate",
    brandOrProgram: "Pafco",
    distributionType: "broker",
    productScope: "nonstandard_PPA",
    requirements: ["licence", "VIN", "human"],
    origin: "appendix_a",
  },
  {
    legalUnderwriter: "Pembridge Insurance Company",
    insurerGroup: "Allstate",
    brandOrProgram: "Pembridge",
    distributionType: "broker",
    productScope: "nonstandard_PPA",
    requirements: ["licence", "VIN", "human"],
    origin: "appendix_a",
  },

  // ---- 3. Aviva ---------------------------------------------------------
  {
    legalUnderwriter: "Aviva General Insurance Company",
    insurerGroup: "Aviva",
    brandOrProgram: "Aviva Direct",
    distributionType: "direct",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN"],
    quoteUrl: "https://www.aviva.ca",
    origin: "appendix_a",
  },
  {
    legalUnderwriter: "Aviva Insurance Company of Canada",
    insurerGroup: "Aviva",
    brandOrProgram: "Aviva (broker channel)",
    distributionType: "broker",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN", "human"],
    origin: "appendix_a",
  },
  {
    // Appendix A lists "S&Y" and "Scottish & York" as two separate tokens
    // under Aviva — they are the same legal entity ("S&Y" is the standard
    // market abbreviation for Scottish & York). Recorded structurally via
    // mergedAliases, not just this comment — see reconcile.ts.
    legalUnderwriter: "Scottish & York Insurance Company",
    insurerGroup: "Aviva",
    brandOrProgram: "Aviva legacy (Scottish & York / S&Y)",
    distributionType: "broker",
    productScope: "unknown",
    requirements: ["licence", "VIN", "human"],
    automationNotes:
      "Legacy Aviva-family legal entity; confirm current active status. Merge: Appendix A's Aviva row lists 'S&Y' and 'Scottish & York' as two separate tokens — S&Y is the standard market abbreviation for Scottish & York Insurance Company, the same real-world legal entity, not a second distinct rate source. Collapsed to one registry row; see mergedAliases.",
    mergedAliases: ["S&Y", "Scottish & York"],
    origin: "appendix_a",
  },
  {
    legalUnderwriter: "Traders General Insurance Company",
    insurerGroup: "Aviva",
    brandOrProgram: "Aviva (Traders General)",
    distributionType: "broker",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN", "human"],
    origin: "appendix_a",
  },

  // ---- 4. Beneva ----------------------------------------------------
  {
    legalUnderwriter: "Unica Insurance Inc.",
    insurerGroup: "Beneva",
    brandOrProgram: "Unica (Beneva)",
    distributionType: "broker",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN", "human"],
    origin: "appendix_a",
  },

  // ---- 5. CAA -------------------------------------------------------
  {
    legalUnderwriter: "CAA Insurance Company",
    insurerGroup: "CAA",
    brandOrProgram: "CAA",
    distributionType: "affinity",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN", "membership"],
    quoteUrl: "https://www.caa.ca",
    automationNotes: "CAA membership relationship required; direct/broker hybrid per brief.",
    origin: "appendix_a",
  },
  {
    legalUnderwriter: "Echelon Insurance",
    insurerGroup: "CAA",
    brandOrProgram: "Echelon",
    distributionType: "broker",
    productScope: "nonstandard_PPA",
    requirements: ["licence", "VIN", "human"],
    origin: "appendix_a",
  },

  // ---- 6. Chubb -----------------------------------------------------
  {
    legalUnderwriter: "Chubb Insurance Company of Canada",
    insurerGroup: "Chubb",
    brandOrProgram: "Chubb",
    distributionType: "broker",
    productScope: "high_net_worth",
    requirements: ["licence", "VIN", "human"],
    origin: "appendix_a",
  },

  // ---- 7. Co-op -----------------------------------------------------
  {
    legalUnderwriter: "COSECO Insurance Company",
    insurerGroup: "Co-operators",
    brandOrProgram: "Co-operators (COSECO)",
    distributionType: "agent",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN", "human"],
    origin: "appendix_a",
  },
  {
    legalUnderwriter: "CUMIS General Insurance Company",
    insurerGroup: "Co-operators",
    brandOrProgram: "Co-operators (CUMIS)",
    distributionType: "affinity",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN", "membership"],
    automationNotes: "Historically credit-union/affinity distributed; confirm current membership gating.",
    origin: "appendix_a",
  },
  {
    legalUnderwriter: "Co-operators General Insurance Company",
    insurerGroup: "Co-operators",
    brandOrProgram: "Co-operators",
    distributionType: "agent",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN", "human"],
    quoteUrl: "https://www.cooperators.ca",
    origin: "appendix_a",
  },
  {
    legalUnderwriter: "The Sovereign General Insurance Company",
    insurerGroup: "Co-operators",
    brandOrProgram: "Co-operators (Sovereign General)",
    distributionType: "broker",
    productScope: "unknown",
    requirements: ["licence", "VIN", "human"],
    automationNotes: "Brief flags affinity/specialty validation needed.",
    origin: "appendix_a",
  },

  // ---- 8. Commonwell --------------------------------------------------
  {
    legalUnderwriter: "The Commonwell Mutual Insurance Group",
    insurerGroup: "Commonwell",
    brandOrProgram: "Commonwell",
    distributionType: "mutual",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN", "human"],
    origin: "appendix_a",
  },

  // ---- 9. Continental -------------------------------------------------
  {
    legalUnderwriter: "Continental Casualty Company",
    insurerGroup: "Continental (CNA)",
    brandOrProgram: "CNA",
    distributionType: "broker",
    productScope: "unknown",
    requirements: ["licence", "VIN", "human"],
    automationNotes: "Specialty/commercial-leaning (CNA); validate Ontario standard PPA relevance.",
    origin: "appendix_a",
  },

  // ---- 10. Definity -----------------------------------------------------
  {
    legalUnderwriter: "Definity Insurance Company",
    insurerGroup: "Definity",
    brandOrProgram: "Definity / Economical",
    distributionType: "broker",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN", "human"],
    origin: "appendix_a",
  },
  {
    legalUnderwriter: "Sonnet Insurance Company",
    insurerGroup: "Definity",
    brandOrProgram: "Sonnet",
    distributionType: "direct",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN"],
    quoteUrl: "https://www.sonnet.ca",
    automationNotes: "Playwright probe priority 1 (§3a.5) — fully online, direct, instant-quote design.",
    origin: "appendix_a",
  },

  // ---- 11. Desjardins -------------------------------------------------
  {
    legalUnderwriter: "Certas Direct Insurance Company",
    insurerGroup: "Desjardins",
    brandOrProgram: "Desjardins Insurance (direct)",
    distributionType: "direct",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN"],
    quoteUrl: "https://www.desjardinsinsurance.com",
    origin: "appendix_a",
  },
  {
    legalUnderwriter: "Certas Home and Auto Insurance Company",
    insurerGroup: "Desjardins",
    brandOrProgram: "Desjardins Insurance (agent)",
    distributionType: "agent",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN", "human"],
    origin: "appendix_a",
  },
  {
    legalUnderwriter: "The Personal Insurance Company",
    insurerGroup: "Desjardins",
    brandOrProgram: "The Personal",
    distributionType: "affinity",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN", "membership"],
    quoteUrl: "https://www.thepersonal.com",
    origin: "appendix_a",
  },

  // ---- 12. Economical -------------------------------------------------
  {
    legalUnderwriter: "Economical Mutual Insurance Company",
    insurerGroup: "Economical",
    brandOrProgram: "Economical",
    distributionType: "broker",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN", "human"],
    automationNotes: "Confirm current entity/program mapping vs. Definity post-demutualization.",
    origin: "appendix_a",
  },

  // ---- 13. FA (residual market) ----------------------------------------
  {
    legalUnderwriter: "Facility Association",
    insurerGroup: "Facility Association",
    brandOrProgram: "Facility Association",
    distributionType: "residual",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN", "human"],
    automationNotes:
      "Residual market pool; accessible only via a licensed broker/agent placing a risk the standard market has declined. Not directly quotable by an applicant — structurally manual_handoff.",
    origin: "appendix_a",
  },

  // ---- 14. FMRe (Ontario Mutuals locator) ------------------------------
  {
    legalUnderwriter: "Farm Mutual Reinsurance Plan",
    insurerGroup: "Ontario Mutuals (FMRe)",
    brandOrProgram: "Ontario Mutuals locator",
    distributionType: "mutual",
    productScope: "unknown",
    requirements: ["licence", "VIN", "human"],
    automationNotes:
      "Acts as a locator across individual Ontario farm mutuals, not an underwriter itself; route to the specific mutual once identified.",
    origin: "appendix_a",
  },

  // ---- 15. Gore -----------------------------------------------------
  {
    legalUnderwriter: "Gore Mutual Insurance Company",
    insurerGroup: "Gore",
    brandOrProgram: "Gore Mutual",
    distributionType: "broker",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN", "human"],
    origin: "appendix_a",
  },

  // ---- 16. Hartford -------------------------------------------------
  {
    legalUnderwriter: "Hartford Fire Insurance Company",
    insurerGroup: "Hartford",
    brandOrProgram: "The Hartford",
    distributionType: "broker",
    productScope: "unknown",
    requirements: ["licence", "VIN", "human"],
    automationNotes: "Specialty/commercial-leaning; validate Ontario standard PPA relevance.",
    origin: "appendix_a",
  },

  // ---- 17. Heartland --------------------------------------------------
  {
    legalUnderwriter: "Heartland Farm Mutual Inc.",
    insurerGroup: "Heartland",
    brandOrProgram: "Heartland Farm Mutual",
    distributionType: "mutual",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN", "human"],
    origin: "appendix_a",
  },

  // ---- 18. Intact -----------------------------------------------------
  {
    legalUnderwriter: "Belair Insurance Company Inc.",
    insurerGroup: "Intact",
    brandOrProgram: "belairdirect",
    distributionType: "direct",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN"],
    quoteUrl: "https://www.belairdirect.com",
    automationNotes: "Playwright probe priority 3 (§3a.5) — major direct writer, online journey.",
    origin: "appendix_a",
  },
  {
    legalUnderwriter: "The Guarantee Company of North America",
    insurerGroup: "Intact",
    brandOrProgram: "Intact (The Guarantee)",
    distributionType: "broker",
    productScope: "unknown",
    requirements: ["licence", "VIN", "human"],
    automationNotes: "Validate current Ontario PPA relevance vs. specialty/surety focus.",
    origin: "appendix_a",
  },
  {
    legalUnderwriter: "Intact Insurance Company",
    insurerGroup: "Intact",
    brandOrProgram: "Intact",
    distributionType: "broker",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN", "human"],
    origin: "appendix_a",
  },
  {
    legalUnderwriter: "Jevco Insurance Company",
    insurerGroup: "Intact",
    brandOrProgram: "Intact (Jevco)",
    distributionType: "broker",
    productScope: "nonstandard_PPA",
    requirements: ["licence", "VIN", "human"],
    origin: "appendix_a",
  },
  {
    legalUnderwriter: "Novex Insurance Company",
    insurerGroup: "Intact",
    brandOrProgram: "Intact (Novex)",
    distributionType: "broker",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN", "human"],
    automationNotes: "Validate legacy/affinity program status.",
    origin: "appendix_a",
  },
  {
    legalUnderwriter: "Royal & Sun Alliance Insurance Company of Canada",
    insurerGroup: "Intact",
    brandOrProgram: "Intact (RSA legacy)",
    distributionType: "broker",
    productScope: "unknown",
    requirements: ["licence", "VIN", "human"],
    automationNotes: "Legacy RSA entity absorbed into Intact; validate active status.",
    origin: "appendix_a",
  },
  {
    legalUnderwriter: "Unifund Assurance Company",
    insurerGroup: "Intact",
    brandOrProgram: "Intact (Unifund)",
    distributionType: "broker",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN", "human"],
    automationNotes: "Historically affinity-distributed (CAA-adjacent); validate current channel.",
    origin: "appendix_a",
  },
  {
    legalUnderwriter: "Western Assurance Company",
    insurerGroup: "Intact",
    brandOrProgram: "Intact (Western Assurance)",
    distributionType: "broker",
    productScope: "unknown",
    requirements: ["licence", "VIN", "human"],
    automationNotes: "Validate active Ontario PPA status.",
    origin: "appendix_a",
  },

  // ---- 19. Liberty ----------------------------------------------------
  {
    legalUnderwriter: "Liberty Mutual Insurance Company",
    insurerGroup: "Liberty",
    brandOrProgram: "Liberty Mutual",
    distributionType: "broker",
    productScope: "unknown",
    requirements: ["licence", "VIN", "human"],
    automationNotes: "Specialty/commercial-leaning; validate Ontario standard PPA relevance.",
    origin: "appendix_a",
  },

  // ---- 20. Northbridge ------------------------------------------------
  {
    legalUnderwriter: "Federated Insurance Company of Canada",
    insurerGroup: "Northbridge",
    brandOrProgram: "Federated Insurance",
    distributionType: "broker",
    productScope: "unknown",
    requirements: ["licence", "VIN", "human"],
    automationNotes: "Primarily commercial specialty; validate PPA relevance.",
    origin: "appendix_a",
  },
  {
    legalUnderwriter: "Northbridge General Insurance Corporation",
    insurerGroup: "Northbridge",
    brandOrProgram: "Northbridge",
    distributionType: "broker",
    productScope: "unknown",
    requirements: ["licence", "VIN", "human"],
    automationNotes: "Primarily commercial; validate PPA relevance.",
    origin: "appendix_a",
  },
  {
    legalUnderwriter: "Verassure Insurance Company",
    insurerGroup: "Northbridge",
    brandOrProgram: "Northbridge (Verassure)",
    distributionType: "broker",
    productScope: "unknown",
    requirements: ["licence", "VIN", "human"],
    automationNotes: "Validate active status and PPA relevance.",
    origin: "appendix_a",
  },
  {
    legalUnderwriter: "Zenith Insurance Company",
    insurerGroup: "Northbridge",
    brandOrProgram: "Zenith",
    distributionType: "broker",
    productScope: "nonstandard_PPA",
    requirements: ["licence", "VIN", "human"],
    origin: "appendix_a",
  },

  // ---- 21. Optimum ----------------------------------------------------
  {
    legalUnderwriter: "Optimum Insurance Company Inc.",
    insurerGroup: "Optimum",
    brandOrProgram: "Optimum",
    distributionType: "broker",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN", "human"],
    origin: "appendix_a",
  },

  // ---- 22. PURE -----------------------------------------------------
  {
    legalUnderwriter: "PURE Insurance",
    insurerGroup: "PURE",
    brandOrProgram: "PURE",
    distributionType: "broker",
    productScope: "high_net_worth",
    requirements: ["licence", "VIN", "human"],
    origin: "appendix_a",
  },

  // ---- 23. Peel -----------------------------------------------------
  {
    legalUnderwriter: "Peel Mutual Insurance Company",
    insurerGroup: "Peel",
    brandOrProgram: "Peel Mutual",
    distributionType: "mutual",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN", "human"],
    origin: "appendix_a",
  },

  // ---- 24. Portage ----------------------------------------------------
  {
    legalUnderwriter: "The Portage la Prairie Mutual Insurance Company",
    insurerGroup: "Portage",
    brandOrProgram: "Portage Mutual",
    distributionType: "broker",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN", "human"],
    origin: "appendix_a",
  },

  // ---- 25. SGI ------------------------------------------------------
  {
    legalUnderwriter: "Coachman Insurance Company",
    insurerGroup: "SGI",
    brandOrProgram: "Coachman",
    distributionType: "broker",
    productScope: "nonstandard_PPA",
    requirements: ["licence", "VIN", "human"],
    origin: "appendix_a",
  },
  {
    legalUnderwriter: "SGI CANADA Insurance Services Ltd.",
    insurerGroup: "SGI",
    brandOrProgram: "SGI Canada",
    distributionType: "broker",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN", "human"],
    origin: "appendix_a",
  },

  // ---- 26. Sompo ----------------------------------------------------
  {
    legalUnderwriter: "Endurance Specialty Insurance Company",
    insurerGroup: "Sompo",
    brandOrProgram: "Endurance (Sompo)",
    distributionType: "broker",
    productScope: "unknown",
    requirements: ["licence", "VIN", "human"],
    automationNotes: "Specialty/commercial-leaning; validate PPA relevance.",
    origin: "appendix_a",
  },
  {
    legalUnderwriter: "Sompo Japan Insurance Inc.",
    insurerGroup: "Sompo",
    brandOrProgram: "Sompo Japan",
    distributionType: "broker",
    productScope: "unknown",
    requirements: ["licence", "VIN", "human"],
    automationNotes: "Specialty/commercial-leaning; validate PPA relevance.",
    origin: "appendix_a",
  },

  // ---- 27. TD -------------------------------------------------------
  {
    legalUnderwriter: "Primmum Insurance Company",
    insurerGroup: "TD",
    brandOrProgram: "TD Insurance (Primmum)",
    distributionType: "direct",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN"],
    origin: "appendix_a",
  },
  {
    legalUnderwriter: "Security National Insurance Company",
    insurerGroup: "TD",
    brandOrProgram: "TD Insurance (Security National)",
    distributionType: "affinity",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN", "membership"],
    automationNotes: "Historically affinity/group-plan distributed; validate current channel.",
    origin: "appendix_a",
  },
  {
    legalUnderwriter: "TD General Insurance Company",
    insurerGroup: "TD",
    brandOrProgram: "TD Insurance",
    distributionType: "direct",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN"],
    quoteUrl: "https://www.tdinsurance.com",
    origin: "appendix_a",
  },

  // ---- 28. Tokio ----------------------------------------------------
  {
    legalUnderwriter: "Tokio Marine and Nichido Fire Insurance Co., Ltd.",
    insurerGroup: "Tokio",
    brandOrProgram: "Tokio Marine",
    distributionType: "broker",
    productScope: "unknown",
    requirements: ["licence", "VIN", "human"],
    automationNotes: "Specialty/commercial-leaning; validate PPA relevance.",
    origin: "appendix_a",
  },

  // ---- 29. Travelers --------------------------------------------------
  {
    legalUnderwriter: "The Dominion of Canada General Insurance Company",
    insurerGroup: "Travelers",
    brandOrProgram: "Travelers (Dominion)",
    distributionType: "broker",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN", "human"],
    origin: "appendix_a",
  },

  // ---- 30. Wawanesa ---------------------------------------------------
  {
    legalUnderwriter: "The Wawanesa Mutual Insurance Company",
    insurerGroup: "Wawanesa",
    brandOrProgram: "Wawanesa",
    distributionType: "broker",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN", "human"],
    automationNotes: "Brief marks broker channel for Ontario; validate whether wawanesa.com offers direct ON PPA quoting.",
    origin: "appendix_a",
  },

  // ---- 31. XL -------------------------------------------------------
  {
    legalUnderwriter: "XL Specialty Insurance Company",
    insurerGroup: "XL",
    brandOrProgram: "XL (AXA XL)",
    distributionType: "broker",
    productScope: "unknown",
    requirements: ["licence", "VIN", "human"],
    automationNotes: "Specialty/commercial-leaning; validate PPA relevance.",
    origin: "appendix_a",
  },

  // ---- 32. Zurich -----------------------------------------------------
  {
    legalUnderwriter: "Zurich Insurance Company",
    insurerGroup: "Zurich",
    brandOrProgram: "Zurich",
    distributionType: "broker",
    productScope: "unknown",
    requirements: ["licence", "VIN", "human"],
    automationNotes:
      "Specialty/broker routes for Zurich itself; the Ontario-car-relevant route is Square One (see supplemental row) which underwrites through Zurich.",
    origin: "appendix_a",
  },

  // ================= Supplemental routes (Route Strategy §Appendix) =================

  {
    legalUnderwriter: "Zurich Insurance Company (via Square One Insurance Services MGA)",
    insurerGroup: "Zurich",
    brandOrProgram: "Square One",
    distributionType: "MGA_program",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN"],
    quoteUrl: "https://www.squareone.ca",
    automationNotes:
      "Playwright probe priority 2 (§3a.5) — online, direct, modern flow, underwritten by Zurich. Named in brief's Appendix A note under Zurich, not as its own Appendix A group.",
    origin: "supplemental",
  },
  {
    legalUnderwriter: "RBC Insurance",
    insurerGroup: "RBC",
    brandOrProgram: "RBC Insurance",
    distributionType: "direct",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN"],
    quoteUrl: "https://www.rbcinsurance.com",
    automationNotes:
      "Named in brief's direct/exclusive-agent route strategy but not among the 32 Appendix A groups; added for market completeness.",
    origin: "supplemental",
  },
  {
    legalUnderwriter: "LowestRates.ca (brokerage aggregator)",
    insurerGroup: "LowestRates.ca",
    brandOrProgram: "LowestRates.ca",
    distributionType: "aggregator",
    productScope: "standard_PPA",
    requirements: ["licence"],
    quoteUrl: "https://www.lowestrates.ca",
    automationNotes:
      "Broad broker engine A. Brief names its panel as including CAA, Coachman, Economical, Gore, Pafco, Pembridge, SGI, Travelers, Zenith — those carriers already have their own registry rows; do not double-count, cross-reference distinct_rate_source_id instead. Verify panel live.",
    origin: "supplemental",
  },
  {
    legalUnderwriter: "Rates.ca (brokerage aggregator)",
    insurerGroup: "Rates.ca",
    brandOrProgram: "Rates.ca",
    distributionType: "aggregator",
    productScope: "standard_PPA",
    requirements: ["licence"],
    quoteUrl: "https://www.rates.ca",
    automationNotes: "Alternative broad broker engine to LowestRates.ca per route strategy; pick one as primary live probe.",
    origin: "supplemental",
  },
  {
    legalUnderwriter: "Surex (brokerage aggregator)",
    insurerGroup: "Surex",
    brandOrProgram: "Surex",
    distributionType: "aggregator",
    productScope: "standard_PPA",
    requirements: ["licence"],
    quoteUrl: "https://www.surex.com",
    automationNotes:
      "Broad broker engine B. Brief names its panel as including Aviva, Intact, Jevco, Wawanesa, CAA, Coachman, Definity/Economical, Gore, Pafco, Pembridge, SGI, Travelers — cross-reference existing rows rather than double-counting; panel subject to live profile.",
    origin: "supplemental",
  },
  {
    legalUnderwriter: "ThinkInsure (RIBO-licensed broker)",
    insurerGroup: "ThinkInsure",
    brandOrProgram: "ThinkInsure",
    distributionType: "broker",
    productScope: "standard_PPA",
    requirements: ["licence", "human"],
    quoteUrl: "https://www.thinkinsure.ca",
    automationNotes:
      "Independent broker verifier. Ontario law requires RIBO-licensed brokers to disclose their full carrier list and obtained quotes on request — ask once, preserve as evidence (bounded-attempt policy, §Appendix).",
    origin: "supplemental",
  },
  {
    legalUnderwriter: "Onlia Insurance Company (Aviva-backed digital insurer)",
    insurerGroup: "Onlia",
    brandOrProgram: "Onlia",
    distributionType: "direct",
    productScope: "standard_PPA",
    requirements: ["licence", "VIN"],
    quoteUrl: "https://www.onlia.ca",
    origin: "supplemental",
  },
  {
    legalUnderwriter: "Scoop Insurance (independent broker verifier candidate)",
    insurerGroup: "Scoop",
    brandOrProgram: "Scoop",
    distributionType: "broker",
    productScope: "standard_PPA",
    requirements: ["licence", "human"],
    automationNotes: "Named as an independent-broker-verifier candidate in the brief; confirm live domain and RIBO licensing during verification.",
    origin: "supplemental",
  },
  {
    legalUnderwriter: "Hagerty Canada (collector program, underwritten by Aviva)",
    insurerGroup: "Hagerty",
    brandOrProgram: "Hagerty",
    distributionType: "MGA_program",
    productScope: "collector",
    requirements: ["licence", "VIN"],
    quoteUrl: "https://www.hagerty.ca",
    automationNotes:
      "Collector-vehicle program. Participant owns no vehicle, so this route is expected to resolve ineligible/specialty_only regardless of underwriting depth — a useful contrast case (§4 route-planner example).",
    origin: "supplemental",
  },
];
