# Interview Scaling Options

> A concise interview document: what I would ask, what options I would present, and which option I would likely recommend.

## 1. First Principle

If they ask, "How would you make this scalable?", I would not start with microservices.

I would start with questions, then give options, then recommend one.

That shows judgment.

## 2. Questions To Ask First

I would ask 5 or 6 questions before locking the architecture:

1. Who is the main user: internal analysts, operating partners, or another system?
2. Is this internal-only, or could clients or portfolio companies use it later?
3. How many PDFs arrive, and do they come in bursts at quarter-end?
4. How fast do results need to be ready: minutes, hours, or same day?
5. Is it worse to miss a metric or extract a wrong one?
6. Are third-party parsers allowed, or must everything stay inside the company?

These questions drive the real architecture:

- user surface
- async vs sync
- parser choice
- security posture
- review workflow

## 3. The Scaling Rule I Would Say Out Loud

> I would keep the current `extract -> normalize -> publish` engine and scale the delivery shape around it, not rewrite the core logic.

That is a strong answer because it shows I would preserve the working core and change the operating model.

## 4. Main Scaling Options

### Option 1: Keep It As A Scheduled Internal Batch Job

`Shape`

- PDFs land in a folder or cloud storage bucket
- a scheduled job processes them in batches
- outputs are written to JSON/CSV/summary artifacts

`Best when`

- internal-only workflow
- moderate document volume
- same-day turnaround is enough

`Good`

- simplest path from the current repo
- lowest engineering cost
- easy to operate early

`Tradeoffs`

- weak user experience
- manual operations grow over time
- limited visibility into job status and retries

`Interview line`

> This is the cheapest scale-up path if the workflow stays internal and batch-oriented.

### Option 2: Internal Web App With Async Jobs

`Shape`

- users upload PDFs in a website
- backend creates async jobs
- users review results in a simple UI

`Best when`

- humans are the main users
- review and approval matter
- adoption by non-technical teams matters

`Good`

- easiest for analysts and ops users
- best path for human review
- clearer job status and audit flow

`Tradeoffs`

- more frontend and auth work
- more product complexity
- slower to ship than backend-only scaling

`Interview line`

> A web app is best when people, not systems, are the main users, but it adds product and security work quickly.

### Option 3: API Plus Async Worker Pipeline

`Shape`

- systems submit PDFs or file references through an API
- API creates jobs
- workers process extraction and normalization in the background
- results are stored and fetched later

`Best when`

- other systems are the main users
- throughput and integrations matter
- the workflow must scale cleanly

`Good`

- cleanest long-term integration model
- strongest machine-to-machine scalability
- fits the repo's JSON-first design well

`Tradeoffs`

- needs auth, rate limits, and job tracking
- weaker fit for non-technical users
- more backend platform work

`Interview line`

> An API is the best option when software is the main consumer, not humans.

### Option 4: Event-Driven Cloud Storage Intake

`Shape`

- PDFs land in Blob Storage or S3
- a file event triggers processing
- queue messages fan work out per PDF
- workers run `extract -> normalize`
- a final step runs `publish`

`Best when`

- documents arrive in bursts
- quarter-end spikes matter
- reliability and retries matter

`Good`

- best fit for bursty PDF workloads
- natural retries and backpressure
- users do not wait inside long requests

`Tradeoffs`

- more infrastructure to explain and operate
- more moving parts than a simple batch job
- needs monitoring and job orchestration

`Interview line`

> This is the strongest production answer if PDF intake is bursty and async processing is acceptable.

### Option 5: Slack As A Thin Submission And Notification Layer

`Shape`

- users trigger jobs from Slack
- backend still does async processing elsewhere
- Slack is used for status and notifications

`Best when`

- internal teams live in Slack
- convenience matters more than deep review

`Good`

- low friction
- high adoption
- strong for notifications and quick status checks

`Tradeoffs`

- bad source-of-truth surface
- weak for reviewing large outputs
- permissions and audit flows get messy fast

`Interview line`

> Slack is a good convenience layer, not the core product surface.

## 5. My Recommended Interview Answer

If they do not give more context, my default recommendation would be:

1. keep the current pipeline stages
2. move intake to cloud storage
3. trigger async jobs per PDF
4. store normalized results in a database or durable JSON store
5. add either a small internal web review UI or an API depending on who the real user is

Why this is the safest recommendation:

- it matches the repo's current shape
- it handles quarter-end bursts well
- it improves retries and reliability
- it keeps the trust-first normalization approach
- it avoids pretending the answer is "just build microservices"

## 6. The Short Answer I Would Actually Say

> First I would ask who the users are, how many PDFs arrive, whether this stays internal, and how strict the security constraints are. If this needs real scale, I would keep the current `extract -> normalize -> publish` engine, move PDF intake to cloud storage, trigger async jobs per PDF, and store results durably. Then I would choose the user surface based on who the customer is: internal web app for analysts, API for system-to-system workflows, and Slack only as a thin convenience layer. The key tradeoff is simple: batch and sync flows are easier at first, but async event-driven processing is the better fit once document volume and burstiness grow.

