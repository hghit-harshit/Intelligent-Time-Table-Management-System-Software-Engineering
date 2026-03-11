import { useState, useEffect } from "react";
import { Card, Badge, DataTable, SearchInput, Button, Loader } from "../components/ui/index";
import { fetchFaculty } from "../services/adminApi";
import { Plus } from "lucide-react";

const statusVariant = { active: "success", overloaded: "danger", leave: "warning" };

export default function FacultyPage() {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchFaculty().then((res) => { setFacultyList(res); setLoading(false); });
  }, []);

  const filtered = facultyList.filter((f) =>
    search === "" ||
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.department.toLowerCase().includes(search.toLowerCase()) ||
    f.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "name", label: "Faculty",
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: "700", fontSize: "12px", color: "#a78bfa", flexShrink: 0,
          }}>
            {val.split(" ").pop()[0]}
          </div>
          <div>
            <div style={{ fontWeight: "600", color: "#fff" }}>{val}</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>{row.designation}</div>
          </div>
        </div>
      ),
    },
    {
      key: "department", label: "Dept",
      render: (val) => <Badge variant="purple">{val}</Badge>,
    },
    { key: "email", label: "Email", render: (val) => <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>{val}</span> },
    {
      key: "currentSlots", label: "Load",
      render: (val, row) => {
        const pct = Math.round((val / row.maxSlots) * 100);
        const color = pct > 100 ? "#ef4444" : pct > 75 ? "#f59e0b" : "#22c55e";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ flex: 1, height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.06)", maxWidth: "60px" }}>
              <div style={{ height: "100%", borderRadius: "2px", background: color, width: `${Math.min(pct, 100)}%` }} />
            </div>
            <span style={{ color, fontSize: "11px", fontWeight: "600" }}>{val}/{row.maxSlots}</span>
          </div>
        );
      },
    },
    {
      key: "status", label: "Status",
      render: (val) => <Badge variant={statusVariant[val] || "neutral"}>{val}</Badge>,
    },
  ];

  if (loading) return <Loader />;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#fff", margin: "0 0 4px", fontFamily: "'Playfair Display', serif" }}>Faculty</h1>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>{facultyList.length} faculty members</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />}>Add Faculty</Button>
      </div>

      <div style={{ marginBottom: "16px", maxWidth: "320px" }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search faculty..." />
      </div>

      <Card style={{ padding: "16px" }} hover={false}>
        <DataTable columns={columns} data={filtered} emptyMessage="No faculty found" />
      </Card>
    </div>
  );
}
