import { Routes, Route } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import {
  AdminDashboard,
  TimetableEngine,
  AdminRescheduleRequests,
  ExamScheduler,
  CoursesPage,
  FacultyPage,
  RoomsPage,
  TimeSlotsPage,
  BulkRescheduling,
  TimetableVersions,
  AnalyticsPage,
  IntegrationsPage,
  SettingsPage,
} from "../../features/admin";

export default function AdminPage() {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="engine" element={<TimetableEngine />} />
        <Route path="requests" element={<AdminRescheduleRequests />} />
        <Route path="exams" element={<ExamScheduler />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="faculty" element={<FacultyPage />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="timeslots" element={<TimeSlotsPage />} />
        <Route path="bulk" element={<BulkRescheduling />} />
        <Route path="versions" element={<TimetableVersions />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="integrations" element={<IntegrationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Routes>
    </AdminLayout>
  );
}
