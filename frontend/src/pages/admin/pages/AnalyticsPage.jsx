import { useState, useEffect } from "react";
import { Card, Loader } from "../components/ui/index";
import { fetchAnalytics } from "../services/adminApi";

function BarChart({ data, labelKey, valueKey, maxValue, color = "#60efff" }) {
  const max = maxValue || Math.max(...data.map((d) => d[valueKey]));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {data.map((item) => (
        <div key={item[labelKey]} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", width: "80px", textAlign: "right", flexShrink: 0 }}>
            {item[labelKey]}
          </span>
          <div style={{ flex: 1, height: "8px", borderRadius: "4px", background: "rgba(255,255,255,0.04)" }}>
            <div style={{
              height: "100%", borderRadius: "4px",
              background: item[valueKey] > 100 ? "#ef4444" : item[valueKey] > 75 ? "#f59e0b" : color,
              width: `${Math.min((item[valueKey] / max) * 100, 100)}%`,
              transition: "width 0.5s ease",
            }} />
          </div>
          <span style={{
            fontSize: "11px", fontWeight: "600", width: "40px",
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
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#fff", margin: "0 0 4px", fontFamily: "'Playfair Display', serif" }}>Analytics</h1>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>System utilization and scheduling insights</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        {/* Room Utilization */}
        <Card style={{ padding: "20px" }} hover={false}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#fff", margin: "0 0 16px", fontFamily: "'Playfair Display', serif" }}>
            Room Utilization
          </h3>
          <BarChart data={data.roomUtilization} labelKey="room" valueKey="utilization" maxValue={100} color="#60efff" />
        </Card>

        {/* Faculty Load */}
        <Card style={{ padding: "20px" }} hover={false}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#fff", margin: "0 0 16px", fontFamily: "'Playfair Display', serif" }}>
            Faculty Load (% of Max)
          </h3>
          <BarChart data={data.facultyLoad} labelKey="name" valueKey="load" maxValue={150} color="#a78bfa" />
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Weekly Request Trend */}
        <Card style={{ padding: "20px" }} hover={false}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#fff", margin: "0 0 16px", fontFamily: "'Playfair Display', serif" }}>
            Weekly Reschedule Requests
          </h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "120px" }}>
            {data.weeklyRequestTrend.map((w) => {
              const maxCount = Math.max(...data.weeklyRequestTrend.map((d) => d.count));
              const height = (w.count / maxCount) * 100;
              return (
                <div key={w.week} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <span style={{ fontSize: "10px", color: "#f59e0b", fontWeight: "600" }}>{w.count}</span>
                  <div style={{
                    width: "100%", borderRadius: "4px 4px 0 0",
                    background: "linear-gradient(180deg, #f59e0b, rgba(245,158,11,0.3))",
                    height: `${height}%`, minHeight: "4px",
                    transition: "height 0.5s ease",
                  }} />
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>{w.week}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Conflicts by Type */}
        <Card style={{ padding: "20px" }} hover={false}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#fff", margin: "0 0 16px", fontFamily: "'Playfair Display', serif" }}>
            Conflicts by Type
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {data.conflictsByType.map((item) => {
              const colors = { Room: "#ef4444", Faculty: "#f59e0b", Student: "#a78bfa", Exam: "#3b82f6" };
              const color = colors[item.type] || "#60efff";
              return (
                <div key={item.type} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "10px", height: "10px", borderRadius: "50%",
                    background: color, flexShrink: 0,
                  }} />
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", flex: 1 }}>{item.type}</span>
                  <span style={{ fontSize: "18px", fontWeight: "700", color, fontFamily: "'Space Mono', monospace" }}>{item.count}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
