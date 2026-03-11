import { useState, useEffect } from "react";
import { Card, Badge, Button, DataTable, SearchInput, TabBar, Loader } from "../components/ui/index";
import { fetchConflicts, resolveConflict } from "../services/adminApi";
import { colors, fonts } from "../../../styles/tokens";
import { CheckCircle, Zap } from "lucide-react";

const severityVariant = { critical: "danger", warning: "warning", info: "info" };

export default function ConflictMonitor() {
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchConflicts().then((res) => {
      setConflicts(res);
      setLoading(false);
    });
  }, []);

  const handleResolve = async (id, action) => {
    await resolveConflict(id, action);
    setConflicts((prev) => prev.map((c) => c.id === id ? { ...c, status: "resolved" } : c));
  };

  const filtered = conflicts.filter((c) => {
    const matchesSearch = search === "" ||
      c.type.toLowerCase().includes(search.toLowerCase()) ||
      c.course1.toLowerCase().includes(search.toLowerCase()) ||
      c.room.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" ||
      (filter === "critical" && c.severity === "critical") ||
      (filter === "warning" && c.severity === "warning") ||
      (filter === "resolved" && c.status === "resolved") ||
      (filter === "unresolved" && c.status === "unresolved");
    return matchesSearch && matchesFilter;
  });

  const columns = [
    {
      key: "severity",
      label: "",
      width: "30px",
      render: (val) => (
        <div style={{
          width: "8px", height: "8px", borderRadius: "50%",
          background: val === "critical" ? colors.error.main : val === "warning" ? colors.warning.main : colors.info.main,
        }} />
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (val, row) => (
        <Badge variant={severityVariant[row.severity] || "info"}>{val}</Badge>
      ),
    },
    { key: "course1", label: "Course(s)" },
    { key: "room", label: "Room" },
    { key: "slot", label: "Slot" },
    {
      key: "suggestedFix",
      label: "Suggested Fix",
      render: (val) => (
        <span style={{ color: colors.text.muted, fontSize: fonts.size.xs }}>{val}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <Badge variant={val === "resolved" ? "success" : "neutral"}>
          {val === "resolved" ? "Resolved" : "Unresolved"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => row.status === "unresolved" ? (
        <div style={{ display: "flex", gap: "6px" }}>
          <Button size="sm" variant="success" onClick={() => handleResolve(row.id, "resolve")} icon={<CheckCircle size={12} />}>
            Resolve
          </Button>
          <Button size="sm" variant="secondary" onClick={() => handleResolve(row.id, "override")} icon={<Zap size={12} />}>
            Override
          </Button>
        </div>
      ) : (
        <span style={{ color: colors.success.main, fontSize: fonts.size.xs }}>Done</span>
      ),
    },
  ];

  if (loading) return <Loader />;

  const criticalCount = conflicts.filter((c) => c.severity === "critical" && c.status !== "resolved").length;
  const warningCount = conflicts.filter((c) => c.severity === "warning" && c.status !== "resolved").length;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: fonts.size["2xl"], fontWeight: fonts.weight.bold, color: colors.text.primary, margin: "0 0 4px", fontFamily: fonts.heading }}>
            Conflict Monitor
          </h1>
          <p style={{ fontSize: fonts.size.sm, color: colors.text.muted, margin: 0 }}>
            Detect, review, and resolve scheduling conflicts
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Badge variant="danger">{criticalCount} critical</Badge>
          <Badge variant="warning">{warningCount} warnings</Badge>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search conflicts..." />
        <TabBar
          activeTab={filter}
          onChange={setFilter}
          tabs={[
            { id: "all", label: "All", count: conflicts.length },
            { id: "critical", label: "Critical", count: conflicts.filter((c) => c.severity === "critical").length },
            { id: "warning", label: "Warnings", count: conflicts.filter((c) => c.severity === "warning").length },
            { id: "unresolved", label: "Unresolved" },
            { id: "resolved", label: "Resolved" },
          ]}
        />
      </div>

      <Card style={{ padding: "16px" }} hover={false}>
        <DataTable
          columns={columns}
          data={filtered}
          emptyMessage="No conflicts match your filters"
        />
      </Card>
    </div>
  );
}
