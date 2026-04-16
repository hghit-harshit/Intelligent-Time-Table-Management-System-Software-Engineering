// @ts-nocheck
import { useState, useEffect } from "react";
import { Card, Badge, Button, Loader, Modal, PageHeader } from "../../../shared";
import {
  fetchTimetableEngine,
  fetchRuns,
  fetchTimetableByRun,
  fetchRunViolations,
  toggleAssignmentLock,
  generateTimetable,
  assignClassrooms,
  publishTimetable,
} from "../../../features/admin/services";
import {
  getSolverResults,
  saveSolverResults,
  clearSolverResults,
} from "../../../stores/timetableEngine.store";
import { colors, fonts, radius } from "../../../styles/tokens";
import { Play, Send, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import ConstraintTogglesCard from "../components/engine/ConstraintTogglesCard";
import SlotAllocationView from "../components/engine/SlotAllocationView";
import ClassroomAllocationView from "../components/engine/ClassroomAllocationView";
import AdminTimetableGrid from "../components/engine/AdminTimetableGrid";

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const WORKFLOW_STEPS = [
  "Configure constraints",
  "Run slot assignment",
  "Review violations",
  "Classroom allocation",
  "Preview and publish",
];

const HARD_CONSTRAINTS = [
  {
    key: "hc1_enabled",
    title: "HC1 — One class per faculty at a time",
    description: "A faculty cannot be assigned to overlapping slots.",
  },
];

const SOFT_CONSTRAINTS = [
  {
    key: "sc1_enabled",
    weightKey: "sc1_weight",
    title: "SC1 — Avoid unavailable/blocked slots",
    description: "Prefer avoiding blocked slots whenever possible.",
  },
  {
    key: "sc2_enabled",
    weightKey: "sc2_weight",
    title: "SC2 — Respect preferred days-off",
    description: "Prefer keeping faculty day-off preferences.",
  },
];

const isBackendUnreachableError = (message = "") =>
  /cannot reach backend api/i.test(message);

const timeToMinutes = (time = "00:00") => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const flattenAssignmentsFromSlots = (slots = []) => {
  return (slots || []).flatMap((slot) =>
    (slot.assignments || []).map((assignment) => {
      const firstOccurrence = Array.isArray(slot?.occurrences)
        ? slot.occurrences[0]
        : null;

      return {
        assignmentId: assignment.assignmentId,
        courseId: assignment.course?.id,
        courseName: assignment.course?.name,
        courseCode: assignment.course?.code,
        professorId: assignment.faculty?.id,
        professorName: assignment.faculty?.name,
        roomName: assignment.room?.name || "UNASSIGNED",
        roomId: assignment.room?.id || null,
        slotId: slot.slotId,
        slotLabel: slot.label,
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime || firstOccurrence?.endTime || "",
        violations: assignment.violations || [],
        isLocked: assignment.isLocked ?? false,
      };
    }),
  );
};

export default function TimetableEngine() {
  const [engine, setEngine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingSlots, setGeneratingSlots] = useState(false);
  const [assigningClassrooms, setAssigningClassrooms] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [solverWarning, setSolverWarning] = useState("");
  const [runs, setRuns] = useState([]);
  const [selectedRunId, setSelectedRunId] = useState("");
  const [runSlots, setRunSlots] = useState([]);
  const [runViolationSummary, setRunViolationSummary] = useState({
    constraints: [],
    totalViolations: 0,
  });
  const [slotAssignments, setSlotAssignments] = useState([]); // Results from slot solver
  const [classroomAssignments, setClassroomAssignments] = useState([]); // Results from classroom solver
  const [constraints, setConstraints] = useState({
    hc1_enabled: true,
    sc1_enabled: true,
    sc2_enabled: true,
  });
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [workflowStep, setWorkflowStep] = useState(0);
  const [workflowConstraints, setWorkflowConstraints] = useState({
    hc1_enabled: true,
    sc1_enabled: true,
    sc2_enabled: true,
  });
  const [workflowWeights, setWorkflowWeights] = useState({
    sc1_weight: 1,
    sc2_weight: 1,
  });
  const [workflowRunResult, setWorkflowRunResult] = useState(null);
  const [workflowRoomResult, setWorkflowRoomResult] = useState(null);
  const [workflowAckViolations, setWorkflowAckViolations] = useState(false);
  const [workflowLoadingStep2, setWorkflowLoadingStep2] = useState(false);
  const [workflowLoadingStep4, setWorkflowLoadingStep4] = useState(false);
  const [workflowLoadingPublish, setWorkflowLoadingPublish] = useState(false);
  const [workflowError, setWorkflowError] = useState("");
  const [lockDecision, setLockDecision] = useState("");
  const [toasts, setToasts] = useState([]);

  const pushToast = (variant, message) => {
    const toastId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id: toastId, variant, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== toastId));
    }, 4000);
  };

  const closeWorkflowModal = () => {
    setWorkflowOpen(false);
    setWorkflowStep(0);
    setWorkflowRunResult(null);
    setWorkflowRoomResult(null);
    setWorkflowAckViolations(false);
    setWorkflowError("");
    setLockDecision("");
    setWorkflowLoadingStep2(false);
    setWorkflowLoadingStep4(false);
    setWorkflowLoadingPublish(false);
  };

  const openWorkflowModal = () => {
    setWorkflowConstraints({ ...constraints });
    setWorkflowOpen(true);
    setWorkflowStep(0);
    setWorkflowRunResult(null);
    setWorkflowRoomResult(null);
    setWorkflowAckViolations(false);
    setWorkflowError("");
    setLockDecision("");
  };

  const refreshRuns = async () => {
    try {
      const fetchedRuns = await fetchRuns();
      setRuns(fetchedRuns);
      return fetchedRuns;
    } catch {
      return [];
    }
  };

  const loadRunArtifacts = async (runId) => {
    if (!runId) return;
    const [timetablePayload, violationPayload] = await Promise.all([
      fetchTimetableByRun(runId),
      fetchRunViolations(runId),
    ]);

    const slots = timetablePayload?.slots || [];
    const flattened = flattenAssignmentsFromSlots(slots);

    setRunSlots(slots);
    setRunViolationSummary(
      violationPayload || { constraints: [], totalViolations: 0 },
    );
    setSlotAssignments(flattened);
    setClassroomAssignments(flattened);
    setEngine((prev) => ({
      ...prev,
      latestAssignments: flattened,
      totalSlotsFilled: flattened.length,
      constraintViolations: violationPayload?.totalViolations || 0,
    }));
  };

  useEffect(() => {
    const boot = async () => {
      try {
        const engineSnapshot = await fetchTimetableEngine();
        setEngine(engineSnapshot);

        try {
          const fetchedRuns = await fetchRuns();
          setRuns(fetchedRuns);
          if (fetchedRuns.length > 0) {
            const latestRunId = fetchedRuns[0].runId;
            setSelectedRunId(latestRunId);
            await loadRunArtifacts(latestRunId);
            setEngine((prev) => ({
              ...prev,
              status: fetchedRuns[0].status || prev?.status || "draft",
            }));
          }
        } catch (error) {
          const message =
            error?.message || "Failed to load run metadata. Showing base view.";
          if (!isBackendUnreachableError(message)) {
            setSolverWarning(message);
          }
        }
      } catch (error) {
        setSolverWarning(error.message || "Failed to load timetable engine");
      } finally {
        setLoading(false);
      }
    };

    boot();
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
      if (result.runId) {
        setSelectedRunId(result.runId);
        await loadRunArtifacts(result.runId);
      }

      // Save solver results to sessionStorage for persistence across navigation
      saveSolverResults({
        assignments: result.assignments || [],
        stats: result.stats || null,
        constraints: constraints,
        version: result.version,
      });

      // Set slot assignments (classroom will be empty until classroom solver runs)
      setSlotAssignments(result.assignments || []);
      setClassroomAssignments([]); // IMPORTANT: Clear classroom until explicitly assigned

      setEngine((prev) => ({
        ...prev,
        currentVersion: result.version || result.runId || prev.currentVersion,
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

      await refreshRuns();
    }

    return result;
  };

  const handleToggleAssignmentLock = async (assignmentId, locked) => {
    if (!selectedRunId) {
      throw new Error("No active run selected");
    }

    const response = await toggleAssignmentLock(selectedRunId, assignmentId, locked);
    setRunSlots((prev) =>
      prev.map((slot) => ({
        ...slot,
        assignments: (slot.assignments || []).map((entry) =>
          entry.assignmentId === response.assignmentId
            ? { ...entry, isLocked: response.isLocked }
            : entry,
        ),
      })),
    );
    setSlotAssignments((prev) =>
      prev.map((entry) =>
        entry.assignmentId === response.assignmentId
          ? { ...entry, isLocked: response.isLocked }
          : entry,
      ),
    );
    setClassroomAssignments((prev) =>
      prev.map((entry) =>
        entry.assignmentId === response.assignmentId
          ? { ...entry, isLocked: response.isLocked }
          : entry,
      ),
    );
    return response;
  };

  const handleAssignClassrooms = async () => {
    if (!slotAssignments || slotAssignments.length === 0) {
      setSolverWarning("No slot assignments found. Run slot assignment first.");
      return { success: false };
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

      // IMPORTANT: Set classroom assignments separately from slot assignments
      setClassroomAssignments(result.assignments || []);

      setEngine((prev) => ({
        ...prev,
        latestAssignments: result.assignments || [],
        classroomAssignmentDuration: result.duration,
        status: "draft",
      }));
    }

    return result;
  };

  const handleConstraintChange = (key, checked) => {
    setConstraints((prev) => ({ ...prev, [key]: checked }));
  };

  const handlePublish = async () => {
    const runIdToPublish = selectedRunId || engine.currentVersion;
    if (!runIdToPublish) {
      return { success: false, warning: "No run selected for publish" };
    }

    setPublishing(true);
    const result = await publishTimetable(runIdToPublish);
    setPublishing(false);
    if (result.success) {
      setEngine((prev) => ({
        ...prev,
        status: "published",
        lastPublished: result.publishedAt,
      }));

      setRuns((prev) =>
        prev.map((run) => ({
          ...run,
          status: run.runId === runIdToPublish ? "published" : "draft",
        })),
      );
    }

    return result;
  };

  const lockedAssignments = runSlots.flatMap((slot) =>
    (slot.assignments || []).filter((assignment) => assignment.isLocked),
  );

  const hasHardConstraintViolations = (runViolationSummary?.constraints || []).some(
    (item) =>
      String(item.constraintName || "").toLowerCase().startsWith("hc") &&
      (item.violationsCount || 0) > 0,
  );

  const canProceedFromStep = () => {
    if (workflowStep === 0) return true;
    if (workflowStep === 1) return Boolean(workflowRunResult?.success);
    if (workflowStep === 2) {
      if (hasHardConstraintViolations) return false;
      if ((runViolationSummary?.totalViolations || 0) === 0) return true;
      return workflowAckViolations;
    }
    if (workflowStep === 3) return Boolean(workflowRoomResult?.success);
    return false;
  };

  const runSlotAssignmentFromWorkflow = async () => {
    if (lockedAssignments.length > 0 && !lockDecision) {
      setWorkflowError(
        "Choose Preserve locked or Override all before running solver.",
      );
      return;
    }

    setWorkflowError("");
    setWorkflowLoadingStep2(true);

    try {
      if (
        lockDecision === "override" &&
        selectedRunId &&
        lockedAssignments.length > 0
      ) {
        await Promise.all(
          lockedAssignments.map((assignment) =>
            toggleAssignmentLock(selectedRunId, assignment.assignmentId, false),
          ),
        );

        setRunSlots((prev) =>
          prev.map((slot) => ({
            ...slot,
            assignments: (slot.assignments || []).map((assignment) => ({
              ...assignment,
              isLocked: false,
            })),
          })),
        );
      }

      clearSolverResults();
      setSlotAssignments([]);
      setClassroomAssignments([]);
      setEngine((prev) => ({
        ...prev,
        latestAssignments: [],
      }));

      const generated = await generateTimetable({
        hc1_enabled: workflowConstraints.hc1_enabled,
        sc1_enabled: workflowConstraints.sc1_enabled,
        sc2_enabled: workflowConstraints.sc2_enabled,
        sc1_weight: workflowWeights.sc1_weight,
        sc2_weight: workflowWeights.sc2_weight,
      });

      if (!generated.success) {
        setWorkflowRunResult(null);
        setWorkflowError(
          generated.warning ||
            "No feasible solution found. Adjust constraints and retry.",
        );
        pushToast(
          "danger",
          generated.warning || "Solver failed — no feasible solution",
        );
        return;
      }

      if (generated.runId) {
        setSelectedRunId(generated.runId);
        await loadRunArtifacts(generated.runId);
      }

      const resultSummary = {
        success: true,
        runId: generated.runId,
        classesAssigned: generated.assignments?.length || generated.totalAssignments || 0,
        softViolations: generated.conflicts || generated.totalSoftViolations || 0,
        runtime: generated.duration || `${generated.runtime || 0}s`,
      };

      saveSolverResults({
        assignments: generated.assignments || [],
        stats: generated.stats || null,
        constraints: workflowConstraints,
        version: generated.version,
      });

      setConstraints(workflowConstraints);
      setWorkflowRunResult(resultSummary);
      setEngine((prev) => ({
        ...prev,
        currentVersion: generated.version || generated.runId || prev.currentVersion,
        status: "draft",
      }));

      await refreshRuns();

      pushToast(
        "success",
        `Solver completed · ${
          resultSummary.classesAssigned || generated.totalAssignments || 0
        } assignments`,
      );

      if ((resultSummary.softViolations || 0) > 0) {
        pushToast(
          "warning",
          `${resultSummary.softViolations} soft violations detected`,
        );
      }
    } catch (error) {
      const message =
        error?.message || "No feasible solution found. Adjust constraints and retry.";
      setWorkflowError(message);
      pushToast("danger", "Solver failed — no feasible solution");
    } finally {
      setWorkflowLoadingStep2(false);
    }
  };

  const runClassroomAllocationFromWorkflow = async () => {
    setWorkflowLoadingStep4(true);
    setWorkflowError("");
    const result = await handleAssignClassrooms();
    setWorkflowLoadingStep4(false);

    if (!result?.success) {
      const message =
        result?.warning ||
        result?.message ||
        "Classroom assignment failed. Please try again.";
      setWorkflowError(message);
      pushToast("danger", message);
      return;
    }

    const summary = {
      success: true,
      assignedCount: result?.assignments?.length || 0,
      runtime: result?.duration || "—",
    };

    setWorkflowRoomResult(summary);
    pushToast("success", `Classrooms assigned · ${summary.assignedCount} classes`);
  };

  const publishFromWorkflow = async () => {
    setWorkflowLoadingPublish(true);
    const result = await handlePublish();
    setWorkflowLoadingPublish(false);

    if (!result?.success) {
      const message = result?.warning || "Failed to publish run";
      setWorkflowError(message);
      pushToast("danger", message);
      return;
    }

    await refreshRuns();
    closeWorkflowModal();
    pushToast("success", "Schedule published");
  };

  if (loading) return <Loader />;
  if (!engine) {
    return (
      <Card style={{ padding: "16px" }} hover={false}>
        <div style={{ color: colors.error.main, fontSize: fonts.size.sm }}>
          Unable to load timetable engine data.
        </div>
      </Card>
    );
  }

  const statusBadge = {
    draft: { variant: "warning", label: "Draft" },
    published: { variant: "success", label: "Published" },
    generating: { variant: "info", label: "Generating..." },
  };
  const status = statusBadge[engine.status] || statusBadge.draft;
  const isPublished = engine.status === "published";

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
      <div
        style={{
          position: "fixed",
          top: "14px",
          right: "14px",
          zIndex: 3000,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              pointerEvents: "auto",
              minWidth: "260px",
              maxWidth: "420px",
              borderRadius: radius.md,
              border:
                toast.variant === "success"
                  ? `1px solid ${colors.success.border}`
                  : toast.variant === "warning"
                    ? `1px solid ${colors.warning.border}`
                    : `1px solid ${colors.error.border}`,
              background:
                toast.variant === "success"
                  ? colors.success.ghost
                  : toast.variant === "warning"
                    ? colors.warning.ghost
                    : colors.error.ghost,
              color:
                toast.variant === "success"
                  ? colors.success.main
                  : toast.variant === "warning"
                    ? colors.warning.main
                    : colors.error.main,
              padding: "10px 12px",
              fontSize: fonts.size.xs,
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>

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
              variant="primary"
              onClick={openWorkflowModal}
              disabled={workflowOpen}
              icon={<Play size={14} />}
            >
              Start Assignment
            </Button>
            <Button
              variant="secondary"
              onClick={openWorkflowModal}
              disabled={isPublished || !selectedRunId}
              icon={<Send size={14} />}
            >
              {isPublished ? "Published" : "Publish"}
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

      {isPublished && (
        <Card
          style={{
            marginBottom: "16px",
            border: `1px solid ${colors.info.border}`,
            background: colors.info.ghost,
          }}
          hover={false}
        >
          <div style={{ color: colors.info.main, fontSize: fonts.size.sm }}>
            Schedule finalised · Minor preference trade-offs exist
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
              <Badge variant={isPublished ? "neutral" : "danger"}>
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

      <AdminTimetableGrid
        runId={selectedRunId}
        slots={runSlots}
        violationSummary={runViolationSummary}
        onToggleLock={handleToggleAssignmentLock}
        isPublished={isPublished}
      />

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

      <Modal open={workflowOpen} onClose={closeWorkflowModal} maxWidth="780px">
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: fonts.size.lg,
                  color: colors.text.primary,
                  fontFamily: fonts.heading,
                }}
              >
                Assignment Workflow
              </h3>
              <div style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>
                Step {workflowStep + 1} of {WORKFLOW_STEPS.length} · {WORKFLOW_STEPS[workflowStep]}
              </div>
            </div>
            <Button variant="ghost" onClick={closeWorkflowModal}>Cancel</Button>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {WORKFLOW_STEPS.map((label, index) => {
              const done = index < workflowStep;
              const active = index === workflowStep;
              return (
                <div
                  key={label}
                  style={{
                    padding: "6px 10px",
                    borderRadius: radius.full,
                    border: `1px solid ${
                      active
                        ? colors.primary.border
                        : done
                          ? colors.success.border
                          : colors.border.medium
                    }`,
                    background: active
                      ? colors.primary.ghost
                      : done
                        ? colors.success.ghost
                        : colors.bg.raised,
                    color: active
                      ? colors.primary.main
                      : done
                        ? colors.success.main
                        : colors.text.muted,
                    fontSize: fonts.size.xs,
                    fontWeight: fonts.weight.semibold,
                  }}
                >
                  {index + 1}. {label}
                </div>
              );
            })}
          </div>

          {workflowError && (
            <Card
              style={{
                border: `1px solid ${colors.error.border}`,
                background: colors.error.ghost,
                padding: "12px",
              }}
              hover={false}
            >
              <div style={{ color: colors.error.main, fontSize: fonts.size.xs }}>
                {workflowError}
              </div>
            </Card>
          )}

          {workflowStep === 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Card hover={false} style={{ padding: "14px" }}>
                <h4
                  style={{
                    margin: "0 0 10px 0",
                    color: colors.text.primary,
                    fontSize: fonts.size.md,
                  }}
                >
                  Hard Constraints
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {HARD_CONSTRAINTS.map((item) => (
                    <div
                      key={item.key}
                      style={{
                        border: `1px solid ${colors.border.subtle}`,
                        borderRadius: radius.md,
                        padding: "10px",
                      }}
                    >
                      <div style={{ color: colors.text.primary, fontSize: fonts.size.sm }}>
                        {item.title}
                      </div>
                      <div style={{ color: colors.text.muted, fontSize: fonts.size.xs, marginTop: "4px" }}>
                        {item.description}
                      </div>
                      <Badge variant="neutral" style={{ marginTop: "8px" }}>
                        Mandatory
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card hover={false} style={{ padding: "14px" }}>
                <h4
                  style={{
                    margin: "0 0 10px 0",
                    color: colors.text.primary,
                    fontSize: fonts.size.md,
                  }}
                >
                  Soft Constraints
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {SOFT_CONSTRAINTS.map((item) => (
                    <div
                      key={item.key}
                      style={{
                        border: `1px solid ${colors.border.subtle}`,
                        borderRadius: radius.md,
                        padding: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div>
                          <div style={{ color: colors.text.primary, fontSize: fonts.size.sm }}>
                            {item.title}
                          </div>
                          <div style={{ color: colors.text.muted, fontSize: fonts.size.xs, marginTop: "4px" }}>
                            {item.description}
                          </div>
                        </div>
                        <label style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <input
                            type="checkbox"
                            checked={workflowConstraints[item.key]}
                            onChange={(event) =>
                              setWorkflowConstraints((prev) => ({
                                ...prev,
                                [item.key]: event.target.checked,
                              }))
                            }
                          />
                          <span style={{ fontSize: fonts.size.xs, color: colors.text.secondary }}>
                            Enabled
                          </span>
                        </label>
                      </div>
                      <div style={{ marginTop: "10px" }}>
                        <label style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>
                          Weight
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={workflowWeights[item.weightKey]}
                          disabled={!workflowConstraints[item.key]}
                          onChange={(event) =>
                            setWorkflowWeights((prev) => ({
                              ...prev,
                              [item.weightKey]: Number(event.target.value || 0),
                            }))
                          }
                          style={{
                            marginTop: "6px",
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: radius.sm,
                            border: `1px solid ${colors.border.medium}`,
                            background: colors.bg.base,
                            color: colors.text.primary,
                            fontSize: fonts.size.sm,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {workflowStep === 1 && (
            <Card hover={false} style={{ padding: "14px" }}>
              <div style={{ marginBottom: "10px", color: colors.text.secondary }}>
                Run slot assignment solver using configured constraints.
              </div>

              {lockedAssignments.length > 0 && (
                <div
                  style={{
                    border: `1px solid ${colors.warning.border}`,
                    background: colors.warning.ghost,
                    borderRadius: radius.md,
                    padding: "10px",
                    marginBottom: "12px",
                  }}
                >
                  <div style={{ color: colors.warning.main, fontSize: fonts.size.sm }}>
                    You have {lockedAssignments.length} locked assignments from a previous run.
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    <Button
                      variant={lockDecision === "preserve" ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setLockDecision("preserve")}
                    >
                      Preserve locked
                    </Button>
                    <Button
                      variant={lockDecision === "override" ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setLockDecision("override")}
                    >
                      Override all
                    </Button>
                  </div>
                </div>
              )}

              <Button
                onClick={runSlotAssignmentFromWorkflow}
                disabled={workflowLoadingStep2}
                icon={
                  workflowLoadingStep2 ? <Clock size={14} className="spin" /> : <Play size={14} />
                }
              >
                {workflowLoadingStep2 ? "Running slot assignment…" : "Run Solver"}
              </Button>

              {workflowRunResult?.success && (
                <Card
                  hover={false}
                  style={{ marginTop: "12px", padding: "12px", border: `1px solid ${colors.success.border}` }}
                >
                  <div style={{ color: colors.success.main, fontSize: fonts.size.sm, marginBottom: "8px" }}>
                    Slot assignment completed
                  </div>
                  <div style={{ fontSize: fonts.size.xs, color: colors.text.secondary, lineHeight: 1.8 }}>
                    ✔ {workflowRunResult.classesAssigned} classes assigned
                    <br />
                    ⚠ {workflowRunResult.softViolations} soft constraint violations
                    <br />
                    ⏱ Runtime: {workflowRunResult.runtime}
                  </div>
                </Card>
              )}
            </Card>
          )}

          {workflowStep === 2 && (
            <Card hover={false} style={{ padding: "14px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <h4 style={{ margin: 0, color: colors.text.primary, fontSize: fonts.size.md }}>
                  Violation Summary
                </h4>
                {runViolationSummary?.totalViolations > 0 ? (
                  <Badge variant="warning">{runViolationSummary.totalViolations} violations</Badge>
                ) : (
                  <Badge variant="success">All constraints satisfied</Badge>
                )}
              </div>

              {hasHardConstraintViolations && (
                <div
                  style={{
                    border: `1px solid ${colors.error.border}`,
                    background: colors.error.ghost,
                    color: colors.error.main,
                    borderRadius: radius.md,
                    padding: "10px",
                    marginBottom: "10px",
                    fontSize: fonts.size.xs,
                  }}
                >
                  Hard constraints failed. Fix constraints and rerun solver.
                </div>
              )}

              {(runViolationSummary?.constraints || []).length === 0 ? (
                <div style={{ color: colors.text.muted, fontSize: fonts.size.sm }}>
                  No soft constraint violations found.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {(runViolationSummary?.constraints || []).map((constraint) => (
                    <div
                      key={constraint.constraintName}
                      style={{
                        border: `1px solid ${colors.border.subtle}`,
                        borderRadius: radius.md,
                        padding: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ color: colors.text.primary, fontSize: fonts.size.sm }}>
                          {constraint.constraintName}
                        </div>
                        <div style={{ color: colors.text.muted, fontSize: fonts.size.xs }}>
                          {constraint.violationsCount || 0}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(runViolationSummary?.totalViolations || 0) > 0 && !hasHardConstraintViolations && (
                <label
                  style={{
                    marginTop: "12px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: fonts.size.xs,
                    color: colors.text.secondary,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={workflowAckViolations}
                    onChange={(event) => setWorkflowAckViolations(event.target.checked)}
                  />
                  Acknowledge and continue
                </label>
              )}
            </Card>
          )}

          {workflowStep === 3 && (
            <Card hover={false} style={{ padding: "14px" }}>
              <div style={{ color: colors.text.secondary, marginBottom: "10px" }}>
                Assign classrooms to slot allocations.
              </div>

              <Button
                onClick={runClassroomAllocationFromWorkflow}
                disabled={workflowLoadingStep4}
                icon={
                  workflowLoadingStep4 ? <Clock size={14} className="spin" /> : <Play size={14} />
                }
              >
                {workflowLoadingStep4 ? "Assigning classrooms…" : "Assign Classrooms"}
              </Button>

              {workflowRoomResult?.success && (
                <Card
                  hover={false}
                  style={{ marginTop: "12px", padding: "12px", border: `1px solid ${colors.success.border}` }}
                >
                  <div style={{ color: colors.success.main, fontSize: fonts.size.sm, marginBottom: "8px" }}>
                    Classroom allocation completed
                  </div>
                  <div style={{ fontSize: fonts.size.xs, color: colors.text.secondary, lineHeight: 1.8 }}>
                    ✔ {workflowRoomResult.assignedCount} classes assigned rooms
                    <br />
                    ⏱ Runtime: {workflowRoomResult.runtime}
                  </div>
                </Card>
              )}
            </Card>
          )}

          {workflowStep === 4 && (
            <Card hover={false} style={{ padding: "14px" }}>
              <h4 style={{ margin: "0 0 10px 0", color: colors.text.primary, fontSize: fonts.size.md }}>
                Preview and publish
              </h4>
              <div style={{ fontSize: fonts.size.xs, color: colors.text.secondary, lineHeight: 1.8 }}>
                ✔ {engine.totalSlotsFilled || workflowRunResult?.classesAssigned || 0} classes scheduled
                <br />
                ⚠ {runViolationSummary?.totalViolations || workflowRunResult?.softViolations || 0} soft violations remaining
                <br />
                Visible to: Students, Faculty
              </div>

              <div style={{ marginTop: "14px", display: "flex", gap: "10px" }}>
                <Button
                  onClick={publishFromWorkflow}
                  disabled={workflowLoadingPublish || isPublished || !selectedRunId}
                  icon={
                    workflowLoadingPublish ? (
                      <Clock size={14} className="spin" />
                    ) : (
                      <CheckCircle2 size={14} />
                    )
                  }
                >
                  {isPublished
                    ? "Published"
                    : workflowLoadingPublish
                      ? "Publishing..."
                      : "Publish"}
                </Button>

                {(runViolationSummary?.totalViolations || 0) > 0 && (
                  <Badge variant="warning">
                    <AlertTriangle size={12} style={{ marginRight: "4px" }} />
                    Minor preference trade-offs exist
                  </Badge>
                )}
              </div>
            </Card>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Button
              variant="secondary"
              onClick={() => setWorkflowStep((prev) => Math.max(0, prev - 1))}
              disabled={workflowStep === 0}
            >
              Back
            </Button>

            <div style={{ display: "flex", gap: "8px" }}>
              <Button variant="ghost" onClick={closeWorkflowModal}>
                Cancel
              </Button>
              {workflowStep < WORKFLOW_STEPS.length - 1 && (
                <Button
                  onClick={() => setWorkflowStep((prev) => prev + 1)}
                  disabled={!canProceedFromStep()}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
