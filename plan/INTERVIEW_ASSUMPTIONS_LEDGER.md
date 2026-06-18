# Interview Assumptions Ledger

This document focuses only on assumptions.

That matters because the interview prompt explicitly asks for:

- how you approached the problem,
- what you chose to implement,
- and your key assumptions.

## 1. What An Assumption Means Here

In this repo, an assumption is something you treated as true so you could keep the proof of concept small, defensible, and useful.

An assumption is not a bug by itself.

A good interview answer is:

1. say the assumption clearly,
2. explain why it was reasonable for this exercise,
3. show where it shaped the implementation,
4. and say what you would change if it turned out to be false.

## 2. The Biggest Meta-Assumption

### Assumption: this is a short take-home POC, not a full product build

`Why it was reasonable`

- The prompt says this is a small proof of concept.
- The prompt also says the goal is to show judgment in an ambiguous problem, not to build a full production system.

`Where it shows`

- `spec/SPEC.md:11-14`
- `spec/SPEC.md:49-57`
- `plan/PLAN.md:6-17`
- `options/ARCHITECTURE_OPTIONS.md:8-18`

`What this assumption changed`

- CLI-first instead of product-first
- small metric scope instead of broad KPI coverage
- JSON-first instead of UI-first
- clear docs and reasoning instead of lots of extra features

`If false`

If the real expectation had been a product-ready system, you would need:

- auth
- multi-user workflows
- stronger operational storage
- background jobs
- richer review UX
- stronger validation and monitoring

`Good interview line`

> My first assumption was that I was being evaluated on scoping and judgment, not on how much product surface I could build in a short time.

## 3. Corpus And Document Assumptions

### Assumption: the sample PDFs are mostly text-extractable

`Why it was reasonable`

- The sample corpus looked machine-generated.
- The docs explicitly note that the sample PDFs appear text-extractable.
- That made OCR-first feel unnecessary for day one.

`Where it shows`

- `spec/SPEC.md:65-76`
- `plan/PLAN.md:425-430`
- `README.md:103-105`
- `portfolio_metrics/parser_local.py:41-44`

`What this assumption changed`

- Firecrawl or local text parsing became reasonable first choices.
- OCR and Azure Document Intelligence stayed as later options.

`If false`

If many PDFs were scanned or visually messy, you would likely:

- move away from pure text-first parsing,
- use Azure Document Intelligence earlier,
- or add a true OCR branch sooner.

`Good interview line`

> I assumed the sample corpus had a usable text layer, so I did not spend my time solving OCR first.

### Assumption: a local folder of PDFs is the right input shape for the exercise

`Why it was reasonable`

- The prompt explicitly says “take a folder of PDF reporting packages.”
- That makes a local folder plus CLI a natural fit.

`Where it shows`

- `spec/SPEC.md:27`
- `spec/SPEC.md:202-211`
- `README.md:83-99`
- `Makefile:31-38`

`What this assumption changed`

- no web upload flow in v1
- no ingestion API in v1
- no email or Slack intake in v1

`If false`

If the real workflow started from email, Slack, or internal software, then you would keep the engine but add a different intake layer.

### Assumption: one document usually has one main reporting period

`Why it was reasonable`

- The files are named like quarterly reporting packages.
- The period is inferred once from the document and used throughout normalization.

`Where it shows`

- `portfolio_metrics/detect_metrics.py:11-29`
- `portfolio_metrics/detect_metrics.py:221-237`
- `portfolio_metrics/pipeline.py:42-48`

`What this assumption changed`

- the pipeline uses one inferred period per document
- candidate rows do not carry different periods from different sections of the same file

`If false`

If one document mixed many reporting periods in a more complex way, you would need section-level or table-column-level period attribution everywhere.

### Assumption: portfolio summary documents can be identified and handled differently

`Why it was reasonable`

- The corpus contains a known portfolio summary file.
- It would be dangerous to treat that the same way as a standalone company report without any distinction.

`Where it shows`

