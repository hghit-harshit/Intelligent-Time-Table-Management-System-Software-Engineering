/**
 * StudentLayout — Student-specific shell wrapping the shared AppShell.
 * WHY: The old StudentLayout was ~274 lines of sidebar/header code that was 95%
 *      identical to AdminLayout and FacultyLayout. Now it's a thin wrapper
 *      that passes student-specific config into the shared AppShell component.
 */
import AppShell from "../../../../components/AppShell";
import { colors } from "../../../../styles/tokens";
import {
  LayoutDashboard,
  CalendarClock,
  Bell,
  BookOpen,
  GraduationCap,
  StickyNote,
  CheckSquare,
  AlarmClock,
  Sparkles,
  Plug,
} from "lucide-react";

/** navSections — defines the sidebar navigation items for the Student role */
const navSections = [
  {
    label: "MAIN",
    items: [
      { icon: LayoutDashboard, label: "My Timetable", path: "/StudentPage" },
      { icon: CalendarClock, label: "Exam Schedule", path: "/StudentPage/exams", badge: 3 },
      { icon: Bell, label: "Notifications", path: "/StudentPage/notifications", badge: 3 },
      { icon: BookOpen, label: "Courses", path: "/StudentPage/courses" },
      { icon: GraduationCap, label: "Google Classroom", path: "/StudentPage/google-classroom" },
    ],
  },
  {
    label: "WORKSPACE",
    items: [
      { icon: StickyNote, label: "My Notes", path: "/StudentPage/notes" },
      { icon: CheckSquare, label: "Tasks", path: "/StudentPage/tasks" },
      { icon: AlarmClock, label: "Reminders", path: "/StudentPage/reminders" },
    ],
  },
  {
    label: "TOOLS",
    items: [
      { icon: Sparkles, label: "AI Assistant", path: "/StudentPage/ai" },
      { icon: Plug, label: "Integrations", path: "/StudentPage/integrations" },
    ],
  },
];

export default function StudentLayout({ children }) {
  return (
    <AppShell
      navSections={navSections}
      portalSubtitle="DISHA — Student Portal"
      user={{ initials: "RK", name: "Rishikesh K.", subtitle: "ES23BTECH11033" }}
      roleBadge={{
        text: "Y2S2",
        bg: colors.primary.ghost,
        color: colors.primary.main,
        borderColor: colors.primary.border,
      }}
      searchPlaceholder="Search courses, assignments..."
      notificationCount={3}
      notificationPath="/StudentPage/notifications"
      settingsPath="/StudentPage/settings"
      children={children}
    />
  );
}
