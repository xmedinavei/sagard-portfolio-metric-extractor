# Interview Tradeoff Ledger

This document maps the main tradeoffs visible in the repository to the code and planning artifacts that support them.

It is written for interview prep, so the focus is not "what the code does" in isolation. The focus is:

- what you chose,
- what you optimized for at the time,
- what you knowingly gave up,
- and where that decision shows up in the repo.

For a simpler speaking version focused on scaling, input surfaces, output surfaces, and security questions, see `plan/INTERVIEW_SCALING_PLAYBOOK.md`.

## 1. What You Optimized For Overall

The project was not built as a production document platform. It was built as a credible take-home proof of concept under a short time box, with the interviewer likely evaluating scoping, judgment, trust, and extensibility more than feature breadth.

That intent is explicit in the repo:

- `spec/SPEC.md:11-14` frames the build as a CLI-first hybrid POC, not a full platform.
- `spec/SPEC.md:49-57` lists the non-goals: no ingestion service, no web app, no notebook dependency, no attempt to support every PDF perfectly.
- `plan/PLAN.md:20-45` locks the three major decisions early: extraction posture, normalization posture, and output contract.
- `README.md:101-106` summarizes the shipped design as deterministic extraction, parser abstraction, provenance, and cross-document dedupe.

The clean way to summarize the repo is:

1. You optimized for `time-to-trust`, not maximum feature coverage.
2. You optimized for `defensibility in an interview`, not product completeness.
3. You optimized for `portable structured output`, not the prettiest demo surface.

## 2. The Three Headline Tradeoffs

### 2.1 Firecrawl-first extraction over local-first or OCR-first extraction

`Tradeoff:` speed and convenience vs local control, portability, and stronger provenance.

`What you chose`

- Firecrawl as the default parser posture.
- A local parser as the offline fallback.
- Azure Document Intelligence kept as a documented future path, not a shipped dependency.

`Why that made sense then`

- The sample corpus was already understood as mostly text-extractable, so OCR-first would have spent time on the wrong problem.
- Firecrawl let you get from local PDFs to usable markdown quickly.
- That freed time for the harder part of the challenge: normalization, provenance, and reviewability.
- The take-home prompt rewarded modern tooling and reasonable scoping, so using a managed parser was a pragmatic choice.

`What you gave up`

- You accepted a vendor dependency and possible usage cost.
- You weakened parser portability.
- On the Firecrawl path, you also accepted weaker source-location fidelity because the extracted content becomes one document-level markdown blob.

`Where it shows`

- `README.md:17-39` splits the repo into a no-key path and a Firecrawl-backed full path.
- `.env.example:3-14` defaults `PDF_PARSER=firecrawl`.
- `portfolio_metrics/config.py:30-38` makes Firecrawl the default parser in config.
- `portfolio_metrics/extract_text.py:98-131` routes to Firecrawl first, then falls back locally if needed.
- `portfolio_metrics/parser_firecrawl.py:64-82` records `page_level=False`.
- `portfolio_metrics/parser_local.py:53-70` records `page_level=True`.
- `options/ARCHITECTURE_OPTIONS.md:28-85` and `plan/PLAN.md:24-39` explain the decision directly.

`Best honest framing`

- "I chose Firecrawl first because it got me to usable text quickly, and the real challenge here was trustworthy normalization, not low-level PDF plumbing."

### 2.2 Deterministic normalization over LLM-first extraction

`Tradeoff:` correctness and auditability vs broader semantic flexibility.

`What you chose`

- Alias-based label detection.
- Deterministic numeric parsing.
- Conservative canonical mapping.
- OpenAI reserved only as an optional future helper for ambiguous label classification.

`Why that made sense then`

- The domain is finance. A wrong normalized value is worse than a missing value.
- Deterministic parsing is much easier to test and defend.
- The interviewer prompt explicitly emphasized ambiguity management and assumptions, not "build the most AI-heavy thing possible."
- You wanted the system to surface uncertainty instead of hiding it behind model confidence theater.

`What you gave up`

- Lower recall on unfamiliar or drifting labels.
- Less ability to generalize to new company-specific KPIs.
- More manual alias maintenance.

`Where it shows`

- `README.md:101-106` says extraction is deterministic and not LLM-driven.
- `README.md:180-187` says `OPENAI_API_KEY` is not required by the current pipeline.
- `portfolio_metrics/metric_aliases.py:8-21` narrows the canonical metric surface.
- `portfolio_metrics/metric_aliases.py:43-125` defines the curated alias map.
- `portfolio_metrics/detect_metrics.py:77-208` only emits candidates when a known alias/value pattern is found.
- `portfolio_metrics/parse_values.py:60-85` rejects approximate or unsupported values instead of guessing.
- `portfolio_metrics/normalize.py:31-83` keeps parse failures visible as invalid rows plus issues.
- `tests/test_value_parser.py:33-38` locks in rejection of ambiguous values like `~$5M`.
- `tests/test_normalization.py:48-70` locks in visibility of parse failures.

