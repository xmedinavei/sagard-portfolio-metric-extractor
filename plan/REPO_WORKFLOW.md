# Repo Workflow

This repo is a local CLI pipeline. Its job is simple: read quarterly PDF reports, extract a small set of trusted metrics, normalize them, and write reviewable output files.

It is not a web app, not a general document platform, and not a production ETL system. The design is intentionally small and conservative.

## 1. Choose The Right Run Path

Use `make demo` when you want the fast path.

- It does `preflight`, then publishes from checked-in parsed fixtures.
- It does not parse all raw PDFs again.
- This is the easiest way to show the workflow quickly.

Use `make full-demo` when you want the real raw-PDF path.

- It does `preflight -> extract -> publish`.
- It parses the PDFs from `intake-pdf/` first.
- This is the better path if you want to explain the full pipeline end to end.

## 2. The Four Phases

### Phase 1: Preflight

The repo first checks whether the input folder exists, whether the output folder exists, and whether parser-related environment variables are configured.

Simple meaning: "Do I have the files and config needed to run?"

### Phase 2: Extract

This phase turns PDFs into intermediate parser artifacts.

For each PDF, the repo writes:

- `*.parsed.json`
- `*.parsed.md`

These files are not final metrics yet. They are just the extracted document text plus metadata like parser used, provenance, page count, and notes.

Important detail:

- Firecrawl is the default parser.
- The local parser is the fallback.
- The local parser is better when page-level provenance matters.
- If you run `extract` without explicit inputs, it defaults to three representative PDFs first, not the whole corpus.

### Phase 3: Normalize

This phase reads the parsed JSON files and tries to find real metric rows.

It does four things:

1. figures out document type and period
2. detects known metric labels
3. parses the numeric values
4. records warnings for missing or ambiguous data

Simple meaning: "Turn raw extracted text into structured metric candidates that people can trust."

This phase exists as its own command mostly for inspection and debugging. Normal users usually do not need to run it directly.

### Phase 4: Publish

This phase builds the final export.

It takes the normalized results and writes:

- `outputs/metrics_long.json`
- `outputs/metrics_long.csv`
- `outputs/summary.md`

`metrics_long.json` is the source of truth. The CSV and markdown summary are just easier review views built from the same export.

## 3. Trust Rules

The repo is designed around one rule:

`a wrong number is worse than a missing number`

That affects the whole workflow:

- metric detection is alias-based, not fuzzy guessing
- number parsing is deterministic
- approximate values are rejected instead of normalized automatically
- missing core metrics are surfaced as issues
- company reports beat portfolio summaries when both contain the same metric

Simple meaning: the repo prefers fewer trustworthy rows over more risky rows.

## 4. What To Review In The Outputs

When you inspect the final output, focus on:

- `metrics_long.json` for the canonical metric rows
- `source_file`, `source_page`, `raw_label`, and `source_snippet` for auditability
- `issues` for missing metrics, parse failures, and duplicate/conflicting candidates
- `summary.md` for a quick human-readable overview by source document

## 5. Current Limits

The repo makes a few intentional POC assumptions:

- most sample PDFs are text-extractable
- a small metric set is enough for v1
- local folder input is enough for the take-home
- JSON-first output is more useful than building a UI first

That is why the workflow stays small:

`PDFs -> parsed artifacts -> normalized metrics -> final export`

If this had to scale, the same core engine could move into an async Azure workflow later without changing the basic `extract -> normalize -> publish` shape.
