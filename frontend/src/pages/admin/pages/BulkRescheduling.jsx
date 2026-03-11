import { Card, Button, Badge } from "../components/ui/index";
import { ChevronsLeftRight, Play } from "lucide-react";

export default function BulkRescheduling() {
  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#fff", margin: "0 0 4px", fontFamily: "'Playfair Display', serif" }}>
          Bulk Rescheduling
        </h1>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
          Reschedule multiple classes at once for disruptions
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
        {[
          { icon: "🌧️", title: "Weather Disruption", desc: "Reschedule all outdoor/lab classes for a date range", color: "#3b82f6" },
          { icon: "🏥", title: "Faculty Emergency", desc: "Redistribute a faculty member's classes to substitutes", color: "#ef4444" },
          { icon: "🏗️", title: "Room Maintenance", desc: "Move all classes from a room to available alternatives", color: "#f59e0b" },
          { icon: "📅", title: "Holiday Adjustment", desc: "Shift week schedule due to declared holidays", color: "#22c55e" },
        ].map((scenario) => (
          <Card key={scenario.title} style={{ padding: "20px", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
              <div style={{
                width: "42px", height: "42px", borderRadius: "10px",
                background: `${scenario.color}15`, border: `1px solid ${scenario.color}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px", flexShrink: 0,
              }}>
                {scenario.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "700", color: "#fff", fontSize: "14px", marginBottom: "4px" }}>
                  {scenario.title}
                </div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: "1.5" }}>
                  {scenario.desc}
                </div>
              </div>
              <Button size="sm" variant="secondary" icon={<Play size={12} />}>Run</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Operations */}
      <Card style={{ padding: "20px" }} hover={false}>
        <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#fff", margin: "0 0 14px", fontFamily: "'Playfair Display', serif" }}>
          Recent Bulk Operations
        </h3>
        <div style={{ textAlign: "center", padding: "30px", color: "rgba(255,255,255,0.25)" }}>
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>📋</div>
          <div style={{ fontSize: "13px" }}>No bulk operations run yet</div>
        </div>
      </Card>
    </div>
  );
}
