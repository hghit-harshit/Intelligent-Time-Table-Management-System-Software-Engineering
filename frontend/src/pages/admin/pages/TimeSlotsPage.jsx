import { useState, useEffect } from "react";
import { Card, Badge, DataTable, SearchInput, Button, Loader, PageHeader } from "../components/ui/index";
import { fetchTimeSlots } from "../services/adminApi";
import { colors, fonts } from "../../../styles/tokens";
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
      render: (val) => <span style={{ fontWeight: fonts.weight.semibold, color: colors.text.primary }}>{val}</span>,
    },
    {
      key: "startTime", label: "Start",
      render: (val) => <span style={{ color: colors.primary.main }}>{val}</span>,
    },
    {
      key: "endTime", label: "End",
      render: (val) => <span style={{ color: colors.primary.main }}>{val}</span>,
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
      {/* WHY: Replaced inline flex wrapper + h1+p with shared PageHeader, passing action prop */}
      <PageHeader
        title="Time Slots"
        subtitle={`${slots.length} slots configured`}
        action={<Button variant="primary" icon={<Plus size={14} />}>Add Slot</Button>}
      />

      <div style={{ marginBottom: "16px", maxWidth: "320px" }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search slots..." />
      </div>

      <Card style={{ padding: "16px" }} hover={false}>
        <DataTable columns={columns} data={filtered} emptyMessage="No time slots found" />
      </Card>
    </div>
  );
}
