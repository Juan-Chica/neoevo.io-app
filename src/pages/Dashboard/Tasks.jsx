import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const emptyTask = {
  title: "",
  due_date: "",
  related_email: "",
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState(emptyTask);
  const [loading, setLoading] = useState(true);

  async function fetchTasks() {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setTasks(data || []);

    setLoading(false);
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function addTask(e) {
    e.preventDefault();

    const { error } = await supabase.from("tasks").insert([newTask]);

    if (error) {
      console.error(error);
      return;
    }

    setNewTask(emptyTask);
    fetchTasks();
  }

  async function toggleTask(task) {
    const { error } = await supabase
      .from("tasks")
      .update({
        completed: !task.completed,
      })
      .eq("id", task.id);

    if (!error) fetchTasks();
  }

  async function deleteTask(id) {
    if (!window.confirm("Delete this task?")) return;

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    if (!error) fetchTasks();
  }

  if (loading) return <div className="p-10">Loading tasks...</div>;

  return (
    <div className="p-6 md:p-10">
      <div className="mb-10">
        <p className="font-semibold text-green-400">NeoEvo Admin</p>
        <h1 className="mt-2 text-4xl font-bold">Tasks</h1>
        <p className="mt-2 text-gray-400">
          Keep track of client work and reminders.
        </p>
      </div>

      <form
        onSubmit={addTask}
        className="mb-8 rounded-2xl border border-white/10 bg-[#0f1c24] p-6"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <input
            required
            placeholder="Task"
            value={newTask.title}
            onChange={(e) =>
              setNewTask({
                ...newTask,
                title: e.target.value,
              })
            }
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
          />

          <input
            type="date"
            value={newTask.due_date}
            onChange={(e) =>
              setNewTask({
                ...newTask,
                due_date: e.target.value,
              })
            }
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
          />

          <input
            placeholder="Client email"
            value={newTask.related_email}
            onChange={(e) =>
              setNewTask({
                ...newTask,
                related_email: e.target.value,
              })
            }
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
          />
        </div>

        <button className="mt-5 rounded-lg bg-green-400 px-5 py-2 font-semibold text-black">
          Add Task
        </button>
      </form>

      <div className="grid gap-5">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="rounded-2xl border border-white/10 bg-[#0f1c24] p-6 flex justify-between items-center"
          >
            <div>
              <h2
                className={`text-xl font-bold ${
                  task.completed ? "line-through text-gray-500" : ""
                }`}
              >
                {task.title}
              </h2>

              <p className="text-gray-400">
                {task.related_email || "No client"}
              </p>

              <p className="text-sm text-gray-500">
                Due: {task.due_date || "No date"}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => toggleTask(task)}
                className="rounded-lg bg-green-400 px-4 py-2 font-semibold text-black"
              >
                {task.completed ? "Undo" : "Complete"}
              </button>

              <button
                onClick={() => deleteTask(task.id)}
                className="rounded-lg bg-red-500 px-4 py-2 font-semibold text-white"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}