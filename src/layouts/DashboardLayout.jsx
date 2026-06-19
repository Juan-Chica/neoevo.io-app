import { Link, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function DashboardLayout() {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-[#071017] text-white">
      <div className="flex">
        <aside className="hidden min-h-screen w-64 border-r border-white/10 bg-[#0f1c24] p-6 md:block">
          <h2 className="text-2xl font-bold">NeoEvo</h2>
          <p className="mt-1 text-sm text-gray-400">Admin Dashboard</p>

          <nav className="mt-10 space-y-3">
            <Link
              className="block rounded-lg px-4 py-3 hover:bg-white/10"
              to="/dashboard/bookings"
            >
              Bookings
            </Link>

            <Link
              className="block rounded-lg px-4 py-3 hover:bg-white/10"
              to="/dashboard/services"
            >
              Services
            </Link>

            <Link
              className="block rounded-lg px-4 py-3 hover:bg-white/10"
              to="/dashboard/availability"
            >
              Availability
            </Link>

            <Link
              className="block rounded-lg px-4 py-3 hover:bg-white/10"
              to="/dashboard/settings"
            >
              Settings
            </Link>

            <Link
              className="block rounded-lg px-4 py-3 hover:bg-white/10"
              to="/dashboard/clients"
            >
              Clients
            </Link>

            <Link
              className="block rounded-lg px-4 py-3 hover:bg-white/10"
              to="/dashboard/analytics"
            >
              Analytics
            </Link>

            <Link
              className="block rounded-lg px-4 py-3 hover:bg-white/10"
              to="/dashboard/projects"
            >
              Projects
            </Link>

            <Link
              className="block rounded-lg px-4 py-3 hover:bg-white/10"
              to="/dashboard/notes"
            >
              Notes
            </Link>

            <Link
              className="block rounded-lg px-4 py-3 hover:bg-white/10"
              to="/dashboard/files"
            >
              Files
            </Link>

            <Link
              className="block rounded-lg px-4 py-3 hover:bg-white/10"
              to="/dashboard/tasks"
            >
              Tasks
            </Link>

            <Link
              className="block rounded-lg px-4 py-3 hover:bg-white/10"
              to="/dashboard/kanban"
            >
              Kanban
            </Link>
            
            <Link
              className="block rounded-lg px-4 py-3 hover:bg-white/10"
              to="/dashboard/calendar"
            >
              Calendar
            </Link>
          </nav>

          <Link
            to="/"
            className="mt-10 block rounded-lg border border-white/10 px-4 py-3 text-center text-sm hover:bg-white/10"
          >
            Back to Website
          </Link>
          <button
            onClick={handleLogout}
            className="mt-4 w-full rounded-lg border border-red-500 px-4 py-3 text-red-400 hover:bg-red-500/10"
          >
            Logout
          </button>
        </aside>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
