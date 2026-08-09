# Ontario All-Quote Agent — Build Specification

> **Handoff document for implementation.** This spec was produced during a planning session for the *Ontario All-Quote Agent Challenge* hackathon. It is written for a developer (or a coding agent in VS Code) to implement from. Read the whole document before writing code. When in doubt, prefer the choices that make the system's **reach and uncertainty legible** over choices that maximize the number of raw results — that is the explicit winning principle of the challenge.

---

## 1. Context & participant situation

We are building an **agentic personal insurance-shopping tool** for a single participant (an Ontario resident) that takes their profile once and attempts to obtain or account for a comparable auto-insurance quote from **every distinct Ontario private-passenger auto (PPA) rate source** the participant can lawfully and truthfully reach — across direct writers, exclusive agents, broker panels, aggregators, affinity programs, specialty/MGA programs, mutuals, and the residual market (Facility Association).

**Critical participant fact that shapes the entire design:** the participant holds **only a valid G1 licence and owns no vehicle** (no VIN). This places us squarely in the challenge's **discovery + estimate-only lane**, which the brief explicitly states can win. We will realistically produce **few or zero firm `quoted_comparable` rates**, and that is acceptable. The challenge is judged on market discovery, routing, evidence, honest accounting, privacy/safety, normalization, and communication — **not** on the price obtained.

### The winning thesis
> "One intake. I map the entire Ontario market, route every source correctly, obtain estimate-only evidence wherever flows permit it, and hand off cleanly and honestly everywhere a licence/VIN/identity is required — never faking anything. Both my reach and my uncertainty are legible."

This targets four judging criteria hard — **domain understanding, coverage-and-honesty, privacy-and-safety, communication** — all of which are fully achievable without a licence or a car.

---

## 2. Hard guardrails (non-negotiable — violating any is disqualifying)

These are absolute. The implementation must make them structurally impossible where feasible, not merely discouraged.

- **No binding, purchasing, paying, signing, or submitting an application declaration.** Every flow stops at the quote/estimate. No exceptions.
- **No fabricated, borrowed, generated, or altered driver's licence numbers.** The participant has only a G1; where a route demands a licence number we **stop and mark a terminal status** (`manual_handoff` / `estimate_only` / `blocked`). We never invent one.
- **Default operating mode is `estimate_only`** using a **clearly-labelled hypothetical profile that contains NO licence number** and never enters a verification, consent, declaration, callback, or purchase step, and is never represented to a real person as a real applicant.
- **No bypassing CAPTCHAs, bot controls, authentication, rate limits, or destination terms.** On hitting one, **record the blocker and stop** (`blocked`). Never evade.
- **No changing material facts across insurers** to manufacture a lower premium.
- **Voice is DESIGNED but NOT EXECUTED** in this build (see §7). We ship the disclosed-handoff design as an artifact; we place no real calls.
- **Sensitive data** (licence #, DOB, address, claims history, VIN, voice) lives in an encrypted vault, is injected only into the destination that needs it, and is **redacted everywhere else** — never in prompts, logs, traces, screenshots, the dashboard UI, the run report, or source control. **Specifically: the LLM field-mapper (§3a.2) receives field labels/structure only — never the participant's actual field values.**

---

## 3. Tech stack

**Language: TypeScript on Node.js.** Chosen because the build has four moving parts — browser agent, LLM field-mapper, data pipeline, and a web dashboard — and TypeScript lets all four share **one language, one toolchain, and one set of types**. For a solo ~3.5-day sprint, eliminating cross-language context-switching is worth more than Python's data-scripting edge (our pipeline is light mapping + metrics, not heavy numerics).

Key consequence: **the canonical schema IS the type system.** Every pipeline stage imports the same `type`/`interface` definitions, and that single schema file is the literal source of truth the whole system compiles against — which is also an excellent thing to show judges.

| Concern | Choice | Rationale |
|---|---|---|
| Language / runtime | TypeScript + Node.js | One language across all four subsystems; JSON-native |
| Browser automation | **Playwright** | Deterministic, scriptable, first-class screenshot/evidence capture, reliable to demo live. Preferred over a full computer-use agent, which is more adaptive but far more fragile in a live walkthrough |
| Field mapping | Small LLM-driven mapper | Maps each site's form questions → canonical schema; flags genuinely new fields so we ask the user only once |
| Data store | Plain versioned **JSON/CSV files** | No database needed; keeps the required registry artifact human-readable and diffable for judges |
| Dashboard | **React + Vite SPA, no backend** — statically reads normalized JSON (see §4a) | Web-native, shares types + language; nothing to break live; client-side sort/filter/group only |
| Secrets/PII | Encrypted local vault module + redaction utilities | Enforces the privacy guardrail structurally |

> Implementation note: keep dependencies minimal. A single monorepo (npm workspaces or a plain shared `tsconfig` with path aliases) is fine and preferable to over-engineering.

---

## 3a. Resolved implementation decisions

These five points were open in earlier drafts and are now **decided by the spec owner**. Treat them as settled; flag the owner before diverging.

1. **Monorepo tooling → npm workspaces.** Use npm workspaces (not bare tsconfig path aliases). Reason: workspaces give per-package dependencies and real build boundaries, which we need — `/dashboard` pulls React+Vite, `/agents/browser` pulls Playwright, and `/schema` must stay dependency-free so everything can import it cheaply. *Fallback:* if the workspace toolchain fights you in the first hour, a shared `tsconfig` with path aliases is acceptable — but default to workspaces. Low-stakes, reversible.

2. **Field-mapper LLM → Anthropic API, Haiku-class model.** The mapper's job is narrow structured extraction (map a page's form fields → canonical schema, flag genuinely-new fields), so the cheapest fast model is correct — no Opus-tier cost/latency. Two hard requirements:
   - Run it **low-temperature and validate its output against the canonical schema types before use** — never trust raw LLM JSON; parse-and-validate.
   - **No sensitive field *values* ever enter the mapper prompt.** It maps field *labels/structure*, not the participant's actual data. (Guardrail — see §2 and §8.)

