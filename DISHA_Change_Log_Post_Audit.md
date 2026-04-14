# DISHA Post-Audit Changes (Short Summary)

Date: 15 April 2026

## 1) Backend Security and API Hardening

- Enforced auth middleware on all `/api/*` routes (public ping remains open).
- Replaced no-op auth with real bearer token validation.
- Added support for:
  - static token via `API_AUTH_TOKEN`
  - signed, expiring token verification via token utility.
- Updated backend runbook/commands with auth header usage and troubleshooting.

## 2) Frontend Architecture and Service Layer

- Shifted major UI structure toward shared + feature organization (`shared`, `features`, `stores`).
- Introduced/expanded feature barrels for admin, faculty, and student modules.
- Moved direct TimeSlots API logic into feature service layer.
- Added shared auth header interceptor usage for protected API calls.

## 3) Frontend Runtime and Performance

- Login flow now stores role + auth token for local/dev protected API access.
- Scheduler + slots calls now send Authorization headers.
- Added route-level lazy loading in app router to reduce initial bundle size.

## 4) Documentation Sync

- Updated `DISHA_Audit_Report.md` with implementation progress addendum.
- Clarified that baseline violation tables are historical and require full re-audit refresh.

## 5) Build/Validation Status

- Frontend production build: passing.
- Backend TypeScript build: passing.
- Runtime auth behavior verified: unauthorized without token, success with valid bearer token.
