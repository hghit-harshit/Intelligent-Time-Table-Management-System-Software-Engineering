import { Card, Button, Badge } from "../components/ui/index";
import { Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#fff", margin: "0 0 4px", fontFamily: "'Playfair Display', serif" }}>System Settings</h1>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>Configure system-wide scheduling parameters</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Scheduling Constraints */}
        <Card style={{ padding: "20px" }} hover={false}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#fff", margin: "0 0 16px", fontFamily: "'Playfair Display', serif" }}>
            Scheduling Constraints
          </h3>
          {[
            { label: "Max consecutive slots per faculty", value: "4" },
            { label: "Min break between classes", value: "10 min" },
            { label: "Max classes per room per day", value: "8" },
            { label: "Lunch break duration", value: "60 min" },
          ].map((setting) => (
            <div key={setting.label} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>{setting.label}</span>
              <input
                type="text"
                defaultValue={setting.value}
                style={{
                  width: "80px", padding: "5px 8px", textAlign: "center",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "6px", color: "#60efff", fontSize: "12px", fontWeight: "600",
                  fontFamily: "'Space Mono', monospace", outline: "none",
                }}
              />
            </div>
          ))}
          <Button variant="primary" style={{ marginTop: "16px", width: "100%" }} icon={<Save size={14} />}>
            Save Constraints
          </Button>
        </Card>

        {/* System Info */}
        <Card style={{ padding: "20px" }} hover={false}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#fff", margin: "0 0 16px", fontFamily: "'Playfair Display', serif" }}>
            System Information
          </h3>
          {[
            { label: "System Version", value: "ITMS v2.5.0" },
            { label: "Database", value: "MongoDB Atlas" },
            { label: "Solver Engine", value: "Constraint Solver v1.2" },
            { label: "Uptime", value: "99.7%" },
            { label: "Last Backup", value: "Mar 10, 2025" },
          ].map((info) => (
            <div key={info.label} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{info.label}</span>
              <Badge variant="info">{info.value}</Badge>
            </div>
          ))}
        </Card>

        {/* Notifications Preferences */}
        <Card style={{ padding: "20px", gridColumn: "span 2" }} hover={false}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#fff", margin: "0 0 16px", fontFamily: "'Playfair Display', serif" }}>
            Notification Preferences
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            {[
              { label: "Conflict Alerts", desc: "Get notified on new conflicts", enabled: true },
              { label: "Reschedule Requests", desc: "Notify on new faculty requests", enabled: true },
              { label: "Solver Completion", desc: "Alert when solver finishes", enabled: true },
              { label: "Low Room Availability", desc: "Warn when rooms are fully booked", enabled: false },
              { label: "Faculty Overload", desc: "Alert on overloaded faculty", enabled: true },
              { label: "Weekly Report", desc: "Email weekly summary", enabled: false },
            ].map((pref) => (
              <div key={pref.label} style={{
                padding: "14px",
                borderRadius: "10px",
                background: pref.enabled ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${pref.enabled ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.06)"}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontWeight: "600", fontSize: "12px", color: "#fff" }}>{pref.label}</span>
                  <div style={{
                    width: "32px", height: "16px", borderRadius: "8px",
                    background: pref.enabled ? "#22c55e" : "rgba(255,255,255,0.15)",
                    position: "relative", cursor: "pointer", transition: "background 0.2s ease",
                  }}>
                    <div style={{
                      width: "12px", height: "12px", borderRadius: "50%",
                      background: "#fff", position: "absolute", top: "2px",
                      left: pref.enabled ? "18px" : "2px",
                      transition: "left 0.2s ease",
                    }} />
                  </div>
                </div>
                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>{pref.desc}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
