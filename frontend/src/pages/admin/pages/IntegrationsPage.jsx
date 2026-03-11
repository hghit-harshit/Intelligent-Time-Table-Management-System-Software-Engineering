import { Card, Badge } from "../components/ui/index";
import { Calendar, MessageSquare, Mail, Building2, Hash } from "lucide-react";
import { colors, fonts, radius } from "../../../styles/tokens";

const integrations = [
  { name: "Google Calendar", desc: "Sync timetable with Google Calendar", status: "connected", Icon: Calendar, color: "#4285f4" },
  { name: "MS Teams", desc: "Auto-create meeting links for online classes", status: "disconnected", Icon: MessageSquare, color: "#6264a7" },
  { name: "Email Notifications", desc: "Send alerts to faculty and students", status: "connected", Icon: Mail, color: "#22c55e" },
  { name: "ERP System", desc: "Sync course and faculty data from university ERP", status: "connected", Icon: Building2, color: "#f59e0b" },
  { name: "Slack", desc: "Post updates to department channels", status: "disconnected", Icon: Hash, color: "#e01e5a" },
];

export default function IntegrationsPage() {
  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: fonts.size["2xl"], fontWeight: fonts.weight.bold, color: colors.text.primary, margin: "0 0 4px", fontFamily: fonts.heading }}>Integrations</h1>
        <p style={{ fontSize: fonts.size.sm, color: colors.text.muted, margin: 0 }}>Connect external services to the timetable system</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
        {integrations.map((item) => (
          <Card key={item.name} style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: radius.lg,
                background: `${item.color}10`, border: `1px solid ${item.color}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <item.Icon size={20} style={{ color: item.color }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: fonts.weight.bold, color: colors.text.primary, fontSize: fonts.size.sm }}>{item.name}</div>
              </div>
              <Badge variant={item.status === "connected" ? "success" : "neutral"}>
                {item.status}
              </Badge>
            </div>
            <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, lineHeight: "1.5" }}>
              {item.desc}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
