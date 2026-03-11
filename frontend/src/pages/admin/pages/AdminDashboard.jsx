import { useState, useEffect } from "react";
import MetricsCards from "../components/dashboard/MetricsCards";
import AlertsPanel from "../components/dashboard/AlertsPanel";
import AdminQuickActions from "../components/dashboard/AdminQuickActions";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import PendingApprovals from "../components/dashboard/PendingApprovals";
import { Loader } from "../components/ui/index";
import { fetchDashboard, updateRequestStatus } from "../services/adminApi";
import { colors, fonts } from "../../../styles/tokens";

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
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{
          fontSize: fonts.size["2xl"],
          fontWeight: fonts.weight.bold,
          color: colors.text.primary,
          margin: "0 0 4px",
          fontFamily: fonts.heading,
        }}>
          Admin Dashboard
        </h1>
        <p style={{
          fontSize: fonts.size.sm,
          color: colors.text.muted,
          margin: 0,
        }}>
          University Timetable Operations Center
        </p>
      </div>

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
