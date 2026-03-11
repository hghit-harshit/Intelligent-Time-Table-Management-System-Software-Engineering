/**
 * AdminLayout — Admin-specific shell wrapping the shared AppShell.
 * WHY: The old AdminLayout was ~280 lines of sidebar/header code that was 95%
 *      identical to StudentLayout and FacultyLayout. Now it's a thin wrapper
 *      that passes admin-specific config (nav items, user info, role badge)
 *      into the shared AppShell component.
 */
import AppShell from "../../../../components/AppShell";
import { colors } from "../../../../styles/tokens";
import {
  LayoutDashboard,
  Cpu,
  AlertTriangle,
  RotateCcw,
  CalendarClock,
  BookOpen,
  Users,
  DoorOpen,
  Clock,
  Layers,
  BarChart3,
  Plug,
  Settings,
  ChevronsLeftRight,
} from "lucide-react";

/** navSections — defines the sidebar navigation items for the Admin role */
const navSections = [
  {
    label: "OVERVIEW",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/AdminPage" },
      { icon: Cpu, label: "Timetable Engine", path: "/AdminPage/engine" },
      { icon: AlertTriangle, label: "Conflict Monitor", path: "/AdminPage/conflicts" },
      { icon: RotateCcw, label: "Reschedule Requests", path: "/AdminPage/requests", badge: 5 },
      { icon: CalendarClock, label: "Exam Scheduler", path: "/AdminPage/exams" },
    ],
  },
  {
    label: "ACADEMIC STRUCTURE",
    items: [
      { icon: BookOpen, label: "Courses", path: "/AdminPage/courses" },
      { icon: Users, label: "Faculty", path: "/AdminPage/faculty" },
      { icon: DoorOpen, label: "Rooms", path: "/AdminPage/rooms" },
      { icon: Clock, label: "Time Slots", path: "/AdminPage/timeslots" },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { icon: ChevronsLeftRight, label: "Bulk Rescheduling", path: "/AdminPage/bulk" },
      { icon: Layers, label: "Timetable Versions", path: "/AdminPage/versions" },
    ],
  },
  {
    label: "INSIGHTS",
    items: [
      { icon: BarChart3, label: "Analytics", path: "/AdminPage/analytics" },
    ],
  },
  {
    label: "PLATFORM",
    items: [
      { icon: Plug, label: "Integrations", path: "/AdminPage/integrations" },
      { icon: Settings, label: "System Settings", path: "/AdminPage/settings" },
    ],
  },
];

export default function AdminLayout({ children }) {
  return (
    <AppShell
      navSections={navSections}
      portalSubtitle="DISHA — Admin Console"
      user={{ initials: "AD", name: "Admin User", subtitle: "System Administrator" }}
      roleBadge={{ text: "ADMIN", bg: colors.primary.main, color: "#fff" }}
      searchPlaceholder="Search courses, faculty, rooms..."
      notificationCount={3}
      /* Admin has no dedicated notification page or settings page in sidebar */
      children={children}
    />
  );
}
