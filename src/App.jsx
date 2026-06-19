import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Book from "./pages/Book";
import Bookings from "./pages/dashboard/Bookings";
import DashboardLayout from "./layouts/DashboardLayout";
import Services from "./pages/dashboard/Services";
import Availability from "./pages/dashboard/Availability";
import Settings from "./pages/dashboard/settings";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardHome from "./pages/dashboard/DashboardHome";
import Clients from "./pages/dashboard/Clients";
import Analytics from "./pages/dashboard/Analytics";
import Projects from "./pages/dashboard/Projects";
import Notes from "./pages/dashboard/Notes";
import Files from "./pages/dashboard/Files";
import ClientDetail from "./pages/dashboard/ClientDetail";
import Tasks from "./pages/dashboard/Tasks";
import Kanban from "./pages/dashboard/Kanban";
import Calendar from "./pages/dashboard/Calendar";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/book" element={<Book />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="services" element={<Services />} />
          <Route path="availability" element={<Availability />} />
          <Route path="settings" element={<Settings />} />
          <Route path="clients" element={<Clients />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="projects" element={<Projects />} />
          <Route path="notes" element={<Notes />} />
          <Route path="files" element={<Files />} />
          <Route path="clients/:email" element={<ClientDetail />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="kanban" element={<Kanban />} />
          <Route path="calendar" element={<Calendar />} />
        </Route>

        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
