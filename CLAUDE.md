# CLAUDE.md

Operational quick-reference for Claude when working in this repo. For deeper architectural/algorithmic detail, see [docs/CODEBASE_DEEP_ANALYSIS.md](docs/CODEBASE_DEEP_ANALYSIS.md) — note that doc is slightly behind current code (predates the catalog/student/exam/notification modules).

## What this is

Academic timetable platform with three role portals (admin, faculty, student). Core scheduling is a Python OR-Tools CP-SAT solver invoked from a Node/Express backend. React frontend renders results. Optional standalone Google Classroom OAuth service for student assignment sync.

## Repo layout (top level)

- [backend/](backend/) — Express + TypeScript API, Mongoose models, Python solver bridge
- [frontend/](frontend/) — React 19 + Vite + MUI v7 + Tailwind v4
- [google-classroom-service/](google-classroom-service/) — standalone Node.js OAuth/Classroom proxy (plain JS)
- [docs/CODEBASE_DEEP_ANALYSIS.md](docs/CODEBASE_DEEP_ANALYSIS.md) — architectural deep dive (slightly stale)
- [AGENTS.md](AGENTS.md) — short multi-service dev setup guide
- **No root `package.json`** — each service is independently installed/run

## Tech stack

| Area | Stack |
|---|---|
| Backend runtime | Node.js + TypeScript (build: `tsc`, dev: `tsx watch`) |
| Backend framework | Express, Mongoose 8, Zod |
| Auth | JWT (HS256) only — static-token path commented out in middleware |
| Solver | Python 3 + `ortools.sat.python.cp_model`, spawned as subprocess |
| Frontend | React 19, Vite 7, MUI 7, Tailwind 4, React Router 7, Axios |
| Frontend state | Custom hooks + localStorage (`stores/` is **not** Zustand/Redux) |
| DB | MongoDB (Docker: `mongo:latest`, creds `admin:admin123`, db `timetable`) |
| AI | Gemini (`gemini-2.5-flash`) via `/api/ai/chat` |
| Tests | **None** — no Jest/Vitest/mocha anywhere |

## Run commands

### Backend ([backend/package.json](backend/package.json))
- `npm run dev` — `tsx watch src/server.ts`
- `npm run build` — `tsc -p tsconfig.json`
- `npm start` — `tsx src/server.ts`
- Seed scripts (run inside Docker): `seed:slots`, `seed:scheduler-test`, `seed:all` (and `:inside` variants for direct npm execution)
- Default port: **5001** (not 5000)

### Frontend ([frontend/package.json](frontend/package.json))
- `npm run dev` — Vite on **5173**
- `npm run build` / `npm run lint` / `npm run preview`

### Google Classroom service ([google-classroom-service/package.json](google-classroom-service/package.json))
- `npm run dev` — `node --watch server.js` on **4000**

### Docker ([backend/Makefile](backend/Makefile) + [backend/docker-compose.dev.yml](backend/docker-compose.dev.yml))
- `make up` / `make down` / `make restart` / `make rebuild` / `make logs` / `make clean`
- `make db-setup` — seed default users; `make seed` — run all seeds
- `make shell` — exec into backend container
- Services: MongoDB (27017) + backend (5001, hot-reload via `tsx watch`)

## Env vars

### Backend ([backend/src/config/env.ts](backend/src/config/env.ts), example: [backend/.env.example](backend/.env.example))
- `PORT` (5001), `NODE_ENV`, `MONGODB_URI` (`mongodb://localhost:27017/timetable`)
- `ORTOOLS_PYTHON_BIN` — **hardcoded fallback `/home/muqeeth26832/.pyenv/...` will fail on other machines**; Docker overrides to `python3`
- `API_AUTH_TOKEN` (`disha-dev-token`) — **currently unused** (static-token middleware commented out)
- `AUTH_DISABLED` (bool) — skips all auth checks when true
- `JWT_SECRET`, `JWT_ACCESS_EXPIRES_IN` (15m), `JWT_REFRESH_EXPIRES_IN` (7d)
- `ADMIN_EMAIL` (`admin@timetable.edu`), `ADMIN_PASSWORD` (`AdminPass123!`)
- `CORS_ORIGIN` (`http://localhost:5173`) — but server.ts uses `origin: true` regardless
- `GEMINI_API_KEY`, `GEMINI_MODEL` (`gemini-2.5-flash`)
- `LOG_LEVEL` (debug)

