import { Routes, Route } from "react-router-dom";
import FacultyLayout from "./components/layout/FacultyLayout";
import {
  FacultyDashboard,
  FacultyRescheduleRequests,
  FacultyExamScheduler,
} from "../../features/faculty";
import {
  StudentNotifications,
} from "../../features/student";

export default function FacultyPage() {
  return (
    <FacultyLayout>
      <Routes>
        <Route index element={<FacultyDashboard />} />
        <Route path="requests" element={<FacultyRescheduleRequests />} />
        <Route path="exams" element={<FacultyExamScheduler />} />
        <Route path="notifications" element={<StudentNotifications />} />
      </Routes>
    </FacultyLayout>
  );
}