`Best honest framing`

- "I kept number parsing deterministic because in finance I care more about trust than about squeezing out a few more guessed rows."

### 2.3 JSON-first output over UI-first, spreadsheet-first, or notebook-first delivery

`Tradeoff:` portability and system design cleanliness vs immediate reviewer friendliness.

`What you chose`

- Long-form JSON as the canonical system contract.
- CSV and markdown summary as optional derivatives.
- CLI reports can be human-readable text or machine-readable JSON.

`Why that made sense then`

- JSON is the easiest artifact to reuse later in a dashboard, API, warehouse job, or internal workflow.
- It keeps provenance attached at the row level.
- It avoids letting presentation concerns distort the extraction contract too early.
- The take-home asked for a small proof of concept, not a polished app.

`What you gave up`

- Less immediate analyst friendliness than a purpose-built review UI or tailored spreadsheet.
- More work for a human reviewer than a bespoke wide table or dashboard.

`Where it shows`

- `options/ARCHITECTURE_OPTIONS.md:182-235` argues for JSON-first explicitly.
- `portfolio_metrics/cli.py:118-155` makes CSV and summary optional flags, not the default contract.
- `portfolio_metrics/publish.py:144-163` always writes JSON and only optionally writes CSV and summary markdown.
- `portfolio_metrics/schema.py:204-209` defines a stable export object around the long-form metric list.
- `tests/test_publish.py:47-84` verifies CSV and summary as derived artifacts, not the primary contract.

`Best honest framing`

- "I wanted the data contract to be stable before I spent time on presentation."

## 3. The Implementation-Level Tradeoffs That Matter in the Interview

### 3.1 Small parser boundary over parser-specific optimization

`Tradeoff:` swapability vs squeezing every parser for its full feature set.

`What you chose`

- A very small parser contract: produce `ParserOutput` and keep downstream code parser-agnostic.

`Why that made sense then`

- It reduced coupling.
- It kept the extraction layer easy to replace if cost, provenance, or PDF difficulty changed.
- It made the repo easier to explain: parser choice is not the whole architecture.

`What you gave up`

- You did not exploit advanced provider-specific features deeply.
- Firecrawl and local parsing are normalized into the same contract, which loses some service-specific richness.

`Where it shows`

- `portfolio_metrics/parser.py:9-19` defines the tiny parser protocol.
- `portfolio_metrics/schema.py:53-106` defines the stable parser output contract.
- `portfolio_metrics/extract_text.py:98-131` keeps parser selection behind a single function.

### 3.2 Faster parsing over strict page-level provenance on the primary path

`Tradeoff:` speed-to-usable-text vs stronger auditability.

`What you chose`

- On Firecrawl, accept file-level provenance plus snippets and page count metadata.
- On local parsing, preserve actual page numbers.

`Why that made sense then`

- The Firecrawl path was the faster path to a clean POC.
- File name plus raw label plus snippet was still enough to support review for a take-home.
- The repo explicitly documents this as a v1 limitation instead of hiding it.

`What you gave up`

- Exact page mapping on the most convenient path.
- Stronger traceability for interview questions like "show me exactly where that number came from on the page."

`Where it shows`

- `portfolio_metrics/parser_firecrawl.py:71-81` records file-level only provenance.
- `portfolio_metrics/parser_local.py:61-68` records page-level provenance.
- `plan/PLAN.md:379-389` explicitly says file + snippet provenance is acceptable for v1 if page mapping is costly.

### 3.3 Closed canonical metric schema over open-ended KPI coverage

`Tradeoff:` comparability and simplicity vs breadth.

`What you chose`

- Six core metrics plus two optional metrics as the entire canonical surface.
- No generic raw-extension row type for company-specific KPIs.

`Why that made sense then`

- The assignment rewarded a meaningful subset, not full KPI capture.
- A narrow schema is much easier to normalize safely.
- It supports cleaner cross-company comparison.

`What you gave up`

- Unsupported but relevant company-specific metrics get dropped instead of preserved in a typed extension model.
- The implementation is narrower than the broader architecture story in the spec.

`Where it shows`

- `spec/SPEC.md:157-197` proposes six primary metrics and optional extensions.
- `portfolio_metrics/schema.py:8-17` hard-codes the canonical set to eight values total.
- `portfolio_metrics/metric_aliases.py:8-21` defines the same narrow set.
- `portfolio_metrics/detect_metrics.py:127-152` and `160-193` only create candidates for known aliases.
- `portfolio_metrics/pipeline.py:65-79` emits missing-core warnings against that fixed set.