- `spec/SPEC.md:67-70`
- `portfolio_metrics/detect_metrics.py:30-38`
- `portfolio_metrics/detect_metrics.py:211-218`
- `portfolio_metrics/pipeline.py:21-32`

`What this assumption changed`

- the system tags `portfolio_summary`
- it warns that summary documents may duplicate company-level metrics
- later dedupe prefers company reports

`If false`

If summary documents were not clearly identifiable, you would need better document classification and probably more conservative dedupe rules.

### Assumption: filenames and simple headers are usually enough to infer company names

`Why it was reasonable`

- The sample files use company names in filenames.
- Some documents also expose company names in headers.

`Where it shows`

- `portfolio_metrics/detect_metrics.py:45-56`
- `portfolio_metrics/detect_metrics.py:240-269`
- `portfolio_metrics/detect_metrics.py:283-293`

`What this assumption changed`

- no separate company master table
- no external entity resolution step
- company naming stays heuristic and local

`If false`

If filenames were noisy or headers inconsistent, you would need stronger entity resolution or a portfolio company registry.

## 4. Metric Scope Assumptions

### Assumption: a small core metric set is enough to prove value

`Why it was reasonable`

- The prompt asks for a meaningful subset, not every possible metric.
- In a short exercise, six strong metrics are more defensible than fifteen weak ones.

`Where it shows`

- `spec/SPEC.md:157-197`
- `plan/PLAN.md:356-367`
- `portfolio_metrics/metric_aliases.py:8-21`
- `README.md:110-121`

`What this assumption changed`

- the canonical schema is intentionally narrow
- the repo optimizes for clean comparison across a few metrics

`If false`

If reviewers expected much broader KPI support, you would need either:

- a larger canonical schema,
- or a clean extension model for company-specific metrics.

`Good interview line`

> I assumed six core metrics were enough to prove the concept, because the exercise rewards good scoping more than breadth.

### Assumption: the same core metrics are broadly meaningful across companies and periods

`Why it was reasonable`

- A canonical portfolio view needs some shared baseline.
- The prompt is about cross-company review, so a common core metric set is a natural starting point.

`Where it shows`

- `portfolio_metrics/metric_aliases.py:8-18`
- `portfolio_metrics/pipeline.py:52-79`
- `tests/test_pipeline.py:77-90`

`What this assumption changed`

- the pipeline warns when core metrics are missing
- it treats those metrics as generally expected across the corpus

`If false`

If some companies or sectors should not be expected to report the same core set, then `missing_metric` warnings can overstate the real data problem. In that case, you would need:

- sector-aware expectations,
- company-level metric profiles,
- or a distinction between `not found` and `not applicable`.

### Assumption: some labels are safely equivalent, and some are not

`Why it was reasonable`

- The corpus shows label drift.
- But not all label drift is safe to normalize aggressively.

`Where it shows`

- `spec/SPEC.md:77-115`
- `spec/SPEC.md:470-476`
- `portfolio_metrics/metric_aliases.py:43-125`
- `portfolio_metrics/metric_aliases.py:135-155`

`What this assumption changed`

- alias mapping exists for clearly safe equivalences
- raw labels are preserved
- unsupported or unsafe equivalences are not forced into the canonical model

`If false`

If labels turned out to be much less stable or much more ambiguous, you would need:

- a better review workflow,
- more semantic help,
- or a more raw-first output model.

### Assumption: generic labels like `Revenue`, `ARR`, `Cash`, and `Gross Margin` are usually safe enough to collapse into the canonical schema

`Why it was reasonable`

- In a short exercise, you need some pragmatic normalization rules.
- Without them, the canonical export would become too sparse to be useful.

`Where it shows`

- `portfolio_metrics/metric_aliases.py:56-87`
- `portfolio_metrics/detect_metrics.py:127-151`
- `portfolio_metrics/detect_metrics.py:160-193`
- `spec/SPEC.md:470-476`

`What this assumption changed`

- short, generic labels are accepted into the normalized output
- the pipeline does not always require deeper business-context checks before mapping them

`If false`

If a label like `Revenue` or `Gross Margin` means different things in different companies, then the export can look more comparable than it really is. In that case, you would need:

