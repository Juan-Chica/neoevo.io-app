import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const emptyForm = {
  service_id: "", customer_name: "", customer_email: "", customer_phone: "",
  booking_date: "", booking_time: "", notes: "",
};
const inputClass = "w-full p-3 rounded bg-white text-black";

function dateInBookingZone() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const part = (name) => parts.find((value) => value.type === name).value;
  return part("year") + "-" + part("month") + "-" + part("day");
}

export default function BookingForm() {
  const [services, setServices] = useState([]);
  const [servicesReady, setServicesReady] = useState(false);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const request = useRef(null);
  const busy = useRef(false);

  const today = dateInBookingZone();
  const lastDay = new Date(today + "T12:00:00Z");
  lastDay.setUTCDate(lastDay.getUTCDate() + 90);
  const maxDate = lastDay.toISOString().slice(0, 10);

  useEffect(() => {
    let active = true;
    async function loadServices() {
      try {
        const { data, error } = await supabase.rpc("get_public_services");
        if (!active) return;
        if (error) throw error;
        setServices(data || []);
        setServicesReady(true);
      } catch {
        if (active) setMessage("Services could not be loaded. Please reload this page to try again.");
      }
    }
    loadServices();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    async function loadSlots() {
      if (!form.booking_date) return;
      try {
        const { data, error } = await supabase.rpc("get_booking_slots", { p_date: form.booking_date });
        if (!active) return;
        if (error) throw error;
        const times = (data || []).map((slot) => slot.booking_time);
        setAvailableTimes(times);
        setAvailabilityMessage(times.length
          ? "Choose an available time. All times are Eastern Time (New York)."
          : "No appointments are available on this date. Please choose another date.");
      } catch {
        if (active) {
          setAvailableTimes([]);
          setAvailabilityMessage("Availability could not be loaded. Choose another date or try again.");
        }
      } finally {
        if (active) setSlotsLoading(false);
      }
    }
    loadSlots();
    return () => { active = false; };
  }, [form.booking_date, refresh]);

  function handleChange(event) {
    const { name, value } = event.target;
    setMessage("");
    if (name === "booking_date") {
      setAvailableTimes([]);
      setSlotsLoading(Boolean(value));
      setAvailabilityMessage("");
      setForm((current) => ({ ...current, booking_date: value, booking_time: "" }));
    } else {
      setForm((current) => ({ ...current, [name]: value }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy.current || !servicesReady || !form.booking_time || slotsLoading) return;
    busy.current = true;
    setSubmitting(true);
    setMessage("");
    const payload = { ...form };
    const signature = JSON.stringify(payload);
    if (request.current?.signature !== signature) {
      request.current = { signature, id: crypto.randomUUID() };
    }
    try {
      const { data, error } = await supabase.functions.invoke("create-booking", {
        body: { request_id: request.current.id, ...payload },
      });
      if (error) {
        let failure;
        try { failure = await error.context?.json(); } catch { /* No response received. */ }
        if (failure?.error === "booking_conflict") {
          setMessage("That time is no longer available. Please choose another time.");
          setForm((current) => ({ ...current, booking_time: "" }));
          setAvailableTimes([]);
          setSlotsLoading(true);
          setRefresh((value) => value + 1);
        } else if (failure?.error === "booking_rate_limited") {
          setMessage("Too many booking requests. Please try again later.");
        } else if (["invalid_booking", "invalid_request"].includes(failure?.error)) {
          setMessage("Please check your booking details, date, and selected time, then try again.");
        } else {
          setMessage("We could not confirm the booking. Please retry with the same details. If it was already received, retrying will not create a second booking.");
        }
        return;
      }
      if (!data?.booking_id) throw new Error("Unconfirmed response");
      setMessage(data.notification_status === "sent"
        ? "Consultation request received. Your request email has been sent; the appointment is pending confirmation."
        : "Consultation request received. Your request email is pending; the appointment is pending confirmation.");
      setForm(emptyForm);
      setAvailableTimes([]);
      setAvailabilityMessage("");
      request.current = null;
    } catch {
      setMessage("We could not confirm the booking. Please retry with the same details. If it was already received, retrying will not create a second booking.");
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#071017] text-white px-6 py-20">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Book a Consultation</h1>
        <p className="text-gray-300 mb-8">Schedule a call with NeoEvo to discuss your website or digital system.</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <fieldset disabled={submitting} className="space-y-5">
            <select name="service_id" aria-label="Service" value={form.service_id} onChange={handleChange}
              required disabled={!servicesReady} className={inputClass}>
              <option value="">{servicesReady ? "Select a service" : "Loading services…"}</option>
              {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
            </select>
            <input name="customer_name" aria-label="Your name" autoComplete="name" maxLength={120}
              value={form.customer_name} onChange={handleChange} required placeholder="Your name" className={inputClass} />
            <input name="customer_email" aria-label="Email address" autoComplete="email" maxLength={254}
              value={form.customer_email} onChange={handleChange} required type="email" placeholder="Email address" className={inputClass} />
            <input name="customer_phone" aria-label="Phone number" autoComplete="tel" maxLength={40}
              value={form.customer_phone} onChange={handleChange} placeholder="Phone number" className={inputClass} />
            <input name="booking_date" aria-label="Appointment date" min={today} max={maxDate}
              value={form.booking_date} onChange={handleChange} required type="date" className={inputClass} />
            {availabilityMessage && <p className="text-sm text-yellow-300" role="status">{availabilityMessage}</p>}
            <div>
              <p className="mb-2 text-sm text-gray-300">Select a time (Eastern Time)</p>
              {slotsLoading ? <p role="status">Loading available times…</p> : availableTimes.length === 0
                ? <p className="text-sm text-gray-500">Select an available date to see times.</p>
                : <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableTimes.map((time) => (
                    <button key={time} type="button" aria-pressed={form.booking_time === time}
                      onClick={() => setForm((current) => ({ ...current, booking_time: time }))}
                      className={form.booking_time === time
                        ? "rounded-lg border px-4 py-3 font-semibold bg-green-400 text-black border-green-400"
                        : "rounded-lg border px-4 py-3 font-semibold bg-white/5 text-white border-white/10 hover:bg-white/10"}>
                      {time}
                    </button>
                  ))}
                </div>}
            </div>
            <textarea name="notes" aria-label="Appointment notes" maxLength={2000} value={form.notes}
              onChange={handleChange} placeholder="Tell us what you need" className={inputClass} rows="4" />
            <button type="submit" disabled={submitting || !servicesReady || slotsLoading || !form.booking_time}
              className="bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold px-6 py-3 rounded hover:bg-green-300">
              {submitting ? "Booking…" : "Book Appointment"}
            </button>
          </fieldset>
        </form>
        {message && <p className="mt-6 text-green-400" role="status">{message}</p>}
      </div>
    </div>
  );
}