### Frontend ([frontend/.env.example](frontend/.env.example))
- `VITE_API_BASE_URL` (`/api`, falls back to `http://localhost:5001/api`)

## Backend layout ([backend/src/](backend/src/))

- `server.ts` — bootstrap, CORS, /ping, mounts /api
- `config/env.ts` — env parsing
- `database/` — Mongo connection + `models/`
- `middlewares/` — `auth.middleware.ts`, `error.middleware.ts`
- `routes/index.ts` — mounts all module routers
- `modules/<feature>/` — controller → service → repository → schema (Zod)
- `shared/` — response/error helpers
- `utils/token.ts` — JWT generate/verify

### Modules ([backend/src/modules/](backend/src/modules/))
`auth`, `ai`, `catalog`, `scheduler`, `slot`, `student`, `reschedule`

### Routes mounted in [backend/src/routes/index.ts](backend/src/routes/index.ts)
| Mount | Purpose |
|---|---|
| `/api/auth` | register, login, refresh, profile (public except profile) |
| `/api/slots` | slot CRUD |
| `/api/scheduler` | `POST /generate`, `POST /assign-classrooms` |
| `/api/timetable` | save-draft, get-results, list-versions, delete-version |
| `/api/requests` | reschedule request CRUD + approve/reject |
| `/api/ai` | `POST /chat` (Gemini) |
| `/api/catalog` | courses, professors, rooms |
| `/api/student` | dashboard, courses, exams, notifications |

### Mongoose models ([backend/src/database/models/](backend/src/database/models/))
`userModel`, `courseModel`, `professorModel`, `roomModel`, `slotModel`, `timetableResultModel`, `requestModel`, `studentEnrollmentModel`, `batchCourseRequirementModel`, `examScheduleModel`, `notificationModel`.

## Frontend layout ([frontend/src/](frontend/src/))

- `main.tsx` → `App.tsx` (lazy role pages, role-based redirects, `/profile`, `/signup`)
- `pages/` — `LoginPage`, `SignUpPage`, `ProfilePage`, `admin/`, `faculty/`, `student/`
- `components/` — shared UI
- `contexts/` — `ThemeContext`, `UserContext`
- `services/` — `httpClient.ts` (axios + token refresh), `authApi.ts`, `studentApi.ts`, `classroomApi.ts`, `aiApi.js` (note: only JS file)
- `stores/` — localStorage-backed (`reschedule.store.ts`, `timetableEngine.store.ts`)
- `hooks/`, `layouts/`, `types/`, `utils/`, `validators/`, `config/`, `constants/`, `data/`, `styles/`, `shared/`

### Role-page highlights
- **Admin** ([frontend/src/pages/admin/pages/](frontend/src/pages/admin/pages/)): `AdminDashboard`, `TimetableEngine`, `TimeSlotsPage`, `TimetableVersions`, `ConflictMonitor`, `BulkRescheduling`, `ExamScheduler`, `Faculty/Courses/Rooms/Analytics/Integrations/Settings`
- **Faculty**: `FacultyDashboard`, `RescheduleRequests`
- **Student**: `StudentDashboard`, `CourseEnrollment`, `ExamSchedule`, `GoogleClassroom`, `Notifications`, `AIAssistant`

## Auth model

