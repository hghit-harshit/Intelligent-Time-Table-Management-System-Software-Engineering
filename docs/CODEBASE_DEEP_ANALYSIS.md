# Intelligent Time Table Management System - Deep Codebase Analysis

## Step 1: Discover The Project

### Entry points and startup commands
- Backend server starts in backend/src/server.ts, wired by backend/package.json scripts dev and start.
- Frontend app boots in frontend/src/main.tsx, mounts root app from frontend/src/App.tsx.
- Google Classroom integration service starts in google-classroom-service/server.js, wired by google-classroom-service/package.json.
- Operational run instructions are documented in README.md and backend/commands.md.

### Important files grouped by purpose

#### Runtime bootstrap and config
- backend/src/server.ts
- backend/src/config/env.ts
- backend/src/database/index.ts
- backend/docker-compose.dev.yml
- backend/Makefile

#### Backend API surface and middleware
- backend/src/routes/index.ts
- backend/src/middlewares/auth.middleware.ts
- backend/src/middlewares/error.middleware.ts
- backend/src/shared/response.ts

#### Core scheduling logic
- backend/src/modules/scheduler/scheduler.controller.ts
- backend/src/modules/scheduler/scheduler.service.ts
- backend/src/modules/scheduler/solverBridge.ts
- backend/src/modules/scheduler/scheduleSolver.py
- backend/src/modules/scheduler/scheduler.repository.ts

#### Slot management and validation
- backend/src/modules/slot/slot.controller.ts
- backend/src/modules/slot/slot.service.ts
- backend/src/modules/slot/slot.repository.ts
- backend/src/modules/slot/slot.schema.ts

#### Reschedule request workflow
- backend/src/modules/reschedule/reschedule.controller.ts
- backend/src/modules/reschedule/reschedule.service.ts
- backend/src/modules/reschedule/reschedule.repository.ts

#### Persistence models
- backend/src/database/models/slotModel.ts
- backend/src/database/models/courseModel.ts
- backend/src/database/models/professorModel.ts
- backend/src/database/models/roomModel.ts
- backend/src/database/models/requestModel.ts

#### Frontend shell, routing, and layouts
- frontend/src/App.tsx
- frontend/src/pages/LoginPage.tsx
- frontend/src/components/AppShell.tsx
- frontend/src/pages/admin/AdminPage.tsx
- frontend/src/pages/faculty/FacultyPage.tsx
- frontend/src/pages/student/StudentPage.tsx

#### Frontend backend-integration services and local stores
- frontend/src/pages/admin/services/adminApi.ts
- frontend/src/features/admin/services/timeSlots.service.ts
- frontend/src/services/httpClient.ts
- frontend/src/services/authInterceptor.ts
- frontend/src/stores/timetableEngine.store.ts
- frontend/src/stores/reschedule.store.ts

#### Google Classroom client path
- frontend/src/pages/student/pages/GoogleClassroom.tsx
- frontend/src/services/classroomApi.ts
- google-classroom-service/server.js

### Inferred overall goal
This is an academic timetable platform with three role-based UIs (admin, faculty, student), a backend API for slot management, schedule generation, room assignment, and rescheduling, plus a separate Google Classroom OAuth service for student assignment sync.

The real algorithmic core is CP-SAT timetable generation in Python, invoked from Node/TypeScript backend.

---

## Step 2: Build Structure

### Architecture
- Frontend: React + route-driven role portals + mostly mock/data-backed UI, with selected real API integrations.
- Backend: Express layered by route -> controller -> service -> repository -> Mongoose models.
- Solver sublayer: TypeScript service invokes Python process via stdin/stdout bridge.
- Integration service: standalone Express server for Google OAuth and Classroom data fetch.

### Dependency and interaction map

#### Backend HTTP flow
- backend/src/server.ts registers global middleware and mounts backend/src/routes/index.ts.
- Module routes delegate to controllers, controllers validate input with Zod, services enforce business logic, repositories perform DB operations.

#### Scheduler flow
- backend/src/modules/scheduler/scheduler.controller.ts parses constraints.
- backend/src/modules/scheduler/scheduler.service.ts loads slots/courses/professors via repository.
- backend/src/modules/scheduler/solverBridge.ts spawns Python solver backend/src/modules/scheduler/scheduleSolver.py.
- Solver JSON response returns assignments/stats; service post-processes for API response.

#### Frontend flow
- frontend/src/main.tsx -> frontend/src/App.tsx.
- Login in frontend/src/pages/LoginPage.tsx stores auth token and role in localStorage.
- Role pages mount layouts and nested routes.
- Admin timetable engine uses API calls from frontend/src/pages/admin/services/adminApi.ts.
- Time slot CRUD calls backend via frontend/src/features/admin/services/timeSlots.service.ts.

