# Portfolio Cockpit — Spec & Scope

> **Spec-Flow Stage 1+2 output.** Feeds `/spec-flow:2-main-plan`.
> **Feature slug:** `portfolio-cockpit` · **Decision owner:** Xavier (xavier@prosperalabs.ai)
> **Date:** 2026-07-10 · **Stage:** `scoped` (awaiting approval)
> **Sibling docs:** `case-study/00-foundations-and-decisions.md` (D1–D5, metric sets, §9 scope — the source of truth this spec reuses), `case-study/i-context-and-problem.md` (Doc i), `case-study/ii-a-backend-fix-plan.md` (backend, DONE), `case-study/ii-b-frontend-cockpit-plan.md` (superseded by this spec).
>
> **HARD-GATE:** this stage produced a spec + scope + locked decisions. **No code, no config changed.** Stops for approval.

---

## 1. Problem statement

The portfolio-metrics prototype (backend) is complete: it ingests quarterly PDF reports for 24 documents / 10 fictional portfolio companies, normalizes the numbers, and — after the ii-a recall fix — reaches **90% source recall** while refusing unsafe comparisons and keeping every number traceable to its source file. But it has **no front-end**: today it is a CLI that writes JSON/CSV/markdown.

For the Sagard case-study interview, the brief explicitly requires **"a front-end for displaying the metrics"** and a **live demo** that walks through *"how reports are loaded, what the outputs look like, and 1–2 examples of user insights."** We need a way to **trigger the pipeline from the front-end** and display the trust-flagged metrics as a monitoring cockpit — the live-demo half of the deliverable (the slide deck is Doc iii, tracked separately).

## 2. Objective & users

- **Objective (demo-weighted product seed):** a lightweight **local web app** that loads the intake PDFs on a front-end trigger and displays normalized, source-traceable, trust-flagged metrics — framed as the **seed of an internal Sagard monitoring cockpit**, with the interview demo as the near-term milestone.
- **Primary user (JTBD):** the **portfolio-ops analyst's quarterly workflow** — load the quarter's reports, scan how each company is performing, trust and trace every number — **embodied in the UI and narrated live by Xavier** to investment + portfolio-ops interviewers.

## 3. User flow

**Current:** run CLI commands (`make publish`) → JSON/CSV/markdown files on disk → no visual surface.

**Desired (the demo):**
1. App starts with **only raw PDFs** in `intake-pdf/` — **nothing parsed** (clean start; a pre-warm run before the call is allowed as a safety net).
2. The cockpit shows the **list of reports it found** in the intake folder.
3. Xavier clicks **"Load reports"** → the app runs the pipeline **live, offline** (local parser → normalize → enhanced export) over **every** PDF in the folder in ~1.5 s.
4. The dashboard populates: RAG grid, over-time trend, exceptions, reconciliation flags, breadth, provenance spine.
5. Xavier walks **two flagship insights** — cross-company **refuse-to-compare** (lender vs SaaS gross margin) and over-time **NovaCloud** revenue/ARR label-drift collapsed into one series — clicking any number to show its **source file + original label**.

## 4. Functional requirements

