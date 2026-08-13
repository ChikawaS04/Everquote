import type { CoverageMetrics, QuoteResult } from "@oaqa/schema";
import { RESULT_GROUPS, groupForStatus } from "../statusGroups.js";

const pct = new Intl.NumberFormat("en-CA", { style: "percent", maximumFractionDigits: 1 });

interface StatTileProps {
  label: string;
  value: number;
  note?: string;
}

function StatTile({ label, value, note }: StatTileProps) {
  return (
    <div className="stat-tile">
      <div className="stat-value">{pct.format(value)}</div>
      <div className="stat-label">{label}</div>
      {note && <div className="result-group__hidden-note">{note}</div>}
    </div>
  );
}

interface CoverageBannerProps {
  metrics: CoverageMetrics;
  results: QuoteResult[];
}

/**
 * The thesis, first thing seen (BUILD_SPEC.md §4a). Three of the five
 * metrics read ~0 on Day 2 by design — no live evidence exists yet — while
 * the distribution bar below is full of predicted routing outcomes. Those
 * two views are computed from different inputs on purpose: metrics from
 * live_evidence results only, the bar from every predicted+live status. See
 * /normalizer/src/metrics.ts.
 */
export function CoverageBanner({ metrics, results }: CoverageBannerProps) {
  const groupCounts = RESULT_GROUPS.map((group) => ({
    ...group,
    count: results.filter((r) => groupForStatus(r.status) === group.id).length,
  }));
  const total = results.length || 1;

  return (
    <section className="card coverage-banner" aria-labelledby="coverage-banner-heading">
      <h2 id="coverage-banner-heading" style={{ marginTop: 0, fontSize: "1rem" }}>
        Market coverage
      </h2>
      <div className="stat-tiles">
        <StatTile label="Market completion" value={metrics.marketCompletion} note="live evidence only" />
        <StatTile label="Comparable yield" value={metrics.comparableQuoteYield} note="live evidence only" />
        <StatTile label="Evidence rate" value={metrics.evidenceRate} note="live evidence only" />
        <StatTile label="Duplicate suppression" value={metrics.duplicateSuppression} note="registry reconciliation" />
        <StatTile label="Freshness" value={metrics.freshness} note="live-verified during window" />
      </div>

      <div
        className="distribution-bar"
        role="img"
        aria-label={groupCounts.map((g) => `${g.label}: ${g.count} of ${results.length}`).join(", ")}
      >
        {groupCounts
          .filter((g) => g.count > 0)
          .map((g) => (
            <div
              key={g.id}
              className="distribution-bar__segment"
              style={{ width: `${(g.count / total) * 100}%`, background: `var(${g.colorVar})` }}
              title={`${g.label}: ${g.count} (${pct.format(g.count / total)})`}
            />
          ))}
      </div>
      <div className="distribution-legend">
        {groupCounts.map((g) => (
          <span className="distribution-legend__item" key={g.id}>
            <span className="swatch" style={{ background: `var(${g.colorVar})` }} />
            {g.label}: {g.count}
          </span>
        ))}
      </div>
    </section>
  );
}
