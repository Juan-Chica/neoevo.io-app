import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function Clients() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      const { data, error } = await supabase
        .from("bookings")
        .select("customer_name, customer_email, customer_phone, booking_date, booking_time, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setBookings(data || []);
      setLoading(false);
    }

    fetchBookings();
  }, []);

  const clients = useMemo(() => {
    const map = new Map();

    bookings.forEach((booking) => {
      const key = booking.customer_email;

      if (!map.has(key)) {
        map.set(key, {
          name: booking.customer_name,
          email: booking.customer_email,
          phone: booking.customer_phone,
          bookings: 1,
          latestDate: booking.booking_date,
          latestTime: booking.booking_time,
        });
      } else {
        map.get(key).bookings += 1;
      }
    });

    return Array.from(map.values());
  }, [bookings]);

  if (loading) return <div className="p-10">Loading clients...</div>;

  return (
    <div className="p-6 md:p-10">
      <div className="mb-10">
        <p className="font-semibold text-green-400">NeoEvo Admin</p>
        <h1 className="mt-2 text-4xl font-bold">Clients</h1>
        <p className="mt-2 text-gray-400">
          View people who have booked consultations with NeoEvo.
        </p>
      </div>

      <div className="grid gap-5">
        {clients.map((client) => (
          <Link
            key={client.email}
            to={`/dashboard/clients/${encodeURIComponent(client.email)}`}
            className="block rounded-2xl border border-white/10 bg-[#0f1c24] p-6 transition hover:border-green-400/30 hover:bg-white/[0.03]"
          >
            <h2 className="text-2xl font-bold text-white">{client.name}</h2>
            <p className="text-gray-400">{client.email}</p>
            <p className="text-gray-400">{client.phone || "No phone"}</p>

            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-green-400/10 px-3 py-1 text-green-300">
                {client.bookings} booking(s)
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-gray-300">
                Latest: {client.latestDate} • {client.latestTime}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}