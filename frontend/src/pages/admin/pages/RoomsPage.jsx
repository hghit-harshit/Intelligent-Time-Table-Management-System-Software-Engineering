import { useState, useEffect } from "react";
import { Card, Badge, DataTable, SearchInput, Button, Loader } from "../components/ui/index";
import { fetchRooms } from "../services/adminApi";
import { Plus } from "lucide-react";

const statusVariant = { available: "success", occupied: "warning", maintenance: "danger" };
const typeColors = { "Lecture Hall": "#60efff", "Classroom": "#a78bfa", "Computer Lab": "#f59e0b", "Exam Hall": "#22c55e" };

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
          <div style={{ fontWeight: "600", color: "#fff" }}>{val}</div>
          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>{row.building}, Floor {row.floor}</div>
        </div>
      ),
    },
    {
      key: "type", label: "Type",
      render: (val) => <Badge variant="info" style={{ color: typeColors[val] || "#60efff" }}>{val}</Badge>,
    },
    {
      key: "capacity", label: "Capacity", align: "center",
      render: (val) => <span style={{ color: "#a78bfa", fontWeight: "600" }}>{val}</span>,
    },
    {
      key: "equipment", label: "Equipment",
      render: (val) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {val.map((eq) => (
            <span key={eq} style={{
              fontSize: "10px", padding: "2px 6px", borderRadius: "4px",
              background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(255,255,255,0.06)",
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#fff", margin: "0 0 4px", fontFamily: "'Playfair Display', serif" }}>Rooms</h1>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>{roomsList.length} rooms registered</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />}>Add Room</Button>
      </div>

      <div style={{ marginBottom: "16px", maxWidth: "320px" }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search rooms..." />
      </div>

      <Card style={{ padding: "16px" }} hover={false}>
        <DataTable columns={columns} data={filtered} emptyMessage="No rooms found" />
      </Card>
    </div>
  );
}
