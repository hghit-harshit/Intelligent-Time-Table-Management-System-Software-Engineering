// @ts-nocheck
import { useState } from "react";
import { OperationPanel } from "../BulkRescheduling";
import { colors, fonts, radius, transitions } from "../../../../styles/tokens";
import { CalendarX } from "lucide-react";

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

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function BR7_CancelDate({
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
  const [targetDate, setTargetDate] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [focused, setFocused] = useState<string | null>(null);

  // Auto-derive day of week from date picker
  const handleDateChange = (val: string) => {
    setTargetDate(val);
    if (val) {
      const d = new Date(val + "T12:00:00"); // noon avoids tz issues
      setDayOfWeek(DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1]);
    } else {
      setDayOfWeek("");
    }
  };

  // Count affected sessions for the chosen day
  const affectedCount = dayOfWeek
    ? (assignments || []).filter(
        (a) => a.day?.toLowerCase() === dayOfWeek.toLowerCase()
      ).length
    : 0;

  const getParams = () => ({ date: targetDate, dayOfWeek });
  const isFormComplete = targetDate && dayOfWeek && reason.trim().length > 0;

  return (
    <OperationPanel
      tab="BR-7"
      sourceVersion={sourceVersion}
      previewResult={previewResult}
      onPreview={() => isFormComplete && onPreview(getParams())}
      onApply={() => onApply(getParams())}
      previewing={previewing}
      applying={applying}
      reason={reason}
      onReasonChange={onReasonChange}
      canPreview={isFormComplete}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
          {/* Date picker */}
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>
              Cancel Date <span style={{ color: colors.error.main }}>*</span>
            </label>
            <input
              id="br7-date-input"
              type="date"
              value={targetDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              style={inputStyle(focused === "date")}
              onFocus={() => setFocused("date")}
              onBlur={() => setFocused(null)}
            />
          </div>

          {/* Derived day display */}
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Day of Week</label>
            <select
              id="br7-day-select"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              style={{ ...selectStyle(focused === "day"), opacity: dayOfWeek ? 1 : 0.6 }}
              onFocus={() => setFocused("day")}
              onBlur={() => setFocused(null)}
              disabled={!targetDate}
            >
              <option value="">— Auto-detected —</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mandatory Cancellation Reason Input */}
        <div>
          <label style={labelStyle}>
            Cancellation Reason <span style={{ color: colors.error.main }}>*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Public Holiday, Severe Weather, Event"
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            style={inputStyle(focused === "reason")}
            onFocus={() => setFocused("reason")}
            onBlur={() => setFocused(null)}
          />
          <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginTop: "4px" }}>
            A reason must be provided before generating the cancellation preview.
          </div>
        </div>

        {/* Impact summary */}
        {dayOfWeek && (
          <div
            style={{
              padding: "16px",
              borderRadius: radius.md,
              background: colors.error.ghost,
              border: `1px solid ${colors.error.border}`,
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <CalendarX size={20} style={{ color: colors.error.main, flexShrink: 0, marginTop: "2px" }} />
            <div style={{ fontSize: fonts.size.sm, color: colors.error.main }}>
              <strong>Contextual Warning:</strong> This will target exactly <strong>{affectedCount}</strong> class session{affectedCount !== 1 ? "s" : ""} scheduled on <strong>{dayOfWeek}</strong>. They will be marked as cancelled for this specific date only. They will not be permanently deleted from the semester.
            </div>
          </div>
        )}
      </div>
    </OperationPanel>
  );
}
