import { useState } from "react";
import { Card, Badge, Button } from "../ui/index";
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
          fontSize: "14px",
          fontWeight: "700",
          color: "#fff",
          margin: 0,
          fontFamily: "'Playfair Display', serif",
        }}>
          Pending Approvals
        </h3>
        <Badge variant="warning">{pending.length} pending</Badge>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "12px",
          minWidth: "700px",
        }}>
          <thead>
            <tr>
              {["Faculty", "Course", "Current Slot", "Requested Slot", "Conflict", "Actions"].map((h) => (
                <th key={h} style={{
                  textAlign: "left",
                  padding: "8px 10px",
                  color: "rgba(255,255,255,0.35)",
                  fontWeight: "600",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
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
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ fontWeight: "600", color: "#fff" }}>{req.facultyName}</div>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>{req.facultyDept}</div>
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.7)" }}>
                  <div>{req.courseCode}</div>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>{req.course}</div>
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)" }}>
                  <div>{req.currentSlot.day} {req.currentSlot.time}</div>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{req.currentSlot.room}</div>
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)" }}>
                  <div>{req.requestedSlot.day} {req.requestedSlot.time}</div>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{req.requestedSlot.room}</div>
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <Badge variant={req.conflictStatus === "No conflicts" ? "success" : "danger"}>
                    {req.conflictStatus}
                  </Badge>
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
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
