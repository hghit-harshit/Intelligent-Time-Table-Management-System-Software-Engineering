import { useState, useEffect } from "react";
import { Card, Badge, Button, Loader } from "../components/ui/index";
import { fetchTimetableEngine, generateTimetable, publishTimetable } from "../services/adminApi";
import { colors, fonts, radius } from "../../../styles/tokens";
import { Cpu, Play, Send, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function TimetableEngine() {
  const [engine, setEngine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchTimetableEngine().then((res) => {
      setEngine(res);
      setLoading(false);
    });
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    const result = await generateTimetable();
    setGenerating(false);
    if (result.success) {
      setEngine((prev) => ({
        ...prev,
        currentVersion: result.version,
        constraintViolations: result.conflicts,
        solverDuration: result.duration,
        lastGenerated: new Date().toISOString(),
        status: "draft",
      }));
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    const result = await publishTimetable(engine.currentVersion);
    setPublishing(false);
    if (result.success) {
      setEngine((prev) => ({
        ...prev,
        status: "published",
        lastPublished: result.publishedAt,
      }));
    }
  };

  if (loading) return <Loader />;

  const statusBadge = {
    draft: { variant: "warning", label: "Draft" },
    published: { variant: "success", label: "Published" },
    generating: { variant: "info", label: "Generating..." },
  };
  const status = statusBadge[engine.status] || statusBadge.draft;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: fonts.size["2xl"], fontWeight: fonts.weight.bold, color: colors.text.primary, margin: "0 0 4px", fontFamily: fonts.heading }}>
            Timetable Engine
          </h1>
          <p style={{ fontSize: fonts.size.sm, color: colors.text.muted, margin: 0 }}>
            Constraint-based schedule generation & publishing
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Badge variant={status.variant} style={{ fontSize: fonts.size.sm, padding: "5px 14px" }}>
            {status.label} — {engine.currentVersion}
          </Badge>
          <Button
            variant="secondary"
            onClick={handleGenerate}
            disabled={generating}
            icon={generating ? <Clock size={14} className="spin" /> : <Play size={14} />}
          >
            {generating ? "Generating..." : "Run Solver"}
          </Button>
          <Button
            variant="primary"
            onClick={handlePublish}
            disabled={publishing || engine.status === "published"}
            icon={<Send size={14} />}
          >
            {publishing ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" }}>
        {[
          { icon: <Cpu size={16} />, label: "Solver Duration", value: engine.solverDuration, color: colors.primary.main },
          { icon: <CheckCircle size={16} />, label: "Slots Filled", value: `${engine.totalSlotsFilled}/${engine.totalSlotsAvailable}`, color: colors.success.main },
          { icon: <AlertTriangle size={16} />, label: "Violations", value: engine.constraintViolations, color: engine.constraintViolations > 0 ? colors.error.main : colors.success.main },
          { icon: <Clock size={16} />, label: "Last Generated", value: new Date(engine.lastGenerated).toLocaleDateString(), color: "#6D28D9" },
        ].map((stat) => (
          <Card key={stat.label} style={{ padding: "16px" }}>
            <div style={{ marginBottom: "8px", color: stat.color }}>{stat.icon}</div>
            <div style={{ fontSize: fonts.size["2xl"], fontWeight: fonts.weight.bold, color: colors.text.primary, fontFamily: fonts.heading }}>{stat.value}</div>
            <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginTop: "4px" }}>{stat.label}</div>
          </Card>
        ))}
      </div>

      <Card style={{ padding: "20px" }} hover={false}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h3 style={{ fontSize: fonts.size.md, fontWeight: fonts.weight.bold, color: colors.text.primary, margin: 0, fontFamily: fonts.heading }}>
            Schedule Preview — {engine.currentVersion}
          </h3>
          <div style={{ display: "flex", gap: "6px" }}>
            <Badge variant="info">{engine.totalSlotsFilled} classes</Badge>
            {engine.constraintViolations > 0 && (
              <Badge variant="danger">{engine.constraintViolations} conflicts</Badge>
            )}
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: fonts.size.xs, fontFamily: fonts.body }}>
            <thead>
              <tr>
                <th style={{ padding: "8px 10px", textAlign: "left", color: colors.text.muted, fontSize: fonts.size.xs, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${colors.border.medium}`, width: "80px" }}>Time</th>
                {engine.generatedSchedule.map((day) => (
                  <th key={day.day} style={{ padding: "8px 10px", textAlign: "center", color: colors.text.muted, fontSize: fonts.size.xs, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${colors.border.medium}` }}>
                    {day.day.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {engine.generatedSchedule[0].slots.map((_, slotIndex) => (
                <tr key={slotIndex}>
                  <td style={{ padding: "8px 10px", color: colors.text.secondary, fontWeight: fonts.weight.semibold, borderBottom: `1px solid ${colors.border.subtle}`, whiteSpace: "nowrap" }}>
                    {engine.generatedSchedule[0].slots[slotIndex].time}
                  </td>
                  {engine.generatedSchedule.map((day) => {
                    const slot = day.slots[slotIndex];
                    if (!slot.course) {
                      return (
                        <td key={day.day} style={{ padding: "6px", borderBottom: `1px solid ${colors.border.subtle}`, textAlign: "center" }}>
                          <span style={{ color: colors.text.disabled, fontSize: fonts.size.xs }}>—</span>
                        </td>
                      );
                    }
                    return (
                      <td key={day.day} style={{ padding: "6px", borderBottom: `1px solid ${colors.border.subtle}` }}>
                        <div style={{
                          background: colors.primary.ghost,
                          border: `1px solid ${colors.primary.border}`,
                          borderRadius: radius.md,
                          padding: "6px 8px",
                          textAlign: "center",
                        }}>
                          <div style={{ fontWeight: fonts.weight.semibold, color: colors.primary.main, fontSize: fonts.size.xs }}>{slot.course}</div>
                          <div style={{ color: colors.text.muted, fontSize: "9px", marginTop: "2px" }}>
                            {slot.room} • {slot.faculty}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
