import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { useUser } from "../contexts/UserContext";
import { useThemeMode } from "../contexts/ThemeContext";
import { AUTH_PROFILE_UPDATE_EP } from "../constants/Api_constants";
import { getAccessToken } from "../services/authApi";
import { User, Mail, User as UserIcon, Save, ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const { user, refreshUser } = useUser();
  const { mode } = useThemeMode();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isDark = mode === "dark";

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = getAccessToken();
      const response = await fetch(AUTH_PROFILE_UPDATE_EP, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ firstName, lastName, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Update failed");
      }

      setSuccess("Profile updated successfully");
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: isDark ? "#09090b" : "#f8fafc",
        p: 3,
      }}
    >
      <Box
        sx={{
          maxWidth: 480,
          mx: "auto",
          bgcolor: isDark ? "#18181b" : "#ffffff",
          borderRadius: 3,
          p: 3,
          boxShadow: isDark ? "none" : "0 4px 24px rgba(0,0,0,0.06)",
          border: `1px solid ${isDark ? "#27272a" : "#e2e8f0"}`,
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Box
            onClick={() => navigate(-1)}
            sx={{
              p: 1,
              borderRadius: 1.5,
              cursor: "pointer",
              bgcolor: isDark ? "#27272a" : "#f1f5f9",
            }}
          >
            <ArrowLeft size={20} />
          </Box>
          <Typography sx={{ fontWeight: 600, fontSize: 18, color: isDark ? "#fafafa" : "#0f172a" }}>
            Profile Settings
          </Typography>
        </Box>

        {/* Avatar */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2563eb, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 1,
            }}
          >
            <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 24 }}>
              {firstName?.[0]}{lastName?.[0]}
            </Typography>
          </Box>
          <Typography sx={{ color: isDark ? "#a1a1aa" : "#64748b", fontSize: 14 }}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              InputProps={{
                startAdornment: <UserIcon size={16} />,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: isDark ? "#09090b" : "#f8fafc",
                  borderRadius: 2,
                  "& fieldset": { borderColor: isDark ? "#27272a" : "#e2e8f0" },
                },
                "& .MuiInputLabel-root": { color: isDark ? "#a1a1aa" : "#64748b" },
                "& .MuiOutlinedInput-input": { color: isDark ? "#fafafa" : "#0f172a" },
              }}
            />
            <TextField
              fullWidth
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: isDark ? "#09090b" : "#f8fafc",
                  borderRadius: 2,
                  "& fieldset": { borderColor: isDark ? "#27272a" : "#e2e8f0" },
                },
                "& .MuiInputLabel-root": { color: isDark ? "#a1a1aa" : "#64748b" },
                "& .MuiOutlinedInput-input": { color: isDark ? "#fafafa" : "#0f172a" },
              }}
            />
          </Box>

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            InputProps={{
              startAdornment: <Mail size={16} />,
            }}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                bgcolor: isDark ? "#09090b" : "#f8fafc",
                borderRadius: 2,
                "& fieldset": { borderColor: isDark ? "#27272a" : "#e2e8f0" },
              },
              "& .MuiInputLabel-root": { color: isDark ? "#a1a1aa" : "#64748b" },
              "& .MuiOutlinedInput-input": { color: isDark ? "#fafafa" : "#0f172a" },
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
              fontWeight: 500,
              "&:hover": { bgcolor: "#1d4ed8" },
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Save Changes"}
          </Button>
        </form>
      </Box>
    </Box>
  );
}