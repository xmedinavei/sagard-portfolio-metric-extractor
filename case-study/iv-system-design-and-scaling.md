# Concord — System Design & Scaling (Interview Reference)

> **Companion doc.** This is Xavier's whiteboard + Q&A prep for the system-design round. It is **not** slides. Read it once; then defend it on a whiteboard. It builds *on* the "How to scale" section already in `iii-1-presentation-outline-A-thorough.md` (§9) and the ensemble design (§8, Group A) — it does not repeat them, it goes past them.

## 0. How to use this doc

This round is not testing whether the prototype is perfect. It is testing **how I think** when the ground moves. So the mindset on the whiteboard is: **start from the simplest thing that works, and add one box only when a real pressure forces it.** For every box I draw, I say four things out loud — what it is in plain words, why it belongs *here*, the alternative I rejected, and the trade-off I accepted. When they change the scenario mid-sentence (they will), I do not panic or bolt on technology; I name the *new pressure* first, then evolve the drawing one box at a time. And I say out loud when I would **not** build something yet — that discipline is graded as highly as the scaling itself.

One honesty anchor for the whole doc, stated once so nothing below contradicts it:

> Concord today is a **prototype, not a production system**. It runs offline, in memory, one deterministic method, no database, no login. The **76%→90% recall is real but measured on 24 synthetic PDFs** — enough to prove the idea, not to promise production reliability. The recall jump came from a **backend parser fix, not a changed test set**, and it is paired with **0 wrong values**, because a confidently-wrong number is worse than a flagged-missing one.

**Where to look:** §8 answers the recruiter’s likely questions out loud (options + trade-off + my pick); **§12 is the full decision catalog** — every scale-up choice side by side; **Appendix A** has the five whiteboard sketches to practice.

---

## 1. What this round actually tests

The round explicitly grades **two axes**:

| Axis | What they want to see | My failure mode to avoid |
|---|---|---|
| **1. Defend the decisions** | Why deterministic-first, why offline, why refuse-to-compare, why file-level provenance — each vs a *named* alternative, not just as a property | Getting defensive, or over-claiming the prototype is production-grade |
| **2. Evolve the architecture live** | Grow the design on demand as they inject new requirements | Freezing, or reaching for Kafka/microservices before naming the pressure |

**The canonical prompt:** *"Your prototype works for 20 documents. What happens with 500 portfolio companies and MILLIONS of documents?"*

They will change the scenario **mid-sentence** and expect me to redraw the architecture verbally. Requirements they may inject live: more users / more portcos · larger volumes · **real-time** processing · **multiple** data sources · **concurrent** requests · reliability · security · monitoring · **cost**.

**The meta-signal (most important):** they will keep asking **"why?"**. So I never just name a technology — I **compare the alternative and give the trade-off**. They care much more about *how I reason* than whether the demo is flawless. Two things they say are easy to forget, and I will not forget them:

- **Name each scaling term plainly** (async, queue, worker, object storage, extraction↔normalization split, cache, retry, idempotency, dead-letter queue, partitioning, observability, human-review, independent scaling).
- **Explain when I would intentionally keep it simple.** This is graded as highly as the scaling.

---

## 2. My five rules for answering a scaling question

These are the reasoning moves I lean on when the scenario shifts under me.

| # | Rule | Said out loud as… |
|---|---|---|
| **1** | **Start from the simplest thing that works.** The current monolith is the baseline, not an embarrassment. | *"Today it's a monolith, and for 20 trusted PDFs that's correct."* |
| **2** | **Add a box only when a REAL pressure forces it.** No box without a named pressure. | *"What breaks first? That tells me the next box."* |
| **3** | **Name four things per box:** the pressure, the move, the alternative, the trade-off. | *"Pressure X → I add Y instead of Z, accepting trade-off W."* |
| **4** | **Say when I would NOT build it yet.** Restraint is a design decision. | *"I would not add Kafka until one queue is genuinely saturated."* |
| **5** | **Keep the deterministic, offline, auditable core as long as possible.** For *this* room it is a feature, not a limitation. | *"The deterministic core stays as a canary even after I add the ensemble."* |

Rule 5 matters specifically because of **who is in the room**: **Parinaz Sobhani** (Head of AI — rewards rigor and right-sized AI, punishes hype and the prototype-trap) and **Sharon Liu** (Head of Operations, ex-Chief Compliance Officer — cares about controls, audit trail, reconciliation, source-of-truth, data security). They are **not fund-math judges**. I never drift into NAV / returns / waterfall math — Concord **feeds** the inputs to a mark, it never **makes** the mark. The thesis that anchors everything: **"same label does not mean the same metric — comparability is the product, not extraction,"** and **"a silent blank is more dangerous than a loud error — refuse rather than fake."**

---

## 3. Where Concord is today — the honest baseline

The current system is deliberately small. Here is the truth of it, from the code.

```
  intake-pdf/*.pdf  (24 synthetic PDFs)
        │
        ▼
  ┌──────────────────────────────────────────────┐
  │  ONE Flask request  POST /api/run             │
  │  run_pipeline_in_memory()   [all in RAM]      │
  │                                                │
  │  parse ──► normalize ──► aggregate/export      │
  │  (local  (detect+       (dedupe + refuse-      │
  │   pypdf)  canonicalize+   to-compare +         │
  │           sector-stamp)   metadata)            │
  └──────────────────────────────────────────────┘
        │
        ▼
   _LATEST_EXPORT   (a module-global variable,
                     last result held in memory)
        │
        ▼
   GET /api/metrics ──► React cockpit reads it
```

**The four logical stages** (same in webapp and CLI) and their contracts — a *contract* here means a fixed pydantic data shape that the next stage relies on:

| # | Stage | Output contract | Separable? |
|---|---|---|---|
| 0 | Discovery (glob the folder) | list of paths | trivially |
| 1 | **Extraction** (PDF → text pages) | `ParserOutput` | **cleanest seam** — stateless per file, embarrassingly parallel |
| 2 | **Normalization** (detect + canonicalize + sector-stamp + missing-check) | `NormalizationResult` | yes — stateless per document, serializable |
| 3 | **Aggregation/export** (dedupe + refuse-to-compare) | `MetricsLongExport` | **fan-in / reduce** — needs *all* documents together |

The properties that define the baseline — and why each was the right call for a **trust demo**:

| Property | What it is (plain) | Why it was right for a prototype |
|---|---|---|
| **In-memory only** | Zero disk writes in the webapp; last result in a global variable | Nothing to corrupt, nothing to secure, refresh is instant |
| **Single method** | One deterministic parser (`pypdf`, pure-Python, offline) | Reproducible, auditable, no model to hallucinate |
| **Synchronous, single-threaded** | One request runs the whole pipeline; requests serialize | For 24 PDFs (~1s observed) latency is a non-issue |
| **Offline, enforced** | Webapp builds only `LocalPdfParser`; a runtime guard **raises** (a `raise`, not a Python `assert` — so `python -O` cannot strip it) if a parse ever used a network parser | Data residency guaranteed by *construction*, not by luck |
| **Fail-soft** | Each PDF wrapped in `try/except: continue`; run reports `parsed < total` | One bad PDF is skipped, never a 500 |
| **Deterministic** | Same PDFs → same output, every time | The recall number *means* something; it is measurable |

> **Honest scope note:** Concord extracts **8 canonical metrics** (6 core: revenue, ARR, gross-margin %, cash, monthly burn, headcount; + 2 optional: NRR %, logo churn %). A **firecrawl** network path exists and is the CLI *default* extractor, but it is **never reachable from the webapp** and falls back to local when no real key is set. So the correct phrasing is "not used **by the webapp**," not "not used." The **~1s** run time is an **observed benchmark**, not a fact encoded in the source.

### 3a. The case-study tech decisions — each vs one rejected alternative

The §3 table above defends the *shape* (in-memory, sync, offline). But the interviewer will point at a **named** library and ask "why that one?" So here is every real pick with the alternative I turned down. The rule: pick the simplest thing that meets the demo's true need (offline, deterministic, auditable), and be able to say what I would switch to when the need changes.

| Decision | What I chose | Alternative(s) rejected | Why mine here / when I'd switch |
|---|---|---|---|
| **PDF text extraction** | **`pypdf`** — pure-Python, zero native dependencies, works fully offline | **pdfplumber** (better on tables, heavier); **PyMuPDF** (faster, but AGPL licensing friction); **pdfminer** (low-level, slow); **OCR/Tesseract** (only for scanned images) | pypdf installs anywhere with no system libraries — perfect for a portable offline demo on clean synthetic PDFs. I'd add **pdfplumber** the moment real docs have complex tables, and **OCR** the moment a page is a scanned image, not native text. |
| **Web framework** | **Flask + Werkzeug (dev server)** | **FastAPI** (async-native, built-in validation) | The work is CPU-bound parsing, not many waiting I/O calls, so async buys little here; Flask is the smallest thing that serves a JSON API + a static React build. I'd reach for **FastAPI** only if the API tier itself became I/O-bound (many slow upstream calls) — and even then the real fix is a queue (§5 v1), not an async web tier. |
| **Result store** | **`_LATEST_EXPORT` module global** — last run held in memory | **A tiny keyed store / SQLite file** | Deliberately throwaway: one user, one run, instant refresh, nothing to migrate or secure. It is the *correct* non-solution for a single-user demo. It is also the **first thing to fall** under multi-user pressure (§5 v1/v5) — I replace it with a keyed store the moment a second user or a durability need appears. |

**Why this simplicity was correct:** the job of this build was to prove **comparability judgment** (refuse-to-compare, sector-awareness, provenance), not to prove throughput. Every complex box I did *not* add is a box that could have hidden a bug in the thing the room actually cares about — trust. That is Rule 1 and Rule 5 in action.

---

## 4. What forces change — the pressure map

This table is my map for **every scaling question** the recruiter might throw. When they inject a requirement, I find the row, name what breaks, and reach for the cheap fix first.

| Pressure | What BREAKS in the prototype | First CHEAP fix | The bigger fix |
|---|---|---|---|
| **More documents** (thousands) | One synchronous request can't finish; RAM holds all results | Batch on the CLI (already disk-backed); process folder in chunks | Object storage + queue + worker pool (§5 v1–v2) |
| **More portcos / users** | `_LATEST_EXPORT` is one global — no isolation, last run wins | Key results by run-id in a small store | Multi-tenant DB **partitioned** by company/fund/period (§5 v5) |
| **Real-time / low latency** | Whole pipeline runs per request; slow PDF blocks the caller | Return a job-id immediately; poll for result | Async workers + cache + event-driven intake (§5 v1–v2) |
| **Multiple data sources** | Only reads a local folder; only knows native-text PDF | Add a **read-only** cloud-storage connector (Group F, Option A) | Event-driven ingest + **per-format parsers/OCR** converging on one `ParserOutput` (§8-4) |
| **Concurrent requests / quarter-end burst** | Werkzeug dev server serializes; one global with no lock | Real WSGI server (gunicorn), worker **processes** | Queue absorbs the burst; workers scale out horizontally |
| **Reliability** (a crash mid-run) | In-memory work is lost; nothing durable | Persist stage outputs to disk (CLI already does) | Durable queue + **retries** + **dead-letter queue** + **idempotency** |
| **Security / data residency** | No auth, no roles, no audit log, no encryption at rest | Keep it offline + on-prem (already true) | Auth/roles/audit-trail + encryption + retention (Group G) |
| **Cost** | Free today (no LLM, no cloud) | Keep deterministic core free; touch AI only on the ambiguous tail | Independent scaling + storage tiering + a staffed review queue (§9) |

The single most important thing this table encodes: **a seam is already real.** The CLI already crosses the **first** seam on disk — it writes `ParserOutput` to `*.parsed.json` and reads it back for normalize/publish — and it writes the final `MetricsLongExport` too, so **two of the three contracts touch disk**. So "split it into services" is not a rewrite — it is promoting a **disk boundary** to a **network boundary**.

---

## 5. The evolution, one box at a time

This is **the whiteboard story**. I grow the architecture in numbered steps. Each step is triggered by **one** pressure, has a tiny diagram, an alternative I rejected, and an explicit **"when you would stop here."** I never draw v5 first.

### v0 — the monolith (today)

```
 request → [parse → normalize → export] → in-memory global → UI
```

- **Pressure:** none yet. 24 trusted PDFs, one user.
- **Alternative rejected:** building a queue/DB up front. That is complexity with no pressure to justify it.
- **Stop here when:** volume is small, one user, latency ~1s, offline is a feature. **This is the right answer for the demo.**

### v1 — durable store + job QUEUE + background WORKERS

Two pressures arrive together: **reliability** (a crash loses everything) and **latency** (a slow PDF blocks the request).

```
 request → enqueue(job) → 202 + job_id      (returns instantly)
                 │
                 ▼
            [ QUEUE ]  ── durable list of "please process file X"
                 │
            [ WORKER ] ── background process; parse→normalize→export
                 │
            [ STORE ]  ── database holds results, keyed by run_id
                 │
 GET /result/{job_id} ← reads STORE (or "still running")
```

