/**
 * App.jsx — Root Application Component
 *
 * PURPOSE: Wraps the entire app with MUI's ThemeProvider so every
 * component inherits our custom theme. Also sets up routing.
 *
 * CssBaseline resets browser defaults and applies our theme's
 * background color and font to the <body> element.
 */

import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import theme from "./styles/theme";

const Login = lazy(() => import("./pages/LoginPage"));
const StudentPage = lazy(() => import("./pages/student/StudentPage"));
const FacultyPage = lazy(() => import("./pages/faculty/FacultyPage"));
const AdminPage = lazy(() => import("./pages/admin/AdminPage"));

const RouteFallback = () => (
  <Box sx={{ p: 3, textAlign: "center" }}>Loading...</Box>
);

function App() {
  return (
    // ThemeProvider makes our custom theme available to ALL MUI components
    <ThemeProvider theme={theme}>
      {/* CssBaseline normalizes browser styles and applies theme background */}
      <CssBaseline />
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/StudentPage/*" element={<StudentPage />} />
            <Route path="/FacultyPage/*" element={<FacultyPage />} />
            <Route path="/AdminPage/*" element={<AdminPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