3. **Vault encryption → `libsodium-wrappers` (authenticated symmetric encryption), key from a gitignored `.env`.** Real authenticated crypto, no hand-rolling, no KMS overkill for a local prototype. **Priority order — do not invert:** (1) airtight **redaction utilities** (nothing sensitive in logs/prompts/screenshots/UI/repo) — this is what's on camera; (2) a clean vault boundary; (3) the encryption itself. Do not gold-plate the crypto while under-building redaction. Note the participant runs a **hypothetical, licence-number-free profile**, so the vault demonstrates *discipline* more than it protects real high-risk data — keep effort proportionate.

4. **Coverage benchmark → FROZEN (🔒).** The §6 values are confirmed and locked: $2M TPL · DCPD included · mandatory medical/rehab/attendant-care AB only · collision + comprehensive at $1,000 deductible each · OPCF 44R · no telematics. **Every `comparable`/`non_comparable` judgment keys off these, so they must not drift.** Implementation requirement: put the benchmark in a **single config object** that the normalizer imports — never hardcode values inline. That way any future change is a one-line edit, not a hunt-and-replace, and the freeze is structurally enforceable.

5. **Live Playwright probe order → priority sequence below.** Logic: *most likely to yield a deep estimate-only journey before a hard wall, first* — we want one excellent live evidence trail fast, not five polished ones.
   1. **Sonnet** — fully online, direct, instant-quote design; best odds of a deep trail. **Start here.**
   2. **Square One** — online, direct, modern flow.
   3. **belairdirect** — major direct writer, online journey.
   4. **One aggregator — LowestRates.ca *or* Rates.ca** (pick one) — demonstrates panel-inspection + dedup; shows multiple underwriters from one route.
   5. **CAA** — direct/broker hybrid; membership wrinkle makes it a useful *contrast* case (may land `affinity_restricted`, itself good evidence).

   **Execution guidance:** probe 1–3 first; the moment one produces a clean deep estimate-only trail with good redacted evidence, **lock it as the "hero" route for the Loom and move on.** Goal = one excellent live trail + a couple of honest walls, not five perfect journeys. **Every wall (licence required, CAPTCHA, VIN demanded) is a *successful* recorded outcome, not a failure.** And **check each site's terms permit automated estimate access BEFORE pointing Playwright at it** — if terms forbid it, that's a `blocked` record (logged, never evaded). Check terms → then automate.

