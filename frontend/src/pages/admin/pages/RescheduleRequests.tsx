import { useState, useEffect } from "react";
import { Card, Badge, Button, SearchInput, TabBar, Loader, PageHeader } from "../../../shared";
import { fetchRescheduleRequests, updateRequestStatus } from "../../../features/admin/services";
import { colors, fonts, radius } from "../../../styles/tokens";
import { Check, X, Eye } from "lucide-react";
import { toast } from "sonner";

const statusVariant = { pending: "warning", approved: "success", rejected: "danger" };

export default function RescheduleRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchRescheduleRequests().then((res) => {
      setRequests(res);
      setLoading(false);
    });
  }, []);

  const handleApprove = async (id) => {
    try {
      const result = await updateRequestStatus(id, "approved");
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "approved" } : r));
      if (result?.timetableVersion) {
        toast.success(`Request approved. New draft version "${result.timetableVersion}" created with ${result.assignmentsChanged} changes.`, {
          duration: 5000,
        });
      } else {
        toast.success("Request approved successfully");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to approve request");
    }
  };

  const handleReject = async (id) => {
    try {
      await updateRequestStatus(id, "rejected");
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected" } : r));
      toast.success("Request rejected");
    } catch (error) {
      toast.error(error?.message || "Failed to reject request");
    }
  };

  const filtered = requests.filter((r) => {
    const matchesSearch = search === "" ||
      r.facultyName.toLowerCase().includes(search.toLowerCase()) ||
      r.course.toLowerCase().includes(search.toLowerCase()) ||
      r.courseCode.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || r.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) return <Loader />;

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div>
      {/* WHY: Replaced inline flex wrapper + h1+p with shared PageHeader, passing badge as action */}
      <PageHeader
        title="Reschedule Requests"
        subtitle="Faculty rescheduling request approval center"
        action={
          <Badge variant="warning" style={{ fontSize: fonts.size.sm, padding: "5px 14px" }}>
            {pendingCount} pending
          </Badge>
        }
      />

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search faculty, course..." />
        <TabBar
          activeTab={filter}
          onChange={setFilter}
          tabs={[
            { id: "all", label: "All", count: requests.length },
            { id: "pending", label: "Pending", count: pendingCount },
            { id: "approved", label: "Approved", count: requests.filter((r) => r.status === "approved").length },
            { id: "rejected", label: "Rejected", count: requests.filter((r) => r.status === "rejected").length },
          ]}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.length === 0 && (
          <Card style={{ padding: "40px", textAlign: "center" }}>
            <div style={{ color: colors.text.muted, fontSize: fonts.size.base }}>No requests match your filters</div>
          </Card>
        )}

        {filtered.map((req) => (
          <Card key={req.id} style={{ padding: "16px" }} hover={false}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: radius.lg,
                background: "rgba(109,40,217,0.06)", border: "1px solid rgba(109,40,217,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: fonts.weight.bold, fontSize: fonts.size.md, color: "#6D28D9", flexShrink: 0,
              }}>
                {req.facultyName.split(" ").pop()[0]}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontWeight: fonts.weight.semibold, color: colors.text.primary, fontSize: fonts.size.base }}>{req.facultyName}</span>
                  <span style={{ color: colors.text.muted, fontSize: fonts.size.xs }}>• {req.facultyDept}</span>
                  <Badge variant={statusVariant[req.status]}>{req.status}</Badge>
                  <Badge variant={req.conflictStatus === "No conflicts" ? "success" : "danger"}>
                    {req.conflictStatus}
                  </Badge>
                </div>
                <div style={{ fontSize: fonts.size.sm, color: colors.text.secondary, marginBottom: "2px" }}>
                  <span style={{ color: colors.primary.main, fontWeight: fonts.weight.semibold }}>{req.courseCode}</span> — {req.course}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: fonts.size.xs, color: colors.text.muted }}>
                  <span>{req.currentSlot.day} {req.currentSlot.time} ({req.currentSlot.room})</span>
                  <span style={{ color: colors.text.disabled }}>→</span>
                  <span style={{ color: colors.warning.main }}>{req.requestedSlot.day} {req.requestedSlot.time} ({req.requestedSlot.room})</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                  icon={<Eye size={12} />}
                >
                  Details
                </Button>
                {req.status === "pending" && (
                  <>
                    <Button size="sm" variant="success" onClick={() => handleApprove(req.id)} icon={<Check size={12} />}>
                      Approve
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleReject(req.id)} icon={<X size={12} />}>
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>

            {expandedId === req.id && (
              <div style={{
                marginTop: "12px",
                paddingTop: "12px",
                borderTop: `1px solid ${colors.border.subtle}`,
                fontSize: fonts.size.sm,
                color: colors.text.secondary,
              }}>
                <div style={{ marginBottom: "6px" }}>
                  <span style={{ color: colors.text.muted }}>Reason: </span>
                  <span style={{ color: colors.text.secondary }}>{req.reason}</span>
                </div>
                <div>
                  <span style={{ color: colors.text.muted }}>Submitted: </span>
                  <span style={{ color: colors.text.secondary }}>
                    {new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
