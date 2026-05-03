# Work TODO - Intelligent Timetable Management System

## Admin Panel

### 1. Auto Accept Requests Mode
**Status:** Missing entirely
**Priority:** Medium
**Files to modify:**
- `backend/src/models/` - Add settings model or add field to existing config
- `backend/src/modules/reschedule/reschedule.controller.ts` - Check auto-accept on request creation
- `frontend/src/pages/admin/pages/SettingsPage.tsx` - Add toggle UI

**Tasks:**
- [ ] Backend: Add `autoAcceptEnabled` setting (new model or existing config)
- [ ] Backend: Modify request creation to auto-approve when enabled (only if no conflicts)
- [ ] Frontend: Add toggle in SettingsPage for auto-accept mode
- [ ] Frontend: Show indicator when auto-accept is active

### 2. Accepted Requests Log
**Status:** Partially implemented (data exists, no dedicated view)
**Priority:** Medium
**Files to modify:**
- `backend/src/modules/reschedule/reschedule.repository.ts` - Already supports status filtering
- `backend/src/modules/reschedule/reschedule.controller.ts` - Fix to pass adminId
- `frontend/src/pages/admin/pages/RescheduleRequests.tsx` - Already has Approved tab
- `frontend/src/services/adminApi.ts:142-149` - Fix empty body in updateRequestStatus

**Tasks:**
- [ ] Fix `updateRequestStatus` in `adminApi.ts` to pass adminId in request body
- [ ] Populate `reviewedBy` and `reviewedAt` properly on approve/reject
- [ ] Add dedicated "Request History" page or enhance existing Approved tab with reviewer info
- [ ] Populate `recentActivity` in dashboard with recent approval/rejection events
- [ ] Optional: Add admin notes/comments field to request schema

### 3. Fix Notification Popup Count
**Status:** Partially implemented (hardcoded to 3)
**Priority:** High
**Files to modify:**
- `frontend/src/layouts/AdminLayout.tsx:117` - Hardcoded `notificationCount={3}`
- `frontend/src/components/AppShell.tsx:473-476` - Badge renders but `notificationPath` not passed
- `backend/src/modules/reschedule/` - Need endpoint for pending request count

**Tasks:**
- [ ] Backend: Add `GET /requests/pending-count` endpoint (or use existing filtered query)
- [ ] Frontend: Fetch pending count on AdminLayout mount
- [ ] Frontend: Pass dynamic `notificationCount` to AppShell
- [ ] Frontend: Pass `notificationPath` to make bell icon clickable
- [ ] Frontend: Create admin notifications page or link to requests page

### 4. Dashboard Timetable - Show Slot in Modal
**Status:** Fully implemented
**Files:**
- `frontend/src/pages/admin/components/dashboard/TimetablePreview.tsx`

**Note:** Already working. Clicking a timetable cell opens modal showing courses with slot info (professor, batch, room, students, constraints).

### 5. Click Published to Go to Versions Page
**Status:** Missing entirely
**Priority:** High
**Files to modify:**
- `frontend/src/pages/admin/components/dashboard/TimetablePreview.tsx:131` - Version text not clickable

**Tasks:**
- [ ] Make version text clickable with `useNavigate()` to `/AdminPage/versions`
- [ ] Add visual indicator (link styling or icon) to show it's clickable

### 6. Timetable Version History
**Status:** Fully implemented
**Files:**
- `frontend/src/pages/admin/pages/TimetableViewsPage.tsx` (TimetableVersions)
- `backend/src/routes/timetable.routes.ts` - GET /versions endpoint

**Note:** Already working. Shows all versions with status badges, dates, assignment counts.

### 7. Apply/Publish Previous Versions
**Status:** Fully implemented
**Files:**
- `frontend/src/pages/admin/pages/TimetableViewsPage.tsx:188-201` - handlePublish
- `backend/src/routes/timetable.routes.ts:77-111` - Publish endpoint

