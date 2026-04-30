// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { OperationPanel } from "../BulkRescheduling";
import { fetchAvailableRoomsForCourse } from "../../../../features/admin/services";
import { colors, fonts, radius, transitions, shadows } from "../../../../styles/tokens";
import { Search, CheckCircle2, AlertTriangle } from "lucide-react";

const inputStyle = (focused = false) => ({
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

const selectStyle = (focused = false) => ({
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
        style={inputStyle(focused)}
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
                  {c.name} • {c.students} students
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function BR1_MoveCourseRoom({
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
  const [selectedRoom, setSelectedRoom] = useState("");
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Unique courses from assignments
  const courses = Array.from(
    new Map(
      (assignments || []).map((a) => [
        a.courseCode,
        { code: a.courseCode, name: a.courseName, students: a.students || 0 },
      ])
    ).values()
  ).sort((a, b) => a.code.localeCompare(b.code));

  const courseDetails = courses.find((c) => c.code === selectedCourse);

  // Fetch available rooms when course changes
  useEffect(() => {
    if (!selectedCourse) {
      setAvailableRooms([]);
      return;
    }
    setLoadingRooms(true);
    setSelectedRoom("");
    fetchAvailableRoomsForCourse(selectedCourse).then((data) => {
      setAvailableRooms(data.availableRooms || []);
      setLoadingRooms(false);
    });
  }, [selectedCourse]);

  const getParams = () => ({ courseCode: selectedCourse, targetRoom: selectedRoom });

  return (
    <OperationPanel
      tab="BR-1"
      sourceVersion={sourceVersion}
      previewResult={previewResult}
      onPreview={() => selectedCourse && selectedRoom && onPreview(getParams())}
      onApply={() => onApply(getParams())}
      previewing={previewing}
      applying={applying}
      reason={reason}
      onReasonChange={onReasonChange}
      canPreview={!!(selectedCourse && selectedRoom)}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Course selector */}
        <div>
          <label style={labelStyle}>
            Course <span style={{ color: colors.error.main }}>*</span>
          </label>
          <SearchableCourseSelect
            courses={courses}
            value={selectedCourse}
            onChange={setSelectedCourse}
          />
          {courseDetails && (
            <div
              style={{
                marginTop: "8px",
                fontSize: fonts.size.xs,
                color: colors.text.secondary,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <div
                style={{
                  padding: "2px 8px",
                  background: colors.info.ghost,
                  color: colors.info.main,
                  borderRadius: radius.sm,
                  fontWeight: fonts.weight.semibold,
                }}
              >
                Course Size: {courseDetails.students} students
              </div>
            </div>
          )}
        </div>

        {/* Target room selector */}
        <div>
          <label style={labelStyle}>
            Move to Room <span style={{ color: colors.error.main }}>*</span>
          </label>
          {loadingRooms ? (
            <div style={{ fontSize: fonts.size.sm, color: colors.text.muted, padding: "8px 0" }}>
              Checking room availability…
            </div>
          ) : !selectedCourse ? (
            <div style={{ fontSize: fonts.size.sm, color: colors.text.muted, padding: "8px 0" }}>
              Select a course first to see available rooms.
            </div>
          ) : availableRooms.length === 0 ? (
            <div
              style={{
                fontSize: fonts.size.sm,
                color: colors.warning.main,
                padding: "8px 12px",
                background: colors.warning.ghost,
                border: `1px solid ${colors.warning.border}`,
                borderRadius: radius.md,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertTriangle size={16} />
              No rooms are free at all slots this course occupies.
            </div>
          ) : (
            <select
              id="br1-room-select"
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              style={selectStyle(focusedField === "room")}
              onFocus={() => setFocusedField("room")}
              onBlur={() => setFocusedField(null)}
            >
              <option value="">— Select a room —</option>
              {availableRooms.map((r) => {
                const isTooSmall = courseDetails && r.capacity && r.capacity < courseDetails.students;
                return (
                  <option key={r.roomName} value={r.roomName}>
                    {r.roomName}
                    {r.capacity ? ` (Capacity: ${r.capacity})` : ""}
                    {isTooSmall ? " ⚠️ TOO SMALL" : ""}
                  </option>
                );
              })}
            </select>
          )}

          {/* Room Capacity Confidence UI */}
          {selectedRoom && courseDetails && (
            <div style={{ marginTop: "8px" }}>
              {(() => {
                const roomObj = availableRooms.find((r) => r.roomName === selectedRoom);
                if (!roomObj || !roomObj.capacity) return null;
                const diff = roomObj.capacity - courseDetails.students;
                const isWarning = diff < 0;

                return (
                  <div
                    style={{
                      fontSize: fonts.size.xs,
                      padding: "6px 10px",
                      borderRadius: radius.sm,
                      background: isWarning ? colors.warning.ghost : colors.success.ghost,
                      color: isWarning ? colors.warning.main : colors.success.main,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontWeight: fonts.weight.medium,
                    }}
                  >
                    {isWarning ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                    {isWarning
                      ? `Warning: Room capacity (${roomObj.capacity}) is smaller than course size (${courseDetails.students}). Shortfall: ${Math.abs(diff)} seats.`
                      : `Room capacity (${roomObj.capacity}) safely accommodates ${courseDetails.students} students. Spare seats: ${diff}.`}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </OperationPanel>
  );
}
