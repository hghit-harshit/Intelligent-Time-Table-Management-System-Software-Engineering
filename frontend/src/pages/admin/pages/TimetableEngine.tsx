// @ts-nocheck
import { useState, useEffect } from "react";
import { Card, Badge, Button, Loader, PageHeader } from "../../../shared";
import {
  fetchTimetableEngine,
  generateTimetable,
  assignClassrooms,
  publishTimetable,
  saveTimetableDraft,
} from "../../../features/admin/services";
import {
  getSolverResults,
  saveSolverResults,
  clearSolverResults,
} from "../../../stores/timetableEngine.store";
import { colors, fonts, radius } from "../../../styles/tokens";
import { Play, Send, Clock } from "lucide-react";
import ConstraintTogglesCard from "../components/engine/ConstraintTogglesCard";
import SlotAllocationView from "../components/engine/SlotAllocationView";
import ClassroomAllocationView from "../components/engine/ClassroomAllocationView";
import { toast } from "sonner";

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const timeToMinutes = (time = "00:00") => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export default function TimetableEngine() {
  const [engine, setEngine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingSlots, setGeneratingSlots] = useState(false);
  const [assigningClassrooms, setAssigningClassrooms] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [solverWarning, setSolverWarning] = useState("");
  const [slotAssignments, setSlotAssignments] = useState([]); // Results from slot solver
  const [classroomAssignments, setClassroomAssignments] = useState([]); // Results from classroom solver
  const [constraints, setConstraints] = useState({
    hc1_enabled: true,
    hc2_enabled: true,
    hc3_enabled: true,
    sc1_enabled: true,
    sc2_enabled: true,
  });

  useEffect(() => {
    fetchTimetableEngine().then((res) => {
      // START FRESH: Do NOT load sessionStorage on initial page load
      // Only use sessionStorage when navigating back to this page
      // This prevents data contamination from previous solver runs

      setEngine(res);
      setLoading(false);
    });
  }, []);

  // Restore sessionStorage only when user navigates BACK (not on hard refresh)
  useEffect(() => {
    const handlePageShow = (event) => {
      // Only restore if this is a back/forward navigation (event.persisted = true for bfcache)
      // Don't restore on hard refresh
      if (event.persisted) {
        const savedResults = getSolverResults();
        if (savedResults && savedResults.assignments?.length > 0) {
          setEngine((prev) => ({
            ...prev,
            latestAssignments: savedResults.assignments,
            latestStats: savedResults.stats,
            latestConstraints: savedResults.constraints,
            totalSlotsFilled: savedResults.totalSlotsFilled,
            lastGenerated: savedResults.timestamp,
          }));

          // Restore into correct arrays based on whether rooms are assigned
          const hasRoomData = savedResults.assignments.some((a) => a.roomName);
          if (hasRoomData) {
            // If classrooms were assigned, restore to both
            setSlotAssignments(savedResults.assignments);
            setClassroomAssignments(savedResults.assignments);
          } else {
            // If only slots were assigned, restore to slots only
            setSlotAssignments(savedResults.assignments);
            setClassroomAssignments([]);
          }
        }
      }
      // If hard refresh (event.persisted = false), do NOT load - keep everything empty
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const handleGenerate = async () => {
    setGeneratingSlots(true);
    setSolverWarning("");
    // Clear old solver results and clear state to prevent duplication
    clearSolverResults();
    // Reset both slot and classroom assignments for fresh run
    setSlotAssignments([]);
    setClassroomAssignments([]);
    setEngine((prev) => ({
      ...prev,
      latestAssignments: [], // CLEAR assignments before fetching new ones
    }));

    const result = await generateTimetable(constraints);
    setGeneratingSlots(false);
    if (result.warning) {
      setSolverWarning(result.warning);
    }
    if (result.success) {
      // Save solver results to sessionStorage for persistence across navigation
      saveSolverResults({
        assignments: result.assignments || [],
        stats: result.stats || null,
        constraints: constraints,
        version: result.version,
      });

      // Save draft to backend
      await saveTimetableDraft(
        result.assignments || [],
        result.stats || null,
        constraints,
        result.version
      );

      // Set slot assignments (classroom will be empty until classroom solver runs)
      setSlotAssignments(result.assignments || []);
      setClassroomAssignments([]); // IMPORTANT: Clear classroom until explicitly assigned

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

      toast.success("Slot assignment completed!", {
        description: `Generated ${result.assignments?.length || 0} class assignments in ${result.duration}`,
      });
    } else {
      toast.error("Slot assignment failed", {
        description: result.warning || "Unknown error occurred",
      });
    }
  };

  const handleAssignClassrooms = async () => {
    if (!slotAssignments || slotAssignments.length === 0) {
      setSolverWarning("No slot assignments found. Run slot assignment first.");
      toast.warning("No slot assignments", {
        description: "Run slot assignment first before assigning classrooms",
      });
      return;
    }

    setAssigningClassrooms(true);
    setSolverWarning("");
    const result = await assignClassrooms(slotAssignments);
    setAssigningClassrooms(false);

    if (result.warning) {
      setSolverWarning(result.warning);
    }

    if (result.success) {
      // Update sessionStorage with new assignments that include room info
      saveSolverResults({
        assignments: result.assignments || [],
        stats: engine.latestStats || null,
        constraints: engine.latestConstraints || constraints,
        version: engine.currentVersion,
      });

      // Save updated draft with classrooms to backend
      await saveTimetableDraft(
        result.assignments || [],
        engine.latestStats || null,
        engine.latestConstraints || constraints,
        engine.currentVersion
      );

      // IMPORTANT: Set classroom assignments separately from slot assignments
      setClassroomAssignments(result.assignments || []);

      setEngine((prev) => ({
        ...prev,
        latestAssignments: result.assignments || [],
        classroomAssignmentDuration: result.duration,
        status: "draft",
      }));

      toast.success("Classroom assignment completed!", {
        description: result.message || `Assigned rooms in ${result.duration}`,
      });
    } else {
      toast.error("Classroom assignment failed", {
        description: result.warning || "Unknown error occurred",
      });
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
      toast.success("Timetable published!", {
        description: `Version ${engine.currentVersion} is now live`,
      });
    } else {
      toast.error("Publish failed", {
        description: "Failed to publish timetable",
      });
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
    : (engine.generatedSchedule?.length > 0 && engine.generatedSchedule[0]?.slots?.length > 0
          ? engine.generatedSchedule[0].slots.map((slot: any, slotIndex: number) => ({
              key: `${slot.time}-${slotIndex}`,
              timeLabel: slot.time,
              slotsByDay: Object.fromEntries(
                engine.generatedSchedule.map((day: any) => [
                  day.day,
                  day.slots[slotIndex] || null,
                ]),
              ),
            }))
          : []);

  const hasAnyData = hasLatestAssignments || (engine.generatedSchedule?.length > 0 && engine.generatedSchedule[0]?.slots?.length > 0);

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
              disabled={generatingSlots || assigningClassrooms}
              icon={
                generatingSlots ? (
                  <Clock size={14} className="spin" />
                ) : (
                  <Play size={14} />
                )
              }
            >
              {generatingSlots ? "Assigning Slots..." : "Run Slot Assignment"}
            </Button>
            <Button
              variant="secondary"
              onClick={handleAssignClassrooms}
              disabled={
                assigningClassrooms ||
                generatingSlots ||
                !engine.latestAssignments ||
                engine.latestAssignments.length === 0
              }
              icon={
                assigningClassrooms ? (
                  <Clock size={14} className="spin" />
                ) : (
                  <Play size={14} />
                )
              }
            >
              {assigningClassrooms
                ? "Assigning Rooms..."
                : "Run Classroom Assignment"}
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
            <Badge variant="info">
              {hasLatestAssignments
                ? `${assignments.length} classes`
                : `${engine.totalSlotsFilled || 0} classes`}
            </Badge>
            {engine.constraintViolations > 0 && (
              <Badge variant="danger">
                {engine.constraintViolations} conflicts
              </Badge>
            )}
          </div>
        </div>

        {!hasAnyData ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: colors.text.muted,
              background: colors.bg.base,
              borderRadius: radius.md,
            }}
          >
            <p style={{ margin: 0, fontSize: fonts.size.sm }}>
              No schedule generated yet. Click "Run Slot Assignment" to generate
              the timetable.
            </p>
          </div>
        ) : (
          <>
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
          </>
        )}
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
          {engine.latestConstraints?.sc2_enabled ? "ON" : "OFF"} · HC2:{" "}
          {engine.latestConstraints?.hc2_enabled !== false ? "ON" : "OFF"} ·
          HC3: {engine.latestConstraints?.hc3_enabled !== false ? "ON" : "OFF"}
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
          <SlotAllocationView assignments={slotAssignments || []} />
        </div>
      </div>

      <div style={{ marginTop: "32px" }}>
        <h2
          style={{
            fontSize: fonts.size.lg,
            fontWeight: fonts.weight.bold,
            color: colors.text.primary,
            marginBottom: "12px",
            fontFamily: fonts.heading,
          }}
        >
          Classroom Allocation
        </h2>

        <div>
          {/* @ts-ignore - MUI Box component */}
          <ClassroomAllocationView assignments={classroomAssignments || []} />
        </div>
      </div>
    </div>
  );
}