**Note:** Already working. Can publish any previous version with confirmation modal.

### 8. Commit Message for Version Changes
**Status:** Missing entirely
**Priority:** High
**Files to modify:**
- `backend/src/database/models/timetableResultModel.ts` - Add commitMessage field
- `backend/src/routes/timetable.routes.ts` - Update saveDraft and publish schemas
- `frontend/src/pages/admin/pages/TimetableViewsPage.tsx` - Add text input in modals

**Tasks:**
- [ ] Backend: Add `commitMessage: { type: String }` to timetableResultSchema
- [ ] Backend: Update saveDraftSchema to require/accept commitMessage
- [ ] Backend: Update publishSchema to accept commitMessage
- [ ] Frontend: Add textarea input in publish confirmation modal
- [ ] Frontend: Add optional commit message when saving drafts
- [ ] Frontend: Display commit messages in version history cards

### 9. Show Slots Beside Credits in Courses Page
**Status:** Missing entirely
**Priority:** Medium
**Files to modify:**
- `frontend/src/pages/admin/pages/CoursesPage.tsx:25-43` - Columns definition
- `frontend/src/services/adminApi.ts:398-413` - fetchCourses mapping

**Tasks:**
- [ ] Backend: Verify course model has slot associations or compute from timetable
- [ ] Frontend: Add "Slots" column to courses table after Credits column
- [ ] Frontend: Update fetchCourses to include slot data
- [ ] Frontend: Display slot count or slot labels per course

### 10. Download Timetable as Excel File
**Status:** Missing entirely
**Priority:** Medium
**Files to modify:**
- `frontend/package.json` - Add xlsx dependency
- Multiple admin pages - Add download buttons
- `frontend/src/pages/admin/pages/TimetableViewsPage.tsx` - Has unused Download icon

**Tasks:**
- [ ] Install `xlsx` package: `npm install xlsx`
- [ ] Create Excel export utility function
- [ ] Add download button to TimetableVersions page
- [ ] Add download button to Courses page
- [ ] Add download button to RescheduleRequests page
- [ ] Support exporting timetable assignments grid
- [ ] Support exporting course list, faculty list, rooms list

---

## Student Panel

### 11. Fix Exam Schedule Notifications Count API
**Status:** Partially implemented (hardcoded to 3)
**Priority:** High
**Files to modify:**
- `backend/src/modules/student/student.controller.ts` - Add unread count endpoint
- `backend/src/modules/student/student.routes.ts` - Add route
- `frontend/src/services/studentApi.ts` - Add fetch function
- `frontend/src/layouts/StudentLayout.tsx:27-28,84` - Remove hardcoded badges

**Tasks:**
- [ ] Backend: Add `GET /student/notifications/unread-count` endpoint
- [ ] Backend: Return `{ unread: number, examNotifications: number }`
- [ ] Frontend: Add `fetchNotificationUnreadCount()` to studentApi.ts
- [ ] Frontend: Fetch count on StudentLayout mount
- [ ] Frontend: Pass dynamic badge counts to nav items
- [ ] Frontend: Pass dynamic `notificationCount` to AppShell

### 12. Workspace Features - My Notes
**Status:** Missing entirely (nav link exists but broken)
**Priority:** High
**Files to create/modify:**
- `backend/src/models/noteModel.ts` - New model
- `backend/src/modules/workspace/` - New module (controller, routes, service)
- `frontend/src/pages/student/pages/NotesPage.tsx` - New page
- `frontend/src/services/studentApi.ts` - Add note API functions
- `frontend/src/pages/student/StudentPage.tsx` - Add route

**Tasks:**
- [ ] Backend: Create Note model (title, content, studentId, createdAt, updatedAt, tags)
- [ ] Backend: Create workspace module with CRUD endpoints for notes
- [ ] Frontend: Create NotesPage with create/edit/delete/list functionality
- [ ] Frontend: Add `/StudentPage/notes` route in StudentPage.tsx
- [ ] Frontend: Add API service functions
- [ ] Frontend: Rich text editor or markdown support (optional)