#### Google Classroom flow
- Frontend page frontend/src/pages/student/pages/GoogleClassroom.tsx calls frontend/src/services/classroomApi.ts.
- Service endpoints are served by google-classroom-service/server.js.

### Header/source mapping
No C/C++ header-source split exists. This is TypeScript/JavaScript/Python with module imports.

---

## Step 3: Deep Dive (Iterative, Important Files)

### Backend startup and security

#### backend/src/server.ts
- Purpose: process bootstrap and middleware assembly.
- Key behavior:
  - Creates Express app.
  - Enables CORS and JSON parsing.
  - Exposes health endpoint /ping.
  - Applies auth middleware for all /api endpoints.
  - Installs centralized error middleware.
- Non-obvious behavior: all /api routes are auth-protected by default.

#### backend/src/config/env.ts
- Purpose: centralized env parsing with safe defaults.
- Key behavior:
  - Parses booleans via parseBoolean helper.
  - Exposes runtime config (port, mongodbUri, solver Python binary, auth flags).
- Non-obvious behavior: default port is 5001, default static token is disha-dev-token, auth can be disabled.

#### backend/src/middlewares/auth.middleware.ts
- Purpose: authenticate every API request.
- Key behavior:
  - Extracts Bearer token.
  - Accepts either static token equality or signed token validation.
  - Skips auth if AUTH_DISABLED is true or request method is OPTIONS.
- Non-obvious behavior: dual-mode auth lets both static and signed tokens work.

#### backend/src/utils/token.ts
- Purpose: issue and verify HMAC-signed access tokens.
- Key behavior:
  - Encodes JSON payload as base64url.
  - Signs with HMAC SHA-256.
  - Validates signature and expiration.
- Non-obvious behavior: custom token format, not JWT library.

### Scheduler backend

#### backend/src/modules/scheduler/scheduler.service.ts
- Purpose: orchestrate schedule generation and classroom assignment.
- Key behavior:
  - Validates preconditions (slots/courses/professors exist).
  - Calls Python CP-SAT solver via bridge.
  - Converts solver failures to AppError 422.
  - Assigns classrooms using greedy smallest-suitable-room logic.
- Important data structures: assignment rows containing course, professor, slot/day/time, student count, optional room data.
- Tricky logic:
  - Room booking key is room + day + start + end, preventing same-room time collisions.
  - If no room fits, assignment is marked UNASSIGNED.

#### backend/src/modules/scheduler/solverBridge.ts
- Purpose: bridge Node service and Python solver process.
- Key behavior:
  - Spawns configured Python executable with scheduleSolver.py.
  - Sends payload JSON through stdin.
  - Captures stdout/stderr and parses JSON response.
  - Rejects on process error, non-zero exit, or invalid JSON.
- Tricky logic: process I/O and error handling can surface runtime dependency failures cleanly.

#### backend/src/modules/scheduler/scheduleSolver.py
- Purpose: build and solve CP-SAT model for timetable assignment.
- Key behavior:
  - Normalizes slot and occurrence shapes.
  - Builds boolean decision variables for feasible (course, slot, professor) tuples.
  - Applies hard and soft constraints based on flags.
  - Maximizes soft preference rewards.
  - Outputs denormalized assignment rows and stats.
- Important data structures:
  - assignment_vars map keyed by (courseIndex, slotIndex, profIndex).
  - slot_by_id and occurrence_by_id maps.
  - applied_constraints list for diagnostics.
  - unschedulable_courses list for early infeasibility reporting.
- Tricky logic:
  - Course is assigned to one slot variable, but output expands to all slot occurrences.
  - Eligibility logic supports multiple schema variants for professor/course mappings.
  - Time conflicts are computed by minute-range overlap.

### Slot module

#### backend/src/modules/slot/slot.service.ts
- Purpose: enforce business rules around slot CRUD.
- Key behavior:
  - Validates non-empty label and occurrences.
  - Enforces unique slot label (optionally excluding current slot during update).
  - Detects cross-slot occurrence overlaps.
- Important data structures: SlotConflict object with slot/occurrence references and time details.
- Tricky logic: conflict details are attached to AppError for richer client feedback.

#### backend/src/database/models/slotModel.ts
- Purpose: schema-level integrity for slots and occurrences.
- Key behavior:
  - Validates day and HH:mm formats.
  - Pre-validate hook enforces endTime > startTime.
  - Pre-validate hook disallows overlap among occurrences within the same slot.
- Tricky logic: overlap validation exists both in model and service (intra-slot vs inter-slot).