---

## 4. Architecture — the seven-stage pipeline

Mirror the challenge brief's recommended flow exactly (aligning to it scores us on domain understanding):

```
Consent-aware intake → Market registry → Route planner →
Browser & (designed) voice agents → Evidence store →
Quote normalizer → Coverage ledger & comparison
```

1. **Consent-aware intake** — schema-driven collection of an OAF-1 **superset**, with **data minimization** (ask only what the selected route needs). Runs in labelled `estimate_only` mode against a **hypothetical, licence-number-free profile** by default. Records consent timestamp, mode, permitted channels, and per-route field disclosure.

2. **Market registry** — **the crown jewel and a required deliverable.** Seed from the brief's Appendix A (32 insurer groups / 60 legal entities), then enrich each record with distribution type, consumer brand, dedup key, requirement flags, quote URL, and status. Emits `registry.json` and `registry.csv`.

3. **Route planner** — a **deterministic policy engine**: given a source's `requirements` × our `capabilities` (G1 only, no car, no VIN, estimate-only), decide the route and the **predicted terminal status**. Examples:
   - Direct online writer → attempt estimate up to the verification wall → `estimate_only` or `manual_handoff`
   - Broker / residual (Facility Association) → `manual_handoff` (needs real applicant + licensed intermediary)
   - Hagerty (collector) → `specialty_only` / `ineligible` (no eligible vehicle)
   - Resolved duplicate → `duplicate_rate_source`

4. **Browser agent** (Playwright) — runs `estimate_only` journeys on flows that permit non-binding estimates, captures evidence, and **stops at the verification/CAPTCHA/licence wall**, recording exactly how far it got and why.

5. **Evidence store + redaction** — per attempt: `source_url`, timestamp, **redacted** screenshot, extracted fields, terminal status, evidence hash/artifact link.

6. **Normalizer + coverage ledger** — map each result's coverage assumptions onto the **benchmark package** (§6), flag variances, mark `comparable` vs `non_comparable`, and compute the five coverage metrics (§8).

7. **Comparison view** — sort by annual cost, **surface coverage differences before price differences**, filter estimates out, open evidence per outcome, and clearly show which markets remain **unresolved**. Never label the lowest number "best" without surfacing non-price differences and eligibility conditions. Full UI spec in §4a.

---

## 4a. User interface

> ### 🔒 PROTECTED DECISION — do not flatten results into a single table
> **The results list MUST be grouped by terminal status** (Comparable → Estimates → Handoffs → Blocked/Ineligible → Duplicates → Unresolved), not rendered as one flat sortable table.
>
> **Why this is protected:** this is the single most important UI decision in the build, and it is the one most likely to be "simplified" away under time pressure. Our expected data is *few or zero firm quotes and many non-quote terminal statuses*. In a flat table that reads as failure — rows full of "no rate." Grouping by status is what **reframes the exact same data as a complete, honest market map** and makes the terminal-status taxonomy (our core domain-understanding showpiece) the visible organizing principle of the screen. Flattening it silently deletes the project's central argument.
>
> **Rules:**
> - Sort/filter operate **within** groups, never by dissolving the groups.
> - The **Unresolved** group is always rendered and never hidden or collapsed by default — it is the honesty of the system made visible.
> - "Hide estimates" filters the Estimates group only; it must not merge groups.
> - If you believe grouping should change, **flag it to the spec owner first** — do not decide unilaterally.

### Build decision
The UI is a **React + Vite single-page app that statically reads the normalized JSON output** — **no backend**. This is deliberate: nothing to break during a live walkthrough, client-side sort/filter only, and the whole thing loads a file the pipeline already produced. Build a **skeleton on Day 2**, polish on **Day 3.5**.

### Two surfaces
1. **Intake surface — intentionally minimal.** Not a form-heavy build. The profile is a **structured JSON file the user edits**, plus a **thin read-only confirmation screen** that shows the parsed profile and the labelled operating mode (`estimate_only`, hypothetical, no licence number). The Loom barely shows intake; do not spend time here.
2. **Comparison dashboard — where the effort goes.** This is the surface the demo and the thesis live in.

