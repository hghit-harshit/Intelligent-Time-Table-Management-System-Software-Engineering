import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Switch from "@mui/material/Switch";
import { register } from "../services/authApi";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  GraduationCap,
  Users,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import { useThemeMode } from "../contexts/ThemeContext";

const roles = [
  {
    id: "student",
    label: "Student",
    icon: GraduationCap,
    desc: "View schedule & enroll",
  },
  {
    id: "professor",
    label: "Faculty",
    icon: Users,
    desc: "Teach & manage courses",
  },
  { id: "admin", label: "Admin", icon: Settings, desc: "Manage system" },
];

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { mode, toggleTheme } = useThemeMode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      await register({
        firstName,
        lastName,
        email,
        password,
        role: role as "admin" | "professor" | "student",
      });
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const isDark = mode === "dark";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: isDark ? "#09090b" : "#f8fafc",
        p: 2,
      }}
    >
      {/* Theme toggle */}
      <Box
        onClick={toggleTheme}
        sx={{
          position: "fixed",
          top: 20,
          right: 20,
          display: "flex",
          alignItems: "center",
          gap: 1,
          p: 1,
          borderRadius: 2,
          cursor: "pointer",
          bgcolor: isDark ? "#18181b" : "#fff",
          border: `1px solid ${isDark ? "#27272a" : "#e2e8f0"}`,
        }}
      >
        {isDark ? <Moon size={18} /> : <Sun size={18} />}
        <Switch checked={isDark} size="small" />
      </Box>

      <Box
        sx={{
          width: "100%",
          maxWidth: 380,
          bgcolor: isDark ? "#18181b" : "#ffffff",
          borderRadius: 3,
          p: "32px 28px",
          boxShadow: isDark ? "none" : "0 4px 24px rgba(0,0,0,0.06)",
          border: `1px solid ${isDark ? "#27272a" : "#e2e8f0"}`,
        }}
      >
        {/* Logo */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              background: "linear-gradient(135deg, #2563eb, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>
              S
            </Typography>
          </Box>
          <Typography
            sx={{
              color: isDark ? "#fafafa" : "#0f172a",
              fontWeight: 600,
              fontSize: 22,
            }}
          >
            Create Account
          </Typography>
          <Typography
            sx={{
              color: isDark ? "#a1a1aa" : "#64748b",
              fontSize: 14,
              mt: 0.5,
            }}
          >
            Join Smart Timetable
          </Typography>
        </Box>

        {/* Role tabs */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            mb: 3,
            p: 0.5,
            bgcolor: isDark ? "#09090b" : "#f1f5f9",
            borderRadius: 2,
          }}
        >
          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = role === r.id;
            return (
              <Box
                key={r.id}
                onClick={() => setRole(r.id)}
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 1,
                  borderRadius: 1.5,
                  cursor: "pointer",
                  bgcolor: isActive
                    ? isDark
                      ? "#18181b"
                      : "#ffffff"
                    : "transparent",
                  color: isActive
                    ? isDark
                      ? "#fafafa"
                      : "#0f172a"
                    : isDark
                      ? "#71717a"
                      : "#94a3b8",
                  transition: "all 0.2s",
                  boxShadow: isActive
                    ? isDark
                      ? "0 1px 3px rgba(0,0,0,0.3)"
                      : "0 1px 3px rgba(0,0,0,0.08)"
                    : "none",
                }}
              >
                <Icon size={16} />
              </Box>
            );
          })}
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              bgcolor: isDark ? "#7f1d1d" : "#fef2f2",
              color: isDark ? "#fecaca" : "#dc2626",
              border: `1px solid ${isDark ? "#991b1b" : "#fecaca"}`,
            }}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <User size={16} color={isDark ? "#71717a" : "#94a3b8"} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: isDark ? "#09090b" : "#f8fafc",
                  borderRadius: 2,
                  "& fieldset": { borderColor: isDark ? "#27272a" : "#e2e8f0" },
                  "&:hover fieldset": {
                    borderColor: isDark ? "#3f3f46" : "#cbd5e1",
                  },
                  "&.Mui-focused fieldset": { borderColor: "#2563eb" },
                },
                "& .MuiInputLabel-root": {
                  color: isDark ? "#a1a1aa" : "#64748b",
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#2563eb" },
                "& .MuiOutlinedInput-input": {
                  color: isDark ? "#fafafa" : "#0f172a",
                  fontSize: 14,
                },
              }}
            />
            <TextField
              fullWidth
              size="small"
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: isDark ? "#09090b" : "#f8fafc",
                  borderRadius: 2,
                  "& fieldset": { borderColor: isDark ? "#27272a" : "#e2e8f0" },
                  "&:hover fieldset": {
                    borderColor: isDark ? "#3f3f46" : "#cbd5e1",
                  },
                  "&.Mui-focused fieldset": { borderColor: "#2563eb" },
                },
                "& .MuiInputLabel-root": {
                  color: isDark ? "#a1a1aa" : "#64748b",
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#2563eb" },
                "& .MuiOutlinedInput-input": {
                  color: isDark ? "#fafafa" : "#0f172a",
                  fontSize: 14,
                },
              }}
            />
          </Box>

          <TextField
            fullWidth
            size="small"
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@university.edu"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Mail size={16} color={isDark ? "#71717a" : "#94a3b8"} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                bgcolor: isDark ? "#09090b" : "#f8fafc",
                borderRadius: 2,
                "& fieldset": { borderColor: isDark ? "#27272a" : "#e2e8f0" },
                "&:hover fieldset": {
                  borderColor: isDark ? "#3f3f46" : "#cbd5e1",
                },
                "&.Mui-focused fieldset": { borderColor: "#2563eb" },
              },
              "& .MuiInputLabel-root": {
                color: isDark ? "#a1a1aa" : "#64748b",
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#2563eb" },
              "& .MuiOutlinedInput-input": {
                color: isDark ? "#fafafa" : "#0f172a",
                fontSize: 14,
              },
            }}
          />

          <TextField
            fullWidth
            size="small"
            type={showPassword ? "text" : "password"}
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Min 8 characters"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock size={16} color={isDark ? "#71717a" : "#94a3b8"} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? (
                      <EyeOff
                        size={16}
                        color={isDark ? "#71717a" : "#94a3b8"}
                      />
                    ) : (
                      <Eye size={16} color={isDark ? "#71717a" : "#94a3b8"} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                bgcolor: isDark ? "#09090b" : "#f8fafc",
                borderRadius: 2,
                "& fieldset": { borderColor: isDark ? "#27272a" : "#e2e8f0" },
                "&:hover fieldset": {
                  borderColor: isDark ? "#3f3f46" : "#cbd5e1",
                },
                "&.Mui-focused fieldset": { borderColor: "#2563eb" },
              },
              "& .MuiInputLabel-root": {
                color: isDark ? "#a1a1aa" : "#64748b",
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#2563eb" },
              "& .MuiOutlinedInput-input": {
                color: isDark ? "#fafafa" : "#0f172a",
                fontSize: 14,
              },
            }}
          />

          <TextField
            fullWidth
            size="small"
            type={showPassword ? "text" : "password"}
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock size={16} color={isDark ? "#71717a" : "#94a3b8"} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                bgcolor: isDark ? "#09090b" : "#f8fafc",
                borderRadius: 2,
                "& fieldset": { borderColor: isDark ? "#27272a" : "#e2e8f0" },
                "&:hover fieldset": {
                  borderColor: isDark ? "#3f3f46" : "#cbd5e1",
                },
                "&.Mui-focused fieldset": { borderColor: "#2563eb" },
              },
              "& .MuiInputLabel-root": {
                color: isDark ? "#a1a1aa" : "#64748b",
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#2563eb" },
              "& .MuiOutlinedInput-input": {
                color: isDark ? "#fafafa" : "#0f172a",
                fontSize: 14,
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: 2,
              bgcolor: "#2563eb",
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              "&:hover": { bgcolor: "#1d4ed8" },
              "&:disabled": {
                bgcolor: isDark ? "#27272a" : "#e2e8f0",
                color: isDark ? "#52525b" : "#94a3b8",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography
            sx={{ color: isDark ? "#71717a" : "#64748b", fontSize: 14 }}
          >
            Already have an account?{" "}
            <Typography
              component={RouterLink}
              to="/"
              sx={{
                color: "#2563eb",
                textDecoration: "none",
                fontWeight: 500,
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Sign in
            </Typography>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
