import { Routes, Route } from "react-router-dom"
import FacultyLayout from "./components/layout/FacultyLayout"
import FacultyDashboard from "./pages/FacultyDashboard"
import ExamSchedule from "../ExamSchedule"
import Notifications from "../Notifications"

export default function FacultyPage() {
  return (
    <FacultyLayout>
      <Routes>
        <Route index element={<FacultyDashboard />} />
        <Route path="exams" element={<ExamSchedule />} />
        <Route path="notifications" element={<Notifications />} />
      </Routes>
    </FacultyLayout>
  )
}