### Why the dashboard is load-bearing
Our expected output is **few or zero firm quotes** and many `estimate_only` / `manual_handoff` / `blocked` / `unresolved` statuses. In a naive table that reads as *failure* — rows full of "no rate." The dashboard's job is to **reframe the same data as thorough, honest market coverage**. The UI is doing rhetorical work: it is the difference between "barely got any quotes" and "mapped the entire market and told the truth about every corner." **Design goal: make the honesty legible and make it look like the point, not the shortfall.**

### Design thesis & aesthetic
The subject is an **audit / regulatory instrument**, not a consumer insurance app. The credibility of this project *is* its trustworthiness, so the UI should read like an **audit tool a regulator would trust** — calm, information-dense, precise. A slick consumer look would actively undercut the honest-accounting thesis.

- **Avoid the AI-default looks** (warm-cream + serif + terracotta; near-black + acid accent; broadsheet hairline columns). These are tells, not choices, and none fits an audit instrument.
- **Palette:** neutral, low-chroma base (near-white or cool off-white surface, ink/charcoal text), with **status color used sparingly and meaningfully as the only saturated element** — green = `quoted_comparable`, amber = `estimate_only`, slate/grey = `manual_handoff` / `callback_required` / `unresolved`, red = `blocked` / `ineligible` / `not_currently_writing`, muted blue = `duplicate_rate_source`. Color carries information; nothing is decorative.
- **Typography:** a precise, slightly technical pairing — a characterful display/mono face for numbers and status labels (the data *is* the personality), a clean, legible body/UI sans. Numbers and IDs should feel tabular/monospaced so premiums, timestamps, and `distinct_rate_source_id`s line up and read as evidence.
- **Structure:** grouping-by-status is the organizing device (see below) because the terminal-status taxonomy is our domain-understanding showpiece — the structure should encode that truth, not decorate around it.
- **Restraint:** spend boldness in one place (the status-distribution/coverage banner). Keep everything else quiet. Responsive to mobile, visible keyboard focus, reduced-motion respected. Copy is plain and in the interface's voice; an empty or blocked state explains what happened and why, never apologizes.

### Layout (top to bottom)

```
┌─────────────────────────────────────────────────────────────┐
│  COVERAGE BANNER — the thesis, first thing seen              │
│  market completion · comparable yield · evidence rate ·      │
│  duplicate suppression · freshness                           │
│  [ stacked status-distribution bar across all sources ]      │
├─────────────────────────────────────────────────────────────┤
│  BENCHMARK STRIP (persistent)                                │
│  $2M TPL · DCPD incl · coll+comp $1k · OPCF 44R · no telem.  │
│  every price on the page is anchored to this                 │
├─────────────────────────────────────────────────────────────┤
│  CONTROLS: sort (annual cost ▾) · filter [x] hide estimates  │
│            · toggle: Results view / Market-map view          │
├─────────────────────────────────────────────────────────────┤
│  RESULTS — GROUPED BY STATUS, not one flat list              │
│                                                              │
│  ▸ Comparable quotes        (green)                          │
│      brand → legal underwriter → group │ $ │ variance flags  │
│      │ [evidence]                                            │
│  ▸ Estimates                (amber)                          │
│  ▸ Handoffs / callback req.  (slate)                         │
│  ▸ Blocked / ineligible / not writing  (red)                 │
│  ▸ Duplicates (suppressed)   (blue)                          │
│  ▸ Unresolved               (grey)  ← never hidden           │
└─────────────────────────────────────────────────────────────┘
```

**Per-row contents:** source identity shown as the layered chain **brand → legal underwriter → insurer group**; status as a **colored chip**; **price only if `comparable`**; coverage-variance flags (what differs from benchmark); an **Evidence** button.

**Evidence drawer/modal** (click any outcome): opens the **redacted screenshot + timestamp + source URL**, how far the journey got, and the exact wall it hit. This is what beats a mock in the live walkthrough — every demonstrated outcome must open real evidence here.

**Market-map view** (toggle): a simple visual of the **group → legal underwriter → consumer brand → distributor → rate source** layering with **duplicates collapsed onto their `distinct_rate_source_id`**. Pure domain-understanding points and it directly satisfies the "market map" acceptance check.

