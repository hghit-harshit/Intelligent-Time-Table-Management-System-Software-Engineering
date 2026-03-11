/**
 * FacultyLayout — Faculty-specific shell wrapping the shared AppShell.
 * WHY: The old FacultyLayout was ~272 lines of sidebar/header code that was 95%
 *      identical to AdminLayout and StudentLayout. Now it's a thin wrapper
 *      that passes faculty-specific config into the shared AppShell component.
 */
import AppShell from "../../../../components/AppShell";
import {
  LayoutDashboard,
  CalendarClock,
  Bell,
  RotateCcw,
  BookOpen,
  Users,
  ClipboardList,
  BarChart3,
} from "lucide-react";

/** navSections — defines the sidebar navigation items for the Faculty role */
const navSections = [
  {
    label: "OVERVIEW",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/FacultyPage" },
      { icon: CalendarClock, label: "My Schedule", path: "/FacultyPage/schedule" },
      { icon: RotateCcw, label: "Reschedule Requests", path: "/FacultyPage/requests", badge: 1 },
    ],
  },
  {
    label: "ACADEMICS",
    items: [
      { icon: BookOpen, label: "My Courses", path: "/FacultyPage/courses" },
      { icon: ClipboardList, label: "Exam Schedule", path: "/FacultyPage/exams" },
      { icon: Users, label: "Student Lists", path: "/FacultyPage/students" },
    ],
  },
  {
    label: "INSIGHTS",
    items: [
      { icon: Bell, label: "Notifications", path: "/FacultyPage/notifications", badge: 2 },
      { icon: BarChart3, label: "Analytics", path: "/FacultyPage/analytics" },
    ],
  },
];

export default function FacultyLayout({ children }) {
  return (
    <AppShell
      navSections={navSections}
      portalSubtitle="DISHA — Faculty Portal"
      user={{ initials: "DR", name: "Dr. Rajesh M.", subtitle: "Dept. of ECE", avatarColor: "#7C3AED" }}
      roleBadge={{
        text: "FACULTY",
        bg: "rgba(124, 58, 237, 0.08)",
        color: "#7C3AED",
        borderColor: "rgba(124, 58, 237, 0.25)",
      }}
      searchPlaceholder="Search courses, schedules..."
      notificationCount={2}
      notificationPath="/FacultyPage/notifications"
      settingsPath="/FacultyPage/settings"
      children={children}
    />
  );
}