- stricter mapping rules,
- more business-context checks,
- or more rows kept as raw/unmapped.

### Assumption: company-specific KPIs do not need forced comparability in v1

`Why it was reasonable`

- The prompt values structure and judgment, not perfect standardization.
- Some KPIs really are company-specific.

`Where it shows`

- `spec/SPEC.md:175-184`
- `spec/SPEC.md:45-57`
- `plan/PLAN.md:427-430`

`What this assumption changed`

- the shipped schema stays focused on shared metrics
- long-tail KPIs are not treated as first-class canonical fields

`If false`

If the business really needed those company-specific KPIs immediately, then the schema would need an extension model and a richer taxonomy.

## 5. Detection And Parsing Assumptions

### Assumption: most useful metrics appear in tables or near short label-value text spans

`Why it was reasonable`

- Quarterly reporting packs often present metrics in tables or compact summary sections.
- That makes rule-based detection feasible for a POC.

`Where it shows`

- `portfolio_metrics/detect_metrics.py:88-152`
- `portfolio_metrics/detect_metrics.py:154-193`
- `portfolio_metrics/detect_metrics.py:374-389`

`What this assumption changed`

- the detector prioritizes table rows
- narrative extraction uses a short nearby window
- there is no long-context semantic extraction step

`If false`

If metrics were hidden in longer narrative commentary or more complex layouts, recall would drop and a richer parser or semantic layer would matter more.

### Assumption: the correct value is usually the selected table cell or the first nearby parseable token after the label

`Why it was reasonable`

- Many reporting packs use regular table layouts.
- In short KPI summaries, the label and value are often very close together.

`Where it shows`

- `portfolio_metrics/detect_metrics.py:127-152`
- `portfolio_metrics/detect_metrics.py:169-193`
- `portfolio_metrics/detect_metrics.py:328-389`
- `portfolio_metrics/parse_values.py:88-101`

`What this assumption changed`

- table parsing prefers the period-matched column or the rightmost terminal value
- narrative parsing scans a short tail and picks the earliest compatible token

`If false`

If a line contains several nearby numbers, or if the important value comes before the label, the detector can miss or misread the metric. In that case, you would need richer layout logic or longer-context extraction.

### Assumption: the core numeric formats are limited and predictable

`Why it was reasonable`

- The prompt examples and the sample corpus point toward common finance formats.
- That made deterministic parsing realistic.

`Where it shows`

- `plan/PLAN.md:369-377`
- `portfolio_metrics/parse_values.py:7-57`
- `portfolio_metrics/parse_values.py:60-85`

`What this assumption changed`

- the parser supports currency shorthand, percentages, basis points, multipliers, and integer counts
- unsupported formats are rejected instead of guessed

`If false`

If values appeared in many more formats, the parser would need expansion and stronger test coverage.

### Assumption: approximate or threshold values should not be normalized automatically

`Why it was reasonable`

- “About $5M” is not the same as a clean reported figure.
- In finance, that distinction matters.

`Where it shows`

- `portfolio_metrics/parse_values.py:67-85`
- `tests/test_value_parser.py:33-38`
- `portfolio_metrics/normalize.py:66-81`

`What this assumption changed`

- approximate values become invalid rows plus issues
- the system favors trust over coverage

`If false`

If the business preferred recall over strictness, you might keep approximate values but tag them more explicitly as approximate.

`Good interview line`

> I assumed approximate values should stay visible as approximate, not be silently converted into exact numbers.

## 6. Provenance And Review Assumptions

### Assumption: file, label, snippet, and page where available are enough for v1 auditability

`Why it was reasonable`

- The prompt wants something reviewable, not perfect forensic reconstruction.
- The plan explicitly allows file + snippet provenance as acceptable if page mapping is expensive on the primary parser path.

`Where it shows`

- `spec/SPEC.md:42-43`
- `plan/PLAN.md:379-389`
- `README.md:103-106`
- `portfolio_metrics/publish.py:22-42`

`What this assumption changed`

- row-level provenance is always present
- strict page-level provenance is not guaranteed on every parser path