- **FR1 — Flask JSON API (backend seam):** `POST /api/run` triggers the pipeline over `intake-pdf/` (enhanced mode, local parser, offline) and returns the export (or a status + then `GET /api/metrics`); `GET /api/metrics` returns the latest `MetricsLongExport` as JSON; `GET /api/reports` lists the PDFs currently in the intake folder (for the pre-run file list).
- **FR2 — React SPA (view):** a single-page cockpit that (a) shows the found-reports list, (b) has a **Load reports** button → `POST /api/run` → re-fetch → render, (c) renders the **full D4 cockpit**: portfolio RAG grid (sector-grouped), trend explorer (over-time), exceptions/early-warning, reconciliation flags, "also covered" breadth, and a **provenance drill-down** (click any number → source file + raw label + confidence).
- **FR3 — Dynamic folder read (G1 fix):** the app globs `intake-pdf/*.pdf` and passes them **explicitly** to the pipeline, bypassing the `REPRESENTATIVE_PDFS` 3-file shortcut — so adding/removing PDFs is reflected on the next Load. **No change to existing CLI behavior.**
- **FR4 — Offline enforcement:** force the **local** parser (`parser_name="local"` / `PDF_PARSER=local`) so no Firecrawl network call is ever attempted.
- **FR5 — Build & serve:** a Makefile `serve` target runs the Flask app locally; a `build-web` target produces the React bundle; **the demo serves a pre-built bundle** (never a live dev server).
- **FR6 — Honesty affordances:** gross margin shown but marked "not ranked"; refused comparisons visibly flagged; over-time metrics show "insufficient history" not a fabricated trend; provenance labelled "source **file**" (file-level).

## 5. Non-functional requirements

- **Offline / no secrets:** runs with no internet and no API key; nothing can fail on a network call live.
- **Fast:** full run < ~3 s over 24 PDFs (measured: parse 0.4 s + publish 1.05 s).
- **Local:** localhost only, on Xavier's laptop for the screen-shared demo.
- **Additive / retrocompat:** the existing CLI, pipeline, and 95-test suite are untouched; the enhanced/legacy export stays byte-identical; new code is a separate module + optional dependency.
- **Runtime:** Python ≥3.12 backend (3.14 in the venv); Node/Vite for the React build (frontend build-time only).

## 6. Scope

### 6.1 In scope (v1)
- Local Flask JSON API + React SPA cockpit, offline, enhanced mode.
- Front-end-triggered live pipeline run over the current `intake-pdf/` contents (G1 fix, additive).
- **Full D4 cockpit** panels: RAG grid, trend explorer, exceptions, reconciliation flags, breadth, provenance drill-down.
- The two flagship insights (refuse-to-compare + NovaCloud over-time) with file-level provenance.
- PE / equity path (8 equity companies); credit (LendBridge) appears in the grid + a deck "proof of range" slide.
- Makefile `serve` + `build-web` targets; pre-built bundle for the demo.

### 6.2 Out of scope / non-goals (named)
1. **Cloud deploy / hosting / public URL** — local only.
2. **Auth / login / multi-user.**
3. **Browser file-upload UI** — the app reads the intake folder, no drag-and-drop.
4. **Enhanced/Legacy before-after toggle** — v1 stretch, not built by default.
5. **Private-credit path built/demoed** — designed, longitudinal extension only (foundations §4.5).
6. **Classic-buyout metrics** (EBITDA, leverage, buyout debt) — not in the packs (§4.4).
7. **Page/sentence-level provenance** — file-level only in v1 (§1, §6A.1).
8. **Cross-lender/peer benchmarking** — one lender (§6A.3).
9. **Marketplace/payments deep-dive** — breadth only (§6A.4).
10. **Cited chat** — stretch, shown last (§8).
11. **Rungs 5/6** (draft commentary, board/LP packs), warehouse/BI feed, ILPA export, entity-resolution, OCR — roadmap (§9).
12. **New label-drift / restricted-cash hardcoding** — new wordings degrade to a flagged blank; rulebook extension is roadmap.
13. **Editing / write-back / database** — read-only display of pipeline output.
14. **The slide deck** — Doc iii, tracked separately (this spec is the app only).

### 6.3 Success criteria (observable)
1. The whole demo runs **fully offline** (no network/API key) end-to-end without failure.
2. **Load reports** processes **all** PDFs currently in `intake-pdf/`; adding/removing a PDF is reflected on the next run (G1 works — proves "dynamic").
3. Both flagship insights render: cross-company **refuse-to-compare** + over-time **NovaCloud** trend.
4. Every displayed number is **one click** from its source **file** + original label + confidence.
5. **Zero false "missing"** flags for N/A-by-sector metrics (sector-aware).
6. Over-time metrics show **"insufficient history,"** never a fabricated trend.
7. Full run completes in **< ~3 s**, with the **found-reports list** shown before processing.
8. **Backend retrocompat intact:** 95 tests stay green, legacy export byte-identical, app purely additive.
9. Deck delivered as a link **48 h before** the interview (deck = Doc iii, separate).

