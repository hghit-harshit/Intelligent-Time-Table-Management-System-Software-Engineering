import { Routes, Route } from "react-router-dom"
import FacultyLayout from "./components/layout/FacultyLayout"
import FacultyDashboard from "./pages/FacultyDashboard"
import RescheduleRequests from "./pages/RescheduleRequests"
import ExamSchedule from "../student/pages/ExamSchedule"
import Notifications from "../student/pages/Notifications"

export default function FacultyPage() {
  return (
    <FacultyLayout>
      <Routes>
        <Route index element={<FacultyDashboard />} />
        <Route path="requests" element={<RescheduleRequests />} />
        <Route path="exams" element={<ExamSchedule />} />
        <Route path="notifications" element={<Notifications />} />
      </Routes>
    </FacultyLayout>
  )
}
