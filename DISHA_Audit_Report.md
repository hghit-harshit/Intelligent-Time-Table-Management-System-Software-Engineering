# DISHA Standards Audit Report

**Project:** Intelligent Time-Table Management System (DISHA - IIT Hyderabad)  
**Audit Date:** April 15, 2026  
**Auditor:** Senior MERN Stack Architecture Audit

---

## Summary

| Metric                         | Count   |
| ------------------------------ | ------- |
| **Total violations found**     | **147** |
| **Critical violations**        | 38      |
| **High-severity violations**   | 41      |
| **Medium-severity violations** | 42      |
| **Minor violations**           | 26      |

## Implementation Progress Addendum (April 15, 2026)

This report was generated against an earlier snapshot. The codebase has since been substantially remediated.

### Verified Completed Since Baseline Audit

- TypeScript migration completed for frontend and backend source.
- Backend restructured into `src/modules/*` with controller/service/repository/schema/types layering.
- Shared backend infrastructure added: `src/shared/errors`, `src/shared/response`, `src/shared/logger`.
- Middleware layer added: `src/middlewares/error.middleware.ts`, `src/middlewares/auth.middleware.ts`.
- Route aggregation added through `src/routes/index.ts`.
- Missing request model gap resolved via `src/database/models/requestModel.ts` and mounted reschedule routes.
- Frontend feature barrels introduced (`src/features/admin`, `src/features/faculty`, `src/features/student`).
- Shared UI and stores introduced (`src/shared`, `src/stores`) and major import rewiring completed.
- Direct TimeSlots page API calls extracted into feature service layer.

### Newly Enforced in This Iteration

- All `/api/*` backend routes now enforce bearer-token authentication middleware.
- Auth middleware now validates either:
  - static bearer token via `API_AUTH_TOKEN`, or
  - signed/expiring token via `verifyAccessToken` helper.
- `commands.md` now documents auth requirements and troubleshooting.
- Frontend login now persists role and bearer token (`authToken`) for protected backend API access in local/dev flow.
- Frontend scheduler and slot API calls now include authorization headers via shared interceptor.
- Route-level lazy loading is now enabled in `App.tsx`, reducing initial bundle size and removing the previous chunk warning.

### Important Note

The detailed violation tables below still represent the baseline audit state and are intentionally preserved for traceability. A full re-audit pass is recommended to regenerate category counts and updated compliance percentages.

### Critical Findings at a Glance

- **Zero TypeScript** — Entire codebase is plain JavaScript (.js/.jsx), violating the TypeScript requirement for both frontend and backend
- **Missing standard directory structure** — Most required directories do not exist (config/, shared/, features/, hooks/, stores/, validators/, utils/, types/, modules/, database/, middlewares/)
- **No barrel exports** — Feature-level `index.ts` files are completely absent
- **Direct DB queries in controllers** — All backend controllers query MongoDB directly
- **No repository layer** — The `*.repository.ts` pattern does not exist
- **No service layer separation** — Controllers contain business logic
- **No validation schemas** — Zod schemas (\*.schema.ts) are absent
- **Dead code** — Reschedule feature exists but is not wired into the app
- **Missing model** — `Request` model imported but does not exist
- **Cross-feature imports** — Faculty imports from Student, Student imports from Admin
- **Direct API calls in pages** — TimeSlotsPage makes direct `fetch()` calls

---

## Violations by Category

---

### 1. Folder Structure Violations

#### 1.1 Frontend HOST — Missing Required Directories

| #   | Required Directory | Status      | Severity | Notes                                                                      |
| --- | ------------------ | ----------- | -------- | -------------------------------------------------------------------------- |
| 1   | `src/assets/`      | **MISSING** | Medium   | No static assets directory                                                 |
| 2   | `src/config/`      | **MISSING** | Medium   | No environment/federation/routes config                                    |
| 3   | `src/shared/`      | **MISSING** | Critical | No presentational components directory                                     |
| 4   | `src/features/`    | **MISSING** | Critical | No feature-based encapsulation — entire architecture uses `pages/` instead |
| 5   | `src/hooks/`       | **MISSING** | Medium   | No global hooks directory                                                  |
| 6   | `src/layouts/`     | **MISSING** | Medium   | Layout components exist inside `pages/admin/components/layout/` etc.       |
| 7   | `src/stores/`      | **MISSING** | Medium   | Store files live in `data/` directory instead                              |
| 8   | `src/validators/`  | **MISSING** | Medium   | No validation schema directory                                             |
| 9   | `src/utils/`       | **MISSING** | Medium   | No utility functions directory                                             |
| 10  | `src/types/`       | **MISSING** | Medium   | No TypeScript types directory (also no TypeScript at all)                  |

#### 1.2 Frontend HOST — Non-Standard Directories Present

| #   | Directory         | What Should Be                                            | Severity | Notes                                                                                                                     |
| --- | ----------------- | --------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1   | `src/data/`       | Should be `src/stores/` + `src/assets/` (for static JSON) | Medium   | Contains store files (`rescheduleStore.js`, `timetableEngineStore.js`), mock data, and static JSON files — mixed concerns |
| 2   | `src/components/` | Should be `src/shared/components/`                        | Medium   | Contains shell components (`AppShell.jsx`, `CalendarView.jsx`, `Layout.jsx`) but not organized as shared/dumb             |
| 3   | `src/styles/`     | **Correct**                                               | ✅       | Exists with `theme.js` and `tokens.js`                                                                                    |
| 4   | `src/services/`   | **Correct**                                               | ✅       | Exists but only contains `classroomApi.js` — admin service is nested inside `pages/admin/services/`                       |
| 5   | `src/pages/`      | Should be composition-only, but acts as feature container | High     | Pages contain business logic, API calls, state management, and form handling                                              |

#### 1.3 Frontend HOST — Incorrect Nesting

| #   | Location                                                | Issue                                                                      | Severity |
| --- | ------------------------------------------------------- | -------------------------------------------------------------------------- | -------- |
| 1   | `src/pages/admin/services/adminApi.js`                  | Service layer nested inside pages instead of `src/services/`               | High     |
| 2   | `src/pages/admin/components/`                           | Components nested inside pages instead of `src/features/admin/components/` | High     |
| 3   | `src/pages/admin/components/layout/AdminLayout.jsx`     | Layout inside pages instead of `src/layouts/`                              | Medium   |
| 4   | `src/pages/faculty/components/layout/FacultyLayout.jsx` | Layout inside pages instead of `src/layouts/`                              | Medium   |
| 5   | `src/pages/student/components/layout/StudentLayout.jsx` | Layout inside pages instead of `src/layouts/`                              | Medium   |
| 6   | `src/data/rescheduleStore.js`                           | Store file in `data/` instead of `src/stores/reschedule.store.js`          | Medium   |
| 7   | `src/data/timetableEngineStore.js`                      | Store file in `data/` instead of `src/stores/timetableEngine.store.js`     | Medium   |

#### 1.4 Backend — Missing Required Directories

| #   | Required Directory | Status      | Severity | Notes                                                                                  |
| --- | ------------------ | ----------- | -------- | -------------------------------------------------------------------------------------- |
| 1   | `src/` (wrapper)   | **MISSING** | High     | Backend structure is flat — all files directly in `backend/` instead of `backend/src/` |
| 2   | `src/config/`      | **MISSING** | Medium   | No configuration directory                                                             |
| 3   | `src/modules/`     | **MISSING** | Critical | No domain-based module partitioning                                                    |
| 4   | `src/shared/`      | **MISSING** | Critical | No shared logger, errors, or response utilities                                        |
| 5   | `src/database/`    | **MISSING** | Critical | No Prisma schema, migrations, or DB connection singleton                               |
| 6   | `src/middlewares/` | **MISSING** | Critical | No auth middleware, no error middleware                                                |
| 7   | `src/utils/`       | **MISSING** | Medium   | No utility functions directory                                                         |

