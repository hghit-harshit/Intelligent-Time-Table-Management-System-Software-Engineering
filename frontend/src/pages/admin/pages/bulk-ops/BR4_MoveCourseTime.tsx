// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { OperationPanel } from "../BulkRescheduling";
import { colors, fonts, radius, transitions, shadows } from "../../../../styles/tokens";
import { Search } from "lucide-react";

const inputStyle = (focused = false) => ({
  width: "100%",
  padding: "8px 12px",
  background: colors.bg.raised,
  border: `1px solid ${focused ? colors.primary.border : colors.border.medium}`,
  borderRadius: radius.md,
  fontSize: fonts.size.sm,
  fontFamily: fonts.body,
  color: colors.text.primary,
  outline: "none",
  boxSizing: "border-box" as const,
  transition: transitions.smooth,
  boxShadow: focused ? `0 0 0 3px ${colors.primary.ghost}` : "none",
});

const selectStyle = (focused = false) => ({
  ...inputStyle(focused),
  cursor: "pointer",
  appearance: "none" as const,
});

const labelStyle = {
  display: "block",
  fontSize: fonts.size.sm,
  fontWeight: fonts.weight.semibold,
  color: colors.text.secondary,
  marginBottom: "6px",
};

const searchInputStyle = (focused = false) => ({
  width: "100%",
  padding: "8px 12px 8px 32px",
  background: colors.bg.raised,
  border: `1px solid ${focused ? colors.primary.border : colors.border.medium}`,
  borderRadius: radius.md,
  fontSize: fonts.size.sm,
  fontFamily: fonts.body,
  color: colors.text.primary,
  outline: "none",
  boxSizing: "border-box" as const,
  transition: transitions.smooth,
  boxShadow: focused ? `0 0 0 3px ${colors.primary.ghost}` : "none",
});

function SearchableCourseSelect({ courses, value, onChange }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (value) {
      const c = courses.find((x) => x.code === value);
      if (c) setSearch(`${c.code} — ${c.name}`);
    } else {
      setSearch("");
    }
  }, [value, courses]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = courses.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ position: "relative" }} ref={wrapperRef}>
      <Search
        size={14}
        style={{
          position: "absolute",
          left: "10px",
          top: "10px",
          color: colors.text.muted,
        }}
      />
      <input
        type="text"
        placeholder="Search for a course..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
          onChange(""); // Clear selection when typing
        }}
        onFocus={() => {
          setFocused(true);
          setOpen(true);
          setSearch(""); // clear to allow fresh search
        }}
        onBlur={() => setFocused(false)}
        style={searchInputStyle(focused)}
      />
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "4px",
            maxHeight: "200px",
            overflowY: "auto",
            background: colors.bg.base,
            border: `1px solid ${colors.border.medium}`,
            borderRadius: radius.md,
            boxShadow: shadows.md,
            zIndex: 10,
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: "8px 12px", fontSize: fonts.size.xs, color: colors.text.muted }}>
              No courses found
            </div>
          ) : (
            filtered.map((c) => (
              <div
                key={c.code}
                onClick={() => {
                  onChange(c.code);
                  setSearch(`${c.code} — ${c.name}`);
                  setOpen(false);
                }}
                style={{
                  padding: "8px 12px",
                  fontSize: fonts.size.sm,
                  color: colors.text.primary,
                  cursor: "pointer",
                  borderBottom: `1px solid ${colors.border.subtle}`,
                }}
                onMouseEnter={(e) => (e.target.style.background = colors.bg.raised)}
                onMouseLeave={(e) => (e.target.style.background = colors.bg.base)}
              >
                <div style={{ fontWeight: fonts.weight.semibold }}>{c.code}</div>
                <div style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>
                  {c.name}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function BR4_MoveCourseTime({
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
  const [selectedCourse, setSelectedCourse] = useState("");
  const [targetDay, setTargetDay] = useState("");
  const [targetStart, setTargetStart] = useState("");
  const [targetEnd, setTargetEnd] = useState("");
  const [focused, setFocused] = useState<string | null>(null);

  const courses = Array.from(
    new Map(
      (assignments || []).map((a) => [a.courseCode, { code: a.courseCode, name: a.courseName }])
    ).values()
  ).sort((a, b) => a.code.localeCompare(b.code));

  // Derive existing time slots from assignments for reference
  const existingSlots = Array.from(
    new Set(
      (assignments || []).map((a) => `${a.startTime}–${a.endTime}`)
    )
  ).sort();

  const getParams = () => ({
    courseCode: selectedCourse,
    targetDay,
    targetStartTime: targetStart,
    targetEndTime: targetEnd,
  });

  const isValid = selectedCourse && targetDay && targetStart && targetEnd;

  return (
    <OperationPanel
      tab="BR-4"
      sourceVersion={sourceVersion}
      previewResult={previewResult}
      onPreview={() => isValid && onPreview(getParams())}
      onApply={() => onApply(getParams())}
      previewing={previewing}
      applying={applying}
      reason={reason}
      onReasonChange={onReasonChange}
      canPreview={isValid}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Course */}
        <div>
          <label style={labelStyle}>
            Course <span style={{ color: colors.error.main }}>*</span>
          </label>
          <SearchableCourseSelect
            courses={courses}
            value={selectedCourse}
            onChange={setSelectedCourse}
          />
        </div>

        {/* Target Day + Time row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          <div>
            <label style={labelStyle}>
              New Day <span style={{ color: colors.error.main }}>*</span>
            </label>
            <select
              id="br4-day-select"
              value={targetDay}
              onChange={(e) => setTargetDay(e.target.value)}
              style={selectStyle(focused === "day")}
              onFocus={() => setFocused("day")}
              onBlur={() => setFocused(null)}
            >
              <option value="">— Day —</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>
              Start Time <span style={{ color: colors.error.main }}>*</span>
            </label>
            <input
              id="br4-start-time"
              type="time"
              value={targetStart}
              onChange={(e) => setTargetStart(e.target.value)}
              style={inputStyle(focused === "start")}
              onFocus={() => setFocused("start")}
              onBlur={() => setFocused(null)}
            />
          </div>
          <div>
            <label style={labelStyle}>
              End Time <span style={{ color: colors.error.main }}>*</span>
            </label>
            <input
              id="br4-end-time"
              type="time"
              value={targetEnd}
              onChange={(e) => setTargetEnd(e.target.value)}
              style={inputStyle(focused === "end")}
              onFocus={() => setFocused("end")}
              onBlur={() => setFocused(null)}
            />
          </div>
        </div>

        {/* Existing slots hint */}
        {existingSlots.length > 0 && (
          <div style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>
            <strong>Existing slot windows:</strong>{" "}
            {existingSlots.slice(0, 6).join(" · ")}
            {existingSlots.length > 6 && " · …"}
          </div>
        )}
      </div>
    </OperationPanel>
  );
}
