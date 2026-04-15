import { Card, Badge, Button } from "../ui/index";
import { colors, fonts } from "../../../../styles/tokens";
import { Check, X } from "lucide-react";

export default function PendingApprovals({ requests, onApprove, onReject }) {
  if (!requests || requests.length === 0) return null;

  const pending = requests.filter((r) => r.status === "pending");

  return (
    <Card style={{ padding: "18px" }} hover={false}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "14px",
      }}>
        <h3 style={{
          fontSize: fonts.size.md,
          fontWeight: fonts.weight.bold,
          color: colors.text.primary,
          margin: 0,
          fontFamily: fonts.heading,
        }}>
          Pending Approvals
        </h3>
        <Badge variant="warning">{pending.length} pending</Badge>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: fonts.size.sm,
          fontFamily: fonts.body,
          minWidth: "700px",
        }}>
          <thead>
            <tr>
              {["Faculty", "Course", "Current Slot", "Requested Slot", "Conflict", "Actions"].map((h) => (
                <th key={h} style={{
                  textAlign: "left",
                  padding: "8px 10px",
                  color: colors.text.muted,
                  fontWeight: fonts.weight.semibold,
                  fontSize: fonts.size.xs,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderBottom: `1px solid ${colors.border.medium}`,
                  whiteSpace: "nowrap",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pending.slice(0, 5).map((req) => (
              <tr key={req.id}
                onMouseEnter={(e) => e.currentTarget.style.background = colors.primary.ghost}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "10px", borderBottom: `1px solid ${colors.border.subtle}` }}>
                  <div style={{ fontWeight: fonts.weight.semibold, color: colors.text.primary }}>{req.facultyName}</div>
                  <div style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>{req.facultyDept}</div>
                </td>
                <td style={{ padding: "10px", borderBottom: `1px solid ${colors.border.subtle}`, color: colors.text.secondary }}>
                  <div>{req.courseCode}</div>
                  <div style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>{req.course}</div>
                </td>
                <td style={{ padding: "10px", borderBottom: `1px solid ${colors.border.subtle}`, color: colors.text.secondary }}>
                  <div>{req.currentSlot.day} {req.currentSlot.time}</div>
                  <div style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>{req.currentSlot.room}</div>
                </td>
                <td style={{ padding: "10px", borderBottom: `1px solid ${colors.border.subtle}`, color: colors.text.secondary }}>
                  <div>{req.requestedSlot.day} {req.requestedSlot.time}</div>
                  <div style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>{req.requestedSlot.room}</div>
                </td>
                <td style={{ padding: "10px", borderBottom: `1px solid ${colors.border.subtle}` }}>
                  <Badge variant={req.conflictStatus === "No conflicts" ? "success" : "danger"}>
                    {req.conflictStatus}
                  </Badge>
                </td>
                <td style={{ padding: "10px", borderBottom: `1px solid ${colors.border.subtle}` }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => onApprove && onApprove(req.id)}
                      icon={<Check size={12} />}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onReject && onReject(req.id)}
                      icon={<X size={12} />}
                    >
                      Reject
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
