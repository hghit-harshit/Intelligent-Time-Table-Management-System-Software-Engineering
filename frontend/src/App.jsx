import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/LoginPage"
import StudentPage from "./pages/StudentPage"
import ExamSchedule from "./pages/ExamSchedule"
import Notifications from "./pages/Notifications"
import CourseEnrollment from "./pages/CourseEnrollment"
import GoogleClassroom from "./pages/GoogleClassroom"
// import AdminDashboard from "./pages/AdminDashboard"
// import FacultyDashboard from "./pages/FacultyDashboard"
// import StudentDashboard from "./pages/StudentDashboard"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/StudentPage" element={<StudentPage />} />
        <Route path="/exams" element={<ExamSchedule />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/courses" element={<CourseEnrollment />} />
        <Route path="/google-classroom" element={<GoogleClassroom />} />
        {/* <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/faculty" element={<FacultyDashboard />} />
        <Route path="/student" element={<StudentDashboard />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App