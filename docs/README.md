# Vendor Risk Scorecard – Documentation

Documentation for the Vendor Risk Scorecard (compliance team dashboard).

## Contents

| Document | Description |
|----------|-------------|
| [PRD.md](PRD.md) | **Product Requirements Document** – overview, outline, functional and non-functional requirements |
| [TRADEOFFS.md](TRADEOFFS.md) | **Tradeoffs** – design decisions (persistence, auth, filtering, high-risk approve, escalation, audit log, errors, export) |
| [EXCEPTION_HANDLING.md](EXCEPTION_HANDLING.md) | **Exception handling** – API and client error handling, validation, edge cases |
| [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) | **Acceptance criteria and test cases** – pass conditions and concrete test cases (unit, API, UI, edge) |
| [schemas/](schemas/) | **JSON Schema** – Vendor, AuditLogEntry, and API request/response shapes |

## Root spec

- [SPEC.md](../SPEC.md) – Detailed product and technical specification (severity rules, filters, user flows, audit log, validations).

## Quick links

- Severity rules: low &lt; 40, medium 40–70, high &gt; 70 (see [SPEC.md](../SPEC.md) §2.2, [PRD.md](PRD.md) §3.1).
- API errors: 404 (not found), 400 (bad request), 500 (server error); body `{ "error": "message" }` (see [EXCEPTION_HANDLING.md](EXCEPTION_HANDLING.md)).
- Test case IDs: TC-S* (severity/critical), TC-API* (API), TC-UI* (UI), TC-EDGE* (edge cases) (see [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md)).
