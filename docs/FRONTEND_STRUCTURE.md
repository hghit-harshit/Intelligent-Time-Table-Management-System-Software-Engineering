# Frontend Reconstruction Guide (Student Portal Revamp)

## Scope and Canonical Files
- Student route entry: `frontend/src/pages/student/StudentPage.tsx`
- Student shell and global sidebar: `frontend/src/pages/student/components/layout/StudentLayout.tsx` + `frontend/src/components/AppShell.tsx`
- Design tokens: `frontend/src/styles/tokens.ts`
- Calendar/timetable engine: `frontend/src/pages/student/components/DayView.tsx`, `WeekView.tsx`, `calendar/TimeGrid.tsx`, `calendar/CalendarLayout.tsx`
- Courses page (student equivalent): `frontend/src/pages/student/pages/CourseEnrollment.tsx`
- Notes page (student equivalent): `frontend/src/pages/student/pages/StudentNotes.tsx`
- Tasks hook/UI: `frontend/src/pages/student/hooks/useTasks.ts`, `frontend/src/pages/student/components/tasks/TaskItem.tsx`
- Notes + Google sync hooks: `frontend/src/pages/student/hooks/useNotes.ts`, `frontend/src/pages/student/hooks/useGoogleAuth.ts`
- Google Classroom service API client (port 4000): `frontend/src/services/classroomApi.ts`
- Backend API client (port 5001): `frontend/src/services/httpClient.ts`, `frontend/src/config/constants.ts`

---

## 1) Global Design System and Theme

### 1.1 Typography Scale and Title Case Standards

### Typography system
- Source of truth is `fonts.size` in `frontend/src/styles/tokens.ts`:
  - `xs 0.6875rem` (11px)
  - `sm 0.75rem` (12px)
  - `base 0.8125rem` (13px)
  - `md 0.875rem` (14px)
  - `lg 1rem` (16px)
  - `xl 1.25rem` (20px)
  - `2xl 1.5rem` (24px)
  - `3xl 1.75rem` (28px)
- The revamped sidebar/page headers also use explicit larger values:
  - Nav item label: `fontSize: "16px"` in `AppShell` nav rows.
  - Profile name: `fontSize: "17px"` in identity card.
  - Page titles: `fonts.size["3xl"]` (28px) in `CourseEnrollment` and `StudentNotes`.
- Practical uplift pattern in the revamp is roughly the requested `~15–20%` for most UI text tiers (with some deliberate larger jumps in nav/title emphasis).

### Title case standard
- Normalization function: `toTitleCase()` in `frontend/src/utils/text.ts`.
- Rules implemented:
  - Preserves acronyms/codes (`CS201`, `AI`).
  - Keeps small words lowercased unless first/last (`and`, `of`, `to`, etc.).
  - Preserves separators like `&` and `·`.
- Applied in student pages for course names, departments, semester labels, and notes helper text.

### 1.2 Common Rounded + Shadow Container Pattern

### MUI pattern used (instead of Tailwind utility classes)
- Canonical style recipe:
```ts
{
  borderRadius: radius.xl,   // 12px
  boxShadow: shadows.sm,     // 0 1px 2px rgba(0,0,0,0.04)
  border: `1px solid ${colors.border.medium}`,
  bgcolor: colors.bg.base
}
```
- Common usage examples:
  - Course card container in `CourseEnrollment.tsx`.
  - Notes course tile in `StudentNotes.tsx`.
  - Profile identity card in `AppShell.tsx`.

### Token values
- `radius.xl = 12px`
- `shadows.sm = 0 1px 2px rgba(0,0,0,0.04)`

### 1.3 Zen Color Palette (Desaturated Professional)

### Greys
- `#FAFAFA` (bg deep)
- `#FFFFFF` (bg base/overlay)
- `#F4F4F5` (raised bg)
- `#F0F0F1` (border subtle)
- `#E2E4E9` (border medium)
- `#CBD5E1` (border strong)
- `#111827` (text primary)
- `#4B5563` (text secondary)
- `#94A3B8` (text muted)

### Blues
- `#1E3A5F` (primary main)
- `#2B4F7E` (primary light)
- `#15294A` (primary dark)
- `#2563EB` (info main)

### Sync Green
- `#16A34A` (success/sync active main)
- `#22C55E` (success light)

---

## 2) Layout and Global Navigation (`AppShell.tsx` + `StudentLayout.tsx`)

Note: `frontend/src/pages/student/components/calendar/Sidebar.tsx` is the timetable right-rail panel, not the app-level navigation sidebar.

