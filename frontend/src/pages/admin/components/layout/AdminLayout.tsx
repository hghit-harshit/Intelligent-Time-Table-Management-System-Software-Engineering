/**
 * AdminLayout — Admin-specific shell wrapping the shared AppShell.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../../../../components/AppShell";
import { colors } from "../../../../styles/tokens";
import { useUser } from "../../../../contexts/UserContext";
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
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ initials: "A", name: "Admin", subtitle: "Administrator" });

  useEffect(() => {
    if (user) {
      const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
      const name = `${user.firstName} ${user.lastName}`;
      setUserData({
        initials,
        name,
        subtitle: user.role === "admin" ? "Administrator" : user.email,
      });
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <AppShell
      navSections={navSections}
      portalSubtitle="DISHA — Admin Console"
      user={userData}
      roleBadge={{ text: "ADMIN", bg: colors.primary.main, color: "#fff" }}
      searchPlaceholder="Search courses, faculty, rooms..."
      notificationCount={3}
      settingsPath="/profile"
      onLogout={handleLogout}
      children={children}
    />
  );
}