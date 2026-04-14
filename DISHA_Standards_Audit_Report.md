# DISHA Standards Audit Report

## Summary

- Total violations found: 76
- Critical violations: 45
- Minor violations: 31

## Implementation Progress

- Phase 1 completed: TypeScript onboarding has been applied to backend and frontend.
- Phase 2 backend completed: backend was refactored into DISHA-style module architecture and converted fully to TypeScript.
- Backend completed items:
  - Added TypeScript toolchain dependencies in [backend/package.json](backend/package.json)
  - Added [backend/tsconfig.json](backend/tsconfig.json)
  - Renamed server entrypoint to [backend/src/server.ts](backend/src/server.ts)
  - Added centralized route registration in [backend/src/routes/index.ts](backend/src/routes/index.ts)
  - Added required module folders and files under [backend/src/modules](backend/src/modules)
  - Added shared, middleware, database, and utility layers under [backend/src](backend/src)
  - Converted seed scripts to TypeScript in [backend/scripts/seedSlots.ts](backend/scripts/seedSlots.ts) and [backend/scripts/seedSchedulerTestData.ts](backend/scripts/seedSchedulerTestData.ts)
  - Removed legacy backend source JavaScript files (source JS count is now zero excluding generated artifacts)
- Frontend completed items:
  - Added TypeScript dependency in [frontend/package.json](frontend/package.json)
  - Added [frontend/tsconfig.json](frontend/tsconfig.json)
  - Renamed all frontend source files from jsx/js to tsx/ts
  - Migrated Vite config to [frontend/vite.config.ts](frontend/vite.config.ts)
  - Migrated ESLint config to [frontend/eslint.config.ts](frontend/eslint.config.ts)
- Validation:
  - Backend TypeScript build succeeds via npm run build.
  - Frontend Vite production build succeeds via npm run build.

Scope audited:

- [frontend/src](frontend/src)
- [backend](backend)
- [google-classroom-service](google-classroom-service)
- Root project structure and config files

Method:

- Exhaustive file and folder scan (excluding dependency/cache folders)
- Rule-by-rule comparison against all standards in [DISHA_Audit_Prompt.md](DISHA_Audit_Prompt.md)
- Architecture checks validated with concrete import and call-site evidence

## Violations by Category

### 1. Folder Structure Violations

#### Frontend Host structure mismatches

- Location: [frontend/src](frontend/src)
  - Wrong: Missing required folder assets
  - Should be: frontend/src/assets
- Location: [frontend/src](frontend/src)
  - Wrong: Missing required folder config
  - Should be: frontend/src/config
- Location: [frontend/src](frontend/src)
  - Wrong: Missing required folder shared
  - Should be: frontend/src/shared with components, styles, and index.ts
- Location: [frontend/src](frontend/src)
  - Wrong: Missing required folder features
  - Should be: frontend/src/features with one folder per business feature
- Location: [frontend/src](frontend/src)
  - Wrong: Missing required folder hooks
  - Should be: frontend/src/hooks for global hooks used by 2+ features
- Location: [frontend/src](frontend/src)
  - Wrong: Missing required folder layouts
  - Should be: frontend/src/layouts for shell-only layouts
- Location: [frontend/src](frontend/src)
  - Wrong: Missing required folder stores
  - Should be: frontend/src/stores
- Location: [frontend/src](frontend/src)
  - Wrong: Missing required folder validators
  - Should be: frontend/src/validators
- Location: [frontend/src](frontend/src)
  - Wrong: Missing required folder utils
  - Should be: frontend/src/utils
- Location: [frontend/src](frontend/src)
  - Wrong: Missing required folder types
  - Should be: frontend/src/types
- Location: [frontend/src/components](frontend/src/components)
  - Wrong: Generic components live outside shared and feature boundaries
  - Should be: presentational-only parts in shared/components or feature-local components
- Location: [frontend/src/data](frontend/src/data)
  - Wrong: App data and store logic are globally placed outside feature/store architecture
  - Should be: feature services/stores or global stores with strict naming

#### Module Frontend required structure not implemented

- Location: [frontend/src](frontend/src)
  - Wrong: No modules folder for module partitioning
  - Should be: frontend/src/modules
