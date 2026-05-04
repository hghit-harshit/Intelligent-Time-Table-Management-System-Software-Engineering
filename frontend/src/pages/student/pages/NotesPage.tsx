import { useState, useEffect } from "react";
import { Card, Button, Loader, PageHeader } from "../../../shared";
import { colors, fonts, radius } from "../../../styles/tokens";
import { Plus, Trash2, Edit2, Search, X, Pin } from "lucide-react";
import { toast } from "sonner";
import { withAuthHeaders } from "../../../services/authInterceptor";

interface Note {
  id: string;
  title: string;
  content: string;
  courseId: string | null;
  tags: string[];
  color: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({ title: "", content: "", color: "#3b82f6", pinned: false });

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/workspace/notes", { headers: withAuthHeaders() });
      const data = await res.json();
      if (res.ok) setNotes(data);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      const method = editingNote ? "PATCH" : "POST";
      const url = editingNote ? `/api/workspace/notes/${editingNote.id}` : "/api/workspace/notes";
      const res = await fetch(url, {
        method,
        headers: withAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(editingNote ? "Note updated" : "Note created");
        setFormData({ title: "", content: "", color: "#3b82f6", pinned: false });
        setShowForm(false);
        setEditingNote(null);
        fetchNotes();
      } else {
        toast.error("Failed to save note");
      }
    } catch (error) {
      toast.error("Failed to save note");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/workspace/notes/${id}`, {
        method: "DELETE",
        headers: withAuthHeaders(),
      });
      if (res.ok) {
        toast.success("Note deleted");
        fetchNotes();
      }
    } catch (error) {
      toast.error("Failed to delete note");
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({ title: note.title, content: note.content, color: note.color, pinned: note.pinned });
    setShowForm(true);
  };

  const handleTogglePin = async (note: Note) => {
    try {
      const res = await fetch(`/api/workspace/notes/${note.id}`, {
        method: "PATCH",
        headers: withAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ pinned: !note.pinned }),
      });
      if (res.ok) fetchNotes();
    } catch (error) {
      toast.error("Failed to update note");
    }
  };

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return <Loader />;

  return (
    <div>
      <PageHeader
        title="My Notes"
        subtitle="Organize your study notes and ideas"
        action={
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => { setShowForm(true); setEditingNote(null); setFormData({ title: "", content: "", color: "#3b82f6", pinned: false }); }}>
            New Note
          </Button>
        }
      />

      {showForm && (
        <Card style={{ padding: "20px", marginBottom: "20px" }} hover={false}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: fonts.size.md, fontFamily: fonts.heading }}>
              {editingNote ? "Edit Note" : "New Note"}
            </h3>
            <button onClick={() => { setShowForm(false); setEditingNote(null); }} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
              <X size={18} style={{ color: colors.text.muted }} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              type="text"
              placeholder="Note title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{
                padding: "10px 12px",
                border: `1px solid ${colors.border.subtle}`,
                borderRadius: radius.md,
                fontSize: fonts.size.sm,
                fontFamily: fonts.body,
                background: colors.bg.base,
                color: colors.text.primary,
                outline: "none",
              }}
            />
            <textarea
              placeholder="Write your note..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              style={{
                padding: "10px 12px",
                border: `1px solid ${colors.border.subtle}`,
                borderRadius: radius.md,
                fontSize: fonts.size.sm,
                fontFamily: fonts.body,
                background: colors.bg.base,
                color: colors.text.primary,
                outline: "none",
                resize: "vertical",
              }}
            />
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <label style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>Color:</label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                style={{ width: "32px", height: "32px", border: "none", cursor: "pointer", background: "none" }}
              />
              <button
                onClick={() => setFormData({ ...formData, pinned: !formData.pinned })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  background: formData.pinned ? colors.primary.ghost : "none",
                  border: `1px solid ${formData.pinned ? colors.primary.border : colors.border.subtle}`,
                  borderRadius: radius.md,
                  padding: "6px 10px",
                  cursor: "pointer",
                  color: formData.pinned ? colors.primary.main : colors.text.muted,
                  fontSize: fonts.size.xs,
                }}
              >
                <Pin size={12} /> {formData.pinned ? "Pinned" : "Pin"}
              </button>
              <div style={{ flex: 1 }} />
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingNote(null); }}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSubmit}>{editingNote ? "Update" : "Create"}</Button>
            </div>
          </div>
        </Card>
      )}

      <div style={{ position: "relative", marginBottom: "16px" }}>
        <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: colors.text.muted }} />
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px 10px 40px",
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: radius.md,
            fontSize: fonts.size.sm,
            fontFamily: fonts.body,
            background: colors.bg.base,
            color: colors.text.primary,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {filteredNotes.length === 0 ? (
        <Card style={{ padding: "40px", textAlign: "center" }} hover={false}>
          <div style={{ fontSize: fonts.size.sm, color: colors.text.muted }}>
            {searchQuery ? "No notes match your search." : "No notes yet. Create your first note!"}
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
          {filteredNotes.map((note) => (
            <Card key={note.id} style={{ padding: "16px", borderTop: `3px solid ${note.color}` }} hover={false}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <h4 style={{ margin: 0, fontSize: fonts.size.sm, fontWeight: fonts.weight.semibold, flex: 1 }}>
                  {note.pinned && <Pin size={12} style={{ color: colors.primary.main, marginRight: "4px" }} />}
                  {note.title}
                </h4>
                <div style={{ display: "flex", gap: "4px" }}>
                  <button onClick={() => handleTogglePin(note)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                    <Pin size={14} style={{ color: note.pinned ? colors.primary.main : colors.text.muted }} />
                  </button>
                  <button onClick={() => handleEdit(note)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                    <Edit2 size={14} style={{ color: colors.text.muted }} />
                  </button>
                  <button onClick={() => handleDelete(note.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                    <Trash2 size={14} style={{ color: "#ef4444" }} />
                  </button>
                </div>
              </div>
              {note.content && (
                <p style={{ margin: "0 0 12px", fontSize: fonts.size.xs, color: colors.text.secondary, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                  {note.content.length > 200 ? note.content.slice(0, 200) + "..." : note.content}
                </p>
              )}
              {note.tags.length > 0 && (
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                  {note.tags.map((tag, i) => (
                    <span key={i} style={{ fontSize: fonts.size.xs, background: colors.bg.raised, padding: "2px 8px", borderRadius: radius.full, color: colors.text.muted }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginTop: "8px" }}>
                {new Date(note.updatedAt).toLocaleDateString()}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
