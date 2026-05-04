/**
 * ClassDetailsModal — Class Info Modal (triggered by clicking a class tile in the calendar)
 *
 * Per DISHA UI Guide §6:
 * - Shows: class name, time, professor, location, and course syllabus button
 * - Matches the same section layout as the Courses "View Details" modal
 */

import { colors, fonts, radius, shadows } from "../../../styles/tokens";
import { MapPin, Mail, FileText, Clock } from "lucide-react";

export default function ClassDetailsModal({ selectedTimeSlot, onClose }) {
  if (!selectedTimeSlot) return null;

  const profEmail = selectedTimeSlot.professor
    ? selectedTimeSlot.professor
        .toLowerCase()
        .replace(/^dr\.\s*/i, "")
        .replace(/^prof\.\s*/i, "")
        .trim()
        .replace(/\s+/g, ".")
        .replace(/[^a-z.]/g, "") + "@disha.edu"
    : null;

  return (
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
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: colors.bg.base,
          border: `1px solid ${colors.border.medium}`,
          borderRadius: "16px",
          padding: "24px",
          width: "100%",
          maxWidth: "460px",
          boxShadow: shadows.xl,
          animation: "fadeUp 0.25s cubic-bezier(0.4,0,0.2,1) both",
          position: "relative",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2
              style={{
                margin: "0 0 4px",
                fontSize: fonts.size.xl,
                fontWeight: fonts.weight.bold,
                color: colors.text.primary,
                fontFamily: fonts.heading,
              }}
            >
              {selectedTimeSlot.name}
            </h2>
            <p style={{ margin: 0, fontSize: fonts.size.sm, color: colors.text.muted }}>
              {selectedTimeSlot.day}
              {selectedTimeSlot.time ? ` · ${selectedTimeSlot.time}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: colors.text.muted,
              fontSize: fonts.size.sm,
              fontWeight: fonts.weight.medium,
              cursor: "pointer",
              fontFamily: fonts.body,
              padding: "4px 8px",
              flexShrink: 0,
            }}
          >
            Close
          </button>
        </div>

        {/* Section: Schedule */}
        <div
          style={{
            background: colors.bg.raised,
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: radius.md,
            padding: "14px 16px",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              fontSize: fonts.size.xs,
              fontWeight: fonts.weight.semibold,
              color: colors.text.muted,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "8px",
            }}
          >
            Schedule
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: fonts.size.md,
              fontWeight: fonts.weight.medium,
              color: colors.text.primary,
              marginBottom: selectedTimeSlot.location ? "6px" : 0,
            }}
          >
            <Clock size={14} style={{ color: colors.text.muted }} />
            {selectedTimeSlot.time || "See schedule"}
            {selectedTimeSlot.duration ? ` · ${selectedTimeSlot.duration}` : ""}
          </div>
          {selectedTimeSlot.location && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: fonts.size.xs,
                color: colors.text.muted,
              }}
            >
              <MapPin size={12} />
              {selectedTimeSlot.location}
            </div>
          )}
        </div>

        {/* Section: Professor Contact */}
        {selectedTimeSlot.professor && (
          <div
            style={{
              background: colors.bg.raised,
              border: `1px solid ${colors.border.subtle}`,
              borderRadius: radius.md,
              padding: "14px 16px",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                fontSize: fonts.size.xs,
                fontWeight: fonts.weight.semibold,
                color: colors.text.muted,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "8px",
              }}
            >
              Professor Contact
            </div>
            <div
              style={{
                fontSize: fonts.size.md,
                fontWeight: fonts.weight.bold,
                color: colors.text.primary,
                marginBottom: profEmail ? "6px" : 0,
              }}
            >
              {selectedTimeSlot.professor}
            </div>
            {profEmail && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: fonts.size.xs,
                  color: colors.text.muted,
                }}
              >
                <Mail size={12} />
                {profEmail}
              </div>
            )}
          </div>
        )}

        {/* Section: Course Resources */}
        <div
          style={{
            background: colors.bg.raised,
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: radius.md,
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontSize: fonts.size.xs,
              fontWeight: fonts.weight.semibold,
              color: colors.text.muted,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "10px",
            }}
          >
            Course Resources
          </div>
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              background: "rgba(37, 99, 235, 0.06)",
              border: "1px solid rgba(37, 99, 235, 0.2)",
              borderRadius: radius.md,
              color: "#2563EB",
              fontSize: fonts.size.sm,
              fontWeight: fonts.weight.medium,
              cursor: "pointer",
              fontFamily: fonts.body,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(37, 99, 235, 0.12)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(37, 99, 235, 0.06)";
            }}
          >
            <FileText size={14} />
            Course Syllabus
          </button>
        </div>
      </div>
    </div>
  );
}