### 13. Workspace Features - Tasks
**Status:** Missing entirely (nav link exists but broken)
**Priority:** High
**Files to create/modify:**
- `backend/src/models/taskModel.ts` - New model
- `backend/src/modules/workspace/` - Extend workspace module
- `frontend/src/pages/student/pages/TasksPage.tsx` - New page
- `frontend/src/services/studentApi.ts` - Add task API functions
- `frontend/src/pages/student/StudentPage.tsx` - Add route

**Tasks:**
- [ ] Backend: Create Task model (title, description, studentId, dueDate, priority, status, courseId)
- [ ] Backend: Add CRUD endpoints for tasks in workspace module
- [ ] Frontend: Create TasksPage with create/edit/delete/list, filter by status/priority
- [ ] Frontend: Add `/StudentPage/tasks` route in StudentPage.tsx
- [ ] Frontend: Add API service functions
- [ ] Frontend: Mark as complete, due date tracking

### 14. Workspace Features - Reminders
**Status:** Missing entirely (nav link exists but broken)
**Priority:** Medium
**Files to create/modify:**
- `backend/src/models/reminderModel.ts` - New model
- `backend/src/modules/workspace/` - Extend workspace module
- `frontend/src/pages/student/pages/RemindersPage.tsx` - New page
- `frontend/src/services/studentApi.ts` - Add reminder API functions
- `frontend/src/pages/student/StudentPage.tsx` - Add route

**Tasks:**
- [ ] Backend: Create Reminder model (title, message, studentId, remindAt, type, relatedCourseId, relatedExamId)
- [ ] Backend: Add CRUD endpoints for reminders in workspace module
- [ ] Frontend: Create RemindersPage with create/edit/delete/list
- [ ] Frontend: Add `/StudentPage/reminders` route in StudentPage.tsx
- [ ] Frontend: Add API service functions
- [ ] Frontend: Notification when reminder time arrives (optional)

### 15. Integrations Page - Student
**Status:** Missing entirely (nav link exists but route not defined)
**Priority:** Medium
**Files to modify:**
- `frontend/src/pages/student/StudentPage.tsx` - Add route
- `frontend/src/pages/student/pages/StudentIntegrationsPage.tsx` - New page (or reuse admin component)

**Tasks:**
- [ ] Create StudentIntegrationsPage or extract reusable Integrations component
- [ ] Add `/StudentPage/integrations` route in StudentPage.tsx
- [ ] Show Google Classroom integration status
- [ ] Show connected services and their status

### 16. Integrations Page - Admin (Make Functional)
**Status:** Partially implemented (static/mock data only)
**Priority:** Low
**Files to modify:**
- `frontend/src/pages/admin/pages/IntegrationsPage.tsx` - Currently static
- Backend: Optional - Create integration status API

**Tasks:**
- [ ] Make integration status dynamic (fetch from backend or Google Classroom service)
- [ ] Add connect/disconnect functionality for each integration
- [ ] Show real OAuth status for Google Classroom
- [ ] Add configuration options for each integration

---

## Summary by Priority

### High Priority (6 items)
1. Fix notification popup count (Admin)
2. Click published to go to versions page
3. Commit message for version changes
4. Fix exam schedule notifications count API (Student)
5. Workspace - My Notes
6. Workspace - Tasks

### Medium Priority (6 items)
1. Auto accept requests mode
2. Accepted requests log
3. Show slots beside credits in courses page
4. Download timetable as Excel file
5. Workspace - Reminders
6. Integrations page - Student

### Low Priority (1 item)
1. Integrations page - Admin (make functional)

### Already Implemented (4 items)
1. Dashboard timetable - show slot in modal
2. Timetable version history
3. Apply/publish previous versions
4. Timetable versions page
