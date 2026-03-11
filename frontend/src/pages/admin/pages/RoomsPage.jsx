import { useState, useEffect } from "react";
import { Card, Badge, DataTable, SearchInput, Button, Loader, PageHeader } from "../components/ui/index";
import { fetchRooms } from "../services/adminApi";
import { colors, fonts } from "../../../styles/tokens";
import { Plus } from "lucide-react";

const statusVariant = { available: "success", occupied: "warning", maintenance: "danger" };
const typeColors = { "Lecture Hall": colors.primary.main, "Classroom": "#6D28D9", "Computer Lab": colors.warning.main, "Exam Hall": colors.success.main };

export default function RoomsPage() {
  const [roomsList, setRoomsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchRooms().then((res) => { setRoomsList(res); setLoading(false); });
  }, []);

  const filtered = roomsList.filter((r) =>
    search === "" ||
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase()) ||
    r.building.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "name", label: "Room",
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: fonts.weight.semibold, color: colors.text.primary }}>{val}</div>
          <div style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>{row.building}, Floor {row.floor}</div>
        </div>
      ),
    },
    {
      key: "type", label: "Type",
      render: (val) => <Badge variant="info" style={{ color: typeColors[val] || colors.info.main }}>{val}</Badge>,
    },
    {
      key: "capacity", label: "Capacity", align: "center",
      render: (val) => <span style={{ color: "#6D28D9", fontWeight: fonts.weight.semibold }}>{val}</span>,
    },
    {
      key: "equipment", label: "Equipment",
      render: (val) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {val.map((eq) => (
            <span key={eq} style={{
              fontSize: fonts.size.xs, padding: "2px 6px", borderRadius: "4px",
              background: colors.bg.raised, color: colors.text.secondary,
              border: `1px solid ${colors.border.subtle}`,
            }}>{eq}</span>
          ))}
        </div>
      ),
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
        title="Rooms"
        subtitle={`${roomsList.length} rooms registered`}
        action={<Button variant="primary" icon={<Plus size={14} />}>Add Room</Button>}
      />

      <div style={{ marginBottom: "16px", maxWidth: "320px" }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search rooms..." />
      </div>

      <Card style={{ padding: "16px" }} hover={false}>
        <DataTable columns={columns} data={filtered} emptyMessage="No rooms found" />
      </Card>
    </div>
  );
}
