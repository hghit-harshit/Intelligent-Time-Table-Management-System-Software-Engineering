import { Card } from "../ui/index";
import { colors, fonts } from "../../../../styles/tokens";

export default function ActivityFeed({ activities }) {
  if (!activities || activities.length === 0) return null;

  return (
    <Card style={{ padding: "18px" }}>
      <h3 style={{
        fontSize: fonts.size.md,
        fontWeight: fonts.weight.bold,
        color: colors.text.primary,
        margin: "0 0 14px",
        fontFamily: fonts.heading,
      }}>
        Recent Activity
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {activities.slice(0, 7).map((event, index) => (
          <div key={event.id} style={{
            display: "flex",
            gap: "12px",
            padding: "10px 0",
            borderBottom: index < activities.length - 1 ? `1px solid ${colors.border.subtle}` : "none",
          }}>
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              paddingTop: "2px",
            }}>
              <div style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: colors.primary.main,
              }} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: fonts.size.sm,
                color: colors.text.secondary,
                lineHeight: "1.5",
                marginBottom: "2px",
              }}>
                {event.message}
              </div>
              <div style={{
                fontSize: fonts.size.xs,
                color: colors.text.muted,
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
