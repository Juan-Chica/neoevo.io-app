import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function ClientDetail() {
  const { email } = useParams();
  const decodedEmail = decodeURIComponent(email);

  const [bookings, setBookings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClientData() {
      const [{ data: bookingsData }, { data: projectsData }, { data: notesData }, { data: filesData }] =
        await Promise.all([
          supabase.from("bookings").select("*, services(name, price_starting)").eq("customer_email", decodedEmail),
          supabase.from("projects").select("*").eq("client_email", decodedEmail),
          supabase.from("notes").select("*").eq("related_email", decodedEmail),
          supabase.from("files").select("*").eq("client_email", decodedEmail),
        ]);

      setBookings(bookingsData || []);
      setProjects(projectsData || []);
      setNotes(notesData || []);
      setFiles(filesData || []);
      setLoading(false);
    }

    fetchClientData();
  }, [decodedEmail]);

  const client = bookings[0] || {};
  const revenue = useMemo(() => {
    return projects.reduce((total, project) => total + (project.price || 0), 0);
  }, [projects]);

  if (loading) return <div className="p-10">Loading client...</div>;

  return (
    <div className="p-6 md:p-10">
      <div className="mb-10">
        <p className="font-semibold text-green-400">NeoEvo Client</p>
        <h1 className="mt-2 text-4xl font-bold">
          {client.customer_name || decodedEmail}
        </h1>
        <p className="mt-2 text-gray-400">{decodedEmail}</p>
        <p className="text-gray-400">{client.customer_phone || "No phone"}</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Bookings" value={bookings.length} />
        <StatCard label="Projects" value={projects.length} />
        <StatCard label="Notes" value={notes.length} />
        <StatCard label="Revenue" value={`$${revenue}`} />
      </div>

      <Section title="Booking History">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <h3 className="font-bold">{booking.services?.name || "Booking"}</h3>
            <p className="text-gray-400">
              {booking.booking_date} • {booking.booking_time}
            </p>
            <p className="capitalize text-green-400">{booking.status}</p>
          </Card>
        ))}
      </Section>

      <Section title="Projects">
        {projects.map((project) => (
          <Card key={project.id}>
            <h3 className="font-bold">{project.service_name}</h3>
            <p className="text-gray-400">{project.status}</p>
            <p className="text-green-400">${project.price || 0}</p>
          </Card>
        ))}
      </Section>

      <Section title="Notes">
        {notes.map((note) => (
          <Card key={note.id}>
            <h3 className="font-bold">{note.title}</h3>
            <p className="whitespace-pre-wrap text-gray-300">{note.content}</p>
          </Card>
        ))}
      </Section>

      <Section title="Files">
        {files.map((file) => (
          <Card key={file.id}>
            <h3 className="font-bold">{file.file_name}</h3>
            <p className="text-gray-400">{file.category}</p>
          </Card>
        ))}
      </Section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0f1c24] p-5">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-8 rounded-2xl border border-white/10 bg-[#0f1c24] p-6">
      <h2 className="mb-5 text-2xl font-bold">{title}</h2>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#071017] p-4">
      {children}
    </div>
  );
}