### Data contract
The dashboard reads a single normalized JSON artifact emitted by `/normalizer` (results array in the quote-result schema + the five computed metrics + benchmark definition). The UI does **no computation beyond sort/filter/group** — all truth is precomputed by the pipeline so the file is self-contained and demo-proof.

---

## 5. Canonical schema (build this FIRST)

Everything imports these types; a wrong shape here causes rework everywhere. Implement in `/schema` as the single source of truth.

**Required type groups:**

- **Intake profile (OAF-1 superset):** applicant/contact/household; driver info (licence identity — *hypothetical, no number*; licensing timeline; training; assignment; discount eligibility); vehicle & use (identity/VIN, ownership, use, risk details, special use); history (current insurance, licence/permit events, cancellations, misrepresentation, fraud, accidents/claims, convictions).
- **Consent & mode:** consent timestamp; `estimate_only | discovery | live` mode (default `estimate_only`); permitted channels; approved insurers/brokers; per-route field-disclosure record.
- **Coverage benchmark:** the normalization target (§6).
- **Registry record:** see Appendix B fields (§Appendix).
- **Quote result record:** source identity, outcome, price, coverage, discounts, validity, evidence, confidence, privacy — all fields from the brief's result schema.
- **Status enum** (verbatim from the brief — implement exactly):

```
quoted_comparable      exact premium + benchmark coverage matched
quoted_non_comparable  exact premium, but ≥1 coverage assumption differs
estimate_only          indicative price/range/lead estimate, not firm
callback_required      a licensed rep must call before a rate is available
manual_handoff         applicant/human required for consent, identity or advice
ineligible             profile fails an approved rule/product requirement (state reason)
affinity_restricted    valid group/employer/membership relationship required
specialty_only         route does not write standard PPA for this profile
duplicate_rate_source  a different brand/route resolved to the same rate program
not_currently_writing  evidence indicates no new applicable Ontario PPA business
blocked                terms/CAPTCHA/auth/access control prevents automation
unreachable            bounded attempts produced no response
unresolved             more research required; NEVER silently convert to "not offered"
```

