import { Suspense, lazy } from "react"
import { Routes, Route } from "react-router-dom"
import StudentLayout from "./components/layout/StudentLayout"

const StudentDashboard = lazy(() => import("./pages/StudentDashboard"))
const ExamSchedule = lazy(() => import("./pages/ExamSchedule"))
const Notifications = lazy(() => import("./pages/Notifications"))
const CourseEnrollment = lazy(() => import("./pages/CourseEnrollment"))
const GoogleClassroom = lazy(() => import("./pages/GoogleClassroom"))
const AIAssistant = lazy(() => import("./pages/AIAssistant"))

export default function StudentPage() {
  return (
    <StudentLayout>
      <Suspense fallback={<div style={{ padding: "24px" }}>Loading page...</div>}>
        <Routes>
          <Route index element={<StudentDashboard />} />
          <Route path="exams" element={<ExamSchedule />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="courses" element={<CourseEnrollment />} />
          <Route path="google-classroom" element={<GoogleClassroom />} />
          <Route path="ai" element={<AIAssistant />} />
        </Routes>
      </Suspense>
    </StudentLayout>
  )
}