### 2.1 Hierarchy Map
- `App`
- `StudentPage`
- `StudentLayout`
- `AppShell`
- `Sidebar`
- `Profile Identity Card`
- `Profile Popover`

Chain form: `Layout > Sidebar > Profile Identity Card > Profile Popover`.

### 2.2 Flattened Unified Navigation List
- `StudentLayout` sends one nav section with empty `label`:
  - `My Timetable`, `Courses`, `Google Classroom`, `My Notes`, `AI Assistant`.
- `AppShell` flattens any sections into one render list:
```ts
const navItems = navSections.flatMap((section) => section.items);
```
- This is the rebuilt form of navigation (no rendered `MAIN / WORKSPACE / TOOLS` headers).

### 2.3 Profile Identity Hub + Popover + Google Auth Trigger

### Clickable profile card
- The sidebar identity card is clickable:
```ts
onClick={handleProfileClick}
```
- It opens MUI `Popover` anchored to the card:
```ts
<Popover
  open={Boolean(profileAnchorEl)}
  anchorEl={profileAnchorEl}
  onClose={handleProfileClose}
  anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
  transformOrigin={{ vertical: "top", horizontal: "center" }}
/>
```

### Popover action
- Google connect/disconnect button in popover triggers:
  - `getAuthUrl()` (connect flow to port 4000 service)
  - `googleLogout()` (disconnect)
  - dispatches `window.dispatchEvent(new Event("google-auth-changed"))` after disconnect.

### 2.4 Sync Dot Logic Next to User Name
- Google badge appears only for student role.
- Icon state:
  - Connected: full color.
  - Not connected: grayscale + reduced opacity.
- Green sync dot:
```ts
{isGoogleConnected && (
  <span
    style={{
      position: "absolute",
      bottom: "-2px",
      right: "-2px",
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      background: colors.success.main,
      border: "1px solid white"
    }}
  />
)}
```
- `isGoogleConnected` source:
  - Initial `checkAuthStatus()` on mount.
  - Refresh on global `google-auth-changed` event.

---

## 3) Page Deep-Dives (Logic and Component Maps)

## 3.1 24-Hour Timetable (Day/Week + TimeGrid)

### Component map
- `StudentDashboard`
- `CalendarLayout`
- `WeekView` or `DayView`
- `TimeGrid`
- `EventBlock` overlays

### Scrollable container implementation
- Both `DayView` and `WeekView` use:
  - `height: 812`
  - `overflow: "auto"`
  - `scrollTop = 7 * HOUR_HEIGHT` after mount (autoscroll to ~7 AM).

### Red line indicator (exact snippet)
```ts
const [currentMinutes, setCurrentMinutes] = useState(() => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
});

useEffect(() => {
  const timer = setInterval(() => {
    const now = new Date();
    setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
  }, 60000);
  return () => clearInterval(timer);
}, []);

const nowTop = ((currentMinutes - startHour * 60) / 60) * hourHeight;

{nowTop >= 0 && nowTop <= gridHeight && (
  <Box
    sx={{
      position: "absolute",
      top: `${nowTop + 44}px`, // 44px is the header height
      left: "72px",
      right: 0,
      height: "1px",
      bgcolor: colors.error.main,
      zIndex: 5,
      pointerEvents: "none",
      "&::before": {
        content: '""',
        position: "absolute",
        left: "-4px",
        top: "-3px",
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        bgcolor: colors.error.main,
      },
    }}
  />
)}
```

## 3.2 Courses Page (`CourseEnrollment.tsx`, student equivalent to requested `CoursesPage.tsx`)

### Unified course tile composition
- Header icon badge + inline “Power Pairing” title:
  - `course.code` + `toTitleCase(course.name)` on one row.
- Meta line:
  - `department · semester`
- Attendance row:
  - `Attendance: X / Y`
- Next exam pill.
- CTA button: `View Details`.

### Attendance ratio logic
```ts
function buildAttendanceRatio(course: EnrolledCourse) {
  const totalClasses = Math.max(24, course.credits * 12);
  const completedClasses = Math.round((course.completion / 100) * totalClasses);
  return { completed: completedClasses, total: totalClasses };
}
```
- Rendered as:
```ts
{course.attendanceRatio.completed} / {course.attendanceRatio.total}
```

