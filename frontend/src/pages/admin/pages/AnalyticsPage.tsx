import { useState, useEffect } from "react";
import { Card, Loader, PageHeader } from "../../../shared";
import { fetchAnalytics } from "../../../features/admin/services";
import { colors, fonts, radius } from "../../../styles/tokens";
import { BarChart3, DoorOpen, AlertTriangle, RefreshCw } from "lucide-react";

function BarChart({ data, labelKey, valueKey, maxValue, color = colors.primary.main, unit = "%" }) {
  const max = maxValue || Math.max(...data.map((d) => d[valueKey]), 1);
  if (data.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "24px", color: colors.text.muted, fontSize: fonts.size.sm }}>
        No data yet
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {data.map((item) => {
        const val = item[valueKey];
        const isOver = val > 100;
        const isHigh = val > 75;
        const barColor = isOver ? colors.error.main : isHigh ? "#f59e0b" : color;
        return (
          <div key={item[labelKey]} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{
              fontSize: fonts.size.xs, color: colors.text.muted,
              width: "100px", textAlign: "right", flexShrink: 0,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }} title={item[labelKey]}>
              {item[labelKey]}
            </span>
            <div style={{ flex: 1, height: "8px", borderRadius: radius.sm, background: colors.bg.raised }}>
              <div style={{
                height: "100%", borderRadius: radius.sm,
                background: barColor,
                width: `${Math.min((val / max) * 100, 100)}%`,
                transition: "width 0.5s ease",
              }} />
            </div>
            <span style={{
              fontSize: fonts.size.xs, fontWeight: fonts.weight.semibold,
              width: "38px", textAlign: "right", color: barColor, flexShrink: 0,
            }}>
              {val}{unit}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function EmptyTimetable() {
  return (
    <div style={{
      gridColumn: "span 2",
      textAlign: "center",
      padding: "48px 20px",
      color: colors.text.muted,
    }}>
      <BarChart3 size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
      <div style={{ fontSize: fonts.size.base, fontWeight: 500, marginBottom: 6, color: colors.text.secondary }}>
        No published timetable
      </div>
      <div style={{ fontSize: fonts.size.sm }}>
        Generate and publish a timetable from the Timetable Engine to see analytics here.
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchAnalytics()
      .then((res) => { setData(res); setLoading(false); })
      .catch((err) => { setError(err.message || "Failed to load analytics"); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div>
        <PageHeader title="Analytics" subtitle="System utilization and scheduling insights" />
        <Card style={{ padding: "40px", textAlign: "center" }} hover={false}>
          <AlertTriangle size={32} color={colors.error.main} style={{ marginBottom: 12 }} />
          <div style={{ color: colors.error.main, marginBottom: 16 }}>{error}</div>
          <button
            onClick={load}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", background: colors.primary.main, color: "#fff",
              border: "none", borderRadius: radius.md, cursor: "pointer",
              fontSize: fonts.size.sm, fontFamily: fonts.body,
            }}
          >
            <RefreshCw size={14} /> Retry
          </button>
        </Card>
      </div>
    );
  }

  const summary = data?.summary ?? {};
  const hasTimetable = data?.hasTimetable ?? false;

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle={hasTimetable ? `Based on timetable version ${data.timetableVersion}` : "System utilization and scheduling insights"}
        action={
          <button
            onClick={load}
            title="Refresh"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 12px", background: "transparent", color: colors.text.secondary,
              border: `1px solid ${colors.border.medium}`, borderRadius: radius.md,
              cursor: "pointer", fontSize: fonts.size.sm, fontFamily: fonts.body,
            }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        }
      />

      {/* ── Summary cards ───────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" }}>
        {[
          {
            icon: <BarChart3 size={16} />,
            label: "Total Assignments",
            value: summary.totalAssignments ?? 0,
            color: colors.primary.main,
          },
          {
            icon: <DoorOpen size={16} />,
            label: "Rooms in Use",
            value: summary.totalRoomsInUse ?? 0,
            color: "#6D28D9",
          },
          {
            icon: <AlertTriangle size={16} />,
            label: "Conflicts",
            value: summary.totalConflicts ?? 0,
            color: summary.totalConflicts > 0 ? colors.error.main : colors.text.muted,
          },
        ].map((s) => (
          <Card key={s.label} style={{ padding: "16px" }}>
            <div style={{ color: s.color, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: fonts.size["2xl"], fontWeight: fonts.weight.bold, color: colors.text.primary, fontFamily: fonts.heading }}>
              {s.value}
            </div>
            <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginTop: 2 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        {!hasTimetable ? (
          <EmptyTimetable />
        ) : (
          <>
            <Card style={{ padding: "20px", gridColumn: "span 2" }} hover={false}>
              <h3 style={{ fontSize: fonts.size.sm, fontWeight: fonts.weight.bold, color: colors.text.primary, margin: "0 0 16px", fontFamily: fonts.heading }}>
                Room Utilization
              </h3>
              <p style={{ fontSize: fonts.size.xs, color: colors.text.muted, margin: "0 0 14px" }}>
                % of teaching slots each room is occupied
              </p>
              <BarChart
                data={data.roomUtilization ?? []}
                labelKey="room"
                valueKey="utilization"
                maxValue={100}
                color={colors.primary.main}
              />
            </Card>

          </>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* ── Weekly reschedule trend ── */}
        <Card style={{ padding: "20px" }} hover={false}>
          <h3 style={{ fontSize: fonts.size.sm, fontWeight: fonts.weight.bold, color: colors.text.primary, margin: "0 0 16px", fontFamily: fonts.heading }}>
            Weekly Reschedule Requests
          </h3>
          {(() => {
            const trend = data?.weeklyRequestTrend ?? [];
            const maxCount = Math.max(...trend.map((d) => d.count), 1);
            const hasAny = trend.some((d) => d.count > 0);
            if (!hasAny) {
              return (
                <div style={{ textAlign: "center", padding: "24px", color: colors.text.muted, fontSize: fonts.size.sm }}>
                  No reschedule requests in the past 6 weeks
                </div>
              );
            }
            return (
              <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "120px" }}>
                {trend.map((w) => {
                  const height = (w.count / maxCount) * 100;
                  return (
                    <div key={w.week} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                      {w.count > 0 && (
                        <span style={{ fontSize: "10px", color: "#f59e0b", fontWeight: fonts.weight.semibold }}>{w.count}</span>
                      )}
                      <div style={{
                        width: "100%", borderRadius: "4px 4px 0 0",
                        background: w.count > 0
                          ? "linear-gradient(180deg, #f59e0b, rgba(245,158,11,0.2))"
                          : colors.bg.raised,
                        height: `${Math.max(height, w.count > 0 ? 8 : 4)}%`,
                        minHeight: "4px",
                        transition: "height 0.5s ease",
                      }} />
                      <span style={{ fontSize: "10px", color: colors.text.muted }}>{w.week}</span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </Card>

        {/* ── Conflicts by type ── */}
        <Card style={{ padding: "20px" }} hover={false}>
          <h3 style={{ fontSize: fonts.size.sm, fontWeight: fonts.weight.bold, color: colors.text.primary, margin: "0 0 16px", fontFamily: fonts.heading }}>
            Conflicts by Type
          </h3>
          {!hasTimetable ? (
            <div style={{ textAlign: "center", padding: "24px", color: colors.text.muted, fontSize: fonts.size.sm }}>
              No timetable published yet
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {(data.conflictsByType ?? []).map((item) => {
                const typeColors = { Room: "#ef4444", Faculty: "#f59e0b", Student: "#6D28D9" };
                const color = typeColors[item.type] || colors.primary.main;
                return (
                  <div key={item.type} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: fonts.size.sm, color: colors.text.secondary, flex: 1 }}>{item.type} Conflicts</span>
                    <span style={{
                      fontSize: fonts.size.xl, fontWeight: fonts.weight.bold,
                      color: item.count > 0 ? color : colors.text.muted,
                      fontFamily: fonts.body,
                    }}>
                      {item.count}
                    </span>
                  </div>
                );
              })}
              {(data.conflictsByType ?? []).every((c) => c.count === 0) && (
                <div style={{ textAlign: "center", padding: "8px", fontSize: fonts.size.xs, color: colors.success.main }}>
                  No conflicts detected in current timetable
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
