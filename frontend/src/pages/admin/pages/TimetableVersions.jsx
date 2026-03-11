import { useState, useEffect } from "react";
import { Card, Badge, Button, Loader, PageHeader } from "../components/ui/index";
import { fetchTimetableVersions } from "../services/adminApi";
import { Download, RotateCcw, Eye, Rocket, FileText, Archive } from "lucide-react";
import { colors, fonts, radius } from "../../../styles/tokens";

const statusVariant = { published: "success", draft: "warning", archived: "neutral" };
const statusIcon = { published: Rocket, draft: FileText, archived: Archive };

export default function TimetableVersions() {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimetableVersions().then((res) => { setVersions(res); setLoading(false); });
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      {/* WHY: Replaced inline h1+p with shared PageHeader to remove duplication */}
      <PageHeader title="Timetable Versions" subtitle="Version history and rollback management" />

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {versions.map((v) => {
          const IconComp = statusIcon[v.status] || Archive;
          const iconColor = v.status === "published" ? "#22c55e" : colors.text.muted;
          return (
            <Card key={v.id} style={{ padding: "16px" }} hover={false}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{
                  width: "42px", height: "42px", borderRadius: radius.lg,
                  background: v.status === "published" ? "rgba(34,197,94,0.08)" : colors.bg.raised,
                  border: `1px solid ${v.status === "published" ? "rgba(34,197,94,0.18)" : colors.border.subtle}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <IconComp size={18} style={{ color: iconColor }} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontWeight: fonts.weight.bold, color: colors.text.primary, fontSize: fonts.size.sm }}>{v.label}</span>
                    <Badge variant={statusVariant[v.status]}>{v.status}</Badge>
                    {v.conflicts > 0 && <Badge variant="danger">{v.conflicts} conflicts</Badge>}
                  </div>
                  <div style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>
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
          );
        })}
      </div>
    </div>
  );
}
