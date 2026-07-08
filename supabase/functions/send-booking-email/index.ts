const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(time: string) {
  const [hour, minute] = time.split(":");
  const date = new Date();
  date.setHours(Number(hour), Number(minute), 0, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function createICS({
  customerName,
  serviceName,
  bookingDate,
  bookingTime,
}: {
  customerName: string;
  serviceName: string;
  bookingDate: string;
  bookingTime: string;
}) {
  const start = new Date(`${bookingDate}T${bookingTime}:00`);
  const end = new Date(start.getTime() + 30 * 60 * 1000);

  const formatICSDate = (date: Date) =>
    date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//NeoEvo//Booking System//EN
BEGIN:VEVENT
UID:${crypto.randomUUID()}@neoevo.io
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(start)}
DTEND:${formatICSDate(end)}
SUMMARY:NeoEvo Consultation - ${serviceName}
DESCRIPTION:Consultation with NeoEvo for ${customerName}
LOCATION:Online / Phone Call
END:VEVENT
END:VCALENDAR`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("Missing RESEND_API_KEY");
    }

    const {
      customerName,
      customerEmail,
      serviceName,
      bookingDate,
      bookingTime,
      notes,
    } = await req.json();

    const readableDate = formatDate(bookingDate);
    const readableTime = formatTime(bookingTime);

    const icsContent = createICS({
      customerName,
      serviceName,
      bookingDate,
      bookingTime,
    });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; background:#f8fafc; padding:32px;">
        <div style="max-width:640px; margin:0 auto; background:white; border-radius:20px; padding:32px; border:1px solid #e5e7eb;">
          <h1 style="color:#111827; margin-bottom:8px;">Your NeoEvo consultation is confirmed</h1>
          <p style="color:#6b7280; font-size:16px;">Hi ${customerName},</p>

          <p style="color:#374151; font-size:16px;">
            Thank you for booking with NeoEvo. Your consultation has been scheduled.
          </p>

          <div style="background:#f1f5f9; border-radius:16px; padding:20px; margin:24px 0;">
            <p><strong>Service:</strong> ${serviceName}</p>
            <p><strong>Date:</strong> ${readableDate}</p>
            <p><strong>Time:</strong> ${readableTime}</p>
            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
          </div>

          <p style="color:#374151;">
            A calendar invite is attached to this email. You can add it to Apple Calendar, Google Calendar, or Outlook.
          </p>

          <a href="https://neoevo.io" style="display:inline-block; background:#0A84FF; color:white; padding:12px 20px; border-radius:12px; text-decoration:none; font-weight:bold;">
            Visit NeoEvo
          </a>

          <p style="color:#9ca3af; margin-top:32px; font-size:13px;">
            NeoEvo — Digital Systems for Growing Businesses
          </p>
        </div>
      </div>
    `;

    const customerEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "NeoEvo <info@neoevo.io>",
        to: [customerEmail],
        subject: "Your NeoEvo consultation is confirmed",
        html: emailHtml,
        attachments: [
          {
            filename: "neoevo-consultation.ics",
            content: btoa(icsContent),
          },
        ],
      }),
    });

    const adminEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "NeoEvo <info@neoevo.io>",
        to: ["info@neoevo.io"],
        subject: `New booking: ${customerName}`,
        html: `
          <h2>New NeoEvo booking</h2>
          <p><strong>Name:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Service:</strong> ${serviceName}</p>
          <p><strong>Date:</strong> ${readableDate}</p>
          <p><strong>Time:</strong> ${readableTime}</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
        `,
      }),
    });

    if (!customerEmailResponse.ok || !adminEmailResponse.ok) {
      const customerError = await customerEmailResponse.text();
      const adminError = await adminEmailResponse.text();

      throw new Error(
        `Email failed. Customer: ${customerError}. Admin: ${adminError}`,
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Emails sent successfully" }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});