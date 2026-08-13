import type { QuoteResult } from "@oaqa/schema";

interface MarketMapViewProps {
  results: QuoteResult[];
}

/**
 * BUILD_SPEC.md §4a market-map toggle: group -> legal underwriter -> brand
 * -> distribution type, duplicates collapsed onto distinct_rate_source_id.
 * Domain-understanding surface, kept structurally correct and visually
 * plain for the Day 2 skeleton (polish deferred to Day 3.5, BUILD_SPEC.md §4a).
 */
export function MarketMapView({ results }: MarketMapViewProps) {
  const byInsurerGroup = new Map<string, QuoteResult[]>();
  for (const r of results) {
    const list = byInsurerGroup.get(r.source.insurerGroup) ?? [];
    list.push(r);
    byInsurerGroup.set(r.source.insurerGroup, list);
  }

  const distinctRateSourceCounts = new Map<string, number>();
  for (const r of results) {
    distinctRateSourceCounts.set(r.source.distinctRateSourceId, (distinctRateSourceCounts.get(r.source.distinctRateSourceId) ?? 0) + 1);
  }

  return (
    <section className="card market-map" aria-label="Market map">
      {[...byInsurerGroup.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([insurerGroup, members]) => (
          <details className="market-map__group" key={insurerGroup} open>
            <summary>
              {insurerGroup} ({members.length})
            </summary>
            <ul className="market-map__brand-list">
              {members.map((m) => {
                const isCollapsedDuplicate = (distinctRateSourceCounts.get(m.source.distinctRateSourceId) ?? 0) > 1;
                return (
                  <li key={m.resultId}>
                    {m.source.brand} → {m.source.legalUnderwriter} · {m.source.distributionType}
                    {isCollapsedDuplicate && " · collapsed onto shared distinct_rate_source_id"}
                  </li>
                );
              })}
            </ul>
          </details>
        ))}
    </section>
  );
}
