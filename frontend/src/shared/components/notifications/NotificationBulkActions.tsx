import { CheckCheck, CheckSquare, Square, Trash2 } from "lucide-react";
import { colors, fonts, radius } from "../../../styles/tokens";

type NotificationBulkActionsProps = {
  allSelected: boolean;
  selectedCount: number;
  onToggleSelectAll: () => void;
  onDeleteSelected: () => void;
  onMarkAllRead?: () => void;
  canMarkAllRead?: boolean;
  showSelectAll?: boolean;
};

export default function NotificationBulkActions({
  allSelected,
  selectedCount,
  onToggleSelectAll,
  onDeleteSelected,
  onMarkAllRead,
  canMarkAllRead = false,
  showSelectAll = true,
}: NotificationBulkActionsProps) {
  const iconBtn = {
    background: colors.bg.raised,
    border: `1px solid ${colors.border.medium}`,
    color: colors.text.primary,
    borderRadius: radius.md,
    cursor: "pointer",
    width: "32px",
    height: "32px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: fonts.body,
  } as const;

  return (
    <>
      {onMarkAllRead && (
        <button
          onClick={onMarkAllRead}
          title="Mark All Read"
          aria-label="Mark All Read"
          disabled={!canMarkAllRead}
          style={{
            ...iconBtn,
            color: canMarkAllRead ? colors.primary.main : colors.text.muted,
            cursor: canMarkAllRead ? "pointer" : "not-allowed",
          }}
        >
          <CheckCheck size={15} />
        </button>
      )}

      {showSelectAll && (
        <button
          onClick={onToggleSelectAll}
          title={allSelected ? "Clear Selection" : "Select All"}
          aria-label={allSelected ? "Clear Selection" : "Select All"}
          style={iconBtn}
        >
          {allSelected ? <CheckSquare size={15} /> : <Square size={15} />}
        </button>
      )}

      <button
        onClick={onDeleteSelected}
        title={`Delete Selected (${selectedCount})`}
        aria-label={`Delete Selected (${selectedCount})`}
        disabled={selectedCount === 0}
        style={{
          ...iconBtn,
          border: `1px solid ${selectedCount > 0 ? colors.error.border : colors.border.medium}`,
          color: selectedCount > 0 ? colors.error.main : colors.text.muted,
          cursor: selectedCount > 0 ? "pointer" : "not-allowed",
          position: "relative",
        }}
      >
        <Trash2 size={15} />
      </button>
    </>
  );
}
