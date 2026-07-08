import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function BookingForm() {
  const [services, setServices] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [form, setForm] = useState({
    service_id: "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    booking_date: "",
    booking_time: "",
    notes: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchServices() {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: true });

      if (error) {
        console.error(error);
        return;
      }

      setServices(data);
    }

    async function fetchAvailability() {
      const { data, error } = await supabase.from("availability").select("*");

      if (error) {
        console.error(error);
        return;
      }

      setAvailability(data || []);
    }

    fetchServices();
    fetchAvailability();
  }, []);

  function generateTimeSlots(startTime, endTime) {
    if (!startTime || !endTime) return [];

    const slots = [];
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const current = new Date();
    current.setHours(startHour, startMinute, 0, 0);

    const end = new Date();
    end.setHours(endHour, endMinute, 0, 0);

    while (current < end) {
      const hours = String(current.getHours()).padStart(2, "0");
      const minutes = String(current.getMinutes()).padStart(2, "0");

      slots.push(`${hours}:${minutes}`);

      current.setMinutes(current.getMinutes() + 30);
    }

    return slots;
  }

  async function fetchBookedTimes(date) {
    const { data, error } = await supabase
      .from("bookings")
      .select("booking_time")
      .eq("booking_date", date)
      .neq("status", "cancelled");

    if (error) {
      console.error("Error loading booked times:", error);
      return [];
    }

    return (data || []).map((booking) => booking.booking_time.slice(0, 5));
  }

  async function handleChange(e) {
    const { name, value } = e.target;

    if (name === "booking_date") {
      const selectedDate = new Date(value + "T00:00:00");

      const dayName = selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
      });

      const dayAvailability = availability.find(
        (day) => day.day_of_week === dayName,
      );

      if (!dayAvailability || !dayAvailability.is_open) {
        setAvailabilityMessage(`NeoEvo is closed on ${dayName}.`);
        setAvailableTimes([]);
        setBookedTimes([]);
        setForm({
          ...form,
          booking_date: value,
          booking_time: "",
        });
        return;
      }

      const slots = generateTimeSlots(
        dayAvailability.start_time,
        dayAvailability.end_time,
      );

      const unavailableTimes = await fetchBookedTimes(value);
      const openTimes = slots.filter((slot) => !unavailableTimes.includes(slot));

      setBookedTimes(unavailableTimes);
      setAvailableTimes(openTimes);

      if (openTimes.length === 0) {
        setAvailabilityMessage(
          `NeoEvo is open on ${dayName}, but all time slots are already booked.`,
        );
      } else {
        setAvailabilityMessage(
          `Available on ${dayName} from ${dayAvailability.start_time} to ${dayAvailability.end_time}.`,
        );
      }
    }

    setForm({
      ...form,
      [name]: value,
    });
  }
  async function handleSubmit(e) {
    e.preventDefault();

    const { data: existingBookings, error: duplicateCheckError } = await supabase
      .from("bookings")
      .select("id")
      .eq("booking_date", form.booking_date)
      .eq("booking_time", form.booking_time)
      .neq("status", "cancelled");

    if (duplicateCheckError) {
      console.error("Duplicate check error:", duplicateCheckError);
      setMessage("Something went wrong checking availability. Please try again.");
      return;
    }

    if (existingBookings.length > 0) {
      setMessage("That time is no longer available. Please choose another time.");
      const unavailableTimes = await fetchBookedTimes(form.booking_date);
      setBookedTimes(unavailableTimes);
      setAvailableTimes((currentTimes) =>
        currentTimes.filter((time) => !unavailableTimes.includes(time)),
      );
      setForm({
        ...form,
        booking_time: "",
      });
      return;
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          service_id: form.service_id,
          customer_name: form.customer_name,
          customer_email: form.customer_email,
          customer_phone: form.customer_phone,
          booking_date: form.booking_date,
          booking_time: form.booking_time,
          notes: form.notes,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Booking error:", error);
      setMessage("Something went wrong. Please try again.");
      return;
    }

    const selectedService = services.find(
      (service) => service.id === form.service_id,
    );

    const { error: emailError } = await supabase.functions.invoke(
      "send-booking-email",
      {
        body: {
          customerName: form.customer_name,
          customerEmail: form.customer_email,
          serviceName: selectedService?.name || "NeoEvo Consultation",
          bookingDate: form.booking_date,
          bookingTime: form.booking_time,
          notes: form.notes,
        },
      },
    );

    if (emailError) {
      console.error("Email confirmation error:", emailError);
      setMessage(
        "Appointment booked, but the confirmation email could not be sent.",
      );
      return;
    }

    console.log("Booking created:", data);
    setMessage("Appointment booked successfully! Confirmation email sent.");

    setForm({
      service_id: "",
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      booking_date: "",
      booking_time: "",
      notes: "",
    });
    setAvailabilityMessage("");
    setAvailableTimes([]);
    setBookedTimes([]);
  }
  return (
    <div className="min-h-screen bg-[#071017] text-white px-6 py-20">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Book a Consultation</h1>
        <p className="text-gray-300 mb-8">
          Schedule a call with NeoEvo to discuss your website or digital system.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <select
            name="service_id"
            value={form.service_id}
            onChange={handleChange}
            required
            className="w-full p-3 rounded bg-white text-black"
          >
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>

          <input
            name="customer_name"
            value={form.customer_name}
            onChange={handleChange}
            required
            placeholder="Your name"
            className="w-full p-3 rounded bg-white text-black"
          />

          <input
            name="customer_email"
            value={form.customer_email}
            onChange={handleChange}
            required
            type="email"
            placeholder="Email address"
            className="w-full p-3 rounded bg-white text-black"
          />

          <input
            name="customer_phone"
            value={form.customer_phone}
            onChange={handleChange}
            placeholder="Phone number"
            className="w-full p-3 rounded bg-white text-black"
          />

          <input
            name="booking_date"
            value={form.booking_date}
            onChange={handleChange}
            required
            type="date"
            className="w-full p-3 rounded bg-white text-black"
          />

          {availabilityMessage && (
            <p className="text-sm text-yellow-300">{availabilityMessage}</p>
          )}

          <div>
            <p className="mb-2 text-sm text-gray-300">Select a time</p>

            {availableTimes.length === 0 ? (
              <p className="text-sm text-gray-500">
                Select an available date to see times.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          booking_time: time,
                        })
                      }
                      className={`rounded-lg border px-4 py-3 font-semibold ${
                        form.booking_time === time
                          ? "bg-green-400 text-black border-green-400"
                          : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>

                {bookedTimes.length > 0 && (
                  <p className="mt-3 text-sm text-gray-500">
                    Some times are hidden because they are already booked.
                  </p>
                )}
              </>
            )}
          </div>

          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Tell us what you need"
            className="w-full p-3 rounded bg-white text-black"
            rows="4"
          />

          <button
            type="submit"
            disabled={availabilityMessage.includes("closed") || !form.booking_time}
            className="bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold px-6 py-3 rounded hover:bg-green-300"
          >
            Book Appointment
          </button>
        </form>

        {message && <p className="mt-6 text-green-400">{message}</p>}
      </div>
    </div>
  );
}
