import type { RegistrySeedInput } from "./seedTypes.js";
import { APPENDIX_A_RAW_TOKENS } from "./appendixARawTokens.js";

export interface MergedGroup {
  legalUnderwriter: string;
  rawTokens: string[];
}

export interface ReconciliationResult {
  rawTokenCount: number;
  distinctLegalEntityCount: number;
  mergedGroups: MergedGroup[];
  /** Raw tokens whose legalUnderwriter has no matching appendix_a seed row — a genuine gap. */
  unaccountedRawTokens: string[];
  /** appendix_a-origin seed rows with no raw token pointing at them — a row that shouldn't exist. */
  seedRowsWithoutRawToken: string[];
  /** Rows where mergedAliases doesn't exactly match the raw tokens the table says should merge into it. */
  mergedAliasesMismatches: string[];
  ok: boolean;
}

/**
 * Audits the seed against APPENDIX_A_RAW_TOKENS (BUILD_SPEC.md §Appendix,
 * verified 60 raw tokens). Every raw token must resolve to exactly one
 * appendix_a seed row; every merge (>1 token -> 1 row) must be recorded on
 * that row's mergedAliases. Fails loud (ok: false) rather than silently
 * shipping a wrong headline number — see build.ts.
 */
export function reconcileAppendixA(seed: RegistrySeedInput[]): ReconciliationResult {
  const appendixASeed = seed.filter((s) => s.origin === "appendix_a");
  const seedByLegalUnderwriter = new Map(appendixASeed.map((s) => [s.legalUnderwriter, s]));

  const tokensByLegalUnderwriter = new Map<string, string[]>();
  for (const { legalUnderwriter, rawToken } of APPENDIX_A_RAW_TOKENS) {
    const existing = tokensByLegalUnderwriter.get(legalUnderwriter) ?? [];
    existing.push(rawToken);
    tokensByLegalUnderwriter.set(legalUnderwriter, existing);
  }

  const unaccountedRawTokens: string[] = [];
  const mergedGroups: MergedGroup[] = [];
  const mergedAliasesMismatches: string[] = [];

  for (const [legalUnderwriter, rawTokens] of tokensByLegalUnderwriter) {
    const seedRow = seedByLegalUnderwriter.get(legalUnderwriter);
    if (!seedRow) {
      unaccountedRawTokens.push(...rawTokens);
      continue;
    }
    if (rawTokens.length > 1) {
      mergedGroups.push({ legalUnderwriter, rawTokens });
      const declared = seedRow.mergedAliases ?? [];
      const declaredSorted = [...declared].sort();
      const expectedSorted = [...rawTokens].sort();
      const matches = declaredSorted.length === expectedSorted.length && declaredSorted.every((v, i) => v === expectedSorted[i]);
      if (!matches) {
        mergedAliasesMismatches.push(
          `${legalUnderwriter}: expected mergedAliases [${expectedSorted.join(", ")}], found [${declaredSorted.join(", ")}]`,
        );
      }
    }
  }

  const seedRowsWithoutRawToken = appendixASeed
    .filter((s) => !tokensByLegalUnderwriter.has(s.legalUnderwriter))
    .map((s) => s.legalUnderwriter);

  const ok = unaccountedRawTokens.length === 0 && seedRowsWithoutRawToken.length === 0 && mergedAliasesMismatches.length === 0;

  return {
    rawTokenCount: APPENDIX_A_RAW_TOKENS.length,
    distinctLegalEntityCount: tokensByLegalUnderwriter.size,
    mergedGroups,
    unaccountedRawTokens,
    seedRowsWithoutRawToken,
    mergedAliasesMismatches,
    ok,
  };
}
