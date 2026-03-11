import { useState, useEffect } from "react";
import { Card, Badge, Button, SearchInput, TabBar, Loader } from "../components/ui/index";
import { fetchRescheduleRequests, updateRequestStatus } from "../services/adminApi";
import { Check, X, Eye } from "lucide-react";

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
    await updateRequestStatus(id, "approved");
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "approved" } : r));
  };

  const handleReject = async (id) => {
    await updateRequestStatus(id, "rejected");
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected" } : r));
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
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#fff", margin: "0 0 4px", fontFamily: "'Playfair Display', serif" }}>
            Reschedule Requests
          </h1>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
            Faculty rescheduling request approval center
          </p>
        </div>
        <Badge variant="warning" style={{ fontSize: "12px", padding: "5px 14px" }}>
          {pendingCount} pending
        </Badge>
      </div>

      {/* Filters */}
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

      {/* Request Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.length === 0 && (
          <Card style={{ padding: "40px", textAlign: "center" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>📭</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>No requests match your filters</div>
          </Card>
        )}

        {filtered.map((req) => (
          <Card key={req.id} style={{ padding: "16px" }} hover={false}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {/* Faculty Info */}
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: "700", fontSize: "14px", color: "#a78bfa", flexShrink: 0,
              }}>
                {req.facultyName.split(" ").pop()[0]}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontWeight: "600", color: "#fff", fontSize: "13px" }}>{req.facultyName}</span>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>• {req.facultyDept}</span>
                  <Badge variant={statusVariant[req.status]}>{req.status}</Badge>
                  <Badge variant={req.conflictStatus === "No conflicts" ? "success" : "danger"}>
                    {req.conflictStatus}
                  </Badge>
                </div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "2px" }}>
                  <span style={{ color: "#60efff", fontWeight: "600" }}>{req.courseCode}</span> — {req.course}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                  <span>📍 {req.currentSlot.day} {req.currentSlot.time} ({req.currentSlot.room})</span>
                  <span style={{ color: "rgba(255,255,255,0.2)" }}>→</span>
                  <span style={{ color: "#f59e0b" }}>🎯 {req.requestedSlot.day} {req.requestedSlot.time} ({req.requestedSlot.room})</span>
                </div>
              </div>

              {/* Actions */}
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

            {/* Expanded Details */}
            {expandedId === req.id && (
              <div style={{
                marginTop: "12px",
                paddingTop: "12px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                fontSize: "12px",
                color: "rgba(255,255,255,0.5)",
              }}>
                <div style={{ marginBottom: "6px" }}>
                  <span style={{ color: "rgba(255,255,255,0.35)" }}>Reason: </span>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>{req.reason}</span>
                </div>
                <div>
                  <span style={{ color: "rgba(255,255,255,0.35)" }}>Submitted: </span>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>
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
