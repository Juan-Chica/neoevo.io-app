import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Availability() {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function fetchAvailability() {
    setLoading(true);

    const { data, error } = await supabase
      .from("availability")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      setMessage(error.message);
    } else {
      setAvailability(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchAvailability();
  }, []);

  function updateLocalDay(id, field, value) {
    setAvailability((current) =>
      current.map((day) => (day.id === id ? { ...day, [field]: value } : day))
    );
  }

  async function saveDay(day) {
    setMessage("");

    const { error } = await supabase
      .from("availability")
      .update({
        is_open: day.is_open,
        start_time: day.is_open ? day.start_time : null,
        end_time: day.is_open ? day.end_time : null,
      })
      .eq("id", day.id);

    if (error) {
      console.error(error);
      setMessage(error.message);
      return;
    }

    setMessage(`${day.day_of_week} updated successfully.`);
    fetchAvailability();
  }

  if (loading) return <div className="p-10">Loading availability...</div>;

  return (
    <div className="p-6 md:p-10">
      <div className="mb-10">
        <p className="text-green-400 font-semibold">NeoEvo Admin</p>
        <h1 className="mt-2 text-4xl font-bold">Availability</h1>
        <p className="mt-2 text-gray-400">
          Set the days and times customers can book consultations.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-green-400/20 bg-green-400/10 px-4 py-3 text-green-300">
          {message}
        </div>
      )}

      <div className="grid gap-5">
        {availability.map((day) => (
          <div
            key={day.id}
            className="rounded-2xl border border-white/10 bg-[#0f1c24] p-6"
          >
            <div className="grid gap-4 md:grid-cols-4 md:items-end">
              <div>
                <p className="text-sm text-gray-400">Day</p>
                <h2 className="mt-2 text-2xl font-bold">{day.day_of_week}</h2>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Status
                </label>
                <select
                  value={day.is_open ? "open" : "closed"}
                  onChange={(e) =>
                    updateLocalDay(day.id, "is_open", e.target.value === "open")
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Start Time
                </label>
                <input
                  type="time"
                  value={day.start_time || ""}
                  disabled={!day.is_open}
                  onChange={(e) =>
                    updateLocalDay(day.id, "start_time", e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white disabled:opacity-40"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  End Time
                </label>
                <input
                  type="time"
                  value={day.end_time || ""}
                  disabled={!day.is_open}
                  onChange={(e) =>
                    updateLocalDay(day.id, "end_time", e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white disabled:opacity-40"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-between">
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  day.is_open
                    ? "bg-green-400/10 text-green-300"
                    : "bg-red-400/10 text-red-300"
                }`}
              >
                {day.is_open ? "Available for booking" : "Closed"}
              </span>

              <button
                onClick={() => saveDay(day)}
                className="rounded-lg bg-green-400 px-5 py-2 font-semibold text-black"
              >
                Save
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}