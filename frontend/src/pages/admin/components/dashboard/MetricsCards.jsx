import { StatCard } from "../ui/index";

const metricConfig = [
  { key: "activeCourses", icon: "📚", title: "Active Courses", color: "#60efff" },
  { key: "roomsAvailable", icon: "🏫", title: "Rooms Available", color: "#a78bfa" },
  { key: "pendingRequests", icon: "📝", title: "Pending Requests", color: "#f59e0b" },
  { key: "detectedConflicts", icon: "⚠️", title: "Detected Conflicts", color: "#ef4444" },
  { key: "timetableStatus", icon: "📋", title: "Timetable Status", color: "#22c55e" },
];

export default function MetricsCards({ metrics }) {
  if (!metrics) return null;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(5, 1fr)",
      gap: "14px",
      marginBottom: "20px",
    }}>
      {metricConfig.map((m) => {
        const data = metrics[m.key];
        if (!data) return null;
        return (
          <StatCard
            key={m.key}
            icon={m.icon}
            title={m.title}
            value={data.value}
            trend={data.trend}
            trendDirection={data.trendDirection}
            color={m.color}
          />
        );
      })}
    </div>
  );
}
