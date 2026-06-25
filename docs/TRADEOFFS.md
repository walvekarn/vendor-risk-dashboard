# Tradeoffs: Vendor Risk Scorecard

This document records deliberate design tradeoffs for the product and implementation.

---

## 1. Persistence: in-memory vs database

| Choice | In-memory store (current) |
|--------|----------------------------|
| **Pros** | No infra; fast to build and run; easy to test; types and API match future DB shape |
| **Cons** | Data lost on restart; not multi-instance; no durability |
| **Rationale** | v1 targets single-user / demo and compliance workflow validation. DB (e.g. Supabase/Postgres) can replace the store layer later with minimal API change. |

**Tradeoff:** We accepted loss of durability and multi-process support in v1 in exchange for speed of delivery and a clear path to persistence.

---

## 2. Authentication: none vs real auth

| Choice | Placeholder actor (no real auth) |
|--------|-----------------------------------|
| **Pros** | No auth setup; simple deployment; audit log still has a consistent “actor” field |
| **Cons** | No user identity; cannot enforce “who can approve”; not production-ready for multi-user |
| **Rationale** | Enables compliance workflow and audit log design without auth complexity. Real auth (e.g. NextAuth, Supabase Auth) can plug in later; actor would come from session. |

**Tradeoff:** We deferred real authentication to keep v1 focused on workflow and audit semantics.

---

## 3. Filtering: client-side vs server-side

| Choice | Full list fetched; severity/critical/escalated filters applied client-side |
|--------|-----------------------------------------------------------------------------|
| **Pros** | Single fetch; instant filter changes; summary counts always from full list; no pagination needed at current scale |
| **Cons** | All vendors loaded at once; does not scale to very large lists |
| **Rationale** | Seed data is small (e.g. 8 vendors). When moving to DB, we can add server-side filtering and pagination without changing UI contract (same filters, same response shape). |

**Tradeoff:** We preferred simplicity and snappy UX at small scale over early server-side filtering.

---

## 4. High-risk approve: confirmation modal vs block

| Choice | Allow approve for high risk (score > 70) after explicit confirmation in a modal |
|--------|-------------------------------------------------------------------------------|
| **Pros** | Human remains in control; high risk is visible; no hard block for edge cases |
| **Cons** | One extra click for high-risk approvals |
| **Rationale** | Spec requires “do not auto-approve when risk score > 70 without confirmation.” A modal satisfies this while keeping the action available. |

**Tradeoff:** We chose a soft gate (confirmation) over a hard block to preserve flexibility for the compliance user.

---

## 5. Escalation reason: required vs optional

| Choice | Escalation reason required, 10–500 characters (client and server) |
|--------|-------------------------------------------------------------------|
| **Pros** | Audit trail is meaningful; reduces “empty” escalations; aligns with compliance expectations |
| **Cons** | Slightly more friction; need to handle validation errors in UI and API |
| **Rationale** | Escalations are material events; a short explanation is necessary for traceability. |

**Tradeoff:** We accepted extra validation and UX for better audit quality.

---

## 6. Audit log: append-only vs editable

| Choice | Append-only; no delete or edit in UI |
|--------|--------------------------------------|
| **Pros** | Integrity for compliance; simple implementation; no “undo” ambiguity |
| **Cons** | Cannot correct mistaken entries in-app (would require backend/admin) |
| **Rationale** | Compliance and spec require a reliable history. Edits would complicate retention and reporting. |

**Tradeoff:** We prioritized audit integrity over in-app correction.

---

## 7. Error feedback: banner vs toasts

| Choice | Inline error banner at top of dashboard with dismiss |
|--------|------------------------------------------------------|
| **Pros** | Single, visible place for errors; no dependency on a toast library |
| **Cons** | Single global message; overlapping actions can overwrite message |
| **Rationale** | v1 has a small surface; one error at a time is acceptable. Toasts or per-action messages can be added later. |

**Tradeoff:** We chose simplicity over granular per-action error display for v1.

---

## 8. Export: CSV only vs Excel/PDF

| Choice | CSV export for table and audit log |
|--------|------------------------------------|
| **Pros** | No extra dependencies; works everywhere; good for compliance and analysis in spreadsheets |
| **Cons** | No formatting or multi-sheet; not ideal for formal reports |
| **Rationale** | CSV meets “export current view” and “export audit log” needs with minimal complexity. |

**Tradeoff:** We deferred Excel/PDF in favor of a simple, universal export.

---

## Summary table

| Area | Decision | Main trade |
|------|----------|------------|
| Persistence | In-memory | Speed/simplicity vs durability |
| Auth | Placeholder actor | Focus on workflow vs multi-user security |
| Filtering | Client-side | UX and simplicity vs scale |
| High-risk approve | Confirm modal | Flexibility vs strictness |
| Escalation reason | Required, 10–500 chars | Audit quality vs friction |
| Audit log | Append-only | Integrity vs editability |
| Errors | Single banner | Simplicity vs granularity |
| Export | CSV | Universality vs formatted reports |
