# Mock Interviewer Q&A — Portfolio Metrics Extraction

> A realistic practice sheet with simple answers you can say out loud.

For questions you should ask the interviewer, see `INTERVIEWER_QUESTIONS.md`.

---

## How to use this file

- Read the question.
- Answer it in **2 to 4 sentences** first.
- If the interviewer pushes harder, use the follow-up answer.
- Keep your tone calm and practical.
- Do not try to sound perfect. Try to sound clear.

---

## 1. Warm-up questions

### Q1. What problem are you solving?

**Short answer:**

> Sagard gets quarterly PDF reports from portfolio companies, but each company labels metrics differently, so comparison is slow and manual. I am building a tool that extracts a small set of key metrics and turns them into structured, reviewable data.

**If they push:**

> The real problem is not just pulling text out of a PDF. The real problem is deciding which metrics are actually comparable and making the result easy to trust.

### Q2. What did you build?

**Short answer:**

> I designed a CLI-first pipeline that reads PDFs, finds a small set of metrics, parses the values, and outputs structured data with provenance and confidence. I kept it simple on purpose so the logic is easy to explain and easy to extend.

**If they push:**

> I split it into three layers: extraction, normalization, and output. That makes it easier to change the parser later without rewriting the metric logic.

### Q3. Why did you focus on only six metrics?

**Short answer:**

> Because six trustworthy metrics are better than fifteen shaky ones. I wanted to show good scoping and a clean review path, not just collect lots of numbers.

**If they push:**

> The system is designed so I can add more later. I just did not want breadth to come before trust.

---

## 2. Questions about extraction

### Q4. Why did you choose Firecrawl first?

**Short answer:**

> Because the sample PDFs already have text and the time box is short. Firecrawl gets me clean text quickly, so I can spend my time on the harder part, which is normalization and trust.

**If they push:**

> I also kept the parser boundary small. That means I can swap to a local parser later if cost, provenance, or reliability becomes more important.

### Q5. Why not start with a local parser?

**Short answer:**

> That would be a reasonable choice if control was the top priority. For this take-home, I thought speed mattered more, so I chose the faster path first.

**If they push:**

> I am not against a local parser. I just did not want to spend most of the time on PDF plumbing when the real risk is metric mapping.

### Q6. Why not OCR first?

**Short answer:**

> Because the sample PDFs already have readable text. OCR would add cost, latency, and more failure modes before solving the actual problem.

**If they push:**

> If scanned PDFs become common later, then I would add OCR as a fallback, not as the default.

### Q7. Why not Azure Document Intelligence from day one?

**Short answer:**

> Azure DI is stronger for harder documents, especially scanned or table-heavy ones. I kept it as the production upgrade path because this sample corpus did not need that extra setup on day one.

**If they push:**

> My logic was simple: do not solve tomorrow's parsing problem before proving today's normalization pipeline.

### Q8. What if Firecrawl fails or gets expensive?

**Short answer:**

> That is exactly why I kept the parser layer small. If cost, latency, or reliability changes, I can swap to a local parser or Azure DI without rewriting the whole pipeline.

**If they push:**

> The point is to avoid vendor lock in the architecture, even if I use a vendor to move faster in the POC.

---

## 3. Questions about normalization, parsing, and trust

### Q9. Why not use an LLM for everything?

**Short answer:**

> Because in finance, a wrong number is worse than a missing one. I want the number parsing to stay deterministic, and I only want AI helping on fuzzy label meaning if I really need it.

**If they push:**

> I need every number to have an audit trail. It is much easier to trust and debug rules plus provenance than a model-only answer.

### Q10. How do you handle different labels for the same metric?

**Short answer:**

> I use alias lists and normalize only when the meaning is clearly safe. If I am not sure, I keep the raw label, the source snippet, and a confidence flag.

**If they push:**

> I would rather show uncertainty than silently force different meanings into the same bucket.

### Q11. What if the same company reports similar metrics with slightly different meanings?

**Short answer:**

> Then I do not collapse them too early. I keep the raw labels visible and only normalize the one I trust.

**If they push:**

> For example, if I see both `Recognized Revenue` and `Bookings`, I would not pretend they are the same thing just because both sound revenue-related.

### Q12. How do you parse values like `$45.2M` or `78%`?

**Short answer:**

> I use deterministic parsing rules for common numeric formats like currency, percentages, millions, thousands, and negatives. That keeps the output consistent and easy to test.

**If they push:**

> If the unit or scale is unclear, I keep the raw string and lower the confidence instead of guessing.

### Q13. How do you decide confidence?

**Short answer:**

> High confidence means the label and the value look exactly like patterns I expected. Lower confidence means the label is fuzzy, the value is ambiguous, or the context is weak.

**If they push:**

> In production, low-confidence rows should go to review instead of flowing straight into a dashboard.

### Q14. How do you know the extraction is correct?

**Short answer:**

> For the POC, I would keep a small hand-checked gold set and test against it. That gives me a basic truth set and helps catch regressions.

**If they push:**

> I would also track missingness, confidence, and new unseen labels over time, because trust problems often show up there before they show up in a dashboard.

### Q15. What happens when a label is new and you have never seen it before?

**Short answer:**

