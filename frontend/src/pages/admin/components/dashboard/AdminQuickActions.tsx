import { useNavigate } from "react-router-dom";
import { Card } from "../ui/index";
import { colors, fonts, radius, transitions } from "../../../../styles/tokens";
import { Cpu, AlertTriangle, RotateCcw, Send, CalendarClock } from "lucide-react";

const actions = [
  { icon: Cpu, label: "Generate Timetable", path: "/AdminPage/engine", color: colors.primary.main },
  { icon: AlertTriangle, label: "Review Conflicts", path: "/AdminPage/conflicts", color: colors.error.main },
  { icon: RotateCcw, label: "Approve Requests", path: "/AdminPage/requests", color: colors.warning.main },
  { icon: Send, label: "Publish Timetable", path: "/AdminPage/engine", color: colors.success.main },
  { icon: CalendarClock, label: "Schedule Exams", path: "/AdminPage/exams", color: "#6D28D9" },
];

export default function AdminQuickActions() {
  const navigate = useNavigate();

  return (
    <Card style={{ padding: "18px" }}>
      <h3 style={{
        fontSize: fonts.size.md,
        fontWeight: fonts.weight.bold,
        color: colors.text.primary,
        margin: "0 0 14px",
        fontFamily: fonts.heading,
      }}>
        Quick Actions
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: radius.md,
                background: colors.bg.raised,
                border: `1px solid ${colors.border.subtle}`,
                color: colors.text.secondary,
                fontSize: fonts.size.sm,
                fontWeight: fonts.weight.medium,
                cursor: "pointer",
                transition: transitions.smooth,
                fontFamily: fonts.body,
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${action.color}08`;
                e.currentTarget.style.borderColor = `${action.color}25`;
                e.currentTarget.style.color = action.color;
                e.currentTarget.style.transform = "translateX(4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.bg.raised;
                e.currentTarget.style.borderColor = colors.border.subtle;
                e.currentTarget.style.color = colors.text.secondary;
                e.currentTarget.style.transform = "translateX(0px)";
              }}
            >
              <div style={{
                width: "28px", height: "28px",
                borderRadius: radius.md,
                background: `${action.color}10`,
                border: `1px solid ${action.color}20`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Icon size={14} />
              </div>
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
