import { useState, useEffect } from "react";
import {
  Card,
  Badge,
  Button,
  Loader,
  PageHeader,
} from "../components/ui/index";
import {
  fetchTimetableEngine,
  generateTimetable,
  publishTimetable,
} from "../services/adminApi";
import { colors, fonts, radius } from "../../../styles/tokens";
import { Play, Send, Clock } from "lucide-react";
import ConstraintTogglesCard from "../components/engine/ConstraintTogglesCard";
import SlotAllocationView from "../components/engine/SlotAllocationView";

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const timeToMinutes = (time = "00:00") => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export default function TimetableEngine() {
  const [engine, setEngine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [solverWarning, setSolverWarning] = useState("");
  const [constraints, setConstraints] = useState({
    hc1_enabled: true,
    sc1_enabled: true,
    sc2_enabled: true,
  });

  useEffect(() => {
    fetchTimetableEngine().then((res) => {
      setEngine(res);
      setLoading(false);
    });
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setSolverWarning("");
    const result = await generateTimetable(constraints);
    setGenerating(false);
    if (result.warning) {
      setSolverWarning(result.warning);
    }
    if (result.success) {
      setEngine((prev) => ({
        ...prev,
        currentVersion: result.version,
        constraintViolations: result.conflicts,
        solverDuration: result.duration,
        lastGenerated: new Date().toISOString(),
        status: "draft",
        latestAssignments: result.assignments || [],
        latestConstraints: result.constraints || constraints,
        latestStats: result.stats || null,
        totalSlotsFilled: result.assignments?.length || 0,
        totalSlotsAvailable:
          result.stats?.timeslotCount || prev.totalSlotsAvailable,
      }));
    }
  };

  const handleConstraintChange = (key, checked) => {
    setConstraints((prev) => ({ ...prev, [key]: checked }));
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

  const hasLatestAssignments = (engine.latestAssignments?.length || 0) > 0;
  const assignments = hasLatestAssignments ? engine.latestAssignments : [];

  const previewDays = hasLatestAssignments
    ? WEEK_DAYS.filter((day) => assignments.some((item) => item.day === day))
    : engine.generatedSchedule.map((day) => day.day);

  const previewRows = hasLatestAssignments
    ? [
        ...new Set(
          assignments.map((item) => `${item.startTime}|${item.endTime}`),
        ),
      ]
        .sort(
          (a, b) =>
            timeToMinutes(a.split("|")[0]) - timeToMinutes(b.split("|")[0]),
        )
        .map((rangeKey) => {
          const [startTime, endTime] = rangeKey.split("|");
          return {
            key: rangeKey,
            timeLabel: `${startTime} - ${endTime}`,
            slotsByDay: Object.fromEntries(
              previewDays.map((day) => [
                day,
                assignments.find(
                  (item) =>
                    item.day === day &&
                    item.startTime === startTime &&
                    item.endTime === endTime,
                ) || null,
              ]),
            ),
          };
        })
    : engine.generatedSchedule[0].slots.map((slot, slotIndex) => ({
        key: `${slot.time}-${slotIndex}`,
        timeLabel: slot.time,
        slotsByDay: Object.fromEntries(
          engine.generatedSchedule.map((day) => [
            day.day,
            day.slots[slotIndex] || null,
          ]),
        ),
      }));

  return (
    <div>
      {/* WHY: Replaced inline flex wrapper + h1+p with shared PageHeader, passing badges+buttons as action */}
      <PageHeader
        title="Timetable Engine"
        subtitle="Constraint-based schedule generation & publishing"
        action={
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Badge
              variant={status.variant}
              style={{ fontSize: fonts.size.sm, padding: "5px 14px" }}
            >
              {status.label} — {engine.currentVersion}
            </Badge>
            <Button
              variant="secondary"
              onClick={handleGenerate}
              disabled={generating}
              icon={
                generating ? (
                  <Clock size={14} className="spin" />
                ) : (
                  <Play size={14} />
                )
              }
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
        }
      />

      <ConstraintTogglesCard
        values={constraints}
        onChange={handleConstraintChange}
      />

      {solverWarning && (
        <Card
          style={{
            marginBottom: "16px",
            border: `1px solid ${colors.warning.border}`,
          }}
        >
          <div style={{ color: colors.warning.main, fontSize: fonts.size.xs }}>
            {solverWarning}
          </div>
        </Card>
      )}

      <Card style={{ padding: "20px" }} hover={false}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <h3
            style={{
              fontSize: fonts.size.md,
              fontWeight: fonts.weight.bold,
              color: colors.text.primary,
              margin: 0,
              fontFamily: fonts.heading,
            }}
          >
            Schedule Preview — {engine.currentVersion}
          </h3>
          <div style={{ display: "flex", gap: "6px" }}>
            <Badge variant="info">{engine.totalSlotsFilled} classes</Badge>
            {engine.constraintViolations > 0 && (
              <Badge variant="danger">
                {engine.constraintViolations} conflicts
              </Badge>
            )}
          </div>
        </div>

        <div
          style={{
            marginBottom: "12px",
            fontSize: fonts.size.xs,
            color: colors.text.muted,
          }}
        >
          Weekly schedule by day and time. Empty cells indicate no class
          assigned.
        </div>

        <div
          style={{
            overflowX: "auto",
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: radius.lg,
            background: colors.bg.raised,
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: "760px",
              borderCollapse: "collapse",
              fontSize: fonts.size.xs,
              fontFamily: fonts.body,
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    padding: "12px 10px",
                    textAlign: "left",
                    color: colors.text.muted,
                    fontSize: fonts.size.xs,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderBottom: `1px solid ${colors.border.medium}`,
                    width: "120px",
                    position: "sticky",
                    left: 0,
                    background: colors.bg.raised,
                    zIndex: 2,
                  }}
                >
                  Time
                </th>
                {previewDays.map((day) => (
                  <th
                    key={day}
                    style={{
                      padding: "12px 10px",
                      textAlign: "center",
                      color: colors.text.muted,
                      fontSize: fonts.size.xs,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: `1px solid ${colors.border.medium}`,
                      background: colors.bg.raised,
                    }}
                  >
                    {day.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row) => (
                <tr key={row.key}>
                  <td
                    style={{
                      padding: "12px 10px",
                      color: colors.text.secondary,
                      fontWeight: fonts.weight.semibold,
                      borderBottom: `1px solid ${colors.border.subtle}`,
                      whiteSpace: "nowrap",
                      position: "sticky",
                      left: 0,
                      background: colors.bg.raised,
                      zIndex: 1,
                    }}
                  >
                    {row.timeLabel}
                  </td>
                  {previewDays.map((day) => {
                    const slot = row.slotsByDay[day];
                    const empty = hasLatestAssignments ? !slot : !slot?.course;

                    if (empty) {
                      return (
                        <td
                          key={day}
                          style={{
                            padding: "8px",
                            borderBottom: `1px solid ${colors.border.subtle}`,
                            textAlign: "center",
                            background: colors.bg.base,
                          }}
                        >
                          <span
                            style={{
                              color: colors.text.disabled,
                              fontSize: fonts.size.xs,
                            }}
                          >
                            —
                          </span>
                        </td>
                      );
                    }

                    const courseTitle = hasLatestAssignments
                      ? slot.courseName
                      : slot.course;
                    const facultyTitle = hasLatestAssignments
                      ? slot.professorName
                      : `${slot.room} • ${slot.faculty}`;

                    return (
                      <td
                        key={day}
                        style={{
                          padding: "8px",
                          borderBottom: `1px solid ${colors.border.subtle}`,
                          background: colors.bg.base,
                        }}
                      >
                        <div
                          style={{
                            background: colors.bg.raised,
                            border: `1px solid ${colors.primary.border}`,
                            borderRadius: radius.md,
                            padding: "8px",
                            textAlign: "left",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: fonts.weight.semibold,
                              color: colors.primary.main,
                              fontSize: fonts.size.sm,
                              lineHeight: 1.3,
                            }}
                          >
                            {courseTitle}
                          </div>
                          <div
                            style={{
                              color: colors.text.muted,
                              fontSize: fonts.size.xs,
                              marginTop: "4px",
                            }}
                          >
                            {facultyTitle}
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

      <Card style={{ padding: "16px", marginTop: "16px" }}>
        <h3
          style={{
            margin: "0 0 10px 0",
            color: colors.text.primary,
            fontSize: fonts.size.md,
            fontFamily: fonts.heading,
          }}
        >
          Latest Solver Run
        </h3>
        <div
          style={{
            color: colors.text.secondary,
            fontSize: fonts.size.xs,
            lineHeight: 1.6,
          }}
        >
          HC1: {engine.latestConstraints?.hc1_enabled ? "ON" : "OFF"} · SC1:{" "}
          {engine.latestConstraints?.sc1_enabled ? "ON" : "OFF"} · SC2:{" "}
          {engine.latestConstraints?.sc2_enabled ? "ON" : "OFF"}
        </div>
        <div
          style={{
            color: colors.text.muted,
            fontSize: fonts.size.xs,
            marginTop: "6px",
          }}
        >
          Assignments generated: {engine.latestAssignments?.length || 0}
        </div>
      </Card>

      {/* New Views for Better Schedule Visualization */}
      <div style={{ marginTop: "20px" }}>
        <h2
          style={{
            fontSize: fonts.size.lg,
            fontWeight: fonts.weight.bold,
            color: colors.text.primary,
            marginBottom: "12px",
            fontFamily: fonts.heading,
          }}
        >
          Schedule Allocation
        </h2>

        <div>
          {/* @ts-ignore - MUI Box component */}
          <SlotAllocationView assignments={engine.latestAssignments || []} />
        </div>
      </div>
    </div>
  );
}
