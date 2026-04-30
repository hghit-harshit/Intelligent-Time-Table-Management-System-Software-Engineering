// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Badge,
  PageHeader,
  Modal,
  Loader,
} from "../../../shared";
import {
  fetchBulkRescheduleContext,
  fetchAvailableRoomsForCourse,
  fetchCoursesInRoom,
  previewBulkReschedule,
  applyBulkReschedule,
} from "../../../features/admin/services";
import { colors, fonts, radius, shadows, transitions } from "../../../styles/tokens";
import {
  DoorOpen,
  ArrowRightLeft,
  Clock,
  CalendarX,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Info,
  XCircle,
  Layers,
  Rocket,
} from "lucide-react";
import { toast } from "sonner";
import BR1_MoveCourseRoom from "./bulk-ops/BR1_MoveCourseRoom";
import BR2_EvacuateRoom from "./bulk-ops/BR2_EvacuateRoom";
import BR4_MoveCourseTime from "./bulk-ops/BR4_MoveCourseTime";
import BR7_CancelDate from "./bulk-ops/BR7_CancelDate";

// ─── Tab definitions ─────────────────────────────────────────────────────────

const TABS = [
  {
    id: "BR-1",
    label: "Move Course Room",
    icon: DoorOpen,
    accent: "#2563EB",
    shortDesc: "Reassign a course to a different room for all its occurrences",
    longDesc:
      "Select a course, then pick from rooms that are confirmed free at every slot the course currently occupies. No manual conflict checking needed.",
  },
  {
    id: "BR-2",
    label: "Evacuate Room",
    icon: ArrowRightLeft,
    accent: "#D97706",
    shortDesc: "Move every course out of a room (maintenance, closure)",
    longDesc:
      "The system will auto-assign the best available alternative room for each displaced course using the same greedy algorithm as the scheduler. Unassigned courses are flagged as warnings.",
  },
  {
    id: "BR-4",
    label: "Move Course Time",
    icon: Clock,
    accent: "#7C3AED",
    shortDesc: "Move a course to a new day and time slot",
    longDesc:
      "Select a course and specify a new day + time. The system will check professor and room availability and flag any blocking conflicts before you can apply.",
  },
  {
    id: "BR-7",
    label: "Cancel a Date",
    icon: CalendarX,
    accent: "#DC2626",
    shortDesc: "Cancel all classes on a specific calendar date",
    longDesc:
      "Pick a date. All courses scheduled on that day of the week will be marked cancelled for that date only — they are not moved or deleted.",
  },
];

// ─── Skeleton loader ─────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div
      style={{
        height: "20px",
        background: colors.bg.raised,
        borderRadius: radius.sm,
        marginBottom: "8px",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    />
  );
}

function FormSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "4px 0" }}>
      {[80, 60, 100, 40].map((w, i) => (
        <div key={i} style={{ width: `${w}%` }}>
          <SkeletonRow />
        </div>
      ))}
    </div>
  );
}

// ─── No Timetable empty state ─────────────────────────────────────────────────

function NoTimetableBanner() {
  const navigate = useNavigate();
  return (
    <Card
      hover={false}
      style={{
        padding: "32px",
        textAlign: "center",
        border: `1px dashed ${colors.warning.border}`,
        background: colors.warning.ghost,
      }}
    >
      <AlertTriangle size={28} style={{ color: colors.warning.main, marginBottom: "12px" }} />
      <div
        style={{
          fontWeight: fonts.weight.semibold,
          color: colors.text.primary,
          fontSize: fonts.size.md,
          marginBottom: "6px",
          fontFamily: fonts.heading,
        }}
      >
        No Published Timetable Found
      </div>
      <div
        style={{
          fontSize: fonts.size.sm,
          color: colors.text.muted,
          marginBottom: "20px",
          maxWidth: "420px",
          margin: "0 auto 20px",
        }}
      >
        Bulk rescheduling requires a published timetable to work from. Generate
        and publish a timetable first.
      </div>
      <Button
        variant="secondary"
        icon={<ChevronRight size={14} />}
        onClick={() => navigate("/AdminPage/engine")}
      >
        Go to Timetable Engine
      </Button>
    </Card>
  );
}

// ─── Conflict badge ───────────────────────────────────────────────────────────

