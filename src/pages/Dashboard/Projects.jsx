import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const emptyProject = {
  client_name: "",
  client_email: "",
  service_name: "",
  price: "",
  status: "lead",
  due_date: "",
  website_url: "",
  notes: "",
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState(emptyProject);
  const [loading, setLoading] = useState(true);

  async function fetchProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setProjects(data || []);

    setLoading(false);
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  async function addProject(e) {
    e.preventDefault();

    const { error } = await supabase.from("projects").insert([
      {
        ...newProject,
        price: newProject.price ? Number(newProject.price) : null,
      },
    ]);

    if (error) {
      console.error(error);
      return;
    }

    setNewProject(emptyProject);
    fetchProjects();
  }

  async function updateProject(id, field, value) {
    const { error } = await supabase
      .from("projects")
      .update({ [field]: value })
      .eq("id", id);

    if (error) console.error(error);
    else fetchProjects();
  }

  async function deleteProject(id) {
    if (!window.confirm("Delete this project?")) return;

    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) console.error(error);
    else fetchProjects();
  }

  if (loading) return <div className="p-10">Loading projects...</div>;

  return (
    <div className="p-6 md:p-10">
      <div className="mb-10">
        <p className="font-semibold text-green-400">NeoEvo Admin</p>
        <h1 className="mt-2 text-4xl font-bold">Projects</h1>
        <p className="mt-2 text-gray-400">
          Track client work, status, due dates, and project value.
        </p>
      </div>

      <form
        onSubmit={addProject}
        className="mb-8 rounded-2xl border border-white/10 bg-[#0f1c24] p-6"
      >
        <h2 className="mb-5 text-2xl font-bold">Add Project</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            required
            placeholder="Client name"
            value={newProject.client_name}
            onChange={(e) =>
              setNewProject({ ...newProject, client_name: e.target.value })
            }
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
          />

          <input
            placeholder="Client email"
            value={newProject.client_email}
            onChange={(e) =>
              setNewProject({ ...newProject, client_email: e.target.value })
            }
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
          />

          <input
            placeholder="Service name"
            value={newProject.service_name}
            onChange={(e) =>
              setNewProject({ ...newProject, service_name: e.target.value })
            }
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
          />

          <input
            type="number"
            placeholder="Price"
            value={newProject.price}
            onChange={(e) =>
              setNewProject({ ...newProject, price: e.target.value })
            }
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
          />

          <select
            value={newProject.status}
            onChange={(e) =>
              setNewProject({ ...newProject, status: e.target.value })
            }
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
          >
            <option value="lead">Lead</option>
            <option value="planning">Planning</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>

          <input
            type="date"
            value={newProject.due_date}
            onChange={(e) =>
              setNewProject({ ...newProject, due_date: e.target.value })
            }
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
          />

          <input
            placeholder="Website URL"
            value={newProject.website_url}
            onChange={(e) =>
              setNewProject({ ...newProject, website_url: e.target.value })
            }
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white md:col-span-2"
          />

          <textarea
            placeholder="Notes"
            value={newProject.notes}
            onChange={(e) =>
              setNewProject({ ...newProject, notes: e.target.value })
            }
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white md:col-span-2"
          />
        </div>

        <button className="mt-5 rounded-lg bg-green-400 px-5 py-2 font-semibold text-black">
          Add Project
        </button>
      </form>

      <div className="grid gap-5">
        {projects.map((project) => (
          <div
            key={project.id}
            className="rounded-2xl border border-white/10 bg-[#0f1c24] p-6"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold">{project.client_name}</h2>
                <p className="text-gray-400">{project.client_email}</p>
                <p className="mt-2 font-semibold">{project.service_name}</p>
              </div>

              <div className="lg:text-right">
                <p className="text-2xl font-bold text-green-400">
                  ${project.price || 0}
                </p>

                <select
                  value={project.status}
                  onChange={(e) =>
                    updateProject(project.id, "status", e.target.value)
                  }
                  className="mt-2 rounded-xl border border-white/10 bg-[#071017] px-4 py-2 text-white"
                >
                  <option value="lead">Lead</option>
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-gray-400 md:grid-cols-2">
              <p>Due date: {project.due_date || "No due date"}</p>
              <p>Website: {project.website_url || "No website URL"}</p>
            </div>

            {project.notes && (
              <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-gray-500">Notes</p>
                <p className="text-gray-300">{project.notes}</p>
              </div>
            )}

            <button
              onClick={() => deleteProject(project.id)}
              className="mt-5 rounded-lg bg-red-500 px-4 py-2 font-semibold text-white"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}