- Location: [frontend/src](frontend/src)
  - Wrong: No microFrontends directories and no interfaces contracts
  - Should be: frontend/src/modules/<module-name>/microFrontends/<mfe-name>/interfaces

#### Backend API structure mismatches

- Location: [backend](backend)
  - Wrong: No src root and no domain modules tree
  - Should be: backend/src/modules/<domain>
- Location: [backend](backend)
  - Wrong: Flat layers controllers/models/routes/services at top-level
  - Should be: per-domain module folders containing controller/service/repository/routes/schema/types
- Location: [backend](backend)
  - Wrong: No shared folder with logger/errors/response
  - Should be: backend/src/shared/logger, backend/src/shared/errors, backend/src/shared/response.ts
- Location: [backend](backend)
  - Wrong: No database folder with Prisma schema and migrations
  - Should be: backend/src/database/prisma/schema.prisma and migrations
- Location: [backend](backend)
  - Wrong: No middlewares folder
  - Should be: backend/src/middlewares with auth and error middleware
- Location: [backend](backend)
  - Wrong: No central routes index file
  - Should be: backend/src/routes/index.ts

### 2. Naming Convention Violations

#### Technology/naming baseline violations

- File path: [frontend/src/App.jsx](frontend/src/App.jsx)
  - Current name: App.jsx
  - Correct name: App.tsx
- File path: [frontend/src/main.jsx](frontend/src/main.jsx)
  - Current name: main.jsx
  - Correct name: main.tsx
- File path: [frontend/src/pages/admin/services/adminApi.js](frontend/src/pages/admin/services/adminApi.js)
  - Current name: adminApi.js
  - Correct name: adminApi.ts in a feature service folder
- File path: [frontend/src/styles/theme.js](frontend/src/styles/theme.js)
  - Current name: theme.js
  - Correct name: theme.ts
- File path: [frontend/src/styles/tokens.js](frontend/src/styles/tokens.js)
  - Current name: tokens.js
  - Correct name: tokens.ts
- File path: [backend/server.js](backend/server.js)
  - Current name: server.js
  - Correct name: server.ts under backend/src

#### Backend strict suffix convention violations

- File path: [backend/controllers/slotController.js](backend/controllers/slotController.js)
  - Current name: slotController.js
  - Correct name: slot.controller.ts
- File path: [backend/controllers/schedulerController.js](backend/controllers/schedulerController.js)
  - Current name: schedulerController.js
  - Correct name: scheduler.controller.ts
- File path: [backend/controllers/rescheduleController.js](backend/controllers/rescheduleController.js)
  - Current name: rescheduleController.js
  - Correct name: reschedule.controller.ts
- File path: [backend/services/scheduler/schedulerDataService.js](backend/services/scheduler/schedulerDataService.js)
  - Current name: schedulerDataService.js
  - Correct name: scheduler.service.ts under module structure
- File path: [backend/services/scheduler/classroomAssignmentService.js](backend/services/scheduler/classroomAssignmentService.js)
  - Current name: classroomAssignmentService.js
  - Correct name: scheduler.service.ts or dedicated service file within module
- File path: [backend/routes/slotRoutes.js](backend/routes/slotRoutes.js)
  - Current name: slotRoutes.js
  - Correct name: slot.routes.ts
- File path: [backend/routes/schedulerRoutes.js](backend/routes/schedulerRoutes.js)
  - Current name: schedulerRoutes.js
  - Correct name: scheduler.routes.ts
- File path: [backend/routes/rescheduleRoutes.js](backend/routes/rescheduleRoutes.js)
  - Current name: rescheduleRoutes.js
  - Correct name: reschedule.routes.ts

#### Store/schema naming convention violations

- File path: [frontend/src/data/rescheduleStore.js](frontend/src/data/rescheduleStore.js)
  - Current name: rescheduleStore.js
  - Correct name: reschedule.store.ts
- File path: [frontend/src/data/timetableEngineStore.js](frontend/src/data/timetableEngineStore.js)
  - Current name: timetableEngineStore.js
  - Correct name: timetableEngine.store.ts
