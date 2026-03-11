import { Card } from "../ui/index";

const typeColors = {
  request: "#f59e0b",
  system: "#60efff",
  admin: "#a78bfa",
  solver: "#3b82f6",
  publish: "#22c55e",
};

export default function ActivityFeed({ activities }) {
  if (!activities || activities.length === 0) return null;

  return (
    <Card style={{ padding: "18px" }}>
      <h3 style={{
        fontSize: "14px",
        fontWeight: "700",
        color: "#fff",
        margin: "0 0 14px",
        fontFamily: "'Playfair Display', serif",
      }}>
        Recent Activity
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {activities.slice(0, 7).map((event, index) => (
          <div key={event.id} style={{
            display: "flex",
            gap: "12px",
            padding: "10px 0",
            borderBottom: index < activities.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
          }}>
            {/* Timeline dot + line */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              paddingTop: "2px",
            }}>
              <span style={{ fontSize: "14px" }}>{event.icon}</span>
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.7)",
                lineHeight: "1.5",
                marginBottom: "2px",
              }}>
                {event.message}
              </div>
              <div style={{
                fontSize: "10px",
                color: "rgba(255,255,255,0.25)",
              }}>
                {event.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
