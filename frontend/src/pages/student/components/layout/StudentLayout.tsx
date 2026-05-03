/**
 * StudentLayout — Student-specific shell wrapping the shared AppShell.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../../../../components/AppShell";
import { colors } from "../../../../styles/tokens";
import { useUser } from "../../../../contexts/UserContext";
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
import { fetchNotificationUnreadCount } from "../../../../services/studentApi";

export default function StudentLayout({ children }) {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ initials: "U", name: "User", subtitle: "" });
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (user) {
      const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
      const name = `${user.firstName} ${user.lastName}`;
      setUserData({
        initials,
        name,
        subtitle: user.email,
      });
    }
  }, [user]);

  useEffect(() => {
    fetchNotificationUnreadCount()
      .then((data) => setNotificationCount(data?.unread ?? 0))
      .catch(() => setNotificationCount(0));
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navSections = [
    {
      label: "MAIN",
      items: [
        { icon: LayoutDashboard, label: "My Timetable", path: "/StudentPage" },
        { icon: CalendarClock, label: "Exam Schedule", path: "/StudentPage/exams" },
        { icon: Bell, label: "Notifications", path: "/StudentPage/notifications", badge: notificationCount > 0 ? notificationCount : undefined },
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

  return (
    <AppShell
      navSections={navSections}
      portalSubtitle="DISHA — Student Portal"
      user={userData}
      roleBadge={{
        text: user?.role === "student" ? "Student" : user?.role?.toUpperCase() || "USER",
        bg: colors.primary.ghost,
        color: colors.primary.main,
        borderColor: colors.primary.border,
      }}
      searchPlaceholder="Search courses, assignments..."
      notificationCount={notificationCount}
      notificationPath="/StudentPage/notifications"
      settingsPath="/profile"
      onLogout={handleLogout}
      children={children}
    />
  );
}
