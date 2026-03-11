import { useState, useEffect } from "react";
import { Card, Badge, Button, DataTable, SearchInput, Loader } from "../components/ui/index";
import { fetchExamSchedule } from "../services/adminApi";
import { colors, fonts } from "../../../styles/tokens";
import { CalendarClock, AlertTriangle, Plus, CheckCircle, FileText } from "lucide-react";

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
          <div style={{ fontWeight: fonts.weight.semibold, color: colors.text.primary }}>{val}</div>
          <div style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>{row.courseName}</div>
        </div>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (val) => (
        <span style={{ color: colors.primary.main, fontWeight: fonts.weight.semibold }}>
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
      render: (val) => <span style={{ color: "#6D28D9", fontWeight: fonts.weight.semibold }}>{val}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <Badge variant={statusVariant[val] || "neutral"}>
          {val.charAt(0).toUpperCase() + val.slice(1)}
        </Badge>
      ),
    },
  ];

  if (loading) return <Loader />;

  const conflictCount = exams.filter((e) => e.status === "conflict").length;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: fonts.size["2xl"], fontWeight: fonts.weight.bold, color: colors.text.primary, margin: "0 0 4px", fontFamily: fonts.heading }}>
            Exam Scheduler
          </h1>
          <p style={{ fontSize: fonts.size.sm, color: colors.text.muted, margin: 0 }}>
            Manage exam slots, rooms, and conflict detection
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {conflictCount > 0 && <Badge variant="danger">{conflictCount} conflicts</Badge>}
          <Button variant="primary" icon={<Plus size={14} />}>Add Exam</Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" }}>
        {[
          { icon: <FileText size={16} />, label: "Total Exams", value: exams.length, color: colors.primary.main },
          { icon: <CheckCircle size={16} />, label: "Scheduled", value: exams.filter((e) => e.status === "scheduled").length, color: colors.success.main },
          { icon: <AlertTriangle size={16} />, label: "Conflicts", value: conflictCount, color: colors.error.main },
          { icon: <CalendarClock size={16} />, label: "Drafts", value: exams.filter((e) => e.status === "draft").length, color: "#6D28D9" },
        ].map((stat) => (
          <Card key={stat.label} style={{ padding: "16px" }}>
            <div style={{ marginBottom: "6px", color: stat.color }}>{stat.icon}</div>
            <div style={{ fontSize: fonts.size["2xl"], fontWeight: fonts.weight.bold, color: colors.text.primary, fontFamily: fonts.heading }}>{stat.value}</div>
            <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginTop: "2px" }}>{stat.label}</div>
          </Card>
        ))}
      </div>

      <div style={{ marginBottom: "16px", maxWidth: "320px" }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search exams..." />
      </div>

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
