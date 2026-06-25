# Acceptance Criteria and Test Cases: Vendor Risk Scorecard

This document defines acceptance criteria and concrete test cases aligned with the implementation.

---

## 1. Acceptance criteria (by area)

### 1.1 Data and severity

| ID | Criterion | Pass condition |
|----|-----------|-----------------|
| AC-D1 | Severity is derived from risk score | Low when score &lt; 40; Medium when 40–70; High when &gt; 70. |
| AC-D2 | Vendor has required fields | Each vendor has id, vendorName, category, subCategory, riskScore, riskDetails, severity, lastReviewDate, sla, status. |
| AC-D3 | Audit log entry is immutable | Each action (approve, review_now, escalate) creates one new log entry with timestamp, actor, action, vendorId, vendorName, previousStatus, newStatus; escalate includes details. |

### 1.2 Filters

| ID | Criterion | Pass condition |
|----|-----------|-----------------|
| AC-F1 | Severity filter | User can select All, Low, Medium, or High; table shows only vendors with that severity (or all when All). |
| AC-F2 | Critical tasks only | When enabled, table shows only vendors that are critical (overdue SLA, or escalated, or high severity and pending/in_review). |
| AC-F3 | Show only escalated | When enabled, table shows only vendors with status = escalated. |
| AC-F4 | Filters combine | Severity + critical-only + show-only-escalated can be combined; table reflects intersection. |

### 1.3 Table and display

| ID | Criterion | Pass condition |
|----|-----------|-----------------|
| AC-T1 | All columns visible | Table shows Vendor Name, Category, Sub Category, Risk Score, Risk Details, Severity (badge), Last Review Date, SLA, Actions. |
| AC-T2 | Severity badges | Low = green, Medium = amber, High = red; text "Low" / "Medium" / "High". |
| AC-T3 | Overdue indicator | When lastReviewDate + SLA is in the past, row shows an "Overdue" (or SLA breach) indicator. |
| AC-T4 | Sortable | Default sort by Risk Score descending; user can sort by Risk Score, Last Review Date, Vendor Name (asc/desc). |

### 1.4 Actions

| ID | Criterion | Pass condition |
|----|-----------|-----------------|
| AC-A1 | Approve | For pending_review or in_review, Approve sets status to approved, lastReviewDate to today, and writes audit entry. |
| AC-A2 | High-risk confirm | When risk score &gt; 70 and user clicks Approve, a confirmation modal appears; approval only submitted on Confirm. |
| AC-A3 | Review now | Review now sets status to in_review and writes audit entry. |
| AC-A4 | Escalate | Escalate requires reason 10–500 chars; sets status to escalated, stores reason and timestamp; writes audit entry with details. |
| AC-A5 | Button visibility | pending_review: Approve, Review now, Escalate. in_review: Approve, Escalate. approved: "Reviewed". escalated: "Escalated". |

### 1.5 API

| ID | Criterion | Pass condition |
|----|-----------|-----------------|
| AC-API1 | GET /api/vendors | Returns 200 and array of vendors; optional query severity and criticalOnly filter the list. |
| AC-API2 | GET /api/audit-log | Returns 200 and array of audit entries (newest first); optional vendorId, limit. |
| AC-API3 | POST approve | 404 if vendor missing; 400 if status not allowed; 200 and updated vendor on success; audit log updated. |
| AC-API4 | POST review | 404 if vendor missing; 200 and updated vendor on success; audit log updated. |
| AC-API5 | POST escalate | 404 if vendor missing; 400 if body invalid or reason missing/&lt;10/&gt;500 chars; 200 and updated vendor on success; audit log updated. |

### 1.6 CTAs and export

| ID | Criterion | Pass condition |
|----|-----------|-----------------|
| AC-C1 | Review pending vendors | CTA sets critical-only filter on (and clears show-only-escalated). |
| AC-C2 | View escalated | CTA sets show-only-escalated on. |
| AC-C3 | Export CSV | Exports current table view (filtered/sorted) as CSV. |
| AC-C4 | Audit log page | Separate page shows audit log table; Export CSV exports audit entries. |

### 1.7 Error handling

| ID | Criterion | Pass condition |
|----|-----------|-----------------|
| AC-E1 | API errors surface | Failed approve/review/escalate/fetch show error message in UI (e.g. banner). |
| AC-E2 | Escalate validation | Modal blocks submit when reason empty or &lt; 10 or &gt; 500; server returns 400 with message for same. |
| AC-E3 | Error dismiss | User can dismiss the error banner. |

---

## 2. Test cases

### 2.1 Severity and data (unit / integration)

| TC-ID | Description | Steps | Expected |
|-------|-------------|--------|----------|
| TC-S1 | getSeverity low | Call getSeverity(0), getSeverity(39) | "low" |
| TC-S2 | getSeverity medium | Call getSeverity(40), getSeverity(70) | "medium" |
| TC-S3 | getSeverity high | Call getSeverity(71), getSeverity(100) | "high" |
| TC-S4 | isOverdue true | lastReviewDate 90 days ago, sla "30 days" | true |
| TC-S5 | isOverdue false | lastReviewDate today, sla "90 days" | false |
| TC-S6 | isCritical escalated | status=escalated | true |
| TC-S7 | isCritical high pending | severity=high, status=pending_review | true |
| TC-S8 | isCritical overdue | lastReviewDate + sla &lt; today | true |

