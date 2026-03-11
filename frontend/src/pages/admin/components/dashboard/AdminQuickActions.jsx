import { useNavigate } from "react-router-dom";
import { Card, Button } from "../ui/index";
import { Cpu, AlertTriangle, RotateCcw, Send, CalendarClock } from "lucide-react";

const actions = [
  { icon: Cpu, label: "Generate Timetable", path: "/AdminPage/engine", color: "#60efff" },
  { icon: AlertTriangle, label: "Review Conflicts", path: "/AdminPage/conflicts", color: "#ef4444" },
  { icon: RotateCcw, label: "Approve Requests", path: "/AdminPage/requests", color: "#f59e0b" },
  { icon: Send, label: "Publish Timetable", path: "/AdminPage/engine", color: "#22c55e" },
  { icon: CalendarClock, label: "Schedule Exams", path: "/AdminPage/exams", color: "#a78bfa" },
];

export default function AdminQuickActions() {
  const navigate = useNavigate();

  return (
    <Card style={{ padding: "18px" }}>
      <h3 style={{
        fontSize: "14px",
        fontWeight: "700",
        color: "#fff",
        margin: "0 0 14px",
        fontFamily: "'Playfair Display', serif",
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
                borderRadius: "8px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.75)",
                fontSize: "12px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontFamily: "'Space Mono', monospace",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${action.color}12`;
                e.currentTarget.style.borderColor = `${action.color}30`;
                e.currentTarget.style.color = action.color;
                e.currentTarget.style.transform = "translateX(4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                e.currentTarget.style.transform = "translateX(0px)";
              }}
            >
              <div style={{
                width: "28px", height: "28px",
                borderRadius: "6px",
                background: `${action.color}15`,
                border: `1px solid ${action.color}25`,
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
