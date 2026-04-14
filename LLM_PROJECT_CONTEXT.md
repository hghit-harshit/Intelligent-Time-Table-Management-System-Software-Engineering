# LLM Project Context: Intelligent Time Table Management System (DISHA)

## 1) What this project is
DISHA is a role-based timetable management web app with three user portals:
- Student portal
- Faculty portal
- Admin portal

It currently mixes real backend APIs, mock frontend data, and localStorage-based state.

## 2) Runtime architecture
Three separate services are expected during development:
- Main backend: Express + MongoDB on port 5000
- Google Classroom service: Express + Google APIs on port 4000
- Frontend: React + Vite on port 5173

## 3) Tech stack
- Frontend: React 19, Vite 7, React Router, MUI v7, lucide-react, Tailwind v4
- Backend: Node.js, Express, Mongoose, MongoDB
- Google integration: googleapis + OAuth2 flow

## 4) Route map
### Frontend top-level routes
Defined in frontend/src/App.jsx:
- / -> LoginPage
- /StudentPage/* -> StudentPage
- /FacultyPage/* -> FacultyPage
- /AdminPage/* -> AdminPage

### Student routes
Defined in frontend/src/pages/student/StudentPage.jsx:
- index -> StudentDashboard
- exams -> ExamSchedule
- notifications -> Notifications
- courses -> CourseEnrollment
- google-classroom -> GoogleClassroom

### Faculty routes
Defined in frontend/src/pages/faculty/FacultyPage.jsx:
- index -> FacultyDashboard
- requests -> RescheduleRequests
- exams -> Student ExamSchedule (shared)
- notifications -> Student Notifications (shared)

### Admin routes
Defined in frontend/src/pages/admin/AdminPage.jsx:
- index -> AdminDashboard
- engine, conflicts, requests, exams, courses, faculty, rooms, timeslots, bulk, versions, analytics, integrations, settings

## 5) Backend API surface (current)
Defined directly in backend/server.js:
- GET /api/slots
- POST /api/slots
- GET /api/requests
- POST /api/requests

Note:
- backend/controllers/rescheduleController.js and backend/routes/rescheduleRoutes.js exist, but backend/server.js is currently using inline request routes and imports Request directly.

## 6) Data flow reality (important)
Reschedule requests currently have two patterns:
- Frontend localStorage store: frontend/src/data/rescheduleStore.js
  - Used by faculty RescheduleRequests page
  - Used by admin adminApi for fetch/update status
- Backend Mongo requests API exists (GET/POST), but most admin/faculty UI is now wired to localStorage for request workflows.

This means browser-local state is the main source for request approval UI right now.

## 7) Key integration points
Google Classroom integration:
- Frontend API wrapper: frontend/src/services/classroomApi.js
- Service backend: google-classroom-service/server.js
- OAuth callback redirects to: /StudentPage/google-classroom
- Token persistence: google-classroom-service/token.json

## 8) Known implementation status
What is real:
- Role-based routing and portal layouts
- Mongo models for Slot and Request
- Basic slot/request endpoints in backend/server.js
- Google OAuth and assignment fetch service

What is mocked/stubbed:
- Most admin feature pages use frontend/src/data/adminMockData.js through frontend/src/pages/admin/services/adminApi.js
- No auth/JWT/role enforcement
- Several admin pages are presentational placeholders

## 9) Full source file index
This section lists all source files so another LLM can navigate quickly.

### backend
- backend/server.js
- backend/.env.example
- backend/package.json
- backend/models/Request.js
- backend/models/Slot.js
- backend/controllers/rescheduleController.js
- backend/routes/rescheduleRoutes.js

### google-classroom-service
- google-classroom-service/server.js
- google-classroom-service/package.json
- google-classroom-service/credentials.json
- google-classroom-service/token.json

### frontend/src core
- frontend/src/main.jsx
- frontend/src/App.jsx
- frontend/src/App.css
- frontend/src/index.css

### frontend/src components
- frontend/src/components/AppShell.jsx
- frontend/src/components/CalendarView.jsx
- frontend/src/components/Layout.jsx

### frontend/src styles
- frontend/src/styles/theme.js
- frontend/src/styles/tokens.js

### frontend/src data
- frontend/src/data/adminMockData.js
- frontend/src/data/courseEnrollmentData.json
- frontend/src/data/rescheduleStore.js
- frontend/src/data/timetableData.json
- frontend/src/data/timetableSlots.csv

### frontend/src services
- frontend/src/services/classroomApi.js

### frontend/src pages root
- frontend/src/pages/LoginPage.jsx

### frontend/src pages student
- frontend/src/pages/student/StudentPage.jsx
- frontend/src/pages/student/components/CalendarCard.jsx
- frontend/src/pages/student/components/ClassDetailsModal.jsx
- frontend/src/pages/student/components/DayView.jsx
- frontend/src/pages/student/components/MonthView.jsx
- frontend/src/pages/student/components/QuickActions.jsx
- frontend/src/pages/student/components/StatsCards.jsx
- frontend/src/pages/student/components/TodaysClasses.jsx
- frontend/src/pages/student/components/TopBar.jsx
- frontend/src/pages/student/components/UpcomingEvents.jsx
- frontend/src/pages/student/components/WeekView.jsx
- frontend/src/pages/student/components/layout/StudentLayout.jsx
- frontend/src/pages/student/pages/CourseEnrollment.jsx
- frontend/src/pages/student/pages/ExamSchedule.jsx
- frontend/src/pages/student/pages/GoogleClassroom.jsx
- frontend/src/pages/student/pages/Notifications.jsx
- frontend/src/pages/student/pages/StudentDashboard.jsx

### frontend/src pages faculty
- frontend/src/pages/faculty/FacultyPage.jsx
- frontend/src/pages/faculty/components/layout/FacultyLayout.jsx
- frontend/src/pages/faculty/pages/FacultyDashboard.jsx
- frontend/src/pages/faculty/pages/RescheduleRequests.jsx

### frontend/src pages admin
- frontend/src/pages/admin/AdminPage.jsx
- frontend/src/pages/admin/components/layout/AdminLayout.jsx
- frontend/src/pages/admin/components/dashboard/ActivityFeed.jsx
- frontend/src/pages/admin/components/dashboard/AdminQuickActions.jsx
- frontend/src/pages/admin/components/dashboard/AlertsPanel.jsx
- frontend/src/pages/admin/components/dashboard/MetricsCards.jsx
- frontend/src/pages/admin/components/dashboard/PendingApprovals.jsx
- frontend/src/pages/admin/components/ui/index.jsx
- frontend/src/pages/admin/pages/AdminDashboard.jsx
- frontend/src/pages/admin/pages/AnalyticsPage.jsx
- frontend/src/pages/admin/pages/BulkRescheduling.jsx
- frontend/src/pages/admin/pages/ConflictMonitor.jsx
- frontend/src/pages/admin/pages/CoursesPage.jsx
- frontend/src/pages/admin/pages/ExamScheduler.jsx
- frontend/src/pages/admin/pages/FacultyPage.jsx
- frontend/src/pages/admin/pages/IntegrationsPage.jsx
- frontend/src/pages/admin/pages/RescheduleRequests.jsx
- frontend/src/pages/admin/pages/RoomsPage.jsx
- frontend/src/pages/admin/pages/SettingsPage.jsx
- frontend/src/pages/admin/pages/TimeSlotsPage.jsx
- frontend/src/pages/admin/pages/TimetableEngine.jsx
- frontend/src/pages/admin/pages/TimetableVersions.jsx
- frontend/src/pages/admin/services/adminApi.js

## 10) Fast orientation for another LLM
If another LLM is asked to implement a feature, it should start with:
1. frontend/src/App.jsx
2. The relevant role router (StudentPage.jsx, FacultyPage.jsx, AdminPage.jsx)
3. The relevant page file
4. Data source for that page:
   - adminMockData.js/adminApi.js for admin features
   - rescheduleStore.js for current request workflow
   - backend/server.js for live API-backed slots/requests
5. google-classroom-service/server.js for classroom/OAuth features

## 11) Current risks and caveats
- No auth/authorization; role selection is client-side navigation only.
- Backend request routes are duplicated conceptually (inline in server.js plus controller/router files).
- Reschedule workflows are localStorage-driven in frontend, not consistently backend-persisted.
- credentials.json and token.json are present in workspace; treat as sensitive in real deployment.
- Faculty page reuses student exam/notification pages.

## 12) Suggested next normalization (optional)
- Consolidate request API routing: use backend/routes/rescheduleRoutes.js from backend/server.js and remove duplicate inline logic.
- Move faculty/admin request UI from localStorage to backend API.
- Add auth and role guards.
- Replace mock adminApi with real API endpoints incrementally.
