# Portfolio Cockpit — Master Plan

> **Spec-Flow Stage 3 output.** Consolidates the approved `00-spec-and-scope.md` into one phased master plan.
> **Feature slug:** `portfolio-cockpit` · **Decision owner:** Xavier (xavier@prosperalabs.ai)
> **Date:** 2026-07-12 · **Stage:** `planned` (awaiting approval at §9)
> **Input:** `docs/spec-flow/portfolio-cockpit/00-spec-and-scope.md` (approved; 13 locked decisions).
> **Sibling docs:** `case-study/00-foundations-and-decisions.md` (D1–D5, metric sets), `case-study/i-context-and-problem.md` (Doc i), `case-study/ii-a-backend-fix-plan.md` (backend — **DONE**, frozen §A contract), `case-study/ii-b-frontend-cockpit-plan.md` (**SUPERSEDED** by the spec + this plan).
> **Planner:** self-contained (no project planning skill applies — this is a standalone personal repo, not the Prospera monorepo, so `prospera-planning` is out of scope here).
>
> **HARD-GATE:** this stage produced a planning document only. **No code written, no configuration changed.** Every proposed change is classified ✅ SAFE / ⚠️ CONDITIONAL / ❌ BREAKING in §6. Stops for approval at §9.

---

## 1. Why this exists

The backend prototype is **complete and shipped**: it ingests the quarterly PDFs, normalizes the numbers, reaches **90% source recall**, visibly **refuses unsafe comparisons**, and keeps every number traceable to its source file — all offline, enhanced-by-default, behind a frozen **1.1.0 JSON export contract** (§A of `ii-a`). But it is still a **CLI that writes JSON/CSV/markdown**. It has **no front-end**.

The Sagard case-study brief explicitly requires **"a front-end for displaying the metrics"** and **one live demo** that walks through *"how reports are loaded, what the outputs look like, and 1–2 examples of user insights."* This plan turns the locked spec into a phased build for a **local web app** — a Flask JSON API + a React SPA "monitoring cockpit" — that loads the intake PDFs on a front-end trigger and displays the trust-flagged, source-traceable metrics. The interview demo is the near-term milestone; the framing is *"the seed of an internal Sagard monitoring cockpit."*

**Non-negotiable retrocompat line.** The existing CLI, in-process pipeline, publish/schema modules, the **95-test suite**, the **golden guard**, and the **byte-identical legacy export** are the baseline and are **not touched**. The entire web layer is **new + additive**: if you deleted `webapp.py` and `web/` tomorrow, `make publish`, `make test`, and `make verify-golden` would pass **identically**. The only edits to *shared* files are **append-only** (`Makefile` `.PHONY`, `.gitignore`, a new `pyproject` optional-extra).

---

## 2. Locked decisions this plan operationalizes

### 2.1 From the spec (owner: Xavier, 2026-07-10) — 13 decisions

| # | Decision | Choice | Phase(s) |
|---|---|---|---|
| 1 | Objective framing | Demo-weighted product seed | narrative |
| 2 | Primary user / JTBD | Analyst quarterly workflow, narrated by Xavier | narrative |
| 3 | Demo flow | Start clean, pre-warm allowed | P0 (pre-warm), P1 (file list before processing) |
| 4 | Trigger | Whole folder, one click + visible file list | P1 |
| 5 | Panel scope | **Full D4 cockpit** (grid + trend + exceptions + reconciliation + breadth + provenance) | P1–P4 |
| 6 | Before/after toggle | Enhanced only (toggle = stretch, not built) | P0 (`recall_mode="enhanced"` hardcoded) |
| 7 | Credit path | **Proof of range** (grid + deck slide, **no dedicated screen**) | P1/P3 grid; deck = Doc iii |
| 8 | Framework | **Flask API + React SPA** (de-risked via pre-built bundle) | P0 |
| 9 | G1 fix | App passes explicit `intake-pdf/*.pdf` inputs (additive) | P0 |
| 10 | Offline | Force local parser, no API key | P0 |
| 11 | App location | `portfolio_metrics/webapp.py` + `web/` (additive) | P0 |
| 12 | Demo surface | Local server app supersedes foundations §8 "no server" | P0 |
| 13 | Deck | Out of this spec (Doc iii, tracked separately) | — |