### 2.2 API (request/response)

| TC-ID | Description | Steps | Expected |
|-------|-------------|--------|----------|
| TC-API1 | GET vendors no params | GET /api/vendors | 200, array of vendors |
| TC-API2 | GET vendors severity=high | GET /api/vendors?severity=high | 200, only high-severity vendors |
| TC-API3 | GET vendors criticalOnly=true | GET /api/vendors?criticalOnly=true | 200, only critical vendors |
| TC-API4 | POST approve success | POST /api/vendors/{id}/approve for pending_review vendor | 200, vendor status=approved |
| TC-API5 | POST approve 404 | POST /api/vendors/invalid-id/approve | 404, { error: "Vendor not found" } |
| TC-API6 | POST approve 400 | POST approve for vendor already approved | 400, error message |
| TC-API7 | POST escalate no body | POST /api/vendors/{id}/escalate with {} or no escalationReason | 400, "Escalation reason is required" |
| TC-API8 | POST escalate short | Body { escalationReason: "short" } | 400, min 10 characters message |
| TC-API9 | POST escalate long | Body { escalationReason: "x".repeat(501) } | 400, max 500 characters message |
| TC-API10 | POST escalate success | Body { escalationReason: "Valid reason with at least ten characters." } | 200, vendor status=escalated, audit has details |
| TC-API11 | GET audit-log | GET /api/audit-log | 200, array of entries, newest first |

### 2.3 UI / E2E (manual or automated)

| TC-ID | Description | Steps | Expected |
|-------|-------------|--------|----------|
| TC-UI1 | Dashboard loads | Open / | Summary cards and table visible; data loaded |
| TC-UI2 | Severity filter | Select "High" in severity dropdown | Table shows only high-severity vendors |
| TC-UI3 | Critical only | Check "Critical tasks only" | Table shows only critical vendors |
| TC-UI4 | Approve low risk | Click Approve on low/medium risk pending vendor | No modal; status becomes approved; table refreshes |
| TC-UI5 | Approve high risk | Click Approve on high-risk pending vendor | Modal "Confirm approval"; on Confirm, status approved |
| TC-UI6 | Escalate modal | Click Escalate; submit empty | Inline error "Escalation reason is required." |
| TC-UI7 | Escalate submit | Enter 10+ char reason; submit | Modal closes; vendor escalated; table refreshes |
| TC-UI8 | Review now | Click Review now on pending vendor | Status in_review; table refreshes |
| TC-UI9 | Export CSV | Click Export CSV | CSV file downloads with current table data |
| TC-UI10 | Audit log page | Navigate to /audit-log | Audit table visible; entries after actions appear |
| TC-UI11 | Error on failed API | Force API error (e.g. invalid id approve) | Error banner shows message; Dismiss hides it |

### 2.4 Edge cases

| TC-ID | Description | Steps | Expected |
|-------|-------------|--------|----------|
| TC-EDGE1 | Approve already approved | POST approve for status=approved | 400 |
| TC-EDGE2 | Escalate with exactly 10 chars | escalationReason length 10 | 200 |
| TC-EDGE3 | Escalate with exactly 500 chars | escalationReason length 500 | 200 |
| TC-EDGE4 | Invalid JSON on escalate | POST body not JSON | 400, "Invalid JSON body" |
| TC-EDGE5 | Empty table after filter | Set severity to value with no vendors | Table empty (no crash) |

---

## 3. Traceability: acceptance criteria → test cases

| Acceptance criteria | Test cases |
|---------------------|------------|
| AC-D1 | TC-S1, TC-S2, TC-S3 |
| AC-D3 | TC-API4, TC-API10, TC-API11 |
| AC-F1 | TC-API2, TC-UI2 |
| AC-F2 | TC-API3, TC-UI3 |
| AC-F3, AC-F4 | TC-UI3 (and filter combo in UI) |
| AC-T2 | TC-S1–S3, TC-UI1 |
| AC-T3 | TC-S4, TC-S5, TC-UI1 |
| AC-A1, AC-A2 | TC-API4, TC-API5, TC-API6, TC-UI4, TC-UI5 |
| AC-A3 | TC-UI8 |
| AC-A4 | TC-API7–10, TC-UI6, TC-UI7 |
| AC-A5 | TC-UI1, TC-UI4, TC-UI5, TC-UI7, TC-UI8 |
| AC-API* | TC-API1–11 |
| AC-C1–C4 | TC-UI9, TC-UI10, and CTA clicks |
| AC-E1–E3 | TC-UI11, TC-API5–9 |

---

## 4. How to run / automate

- **Severity and critical-tasks (TC-S*):** Unit tests against `lib/severity.ts` and `lib/critical-tasks.ts`.
- **API (TC-API*):** Integration tests against route handlers (e.g. Jest + Next.js route mocks, or supertest against local server).
- **UI (TC-UI*):** Manual or Playwright/Cypress; ensure dev server and seed data are loaded.
- **Edge (TC-EDGE*):** Same as API/UI depending on scenario.

A future step is to add a test suite (e.g. Jest + React Testing Library for components, Jest for lib and API) and map these TC-IDs to `describe`/`it` blocks.