`If false`

If reviewers needed exact page-level traceability everywhere, the Firecrawl-first posture would be weaker and the local or Azure path would become more attractive.

### Assumption: a human reviewer exists for ambiguity and low-confidence cases

`Why it was reasonable`

- The whole design favors surfacing uncertainty instead of hiding it.
- That only makes sense if a human can inspect uncertain rows.

`Where it shows`

- `spec/SPEC.md:45-48`
- `spec/SPEC.md:433-457`
- `plan/INTERVIEW_GUIDE.md:81-98`
- `plan/INTERVIEW_SCALING_PLAYBOOK.md:55-59`

`What this assumption changed`

- ambiguous cases are not over-normalized
- issues and confidence are treated as meaningful outputs
- the repo stops short of building a full approval workflow

`If false`

If there were no human review step, the system would need either stricter rejection rules or a much stronger accuracy and validation layer before use.

### Assumption: company reports are more authoritative than portfolio summary duplicates

`Why it was reasonable`

- A portfolio snapshot may repeat numbers from company reports.
- The company report is usually the more direct source.

`Where it shows`

- `README.md:105-106`
- `portfolio_metrics/pipeline.py:21-32`
- `portfolio_metrics/publish.py:100-141`
- `portfolio_metrics/publish.py:244-252`

`What this assumption changed`

- the final export keeps one winning row
- company report rows beat portfolio summary rows when there is a conflict

`If false`

If summary files were sometimes the more trusted source, the ranking rules would need to change.

`Important implementation detail`

Today the ranking logic favors `company_report` before some other quality signals, so this assumption is encoded quite strongly in the final export logic.

## 7. Product And Workflow Assumptions

### Assumption: artifact-based review is enough for the exercise

`Why it was reasonable`

- The prompt asks for output that supports review and basic analysis.
- JSON, CSV, and markdown are enough to show that without building a product UI.

`Where it shows`

- `README.md:45-53`
- `spec/SPEC.md:236-238`
- `portfolio_metrics/publish.py:144-163`

`What this assumption changed`

- no dashboard in v1
- no interactive review product in v1
- outputs are files, not a web app

`If false`

If the expected audience needed a richer human interface immediately, then a dashboard or review app would move up the roadmap.

### Assumption: JSON should be the source-of-truth output

`Why it was reasonable`

- JSON is reusable.
- CSV and markdown can be derived later.
- It leaves room for a later API, dashboard, or warehouse flow.

`Where it shows`

- `plan/PLAN.md:425-430`
- `options/ARCHITECTURE_OPTIONS.md:222-235`
- `portfolio_metrics/publish.py:144-163`
- `plan/INTERVIEW_SCALING_PLAYBOOK.md:306-309`

`What this assumption changed`

- the repo is contract-first
- CSV and summary are secondary artifacts

`If false`

If the only real consumer was a spreadsheet-driven ops workflow, then CSV could have been the primary output instead.

### Assumption: a fast fixture-based demo path is acceptable for evaluation

`Why it was reasonable`

- It makes the repo easy to run without keys.
- It stabilizes the demo path for reviewers.

`Where it shows`

- `README.md:17-25`
- `Makefile:31-38`
- `portfolio_metrics/extract_text.py:14-18`
- `tests/test_extract_text.py:17-20`

`What this assumption changed`

- `make demo` proves the publish/normalize flow from checked-in parsed fixtures
- full raw parsing is available but not the default evaluation path

`If false`

If reviewers expected only full live end-to-end execution, then the fixture-heavy demo path would look too indirect.

### Assumption: representative validation is enough for the POC even if the whole corpus is not equally covered by fixtures

`Why it was reasonable`

- The interview prompt rewards structure and reasoning, not a giant validation harness.
- A representative subset is a reasonable compromise in a short time box.

`Where it shows`

- `portfolio_metrics/extract_text.py:14-18`
- `portfolio_metrics/extract_text.py:55-62`
- `Makefile:31-38`
- `tests/test_extract_text.py:17-20`

`What this assumption changed`

