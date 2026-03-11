import { Routes, Route } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import TimetableEngine from "./pages/TimetableEngine";
import ConflictMonitor from "./pages/ConflictMonitor";
import RescheduleRequests from "./pages/RescheduleRequests";
import ExamScheduler from "./pages/ExamScheduler";
import CoursesPage from "./pages/CoursesPage";
import FacultyPage from "./pages/FacultyPage";
import RoomsPage from "./pages/RoomsPage";
import TimeSlotsPage from "./pages/TimeSlotsPage";
import BulkRescheduling from "./pages/BulkRescheduling";
import TimetableVersions from "./pages/TimetableVersions";
import AnalyticsPage from "./pages/AnalyticsPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import SettingsPage from "./pages/SettingsPage";

export default function AdminPage() {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="engine" element={<TimetableEngine />} />
        <Route path="conflicts" element={<ConflictMonitor />} />
        <Route path="requests" element={<RescheduleRequests />} />
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
