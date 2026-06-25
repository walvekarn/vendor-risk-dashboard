# Vendor Risk Scorecard Dashboard

A single dashboard for compliance teams to see vendor risk, review status, and SLA — and take human-in-the-loop actions (approve / review now / escalate) on each vendor.

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS. Runs on local mock data — deploys to Vercel with zero configuration.

## Problem

Vendor risk lives in scattered spreadsheets with no consistent review workflow or SLA tracking. This scorecard gives the compliance team clear risk visibility and a repeatable, auditable review process.

## Features

- **Risk scorecard** — vendors ranked by 0–100 risk score, with category and sub-category
- **Review workflow** — per-vendor status, SLA tracking, and reviewer assignment
- **Actions** — approve, review now, or escalate, with human-in-the-loop decisions
- **Filters & sorting** — by category, risk band, review status, and SLA breach
- **Audit-ready** — consistent decision records for every vendor

## Product artifacts

- `SPEC.md` — detailed specification (data model, columns, workflow, actions)
- `docs/` — supporting product documentation

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