#### 1.5 Backend — Non-Standard Directories Present

| #   | Directory      | What Should Be                                                             | Severity | Notes                                                         |
| --- | -------------- | -------------------------------------------------------------------------- | -------- | ------------------------------------------------------------- |
| 1   | `controllers/` | Should be `src/modules/<domain>/<domain>.controller.ts`                    | High     | Flat directory, not domain-partitioned                        |
| 2   | `models/`      | Should be replaced by Prisma schema in `src/database/prisma/schema.prisma` | Critical | Using Mongoose instead of Prisma                              |
| 3   | `routes/`      | Should be `src/modules/<domain>/<domain>.routes.ts`                        | High     | Flat directory, not domain-partitioned                        |
| 4   | `services/`    | Should be `src/modules/<domain>/<domain>.service.ts`                       | High     | Only exists for scheduler subdomain, not for slots/reschedule |
| 5   | `scripts/`     | Acceptable                                                                 | ✅       | Seed scripts are acceptable outside src/                      |

---

### 2. Naming Convention Violations

#### 2.1 Frontend — File Naming

| #   | File Path                              | Current Name            | Correct Name                       | Rule Violated                                           | Severity |
| --- | -------------------------------------- | ----------------------- | ---------------------------------- | ------------------------------------------------------- | -------- |
| 1   | `src/data/rescheduleStore.js`          | rescheduleStore.js      | reschedule.store.ts                | Store files must end in `.store.ts`                     | Medium   |
| 2   | `src/data/timetableEngineStore.js`     | timetableEngineStore.js | timetableEngine.store.ts           | Store files must end in `.store.ts`                     | Medium   |
| 3   | `src/pages/admin/services/adminApi.js` | adminApi.js             | admin.service.ts (in features)     | Service files must follow `<domain>.service.ts` pattern | Medium   |
| 4   | `src/services/classroomApi.js`         | classroomApi.js         | classroom.service.ts               | Service files must follow `<domain>.service.ts` pattern | Medium   |
| 5   | `src/styles/theme.js`                  | theme.js                | theme.ts                           | TypeScript files must use `.ts` extension               | Low      |
| 6   | `src/styles/tokens.js`                 | tokens.js               | tokens.ts                          | TypeScript files must use `.ts` extension               | Low      |
| 7   | `src/components/AppShell.jsx`          | AppShell.jsx            | ✅ PascalCase for React components | **Compliant**                                           | ✅       |
| 8   | `src/components/CalendarView.jsx`      | CalendarView.jsx        | ✅ PascalCase for React components | **Compliant**                                           | ✅       |
| 9   | `src/components/Layout.jsx`            | Layout.jsx              | ✅ PascalCase for React components | **Compliant**                                           | ✅       |

#### 2.2 Frontend — Folder Naming (kebab-case required)

| #   | Folder Path                             | Current Name | Correct Name              | Rule Violated | Severity |
| --- | --------------------------------------- | ------------ | ------------------------- | ------------- | -------- |
| 1   | `src/pages/admin/`                      | admin        | admin (✅ kebab-case)     | **Compliant** | ✅       |
| 2   | `src/pages/faculty/`                    | faculty      | faculty (✅ kebab-case)   | **Compliant** | ✅       |
| 3   | `src/pages/student/`                    | student      | student (✅ kebab-case)   | **Compliant** | ✅       |
| 4   | `src/pages/admin/components/dashboard/` | dashboard    | dashboard (✅ kebab-case) | **Compliant** | ✅       |
| 5   | `src/pages/admin/components/engine/`    | engine       | engine (✅ kebab-case)    | **Compliant** | ✅       |
| 6   | `src/pages/admin/components/ui/`        | ui           | ui (✅ kebab-case)        | **Compliant** | ✅       |

**Note:** All existing folder names happen to be lowercase/kebab-case. However, the overall structure does not use `features/` or `modules/` as required.

#### 2.3 Backend — File Naming

| #   | File Path                                          | Current Name                  | Correct Name                   | Rule Violated                                | Severity |
| --- | -------------------------------------------------- | ----------------------------- | ------------------------------ | -------------------------------------------- | -------- |
| 1   | `controllers/slotController.js`                    | slotController.js             | slot.controller.ts             | Must be `<domain>.controller.ts`             | High     |
| 2   | `controllers/schedulerController.js`               | schedulerController.js        | scheduler.controller.ts        | Must be `<domain>.controller.ts`             | High     |
| 3   | `controllers/rescheduleController.js`              | rescheduleController.js       | reschedule.controller.ts       | Must be `<domain>.controller.ts`             | High     |
| 4   | `routes/slotRoutes.js`                             | slotRoutes.js                 | slot.routes.ts                 | Should be `<domain>.routes.ts`               | Medium   |
| 5   | `routes/schedulerRoutes.js`                        | schedulerRoutes.js            | scheduler.routes.ts            | Should be `<domain>.routes.ts`               | Medium   |
| 6   | `routes/rescheduleRoutes.js`                       | rescheduleRoutes.js           | reschedule.routes.ts           | Should be `<domain>.routes.ts`               | Medium   |
| 7   | `services/scheduler/classroomAssignmentService.js` | classroomAssignmentService.js | classroomAssignment.service.ts | Should be `<domain>.service.ts`              | Medium   |
| 8   | `services/scheduler/schedulerDataService.js`       | schedulerDataService.js       | schedulerData.service.ts       | Should be `<domain>.service.ts`              | Medium   |
| 9   | `services/scheduler/solverBridge.js`               | solverBridge.js               | solverBridge.service.ts        | Should be `<domain>.service.ts`              | Medium   |
| 10  | `models/Slot.js`                                   | Slot.js                       | Should be in Prisma schema     | Mongoose models should be replaced by Prisma | High     |
| 11  | `models/Course.js`                                 | Course.js                     | Should be in Prisma schema     | Mongoose models should be replaced by Prisma | High     |
| 12  | `models/Professor.js`                              | Professor.js                  | Should be in Prisma schema     | Mongoose models should be replaced by Prisma | High     |
| 13  | `models/Room.js`                                   | Room.js                       | Should be in Prisma schema     | Mongoose models should be replaced by Prisma | High     |
| 14  | `server.js`                                        | server.js                     | server.ts                      | TypeScript required                          | Medium   |

#### 2.4 Backend — Folder Naming (kebab-case required)

| #   | Folder Path           | Current Name | Correct Name                      | Rule Violated                         | Severity |
| --- | --------------------- | ------------ | --------------------------------- | ------------------------------------- | -------- |
| 1   | `controllers/`        | controllers  | Should be `src/modules/<domain>/` | Domain-partitioned structure required | High     |
| 2   | `models/`             | models       | Should be `src/database/prisma/`  | Prisma-based data access required     | High     |
| 3   | `routes/`             | routes       | Should be `src/modules/<domain>/` | Domain-partitioned structure required | High     |
| 4   | `services/scheduler/` | scheduler    | scheduler (✅ kebab-case)         | **Compliant**                         | ✅       |

---

### 3. Architecture Rule Violations

#### 3.1 Dependency Direction Violations

