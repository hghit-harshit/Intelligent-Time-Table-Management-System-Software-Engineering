import { Card, Button, Badge } from "../components/ui/index";
import { CloudRain, Heart, Wrench, CalendarDays, Play, ClipboardList } from "lucide-react";
import { colors, fonts, radius } from "../../../styles/tokens";

const scenarios = [
  { Icon: CloudRain, title: "Weather Disruption", desc: "Reschedule all outdoor/lab classes for a date range", color: "#3b82f6" },
  { Icon: Heart, title: "Faculty Emergency", desc: "Redistribute a faculty member's classes to substitutes", color: "#ef4444" },
  { Icon: Wrench, title: "Room Maintenance", desc: "Move all classes from a room to available alternatives", color: "#f59e0b" },
  { Icon: CalendarDays, title: "Holiday Adjustment", desc: "Shift week schedule due to declared holidays", color: "#22c55e" },
];

export default function BulkRescheduling() {
  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: fonts.size["2xl"], fontWeight: fonts.weight.bold, color: colors.text.primary, margin: "0 0 4px", fontFamily: fonts.heading }}>
          Bulk Rescheduling
        </h1>
        <p style={{ fontSize: fonts.size.sm, color: colors.text.muted, margin: 0 }}>
          Reschedule multiple classes at once for disruptions
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
        {scenarios.map(({ Icon, title, desc, color }) => (
          <Card key={title} style={{ padding: "20px", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
              <div style={{
                width: "42px", height: "42px", borderRadius: radius.lg,
                background: `${color}12`, border: `1px solid ${color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: fonts.weight.semibold, color: colors.text.primary, fontSize: fonts.size.sm, marginBottom: "4px" }}>
                  {title}
                </div>
                <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, lineHeight: "1.5" }}>
                  {desc}
                </div>
              </div>
              <Button size="sm" variant="secondary" icon={<Play size={12} />}>Run</Button>
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ padding: "20px" }} hover={false}>
        <h3 style={{ fontSize: fonts.size.sm, fontWeight: fonts.weight.bold, color: colors.text.primary, margin: "0 0 14px", fontFamily: fonts.heading }}>
          Recent Bulk Operations
        </h3>
        <div style={{ textAlign: "center", padding: "30px", color: colors.text.muted }}>
          <ClipboardList size={28} style={{ color: colors.text.muted, opacity: 0.5, marginBottom: "8px" }} />
          <div style={{ fontSize: fonts.size.sm }}>No bulk operations run yet</div>
        </div>
      </Card>
    </div>
  );
}
