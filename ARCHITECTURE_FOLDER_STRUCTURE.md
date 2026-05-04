# Architecture Folder Structure by Responsibility

## Overview

This document maps the codebase folders by their responsibility and role in the system, making it clear where to find and add code for specific concerns.

---

## Frontend (`frontend/src/`)

### 🔐 Authentication & Security

```
src/
├── services/
│   └── authInterceptor.ts          Injects Authorization: Bearer header on all fetch calls
├── config/
│   ├── constants.ts                API_BASE_URL and static configs
│   └── env.ts                      Environment variable loader
└── pages/
    └── LoginPage.tsx               Role-based login; persists token to localStorage
```

### 🛣️ Routing & Layout Infrastructure

```
src/
├── App.tsx                         Root router with lazy-loaded role pages; theme provider
├── layouts/
│   └── AuthLayout.tsx              Placeholder for future auth-specific screens
├── components/
│   └── AppShell.tsx                Unified sidebar + header reusable by all roles
└── pages/
    ├── LoginPage.tsx               Entry point before role-based pages
    ├── admin/components/layout/
    │   └── AdminLayout.tsx         Admin-specific nav wrapper around AppShell
    ├── faculty/components/layout/
    │   └── FacultyLayout.tsx        Faculty-specific nav wrapper around AppShell
    └── student/components/layout/
        └── StudentLayout.tsx        Student-specific nav wrapper around AppShell
```

### 📦 Feature Modules (Role-Based)

Each feature is a self-contained module with pages, components, and services.

#### Admin Feature

```
features/admin/
├── index.ts                        Barrel export: re-exports all admin pages
├── pages/
│   ├── AdminDashboard.tsx
│   ├── TimetableEngine.tsx         Complex solver orchestration
│   ├── ConflictMonitor.tsx
│   ├── TimeSlotsPage.tsx           Slot CRUD UI
│   ├── CoursesPage.tsx
│   ├── FacultyPage.tsx
│   ├── RoomsPage.tsx
│   ├── AnalyticsPage.tsx
│   ├── ExamScheduler.tsx
│   ├── RescheduleRequests.tsx
│   ├── IntegrationsPage.tsx
│   ├── SettingsPage.tsx
│   ├── TimetableVersions.tsx
│   └── BulkRescheduling.tsx
├── components/
│   ├── dashboard/                  Admin dashboard charts and cards
│   ├── engine/                     Timetable solver UI components
│   ├── layout/                     Re-exports layout
│   └── ui/                         Admin-specific UI components
└── services/
    ├── index.ts                    Barrel export: admin.service, timeSlots.service
    ├── admin.service.ts            Re-exports from adminApi (dashboard, conflicts, etc.)
    └── timeSlots.service.ts        Time slot API calls with auth headers
```

#### Faculty Feature

```
features/faculty/
├── index.ts                        Barrel export: faculty pages
├── pages/
│   ├── FacultyDashboard.tsx
│   └── RescheduleRequests.tsx
├── components/
│   └── layout/
│       └── FacultyLayout.tsx       Re-exports
└── services/
    └── [Shared with admin through API]
```

#### Student Feature

```
features/student/
├── index.ts                        Barrel export: student pages
├── pages/
│   ├── StudentDashboard.tsx
│   ├── StudentExamSchedule.tsx
│   ├── StudentNotifications.tsx
│   ├── CourseEnrollment.tsx
│   └── GoogleClassroom.tsx
├── components/
│   ├── CalendarCard.tsx
│   ├── ClassDetailsModal.tsx
│   ├── DayView.tsx
│   ├── MonthView.tsx
│   ├── WeekView.tsx
│   ├── QuickActions.tsx
│   ├── StatsCards.tsx
│   ├── TodaysClasses.tsx
│   ├── TopBar.tsx
│   ├── UpcomingEvents.tsx
│   └── layout/
│       └── StudentLayout.tsx       Re-exports
└── services/
    └── [Shared with other roles through API]
```

### 🎨 Design System & Shared UI

```
src/
├── shared/
│   ├── index.ts                    Barrel export from shared/components/ui
│   └── components/
│       └── ui/
│           ├── index.tsx           Design system primitives (Card, Badge, Button, DataTable, Modal, etc.)
│           └── [Component files]   Token-based styling using theme tokens
├── styles/
│   ├── theme.ts                    MUI theme configuration
│   └── tokens.ts                   Design tokens (colors, spacing, typography)
└── components/
    └── CalendarView.jsx            Generic calendar component used across roles
```

### 💾 State Management & Persistence

```
src/
├── stores/
│   ├── reschedule.store.ts         localStorage-based store for reschedule requests
│   └── timetableEngine.store.ts    sessionStorage-based store for solver results
└── data/
    ├── adminMockData.js            Mock data for development
    ├── timetableData.json
    ├── courseEnrollmentData.json
    └── timetableSlots.csv
```

