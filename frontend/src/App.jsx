/**
 * App.jsx — Root Application Component
 * 
 * PURPOSE: Wraps the entire app with MUI's ThemeProvider so every
 * component inherits our custom theme. Also sets up routing.
 * 
 * CssBaseline resets browser defaults and applies our theme's
 * background color and font to the <body> element.
 */

import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import theme from "./styles/theme"
import Login from "./pages/LoginPage"
import StudentPage from "./pages/student/StudentPage"
import FacultyPage from "./pages/faculty/FacultyPage"
import AdminPage from "./pages/admin/AdminPage"
import ExamSchedule from "./pages/ExamSchedule"
import Notifications from "./pages/Notifications"
import CourseEnrollment from "./pages/CourseEnrollment"
import GoogleClassroom from "./pages/GoogleClassroom"
// import AdminDashboard from "./pages/AdminDashboard"
// import FacultyDashboard from "./pages/FacultyDashboard"
// import StudentDashboard from "./pages/StudentDashboard"

function App() {
  return (
    // ThemeProvider makes our custom theme available to ALL MUI components
    <ThemeProvider theme={theme}>
      {/* CssBaseline normalizes browser styles and applies theme background */}
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/StudentPage" element={<StudentPage />} />
          <Route path="/FacultyPage" element={<FacultyPage />} />
          <Route path="/AdminPage/*" element={<AdminPage />} />
          <Route path="/exams" element={<ExamSchedule />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/courses" element={<CourseEnrollment />} />
          <Route path="/google-classroom" element={<GoogleClassroom />} />
          {/* <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/faculty" element={<FacultyDashboard />} />
          <Route path="/student" element={<StudentDashboard />} /> */}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App