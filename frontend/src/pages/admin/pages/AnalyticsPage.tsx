import { useState, useEffect } from "react";
import { Card, Loader, PageHeader } from "../../../shared";
import { fetchAnalytics } from "../../../features/admin/services";
import { colors, fonts, radius } from "../../../styles/tokens";

function BarChart({ data, labelKey, valueKey, maxValue, color = colors.primary.main }) {
  const max = maxValue || Math.max(...data.map((d) => d[valueKey]));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {data.map((item) => (
        <div key={item[labelKey]} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: fonts.size.xs, color: colors.text.muted, width: "80px", textAlign: "right", flexShrink: 0 }}>
            {item[labelKey]}
          </span>
          <div style={{ flex: 1, height: "8px", borderRadius: radius.sm, background: colors.bg.raised }}>
            <div style={{
              height: "100%", borderRadius: radius.sm,
              background: item[valueKey] > 100 ? "#ef4444" : item[valueKey] > 75 ? "#f59e0b" : color,
              width: `${Math.min((item[valueKey] / max) * 100, 100)}%`,
              transition: "width 0.5s ease",
            }} />
          </div>
          <span style={{
            fontSize: fonts.size.xs, fontWeight: fonts.weight.semibold, width: "40px",
            color: item[valueKey] > 100 ? "#ef4444" : item[valueKey] > 75 ? "#f59e0b" : color,
          }}>
            {item[valueKey]}%
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics().then((res) => { setData(res); setLoading(false); });
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      {/* WHY: Replaced inline h1+p with shared PageHeader to remove duplication */}
      <PageHeader title="Analytics" subtitle="System utilization and scheduling insights" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <Card style={{ padding: "20px" }} hover={false}>
          <h3 style={{ fontSize: fonts.size.sm, fontWeight: fonts.weight.bold, color: colors.text.primary, margin: "0 0 16px", fontFamily: fonts.heading }}>
            Room Utilization
          </h3>
          <BarChart data={data.roomUtilization} labelKey="room" valueKey="utilization" maxValue={100} color={colors.primary.main} />
        </Card>

        <Card style={{ padding: "20px" }} hover={false}>
          <h3 style={{ fontSize: fonts.size.sm, fontWeight: fonts.weight.bold, color: colors.text.primary, margin: "0 0 16px", fontFamily: fonts.heading }}>
            Faculty Load (% of Max)
          </h3>
          <BarChart data={data.facultyLoad} labelKey="name" valueKey="load" maxValue={150} color="#6D28D9" />
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <Card style={{ padding: "20px" }} hover={false}>
          <h3 style={{ fontSize: fonts.size.sm, fontWeight: fonts.weight.bold, color: colors.text.primary, margin: "0 0 16px", fontFamily: fonts.heading }}>
            Weekly Reschedule Requests
          </h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "120px" }}>
            {data.weeklyRequestTrend.map((w) => {
              const maxCount = Math.max(...data.weeklyRequestTrend.map((d) => d.count));
              const height = (w.count / maxCount) * 100;
              return (
                <div key={w.week} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <span style={{ fontSize: "10px", color: "#f59e0b", fontWeight: fonts.weight.semibold }}>{w.count}</span>
                  <div style={{
                    width: "100%", borderRadius: "4px 4px 0 0",
                    background: "linear-gradient(180deg, #f59e0b, rgba(245,158,11,0.2))",
                    height: `${height}%`, minHeight: "4px",
                    transition: "height 0.5s ease",
                  }} />
                  <span style={{ fontSize: "10px", color: colors.text.muted }}>{w.week}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card style={{ padding: "20px" }} hover={false}>
          <h3 style={{ fontSize: fonts.size.sm, fontWeight: fonts.weight.bold, color: colors.text.primary, margin: "0 0 16px", fontFamily: fonts.heading }}>
            Conflicts by Type
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {data.conflictsByType.map((item) => {
              const typeColors = { Room: "#ef4444", Faculty: "#f59e0b", Student: "#6D28D9", Exam: "#3b82f6" };
              const color = typeColors[item.type] || colors.primary.main;
              return (
                <div key={item.type} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "10px", height: "10px", borderRadius: "50%",
                    background: color, flexShrink: 0,
                  }} />
                  <span style={{ fontSize: fonts.size.sm, color: colors.text.secondary, flex: 1 }}>{item.type}</span>
                  <span style={{ fontSize: fonts.size.xl, fontWeight: fonts.weight.bold, color, fontFamily: fonts.body }}>{item.count}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
