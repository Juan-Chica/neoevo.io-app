import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  async function fetchBookings() {
    setLoading(true);

    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        services (
          name,
          price_starting,
          duration_minutes
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading bookings:", error);
      setLoading(false);
      return;
    }

    setBookings(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  const stats = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    }),
    [bookings],
  );

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      const searchText = `
        ${booking.customer_name}
        ${booking.customer_email}
        ${booking.customer_phone}
        ${booking.services?.name}
      `.toLowerCase();

      return matchesStatus && searchText.includes(search.toLowerCase());
    });
  }, [bookings, statusFilter, search]);

  async function updateStatus(id, status) {
    await supabase.from("bookings").update({ status }).eq("id", id);
    fetchBookings();
  }

  async function deleteBooking(id) {
    if (!window.confirm("Delete this booking?")) return;
    await supabase.from("bookings").delete().eq("id", id);
    fetchBookings();
  }

  function formatDate(date) {
    return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatTime(time) {
    const [hour, minute] = time.split(":");
    const date = new Date();
    date.setHours(Number(hour), Number(minute));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function statusClass(status) {
    const styles = {
      pending: "border-yellow-400/30 bg-yellow-400/10 text-yellow-300",
      confirmed: "border-blue-400/30 bg-blue-400/10 text-blue-300",
      completed: "border-green-400/30 bg-green-400/10 text-green-300",
      cancelled: "border-red-400/30 bg-red-400/10 text-red-300",
    };

    return styles[status] || "border-white/10 bg-white/10 text-gray-300";
  }

  const filters = ["all", "pending", "confirmed", "completed", "cancelled"];

  if (loading) return <div className="p-10">Loading bookings...</div>;

  return (
    <div className="p-6 md:p-10">
      <div className="mb-10">
        <p className="text-green-400 font-semibold">NeoEvo Admin</p>
        <h1 className="text-4xl font-bold mt-2">Bookings Dashboard</h1>
        <p className="text-gray-400 mt-2">
          Manage consultation requests, status, and client details.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total" value={stats.total} color="text-white" />
        <StatCard label="Pending" value={stats.pending} color="text-yellow-300" />
        <StatCard label="Confirmed" value={stats.confirmed} color="text-blue-300" />
        <StatCard label="Completed" value={stats.completed} color="text-green-300" />
        <StatCard label="Cancelled" value={stats.cancelled} color="text-red-300" />
      </div>

      <div className="bg-[#0f1c24] border border-white/10 rounded-2xl p-4 mb-8">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone, or service..."
          className="w-full bg-[#071017] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-green-400"
        />

        <div className="flex flex-wrap gap-3 mt-4">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-full border capitalize ${
                statusFilter === filter
                  ? "bg-green-400 text-black border-green-400"
                  : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5">
        {filteredBookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-[#0f1c24] border border-white/10 rounded-2xl p-6 transition hover:border-green-400/30 hover:bg-white/[0.03]"
          >
            <div className="flex flex-col lg:flex-row lg:justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold">{booking.customer_name}</h2>
                <p className="text-gray-400">{booking.customer_email}</p>
                <p className="text-gray-400">{booking.customer_phone}</p>
              </div>

              <div className="lg:text-right">
                <p className="font-semibold text-lg">
                  {booking.services?.name}
                </p>
                <p className="text-gray-400">
                  {formatDate(booking.booking_date)} •{" "}
                  {formatTime(booking.booking_time)}
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusClass(
                    booking.status,
                  )}`}
                >
                  {booking.status}
                </span>
              </div>
            </div>

            {booking.notes && (
              <div className="mt-5 bg-black/20 border border-white/10 rounded-xl p-4">
                <p className="text-sm text-gray-500">Notes</p>
                <p className="text-gray-300">{booking.notes}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-3 mt-5">
              <button
                onClick={() => updateStatus(booking.id, "confirmed")}
                className="bg-green-400 text-black px-4 py-2 rounded-lg font-semibold"
              >
                ✓ Confirm
              </button>
              <button
                onClick={() => updateStatus(booking.id, "completed")}
                className="bg-blue-400 text-black px-4 py-2 rounded-lg font-semibold"
              >
                ✓ Complete
              </button>
              <button
                onClick={() => updateStatus(booking.id, "cancelled")}
                className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold"
              >
                ✕ Cancel
              </button>
              <button
                onClick={() => deleteBooking(booking.id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold"
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

function StatCard({ label, value, color = "text-white" }) {
  return (
    <div className="bg-[#0f1c24] border border-white/10 rounded-2xl p-5 transition hover:border-green-400/30 hover:bg-white/[0.03]">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );
}
