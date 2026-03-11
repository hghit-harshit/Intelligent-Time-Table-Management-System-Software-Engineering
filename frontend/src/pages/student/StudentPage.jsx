import { Routes, Route } from "react-router-dom"
import StudentLayout from "./components/layout/StudentLayout"
import StudentDashboard from "./pages/StudentDashboard"
import ExamSchedule from "./pages/ExamSchedule"
import Notifications from "./pages/Notifications"
import CourseEnrollment from "./pages/CourseEnrollment"
import GoogleClassroom from "./pages/GoogleClassroom"

export default function StudentPage() {
  return (
    <StudentLayout>
      <Routes>
        <Route index element={<StudentDashboard />} />
        <Route path="exams" element={<ExamSchedule />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="courses" element={<CourseEnrollment />} />
        <Route path="google-classroom" element={<GoogleClassroom />} />
      </Routes>
    </StudentLayout>
  )
}