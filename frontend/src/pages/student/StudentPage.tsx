import { Routes, Route } from "react-router-dom";
import StudentLayout from "./components/layout/StudentLayout";
import {
  StudentDashboard,
  StudentExamSchedule,
  StudentNotifications,
  CourseEnrollment,
  GoogleClassroom,
} from "../../features/student";

export default function StudentPage() {
  return (
    <StudentLayout>
      <Routes>
        <Route index element={<StudentDashboard />} />
        <Route path="exams" element={<StudentExamSchedule />} />
        <Route path="notifications" element={<StudentNotifications />} />
        <Route path="courses" element={<CourseEnrollment />} />
        <Route path="google-classroom" element={<GoogleClassroom />} />
      </Routes>
    </StudentLayout>
  );
}
