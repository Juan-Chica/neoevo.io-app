import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const emptyNote = {
  title: "",
  content: "",
  category: "general",
  related_email: "",
};

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState(emptyNote);
  const [loading, setLoading] = useState(true);

  async function fetchNotes() {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setNotes(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  async function addNote(e) {
    e.preventDefault();

    const { error } = await supabase.from("notes").insert([newNote]);

    if (error) {
      console.error(error);
      return;
    }

    setNewNote(emptyNote);
    fetchNotes();
  }

  async function deleteNote(id) {
    if (!window.confirm("Delete this note?")) return;

    const { error } = await supabase.from("notes").delete().eq("id", id);

    if (!error) fetchNotes();
  }

  if (loading) return <div className="p-10">Loading notes...</div>;

  return (
    <div className="p-6 md:p-10">
      <div className="mb-10">
        <p className="font-semibold text-green-400">NeoEvo Admin</p>
        <h1 className="mt-2 text-4xl font-bold">Notes</h1>
        <p className="mt-2 text-gray-400">
          Store client notes, meeting notes, and follow-up reminders.
        </p>
      </div>

      <form
        onSubmit={addNote}
        className="mb-8 rounded-2xl border border-white/10 bg-[#0f1c24] p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <input
            required
            placeholder="Note title"
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
          />

          <input
            placeholder="Related client email"
            value={newNote.related_email}
            onChange={(e) =>
              setNewNote({ ...newNote, related_email: e.target.value })
            }
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
          />

          <select
            value={newNote.category}
            onChange={(e) =>
              setNewNote({ ...newNote, category: e.target.value })
            }
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
          >
            <option value="general">General</option>
            <option value="client">Client</option>
            <option value="meeting">Meeting</option>
            <option value="follow_up">Follow Up</option>
          </select>

          <textarea
            placeholder="Note content"
            value={newNote.content}
            onChange={(e) =>
              setNewNote({ ...newNote, content: e.target.value })
            }
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white md:col-span-2"
            rows="4"
          />
        </div>

        <button className="mt-5 rounded-lg bg-green-400 px-5 py-2 font-semibold text-black">
          Add Note
        </button>
      </form>

      <div className="grid gap-5">
        {notes.map((note) => (
          <div
            key={note.id}
            className="rounded-2xl border border-white/10 bg-[#0f1c24] p-6"
          >
            <div className="flex justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{note.title}</h2>
                <p className="mt-1 text-sm capitalize text-green-400">
                  {note.category.replace("_", " ")}
                </p>
                {note.related_email && (
                  <p className="text-gray-400">{note.related_email}</p>
                )}
              </div>

              <button
                onClick={() => deleteNote(note.id)}
                className="h-fit rounded-lg bg-red-500 px-4 py-2 font-semibold text-white"
              >
                Delete
              </button>
            </div>

            {note.content && (
              <p className="mt-4 whitespace-pre-wrap text-gray-300">
                {note.content}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}