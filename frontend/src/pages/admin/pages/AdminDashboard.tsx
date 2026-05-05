import { useState, useEffect } from "react";
import MetricsCards from "../components/dashboard/MetricsCards";
import TimetablePreview from "../components/dashboard/TimetablePreview";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import PendingApprovals from "../components/dashboard/PendingApprovals";
import { Loader, PageHeader } from "../../../shared";
import { fetchDashboard, updateRequestStatus } from "../../../features/admin/services";
import { toast } from "sonner";

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
    try {
      const result = await updateRequestStatus(id, "approved");
      setData((prev) => ({
        ...prev,
        pendingRequests: prev.pendingRequests.map((r) =>
          r.id === id ? { ...r, status: "approved" } : r
        ),
      }));
      if (result?.timetableVersion) {
        toast.success(`Approved. New draft "${result.timetableVersion}" created.`, { duration: 4000 });
      } else {
        toast.success("Request approved");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to approve");
    }
  };

  const handleReject = async (id) => {
    try {
      await updateRequestStatus(id, "rejected");
      setData((prev) => ({
        ...prev,
        pendingRequests: prev.pendingRequests.map((r) =>
          r.id === id ? { ...r, status: "rejected" } : r
        ),
      }));
      toast.success("Request rejected");
    } catch (error) {
      toast.error(error?.message || "Failed to reject");
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ paddingTop: "16px" }}>
      {/* WHY: Replaced inline h1+p with shared PageHeader to remove duplication */}
      <PageHeader title="Admin Dashboard" subtitle="University Timetable Operations Center" />

      <MetricsCards metrics={data.metrics} />

      <TimetablePreview />

      <div style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        gap: "16px",
        marginTop: "16px",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <ActivityFeed activities={data.recentActivity} />
        </div>
        <PendingApprovals
          requests={data.pendingRequests}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </div>
  );
}
