// @ts-nocheck
import { useState, useEffect } from "react";
import { colors, fonts, radius, shadows } from "../../../styles/tokens";
import { StatsGrid } from "../../../shared";
import {
  fetchFacultyCourses,
  fetchAvailableSlots,
  submitExamRequest,
  fetchMyExamRequests,
  fetchExamDateWindow,
  fetchMyScheduledExams,
} from "../../../services/examApi";

/* ── helpers ────────────────────────────────────────────────── */
const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const toTime = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const fmt12 = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

export default function FacultyExamScheduler() {
  /* state */
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [dateWindow, setDateWindow] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [gridData, setGridData] = useState(null);
  const [slotsError, setSlotsError] = useState(null);
  const [selStart, setSelStart] = useState(null);   // {date,time}
  const [selEnd, setSelEnd] = useState(null);       // time string e.g. "10:30"
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ examName: "", venue: "" });
  const [submitting, setSubmitting] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [myExams, setMyExams] = useState([]);

  /* styles */
  const card = { background: colors.bg.base, border: `1px solid ${colors.border.medium}`, borderRadius: radius.lg, boxShadow: shadows.sm };
  const heading = { fontFamily: fonts.heading, fontWeight: fonts.weight.semibold, color: colors.text.primary };
  const labelSt = { display: "block", fontSize: fonts.size.xs, color: colors.text.muted, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6, fontWeight: 500 };
  const inputSt = { width: "100%", padding: "9px 12px", background: colors.bg.base, border: `1px solid ${colors.border.medium}`, borderRadius: radius.md, color: colors.text.primary, fontSize: fonts.size.sm, fontFamily: fonts.body, outline: "none", boxSizing: "border-box" };
  const btnP = { padding: "8px 20px", background: colors.primary.main, color: "#fff", border: "none", borderRadius: radius.md, fontSize: fonts.size.sm, fontWeight: 500, cursor: "pointer", fontFamily: fonts.body };
  const btnG = { ...btnP, background: colors.bg.raised, color: colors.text.primary, border: `1px solid ${colors.border.medium}` };

  /* load */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [c, r, w, s] = await Promise.all([
          fetchFacultyCourses().catch(() => []),
          fetchMyExamRequests().catch(() => []),
          fetchExamDateWindow().catch(() => null),
          fetchMyScheduledExams().catch(() => []),
        ]);
        setCourses(Array.isArray(c) ? c : []);
        setMyRequests(Array.isArray(r) ? r : []);
        setDateWindow(w);
        setMyExams(Array.isArray(s) ? s : []);
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  /* find slots */
  const handleFindSlots = async (cid) => {
    const course = courses.find((c) => c.id === cid);
    setSelectedCourse(course);
    setSlotsLoading(true); setGridData(null); setSlotsError(null);
    setSelStart(null); setSelEnd(null); setShowForm(false);
    try { setGridData(await fetchAvailableSlots(cid)); } catch (e) { setSlotsError(e?.message || "Failed"); }
    setSlotsLoading(false);
  };

  /* cell click */
  const handleCellClick = (date, time, cell) => {
    if (!cell.available) return;
    if (!selStart || selStart.date !== date || showForm) {
      setSelStart({ date, time }); setSelEnd(null); setShowForm(false);
    } else {
      const a = toMin(selStart.time), b = toMin(time);
      if (b <= a) { setSelStart({ date, time }); setSelEnd(null); return; }
      // End time = clicked cell time (the clicked cell is NOT part of exam, it's the boundary)
      // Cells included: start, start+30, ..., end-30
      // Verify all included cells are available
      const row = gridData?.grid?.[date] || {};
      let allOk = true;
      for (let m = a; m < b; m += 30) { if (!row[toTime(m)]?.available) { allOk = false; break; } }
      if (!allOk) { alert("Some cells in the selected range are unavailable."); return; }
      setSelEnd(time); // end time = the clicked time (e.g. click 10:30 → exam ends at 10:30)
      setFormData({ examName: "", venue: "" });
      setShowForm(true);
    }
  };

  /* check if cell is in selection */
  const isSel = (date, time) => {
    if (!selStart || selStart.date !== date) return false;
    const m = toMin(time), s = toMin(selStart.time);
    if (!selEnd) return m === s;
    const e = toMin(selEnd) - 30;
    return m >= s && m <= e;
  };

  /* venues for selection (intersection of all selected cells) */
  const selectedVenues = (() => {
    if (!selStart || !selEnd || !gridData?.grid) return [];
    const row = gridData.grid[selStart.date] || {};
    let venues = null;
    for (let m = toMin(selStart.time); m < toMin(selEnd); m += 30) {
      const c = row[toTime(m)];
      if (!c) return [];
      const set = new Set(c.venues);
      if (!venues) venues = set;
      else venues = new Set([...venues].filter((v) => set.has(v)));
    }
    return venues ? Array.from(venues) : [];
  })();

  /* reload requests + exams */
  const reloadData = async () => {
    const [reqs, exams] = await Promise.all([
      fetchMyExamRequests().catch(() => []),
      fetchMyScheduledExams().catch(() => []),
    ]);
    setMyRequests(Array.isArray(reqs) ? reqs : []);
    setMyExams(Array.isArray(exams) ? exams : []);
  };

  /* submit */
  const handleSubmit = async () => {
    if (!formData.examName || !formData.venue) { alert("Fill all fields"); return; }
    setSubmitting(true);
    try {
      await submitExamRequest({
        courseId: selectedCourse.id,
        examName: formData.examName,
        examDate: selStart.date,
        startTime: selStart.time,
        endTime: selEnd,
        venue: formData.venue,
      });
      setShowForm(false); setGridData(null); setSelectedCourse(null);
      setSelStart(null); setSelEnd(null);
      await reloadData();
      alert("Exam request submitted! Awaiting admin approval.");
    } catch (e) { alert("Failed: " + (e?.message || "Unknown error")); }
    setSubmitting(false);
  };

  const pendingCount = myRequests.filter((r) => r.status === "pending").length;
  const approvedCount = myRequests.filter((r) => r.status === "approved").length;
  const rejectedCount = myRequests.filter((r) => r.status === "rejected").length;

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: colors.text.muted }}>Loading...</div>;

  /* ── RENDER ────────────────────────────────────────────────── */
  return (
    <div style={{ padding: "12px 14px 16px", boxSizing: "border-box", height: "100%" }}>
      <div style={{ ...card, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontSize: fonts.size.sm, color: colors.text.secondary }}>
          {courses.length} courses · {pendingCount} pending
        </div>
        {dateWindow ? (
          <span style={{ padding: "6px 12px", background: colors.success.ghost, color: colors.success.main, borderRadius: radius.md, fontSize: fonts.size.xs, fontWeight: 500 }}>
            Exam window active · {dateWindow.dates?.length} dates
          </span>
        ) : (
          <span style={{ padding: "6px 12px", background: colors.warning.ghost, color: colors.warning.main, borderRadius: radius.md, fontSize: fonts.size.xs, fontWeight: 500 }}>
            Exam dates not yet published
          </span>
        )}
      </div>

      <div style={{ flex: 1, display: "flex", gap: 12, overflow: "hidden", minHeight: 0 }}>
        {/* LEFT */}
        <div style={{ flex: 1, overflowY: "auto", paddingRight: 8, minWidth: 0 }}>
          <StatsGrid stats={[
            { num: String(courses.length), label: "My Courses", color: colors.primary.main },
            { num: String(pendingCount), label: "Pending", color: colors.warning.main },
            { num: String(approvedCount), label: "Approved", color: colors.success.main },
            { num: String(rejectedCount), label: "Rejected", color: colors.error.main },
          ]} />

          {/* COURSES */}
          <div style={{ ...card, marginBottom: 12, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${colors.border.medium}` }}>
              <h3 style={{ ...heading, fontSize: fonts.size.lg, margin: 0 }}>My Courses - Find Available Slots</h3>
            </div>
            {courses.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: colors.text.muted, fontSize: fonts.size.sm }}>No courses assigned.</div>
            ) : courses.map((c, i) => (
              <div key={c.id} style={{ padding: "12px 16px", borderBottom: i < courses.length - 1 ? `1px solid ${colors.border.subtle}` : "none", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: fonts.size.base, fontWeight: 500, color: colors.text.primary }}>{c.code} - {c.name}</div>
                  <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginTop: 2 }}>{c.students} students · {c.department}</div>
                </div>
                <button onClick={() => handleFindSlots(c.id)} disabled={slotsLoading && selectedCourse?.id === c.id}
                  style={{ ...btnP, padding: "8px 14px", fontSize: fonts.size.sm, opacity: slotsLoading && selectedCourse?.id === c.id ? 0.6 : 1 }}>
                  {slotsLoading && selectedCourse?.id === c.id ? "Finding..." : "Find Slots"}
                </button>
              </div>
            ))}
          </div>

          {slotsError && (
            <div style={{ padding: "12px 16px", background: colors.error.ghost, border: `1px solid ${colors.error.border}`, borderRadius: radius.md, color: colors.error.main, fontSize: fonts.size.sm, marginBottom: 12 }}>{slotsError}</div>
          )}

          {/* ══════ CALENDAR GRID ══════ */}
          {gridData && (
            <div style={{ ...card, marginBottom: 12, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${colors.border.medium}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ ...heading, fontSize: 13, margin: 0 }}>
                  Availability Grid - {gridData.courseCode} ({gridData.enrolledStudents} enrolled)
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: fonts.size.xs, color: colors.text.muted }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: "#10b981" }} /> Available</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: `repeating-linear-gradient(135deg, ${colors.bg.raised}, ${colors.bg.raised} 3px, ${colors.border.medium} 3px, ${colors.border.medium} 5px)` }} /> Unavailable</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: colors.primary.main }} /> Selected</span>
                </div>
              </div>

              <div style={{ padding: "10px 16px", fontSize: fonts.size.xs, color: colors.text.secondary }}>
                Click a start cell, then click an end cell on the same row to select a range. All cells in between must be available.
              </div>

              <div style={{ overflow: "auto", padding: "0 16px 16px" }}>
                <table style={{ borderCollapse: "separate", borderSpacing: 0, width: "100%", minWidth: gridData.timeLabels?.length * 52 }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "8px 8px", fontSize: fonts.size.xs, color: colors.text.muted, textAlign: "left", fontWeight: 600, position: "sticky", left: 0, top: 0, background: colors.bg.base, zIndex: 3, minWidth: 90, borderBottom: `1px solid ${colors.border.medium}` }}>Date</th>
                      {(gridData.timeLabels || []).map((t) => (
                        <th key={t} style={{ padding: "8px 2px", fontSize: 10, color: colors.text.muted, fontWeight: 500, textAlign: "center", borderBottom: `1px solid ${colors.border.medium}`, minWidth: 48, position: "sticky", top: 0, background: colors.bg.base, zIndex: 2 }}>
                          {fmt12(t)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(gridData.dates || []).map(({ date, formatted }) => {
                      const row = gridData.grid?.[date] || {};
                      return (
                        <tr key={date}>
                          <td style={{ padding: "8px 8px", fontSize: fonts.size.xs, fontWeight: 600, color: colors.primary.main, whiteSpace: "nowrap", position: "sticky", left: 0, background: colors.bg.base, zIndex: 1, borderBottom: `1px solid ${colors.border.subtle}` }}>{formatted}</td>
                          {(gridData.timeLabels || []).map((time) => {
                            const cell = row[time] || { available: false, venues: [] };
                            const selected = isSel(date, time);
                            const isStartCell = selStart?.date === date && selStart?.time === time && !selEnd;

                            let bg, border, cursor, color;
                            if (selected) {
                              bg = colors.primary.main; color = "#fff"; border = `2px solid ${colors.primary.main}`; cursor = "pointer";
                            } else if (cell.available) {
                              bg = "rgba(16,185,129,0.12)"; color = "#10b981"; border = "1px solid rgba(16,185,129,0.25)"; cursor = "pointer";
                            } else {
                              bg = `repeating-linear-gradient(135deg, ${colors.bg.raised}, ${colors.bg.raised} 3px, ${colors.border.medium} 3px, ${colors.border.medium} 5px)`;
                              color = colors.text.muted; border = `1px solid ${colors.border.subtle}`; cursor = "not-allowed";
                            }

                            return (
                              <td key={time} style={{ padding: 3, borderBottom: `1px solid ${colors.border.subtle}` }}>
                                <div
                                  onClick={() => handleCellClick(date, time, cell)}
                                  title={cell.available ? `${fmt12(time)} - ${cell.venues.length} venue(s)` : `${fmt12(time)} - Unavailable`}
                                  style={{
                                    width: "100%", height: 34, borderRadius: 6,
                                    background: bg, border, cursor, color,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 10, fontWeight: 600,
                                    transition: "all 0.1s ease",
                                    position: "relative",
                                    boxShadow: isStartCell ? `0 0 0 2px ${colors.primary.main}40` : "none",
                                  }}
                                  onMouseEnter={(e) => {
                                    if (cell.available && !selected) (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
                                  }}
                                  onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.transform = "none";
                                  }}
                                >
                                  {!cell.available && <span style={{ fontSize: 14, opacity: 0.5 }}>✕</span>}
                                  {cell.available && !selected && <span style={{ opacity: 0.7 }}>✓</span>}
                                  {selected && <span>●</span>}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* selection summary */}
              {selStart && !selEnd && (
                <div style={{ padding: "8px 16px 12px", fontSize: fonts.size.xs, color: colors.primary.main, fontWeight: 500 }}>
                  Start: {gridData.dates?.find((d) => d.date === selStart.date)?.formatted} at {fmt12(selStart.time)} - now click an end cell on the same row
                </div>
              )}
            </div>
          )}

          {/* MY SCHEDULED EXAMS */}
          {myExams.length > 0 && (
            <div style={{ ...card, overflow: "hidden", marginBottom: 12 }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${colors.border.medium}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ ...heading, fontSize: 13, margin: 0 }}>My Scheduled Exams</h3>
                <span style={{ padding: "2px 8px", background: colors.success.ghost, color: colors.success.main, borderRadius: radius.sm, fontSize: fonts.size.xs, fontWeight: 500 }}>{myExams.length} exam{myExams.length !== 1 ? "s" : ""}</span>
              </div>
              {myExams.map((exam, i) => (
                <div key={exam._id} style={{ padding: "12px 16px", borderBottom: i < myExams.length - 1 ? `1px solid ${colors.border.subtle}` : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: fonts.size.base, fontWeight: 500, color: colors.text.primary }}>{exam.courseCode} - {exam.examName || exam.courseName}</span>
                    <span style={{ padding: "2px 8px", background: colors.success.ghost, color: colors.success.main, borderRadius: radius.sm, fontSize: fonts.size.xs, fontWeight: 500 }}>Scheduled</span>
                  </div>
                  <div style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>
                    {new Date(exam.examDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {exam.startTime} – {exam.endTime} · {exam.room || exam.location}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MY REQUESTS */}
          {myRequests.length > 0 && (
            <div style={{ ...card, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${colors.border.medium}` }}>
                <h3 style={{ ...heading, fontSize: 13, margin: 0 }}>My Exam Requests</h3>
              </div>
              {myRequests.map((req, i) => {
                const sc = { pending: { bg: colors.warning.ghost, text: colors.warning.main }, approved: { bg: colors.success.ghost, text: colors.success.main }, rejected: { bg: colors.error.ghost, text: colors.error.main } }[req.status] || { bg: colors.warning.ghost, text: colors.warning.main };
                return (
                  <div key={req._id} style={{ padding: "12px 16px", borderBottom: i < myRequests.length - 1 ? `1px solid ${colors.border.subtle}` : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: fonts.size.base, fontWeight: 500, color: colors.text.primary }}>{req.courseCode} - {req.examName}</span>
                      <span style={{ padding: "2px 8px", background: sc.bg, color: sc.text, borderRadius: radius.sm, fontSize: fonts.size.xs, fontWeight: 500 }}>{req.status.charAt(0).toUpperCase() + req.status.slice(1)}</span>
                    </div>
                    <div style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>
                      {new Date(req.examDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {req.startTime} – {req.endTime} · {req.venue}
                    </div>
                    {req.status === "rejected" && req.rejectionReason && (
                      <div style={{ marginTop: 6, padding: "6px 10px", background: colors.error.ghost, borderRadius: radius.sm, fontSize: fonts.size.xs, color: colors.error.main }}>Reason: {req.rejectionReason}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
          {showForm && selectedCourse && selStart && selEnd ? (
            <div style={{ ...card, padding: 16 }}>
              <h4 style={{ ...heading, fontSize: fonts.size.sm, margin: "0 0 4px" }}>Schedule Exam Request</h4>
              <p style={{ fontSize: fonts.size.xs, color: colors.text.muted, margin: "0 0 16px" }}>{selectedCourse.code} - {selectedCourse.name}</p>

              <div style={{ padding: "8px 12px", background: colors.primary.ghost, borderRadius: radius.md, marginBottom: 16, fontSize: fonts.size.sm, color: colors.primary.main, fontWeight: 500 }}>
                {gridData?.dates?.find((d) => d.date === selStart.date)?.formatted}<br />
                {fmt12(selStart.time)} - {fmt12(selEnd)}<br />
                <span style={{ fontSize: fonts.size.xs, fontWeight: 400, opacity: 0.8 }}>
                  Duration: {(() => { const m = toMin(selEnd) - toMin(selStart.time); return m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ""}` : `${m}m`; })()}
                </span>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={labelSt}>Exam Name</label>
                <input type="text" value={formData.examName} onChange={(e) => setFormData({ ...formData, examName: e.target.value })} placeholder="e.g. End Semester Exam" style={inputSt} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelSt}>Venue ({selectedVenues.length} available)</label>
                <select value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} style={{ ...inputSt, cursor: "pointer" }}>
                  <option value="">Select venue</option>
                  {selectedVenues.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setShowForm(false); setSelStart(null); setSelEnd(null); }} style={{ ...btnG, flex: 1 }}>Cancel</button>
                <button onClick={handleSubmit} disabled={submitting} style={{ ...btnP, flex: 1, opacity: submitting ? 0.6 : 1 }}>{submitting ? "Submitting..." : "Submit Request"}</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ ...card, padding: 16 }}>
                <h4 style={{ ...heading, fontSize: fonts.size.sm, margin: "0 0 8px" }}>How It Works</h4>
                <div style={{ fontSize: fonts.size.sm, color: colors.text.secondary, lineHeight: 1.7 }}>
                  <p style={{ margin: "0 0 4px" }}>1. Click <strong>Find Slots</strong> on a course</p>
                  <p style={{ margin: "0 0 4px" }}>2. Browse the calendar grid</p>
                  <p style={{ margin: "0 0 4px" }}>3. Click a <strong>start cell</strong> (green ✓)</p>
                  <p style={{ margin: "0 0 4px" }}>4. Click an <strong>end cell</strong> on the same row</p>
                  <p style={{ margin: 0 }}>5. Fill form & submit for approval</p>
                </div>
              </div>

              {dateWindow && (
                <div style={{ ...card, padding: 16 }}>
                  <h4 style={{ ...heading, fontSize: fonts.size.sm, margin: "0 0 8px" }}>Exam Dates</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {dateWindow.dates?.map((d, i) => (
                      <div key={i} style={{ padding: "8px 12px", background: colors.bg.raised, border: `1px solid ${colors.border.subtle}`, borderRadius: radius.md, fontSize: fonts.size.sm, color: colors.text.secondary }}>
                        {new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 8, fontSize: fonts.size.xs, color: colors.text.muted }}>Time window: {dateWindow.startTime} – {dateWindow.endTime}</div>
                </div>
              )}

              <div style={{ ...card, padding: 16, flex: 1 }}>
                <h4 style={{ ...heading, fontSize: fonts.size.sm, margin: "0 0 8px" }}>Scheduling Tips</h4>
                <div style={{ fontSize: fonts.size.sm, color: colors.text.secondary, lineHeight: 1.6 }}>
                  <p style={{ margin: "0 0 4px" }}>• Green cells = all students free + venues available</p>
                  <p style={{ margin: "0 0 4px" }}>• Striped cells = conflicts exist</p>
                  <p style={{ margin: "0 0 4px" }}>• Times use 30-min increments</p>
                  <p style={{ margin: 0 }}>• Min exam duration is 30 minutes</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
