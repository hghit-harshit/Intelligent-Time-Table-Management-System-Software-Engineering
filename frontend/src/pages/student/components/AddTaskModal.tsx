/**
 * AddTaskModal — Task Creation Overlay
 *
 * Per DISHA UI Guide §6:
 * - Centered white overlay
 * - Fields: Title, Description, Category (Academic/Personal/Social), Reminder Toggle
 * - Checking reminder opens sub-dropdown for "Reminder Time" (15 min before, etc.)
 */

import { useState } from "react";
import { colors, fonts, radius, shadows } from "../../../styles/tokens";
import { X, Bell, Calendar, Clock3, AlignLeft, Tag } from "lucide-react";

interface AddTaskModalProps {
  onClose: () => void;
  onSave: (task: {
    title: string;
    description: string;
    category: string;
    reminder: boolean;
    reminderTime: string;
    dueDate: string;
  }) => void;
}

const REMINDER_OPTIONS = [
  { value: "5", label: "5 min before" },
  { value: "15", label: "15 min before" },
  { value: "30", label: "30 min before" },
  { value: "60", label: "1 hour before" },
  { value: "1440", label: "1 day before" },
];

const CATEGORIES = [
  { value: "Academic", color: "#6366f1", bg: "rgba(99,102,241,0.08)" },
  { value: "Personal", color: "#10b981", bg: "rgba(16,185,129,0.08)" },
  { value: "Social", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
];

export default function AddTaskModal({ onClose, onSave }: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Academic");
  const [reminder, setReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState("15");
  const [dueDatePart, setDueDatePart] = useState("");
  const [dueTimePart, setDueTimePart] = useState("09:00");
  const [titleError, setTitleError] = useState(false);

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    const composedDueDate = dueDatePart ? `${dueDatePart}T${dueTimePart || "09:00"}` : "";
    onSave({
      title,
      description,
      category,
      reminder,
      reminderTime,
      dueDate: composedDueDate,
    });
    onClose();
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: `1px solid ${colors.border.medium}`,
    borderRadius: radius.md,
    fontSize: fonts.size.sm,
    fontFamily: fonts.body,
    color: colors.text.primary,
    background: colors.bg.raised,
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "border-color 0.15s ease",
  };

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        animation: "fadeIn 0.2s ease",
      }}
    >
      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: colors.bg.base,
          border: `1px solid ${colors.border.medium}`,
          borderRadius: "16px",
          padding: "24px",
          width: "100%",
          maxWidth: "440px",
          boxShadow: shadows.xl,
          animation: "fadeUp 0.25s cubic-bezier(0.4,0,0.2,1) both",
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2
            style={{
              margin: 0,
              fontSize: fonts.size.xl,
              fontWeight: fonts.weight.bold,
              fontFamily: fonts.heading,
              color: colors.text.primary,
            }}
          >
            Add Task
          </h2>
          <button
            onClick={onClose}
            style={{
              background: colors.bg.raised,
              border: `1px solid ${colors.border.medium}`,
              borderRadius: radius.md,
              padding: "6px",
              cursor: "pointer",
              display: "flex",
              color: colors.text.muted,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Title field */}
        <div style={{ marginBottom: "14px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: fonts.size.xs,
              fontWeight: fonts.weight.semibold,
              color: colors.text.secondary,
              textTransform: "uppercase",
              letterSpacing: fonts.letterSpacing.wider,
              marginBottom: "6px",
            }}
          >
            <AlignLeft size={11} /> Title
          </label>
          <input
            type="text"
            placeholder="Task title..."
            value={title}
            onChange={(e) => { setTitle(e.target.value); setTitleError(false); }}
            style={{
              ...inputStyle,
              borderColor: titleError ? colors.error.main : colors.border.medium,
            }}
            onFocus={(e) => (e.target.style.borderColor = colors.primary.main)}
            onBlur={(e) => (e.target.style.borderColor = titleError ? colors.error.main : colors.border.medium)}
            autoFocus
          />
          {titleError && (
            <p style={{ margin: "4px 0 0", fontSize: fonts.size.xs, color: colors.error.main }}>
              Title is required.
            </p>
          )}
        </div>

        {/* Description field */}
        <div style={{ marginBottom: "14px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: fonts.size.xs,
              fontWeight: fonts.weight.semibold,
              color: colors.text.secondary,
              textTransform: "uppercase",
              letterSpacing: fonts.letterSpacing.wider,
              marginBottom: "6px",
            }}
          >
            <AlignLeft size={11} /> Description
          </label>
          <textarea
            placeholder="Optional description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{
              ...inputStyle,
              resize: "vertical",
              minHeight: "80px",
            }}
            onFocus={(e) => (e.target.style.borderColor = colors.primary.main)}
            onBlur={(e) => (e.target.style.borderColor = colors.border.medium)}
          />
        </div>

        {/* Category selector */}
        <div style={{ marginBottom: "14px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: fonts.size.xs,
              fontWeight: fonts.weight.semibold,
              color: colors.text.secondary,
              textTransform: "uppercase",
              letterSpacing: fonts.letterSpacing.wider,
              marginBottom: "8px",
            }}
          >
            <Tag size={11} /> Category
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            {CATEGORIES.map(({ value, color, bg }) => (
              <button
                key={value}
                onClick={() => setCategory(value)}
                style={{
                  flex: 1,
                  padding: "8px 4px",
                  border: `2px solid ${category === value ? color : colors.border.medium}`,
                  borderRadius: radius.md,
                  background: category === value ? bg : colors.bg.raised,
                  color: category === value ? color : colors.text.secondary,
                  fontSize: fonts.size.sm,
                  fontWeight: category === value ? fonts.weight.semibold : fonts.weight.regular,
                  cursor: "pointer",
                  fontFamily: fonts.body,
                  transition: "all 0.15s ease",
                }}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {/* Due Date + Time */}
        <div style={{ marginBottom: "14px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: fonts.size.xs,
              fontWeight: fonts.weight.semibold,
              color: colors.text.secondary,
              textTransform: "uppercase",
              letterSpacing: fonts.letterSpacing.wider,
              marginBottom: "6px",
            }}
          >
            <Calendar size={11} /> Due Date
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <input
              type="date"
              value={dueDatePart}
              onChange={(e) => setDueDatePart(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = colors.primary.main)}
              onBlur={(e) => (e.target.style.borderColor = colors.border.medium)}
            />
            <div style={{ position: "relative" }}>
              <Clock3
                size={13}
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: colors.text.muted,
                  pointerEvents: "none",
                }}
              />
              <input
                type="time"
                value={dueTimePart}
                onChange={(e) => setDueTimePart(e.target.value)}
                style={{ ...inputStyle, paddingLeft: "30px" }}
                onFocus={(e) => (e.target.style.borderColor = colors.primary.main)}
                onBlur={(e) => (e.target.style.borderColor = colors.border.medium)}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
            {["08:00", "10:00", "14:00", "18:00"].map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => setDueTimePart(time)}
                style={{
                  border: `1px solid ${dueTimePart === time ? colors.primary.border : colors.border.medium}`,
                  background: dueTimePart === time ? colors.primary.ghost : colors.bg.raised,
                  color: dueTimePart === time ? colors.primary.main : colors.text.secondary,
                  borderRadius: radius.md,
                  padding: "3px 8px",
                  fontSize: "11px",
                  fontFamily: fonts.body,
                  cursor: "pointer",
                }}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Reminder Toggle */}
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              background: colors.bg.raised,
              border: `1px solid ${colors.border.medium}`,
              borderRadius: radius.md,
              cursor: "pointer",
            }}
            onClick={() => setReminder(!reminder)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Bell size={14} style={{ color: reminder ? colors.primary.main : colors.text.muted }} />
              <span style={{ fontSize: fonts.size.sm, color: colors.text.primary, fontWeight: fonts.weight.medium }}>
                Set Reminder
              </span>
            </div>
            {/* Toggle switch */}
            <div
              style={{
                width: "36px",
                height: "20px",
                background: reminder ? colors.primary.main : colors.border.medium,
                borderRadius: "10px",
                position: "relative",
                transition: "background 0.2s ease",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "3px",
                  left: reminder ? "19px" : "3px",
                  width: "14px",
                  height: "14px",
                  background: "#fff",
                  borderRadius: "50%",
                  boxShadow: shadows.sm,
                  transition: "left 0.2s ease",
                }}
              />
            </div>
          </div>

          {/* Reminder time sub-dropdown */}
          {reminder && (
            <div style={{ marginTop: "8px" }}>
              <select
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                style={{
                  ...inputStyle,
                  cursor: "pointer",
                }}
              >
                {REMINDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px",
              background: colors.bg.raised,
              border: `1px solid ${colors.border.medium}`,
              borderRadius: radius.md,
              color: colors.text.secondary,
              fontSize: fonts.size.sm,
              fontWeight: fonts.weight.medium,
              cursor: "pointer",
              fontFamily: fonts.body,
              transition: "all 0.15s ease",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              flex: 2,
              padding: "10px",
              background: colors.primary.main,
              border: "none",
              borderRadius: radius.md,
              color: "#fff",
              fontSize: fonts.size.sm,
              fontWeight: fonts.weight.semibold,
              cursor: "pointer",
              fontFamily: fonts.body,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = colors.primary.light)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = colors.primary.main)}
          >
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
}
