import { useState, useEffect, useMemo } from "react";
import { PageHeader, Button, Modal, Card, DataTable } from "../components/ui/index";
import { colors, fonts, radius, shadows, transitions } from "../../../styles/tokens";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const API_BASE = "http://localhost:5000/api";

/* ── Warm distinct colors ──────────────────────────────────────── */
const SLOT_COLORS = [
  "#7C3AED", "#059669", "#D97706", "#DC2626",
  "#0891B2", "#DB2777", "#EA580C", "#4338CA",
  "#16A34A", "#9333EA", "#0D9488", "#C026D3",
];

/* ── Constants ─────────────────────────────────────────────────── */
const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = [];
for (let h = 9; h <= 20; h++) HOURS.push(h);

/* ── Tiny SVG Icons ────────────────────────────────────────────── */
const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);
const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

/* ── Reusable form styles ──────────────────────────────────────── */
const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  background: colors.bg.raised,
  border: `1px solid ${colors.border.medium}`,
  borderRadius: radius.md,
  color: colors.text.primary,
  fontSize: fonts.size.base,
  fontFamily: fonts.body,
  transition: transitions.smooth,
  outline: "none",
  boxSizing: "border-box",
};
const labelStyle = {
  display: "block",
  fontSize: fonts.size.xs,
  fontWeight: fonts.weight.semibold,
  color: colors.text.secondary,
  marginBottom: "4px",
  fontFamily: fonts.body,
};
const actionBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  border: `1px solid ${colors.border.medium}`,
  borderRadius: radius.sm,
  background: colors.bg.raised,
  cursor: "pointer",
  color: colors.text.secondary,
  transition: transitions.smooth,
};

const EMPTY_FORM = { label: "", startTime: "09:00", endTime: "10:00", day: "Monday" };