#### backend/src/modules/slot/slot.schema.ts
- Purpose: request payload validation.
- Key behavior:
  - Zod enum weekdays and HH:mm regex.
  - Requires at least one occurrence.

### Reschedule module

#### backend/src/modules/reschedule/reschedule.service.ts
- Purpose: manage request lifecycle.
- Key behavior:
  - Creates request entries.
  - Lists and filters by status/faculty.
  - Approves or rejects only pending requests.
- Tricky logic: immutable post-review state via status gate.

#### backend/src/database/models/requestModel.ts
- Purpose: persistence for reschedule requests.
- Key behavior:
  - Stores faculty metadata, slot references, reason, status, reviewer metadata.

### Frontend shell and routing

#### frontend/src/App.tsx
- Purpose: root routing + theme wrapper.
- Key behavior:
  - Lazy-loads Student, Faculty, Admin role pages.
  - Applies MUI ThemeProvider and CssBaseline.

#### frontend/src/components/AppShell.tsx
- Purpose: shared shell for all role layouts.
- Key behavior:
  - Renders configurable nav sections, header search, notifications, profile chip.
  - Handles collapsed sidebar state and route active-state highlighting.
- Tricky logic: active path detection distinguishes root exact-match vs nested startsWith matching.

#### frontend/src/pages/LoginPage.tsx
- Purpose: role selection and pseudo-authentication.
- Key behavior:
  - Saves role and authToken to localStorage.
  - Redirects to role portal route.

### Frontend admin scheduling path

#### frontend/src/pages/admin/pages/TimetableEngine.tsx
- Purpose: run and visualize slot assignment + room assignment.
- Key behavior:
  - Applies user-selected constraints.
  - Triggers generate and assign-classrooms actions.
  - Persists latest results in sessionStorage.
  - Renders tabular preview plus allocation views.
- Tricky logic:
  - Separates slotAssignments and classroomAssignments to avoid contamination.
  - Restores from session only on pageshow persisted navigation path.

#### frontend/src/pages/admin/services/adminApi.ts
- Purpose: aggregate admin data service layer.
- Key behavior:
  - Uses mock data for dashboard/conflict/reschedule and other sections.
  - Uses real backend calls for scheduler generate and classroom assignment.
- Tricky logic: mixed mock/real paths can diverge behavior.

#### frontend/src/pages/admin/pages/TimeSlotsPage.tsx
- Purpose: slot CRUD UI and weekly visualization.
- Key behavior:
  - Fetches real slots API.
  - Supports multi-occurrence add/edit/delete.
  - Renders grid and list modes.

### Frontend faculty/student and Google Classroom

#### frontend/src/pages/faculty/pages/FacultyDashboard.tsx
- Purpose: faculty schedule dashboard and reschedule request creation.
- Key behavior:
  - Uses local sample calendar events.
  - Writes requests to localStorage store.

#### frontend/src/pages/faculty/pages/RescheduleRequests.tsx
- Purpose: faculty request history and submission form.
- Key behavior: local-only storage usage through reschedule.store.

#### frontend/src/pages/student/pages/GoogleClassroom.tsx
- Purpose: Google Classroom connect/disconnect and assignment list.
- Key behavior:
  - Reads auth callback params.
  - Checks auth status.
  - Fetches assignments and computes due-soon/overdue stats.

#### google-classroom-service/server.js
- Purpose: OAuth and Google Classroom API integration service.
- Key behavior:
  - Generates OAuth URL.
  - Handles callback and token persistence.
  - Exposes auth status/logout.
  - Fetches course work across courses and returns future assignments sorted by due date.

---

## Step 4: Execution Flow

### System startup
1. Start backend, frontend, and optional Google service.
2. Backend loads env, connects Mongo, mounts protected API routes.
3. Frontend loads root router and role portal after login.

### Typical admin scheduling run
1. User selects Admin in frontend/src/pages/LoginPage.tsx.
2. Token stored in localStorage; subsequent requests include Authorization header.
3. User opens Timetable Engine in frontend/src/pages/admin/pages/TimetableEngine.tsx.
4. Run Slot Assignment triggers POST /scheduler/generate via adminApi.ts.
5. Backend pipeline: scheduler route -> controller -> service -> repository + solver bridge.
6. Python solver returns assignments + stats.
7. Frontend saves results to sessionStorage via timetableEngine.store.ts.
8. Run Classroom Assignment triggers POST /scheduler/assign-classrooms.
9. Backend greedy room assignment returns room-tagged assignments.

### Typical slot management run
1. Admin opens Time Slots page.
2. Frontend calls GET/POST/PUT/DELETE /slots through timeSlots.service.ts.
3. Backend slot service checks business rules and conflicts.
4. Mongoose model hook validates per-occurrence time consistency.
5. Persisted result is returned and UI refreshes.