- File path: [backend/services/scheduler/**tests**](backend/services/scheduler/__tests__)
  - Current name: **tests** folder
  - Correct name: kebab-case folder name under project naming rule

### 3. Architecture Rule Violations

#### Dependency direction and page-composition rules

- Location: [frontend/src/pages/admin/pages/AdminDashboard.jsx](frontend/src/pages/admin/pages/AdminDashboard.jsx#L8)
  - Rule broken: Pages must not make direct API calls
  - Problem: Imports and executes fetchDashboard and updateRequestStatus directly from service layer
- Location: [frontend/src/pages/admin/pages/CoursesPage.jsx](frontend/src/pages/admin/pages/CoursesPage.jsx#L3)
  - Rule broken: Pages must not make direct API calls
  - Problem: Direct fetchCourses import from adminApi
- Location: [frontend/src/pages/admin/pages/ConflictMonitor.jsx](frontend/src/pages/admin/pages/ConflictMonitor.jsx#L3)
  - Rule broken: Pages must not make direct API calls
  - Problem: Direct fetchConflicts and resolveConflict calls
- Location: [frontend/src/pages/admin/pages/RescheduleRequests.jsx](frontend/src/pages/admin/pages/RescheduleRequests.jsx#L3)
  - Rule broken: Pages must not make direct API calls
  - Problem: Direct fetchRescheduleRequests and updateRequestStatus calls
- Location: [frontend/src/pages/admin/pages/FacultyPage.jsx](frontend/src/pages/admin/pages/FacultyPage.jsx#L3)
  - Rule broken: Pages must not make direct API calls
  - Problem: Direct fetchFaculty call
- Location: [frontend/src/pages/admin/pages/RoomsPage.jsx](frontend/src/pages/admin/pages/RoomsPage.jsx#L3)
  - Rule broken: Pages must not make direct API calls
  - Problem: Direct fetchRooms call
- Location: [frontend/src/pages/admin/pages/AnalyticsPage.jsx](frontend/src/pages/admin/pages/AnalyticsPage.jsx#L3)
  - Rule broken: Pages must not make direct API calls
  - Problem: Direct fetchAnalytics call
- Location: [frontend/src/pages/admin/pages/ExamScheduler.jsx](frontend/src/pages/admin/pages/ExamScheduler.jsx#L3)
  - Rule broken: Pages must not make direct API calls
  - Problem: Direct fetchExamSchedule call
- Location: [frontend/src/pages/admin/pages/TimetableVersions.jsx](frontend/src/pages/admin/pages/TimetableVersions.jsx#L3)
  - Rule broken: Pages must not make direct API calls
  - Problem: Direct fetchTimetableVersions call
- Location: [frontend/src/pages/admin/pages/TimetableEngine.jsx](frontend/src/pages/admin/pages/TimetableEngine.jsx#L14)
  - Rule broken: Pages must not make direct API calls
  - Problem: Direct imports for generateTimetable and other API operations
- Location: [frontend/src/pages/admin/pages/TimeSlotsPage.jsx](frontend/src/pages/admin/pages/TimeSlotsPage.jsx#L201)
  - Rule broken: Pages must not make direct API calls
  - Problem: Raw fetch call to slots API inside page
- Location: [frontend/src/pages/admin/pages/TimeSlotsPage.jsx](frontend/src/pages/admin/pages/TimeSlotsPage.jsx#L289)
  - Rule broken: Pages must not make direct API calls
  - Problem: Raw fetch for create and update operations
- Location: [frontend/src/pages/admin/pages/TimeSlotsPage.jsx](frontend/src/pages/admin/pages/TimeSlotsPage.jsx#L326)
  - Rule broken: Pages must not make direct API calls
  - Problem: Raw fetch for delete operation
- Location: [frontend/src/pages/student/pages/GoogleClassroom.jsx](frontend/src/pages/student/pages/GoogleClassroom.jsx#L4)
  - Rule broken: Pages must not make direct API calls
  - Problem: Page directly imports API helpers and orchestrates auth/data calls

#### Module isolation and cross-module import violations

- Location: [frontend/src/pages/student/pages/CourseEnrollment.jsx](frontend/src/pages/student/pages/CourseEnrollment.jsx#L4)
  - Rule broken: Modules must not import from sibling modules
  - Problem: Student page imports UI primitives from admin module path
- Location: [frontend/src/pages/student/pages/ExamSchedule.jsx](frontend/src/pages/student/pages/ExamSchedule.jsx#L4)
  - Rule broken: Modules must not import from sibling modules
  - Problem: Student page imports from admin components
- Location: [frontend/src/pages/student/pages/Notifications.jsx](frontend/src/pages/student/pages/Notifications.jsx#L4)
  - Rule broken: Modules must not import from sibling modules
  - Problem: Student page imports from admin components
- Location: [frontend/src/pages/student/pages/GoogleClassroom.jsx](frontend/src/pages/student/pages/GoogleClassroom.jsx#L6)
  - Rule broken: Modules must not import from sibling modules
  - Problem: Student page imports SubPageHeader and StatsGrid from admin module
- Location: [frontend/src/pages/faculty/FacultyPage.jsx](frontend/src/pages/faculty/FacultyPage.jsx#L5)
  - Rule broken: Modules must not import from sibling modules
  - Problem: Faculty module imports student pages directly
- Location: [frontend/src/pages/faculty/FacultyPage.jsx](frontend/src/pages/faculty/FacultyPage.jsx#L6)
  - Rule broken: Modules must not import from sibling modules
  - Problem: Faculty module imports student notifications page directly

#### Backend layer separation violations

- Location: [backend/controllers/slotController.js](backend/controllers/slotController.js#L35)
  - Rule broken: Controllers must not query DB directly
  - Problem: Slot.find called in controller helper
- Location: [backend/controllers/slotController.js](backend/controllers/slotController.js#L71)
  - Rule broken: Controllers must not query DB directly
  - Problem: Slot.find sort query in controller
- Location: [backend/controllers/slotController.js](backend/controllers/slotController.js#L83)
  - Rule broken: Controllers must not query DB directly
  - Problem: Slot.findById in controller
- Location: [backend/controllers/slotController.js](backend/controllers/slotController.js#L118)
  - Rule broken: Controllers must not query DB directly
  - Problem: Slot.findOne duplicate check in controller
- Location: [backend/controllers/slotController.js](backend/controllers/slotController.js#L133)
  - Rule broken: Controllers must not query DB directly
  - Problem: Slot.create in controller
- Location: [backend/controllers/slotController.js](backend/controllers/slotController.js#L196)
  - Rule broken: Controllers must not query DB directly
  - Problem: Slot.findByIdAndUpdate in controller
- Location: [backend/controllers/slotController.js](backend/controllers/slotController.js#L227)
  - Rule broken: Controllers must not query DB directly
  - Problem: Slot.findByIdAndDelete in controller
- Location: [backend/controllers/rescheduleController.js](backend/controllers/rescheduleController.js#L19)
  - Rule broken: Controllers must not query DB directly
  - Problem: request.save in controller
- Location: [backend/controllers/rescheduleController.js](backend/controllers/rescheduleController.js#L34)
  - Rule broken: Controllers must not query DB directly
  - Problem: Request.find with populate and sort in controller
- Location: [backend/controllers/rescheduleController.js](backend/controllers/rescheduleController.js#L47)
  - Rule broken: Controllers must not query DB directly
  - Problem: Request.findById with populate in controller
- Location: [backend/controllers/rescheduleController.js](backend/controllers/rescheduleController.js#L62)
  - Rule broken: Controllers must not query DB directly
  - Problem: Request.findById in approval flow
- Location: [backend/controllers/rescheduleController.js](backend/controllers/rescheduleController.js#L86)
  - Rule broken: Controllers must not query DB directly
  - Problem: Request.findById in rejection flow
- Location: [backend/services/scheduler/schedulerDataService.js](backend/services/scheduler/schedulerDataService.js#L1)
  - Rule broken: Services must not query DB directly
  - Problem: Service imports Slot/Course/Professor models and queries them directly
- Location: [backend/services/scheduler/classroomAssignmentService.js](backend/services/scheduler/classroomAssignmentService.js#L1)
  - Rule broken: Services must not query DB directly
  - Problem: Service imports Room model and queries directly
- Location: [backend](backend)
  - Rule broken: All DB access must be in repository files
  - Problem: No repository layer files exist

#### Feature encapsulation violations

- Location: [frontend/src/pages/admin](frontend/src/pages/admin)
  - Rule broken: Feature must expose public API through index.ts
  - Problem: Missing index.ts and deep internal imports are used
- Location: [frontend/src/pages/faculty](frontend/src/pages/faculty)
  - Rule broken: Feature must expose public API through index.ts
  - Problem: Missing index.ts and imports bypass public boundary
- Location: [frontend/src/pages/student](frontend/src/pages/student)
  - Rule broken: Feature must expose public API through index.ts
  - Problem: Missing index.ts and imports bypass public boundary

### 4. Missing Required Files

#### Frontend required files absent

- Missing: frontend/tsconfig.json
- Missing: frontend/src/config/env.ts
- Missing: frontend/src/config/federation.ts
- Missing: frontend/src/config/routes.ts
- Missing: frontend/src/config/constants.ts
- Missing: frontend/src/shared/index.ts
- Missing: frontend/src/services/httpClient.ts
- Missing: frontend/src/services/authInterceptor.ts

#### Backend required files absent

- Missing: backend/src/server.ts
- Missing: backend/src/routes/index.ts
- Missing: backend/src/database/index.ts
- Missing: backend/src/database/prisma/schema.prisma
- Missing: backend/src/database/migrations
- Missing: backend/src/middlewares/auth.middleware.ts
- Missing: backend/src/middlewares/error.middleware.ts
- Missing: backend/src/utils/hash.ts
- Missing: backend/src/utils/token.ts
- Missing: per-domain files in modules for controller, service, repository, routes, schema, types

#### Required per-feature barrels absent

- Missing: frontend/src/features/<FeatureName>/index.ts pattern entirely
- Missing: module public interfaces contracts folder for MFEs

### 5. Anti-Pattern Occurrences

- Anti-pattern: Importing directly from one feature into another
  - [frontend/src/pages/student/pages/CourseEnrollment.jsx](frontend/src/pages/student/pages/CourseEnrollment.jsx#L4)
  - [frontend/src/pages/student/pages/ExamSchedule.jsx](frontend/src/pages/student/pages/ExamSchedule.jsx#L4)
  - [frontend/src/pages/student/pages/Notifications.jsx](frontend/src/pages/student/pages/Notifications.jsx#L4)
  - [frontend/src/pages/student/pages/GoogleClassroom.jsx](frontend/src/pages/student/pages/GoogleClassroom.jsx#L6)
  - [frontend/src/pages/faculty/FacultyPage.jsx](frontend/src/pages/faculty/FacultyPage.jsx#L5)

- Anti-pattern: API calls inside page components
  - [frontend/src/pages/admin/pages/TimeSlotsPage.jsx](frontend/src/pages/admin/pages/TimeSlotsPage.jsx#L201)
  - [frontend/src/pages/admin/pages/TimeSlotsPage.jsx](frontend/src/pages/admin/pages/TimeSlotsPage.jsx#L289)
  - [frontend/src/pages/admin/pages/TimeSlotsPage.jsx](frontend/src/pages/admin/pages/TimeSlotsPage.jsx#L326)
  - [frontend/src/pages/student/pages/GoogleClassroom.jsx](frontend/src/pages/student/pages/GoogleClassroom.jsx#L4)
  - [frontend/src/pages/admin/pages/AdminDashboard.jsx](frontend/src/pages/admin/pages/AdminDashboard.jsx#L8)

- Anti-pattern: Folder names or structure not aligned to host/module standards
  - [frontend/src/data](frontend/src/data)
  - [backend/controllers](backend/controllers)
  - [backend/models](backend/models)

- Anti-pattern: Missing index.ts in feature folders
  - [frontend/src/pages/admin](frontend/src/pages/admin)
  - [frontend/src/pages/faculty](frontend/src/pages/faculty)
  - [frontend/src/pages/student](frontend/src/pages/student)

- Anti-pattern: DB queries written directly in controllers
  - [backend/controllers/slotController.js](backend/controllers/slotController.js)
  - [backend/controllers/rescheduleController.js](backend/controllers/rescheduleController.js)

- Anti-pattern: Store files not ending in .store.ts
  - [frontend/src/data/rescheduleStore.js](frontend/src/data/rescheduleStore.js)
  - [frontend/src/data/timetableEngineStore.js](frontend/src/data/timetableEngineStore.js)

- Anti-pattern: Multiple React components in a single component file
  - [frontend/src/pages/admin/components/ui/index.jsx](frontend/src/pages/admin/components/ui/index.jsx)
  - Explanation: Large file exports many UI components; violates single-component-per-file guidance

## MFE Readiness Status

- Admin module: NOT READY
  - Blocking reasons: No feature encapsulation folder, no index.ts public API, pages directly call APIs, deep internal imports, no contracts folder

- Student module: NOT READY
  - Blocking reasons: Imports admin module internals, no module boundary contracts, no index.ts public API, page-level business logic and API orchestration

- Faculty module: NOT READY
  - Blocking reasons: Imports student pages directly, no index.ts public API, uses shared mutable store in data folder

- Backend domains (slot/scheduler/reschedule): NOT READY
  - Blocking reasons: No domain module packaging, no repository layer, direct DB queries in controller/service, no Prisma alignment

- Cross-system readiness: NOT READY
  - Blocking reasons: No module federation config, no explicit inter-MFE contracts, no independently deployable backend modules

## Recommended Fixes (Priority Order)

1. Migrate codebase to TypeScript and required file extensions

- Rename all frontend .jsx to .tsx and frontend utility .js to .ts
- Rename backend .js files to .ts under a new backend/src structure
- Add frontend tsconfig and backend tsconfig

2. Restructure backend into domain modules with strict layers

- Create backend/src/modules/slot with slot.controller.ts, slot.service.ts, slot.repository.ts, slot.routes.ts, slot.schema.ts, slot.types.ts
- Create backend/src/modules/reschedule with equivalent files
- Create backend/src/modules/scheduler with equivalent files
- Move all Mongoose queries from controllers/services into repositories first, then migrate repository implementation to Prisma

3. Align database layer to MongoDB + Prisma standard

- Add backend/src/database/prisma/schema.prisma
- Add backend/src/database/migrations and backend/src/database/index.ts
- Remove direct mongoose model usage from controllers/services

4. Build required frontend host structure and feature boundaries

- Create frontend/src/features/admin, frontend/src/features/student, frontend/src/features/faculty
- Move page logic into feature components/hooks/services
- Keep pages as route composition only
- Add feature-level index.ts barrels and block deep imports

5. Remove cross-module imports and enforce module isolation

- Replace student imports from admin UI with shared UI in frontend/src/shared/components
- Replace faculty imports from student pages with faculty-local pages/components
- Introduce explicit contracts for inter-module communication

6. Normalize service and state placement

- Move [frontend/src/pages/admin/services/adminApi.js](frontend/src/pages/admin/services/adminApi.js) to feature service layer
- Move [frontend/src/data/rescheduleStore.js](frontend/src/data/rescheduleStore.js) and [frontend/src/data/timetableEngineStore.js](frontend/src/data/timetableEngineStore.js) to frontend/src/stores as reschedule.store.ts and timetableEngine.store.ts
- Add frontend/src/services/httpClient.ts and authInterceptor.ts for global HTTP concerns

7. Add central route registration and middleware layers on backend

- Create backend/src/routes/index.ts as single source of truth
- Register all routes there and mount once in backend/src/server.ts
- Add auth and error middleware files in backend/src/middlewares

8. Fix concrete correctness defects found during audit

- [backend/controllers/rescheduleController.js](backend/controllers/rescheduleController.js#L1) imports ../models/Request.js but this file does not exist in [backend/models](backend/models)
- [backend/server.js](backend/server.js) does not mount [backend/routes/rescheduleRoutes.js](backend/routes/rescheduleRoutes.js)

9. Split oversized UI primitive file into one component per file

- Split [frontend/src/pages/admin/components/ui/index.jsx](frontend/src/pages/admin/components/ui/index.jsx) into separate files and re-export from index.ts

10. Add architecture guardrails

- Add lint rules to block forbidden import directions
- Add lint rules to block page-level API calls and cross-module imports
- Add CI checks for required structure and naming conventions