### 6.4 Affected surfaces
- **New (additive):** `portfolio_metrics/webapp.py` (Flask app), a `web/` React project (Vite), Makefile `serve` + `build-web` targets, `flask` as an optional `web` extra in `pyproject.toml`.
- **Modified (minimal):** none required in existing modules — G1 is handled by the app passing explicit inputs. (If DEC-9b is later chosen, `extract_text.py` default resolver changes; not in v1.)

## 7. Current-state inventory (verified live)

- Backend pipeline complete: parse → normalize → export, **enhanced default**, **95 tests green**, **offline, no API key**, ~1.5 s over 24 PDFs, **stateless** (safe in a long-lived server).
- `intake-pdf/` = **24 raw PDFs** (demo input). `outputs/parsed/` currently holds 24 parsed files (incidental; demo starts clean per DEC-3).
- **No web layer exists.** A `case-study/cockpit.html` was built by a parallel track then **deleted** — the view is a fresh build.
- Frozen **1.1.0 export contract** (§A of ii-a) is what the SPA binds to.

## 8. Reusable seams

| Seam | What it gives the app | Anchor |
| --- | --- | --- |
| In-process pipeline | `normalize_documents(paths, recall_mode="enhanced")` → `build_metrics_export(results, paths, recall_mode="enhanced")` → export object, **no disk** | `cli.py:281`, `publish.py:79` |
| Raw-PDF offline parse | `extract_documents(settings, pdf_paths, out, parser_name="local")` — parses raw PDFs, no network | `extract_text.py:65` |
| Local parser (offline, no key) | `LocalPdfParser` (pure `pypdf`); `Settings()` never raises without keys | `parser_local.py:11`, `config.py` |
| JSON for the SPA | `export.model_dump(mode="json")` → `jsonify` | `publish.py` |
| Renderer template pattern | `render_summary_markdown(export)` (reference for panel logic) | `publish.py:333` |
| G1 blocker (bypass via explicit inputs) | `REPRESENTATIVE_PDFS` default resolver | `extract_text.py:14-18`, `resolve_pdf_inputs:55-62` |
| Makefile home | `demo`/`full-demo` pattern; add `serve` + `build-web` | `Makefile:31,35` |

## 9. Retrocompat / existing-system impact

- **Posture: additive.** New Flask module, new React project, new optional dependency, new Makefile targets. The existing CLI, pipeline, publish, schema, and the 95-test suite are **not touched**.
- **The only behavior-adjacent choice — G1 — is handled additively:** the app passes explicit inputs, so `resolve_pdf_inputs`'s representative shortcut is never triggered and **existing CLI behavior is unchanged** (✅ SAFE).
- **Supersede recorded:** foundations §8 said the demo surface is "a single self-contained HTML file — no server." This spec **supersedes that** with a local server app (DEC-12), preserving the "nothing fails live" guarantee via offline local parsing.

## 10. Per-decision trade-off tables

Decisions resolved interactively with the owner. Rejected alternatives kept for traceability.

**D-A — Framework / view technology**

| Option | Pros | Cons | Retrocompat | Effort | Verdict |
| --- | --- | --- | --- | --- | --- |
| Flask + vanilla JS | no build; fastest; hard to break live | less "modern" | ✅ | Low | Recommended by agent |
| **Flask API + React SPA** | Xavier's stack; component structure; showcases skill | Node/Vite build; more live-failure surface | ✅ (additive) | High | **CHOSEN** (owner) — mitigated by pre-built bundle |
| Flask + React via CDN | some React feel, no build | awkward middle | ✅ | Med | Rejected |

