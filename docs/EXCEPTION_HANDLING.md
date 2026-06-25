# Exception Handling Logic: Vendor Risk Scorecard

This document describes how errors and edge cases are handled across the app and API.

---

## 1. API layer

### 1.1 GET /api/vendors

| Scenario | Handling |
|----------|----------|
| Success | Return 200 with JSON array of vendors (possibly empty). |
| Invalid query params | `severity` not in [low, medium, high] → ignored; list unfiltered by severity. `criticalOnly` not exactly `"true"` → treated as false. |
| Store/throw | No explicit try/catch in route; uncaught errors surface as 500 by Next.js. |

**Response:** `200` + `Vendor[]`. No 4xx for bad query params; invalid values are ignored.

---

### 1.2 GET /api/audit-log

| Scenario | Handling |
|----------|----------|
| Success | Return 200 with JSON array of audit entries (newest first). |
| Query params | `vendorId` – filter by vendor. `limit` – parsed with `parseInt(limitParam, 10)`; if NaN or missing, `limit` is undefined and all matching entries returned. |
| Store/throw | No explicit try/catch; uncaught errors → 500. |

**Response:** `200` + `AuditLogEntry[]`.

---

### 1.3 POST /api/vendors/[id]/approve

| Scenario | Handling | HTTP | Body |
|----------|----------|------|------|
| Vendor not found | `getVendorById(id)` returns undefined | 404 | `{ error: "Vendor not found" }` |
| Invalid status | status not `pending_review` or `in_review` | 400 | `{ error: "Vendor is not in a state that can be approved" }` |
| Update fails | `updateVendorStatus` returns null (e.g. id missing from list) | 500 | `{ error: "Update failed" }` |
| Success | Vendor updated; audit log appended | 200 | Updated `Vendor` object |

**No body required.** Audit log is written only after successful update.

---

### 1.4 POST /api/vendors/[id]/review

| Scenario | Handling | HTTP | Body |
|----------|----------|------|------|
| Vendor not found | `getVendorById(id)` returns undefined | 404 | `{ error: "Vendor not found" }` |
| Update fails | `updateVendorStatus` returns null | 500 | `{ error: "Update failed" }` |
| Success | Status set to `in_review`; audit log appended | 200 | Updated `Vendor` object |

**No body required.**

---

### 1.5 POST /api/vendors/[id]/escalate

| Scenario | Handling | HTTP | Body |
|----------|----------|------|------|
| Vendor not found | `getVendorById(id)` returns undefined | 404 | `{ error: "Vendor not found" }` |
| Invalid JSON body | `request.json()` throws | 400 | `{ error: "Invalid JSON body" }` |
| Missing reason | `escalationReason` missing or empty after trim | 400 | `{ error: "Escalation reason is required" }` |
| Too short | Length &lt; 10 (after trim) | 400 | `{ error: "Escalation reason must be at least 10 characters" }` |
| Too long | Length &gt; 500 | 400 | `{ error: "Escalation reason must be at most 500 characters" }` |
| Update fails | `updateVendorStatus` returns null | 500 | `{ error: "Update failed" }` |
| Success | Status set to `escalated`; reason and timestamps stored; audit log appended | 200 | Updated `Vendor` object |

**Required body:** `{ "escalationReason": "string" }` (10–500 characters after trim).

---

## 2. Client (dashboard) layer

### 2.1 Fetch vendors (initial load and refetch)

| Scenario | Handling |
|----------|----------|
| `fetch` succeeds, `res.ok` | Set vendors from JSON; clear error; set loading false. |
| `fetch` fails or `!res.ok` | Set error to `data.error` if JSON body has `error`, else generic "Failed to fetch vendors" or "Failed to load vendors"; set loading false. |
| Network/parse error | Catch in try/catch; set error to `e.message` or "Failed to load vendors". |

**UI:** Error banner at top with message and Dismiss. Success clears error on next successful refetch (e.g. after approve/review/escalate).

---

### 2.2 Approve flow

| Scenario | Handling |
|----------|----------|
| Risk score ≤ 70 | Call approve API directly (no modal). |
| Risk score > 70 | Open confirm modal; on Confirm, call approve API. |
| API success | Close modal if open; refetch vendors; clear error. |
| API error | Set error from `data.error` or "Approve failed"; leave modal open for high-risk confirm so user can retry or cancel. |

---

### 2.3 Review now flow

| Scenario | Handling |
|----------|----------|
| API success | Refetch vendors; clear error. |
| API error | Set error from `data.error` or "Review now failed". |

---

### 2.4 Escalate flow

| Scenario | Handling |
|----------|----------|
| Modal submit | Client validates: required, min 10, max 500 chars. If invalid, show inline error in modal; do not call API. |
| API success | Close modal; refetch vendors; clear error. |
| API error | Set error from `data.error` or "Escalate failed"; modal can be closed by user (reason preserved in state until close). |

---

### 2.5 Escalate modal (client validation)

| Check | Message |
|-------|---------|
| Empty or whitespace only | "Escalation reason is required." |
| Length &lt; 10 | "Please enter at least 10 characters." |
| Length &gt; 500 | "Please enter at most 500 characters." |

Validation runs on submit; error cleared when user edits. Server enforces same rules and returns 400 with a consistent `error` message.

---

## 3. Data and business rules

### 3.1 Severity derivation

- **Input:** `riskScore` (number). Not validated at API for vendor list (assumed 0–100 from seed/upstream).
- **Rule:** low &lt; 40, medium 40–70, high &gt; 70. Implemented in `getSeverity()`; used when building seed data and when displaying badges. No exception for out-of-range scores; they still map to low/medium/high by the same thresholds.

### 3.2 SLA and overdue

- **Input:** `lastReviewDate` (string), `sla` (string). `lastReviewDate` parsed with `new Date(lastReviewDate)`; invalid date → `isOverdue` returns false (no throw).
- **SLA parsing:** "Annual" → 365 days; "N days" / "N day" → N; leading number only → that number; else default 365. No exception thrown for unknown SLA format.

### 3.3 Critical tasks

- Uses `isOverdue`, `status === 'escalated'`, and `severity === 'high' && (status === 'pending_review' \|\| status === 'in_review')`. No explicit exception handling; relies on vendor object shape from API.

---

## 4. Unhandled or edge cases

| Case | Current behavior | Recommendation |
|------|------------------|----------------|
| Audit log GET with `limit=abc` | `parseInt` returns NaN; `limit` undefined; all entries returned | Optional: validate limit and return 400 if invalid. |
| Concurrent approve/review/escalate on same vendor | Last write wins; audit log has multiple entries | Acceptable for v1; DB + transactions would enforce ordering if needed. |
| Empty vendor list | Table and summary show empty; no special message | Optional: empty state copy. |
| Very long vendor name / risk details | Rendered in table; truncation via CSS (e.g. truncate) | No exception; display-only. |

---

## 5. Summary

- **API:** 404 for missing vendor; 400 for bad request (invalid status, invalid/missing escalation reason); 500 for update failure or uncaught error. All errors return JSON `{ error: "message" }`.
- **Client:** One global error state; message from API when available; clear on success. Escalate modal has its own validation before calling API.
- **Data:** Severity and SLA logic avoid throws; invalid dates or SLA strings fall back to safe behavior (e.g. not overdue, default 365 days).
