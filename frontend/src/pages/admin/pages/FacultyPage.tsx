import { useState, useEffect } from "react";
import { Card, Badge, DataTable, SearchInput, Button, Loader, PageHeader } from "../../../shared";
import { fetchFaculty } from "../../../features/admin/services";
import { colors, fonts, radius } from "../../../styles/tokens";
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
            width: "32px", height: "32px", borderRadius: radius.md,
            background: "rgba(109,40,217,0.06)", border: "1px solid rgba(109,40,217,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: fonts.weight.bold, fontSize: fonts.size.sm, color: "#6D28D9", flexShrink: 0,
          }}>
            {val.split(" ").pop()[0]}
          </div>
          <div>
            <div style={{ fontWeight: fonts.weight.semibold, color: colors.text.primary }}>{val}</div>
            <div style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>{row.designation}</div>
          </div>
        </div>
      ),
    },
    {
      key: "department", label: "Dept",
      render: (val) => <Badge variant="purple">{val}</Badge>,
    },
    { key: "email", label: "Email", render: (val) => <span style={{ color: colors.text.muted, fontSize: fonts.size.xs }}>{val}</span> },
    {
      key: "currentSlots", label: "Load",
      render: (val, row) => {
        const pct = Math.round((val / row.maxSlots) * 100);
        const color = pct > 100 ? colors.error.main : pct > 75 ? colors.warning.main : colors.success.main;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ flex: 1, height: "4px", borderRadius: "2px", background: colors.bg.raised, maxWidth: "60px" }}>
              <div style={{ height: "100%", borderRadius: "2px", background: color, width: `${Math.min(pct, 100)}%` }} />
            </div>
            <span style={{ color, fontSize: fonts.size.xs, fontWeight: fonts.weight.semibold }}>{val}/{row.maxSlots}</span>
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
      {/* WHY: Replaced inline flex wrapper + h1+p with shared PageHeader, passing action prop */}
      <PageHeader
        title="Faculty"
        subtitle={`${facultyList.length} faculty members`}
        action={<Button variant="primary" icon={<Plus size={14} />}>Add Faculty</Button>}
      />

      <div style={{ marginBottom: "16px", maxWidth: "320px" }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search faculty..." />
      </div>

      <Card style={{ padding: "16px" }} hover={false}>
        <DataTable columns={columns} data={filtered} emptyMessage="No faculty found" />
      </Card>
    </div>
  );
}
