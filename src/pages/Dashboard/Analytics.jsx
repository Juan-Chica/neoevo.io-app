import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Analytics() {
  const [bookings, setBookings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      const [{ data: bookingsData, error: bookingsError }, { data: projectsData, error: projectsError }] =
        await Promise.all([
          supabase
            .from("bookings")
            .select(`
              *,
              services (
                name,
                price_starting
              )
            `),
          supabase.from("projects").select("*"),
        ]);

      if (bookingsError) console.error(bookingsError);
      if (projectsError) console.error(projectsError);

      setBookings(bookingsData || []);
      setProjects(projectsData || []);
      setLoading(false);
    }

    fetchAnalytics();
  }, []);

  const analytics = useMemo(() => {
    const completedBookings = bookings.filter((b) => b.status === "completed");
    const completedProjects = projects.filter((p) => p.status === "completed");

    const estimatedBookingRevenue = completedBookings.reduce((total, booking) => {
      return total + (booking.services?.price_starting || 0);
    }, 0);

    const completedProjectRevenue = completedProjects.reduce((total, project) => {
      return total + (project.price || 0);
    }, 0);

    const pipelineValue = projects
      .filter((project) => project.status !== "completed")
      .reduce((total, project) => total + (project.price || 0), 0);

    const projectStatusCounts = {
      lead: projects.filter((p) => p.status === "lead").length,
      planning: projects.filter((p) => p.status === "planning").length,
      in_progress: projects.filter((p) => p.status === "in_progress").length,
      review: projects.filter((p) => p.status === "review").length,
      completed: projects.filter((p) => p.status === "completed").length,
    };

    const serviceCounts = {};

    bookings.forEach((booking) => {
      const serviceName = booking.services?.name || "Unknown";
      serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
    });

    const topService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      totalBookings: bookings.length,
      pendingBookings: bookings.filter((b) => b.status === "pending").length,
      confirmedBookings: bookings.filter((b) => b.status === "confirmed").length,
      completedBookings: completedBookings.length,
      cancelledBookings: bookings.filter((b) => b.status === "cancelled").length,

      totalProjects: projects.length,
      completedProjects: completedProjects.length,
      pipelineValue,
      estimatedBookingRevenue,
      completedProjectRevenue,

      projectStatusCounts,

      topService: topService ? topService[0] : "No data",
      topServiceCount: topService ? topService[1] : 0,
    };
  }, [bookings, projects]);

  if (loading) return <div className="p-10">Loading analytics...</div>;

  return (
    <div className="p-6 md:p-10">
      <div className="mb-10">
        <p className="font-semibold text-green-400">NeoEvo Admin</p>
        <h1 className="mt-2 text-4xl font-bold">Analytics</h1>
        <p className="mt-2 text-gray-400">
          Track bookings, projects, pipeline value, and estimated revenue.
        </p>
      </div>

      <h2 className="mb-4 text-2xl font-bold">Booking Metrics</h2>
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Bookings" value={analytics.totalBookings} />
        <StatCard label="Pending" value={analytics.pendingBookings} color="text-yellow-300" />
        <StatCard label="Confirmed" value={analytics.confirmedBookings} color="text-blue-300" />
        <StatCard label="Completed" value={analytics.completedBookings} color="text-green-300" />
        <StatCard label="Cancelled" value={analytics.cancelledBookings} color="text-red-300" />
      </div>

      <h2 className="mb-4 text-2xl font-bold">Project Pipeline</h2>
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Projects" value={analytics.totalProjects} />
        <StatCard label="Lead" value={analytics.projectStatusCounts.lead} color="text-yellow-300" />
        <StatCard label="Planning" value={analytics.projectStatusCounts.planning} color="text-blue-300" />
        <StatCard label="In Progress" value={analytics.projectStatusCounts.in_progress} color="text-purple-300" />
        <StatCard label="Review" value={analytics.projectStatusCounts.review} color="text-orange-300" />
        <StatCard label="Completed" value={analytics.projectStatusCounts.completed} color="text-green-300" />
        <StatCard label="Pipeline Value" value={`$${analytics.pipelineValue}`} color="text-green-400" />
        <StatCard label="Completed Project Revenue" value={`$${analytics.completedProjectRevenue}`} color="text-green-400" />
      </div>

      <h2 className="mb-4 text-2xl font-bold">Sales Signals</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          label="Estimated Booking Revenue"
          value={`$${analytics.estimatedBookingRevenue}`}
          color="text-green-400"
        />
        <StatCard label="Top Requested Service" value={analytics.topService} />
        <StatCard label="Top Service Bookings" value={analytics.topServiceCount} />
      </div>
    </div>
  );
}

function StatCard({ label, value, color = "text-white" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0f1c24] p-5 transition hover:border-green-400/30 hover:bg-white/[0.03]">
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}