### 🔧 Utilities & Helpers

```
src/
├── utils/                          Utility functions (array, string, date, etc.)
├── validators/                     Form validation functions
├── hooks/                          Custom React hooks
└── types/                          Centralized TypeScript type definitions
```

### 📄 Entry Point

```
src/
├── main.tsx                        React root mount; Suspense boundaries for error handling
└── index.css                       Global styles
```

---

## Backend (`backend/src/`)

### 🔌 Application & Configuration

```
src/
├── server.ts                       Express app initialization; mounts routes and middleware
└── config/
    ├── env.ts                      Environment variable loader (.env)
    └── database.ts                 [Optional] Database connection config
```

### 🔐 Security & Middleware

```
src/
└── middlewares/
    └── auth.middleware.ts          Validates Authorization: Bearer header; extracted token checked against API_AUTH_TOKEN or signed JWT
```

### 🗄️ Database & Models

```
src/
└── database/
    ├── index.ts                    Mongoose connection singleton; connectDatabase(), disconnectDatabase()
    ├── models/
    │   ├── slotModel.ts            Mongoose schema for time slots
    │   ├── courseModel.ts          Mongoose schema for courses
    │   ├── professorModel.ts       Mongoose schema for faculty/professors
    │   ├── roomModel.ts            Mongoose schema for rooms/classrooms
    │   └── requestModel.ts         Mongoose schema for reschedule requests
    └── [Direct model usage from modules]
```

### 🛣️ Routing

```
src/
├── routes/
│   ├── index.ts                    Central route registration; mounts /slots, /scheduler, /requests
│   └── [Sub-routers mounted from modules]
└── server.ts                       Applies authMiddleware to /api mount
```

### 📦 Domain Modules (Business Logic)

Each module is self-contained with clear separation of concerns.

#### Slot Module (Time Slot Management)

```
modules/slot/
├── slot.routes.ts                 GET /, GET /:id, POST, PUT /:id, DELETE /:id
├── slot.controller.ts             HTTP handlers; parses/validates payload; delegates to service
├── slot.service.ts                Business logic; validates conflicts, uniqueness; calls repository
├── slot.repository.ts             Database access; findAll, findById, create, updateById, deleteById
├── slot.schema.ts                 Zod validation schemas (createSlotSchema, updateSlotSchema)
└── slot.types.ts                  TypeScript interfaces (SlotEntity, SlotOccurrence, SlotConflict)
```

#### Scheduler Module (Timetable Solver)

```
modules/scheduler/
├── scheduler.routes.ts            POST /generate, POST /assign-classrooms
├── scheduler.controller.ts        HTTP handlers for solver orchestration
├── scheduler.service.ts           Applies constraints; orchestrates CP-SAT solver; assigns classrooms
├── scheduler.repository.ts        Fetches solver input (slots, courses, professors, rooms)
├── scheduler.schema.ts            Zod schemas (generateScheduleSchema, assignClassroomsSchema)
├── solverBridge.ts                Python subprocess bridge; runs OR-Tools CP-SAT
└── scheduleSolver.py              Python solver implementation
```

#### Reschedule Module (Reschedule Requests)

```
modules/reschedule/
├── reschedule.routes.ts           GET /, GET /:id, POST, PATCH /:id/approve, PATCH /:id/reject
├── reschedule.controller.ts       HTTP handlers; validates with Zod schemas
├── reschedule.service.ts          Business logic; create/fetch/approve/reject requests; status updates
├── reschedule.repository.ts       Database layer; CRUD on reschedule requests; populates slot refs
├── reschedule.schema.ts           Zod validation schemas
└── reschedule.types.ts            TypeScript interfaces
```

### 🛠️ Utilities & Shared Infrastructure

```
src/
├── utils/
│   └── token.ts                   issueAccessToken(), verifyAccessToken(), signToken() for JWT handling
└── shared/
    ├── response.ts                ok() and fail() helpers for consistent HTTP responses
    ├── errors/
    │   └── index.ts               AppError class for typed exception handling
    └── logger/
        └── index.ts               Logger utility (info, error, debug)
```

### 🔗 Integration Points

```
Backend Responsibilities:
├── Auth validation (middleware → all protected routes)
├── Domain business logic (modules → services)
├── Database persistence (repositories → MongoDB)
├── External integrations (solverBridge → Python solver)
└── API response formatting (response.ts → consistent JSON)

Frontend Access:
└── Via fetch() with Authorization: Bearer header → /api/* routes
```

---

## Key Organization Principles

### Frontend

- **Barrel Exports Rule**: Each feature folder's `index.ts` re-exports only (no implementation logic)
- **Feature Autonomy**: admin, faculty, student folders contain all pages, components, and services for that role
- **Centralized Auth**: Single `authInterceptor.ts` handles header injection for all API calls
- **Layout Reusability**: `AppShell.tsx` is a single source of truth for role-based sidebars and headers
- **Store Separation**: Reschedule (localStorage, persistent) vs TimetableEngine (sessionStorage, session-only)