- **JWT only** (HS256, signed with `JWT_SECRET`); access 15m / refresh 7d
- Token payload: `{ sub, userId, role, email }`; roles: `admin | professor | student`
- All `/api/*` except auth endpoints go through [auth.middleware.ts](backend/src/middlewares/auth.middleware.ts)
- `requireRole(...roles)` middleware **exists** in auth.middleware.ts and is now used (verify per-route when editing)
- `AUTH_DISABLED=true` skips all auth (dev escape hatch)
- Static-token path is **commented out** — `API_AUTH_TOKEN` env var has no effect currently
- Password hashing: `bcryptjs`, salt rounds 12
- Frontend `httpClient.ts` handles refresh-on-401 automatically

## Python solver

- File: [backend/src/modules/scheduler/scheduleSolver.py](backend/src/modules/scheduler/scheduleSolver.py) (~723 lines)
- Library: `ortools.sat.python.cp_model`
- Invoked from [solverBridge.ts](backend/src/modules/scheduler/solverBridge.ts) — spawns Python with `env.ortoolsPythonBin`, JSON over stdin/stdout
- 10s solver timeout, 8 worker threads (Python-side)
- **No Node-side timeout** — a hung Python process hangs the request

## Gotchas / conventions

1. **`@ts-nocheck` on 8 frontend files** — mostly admin TimetableEngine and engine views + `adminApi.ts`. Avoid mass refactors there without restoring types first:
   - admin: `TimetableEngine.tsx`, `TimeSlotsPage.tsx`, `services/adminApi.ts`
   - admin/components/engine: `SlotAllocationView.tsx`, `ScheduleMatrixView.tsx`, `CourseAssignmentView.tsx`
   - faculty: `RescheduleRequests.tsx`
   - student: `GoogleClassroom.tsx`
2. **Frontend reschedule UX is partly localStorage-only**, while backend has a real `/api/requests` API with a different schema.
3. **`ORTOOLS_PYTHON_BIN` default is a hardcoded user-specific path** — must be overridden via env or Docker.
4. **CORS** — `server.ts` uses `origin: true, credentials: true` (permissive), ignoring the `CORS_ORIGIN` env var.
5. **`API_AUTH_TOKEN` is dead code** — only JWT works. Don't rely on the static-token path described in older docs.
6. **`AUTH_DISABLED=true` is a footgun** in shared/staging environments.
7. **Gemini API key is committed** in [docker-compose.dev.yml](backend/docker-compose.dev.yml) — rotate it if this repo is public.
8. **Port docs drift**: README/scheduler_context may say 5000; actual default is 5001.
9. **`aiApi.js`** is the only non-TS service file — convert if touching.
10. **No tests anywhere** — there's no safety net; verify changes manually or via the dev server.
11. **MongoDB has no transactions** in current code — multi-document writes (e.g., timetable + notifications) aren't atomic.
12. **OAuth service** has no `state` param verification and persists tokens to plain `token.json`.

## Where to look first for common tasks

| Task | File(s) |
|---|---|
| Add an API route | `backend/src/modules/<feature>/<feature>.routes.ts` then mount in [routes/index.ts](backend/src/routes/index.ts) |
| Change auth behavior | [auth.middleware.ts](backend/src/middlewares/auth.middleware.ts), [utils/token.ts](backend/src/utils/token.ts) |
| Tune solver | [scheduleSolver.py](backend/src/modules/scheduler/scheduleSolver.py), [scheduler.service.ts](backend/src/modules/scheduler/scheduler.service.ts) |
| Add slot validation | [slot.schema.ts](backend/src/modules/slot/slot.schema.ts) + [slotModel.ts](backend/src/database/models/slotModel.ts) (both layers) |
| Add a student endpoint | [backend/src/modules/student/](backend/src/modules/student/) (controller/service/repo) + [studentApi.ts](frontend/src/services/studentApi.ts) on frontend |
| Frontend HTTP client | [frontend/src/services/httpClient.ts](frontend/src/services/httpClient.ts) (handles token refresh) |
| New role page | route in `frontend/src/App.tsx` (or role page like `StudentPage.tsx`) + matching layout nav |
| Seed data | scripts under [backend/scripts/](backend/scripts/), entry via `make seed` or `npm run seed:*` |
