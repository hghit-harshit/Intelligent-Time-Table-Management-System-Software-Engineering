import { StatCard } from "../ui/index";
import { colors } from "../../../../styles/tokens";

const metricConfig = [
  { key: "activeCourses", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.primary.main} strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>, title: "Active Courses", color: colors.primary.main },
  { key: "roomsAvailable", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>, title: "Rooms Available", color: "#6D28D9" },
  { key: "pendingRequests", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.warning.main} strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/></svg>, title: "Pending Requests", color: colors.warning.main },
  { key: "detectedConflicts", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.error.main} strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>, title: "Detected Conflicts", color: colors.error.main },
  { key: "timetableStatus", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.success.main} strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, title: "Timetable Status", color: colors.success.main },
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
