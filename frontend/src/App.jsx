import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/LoginPage"
import StudentPage from "./pages/StudentPage"
import FacultyPage from "./pages/FacultyPage"
import AdminPage from "./pages/AdminPage"
import ExamSchedule from "./pages/ExamSchedule"
import Notifications from "./pages/Notifications"
import CourseEnrollment from "./pages/CourseEnrollment"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/StudentPage" element={<StudentPage />} />
        <Route path="/FacultyPage" element={<FacultyPage />} />
        <Route path="/AdminPage" element={<AdminPage />} />
        <Route path="/exams" element={<ExamSchedule />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/courses" element={<CourseEnrollment />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App