/* ── Component ─────────────────────────────────────────────────── */
export default function TimeSlotsPage() {
  const [slots, setSlots] = useState([]);
  const [view, setView] = useState("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch slots from API
  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/slots`);
      if (res.ok) {
        const data = await res.json();
        setSlots(data);
      }
    } catch (err) {
      setError("Failed to fetch slots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  /* ── Modal helpers ───────────────────────────────────────────── */
  const openAdd = () => { setEditingSlot(null); setForm({ ...EMPTY_FORM }); setModalOpen(true); };
  const openEdit = (slot) => {
    setEditingSlot(slot);
    setForm({ label: slot.label, startTime: slot.startTime, endTime: slot.endTime, day: slot.day });
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditingSlot(null); };

  const handleSave = async () => {
    if (!form.label.trim() || !form.startTime || !form.endTime || !form.day) return;
    
    try {
      const options = {
        method: editingSlot ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      };
      
      const url = editingSlot 
        ? `${API_BASE}/slots/${editingSlot._id}`
        : `${API_BASE}/slots`;
      
      const res = await fetch(url, options);
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 409) {
          alert(`Conflict: ${data.message}`);
          return;
        }
        throw new Error(data.message || "Failed to save slot");
      }
      
      await fetchSlots();
      closeModal();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      const res = await fetch(`${API_BASE}/slots/${deleteConfirm._id}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete slot");
      }
      
      await fetchSlots();
      setDeleteConfirm(null);
    } catch (err) {
      alert(err.message);
    }
  };

  /* ── Stable color map: same label → same color everywhere ────── */
  const colorMap = useMemo(() => {
    const labels = [...new Set(slots.map((s) => s.label))].sort();
    const map = {};
    labels.forEach((l, i) => { map[l] = SLOT_COLORS[i % SLOT_COLORS.length]; });
    return map;
  }, [slots]);

  /* ── Grid segments ───────────────────────────────────────────── */
  const dayRows = useMemo(() => {
    const result = {};
    ALL_DAYS.forEach((day) => {
      const daySlots = slots
        .filter((s) => s.day === day)
        .map((s) => {
          const [sh, sm] = s.startTime.split(":").map(Number);
          const [eh, em] = s.endTime.split(":").map(Number);
          return { ...s, sH: sh + sm / 60, eH: eh + em / 60 };
        })
        .sort((a, b) => a.sH - b.sH);

      const segs = [];
      let col = 0;
      while (col < HOURS.length) {
        const hour = HOURS[col];
        const match = daySlots.find((s) => s.sH < hour + 1 && s.eH > hour);
        if (match) {
          let span = 0;
          for (let c = col; c < HOURS.length; c++) {
            if (match.sH < HOURS[c] + 1 && match.eH > HOURS[c]) span++;
            else break;
          }
          segs.push({ type: "slot", span, slot: match });
          col += span;
        } else {
          let span = 1;
          while (col + span < HOURS.length) {
            const nextHour = HOURS[col + span];
            const hasSlot = daySlots.some((s) => s.sH < nextHour + 1 && s.eH > nextHour);
            if (hasSlot) break;
            span++;
          }
          segs.push({ type: "empty", span });
          col += span;
        }
      }
      result[day] = segs;
    });

    const uniqueLabels = new Set(slots.map((s) => s.label));
    return { rows: result, uniqueCount: uniqueLabels.size, totalEntries: slots.length };
  }, [slots]);

  /* ── Sorted slots for list view ──────────────────────────────── */
  const sortedSlots = useMemo(() => {
    const dayOrder = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5 };
    return [...slots].sort((a, b) => {
      const dDiff = (dayOrder[a.day] || 6) - (dayOrder[b.day] || 6);
      if (dDiff !== 0) return dDiff;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [slots]);

  /* ── List columns ────────────────────────────────────────────── */
  const listColumns = [
    {
      key: "label", label: "Slot",
      render: (val) => {
        const clr = colorMap[val] || colors.text.muted;
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: clr, flexShrink: 0 }} />
            <strong style={{ color: clr, fontFamily: fonts.heading }}>{val}</strong>
          </span>
        );
      },
    },
    { key: "day", label: "Day" },
    {
      key: "startTime", label: "Time",
      render: (_, row) => `${row.startTime} – ${row.endTime}`,
    },
    {
      key: "duration", label: "Duration",
      render: (_, row) => {
        const [sh, sm] = row.startTime.split(":").map(Number);
        const [eh, em] = row.endTime.split(":").map(Number);
        const mins = (eh * 60 + em) - (sh * 60 + sm);
        return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60 ? mins % 60 + "m" : ""}`.trim() : `${mins}m`;
      },
    },
    {
      key: "actions", label: "", align: "right",
      render: (_, row) => (
        <span style={{ display: "inline-flex", gap: "6px" }}>
          <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} title="Edit" style={actionBtnStyle}>
            <EditIcon />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(row); }} title="Delete" style={{ ...actionBtnStyle, color: colors.error.main }}>
            <TrashIcon />
          </button>
        </span>
      ),
    },
  ];

  /* ── View toggle ─────────────────────────────────────────────── */
  const ViewToggle = () => (
    <div style={{
      display: "inline-flex",
      background: colors.bg.raised,
      borderRadius: radius.md,
      border: `1px solid ${colors.border.subtle}`,
      padding: "3px",
    }}>
      {[
        { id: "grid", icon: <GridIcon />, tip: "Grid view" },
        { id: "list", icon: <ListIcon />, tip: "List view" },
      ].map((v) => (
        <button
          key={v.id}
          title={v.tip}
          onClick={() => setView(v.id)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 32, height: 28, border: "none", borderRadius: radius.sm,
            cursor: "pointer", transition: transitions.smooth,
            background: view === v.id ? colors.bg.base : "transparent",
            color: view === v.id ? colors.primary.main : colors.text.muted,
            boxShadow: view === v.id ? shadows.sm : "none",
          }}
        >
          {v.icon}
        </button>
      ))}
    </div>
  );

  /* ════════════════════════ RENDER ═════════════════════════════ */
  return (
    <div>
      <PageHeader
        title="Timetable Slots"
        subtitle={`${dayRows.uniqueCount} slot${dayRows.uniqueCount !== 1 ? "s" : ""} · ${dayRows.totalEntries} entries across the week`}
        action={
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ViewToggle />
            <Button variant="primary" size="md" icon={<PlusIcon />} onClick={openAdd}>
              Add Slot
            </Button>
          </div>
        }
      />

      {slots.length === 0 ? (
        <Box sx={{
          mt: 3, p: 5, textAlign: "center",
          background: colors.bg.raised, border: `1px dashed ${colors.border.strong}`,
          borderRadius: radius.lg,
        }}>
          <Typography sx={{ fontFamily: fonts.heading, fontSize: fonts.size.lg, fontWeight: fonts.weight.semibold, color: colors.text.secondary, mb: 1 }}>
            No slots configured yet
          </Typography>
          <Typography sx={{ fontFamily: fonts.body, fontSize: fonts.size.sm, color: colors.text.muted }}>
            Click <strong>Add Slot</strong> to create your first timetable entry.
          </Typography>
        </Box>
      ) : view === "grid" ? (
        /* ═══════════════ GRID VIEW ═══════════════ */
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ borderRadius: radius.lg, boxShadow: shadows.sm, overflowX: "auto", mt: 1 }}
        >
          <Table sx={{ minWidth: 800, borderCollapse: "collapse" }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{
                  background: colors.bg.raised, fontFamily: fonts.heading,
                  fontWeight: fonts.weight.semibold, fontSize: fonts.size.sm,
                  color: colors.text.primary, padding: "10px 14px", border: "none",
                  position: "sticky", left: 0, zIndex: 2,
                }}>
                  Day
                </TableCell>
                {HOURS.map((h) => (
                  <TableCell key={h} align="center" sx={{
                    background: colors.bg.raised, fontFamily: fonts.heading,
                    fontWeight: fonts.weight.semibold, fontSize: fonts.size.xs,
                    color: colors.text.secondary, padding: "10px 6px", border: "none",
                    whiteSpace: "nowrap", minWidth: 64,
                  }}>
                    {h}:00 – {h + 1}:00
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {ALL_DAYS.map((day) => (
                <TableRow key={day}>
                  <TableCell sx={{
                    background: colors.bg.raised, fontFamily: fonts.heading,
                    fontWeight: fonts.weight.semibold, fontSize: fonts.size.base,
                    color: colors.text.primary, padding: "16px 14px", border: "none",
                    position: "sticky", left: 0, zIndex: 1, whiteSpace: "nowrap",
                  }}>
                    {day}
                  </TableCell>

                  {dayRows.rows[day].map((seg, si) => {
                    if (seg.type === "empty") {
                      return Array.from({ length: seg.span }, (_, k) => (
                        <TableCell key={`${si}-e-${k}`} sx={{
                          border: "none", padding: "16px 4px", background: colors.bg.base,
                        }} />
                      ));
                    }

                    const clr = colorMap[seg.slot.label] || colors.text.muted;
                    return (
                      <TableCell
                        key={`${si}-s`}
                        colSpan={seg.span}
                        align="center"
                        onClick={() => openEdit(seg.slot)}
                        sx={{
                          background: clr + "18", border: "none", padding: "10px 6px",
                          borderRadius: radius.md, position: "relative",
                          cursor: "pointer", transition: transitions.smooth,
                          "&:hover": { background: clr + "28" },
                        }}
                      >
                        <Typography sx={{
                          fontFamily: fonts.heading, fontWeight: fonts.weight.bold,
                          fontSize: fonts.size.md, color: clr,
                          letterSpacing: fonts.letterSpacing.wide,
                        }}>
                          {seg.slot.label}
                        </Typography>
                        <Typography sx={{
                          fontFamily: fonts.body, fontSize: "10px",
                          color: colors.text.muted, mt: "2px",
                        }}>
                          {seg.slot.startTime} – {seg.slot.endTime}
                        </Typography>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        /* ═══════════════ LIST VIEW ═══════════════ */
        <Card style={{ padding: 0, overflow: "hidden", marginTop: "8px" }}>
          <DataTable columns={listColumns} data={sortedSlots} emptyMessage="No slots found" />
        </Card>
      )}

      {/* ═══════════════ ADD / EDIT MODAL ═══════════════ */}
      {modalOpen && (
        <Modal open={true} onClose={closeModal} maxWidth="420px">
          <h2 style={{
            fontFamily: fonts.heading, fontWeight: fonts.weight.bold,
            fontSize: fonts.size.lg, color: colors.text.primary, margin: "0 0 18px",
          }}>
            {editingSlot ? "Edit Slot" : "Add New Slot"}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Slot Label</label>
              <input
                style={inputStyle}
                placeholder="e.g. A, CS101, Lab-2…"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>

            <div>
              <label style={labelStyle}>Day</label>
              <select
                style={inputStyle}
                value={form.day}
                onChange={(e) => setForm({ ...form, day: e.target.value })}
              >
                {ALL_DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={labelStyle}>Start Time</label>
                <input
                  type="time"
                  style={inputStyle}
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
              <div>
                <label style={labelStyle}>End Time</label>
                <input
                  type="time"
                  style={inputStyle}
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "22px" }}>
            {editingSlot && (
              <Button variant="danger" size="sm" icon={<TrashIcon />} onClick={() => { setDeleteConfirm(editingSlot); setModalOpen(false); }}>
                Delete
              </Button>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginLeft: editingSlot ? "auto" : "0" }}>
              <Button variant="secondary" size="sm" onClick={closeModal}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                {editingSlot ? "Save Changes" : "Add Slot"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ═══════════════ DELETE CONFIRMATION ═══════════════ */}
      {deleteConfirm && (
        <Modal open={true} onClose={() => setDeleteConfirm(null)} maxWidth="380px">
          <h2 style={{
            fontFamily: fonts.heading, fontWeight: fonts.weight.bold,
            fontSize: fonts.size.lg, color: colors.text.primary, margin: "0 0 8px",
          }}>
            Delete Slot
          </h2>
          <p style={{ fontFamily: fonts.body, fontSize: fonts.size.base, color: colors.text.secondary, margin: "0 0 20px" }}>
            Are you sure you want to remove <strong style={{ color: colorMap[deleteConfirm.label] }}>{deleteConfirm.label}</strong> on {deleteConfirm.day} ({deleteConfirm.startTime} – {deleteConfirm.endTime})?
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <Button variant="secondary" size="sm" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={() => handleDelete(deleteConfirm)}>Delete</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
