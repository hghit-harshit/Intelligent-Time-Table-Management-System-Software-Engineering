import { useState, useEffect } from "react";
import { Card, Badge, Button, DataTable, SearchInput, Loader } from "../components/ui/index";
import { fetchExamSchedule } from "../services/adminApi";
import { CalendarClock, AlertTriangle, Plus } from "lucide-react";

const statusVariant = { scheduled: "success", conflict: "danger", draft: "neutral" };

export default function ExamScheduler() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchExamSchedule().then((res) => {
      setExams(res);
      setLoading(false);
    });
  }, []);

  const filtered = exams.filter((e) => {
    return search === "" ||
      e.courseName.toLowerCase().includes(search.toLowerCase()) ||
      e.course.toLowerCase().includes(search.toLowerCase()) ||
      e.room.toLowerCase().includes(search.toLowerCase());
  });

  const columns = [
    {
      key: "course",
      label: "Course",
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: "600", color: "#fff" }}>{val}</div>
          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>{row.courseName}</div>
        </div>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (val) => (
        <span style={{ color: "#60efff", fontWeight: "600" }}>
          {new Date(val).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
        </span>
      ),
    },
    { key: "time", label: "Time" },
    { key: "duration", label: "Duration" },
    { key: "room", label: "Room" },
    {
      key: "students",
      label: "Students",
      render: (val) => <span style={{ color: "#a78bfa" }}>{val}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <Badge variant={statusVariant[val] || "neutral"}>
          {val === "conflict" && "⚠ "}{val.charAt(0).toUpperCase() + val.slice(1)}
        </Badge>
      ),
    },
  ];

  if (loading) return <Loader />;

  const conflictCount = exams.filter((e) => e.status === "conflict").length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#fff", margin: "0 0 4px", fontFamily: "'Playfair Display', serif" }}>
            Exam Scheduler
          </h1>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
            Manage exam slots, rooms, and conflict detection
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {conflictCount > 0 && <Badge variant="danger">{conflictCount} conflicts</Badge>}
          <Button variant="primary" icon={<Plus size={14} />}>Add Exam</Button>
        </div>
      </div>

      {/* Calendar Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" }}>
        {[
          { icon: "📝", label: "Total Exams", value: exams.length, color: "#60efff" },
          { icon: "✅", label: "Scheduled", value: exams.filter((e) => e.status === "scheduled").length, color: "#22c55e" },
          { icon: "⚠️", label: "Conflicts", value: conflictCount, color: "#ef4444" },
          { icon: "📄", label: "Drafts", value: exams.filter((e) => e.status === "draft").length, color: "#a78bfa" },
        ].map((stat) => (
          <Card key={stat.label} style={{ padding: "16px" }}>
            <div style={{ fontSize: "18px", marginBottom: "6px" }}>{stat.icon}</div>
            <div style={{ fontSize: "22px", fontWeight: "700", color: stat.color, fontFamily: "'Space Mono', monospace" }}>{stat.value}</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", marginTop: "2px" }}>{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: "16px", maxWidth: "320px" }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search exams..." />
      </div>

      {/* Table */}
      <Card style={{ padding: "16px" }} hover={false}>
        <DataTable
          columns={columns}
          data={filtered}
          emptyMessage="No exams found"
        />
      </Card>
    </div>
  );
}
