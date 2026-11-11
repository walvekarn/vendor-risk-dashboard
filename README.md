Status: Deployed demo, mock data

# Vendor Risk Scorecard Dashboard

A prototype dashboard for compliance teams to see vendor risk, review status and SLA, and take human-in-the-loop actions (approve, review now, escalate) on each vendor. It runs on in-memory mock data.

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS. Runs on local mock data. Deploys to Vercel with no extra configuration.

## Project Management View

- **Business problem:** Vendor risk sits in scattered spreadsheets with no consistent review workflow or decision record.
- **User:** Compliance analysts and reviewers.
- **Scope:** In: risk scorecard, severity bands, critical-task filters, approve, review now and escalate actions, audit log page, CSV export. Out (v1, per `docs/PRD.md`): real authentication, database, vendor detail page, bulk approve, role-based permissions.
- **Key requirements and decisions:** Severity bands: low under 40, medium 40 to 70, high over 70. Approving a high-risk vendor needs a confirmation step, not a hard block. Escalation needs a 10 to 500 character reason. The audit log is append-only. Rationale is in `docs/TRADEOFFS.md`.
- **Acceptance criteria:** `docs/ACCEPTANCE_CRITERIA.md`, with test cases for severity rules, API responses and UI flows.
- **What is and is not tested:** Test cases are written as documents. There is no automated test suite in this repo.
- **Known limitations:** In-memory store resets on restart. The actor is a placeholder. Filtering runs client-side on 8 seed vendors.
- **What production would need:** A database, real authentication and approval permissions, server-side filtering and pagination, and automated tests for the documented cases.

## Problem

Vendor risk lives in scattered spreadsheets with no consistent review workflow or SLA tracking. This scorecard gives the compliance team one view of risk and a repeatable review process with an audit log.

## Features

- **Risk scorecard:** vendors with a 0 to 100 risk score, category, sub-category and severity badge
- **Review workflow:** per-vendor status, last review date, SLA and an overdue flag
- **Actions:** approve, review now or escalate, with human-in-the-loop decisions
- **Filters and sorting:** severity filter, "critical tasks only" and "show only escalated" toggles; sort by risk score or last review date
- **Audit log:** one append-only entry for each approve, review or escalate action, with CSV export

## Product artifacts

- `SPEC.md`: detailed specification (data model, columns, workflow, actions)
- `docs/`: PRD, acceptance criteria, tradeoffs, exception handling and JSON schemas

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Deploy

Import the repo at [vercel.com](https://vercel.com) → Deploy. Next.js is auto-detected; no environment variables required.

---
Built by [Nikita Walvekar](https://www.linkedin.com/in/nikitaw3) · part of a vendor & compliance operations prototype suite.
