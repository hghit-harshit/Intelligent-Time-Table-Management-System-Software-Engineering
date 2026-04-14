# Taiga Backlog Items (DISHA Project)

## 1. Backend: Restore and standardize reschedule request APIs
- Type: User Story
- Priority: High
- Estimate: 5 points
- Description: Consolidate request APIs so backend is the source of truth for faculty/admin request workflows.
- Files:
  - backend/server.js
  - backend/routes/rescheduleRoutes.js
  - backend/controllers/rescheduleController.js
  - backend/models/Request.js
- Acceptance Criteria:
  - GET/POST/PATCH request endpoints are exposed from one route entrypoint.
  - Approve/reject updates status, reviewedBy, reviewedAt correctly.
  - API responses are consistent across success/error cases.

## 2. Frontend: Migrate request workflow from localStorage to backend
- Type: User Story
- Priority: High
- Estimate: 8 points
- Description: Replace browser-local request persistence with real API calls for faculty and admin pages.
- Files:
  - frontend/src/data/rescheduleStore.js
  - frontend/src/pages/faculty/pages/RescheduleRequests.jsx
  - frontend/src/pages/admin/services/adminApi.js
  - frontend/src/pages/admin/pages/RescheduleRequests.jsx
- Acceptance Criteria:
  - Faculty request submission creates DB-backed records via backend API.
  - Admin approvals/rejections persist and remain after refresh.
  - localStorage store is removed or only used as explicit fallback behind a feature flag.

## 3. Auth: Implement login with JWT and role guards
- Type: User Story
- Priority: High
- Estimate: 13 points
- Description: Add real authentication and route protection for student/faculty/admin.
- Files:
  - frontend/src/pages/LoginPage.jsx
  - frontend/src/App.jsx
  - backend/server.js
- Acceptance Criteria:
  - Login validates user credentials and returns JWT/session token.
  - Protected routes reject unauthenticated users.
  - Role-restricted endpoints return 403 for invalid role.

## 4. Data Model Alignment: Normalize slot field naming across stack
- Type: Technical Debt
- Priority: High
- Estimate: 5 points
- Description: Resolve mismatch between Slot schema fields and controller query fields to prevent silent logic bugs.
- Files:
  - backend/models/Slot.js
  - backend/controllers/slotController.js
  - backend/routes/slotRoutes.js
- Acceptance Criteria:
  - One canonical slot schema is used end-to-end.
  - Conflict detection works on persisted slot data.
  - CRUD endpoints pass regression tests for create/update/conflict paths.

## 5. Admin Module: Replace mock API paths with real endpoints incrementally
- Type: Epic
- Priority: Medium
- Estimate: 21 points
- Description: Move admin pages from mock data service to backend APIs in phases.
- Files:
  - frontend/src/pages/admin/services/adminApi.js
  - frontend/src/data/adminMockData.js
  - frontend/src/pages/admin/pages/AdminDashboard.jsx
- Acceptance Criteria:
  - Dashboard metrics and request counts come from backend.
  - At least Courses, Faculty, and Rooms pages consume real data.
  - Mock data remains only for explicitly unfinished modules.

## 6. Validation: Add request/slot payload validation middleware
- Type: Technical Debt
- Priority: High
- Estimate: 5 points
- Description: Introduce schema-based validation for all POST/PUT/PATCH APIs.
- Files:
  - backend/server.js
  - backend/controllers/slotController.js
  - backend/controllers/rescheduleController.js
- Acceptance Criteria:
  - Invalid payloads return 400 with human-readable field errors.
  - Time format and overlap logic are validated server-side.
  - Controllers are simplified by moving validation out of business logic.

## 7. Error Handling: Global API error strategy and request logging
- Type: Technical Debt
- Priority: Medium
- Estimate: 5 points
- Description: Standardize backend error responses and add structured request logs.
- Files:
  - backend/server.js
  - backend/controllers/slotController.js
  - backend/controllers/rescheduleController.js
- Acceptance Criteria:
  - All endpoints return consistent error envelope.
  - Uncaught exceptions are handled by central middleware.
  - Request logs include method, route, status, and latency.

## 8. Config & Secrets: Environment hardening and secret cleanup
- Type: Security
- Priority: High
- Estimate: 8 points
- Description: Move hardcoded URLs and OAuth details to environment configuration and secure secret handling.
- Files:
  - google-classroom-service/server.js
  - frontend/src/services/classroomApi.js
  - backend/.env.example
- Acceptance Criteria:
  - Frontend API base URLs come from environment variables.
  - OAuth redirect/origin values are environment-driven.
  - Secret files are excluded from repo policy and documented.

## 9. Google Classroom: Stabilize auth/session UX and failure states
- Type: User Story
- Priority: Medium
- Estimate: 5 points
- Description: Improve classroom integration reliability with robust auth-state handling in UI and service.
- Files:
  - frontend/src/pages/student/pages/GoogleClassroom.jsx
  - frontend/src/services/classroomApi.js
  - google-classroom-service/server.js
- Acceptance Criteria:
  - Auth success/failure state is clearly shown to user.
  - Expired token flow recovers gracefully with re-auth prompt.
  - Assignment fetch errors show actionable messages.

## 10. Quality Gate: Add test suite for critical scheduling flows
- Type: Technical Debt
- Priority: High
- Estimate: 13 points
- Description: Create automated tests for slot conflict logic, request lifecycle, and key UI pages.
- Files:
  - backend/controllers/slotController.js
  - backend/controllers/rescheduleController.js
  - frontend/src/pages/faculty/pages/RescheduleRequests.jsx
  - frontend/src/pages/admin/pages/RescheduleRequests.jsx
- Acceptance Criteria:
  - Backend tests cover slot create/update/delete and overlap conflict scenarios.
  - Backend tests cover request create/approve/reject lifecycle.
  - Frontend tests cover faculty submission and admin status update rendering.