- the default demo path centers on representative documents
- full-corpus confidence is lower than representative-path confidence

`If false`

If reviewers expected stronger proof across the entire sample set, then the project would need broader fixture coverage or more end-to-end validation over the full corpus.

## 8. Security And Scope Assumptions

### Assumption: third-party parsing is acceptable for the take-home

`Why it was reasonable`

- The prompt allows modern tools and services.
- The docs explicitly discuss Firecrawl as acceptable for the POC.

`Where it shows`

- `spec/SPEC.md:118-123`
- `spec/SPEC.md:499-505`
- `README.md:27-39`
- `.env.example:4-14`

`What this assumption changed`

- Firecrawl-first became a strong default story
- no need to force a fully local-only architecture in the take-home

`If false`

If third-party parsing were not allowed, then the local parser or Azure-internal path would become the baseline answer.

### Assumption: auth, permissions, and multi-user workflows are out of scope for v1

`Why it was reasonable`

- The prompt is about a small POC.
- The spec explicitly excludes auth-heavy and multi-user product scope for the baseline.

`Where it shows`

- `spec/SPEC.md:49-57`
- `plan/INTERVIEW_SCALING_PLAYBOOK.md:47-53`
- `plan/INTERVIEW_SCALING_PLAYBOOK.md:434-467`

`What this assumption changed`

- no user system
- no access-control model
- no approval roles in the shipped repo

`If false`

If external users or many internal teams were in scope, the architecture would need much stronger auth, RBAC, auditing, and product boundaries.

## 9. The Most Important Assumptions To Say Out Loud

If you only say a few assumptions in the interview, say these:

1. The sample PDFs are mostly text-extractable, so OCR is not the day-one baseline.
2. A small set of core metrics is enough to prove the concept.
3. Not every label should be forced into a canonical metric.
4. Missing data is better than wrong data.
5. A human review step exists for ambiguous or low-confidence cases.
6. JSON is the source-of-truth output, and richer surfaces can sit on top later.

## 10. A Good Final Summary

Use this if they ask, “What assumptions did you make?”

> I made a few key assumptions to keep the proof of concept focused. First, I assumed the sample PDFs were mostly text-extractable, so I did not lead with OCR. Second, I assumed a small set of core portfolio metrics was enough to prove value in a short exercise. Third, I assumed some labels were safely comparable, but not all of them, so I kept normalization conservative and preserved raw labels and provenance. Fourth, I assumed a human review step exists for low-confidence cases, which is why I chose to surface ambiguity instead of hiding it. And finally, I assumed JSON should be the source-of-truth output, with CSV and markdown as review artifacts on top. If any of those assumptions changed in the real environment, the architecture would change too, but they were reasonable assumptions for this take-home.

## 11. Scalability Tradeoffs Created By These Assumptions

These assumptions also create scaling tradeoffs.

This is useful in the interview because it shows you understand that assumptions are not only about data. They also affect architecture later.

### Tradeoff: simple local batch now vs event-driven system later

`Assumption behind it`

- the exercise only needs a small POC
- the current scale is a local folder, not a high-volume production workflow

`What you gain`

- simpler code
- faster delivery
- easier repo review

`What you give up`

- weaker throughput at large volume
- no background retries
- no good user experience if many PDFs arrive at once

`Good interview line`

> I assumed the short exercise did not need a production orchestration layer, so I kept it simple. If the volume grows, I would move the same stages into an async event-driven design.

### Tradeoff: one job over a folder vs one job per PDF

`Assumption behind it`

- the current scale is small enough that folder-based execution is acceptable

`What you gain`

- simple mental model
- easy local testing

`What you give up`

- harder retries for one bad file
- weaker horizontal scaling
- slower processing at large batch sizes

`If the assumption changes`

If many PDFs arrive at quarter-end, then one message per PDF is better than one giant batch.

### Tradeoff: JSON artifacts now vs full product surfaces now

`Assumption behind it`

- the main need is a trustworthy contract, not a polished front-end

`What you gain`

- portability
- easier API and warehouse integration later
- less time spent on UI work

`What you give up`

