/**
 * Source of truth for the reconciliation audit. These are the raw entity
 * tokens as literally listed in BUILD_SPEC.md's Appendix A, one row per
 * token — NOT deduplicated, NOT normalized to full legal names. Verified
 * by parsing BUILD_SPEC.md programmatically (semicolon-split within each
 * group's bullet): exactly 60 tokens across the 32 groups, matching the
 * brief's own count.
 *
 * `legalUnderwriter` is the full legal name this raw token resolves to in
 * seed.ts — this is the only hand-curated part of this file (the brief
 * uses shorthand like "Belair" or "Jevco"; seed.ts uses full legal names).
 * reconcile.ts cross-checks every one of these 60 rows against the actual
 * SEED array, so a typo here shows up as a build failure, not a silent gap.
 */
export interface AppendixARawToken {
  group: string;
  rawToken: string;
  legalUnderwriter: string;
}

export const APPENDIX_A_RAW_TOKENS: AppendixARawToken[] = [
  { group: "AIG", rawToken: "AIG Insurance Company of Canada", legalUnderwriter: "AIG Insurance Company of Canada" },

  { group: "Allstate", rawToken: "Allstate Insurance Company of Canada", legalUnderwriter: "Allstate Insurance Company of Canada" },
  { group: "Allstate", rawToken: "Esurance Insurance Company of Canada", legalUnderwriter: "Esurance Insurance Company of Canada" },
  { group: "Allstate", rawToken: "Pafco Insurance Company", legalUnderwriter: "Pafco Insurance Company" },
  { group: "Allstate", rawToken: "Pembridge Insurance Company", legalUnderwriter: "Pembridge Insurance Company" },

  { group: "Aviva", rawToken: "Aviva General", legalUnderwriter: "Aviva General Insurance Company" },
  { group: "Aviva", rawToken: "Aviva Insurance Company of Canada", legalUnderwriter: "Aviva Insurance Company of Canada" },
  { group: "Aviva", rawToken: "S&Y", legalUnderwriter: "Scottish & York Insurance Company" },
  { group: "Aviva", rawToken: "Scottish & York", legalUnderwriter: "Scottish & York Insurance Company" },
  { group: "Aviva", rawToken: "Traders General", legalUnderwriter: "Traders General Insurance Company" },

  { group: "Beneva", rawToken: "Unica Insurance Inc.", legalUnderwriter: "Unica Insurance Inc." },

  { group: "CAA", rawToken: "CAA Insurance Company", legalUnderwriter: "CAA Insurance Company" },
  { group: "CAA", rawToken: "Echelon Insurance", legalUnderwriter: "Echelon Insurance" },

  { group: "Chubb", rawToken: "Chubb Insurance Company of Canada", legalUnderwriter: "Chubb Insurance Company of Canada" },

  { group: "Co-op", rawToken: "COSECO", legalUnderwriter: "COSECO Insurance Company" },
  { group: "Co-op", rawToken: "CUMIS General", legalUnderwriter: "CUMIS General Insurance Company" },
  { group: "Co-op", rawToken: "Co-operators General", legalUnderwriter: "Co-operators General Insurance Company" },
  { group: "Co-op", rawToken: "The Sovereign General", legalUnderwriter: "The Sovereign General Insurance Company" },

  { group: "Commonwell", rawToken: "The Commonwell Mutual Insurance Group", legalUnderwriter: "The Commonwell Mutual Insurance Group" },

  { group: "Continental", rawToken: "Continental Casualty Company", legalUnderwriter: "Continental Casualty Company" },

  { group: "Definity", rawToken: "Definity Insurance Company", legalUnderwriter: "Definity Insurance Company" },
  { group: "Definity", rawToken: "Sonnet Insurance Company", legalUnderwriter: "Sonnet Insurance Company" },

  { group: "Desjardins", rawToken: "Certas Direct", legalUnderwriter: "Certas Direct Insurance Company" },
  { group: "Desjardins", rawToken: "Certas Home and Auto", legalUnderwriter: "Certas Home and Auto Insurance Company" },
  { group: "Desjardins", rawToken: "The Personal Insurance Company", legalUnderwriter: "The Personal Insurance Company" },

  { group: "Economical", rawToken: "Economical Mutual Insurance Company", legalUnderwriter: "Economical Mutual Insurance Company" },

  { group: "FA", rawToken: "Facility Association", legalUnderwriter: "Facility Association" },

  { group: "FMRe", rawToken: "Farm Mutual Reinsurance Plan (on behalf of Ontario Mutuals)", legalUnderwriter: "Farm Mutual Reinsurance Plan" },

  { group: "Gore", rawToken: "Gore Mutual Insurance Company", legalUnderwriter: "Gore Mutual Insurance Company" },

  { group: "Hartford", rawToken: "Hartford Fire Insurance Company", legalUnderwriter: "Hartford Fire Insurance Company" },

  { group: "Heartland", rawToken: "Heartland Farm Mutual Inc.", legalUnderwriter: "Heartland Farm Mutual Inc." },

  { group: "Intact", rawToken: "Belair", legalUnderwriter: "Belair Insurance Company Inc." },
  { group: "Intact", rawToken: "The Guarantee Company of North America", legalUnderwriter: "The Guarantee Company of North America" },
  { group: "Intact", rawToken: "Intact Insurance Company", legalUnderwriter: "Intact Insurance Company" },
  { group: "Intact", rawToken: "Jevco", legalUnderwriter: "Jevco Insurance Company" },
  { group: "Intact", rawToken: "Novex", legalUnderwriter: "Novex Insurance Company" },
  { group: "Intact", rawToken: "Royal & SunAlliance Canada", legalUnderwriter: "Royal & Sun Alliance Insurance Company of Canada" },
  { group: "Intact", rawToken: "Unifund", legalUnderwriter: "Unifund Assurance Company" },
  { group: "Intact", rawToken: "Western Assurance", legalUnderwriter: "Western Assurance Company" },

  { group: "Liberty", rawToken: "Liberty Mutual Insurance Company", legalUnderwriter: "Liberty Mutual Insurance Company" },

  { group: "Northbridge", rawToken: "Federated", legalUnderwriter: "Federated Insurance Company of Canada" },
  { group: "Northbridge", rawToken: "Northbridge General", legalUnderwriter: "Northbridge General Insurance Corporation" },
  { group: "Northbridge", rawToken: "Verassure", legalUnderwriter: "Verassure Insurance Company" },
  { group: "Northbridge", rawToken: "Zenith", legalUnderwriter: "Zenith Insurance Company" },

  { group: "Optimum", rawToken: "Optimum Insurance Company Inc.", legalUnderwriter: "Optimum Insurance Company Inc." },

  { group: "PURE", rawToken: "PURE Insurance", legalUnderwriter: "PURE Insurance" },

  { group: "Peel", rawToken: "Peel Mutual Insurance Company", legalUnderwriter: "Peel Mutual Insurance Company" },

  { group: "Portage", rawToken: "The Portage la Prairie Mutual Insurance Company", legalUnderwriter: "The Portage la Prairie Mutual Insurance Company" },

  { group: "SGI", rawToken: "Coachman Insurance Company", legalUnderwriter: "Coachman Insurance Company" },
  { group: "SGI", rawToken: "SGI CANADA Insurance Services Ltd.", legalUnderwriter: "SGI CANADA Insurance Services Ltd." },

  { group: "Sompo", rawToken: "Endurance Specialty", legalUnderwriter: "Endurance Specialty Insurance Company" },
  { group: "Sompo", rawToken: "Sompo Japan Insurance Inc.", legalUnderwriter: "Sompo Japan Insurance Inc." },

  { group: "TD", rawToken: "Primmum", legalUnderwriter: "Primmum Insurance Company" },
  { group: "TD", rawToken: "Security National", legalUnderwriter: "Security National Insurance Company" },
  { group: "TD", rawToken: "TD General", legalUnderwriter: "TD General Insurance Company" },

  { group: "Tokio", rawToken: "Tokio Marine and Nichido Fire", legalUnderwriter: "Tokio Marine and Nichido Fire Insurance Co., Ltd." },

  { group: "Travelers", rawToken: "The Dominion of Canada General Insurance Company", legalUnderwriter: "The Dominion of Canada General Insurance Company" },

  { group: "Wawanesa", rawToken: "The Wawanesa Mutual Insurance Company", legalUnderwriter: "The Wawanesa Mutual Insurance Company" },

  { group: "XL", rawToken: "XL Specialty Insurance Company", legalUnderwriter: "XL Specialty Insurance Company" },

  { group: "Zurich", rawToken: "Zurich Insurance Company", legalUnderwriter: "Zurich Insurance Company" },
];