### Backend

- **Module Isolation**: Each domain (slot, scheduler, reschedule) owns routes → controller → service → repository
- **Layering**: HTTP → Validation → Business Logic → Database → Response
- **Shared Infrastructure**: Auth, response formatting, error handling, logging centralized in `/shared` and `/utils`
- **Schema Validation**: Zod schemas define input contracts; service and repository never receive invalid data
- **Type Safety**: TypeScript interfaces document domain entities; prevent runtime errors

### Cross-Layer

- **Authentication**: Enforced at middleware level; all /api/\* routes require valid bearer token
- **Error Handling**: Backend throws AppError → frontend receives fail() response → user sees toast/error UI
- **State Persistence**: Frontend stores for reschedule (localStorage) and solver results (sessionStorage)
- **Version Management**: TimetableEngine publishes versions; versions stored in backend (not yet implemented in UI)

---

## Adding New Features

### New Admin Page

1. Create [new-page].tsx in `features/admin/pages/`
2. Add route in AdminPage.tsx
3. Update `features/admin/index.ts` barrel to export it
4. Create service in `features/admin/services/[new-service].service.ts` if needed
5. Add auth interceptor to all fetch() calls

### New API Endpoint

1. Create `modules/[domain]/[domain].routes.ts` with Express router
2. Create [domain].controller.ts with HTTP handlers
3. Create [domain].service.ts with business logic
4. Create [domain].repository.ts with DB queries
5. Create [domain].schema.ts with Zod validation
6. Mount router in `routes/index.ts`
7. Apply authMiddleware in server.ts (already applied to /api)

### New Database Model

1. Create model in `database/models/[name]Model.ts`
2. Create repository in relevant module (or new module if domain is new)
3. Reference in service layer

---

## Dependencies & Data Flow

### Login Flow

```
LoginPage.tsx
  → localStorage.setItem(authToken, role)
  → navigate to role page
  → App.tsx loads role-specific feature based localStorage
```

### API Call Flow

```
Page Component
  → Feature Service
  → withAuthHeaders(fetch)
  → Authorization: Bearer [token]
  → Backend Route
  → Auth Middleware (validate token)
  → Domain Controller (parse + validate)
  → Domain Service (business logic)
  → Domain Repository (DB query)
  → response.ok() or response.fail()
```

### Scheduler Flow

```
TimetableEngine.tsx
  → generateTimetable(constraints)
  → admin.service → POST /api/scheduler/generate
  → scheduler.controller → scheduler.service
  → scheduler.repository.getSchedulerInputData()
  → solverBridge.runCpSatSolver()
  → scheduleSolver.py (Python)
  → return assignments
  → save to sessionStorage
  → render SlotAllocationView
```

---

## File Naming Convention

| Category     | Example                  | Purpose                                         |
| ------------ | ------------------------ | ----------------------------------------------- |
| Routes       | `slot.routes.ts`         | Express router definition                       |
| Controllers  | `slot.controller.ts`     | HTTP request handlers                           |
| Services     | `slot.service.ts`        | Business logic                                  |
| Repositories | `slot.repository.ts`     | Database access                                 |
| Schemas      | `slot.schema.ts`         | Zod input validation                            |
| Types        | `slot.types.ts`          | TypeScript interfaces                           |
| Stores       | `reschedule.store.ts`    | Client-side state (localStorage/sessionStorage) |
| Interceptors | `authInterceptor.ts`     | HTTP middleware (fetch enrichment)              |
| Config       | `env.ts`, `constants.ts` | Environment and static settings                 |

---

## Quick Reference: Where Code Lives

| I Need To...              | File Location                                                                     |
| ------------------------- | --------------------------------------------------------------------------------- |
| Add a new admin page      | `features/admin/pages/[Page].tsx`                                                 |
| Call an API from frontend | Feature service → use `withAuthHeaders(fetch)`                                    |
| Add API endpoint          | Create module in `modules/[domain]/` (routes → controller → service → repository) |
| Update validation logic   | `modules/[domain]/[domain].schema.ts` (Zod)                                       |
| Modify business logic     | `modules/[domain]/[domain].service.ts`                                            |
| Query database            | `modules/[domain]/[domain].repository.ts`                                         |
| Add UI component          | `shared/components/ui/` (reusable) or feature-specific folder                     |
| Change theme              | `styles/theme.ts` or `styles/tokens.ts`                                           |
| Store user session        | `localStorage` (persistent) via LoginPage                                         |
| Store solver results      | `sessionStorage` via `timetableEngine.store.ts`                                   |
| Add environment variable  | `.env` file → use in `config/env.ts`                                              |
| Handle errors             | Throw in service → caught in controller → `fail(res, message)`                    |
