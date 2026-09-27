const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const escapeICS = (value) => String(value ?? "").replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n").replace(/[,;]/g, (value) => `\\${value}`);

function utf8Base64(value) {
  return btoa(Array.from(new TextEncoder().encode(value), (byte) => String.fromCharCode(byte)).join(""));
}

function calendarInvite(booking) {
  const date = booking.booking_date.replaceAll("-", "");
  const time = booking.booking_time.slice(0, 5).replace(":", "");
  if (!/^\d{8}$/.test(date) || !/^\d{4}$/.test(time)) throw new Error("Invalid committed booking date");
  const [hour, minute] = booking.booking_time.split(":").map(Number);
  const end = new Date(Date.UTC(2000, 0, 1, hour, minute + 30));
  const endDate = new Date(`${booking.booking_date}T00:00:00Z`);
  if (hour === 23 && minute >= 30) endDate.setUTCDate(endDate.getUTCDate() + 1);
  const endDay = endDate.toISOString().slice(0, 10).replaceAll("-", "");
  const endTime = `${String(end.getUTCHours()).padStart(2, "0")}${String(end.getUTCMinutes()).padStart(2, "0")}`;
  // Stable contents and UID are required for the provider's idempotency key.
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//NeoEvo//Booking System//EN", "CALSCALE:GREGORIAN",
    "BEGIN:VTIMEZONE", "TZID:America/New_York", "BEGIN:DAYLIGHT", "TZOFFSETFROM:-0500", "TZOFFSETTO:-0400", "TZNAME:EDT", "DTSTART:20070311T020000", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU", "END:DAYLIGHT",
    "BEGIN:STANDARD", "TZOFFSETFROM:-0400", "TZOFFSETTO:-0500", "TZNAME:EST", "DTSTART:20071104T020000", "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU", "END:STANDARD", "END:VTIMEZONE",
    "BEGIN:VEVENT", `UID:${booking.id}@neoevo.io`, `DTSTAMP:${date}T000000Z`,
    `DTSTART;TZID=America/New_York:${date}T${time}00`, `DTEND;TZID=America/New_York:${endDay}T${endTime}00`,
    `SUMMARY:${escapeICS(`NeoEvo Consultation - ${booking.service_name}`)}`, "STATUS:TENTATIVE", "END:VEVENT", "END:VCALENDAR", ""].join("\r\n");
}

export function buildEmail(booking, channel, config) {
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(booking.customer_email)) throw new Error("Invalid committed recipient");
  const details = `<p><strong>Service:</strong> ${escapeHTML(booking.service_name)}</p><p><strong>Date:</strong> ${escapeHTML(booking.booking_date)}</p><p><strong>Time:</strong> ${escapeHTML(booking.booking_time.slice(0, 5))} (America/New_York)</p>`;
  if (channel === "customer") {
    return {
      from: config.from,
      to: [booking.customer_email],
      subject: "Your NeoEvo consultation request was received",
      html: `<h1>Consultation request received</h1><p>Hi ${escapeHTML(booking.customer_name)},</p><p>Your request is pending confirmation.</p>${details}<p>A tentative calendar invitation is attached.</p>`,
      attachments: [{ filename: "neoevo-consultation.ics", content: utf8Base64(calendarInvite(booking)) }],
    };
  }
  if (channel !== "admin") throw new Error("Invalid notification channel");
  return {
    from: config.from,
    to: [config.admin],
    subject: "New NeoEvo consultation request",
    html: `<h1>New consultation request</h1><p><strong>Name:</strong> ${escapeHTML(booking.customer_name)}</p><p><strong>Email:</strong> ${escapeHTML(booking.customer_email)}</p>${details}${booking.notes ? `<p><strong>Notes:</strong> ${escapeHTML(booking.notes)}</p>` : ""}`,
  };
}

export async function deliverBookingNotifications(bookingId, dependencies) {
  let complete = true;
  for (const channel of ["customer", "admin"]) {
    let claim;
    try {
      claim = await dependencies.claim(bookingId, channel);
      if (claim.status === "sent") continue;
      if (claim.status !== "claimed") { complete = false; continue; }
      // Snapshot and recipients come exclusively from the committed DB record.
      const email = buildEmail(claim.booking, channel, dependencies.emailConfig);
      await dependencies.send(email, `neoevo-booking/${bookingId}/${channel}`);
      const recorded = await dependencies.finish(bookingId, channel, claim.claim_id, true);
      if (!recorded) complete = false;
    } catch {
      complete = false;
      if (claim?.status === "claimed") {
        try { await dependencies.finish(bookingId, channel, claim.claim_id, false); } catch { /* retry/reconciliation uses the durable claim */ }
      }
    }
  }
  return complete ? "sent" : "pending";
}
