// @ts-nocheck
import { useState, useEffect } from "react";
import { Card, Badge, Button, DataTable, SearchInput, Loader, PageHeader } from "../../../shared";
import {
  fetchExamDateWindow,
  saveExamDateWindow,
  fetchExamRequests,
  approveExamRequest,
  rejectExamRequest,
  fetchExamScheduleFromDB,
  deleteScheduledExam,
  cleanupPastExams,
} from "../../../services/examApi";
import { colors, fonts, radius, shadows } from "../../../styles/tokens";
import {
  CalendarClock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Clock,
  Trash2,
  Calendar,
  MapPin,
  Users,
  BookOpen,
  Send,
  X,
  Sparkles,
} from "lucide-react";

const statusVariant = { scheduled: "success", conflict: "danger", draft: "neutral", pending: "warning" };

export default function ExamScheduler() {
  // ─── State ──────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("schedule");

  // Date window state
  const [dateWindow, setDateWindow] = useState(null);
  const [windowForm, setWindowForm] = useState({
    startDate: "",
    endDate: "",
    startTime: "08:00",
    endTime: "20:00",
  });
  const [savingWindow, setSavingWindow] = useState(false);

  // Requests state
  const [requests, setRequests] = useState([]);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Schedule state
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState("");

  // ─── Load Data ──────────────────────────────────────────────
  const loadAll = async () => {
    setLoading(true);
    try {
      const [windowData, requestsData, examsData] = await Promise.all([
        fetchExamDateWindow().catch(() => null),
        fetchExamRequests().catch(() => []),
        fetchExamScheduleFromDB().catch(() => []),
      ]);

      setDateWindow(windowData);
      setRequests(Array.isArray(requestsData) ? requestsData : []);
      setExams(Array.isArray(examsData) ? examsData : []);

      if (windowData?.dates?.length) {
        const sorted = windowData.dates.map((d) => new Date(d)).sort((a, b) => a - b);
        setWindowForm({
          startDate: sorted[0].toISOString().slice(0, 10),
          endDate: sorted[sorted.length - 1].toISOString().slice(0, 10),
          startTime: windowData.startTime || "08:00",
          endTime: windowData.endTime || "20:00",
        });
      }
    } catch (err) {
      console.error("Failed to load exam data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // ─── Handlers ───────────────────────────────────────────────
  const handleSaveWindow = async () => {
    if (!windowForm.startDate || !windowForm.endDate) {
      alert("Please select start and end dates");
      return;
    }

    const start = new Date(windowForm.startDate);
    const end = new Date(windowForm.endDate);
    if (start > end) {
      alert("Start date must be before end date");
      return;
    }

    // Generate consecutive dates
    const dates = [];
    const current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().slice(0, 10));
      current.setDate(current.getDate() + 1);
    }

    setSavingWindow(true);
    try {
      await saveExamDateWindow({
        dates,
        startTime: windowForm.startTime,
        endTime: windowForm.endTime,
      });
      await loadAll();
      alert("Exam date window published successfully!");
    } catch (err) {
      alert("Failed to save: " + (err?.message || "Unknown error"));
    } finally {
      setSavingWindow(false);
    }
  };

  const handleApprove = async (id) => {
    if (!confirm("Approve this exam request? It will be added to the schedule and students will be notified.")) return;
    try {
      await approveExamRequest(id);
      await loadAll();
    } catch (err) {
      alert("Failed to approve: " + (err?.message || "Unknown error"));
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      await rejectExamRequest(rejectModal, rejectReason || "No reason provided");
      setRejectModal(null);
      setRejectReason("");
      await loadAll();
    } catch (err) {
      alert("Failed to reject: " + (err?.message || "Unknown error"));
    }
  };

  const handleDeleteExam = async (id) => {
    if (!confirm("Delete this scheduled exam? Students will lose this from their schedule.")) return;
    try {
      await deleteScheduledExam(id);
      await loadAll();
    } catch (err) {
      alert("Failed to delete: " + (err?.message || "Unknown error"));
    }
  };

  const handleCleanup = async () => {
    if (!confirm("Remove all past exams from the schedule?")) return;
    try {
      const result = await cleanupPastExams();
      alert(result?.message || "Cleanup complete");
      await loadAll();
    } catch (err) {
      alert("Failed to cleanup: " + (err?.message || "Unknown error"));
    }
  };

  // ─── Computed ───────────────────────────────────────────────
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const filteredExams = exams.filter((e) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (e.courseName || "").toLowerCase().includes(s) ||
      (e.courseCode || "").toLowerCase().includes(s) ||
      (e.room || "").toLowerCase().includes(s) ||
      (e.examName || "").toLowerCase().includes(s)
    );
  });

  // ─── Styles ─────────────────────────────────────────────────
  const card = {
    background: colors.bg.base,
    border: `1px solid ${colors.border.medium}`,
    borderRadius: radius.lg,
    boxShadow: shadows.sm,
  };
  const heading = {
    fontFamily: fonts.heading,
    fontWeight: fonts.weight.semibold,
    color: colors.text.primary,
  };
  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    background: colors.bg.base,
    border: `1px solid ${colors.border.medium}`,
    borderRadius: radius.md,
    color: colors.text.primary,
    fontSize: fonts.size.sm,
    fontFamily: fonts.body,
    outline: "none",
  };
  const labelStyle = {
    display: "block",
    fontSize: fonts.size.xs,
    color: colors.text.muted,
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
    marginBottom: "6px",
    fontWeight: 500,
  };
  const tabStyle = (active) => ({
    padding: "8px 20px",
    background: active ? colors.primary.main : "transparent",
    color: active ? "#fff" : colors.text.secondary,
    border: active ? "none" : `1px solid ${colors.border.medium}`,
    borderRadius: radius.md,
    fontSize: fonts.size.sm,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: fonts.body,
    transition: "all 0.15s ease",
  });

  if (loading) return <Loader />;

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="Exam Scheduler"
        subtitle="Configure exam dates, review faculty requests, and manage the exam schedule"
        action={
          <div style={{ display: "flex", gap: "8px" }}>
            {pendingRequests.length > 0 && (
              <Badge variant="warning">{pendingRequests.length} pending</Badge>
            )}
            <Button
              variant="ghost"
              icon={<Trash2 size={14} />}
              onClick={handleCleanup}
            >
              Cleanup Past
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" }}>
        {[
          { icon: <FileText size={16} />, label: "Scheduled Exams", value: exams.length, color: colors.primary.main },
          { icon: <Clock size={16} />, label: "Pending Requests", value: pendingRequests.length, color: colors.warning.main },
          { icon: <CheckCircle size={16} />, label: "Active Dates", value: dateWindow?.dates?.length || 0, color: colors.success.main },
          { icon: <CalendarClock size={16} />, label: "Time Window", value: dateWindow ? `${dateWindow.startTime}–${dateWindow.endTime}` : "Not Set", color: "#6D28D9" },
        ].map((stat) => (
          <Card key={stat.label} style={{ padding: "16px" }}>
            <div style={{ marginBottom: "6px", color: stat.color }}>{stat.icon}</div>
            <div style={{ fontSize: fonts.size["2xl"], fontWeight: fonts.weight.bold, color: colors.text.primary, fontFamily: fonts.heading }}>{stat.value}</div>
            <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginTop: "2px" }}>{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {[
          { key: "schedule", label: "Exam Schedule", icon: <BookOpen size={14} /> },
          { key: "requests", label: `Pending Requests (${pendingRequests.length})`, icon: <Send size={14} /> },
          { key: "dates", label: "Date Configuration", icon: <Calendar size={14} /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={tabStyle(activeTab === tab.key)}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              {tab.icon} {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* ─── Tab: Exam Schedule ───────────────────────────────── */}
      {activeTab === "schedule" && (
        <>
          <div style={{ marginBottom: "16px", maxWidth: "320px" }}>
            <SearchInput value={search} onChange={setSearch} placeholder="Search exams..." />
          </div>

          <Card style={{ padding: "16px" }} hover={false}>
            <DataTable
              columns={[
                {
                  key: "courseCode",
                  label: "Course",
                  render: (val, row) => (
                    <div>
                      <div style={{ fontWeight: fonts.weight.semibold, color: colors.text.primary }}>{val}</div>
                      <div style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>{row.courseName}</div>
                    </div>
                  ),
                },
                {
                  key: "examName",
                  label: "Exam",
                  render: (val) => (
                    <span style={{ color: colors.text.secondary, fontSize: fonts.size.sm }}>
                      {val || "End Semester Exam"}
                    </span>
                  ),
                },
                {
                  key: "examDate",
                  label: "Date",
                  render: (val) => (
                    <span style={{ color: colors.primary.main, fontWeight: fonts.weight.semibold }}>
                      {new Date(val).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                  ),
                },
                {
                  key: "startTime",
                  label: "Time",
                  render: (val, row) => `${val} – ${row.endTime}`,
                },
                {
                  key: "room",
                  label: "Venue",
                  render: (val) => (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={12} /> {val}
                    </span>
                  ),
                },
                {
                  key: "students",
                  label: "Students",
                  render: (val) => (
                    <span style={{ color: "#6D28D9", fontWeight: fonts.weight.semibold }}>
                      <Users size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />{val}
                    </span>
                  ),
                },
                {
                  key: "status",
                  label: "Status",
                  render: (val) => (
                    <Badge variant={statusVariant[val] || "neutral"}>
                      {val.charAt(0).toUpperCase() + val.slice(1)}
                    </Badge>
                  ),
                },
                {
                  key: "_id",
                  label: "",
                  render: (val) => (
                    <button
                      onClick={() => handleDeleteExam(val)}
                      style={{
                        background: "none",
                        border: "none",
                        color: colors.text.muted,
                        cursor: "pointer",
                        padding: "4px",
                        borderRadius: radius.sm,
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = colors.error.main)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = colors.text.muted)}
                      title="Delete exam"
                    >
                      <Trash2 size={14} />
                    </button>
                  ),
                },
              ]}
              data={filteredExams}
              emptyMessage="No exams scheduled yet. Faculty can submit requests once exam dates are published."
            />
          </Card>
        </>
      )}

      {/* ─── Tab: Pending Requests ────────────────────────────── */}
      {activeTab === "requests" && (
        <Card style={{ padding: "16px" }} hover={false}>
          {pendingRequests.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: colors.text.muted }}>
              <Sparkles size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
              <div style={{ fontSize: fonts.size.base, fontWeight: 500, marginBottom: 4 }}>No pending requests</div>
              <div style={{ fontSize: fonts.size.sm }}>All exam requests have been reviewed</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {pendingRequests.map((req) => (
                <div
                  key={req._id}
                  style={{
                    ...card,
                    padding: "16px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "16px",
                  }}
                >
                  <div style={{
                    width: 4,
                    height: "100%",
                    minHeight: 60,
                    borderRadius: 2,
                    background: colors.warning.main,
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <span style={{ ...heading, fontSize: fonts.size.base }}>{req.courseCode} — {req.courseName}</span>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                    <div style={{ fontSize: fonts.size.sm, color: colors.text.secondary, marginBottom: "4px" }}>
                      <strong>Exam:</strong> {req.examName} &nbsp;·&nbsp;
                      <strong>Professor:</strong> {req.professorName}
                    </div>
                    <div style={{ fontSize: fonts.size.sm, color: colors.text.secondary, marginBottom: "4px" }}>
                      <Calendar size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
                      {new Date(req.examDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      &nbsp;·&nbsp;
                      <Clock size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
                      {req.startTime} – {req.endTime}
                      &nbsp;·&nbsp;
                      <MapPin size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
                      {req.venue}
                    </div>
                    <div style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>
                      <Users size={11} style={{ marginRight: 4, verticalAlign: "middle" }} />
                      {req.students} students &nbsp;·&nbsp;
                      Submitted {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0, alignSelf: "center" }}>
                    <Button variant="primary" onClick={() => handleApprove(req._id)}>
                      <CheckCircle size={14} style={{ marginRight: 4 }} /> Approve
                    </Button>
                    <Button variant="ghost" onClick={() => { setRejectModal(req._id); setRejectReason(""); }}>
                      <X size={14} style={{ marginRight: 4 }} /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ─── Tab: Date Configuration ─────────────────────────── */}
      {activeTab === "dates" && (
        <Card style={{ padding: "24px" }} hover={false}>
          <h3 style={{ ...heading, fontSize: fonts.size.lg, margin: "0 0 6px" }}>
            Exam Date Window
          </h3>
          <p style={{ fontSize: fonts.size.sm, color: colors.text.muted, margin: "0 0 20px" }}>
            Define the range of dates available for end-semester exams. Faculty will only be able to request exams within these dates.
          </p>

          {dateWindow && (
            <div style={{
              padding: "12px 16px",
              background: colors.success.ghost,
              border: `1px solid ${colors.success.border}`,
              borderRadius: radius.md,
              marginBottom: "20px",
              fontSize: fonts.size.sm,
              color: colors.success.main,
            }}>
              <strong>Current active window:</strong>{" "}
              {dateWindow.dates.map((d) =>
                new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              ).join(", ")}
              &nbsp;·&nbsp;{dateWindow.startTime} – {dateWindow.endTime}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={labelStyle}>Start Date</label>
              <input
                type="date"
                value={windowForm.startDate}
                onChange={(e) => setWindowForm({ ...windowForm, startDate: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>End Date</label>
              <input
                type="date"
                value={windowForm.endDate}
                onChange={(e) => setWindowForm({ ...windowForm, endDate: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label style={labelStyle}>Earliest Exam Start Time</label>
              <input
                type="time"
                value={windowForm.startTime}
                onChange={(e) => setWindowForm({ ...windowForm, startTime: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Latest Exam End Time</label>
              <input
                type="time"
                value={windowForm.endTime}
                onChange={(e) => setWindowForm({ ...windowForm, endTime: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          {windowForm.startDate && windowForm.endDate && (
            <div style={{
              padding: "12px 16px",
              background: colors.bg.raised,
              border: `1px solid ${colors.border.subtle}`,
              borderRadius: radius.md,
              marginBottom: "20px",
            }}>
              <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Preview — Dates that will be published
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {(() => {
                  const dates = [];
                  const current = new Date(windowForm.startDate);
                  const end = new Date(windowForm.endDate);
                  while (current <= end) {
                    dates.push(new Date(current));
                    current.setDate(current.getDate() + 1);
                  }
                  return dates.map((d, i) => (
                    <span key={i} style={{
                      padding: "4px 10px",
                      background: colors.primary.ghost,
                      color: colors.primary.main,
                      borderRadius: radius.sm,
                      fontSize: fonts.size.xs,
                      fontWeight: 500,
                    }}>
                      {d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                  ));
                })()}
              </div>
            </div>
          )}

          <Button
            variant="primary"
            onClick={handleSaveWindow}
            disabled={savingWindow}
            icon={<Calendar size={14} />}
          >
            {savingWindow ? "Publishing..." : "Publish Exam Dates"}
          </Button>
        </Card>
      )}

      {/* ─── Reject Modal ─────────────────────────────────────── */}
      {rejectModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setRejectModal(null)}
        >
          <div
            style={{
              background: colors.bg.base,
              border: `1px solid ${colors.border.medium}`,
              borderRadius: radius.xl,
              padding: "24px",
              width: "90%",
              maxWidth: "440px",
              boxShadow: shadows.xl,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ ...heading, fontSize: fonts.size.lg, marginBottom: "16px" }}>
              Reject Exam Request
            </h3>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Reason for rejection</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Optional — provide a reason for the professor"
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <Button variant="ghost" onClick={() => setRejectModal(null)} style={{ flex: 1 }}>
                Cancel
              </Button>
              <button
                onClick={handleReject}
                style={{
                  flex: 1,
                  padding: "8px 16px",
                  background: colors.error.main,
                  color: "#fff",
                  border: "none",
                  borderRadius: radius.md,
                  fontSize: fonts.size.sm,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: fonts.body,
                }}
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
