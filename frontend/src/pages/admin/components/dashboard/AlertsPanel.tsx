import { Card, Badge } from "../ui/index";
import { colors, fonts, radius } from "../../../../styles/tokens";

const severityConfig = {
  critical: { color: colors.error.main, bg: colors.error.ghost, border: colors.error.border },
  warning:  { color: colors.warning.main, bg: colors.warning.ghost, border: colors.warning.border },
  healthy:  { color: colors.success.main, bg: colors.success.ghost, border: colors.success.border },
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
          fontSize: fonts.size.md,
          fontWeight: fonts.weight.bold,
          color: colors.text.primary,
          margin: 0,
          fontFamily: fonts.heading,
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
              borderRadius: radius.lg,
              background: config.bg,
              border: `1px solid ${config.border}`,
              transition: "all 0.2s ease",
            }}>
              <div style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: config.color, flexShrink: 0, marginTop: "5px",
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: fonts.size.sm,
                  fontWeight: fonts.weight.semibold,
                  color: config.color,
                  marginBottom: "2px",
                }}>
                  {alert.title}
                </div>
                <div style={{
                  fontSize: fonts.size.xs,
                  color: colors.text.secondary,
                  lineHeight: "1.4",
                }}>
                  {alert.description}
                </div>
              </div>
              <span style={{
                fontSize: fonts.size.xs,
                color: colors.text.muted,
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