`Important interview note`

- This is one of the few places where the shipped code is intentionally narrower than the broader design doc. That is fine if you say it plainly.

### 3.4 Sparse outputs plus warnings over dense "fill every cell" reporting

`Tradeoff:` honesty about missing data vs convenience for wide-table consumers.

`What you chose`

- Missing metrics generate issues.
- They do not get fabricated, backfilled, or hidden behind placeholder values.
- The export stays naturally sparse and long-form.

`Why that made sense then`

- Not every PDF contains every metric.
- Sparse long-form data is a better base contract than forcing a wide table full of null semantics.
- It makes missingness visible, which is useful in itself.

`What you gave up`

- A less immediately familiar spreadsheet-style matrix.
- More downstream work if someone wants a dense company-by-quarter grid.

`Where it shows`

- `portfolio_metrics/pipeline.py:52-80` emits a `missing_metric` issue for absent core metrics.
- `portfolio_metrics/publish.py:172-219` summarizes missing core metrics in markdown output.
- `spec/SPEC.md:380-390` explains why long-form is the primary artifact.
- `tests/test_pipeline.py:77-90` and `tests/test_cli_normalize.py:22-31` verify the missing-core behavior.

### 3.5 One winning row per metric over preserving all competing candidates

`Tradeoff:` clean downstream data contract vs full evidence retention.

`What you chose`

- Collapse to one row per `(company, period, canonical_metric)`.
- Prefer valid parses over invalid ones.
- Prefer table-row matches over narrative matches.
- Prefer company reports over portfolio summary duplicates.

`Why that made sense then`

- A downstream analyst or system needs one best current answer, not an explosion of near-duplicate rows.
- The prompt asked for something reviewable and analyzable, not a forensic evidence store.

`What you gave up`

- You do not preserve all competing candidates as first-class parallel rows.
- Some nuance is compressed into notes and issues.

`Where it shows`

- `portfolio_metrics/normalize.py:94-146` resolves within-document conflicts.
- `portfolio_metrics/publish.py:100-141` resolves cross-document conflicts.
- `portfolio_metrics/publish.py:244-252` encodes the ranking rules.
- `tests/test_normalization.py:7-45` prefers table hits over narrative duplicates.
- `tests/test_publish.py:86-177` prefers company reports over portfolio summaries.

### 3.6 Fail-soft batch behavior over fail-fast strictness

`Tradeoff:` progress and auditability vs stricter run guarantees.

`What you chose`

- Per-file failures are collected and reported.
- Parse failures become invalid rows plus warnings.
- The batch keeps going where possible.

`Why that made sense then`

- For a messy document workflow, partial progress is often more useful than total abort.
- This also makes debugging easier because the run surfaces all visible issues at once.

`What you gave up`

- A "successful" run can still contain degraded or partial data.
- The user has to read issues, not just trust the exit code.

`Where it shows`

- `portfolio_metrics/extract_text.py:65-95` accumulates extraction failures per file.
- `portfolio_metrics/cli.py:264-302` accumulates normalization failures per parsed artifact.
- `portfolio_metrics/normalize.py:66-81` records parse failures as issues.
- `portfolio_metrics/cli.py:396-418` still builds a report around partial results.

### 3.7 Representative-fixture demo over full live raw-PDF proof by default

`Tradeoff:` reproducibility and reviewer convenience vs stronger live realism.

`What you chose`

- A fast no-key demo path built on checked-in parsed fixtures.
- Default raw extraction over three representative PDFs when inputs are omitted.
- Full raw-corpus processing only when the user explicitly asks for it.

`Why that made sense then`

- It made the repo easy for an interviewer to run quickly.
- It removed dependence on external API keys for the most common evaluation path.
- It stabilized test and demo behavior.

`What you gave up`

- The default demo path proves the publish/normalize contract more than the live parser path.
- It underplays whether the full end-to-end system behaves equally well across the whole corpus.

`Where it shows`

- `README.md:17-25` makes the no-key fixture path the recommended starting point.
- `Makefile:31-38` defines `demo` vs `full-demo`.
- `portfolio_metrics/extract_text.py:14-18` and `55-62` define `REPRESENTATIVE_PDFS` as the default extraction set.
- `tests/test_extract_text.py:17-20` locks in the representative default.
- `tests/test_publish.py:36-44` confirms the fixture-based publish path processes three documents.

### 3.8 CLI-first repo over notebook-first or web-app-first delivery

`Tradeoff:` reproducibility and engineering clarity vs interactive polish.

`What you chose`