### Data flow summary
- Auth token: localStorage -> withAuthHeaders -> backend auth middleware.
- Scheduling input: Mongo slots/courses/professors -> Python model.
- Solver output: Python JSON -> backend response -> frontend state + sessionStorage.
- Reschedule domain split:
  - Backend has real requests API.
  - Frontend admin/faculty mostly operate on localStorage mock store.

---

## Step 5: Core Logic And Algorithms

### CP-SAT schedule generation
1. Build feasible boolean variables x(course, slot, professor).
2. For each course, enforce sum of candidate x equals 1.
3. Apply HC1 hard rule: no professor can take overlapping slot occurrences.
4. Apply SC1 soft rule: reward assignments outside unavailable slots.
5. Apply SC2 soft rule: reward assignments outside preferred days off.
6. Maximize weighted soft rewards.
7. Solve with CP-SAT and produce assignments/stats/diagnostics.

Approximate complexity:
- Variable count grows as O(C * S * P_eligible).
- Conflict constraints can approach O(P * S^2) in dense overlap scenarios.

### Greedy room assignment
1. Load rooms sorted by descending capacity.
2. For each class assignment, scan rooms and pick smallest capacity >= students not already booked in same day-time interval.
3. Mark booking key room|day|start|end as occupied.
4. If no room fits, mark assignment UNASSIGNED.

Approximate complexity:
- O(A * R), where A is assignments and R is rooms.

### Slot overlap detection
1. Parse HH:mm to minutes.
2. Use overlap condition leftStart < rightEnd and rightStart < leftEnd.
3. Apply within-slot check in model hook.
4. Apply cross-slot check in service against existing slots.

---

## Step 6: Issues And Improvements

### Bugs and edge cases
1. Faculty route mismatch:
- Nav in pages/faculty/components/layout/FacultyLayout.tsx includes schedule, courses, students, analytics, settings.
- Route table in frontend/src/pages/faculty/FacultyPage.tsx only defines index, requests, exams, notifications.
- Clicking missing routes likely reaches unmatched path behavior.

2. Student route mismatch:
- Nav in pages/student/components/layout/StudentLayout.tsx includes notes, tasks, reminders, ai, integrations, settings.
- Route table in frontend/src/pages/student/StudentPage.tsx lacks these routes.

3. Reschedule model inconsistency:
- Frontend admin/faculty use local store schema from frontend/src/stores/reschedule.store.ts.
- Backend requests model expects slot ObjectId references in backend/src/database/models/requestModel.ts.
- Direct frontend switch to backend requests API is blocked without data mapping and UI adaptation.

4. Documentation drift:
- README and scheduler_context mention backend on 5000.
- Runtime defaults and compose use 5001 in backend/src/config/env.ts and backend/docker-compose.dev.yml.

5. OAuth hardening gaps:
- No OAuth state parameter verification in google-classroom-service/server.js.
- token.json is plain local persistence and auth status only checks token presence, not guaranteed validity.

### Performance improvements
1. Add process timeout and forced termination in backend/src/modules/scheduler/solverBridge.ts to prevent hung solver requests.
2. Pre-prune infeasible variables in backend/src/modules/scheduler/scheduleSolver.py more aggressively to reduce model size.
3. Consolidate frontend API calls through frontend/src/services/httpClient.ts for consistency and easier instrumentation.

### Code structure and readability improvements
1. Reduce broad ts-nocheck usage in frontend critical pages and services.
2. Standardize service adapters:
- Keep one interface for admin/faculty/student data and switch mock vs real by environment.
3. Align route declarations with layout nav configuration and route constants.

---

## Step 7: Final End-to-End Understanding

The system is a hybrid timetable platform: production-grade backend scheduling mechanics combined with a frontend that is partly integrated and partly demo-mocked.

Current strongest end-to-end path:
- Admin slot CRUD and timetable generation/classroom assignment over real backend APIs.
- Data originates in MongoDB, is optimized by Python CP-SAT, then returns to React for visualization and persistence in session state.

Current weakest integration area:
- Faculty and admin reschedule UX relies on local browser storage while backend requests module exists with a different data contract.
- Several navigation routes are present in sidebars but missing in router definitions.

Overall architectural quality:
- Backend layering is clean and maintainable.
- Solver design is flexible and constraint-driven.
- Main readiness gap is cross-layer contract/routing consistency rather than core algorithm capability.

---

## Optional Next Focus Areas
1. Exhaustive component-level audit under frontend/src/pages/admin/components.
2. Student UI behavior audit under frontend/src/pages/student/components.
3. Solver verification against seeded fixtures in backend/scripts.
4. Backend-frontend contract unification plan for reschedule flow.
