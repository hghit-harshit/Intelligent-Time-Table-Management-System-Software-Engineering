import { Card, Badge } from "../ui/index";

const severityConfig = {
  critical: { color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.15)", icon: "🔴" },
  warning: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)", icon: "🟡" },
  healthy: { color: "#22c55e", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.15)", icon: "🟢" },
};

export default function AlertsPanel({ alerts }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <Card style={{ padding: "18px" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "14px",
      }}>
        <h3 style={{
          fontSize: "14px",
          fontWeight: "700",
          color: "#fff",
          margin: 0,
          fontFamily: "'Playfair Display', serif",
        }}>
          System Alerts
        </h3>
        <Badge variant="danger">{alerts.filter(a => a.severity === "critical").length} critical</Badge>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {alerts.slice(0, 5).map((alert) => {
          const config = severityConfig[alert.severity] || severityConfig.healthy;
          return (
            <div key={alert.id} style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "10px",
              background: config.bg,
              border: `1px solid ${config.border}`,
              transition: "all 0.2s ease",
            }}>
              <span style={{ fontSize: "12px", flexShrink: 0, marginTop: "1px" }}>{config.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: config.color,
                  marginBottom: "2px",
                }}>
                  {alert.title}
                </div>
                <div style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.45)",
                  lineHeight: "1.4",
                }}>
                  {alert.description}
                </div>
              </div>
              <span style={{
                fontSize: "10px",
                color: "rgba(255,255,255,0.25)",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}>
                {alert.timestamp}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