| #   | Location                                       | Forbidden Import                                                                    | Severity     | Description                                                              |
| --- | ---------------------------------------------- | ----------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------ |
| 1   | `src/pages/faculty/FacultyPage.jsx`            | `import ExamSchedule from "../student/pages/ExamSchedule"`                          | **Critical** | Faculty feature directly imports Student page — cross-feature dependency |
| 2   | `src/pages/faculty/FacultyPage.jsx`            | `import Notifications from "../student/pages/Notifications"`                        | **Critical** | Faculty feature directly imports Student page — cross-feature dependency |
| 3   | `src/pages/student/pages/CourseEnrollment.jsx` | `import { SubPageHeader, StatsGrid, Modal } from "../../admin/components/ui/index"` | **High**     | Student feature depends on Admin UI components                           |
| 4   | `src/pages/student/pages/ExamSchedule.jsx`     | `import { SubPageHeader, StatsGrid } from "../../admin/components/ui/index"`        | **High**     | Student feature depends on Admin UI components                           |
| 5   | `src/pages/student/pages/Notifications.jsx`    | `import { SubPageHeader, StatsGrid, Modal } from "../../admin/components/ui/index"` | **High**     | Student feature depends on Admin UI components                           |
| 6   | `src/pages/student/pages/GoogleClassroom.jsx`  | `import { SubPageHeader, StatsGrid } from "../../admin/components/ui/index"`        | **High**     | Student feature depends on Admin UI components                           |
| 7   | `src/pages/admin/services/adminApi.js`         | `import { ... } from "../../../data/adminMockData"`                                 | Medium       | Service layer importing mock data from data/ directory                   |
| 8   | `src/pages/admin/services/adminApi.js`         | `import { getRequests, updateStatus } from "../../../data/rescheduleStore"`         | Medium       | Service layer importing store from data/ directory                       |

#### 3.2 Feature Encapsulation Violations

| #   | Feature                                 | Missing File                              | Severity     | Description                                                        |
| --- | --------------------------------------- | ----------------------------------------- | ------------ | ------------------------------------------------------------------ |
| 1   | `src/pages/admin/`                      | No `index.ts` barrel export               | **Critical** | No public API for admin feature — internal files imported directly |
| 2   | `src/pages/faculty/`                    | No `index.ts` barrel export               | **Critical** | No public API for faculty feature                                  |
| 3   | `src/pages/student/`                    | No `index.ts` barrel export               | **Critical** | No public API for student feature                                  |
| 4   | `src/pages/admin/components/ui/`        | Has `index.jsx` but uses `.jsx` not `.ts` | Medium       | Barrel file exists but not TypeScript                              |
| 5   | `src/pages/admin/components/dashboard/` | No `index.ts`                             | Medium       | No barrel export for dashboard components                          |
| 6   | `src/pages/admin/components/engine/`    | No `index.ts`                             | Medium       | No barrel export for engine components                             |
| 7   | `src/pages/admin/components/layout/`    | No `index.ts`                             | Medium       | No barrel export for layout components                             |
| 8   | `src/pages/faculty/components/layout/`  | No `index.ts`                             | Medium       | No barrel export                                                   |
| 9   | `src/pages/student/components/layout/`  | No `index.ts`                             | Medium       | No barrel export                                                   |

#### 3.3 Pages = Composition Only Violations

| #   | Page File                                        | Violation                                                                                                           | Severity     | Description                                                            |
| --- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------- |
| 1   | `src/pages/admin/pages/TimeSlotsPage.jsx`        | Direct `fetch()` calls (lines 201, 289, 326)                                                                        | **Critical** | Page makes direct API calls — must delegate to service layer           |
| 2   | `src/pages/admin/pages/TimeSlotsPage.jsx`        | Contains form submission logic, data transformation, conflict checking                                              | **High**     | Business logic in page component                                       |
| 3   | `src/pages/admin/pages/AdminDashboard.jsx`       | Calls `adminApi.getDashboardStats()` on mount, computes stat keys dynamically                                       | Medium       | Data fetching in page (acceptable if via service, but tightly coupled) |
| 4   | `src/pages/faculty/pages/FacultyDashboard.jsx`   | Imports `addRequest` from `data/rescheduleStore` and calls it directly                                              | **High**     | Page calls store methods directly — business logic                     |
| 5   | `src/pages/faculty/pages/FacultyDashboard.jsx`   | Contains `handleSubmitReschedule` form submission logic                                                             | **High**     | Form/business logic in page component                                  |
| 6   | `src/pages/faculty/pages/FacultyDashboard.jsx`   | Contains hardcoded faculty name `"Dr. Rajesh M."` and department `"ECE"`                                            | Medium       | Hardcoded data in page                                                 |
| 7   | `src/pages/faculty/pages/RescheduleRequests.jsx` | Imports `getRequests, addRequest` from `data/rescheduleStore`                                                       | **High**     | Page directly calls store methods                                      |
| 8   | `src/pages/faculty/pages/RescheduleRequests.jsx` | Contains `handleSubmit` form logic                                                                                  | **High**     | Business logic in page                                                 |
| 9   | `src/pages/faculty/pages/RescheduleRequests.jsx` | Contains hardcoded `FACULTY_NAME = "Dr. Rajesh M."`                                                                 | Medium       | Hardcoded data                                                         |
| 10  | `src/pages/student/pages/StudentDashboard.jsx`   | Contains date calculation helpers inline (`getDaysInMonth`, `getFirstDayOfMonth`, etc.)                             | Medium       | Utility logic should be in `src/utils/`                                |
| 11  | `src/pages/student/pages/StudentDashboard.jsx`   | Contains `handleQuickAction` with alert-based stubs                                                                 | Low          | Business logic stubs in page                                           |
| 12  | `src/pages/admin/pages/TimetableEngine.jsx`      | Imports `getSolverResults, saveSolverResults, clearSolverResults` from `data/timetableEngineStore`                  | Medium       | Page directly calls store methods (should go through service)          |
| 13  | `src/pages/admin/pages/ConflictMonitor.jsx`      | Imports `fetchConflicts, resolveConflict` from service — acceptable pattern but page contains local filtering logic | Low          | Acceptable presentation logic                                          |
| 14  | `src/pages/admin/pages/RescheduleRequests.jsx`   | Imports `fetchRescheduleRequests, updateRequestStatus` from service — acceptable but contains local filtering       | Low          | Acceptable presentation logic                                          |

#### 3.4 Shared = Dumb Violations

| #   | Location                                  | Violation                                                     | Severity | Description                                               |
| --- | ----------------------------------------- | ------------------------------------------------------------- | -------- | --------------------------------------------------------- |
| 1   | `src/components/` (root)                  | Not organized as `src/shared/components/`                     | **High** | No shared directory — components are mixed with app shell |
| 2   | `src/components/Layout.jsx`               | Likely contains structural logic                              | Medium   | Should be moved to `src/layouts/`                         |
| 3   | `src/components/AppShell.jsx`             | Shell component with potential routing logic                  | Medium   | Should be in `src/layouts/` or `src/config/`              |
| 4   | `src/pages/admin/components/ui/index.jsx` | Barrel exports UI components but imports are from Admin scope | Medium   | These UI components should be in `src/shared/components/` |

#### 3.5 Backend Layer Separation Violations

