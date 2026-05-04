/**
 * NotesViewerModal — Google Doc viewer with minimal chrome.
 *
 * Design decisions:
 * - Backdrop flex-centers the panel (immune to ancestor transforms)
 * - Header is minimal: course code · name · date + close button only
 * - iframe offset is small (~55px) to hide only the Google Docs title bar,
 *   keeping the full editing toolbar and document top visible
 * - Low border-radius (8px) as requested
 */
import { useState, useEffect } from "react";
import { colors, fonts } from "../../../styles/tokens";
import { X } from "lucide-react";

interface Props {
  webViewLink: string;
  googleDocId: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export default function NotesViewerModal({
  webViewLink: _webViewLink,
  googleDocId,
  title,
  subtitle,
  onClose,
}: Props) {
  const [loaded, setLoaded] = useState(false);

  // Use /edit directly — gives full editing toolbar inside iframe
  const editUrl = `https://docs.google.com/document/d/${googleDocId}/edit`;

  // Parse "CS401 · Thu, May 7, 2026" from subtitle
  const parts = subtitle?.split("·").map((s) => s.trim()) ?? [];
  const courseCode = parts[0] ?? "";
  const sessionDate = parts[1] ?? "";

  // Esc to close
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <>
      <style>{`
        @keyframes nvSlideIn {
          from { opacity: 0; transform: translateY(14px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes nvSpin { to { transform: rotate(360deg); } }
        .nv-close-btn:hover {
          background: ${colors.error.ghost} !important;
          color: ${colors.error.main} !important;
          border-color: ${colors.error.border} !important;
        }
      `}</style>

      {/* Backdrop — flex container so centering is done with flexbox */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(10, 18, 35, 0.55)",
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        {/* ── Modal Panel ─────────────────────────────────────────── */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "min(920px, 100%)",
            height: "calc(100vh - 40px)",
            maxHeight: "900px",
            display: "flex",
            flexDirection: "column",
            background: colors.bg.base,
            borderRadius: "8px",                      /* less rounded */
            boxShadow: "0 20px 60px rgba(0,0,0,0.30), 0 0 0 1px rgba(0,0,0,0.08)",
            overflow: "hidden",
            animation: "nvSlideIn 0.2s cubic-bezier(0.4,0,0.2,1) both",
          }}
        >
          {/* ── Minimal Header ──────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              borderBottom: `1px solid ${colors.border.medium}`,
              background: colors.bg.base,
              flexShrink: 0,
            }}
          >
            {/* Course code badge */}
            {courseCode && (
              <span
                style={{
                  fontSize: fonts.size.xs,
                  fontWeight: fonts.weight.bold,
                  background: "rgba(37,99,235,0.08)",
                  color: "#2563EB",
                  border: "1px solid rgba(37,99,235,0.18)",
                  borderRadius: "4px",
                  padding: "2px 7px",
                  letterSpacing: "0.03em",
                  flexShrink: 0,
                }}
              >
                {courseCode}
              </span>
            )}

            {/* Course name */}
            <span
              style={{
                fontWeight: fonts.weight.semibold,
                fontSize: fonts.size.md,
                color: colors.text.primary,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}
            >
              {title}
            </span>

            {/* Session date */}
            {sessionDate && (
              <span
                style={{
                  fontSize: fonts.size.xs,
                  color: colors.text.muted,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {sessionDate}
              </span>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="nv-close-btn"
              title="Close (Esc)"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                background: colors.bg.raised,
                border: `1px solid ${colors.border.medium}`,
                borderRadius: "4px",
                color: colors.text.secondary,
                cursor: "pointer",
                transition: "all 0.15s ease",
                flexShrink: 0,
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* ── Google Doc iframe ────────────────────────────────── */}
          <div
            style={{
              flex: 1,
              overflow: "hidden",
              position: "relative",
              background: "#f8f9fa",
            }}
          >
            {/* Loading spinner */}
            {!loaded && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: colors.bg.base,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    border: "3px solid rgba(37,99,235,0.12)",
                    borderTopColor: "#2563EB",
                    borderRadius: "50%",
                    animation: "nvSpin 0.7s linear infinite",
                  }}
                />
                <div
                  style={{
                    fontSize: fonts.size.sm,
                    color: colors.text.muted,
                  }}
                >
                  Opening document…
                </div>
              </div>
            )}

            {/*
              Offset: -55px hides only the Google Docs title/name bar at top
              (keeping the full editing toolbar + document top visible).
              Previously -220px was hiding too much, making doc top unreachable.
            */}
            <iframe
              src={editUrl}
              title={title}
              onLoad={() => setLoaded(true)}
              style={{
                position: "absolute",
                top: "-55px",
                left: 0,
                width: "100%",
                height: "calc(100% + 55px)",
                border: "none",
                opacity: loaded ? 1 : 0,
                transition: "opacity 0.25s ease",
              }}
              allow="clipboard-read; clipboard-write"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </>
  );
}
