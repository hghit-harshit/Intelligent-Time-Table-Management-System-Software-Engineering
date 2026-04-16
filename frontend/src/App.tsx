/**
 * App.jsx — Root Application Component
 */

import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Box from "@mui/material/Box";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProvider } from "./contexts/UserContext";
import { useUser } from "./contexts/UserContext";
import ProtectedRoute from "./components/ProtectedRoute";

const Login = lazy(() => import("./pages/LoginPage"));
const SignUp = lazy(() => import("./pages/SignUpPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const StudentPage = lazy(() => import("./pages/student/StudentPage"));
const FacultyPage = lazy(() => import("./pages/faculty/FacultyPage"));
const AdminPage = lazy(() => import("./pages/admin/AdminPage"));

const RouteFallback = () => (
  <Box sx={{ p: 3, textAlign: "center" }}>Loading...</Box>
);

function AuthRedirect() {
  const { user, loading } = useUser();

  if (loading) {
    const stored = localStorage.getItem("timetable_user");
    if (stored) {
      const parsedUser = JSON.parse(stored);
      if (parsedUser.role === "admin") return <Navigate to="/AdminPage" replace />;
      if (parsedUser.role === "professor") return <Navigate to="/FacultyPage" replace />;
      return <Navigate to="/StudentPage" replace />;
    }
    return <RouteFallback />;
  }

  if (user) {
    if (user.role === "admin") return <Navigate to="/AdminPage" replace />;
    if (user.role === "professor") return <Navigate to="/FacultyPage" replace />;
    return <Navigate to="/StudentPage" replace />;
  }

  return <Navigate to="/" replace />;
}

function AppRoutes() {
  const { user, loading } = useUser();

  return (
    <Routes>
      <Route path="/" element={user ? <AuthRedirect /> : <Login />} />
      <Route path="/signup" element={user ? <AuthRedirect /> : <SignUp />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/StudentPage/*"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/FacultyPage/*"
        element={
          <ProtectedRoute allowedRoles={["professor"]}>
            <FacultyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/AdminPage/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
            <AppRoutes />
          </Suspense>
        </BrowserRouter>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;