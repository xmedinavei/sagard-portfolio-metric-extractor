# Phase 0: Foundations — API seam + build/serve toolchain (Build Spec)

> **Date:** 2026-07-12
> **Status:** ✅ **Built + Audited** (2026-07-12) · **8** webapp tests — **95** without the `web` extra → **103** with · 3 adversarial auditors, **0 Critical/High**, all findings resolved inline
> **Scope:** additive, gated, no migration; non-opted-in users (CLI + 95-test suite + golden guard) observably unchanged.
> **Depends-on:** none (this is the **atomic foundations GATE**)  ·  **Blocks:** Phase 1, Phase 2, Phase 3, Phase 4
> **Feeds:** the `/api` envelope (§A.1–A.3), the 1.1.0 export shape (§A.4), the naming registry, and `make serve`/`make build-web` — everything every later phase consumes.  ·  **Parallelizable-with:** none (must land first)
> **Parent plan:** [`../01-plan.md` §7 Phase 0](../01-plan.md)  ·  **Index:** [`./README.md`](./README.md)
> **Target file(s) / code root:** `portfolio_metrics/webapp.py` (new), `web/` (new Vite project), `pyproject.toml`, `Makefile`, `.gitignore`
> **Ground-truthed:** 2026-07-12 (HEAD `995965c`, clean)

## Purpose

Phase 0 stands up the **thinnest possible working skeleton**: a Flask JSON API (`portfolio_metrics/webapp.py`) that drives the existing pipeline **in-memory and offline**, plus a Vite/React shell (`web/`) that fetches from it, plus the `make build-web`/`make serve` toolchain. It is the **atomic gate**: nothing user-visible beyond "a shell renders live 1.1.0 data," but it **freezes the three things every later phase binds to** — the `/api` envelope, the exact 1.1.0 export field names, and the naming registry. The whole layer is deletable with zero effect on the CLI: the 95-test suite and golden guard import neither `flask` nor `webapp`, so they **cannot** break. This is the greenfield analog of "additive foundations behind an atomic gate."

## Reorganization vs. the parent plan