- **What each box is (plain):** a **queue** is a durable to-do list of work messages; a **worker** is a background process that pulls one message and does the job; a **store** is a database so a result survives a crash. **Asynchronous** just means "reply *now* with a ticket, do the slow work later."
- **Why here:** it removes the two worst prototype properties in one move — *work is durable* and *the request no longer waits*. Retries + a **dead-letter queue** (a shelf for messages that failed too many times) come with the queue, so one poison PDF never blocks the line.
- **Which queue (name the pick, not just "a queue"):** **managed SQS** (zero-ops, **at-least-once** delivery, scales itself, fits an occasional batch cadence) over **RabbitMQ** (richer routing, but I have to run it) or **Redis + Celery** (fine at small scale, weaker durability guarantees). At-least-once delivery is precisely *why* idempotency below is mandatory, not optional.
- **Alternative rejected:** threads inside the Flask process. Simpler, but a crash still loses in-flight work and it does not survive scaling to multiple machines. A queue is the smallest thing that gives durability *and* horizontal room.
- **Trade-off accepted:** now there is state to operate (the queue and store need monitoring and backups). Also the result is eventually-ready, not instant — the UI must poll.
- **Stop here when:** a single queue and a few workers keep up. Do **not** add object storage, service splits, or tenancy yet.

### v2 — OBJECT STORAGE + event-driven intake

Pressure: **multiple data sources** and **more documents** than a shared folder can hold.

```
 SharePoint/Drive/S3 ──(read-only connector)──► [ OBJECT STORAGE ]
                                                       │ file-created event (or poll)
                                                       ▼
                                                  enqueue(job) → QUEUE → WORKER → STORE
```

