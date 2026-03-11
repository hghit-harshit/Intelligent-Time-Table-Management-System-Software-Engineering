import { useState, useEffect } from "react";
import { Card, Badge, Button, Loader } from "../components/ui/index";
import { fetchTimetableVersions } from "../services/adminApi";
import { Download, RotateCcw, Eye, Send } from "lucide-react";

const statusVariant = { published: "success", draft: "warning", archived: "neutral" };

export default function TimetableVersions() {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimetableVersions().then((res) => { setVersions(res); setLoading(false); });
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#fff", margin: "0 0 4px", fontFamily: "'Playfair Display', serif" }}>
          Timetable Versions
        </h1>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
          Version history and rollback management
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {versions.map((v) => (
          <Card key={v.id} style={{ padding: "16px" }} hover={false}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                width: "42px", height: "42px", borderRadius: "10px",
                background: v.status === "published" ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${v.status === "published" ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.08)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px", flexShrink: 0,
              }}>
                {v.status === "published" ? "🚀" : v.status === "draft" ? "📝" : "📦"}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontWeight: "700", color: "#fff", fontSize: "14px" }}>{v.label}</span>
                  <Badge variant={statusVariant[v.status]}>{v.status}</Badge>
                  {v.conflicts > 0 && <Badge variant="danger">{v.conflicts} conflicts</Badge>}
                </div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                  Created {new Date(v.createdAt).toLocaleDateString()} by {v.author}
                </div>
              </div>

              <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                <Button size="sm" variant="ghost" icon={<Eye size={12} />}>Preview</Button>
                {v.status !== "published" && (
                  <Button size="sm" variant="secondary" icon={<RotateCcw size={12} />}>Restore</Button>
                )}
                <Button size="sm" variant="ghost" icon={<Download size={12} />}>Export</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
