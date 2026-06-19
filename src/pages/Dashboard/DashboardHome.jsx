import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function DashboardHome() {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchDashboardData() {
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select(`
        *,
        services (
          name,
          price_starting
        )
      `)
      .order("created_at", { ascending: false });

    const { data: servicesData } = await supabase
      .from("services")
      .select("*");

    setBookings(bookingsData || []);
    setServices(servicesData || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = useMemo(() => {
    return {
      totalBookings: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
      activeServices: services.filter((s) => s.active).length,
    };
  }, [bookings, services]);

  const recentBookings = bookings.slice(0, 5);

  function formatDate(date) {
    if (!date) return "No date";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatTime(time) {
    if (!time) return "No time";

    const [hour, minute] = time.split(":");
    const date = new Date();
    date.setHours(Number(hour), Number(minute), 0, 0);

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

  if (loading) {
    return <div className="p-10">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 md:p-10">
      <div className="mb-10">
        <p className="font-semibold text-green-400">NeoEvo Admin</p>
        <h1 className="mt-2 text-4xl font-bold">Dashboard</h1>
        <p className="mt-2 text-gray-400">
          Overview of bookings, services, and activity.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <StatCard label="Total" value={stats.totalBookings} color="text-white" />
        <StatCard label="Pending" value={stats.pending} color="text-yellow-300" />
        <StatCard label="Confirmed" value={stats.confirmed} color="text-blue-300" />
        <StatCard label="Completed" value={stats.completed} color="text-green-300" />
        <StatCard label="Cancelled" value={stats.cancelled} color="text-red-300" />
        <StatCard label="Services" value={stats.activeServices} color="text-green-400" />
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 bg-[#0f1c24] p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Recent Bookings</h2>
            <p className="text-gray-400">Latest consultation requests.</p>
          </div>

          <a
            href="/dashboard/bookings"
            className="rounded-lg bg-green-400 px-4 py-2 font-semibold text-black"
          >
            View All
          </a>
        </div>

        {recentBookings.length === 0 ? (
          <p className="text-gray-400">No recent bookings yet.</p>
        ) : (
          <div className="grid gap-4">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-[#071017] p-4 md:flex-row md:items-center"
              >
                <div>
                  <h3 className="font-bold">{booking.customer_name}</h3>
                  <p className="text-sm text-gray-400">
                    {booking.customer_email}
                  </p>
                </div>

                <div className="md:text-right">
                  <p className="text-sm text-gray-400">
                    {formatDate(booking.booking_date)} • {formatTime(booking.booking_time)}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color = "text-white" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0f1c24] p-5 transition hover:border-green-400/30 hover:bg-white/[0.03]">
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}