import { Card, Badge } from "../components/ui/index";

const integrations = [
  { name: "Google Calendar", desc: "Sync timetable with Google Calendar", status: "connected", icon: "📅", color: "#4285f4" },
  { name: "MS Teams", desc: "Auto-create meeting links for online classes", status: "disconnected", icon: "💬", color: "#6264a7" },
  { name: "Email Notifications", desc: "Send alerts to faculty and students", status: "connected", icon: "📧", color: "#22c55e" },
  { name: "ERP System", desc: "Sync course and faculty data from university ERP", status: "connected", icon: "🏛️", color: "#f59e0b" },
  { name: "Slack", desc: "Post updates to department channels", status: "disconnected", icon: "💬", color: "#e01e5a" },
];

export default function IntegrationsPage() {
  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#fff", margin: "0 0 4px", fontFamily: "'Playfair Display', serif" }}>Integrations</h1>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>Connect external services to the timetable system</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
        {integrations.map((item) => (
          <Card key={item.name} style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: `${item.color}15`, border: `1px solid ${item.color}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px",
              }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "700", color: "#fff", fontSize: "13px" }}>{item.name}</div>
              </div>
              <Badge variant={item.status === "connected" ? "success" : "neutral"}>
                {item.status}
              </Badge>
            </div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: "1.5" }}>
              {item.desc}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
