# Pushback Cheatsheet — Portfolio Metrics Extraction

> Short answers for likely director-level pushback.

---

## Why not OCR first?

Because the provided PDFs already appear text-extractable. OCR would add setup, latency, and failure modes before solving the real problem, which is normalization and trust.

## Why use Firecrawl at all if the PDFs already have text?

Because in a 4-hour time box, Firecrawl can buy parsing reliability quickly and lets the implementation time go into metric mapping, provenance, and validation. If cost or dependency risk mattered more than speed, I would switch to a local parser first.

## Why not Azure Document Intelligence from day one?

Azure DI is the stronger layout-aware option, especially for scanned or table-heavy documents. I kept it as the production-grade upgrade path because this sample corpus did not justify the extra service complexity on night one.

## Why not just use an LLM to extract all the metrics?

Because hallucinated numbers are unacceptable in portfolio reporting. I want deterministic parsing for numeric values and, at most, AI assistance for ambiguous label normalization.

## Why only six metrics?

Because six trustworthy metrics are more valuable than fifteen partially normalized ones. The prompt rewards scoping discipline and communication, not breadth for its own sake.

## Why treat the portfolio summary PDF as a normal input?

Because ambiguity is part of the challenge. Including it lets me show how I think about duplication, conflicting sources, and document-type differences instead of pretending the corpus is perfectly clean.

## Why no notebook?

Because the user experience for the submission is a script or CLI, and that is closer to how I would evolve the workflow operationally. A notebook is useful for prep or exploration, but I did not want the solution to depend on it.

## Why no web server?

Because a synchronous server is the wrong shape for bursty PDF parsing and OCR-like workloads. The right production model is async jobs, not request/response blocking.

## How would this scale to hundreds of PDFs?

The CLI becomes an async batch worker. One PDF or batch per job, raw parser output stored first, retries isolated per document, and low-confidence rows routed to human review.

## What would break first in production?

Not compute — trust. The first real problem is drift in document formats and normalization assumptions. That is why provenance, validation, and confidence are part of the v1 design.

## How would you monitor quality over time?

I would keep a hand-labeled gold set, track confidence and missingness by run, and compare parser outputs over time. Low-confidence or previously unseen labels should be explicitly logged for review.

## How would you integrate this into Sagard later?

The cleanest path is: scheduled extraction job, normalized outputs pushed into a warehouse or internal app, and a review surface for low-confidence rows. I would integrate only after the metric taxonomy stabilizes.

## Why not just hire analysts to read the PDFs?

This is not about replacing analysts. It is about removing repetitive transcription work so analysts spend their time on interpretation and decision support instead of copy-pasting numbers.

## What is the production architecture you would aim for?

Event-driven or scheduled ingestion, async parsing workers, confidence-aware normalization, immutable raw and normalized artifacts, and downstream BI integration. Serverless is appealing here because the workload is bursty and document-driven.

## If you had one extra day, what would you add?

A validation harness, parser comparison on a few representative PDFs, and stronger provenance reconstruction if Firecrawl is the primary parser. That would improve trust more than adding more metrics.