- **No task hoisting into Phase 0** beyond what the plan already put here (plan §7 Phase 0 = tasks 0.1–0.4). The one plan-wide re-org (retained `P5.2`+`P5.3` folded into Phase 4's tail as a demo-ready checklist) is recorded in `04-provenance.md`, not here.
- **Ground-truth correction folded in:** the plan's §3 pointed `schema_version = "1.1.0"` at `schema.py:222`. The literal actually lives at `publish.py:23` and is stamped by `build_metrics_export` only when `recall_mode=="enhanced"`. Net effect on this phase: **do nothing special** — passing `recall_mode="enhanced"` yields `1.1.0` for free. Recorded in §A.4.

## §A Frozen cross-phase data contracts

*Declared once, here. Every consumer phase references these by anchor (e.g. "see `00-foundations.md` §A.4") and never re-describes them. Changing a contract after build starts is a breaking change — freeze deliberately.*

### A.1 `ReportsResponse` — produced by `api_reports` (Phase 0), consumed by `ReportsList` (Phase 1)

```
GET /api/reports  →  200
{
  "reports":    string[]   // sorted PDF file names found in intake-pdf/  (e.g. "NovaCloud_Q2_2025.pdf")
  "intake_dir": string     // "intake-pdf"
  "count":      int        // reports.length
}
```
- **Producer:** `portfolio_metrics/webapp.py` `api_reports` writes it (globs `intake-pdf/*.pdf`, name-only). **Consumer:** Phase 1 `ReportsList` renders the list *before* any processing (success criterion #7).
- **Retrocompat:** brand-new route; no existing caller. G1: the glob is **explicit inputs**, never `resolve_pdf_inputs(..., [])`.

### A.2 `RunResponse` — produced by `api_run` (Phase 0), consumed by `App` load flow (Phase 1) + all panels

```
POST /api/run  →  200   (body: none, or optional {"intake_dir": string})
{
  "schema_version": string   // "1.1.0"  (mirror of export_metadata.schema_version)
  "parsed":         int      // PDFs successfully parsed
  "total":          int      // PDFs found
  "elapsed_s":      float    // wall-clock of the in-memory run (~0.9s over 24 PDFs)
  "export":         MetricsExport   // the full 1.1.0 dict — see §A.4
}
```
- **Producer:** `api_run` runs the §3.1 in-memory chain (`run_pipeline_in_memory`), caches the result in `_LATEST_EXPORT`, returns this envelope. **Consumers:** Phase 1 sets app state from `export`; Phases 2/3/4 read `export.metrics` / `export.issues` / `export.export_metadata`.
- **Retrocompat:** new route. **Never returns 500 for a single bad PDF** — a per-PDF parse error is caught, that PDF is skipped, and `parsed < total` communicates the degradation (plan §8 rollback).
- **Hazard:** `parsed`/`total` prove G1 (add/remove a PDF in `intake-pdf/` → the numbers move on the next run).

### A.3 `MetricsResponse` — produced by `api_metrics` (Phase 0), consumed by any panel re-reading state

```
GET /api/metrics  →  200
{ "export": MetricsExport | null }   // null if POST /api/run has not run yet this process
```
- **Producer:** `api_metrics` returns `_LATEST_EXPORT` (or `null`). **Consumer:** panels that want the last export without re-running (e.g. a page refresh).
- **Retrocompat:** new route; read-only; no side effects.

### A.4 `MetricsExport` (the enhanced 1.1.0 export) — produced by the backend (unchanged), consumed by every panel

The SPA binds these **verbatim**. Source of truth = `schema.py` as the backend actually emits it in **enhanced** mode (`publish.py:296-297` dumps the full field set — no `exclude`). TypeScript mirror lives in `web/src/types.ts` (task 0.3c).

```
MetricsExport = {
  export_metadata: ExportMetadata
  metrics:         MetricRow[]
  issues:          IssueRow[]
}

// ExportMetadata — schema.py:203  (13 fields)
ExportMetadata = {
  schema_version:          "1.1.0"        // enhanced; "1.0.0" in legacy. Stamped at publish.py:115-119.
  generated_at:            string         // ISO-8601 (datetime after model_dump(mode="json"))
  generator_name:          "portfolio-metrics"
  generator_version:       string
  source_parsed_artifacts: string[]       // sorted file names
  document_count:          int
  metric_count:            int            // = metrics.length
  valid_metric_count:      int
  invalid_metric_count:    int
  issue_count:             int            // = issues.length
  core_metrics:            CanonicalMetric[]
  optional_metrics:        CanonicalMetric[]
  recall_mode:             "enhanced"      // present in enhanced only (excluded from legacy JSON)
}

// MetricRow — NormalizedMetric schema.py:144  (23 fields; every field emitted in enhanced)
MetricRow = {
  company_name:      string
  period:            string | null         // nullable (schema.py:148)
  canonical_metric:  CanonicalMetric       // 8-value closed enum (schema.py:8-17)
  value:             float  | null         // nullable (schema.py:150)
  unit:              MeasurementUnit       // schema.py:19-26
  display_value:     string
  raw_label:         string                // the source's own terminology (drives breadth + provenance)
  raw_value_text:    string
  source_file:       string                // provenance anchor (file-level)
  source_page:       int | null            // OFTEN NULL by design — provenance is file-level in v1 (schema.py:156)
  source_snippet:    string
  document_type:     DocumentKind          // default "company_report"
  confidence:        float                 // default 0.0
  parsing_method:    string | null
  detection_method:  "table_row" | "narrative"
  metric_basis:      MetricBasis | null    // enhanced-populated; "interest_margin" forced for credit GM (pipeline.py:76)
  notes:             string[]              // default []
  is_valid:          boolean               // default true
  parse_error:       string | null
  sector:            SectorKind            // enhanced: ALWAYS one of 4 (never null); defaults "saas" (pipeline.py:66)
  value_normalized:  float | null          // usually null (only payments own-period cash_balance)
  currency:          null                  // ⛔ RESERVED — declared but never populated; ALWAYS null (schema.py:169)
  comparison_status: ComparisonStatus | null  // enhanced sets "comparable", flips refused rows to "refused"
}

// IssueRow — NormalizationIssue schema.py:173  (13 fields)
IssueRow = {
  severity:         "info" | "warning" | "error"
  code:             string                 // 9 emitted values — see below; treat as OPEN, render known, ignore rest
  message:          string
  source_file:      string
  source_page:      int | null
  company_name:     string | null
  canonical_metric: CanonicalMetric | null
  raw_label:        string | null
  raw_value_text:   string | null
  period:           string | null          // reconciliation join key (schema.py:186)
  expected_value:   float | null           // reconciliation: the SUPPRESSED summary value (schema.py:187)
  observed_value:   float | null           // reconciliation: the RETAINED company-report value (schema.py:188)
  delta:            float | null           // reconciliation: round(observed - expected, 6) (schema.py:189)
}
```

**Enums (verbatim):**
- `CanonicalMetric` (`schema.py:8-17`, 8 values): `revenue_qtr`, `arr_eop`, `gross_margin_pct`, `cash_balance`, `monthly_burn`, `headcount`, `net_revenue_retention_pct`, `logo_churn_pct`.
- `SectorKind` (`schema.py:32`): `saas`, `credit`, `marketplace`, `payments`.
- `MetricBasis` (`schema.py:33`): `quarterly`, `period_end`, `monthly`, `ltm`, `interest_margin`.
- `ComparisonStatus` (`schema.py:34`): `comparable`, `refused`, `unchecked`.
- `MeasurementUnit` (`schema.py:19-26`): `usd`, `percentage`, `count`, `multiplier`, `basis_points`, `unknown`.
- `DocumentKind` (`schema.py:28`): `company_report`, `portfolio_summary`.

**Issue `code` values actually emitted (9 — the frontend must render the ones it uses and silently ignore the rest):**
`parse_failure`, `duplicate_candidate`, `conflicting_candidates`, `portfolio_summary_document`, `missing_metric`, `cross_document_duplicate`, `cross_document_conflicting_candidates`, `cross_source_discrepancy` *(enhanced only — reconciliation)*, `basis_collision` *(enhanced only — refuse-to-compare)*.

**⛔ RESERVED — do NOT bind in v1** (all three are legal-but-dead; binding them shows empty/false UI):
1. `code == "unrecognized_label"` — enumerated in planning docs, **never emitted** by any runtime path.
2. `MetricRow.currency` — declared at `schema.py:169`, **never assigned**, always `null`.
3. `comparison_status == "unchecked"` — legal enum value, **never assigned** by any code path.

- **Retrocompat of A.4:** the export is produced by **unchanged** backend code. The SPA is a **new reader**; it adds no field and changes no producer. Passing `recall_mode="enhanced"` is what yields the full 23-field superset + `1.1.0`.

## § Phase 0 TODOs

> Format: **`action → file:line → acceptance`**. Work top-to-bottom; satisfy each group's **Acceptance** before moving on.
> Legend: `☐` to-do · `☑` implemented · `✅` acceptance verified.

### 0.1 Add the `web` optional-dependency extra

- `☐` **0.1a** Add `web = ["flask>=3.1,<4.0"]` to the `[project.optional-dependencies]` table → `pyproject.toml:22` (the table is at `:22`; `dev` is at `:23-26` — add `web` as a sibling key, do **not** touch core `[project] dependencies` at `:14-20`).
- `☐` **0.1b** Install + verify it resolves in the venv (Python 3.14): `pip install -e ".[web]"`.
- **Acceptance:** `flask` imports inside the venv; `python -c "import portfolio_metrics"` still works with **no** flask import triggered (core CLI stays flask-free — `pyproject.toml:14-20` unchanged, flask absent from core deps).

*Template to copy: the existing `dev` extra at `pyproject.toml:23-26` — mirror its list-of-pinned-strings shape.*

### 0.2 Create the Flask API (`webapp.py`) driving the pipeline in-memory + offline

- `☐` **0.2a** Create `portfolio_metrics/webapp.py` with a **guarded, module-local** flask import (`import flask` / `from flask import ...` at module top is fine **because nothing imports `webapp` at collection time** — but keep it out of `portfolio_metrics/__init__.py`, which imports nothing today, `__init__.py:1-5`). Add `create_app() -> Flask` (app factory) → new file.
- `☐` **0.2b** Implement `list_intake_reports(intake_dir: Path) -> list[str]` → in `webapp.py` (glob `intake_dir/"*.pdf"`, return sorted `p.name`). Wire it to `GET /api/reports` handler `api_reports` returning **§A.1**. G1: this is the **explicit-inputs** path — it must never call `resolve_pdf_inputs(..., [])` (that reactivates the 3-file `REPRESENTATIVE_PDFS` cap at `extract_text.py:55-62`).
- `☐` **0.2c** Implement `run_pipeline_in_memory(intake_dir, *, recall_mode="enhanced") -> MetricsLongExport` → in `webapp.py`. The **in-memory, no-disk, offline** chain (this wiring is NEW — no existing function chains these without disk I/O; `cli.py:281-322` deliberately round-trips through disk JSON, so **do not** reuse `normalize_documents`):
  ```
  for pdf in sorted(intake_dir.glob("*.pdf")):
      parser_output = LocalPdfParser().parse(pdf)                      # parser_local.py:16 — pure pypdf, offline
      results.append(normalize_parser_output(parser_output,           # pipeline.py:40 — in-memory ParserOutput
                                              recall_mode="enhanced")) #   MUST pass "enhanced" explicitly (default is "legacy")
  export = build_metrics_export(results=results,                       # publish.py:79
                                parsed_paths=[Path(pdf.name) for pdf in pdfs],  # only .name is read (publish.py:89)
                                recall_mode="enhanced")
  return export                                                        # MetricsLongExport (schema.py:222)
  ```
  Assert `parser_output.parser_used == "local"` on every doc — the offline guard. *(Build correction: `ParserOutput` has no `parser_name` field; that is the class attribute on `LocalPdfParser` at `parser_local.py:14`. The output field is `parser_used` at `schema.py:65`.)* Catch a per-PDF parse **or normalize** error, skip that PDF, keep going.
- `☐` **0.2d** Wire `POST /api/run` handler `api_run` → runs `run_pipeline_in_memory`, stores it in module cache `_LATEST_EXPORT`, returns **§A.2** (`export = _LATEST_EXPORT.model_dump(mode="json")` — `schema.py:222` model, `mode="json"` proven at `cli.py:342`). Wire `GET /api/metrics` handler `api_metrics` → returns **§A.3**. Add `spa_index` + static serving so `GET /` serves `web/dist/index.html` same-origin (no CORS).
- `☐` **0.2e** Keep `webapp.py` ruff-clean (line-length 100, `pyproject.toml:36`) — it **is** inside `make lint` scope (`Makefile:66` lints `portfolio_metrics tests`). All imported symbols are import-side-effect-free (verified).
- `☐` **0.2f** Add `tests/test_webapp.py` with **`pytest.importorskip("flask")` as the first executable line** (before any `webapp` import) → new file. This is the H6 guard: without the `web` extra, pytest **skips** these tests and collection stays flask-free, so the 95-test baseline is unchanged; with the extra installed, they run. ~3 tests: offline run returns `1.1.0` + 116 metrics; G1 add/remove-PDF moves `parsed`/`total`; corrupt-PDF → `parsed < total`, no 500. Force `LocalPdfParser` in-process (H2).
- **Acceptance:** `POST /api/run` returns `schema_version == "1.1.0"`, `metric_count == 116` (current corpus), fully offline (no network — verified under a hard network block); adding/removing a PDF in `intake-pdf/` changes `parsed`/`total` on the next run (**G1 proven — 24 not 3**); a deliberately corrupt PDF **and** a normalize failure both yield `parsed < total` and a 200 (never a 500). **Without** the `web` extra, `make test` still collects + passes **95** (the webapp tests skip as one module); **with** `.[web]` installed, **103** green (8 webapp tests). *(Build note: count is 103, not the spec's original estimate of 98 — 8 tests shipped, not ~3.)*

*Template to copy: the per-doc normalize call at `cli.py:319-320`; the export-build call shape at `cli.py:653-655`; the enhanced serialize path at `publish.py:293-298` (`_serialize_export`). Renderer walk reference: `render_summary_markdown` at `publish.py:333`.*

### 0.3 Scaffold the Vite + React + TypeScript shell (`web/`)

- `☐` **0.3a** Create `web/` with `package.json`, `vite.config.ts` (set `base: "./"` so built assets resolve under Flask same-origin), `tsconfig.json`, `index.html`, `web/src/main.tsx` → new files (no `web/` exists today — greenfield, no stale scaffold to reconcile).
- `☐` **0.3b** `web/src/App.tsx`: minimal `App` with a state machine `idle → loading → loaded → error`; on mount fetch `/api/metrics`, render "loaded N metrics from M reports" (or an idle prompt if `export` is null).
- `☐` **0.3c** `web/src/api.ts` (`fetchReports`, `runPipeline`, `fetchMetrics`) + `web/src/types.ts` (`MetricRow`, `IssueRow`, `ExportMetadata`, `MetricsExport`, `ReportsResponse`, `RunResponse`) — the TS types mirror **§A.4 verbatim** (mark `currency` and the `unchecked`/`unrecognized_label` reserved cases with a `// RESERVED — do not bind` comment so no later phase wires them).
- **Acceptance:** `cd web && npm ci && npm run build` produces `web/dist/` (`index.html` + hashed assets, relative `./assets/` URLs); opening it through Flask serves the shell + assets same-origin and renders the "loaded N metrics" line from **live** data **once a run has populated the cache** (a cold-start process shows the idle prompt — the Load trigger arrives in Phase 1 §1.2; §0.3b renders idle when `export` is null by design).

*Template to copy: none in-repo (greenfield). Use a standard `npm create vite@latest -- --template react-ts` layout; keep it minimal.*

### 0.4 Makefile targets + `.gitignore`

- `☐` **0.4a** Append `build-web` + `serve` targets to `Makefile` **after line 67** → new recipe blocks. `build-web:` runs `cd web && npm ci && npm run build`; `serve: setup` runs Flask serving `web/dist` (mirror how every recipe goes through `$(PYTHON)` — `Makefile:3`; e.g. `$(PYTHON) -m portfolio_metrics.webapp`). Reuse `INPUT_DIR ?= intake-pdf` (`Makefile:7`).
- `☐` **0.4b** Append the two target names to the `.PHONY` list → `Makefile:12` (currently ends `... lint clean`; make it `... lint clean serve build-web`). **Append-only** — touch no existing word.
- `☐` **0.4c** Append `node_modules/` to `.gitignore` (after `:24`). `web/dist` is **already** ignored by the depth-agnostic `dist/` rule at `.gitignore:14` (verified via `git check-ignore`) — do **not** add a second dist rule.
- **Acceptance:** `make build-web && make serve` serves the shell at localhost wired to live data; `git status` shows **no** `node_modules/` or `web/dist/` noise; `.PHONY` diff is append-only.

> ⚠️ **Hazard callouts (carry into every later phase):**
> - **H1 — recall mode:** library functions default `recall_mode="legacy"`; the app must pass `"enhanced"` **explicitly** to `normalize_parser_output` **and** `build_metrics_export`. Only the CLI reads the flipped `Settings` default (`config.py:44`).
> - **H2 — offline ≠ no-keys:** `Settings()` reads the committed `.env` (real keys) and defaults `pdf_parser="firecrawl"`. Offline is guaranteed by **forcing `LocalPdfParser`**, not by missing keys. Never construct the parser via `Settings`.
> - **H3 — G1 explicit inputs:** always glob + pass explicit paths; **never** `resolve_pdf_inputs(..., [])` (reactivates the 3-file cap).
> - **H6 — flask isolation:** never import `webapp` from `portfolio_metrics/__init__.py` or any always-loaded module, or pytest collection would need flask installed.

## § Retrocompat notes

| Change | Class | Why safe |
| --- | --- | --- |
| New `portfolio_metrics/webapp.py` | ⚠️ CONDITIONAL | Inside ruff (`Makefile:66`) + wheel (`pyproject.toml:40` `include=["portfolio_metrics*"]`) scope → keep ruff-clean + guard flask so the package imports even without the extra; never imported by `__init__.py:1-5` (imports nothing today) so pytest collection stays flask-free. |
| New `web/` Vite project | ✅ SAFE | Outside `portfolio_metrics*` (not packaged), not ruff/pytest-scoped; `web/dist` already covered by `.gitignore:14` `dist/`. |
| `flask>=3.1,<4.0` as `web` extra | ✅ SAFE | New key alongside `dev` (`pyproject.toml:22-26`); flask stays **out** of core deps (`:14-20`) so the CLI is flask-free. |
| `Makefile` `serve`+`build-web` + `.PHONY` append | ⚠️ CONDITIONAL | Append-only to `.PHONY:12`; new recipe blocks mirror `publish:52-53`; reuse `INPUT_DIR`/`OUTPUT_DIR` (`:7-8`); no existing recipe touched. |
| `.gitignore` `+node_modules/` | ✅ SAFE | Append-only; `web/dist` already ignored. |
| G1 explicit-inputs contract in `api_reports`/`run_pipeline_in_memory` | ⚠️ CONDITIONAL | No shared code edited; correctness is call-site discipline (never pass `[]`). `test_extract_text.py:17-28` still locks both CLI halves unchanged. |

**Net: zero breaking, zero migration.** Non-opted-in users observably unchanged — the 95-test suite + golden guard import neither `flask` nor `webapp`, so they **cannot** break; delete `webapp.py` + `web/` and `make publish`/`make test`/`make verify-golden` pass byte-identically.

## § Definition of done

1. [x] All `0.M` task groups complete; every **Acceptance** met.
2. [x] `make test` → **95** green **without** the `web` extra (webapp tests skip via `importorskip`); **103** with `.[web]`. `make verify-golden` → legacy byte-identical + enhanced baseline (15 passed); `make lint` clean (incl. `webapp.py`).
3. [x] **8** webapp tests in `tests/test_webapp.py`, guarded by `pytest.importorskip("flask")` so collection stays flask-free (H6) — offline run returns 1.1.0 + 116 metrics; G1 add/remove-PDF changes the count (24, not the 3-file cap); corrupt-PDF **and** normalize-failure degrade to `parsed < total`, no 500; the `/api/metrics` null branch is asserted via `monkeypatch`.
4. [x] Every change classified in **§ Retrocompat notes**; nothing BREAKING (3 adversarial auditors, 0 Critical/High).
5. [x] Symbol names match the README naming registry verbatim (`create_app`, `run_pipeline_in_memory`, `list_intake_reports`, `api_reports`/`api_run`/`api_metrics`, the three route paths, the TS type names).
6. [x] Every contract in **§A** frozen; consumers (Phases 1–4) reference them by anchor and re-describe nothing.

---

## § Live findings

Drift between this spec and the live tree, discovered while building (all resolved):

- **HEAD moved:** the spec ground-truthed at `995965c`; the tree is now at `6ed12d5` on branch `claude-planning-case-study` (clean). Re-investigation re-confirmed every *code* anchor at the same lines — no logic drift, only two build-file append points shifted.
- **`python` is not on PATH** — only `.venv/bin/python` (Python 3.14.4). The spec's `python -c …` acceptance commands must run through the venv interpreter; `make` recipes already use `$(PYTHON)`.
- **Makefile append point** is **after line 70 (EOF)**, not the spec's ":67" — `lint` is `:65-66` and a `clean:` target occupies `:68-70`. Recipes appended after `clean`.
- **`pyproject.toml` insert point** is after the `dev` block's closing `]` at `:26` (table header `:22`, `dev` `:23-26`).
- **Offline-guard field:** `ParserOutput` has no `parser_name`; the guard uses `parser_output.parser_used == "local"` (`schema.py:65`). `parser_name` is the class attribute on `LocalPdfParser` (`parser_local.py:14`).
- **`.gitignore` `web/dist` nuance:** `git check-ignore web/dist` (no slash) reports "not ignored", but the real directory `web/dist/` and its files ARE ignored by the depth-agnostic `dist/` rule (`.gitignore:14`), confirmed via `git check-ignore -v web/dist/`. No second dist rule added.
- **Live corpus reconfirmed offline:** 24 PDFs → `document_count=24`, `metric_count=116`, 10 companies, `schema_version=1.1.0`, `recall_mode=enhanced` — reproduced with the local parser and again under a hard network block. Test assertions hard-code these.

## § Implementation notes

Built on the **main thread** (foundational contract — hands-on control of the H1/H2/H3/H6 traps):

- **0.1** `web = ["flask>=3.1,<4.0"]` added as a sibling of `dev`; `pip install -e ".[web]"` → flask 3.1.3. Verified `import portfolio_metrics` does **not** load flask.
- **0.2** `webapp.py`: `create_app` (app factory; `static_url_path=""` serves `web/dist` via Flask's built-in `static` endpoint — no invented asset handler), `run_pipeline_in_memory` (NEW in-memory chain `LocalPdfParser().parse → normalize_parser_output → build_metrics_export`, `recall_mode="enhanced"` passed explicitly to **both** calls — H1), `list_intake_reports`, handlers `api_reports`/`api_run`/`api_metrics`/`spa_index`, `_LATEST_EXPORT` cache, plus `main()` for `python -m portfolio_metrics.webapp`. Export via `model_dump(mode="json")` with **no** `exclude` → the full 23-field 1.1.0 superset for free.
- **0.3** Hand-written Vite/React/TS shell (not `npm create vite`) for exact registry conformance + a dependency-light bundle. `base:"./"` → relative asset URLs. `types.ts` mirrors §A.4 verbatim with the 3 RESERVED cases commented do-not-bind. 69 packages, bundle ≈196 kB / 61 kB gzip. `package-lock.json` committed so Phase-4 `npm ci` is reproducible.
- **0.4** Append-only `Makefile` (`serve`/`build-web` + `.PHONY`) and `.gitignore` (`node_modules/`).

**Audit fixes applied inline** (3 auditors, 0 Critical/High, all resolved — no `-fixes.md` sibling needed):
1. *(MED, test adequacy)* the `/api/metrics` null branch was a false green (the module-level cache was populated by an earlier test). Split into a `monkeypatch`ed null-branch test (`_LATEST_EXPORT → None`, assert `export is None`) + a post-run cached-export test.
2. *(LOW, robustness)* widened the per-PDF `try/except` to also skip a **normalize** failure — not just a parse failure — keeping the H2 offline-guard **outside** the swallow so a non-local parser still surfaces loudly. Added `test_normalize_failure_degrades_without_500`.
3. *(LOW, registry)* inlined the `DetectionMethod` union at `detection_method` (removed the extra alias) → strict §A.4 verbatim; bundle hash unchanged (type-only).
4. *(MED, usability)* `make serve` now self-bootstraps the `web` extra (`$(PIP) install -e ".[web]" --quiet`) so a fresh checkout doesn't `ModuleNotFoundError: flask`. Opt-in target only — CLI/tests untouched.

**Doc reconciliations:** test counts 95/103 (8 tests, not ~3/98); 0.2c `parser_name`→`parser_used`; 0.3 cold-start renders idle (the Load trigger is Phase 1).

## § Unblocked phases

Phase 0 (the atomic gate) has landed — every later phase's `Depends-on: Phase 0` is now satisfied:

- **Phase 1** (load flow + RAG grid) — unblocked; the natural next build (it wires the shared "loaded export" state that P2/P3/P4 all read).
- **Phases 2, 3, 4** — unblocked at the contract level (they bind §A.4); each also `Depends-on` Phase 1's loaded-export state, so build them after Phase 1 (parallel-track among themselves).

Frozen and available to all consumers: the `/api` envelope (§A.1–A.3), the 1.1.0 export shape (§A.4), the naming registry, and `make serve` / `make build-web`.