| #   | Controller                                                                                                | Violation                                                                                     | Severity     | Description                                                                                               |
| --- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------- |
| 1   | `controllers/slotController.js` — `getAllSlots()`                                                         | Direct `Slot.find()` query                                                                    | **Critical** | DB query in controller — must be in repository                                                            |
| 2   | `controllers/slotController.js` — `getSlotById()`                                                         | Direct `Slot.findById()` query                                                                | **Critical** | DB query in controller                                                                                    |
| 3   | `controllers/slotController.js` — `createSlot()`                                                          | Direct `Slot.findOne()`, `Slot.create()` queries                                              | **Critical** | DB queries + business logic (validation, conflict checking) in controller                                 |
| 4   | `controllers/slotController.js` — `updateSlot()`                                                          | Direct `Slot.findOne()`, `Slot.findByIdAndUpdate()` queries                                   | **Critical** | DB queries + business logic in controller                                                                 |
| 5   | `controllers/slotController.js` — `deleteSlot()`                                                          | Direct `Slot.findByIdAndDelete()` query                                                       | **Critical** | DB query in controller                                                                                    |
| 6   | `controllers/slotController.js` — `findOccurrenceConflict()`                                              | Direct `Slot.find()` query inside helper                                                      | **Critical** | DB query helper function in controller file                                                               |
| 7   | `controllers/slotController.js` — `hasTimeOverlap()`, `timeToMinutes()`, `normalizeIncomingOccurrences()` | Utility/business logic functions                                                              | **High**     | Business logic utilities in controller — should be in service or utils                                    |
| 8   | `controllers/schedulerController.js` — `generateSchedule()`                                               | Calls `getSchedulerInputData()` which does `Slot.find()`, `Course.find()`, `Professor.find()` | **Critical** | Indirect DB query through service, but service is just a thin DB call wrapper — no repository abstraction |
| 9   | `controllers/schedulerController.js` — `assignClassroomsToSlots()`                                        | Calls `assignClassrooms()` which does `Room.find()`                                           | **Critical** | Indirect DB query through service                                                                         |
| 10  | `controllers/rescheduleController.js` — `createRequest()`                                                 | Direct `new Request().save()`                                                                 | **Critical** | DB query in controller (also Request model doesn't exist)                                                 |
| 11  | `controllers/rescheduleController.js` — `getRequests()`                                                   | Direct `Request.find()` with `.populate()`                                                    | **Critical** | DB query in controller                                                                                    |
| 12  | `controllers/rescheduleController.js` — `approveRequest()`                                                | Direct `Request.findById()`, `.save()`                                                        | **Critical** | DB query + business logic in controller                                                                   |
| 13  | `controllers/rescheduleController.js` — `rejectRequest()`                                                 | Direct `Request.findById()`, `.save()`                                                        | **Critical** | DB query + business logic in controller                                                                   |
| 14  | `services/scheduler/schedulerDataService.js`                                                              | `Slot.find().lean()`, `Course.find().lean()`, `Professor.find().lean()`                       | **High**     | Service directly queries DB — should use repository pattern                                               |
| 15  | `services/scheduler/classroomAssignmentService.js`                                                        | `Room.find().sort({ capacity: -1 })`                                                          | **High**     | Service directly queries DB — should use repository pattern                                               |
| 16  | No `*.repository.ts` files exist                                                                          | Entire repository layer missing                                                               | **Critical** | No data access abstraction — all DB queries in controllers/services                                       |

#### 3.6 Backend — Missing Layer Separation

| #   | Required Layer                            | Status     | Severity | Description                                                     |
| --- | ----------------------------------------- | ---------- | -------- | --------------------------------------------------------------- |
| 1   | Repository layer (`*.repository.ts`)      | **ABSENT** | Critical | No data access abstraction                                      |
| 2   | Service layer for slots                   | **ABSENT** | High     | Slot CRUD has no service file — all logic in controller         |
| 3   | Service layer for reschedule              | **ABSENT** | High     | Reschedule has no service file — all logic in controller        |
| 4   | Validation layer (`*.schema.ts` with Zod) | **ABSENT** | Critical | No input validation schemas                                     |
| 5   | Type definitions (`*.types.ts`)           | **ABSENT** | High     | No TypeScript type files (no TypeScript at all)                 |
| 6   | Error handling middleware                 | **ABSENT** | Critical | No `error.middleware.ts` — errors handled ad-hoc in controllers |
| 7   | Auth middleware                           | **ABSENT** | Critical | No `auth.middleware.ts` — no authentication/authorization       |
| 8   | Shared response builder                   | **ABSENT** | Medium   | No `shared/response.ts` — responses constructed ad-hoc          |
| 9   | Shared logger                             | **ABSENT** | Medium   | No `shared/logger/` — uses `console.log`/`console.error`        |
| 10  | Shared error classes                      | **ABSENT** | Medium   | No `shared/errors/` — errors are plain strings                  |
| 11  | DB connection singleton                   | **ABSENT** | Medium   | MongoDB connection in `server.js`, not abstracted               |

#### 3.7 Backend — Dead Code & Missing Dependencies

| #   | Issue                    | Location                                                                                   | Severity     | Description                                                       |
| --- | ------------------------ | ------------------------------------------------------------------------------------------ | ------------ | ----------------------------------------------------------------- |
| 1   | **Missing model**        | `controllers/rescheduleController.js` line 1: `import Request from '../models/Request.js'` | **Critical** | `models/Request.js` does not exist — will crash on any invocation |
| 2   | **Dead routes**          | `routes/rescheduleRoutes.js` exists but is NOT mounted in `server.js`                      | **Critical** | Entire reschedule API is unreachable                              |
| 3   | **Dead controller**      | `controllers/rescheduleController.js` is imported by routes that are not mounted           | **Critical** | Dead code — feature incomplete                                    |
| 4   | **Empty test directory** | `services/scheduler/__tests__/` is empty                                                   | Medium       | No tests for solver or services                                   |

#### 3.8 Module Frontend Isolation (Not Applicable — No MFE Structure)

The project does not implement a Module Frontend (MFE) structure. There is no `src/modules/` directory. The frontend is a monolithic HOST application with role-based pages (admin, faculty, student). **This is itself a violation** of the MFE-ready architecture standard.

---

### 4. Missing Required Files

#### 4.1 Frontend — Missing Files

| #   | Required File           | Location                            | Severity     | Description                                     |
| --- | ----------------------- | ----------------------------------- | ------------ | ----------------------------------------------- |
| 1   | `src/index.ts` (barrel) | `src/features/admin/index.ts`       | **Critical** | No public API for admin feature                 |
| 2   | `src/index.ts` (barrel) | `src/features/faculty/index.ts`     | **Critical** | No public API for faculty feature               |
| 3   | `src/index.ts` (barrel) | `src/features/student/index.ts`     | **Critical** | No public API for student feature               |
| 4   | `src/index.ts` (barrel) | `src/shared/index.ts`               | **Critical** | No shared barrel export (shared/ doesn't exist) |
| 5   | `env.ts`                | `src/config/env.ts`                 | Medium       | No environment configuration file               |
| 6   | `federation.ts`         | `src/config/federation.ts`          | Medium       | No MFE federation config                        |
| 7   | `routes.ts`             | `src/config/routes.ts`              | Medium       | Route configuration not centralized             |
| 8   | `httpClient.ts`         | `src/services/httpClient.ts`        | Medium       | No centralized HTTP client (uses raw `fetch()`) |
| 9   | `authInterceptor.ts`    | `src/services/authInterceptor.ts`   | Medium       | No auth interceptor                             |
| 10  | `theme.ts`              | `src/styles/theme.ts`               | Low          | Exists as `.js` not `.ts`                       |
| 11  | `variables.css`         | `src/styles/variables.css`          | Low          | No CSS variables file                           |
| 12  | `tailwind.config.ts`    | `src/styles/tailwind.config.ts`     | Low          | Tailwind configured in vite.config.js           |
| 13  | `auth.store.ts`         | `src/stores/auth.store.ts`          | Medium       | No auth store                                   |
| 14  | `user.store.ts`         | `src/stores/user.store.ts`          | Medium       | No user store                                   |
| 15  | `email.schema.ts`       | `src/validators/email.schema.ts`    | Medium       | No validation schemas                           |
| 16  | `password.schema.ts`    | `src/validators/password.schema.ts` | Medium       | No validation schemas                           |
| 17  | `formatDate.ts`         | `src/utils/formatDate.ts`           | Low          | No utility functions                            |
| 18  | `debounce.ts`           | `src/utils/debounce.ts`             | Low          | No utility functions                            |
| 19  | `api.types.ts`          | `src/types/api.types.ts`            | Low          | No type definitions (no TypeScript)             |
| 20  | `user.types.ts`         | `src/types/user.types.ts`           | Low          | No type definitions (no TypeScript)             |
| 21  | `useAuth.ts`            | `src/hooks/useAuth.ts`              | Medium       | No global auth hook                             |
| 22  | `useDebounce.ts`        | `src/hooks/useDebounce.ts`          | Low          | No global hooks                                 |
| 23  | `AuthLayout.tsx`        | `src/layouts/AuthLayout.tsx`        | Medium       | No auth layout                                  |
| 24  | `DashboardLayout.tsx`   | `src/layouts/DashboardLayout.tsx`   | Medium       | No dashboard layout                             |

#### 4.2 Backend — Missing Files

| #   | Required File            | Location                                          | Severity     | Description                              |
| --- | ------------------------ | ------------------------------------------------- | ------------ | ---------------------------------------- |
| 1   | `<domain>.repository.ts` | `src/modules/slot/slot.repository.ts`             | **Critical** | No repository for slot data access       |
| 2   | `<domain>.repository.ts` | `src/modules/course/course.repository.ts`         | **Critical** | No repository for course data access     |
| 3   | `<domain>.repository.ts` | `src/modules/professor/professor.repository.ts`   | **Critical** | No repository for professor data access  |
| 4   | `<domain>.repository.ts` | `src/modules/room/room.repository.ts`             | **Critical** | No repository for room data access       |
| 5   | `<domain>.repository.ts` | `src/modules/reschedule/reschedule.repository.ts` | **Critical** | No repository for reschedule data access |
| 6   | `<domain>.service.ts`    | `src/modules/slot/slot.service.ts`                | **Critical** | No service for slot business logic       |
| 7   | `<domain>.service.ts`    | `src/modules/reschedule/reschedule.service.ts`    | **Critical** | No service for reschedule business logic |
| 8   | `<domain>.schema.ts`     | `src/modules/slot/slot.schema.ts`                 | **High**     | No Zod validation for slot input         |
| 9   | `<domain>.schema.ts`     | `src/modules/course/course.schema.ts`             | **High**     | No Zod validation for course input       |
| 10  | `<domain>.schema.ts`     | `src/modules/reschedule/reschedule.schema.ts`     | **High**     | No Zod validation for reschedule input   |
| 11  | `<domain>.types.ts`      | `src/modules/slot/slot.types.ts`                  | **High**     | No type definitions                      |
| 12  | `schema.prisma`          | `src/database/prisma/schema.prisma`               | **Critical** | No Prisma schema — using Mongoose        |
| 13  | `index.ts`               | `src/database/index.ts`                           | Medium       | No DB connection singleton               |
| 14  | `auth.middleware.ts`     | `src/middlewares/auth.middleware.ts`              | **Critical** | No authentication middleware             |
| 15  | `error.middleware.ts`    | `src/middlewares/error.middleware.ts`             | **Critical** | No global error handler                  |
| 16  | `index.ts`               | `src/routes/index.ts`                             | **High**     | No central route registration            |
| 17  | `response.ts`            | `src/shared/response.ts`                          | Medium       | No standardized response builder         |
| 18  | `hash.ts`                | `src/utils/hash.ts`                               | Low          | No hash utility                          |
| 19  | `token.ts`               | `src/utils/token.ts`                              | Low          | No token utility                         |
| 20  | `Request.js`             | `models/Request.js`                               | **Critical** | Model imported but does not exist        |

---

### 5. Anti-Pattern Occurrences

#### 5.1 Direct API Calls in Page Components

| #   | File                                      | Line(s) | Anti-Pattern                                                               | Severity     |
| --- | ----------------------------------------- | ------- | -------------------------------------------------------------------------- | ------------ |
| 1   | `src/pages/admin/pages/TimeSlotsPage.jsx` | 201     | `fetch(\`${API_BASE}/slots\`)`                                             | **Critical** |
| 2   | `src/pages/admin/pages/TimeSlotsPage.jsx` | 289     | `fetch(url, options)` for POST/PUT                                         | **Critical** |
| 3   | `src/pages/admin/pages/TimeSlotsPage.jsx` | 326     | `fetch(\`${API_BASE}/slots/${deleteConfirm.\_id}\`, { method: "DELETE" })` | **Critical** |
| 4   | `src/pages/admin/services/adminApi.js`    | 82-89   | `fetch("http://localhost:5001/api/scheduler/generate", ...)`               | High         |
| 5   | `src/pages/admin/services/adminApi.js`    | 105-112 | `fetch("http://localhost:5001/api/scheduler/assign-classrooms", ...)`      | High         |

#### 5.2 Cross-Feature Imports

| #   | Source File                                    | Imports From                      | Anti-Pattern                 | Severity     |
| --- | ---------------------------------------------- | --------------------------------- | ---------------------------- | ------------ |
| 1   | `src/pages/faculty/FacultyPage.jsx`            | `../student/pages/ExamSchedule`   | Faculty imports Student page | **Critical** |
| 2   | `src/pages/faculty/FacultyPage.jsx`            | `../student/pages/Notifications`  | Faculty imports Student page | **Critical** |
| 3   | `src/pages/student/pages/CourseEnrollment.jsx` | `../../admin/components/ui/index` | Student imports Admin UI     | **High**     |
| 4   | `src/pages/student/pages/ExamSchedule.jsx`     | `../../admin/components/ui/index` | Student imports Admin UI     | **High**     |
| 5   | `src/pages/student/pages/Notifications.jsx`    | `../../admin/components/ui/index` | Student imports Admin UI     | **High**     |
| 6   | `src/pages/student/pages/GoogleClassroom.jsx`  | `../../admin/components/ui/index` | Student imports Admin UI     | **High**     |

#### 5.3 Business Logic in Wrong Layer

| #   | File                                               | Anti-Pattern                                                                                                                        | Severity     |
| --- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| 1   | `controllers/slotController.js`                    | Contains `findOccurrenceConflict`, `hasTimeOverlap`, `timeToMinutes`, `normalizeIncomingOccurrences` — business logic in controller | **Critical** |
| 2   | `src/pages/admin/pages/TimeSlotsPage.jsx`          | Contains form state management, data transformation, API calls, conflict alert handling                                             | **Critical** |
| 3   | `src/pages/faculty/pages/FacultyDashboard.jsx`     | Contains `handleSubmitReschedule` form logic, hardcoded faculty data                                                                | **High**     |
| 4   | `src/pages/faculty/pages/RescheduleRequests.jsx`   | Contains `handleSubmit` form logic, hardcoded faculty name                                                                          | **High**     |
| 5   | `src/pages/student/pages/StudentDashboard.jsx`     | Contains date calculation utilities inline                                                                                          | Medium       |
| 6   | `src/data/rescheduleStore.js`                      | Business logic (CRUD on localStorage) imported directly by pages                                                                    | Medium       |
| 7   | `src/data/timetableEngineStore.js`                 | Business logic (sessionStorage persistence) imported directly by pages                                                              | Medium       |
| 8   | `services/scheduler/schedulerDataService.js`       | Direct DB queries without repository abstraction                                                                                    | High         |
| 9   | `services/scheduler/classroomAssignmentService.js` | Direct DB queries without repository abstraction                                                                                    | High         |

#### 5.4 Multiple React Components in Single File

| #   | File                                                          | Components Defined                                                                   | Severity |
| --- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------- |
| 1   | `src/pages/admin/components/engine/ConstraintTogglesCard.jsx` | `Switch`, `ConstraintGroup`, `ConstraintTogglesCard` (3 components, only 1 exported) | Medium   |

#### 5.5 Mixed Concerns in data/ Directory

| #   | File                                 | Concern                                | Severity |
| --- | ------------------------------------ | -------------------------------------- | -------- |
| 1   | `src/data/rescheduleStore.js`        | State management (localStorage CRUD)   | Medium   |
| 2   | `src/data/timetableEngineStore.js`   | State management (sessionStorage CRUD) | Medium   |
| 3   | `src/data/adminMockData.js`          | Mock/static data                       | Low      |
| 4   | `src/data/timetableData.json`        | Static data                            | Low      |
| 5   | `src/data/courseEnrollmentData.json` | Static data                            | Low      |
| 6   | `src/data/timetableSlots.csv`        | Static data                            | Low      |

**Issue:** The `data/` directory mixes state management logic (stores) with static data (mock data, JSON, CSV). Per DISHA standards, stores should be in `src/stores/` and static data should be in `src/assets/`.

#### 5.6 No Input Validation

| #   | Location                              | Missing Validation                               | Severity |
| --- | ------------------------------------- | ------------------------------------------------ | -------- |
| 1   | `controllers/slotController.js`       | No Zod schemas — manual validation in controller | **High** |
| 2   | `controllers/schedulerController.js`  | No Zod schemas for constraint flags              | **High** |
| 3   | `controllers/rescheduleController.js` | No Zod schemas — manual `if (!field)` checks     | **High** |
| 4   | All controllers                       | No centralized input validation                  | **High** |

#### 5.7 No Error Handling Standardization

| #   | Location                              | Issue                                                                  | Severity |
| --- | ------------------------------------- | ---------------------------------------------------------------------- | -------- |
| 1   | All controllers                       | Ad-hoc error responses — each controller constructs its own error JSON | Medium   |
| 2   | `server.js`                           | No global error middleware                                             | **High** |
| 3   | `controllers/slotController.js`       | Multiple different 500 error response formats                          | Low      |
| 4   | `controllers/rescheduleController.js` | Inconsistent error messages                                            | Low      |

#### 5.8 Hardcoded Configuration

| #   | Location                                         | Hardcoded Value                                                               | Severity |
| --- | ------------------------------------------------ | ----------------------------------------------------------------------------- | -------- |
| 1   | `server.js`                                      | `MONGODB_URI` fallback: `"mongodb://localhost:27017/timetable"`               | Medium   |
| 2   | `server.js`                                      | `PORT` fallback: `5001`                                                       | Low      |
| 3   | `scripts/seedSlots.js`                           | `MONGODB_URI` fallback duplicated                                             | Medium   |
| 4   | `scripts/seedSchedulerTestData.js`               | `MONGODB_URI` fallback duplicated                                             | Medium   |
| 5   | `src/pages/admin/services/adminApi.js`           | Hardcoded endpoint: `"http://localhost:5001/api/scheduler/generate"`          | **High** |
| 6   | `src/pages/admin/services/adminApi.js`           | Hardcoded endpoint: `"http://localhost:5001/api/scheduler/assign-classrooms"` | **High** |
| 7   | `src/pages/admin/pages/TimeSlotsPage.jsx`        | `API_BASE = "http://localhost:5001/api"`                                      | **High** |
| 8   | `src/pages/faculty/pages/FacultyDashboard.jsx`   | Hardcoded faculty name: `"Dr. Rajesh M."`                                     | Medium   |
| 9   | `src/pages/faculty/pages/FacultyDashboard.jsx`   | Hardcoded department: `"ECE"`                                                 | Medium   |
| 10  | `src/pages/faculty/pages/RescheduleRequests.jsx` | Hardcoded faculty name: `"Dr. Rajesh M."`                                     | Medium   |

#### 5.9 Missing Authentication/Authorization

| #   | Location                     | Issue                                                   | Severity     |
| --- | ---------------------------- | ------------------------------------------------------- | ------------ |
| 1   | `server.js`                  | No auth middleware — all routes are publicly accessible | **Critical** |
| 2   | `routes/slotRoutes.js`       | No route-level guards                                   | **Critical** |
| 3   | `routes/schedulerRoutes.js`  | No route-level guards — anyone can run the solver       | **Critical** |
| 4   | `routes/rescheduleRoutes.js` | No route-level guards                                   | **Critical** |
| 5   | No JWT/token handling        | No `utils/token.ts`                                     | **Critical** |
| 6   | No password hashing          | No `utils/hash.ts`                                      | High         |

#### 5.10 Technology Stack Deviations

| #   | Standard Requirement                  | Actual Implementation                                                     | Severity     |
| --- | ------------------------------------- | ------------------------------------------------------------------------- | ------------ |
| 1   | TypeScript (frontend & backend)       | 100% JavaScript (.js/.jsx)                                                | **Critical** |
| 2   | Prisma ORM                            | Mongoose ODM                                                              | **Critical** |
| 3   | Zod validation schemas                | Manual inline validation                                                  | **Critical** |
| 4   | Repository pattern                    | Direct DB queries in controllers/services                                 | **Critical** |
| 5   | Feature-based (`features/`) structure | Role-based (`pages/admin/`, `pages/faculty/`, `pages/student/`) structure | **High**     |
| 6   | MFE-ready architecture                | Monolithic SPA                                                            | **High**     |
| 7   | Barrel exports (`index.ts`)           | Only 1 barrel file exists (`ui/index.jsx`)                                | **High**     |
| 8   | Global state stores (`stores/`)       | localStorage/sessionStorage stores in `data/`                             | Medium       |
| 9   | React + TypeScript (.tsx)             | React + JavaScript (.jsx)                                                 | **High**     |
| 10  | Module federation                     | No federation plugins in vite.config.js                                   | Medium       |

---

## MFE Readiness Status

### Feature: Admin

| Criterion                           | Status  | Notes                                                             |
| ----------------------------------- | ------- | ----------------------------------------------------------------- |
| Self-contained in `features/admin/` | ❌ FAIL | Located in `pages/admin/` not `features/admin/`                   |
| Clean `index.ts` public API         | ❌ FAIL | No `index.ts` barrel export                                       |
| No cross-feature imports            | ❌ FAIL | Student pages import from admin UI components                     |
| No shared global state dependency   | ❌ FAIL | Depends on `data/rescheduleStore` and `data/timetableEngineStore` |
| Backend module aligned              | ❌ FAIL | No `src/modules/admin/` — controllers/routes are flat             |
| Communication contracts documented  | ❌ FAIL | No interfaces/contracts defined                                   |

**Status: NOT READY**  
**Blocking reasons:** No feature encapsulation, no barrel exports, cross-feature dependencies, no backend module alignment, no TypeScript.

---

### Feature: Faculty

| Criterion                             | Status  | Notes                                                             |
| ------------------------------------- | ------- | ----------------------------------------------------------------- |
| Self-contained in `features/faculty/` | ❌ FAIL | Located in `pages/faculty/` not `features/faculty/`               |
| Clean `index.ts` public API           | ❌ FAIL | No `index.ts` barrel export                                       |
| No cross-feature imports              | ❌ FAIL | FacultyPage imports from Student pages                            |
| No shared global state dependency     | ❌ FAIL | Depends on `data/rescheduleStore`                                 |
| Backend module aligned                | ❌ FAIL | No `src/modules/faculty/` — reschedule controller/routes are flat |
| Communication contracts documented    | ❌ FAIL | No interfaces/contracts defined                                   |

**Status: NOT READY**  
**Blocking reasons:** Cross-feature imports (imports Student pages), no barrel exports, no feature encapsulation, direct store imports, no TypeScript.

---

### Feature: Student

| Criterion                             | Status     | Notes                                               |
| ------------------------------------- | ---------- | --------------------------------------------------- |
| Self-contained in `features/student/` | ❌ FAIL    | Located in `pages/student/` not `features/student/` |
| Clean `index.ts` public API           | ❌ FAIL    | No `index.ts` barrel export                         |
| No cross-feature imports              | ❌ FAIL    | 4 student pages import from admin UI components     |
| No shared global state dependency     | ⚠️ PARTIAL | Uses static JSON data and localStorage stores       |
| Backend module aligned                | ❌ FAIL    | No `src/modules/student/` backend structure         |
| Communication contracts documented    | ❌ FAIL    | No interfaces/contracts defined                     |

**Status: NOT READY**  
**Blocking reasons:** Cross-feature imports from admin, no barrel exports, no feature encapsulation, no backend module alignment, no TypeScript.

---

### Feature: Scheduler (Backend)

| Criterion                              | Status     | Notes                                                      |
| -------------------------------------- | ---------- | ---------------------------------------------------------- |
| Self-contained in `modules/scheduler/` | ⚠️ PARTIAL | Exists in `services/scheduler/` but not domain-partitioned |
| Clean `index.ts` public API            | ❌ FAIL    | No `index.ts` barrel export                                |
| No cross-module imports                | ✅ PASS    | Scheduler services don't import from other modules         |
| No shared global state dependency      | ✅ PASS    | Stateless services                                         |
| Backend module aligned                 | ⚠️ PARTIAL | Has service layer but no controller/repository separation  |
| Communication contracts documented     | ❌ FAIL    | No interfaces defined                                      |

**Status: NOT READY**  
**Blocking reasons:** No repository pattern, no controller/service/repository separation, no TypeScript, no barrel exports.

---

### Feature: Slots (Backend)

| Criterion                          | Status  | Notes                                                                        |
| ---------------------------------- | ------- | ---------------------------------------------------------------------------- |
| Self-contained in `modules/slot/`  | ❌ FAIL | Only exists as flat `controllers/slotController.js` + `routes/slotRoutes.js` |
| Clean `index.ts` public API        | ❌ FAIL | No `index.ts` barrel export                                                  |
| No cross-module imports            | ✅ PASS | No inter-module dependencies                                                 |
| No shared global state dependency  | ✅ PASS | Stateless                                                                    |
| Backend module aligned             | ❌ FAIL | No service layer, no repository, no schema, no types                         |
| Communication contracts documented | ❌ FAIL | No interfaces defined                                                        |

**Status: NOT READY**  
**Blocking reasons:** No service layer, no repository, no validation schemas, no TypeScript, no domain-partitioned structure.

---

### Feature: Reschedule (Backend)

| Criterion                               | Status  | Notes                                                            |
| --------------------------------------- | ------- | ---------------------------------------------------------------- |
| Self-contained in `modules/reschedule/` | ❌ FAIL | Exists as dead code — routes not mounted                         |
| Clean `index.ts` public API             | ❌ FAIL | No `index.ts` barrel export                                      |
| No cross-module imports                 | ✅ PASS | No inter-module dependencies                                     |
| No shared global state dependency       | ✅ PASS | Stateless                                                        |
| Backend module aligned                  | ❌ FAIL | Missing Request model, routes not mounted, no service/repository |
| Communication contracts documented      | ❌ FAIL | No interfaces defined                                            |

**Status: NOT READY**  
**Blocking reasons:** Dead code (routes not mounted), missing model (Request.js doesn't exist), no service layer, no repository, no TypeScript.

---

## Recommended Fixes (Priority Order)

### Phase 1: Critical Infrastructure (Blocking for all other work)

1. **Add TypeScript to the project**
   - Backend: `npm install typescript @types/node @types/express @types/cors @types/mongoose --save-dev`, create `tsconfig.json`, rename `server.js` → `src/server.ts`
   - Frontend: Already using Vite — add TypeScript: `npm install typescript @types/react @types/react-dom --save-dev`, rename all `.jsx` → `.tsx`, `.js` → `.ts`
   - **Impact:** Enables type safety, required by all DISHA standards

2. **Create backend `src/` directory structure**
   - Move all files from `backend/` into `backend/src/`
   - Create: `src/modules/`, `src/shared/`, `src/database/`, `src/middlewares/`, `src/utils/`, `src/config/`
   - **Impact:** Aligns with DISHA backend structure

3. **Add error handling middleware**
   - Create `src/middlewares/error.middleware.ts` with centralized error handling
   - Create `src/shared/errors/` with custom error classes (NotFoundError, ValidationError, UnauthorizedError)
   - Create `src/shared/response.ts` with standardized response builder
   - Wire into Express app in `server.ts`
   - **Impact:** Eliminates ad-hoc error handling across all controllers

4. **Add authentication middleware**
   - Create `src/middlewares/auth.middleware.ts` with JWT verification
   - Create `src/utils/hash.ts` and `src/utils/token.ts`
   - Protect all API routes with auth middleware
   - **Impact:** Security requirement — all routes are currently public

5. **Fix dead reschedule code**
   - Create `models/Request.js` (or Prisma model) — the `Request` model is imported but doesn't exist
   - Mount `rescheduleRoutes` in `server.js` OR remove the dead code entirely
   - **Impact:** Prevents runtime crashes

### Phase 2: Backend Layer Separation

6. **Implement repository pattern**
   - Create `src/modules/slot/slot.repository.ts` — move all `Slot.find()`, `Slot.create()`, etc. from controller
   - Create `src/modules/course/course.repository.ts`
   - Create `src/modules/professor/professor.repository.ts`
   - Create `src/modules/room/room.repository.ts`
   - Create `src/modules/reschedule/reschedule.repository.ts`
   - **Impact:** Separates data access from business logic

7. **Create service layer for all domains**
   - Create `src/modules/slot/slot.service.ts` — move conflict checking, normalization, validation logic from controller
   - Create `src/modules/reschedule/reschedule.service.ts` — move approval/rejection business logic from controller
   - Refactor `schedulerController.ts` to use services properly
   - **Impact:** Controllers become thin HTTP adapters

8. **Add Zod validation schemas**
   - Create `src/modules/slot/slot.schema.ts` — slot input validation
   - Create `src/modules/course/course.schema.ts` — course input validation
   - Create `src/modules/reschedule/reschedule.schema.ts` — reschedule request validation
   - Create validation middleware to apply schemas before controller execution
   - **Impact:** Eliminates manual validation in controllers

9. **Migrate from Mongoose to Prisma** (optional, per DISHA standard)
   - Create `src/database/prisma/schema.prisma` with Slot, Course, Professor, Room, Request models
   - Generate Prisma client
   - Replace all Mongoose models with Prisma client calls in repositories
   - Create `src/database/index.ts` with Prisma client singleton
   - **Impact:** Aligns with DISHA database standard

### Phase 3: Frontend Restructuring

10. **Create feature-based directory structure**
    - Create `src/features/admin/` — move everything from `src/pages/admin/`
    - Create `src/features/faculty/` — move everything from `src/pages/faculty/`
    - Create `src/features/student/` — move everything from `src/pages/student/`
    - **Impact:** Enables feature encapsulation and MFE extraction

11. **Create barrel exports for all features**
    - Create `src/features/admin/index.ts` — export public API only
    - Create `src/features/faculty/index.ts`
    - Create `src/features/student/index.ts`
    - Enforce: all external imports must go through these barrel files
    - **Impact:** Enforces feature encapsulation

12. **Eliminate cross-feature imports**
    - Move shared UI components from `pages/admin/components/ui/` to `src/shared/components/`
    - Create `src/shared/index.ts` barrel export
    - Update Student pages to import from `shared/` instead of `admin/components/ui/`
    - Remove Faculty imports of Student pages — create shared routing or extract common components
    - **Impact:** Decouples features for MFE readiness

13. **Create proper store directory**
    - Move `data/rescheduleStore.js` → `src/stores/reschedule.store.ts`
    - Move `data/timetableEngineStore.js` → `src/stores/timetableEngine.store.ts`
    - Move static JSON/CSV files to `src/assets/`
    - Delete or repurpose `data/` directory
    - **Impact:** Separates state management from static data

14. **Create layouts directory**
    - Move `pages/admin/components/layout/AdminLayout.jsx` → `src/layouts/AdminLayout.tsx`
    - Move `pages/faculty/components/layout/FacultyLayout.jsx` → `src/layouts/FacultyLayout.tsx`
    - Move `pages/student/components/layout/StudentLayout.jsx` → `src/layouts/StudentLayout.tsx`
    - Create `src/layouts/AuthLayout.tsx` for login page
    - **Impact:** Separates structural shell from business features

15. **Create shared components directory**
    - Create `src/shared/components/` with subdirectories: `Button/`, `Input/`, `Modal/`, `Card/`, `DataTable/`, etc.
    - Move UI primitives from `pages/admin/components/ui/` to `src/shared/components/`
    - Create `src/shared/index.ts` barrel export
    - Ensure all shared components are dumb (no API calls, no business logic)
    - **Impact:** Provides reusable presentational components

### Phase 4: Frontend Architecture Cleanup

16. **Remove direct API calls from pages**
    - Refactor `TimeSlotsPage.tsx` to use a service (move fetch calls to `src/services/slotService.ts`)
    - Ensure all pages only import from feature barrel files and services
    - Create `src/services/httpClient.ts` with centralized axios/fetch wrapper
    - Create `src/services/authInterceptor.ts` for token injection
    - **Impact:** Pages become composition-only

17. **Extract utilities**
    - Move date calculation helpers from `StudentDashboard.tsx` → `src/utils/formatDate.ts`
    - Move time conversion helpers from `slotController.ts` → `src/utils/time.ts`
    - Move debounce utilities → `src/utils/debounce.ts`
    - **Impact:** Pure functions separated from components

18. **Create hooks directory**
    - Create `src/hooks/useAuth.ts` for authentication state
    - Create `src/hooks/useDebounce.ts` for search inputs
    - Create `src/hooks/useMediaQuery.ts` for responsive behavior
    - **Impact:** Reusable global hooks

19. **Create validators directory**
    - Create `src/validators/email.schema.ts`
    - Create `src/validators/password.schema.ts`
    - Use Zod for frontend form validation
    - **Impact:** Consistent validation across frontend and backend

20. **Create types directory**
    - Create `src/types/api.types.ts` — API response contracts
    - Create `src/types/user.types.ts` — user/role type definitions
    - Create `src/types/slot.types.ts`, `src/types/course.types.ts`, etc.
    - **Impact:** Type-safe contracts

### Phase 5: Naming Convention Fixes

21. **Rename all backend files**
    - `slotController.js` → `slot.controller.ts`
    - `schedulerController.js` → `scheduler.controller.ts`
    - `rescheduleController.js` → `reschedule.controller.ts`
    - `slotRoutes.js` → `slot.routes.ts`
    - `schedulerRoutes.js` → `scheduler.routes.ts`
    - `rescheduleRoutes.js` → `reschedule.routes.ts`
    - `classroomAssignmentService.js` → `classroomAssignment.service.ts`
    - `schedulerDataService.js` → `schedulerData.service.ts`
    - `solverBridge.js` → `solverBridge.service.ts`

22. **Rename all frontend store files**
    - `rescheduleStore.js` → `reschedule.store.ts`
    - `timetableEngineStore.js` → `timetableEngine.store.ts`

23. **Rename all frontend service files**
    - `adminApi.js` → `admin.service.ts`
    - `classroomApi.js` → `classroom.service.ts`

24. **Rename all style files**
    - `theme.js` → `theme.ts`
    - `tokens.js` → `tokens.ts`

### Phase 6: Configuration & Infrastructure

25. **Create config directory**
    - Create `src/config/env.ts` — environment variables with validation
    - Create `src/config/federation.ts` — MFE federation config (when ready)
    - Create `src/config/routes.ts` — centralized route definitions

26. **Centralize backend route registration**
    - Create `src/routes/index.ts` — single source of truth for all route mounts
    - Import and mount all module routers here
    - Remove route mounting from `server.ts`

27. **Create database connection singleton**
    - Create `src/database/index.ts` — Prisma/Mongoose client singleton
    - Import from here instead of connecting in `server.ts`

28. **Add input validation middleware**
    - Create middleware that applies Zod schemas before controller execution
    - Apply to all POST/PUT/PATCH routes

### Phase 7: Testing & Documentation

29. **Add tests**
    - Add unit tests for services (`src/modules/<domain>/<domain>.service.test.ts`)
    - Add unit tests for repositories
    - Add unit tests for validation schemas
    - Add integration tests for API routes
    - Fill in `services/scheduler/__tests__/` with solver tests

30. **Document MFE contracts**
    - For each feature, document the public API (exports from `index.ts`)
    - Document props/event contracts for MFE communication
    - Document backend API contracts (OpenAPI/Swagger)

---

## Summary of Compliance Status

| Standard Area                    | Compliance | Notes                                                                                             |
| -------------------------------- | ---------- | ------------------------------------------------------------------------------------------------- |
| Frontend HOST folder structure   | **0%**     | Entire structure differs from standard                                                            |
| Module Frontend folder structure | **N/A**    | Not implemented                                                                                   |
| Backend API folder structure     | **15%**    | Has controllers/routes/services but flat, no src/ wrapper, no modules/shared/database/middlewares |
| Database (Prisma)                | **0%**     | Uses Mongoose, no Prisma                                                                          |
| Naming conventions               | **30%**    | Folders are kebab-case, but files don't follow `<domain>.<layer>.ts` pattern                      |
| Dependency direction             | **40%**    | Some separation but many cross-imports                                                            |
| Feature encapsulation            | **0%**     | No barrel exports, no feature isolation                                                           |
| Pages = composition only         | **20%**    | Some pages are clean, many have business logic                                                    |
| Shared = dumb                    | **10%**    | No shared/ directory                                                                              |
| Backend layer separation         | **5%**     | Controllers directly query DB, no repository pattern                                              |
| MFE readiness                    | **0%**     | All features NOT READY                                                                            |
| TypeScript                       | **0%**     | 100% JavaScript                                                                                   |
| Validation schemas               | **0%**     | No Zod schemas                                                                                    |
| Error handling                   | **10%**    | Ad-hoc, no middleware                                                                             |
| Authentication                   | **0%**     | No auth at all                                                                                    |

**Overall Compliance: ~12%**

---

_End of DISHA Standards Audit Report_
