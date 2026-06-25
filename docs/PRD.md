# Product Requirements Document: Vendor Risk Scorecard

## 1. Product overview

| Item | Description |
|------|-------------|
| **Product name** | Vendor Risk Scorecard |
| **Version** | 1.0 |
| **Audience** | Compliance analysts and reviewers |
| **Stack** | Next.js (App Router), TypeScript, Tailwind CSS |

### 1.1 Purpose

A single dashboard for the compliance team to:

- View vendor risk, review status, SLA, and risk details in one place
- Take human-in-the-loop actions: **Approve**, **Review now**, **Escalate**
- Filter by severity and critical tasks (overdue, escalated, high-risk pending)
- Track all actions in an audit log for traceability

### 1.2 Goals

- **Visibility:** Clear risk bands (low &lt; 40, medium 40–70, high &gt; 70) and severity badges
- **Workflow:** Consistent review flow with explicit statuses (pending_review → in_review → approved, or escalated)
- **SLA:** Surface last review date and SLA; highlight overdue items
- **Accountability:** Audit log for every state-changing action

---

## 2. Outline (product structure)

### 2.1 High-level outline

```
Vendor Risk Scorecard
├── Dashboard (main)
│   ├── Summary cards (totals, by severity, pending, escalated)
│   ├── Filters (severity, critical tasks only, show only escalated)
│   ├── Vendor table (sortable, badges, actions)
│   └── CTAs (Review pending, View escalated, Export CSV)
├── Row actions
│   ├── Approve (with high-risk confirmation when score > 70)
│   ├── Review now
│   └── Escalate (reason required, 10–500 chars)
└── Audit log (separate page)
    ├── Read-only table of actions
    └── Export audit log CSV
```

### 2.2 Data outline

- **Vendor:** id, vendorName, category, subCategory, riskScore, riskDetails, severity, lastReviewDate, sla, status; optional reviewedBy, escalationReason, escalatedAt, escalatedBy
- **Audit log entry:** id, timestamp, actor, action, vendorId, vendorName, previousStatus, newStatus, details (optional)

### 2.3 API outline

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/vendors` | List vendors (optional: severity, criticalOnly) |
| GET | `/api/audit-log` | List audit entries (optional: vendorId, limit) |
| POST | `/api/vendors/[id]/approve` | Approve vendor |
| POST | `/api/vendors/[id]/review` | Set status to in_review |
| POST | `/api/vendors/[id]/escalate` | Escalate with reason (body: escalationReason) |

### 2.4 User flows (outline)

1. **View and filter:** Land on dashboard → see summary and table → set severity and/or critical/escalated filters → table updates
2. **Approve:** Click Approve → (if high risk) confirm in modal → API updates status → table and summary refresh
3. **Review now:** Click Review now → API sets in_review → refresh
4. **Escalate:** Click Escalate → enter reason in modal (validated) → API updates status and stores reason → refresh
5. **Audit:** Navigate to Audit log → view/export entries

---

## 3. Functional requirements

### 3.1 Severity rules

- **Low:** risk score &lt; 40 (0–39)
- **Medium:** risk score 40–70 (inclusive)
- **High:** risk score &gt; 70 (71–100)

Severity is derived from risk score and displayed as colored badges (green / amber / red).

### 3.2 Critical tasks

A vendor is “critical” if any of:

- **Overdue SLA:** lastReviewDate + SLA period &lt; today
- **Escalated:** status = escalated
- **High risk and pending:** severity = high AND status in (pending_review, in_review)

### 3.3 Filters

- **Severity:** All | Low | Medium | High (single select)
- **Critical tasks only:** When on, show only vendors that are critical
- **Show only escalated:** When on, show only vendors with status = escalated

### 3.4 Actions and business rules

- **Approve:** Allowed only when status is `pending_review` or `in_review`. Sets status to `approved`, lastReviewDate to today, reviewedBy to actor. If risk score &gt; 70, user must confirm in a modal before submitting.
- **Review now:** Sets status to `in_review`. No status precondition beyond vendor exists.
- **Escalate:** Requires body `{ escalationReason }` with length 10–500. Sets status to `escalated`, stores reason, escalatedAt, escalatedBy. One audit log entry with details = reason.

### 3.5 Audit log

- One immutable entry per state-changing action (approve, review_now, escalate)
- Fields: id, timestamp, actor, action, vendorId, vendorName, previousStatus, newStatus, details (for escalate)
- Read-only in UI; optional export to CSV

---

## 4. Non-functional requirements

- **Performance:** Dashboard loads vendor list and applies filters client-side; table supports sort without full reload
- **Usability:** Clear labels, error messages on failed API calls, dismissible error banner
- **Maintainability:** Typed (TypeScript), shared types and schemas (see docs/schemas)
- **Traceability:** All approve/review/escalate actions recorded in audit log

---

## 5. Out of scope (v1)

- Real authentication (actor is placeholder)
- Database persistence (in-memory store)
- Vendor detail page (`/vendor/[id]`)
- Bulk approve
- Role-based permissions

---

## 6. References

- [SPEC.md](../SPEC.md) – Detailed specification
- [docs/schemas/](schemas/) – JSON schemas for Vendor and API
- [TRADEOFFS.md](TRADEOFFS.md) – Design tradeoffs
- [EXCEPTION_HANDLING.md](EXCEPTION_HANDLING.md) – Error handling logic
- [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) – Acceptance criteria and test cases
