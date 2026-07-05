# Interview Scaling Playbook

This file is for speaking in the interview.

It uses simpler English on purpose.

The goal is not to sound fancy.
The goal is to sound clear, calm, and practical.

## 1. The Simple Rule Before Talking About Scale

Do not start with Kafka, microservices, or cloud diagrams.

Start with questions.

If you do not know:

- who this is for,
- how many users there are,
- how many PDFs arrive,
- how fast results are needed,
- and how strict security must be,

then you do not really know what "scale" means.

That is the best first move in the interview.

## 2. Questions To Ask The Interviewer First

Use simple questions like these:

### Users and product

- Who is this for?
- Is it for internal use only?
- Could external users or portfolio companies use it later?
- How many users do you expect?
- Is the main goal speed, trust, less manual work, or better portfolio visibility?

### Volume and performance

- How many PDFs arrive per week or per quarter?
- Does the workload come in small amounts every day, or in big bursts at quarter-end?
- How fast do results need to be ready?
- Is near real-time important, or is same-day enough?

### Security and permissions

- Do we need authentication?
- Do we need strong permissions?
- Should every user see every company, or only some companies?
- Are there compliance or data residency rules?
- Are third-party parsers allowed, or must everything stay inside the company?

### Review and trust

- Is it worse to miss a metric or extract a wrong one?
- Who reviews low-confidence results?
- Should people be able to edit or approve extracted results?

### Integration

- Should this live as a standalone tool, or inside existing software?
- Do you want an API?
- Do you want a website?
- Do you want Slack notifications?

## 3. The Short Scaling Answer

If they ask, "How would you scale this?", a simple answer is:

> First, I would ask who the users are, how many documents arrive, whether this is internal or external, and how strict security needs to be. If it really needs scale, I would move it to a cloud provider, keep the current parser -> normalize -> publish stages, and make parse and normalize event-driven per PDF. That gives better retries, better throughput, and less waiting for users.

That answer is short, clear, and consistent with this repo.

## 4. The Longer Scaling Answer

If they want more detail, say this:

> Today the repo is a local pipeline. In production, I would keep the same logic but move it to the cloud. PDFs would go into object storage. A new file event would create a job. A queue would send one message per PDF. Workers would parse each PDF, then normalize it, then store the results. After that, a final step would combine results across documents, handle duplicates, and publish the trusted output. That way the system is decoupled, easier to retry, and easier to scale when many PDFs arrive at the same time.

## 5. A Good Cloud Architecture To Talk About

You do not need to say every service name.

Say the flow:

1. Input arrives.
2. File is stored.
3. Event is created.
4. Queue sends work to workers.
5. Parser worker processes one PDF.
6. Normalization worker cleans and maps the metrics.
7. Results are stored.
8. Final publish step creates the trusted view.
9. Notifications go to Slack or email if needed.

If they want a cloud example, you can say:

- Blob Storage or S3 for files
- Event Grid or event bus for file events
- Service Bus or queue for messages
- Functions or workers for processing
- SQL or document database for results
- Slack or email for notifications

## 6. Why Event-Driven and Message-Driven Is a Good Fit

This is the simple reason:

- PDF work is bursty.
- Some PDFs are easy.
- Some PDFs are slow.
- Some jobs fail.
- You do not want one slow file to block everything.

So the tradeoff is:

- `Sync request`: simpler at first, but worse when volume grows.
- `Async message-driven flow`: more moving parts, but much better for retries, spikes, and user experience.

Good sentence to say:

> I would choose async because document processing is naturally bursty and variable, so users should not wait inside one long request.

## 7. Keep The Same Core Engine

This is an important point for your repo.

Do not say you would throw everything away.

Say this instead:

> I would keep the current engine and change the delivery shape around it.

That is strong because this repo already has clean stages:

- `extract`
- `normalize`
- `publish`

So your scaling story is:

- keep the same core logic,
- move the stages onto cloud workers,
- and put queues and storage around them.

That sounds much better than "I would rewrite it as microservices."

## 8. Input Options And Their Tradeoffs

The repo today is folder-based and CLI-first.

In production, input can come from different surfaces.

### Option 1: Website

Example:

- user uploads a PDF
- or pastes a URL to a PDF

`Best for`

- analysts
- portfolio ops
- internal users doing manual one-off runs

`Good`

- easiest for non-technical users
- simple demo story
- easy to add review screens later

`Bad`

- file upload adds web complexity
- pasted URLs are less reliable than real uploads
- you must add authentication and permissions
- more frontend work

`Tradeoff line`

> A website is best when humans are the main users, but it adds product and security work quickly.

### Option 2: API

Example:

- existing internal software sends a PDF URL or file reference
- another system asks for results later

`Best for`

- internal systems
- automation
- large-scale machine-to-machine use

`Good`

- most scalable option
- best for integration
- fits the repo well because the repo already thinks in JSON

`Bad`

- needs auth
- needs rate limits
- needs job tracking
- needs schema versioning
- harder for non-technical users

`Tradeoff line`

> An API is best when software is the main user, not people.

### Option 3: Slack Bot

Example:

- someone mentions the bot in a channel
- sends a URL
- bot starts the job

`Best for`

- internal teams who live in Slack
- simple submissions
- notifications and status checks

`Good`

- very low friction
- easy adoption
- good for alerts and quick updates

`Bad`

- not ideal for deep review
- permissions can get messy
- debugging failures inside Slack is awkward
- bad fit for large tables or audit detail

`Tradeoff line`

> Slack is a great convenience layer, but not a great source-of-truth product surface.

