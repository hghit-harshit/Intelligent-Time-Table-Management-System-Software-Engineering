import { useState, useEffect } from "react";
import MetricsCards from "../components/dashboard/MetricsCards";
import AlertsPanel from "../components/dashboard/AlertsPanel";
import AdminQuickActions from "../components/dashboard/AdminQuickActions";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import PendingApprovals from "../components/dashboard/PendingApprovals";
import { Loader } from "../components/ui/index";
import { fetchDashboard, updateRequestStatus } from "../services/adminApi";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const handleApprove = async (id) => {
    await updateRequestStatus(id, "approved");
    setData((prev) => ({
      ...prev,
      pendingRequests: prev.pendingRequests.map((r) =>
        r.id === id ? { ...r, status: "approved" } : r
      ),
    }));
  };

  const handleReject = async (id) => {
    await updateRequestStatus(id, "rejected");
    setData((prev) => ({
      ...prev,
      pendingRequests: prev.pendingRequests.map((r) =>
        r.id === id ? { ...r, status: "rejected" } : r
      ),
    }));
  };

  if (loading) return <Loader />;

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{
          fontSize: "22px",
          fontWeight: "700",
          color: "#fff",
          margin: "0 0 4px",
          fontFamily: "'Playfair Display', serif",
        }}>
          Admin Dashboard
        </h1>
        <p style={{
          fontSize: "12px",
          color: "rgba(255,255,255,0.4)",
          margin: 0,
        }}>
          University Timetable Operations Center • Semester 2, 2025
        </p>
      </div>

      {/* Top Metrics */}
      <MetricsCards metrics={data.metrics} />

      {/* Main Grid: Alerts + Quick Actions + Activity */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 280px",
        gap: "16px",
        marginBottom: "20px",
      }}>
        {/* Left column */}
        <AlertsPanel alerts={data.alerts} />

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <AdminQuickActions />
          <ActivityFeed activities={data.recentActivity} />
        </div>
      </div>

      {/* Pending Approvals Table */}
      <PendingApprovals
        requests={data.pendingRequests}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
