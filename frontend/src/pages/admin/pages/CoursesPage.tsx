import { useState, useEffect } from "react";
import { Card, Badge, DataTable, SearchInput, Button, Loader, PageHeader } from "../../../shared";
import { fetchCourses } from "../../../features/admin/services";
import { colors, fonts } from "../../../styles/tokens";
import { Plus } from "lucide-react";

const statusVariant = { active: "success", draft: "neutral", archived: "warning" };

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCourses().then((res) => { setCourses(res); setLoading(false); });
  }, []);

  const filtered = courses.filter((c) =>
    search === "" ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.department.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "id", label: "Code",
      render: (val) => <span style={{ color: colors.primary.main, fontWeight: fonts.weight.semibold }}>{val}</span>,
    },
    { key: "name", label: "Course Name" },
    {
      key: "department", label: "Dept",
      render: (val) => <Badge variant="purple">{val}</Badge>,
    },
    { key: "credits", label: "Credits", align: "center" },
    { key: "faculty", label: "Faculty" },
    { key: "semester", label: "Sem", align: "center" },
    { key: "students", label: "Students", align: "center" },
    {
      key: "status", label: "Status",
      render: (val) => <Badge variant={statusVariant[val] || "neutral"}>{val}</Badge>,
    },
  ];

  if (loading) return <Loader />;

  return (
    <div>
      {/* WHY: Replaced inline flex wrapper + h1+p with shared PageHeader, passing action prop */}
      <PageHeader
        title="Courses"
        subtitle={`${courses.length} courses registered`}
        action={<Button variant="primary" icon={<Plus size={14} />}>Add Course</Button>}
      />

      <div style={{ marginBottom: "16px", maxWidth: "320px" }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search courses..." />
      </div>

      <Card style={{ padding: "16px" }} hover={false}>
        <DataTable columns={columns} data={filtered} emptyMessage="No courses found" />
      </Card>
    </div>
  );
}