- **Confidence enum:** `high` (returned exact premium + matching coverage) / `medium` (licensed rep's documented quote) / `low` (estimate or unresolved coverage difference).

---

## 6. Coverage benchmark (normalization target)

Every route is measured against **one consistent benchmark package**. If a route can't match it, preserve the result but mark it `non_comparable` and **list every difference**.

**Demo benchmark (apples-to-apples) — FROZEN 🔒 (see §3a.4):** live in a **single config object** the normalizer imports; never hardcode inline.
- Third-party liability: **$2,000,000** (one consistent user-selected limit; Ontario legal minimum is $200,000 but we hold ours fixed)
- **DCPD included**
- Accident benefits: **mandatory medical / rehabilitation / attendant care** only
- Collision **and** comprehensive, each **$1,000 deductible**
- **OPCF 44R** (family protection)
- **No telematics** unless separately opted in (keep telematics quotes separate)
- Requested effective date + 12-month term where available, same quote-date window

> **Regulatory note — July 1, 2026 change:** Only medical/rehab/attendant-care accident benefits remain mandatory for new Ontario policies. **All other accident benefits are now optional and must be captured explicitly** (income replacement, non-earner, caregiver, housekeeping, death, funeral, dependant care, indexation, catastrophic impairment, etc.). Record every optional benefit as `included | excluded | unavailable | unknown`.

Also track at minimum these endorsements when offered/requested: **OPCF 20** (transportation replacement), **OPCF 27** (non-owned autos), **OPCF 43** (removing depreciation), **OPCF 44R** (family protection). Track DCPD opt-out / **OPCF 49** implications if elected.

---

## 7. Voice — DESIGNED, NOT EXECUTED

We do **not** place or receive real calls in this build (safety + time). Instead we ship the voice design as an artifact in `/agents/voice`, which satisfies the challenge's cross-channel requirement as a **designed handoff** and demonstrates we understood the voice rules.

Ship:
- **A context-preserving handoff payload** — the structured object the system would hand to a human operator or licensed broker to continue a journey: preserved quote/reference ID, source URL, partial progress, consent state, and the fields already disclosed.
- **The disclosure script** — automation is disclosed at the start of every (hypothetical) call; caller is never misrepresented as a human/broker/insurer employee; no affiliation claims.
- **Escalation rules** — immediately escalate to the human applicant when a route requires the applicant, licensed advice, a declaration, identity verification, or consent for third-party records.

We do **not** represent the hypothetical profile to any real person. That is explicitly banned.

---

## 8. Metrics & honest accounting

Compute and display all five coverage metrics:

- **Market completion** = distinct rate sources with an evidence-backed terminal status ÷ verified applicable rate sources
- **Comparable quote yield** = `quoted_comparable` results ÷ verified applicable rate sources
- **Evidence rate** = outcomes with a valid source + timestamp + redacted artifact ÷ all outcomes
- **Duplicate suppression** = brands/routes mapped to an existing `distinct_rate_source_id` rather than double-counted
- **Freshness** = % of registry records verified during the hackathon window

`unresolved` records **remain in the denominator** — never silently dropped, never silently converted to "not offered."

---

## 9. Repository structure

```
/schema        canonical types (OAF-1 superset, coverage benchmark,
               registry record, quote result, status enum) — the spine
/registry      market registry: seed data + enrichment + dedup logic
               → emits registry.json / registry.csv (required artifact)
/planner       route planner: (source requirements × our capabilities)
               → route + predicted terminal status
/agents
  /browser     Playwright estimate-only journeys + evidence capture
  /voice       DESIGNED handoff only: context-preserving payload
               + disclosure script (NOT executed)
/evidence      redacted screenshots, extracted fields, hashes, timestamps
/normalizer    map each result onto benchmark → comparable / non_comparable
               + coverage ledger + the five metrics
/dashboard     React+Vite SPA, no backend (see §4a). Statically reads the
               normalized JSON: coverage banner + metrics, benchmark strip,
               results GROUPED BY STATUS, evidence drawer, market-map view.
               Client-side sort/filter/group only — demo-proof.
/vault         encrypted sensitive-field store + redaction utilities
/reports       run report, architecture & safety note, known limitations
```

The `/agents/voice` folder is present but **non-executing** — it documents the disclosed handoff design.

---

## 10. Scope

### Must have — the spine (a credible submission on its own)
- Intake + hypothetical profile in labelled `estimate_only` mode
- Curated, deduplicated market registry → `registry.json` / `registry.csv`
- Route planner with terminal-status logic
- Normalizer + coverage ledger + the five metrics
- Comparison dashboard reading normalized JSON
- Architecture & safety note + known-limitations doc + the Loom

### Should have — what makes it *live* and beats a mock
- Playwright running **3–6 real estimate-only journeys** with captured redacted evidence and real walls. Candidate flows: **Sonnet, belairdirect, Square One, CAA**, plus one aggregator (**Rates.ca** or **LowestRates.ca**). **Probe first** — do not assume how deep each estimate goes before the licence/VIN wall; verify live.
- A verification pass that live-timestamps a subset of registry rows during the window (feeds the **freshness** metric).

### Stretch (only if time allows)
- (Voice remains designed-only per §7 — no execution.)
- Inbound-callback context-preservation demo (as a designed artifact, not a live call).

### Won't touch
- Any binding / payment / signature / declaration
- Any fabricated or borrowed licence number
- Any real broker/insurer call posing as an applicant

---

## 11. Sequenced build plan (~3.5 days, ordered most-defensible-first)

**Day 1 — the spine (highest value, zero external dependencies).**
Build `/schema` types first. Then the **market registry**: seed from Appendix A's 32 groups / 60 entities; add distribution_type, brand, `distinct_rate_source_id` dedup, requirement flags, quote_url, status. The brief already supplies the direct-writer list, the LowestRates and Surex panels, the MGA leads, mutuals, and residual market — so this is careful curation, not research from scratch. **End of Day 1: a required deliverable is done and the top-graded criterion is largely covered**, even if nothing else ships.

**Day 2 — planner + normalizer + dashboard skeleton.**
Route planner terminal-status logic; normalizer/coverage ledger against the benchmark; the five metrics; a dashboard that reads normalized JSON. **End of Day 2: a complete, defensible submission running entirely on designed/estimate data — no live browser required.**

**Day 3 — make it live.**
Playwright estimate-only journeys on 3–6 flows (**probe first**), capture redacted evidence, record real terminal statuses. This is what beats a mock in the live walkthrough.

**Day 3.5 — package.**
Run report, architecture/safety note, known limitations, and the 3–5 min Loom.

> If Day 3 runs short, we still have a coherent, honest, well-documented system — we simply have fewer live evidence artifacts, which we disclose as a known limitation. That is itself on-brand for the "legible uncertainty" principle.

---

## 12. Submission deliverables checklist

- [ ] **GitHub repo** + setup instructions (private only if Organizer has access)
- [ ] **3–5 min Loom**: product, market-routing logic, one working route to a returned quote or exact terminal blocker, **two normalized results**, one evidence-backed no-quote/handoff outcome
- [ ] **Machine-readable market registry** (CSV **or** JSON) with sources, verification dates, channels, statuses, `distinct_rate_source_id`s
- [ ] **Redacted run report** (coverage ledger, comparisons, gaps, errors, timestamps — no real licence numbers or sensitive data)
- [ ] **Architecture & safety note** (agent responsibilities, human checkpoints, consent flow, data storage, redaction, deletion)
- [ ] **Known limitations** (where the system depends on a human, licensed intermediary, membership, terms permission, or unavailable integration)

### Minimum demo acceptance (must all pass)
- **Retrieval:** ≥1 permitted route reaches a returned rate or exact terminal blocker
- **Cross-channel:** show a context-preserving, automation-disclosing handoff where the journey requires it (our designed voice/handoff payload)
- **Normalization:** ≥2 outcomes use the common schema and show coverage differences
- **Market map:** registry distinguishes legal underwriter, group, brand, distributor, and rate source
- **Dashboard integrity (🔒):** results are grouped by terminal status, not flattened into one table; the Unresolved group is visible
- **Evidence:** every demonstrated outcome has a timestamp + redacted evidence
- **Safety:** no real licence number, full address, payment data, or unredacted recording anywhere; no fabricated licence number

---

## Appendix — Market registry record fields (per brief Appendix B)

| Field | Meaning |
|---|---|
| `registry_id` | Stable internal key |
| `legal_underwriter` | Licensed company name |
| `insurer_group` | Parent or operating group |
| `brand_or_program` | Consumer-facing route |
| `distribution_type` | `direct \| agent \| broker \| aggregator \| affinity \| MGA_program \| mutual \| residual` |
| `product_scope` | `standard_PPA \| nonstandard_PPA \| high_net_worth \| collector \| commercial_specialty \| unknown` |
| `distinct_rate_source_id` | Deduplication key |
| `quote_url` | Official public quote URL |
| `public_phone_route` | Public sales or callback route |
| `licensed_intermediary` | Brokerage/agency name + regulator evidence |
| `requirements` | `licence \| VIN \| membership \| callback \| human \| other` |
| `automation_notes` | Terms, CAPTCHA, rate-limit, handoff notes |
| `status` | One value from the status enum |
| `source_url` | Authoritative evidence |
| `last_verified_at` | ISO 8601 timestamp |
| `evidence_artifact` | Redacted screenshot, structured call note, or response reference |

### Registry seed — 32 groups / 60 legal entities (from brief Appendix A)
Seed only; each row requires **current validation during the hackathon window**. Does not by itself prove new-business availability, standard-PPA scope, or a consumer-accessible quote path.

- **AIG** — AIG Insurance Company of Canada *(specialty/commercial; validate PPA relevance)*
- **Allstate** — Allstate Insurance Company of Canada; Esurance Insurance Company of Canada; Pafco Insurance Company; Pembridge Insurance Company *(Allstate direct/agent; Pafco/Pembridge broker; validate Esurance)*
- **Aviva** — Aviva General; Aviva Insurance Company of Canada; S&Y; Scottish & York; Traders General *(direct/RBC/broker/program; dedupe legacy entities)*
- **Beneva** — Unica Insurance Inc. *(broker)*
- **CAA** — CAA Insurance Company; Echelon Insurance *(CAA direct/broker; Echelon non-standard broker)*
- **Chubb** — Chubb Insurance Company of Canada *(HNW/specialty broker)*
- **Co-op** — COSECO; CUMIS General; Co-operators General; The Sovereign General *(Co-operators web/agent; affinity/specialty need validation)*
- **Commonwell** — The Commonwell Mutual Insurance Group *(mutual + broker/agent)*
- **Continental** — Continental Casualty Company *(specialty/commercial; validate PPA)*
- **Definity** — Definity Insurance Company; Sonnet Insurance Company *(Definity/Economical broker; Sonnet direct)*
- **Desjardins** — Certas Direct; Certas Home and Auto; The Personal Insurance Company *(Desjardins web/agent; The Personal affinity)*
- **Economical** — Economical Mutual Insurance Company *(broker; map current entity/program)*
- **FA** — Facility Association *(residual market via licensed intermediary)*
- **FMRe** — Farm Mutual Reinsurance Plan (on behalf of Ontario Mutuals) *(Ontario Mutuals locator + specific mutual)*
- **Gore** — Gore Mutual Insurance Company *(broker)*
- **Hartford** — Hartford Fire Insurance Company *(specialty/commercial; validate PPA)*
- **Heartland** — Heartland Farm Mutual Inc. *(mutual/local agent or broker)*
- **Intact** — Belair; The Guarantee Company of North America; Intact Insurance Company; Jevco; Novex; Royal & SunAlliance Canada; Unifund; Western Assurance *(belairdirect direct; Intact/Jevco broker; validate legacy/affinity)*
- **Liberty** — Liberty Mutual Insurance Company *(specialty/commercial; validate PPA)*
- **Northbridge** — Federated; Northbridge General; Verassure; Zenith *(Northbridge/Zenith broker; validate Federated/Verassure)*
- **Optimum** — Optimum Insurance Company Inc. *(broker)*
- **PURE** — PURE Insurance *(HNW broker)*
- **Peel** — Peel Mutual Insurance Company *(mutual/local agent or broker)*
- **Portage** — The Portage la Prairie Mutual Insurance Company *(broker)*
- **SGI** — Coachman Insurance Company; SGI CANADA Insurance Services Ltd. *(broker; Coachman non-standard)*
- **Sompo** — Endurance Specialty; Sompo Japan Insurance Inc. *(specialty/commercial; validate PPA)*
- **TD** — Primmum; Security National; TD General *(TD online/phone/affinity)*
- **Tokio** — Tokio Marine and Nichido Fire *(specialty/commercial; validate PPA)*
- **Travelers** — The Dominion of Canada General Insurance Company *(broker)*
- **Wawanesa** — The Wawanesa Mutual Insurance Company *(broker)*
- **XL** — XL Specialty Insurance Company *(specialty/commercial; validate PPA)*
- **Zurich** — Zurich Insurance Company *(Square One direct for Ontario car; specialty broker routes may differ)*

### Route strategy (from brief §3)
- **Direct / exclusive-agent set:** Allstate, Aviva Direct, belairdirect, CAA, Co-operators, Desjardins, RBC Insurance, Sonnet, Square One, TD Insurance, The Personal — where the applicant qualifies. Captures rates broker panels may not expose.
- **Broad broker engine A:** Rates.ca **or** LowestRates.ca first, then inspect returned legal underwriters. (LowestRates names CAA, Coachman, Economical, Gore, Pafco, Pembridge, SGI, Travelers, Zenith.)
- **Broad broker engine B:** Surex to add/verify Aviva, Intact, Jevco, Wawanesa, CAA, Coachman, Definity/Economical, Gore, Pafco, Pembridge, SGI, Travelers — subject to live panel/profile.
- **Independent broker verifier:** ThinkInsure / Onlia / Scoop or another RIBO-licensed broker; request the complete carrier list + all quote outcomes (Ontario law requires brokers to disclose their auto insurer contracts and obtained quotes).
- **Gap-fill routes:** Ontario mutuals, affinity programs, HNW markets, collector programs (Hagerty — collector only, underwritten by Aviva), residual market (Facility Association) — via their actual routes.

> **Bounded-attempt policy:** Web = one attempt + one retry for transient technical error only (never retry a rejection/CAPTCHA/terms). Broker = ask once for the full carrier list + outcomes; preserve as evidence. Unresolved stays unresolved.

---

**Final reminder:** the prototype helps a real person understand the market without pretending an estimate is a quote, a brand is an insurer, an intermediary covers the whole market, or a failed attempt never happened.
