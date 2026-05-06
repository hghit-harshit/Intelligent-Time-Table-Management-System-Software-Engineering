import { useState, useEffect } from "react";
import { Card, Button, Loader, PageHeader, Badge } from "../../../shared";
import { colors, fonts, radius } from "../../../styles/tokens";
import { Plus, Trash2, Edit2, CheckCircle, Circle, Clock, X, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string;
  courseId: string | null;
  dueDate: string | null;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "completed";
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const priorityColors = { low: "#22c55e", medium: "#eab308", high: "#ef4444" };
const statusIcons = { "todo": Circle, "in-progress": Clock, "completed": CheckCircle };

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [formData, setFormData] = useState({ title: "", description: "", dueDate: "", priority: "medium" as const });

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/workspace/tasks", { headers: { "Authorization": `Bearer ${localStorage.getItem("accessToken")}` } });
      const data = await res.json();
      if (res.ok) setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      const method = editingTask ? "PATCH" : "POST";
      const url = editingTask ? `/api/workspace/tasks/${editingTask.id}` : "/api/workspace/tasks";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("accessToken")}` },
        body: JSON.stringify({ ...formData, dueDate: formData.dueDate || null }),
      });

      if (res.ok) {
        toast.success(editingTask ? "Task updated" : "Task created");
        setFormData({ title: "", description: "", dueDate: "", priority: "medium" });
        setShowForm(false);
        setEditingTask(null);
        fetchTasks();
      } else {
        toast.error("Failed to save task");
      }
    } catch (error) {
      toast.error("Failed to save task");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/workspace/tasks/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("accessToken")}` },
      });
      if (res.ok) {
        toast.success("Task deleted");
        fetchTasks();
      }
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === "completed" ? "todo" : "completed";
    try {
      const res = await fetch(`/api/workspace/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("accessToken")}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchTasks();
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({ title: task.title, description: task.description, dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "", priority: task.priority });
    setShowForm(true);
  };

  const filteredTasks = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (a.status !== "completed" && b.status === "completed") return -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const counts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    "in-progress": tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  if (loading) return <Loader />;

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle="Track your assignments and to-dos"
        action={
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => { setShowForm(true); setEditingTask(null); setFormData({ title: "", description: "", dueDate: "", priority: "medium" }); }}>
            New Task
          </Button>
        }
      />

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {(["all", "todo", "in-progress", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 14px",
              borderRadius: radius.full,
              border: `1px solid ${filter === f ? colors.primary.border : colors.border.subtle}`,
              background: filter === f ? colors.primary.ghost : "transparent",
              color: filter === f ? colors.primary.main : colors.text.muted,
              fontSize: fonts.size.xs,
              fontWeight: filter === f ? fonts.weight.semibold : fonts.weight.regular,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {f === "all" ? "All" : f} ({counts[f]})
          </button>
        ))}
      </div>

      {showForm && (
        <Card style={{ padding: "20px", marginBottom: "20px" }} hover={false}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: fonts.size.md, fontFamily: fonts.heading }}>
              {editingTask ? "Edit Task" : "New Task"}
            </h3>
            <button onClick={() => { setShowForm(false); setEditingTask(null); }} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
              <X size={18} style={{ color: colors.text.muted }} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              type="text"
              placeholder="Task title"
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
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
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
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Calendar size={14} style={{ color: colors.text.muted }} />
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  style={{
                    padding: "6px 10px",
                    border: `1px solid ${colors.border.subtle}`,
                    borderRadius: radius.md,
                    fontSize: fonts.size.xs,
                    fontFamily: fonts.body,
                    background: colors.bg.base,
                    color: colors.text.primary,
                    outline: "none",
                  }}
                />
              </div>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as "low" | "medium" | "high" })}
                style={{
                  padding: "6px 10px",
                  border: `1px solid ${colors.border.subtle}`,
                  borderRadius: radius.md,
                  fontSize: fonts.size.xs,
                  fontFamily: fonts.body,
                  background: colors.bg.base,
                  color: colors.text.primary,
                  outline: "none",
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <div style={{ flex: 1 }} />
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingTask(null); }}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSubmit}>{editingTask ? "Update" : "Create"}</Button>
            </div>
          </div>
        </Card>
      )}

      {sortedTasks.length === 0 ? (
        <Card style={{ padding: "40px", textAlign: "center" }} hover={false}>
          <div style={{ fontSize: fonts.size.sm, color: colors.text.muted }}>
            {filter !== "all" ? `No ${filter} tasks.` : "No tasks yet. Create your first task!"}
          </div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {sortedTasks.map((task) => {
            const StatusIcon = statusIcons[task.status];
            return (
              <Card key={task.id} style={{ padding: "14px 16px", opacity: task.status === "completed" ? 0.55 : 1 }} hover={false}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button
                    onClick={() => handleToggleStatus(task)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "0", display: "flex" }}
                  >
                    <StatusIcon size={18} style={{ color: task.status === "completed" ? "#22c55e" : colors.text.muted }} />
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          fontSize: fonts.size.sm,
                          fontWeight: fonts.weight.medium,
                          textDecoration: task.status === "completed" ? "line-through" : "none",
                          color: task.status === "completed" ? colors.text.muted : colors.text.primary,
                        }}
                      >
                        {task.title}
                      </span>
                      <Badge
                        variant={task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : "success"}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    {task.description && (
                      <p style={{
                        margin: "4px 0 0",
                        fontSize: fonts.size.xs,
                        color: colors.text.muted,
                        textDecoration: task.status === "completed" ? "line-through" : "none",
                      }}>
                        {task.description}
                      </p>
                    )}
                    {task.dueDate && (
                      <div style={{
                        fontSize: fonts.size.xs,
                        color: colors.text.muted,
                        marginTop: "4px",
                        textDecoration: task.status === "completed" ? "line-through" : "none",
                      }}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button onClick={() => handleEdit(task)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                      <Edit2 size={14} style={{ color: colors.text.muted }} />
                    </button>
                    <button onClick={() => handleDelete(task.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                      <Trash2 size={14} style={{ color: "#ef4444" }} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