function ConflictBadge({ conflict }) {
  if (!conflict) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          fontSize: fonts.size.xs,
          color: colors.success.main,
        }}
      >
        <CheckCircle2 size={11} /> OK
      </span>
    );
  }
  const isBlocking = conflict.type === "blocking";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        fontSize: fonts.size.xs,
        color: isBlocking ? colors.error.main : colors.warning.main,
        fontWeight: fonts.weight.semibold,
      }}
      title={conflict.description}
    >
      {isBlocking ? <XCircle size={11} /> : <AlertTriangle size={11} />}
      {isBlocking ? "Conflict" : "Warning"}
    </span>
  );
}

// ─── Preview table ───────────────────────────────────────────────────────────

function PreviewTable({ changes }) {
  if (!changes || changes.length === 0) return null;

  // Sort changes: Unassigned/blocking first, then warnings, then clean.
  const sortedChanges = [...changes].sort((a, b) => {
    const isUnassignedA = a.change.to === null;
    const isUnassignedB = b.change.to === null;
    if (isUnassignedA && !isUnassignedB) return -1;
    if (!isUnassignedA && isUnassignedB) return 1;

    const score = (c) => (c.conflict?.type === "blocking" ? 2 : c.conflict?.type === "warning" ? 1 : 0);
    return score(b) - score(a);
  });

  return (
    <div
      style={{
        overflowX: "auto",
        border: `1px solid ${colors.border.medium}`,
        borderRadius: radius.lg,
        background: colors.bg.raised,
        marginTop: "16px",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: fonts.size.xs,
          fontFamily: fonts.body,
        }}
      >
        <thead>
          <tr>
            {["Course", "Professor", "Day / Time", "Change", "Status"].map((h) => (
              <th
                key={h}
                style={{
                  padding: "10px 12px",
                  textAlign: "left",
                  color: colors.text.muted,
                  fontSize: fonts.size.xs,
                  fontWeight: fonts.weight.semibold,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderBottom: `1px solid ${colors.border.medium}`,
                  whiteSpace: "nowrap",
                  background: colors.bg.raised,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedChanges.map((item, i) => {
            const isUnassigned = item.change.to === null;
            const bg = isUnassigned 
              ? "#FEF2F2" // Stronger red ghost for unassigned
              : item.conflict?.type === "blocking"
              ? colors.error.ghost
              : item.conflict?.type === "warning"
              ? colors.warning.ghost
              : "transparent";

            return (
              <tr key={i} style={{ background: bg }}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: fonts.weight.semibold, color: colors.text.primary }}>
                    {item.courseName}
                  </div>
                  <div style={{ color: colors.text.muted, marginTop: "1px" }}>{item.courseCode}</div>
                </td>
                <td style={tdStyle}>{item.professorName}</td>
                <td style={tdStyle}>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    {item.day} {item.startTime}–{item.endTime}
                  </span>
                </td>
                <td style={tdStyle}>
                  <span style={{ color: colors.text.muted, textDecoration: isUnassigned ? "line-through" : "none" }}>
                    {item.change.from || "—"}
                  </span>
                  <ArrowRight
                    size={10}
                    style={{ color: colors.text.muted, margin: "0 6px", verticalAlign: "middle" }}
                  />
                  <span
                    style={{
                      fontWeight: fonts.weight.bold,
                      color: isUnassigned ? colors.error.main : colors.primary.main,
                      background: isUnassigned ? "#FEE2E2" : "transparent",
                      padding: isUnassigned ? "2px 6px" : "0",
                      borderRadius: isUnassigned ? radius.sm : "0",
                    }}
                  >
                    {item.change.to || "UNASSIGNED"}
                  </span>
                </td>
                <td style={tdStyle}>
                  <ConflictBadge conflict={item.conflict} />
                  {item.conflict && (
                    <div
                      style={{
                        fontSize: fonts.size.xs,
                        color: isUnassigned ? colors.error.main : colors.text.muted,
                        fontWeight: isUnassigned ? fonts.weight.semibold : fonts.weight.regular,
                        marginTop: "2px",
                        maxWidth: "180px",
                      }}
                    >
                      {item.conflict.description}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const tdStyle = {
  padding: "10px 12px",
  borderBottom: `1px solid ${colors.border.subtle}`,
  color: colors.text.secondary,
  verticalAlign: "top",
};

// ─── Success Modal ────────────────────────────────────────────────────────────

function SuccessModal({ open, onClose, newVersion, affectedCount }) {
  const navigate = useNavigate();
  return (
    <Modal open={open} onClose={onClose} maxWidth="460px">
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            background: colors.success.ghost,
            border: `1px solid ${colors.success.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <CheckCircle2 size={26} style={{ color: colors.success.main }} />
        </div>
        <div
          style={{
            fontFamily: fonts.heading,
            fontWeight: fonts.weight.bold,
            fontSize: fonts.size.lg,
            color: colors.text.primary,
            marginBottom: "8px",
          }}
        >
          Draft Saved Successfully
        </div>
        <div
          style={{
            fontSize: fonts.size.sm,
            color: colors.text.muted,
            marginBottom: "6px",
          }}
        >
          <strong style={{ color: colors.text.primary }}>{affectedCount}</strong> assignments
          updated.
        </div>
        <div
          style={{
            display: "inline-block",
            padding: "4px 12px",
            borderRadius: radius.full,
            background: colors.primary.ghost,
            border: `1px solid ${colors.primary.border}`,
            fontSize: fonts.size.xs,
            color: colors.primary.main,
            fontWeight: fonts.weight.semibold,
            marginBottom: "20px",
            fontFamily: fonts.body,
          }}
        >
          Version: {newVersion}
        </div>
        <p
          style={{
            fontSize: fonts.size.sm,
            color: colors.text.muted,
            margin: "0 0 24px",
            lineHeight: 1.6,
          }}
        >
          The new draft is ready for review. Go to{" "}
          <strong style={{ color: colors.text.secondary }}>Timetable Versions</strong> to preview
          and publish it when ready.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <Button variant="ghost" onClick={onClose}>
            Stay Here
          </Button>
          <Button
            variant="primary"
            icon={<Rocket size={14} />}
            onClick={() => navigate("/AdminPage/versions")}
          >
            Go to Timetable Versions
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Operation Panel wrapper (step 1 → preview → step 2 → done) ──────────────

export function OperationPanel({
  tab,
  sourceVersion,
  children, // the form fields specific to each operation
  getParameters, // fn() → parameters object
  previewResult,
  onPreview,
  onApply,
  previewing,
  applying,
  reason,
  onReasonChange,
  canPreview = true,
}) {
  const tab_meta = TABS.find((t) => t.id === tab);
  const hasChanges = previewResult && previewResult.affectedCount > 0;
  const canApply = hasChanges && !previewResult.hasBlockingConflicts;
  const blockingCount = previewResult?.changes?.filter(
    (c) => c.conflict?.type === "blocking"
  ).length ?? 0;
  const warningCount = previewResult?.changes?.filter(
    (c) => c.conflict?.type === "warning"
  ).length ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Form card */}
      <Card hover={false} style={{ padding: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "18px",
            paddingBottom: "14px",
            borderBottom: `1px solid ${colors.border.subtle}`,
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: radius.md,
              background: `${tab_meta?.accent}14`,
              border: `1px solid ${tab_meta?.accent}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {tab_meta && <tab_meta.icon size={16} style={{ color: tab_meta.accent }} />}
          </div>
          <div>
            <div
              style={{
                fontWeight: fonts.weight.semibold,
                color: colors.text.primary,
                fontSize: fonts.size.md,
                fontFamily: fonts.heading,
              }}
            >
              Configure Operation
            </div>
            <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginTop: "2px" }}>
              {tab_meta?.longDesc}
            </div>
          </div>
        </div>

        {children}

        <div style={{ marginTop: "20px" }}>
          <Button
            variant="secondary"
            onClick={onPreview}
            disabled={previewing || !canPreview}
            icon={previewing ? <Loader style={{ width: 14, height: 14, padding: 0 }} /> : <Info size={14} />}
          >
            {previewing ? "Calculating preview…" : "Preview Changes"}
          </Button>
        </div>
      </Card>

      {/* Preview result */}
      {previewResult && (
        <Card hover={false} style={{ padding: "20px" }}>
          {/* Summary bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <div
              style={{
                fontWeight: fonts.weight.semibold,
                fontSize: fonts.size.md,
                color: colors.text.primary,
                fontFamily: fonts.heading,
              }}
            >
              Preview — {previewResult.affectedCount} assignment
              {previewResult.affectedCount !== 1 ? "s" : ""} will change
            </div>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              {blockingCount > 0 && (
                <Badge variant="danger">{blockingCount} blocking conflict{blockingCount > 1 ? "s" : ""}</Badge>
              )}
              {warningCount > 0 && (
                <Badge variant="warning">{warningCount} warning{warningCount > 1 ? "s" : ""}</Badge>
              )}
              {previewResult.affectedCount > 0 && blockingCount === 0 && warningCount === 0 && (
                <Badge variant="success">No conflicts</Badge>
              )}
            </div>
          </div>

          {previewResult.affectedCount === 0 ? (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                color: colors.text.muted,
                fontSize: fonts.size.sm,
                background: colors.bg.raised,
                borderRadius: radius.md,
              }}
            >
              No assignments match your selection. Check your inputs and try again.
            </div>
          ) : (
            <PreviewTable changes={previewResult.changes} />
          )}

          {/* Reason + Save to Draft */}
          {hasChanges && (
            <div style={{ marginTop: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: fonts.size.sm,
                  fontWeight: fonts.weight.semibold,
                  color: colors.text.secondary,
                  marginBottom: "6px",
                }}
              >
                Reason for change{" "}
                <span style={{ color: colors.error.main }}>*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => onReasonChange(e.target.value)}
                placeholder="e.g. LHC-1 is under maintenance from 5 May"
                rows={2}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: colors.bg.raised,
                  border: `1px solid ${colors.border.medium}`,
                  borderRadius: radius.md,
                  fontSize: fonts.size.sm,
                  fontFamily: fonts.body,
                  color: colors.text.primary,
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: transitions.smooth,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary.border;
                  e.target.style.boxShadow = `0 0 0 3px ${colors.primary.ghost}`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border.medium;
                  e.target.style.boxShadow = "none";
                }}
              />
              {!canApply && blockingCount > 0 && (
                <div
                  style={{
                    marginTop: "8px",
                    padding: "8px 12px",
                    background: colors.error.ghost,
                    border: `1px solid ${colors.error.border}`,
                    borderRadius: radius.md,
                    fontSize: fonts.size.xs,
                    color: colors.error.main,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "6px",
                  }}
                >
                  <XCircle size={13} style={{ flexShrink: 0, marginTop: "1px" }} />
                  Cannot apply: {blockingCount} blocking conflict
                  {blockingCount > 1 ? "s" : ""} must be resolved first.
                </div>
              )}
              <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="primary"
                  onClick={onApply}
                  disabled={applying || !canApply || !reason.trim()}
                  icon={applying ? <Loader style={{ width: 14, height: 14, padding: 0 }} /> : <CheckCircle2 size={14} />}
                >
                  {applying ? "Saving draft…" : "Save to Draft"}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ─── Real operation form dispatcher ─────────────────────────────────────────

function ActiveOperationForm({
  tab,
  assignments,
  sourceVersion,
  previewResult,
  previewing,
  applying,
  reason,
  onReasonChange,
  onPreview,
  onApply,
}) {
  const sharedProps = {
    assignments,
    sourceVersion,
    previewResult,
    previewing,
    applying,
    reason,
    onReasonChange,
    onPreview,
    onApply,
  };
  if (tab === "BR-1") return <BR1_MoveCourseRoom {...sharedProps} />;
  if (tab === "BR-2") return <BR2_EvacuateRoom {...sharedProps} />;
  if (tab === "BR-4") return <BR4_MoveCourseTime {...sharedProps} />;
  if (tab === "BR-7") return <BR7_CancelDate {...sharedProps} />;
  return null;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BulkRescheduling() {
  const [activeTab, setActiveTab] = useState("BR-1");
  const [contextLoading, setContextLoading] = useState(true);
  const [context, setContext] = useState({
    timetable: null,
    assignments: [],
    rooms: [],
    sourceVersion: null,
  });

  // Per-operation state — reset when tab changes
  const [previewResult, setPreviewResult] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [reason, setReason] = useState("");

  // Success modal
  const [successData, setSuccessData] = useState(null); // { newVersion, affectedCount }

  // Form fields — lifted here so OperationPanel can call getParameters()
  // Each operation manages its own params through these
  const [operationParams, setOperationParams] = useState({});

  // Load context on mount
  useEffect(() => {
    setContextLoading(true);
    fetchBulkRescheduleContext().then((ctx) => {
      setContext(ctx);
      setContextLoading(false);
    });
  }, []);

  // Reset form/preview when tab changes
  useEffect(() => {
    setPreviewResult(null);
    setPreviewing(false);
    setApplying(false);
    setReason("");
    setOperationParams({});
  }, [activeTab]);

  const handlePreview = async (parameters) => {
    if (!context.sourceVersion) return;
    setPreviewing(true);
    setPreviewResult(null);
    const result = await previewBulkReschedule({
      operationType: activeTab,
      sourceVersion: context.sourceVersion,
      parameters,
    });
    setPreviewResult(result);
    setPreviewing(false);
    if (!result.success) {
      toast.error("Preview failed", { description: result.message });
    }
  };

  const handleApply = async (parameters) => {
    if (!context.sourceVersion || !reason.trim()) return;
    setApplying(true);
    const result = await applyBulkReschedule({
      operationType: activeTab,
      sourceVersion: context.sourceVersion,
      dryRun: false,
      reason: reason.trim(),
      parameters,
    });
    setApplying(false);
    if (result.success) {
      setSuccessData({
        newVersion: result.newVersion,
        affectedCount: result.affectedCount,
      });
      setPreviewResult(null);
      setReason("");
      setOperationParams({});
    } else {
      toast.error("Failed to save draft", { description: result.message });
    }
  };

  const activeTabMeta = TABS.find((t) => t.id === activeTab);

  return (
    <div>
      <PageHeader
        title="Bulk Rescheduling"
        subtitle="Apply structured changes to the published timetable — always saved as a draft first."
        action={
          context.sourceVersion ? (
            <Badge variant="info" style={{ fontSize: fonts.size.xs }}>
              Source: {context.sourceVersion}
            </Badge>
          ) : null
        }
      />

      {/* Context loading */}
      {contextLoading ? (
        <Card hover={false} style={{ padding: "24px" }}>
          <FormSkeleton />
        </Card>
      ) : !context.sourceVersion ? (
        <NoTimetableBanner />
      ) : (
        <>
          {/* Tab bar — horizontal pill tabs */}
          <div
            style={{
              display: "flex",
              gap: "4px",
              padding: "4px",
              background: colors.bg.raised,
              borderRadius: radius.lg,
              border: `1px solid ${colors.border.subtle}`,
              marginBottom: "20px",
              overflowX: "auto",
            }}
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "7px 14px",
                    borderRadius: radius.md,
                    border: "none",
                    cursor: "pointer",
                    fontSize: fonts.size.sm,
                    fontWeight: fonts.weight.semibold,
                    fontFamily: fonts.body,
                    whiteSpace: "nowrap",
                    transition: transitions.smooth,
                    background: isActive ? colors.bg.base : "transparent",
                    color: isActive ? tab.accent : colors.text.muted,
                    boxShadow: isActive ? shadows.sm : "none",
                  }}
                >
                  <Icon size={13} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Quick summary banner for active tab */}
          <div
            style={{
              padding: "10px 14px",
              borderRadius: radius.md,
              background: `${activeTabMeta?.accent}0d`,
              border: `1px solid ${activeTabMeta?.accent}28`,
              fontSize: fonts.size.xs,
              color: colors.text.secondary,
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Info size={13} style={{ color: activeTabMeta?.accent, flexShrink: 0 }} />
            {activeTabMeta?.shortDesc}
          </div>

          {/* Active operation form */}
          <ActiveOperationForm
            tab={activeTab}
            assignments={context.assignments}
            sourceVersion={context.sourceVersion}
            previewResult={previewResult}
            previewing={previewing}
            applying={applying}
            reason={reason}
            onReasonChange={setReason}
            onPreview={handlePreview}
            onApply={handleApply}
          />
        </>
      )}

      {/* Success modal */}
      <SuccessModal
        open={!!successData}
        onClose={() => setSuccessData(null)}
        newVersion={successData?.newVersion}
        affectedCount={successData?.affectedCount}
      />
    </div>
  );
}