**D-B — How to fix G1 (`REPRESENTATIVE_PDFS`)**

| Option | Retrocompat | Verdict |
| --- | --- | --- |
| **App passes explicit inputs** | ✅ SAFE (additive) | **CHOSEN** |
| Change CLI default resolver | ⚠️ CONDITIONAL | Rejected (v1) |
| Remove `REPRESENTATIVE_PDFS` | ⚠️ CONDITIONAL | Rejected |

**D-C — v1 panel scope** → **Full D4 cockpit** chosen (grid + trend + exceptions + reconciliation + breadth + provenance). Rejected: core-two-only; minimal.

**D-D — Enhanced/Legacy toggle** → **Enhanced only** (toggle = stretch). Rejected: build toggle in v1.

**D-E — Credit path** → **"Proof of range"** (in grid + deck slide, no dedicated screen). Rejected: full working credit screen (1 lender = thin); grid-only-no-mention.

**D-F — Demo flow** → **Start clean, pre-warm allowed**. Rejected: depend on pre-parsed.

**D-G — Trigger** → **Whole folder, one click, with a visible file list**. Rejected: per-file selection.

**D-H — Data feed** → React SPA fetches `/api` (supersedes the earlier "server-side inject" idea, which only applied to a static HTML view).

## 11. Locked decisions

| # | Decision | Choice | Owner | Date | Rationale |
| --- | --- | --- | --- | --- | --- |
| 1 | Objective framing | Demo-weighted product seed | Xavier | 2026-07-10 | Interview near-term; roadmap credibility |
| 2 | Primary user / JTBD | Analyst quarterly workflow, narrated by Xavier | Xavier | 2026-07-10 | Matches brief's audience |
| 3 | Demo flow | Start clean, pre-warm allowed | Xavier | 2026-07-10 | Shows "how reports are loaded" (D8) |
| 4 | Trigger | Whole folder, one click + file list | Xavier | 2026-07-10 | Audience sees the reports picked up |
| 5 | Panel scope | Full D4 cockpit (all panels) | Xavier | 2026-07-10 | Complete cockpit matches the deck |
| 6 | Before/after toggle | Enhanced only (toggle = stretch) | Xavier | 2026-07-10 | Not in locked design; flagships carry the story |
| 7 | Credit path | Proof of range (grid + slide) | Xavier | 2026-07-10 | 1 lender = no benchmark (foundations D2c) |
| 8 | Framework | Flask API + React SPA | Xavier | 2026-07-10 | Xavier's stack; pre-built bundle de-risks live |
| 9 | G1 fix | App passes explicit inputs (additive) | Xavier | 2026-07-10 | Zero CLI behavior change |
| 10 | Offline | Force local parser, no API key | Xavier | 2026-07-10 | Nothing fails live (recommended, confirm at approval) |
| 11 | App location | `portfolio_metrics/webapp.py` + `web/` (additive) | Xavier | 2026-07-10 | Additive module + separate frontend |
| 12 | Demo surface | Local server app supersedes §8 "no server" | Xavier | 2026-07-10 | Trigger from front-end; offline preserved |
| 13 | Deck | Out of this spec (Doc iii) | Xavier | 2026-07-10 | App only here |

## 12. Open items → resolve in the master plan

- Exact panel layout / visual design (defer to build; load `frontend-design` + `dataviz` skills then).
- Whether `/api/run` is synchronous (returns export) or async (status + poll) — trivial at ~1.5 s; lean synchronous.
- Node/Vite availability on Xavier's machine + the `build-web` pipeline details.
- D5 reconciliation display (already emitted by the backend; cockpit just shows it).
- D2b (Rule-of-40 proxy), D2d/D2e display specifics — inline during build.

---

**Handoff:** Scope locked. Run `/spec-flow:2-main-plan` to consolidate this into a phased master plan.