> I still capture it, but I do not force a normalization. I keep it as raw output with low confidence so an analyst can review it.

**If they push:**

> That gives me a clean learning loop. If the same label shows up often, I can add it to the alias rules later.

---

## 4. Questions about output and presentation

### Q16. Why JSON first?

**Short answer:**

> Because JSON is the cleanest contract for what comes next. It can feed a future API, dashboard, warehouse job, or Slack workflow without changing the core extraction logic.

**If they push:**

> I can still generate CSV or markdown from the same JSON. I just do not want the presentation format to define the architecture.

### Q17. Why not just output a spreadsheet?

**Short answer:**

> A spreadsheet is useful for review, but I do not want it to be the source of truth. JSON is more portable and easier to reuse later.

**If they push:**

> My view is: JSON is the contract, CSV is the convenience layer.

### Q18. Why no notebook, server, or UI first?

**Short answer:**

> Because that would solve the wrong problem first. The hardest part here is extraction trust, not presentation polish.

**If they push:**

> Also, in production this should become async, so building a synchronous UI or server first would be the wrong shape anyway.

---

## 5. Questions about production and scale

### Q19. How would this scale to hundreds of PDFs?

**Short answer:**

> I would move from a CLI run to async jobs. One PDF or small batch per job, retries per document, durable storage for results, and review for low-confidence rows.

**If they push:**

> The important point is that the core extraction and normalization code can stay the same. What changes is the orchestration around it.

### Q20. What production architecture would you aim for?

**Short answer:**

> Azure Blob Storage for uploads, Event Grid for triggers, Azure Functions or queued workers for processing, durable storage for results, and Slack for notifications. The key idea is async processing, not making users wait in a request.

**If they push:**

> The rule is simple: upload fast, process async, store results first, notify after.

### Q21. Why is async so important here?

**Short answer:**

> Because PDF parsing is bursty and run time can vary a lot from file to file. A synchronous request looks simple at first, but it becomes a bad user experience and a reliability problem very quickly.

**If they push:**

> Async lets me handle spikes, retries, and failures per document instead of blocking a user while the work happens.

### Q22. What would break first in production?

**Short answer:**

> Trust, not compute. The first real risk is changing document formats and shaky normalization assumptions.

**If they push:**

> That is why provenance, validation, and confidence are already part of the design. I want drift to be visible early.

### Q23. What about audit, compliance, and traceability?

**Short answer:**

> That is why every row keeps provenance. I want file name, page when possible, raw label, snippet, run time, and parser version so the result is easy to trace back.

**If they push:**

> If finance teams are going to trust the output, they need to know where it came from and how it was produced.

---

## 6. Tougher follow-up questions

### Q24. An analyst tells you a metric is wrong in the dashboard. How do you debug it?

**Short answer:**

> First I go back to the raw output: the file, page, raw label, raw value, and confidence. Then I check whether the problem came from extraction, parsing, or normalization.

**If they push:**

> Once I find the issue, I add that case to the tests. That way the same mistake does not quietly come back later.

### Q25. What if two analysts disagree on the right interpretation of a metric?

**Short answer:**

> Then that is a real business ambiguity, not just a code issue. I would flag the row, capture both interpretations, and escalate the decision to the right domain owner.

**If they push:**

> I do not want the system pretending to know something the humans themselves do not agree on.

### Q26. What would you build next if you had more time?

**Short answer:**

> I would add a stronger validation harness, a better review flow for low-confidence rows, and a more production-ready async orchestration layer.

**If they push:**

> I would not spend the extra time on a prettier UI first. I would spend it on trust and operational reliability.

---

## 7. Quick speaking tips

## 7. Questions I should ask the interviewer

Use these during the conversation so it is not only you answering questions.

### Ask about the user and the scope

- **Who is this mainly for?**
- **Is this internal-only, or could clients see it later?**
- **How many users would rely on this if it became real?**
- **What pain matters most: time, trust, or comparison across companies?**

### Ask about the documents and parsing choice

- **Are these PDFs mostly text-based, or do scanned documents show up often?**
- **Are third-party parsing services allowed for these documents?**
- **How important is page-level provenance?**

### Ask about normalization and review

- **Is it worse to miss a metric or to extract a wrong one?**
- **Who reviews low-confidence rows?**
- **How should company-specific KPIs be handled?**

### Ask about output and workflow

- **Where should the output land first: JSON, CSV, dashboard, warehouse, or Slack?**
- **Should low-confidence rows be separated from the main output?**

### Ask about production and security

- **How many PDFs arrive each quarter, and how bursty is intake?**
- **How quickly do results need to be ready?**
- **Are there any security, compliance, or data residency limits I should design around?**

For the full question bank, see `INTERVIEWER_QUESTIONS.md`.

## 8. Quick speaking tips

- Start with the direct answer first.
- Then explain the tradeoff.
- Then say what you would change in production.
- If the question is hard, start with: **That is a fair question.**
- If the room gets abstract, give one concrete example.

### Good closing lines

- **I optimized for trust first.**
- **I kept the design simple on purpose.**
- **I would rather surface uncertainty than hide it.**
- **The architecture is built so I can swap the parser later without changing the whole pipeline.**
- **For the POC, I optimized for speed; for production, I would optimize for reliability.**
