// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { OperationPanel } from "../BulkRescheduling";
import { colors, fonts, radius, transitions, shadows } from "../../../../styles/tokens";
import { Search, ArrowLeftRight } from "lucide-react";

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
          onChange("");
        }}
        onFocus={() => {
          setFocused(true);
          setOpen(true);
          setSearch("");
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

export default function BR3_SwapCourses({
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
  const [courseA, setCourseA] = useState("");
  const [courseB, setCourseB] = useState("");

  const courses = Array.from(
    new Map(
      (assignments || []).map((a) => [a.courseCode, { code: a.courseCode, name: a.courseName }])
    ).values()
  ).sort((a, b) => a.code.localeCompare(b.code));

  const getCourseInfo = (code) => {
    const slots = (assignments || []).filter((a) => a.courseCode === code);
    if (slots.length === 0) return null;
    return {
      code,
      name: slots[0].courseName,
      slots: slots.map((s) => `${s.day} ${s.startTime}–${s.endTime} (${s.roomName || "Unassigned"})`),
    };
  };

  const infoA = getCourseInfo(courseA);
  const infoB = getCourseInfo(courseB);

  const getParams = () => ({ courseCodeA: courseA, courseCodeB: courseB });

  const isValid = courseA && courseB && courseA !== courseB;

  return (
    <OperationPanel
      tab="BR-3"
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
        {/* Course A */}
        <div>
          <label style={{
            display: "block",
            fontSize: fonts.size.sm,
            fontWeight: fonts.weight.semibold,
            color: colors.text.secondary,
            marginBottom: "6px",
          }}>
            Course A <span style={{ color: colors.error.main }}>*</span>
          </label>
          <SearchableCourseSelect
            courses={courses}
            value={courseA}
            onChange={setCourseA}
          />
          {infoA && (
            <div style={{ marginTop: "8px", fontSize: fonts.size.xs, color: colors.text.muted }}>
              <div style={{ fontWeight: fonts.weight.medium, marginBottom: "4px" }}>Current schedule:</div>
              {infoA.slots.map((s, i) => (
                <div key={i} style={{ padding: "2px 0" }}>• {s}</div>
              ))}
            </div>
          )}
        </div>

        {/* Swap indicator */}
        {infoA && infoB && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px",
            background: colors.primary.ghost,
            border: `1px solid ${colors.primary.border}`,
            borderRadius: radius.md,
          }}>
            <ArrowLeftRight size={18} style={{ color: colors.primary.main }} />
            <span style={{ marginLeft: "8px", fontSize: fonts.size.sm, color: colors.primary.main, fontWeight: fonts.weight.semibold }}>
              Swap schedules
            </span>
          </div>
        )}

        {/* Course B */}
        <div>
          <label style={{
            display: "block",
            fontSize: fonts.size.sm,
            fontWeight: fonts.weight.semibold,
            color: colors.text.secondary,
            marginBottom: "6px",
          }}>
            Course B <span style={{ color: colors.error.main }}>*</span>
          </label>
          <SearchableCourseSelect
            courses={courses}
            value={courseB}
            onChange={setCourseB}
          />
          {infoB && (
            <div style={{ marginTop: "8px", fontSize: fonts.size.xs, color: colors.text.muted }}>
              <div style={{ fontWeight: fonts.weight.medium, marginBottom: "4px" }}>Current schedule:</div>
              {infoB.slots.map((s, i) => (
                <div key={i} style={{ padding: "2px 0" }}>• {s}</div>
              ))}
            </div>
          )}
        </div>

        {courseA && courseB && courseA === courseB && (
          <div style={{
            padding: "10px 14px",
            background: colors.error.ghost,
            border: `1px solid ${colors.error.border}`,
            borderRadius: radius.md,
            fontSize: fonts.size.sm,
            color: colors.error.main,
          }}>
            Course A and Course B must be different.
          </div>
        )}
      </div>
    </OperationPanel>
  );
}
