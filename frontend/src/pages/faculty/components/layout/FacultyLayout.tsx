/**
 * FacultyLayout — Faculty-specific shell wrapping the shared AppShell.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../../../../components/AppShell";
import { useUser } from "../../../../contexts/UserContext";
import { fetchRescheduleRequests } from "../../../../services/facultyApi";
import {
  LayoutDashboard,
  RotateCcw,
  BookOpen,
  ClipboardList,
} from "lucide-react";

export default function FacultyLayout({ children }) {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ initials: "F", name: "Faculty", subtitle: "" });
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  useEffect(() => {
    if (user) {
      const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
      const name = `Prof. ${user.firstName} ${user.lastName}`;
      setUserData({ initials, name, subtitle: user.email });

      fetchRescheduleRequests(user._id)
        .then((data) => {
          const list = Array.isArray(data) ? data : [];
          setPendingRequestCount(list.filter((r) => r.status === "pending").length);
        })
        .catch(() => setPendingRequestCount(0));
    }
  }, [user]);

  const navSections = [
    {
      label: "",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", path: "/FacultyPage" },
        {
          icon: RotateCcw,
          label: "Reschedule Requests",
          path: "/FacultyPage/requests",
          badge: pendingRequestCount > 0 ? pendingRequestCount : undefined,
        },
        { icon: BookOpen, label: "My Courses", path: "/FacultyPage/courses" },
        { icon: ClipboardList, label: "Exam Schedule", path: "/FacultyPage/exams" },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <AppShell
      navSections={navSections}
      portalSubtitle="DISHA — Faculty Portal"
      user={userData}
      roleBadge={{
        text: "FACULTY",
        bg: "rgba(124, 58, 237, 0.08)",
        color: "#7C3AED",
      }}
      notificationPath={null}
      settingsPath={null}
      onLogout={handleLogout}
      children={children}
    />
  );
}
