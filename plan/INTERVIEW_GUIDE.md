# Interview Guide — Portfolio Metrics Extraction

> Purpose: give Xavier a clean 5–7 minute walkthrough built around the **three architecture decisions** that matter most, plus an Azure production story that sounds intentional instead of hand-wavy.

---

## 1. One-paragraph positioning

> I made three core engineering decisions: **how to extract from PDFs**, **how to normalize and parse metrics safely**, and **how to present the output so it can evolve into a real system later**. The sample corpus is mostly text-extractable, so I did not lead with OCR. Instead, I focused on the real risk: normalization, ambiguity, and trust. For the POC, I chose a CLI-first hybrid design with Firecrawl as the pragmatic parser, deterministic numeric parsing, conservative normalization, and JSON as the canonical output so the result can later feed an API, dashboard, or workflow.

---

## 2. 5–7 minute walkthrough script

### 0:00–0:45 — frame the problem

- Sagard receives quarterly PDF reporting packs from multiple portfolio companies.
- The challenge is not just extracting numbers; it is deciding which numbers are safely comparable.
- My goal was to create a trustworthy path from messy PDFs to structured data, not a generic AI demo.

### 0:45–1:45 — decision 1: how to extract the data

- I evaluated a local parser, Firecrawl, and Azure Document Intelligence.
- Because the sample corpus is text-extractable and the time box is short, I chose **Firecrawl `/parse`** as the primary parser.
- I kept the parser interface small so I can swap to a local parser or Azure DI later if provenance or layout fidelity becomes more important.

### 1:45–3:00 — decision 2: how to normalize, parse, and handle edge cases

- I kept number parsing deterministic.
- I used alias-based candidate detection for metric labels.
- I normalized only when the label semantics were clearly safe.
- I kept `raw_label`, `source_file`, `source_snippet`, and confidence so humans can audit borderline cases.
- My guiding rule was: **in finance, bad normalization is worse than incomplete normalization**.

### 3:00–3:45 — decision 3: how to present the data

- I made **JSON the canonical output**.
- That keeps the output portable and easy to consume later from an API or dashboard.
- If needed, CSV or markdown can be derived from the same JSON for review, but I did not want presentation work to drive the architecture.

### 3:45–5:15 — explain the production direction

- For the take-home, the CLI is enough.
- In production, I would move to an **Azure event-driven flow**: upload PDF to Blob Storage, trigger an Azure Function, normalize and store the result, then post a summary into Slack.
- That architecture is better because PDF parsing is bursty and variable-latency, so users should not wait inside a synchronous request.

### 5:15–6:15 — explain what you intentionally did not do

- I did not build a server or UI first.
- I did not over-normalize company-specific KPIs into fake comparability.
- I did not use an LLM to invent numeric extraction.
- I kept Azure Document Intelligence as the documented production-grade upgrade path instead of making it a day-one dependency.

### 6:15–7:00 — close

- The engineering judgment here is really about three tradeoffs: **pragmatism over parser purity**, **correctness over coverage**, and **portability over presentation polish**.
- I would rather ship a boring, trustworthy 6-metric pipeline than a flashy hallucination machine.

---

## 3. Questions to ask the interviewer

These questions make the production conversation stronger:

1. Who is the primary user of this system?
2. How many PDFs arrive each quarter, and how bursty is intake?
3. How quickly do results need to be available?
4. Who reviews low-confidence extractions?
5. Where should the metrics land downstream: Slack only, dashboard, warehouse, or internal tool?
6. How important is auditability or compliance?

Asking these questions shows you are not designing in a vacuum.

---

## 4. Production roadmap you can defend

### Phase 1 — current POC

- CLI over a local folder
- Firecrawl-first parser
- deterministic normalization
- JSON output with provenance and confidence

### Phase 2 — operational batch workflow

- PDF lands in **Azure Blob Storage**
- **Event Grid** triggers an extraction job
- raw parser output is archived before normalization
- low-confidence rows are flagged for review

### Phase 3 — async serverless workflow

- **Azure Function** or **Durable Function** runs the parser and normalizer
- **Service Bus** handles retries, bursts, and dead-letter flows when needed
- results are stored in **Cosmos DB** or **Azure SQL**

### Phase 4 — notification and downstream consumption

- **Logic App** or webhook posts a summary into **Slack**
- dashboard, warehouse, or API can consume the stored JSON-like records later
- taxonomy versioning and drift monitoring come next

---

## 5. What to emphasize if the conversation gets strategic

- Trust beats cleverness in finance.
- Parser choice is a means, not the product.
- The real product is a repeatable, auditable normalization pipeline.
- Async is the non-negotiable production boundary.
- JSON is the right v1 contract because it can feed many surfaces later.
- The point is to reduce manual transcription work, not replace analyst judgment.

---

## 6. If you have 30 seconds at the end

> I approached this as three decisions, not one giant AI problem: how to extract from PDFs, how to normalize safely, and how to emit data in a format that stays useful later. I chose Firecrawl for speed, conservative normalization for trust, and JSON for portability. Then I mapped a production path on Azure where a PDF upload triggers async processing and the results land in durable storage plus a Slack workflow. That gives Sagard something practical now and scalable later.
