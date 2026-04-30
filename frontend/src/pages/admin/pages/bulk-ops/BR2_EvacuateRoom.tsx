// @ts-nocheck
import { useState, useEffect } from "react";
import { OperationPanel } from "../BulkRescheduling";
import { fetchCoursesInRoom } from "../../../../features/admin/services";
import { colors, fonts, radius, transitions } from "../../../../styles/tokens";
import { AlertOctagon } from "lucide-react";

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

export default function BR2_EvacuateRoom({
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
  const [selectedRoom, setSelectedRoom] = useState("");
  const [roomInfo, setRoomInfo] = useState<{ count: number } | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Unique rooms from assignments
  const rooms = Array.from(
    new Set((assignments || []).map((a) => a.roomName).filter(Boolean))
  ).sort();

  useEffect(() => {
    if (!selectedRoom) { setRoomInfo(null); return; }
    setLoadingInfo(true);
    fetchCoursesInRoom(selectedRoom).then((data) => {
      setRoomInfo({ count: data.assignments?.length ?? 0 });
      setLoadingInfo(false);
    });
  }, [selectedRoom]);

  const getParams = () => ({ roomName: selectedRoom });

  return (
    <OperationPanel
      tab="BR-2"
      sourceVersion={sourceVersion}
      previewResult={previewResult}
      onPreview={() => selectedRoom && onPreview(getParams())}
      onApply={() => onApply(getParams())}
      previewing={previewing}
      applying={applying}
      reason={reason}
      onReasonChange={onReasonChange}
      canPreview={!!selectedRoom}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Destructive Warning Banner */}
        <div
          style={{
            padding: "16px",
            background: colors.error.ghost,
            border: `1px solid ${colors.error.border}`,
            borderRadius: radius.md,
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <AlertOctagon size={24} style={{ color: colors.error.main, flexShrink: 0, marginTop: "2px" }} />
          <div>
            <div style={{ fontWeight: fonts.weight.bold, color: colors.error.main, marginBottom: "4px" }}>
              Emergency Action: Evacuate Room
            </div>
            <div style={{ fontSize: fonts.size.sm, color: colors.text.secondary, lineHeight: 1.5 }}>
              This will forcibly remove all scheduled classes from the selected room. The system will attempt to auto-reassign them to available rooms. <strong>Classes that cannot find an alternative room will be left UNASSIGNED.</strong> You must manually triage unassigned classes in the draft version.
            </div>
          </div>
        </div>

        {/* Room selector */}
        <div>
          <label style={labelStyle}>
            Room to Evacuate <span style={{ color: colors.error.main }}>*</span>
          </label>
          <select
            id="br2-room-select"
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            style={selectStyle(focusedField === "room")}
            onFocus={() => setFocusedField("room")}
            onBlur={() => setFocusedField(null)}
          >
            <option value="">— Select a room —</option>
            {rooms.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Room occupancy info */}
        {selectedRoom && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: radius.md,
              background: colors.warning.ghost,
              border: `1px solid ${colors.warning.border}`,
              fontSize: fonts.size.sm,
              color: colors.warning.main,
              fontWeight: fonts.weight.medium,
            }}
          >
            {loadingInfo
              ? "Scanning room schedule…"
              : `Found ${roomInfo?.count ?? 0} class session${roomInfo?.count !== 1 ? "s" : ""} scheduled in ${selectedRoom}. Generating a preview will reveal how many can be safely relocated.`}
          </div>
        )}
      </div>
    </OperationPanel>
  );
}
