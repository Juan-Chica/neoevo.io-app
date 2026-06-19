import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Calendar() {
  const [bookings, setBookings] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  async function fetchBookings() {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        services (
          name
        )
      `)
      .neq("status", "cancelled");

    if (!error) setBookings(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();

    const calendarDays = [];

    for (let i = 0; i < startDay; i++) {
      calendarDays.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      calendarDays.push(new Date(year, month, day));
    }

    return calendarDays;
  }, [year, month]);

  function formatDateKey(date) {
    return date.toISOString().split("T")[0];
  }

  function formatTime(time) {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    const date = new Date();
    date.setHours(Number(hour), Number(minute), 0, 0);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function monthName() {
    return currentDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  function previousMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  if (loading) return <div className="p-10">Loading calendar...</div>;

  return (
    <div className="p-6 md:p-10">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-semibold text-green-400">NeoEvo Admin</p>
          <h1 className="mt-2 text-4xl font-bold">Calendar</h1>
          <p className="mt-2 text-gray-400">
            View scheduled consultations by month.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={previousMonth}
            className="rounded-lg border border-white/10 px-4 py-2 hover:bg-white/10"
          >
            Previous
          </button>

          <button
            onClick={nextMonth}
            className="rounded-lg border border-white/10 px-4 py-2 hover:bg-white/10"
          >
            Next
          </button>
        </div>
      </div>

      <h2 className="mb-5 text-2xl font-bold">{monthName()}</h2>

      <div className="grid grid-cols-7 gap-2 text-center text-sm text-gray-400">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-2 font-semibold">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (!day) {
            return (
              <div
                key={`empty-${index}`}
                className="min-h-[130px] rounded-xl border border-white/5 bg-white/[0.02]"
              />
            );
          }

          const dateKey = formatDateKey(day);
          const dayBookings = bookings.filter(
            (booking) => booking.booking_date === dateKey
          );

          return (
            <div
              key={dateKey}
              className="min-h-[130px] rounded-xl border border-white/10 bg-[#0f1c24] p-3"
            >
              <p className="mb-2 text-sm font-bold">{day.getDate()}</p>

              <div className="space-y-2">
                {dayBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-lg bg-green-400/10 p-2 text-left text-xs text-green-300"
                  >
                    <p className="font-semibold">
                      {formatTime(booking.booking_time)}
                    </p>
                    <p>{booking.customer_name}</p>
                    <p className="text-green-200/70">
                      {booking.services?.name || "Consultation"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}