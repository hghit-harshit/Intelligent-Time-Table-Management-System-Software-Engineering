import { useState, useEffect } from "react";
import { Card, Button, PageHeader, Loader } from "../../../shared";
import { Save, Lock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { colors, fonts, radius, shadows } from "../../../styles/tokens";
import { AUTH_PROFILE_EP, AUTH_PROFILE_UPDATE_EP, AUTH_CHANGE_PASSWORD_EP } from "../../../constants/Api_constants";
import { getAccessToken } from "../../../services/authApi";
import { toast } from "sonner";
import { useUser } from "../../../contexts/UserContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

const labelStyle = {
  display: "block",
  fontSize: fonts.size.xs,
  color: colors.text.muted,
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
  marginBottom: "6px",
  fontWeight: 500,
};

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  background: colors.bg.base,
  border: `1px solid ${colors.border.medium}`,
  borderRadius: radius.md,
  color: colors.text.primary,
  fontSize: fonts.size.sm,
  fontFamily: fonts.body,
  outline: "none",
  boxSizing: "border-box" as const,
};

const sectionHeading = {
  fontFamily: fonts.heading,
  fontWeight: fonts.weight.semibold,
  fontSize: fonts.size.base,
  color: colors.text.primary,
  margin: "0 0 4px",
};

export default function SettingsPage() {
  const { user: ctxUser } = useUser();

  // ─── Profile state ────────────────────────────────────────────
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", email: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  // ─── Password state ───────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingPw, setSavingPw] = useState(false);

  // ─── System status ────────────────────────────────────────────
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // ─── Load profile ─────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const token = getAccessToken();
        const res = await fetch(AUTH_PROFILE_EP, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setProfile(data.data);
          setProfileForm({
            firstName: data.data.firstName || "",
            lastName: data.data.lastName || "",
            email: data.data.email || "",
          });
        }
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoadingProfile(false);
      }
    };
    load();
  }, []);

  // ─── Check backend status ─────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE.replace("/api", "")}/ping`)
      .then((r) => setBackendOnline(r.ok))
      .catch(() => setBackendOnline(false));
  }, []);

  // ─── Handlers ────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim() || !profileForm.email.trim()) {
      toast.error("All fields are required");
      return;
    }
    setSavingProfile(true);
    try {
      const token = getAccessToken();
      const res = await fetch(AUTH_PROFILE_UPDATE_EP, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      setProfile(data.data);
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (pwForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    setSavingPw(true);
    try {
      const token = getAccessToken();
      const res = await fetch(AUTH_CHANGE_PASSWORD_EP, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Password change failed");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setSavingPw(false);
    }
  };

  if (loadingProfile) return <Loader />;

  const lastLogin = profile?.lastLogin
    ? new Date(profile.lastLogin).toLocaleString("en-US", {
        month: "short", day: "numeric", year: "numeric",
        hour: "numeric", minute: "2-digit",
      })
    : "—";

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      })
    : "—";

  return (
    <div>
      <PageHeader title="System Settings" subtitle="Manage your account and view system status" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

        {/* ── Admin Profile ───────────────────────────────────── */}
        <Card style={{ padding: "20px" }} hover={false}>
          <div style={{ marginBottom: "16px" }}>
            <h3 style={sectionHeading}>Admin Profile</h3>
            <p style={{ fontSize: fonts.size.xs, color: colors.text.muted, margin: 0 }}>
              Last login: {lastLogin} &nbsp;·&nbsp; Member since: {memberSince}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={labelStyle}>First Name</label>
              <input
                style={inputStyle}
                value={profileForm.firstName}
                onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>Last Name</label>
              <input
                style={inputStyle}
                value={profileForm.lastName}
                onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              style={inputStyle}
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
            />
          </div>

          <div style={{
            padding: "8px 12px",
            background: colors.bg.raised,
            borderRadius: radius.md,
            fontSize: fonts.size.xs,
            color: colors.text.muted,
            marginBottom: "16px",
          }}>
            Role: <span style={{ color: colors.primary.main, fontWeight: fonts.weight.semibold }}>
              {profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Admin"}
            </span>
          </div>

          <Button
            variant="primary"
            onClick={handleSaveProfile}
            disabled={savingProfile}
            icon={<Save size={14} />}
            style={{ width: "100%" }}
          >
            {savingProfile ? "Saving..." : "Save Profile"}
          </Button>
        </Card>

        {/* ── Change Password ─────────────────────────────────── */}
        <Card style={{ padding: "20px" }} hover={false}>
          <div style={{ marginBottom: "16px" }}>
            <h3 style={sectionHeading}>Change Password</h3>
            <p style={{ fontSize: fonts.size.xs, color: colors.text.muted, margin: 0 }}>
              Minimum 8 characters required
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
            <div>
              <label style={labelStyle}>Current Password</label>
              <input
                type="password"
                style={inputStyle}
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label style={labelStyle}>New Password</label>
              <input
                type="password"
                style={inputStyle}
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label style={labelStyle}>Confirm New Password</label>
              <input
                type="password"
                style={inputStyle}
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                placeholder="Repeat new password"
              />
              {pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
                <p style={{ margin: "4px 0 0", fontSize: fonts.size.xs, color: colors.error.main }}>
                  Passwords do not match
                </p>
              )}
            </div>
          </div>

          <Button
            variant="primary"
            onClick={handleChangePassword}
            disabled={savingPw}
            icon={<Lock size={14} />}
            style={{ width: "100%" }}
          >
            {savingPw ? "Changing..." : "Change Password"}
          </Button>
        </Card>

        {/* ── System Status ───────────────────────────────────── */}
        <Card style={{ padding: "20px", gridColumn: "span 2" }} hover={false}>
          <h3 style={{ ...sectionHeading, marginBottom: "16px" }}>System Status</h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
            {[
              {
                label: "Backend API",
                value: backendOnline === null ? "Checking..." : backendOnline ? "Online" : "Offline",
                icon: backendOnline === null
                  ? <AlertCircle size={16} color={colors.text.muted} />
                  : backendOnline
                    ? <CheckCircle size={16} color={colors.success.main} />
                    : <XCircle size={16} color={colors.error.main} />,
                color: backendOnline === null
                  ? colors.text.muted
                  : backendOnline ? colors.success.main : colors.error.main,
              },
              {
                label: "Database",
                value: backendOnline ? "Connected" : "Unreachable",
                icon: backendOnline
                  ? <CheckCircle size={16} color={colors.success.main} />
                  : <XCircle size={16} color={colors.error.main} />,
                color: backendOnline ? colors.success.main : colors.error.main,
              },
              {
                label: "Solver Engine",
                value: "OR-Tools CP-SAT",
                icon: <CheckCircle size={16} color={colors.success.main} />,
                color: colors.success.main,
              },
              {
                label: "Auth",
                value: ctxUser ? "Active Session" : "Not logged in",
                icon: ctxUser
                  ? <CheckCircle size={16} color={colors.success.main} />
                  : <XCircle size={16} color={colors.error.main} />,
                color: ctxUser ? colors.success.main : colors.error.main,
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: "16px",
                  background: colors.bg.raised,
                  border: `1px solid ${colors.border.subtle}`,
                  borderRadius: radius.lg,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  {item.icon}
                  <span style={{ fontSize: fonts.size.xs, color: colors.text.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {item.label}
                  </span>
                </div>
                <div style={{ fontSize: fonts.size.sm, fontWeight: fonts.weight.semibold, color: item.color }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