### “Next Exam” pill styling
```ts
<Box
  sx={{
    mt: 1.25,
    display: "inline-flex",
    alignItems: "center",
    alignSelf: "flex-start",
    px: 1,
    py: 0.55,
    borderRadius: radius.full,
    bgcolor: colors.info.ghost,
    color: colors.info.main,
    border: `1px solid ${colors.border.medium}`,
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.semibold,
  }}
>
  Next Exam: {course.nextExamLabel}
</Box>
```

## 3.3 My Notes Hub (`StudentNotes.tsx`, student equivalent to requested `NotesPage.tsx`)

### “Power Pairing” header (course code + name in one line)
```ts
<Typography component="div" sx={{ lineHeight: 1.25 }}>
  <Box component="span" sx={{ fontSize: fonts.size.lg, fontWeight: fonts.weight.bold, mr: 1 }}>
    {course.code}
  </Box>
  <Box component="span" sx={{ fontSize: fonts.size.md, fontWeight: fonts.weight.semibold }}>
    {toTitleCase(course.name)}
  </Box>
</Typography>
```

### Session count sub-header
```ts
<Typography sx={{ fontSize: fonts.size.sm, color: colors.text.muted, mt: 0.35 }}>
  {toTitleCase(`${sessions.length} ${sessions.length === 1 ? "session" : "sessions"} in history`)}
</Typography>
```

---

## 4) State Management and Hooks

## 4.1 `useTasks.ts`: addTask + completion flow

### addTask
```ts
const addTask = useCallback(async (input: Omit<StudentTask, "id">): Promise<StudentTask> => {
  const newTask = await httpClient.request<StudentTask>("/student/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const normalized = normalizeTask(newTask);
  setTasks((prev) => [normalized, ...prev]);
  return normalized;
}, []);
```

### toggle completion behavior
- Toggle is executed in `CalendarLayout` task details modal:
  - computes `newStatus` pending/completed
  - optimistic local state update via `setSelectedTask`
  - persists via `updateTask(taskId, { status: newStatus })`
  - warns on sync failure

### Task strikethrough + opacity (exact styling snippet)
```ts
const isCompleted = task.status === "completed";

sx={{
  opacity: isCompleted ? 0.6 : 1,
}}

sx={{
  textDecoration: isCompleted ? "line-through" : "none",
}}
```

## 4.2 `useNotes.ts`: metadata fetch path (port 4000 + 5001)

### Port 5001 backend (`httpClient`, `API_BASE_URL`)
- `POST /notes/create` to create note metadata and Google doc mapping.
- `GET /notes/course/:courseCode` to hydrate historical note availability.

### Port 4000 Google Classroom service
- `checkAuthStatus()` calls `http://localhost:4000/api/auth/status`.
- Used to set `isGoogleConnected` and gate UI states.

### Hook flow
- On mount:
  - checks Google auth status (4000).
  - loads notes metadata per course from backend (5001).
- On create:
  - calls `/notes/create` (5001).
  - stores `googleDocId` + `webViewLink`.
  - falls back to local mock id if API fails.
- Sync event:
  - listens for global `google-auth-changed` to refresh auth state.

## 4.3 AuthContext Clarification and Global Sync

### Important clarification
- There is **no dedicated `AuthContext` for Google OAuth token** in current student revamp.
- Global Google sync is implemented through:
  - shared status polling via `checkAuthStatus()` in `AppShell`, `useNotes`, `useGoogleAuth`
  - browser event bus: `window.addEventListener("google-auth-changed", ...)`

### What context exists
- `UserContext` handles app login token/profile (`timetable_access_token`) for backend auth headers.
- Google OAuth state is session-backed in the port 4000 integration service and projected into UI via status endpoint + event refresh.

### Sync chain map
- `AppShell` (sidebar dot + profile popover)
- `useNotes` (notes gating and messaging)
- `useGoogleAuth` (shared auth hook for notes/doc flows)
- all respond to `google-auth-changed`

---

## Reconstruction Checklist (Clean Branch)
- Recreate tokens first (`colors`, `fonts`, `radius`, `shadows`) and use token imports everywhere.
- Restore `StudentLayout -> AppShell` composition before rebuilding student pages.
- Rebuild unified nav list using one flattened nav section.
- Re-implement profile popover with Google connect/disconnect CTA and status dot.
- Rebuild timetable using `DayView`/`WeekView` scroll containers and `TimeGrid` red-line logic.
- Rebuild course and notes tiles with inline code+name headers and tokenized pills.
- Reconnect hooks:
  - tasks CRUD via port 5001
  - notes metadata via port 5001
  - Google auth status via port 4000
  - event sync via `google-auth-changed`.
