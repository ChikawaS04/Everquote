# Ontario All-Quote Agent

An agentic market-discovery and **honest-accounting** tool for Ontario private-passenger auto (PPA) insurance.

Take one intake profile, map the entire Ontario PPA market, route every rate source correctly, obtain
estimate-only evidence wherever a flow lawfully permits it, and hand off cleanly and honestly everywhere a
licence, VIN, identity check or licensed advice is required — **never faking anything**.

The participant this is built for holds **only a G1 licence and owns no vehicle (no VIN)**. That means few or
zero firm quotes are obtainable, and the system is designed around that fact: it treats every wall
(licence required, CAPTCHA, VIN demanded, membership required) as a *successful, recorded outcome* rather
than a failure. Both the reach and the uncertainty of the system are meant to be legible.

The full design document is [`BUILD_SPEC.md`](./BUILD_SPEC.md) — it is the source of truth for scope,
guardrails and protected decisions.

---

## Guardrails (non-negotiable)

These are structural, not advisory. See `BUILD_SPEC.md` §2.

- **No binding, purchasing, paying, signing or submitting an application declaration.** Every flow stops at the quote/estimate.
- **No fabricated, borrowed or altered driver's licence numbers.** Where a route demands one, the run stops and records a terminal status.
- **Default mode is `estimate_only`** against a clearly-labelled hypothetical, licence-number-free profile that is never presented to a real person as a real applicant.
- **No bypassing CAPTCHAs, bot controls, auth, rate limits or destination terms.** Hitting one is recorded as `blocked`, never evaded.
- **No changing material facts across insurers** to manufacture a lower premium.
- **Voice is designed, not executed.** No real calls are placed in this build.
- **Sensitive data is vaulted and redacted everywhere else** — logs, prompts, screenshots, the dashboard, the run report and source control. The LLM field-mapper receives field *labels and structure* only, never participant values.

---

## Pipeline

```
Consent-aware intake → Market registry → Route planner →
Browser & (designed) voice agents → Evidence store →
Quote normalizer → Coverage ledger & comparison
```

Each stage is a workspace that imports the **same canonical types** from `@oaqa/schema`. The schema is the
spine: there is no database, and the pipeline's artifacts are plain versioned JSON/CSV so they stay
human-readable and diffable.

| Stage | Package | Emits |
|---|---|---|
| Market registry | `registry/` | `registry.json`, `registry.csv`, `registry-summary.json` |
| Route planner | `planner/` | `planned-routes.json`, `planned-routes-summary.json` |
| Normalizer + coverage ledger + metrics | `normalizer/` | `normalized-output.json` |
| Comparison UI | `dashboard/` | React + Vite SPA, no backend |

---

## Repository layout

```
schema/        canonical types — OAF-1 superset intake, consent/mode, coverage
               benchmark, registry record, quote result, terminal-status enum
registry/      market registry: Appendix A seed + enrichment + dedup/reconcile
planner/       deterministic policy engine: (source requirements × our
               capabilities) → route + predicted terminal status
normalizer/    maps results onto the frozen benchmark → comparable /
               non_comparable, plus the five coverage metrics
dashboard/     React+Vite SPA that statically reads the normalized JSON:
               coverage banner, benchmark strip, results GROUPED BY STATUS,
               evidence drawer, market-map view
BUILD_SPEC.md  the full build specification
```

Planned but not yet implemented: `agents/browser` (Playwright estimate-only journeys), `agents/voice`
(designed, non-executing handoff payload + disclosure script), `vault/` (encrypted sensitive-field store +
redaction utilities), `evidence/` and `reports/`. They are declared as workspaces in `package.json` and
described in `BUILD_SPEC.md` §9.

---

## Getting started

Requires **Node.js ≥ 20** (npm workspaces).

```bash
npm install
```

Run the whole pipeline — registry → planner → normalizer → dashboard build:

```bash
npm run pipeline
```

Or run a single stage (each builds its TypeScript, then emits its data artifacts):

```bash
npm run registry:build      # → registry/data/
npm run planner:build       # → planner/data/
npm run normalizer:build    # → normalizer/data/
```

Serve the dashboard locally:

```bash
npm run dashboard:dev
```

`normalizer/data/normalized-output.json` is the committed source of truth; the dashboard's
`public/data/` copy is synced from it automatically on `dev` and `build` and is gitignored.

---

## Coverage benchmark 🔒

Every route is measured against **one frozen benchmark package** so comparisons are apples-to-apples. It
lives in a single config object (`normalizer/src/benchmarkConfig.ts`) that the normalizer imports — never
hardcoded inline, so the freeze is structurally enforceable.

- Third-party liability **$2,000,000**
- **DCPD included**
- Accident benefits: **mandatory medical / rehabilitation / attendant care only** (per the July 1, 2026 Ontario change, every other AB is optional and captured explicitly as `included | excluded | unavailable | unknown`)
- **Collision and comprehensive, $1,000 deductible each**
- **OPCF 44R** (family protection)
- **No telematics** unless separately opted in

Anything that cannot match the benchmark is preserved and marked `non_comparable` with **every** difference listed.

---

## Terminal statuses

The taxonomy is the core domain showpiece, implemented verbatim from the brief in `schema/src/status.ts`:

`quoted_comparable` · `quoted_non_comparable` · `estimate_only` · `callback_required` · `manual_handoff` ·
`ineligible` · `affinity_restricted` · `specialty_only` · `duplicate_rate_source` · `not_currently_writing` ·
`blocked` · `unreachable` · `unresolved`

> 🔒 **Protected UI decision:** results are **grouped by terminal status** (Comparable → Estimates →
> Handoffs → Blocked/Ineligible → Duplicates → Unresolved), never flattened into one table. Sort and filter
> operate *within* groups. The **Unresolved** group is always rendered and never collapsed by default — it is
> the honesty of the system made visible. `unresolved` is never silently converted to "not offered."

---

## Metrics & honest accounting

The dashboard reports five metrics (`normalizer/src/metrics.ts`):

- **Market completion** — distinct rate sources with an evidence-backed terminal status ÷ verified applicable rate sources
- **Comparable quote yield** — `quoted_comparable` results ÷ verified applicable rate sources
- **Evidence rate** — outcomes with a valid source + timestamp + redacted artifact ÷ all outcomes
- **Duplicate suppression** — brands/routes mapped onto an existing `distinct_rate_source_id` instead of double-counted
- **Freshness** — % of registry records verified during the hackathon window

The first three move **only on `live_evidence` results**. Planner predictions populate the routing view, never
these metrics — so until the browser agent lands they read ~0. That is correct and honest, not a bug.
`unresolved` records stay in the denominator throughout.

---

## Current state

| Day | Scope | Status |
|---|---|---|
| Day 1 | Canonical schema + market registry pipeline | ✅ done |
| Day 2 | Route planner, normalizer + metrics, dashboard | ✅ done |
| Day 3 | Playwright estimate-only journeys + redacted evidence capture | ⬜ not started |
| Day 3.5 | Run report, architecture & safety note, known limitations | ⬜ not started |

Today the registry carries **68 rows** — 59 distinct legal entities reconciled from Appendix A's 60 raw
tokens, plus 9 supplemental distribution routes kept as a separate layer and never blended into the
Appendix A count. The planner produces a predicted terminal status for all 68, and the normalizer turns
them into a complete, grouped market map running entirely on designed/predicted data with no live browser
required.
