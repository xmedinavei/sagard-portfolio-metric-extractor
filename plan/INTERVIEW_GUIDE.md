# Interview Guide — Portfolio Metrics Extraction

> Purpose: give Xavier a simple 5–7 minute walkthrough built around the **three architecture decisions** that matter most, plus an Azure production story that sounds practical.

For shorter versions, see `SPOKEN_PITCHES.md`.
For questions you should ask the interviewer, see `INTERVIEWER_QUESTIONS.md`.

---

## 1. One-paragraph positioning

> I made three simple decisions: **how to read the PDFs**, **how to clean and map the numbers**, and **how to save the output so it can be used later**. The sample PDFs already have text, so I did not start with OCR. I focused on the real risk instead: label drift, ambiguity, and trust. For the POC, I chose a CLI-first design with Firecrawl as the fast parser, deterministic number parsing, conservative normalization, and JSON as the main output so the result can later feed an API, dashboard, or workflow.

---

## 2. 5–7 minute walkthrough script

### 0:00–0:45 — frame the problem

- Sagard gets quarterly PDF reports from multiple portfolio companies.
- The hard part is not only finding numbers. The hard part is deciding which numbers can really be compared.
- My goal was to build something people can trust, not just a flashy AI demo.

### 0:45–1:45 — decision 1: how to extract the data

- I looked at a local parser, Firecrawl, and Azure Document Intelligence.
- Because the sample PDFs are text-extractable and the time box is short, I chose **Firecrawl `/parse`** first.
- I kept the parser boundary small so I can switch to a local parser or Azure DI later if I need better control or harder document handling.

### 1:45–3:00 — decision 2: how to normalize, parse, and handle edge cases

- I keep the number parsing deterministic.
- I use alias lists to find likely metric labels.
- I normalize only when the meaning is clearly safe.
- I keep `raw_label`, `source_file`, `source_snippet`, and confidence so people can review edge cases.
- My rule is simple: **in finance, a wrong number is worse than a missing one**.

### 3:00–3:45 — decision 3: how to present the data

- I made **JSON the main output**.
- That makes it easy to reuse later from an API, dashboard, or workflow.
- If I need a review view, I can generate CSV or markdown from the same JSON without changing the core pipeline.

### 3:45–5:15 — explain the production direction

- For the take-home, the CLI is enough.
- In production, I would move to an **Azure event-driven flow**: PDF lands in Blob Storage, an Azure Function or worker processes it, the result is stored, and a summary can go to Slack.
- That is better because PDF parsing is bursty and can take different amounts of time, so users should not wait in a synchronous request.

### 5:15–6:15 — explain what you intentionally did not do

- I did not build a server or UI first.
- I did not force company-specific KPIs into fake comparability.
- I did not use an LLM to invent numbers.
- I kept Azure Document Intelligence as the future upgrade path instead of a day-one dependency.

### 6:15–7:00 — close

- The real story is three tradeoffs: **speed vs. control**, **correctness vs. coverage**, and **portability vs. polish**.
- I would rather ship a simple, trustworthy 6-metric pipeline than a flashy system people cannot trust.

---

## 3. Questions to ask the interviewer

Do not wait until the very end to ask questions. Use them during the conversation to show that you are shaping the solution around the real problem.

### Ask about users and scope first

- Who is the main user of this tool?
- Is this internal-only, or could clients ever see it later?
- How many users or teams would rely on it if it became real?
- What does success mean here: speed, trust, fewer manual steps, or better portfolio visibility?

### Ask about the documents and extraction path

- Are the PDFs mostly text-based, or do scanned files show up often?
- Is page-level provenance important, or is file-level traceability enough for now?
- Are third-party parsers allowed for these documents, or does everything need to stay internal?

### Ask about trust and review

- Is it worse to miss a metric or to extract a wrong one?
- Who reviews low-confidence results?
- How should company-specific KPIs be handled if they do not fit the main metric set?

### Ask about output and workflow

- Where should the output go first: JSON, CSV, dashboard, warehouse, or internal tool?
- Should low-confidence rows appear in the main output or in a separate review flow?
- Do you need something mostly for humans to review, or mostly for systems to consume?

### Ask about production and security

- How many PDFs arrive each quarter, and how bursty is intake?
- How quickly do results need to be ready?
- Are there any security, compliance, or data residency rules that would affect the parser choice?
- Can extracted metrics go into Slack, or do they need to stay in a more controlled system?

For a larger bank of interviewer questions, see `INTERVIEWER_QUESTIONS.md`.

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
- Parser choice is a tool, not the product.
- The real product is a repeatable, auditable normalization pipeline.
- Async is the non-negotiable production boundary.
- JSON is the right v1 contract because it can feed many surfaces later.
- The point is to reduce manual transcription work, not replace analyst judgment.

---

## 6. If you have 30 seconds at the end

> I treated this as three decisions, not one giant AI problem: how to read the PDFs, how to normalize the numbers safely, and how to save the output so it stays useful later. I chose Firecrawl for speed, conservative normalization for trust, and JSON for portability. Then I mapped a production path on Azure where a PDF upload triggers async processing and the results land in durable storage plus a Slack workflow. That gives Sagard something practical now and scalable later.
