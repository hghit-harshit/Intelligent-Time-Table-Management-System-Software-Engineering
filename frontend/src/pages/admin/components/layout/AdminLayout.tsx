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
import { fetchPendingRequestCount } from "../../services/adminApi";

const navSections = [
  {
    label: "OVERVIEW",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/AdminPage" },
      { icon: Cpu, label: "Timetable Engine", path: "/AdminPage/engine" },
      {
        icon: RotateCcw,
        label: "Reschedule Requests",
        path: "/AdminPage/requests",
        badge: 5,
      },
      {
        icon: CalendarClock,
        label: "Exam Scheduler",
        path: "/AdminPage/exams",
      },
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
      {
        icon: ChevronsLeftRight,
        label: "Bulk Rescheduling",
        path: "/AdminPage/bulk",
      },
      {
        icon: Layers,
        label: "Timetable Versions",
        path: "/AdminPage/versions",
      },
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
  const [userData, setUserData] = useState({
    initials: "A",
    name: "Admin",
    subtitle: "Administrator",
  });
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (user) {
      const initials =
        `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
      const name = `${user.firstName} ${user.lastName}`;
      setUserData({
        initials,
        name,
        subtitle: user.role === "admin" ? "Administrator" : user.email,
      });
    }
  }, [user]);

  useEffect(() => {
    fetchPendingRequestCount()
      .then(setNotificationCount)
      .catch(() => setNotificationCount(0));
  }, []);

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
      notificationCount={notificationCount}
      notificationPath="/AdminPage/requests"
      settingsPath="/profile"
      onLogout={handleLogout}
      children={children}
    />
  );
}