- **What object storage is (plain):** a big, cheap bucket for files (like S3); each file has a URL, and "a new file landed" can fire an **event** that enqueues a job automatically.
- **Why here:** it decouples *where files come from* from *how they're processed*. This is exactly where **Group F** plugs in: ship the **cloud-storage connector (Option A)** first — read-only, scoped, fits the existing SharePoint/OneDrive/Drive/Box habit — and add the **SHA-256 change-tracking manifest** so we only re-run files whose **content** actually changed.
- **The SHA-256 manifest (Group F, F2):** a hash is a content fingerprint. Same file → same hash → **skip** (save compute). One digit changes → different hash → **re-run** and flag *"restated"* for review. A pure rename → same hash → no pointless re-run. This gives Sharon "which exact version produced this number?" — and a re-run **records** the change, never silently overwrites history. Honest limit: a hash tells you *that* a file changed, not *what*; we still re-parse to show the actual delta, e.g. *"was $12.4M, now $12.7M."* (A note so no number carries two meanings: the real **$38.4M→$32.2M** pair in the corpus is **not** a file-version restatement — it is ClearPay's **restricted-cash normalization within one document** (raw "Cash & Restricted Cash" $38.4M minus $6.2M segregated client float), a *separate built control*. I keep the version-restatement story and the restricted-cash story apart.)
- **Why a full content hash and not mtime/etag?** File modified-time and storage etag are cheaper to read, but they **lie** — a copy, a re-export, or a restore changes them without changing content, and some can reset on move. SHA-256 fingerprints the bytes themselves, so "same content" is always detected correctly. The cost is reading the whole file, which we do anyway to parse it — so the hash is nearly free.
- **Event vs polling (name the alternative):** an **event** (a webhook the storage fires on "file created") is near-instant but needs webhook plumbing and a reachable inbound endpoint; **polling** (list the bucket every N minutes) needs no inbound path and is dead-simple, but is laggy and re-lists. I start with **polling** when webhooks are painful and switch to **events** only when intake latency actually matters.
- **Format heterogeneity — "sources" means formats, not just locations:** a **format-detection** step routes each file: native-text PDF → `pypdf`; scanned image page → **OCR (Tesseract)** first; Excel/CSV → a table parser; an accounting API or data-room **feed** → a feed adapter. Every path converges on the **same `ParserOutput` contract**, so nothing downstream knows or cares where a file came from or what shape it started as. This is the seam argument paying off again.
- **Non-negotiable:** **intake is read-only and scoped — Concord never writes back to the source.**
- **Alternative rejected:** a database BLOB column for files. Works small, but object storage is cheaper, streams large files, and gives native events. Use the DB for *metadata and results*, the bucket for *bytes*.
- **Stop here when:** ingestion is automated and dedup works. Do **not** split services yet.

### v3 — SPLIT extraction service from normalization service

Pressure: extraction and normalization have **very different cost and latency profiles**, and I want to scale them **independently**.

```
 QUEUE:extract → [ EXTRACTION SVC ]  (CPU/GPU-heavy, maybe cloud doc-AI, slow)
                        │ writes ParserOutput
                        ▼
 QUEUE:normalize → [ NORMALIZATION SVC ] (cheap, deterministic rules, fast)
                        │ writes NormalizationResult
                        ▼
                  [ AGGREGATE/EXPORT ]  (fan-in / reduce; needs all docs)
```

- **Why here — the seam already exists.** The CLI *already* serializes `ParserOutput` to `*.parsed.json` and reads it back for normalize/publish. Splitting the service is just promoting that disk boundary to a network/queue boundary. The three named contracts — `ParserOutput` → `NormalizationResult` → `MetricsLongExport` — are the service boundaries, pre-drawn.
- **Independent scaling (plain):** extraction may need 20 heavy workers (or paid doc-AI per page); normalization is cheap Python rules that need 2. Splitting lets me pay for each **separately** instead of scaling the expensive one just to keep up with the cheap one.
- **Alternative rejected:** keep one combined worker. Simpler to deploy, but it forces both to scale together and couples a cheap change (a new alias rule) to redeploying the expensive extractor.
- **Trade-off accepted:** two services = two deploys, a network hop, and more to monitor. Justified only once the cost/latency gap is real.
- **Stop here when:** two services cover it. Do **not** shard into ten microservices — that is a team-boundary decision, not a scale one (§7).

### v4 — the REDUNDANT-ENSEMBLE + HUMAN-REVIEW queue  *(DESIGNED, NOT BUILT)*

This is **where trust scales**, and it is the single biggest reliability lever. Today Concord uses **one** deterministic method; a lone reader can be **silently wrong** and no one would know. The answer is not "more AI" — it is **more agreement**.

```
                    ┌── deterministic parser (today's Concord = reference vote; fails LOUDLY)
   ParserOutput ────┼── independent LOCAL structural reader (e.g. IBM Docling; offline)
                    ├── vision-LLM reader (reads MEANING; votes, never decides alone)
                    └── (optional) specialist doc-AI as tie-breaker
                                   │
                                   ▼
                    [ ORCHESTRATOR — TIERED consensus ]
                    compares NORMALIZED tuples (metric,period,unit,basis,value)
                                   │
              ┌────────────────────┼───────────────────────┐
        VALIDATED(green)   VALIDATED-WITH-NOTE      DISAGREE(⚠) / UNRESOLVED(grey)
        auto-trusted       auto + dissent logged    → [ HUMAN-REVIEW QUEUE ]
```

- **Why a MIX, not 3 copies of one model:** **correlated failure.** Copies of the same LLM share blind spots, so their agreement means nothing. Independent methods fail on **different** pages, so agreement is real evidence. Independence is never total (shared training data, ugly layouts fool several) → **agreement is strong evidence, not proof.**
- **Which readers, and why each one:** **pypdf / pdfplumber** for native-text tables (cheap, deterministic); **Docling** for structural layout (handles merged cells and multi-column better); a **vision-LLM** reads *meaning* where the layout defeats a parser; and **Tesseract OCR** sits in front of the whole ensemble for scanned/image pages so they can enter the vote at all. The point is not that each is "best" — it is that each **fails on different inputs**, which is what makes agreement informative.
- **The orchestrator (Group A2) — "count isn't enough; independence decides":** it compares **normalized tuples**, never printed text, so two readers that both say "62" but disagree on **basis** do **not** agree. Tolerance is metric-family aware (money ≈ 0.5% or a small floor; percentage-points ±0.1pt). A **10× gap** ($3.4M vs $34M) is never within tolerance. Four tiers: **VALIDATED** (all agree → auto-trust), **VALIDATED-WITH-NOTE** (independent majority agrees, dissent logged), **DISAGREE** (no safe quorum / 2–2 / the most-trusted thread dissents → human), **UNRESOLVED** (too few values → human).
- **The human-review queue (plain):** the amber/grey cases go to a person, not to production. The machine **flags**; a human **decides**.
- **Honesty (mandatory, say it live):** this ensemble is **designed, not yet built.** I cannot quote a real auto-accept rate until it runs. Measuring the agreement rate and the review-queue depth (and who staffs it) is the **first** thing the run-alongside stage produces. The **deterministic core stays as a canary** — it keeps voting and stays the reference.
- **Alternative rejected:** "just use one great LLM." Higher ceiling on easy pages, but it fails *silently* — the exact failure Sharon cannot accept. Independence is the control.
- **Stop here when:** for many deployments (offline, compliance-first) v4 on-prem is the destination and v5 is unnecessary.

### v5 — multi-tenant cloud, PARTITIONED by company / fund / period

Pressure: **many tenants**, **quarter-end bursts**, real SLAs — and only **after the data-residency question is answered.**

```
 tenant A ─┐
 tenant B ─┼─► load balancer → object storage (per-tenant prefix) → event → queue
 tenant C ─┘                                              │
                                                          ▼
                                    autoscaling workers (scale on QUEUE DEPTH)
                                                          │
                    DATABASE partitioned by (tenant, company, fund, period)
                    + row-level scope (a deal team sees only its companies)
```

- **Which database (name it, don't say "STORE"):** a **relational store (Postgres)** fits — the data is tabular, the joins across metric/company/period are real, and row-level scoping is native. The alternative, a **document store (Mongo)**, would earn its place only if schemas varied wildly per source, which they do not here (everything lands as the same normalized tuple).
- **Partitioning vs sharding (they are not the same word):** **partitioning** is *logical* — split one big table into slices *inside one database* so a query for "NovaCloud Q3'24" touches one slice, not the whole table, and one tenant's load can't drown another's. **Sharding** is *physical* — spread those slices across *many machines* when a single machine can no longer hold or serve the data. I start **partitioned**; I **shard only** when one node is provably the bottleneck. Partitioning also enforces **information barriers** between deal teams (least privilege).
- **Autoscaling + load balancing (don't leave them implied):** the autoscaling **signal is queue depth** (already an SLI in §10) — backlog grows → add workers; backlog drains → remove them. With more than one API or worker instance, a **load balancer** spreads incoming requests across them so no single instance is a hotspot.
- **Why last:** this is the **highest ceiling** but the **highest cost and blast radius**, and **data leaves on-prem** — a real compliance/data-residency question for Sharon. It is the *destination*, not the *first move*.
- **Alternative rejected:** doing v5 first (the "cloud re-platform" temptation). Months of infra, tenancy, and security review before delivering the reliability that v1+v4 deliver in weeks.
- **Stop here / gate:** only move here when **volume, bursts, tenants, or SLAs** justify it — and only after data-residency is answered.

**The whole arc in one line:** *Do Option 1 (harden in place) first; treat Option 2 (cloud re-platform) as the destination. Option 1's decoupled stages are the on-ramp to Option 2. Every step is additive and reversible, and the deterministic core stays as a canary throughout.*

---

## 6. The building blocks, in plain words

Every scaling term the round names. For each: plain meaning / why it helps **Concord specifically** / the alternative / when to keep it simple.

| Block | Plain meaning | Why it helps Concord | Alternative | Keep it simple until… |
|---|---|---|---|---|
| **Asynchronous processing** | Reply now with a ticket; do the slow work in the background | A slow scanned PDF stops blocking the request/UI | Synchronous request-response | …a single run is fast (~1s for 24 PDFs). |
| **Queue** | Durable to-do list of work messages | Absorbs a quarter-end burst; smooths load onto workers | In-process list / thread pool (simpler, no durability) | …one machine keeps up in real time. |
| **Worker** | Background process that pulls one job and runs it | Lets extraction scale out across machines | Bigger single process | …the folder finishes within the window. |
| **Object storage** | Cheap bucket for files, with "new file" events | Holds thousands of PDFs; events drive auto-intake | DB BLOB column / shared folder | …a local folder still fits. |
| **Extraction ↔ normalization split** | Two services at the `ParserOutput`→`NormalizationResult` seam | Scale/pay for the expensive reader and the cheap rules **separately** | One combined worker | …their cost/latency profiles are similar. |
| **Content-hash dedup (cache #1)** | Same SHA-256 → the input is unchanged → skip re-parse | Never pay to re-read a file whose bytes didn't change | Recompute every time | …inputs rarely repeat. |
| **Result cache (cache #2)** | Remember an *assembled answer* (a dashboard, an expensive doc-AI response) with a TTL | Repeated `GET /api/metrics` and repeat doc-AI calls return instantly | No cache, always reassemble | …reads are cheap and rare. **Invalidate** the cached result whenever the SHA-256 manifest records a restatement. |
| **Retry** | Try a failed job again, with backoff | A flaky network doc-AI call or transient read recovers itself | Fail immediately | …failures are truly permanent (bad file). |
| **Idempotency** | Safe to run twice → same result | A retry **can't double-count** a metric or duplicate a row (key by SHA-256 + metric tuple) | At-most-once hope | …you never retry. **Never skip once you retry.** |
| **Dead-letter queue (DLQ)** | Shelf for messages that failed too many times | One poison/corrupt PDF is set aside for a human, never blocks the line | Infinite retry (blocks the queue) | …you have retries at all — a DLQ is their partner. |
| **Partitioning** | Split data by company/fund/period *inside one DB* | Fast scoped queries + tenant isolation + information barriers | One giant table; or sharding across machines (only when one node is full) | …one tenant, small data. |
| **Observability** | Logs (what happened), metrics (how much/how fast), traces (the path of one request) | Answer "did this quarter's packs process? where's the backlog? which number came from which file?" | print() and hope | …you can watch it by eye (the demo). |
| **Human-review workflow** | Amber/grey cases go to a person to decide | The ensemble **flags**, a human **approves** — the compliance spine | Auto-accept the machine | **Never** skip for low-confidence values. |
| **Independent scaling** | Scale each service to its own load | 20 extraction workers, 2 normalization workers — pay per need | Scale the monolith as one | …one unit of scale covers everything. |

---

## 7. When I would KEEP IT SIMPLE (and refuse to over-engineer)

The round grades restraint **as highly as scaling.** So I state it as explicit "I would NOT build X until Y" lines. Each is a design decision, not an omission.

| I would NOT build… | …until this real pressure appears | Why waiting is correct |
|---|---|---|
| **A durable queue / workers** | one synchronous run stops finishing in time, or a crash loses real work | For 24 PDFs, in-memory + synchronous is *simpler and correct*. |
| **Kafka / a streaming platform** | a single ordinary queue (SQS/Rabbit) is **genuinely saturated**, or I need replay/event-sourcing | Kafka is for high-throughput streams and replay; one queue is far simpler to run. |
| **Microservices beyond the extract/normalize split** | **one deploy is genuinely blocking two teams**, or two parts have truly different scaling needs | Microservices are an *org* solution; splitting for scale alone buys network hops and ops pain. |
| **Multi-region / active-active** | a **data-residency law or an SLA** demands it | Multi-region multiplies cost and complexity; most compliance needs point the *other* way (on-prem). |
| **A vector database / embeddings** | deterministic + **fuzzy label-matching is exhausted** on the hard aliases | Metric aliasing is a *finite, auditable* dictionary problem; embeddings add opacity Parinaz would rightly question. |
| **The full ensemble** | volume/variety of layouts makes a lone deterministic reader too risky to trust | It's the biggest lever, but it's **designed, not built** — I add it deliberately, with the review queue, not as a reflex. |
| **A login/roles/audit system** | more than one user, or a real tenant boundary | Offline single-user has no attack surface to protect yet. Group G is the *next* layer, not the first. |

The through-line: **for this room, offline + deterministic + auditable is a feature.** Sharon's world rewards a small, explainable system over a big, clever one. Over-engineering would *subtract* trust, not add it.

---

## 8. Answering the recruiter's questions — options, trade-offs, and my pick

The recruiter was explicit: this round grades **how I think**, not whether the demo is flawless. They will change the scenario **mid-sentence** and keep asking **"why?"** So every answer below makes the same three moves — **name 2–3 options in a table (pros / cons / when to pick)**, **land one bold recommendation for this context** (offline, compliance-first, batch cadence) with a one-line *why*, and hold a **"why?" rebuttal** ready for the push. I never leave options on the table without picking one, and I say out loud when the honest answer is "I would *not* build that yet."

One caveat holds under all of it: Concord today is a **prototype** — offline, in-memory, one deterministic method, **recall 76%→90% with 0 wrong values on 24 *synthetic* PDFs**. The **ensemble, human-review queue, database, message queue, and SHA-256 dedup** described below are **designed, not built.** I present them as a plan, never as shipped.

Plain-word glossary used below (each explained once): **object storage** = a big cheap bucket where every file has its own address; **queue** = a durable waiting line of jobs; **worker pool** = background processes that each pick up one job; **SHA-256** = a fingerprint of a file's exact bytes (same bytes → same fingerprint); **OCR** = reading text out of an image; **idempotency** = running the same job twice gives the same result, not two; **dead-letter queue (DLQ)** = a shelf for messages that failed too many times; **partition** = slicing one big table inside one database; **sharding** = spreading those slices across separate machines.

---

**(1) "Your prototype works for 20 documents — what about 500 portfolio companies and MILLIONS of documents?"**
It's two problems in one sentence, so I split it. *Millions of docs* = **volume + durability** (work must survive a crash). *500 portcos* = **tenancy + isolation** (each deal team sees only its own data).

| Option | Pros | Cons | When to pick |
|---|---|---|---|
| **A — Harden stages in place** (object storage + queue + worker pool + partitioned DB) | Weeks of work; reversible; data stays on-prem | One deployment to run; ceiling is finite | **Default** — the pressure is volume + tenancy, not the cloud |
| **B — Re-platform to multi-tenant cloud now** | Highest ceiling; elastic bursts | Months of work; data leaves on-prem (breaks residency) | Only when bursts / tenants / SLAs genuinely force it |

**Recommendation (Concord): A first, B as the destination.** *Why:* neither pressure needs the cloud on day one, so I only re-platform when real limits appear (§5 v1–v3 before v5).
**Why? / If they push "why not re-platform now?":** the seam is already on disk — the CLI writes two of the three contracts (`*.parsed.json` + the final export), so a service split is *promoting a boundary, not a rewrite*, and the cheap path buys most of the benefit in weeks.

---

**(2) "More users / more portfolio companies."**
The real risk at 500 portcos is **information barriers** — keeping deal teams from seeing each other's data. That is a data-model and permissions problem, not a compute one.

| Option | Pros | Cons | When to pick |
|---|---|---|---|
| **A — One shared table with a tenant column** | Simplest to build | Easiest to leak; one bad query crosses tenants | Never for a compliance buyer |
| **B — One DB partitioned by (tenant, company, fund, period) + row-level scope** (row-level scope = each team reads only its own rows) | Strong isolation *and* fast scoped queries; one DB to run | Needs a partition + permission design up front | **Default** for this room |
| **C — A separate database per tenant** | Physical isolation | N databases to operate and back up | Only if a regulator or contract demands physical separation |

**Recommendation (Concord): B — partition + row-level scope.** *Why:* today's single `_LATEST_EXPORT` global is last-run-wins with no isolation; B gives per-tenant, per-run rows with isolation *and* speed, without N databases.
**Why? / If they push "why not a database per tenant?":** physical isolation only earns its keep when a regulator or contract demands it; until then it's N× the ops for isolation that **row-level scope already gives** inside one DB.

---

**(3) "Larger document volumes."**
Throughput and **durability** (not losing work on a crash) are two needs; I answer both.

| Option | Pros | Cons | When to pick |
|---|---|---|---|
| **A — One bigger machine (scale up)** | Simplest; no new infra | Hard ceiling; a crash mid-run loses everything | Very early, low volume |
| **B — Queue + horizontal worker pool (scale out)** | Durable *and* elastic; grows one worker at a time | Infra to run and monitor | **Default** as volume climbs |
| **C — Keep the CLI's disk-backed chunked batch** | Already built; crash-safe on disk | Single-box throughput | While volume is still modest |

**Recommendation (Concord): start C, move to B; skip A.** *Why:* a single machine has a ceiling *and* no crash-safety, while a queue gives parallelism *and* durability and grows incrementally.
**Why? / If they push "why not just a bigger machine?":** vertical scaling buys time, not safety — the moment that box dies mid-run you lose the whole batch, and you hit its ceiling anyway.

---

**(4) "Multiple data sources."**
"Sources" is two dimensions: **where files live** (locations) and **what shape they are** (formats). One normalized path handles both.

| Option | Pros | Cons | When to pick |
|---|---|---|---|
| **A — Custom integration per source *and* per format** | Fast for the very first source | **N sources × M formats** of code to test and keep alive | Never past the first source |
| **B — One read-only connector into object storage + a format-detection router** that converges on the `ParserOutput` contract | Each new source is a thin adapter; downstream never changes | Router + connector to build once | **Default** |

**Recommendation (Concord): B — single normalized intake.** Locations: ship the **read-only** cloud-storage connector first (Group F: SharePoint / OneDrive / Drive / Box / S3). Formats: a detection step routes each file — native-text PDF → **`pypdf`** (a pure-Python reader, no system dependencies), scanned image → **OCR** first, Excel/CSV → a table parser, accounting API / data-room → a feed adapter — and every path converges on the **same `ParserOutput` contract**. For OCR I use **Tesseract** — a *local, offline* engine — **not** cloud OCR like AWS Textract or Google Vision, because those ship the page off-prem and break residency; the accuracy gap on ugly scans is the price of staying on-prem, and the ensemble is where I would close it. I choose `pypdf` over heavier native libraries for the same reason: deterministic and dependency-light matches the offline posture. *Why:* one contract means one processing path regardless of source or shape — and **intake stays read-only; Concord never writes back.**
**Why? / If they push "why not bespoke integrations?":** N×M code is N×M things to test and keep alive; converging on one contract makes each new source a thin adapter, not a whole new pipeline.

---

**(5) "Real-time processing."**
First, honestly, I push back on the premise: **quarterly packs are batch by nature**, so "real-time" is rarely the real requirement.

| Option | Pros | Cons | When to pick |
|---|---|---|---|
| **A — Optimize the synchronous path** | Simplest to reason about | One slow scanned PDF blocks the caller | Runs are already fast |
| **B — Async job-id + polling** (return a ticket now, the UI asks "done yet?") | Caller never blocks; cheap to build | Adds a "pending" state | **Default** when latency matters |
| **C — Async + push (SSE/WebSocket)** (a live connection the server pushes updates over) | Slickest UX | Persistent connections + push infra to run | Only at large client fan-out |

**Recommendation (Concord): B — async + polling.** *Why:* you rarely make a slow PDF fast; you make the **waiting** asynchronous so the user is never blocked, and caching makes a repeat instant.
**Why? / If they push "why not push/streaming?":** SSE/WebSocket add a persistent connection and server-push plumbing for a workload that finishes in seconds-to-minutes; polling gives the same UX until fan-out is genuinely large.

---

**(6) "Concurrent requests."**
A burst is a **buffering** problem, not a compute one.

| Option | Pros | Cons | When to pick |
|---|---|---|---|
| **A — A bigger synchronous WSGI server** | Simple | Still serializes; caps out | Tiny load |
| **B — gunicorn worker *processes* + a queue that buffers the burst** (gunicorn = a production web server running several worker processes) | Sidesteps the **GIL** (Python's global lock that blocks threads from using many cores); queue absorbs spikes | Infra to run | **Default** |
| **C — Threads inside Flask** | Cheap to add | GIL means no real parallelism for CPU-bound parsing | Never for this workload |

**Recommendation (Concord): B — queue + gunicorn *processes*.** *Why:* a queue turns a spike into a **manageable backlog** instead of dropped or serialized work, and for batch a little backlog latency is fine. (Today's dev server serializes requests and the global has no lock — safe only because it is single-threaded.)
**Why? / If they push "why processes not threads?":** the work is CPU-bound parsing, so threads fight the GIL and give no real parallelism, while separate processes each get a core.

---

**(7) "Reliability."**
When a worker crashes, the message stays on the **queue**, so another worker **retries** it.

| Option | Pros | Cons | When to pick |
|---|---|---|---|
| **A — No retries** | Simplest | Any crash loses work | Never |
| **B — Infinite retries** | Never gives up | One poison PDF blocks the whole line | Never |
| **C — Bounded retries + idempotency + DLQ** | Retries transient failures; shelves permanent ones; can't double-count | Three pieces to wire | **Default** |

**Recommendation (Concord): C — all three together.** Jobs are **idempotent** (a retry produces the same row, never two), keyed by **SHA-256 + metric tuple**; after N failures the message goes to the **DLQ** for a human. *Why:* an on-prem broker like RabbitMQ delivers **at-least-once** (a message can arrive more than once), so idempotency is what makes retrying safe, and the DLQ is what keeps one bad input from stopping the line.
**Why? / If they push "why is idempotency mandatory?":** at-least-once means the same message can arrive twice; without an idempotency key a retry writes the metric twice — and a double-count is a *wrong number*, the one outcome this room can't accept.

---

**(8) "Security."**

| Option | Pros | Cons | When to pick |
|---|---|---|---|
| **A — Offline / on-prem posture (zero egress)** | *Is* the data-residency answer; nothing leaves | Caps accuracy on the ugliest pages | **Default** for a compliance buyer |
| **B — Hosted doc-AI** | Higher accuracy | Portco data leaves on-prem | Only if the client explicitly accepts the trade |

**Recommendation (Concord): A — offline-default + the full Group G control set.** Enforced by construction — **we only ever build the local parser, and a runtime guard *raises* if any non-local parser is used** (a `raise`, not a Python `assert`, so `python -O` cannot strip it). On top: **auth/roles**, **least-privilege scope**, **maker-checker** (the person who suggests a value is not the person who approves it), an **append-only immutable audit log**, **encryption at rest and in transit**, **secrets management** (no keys in code or config), and a **retention / right-to-delete** policy. Hosted doc-AI stays a variant the client owns, gated on residency. *Why:* for a compliance buyer, the **audit trail, encryption, and deletion policy** — not more AI — are what survive an auditor or LP challenge.
**Why? / If they push "why not hosted for the accuracy?":** more accuracy isn't worth moving a portco's confidential data off-prem unless the client explicitly accepts that trade — residency is *their* decision, not one I make by default.

---

**(9) "Monitoring / observability."**
I measure SLIs that match the real cadence: **% of a quarter's packs done within N hours**, **recall on a frozen shadow set** (must never regress), **human-review queue depth/age**, and **wrong-value count (target 0)**. Logs for *what happened*, metrics for *how much / how fast* (queue depth doubles as the autoscaling signal), traces to answer *"which file produced this number?"*.

| Option | Pros | Cons | When to pick |
|---|---|---|---|
| **A — Build / self-host** (OpenTelemetry + Prometheus/Grafana) | Cheaper; stays on-prem | You run it | **Default** for compliance-first |
| **B — Buy managed** (Datadog, etc.) | Fast to stand up | Ships telemetry (file names, metric values) off-prem; per-host cost | Only when you have no ops team and telemetry is not sensitive |

**Recommendation (Concord): A — self-host.** *Why:* telemetry here can contain file names and metric values, so keeping it on-prem draws the same residency line as security and keeps the story consistent.
**Why? / If they push "why not just buy it?":** buying wins when you have no ops team, but here the telemetry itself is sensitive, so on-prem is the safer default for *this* buyer.

---

**(10) "Cost constraints."**
Cost scales with **how often you call the expensive thing**, so the lever is calling it *less*.

| Option | Pros | Cons | When to pick |
|---|---|---|---|
| **A — Send every page to doc-AI / LLM** | Uniform, simple | Pays per page forever, even for numbers rules already handle | Never at scale |
| **B — Deterministic core free + route only the ambiguous tail** to paid AI (+ caching, storage tiering, reserved-vs-on-demand compute, staffed review) | AI spend tracks difficulty, not volume | Routing logic + tiering to build | **Default** |

**Recommendation (Concord): B — route-to-tail + caching + tiering.** Keep the deterministic core free; route only disagreements / low-confidence to paid AI; **cache on SHA-256** so an unchanged file is never re-read; split extraction (expensive) from normalization (cheap); **lifecycle-tier storage** (hot current quarter, cold archive); process **next to the data** to avoid egress; **reserved capacity for the steady baseline, on-demand for quarter-end spikes**; and watch **human-review queue depth vs drain rate**, since the review queue is a paid bottleneck. *Why:* the numbers our deterministic rules already handle for free — **on the synthetic set, the bulk of the 128 printed numbers** — should cost nothing, so AI spend tracks **ambiguity, not volume**.
**Why? / If they push "why not all-AI, it's simpler?":** a uniform all-AI path is simpler to build but pays per page for numbers the deterministic rules already handle for free — you'd be buying accuracy you already have.

---

**(11) "Why asynchronous — and when would you NOT bother?"**
Async means *reply now with a ticket, do the slow work later*.

| Option | Pros | Cons | When to pick |
|---|---|---|---|
| **A — Synchronous request-response** | Dead simple; instant to reason about | A slow run blocks the caller | Runs finish fast (like today, ~1s for 24 PDFs) |
| **B — Async ticket + background work** | Caller never blocks | Adds a "pending" store + polling | One run is slow enough to block the request or UI |

**Recommendation (Concord): stay synchronous until one run stops finishing fast.** *Why:* async only buys you non-blocking waiting; if there is no painful wait, there is nothing to buy — you'd just be adding a job store and polling for free.
**Why? / If they push "why not always async, to be safe?":** every async system needs a place to hold the pending result and a client that polls — that's real state to operate, so you add it only when the wait is genuinely real.

---

**(12) "Why a queue and workers — which queue, and why that one?"**
A **queue** is a durable to-do list of work messages; a **worker** is a background process that pulls one and runs it.

| Option | Pros | Cons | When to pick |
|---|---|---|---|
| **A — In-process threads in Flask** | Simplest | A crash loses in-flight work; can't span machines | Never past one box |
| **B — Self-hosted RabbitMQ** (a message broker you run on-prem) | Keeps the queue **on-prem** (the residency answer); rich routing; at-least-once | You operate it | **Default** for this offline, on-prem context |
| **C — Managed SQS** (cloud queue, zero-ops, at-least-once) | No ops; scales itself | It's a cloud service — coordination leaves on-prem | **Only on the cloud branch** |

**Recommendation (Concord): B — self-hosted RabbitMQ.** *Why:* for a zero-egress deployment the queue must live where the data lives; RabbitMQ keeps it on-prem while still giving durability, at-least-once delivery (which is exactly why idempotency in §8-16 is mandatory), and horizontal room. SQS is the pick *only* once we deliberately move to the cloud branch.
**Why? / If they push "why not Kafka?":** Kafka is for high-throughput streams and replay/event-sourcing; until one ordinary broker is **genuinely saturated** it's a heavy platform to run for a benefit I don't need.

---

**(13) "Why object storage and not just a database or a folder?"**
**Object storage** is a big, cheap bucket for files where each file has a URL and "a new file landed" can fire an **event** that enqueues a job automatically.

| Option | Pros | Cons | When to pick |
|---|---|---|---|
| **A — A shared folder** | Simplest | Doesn't scale to thousands cheaply; no events | Tiny, manual intake |
| **B — A DB BLOB column** | One store for bytes + metadata | Bloats the DB; streams large files poorly | Small files only |
| **C — Object storage** | Cheap; streams large files; native events | A second store to manage | **Default** |

**Recommendation (Concord): C — object storage for the bytes, the database for metadata and results.** *Why:* it's cheaper, streams large files, and gives native events, so ingestion decouples from processing and new files drive the pipeline on their own.
**Why? / If they push "why not keep it all in the DB?":** keep the database for what it's good at — structured queries over metadata and results; storing megabytes of PDF in a row makes every backup and query pay for bytes it never reads.

---

**(14) "Why separate extraction from normalization?"**
The two stages have very different cost profiles.

| Option | Pros | Cons | When to pick |
|---|---|---|---|
| **A — One combined worker** | One deploy; no network hop | A trivial rule change redeploys the heavy extractor; both scale together | While the cost/latency gap is still small |
| **B — Two services at the `ParserOutput`→`NormalizationResult` seam** | Scale each to its own cost/latency; deploy independently | A network hop + a second deploy | Once the profiles diverge |

**Recommendation (Concord): B — split, but only once the gap is real.** Extraction may need 20 heavy workers or paid doc-AI per page; normalization is cheap deterministic rules that need 2. The seam already exists on disk (`*.parsed.json`), so this is **promoting a disk boundary to a network one, not a rewrite**. *Why:* a cheap alias-rule change then doesn't force a redeploy of the expensive extractor, and I pay per each stage's own load.
**Why? / If they push "why not keep them combined?":** a combined worker couples a trivial rule change to redeploying the heavy extractor and forces both to scale together — you overpay for compute just to move the cheap half.

---

**(15) "What do you cache, and how do you invalidate it?"**
Two different costs → two caches. (This is a **design**; no hashing exists in the prototype yet.)

| Option | Pros | Cons | When to pick |
|---|---|---|---|
| **A — Content-hash dedup** (skip re-parsing when SHA-256 is unchanged) | Skips the expensive parse entirely | Needs a manifest of hashes | Always — parsing already reads the whole file |
| **B — Result cache** (remember an assembled answer with a TTL — *time-to-live*, an expiry clock) | Repeat `GET /api/metrics` returns instantly | Goes stale without a clear invalidation rule | For expensive reassembly / dashboards |

**Recommendation (Concord): both, with hash-driven invalidation.** I would **invalidate the result cache whenever the SHA-256 manifest records a restatement**: a changed file gets a new hash, which busts the cache and triggers a re-run flagged "restated." *Why:* cache invalidation is the hard part, and tying it to the content hash means the answer refreshes exactly when the bytes change — never staler, never needlessly recomputed.
**Why? / If they push "why hash and not mtime/etag?":** modified-time and etag **lie** — a copy, re-export, or restore changes them without changing content — so SHA-256 fingerprints the bytes themselves, and since parsing reads the whole file anyway, **we would hash while reading (nearly free)**.

---

**(16) "How do retries work without double-counting?"**
**Idempotency** means running the same job twice produces the **same** result, never two rows.

| Option | Pros | Cons | When to pick |
|---|---|---|---|
| **A — At-most-once** (hope it never retries) | Never double-counts | Drops work on any failure (silent gap) | Never — a missing metric is the failure we exist to prevent |
| **B — At-least-once + idempotency keys** | Never drops; retry is safe | Needs a stable idempotency key | **Default** |

**Recommendation (Concord): B.** I key each unit by **SHA-256 + the metric tuple** (metric, period, unit, basis), so a retry **overwrites the same row** instead of inserting a second — the message can arrive twice and the outcome is identical. *Why:* dropping work is silent data loss and double-counting is a wrong number; the idempotency key is what lets me retry freely without risking either.
**Why? / If they push "why not at-most-once, it's simpler?":** at-most-once trades a wrong number for a **missing** one, and a silent gap is exactly what this product exists to prevent — better to retry safely than to lose a metric.

---

**(17) "What's a dead-letter queue for?"**
A **DLQ** is a shelf for messages that failed too many times.

| Option | Pros | Cons | When to pick |
|---|---|---|---|
| **A — Infinite retry** | Never loses the message | One poison PDF blocks the line forever | Never |
| **B — Fail-and-drop** | Simple | Loses the file silently | Never |
| **C — Bounded retries → DLQ + alert** | Contains bad files; pages a human | One more queue to watch | **Default** |

**Recommendation (Concord): C.** After N retries a corrupt PDF moves to the DLQ so it stops blocking the line, and an alert pages a human ("N docs need eyes"). Retries handle *transient* failures; the DLQ contains *permanent* ones. *Why:* without it, one bad input either jams the queue forever or vanishes silently — the DLQ makes a bad file **loud and contained**.
**Why? / If they push "why not just drop it?":** dropping is a silent blank, and **a silent blank is more dangerous than a loud error** here — the DLQ turns the failure into a visible task instead of a missing number.

---

**(18) "How would you partition the data — partition vs shard?"**
**Partitioning** is *logical* (slices inside one database); **sharding** is *physical* (those slices spread across separate machines).

| Option | Pros | Cons | When to pick |
|---|---|---|---|
| **A — Partition by (tenant, company, fund, period)** | Fast scoped queries + information barriers; cheap | Still one machine's limits | **Default** |
| **B — Shard across machines** | Grows past one node's capacity | Cross-machine joins and transactions get harder | Only when one node is provably the bottleneck |

**Recommendation (Concord): partition first, shard only when a node is provably full.** *Why:* partitioning already buys fast scoped queries and **information barriers** between deal teams, and sharding before a node is full is complexity with no pressure behind it.
**Why? / If they push "why not shard early?":** sharding spreads a single query across machines and makes joins and transactions harder — you take that pain only when one box genuinely can't cope, not on a forecast.

---

**(19) "Where do humans stay in the loop?"**
The ensemble **flags**, a human **decides** — never the reverse. (Honest: the ensemble and this queue are **designed, not built**; I never present the review workflow as a live control.)

| Option | Pros | Cons | When to pick |
|---|---|---|---|
| **A — Auto-accept the machine** | Cheapest; no labor | A silent wrong value ships | Never for this room |
| **B — Machine flags, human decides on the low-confidence tail** | Catches the dangerous cases; scales attention | A labor bottleneck to staff | **Default** |

**Recommendation (Concord): B — human-in-the-loop on the amber/grey tail, not on everything.** Auto-trust **VALIDATED** (all readers agree) and **VALIDATED-WITH-NOTE** (majority agrees, dissent logged); route **DISAGREE** and **UNRESOLVED** to a review queue where **maker-checker** applies (suggester ≠ approver). *Why:* auto-accepting a low-confidence number is the exact silent-wrong failure Sharon can't accept, but reviewing every number doesn't scale — so I spend human attention only where the machine is unsure.
**Why? / If they push "why not full-auto once it's good?":** one confidently-wrong number that no human ever saw is worse than a hundred flagged ones — the queue exists so no *unsure* value reaches a decision unseen.

---

**(20) "What scales independently, and why does that matter?"**
The stages have their own contracts — `ParserOutput` → `NormalizationResult` → `MetricsLongExport` — which are ready-made service boundaries.

| Option | Pros | Cons | When to pick |
|---|---|---|---|
| **A — Scale the monolith as one unit** | Simple to operate | You scale the expensive part just to feed the cheap part | While profiles are similar |
| **B — Scale each stage to its own load** (extraction ~20 workers, normalization ~2, aggregation a fan-in) | Every dollar of scale goes where the load is; blast radius stays local | More services to run | Once the profiles diverge |

**Recommendation (Concord): B, once the profiles diverge.** Autoscale workers **on queue depth** so each stage grows on its own signal. *Why:* otherwise you pay to scale the cheap stage just to keep pace with the expensive one.
**Why? / If they push "why does the split matter beyond cost?":** coupling a cheap rule change to the expensive extractor's deploy also means one stage's spike forces the whole system to grow — independence keeps **blast radius and cost local** to the stage under pressure.

---

**(21) "When would you intentionally KEEP IT SIMPLE / not build something?"**
Restraint is a design decision I state out loud.

| Option | Pros | Cons | When to pick |
|---|---|---|---|
| **A — Build ahead for scale you don't have yet** | Feels safe / "ready" | Untested complexity that can hide bugs; more to secure and monitor | Almost never |
| **B — Add a box only when a real, named pressure forces it** | System stays small and auditable | You accept some later rework | **Default** |

**Recommendation (Concord): B — add each box only when its named pressure appears.** I would **not** build a durable queue until one synchronous run stops finishing in time; **not** reach for Kafka until one ordinary broker is saturated; **not** split past extract/normalize until a deploy actually blocks two teams; **not** add a vector database while metric aliasing is a finite, auditable dictionary; **not** add login/roles until there's a second user. *Why:* for this room, **offline + deterministic + auditable is a feature** — every complex box I don't add is a box that can't hide a bug in the thing they actually care about: trust.
**Why? / If they push "why not build ahead to be ready?":** unused infrastructure isn't free insurance — it's surface area to secure, monitor, and debug, and for a compliance buyer a small explainable system beats a big clever one every time.

---

**(22) "This is only a prototype — why should we trust it?"**

| Option | Pros | Cons | When to pick |
|---|---|---|---|
| **A — Dismiss it as "just a prototype"** | Modest | Wastes the real controls that already work | Never |
| **B — Defend the properties that make it trustworthy *today* and name the path to production trust** | Honest; earns credibility in a hype-punishing room | Requires drawing a hard line at what's built vs designed | **Default** |

**Recommendation (Concord): B.** Trust it for **what it provably does today**: it's **deterministic** (same PDFs → same output, so the recall number *means* something), **offline** (data-residency by construction — we only ever build the local parser, and a runtime guard *raises* on any non-local parser), **provenance-backed** (every number carries its source **file**, raw label, **confidence ~84%–99.5%**, and exact excerpt), and it **refuses to rank a lender's interest margin against a SaaS product margin** — structurally incompatible bases (the *built* control; broader same-metric refusal is roadmap). On **24 synthetic PDFs** it moved recall **76%→90% with 0 wrong values** — and the **wrong-value count matters more than recall**, because a confidently-wrong number is the worst outcome for this room. *Why:* the prototype's honesty *is* the point — it flags a silent blank instead of faking it, the exact discipline a production system needs, proven small before it's scaled. The **redundant ensemble and human-review queue are the path to production trust — designed, not yet built.**
**Why? / If they push "why should synthetic recall count for anything?":** synthetic PDFs prove the **comparability judgment** (refuse-to-compare, sector-stamping, provenance) works end-to-end; they don't prove production reliability — which is exactly why the honest number is paired with "ensemble designed-not-built" and a **shadow-set SLI that must never regress**.

---

**The three sentences I open with** (the one-breath answer to the literal opener — *"500 portcos AND millions of docs"*):

> *"Millions of docs is a **volume / durability** problem — I put files in **object storage** and process them through a **queue + worker pool**, caching on **SHA-256** so unchanged files are skipped. 500 portcos is a **tenancy / isolation** problem — I move results into a **database partitioned by company/fund/period** with **row-level scope**, so each deal team sees only its own. Neither needs the cloud on day one — I **harden the existing stages in place first** (§5 v1–v3), and only re-platform when bursts, tenants, or SLAs actually force it."*

Then I go deeper, one question at a time.

---

## 9. Cost and the deterministic-first lever

Cost is a curve, and the shape of the curve is set by **how often we invoke the expensive path.**

```
 cost
  ^                         ● everything → LLM/doc-AI (per-page, forever)
  |                    ●
  |               ●
  |          ●
  |   ●———————————————————————  rules for the bulk, AI only for the tail,
  |________________________________  human approves the amber cases
                                    → volume
```

The discipline: **rules for the bulk, AI only for the ambiguous tail, a human approves.** Deterministic parsing is free and offline; it already handles most of the 128 printed numbers. The paid ensemble members (cloud doc-AI, vision-LLM) get called **only** where methods disagree or confidence is low — the review-queue tail. So AI spend tracks *ambiguity*, not *volume*.

**Cost is more than inference — the other lines on the bill:**

| Cost driver | Lever | Plain note |
|---|---|---|
| **Object-storage volume** | **Lifecycle tiering** — hot for the current quarter, cold/archive for old packs | Storage grows forever; most files are read once at intake and rarely again. |
| **Egress** | Keep processing next to the data (on-prem or same region) | Moving bytes out of a cloud is a line item people forget. |
| **Database** | Partition + archive cold periods | Query cost tracks how much you scan; partitioning bounds it. |
| **AI inference** | Route only the ambiguous tail to paid models | The main lever above. |
| **Human-review labor** | Watch **queue depth vs drain rate** as a real ceiling | The review queue is a **paid bottleneck** — if flags arrive faster than people clear them, it backs up regardless of compute. Staffing is part of the design, not an afterthought. |

**The offline-vs-cloud fork (ties directly to Sharon):**

| Fork | Accuracy ceiling | Data egress | Cost shape | Who it's for |
|---|---|---|---|---|
| **Fully-offline ensemble** (pdfplumber + Docling + local vision model) | Good, lower on the hardest pages | **Zero** | Mostly one-time engineering + local compute | Compliance-first, data-residency-bound |
| **Hosted doc-AI** (Textract/Document AI/Reducto/Azure) | Higher | **Data leaves on-prem** | Always-on + per-page + storage + egress + ops | Volume/accuracy over residency |

I present this as a **choice the client owns**, gated on the data-residency question — not a decision I make for them. That framing is itself the governance answer.

---

## 10. Reliability, security, monitoring — the SRE checklist

The **SLO/SLI** picks (an SLO is a target, an SLI is the measured signal behind it):

| SLI (what we measure) | SLO (the target) | Why this one |
|---|---|---|
| **% of a quarter's packs processed within N hours** | e.g. ≥ 99% within the window | Matches the real cadence — quarter-end, not per-second |
| **Recall on a frozen shadow set** | never regresses below the last release | Catches a parser change that quietly drops numbers |
| **Human-review queue depth / age** | below a threshold, oldest < X days | The ensemble is only trustworthy if the queue is actually drained |
| **Wrong-value count on the shadow set** | **0** (the non-negotiable) | A confidently-wrong number is the worst outcome for this room |

**What to monitor + how it fails safely:**

```
 [ workers ] ──emit──► logs / metrics / traces ──► dashboards + alerts
      │
   retries (backoff)
      │  exceeded?
      ▼
   [ DLQ ] ──► alert a human ("N docs need eyes")   ← never silently dropped
```

- **Observability:** logs for *what happened*, metrics for *how much / how fast* (queue depth, worker latency, recall on shadow), traces to answer **"which file produced this number?"** — the machine version of provenance. (Queue depth doubles as the **autoscaling signal** from §5 v5.)
- **DLQ + alerting:** failed-too-many-times messages land on the DLQ and **page a human**; the run surfaces degradation as `parsed < total` (already the prototype's honest signal).
- **Backpressure at quarter-end:** the queue is the shock absorber; workers scale out to drain; the SLO is stated as a **window** (hours), not milliseconds, because the workload is genuinely batch.

**Security / tenancy (reuse Group G) — the compliance spine:**

| Principle | Plain meaning |
|---|---|
| **Never overwrite silently** | A correction is a *new state*; the original never disappears |
| **Human-in-the-loop** | The machine only *flags*; a human decides |
| **Segregation of duties (maker-checker / 4-eyes)** | Whoever suggests a value ≠ whoever approves it |
| **Least privilege / scope** | Users see only their assigned companies — information barriers between deal teams |
| **Append-only audit trail** | Who / which field / old→new / when / why — immutable, exportable to survive an auditor or LP challenge |
| **Encryption at rest & in transit** | Files and results are encrypted on disk and over the network — table-stakes for a compliance buyer |
| **Secrets management** | API keys and credentials live in a secrets store, never in code or config |
| **Retention / right-to-delete** | A stated policy for how long data is kept and how a portco's data is removed on request |

**Roles + value lifecycle (Group G — designed, not built).** Roles map cleanly: **Viewer** (read + export) · **Analyst/Submitter** (run, *suggest*, comment, flag — cannot approve own suggestion) · **Reviewer/Approver** (accept/reject, correct a flagged value → revision) · **Admin/Data-governance** (owns the alias & currency rulebook + thresholds; every edit still logged). The value lifecycle: `Extracted` → **Verified** (ensemble agrees) *or* **Flagged/Warning** → human **Suggests** → **Approved/Rejected by a different user** → **Corrected**, keeping *old→new→who→when→why*. This chain depends on the **ensemble + review queue + auth (all designed, not built)** — I never present it as a control that exists today.

> **Two controls that already exist and must survive every scaling step:** **provenance** (file-level today — source file, raw label, **confidence ~84%–99.5%** in the actual export, exact excerpt; page-level anchoring + PDF-screenshot sidebar are **roadmap**, never shown live as if real) and **refuse-to-compare** (the **built** control — LendBridge tagged credit by its loan-book/NIM/charge-off fingerprint → its gross-margin rows are shown but never ranked; **intra-SaaS** margin refusal is roadmap, so the SaaS heat colour is *directional, not audited like-for-like*). Reconciliation today = **22 checked / 22 agree / 0 disagree + 7 in-document conflicts auto-resolved** — and that agreement is a *second witness restating the same number = confirmation, not independent proof*; independence is exactly what the ensemble adds. **Currency:** the tool normalizes **units + scale (M/K)** and **flags/refuses** a different currency — it does **not convert**; PeopleFlow's GBP flag is a **front-end rulebook rule** (in the payload `currency` is `null`; the parser never sees the £). FX conversion is roadmap, levels-only, dated, and **never for ratios/percentages**.

---

## 11. One-page cheat sheet

**The boxes, in order — and the one-line WHY:**

| Box | One-line why |
|---|---|
| v0 monolith | simplest thing that works for 20 trusted PDFs |
| v1 queue + workers + store | work becomes durable and the request stops waiting |
| v2 object storage + events | cheap file home + auto-intake from many sources/formats |
| v3 split extraction / normalization | scale and pay for the expensive reader separately |
| v4 ensemble + human-review *(designed, not built)* | trust scales through agreement, not more AI |
| v5 multi-tenant, partitioned | isolation + bursts — only after data-residency is answered |

**Buzzwords, one line each:**

- **Async** — reply with a ticket, do slow work later.
- **Queue** — durable to-do list that absorbs bursts (managed SQS: zero-ops, at-least-once).
- **Worker** — background process that drains the queue.
- **Object storage** — cheap file bucket with "new file" events.
- **Split extract/normalize** — different cost/latency → scale independently (seam already on disk).
- **Cache** — SHA-256 dedup (skip re-parse) *plus* a result cache (skip reassembly), invalidated on restatement.
- **Retry** — flaky failures fix themselves.
- **Idempotency** — safe to run twice, so a retry can't double-count.
- **DLQ** — shelf for poison files, so one bad PDF never blocks the line.
- **Partitioning** — split by company/fund/period *in one DB* → fast, isolated, info-barriered (shard only when a node is full).
- **Observability** — logs, metrics, traces; answer "which file made this number?"
- **Human-review** — machine flags, human decides.
- **Independent scaling** — pay per service's own load.

**Maturity phrases to rattle off:**

- *"I'd keep it a monolith until one run stops finishing in time."*
- *"Name the pressure before you draw the box."*
- *"The disagreement is the alarm."* / *"Count isn't enough — independence decides."*
- *"Idempotency so a retry can't double-count."*
- *"A DLQ so one poison PDF never blocks the line."*
- *"The seam is already on disk — a service split is promoting a boundary, not a rewrite."*
- *"Offline isn't a limitation here, it's the data-residency answer."*
- *"The deterministic core stays as a canary."*
- *"Every step additive and reversible."*
- *"Same label doesn't mean the same metric — comparability is the product."*
- *"A silent blank is more dangerous than a loud error — refuse rather than fake."*

**The honest one-liner to close on:**

> Concord is a **prototype** — offline, in-memory, one deterministic method, recall measured on **24 synthetic PDFs**. But it has a **clear, staged path to production trust**, and the seams are already there: `parse → normalize → export` are real contracts, the CLI already **writes two of the three to disk** (crossing the first seam and emitting the final export), and the redundant ensemble (**designed, not yet built**) is where trust scales. I harden in place first, keep the deterministic core as a canary, and move to the cloud only when volume, tenancy, or SLAs justify it — and only after the data-residency question is answered.

---

## 12. The decision catalog — every scale-up choice, side by side

This is the reference behind §8: every part of the system has more than one reasonable option, so here they are side by side — each with the plain trade-off and my landed pick for Concord's **offline, compliance-first, batch-cadence** context (never options without a choice).

> One reminder before the tables, so nothing below over-claims: today Concord is a **prototype** — offline, in-memory, **one deterministic method (pypdf)**, no database, no queue, no login, and no caching or content-hashing. Everything below marked *(designed, not built)* is a drawing, not running code. The **76%→90% recall is on 24 synthetic PDFs** (128 printed numbers), the jump came from a **parser fix**, and it is paired with **0 wrong values**.

---

### 12.1 Intake — how the quarterly packs arrive

| Option | How it works (plain) | Pros | Cons / trade-off | Cost | Pick when… |
|---|---|---|---|---|---|
| **Cloud-storage connector** (SharePoint/OneDrive/Drive/Box/S3, read-only) | We *read* a folder the client already uses; we never write back | Matches how packs already land; no new habit for the LP/analyst | Per-provider auth + scoping to maintain | Low–Med | Client already keeps packs in a shared drive |
| **Secure upload portal behind SSO** | A login page; the analyst drags files in | Highest trust; identity on every file from day one | Someone must *do* the upload; not automatic | Low | You want a controlled, audited front door |
| **Email-forwarding inbox / SFTP drop** | Forward the pack email, or drop on an old-school file server | Zero change for legacy senders | Weak identity; parsing email/attachments is messy | Low | A sender genuinely cannot use anything modern |

**Recommendation (for Concord): read-only cloud-storage connector first, with a secure SSO upload portal as the high-trust fallback** — it fits the existing SharePoint/Drive habit and, being read-only, gives Sharon a clean "we never touch the source" control. **Switch when:** a data-room or monitoring-system with a real API becomes the system of record — then integrate that feed directly and retire the folder poll.

---

### 12.2 File (bytes) storage

| Option | How it works (plain) | Pros | Cons / trade-off | Cost | Pick when… |
|---|---|---|---|---|---|
| **Object storage** (S3, or on-prem MinIO) | A big cheap bucket; each file has a URL and can fire a "new file" event | Cheap, streams large files, native events, scales endlessly | A service to run (or MinIO to host on-prem) | Low/GB | Thousands of PDFs; you want auto-intake |
| **Database BLOB column** | Store the raw bytes *inside* a DB row | One store for bytes + metadata; transactional | Bloats the DB, slow on big files, no native events | Med | Files are tiny and few |
| **Shared filesystem / NAS** | A network folder many machines mount | Dead simple; it's what we use today | No events, awkward across many workers, single point | Low | One machine, small volume (today) |

**Recommendation (for Concord): object storage — an on-prem, S3-compatible store (MinIO) so bytes stay inside the client's walls.** It gives events for auto-intake without breaking the offline posture. **Switch when:** a public-cloud re-platform is approved — then the same code points at real S3, no rewrite.

---

### 12.3 Async execution model

| Option | How it works (plain) | Pros | Cons / trade-off | Cost | Pick when… |
|---|---|---|---|---|---|
| **Synchronous request** (today) | One request runs the whole pipeline and waits | Simplest possible; nothing to operate | Slow file blocks caller; a crash loses the work | Free | 24 PDFs, ~1s, one user |
| **In-process background thread** | Reply now, do the work on a thread in the same process | Non-blocking with almost no new parts | A crash still loses in-flight work; no cross-machine scaling | Free | You need non-blocking but not durability |
| **Queue + worker pool** | A durable to-do list (a queue = a waiting line for jobs); background workers pull jobs | Durable, survives crashes, scales across machines | Real infra to run and monitor | Med | Runs stop finishing in time, or work must survive a crash |
| **Managed batch / serverless** | A cloud service spins compute per file | Zero idle cost; scales to zero | Cold starts; data leaves on-prem; per-invoke price | Var | Bursty cloud volume, residency not a concern |

**Recommendation (for Concord): queue + worker pool** — it is the smallest move that gives *both* durability and horizontal room, and it fits a batch cadence. **Switch when:** volume is genuinely spiky *and* the cloud is allowed — then a managed batch service removes idle cost.

---

### 12.4 Queue technology

| Option | How it works (plain) | Pros | Cons / trade-off | Cost | Pick when… |
|---|---|---|---|---|---|
| **Managed (SQS)** | Cloud queue; someone else runs it; at-least-once delivery (the message may arrive more than once) | Zero-ops, scales itself | Cloud-only → **data leaves on-prem**; vendor lock | $/msg | Cloud path (v5) is chosen |
| **Self-hosted broker (RabbitMQ)** | A queue server you run on-prem; durable, rich routing | Stays on-prem; strong durability; mature | You operate and back it up | Low | On-prem, durability matters |
| **Redis + Celery** | A fast in-memory store used as a queue via Celery | Simplest to stand up; fine at small scale | Weaker durability guarantees; easy to lose messages | Low | Small volume, loss-tolerant |
| **Kafka / streaming** | A high-throughput event log with replay | Huge throughput, event replay/sourcing | Heavy to run; overkill for batch | High | One ordinary queue is truly saturated |

**Recommendation (for Concord): self-hosted RabbitMQ** — it keeps the queue on-prem (the residency answer) with real durability. Note the delivery *semantics* below (§12.15) are queue-agnostic: RabbitMQ is also at-least-once, so the whole idempotency argument holds without naming a cloud queue. SQS is the pick *only* on the cloud branch, and Kafka only when one plain queue is provably saturated. **Switch when:** you re-platform to cloud (→ SQS) or need replay/event-sourcing at stream scale (→ Kafka).

---

### 12.5 Worker compute

| Option | How it works (plain) | Pros | Cons / trade-off | Cost | Pick when… |
|---|---|---|---|---|---|
| **Long-running worker pool** (containers/VMs) | A fixed set of background processes always up, draining the queue | Predictable, warm, simple to reason about; stays on-prem | Idle cost between quarters; you size it by hand | Med (steady) | Steady, predictable batch load |
| **Autoscaling container service** (ECS/K8s) | The platform adds/removes workers on a signal (queue depth = how many jobs are waiting) | Scales to the burst, shrinks after | An orchestrator to run and tune | Med–High | Quarter-end bursts are large and real |
| **Serverless functions** (per file) | One function invocation per file; scales to zero | No idle cost; instant fan-out | Cold starts; per-invoke price; cloud egress | $/invoke | Cloud allowed, very spiky volume |

**Recommendation (for Concord): a long-running container worker pool on-prem** — matches a predictable quarterly cadence and keeps compute inside the walls. **Switch when:** quarter-end bursts routinely outgrow the fixed pool — then autoscale workers on **queue depth**.

---

### 12.6 Extraction / accuracy method

| Option | How it works (plain) | Pros | Cons / trade-off | Cost | Pick when… |
|---|---|---|---|---|---|
| **Single deterministic parser** (today, pypdf) | One rule-based reader; same input → same output | Reproducible, auditable, offline, free; fails **loudly** | A lone reader can be **silently wrong** on hard layouts | Free | Clean native-text PDFs, trust demo |
| **Single cloud doc-AI / vision-LLM** | One smart model reads the page | Higher ceiling on messy pages | Fails *silently*; data leaves on-prem; per-page cost | $/page | Layouts are ugly and residency is fine |
| **Redundant multi-method ensemble** (2–4 independent) *(designed, not built)* | Several *independent* readers vote on a normalized value | Agreement is real evidence; disagreement is the alarm | Most to build and operate; independence never total | Med–High | Volume/variety makes a lone reader too risky |

**Recommendation (for Concord): keep the single deterministic parser today, and make the redundant ensemble the destination** — the fix for "silently wrong" is **more agreement, not more AI**, and the deterministic core stays as a canary inside it. **Switch when:** layout variety at scale makes a lone reader untrustworthy — build the ensemble *with* its human-review queue, never alone. *(Why pypdf over PyMuPDF/pdfplumber/pdfminer: pypdf is pure-Python with a permissive license and no native binary to vet — the smallest thing to audit and ship for an offline install; pdfplumber earns its place later as an ensemble voter in §12.7, not as a drop-in replacement for the base reader.)* *(Honest: the ensemble is designed, not built; I cannot quote an auto-accept rate until it runs.)*

---

### 12.7 Ensemble reader mix (if v4)

| Option | How it works (plain) | Pros | Cons / trade-off | Cost | Pick when… |
|---|---|---|---|---|---|
| **All-local** (pypdf + pdfplumber + Docling + local vision) | Every voter runs on-prem | **Zero data egress**; the residency answer | Lower ceiling on the very hardest pages | Compute only | Compliance-first, data-residency-bound |
| **Local + one hosted doc-AI tie-breaker** | Local readers vote; a hosted model breaks ties only on the ambiguous tail | Better on hard pages; paid only on the tail | *Some* pages leave on-prem — a client choice | $/tail page | Client accepts limited, gated egress |
| **Mostly-hosted** | Several hosted models dominate the vote | Highest raw ceiling | Correlated blind spots + full egress + per-page cost | $$/page | Residency truly not a concern |

**Recommendation (for Concord): all-local** — independence *and* zero egress in one choice, which is exactly what Sharon can sign. **Switch when:** the client explicitly accepts egress for the hard tail — then add **one hosted tie-breaker**, gated to only the pages where local readers disagree. *(Why Docling over Unstructured/LayoutParser/Camelot: Docling runs fully offline and reads document *structure* — tables and reading order — not just raw text; Unstructured leans on cloud models for its best results, and Camelot only does tables. Docling adds structural understanding without opening a network hole.)* *(Independence is strong evidence, not proof — shared training data and ugly layouts can fool several at once.)*

---

### 12.8 Service decomposition

| Option | How it works (plain) | Pros | Cons / trade-off | Cost | Pick when… |
|---|---|---|---|---|---|
| **Keep the monolith** (today) | One process does parse → normalize → export | Simplest deploy; no network hops | Cheap rules scale together with the expensive reader | Free | Cost/latency of the stages are similar |
| **Split extraction vs normalization** (2 services) | Two services at the `ParserOutput`→`NormalizationResult` seam | Scale/pay for each independently; seam **already on disk** | Two deploys, a network hop, more to monitor | Med | Extraction is heavy/slow, normalization stays cheap |
| **Full microservices** | Many small services | Team-level independence | Lots of network + ops for little scale gain | High | One deploy is genuinely blocking two teams |

**Recommendation (for Concord): monolith now; the extract/normalize split as the first (and probably only) decomposition** — the CLI already writes two of the three contracts to disk, so the split is *promoting a boundary, not a rewrite*. **Switch when:** extraction's cost/latency profile diverges sharply from normalization (e.g. paid doc-AI per page) — split then, and no further; microservices are an *org* decision, not a scale one.

---

### 12.9 Datastore engine

| Option | How it works (plain) | Pros | Cons / trade-off | Cost | Pick when… |
|---|---|---|---|---|---|
| **Relational (Postgres)** | Tables + rows; strong joins; row-level scoping native | Data is already tabular tuples; real joins metric×company×period; mature isolation | Rigid schema (fine here) | Low | Structured, comparable data (ours) |
| **Document store (Mongo)** | Flexible JSON documents, schema-free | Handles wildly varying shapes | Weaker joins; schema drift risk; overkill here | Low | Sources produce very different shapes |
| **Analytics warehouse** (for reporting) | A separate columnar DB just for big read queries | Fast dashboards over huge history | A second store to sync; extra pipeline | Med | Reporting scans dwarf the operational load |

**Recommendation (for Concord): relational Postgres** — everything lands as the *same normalized tuple* `(metric, period, unit, basis, value)`, so the flexibility of a document store buys nothing and its weaker joins cost us. *(Postgres over MySQL or other relational engines for stricter typing, richer constraints and native table partitioning, and built-in row-level security — the exact isolation controls Sharon cares about.)* **Switch when:** reporting queries over years of history slow the operational DB — add a **read-only warehouse** beside it, don't replace Postgres.

---

### 12.10 Multi-tenancy / isolation

| Option | How it works (plain) | Pros | Cons / trade-off | Cost | Pick when… |
|---|---|---|---|---|---|
| **Shared DB, row-level scope** | One DB; every row tagged with tenant; queries filter by it | Cheapest to run; simple ops | Isolation is *code-enforced* — a query bug can leak | Low | Many small tenants, trusted operator |
| **Schema-per-tenant** | One DB, a separate namespace per tenant | Stronger boundary; still one engine to run | More schemas to migrate | Med | A regulated tenant wants a hard wall |
| **Database-per-tenant** | A whole separate DB per tenant | Strongest isolation; independent backup/restore/delete | Most to operate; costly at many tenants | High | A contract demands physical separation |

**Recommendation (for Concord): start shared-DB with row-level scope, backed by partitioning (§12.11) for the information barriers between deal teams.** It meets least-privilege now without over-building. **Switch when:** a regulated tenant needs a hard boundary → **schema-per-tenant**; only a contractual physical-isolation clause justifies **database-per-tenant**.

---

### 12.11 Partitioning vs sharding

*Plain definitions first: **partitioning** = split one big table into slices **inside one database** (logical). **Sharding** = spread those slices across **many machines** (physical).*

| Option | How it works (plain) | Pros | Cons / trade-off | Cost | Pick when… |
|---|---|---|---|---|---|
| **Single table** | All rows in one table | Simplest | A "NovaCloud Q3'24" query scans everything; one tenant's load hurts all | Free | One tenant, small data |
| **Partitioned** (logical, one DB) | Table sliced by (tenant, company, fund, period) | Fast scoped queries; tenant isolation; info barriers | Slightly more schema care | Low | Many companies/periods in one DB |
| **Sharded** (across machines) | Slices live on different servers | Beyond one machine's capacity | Cross-shard queries + ops get hard | High | One node provably can't hold or serve it |

**Recommendation (for Concord): partitioned by company/fund/period** — it delivers fast scoped reads *and* the information-barrier isolation Sharon needs, all inside one DB. **Switch when:** a single node is *provably* the bottleneck (capacity or throughput) — shard then, not before.

---

### 12.12 Caching *(the two caches compose — they are not either/or; both are designed, not built)*

| Option | How it works (plain) | Pros | Cons / trade-off | Cost | Pick when… |
|---|---|---|---|---|---|
| **None** (today) | Recompute everything each time | Nothing to invalidate; always fresh | Pays to re-parse unchanged files | Free | Inputs rarely repeat |
| **Content-hash dedup** (skip re-parse) *(designed, not built)* | Same SHA-256 → bytes unchanged → skip the whole parse. (SHA-256 = a fixed fingerprint of the file's bytes.) | Never re-pay for an identical file; nearly free — we *would* hash while reading, since parsing reads the whole file anyway | Detects *that* a file changed, not *what* | Free | Files get re-uploaded/re-synced |
| **Result / read-through cache** (Redis, TTL) *(designed, not built)* | Remember an assembled answer for a while (TTL = time-to-live, how long we keep it) | Repeat `GET /api/metrics` and repeat paid doc-AI calls return instantly | Must **invalidate** on restatement or serve stale | Low | Reads repeat; assembly or doc-AI is expensive |

**Recommendation (for Concord): both, layered — content-hash dedup as the base, a result cache on top with a TTL and hard invalidation whenever the SHA-256 manifest records a restatement.** A stale number is a silent lie, so invalidation is not optional. *(Redis over Memcached for the result cache because Redis persists, supports TTL and richer types, and can be invalidated key-by-key when a restatement lands; Memcached is a pure volatile cache with none of that.)* **Switch when:** you never re-read files *and* reads are cheap — then drop the result cache; keep dedup, it's near-free.

---

### 12.13 Change detection

| Option | How it works (plain) | Pros | Cons / trade-off | Cost | Pick when… |
|---|---|---|---|---|---|
| **Full content hash (SHA-256)** *(designed, not built)* | Fingerprint the actual bytes | Always correct; a rename → same hash → no pointless re-run; one digit → re-run + flag "restated" | Must read the whole file (parsing would read it anyway) | Free | Correctness matters (always, here) |
| **File mtime / etag** | Trust the modified-time or storage tag | Cheap to read | **Lies** — a copy/re-export/restore changes them without changing content | Free | Speed matters more than truth |
| **Storage change-event / webhook** | The bucket tells us "file created/changed" | Near-instant trigger | Needs webhook plumbing + a reachable endpoint; still not a content truth | Low | Intake latency genuinely matters |

**Recommendation (for Concord): SHA-256 content hash as the source of truth** — it never mistakes a copy or restore for a real change, and it gives Sharon "which exact version produced this number?" **Switch when:** intake latency starts to matter — add a **storage event as a trigger**, but still confirm the real change by hash. *(Keep this version-restatement story separate from ClearPay's $38.4M→$32.2M, which is **restricted-cash normalization within one document** — raw cash minus $6.2M segregated client float — not a file-version restatement.)*

---

### 12.14 Result delivery / real-time transport

| Option | How it works (plain) | Pros | Cons / trade-off | Cost | Pick when… |
|---|---|---|---|---|---|
| **Polling** | UI asks "done yet?" every few seconds | Simplest; no server push; no open connections | Slight lag; some wasted requests | Free | Jobs finish in seconds-to-minutes (ours) |
| **Server-Sent Events (SSE)** | Server pushes updates one-way over one connection | Light push; live progress | Needs a held connection; one-way only | Low | Many clients watch long jobs |
| **WebSocket** | Two-way live channel | Full duplex, richest live UX | Heaviest; more to operate | Med | You need two-way live interaction |

**Recommendation (for Concord): polling** — quarterly packs are batch, jobs finish quickly, and a job-id + poll is the least machinery for the need. **Switch when:** many users watch many long-running jobs at once — add **SSE** (one-way is enough); reserve WebSocket for genuine two-way needs.

---

### 12.15 Delivery guarantee + idempotency

*Plain first: **idempotency** = running the same job twice leaves the same result as running it once — a safe retry.*

| Option | How it works (plain) | Pros | Cons / trade-off | Cost | Pick when… |
|---|---|---|---|---|---|
| **At-most-once** | Deliver once; if it's lost, it's lost | Never double-processes | **Loses work** on any failure | Free | Loss is acceptable (rare) |
| **At-least-once + idempotent consumer** | May deliver twice; the consumer is safe to run twice | No lost work; a retry can't double-count (key by content hash + metric tuple) | You must *design* the idempotency keys | Low | Reliability matters (always, here) |
| **"Exactly-once"** | The promise of one-and-only-one delivery | Sounds ideal | **Mostly a myth** across a network — it's really at-least-once + dedup under the hood | — | Never chase it as a primitive |

**Recommendation (for Concord): at-least-once delivery with an idempotent consumer** — this is the honest, practical form of "exactly-once," and it's why the design keys each job on a content hash + metric tuple so a retry overwrites instead of duplicating. It is queue-agnostic: RabbitMQ (§12.4) is at-least-once too, so the guarantee does not depend on any cloud queue. **Switch when:** never toward "exactly-once" as a promise — if you retry, you must be idempotent; if you're idempotent, at-least-once is already safe.

---

### 12.16 Failure handling

| Option | How it works (plain) | Pros | Cons / trade-off | Cost | Pick when… |
|---|---|---|---|---|---|
| **No retry** | A failed job just fails | Simplest | A flaky read or transient blip = lost work | Free | Failures are always permanent |
| **Retry with backoff + dead-letter queue (DLQ)** | Retry a few times with growing delays; after N, shelve the message on a DLQ for a human. (DLQ = a side queue for jobs that kept failing.) | Transient errors self-heal; one poison PDF is contained, never blocks the line | Keys must be idempotent; a DLQ to watch | Low | Any real reliability need |
| **Infinite retry** | Keep retrying forever | Never "gives up" | **Anti-pattern** — one bad file blocks the whole queue | Free | — (don't) |

**Recommendation (for Concord): retry with backoff + a DLQ** — the DLQ is the partner of retries: it sets aside one corrupt pack for human eyes and pages an operator ("N docs need eyes"), so a single poison PDF never stalls the quarter. **Switch when:** never to infinite retry — it converts one bad input into an outage. *(A DLQ hit surfaces the same honest signal the prototype already uses: `parsed < total`.)*

---

### 12.17 Deployment posture

| Option | How it works (plain) | Pros | Cons / trade-off | Cost | Pick when… |
|---|---|---|---|---|---|
| **Harden-in-place on-prem** (Option 1) | Add queue/store/workers to the existing offline stages, still on the client's machines | Fastest reliability; **zero egress**; reversible, additive | Caps at one site's capacity | Low–Med | Compliance-first, moderate volume (ours) |
| **Cloud re-platform** (Option 2) | Move the whole thing to the cloud | Highest ceiling; managed scale | Months of infra + tenancy + security review; **data leaves on-prem** | High | Bursts/tenants/SLAs truly force it |
| **Hybrid** (on-prem core + cloud burst) | Keep the core on-prem; overflow to cloud at peaks | Residency for the norm, elastic for the spike | Two environments to run and secure | Med–High | Rare peaks exceed on-prem capacity |

**Recommendation (for Concord): harden-in-place on-prem first (Option 1)** — its decoupled stages *are* the on-ramp to the cloud later, so nothing is wasted, and it delivers v1+v4 reliability in weeks without a residency fight. **Switch when:** volume, bursts, tenants, or SLAs genuinely force it *and* the data-residency question is answered → hybrid burst before a full re-platform.

---

### 12.18 Security & data residency

| Option | How it works (plain) | Pros | Cons / trade-off | Cost | Pick when… |
|---|---|---|---|---|---|
| **Fully-offline on-prem** (zero egress) | Nothing leaves the client's network; enforced by construction — we only ever build the local parser, and a runtime guard *raises* if any non-local parser is used | The strongest residency answer; least attack surface | Accuracy caps on the hardest pages | Low | Compliance-first (ours) |
| **Private cloud / VPC** | Cloud, but inside a walled network segment | Cloud scale with tighter control | Still off-prem; VPC/security review needed | Med | Cloud allowed but must stay private |
| **Public cloud + hosted doc-AI** | Full public cloud, hosted models read the pages | Highest accuracy + scale | **Data leaves on-prem**; per-page + egress cost | High | Volume/accuracy chosen over residency |

**Recommendation (for Concord): fully-offline on-prem, zero egress** — offering the offline choice *is* the governance answer for a compliance buyer, not a limitation. A note for Sharon on the mechanism: it is a real `raise`, not a Python `assert` — an `assert` can be stripped by running with `python -O`, a `raise` cannot, so the guard holds in every run. **Switch when:** the client explicitly owns the residency decision and accepts egress — then private-VPC before public cloud. *(This is a choice the client makes, not me.)*

**Sub-table — the controls that ride along, whichever posture is chosen:**

| Control | Option A | Option B | Trade-off | Recommendation (for Concord) |
|---|---|---|---|---|
| **Encryption** | At rest only | At rest **and** in transit | In-transit adds TLS/certificate management | **Both** — table-stakes; files and results encrypted on disk and over the wire |
| **Secrets management** | Keys in config/env files | Dedicated secrets store (Vault/KMS) | A secrets store is one more service to run and back up | **Secrets store** — never keys in code or config, even offline |
| **Retention / right-to-delete** | Keep everything forever | Stated retention + per-portco delete on request | Honored deletes need an auditable delete path that also reaches backups | **Stated policy + honored deletes** — never overwrite silently; a delete is auditable |

---

### 12.19 Observability — build vs buy

| Option | How it works (plain) | Pros | Cons / trade-off | Cost | Pick when… |
|---|---|---|---|---|---|
| **Logs only** | Text records of what happened | Simplest; already have it | No trends, no "how fast/how much", no request path | Free | The demo — watch it by eye |
| **Self-hosted metrics + traces** (Prometheus/Grafana + OpenTelemetry) | We run the dashboards; metrics = how much/fast, traces = one request's path | Full picture; **telemetry stays on-prem** | A stack to run and maintain | Low–Med | Compliance-first, real load (ours) |
| **Managed** (Datadog / Cloud Monitoring) | A vendor hosts the dashboards | Least ops; polished | **Telemetry leaves the network** — a residency snag; ongoing fee | $$ | Residency isn't a concern |

**Recommendation (for Concord): self-hosted Prometheus/Grafana + OpenTelemetry traces** — a managed SaaS ships operational data (which file, which tenant) off-prem, which contradicts the whole posture. Traces answer the SRE version of provenance: *"which file produced this number?"* *(Prometheus/Grafana over VictoriaMetrics/InfluxDB because it is the most standard and best-documented on-prem stack, so it is the easiest to hire for and audit; move to VictoriaMetrics only if metric cardinality or retention outgrows Prometheus.)* **Switch when:** the client is already all-in on a cloud with an approved managed monitor — then buy instead of build.

---

### 12.20 Human-review model

| Option | How it works (plain) | Pros | Cons / trade-off | Cost | Pick when… |
|---|---|---|---|---|---|
| **Auto-accept everything** | Trust the machine, no human | Zero labor; fastest | A silent wrong value ships — the worst outcome for this room | Free | — (never, for low-confidence) |
| **Review everything** | A human checks every value | Maximum control | Doesn't scale; humans rubber-stamp when overloaded | High labor | Tiny volume, highest stakes |
| **Review only the flagged tier** (tiered consensus) *(designed, not built)* | Ensemble auto-trusts agreement; only DISAGREE/UNRESOLVED cases go to a person | Scales trust; humans spend effort only where it matters | Depends on the ensemble existing; queue must be staffed | Med | Real volume + a trust bar (ours) |

**Recommendation (for Concord): review only the flagged/amber tier — the machine flags, a human decides.** It is the compliance spine that scales: auto-trust where independent readers agree, escalate only real disagreement. **Switch when:** stakes are so high that even agreed values need sign-off → review everything for that slice; never auto-accept a low-confidence value. *(This depends on the ensemble + review queue, which are designed, not built — I never present it as a control that exists today.)*

---

### 12.21 Web / API tier

| Option | How it works (plain) | Pros | Cons / trade-off | Cost | Pick when… |
|---|---|---|---|---|---|
| **Werkzeug dev server** (today) | Flask's built-in server; one request at a time | Zero setup | Serializes requests; not for production; the global has no lock | Free | The demo, single user |
| **Sync WSGI (gunicorn) + queue** | Multiple **worker processes** serve requests; heavy work goes to the queue | Sidesteps Python's GIL for CPU-bound parsing; thin, robust web tier | A process manager to run | Low | CPU-bound work (ours) at real concurrency |
| **Async ASGI** (uvicorn/FastAPI) | Async server, great at many waiting I/O calls | Wins when the tier is I/O-bound *waiting* | Buys little for CPU-bound parsing | Low | The web tier itself is I/O-bound |

**Recommendation (for Concord): gunicorn with multiple worker *processes*, fronted by the queue** — the work is CPU-bound parsing, so processes (not threads, not async) are the right lever, and the **queue does the heavy lifting so the web tier stays thin**. Put a **load balancer** in front of multiple instances and **autoscale workers on queue depth**. *(gunicorn over uWSGI for a simpler process model and config; uWSGI is more capable but heavier to tune, and we don't need its extra features here.)* **Switch when:** the API tier itself becomes I/O-bound (many slow upstream calls) — only then does async/ASGI pay off.

---

### 12.22 Cost model

| Option | How it works (plain) | Pros | Cons / trade-off | Cost | Pick when… |
|---|---|---|---|---|---|
| **On-demand everything** | Pay per use for all compute/storage | No upfront commitment; simple | Most expensive for a steady base load | High | Load is unpredictable and small |
| **Reserved core + on-demand burst** | Commit to the steady base; rent extra only at peaks | Cheapest for a predictable base + occasional spike | Requires forecasting the base | Low–Med | Predictable batch base, quarter-end spikes (ours) |
| **Tail-only paid AI + storage tiering** | Deterministic rules do the bulk free; paid AI only on the ambiguous tail; hot storage for the current quarter, cold/archive for old packs | Spend tracks **ambiguity**, not volume; storage tracks *access*, not accumulation | Routing logic ("is this ambiguous?") is work to build | Low | You have a paid-AI tail + growing archive |

**Recommendation (for Concord): reserved/committed capacity for the steady core plus on-demand burst, composed with tail-only paid AI and storage lifecycle tiering** — cost scales with *how often we call the expensive thing*, so the levers are calling it less and paying steady-rate for the predictable base. **Switch when:** load stops being predictable — drop the reservation and go on-demand; the tail-routing and tiering stay regardless. *(No invented ROI or savings figures — time-savings stays qualitative; on the synthetic set, the free deterministic core already handles the bulk of the 128 printed numbers.)*

---

**The catalog in one line:** for a room that rewards *right-sized* engineering (Parinaz) and *auditable control* (Sharon), almost every pick above lands on the **simpler, on-prem, deterministic-first, reversible** option — and names the exact pressure that would justify the bigger one. Same discipline as §5: **name the pressure before you draw the box.**

---

## Appendix A — Ready-to-draw whiteboard sketches

*These are the 5 pictures to practice until you can draw each one in ~30 seconds while talking — the box order is the story, so rehearse the hand movement, not just the shape.*

---

### A1. The evolution ladder (v0 → v5) — the spine of the whole talk

```
 v0  [ monolith: parse → normalize → export ]        ← TODAY (real, offline)
      │   pressure: a crash loses work + a slow PDF blocks the caller
 v1  [ queue → worker → store ]                       ← durable + async
      │   pressure: many docs / many sources
 v2  [ object storage + "new file" events ]           ← cheap file home
      │   pressure: expensive reader vs cheap rules
 v3  [ EXTRACT svc  ‖  NORMALIZE svc ]                 ← scale each alone
      │   pressure: a lone reader can be SILENTLY wrong
 v4  [ ensemble → orchestrator → human-review ]       ← *DESIGNED, NOT BUILT*
      │   pressure: many tenants / quarter-end bursts / SLAs
 v5  [ multi-tenant cloud, partitioned DB ]           ← only AFTER data-residency
```

**Draw it:** write `v0` at the top. Then draw the short arrow down, write the *pressure* on that arrow, and only then draw the next rung. Repeat. One rung, one pressure, every time — never draw v5 first.

**Say while you draw:** "I start with the simplest thing that works, and I add one box only when a real pressure forces it — the pressure on each arrow is why the next box exists."

**The trade-off on this picture:** the tempting alternative is to draw v5 first (the full cloud re-platform). **I reject it for this room** — that is months of infra and security review before I deliver the reliability that v1 + v4 give in weeks; v0 is the correct answer, not an embarrassment.

---

### A2. The async core — queue, worker, store, poll, with retry + DLQ

```
 request ──► enqueue ──► [ QUEUE ]         (durable to-do list of jobs)
                             │
                             ▼
                        [ WORKER ] ─────► [ STORE ]   (DB, result survives a crash)
                         ▲    │               │
                  retry  │    │ fails N×       ▼
                (backoff)│    ▼          GET /result/{id}
                         └── [ DLQ ] ──► alert a human   ("N docs need eyes")
                             (shelf for poison files)
```

**Draw it:** draw the happy line left-to-right first — `request → enqueue → QUEUE → WORKER → STORE`. Then hang two things off the WORKER: the *retry* loop (arrow back onto itself) and the *DLQ* box below. Last, draw the *poll* arrow from STORE back up to the caller.

**Say while you draw:** "Async just means reply now with a ticket and do the slow work later — a queue is a durable to-do list, a worker pulls one job, a store keeps the result so a crash can't lose it; the retry heals flaky failures and the dead-letter queue (a side shelf for jobs that keep failing) parks one poison PDF so it never blocks the line."

**The trade-off on this picture:** the simpler alternative is threads inside the Flask process — no new infrastructure. **I reject it** — a crash still loses in-flight work, and threads don't survive scaling to a second machine. One caveat I say out loud: *any* real broker delivers *at-least-once* — a job can arrive twice. This is true of the on-prem RabbitMQ I pick, not only cloud queues, so I never lean on a specific vendor's guarantee. Because of it, jobs must be *idempotent* (safe to run twice). I key each job on file-hash + metric tuple, so a retry can never double-count a number.

---

### A3. The extract / normalize split at the `ParserOutput` seam

```
                     ParserOutput  ‖  (the seam — already on disk today)
                                   ‖
 file ─► [ EXTRACTION SVC ] ───────‖──► [ NORMALIZE SVC ] ──┐
         heavy · slow · ~20 workers ‖    cheap rules · ~2    │
 file ─► [ EXTRACTION SVC ] ───────‖──► [ NORMALIZE SVC ] ──┤
                                   ‖                         ▼
                                   ‖          [ AGGREGATE / EXPORT ]  (fan-in)
                                   ‖      dedupe + refuse-to-compare
                                   ‖      (only across incompatible bases)
```

**Draw it:** draw the vertical seam line (`‖`) down the middle first — that is the star of the picture. Put the *heavy* extraction boxes on the left, the *cheap* normalize boxes on the right. Then draw the *fan-in* arrows collapsing to one `AGGREGATE / EXPORT` box at the bottom.

**Say while you draw:** "This split is not a rewrite — the seam already exists, the CLI already writes `ParserOutput` to disk and reads it back, so I'm just promoting a disk boundary to a network boundary; now I can run 20 heavy extraction workers and only 2 cheap normalize workers, and *fan-in* means the export step waits for all documents before it dedupes and compares. The refuse-to-compare step here is the built one — it blocks a ranking only when the *basis* is structurally incompatible, like a lender's interest margin against a product margin. Broader same-metric refusal is roadmap."

**The trade-off on this picture:** the simpler alternative is one combined worker — one deploy, no network hop. **I reject it once the cost gap is real** — it forces the cheap rules to scale (and redeploy) together with the expensive extractor, so a one-line alias change drags the slow service along with it.

---

### A4. The redundant-ensemble consensus — *DESIGNED, NOT BUILT*

```
              *** DESIGNED, NOT BUILT — no real accept-rate yet ***

              ┌─ deterministic parser   (today's Concord = canary, fails LOUD)
 ParserOutput ┼─ local structural reader (Docling, offline)
              ├─ vision-LLM reader       (reads MEANING; votes, never decides)
              └─ (optional) doc-AI       (tie-breaker only)
                          │
                          ▼
                 [ ORCHESTRATOR ] — compares NORMALIZED tuples
                          │          (metric, period, unit, basis, value)
          ┌───────────────┼────────────────┐
       AGREE            NOTE            DISAGREE ⚠ / UNRESOLVED
      green,          auto + dissent    → [ HUMAN-REVIEW QUEUE ]
      auto-trust      logged               machine flags, human decides
```

**Draw it:** write the `DESIGNED, NOT BUILT` banner across the top *before anything else* — say it as you write it. Then draw the 4 readers as a bracket feeding one `ORCHESTRATOR`. Then split the orchestrator into 3 outcomes. Last, draw the `HUMAN-REVIEW QUEUE` box hanging off the amber branch.

**Say while you draw:** "Today Concord uses one deterministic method — one reader can be *silently* wrong and nobody would know; the fix is not more AI, it's more *agreement*. I use a *mix* of methods on purpose, because copies of the same model share blind spots — independent methods fail on different pages, so agreement is real evidence. The orchestrator compares normalized tuples, never printed text — two readers that both say '62' but disagree on *basis* do not agree — and anything that doesn't agree goes to a person, not to production."

**Why Docling for the local reader (and not Unstructured or LayoutParser):** all three read page layout offline. I pick Docling here because it is table-first and runs fully local with no service to call — Unstructured leans toward hosted or optional model downloads, and LayoutParser needs a heavy vision model to install and run (Camelot is tables-only, too narrow for a general reader). **On the residency seam, the reader with the fewest outside dependencies wins**, so Docling is the pick for an offline, compliance-first box.

**The trade-off on this picture:** the alternative everyone reaches for is "just use one great LLM." **I reject it for this room** — it has a higher ceiling on easy pages but it fails *silently*, which is the exact failure Sharon (controls / audit) cannot accept. Honest caveat, said live: this ensemble is designed, not built, so I can't quote an accept-rate until it runs — and the deterministic core stays in as a canary.

---

### A5. Multi-tenant + partitioning — the cloud destination

```
 tenant A ─┐
 tenant B ─┼─► [ LOAD BALANCER ] ─► [ QUEUE ] ─► [ AUTOSCALING WORKERS ]
 tenant C ─┘    (spreads requests)                (scale on QUEUE DEPTH)
                                                          │
                                                          ▼
        [ DB  partitioned by (tenant, company, fund, period) ]
              + row-level scope → a deal team sees ONLY its own companies
```

**Draw it:** draw the three tenants stacked on the left, collapsing into one `LOAD BALANCER`. Then `QUEUE → AUTOSCALING WORKERS` across. Then drop down to the wide `DB` box and, underneath it, write the *row-level scope* line — that line is the compliance point, don't skip it.

**Say while you draw:** "At 500 portcos the problem is *isolation*, not compute. A *load balancer* spreads requests so no one instance is a hotspot; workers *autoscale* on queue depth — backlog grows, add workers; backlog drains, remove them. *Partitioning* means I slice one big table by company/fund/period *inside one database* so a query for 'NovaCloud Q3' touches one slice, and row-level scope enforces the information barrier between deal teams."

**The trade-off on this picture:** the alternatives are one shared table (simplest) or full *sharding* — physically spreading data across many machines. **I reject both up front** — a shared table leaks data across teams, and I only shard when one node is *provably* full; partitioning comes first. And I gate the whole picture: this is the highest ceiling but the highest cost, and here *data leaves on-prem* — so I don't draw v5 at all until the data-residency question is answered.
