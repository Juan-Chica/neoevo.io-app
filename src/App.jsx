import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Book from "./pages/Book";
import Bookings from "./pages/Dashboard/Bookings";
import DashboardLayout from "./layouts/DashboardLayout";
import Services from "./pages/Dashboard/Services";
import Availability from "./pages/Dashboard/Availability";
import Settings from "./pages/Dashboard/settings";
import Login from "./pages/Login";
import ProtectedRoute from "./Components/ProtectedRoute";
import DashboardHome from "./pages/Dashboard/DashboardHome";
import Clients from "./pages/Dashboard/Clients";
import Analytics from "./pages/Dashboard/Analytics";
import Projects from "./pages/Dashboard/Projects";
import Notes from "./pages/Dashboard/Notes";
import Files from "./pages/Dashboard/Files";
import ClientDetail from "./pages/Dashboard/ClientDetail";
import Tasks from "./pages/Dashboard/Tasks";
import Kanban from "./pages/Dashboard/Kanban";
import Calendar from "./pages/Dashboard/Calendar";
import Office from "./pages/Office";

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
        <Route path="/office" element={<Office />} />
      </Routes>
    </BrowserRouter>
  );
}
