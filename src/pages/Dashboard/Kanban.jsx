import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const columns = [
  { key: "lead", label: "Lead" },
  { key: "planning", label: "Planning" },
  { key: "in_progress", label: "In Progress" },
  { key: "review", label: "Review" },
  { key: "completed", label: "Completed" },
];

export default function Kanban() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setProjects(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  async function moveProject(projectId, newStatus) {
    const { error } = await supabase
      .from("projects")
      .update({ status: newStatus })
      .eq("id", projectId);

    if (error) {
      console.error(error);
      return;
    }

    fetchProjects();
  }

  if (loading) return <div className="p-10">Loading kanban...</div>;

  return (
    <div className="p-6 md:p-10">
      <div className="mb-10">
        <p className="font-semibold text-green-400">NeoEvo Admin</p>
        <h1 className="mt-2 text-4xl font-bold">Kanban</h1>
        <p className="mt-2 text-gray-400">
          Move projects through your sales and delivery pipeline.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-5">
        {columns.map((column) => {
          const columnProjects = projects.filter(
            (project) => project.status === column.key
          );

          return (
            <div
              key={column.key}
              className="min-h-[500px] rounded-2xl border border-white/10 bg-[#0f1c24] p-4"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-bold">{column.label}</h2>
                <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-gray-300">
                  {columnProjects.length}
                </span>
              </div>

              <div className="grid gap-4">
                {columnProjects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-xl border border-white/10 bg-[#071017] p-4"
                  >
                    <h3 className="font-bold">{project.client_name}</h3>
                    <p className="text-sm text-gray-400">
                      {project.service_name || "No service"}
                    </p>

                    <p className="mt-3 font-semibold text-green-400">
                      ${project.price || 0}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Due: {project.due_date || "No due date"}
                    </p>

                    <select
                      value={project.status}
                      onChange={(e) =>
                        moveProject(project.id, e.target.value)
                      }
                      className="mt-4 w-full rounded-lg border border-white/10 bg-[#0f1c24] px-3 py-2 text-sm text-white"
                    >
                      {columns.map((option) => (
                        <option key={option.key} value={option.key}>
                          Move to {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}