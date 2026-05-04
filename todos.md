# Admin Backend Pending Functionality TODOs
Prioritized by admin workflow impact. All items are backend features currently missing.

---

## High Priority (Core Admin Operations)
- [ ] **User Management CRUD API**
  - Create, read, update, delete users (students, faculty, admins)
  - Bulk user import via CSV
  - Faculty-specific profile management (course assignments, availability)
- [ ] **Catalog Management APIs**
  - Course CRUD (create, update, delete courses; currently only seed scripts exist)
  - Room CRUD (create, update, delete rooms; currently view-only)
  - Department CRUD (manage department names, codes, mappings)
- [ ] **Attendance System Backend**
  - AttendanceModel schema (track student attendance per class)
  - Aggregate attendance reports API (per course, batch, student)
  - Attendance export API (CSV/Excel)
- [ ] **Grading System Backend**
  - GradeModel schema (track student grades per course)
  - Aggregate grade reports/GPA calculation API
  - Grade sheet export API (CSV/Excel)
- [ ] **Report Generation APIs**
  - PDF/Excel export for published timetables
  - Attendance report export
  - Grade report export
  - User list export

---

## Medium Priority (Admin Oversight & Communication)
- [ ] **Broadcast Notification API**
  - Send announcements to all users, specific roles, or individual users
  - Store broadcast notification history
- [ ] **System Settings API**
  - Store/retrieve system configurations (academic year, semester dates, working days, class duration)
  - Manage email templates for notifications
- [ ] **Holiday & Event Management API**
  - EventModel schema (track holidays, college events, special classes)
  - CRUD endpoints for events/holidays
  - Exclude holidays from timetable generation/scheduling
- [ ] **Email Notification Integration**
  - Send email alerts to users on admin actions (reschedule approval, exam schedule, announcements)

---

## Low Priority (Advanced Admin Features)
- [ ] **Analytics Data API**
  - Provide real-time data for admin dashboard (user counts, course enrollment stats, attendance rates)
  - Replace mock data in admin analytics page
- [ ] **Integration Management API**
  - Configure external integrations (Google Classroom, LMS)
  - Manage API keys and integration settings
- [ ] **Audit Log API**
  - Track all admin actions (user changes, timetable publishes, setting updates)
  - View/download audit logs
- [ ] **Fee Management Backend**
  - FeeModel schema (track student fees, dues)
  - Fee due alerts and reports
