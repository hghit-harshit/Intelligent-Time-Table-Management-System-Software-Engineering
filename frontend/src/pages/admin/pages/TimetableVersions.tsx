import { useState, useEffect } from "react";
import { Card, Badge, Button, Loader, PageHeader, Modal } from "../../../shared";
import { fetchTimetableVersions, fetchTimetableByVersion, deleteTimetableVersion, publishTimetable } from "../../../features/admin/services";
import { Download, Trash2, Eye, Rocket, FileText, Archive, X, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { colors, fonts, radius } from "../../../styles/tokens";

const statusVariant: Record<string, string> = { published: "success", draft: "warning", archived: "neutral" };
const statusIcon: Record<string, any> = { published: Rocket, draft: FileText, archived: Archive };

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const timeToMinutes = (time = "00:00") => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

function ScheduleGrid({ assignments }: { assignments: any[] }) {
  const [cellModal, setCellModal] = useState<any | null>(null);

  if (!assignments || assignments.length === 0) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: colors.text.muted, fontSize: fonts.size.sm }}>
        No assignments in this version.
      </div>
    );
  }

  const days = WEEK_DAYS.filter((d) => assignments.some((a) => a.day === d));

  const rows = [...new Set(assignments.map((a) => `${a.startTime}|${a.endTime}`))]
    .sort((a, b) => timeToMinutes(a.split("|")[0]) - timeToMinutes(b.split("|")[0]))
    .map((rangeKey) => {
      const [startTime, endTime] = rangeKey.split("|");
      return {
        key: rangeKey,
        label: `${startTime} – ${endTime}`,
        byDay: Object.fromEntries(
          days.map((day) => [
            day,
            assignments.filter((a) => a.day === day && a.startTime === startTime && a.endTime === endTime),
          ])
        ),
      };
    });

  return (
    <>
      <div style={{ overflowX: "auto", border: `1px solid ${colors.border.subtle}`, borderRadius: radius.lg, background: colors.bg.raised }}>
        <table style={{ width: "100%", minWidth: "600px", borderCollapse: "collapse", fontSize: fonts.size.xs, fontFamily: fonts.body }}>
          <thead>
            <tr>
              <th style={{
                padding: "10px 12px", textAlign: "left", color: colors.text.muted,
                fontSize: fonts.size.xs, textTransform: "uppercase", letterSpacing: "0.05em",
                borderBottom: `1px solid ${colors.border.medium}`, width: "110px",
                position: "sticky", left: 0, background: colors.bg.raised, zIndex: 2,
              }}>Time</th>
              {days.map((day) => (
                <th key={day} style={{
                  padding: "10px 12px", textAlign: "center", color: colors.text.muted,
                  fontSize: fonts.size.xs, textTransform: "uppercase", letterSpacing: "0.05em",
                  borderBottom: `1px solid ${colors.border.medium}`, background: colors.bg.raised,
                }}>{day.slice(0, 3)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <td style={{
                  padding: "10px 12px", color: colors.text.secondary, fontWeight: fonts.weight.semibold,
                  borderBottom: `1px solid ${colors.border.subtle}`, whiteSpace: "nowrap",
                  position: "sticky", left: 0, background: colors.bg.raised, zIndex: 1,
                }}>{row.label}</td>
                {days.map((day) => {
                  const slots: any[] = row.byDay[day] || [];
                  if (slots.length === 0) return (
                    <td key={day} style={{ padding: "8px", borderBottom: `1px solid ${colors.border.subtle}`, textAlign: "center", background: colors.bg.base }}>
                      <span style={{ color: colors.text.disabled }}>—</span>
                    </td>
                  );

                  const visible = slots.slice(0, 2);
                  const overflow = slots.length - 2;

                  return (
                    <td key={day} style={{ padding: "8px", borderBottom: `1px solid ${colors.border.subtle}`, background: colors.bg.base, verticalAlign: "top" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {visible.map((s, i) => (
                          <div
                            key={i}
                            onClick={() => setCellModal({ label: row.label, day, slots })}
                            style={{
                              background: colors.bg.raised, border: `1px solid ${colors.primary.border}`,
                              borderRadius: radius.md, padding: "8px", cursor: "pointer",
                            }}
                          >
                            <div style={{ fontWeight: fonts.weight.semibold, color: colors.primary.main, fontSize: fonts.size.sm, lineHeight: 1.3 }}>
                              {s.courseName}
                            </div>
                            <div style={{ color: colors.text.muted, fontSize: fonts.size.xs, marginTop: "3px" }}>
                              {s.professorName}
                              {s.roomName && <span> · {s.roomName}</span>}
                            </div>
                          </div>
                        ))}
                        {overflow > 0 && (
                          <button
                            onClick={() => setCellModal({ label: row.label, day, slots })}
                            style={{
                              background: "none", border: `1px dashed ${colors.border.medium}`,
                              borderRadius: radius.md, padding: "4px 8px", cursor: "pointer",
                              fontSize: fonts.size.xs, color: colors.text.muted, textAlign: "center",
                            }}
                          >
                            +{overflow} more
                          </button>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cell detail — nested inside the version preview modal */}
      <Modal open={!!cellModal} onClose={() => setCellModal(null)} maxWidth="440px">
        {cellModal && (
          <div>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontWeight: fonts.weight.bold, color: colors.text.primary, fontSize: fonts.size.md, fontFamily: fonts.heading }}>
                {cellModal.day} · {cellModal.label}
              </div>
              <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginTop: "2px" }}>
                {cellModal.slots.length} class{cellModal.slots.length !== 1 ? "es" : ""} in this slot
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {cellModal.slots.map((s: any, i: number) => (
                <div key={i} style={{ padding: "12px", border: `1px solid ${colors.primary.border}`, borderRadius: radius.md, background: colors.bg.raised }}>
                  <div style={{ fontWeight: fonts.weight.semibold, color: colors.primary.main, fontSize: fonts.size.sm }}>
                    {s.courseName}
                  </div>
                  <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginTop: "4px" }}>
                    {s.professorName}
                    {s.roomName && <span> · {s.roomName}</span>}
                    {s.students && <span> · {s.students} students</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

export default function TimetableVersions() {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewVersion, setPreviewVersion] = useState<any | null>(null);
  const [previewAssignments, setPreviewAssignments] = useState<any[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any | null>(null);
  const [publishConfirm, setPublishConfirm] = useState<any | null>(null);

  const reload = () => fetchTimetableVersions().then(setVersions);

  useEffect(() => {
    fetchTimetableVersions().then((res) => { setVersions(res); setLoading(false); });
  }, []);

  const handlePreview = async (v: any) => {
    setPreviewVersion(v);
    setPreviewAssignments([]);
    setPreviewLoading(true);
    const data = await fetchTimetableByVersion(v.version);
    setPreviewAssignments(data?.assignments || []);
    setPreviewLoading(false);
  };

  const handlePublish = async () => {
    if (!publishConfirm) return;
    const v = publishConfirm;
    setPublishConfirm(null);
    setActionLoading(v.version);
    const result = await publishTimetable(v.version);
    setActionLoading(null);
    if (result.success) {
      toast.success("Timetable published", { description: `${v.version} is now the active timetable for all users` });
      reload();
    } else {
      toast.error("Failed to publish timetable");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const v = deleteConfirm;
    setDeleteConfirm(null);
    setActionLoading(v.version);
    const result = await deleteTimetableVersion(v.version);
    setActionLoading(null);
    if (result.success) {
      toast.success("Version deleted");
      setVersions((prev) => prev.filter((x) => x._id !== v._id));
    } else {
      toast.error(result.error || "Failed to delete version");
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <PageHeader title="Timetable Versions" subtitle="Version history and rollback management" />

      {versions.length === 0 ? (
        <Card style={{ padding: "40px", textAlign: "center" }} hover={false}>
          <Archive size={28} style={{ color: colors.text.muted, opacity: 0.4, marginBottom: "8px" }} />
          <div style={{ fontSize: fonts.size.sm, color: colors.text.muted }}>No timetable versions saved yet.</div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {versions.map((v) => {
            const IconComp = statusIcon[v.status] || Archive;
            const iconColor = v.status === "published" ? "#22c55e" : colors.text.muted;
            const createdDate = v.generatedAt ? new Date(v.generatedAt).toLocaleString() : "—";
            const totalAssignments = v.stats?.totalAssignments ?? null;
            const busy = actionLoading === v.version;

            return (
              <Card key={v._id} style={{ padding: "16px" }} hover={false}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{
                    width: "42px", height: "42px", borderRadius: radius.lg,
                    background: v.isLatest ? "rgba(34,197,94,0.08)" : colors.bg.raised,
                    border: `1px solid ${v.isLatest ? "rgba(34,197,94,0.18)" : colors.border.subtle}`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <IconComp size={18} style={{ color: iconColor }} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontWeight: fonts.weight.bold, color: colors.text.primary, fontSize: fonts.size.sm }}>
                        {v.version}
                      </span>
                      <Badge variant={statusVariant[v.status] || "neutral"}>{v.status}</Badge>
                      {v.isLatest && <Badge variant="success">Current</Badge>}
                    </div>
                    <div style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>
                      Generated {createdDate}
                      {totalAssignments != null && ` · ${totalAssignments} assignments`}
                      {v.publishedAt && ` · Published ${new Date(v.publishedAt).toLocaleString()}`}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "6px", flexShrink: 0, alignItems: "center" }}>
                    <Button size="sm" variant="ghost" icon={<Eye size={12} />} onClick={() => handlePreview(v)}>
                      Preview
                    </Button>
                    {!v.isLatest && (
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<CheckCircle size={12} />}
                        onClick={() => setPublishConfirm(v)}
                        disabled={busy}
                      >
                        {busy ? "Publishing..." : "Publish"}
                      </Button>
                    )}
                    {!v.isLatest && (
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<Trash2 size={12} />}
                        onClick={() => setDeleteConfirm(v)}
                        disabled={busy}
                        style={{ color: "#ef4444" }}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!previewVersion} onClose={() => setPreviewVersion(null)} maxWidth="900px">
        {previewVersion && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontWeight: fonts.weight.bold, color: colors.text.primary, fontSize: fonts.size.md, fontFamily: fonts.heading }}>
                    Schedule Preview — {previewVersion.version}
                  </span>
                  <Badge variant={statusVariant[previewVersion.status] || "neutral"}>{previewVersion.status}</Badge>
                  {previewVersion.isLatest && <Badge variant="info">Latest</Badge>}
                </div>
                <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginTop: "4px" }}>
                  Generated {previewVersion.generatedAt ? new Date(previewVersion.generatedAt).toLocaleString() : "—"}
                  {previewAssignments.length > 0 && ` · ${previewAssignments.length} assignments`}
                </div>
              </div>
              <button
                onClick={() => setPreviewVersion(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: colors.text.muted, padding: "4px" }}
              >
                <X size={18} />
              </button>
            </div>

            {previewLoading ? (
              <div style={{ padding: "40px", textAlign: "center", color: colors.text.muted }}>
                <Loader />
              </div>
            ) : (
              <ScheduleGrid assignments={previewAssignments} />
            )}
          </div>
        )}
      </Modal>

      {/* Publish confirmation modal */}
      <Modal open={!!publishConfirm} onClose={() => setPublishConfirm(null)} maxWidth="420px">
        {publishConfirm && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "50%",
                background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <AlertTriangle size={18} style={{ color: "#ca8a04" }} />
              </div>
              <div>
                <div style={{ fontWeight: fonts.weight.bold, color: colors.text.primary, fontSize: fonts.size.sm, fontFamily: fonts.heading }}>
                  Publish this timetable?
                </div>
                <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginTop: "2px" }}>
                  {publishConfirm.version}
                </div>
              </div>
            </div>
            <p style={{ fontSize: fonts.size.xs, color: colors.text.muted, margin: "0 0 20px" }}>
              This will replace the currently active timetable and affect every student and faculty member. The previous version will remain in the list as a draft.
            </p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <Button variant="ghost" size="sm" onClick={() => setPublishConfirm(null)}>Cancel</Button>
              <Button
                variant="primary"
                size="sm"
                icon={<CheckCircle size={12} />}
                onClick={handlePublish}
              >
                Yes, Publish
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="400px">
        {deleteConfirm && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "50%",
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Trash2 size={18} style={{ color: "#ef4444" }} />
              </div>
              <div>
                <div style={{ fontWeight: fonts.weight.bold, color: colors.text.primary, fontSize: fonts.size.sm, fontFamily: fonts.heading }}>
                  Delete this version?
                </div>
                <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginTop: "2px" }}>
                  {deleteConfirm.version}
                </div>
              </div>
            </div>
            <p style={{ fontSize: fonts.size.xs, color: colors.text.muted, margin: "0 0 20px" }}>
              This will permanently remove the timetable version. This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Trash2 size={12} />}
                onClick={handleDelete}
                style={{ background: "#ef4444", borderColor: "#ef4444" }}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