- A package with one obvious CLI entry point.
- Make targets for setup, demo, extract, normalize, publish, and check.
- No server, no auth layer, no dashboard, no notebook dependency.

`Why that made sense then`

- It matched the prompt better.
- It made the repo easier to clone, run, and inspect.
- It signaled software engineering discipline rather than UI improvisation.

`What you gave up`

- Less visual wow factor.
- Less immediate convenience for analysts who prefer notebooks or spreadsheets.

`Where it shows`

- `pyproject.toml:28-29` exposes the console script.
- `Makefile:22-63` gives the primary run surface.
- `spec/SPEC.md:49-57` makes no server and no notebook dependency an explicit non-goal.
- `plan/PLAN.md:42-46` and `443-454` reinforce the CLI-first posture.

### 3.9 Lightweight dependency stack over heavier infrastructure or document tooling

`Tradeoff:` lower setup friction vs richer built-in capabilities.

`What you chose`

- `pydantic`, `pydantic-settings`, `pypdf`, `python-dotenv`, `requests`.
- Test/lint tooling only in dev dependencies.

`Why that made sense then`

- It kept setup fast and local.
- It matched the take-home's scope.
- It avoided turning the project into an infra exercise.

`What you gave up`

- No database.
- No queueing.
- No richer PDF/layout toolkit in the baseline.
- No built-in observability or workflow persistence.

`Where it shows`

- `pyproject.toml:14-26` keeps the dependency list intentionally small.
- `README.md:7-12` emphasizes no Node, Docker, or database required.

### 3.10 Documented future branches over shipping every branch now

`Tradeoff:` architectural credibility vs implementation completeness.

`What you chose`

- Keep OpenAI and Azure DI in the design story and environment model.
- Do not ship them as active runtime branches in the current pipeline.

`Why that made sense then`

- It let you show production and extension thinking without bloating the POC.
- It kept the shipped system deterministic and testable.

`What you gave up`

- The implementation is narrower than the architecture narrative.
- An interviewer can reasonably ask, "Is that production path real code yet or just design?"

`Where it shows`

- `portfolio_metrics/config.py:30-38` includes OpenAI and Azure settings.
- `portfolio_metrics/cli.py:211-227` surfaces them in preflight.
- `README.md:180-187` states that OpenAI is not required by the current pipeline.
- `plan/PLAN.md:348-350` explicitly marks the LLM ambiguity resolver as stretch work.
- `options/ARCHITECTURE_OPTIONS.md:58-71` keeps Azure DI as the stronger later option.

## 4. The Three Most Important "Yes, I Knew That" Gaps

These are not mistakes to hide. They are tradeoffs to acknowledge calmly.

### 4.1 The best demo path proves three documents, not the full corpus

That was a deliberate choice for reproducibility and speed.

Evidence:

- `Makefile:31-38`
- `portfolio_metrics/extract_text.py:14-18`
- `tests/test_publish.py:36-44`

### 4.2 The schema does not yet preserve unsupported company-specific KPIs as raw extension rows

That was the cost of keeping normalization clean and the canonical export simple.

Evidence:

- `spec/SPEC.md:175-184`
- `portfolio_metrics/schema.py:8-17`
- `portfolio_metrics/metric_aliases.py:43-125`

### 4.3 Firecrawl-first convenience comes with weaker provenance than the local parser

That was the cost of moving faster with a managed parser.

Evidence:

- `portfolio_metrics/parser_firecrawl.py:71-81`
- `portfolio_metrics/parser_local.py:61-68`
- `plan/PLAN.md:379-389`

## 5. The Cleanest Final Summary

If you need one paragraph that is fully consistent with the repo, use this:

> I optimized this project around three core tradeoffs. On extraction, I chose speed over full local control by starting with Firecrawl, but I kept the parser boundary small so I could swap to a local parser later. On normalization, I chose correctness over coverage by keeping label matching and number parsing deterministic, refusing to guess on ambiguous values, and preserving provenance and confidence. On outputs, I chose portability over polish by making long-form JSON the canonical contract and treating CSV and markdown as derived review artifacts. Around those three decisions, the repo makes a few more pragmatic cuts: it defaults to a representative no-key demo path, keeps the canonical metric set intentionally narrow, deduplicates to one best row per metric, and fails softly so partial progress stays visible.

## 6. How To Use This In The Interview

Use this document in two ways:

1. Start with the three headline tradeoffs.
2. If they push deeper, move to the implementation-level tradeoffs that prove the choices were deliberate in code, not just in slides.

If the interviewer challenges a tradeoff, the safest pattern is:

- say what you optimized for,
- name what you gave up,
- explain why that was the right call for a POC,
- and point to the upgrade path you already left yourself.
