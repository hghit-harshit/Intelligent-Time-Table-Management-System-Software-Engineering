/**
 * StudentLayout — Student-specific shell wrapping the shared AppShell.
 *
 * Revamped per DISHA UI Guide:
 * - Single flat nav list: My Timetable, Courses, Google Classroom, My Notes, AI Assistant
 * - No MAIN / WORKSPACE / TOOLS section headers
 * - Google auth state passed down for profile popover
 */
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../../../../components/AppShell";
import { colors } from "../../../../styles/tokens";
import { useUser } from "../../../../contexts/UserContext";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  StickyNote,
  Sparkles,
} from "lucide-react";

// Google Classroom service (port 8000)
const GCS_BASE = "http://localhost:8000";

async function checkAuthStatus(): Promise<boolean> {
  try {
    const res = await fetch(`${GCS_BASE}/api/auth/status`, { credentials: "include" });
    const data = await res.json();
    return data?.isAuthenticated === true;
  } catch {
    return false;
  }
}

async function getAuthUrl(): Promise<string | null> {
  try {
    const res = await fetch(`${GCS_BASE}/api/auth/url`, { credentials: "include" });
    const data = await res.json();
    return data?.url || null;
  } catch {
    return null;
  }
}

async function googleLogout(): Promise<void> {
  try {
    await fetch(`${GCS_BASE}/api/auth/logout`, { method: "POST", credentials: "include" });
  } catch {
    /* ignore */
  }
}

export default function StudentLayout({ children }) {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ initials: "U", name: "User", subtitle: "" });
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  useEffect(() => {
    if (user) {
      const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
      const name = `${user.firstName} ${user.lastName}`;
      setUserData({ initials, name, subtitle: user.email });
    }
  }, [user]);


  // Check Google auth status on mount and on global event
  const refreshGoogleAuth = useCallback(async () => {
    const status = await checkAuthStatus();
    setIsGoogleConnected(status);
  }, []);

  useEffect(() => {
    refreshGoogleAuth();
    window.addEventListener("google-auth-changed", refreshGoogleAuth);
    return () => window.removeEventListener("google-auth-changed", refreshGoogleAuth);
  }, [refreshGoogleAuth]);

  const handleConnectGoogle = async () => {
    const url = await getAuthUrl();
    if (url) window.location.href = url;
  };

  const handleDisconnectGoogle = async () => {
    await googleLogout();
    setIsGoogleConnected(false);
    window.dispatchEvent(new Event("google-auth-changed"));
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Single flat nav — no section headers per spec
  const navSections = [
    {
      label: "",
      items: [
        { icon: LayoutDashboard, label: "My Timetable", path: "/StudentPage" },
        { icon: BookOpen, label: "Courses", path: "/StudentPage/courses" },
        { icon: GraduationCap, label: "Google Classroom", path: "/StudentPage/google-classroom" },
        { icon: StickyNote, label: "My Notes", path: "/StudentPage/notes" },
        { icon: Sparkles, label: "AI Assistant", path: "/StudentPage/ai" },
      ],
    },
  ];

  return (
    <AppShell
      navSections={navSections}
      portalSubtitle="DISHA — Student Portal"
      user={userData}
      roleBadge={{
        text: "Student",
        bg: colors.primary.ghost,
        color: colors.primary.main,
        borderColor: colors.primary.border,
      }}
      searchPlaceholder={null}
      notificationCount={0}
      settingsPath="/profile"
      onLogout={handleLogout}
      isGoogleConnected={isGoogleConnected}
      onConnectGoogle={handleConnectGoogle}
      onDisconnectGoogle={handleDisconnectGoogle}
      userEmail={user?.email || ""}
    >
      {children}
    </AppShell>
  );
}