### Option 4: Shared Folder Or Cloud Drive Drop

Example:

- users drop PDFs into SharePoint, Google Drive, S3, or Blob Storage

`Best for`

- finance ops
- back-office workflows
- teams already using shared folders

`Good`

- simple operational rollout
- very close to the repo's current folder-based design
- low training cost

`Bad`

- weaker validation
- weaker metadata capture
- harder to know who submitted what
- weaker permissions story unless the storage system already handles it well

`Tradeoff line`

> This is the easiest step from the current repo to production, but it is not the richest product experience.

### Option 5: Email Inbox

Example:

- companies send reports to one email address

`Best for`

- low-volume workflows
- cases where email is already the real intake channel

`Good`

- familiar for senders
- no new user behavior needed

`Bad`

- duplicate attachments get messy
- email threads get messy
- security gets messy
- parsing attachments and metadata is annoying

`Tradeoff line`

> Email is easy for users but messy for systems.

## 9. Output Options And Their Tradeoffs

The repo already makes one good design choice:

- JSON is the canonical output
- CSV and markdown are derived outputs

That is a strong base.

### Option 1: Website Or Dashboard

`Best for`

- humans reviewing metrics
- investment teams
- portfolio ops

`Good`

- easiest place to compare companies and quarters
- good place to show provenance, confidence, and warnings
- good for approval workflows later

`Bad`

- more frontend work
- more product design work
- more permissions work

`Tradeoff line`

> A dashboard is best for review, but it should sit on top of the core pipeline, not replace it.

### Option 2: API

`Best for`

- internal tools
- existing company software
- automation

`Good`

- very reusable
- strong long-term contract
- matches the repo's JSON-first design

`Bad`

- client systems must handle async jobs
- clients must handle schema updates
- not friendly for people by itself

`Tradeoff line`

> An API is the cleanest system interface, but not the easiest human interface.

### Option 3: Slack Notifications

`Best for`

- job status
- "your report is ready"
- warnings
- low-confidence alerts

`Good`

- immediate
- easy to notice
- good for adoption

`Bad`

- not good for deep review
- bad for large metric tables
- bad for audit history

`Tradeoff line`

> Slack is a good notification layer, not a good reporting database.

### Option 4: CSV / Warehouse / BI Tool

`Best for`

- analytics teams
- finance teams
- trend reporting
- cross-company comparisons

`Good`

- CSV is easy to open
- warehouse and BI are strong for long-term analysis
- easy to combine with other company data

`Bad`

- flattening data too early can hide provenance
- CSV is weaker than JSON for nested details like notes and confidence

`Tradeoff line`

> This is great for analysis, but the richer source-of-truth should still live underneath it.

### Option 5: Email Report

`Best for`

- executives
- periodic summaries
- simple weekly or monthly updates

`Good`

- familiar
- push-based
- easy for non-technical readers

`Bad`

- static
- gets stale quickly
- not good for drill-down

`Tradeoff line`

> Email is good for summaries, not for exploration.

## 10. Authentication And Permissions

This is important because you mentioned it directly.

Ask this early:

- Is this internal only?
- Do all users have the same rights?
- Does one team need to see all companies?
- Do some users need to see only their own subset?

### If it is internal and small

You can say:

> If this stays internal and has a small number of users, I would keep auth simple at first, maybe SSO and basic role-based access.

### If it is internal but broad

You can say:

> If many internal teams use it, I would add stronger RBAC, audit logs, and clearer separation between submitters, reviewers, and admins.

### If it becomes external

You can say:

> If external users or portfolio companies use it, then auth and permissions become much more important. I would need stronger tenant separation, stricter file access, better auditing, and probably a more formal API and web product.

Simple rule:

- internal small team -> simpler auth
- internal many teams -> RBAC and audit logs
- external users -> much stronger security and isolation

## 11. My Recommended Product Path

If they ask what you would build first, this is a good answer:

### First choice

- API or shared-folder ingestion
- JSON as source of truth
- Slack notifications for status

Why:

- easiest to scale
- fits the current repo
- keeps the business logic in one place

### Second choice

- simple website for upload and review

Why:

- better for human users
- good once the pipeline is stable

### Later

- richer dashboard
- stronger review workflow
- warehouse / BI integration
- external user support if needed

## 12. Best Tradeoff Lines To Memorize

These are good short lines:

- "First I would ask who the users are and what scale really means here."
- "I would keep the current engine and change the delivery shape around it."
- "If this really needs scale, I would make it event-driven per PDF."
- "Async is better here because document workloads are bursty and uneven."
- "A website is best for people. An API is best for systems."
- "Slack is a good notification layer, not the source of truth."
- "JSON should stay the core contract. Other outputs can sit on top of it."
- "If it stays internal, auth can start simpler. If it becomes external, security gets much heavier."

## 13. A Final Answer You Can Say Out Loud

> Before talking about scaling, I would ask who this is for, how many users there are, whether it is internal or external, how many PDFs arrive, and how strict security needs to be. If it really needs scale, I would move it to a cloud provider and keep the same core stages that already exist in the repo: extract, normalize, and publish. I would store files in object storage, trigger jobs with events, send one message per PDF through a queue, process them with workers, and then combine results in a final publish step. For input, the main options are a website, an API, a Slack bot, or a shared drive drop, and each one has different tradeoffs between ease of use and engineering complexity. For output, I would keep JSON as the main contract, then expose it through a dashboard, an API, Slack notifications, CSV, or email depending on who needs it. My main point would be: keep the engine simple, decouple the steps, and only add complexity when the user and scale actually justify it.