> **Superseded / resolved:** an earlier plan (`ii-b`) once had *"credit = a full working screen."* The spec **resolves this** (§10 D-E, §11 #7, §6.2 non-goal #5) to **proof of range** — the lender appears in the grid + a deck slide, no dedicated cockpit screen (one lender = no benchmark). This plan builds to the spec.

### 2.2 Technical decisions resolved here with additive defaults *(flagged for veto at §9)*

| # | Decision | Choice | Rationale |
|---|---|---|---|
| DEC-A | `/api/run` sync vs async | **Synchronous** (returns the export) | Measured **0.9 s** over 24 PDFs — async polling is needless complexity |
| DEC-B | Offline parser entry point | **`LocalPdfParser().parse(pdf)` directly** | Most hermetic — bypasses `Settings()`/`.env` entirely; guarantees no network path exists (see §3 finding) |
| DEC-C | Provenance depth | **File-level** (`source_file` + `raw_label` + `raw_value_text` + `confidence` + `snippet`) | Matches spec FR6 / §6.2 non-goal #7 / success #4; `source_page` is null by design (no parser change in v1) |
| DEC-D | "Also covered" breadth panel | **Hybrid (Xavier, 2026-07-12):** build as the **label-drift / raw-terminology showcase**, but mark it the **first-to-cut de-scope candidate in P3** | No open raw-tail (closed 8-value enum); breadth = 2 optional metrics + **30 distinct raw labels** collapsed to one canonical ID (on-thesis). Cheap (reuses `raw_label`), so build it — but cut first if P3 runs long, without touching refuse/reconciliation/exceptions |
| DEC-E | Reconciliation mirror-pair | **Dedupe by the unordered {own, summary} value pair** (show once per conflict) | MediSight (+5.5M) and TalentVault (−5.5M) are the same conflict mirrored (§3 finding) |

---

## 3. Current-state inventory *(ground-truthed 2026-07-12, file:line-anchored)*

Verified by a 3-agent read-only investigation (workflow `wf_8cb631c5-2a4`): (A) backend in-process seam + offline parse, (B) G1 / retrocompat / packaging, (C) live panel data-binding. All anchors re-confirmed against the live tree (P0–P5 shifted lines vs the spec's anchors, but every seam holds).

### 3.1 Pipeline sketch (what a "Load reports" click runs, in-process, no disk, offline)

```
glob intake-pdf/*.pdf                         ← G1: explicit inputs (NOT resolve_pdf_inputs([]))
  → for each: LocalPdfParser().parse(pdf)      ← offline, pure pypdf, no key  [parser_local.py:16]
  → normalize_parser_output(po, recall_mode="enhanced")   ← in-memory        [pipeline.py:40]
  → build_metrics_export(results=…, parsed_paths=[Path(name)…], recall_mode="enhanced")  [publish.py:79]
  → export.model_dump(mode="json") → jsonify   ← 1.1.0 dict, §A fields        [schema.py:222]
```
**Verified end-to-end: 0.9 s over 24 PDFs, schema 1.1.0, 116 metrics, 97 issues, zero repo writes.**

### 3.2 Reusable seams (where the app attaches)

| Seam | Anchor | What it gives the app | Additive? |
|---|---|---|---|
| **In-memory normalize** | `pipeline.py:40` | `normalize_parser_output(parser_output, *, recall_mode)` — takes a `ParserOutput` object, **no disk**. The true seam. | ✅ call, no edit |
| **In-memory export builder** | `publish.py:79` | `build_metrics_export(*, results, parsed_paths, recall_mode)` → `MetricsLongExport`, **no disk**; only reads `path.name` (so pass synthetic `Path(name)`). | ✅ |
| **Offline raw parse** | `parser_local.py:16` | `LocalPdfParser().parse(pdf)` — pure `pypdf`, **no API key**, no disk. | ✅ |
| **JSON for the SPA** | `schema.py:222` | `export.model_dump(mode="json")` → full 1.1.0 dict incl. all §A fields. | ✅ |
| **Renderer template pattern** | `publish.py:333` | `render_summary_markdown(export)` — reference for how a renderer walks `export_metadata` / `metrics` / `issues`. | ✅ reference only |
| **G1 blocker (bypass)** | `extract_text.py:14-18`, `resolve_pdf_inputs:34-62` | `if requested:` (line 36) → explicit branch **never** touches `REPRESENTATIVE_PDFS`; empty-inputs default (55-62) returns the 3-file cap. | ✅ pass explicit |
| **Makefile home** | `Makefile:52,62` | `publish`/`verify-golden` recipe pattern; add `serve` + `build-web`. | ⚠️ append `.PHONY` |
| **Packaging** | `pyproject.toml:22` | `[project.optional-dependencies]` (only `dev` today) — add `web` extra. | ✅ new key |

> **⚠️ Wrong seam to avoid:** `normalize_documents` (`cli.py:281`) *also* takes `recall_mode`, but **reads parsed JSON off disk** — it is the CLI seam, not the in-memory one. The app must use `normalize_parser_output` on the in-memory `ParserOutput`.
>
> **⚠️ Two load-bearing constraints (verified):** (1) **library-function defaults are still `"legacy"`** — the app must pass `recall_mode="enhanced"` **explicitly** to every call (only the CLI reads the flipped `Settings` default). (2) **Offline ≠ no-keys** — `Settings()` reads the committed `.env` (real keys) and defaults `pdf_parser="firecrawl"`; the offline guarantee comes from **forcing `LocalPdfParser`** (DEC-B), not from missing keys.

### 3.3 Live panel-data availability (proves the full D4 cockpit is buildable)

Every panel has **real, bindable data** in the live enhanced 1.1.0 export (Slice C):

| Panel | Binds to | Live data confirmation |
|---|---|---|
| **1. RAG grid** (sector-grouped) | `metrics[].sector, canonical_metric, value, period, company_name` | `sector` on **all 116 rows** (saas 91 / credit 14 / marketplace 7 / payments 4); 10 companies, 1 sector each |
| **2. Trend explorer** | multi-period `period + canonical_metric + value` per company | **NovaCloud ARR 5 quarters** 24.1→34.2M (flagship #1); ≥3 periods: NovaCloud, LendBridge, MediSight, PeopleFlow; 5 cos single-period → "insufficient history" |
| **3. Exceptions** | `issues[]` `code=missing_metric` (carries `period`) | **34** issues, sector-aware — LendBridge (credit) flagged only for `headcount`, **never** SaaS metrics |
| **4. Reconciliation** | `issues[]` `cross_source_discrepancy` (`period/expected/observed/delta`) + `cross_document_conflicting_candidates` (marker) | **MediSight** ARR expected 22.4M / observed 27.9M / **delta +5.5M**; siblings share `(company,period,metric)` join key ⚠️ dedupe TalentVault −5.5M mirror (DEC-E) |
| **5. "Also covered" breadth** | `metrics[]` optional canonicals + `raw_label` variety | 22 non-core rows (NRR 12 + logo-churn 10) + **30 distinct raw labels** ⚠️ no open raw-tail → reframe (DEC-D) |
| **6. Provenance drill-down** | `metrics[].source_file, raw_label, raw_value_text, value, confidence, source_snippet` | All **116/116** populated across 24 files ⚠️ `source_page` null by design → file-level (DEC-C) |
| **7. Refuse-to-compare** (flagship #2) | `metrics[].comparison_status="refused"` + `metric_basis="interest_margin"`; `issues[] basis_collision` | All **5 LendBridge GM** rows refused; exactly **1** `basis_collision`; these are the *only* refused rows |

### 3.4 Environment (probed live 2026-07-12)

- **Node v22.22.1 / npm 9.2.0 / npx 9.2.0** → Vite build path viable (no global Vite; installs as a local dev-dep). **Python 3.14.4** in venv → Flask 3.x runs.
- **Flask NOT installed** (expected — new `web` extra). **`pyproject`** has `[project.optional-dependencies]` (only `dev`).
- **git:** branch `claude-planning-case-study`, HEAD `995965c` (one doc-sync commit past the spec commit `7c898e8`), working tree clean. `outputs/` gitignored except `.gitkeep`; `.gitignore` covers `dist/` (→ `web/dist/`) but **needs a `node_modules/` entry**.
- Live `outputs/metrics_long.json` = **schema 1.1.0, enhanced** (the contract the SPA binds to).

---

## 4. Scope *(from spec §6 — restated, not re-litigated)*

**In scope (v1):** local Flask JSON API + React SPA cockpit, offline, enhanced mode; front-end-triggered live run over the current `intake-pdf/` (G1 fix, additive); **full D4 cockpit** (RAG grid, trend, exceptions, reconciliation, breadth, provenance); the **two flagship insights** (refuse-to-compare + NovaCloud over-time) with file-level provenance; PE/equity path (8 companies) + credit (LendBridge) as **proof of range** in the grid; Makefile `serve` + `build-web`; **pre-built bundle** for the demo.

**Out of scope / non-goals (14, named in spec §6.2):** cloud deploy / hosting / public URL; auth / login / multi-user; browser file-upload; enhanced/legacy toggle (v1 stretch); private-credit path *built/demoed*; classic-buyout metrics; page/sentence-level provenance; cross-lender benchmarking; marketplace/payments deep-dive; cited chat; rungs 5/6 + warehouse/BI/ILPA/entity-resolution/OCR; new label-drift hardcoding; editing / write-back / DB; **the slide deck (Doc iii)**.

**Success criteria (observable, spec §6.3):** (1) fully offline end-to-end; (2) Load processes **all** current intake PDFs, add/remove reflected next run (G1); (3) both flagships render; (4) every number is **one click** from source file + label + confidence; (5) **zero false "missing"** for N/A-by-sector; (6) "insufficient history," never a fabricated trend; (7) full run **< ~3 s** with the found-reports list shown **before** processing; (8) backend retrocompat intact (95 tests green, legacy byte-identical); (9) deck 48 h before (deck = Doc iii, separate).

**Affected surfaces:** **New (additive):** `portfolio_metrics/webapp.py`, `web/` (Vite React), Makefile `serve` + `build-web`, `flask` as `web` extra. **Modified (append-only):** `Makefile` `.PHONY`, `.gitignore`. **No existing module changes behavior.**

---

## 5. Options considered *(per-decision, referencing the Stage-2 tables)*

The decision-level trade-offs were resolved interactively in the spec (§10 tables D-A…D-H). This plan does not reopen them; it plans *around* them. Key ones:

- **D-A Framework** → **Flask API + React SPA** (owner override of the agent's vanilla-JS rec; his Prospera stack + component structure). *Rejected:* Flask + vanilla JS (least live-failure surface), Flask + React via CDN (awkward middle). **Mitigation this plan adds:** the demo serves a **pre-built bundle**, never `npm run dev` — collapsing the React risk to a build-time concern that P5 locks. *(Node verified present, so no fallback phase is needed.)*
- **D-B G1 fix** → **App passes explicit inputs** (✅ SAFE additive). *Rejected:* change the CLI default resolver / remove `REPRESENTATIVE_PDFS` (both ⚠️ CONDITIONAL — touch shared CLI behavior).
- **D-C Panel scope** → **Full D4 cockpit.** *Rejected:* core-two-only, minimal.
- **D-D Toggle** → **Enhanced only.** *Rejected:* build the before/after toggle in v1.
- **D-E Credit** → **Proof of range.** *Rejected:* full working credit screen (1 lender = thin), grid-only-no-mention.

---

## 6. Retrocompatibility audit

Default posture: **additive**. `✅ SAFE` / `⚠️ CONDITIONAL` / `❌ BREAKING`. (Ground-truthed by Slice B.)

| # | Change | Class | Affected shared code | Mitigation |
|---|---|---|---|---|
| 1 | New `portfolio_metrics/webapp.py` (Flask app) | ⚠️ CONDITIONAL | Lands inside the **ruff-linted** (`make lint` over `portfolio_metrics tests`) + **wheel-packaged** (`include=["portfolio_metrics*"]`) tree | Guard `import flask` (optional extra may be absent → package still imports); keep ruff-clean (line-length 100); **never** import `webapp` from `__init__.py` or any always-loaded module (else pytest collection needs flask). All imported symbols verified import-side-effect-free. |
| 2 | New `web/` React (Vite) project at repo root | ✅ SAFE | none | Outside `portfolio_metrics*` (not packaged), not ruff/pytest-scoped; `web/dist` already covered by existing `dist/` ignore. Append `node_modules/` to `.gitignore`. |
| 3 | Makefile `serve` + `build-web` targets | ⚠️ CONDITIONAL | Shared `.PHONY` literal at `Makefile:12` | **Append-only** to `.PHONY`; new `name: setup` + recipe blocks mirror `publish`/`verify-golden`; reuse `INPUT_DIR`/`OUTPUT_DIR`; touch no existing recipe. |
| 4 | `flask>=3.1,<4.0` as new `web` optional-extra | ✅ SAFE | `[project.optional-dependencies]` (only `dev` today) | New key; keep flask **out** of core `[project]` deps so the CLI stays flask-free. **P0 verifies it installs in py3.14.** |
| 5 | G1 fix — app passes explicit `intake-pdf/*.pdf` | ⚠️ CONDITIONAL | No shared code edited; correctness depends on the call site (`resolve_pdf_inputs(...,[])` reactivates the 3-file cap) | Always glob + pass explicit inputs (or `[str(input_dir)]`); **never** call `resolve_pdf_inputs(...,[])` from the app; add a webapp test asserting all 24 resolve. Existing empty-arg CLI behavior deliberately preserved (`test_extract_text.py:17-28` locks both halves). |
| 6 | App writes `outputs/` (optional) | ✅ SAFE | `outputs/` gitignored except `.gitkeep` | Untracked; the in-memory route need not write at all (`model_dump → jsonify`). |

**Net verdict: SAFE-by-construction (additive).** There is **no ❌ BREAKING change** — the frontend is net-new. **Zero existing runtime module changes behavior.** The only edits to shared files are **append-only** (`.PHONY`, `.gitignore`, a new `pyproject` key). The three ⚠️ CONDITIONAL labels are about *writing the new code correctly* (guard the flask import; append-only Makefile; the explicit-inputs contract), not about breaking existing callers. The 95-test suite + golden guard import nothing flask/webapp → **cannot break**. The backend's own `recall-mode` flag remains its independent rollback.

---

## 7. Phased implementation plan

> Each phase is **independently shippable** and **additive-first**. **Phase 0 = additive foundations** (the API seam + build/serve toolchain) — user-visible only in that a shell renders, but it changes **no existing behavior** and the whole web layer is deletable with zero effect (the greenfield analog of "behind an atomic gate"). Ordering: foundation/seam → view shell → panels → provenance → polish. Graded core = **P0–P4**; **P5** is de-risking polish.

### Phase 0 — Foundations: API seam + build/serve toolchain *(additive)*
- **0.1** Add `web = ["flask>=3.1,<4.0"]` to `[project.optional-dependencies]` — `pyproject.toml:22`; `pip install -e ".[web]"` and confirm it resolves in py3.14. *Acceptance:* flask installs; CLI still imports flask-free.
- **0.2** Create `portfolio_metrics/webapp.py` (Flask), `import flask` guarded, **not** imported from `__init__.py`. Routes: `GET /api/reports` (glob `intake-pdf/*.pdf` → filenames — G1 explicit inputs), `POST /api/run` (in-memory sequence §3.1, `LocalPdfParser` forced, `recall_mode="enhanced"`, synchronous), `GET /api/metrics` (latest export as `model_dump(mode="json")`). Assert `parser_used=="local"` on every doc; catch per-PDF parse errors → return the parsed subset + `{parsed, total, elapsed_s}`, never a 500. *Acceptance:* `POST /api/run` returns schema `1.1.0`, 116 metrics, offline; adding/removing a PDF changes `/api/reports` (G1 proven); a deliberately corrupt PDF degrades gracefully.
- **0.3** Scaffold `web/` Vite React project (`package.json`, `vite.config`, minimal `App` that fetches `/api/metrics` and renders "loaded N metrics from M reports"). Vite `base` + build output aligned so Flask serves the built bundle **same-origin** (no CORS). *Acceptance:* `npm ci && npm run build` → `web/dist`; Flask serves `index.html` + assets.
- **0.4** Makefile `build-web` (`cd web && npm ci && npm run build`) + `serve` (run Flask serving `web/dist`); append both to `.PHONY:12`. Add `node_modules/` (and explicit `web/dist/`) to `.gitignore`. *Acceptance:* `make build-web && make serve` → localhost serves the shell wired to live data.
- *Acceptance (phase):* end-to-end shell renders live 1.1.0 data offline; **CLI + 95 tests + golden guard untouched and green**; ruff clean. **Independently shippable.**

### Phase 1 — Load flow + found-reports list + sector-grouped RAG grid *(the cockpit skeleton)*
- **1.1** Pre-run state: the cockpit opens showing the **found-reports list** from `/api/reports` (success #7 — list shown *before* processing) + a **Load reports** button. *Acceptance:* fresh start with only raw PDFs shows the file list, nothing parsed.
- **1.2** Load flow: click → `POST /api/run` (spinner) → `GET /api/metrics` → render. *Acceptance:* one click processes **all** current intake PDFs (< ~3 s).
- **1.3** **RAG grid**, sector-grouped (`sector` → saas/credit/marketplace/payments), companies × canonical metrics × latest period. Honesty affordances (FR6): gross margin shown but marked **"not ranked"**; N/A-by-sector cells rendered as **N/A**, never "missing". *Acceptance:* 10 companies grouped by 4 sectors; LendBridge's GM not ranked beside SaaS.
- *Acceptance (phase):* Load → populated sector grid from a **live** run. **Independently shippable.**

### Phase 2 — Flagship #1: over-time trend explorer *(demo insight #1)*
- **2.1** Trend panel: per company/metric multi-quarter series from the export's `period` axis. **NovaCloud ARR** renders as **one 5-quarter line** (24.1→34.2M) despite the 3 label renames collapsed by the backend. *Acceptance:* NovaCloud ARR = 5 points, one series.
- **2.2** Thin-history guard: companies with < 3 periods show **"insufficient history"** (success #6), never an interpolated/fabricated trend. *Acceptance:* a single-period company shows the guard, not a line.
- *Acceptance (phase):* the over-time flagship renders + is click-traceable (feeds P4). **Independently shippable.**

### Phase 3 — Flagship #2: refuse-to-compare + reconciliation + exceptions + breadth *(demo insight #2)*
- **3.1** **Refuse-to-compare**: rows with `comparison_status="refused"` / `metric_basis="interest_margin"` visibly flagged; the `basis_collision` issue surfaced. *Acceptance:* all 5 LendBridge GM rows show "refused — different basis."
- **3.2** **Reconciliation** panel: `cross_source_discrepancy` (`observed`/`expected`/`delta`) — MediSight own 27.9M vs summary 22.4M (+5.5M), own-report winning; **dedupe the TalentVault −5.5M mirror** (DEC-E). *Acceptance:* one MediSight reconciliation card, own-wins, mirror not double-shown.
- **3.3** **Exceptions / early-warning**: sector-aware `missing_metric` — zero false "missing" for the lender's SaaS metrics (success #5). *Acceptance:* LendBridge shows only genuine gaps (e.g. one `headcount`), never `arr_eop`.
- **3.4** **"Also covered" breadth**, reframed (DEC-D) as the **label-drift / raw-terminology showcase**: the 30 distinct raw labels collapsed to canonical IDs + the 2 optional metrics. **⚠️ First-to-cut de-scope candidate:** if P3 runs long, drop this item **without touching 3.1–3.3**. *Acceptance:* the panel shows source-terminology breadth, honestly labelled (no fake raw-tail) — OR is cleanly omitted with the other three intact.
- *Acceptance (phase):* the refuse-to-compare + reconciliation flagships render live. **Independently shippable.**

### Phase 4 — Provenance drill-down *(trust the numbers)*
- **4.1** Click any number (grid cell / trend point) → panel showing `source_file`, `raw_label`, `raw_value_text`, `confidence`, `source_snippet`, labelled **"source file (file-level)"** (DEC-C). *Acceptance:* every displayed number is **one click** from its provenance (success #4).
- *Acceptance (phase):* provenance works from every panel. **Independently shippable.**

### Phase 5 — Polish + pre-built bundle + demo dry-run *(de-risk to demo-ready)*
- **5.1** Visual design pass — load `frontend-design` + `dataviz` skills; RAG colors accessible in light/dark; the credit **"proof of range"** treatment in the grid (LendBridge present + a one-line "same engine, no benchmark yet" note; the deck slide is Doc iii). *Acceptance:* cockpit reads as one system.
- **5.2** Build + commit the **known-good production bundle** (`web/dist`); the demo serves it — **never** a dev server. Pre-warm safety-net run allowed before the call (DEC-3). *Acceptance:* `make serve` on the committed bundle runs with the network **off**.
- **5.3** Full offline dry-run of the exact demo script: start clean → Load → grid → NovaCloud trend → refuse-to-compare → click-to-source. *Acceptance:* end-to-end **< ~3 s**, no network, both flagships + provenance green.
- *Acceptance (phase):* demo-ready, offline, from a pre-built bundle. **Independently shippable.**

> **Incremental-scoping — DECIDED 2026-07-12 (Xavier): graded core `P0–P4` only; `P5` polish deferred.** Committed v1 = P0 (API+shell) → P1 (grid) → P2 (flagship #1) → P3 (flagship #2) → P4 (provenance). The two flagship insights + click-to-source are what the brief grades ("demo tells the story" + "trust the numbers"). P2+P3 may still be built together if the clock is tight (mirroring the backend's P1+P2).
>
> **⚠️ Demo-safety carve-out (not cosmetic):** P5.1 (visual design polish) is deferred, but **P5.2 (commit a known-good pre-built bundle) + P5.3 (full offline dry-run)** are the live-failure safety net — they prevent a live `npm run dev` failure or a stray network call from killing the demo. They are **retained** as a lightweight **"demo-ready" checklist folded into the tail of P4**, run before the interview regardless of P5's deferral.

---

## 8. Blast radius, rollback & observability

**Blast radius:** contained to **new files** (`webapp.py`, `web/*`) + **append-only** edits (`.PHONY`, `.gitignore`, `pyproject` `web` extra). No existing runtime module changes behavior; delete the web layer and `make publish` / `make test` / `make verify-golden` pass identically. No external consumers (localhost only).

**Rollback triggers + actions** (this app's "production" is a live screen-share, so rollback = *"the demo still runs"*):
- **Vite build fails / bundle won't serve** → serve the last committed **known-good bundle** in `web/dist` (P5); the demo **never** runs `npm run dev`. *(This is the primary de-risk for the React choice.)*
- **`/api/run` errors live** (a PDF fails to parse) → the route catches per-PDF errors and returns the successful subset + a visible "N of M parsed" — never a 500 that blanks the screen. Pre-warm run before the call is the safety net.
- **A network call is attempted live** → impossible by construction (LocalPdfParser forced); the `parser_used=="local"` assertion is the guard.
- **Backend regression** → not possible from this additive work; the backend's `recall-mode` flag is its own independent rollback.

**Observability (lightweight, demo-appropriate):** `/api/run` returns `{parsed, total, elapsed_s, schema_version}` so the UI shows "24/24 parsed in 0.9 s"; per-PDF parse outcome logged server-side; the found-reports list is the pre-run health check. **Canary / success signal:** both flagships render (NovaCloud 5-quarter ARR; LendBridge GM refused) and every number is one click from its source file — if either flagship is blank, stop and inspect before the demo.

---

## 9. Open questions / approval gate *(Stage 3 stops here — no code yet)*

Gate resolved 2026-07-12 (Xavier). Recorded for traceability:

1. **Phasing / incremental scope** — ✅ **RESOLVED: graded core `P0–P4` only; `P5` visual polish deferred.** Demo-safety carve-out: P5.2 (pre-built bundle) + P5.3 (offline dry-run) are retained as a "demo-ready" checklist at the tail of P4 (see §7 note).
2. **Build contract sanity** — ✅ **ACCEPTED (ground-truth-verified, no objection):** offline by **forcing `LocalPdfParser`** (not by dropping keys); **`recall_mode="enhanced"` passed explicitly** on every call; **G1 by explicit glob**. Proceed on this read.
3. **Breadth-panel (DEC-D)** — ✅ **RESOLVED: hybrid** — build as the label-drift / raw-terminology showcase, **first-to-cut de-scope candidate in P3**.

*(Already resolved by the spec — no action needed: credit = proof of range, not a screen (D-E); provenance = file-level (FR6); enhanced-only, no toggle (D6).)*

**Status: APPROVED — gate cleared.** Hand off to `/spec-flow:3-phase-plans` to explode `P0…P4` (+ retained P5.2/P5.3 demo-ready checklist) into per-phase build specs + a Build DAG + a naming registry (binding the SPA to the frozen §A field names verbatim). **No code is written until then.**

---

### Appendix — reproduce the current (backend) baseline
```bash
cd personal/sagard-portfolio-metric-extractor
make publish         # 24 docs, enhanced 1.1.0 by default (the app runs this in-process, offline)
make test            # 95 passed  (the retrocompat baseline this plan must keep green)
make verify-golden   # legacy byte-identical + enhanced baseline
```
