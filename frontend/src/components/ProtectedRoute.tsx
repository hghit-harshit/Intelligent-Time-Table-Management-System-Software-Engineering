import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ("admin" | "professor" | "student")[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") {
      return <Navigate to="/AdminPage" replace />;
    }
    if (user.role === "professor") {
      return <Navigate to="/FacultyPage" replace />;
    }
    if (user.role === "student") {
      return <Navigate to="/StudentPage" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}