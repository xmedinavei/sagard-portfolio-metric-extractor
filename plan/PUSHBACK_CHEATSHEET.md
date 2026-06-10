# Pushback Cheatsheet — Portfolio Metrics Extraction

> Short, simple answers for likely interview pushback.

---

## 1. Pushback on the three main decisions

### Extraction

#### Why not OCR first?

Because the sample PDFs already have readable text. OCR would add more moving parts before solving the real problem, which is mapping the metrics correctly and keeping them easy to trust.

#### Why use Firecrawl if local parsing is possible?

Because I had a short time box. Firecrawl lets me get clean text fast, so I can spend my time on the hard part: normalization, provenance, and review. If cost or vendor risk mattered more than speed, I would switch to a local parser first.

#### Why not Azure Document Intelligence from day one?

Azure DI is stronger for scanned files, tables, and harder layouts. I kept it as the production upgrade path because this sample corpus did not need that extra setup on day one.

#### Why not start with a local parser first?

That would be a good choice if page-level control was the top goal. For this take-home, I thought speed mattered more, so I used Firecrawl first and kept the parser boundary small so I can swap later.

### Normalization, parsing, and errors

#### Why not use an LLM for everything?

Because in finance, a wrong number is worse than a missing one. I want the number parsing to stay deterministic, and I only want AI helping on fuzzy label meaning if I really need it.

#### How do you handle different labels for the same metric?

I use an alias list and map only when the meaning is clearly safe. If I am not sure, I keep the raw label, add a confidence flag, and let the row stay reviewable instead of pretending it is clean.

#### Why only six metrics?

Because six trustworthy metrics are better than fifteen shaky ones. I wanted to show good judgment and a clean review path, not just chase breadth.

#### What if the label is unclear or confidence is low?

Then I do not hide that. I keep the raw label, the source snippet, and the confidence so someone can review it quickly.

#### Why treat the portfolio summary PDF as a normal input?

Because real data is messy. Including it shows how I think about duplicate numbers, mixed document types, and conflicting sources instead of assuming a perfect corpus.

### Output and presentation

#### Why JSON first?

Because JSON is the cleanest contract for what comes next. It can feed a future API, dashboard, warehouse job, or Slack workflow without changing the core extraction logic.

#### Why not just output a spreadsheet?

I can still generate a CSV for review, but I do not want the spreadsheet to be the system contract. JSON keeps the data more portable and easier to reuse later.

#### Why no notebook?

Because I wanted the main deliverable to be a script, not a manual workflow. A notebook is helpful for prep or demo polish, but I did not want the solution to depend on it.

#### Why no web server or UI?

Because that would solve the wrong problem first. The hardest part here is extraction trust, not screen design, and in production this should be async anyway.

---

## 2. Pushback on production and scale

### How would this scale to hundreds of PDFs?

I would move from a CLI run to async jobs. One PDF or small batch per job, raw parser output stored first, retries handled per document, and low-confidence rows sent to review.

### What would break first in production?

Trust, not compute. The first real risk is changing document formats and shaky normalization assumptions, which is why provenance, validation, and confidence are already in the design.

### What if Firecrawl fails or gets expensive?

That is exactly why I kept the parser layer small. If cost, latency, or reliability changes, I can swap to a local parser or Azure DI without rewriting the whole pipeline.

### How would you monitor quality over time?

I would keep a small hand-checked gold set, track missingness and confidence by run, and log any new labels or low-confidence rows for review.

### What production architecture would you aim for?

Azure Blob Storage for uploads, Event Grid for triggers, Azure Functions or queued workers for processing, durable storage for results, and Slack for notifications. The key idea is async processing, not making users wait in a request.

### What about audit, compliance, and traceability?

That is why every row keeps provenance. I want file name, page when possible, raw label, snippet, run time, and parser version so the result is easy to trace back.

### How would this fit into Sagard later?

The clean path is: ingest PDFs, normalize the outputs, store them durably, and feed them into an internal app, a dashboard, or a warehouse job. I would integrate only after the metric rules are stable.

### Why not just have analysts read the PDFs?

Because this is not about replacing analysts. It is about taking away the repetitive copy-paste work so they can spend more time on judgment and less time on transcription.

### If you had one extra day, what would you add?

I would add a stronger validation harness, compare parser output on a few sample PDFs, and improve provenance where needed. That would improve trust more than adding more features.

---

## 3. Calm wording patterns

Use these simple sentence starters if you need a steady answer:

- **That is a fair question. I chose X over Y because...**
- **For the POC, I optimized for...**
- **In production, I would change that by...**
- **The real tradeoff here is...**
- **I would rather ship something boring and trustworthy than flashy and risky.**

Those lines help you sound calm, clear, and non-defensive.
