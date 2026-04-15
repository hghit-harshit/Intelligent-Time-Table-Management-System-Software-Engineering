import { useState, useEffect } from "react";
import MetricsCards from "../components/dashboard/MetricsCards";
import AlertsPanel from "../components/dashboard/AlertsPanel";
import AdminQuickActions from "../components/dashboard/AdminQuickActions";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import PendingApprovals from "../components/dashboard/PendingApprovals";
import { Loader, PageHeader } from "../../../shared";
import { fetchDashboard, updateRequestStatus } from "../../../features/admin/services";

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
      {/* WHY: Replaced inline h1+p with shared PageHeader to remove duplication */}
      <PageHeader title="Admin Dashboard" subtitle="University Timetable Operations Center" />

      <MetricsCards metrics={data.metrics} />

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 280px",
        gap: "16px",
        marginBottom: "20px",
      }}>
        <AlertsPanel alerts={data.alerts} />
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <AdminQuickActions />
          <ActivityFeed activities={data.recentActivity} />
        </div>
      </div>

      <PendingApprovals
        requests={data.pendingRequests}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
