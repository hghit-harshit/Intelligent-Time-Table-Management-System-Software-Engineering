/**
 * App.jsx — Root Application Component
 * 
 * PURPOSE: Wraps the entire app with MUI's ThemeProvider so every
 * component inherits our custom theme. Also sets up routing.
 * 
 * CssBaseline resets browser defaults and applies our theme's
 * background color and font to the <body> element.
 */

import { Suspense, lazy } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"

const Login = lazy(() => import("./pages/LoginPage"))
const StudentPage = lazy(() => import("./pages/student/StudentPage"))
const FacultyPage = lazy(() => import("./pages/faculty/FacultyPage"))
const AdminPage = lazy(() => import("./pages/admin/AdminPage"))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/StudentPage/*" element={<StudentPage />} />
          <Route path="/FacultyPage/*" element={<FacultyPage />} />
          <Route path="/AdminPage/*" element={<AdminPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App