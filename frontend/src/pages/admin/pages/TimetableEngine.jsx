import { useState, useEffect } from "react";
import { Card, Badge, Button, Loader } from "../components/ui/index";
import { fetchTimetableEngine, generateTimetable, publishTimetable } from "../services/adminApi";
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
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#fff", margin: "0 0 4px", fontFamily: "'Playfair Display', serif" }}>
            Timetable Engine
          </h1>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
            Constraint-based schedule generation & publishing
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Badge variant={status.variant} style={{ fontSize: "12px", padding: "5px 14px" }}>
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

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" }}>
        {[
          { icon: "⚡", label: "Solver Duration", value: engine.solverDuration, color: "#60efff" },
          { icon: "📊", label: "Slots Filled", value: `${engine.totalSlotsFilled}/${engine.totalSlotsAvailable}`, color: "#22c55e" },
          { icon: "⚠️", label: "Violations", value: engine.constraintViolations, color: engine.constraintViolations > 0 ? "#ef4444" : "#22c55e" },
          { icon: "📅", label: "Last Generated", value: new Date(engine.lastGenerated).toLocaleDateString(), color: "#a78bfa" },
        ].map((stat) => (
          <Card key={stat.label} style={{ padding: "16px" }}>
            <div style={{ fontSize: "20px", marginBottom: "8px" }}>{stat.icon}</div>
            <div style={{ fontSize: "22px", fontWeight: "700", color: stat.color, fontFamily: "'Space Mono', monospace" }}>{stat.value}</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", marginTop: "4px" }}>{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Generated Schedule Preview */}
      <Card style={{ padding: "20px" }} hover={false}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#fff", margin: 0, fontFamily: "'Playfair Display', serif" }}>
            Schedule Preview — {engine.currentVersion}
          </h3>
          <div style={{ display: "flex", gap: "6px" }}>
            <Badge variant="info">{engine.totalSlotsFilled} classes</Badge>
            {engine.constraintViolations > 0 && (
              <Badge variant="danger">{engine.constraintViolations} conflicts</Badge>
            )}
          </div>
        </div>

        {/* Timetable Grid */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
            <thead>
              <tr>
                <th style={{ padding: "8px 10px", textAlign: "left", color: "rgba(255,255,255,0.35)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid rgba(255,255,255,0.06)", width: "80px" }}>Time</th>
                {engine.generatedSchedule.map((day) => (
                  <th key={day.day} style={{ padding: "8px 10px", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {day.day.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {engine.generatedSchedule[0].slots.map((_, slotIndex) => (
                <tr key={slotIndex}>
                  <td style={{ padding: "8px 10px", color: "rgba(255,255,255,0.5)", fontWeight: "600", borderBottom: "1px solid rgba(255,255,255,0.04)", whiteSpace: "nowrap" }}>
                    {engine.generatedSchedule[0].slots[slotIndex].time}
                  </td>
                  {engine.generatedSchedule.map((day) => {
                    const slot = day.slots[slotIndex];
                    if (!slot.course) {
                      return (
                        <td key={day.day} style={{ padding: "6px", borderBottom: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
                          <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "10px" }}>—</span>
                        </td>
                      );
                    }
                    return (
                      <td key={day.day} style={{ padding: "6px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{
                          background: "rgba(96,239,255,0.08)",
                          border: "1px solid rgba(96,239,255,0.15)",
                          borderRadius: "6px",
                          padding: "6px 8px",
                          textAlign: "center",
                        }}>
                          <div style={{ fontWeight: "600", color: "#60efff", fontSize: "11px" }}>{slot.course}</div>
                          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "9px", marginTop: "2px" }}>
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
