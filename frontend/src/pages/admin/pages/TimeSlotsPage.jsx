import { useState, useEffect } from "react";
import { Card, Badge, DataTable, SearchInput, Button, Loader } from "../components/ui/index";
import { fetchTimeSlots } from "../services/adminApi";
import { Plus } from "lucide-react";

const typeColors = { Lecture: "info", Lab: "purple", Break: "warning" };

export default function TimeSlotsPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTimeSlots().then((res) => { setSlots(res); setLoading(false); });
  }, []);

  const filtered = slots.filter((s) =>
    search === "" ||
    s.label.toLowerCase().includes(search.toLowerCase()) ||
    s.type.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "label", label: "Slot",
      render: (val) => <span style={{ fontWeight: "600", color: "#fff" }}>{val}</span>,
    },
    {
      key: "startTime", label: "Start",
      render: (val) => <span style={{ color: "#60efff" }}>{val}</span>,
    },
    {
      key: "endTime", label: "End",
      render: (val) => <span style={{ color: "#60efff" }}>{val}</span>,
    },
    { key: "day", label: "Days" },
    {
      key: "type", label: "Type",
      render: (val) => <Badge variant={typeColors[val] || "neutral"}>{val}</Badge>,
    },
  ];

  if (loading) return <Loader />;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#fff", margin: "0 0 4px", fontFamily: "'Playfair Display', serif" }}>Time Slots</h1>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>{slots.length} slots configured</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />}>Add Slot</Button>
      </div>

      <div style={{ marginBottom: "16px", maxWidth: "320px" }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search slots..." />
      </div>

      <Card style={{ padding: "16px" }} hover={false}>
        <DataTable columns={columns} data={filtered} emptyMessage="No time slots found" />
      </Card>
    </div>
  );
}