- less friendly day-one experience for non-technical reviewers

`If the assumption changes`

If many business users need to review results every day, then a dashboard becomes much more important.

### Tradeoff: parser convenience now vs stricter compliance later

`Assumption behind it`

- third-party parsing is acceptable for the take-home

`What you gain`

- faster POC delivery
- less PDF plumbing work

`What you give up`

- vendor dependency
- possible compliance concerns
- weaker provenance on the managed-parser path

`If the assumption changes`

If data cannot leave the company boundary, then the parser choice changes immediately.

### Tradeoff: conservative normalization now vs maximum coverage now

`Assumption behind it`

- trust matters more than extraction breadth

`What you gain`

- easier review
- fewer dangerous false comparisons

`What you give up`

- lower recall
- more missing rows
- more need for human review

`If the assumption changes`

If the business values recall much more than precision, then you might accept more approximate or low-confidence extraction and review it later.

## 12. Questions To Ask The Interviewer To Reduce Ambiguity

This section matters a lot.

Good questions make you look like someone who solves ambiguous problems well.

They show:

- you do not jump into solutions too fast
- you care about the real product context
- you understand that team, role, users, and constraints affect design

### Product questions

- Who is this mainly for?
- Is this for internal users only, or could external clients use it later?
- What is the biggest pain today: slow manual work, low trust, poor comparison across companies, or something else?
- Is success mostly about speed, accuracy, analyst time saved, or portfolio visibility?
- Is this a one-off workflow, or something people would use every quarter for years?

`Why these questions are strong`

They show you are trying to solve the real product problem, not just the technical puzzle.

### User and workflow questions

- Who sends the PDFs today?
- Who reads the extracted metrics?
- Who reviews low-confidence rows?
- Is it worse to miss a metric or extract a wrong one?
- Do users want a file, a dashboard, an API, or a Slack notification?

`Why these questions are strong`

They show you understand that workflow design matters as much as model or parser choice.

### Scale questions

- How many PDFs arrive per week or per quarter?
- Does intake happen steadily, or in large bursts?
- How quickly do results need to be ready?
- Do we need a synchronous workflow, or is async fine?

`Why these questions are strong`

They make your scaling answer look grounded instead of generic.

### Security and compliance questions

- Are third-party parsers allowed?
- Does the data need to stay fully inside the company?
- Do we need authentication?
- Do we need strong permissions or role-based access?
- Can everyone see every company, or do some users need restricted access?

`Why these questions are strong`

They show you understand that architecture changes when data sensitivity changes.

### Team and company questions

- Which team would own a tool like this?
- Would this sit with engineering, data, portfolio operations, or a mixed team?
- Is the team mostly building internal tools, or also client-facing products?
- How cross-functional is the work between engineering, operations, and investment teams?
- How do decisions usually get made when business definitions are ambiguous?

`Why these questions are strong`

They make you sound like someone thinking about how solutions actually get shipped inside the company.

### Role questions

- In this role, would I mostly be prototyping solutions like this, or turning them into production systems too?
- Is the role focused more on internal workflow tools, client-facing products, or both?
- How much ownership would I have over product decisions versus just implementation?
- Would I be expected to investigate ambiguous business problems and shape the solution, or mostly build from defined specs?

`Why these questions are strong`

These questions show you care about how the work really happens, not just whether you can code.

## 13. A Short Way To Explain Why You Ask Questions First

If they ask why you are asking so many questions, say:

> I ask these questions first because they change the architecture. The answer is different if this is a small internal tool for a few analysts versus a bigger product for many teams or external clients. I want to reduce ambiguity before I over-design the solution.

## 14. A Good Final Line

Use this if you want to connect assumptions, tradeoffs, and ambiguity handling in one answer:

> I made a set of reasonable assumptions to keep the POC small, but I also know those assumptions drive tradeoffs. That is why I would ask about the users, the team, the role, the scale, the security rules, and whether the tool is internal or external before pushing the design further. That shows me whether I should keep a simple batch workflow, move to an async cloud architecture, add stronger permissions, or build richer product surfaces.
