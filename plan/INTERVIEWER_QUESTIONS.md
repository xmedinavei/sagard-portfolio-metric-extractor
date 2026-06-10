# Questions to Ask the Interviewer

> These are the questions **you** should ask during the conversation.

Use them to understand the real problem before you lock the solution.

---

## How to use this file

- Do **not** ask all of these.
- Pick the ones that fit the moment.
- Ask them throughout the conversation, not all at the end.
- If you learn something important, use it to adjust your recommendation.

A good rule is:

1. ask 2 or 3 questions about the user and the problem,
2. ask 1 or 2 questions about the data and workflow,
3. ask 1 or 2 questions about production, security, or scale.

---

## 1. Questions about the problem, users, and scope

### Who is this really for?

- **Who is the main user of this tool?**
- **Is this mainly for internal analysts, operating partners, or could clients see it later?**
- **Who owns this process today? One person or a team?**
- **What is the biggest pain today: time, accuracy, comparison across companies, or something else?**
- **What would success look like to you: faster review, better trust, less manual work, or better portfolio visibility?**

### Why problem and user questions matter

These questions tell you:

- who you are building for,
- whether the tool is internal or external,
- how polished it needs to be,
- and what outcome matters most.

---

## 2. Questions about input documents and extraction

### PDF and parser questions

- **How many PDFs arrive per quarter or per month?**
- **Are the PDFs mostly machine-generated, or do scanned files show up often?**
- **How much layout variation is there between companies?**
- **Is page-level provenance important, or is file-level traceability enough for now?**
- **Are we allowed to use third-party services on these PDFs, or does everything need to stay fully internal?**
- **Are there data residency or compliance limits on where the PDFs can be processed?**
- **If parsing fails on a file, should we retry automatically, skip it, or send it to a person?**

### Why extraction questions matter

These questions help you choose between:

- Firecrawl,
- a local parser,
- Azure Document Intelligence,
- or an OCR fallback.

They also tell you whether security or compliance changes the parser choice.

---

## 3. Questions about normalization, ambiguity, and review

### Trust and metric questions

- **Which metrics matter most on day one?**
- **Is it worse to miss a metric or to extract the wrong one?**
- **How much ambiguity is acceptable before you want a human to review it?**
- **Who decides whether two labels are really the same metric?**
- **How should company-specific KPIs be handled: keep them raw, flag them, or try to normalize them?**
- **Do you want low-confidence rows shown in the output, separated for review, or hidden until confirmed?**
- **Who reviews low-confidence or disputed extractions today, or who would review them later?**

### Why normalization questions matter

These questions tell you the right trust posture:

- strict,
- balanced,
- or aggressive.

They also tell you whether the system should optimize for coverage or for correctness.

---

## 4. Questions about output, workflow, and consumers

### Output and workflow questions

- **Where should the extracted metrics go first: JSON, CSV, dashboard, warehouse, or internal tool?**
- **Who consumes the output first: an analyst, another system, or a workflow like Slack?**
- **Do you need a review step before the data is used for decisions?**
- **Do low-confidence results belong in the main output or in a separate review bucket?**
- **Do you need the output to be easy for humans to read first, or easy for systems to consume first?**
- **Do you expect this to stay an internal workflow, or do you see it feeding client-facing reporting later?**
- **Should old runs stay versioned for audit or comparison, or is only the latest output needed?**

### Why output and workflow questions matter

These questions help you choose:

- JSON-first,
- CSV-first,
- review-first,
- or system-integration-first.

They also tell you whether auditability and versioning matter early.

---

## 5. Questions about production, scale, and security

### Scale and production questions

- **How many users do you expect if this becomes real?**
- **How many companies and documents are we talking about at production scale?**
- **How fast do results need to be ready: seconds, minutes, or same day?**
- **Are uploads bursty, like quarter-end spikes, or more steady over time?**
- **What would break trust first in your view: wrong numbers, missing numbers, delays, or lack of auditability?**

### Security and compliance questions

- **Is this internal-only, or could portfolio companies or clients eventually access it?**
- **Are there security requirements around financial data, access control, or audit trails?**
- **Can results be posted to Slack, or does sensitive data need to stay in a more controlled system?**
- **How long should PDFs and extracted outputs be retained?**
- **Do we need encryption, data residency controls, or stricter storage rules from day one?**
- **Are third-party APIs allowed for financial documents, or is that a hard no?**

### Why production and security questions matter

These questions tell you:

- whether async architecture is required,
- whether Azure serverless is a fit,
- whether Slack is acceptable,
- and whether external parsing services are even allowed.

---

## 6. Best small set to ask in a live interview

If you only ask 5 or 6 questions, use something like this:

1. **Who is the main user of this tool?**
2. **Is this internal-only, or could clients see it later?**
3. **How many PDFs and users are we talking about at real scale?**
4. **Is it worse to miss a metric or to extract a wrong one?**
5. **Who reviews low-confidence results?**
6. **Are there any security, compliance, or third-party data constraints I should design around?**

That set gives you a strong read on:

- user,
- scale,
- trust,
- workflow,
- and security.

---

## 7. Simple ways to ask them naturally

Use lines like these:

- **Before I lock the design, I want to ask about the user and the workflow. Who is this mainly for?**
- **How internal is this? Would this stay inside Sagard, or could clients ever see the output?**
- **What matters more here: speed, trust, or breadth of metrics?**
- **How many users or documents would this need to support if it became real?**
- **Are there any security or compliance limits that would change the parser choice?**
- **Who would review a low-confidence extraction in practice?**

These make you sound thoughtful, not scripted.
