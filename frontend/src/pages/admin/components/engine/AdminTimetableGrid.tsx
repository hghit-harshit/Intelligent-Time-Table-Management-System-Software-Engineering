// @ts-nocheck
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button, Card } from "../../../../shared";
import { colors, fonts, radius } from "../../../../styles/tokens";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const dayRank = (day = "") => {
  const index = DAY_ORDER.findIndex(
    (item) => item.toLowerCase() === String(day).toLowerCase(),
  );
  return index === -1 ? Number.POSITIVE_INFINITY : index;
};

const timeRank = (time = "") => {
  if (!time || typeof time !== "string") return Number.POSITIVE_INFINITY;
  const [h, m] = time.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return Number.POSITIVE_INFINITY;
  return h * 60 + m;
};

const getConstraintLabel = (name = "") => {
  const mapping = {
    sc1_unavailable_slot_violated: "Preferred time",
    sc2_preferred_day_off_violated: "Back-to-back",
    hc1_one_class_per_professor_per_slot: "Faculty clash",
  };
  return mapping[name] || name;
};

export default function AdminTimetableGrid({
  runId,
  slots = [],
  violationSummary = { constraints: [] },
  onToggleLock,
  onAssignmentsUpdate,
  isPublished = false,
}) {
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [expandedConstraint, setExpandedConstraint] = useState("");
  const [highlightedSlotId, setHighlightedSlotId] = useState("");
  const [panelError, setPanelError] = useState("");
  const [lockBusyMap, setLockBusyMap] = useState({});
  const [localSlots, setLocalSlots] = useState(slots || []);
  const slotRefs = useRef({});

  useEffect(() => {
    setLocalSlots(slots || []);
  }, [slots]);

  useEffect(() => {
    if (!highlightedSlotId) return;
    const timeout = setTimeout(() => setHighlightedSlotId(""), 2000);
    return () => clearTimeout(timeout);
  }, [highlightedSlotId]);

  useEffect(() => {
    if (!localSlots.length) {
      setSelectedSlotId("");
      return;
    }
    if (
      selectedSlotId &&
      !selectedSlotId.startsWith("virtual-") &&
      !localSlots.some((slot) => slot.slotId === selectedSlotId)
    ) {
      setSelectedSlotId("");
    }
  }, [localSlots, selectedSlotId]);

  const normalizedSlots = useMemo(
    () =>
      (localSlots || []).map((slot) => ({
        ...slot,
        assignments: Array.isArray(slot.assignments) ? slot.assignments : [],
      })),
    [localSlots],
  );

  const assignmentLookup = useMemo(() => {
    const lookup = new Map();
    normalizedSlots.forEach((slot) => {
      slot.assignments.forEach((assignment) => {
        lookup.set(assignment.assignmentId, {
          ...assignment,
          slotId: slot.slotId,
          day: slot.day,
          startTime: slot.startTime,
        });
      });
    });
    return lookup;
  }, [normalizedSlots]);

  const times = useMemo(() => {
    const unique = [...new Set(normalizedSlots.map((slot) => slot.startTime))];
    return unique.sort((a, b) => timeRank(a) - timeRank(b));
  }, [normalizedSlots]);

  const selectedSlot = useMemo(
    () => {
      const found = normalizedSlots.find((slot) => slot.slotId === selectedSlotId);
      if (found) return found;

      if (selectedSlotId?.startsWith("virtual-")) {
        const parts = selectedSlotId.replace("virtual-", "").split("-");
        const day = parts.slice(0, -1).join("-");
        const startTime = parts.slice(-1)[0] || "";
        return {
          slotId: selectedSlotId,
          label: "Empty",
          day,
          startTime,
          assignments: [],
        };
      }

      return null;
    },
    [normalizedSlots, selectedSlotId],
  );

  const matrixByDayAndTime = useMemo(() => {
    const matrix = new Map();
    normalizedSlots.forEach((slot) => {
      const key = `${slot.day}|${slot.startTime}`;
      matrix.set(key, slot);
    });
    return matrix;
  }, [normalizedSlots]);

  const constraints = useMemo(() => {
    const list = Array.isArray(violationSummary?.constraints)
      ? violationSummary.constraints
      : [];
    return [...list].sort((a, b) => (b.violationsCount || 0) - (a.violationsCount || 0));
  }, [violationSummary]);

  const updateLocalAssignmentLock = (assignmentId, locked) => {
    const next = normalizedSlots.map((slot) => ({
      ...slot,
      assignments: slot.assignments.map((entry) =>
        entry.assignmentId === assignmentId ? { ...entry, isLocked: locked } : entry,
      ),
    }));
    setLocalSlots(next);
    if (onAssignmentsUpdate) onAssignmentsUpdate(next);
  };

  const handleLockToggle = async (assignment) => {
    if (!runId || !onToggleLock) return;
    const nextLocked = !(assignment.isLocked ?? false);
    setPanelError("");
    setLockBusyMap((prev) => ({ ...prev, [assignment.assignmentId]: true }));
    try {
      await onToggleLock(assignment.assignmentId, nextLocked);
      updateLocalAssignmentLock(assignment.assignmentId, nextLocked);
    } catch (error) {
      setPanelError(
        error?.message ||
          "Unable to update lock state right now. Please try again.",
      );
    } finally {
      setLockBusyMap((prev) => ({ ...prev, [assignment.assignmentId]: false }));
    }
  };

  const navigateToViolation = (violation) => {
    const linked = assignmentLookup.get(violation.assignmentId);
    const targetSlotId = linked?.slotId || violation.slotId;
    if (!targetSlotId) return;

    setSelectedSlotId(targetSlotId);
    setHighlightedSlotId(targetSlotId);

    const targetElement = slotRefs.current[targetSlotId];
    if (targetElement && targetElement.scrollIntoView) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }
  };

  return (
    <div style={{ position: "relative", marginTop: "18px" }}>
      <Card style={{ padding: "14px", marginBottom: "12px" }} hover={false}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <h3 style={{ margin: 0, fontSize: fonts.size.md, color: colors.text.primary, fontFamily: fonts.heading }}>
            Soft Constraint Summary
          </h3>
          <Badge
            variant={
              violationSummary?.totalViolations > 0
                ? isPublished
                  ? "neutral"
                  : "warning"
                : "success"
            }
          >
            {violationSummary?.totalViolations || 0} total violations
          </Badge>
        </div>

        {constraints.length === 0 ? (
          <div style={{ color: colors.text.muted, fontSize: fonts.size.sm }}>No soft constraint violations found.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {constraints.map((constraint) => {
              const count = constraint.violationsCount || 0;
              const isExpanded = expandedConstraint === constraint.constraintName;
              const ok = count === 0;

              return (
                <div key={constraint.constraintName} style={{ border: `1px solid ${colors.border.subtle}`, borderRadius: radius.md }}>
                  <button
                    onClick={() =>
                      setExpandedConstraint((prev) =>
                        prev === constraint.constraintName ? "" : constraint.constraintName,
                      )
                    }
                    style={{
                      width: "100%",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      padding: "10px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {ok ? (
                        <CheckCircle2 size={14} color={colors.success.main} />
                      ) : (
                        <AlertTriangle
                          size={14}
                          color={isPublished ? colors.text.muted : colors.warning.main}
                        />
                      )}
                      <span style={{ fontSize: fonts.size.sm, color: colors.text.primary }}>
                        {getConstraintLabel(constraint.constraintName)}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: fonts.size.xs,
                        color: ok
                          ? colors.success.main
                          : isPublished
                            ? colors.text.muted
                            : colors.warning.main,
                        fontWeight: fonts.weight.semibold,
                      }}
                    >
                      {ok ? "0 violations" : `${count} violations`}
                    </span>
                  </button>

                  {isExpanded && count > 0 && (
                    <div style={{ borderTop: `1px solid ${colors.border.subtle}`, padding: "8px 10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                      {(constraint.violations || []).map((violation, index) => {
                        const linked = assignmentLookup.get(violation.assignmentId);
                        const text = linked
                          ? `${linked.course?.code || ""} → ${linked.day} ${linked.startTime} (${linked.faculty?.name || "Faculty"})`
                          : `${violation.courseId || "Course"} → ${violation.slotId || "Slot"}`;

                        return (
                          <button
                            key={`${constraint.constraintName}-${index}`}
                            onClick={() => navigateToViolation(violation)}
                            style={{
                              border: `1px solid ${colors.border.subtle}`,
                              borderRadius: radius.sm,
                              background: colors.bg.base,
                              textAlign: "left",
                              cursor: "pointer",
                              padding: "8px",
                              color: colors.text.secondary,
                              fontSize: fonts.size.xs,
                            }}
                            title={violation.reason || "Open slot context"}
                          >
                            {text}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "110px repeat(5, minmax(140px, 1fr))", gap: "8px" }}>
        <div />
        {DAY_ORDER.map((day) => (
          <div key={day} style={{ textAlign: "center", fontSize: fonts.size.xs, color: colors.text.muted, fontWeight: fonts.weight.semibold }}>
            {day.slice(0, 3)}
          </div>
        ))}

        {times.map((time) => (
          <div key={`row-${time}`} style={{ display: "contents" }}>
            <div key={`time-${time}`} style={{ fontSize: fonts.size.xs, color: colors.text.secondary, paddingTop: "6px" }}>
              {time}
            </div>
            {DAY_ORDER.map((day) => {
              const key = `${day}|${time}`;
              const slot = matrixByDayAndTime.get(key) || {
                slotId: `virtual-${day}-${time}`,
                label: "—",
                day,
                startTime: time,
                assignments: [],
              };
              const isSelected = selectedSlotId === slot.slotId;
              const isHighlighted = highlightedSlotId === slot.slotId;

              return (
                <button
                  key={key}
                  ref={(node) => {
                    if (node && slot.slotId && !slot.slotId.startsWith("virtual-")) {
                      slotRefs.current[slot.slotId] = node;
                    }
                  }}
                  onClick={() => setSelectedSlotId(slot.slotId)}
                  style={{
                    minHeight: "92px",
                    borderRadius: radius.md,
                    border: isHighlighted
                      ? `2px solid ${colors.warning.main}`
                      : isSelected
                        ? `1px solid ${colors.primary.main}`
                        : `1px solid ${colors.border.subtle}`,
                    boxShadow: isHighlighted
                      ? `0 0 0 6px rgba(245,158,11,0.18)`
                      : "none",
                    background: isSelected ? colors.primary.ghost : colors.bg.raised,
                    padding: "8px",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginBottom: "6px" }}>
                    {slot.label || "Empty"}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {slot.assignments.slice(0, 2).map((assignment) => {
                      const hasViolations = (assignment.violations || []).length > 0;
                      return (
                        <div
                          key={assignment.assignmentId}
                          style={{
                            borderLeft:
                              hasViolations && !isPublished
                                ? `3px solid ${colors.warning.main}`
                                : `3px solid ${colors.border.subtle}`,
                            paddingLeft: "6px",
                            fontSize: "11px",
                            color: colors.text.secondary,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={
                            hasViolations
                              ? assignment.violations.join(", ")
                              : "No soft-constraint violations"
                          }
                        >
                          {assignment.course?.code || assignment.course?.name || "—"}
                        </div>
                      );
                    })}
                    {slot.assignments.length > 2 && (
                      <div style={{ fontSize: "11px", color: colors.text.muted }}>
                        +{slot.assignments.length - 2} more
                      </div>
                    )}
                    {slot.assignments.length === 0 && (
                      <div style={{ fontSize: "11px", color: colors.text.disabled }}>Empty slot</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div
        style={{
          position: "fixed",
          top: 0,
          right: selectedSlot ? 0 : -420,
          width: 420,
          height: "100vh",
          background: colors.bg.base,
          borderLeft: `1px solid ${colors.border.medium}`,
          boxShadow: "-8px 0 24px rgba(0,0,0,0.08)",
          transition: "right 0.25s ease",
          zIndex: 2000,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "14px", borderBottom: `1px solid ${colors.border.subtle}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: fonts.weight.bold, color: colors.text.primary, fontFamily: fonts.heading }}>
              {selectedSlot?.label || "Slot"}
            </div>
            <div style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>
              {selectedSlot?.day || ""} {selectedSlot?.startTime || ""}
            </div>
          </div>
          <button
            onClick={() => setSelectedSlotId("")}
            style={{ border: "none", background: "transparent", cursor: "pointer", color: colors.text.muted }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
          {panelError && (
            <div
              style={{
                border: `1px solid ${colors.warning.border}`,
                background: "rgba(245,158,11,0.08)",
                color: colors.warning.main,
                borderRadius: radius.sm,
                padding: "8px 10px",
                fontSize: fonts.size.xs,
              }}
            >
              {panelError}
            </div>
          )}

          {!selectedSlot || selectedSlot.assignments.length === 0 ? (
            <div style={{ color: colors.text.muted, fontSize: fonts.size.sm }}>Empty slot</div>
          ) : (
            selectedSlot.assignments.map((assignment) => {
              const locked = assignment.isLocked ?? false;
              const busy = lockBusyMap[assignment.assignmentId];

              return (
                <Card key={assignment.assignmentId} style={{ padding: "10px" }} hover={false}>
                  <div style={{ fontWeight: fonts.weight.semibold, color: colors.text.primary }}>
                    {assignment.course?.name || "Course"}
                  </div>
                  <div style={{ color: colors.text.muted, fontSize: fonts.size.xs }}>
                    {assignment.course?.code || ""}
                  </div>
                  <div style={{ marginTop: "6px", color: colors.text.secondary, fontSize: fonts.size.xs }}>
                    {assignment.faculty?.name || "Faculty"}
                  </div>
                  <div style={{ color: colors.text.secondary, fontSize: fonts.size.xs }}>
                    {assignment.room?.name || "Room TBD"}
                  </div>

                  <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {(assignment.violations || []).length > 0 ? (
                      assignment.violations.map((name) => (
                        <Badge
                          key={name}
                          variant={isPublished ? "neutral" : "warning"}
                          style={{
                            background: isPublished
                              ? colors.bg.raised
                              : "rgba(245,158,11,0.16)",
                            color: isPublished
                              ? colors.text.secondary
                              : colors.warning.main,
                          }}
                        >
                          {getConstraintLabel(name)}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="success">No violations</Badge>
                    )}
                  </div>

                  <div style={{ marginTop: "10px", display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      size="sm"
                      variant={locked ? "secondary" : "primary"}
                      disabled={busy || isPublished}
                      onClick={() => handleLockToggle(assignment)}
                    >
                      {isPublished
                        ? "Published"
                        : busy
                          ? "Saving..."
                          : locked
                            ? "Unlock"
                            : "Lock"}
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
