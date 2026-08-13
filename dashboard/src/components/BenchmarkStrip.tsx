import type { CoverageBenchmark } from "@oaqa/schema";

const currency = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

interface BenchmarkStripProps {
  benchmark: CoverageBenchmark;
}

/**
 * Persistent benchmark strip (BUILD_SPEC.md §4a) — every price on the page
 * is anchored to these frozen values, imported by the normalizer from the
 * single config object (BUILD_SPEC.md §3a.4), never hardcoded per-quote.
 */
export function BenchmarkStrip({ benchmark }: BenchmarkStripProps) {
  return (
    <section className="card benchmark-strip" aria-label="Coverage benchmark">
      <span>
        <strong>{currency.format(benchmark.thirdPartyLiability)}</strong> TPL
      </span>
      <span>DCPD {benchmark.dcpdIncluded ? "included" : "excluded"}</span>
      <span>Mandatory AB: medical / rehab / attendant care only</span>
      <span>
        Coll + comp: <strong>{currency.format(benchmark.collisionDeductible)}</strong> deductible each
      </span>
      {benchmark.familyProtectionOpcf44R && <span>OPCF 44R</span>}
      <span>{benchmark.telematicsOptIn ? "Telematics opted in" : "No telematics"}</span>
      <span>{benchmark.termMonths}-month term</span>
    </section>
  );
}
