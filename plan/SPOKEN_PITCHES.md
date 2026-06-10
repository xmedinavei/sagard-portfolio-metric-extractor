# Spoken Pitches — Portfolio Metrics Extraction

> Simple, rehearsal-friendly answers you can say out loud.

For interview practice questions, see `MOCK_INTERVIEW_QA.md`.
For questions you should ask the interviewer, see `INTERVIEWER_QUESTIONS.md`.

---

## How to use this file

- Do **not** memorize every word.
- Use these as simple speaking tracks.
- Keep your tone calm and natural.
- If you get interrupted, stop after the first strong sentence and answer the question directly.

---

## 1. 90-second answers by decision layer

### Layer 1 — PDF extraction

#### Tradeoff: speed vs. control

> On the extraction layer, the main tradeoff is speed versus control. I could start with a local parser and get more control over page boundaries, or I could start with Firecrawl and move faster. Because the sample PDFs already have text and the time box is short, I chose Firecrawl first. It gets me clean text quickly and lets me spend my time on the harder part, which is mapping the metrics correctly and keeping the output easy to trust. I still kept the parser boundary small, so if cost, reliability, or provenance becomes a bigger issue later, I can switch to a local parser without changing the whole pipeline. And if the document mix gets much harder, like scanned PDFs or layout-heavy reports, that is where Azure Document Intelligence becomes a stronger option. So for the POC, I optimized for getting to a trustworthy result quickly, not for perfect parser control on day one.

### Layer 2 — Normalization, parsing, and error handling

#### Tradeoff: correctness vs. coverage

> On the normalization layer, the main tradeoff is correctness versus coverage. I could try to normalize lots of metrics aggressively, but that creates a real risk of forcing different meanings into the same bucket. In finance, that is dangerous. So I chose a conservative approach. I first detect likely metric labels using alias lists, then I parse the numbers in a deterministic way, and I only normalize when the meaning is clearly safe. If I am not sure, I keep the raw label, the source snippet, and a confidence flag so the result stays reviewable. That means I may end up with fewer normalized rows, but the rows I do produce are much easier to trust. For me, that is the right tradeoff here: a wrong number is worse than a missing one, and I would rather make uncertainty visible than hide it.

### Layer 3 — Output and presentation

#### Tradeoff: portability vs. polish

> On the output layer, the main tradeoff is portability versus polish. I could build a UI or a nicer demo surface first, but that would push me into presentation work before the extraction contract is stable. So I chose JSON as the main output. It is simple, structured, and easy to reuse later in an API, dashboard, warehouse flow, or Slack workflow. If I need a more human-friendly view, I can generate a CSV or markdown summary from the same JSON. That keeps the core logic clean and makes the output useful in more than one place. The point is not to build the prettiest surface on day one. The point is to create a solid data contract that is easy to inspect now and easy to extend later.

### Bonus — Production direction

#### Tradeoff: simple sync flow vs. reliable async flow

> For production, the main tradeoff is simple synchronous flow versus a more reliable asynchronous flow. A sync request is easier to explain at first, but PDF parsing is a bursty workload and run time can vary a lot from file to file. That means a sync design quickly becomes a bad user experience. So in production I would move this to Azure Blob Storage, Event Grid, and async workers or Azure Functions. A PDF lands in storage, processing starts in the background, the result gets stored durably, and a summary can go to Slack. That is a better fit because it handles spikes, retries, and failures much more cleanly. It also avoids making users wait while a PDF is being parsed. So the production rule is simple: upload fast, process async, store results first, notify after.

---

## 2. Tight 60-second pitch

> Sagard gets quarterly PDF reports from portfolio companies, but each company labels metrics differently, so comparison is slow and manual. I built a CLI tool that reads the PDFs, finds a small set of core metrics, parses the values carefully, and outputs structured data with provenance and confidence. I chose Firecrawl first because the sample PDFs already have text and it lets me move quickly, but I kept the parser boundary small so I can swap later. I kept number parsing deterministic and normalization conservative, because in finance a wrong number is worse than a missing one. The output is JSON first, with optional CSV or markdown on top, so it is easy to review now and easy to plug into an API or workflow later. In production, I would move the same pipeline to an async Azure flow.

---

## 3. Tight 3-minute pitch

> Here is the problem I am trying to solve: Sagard gets quarterly PDF reports from portfolio companies, and those reports do not use the same labels or the same layout. So even when two companies are reporting something close to the same idea, the numbers are hard to compare without manually reading and copying data from each PDF.
>
> I approached this as three decisions. First, how do I read the PDFs? Second, how do I normalize the numbers safely? Third, how do I save the output so it can be used later?
>
> On the extraction side, I chose Firecrawl first. The sample PDFs already have readable text, and I had a short time box, so I wanted a parser that gets me clean text quickly. That lets me spend more time on the real problem, which is metric mapping and trust. I still kept the parser boundary small, so I can swap to a local parser later if cost, provenance, or reliability becomes more important. And if the documents get much harder, like scanned files or table-heavy layouts, Azure Document Intelligence becomes the stronger production option.
>
> On normalization, I chose correctness over coverage. Different companies use different labels, and some labels look similar even when they may not mean exactly the same thing. So I use alias lists to detect likely metrics, I parse the numbers deterministically, and I only normalize when the meaning is clearly safe. If I am not sure, I keep the raw label, the source snippet, and a confidence flag. That way the output stays reviewable instead of pretending it is perfect.
>
> On the output side, I chose JSON first. JSON is the cleanest contract for what comes next. I can still generate CSV or markdown for review, but I do not want a spreadsheet or UI to define the architecture too early. I want the main output to be portable and easy to plug into an API, dashboard, or workflow later.
>
> For production, I would move this to an async Azure flow. A PDF lands in Blob Storage, Event Grid triggers processing, a worker or Azure Function runs the parser and normalization steps, results are stored durably, and Slack can get a summary after the run finishes. That is the right shape because PDF workloads are bursty, and users should not wait in a synchronous request.
>
> So the short version is: I optimized for trust, simple design, and a clean upgrade path. I would rather ship a small system people can trust than a bigger one that hides uncertainty.

---

## 4. Simple language rules

- Say **"I chose X because..."** instead of using abstract language.
- Use short sentences when you explain tradeoffs.
- Say **"wrong number"** and **"missing number"** instead of more technical words if you can.
- Use one real example if the room feels too abstract.
- End with the user value: faster review, less manual work, better trust.

## 5. Questions I can ask the interviewer

If you want a simple set to ask live, start with these:

- **Who is the main user of this tool?**
- **Is this internal-only, or could clients see it later?**
- **How many users and PDFs are we talking about at real scale?**
- **Is it worse to miss a metric or to extract a wrong one?**
- **Who reviews low-confidence results?**
- **Are there any security or compliance rules that change the parser or storage choice?**

These questions help you understand user, scale, trust, workflow, and security very quickly.

### Good calm phrases

- **That is a fair question.**
- **The real tradeoff here is...**
- **For the POC, I optimized for...**
- **In production, I would change that by...**
- **I would rather ship something simple and trustworthy than flashy and risky.**
