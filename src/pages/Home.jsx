import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import logo from "../assets/NeoEvo-logo.png";
import dealerWebsite from "../assets/work/dealer-website.png";
import dealerDashboard from "../assets/work/dealer-dashboard.png";
import businessStack from "../assets/work/business-stack.png";

export default function HomePage() {
  const formRef = useRef(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const services = [
    {
      title: "Starter Websites",
      description:
        "Clean, modern business websites built to help local companies look professional and generate more leads.",
    },
    {
      title: "Business Systems",
      description:
        "Login dashboards, inventory tools, lead tracking, and internal workflows designed to make operations easier.",
    },
    {
      title: "Growth Upgrades",
      description:
        "Chat features, online payments, automation, and future-ready tools for businesses that want more control.",
    },
  ];

  const offers = [
    {
      name: "Starter",
      price: "$500+",
      features: [
        "Modern website",
        "Mobile-friendly design",
        "Lead/contact setup",
        "Fast delivery",
      ],
    },
    {
      name: "Pro",
      price: "$1,000+",
      featured: true,
      features: [
        "Everything in Starter",
        "Login + dashboard demo",
        "Inventory management flow",
        "Lead organization",
      ],
    },
    {
      name: "Premium",
      price: "$1,500+",
      features: [
        "Everything in Pro",
        "Chat experience",
        "Online reservation/payment flow",
        "Future automation ready",
      ],
    },
  ];

  const projects = [
    {
      title: "Dealer Website Demo",
      subtitle: "Modern inventory-focused automotive site",
      image: dealerWebsite,
      link: "https://nevodrive.com",
    },
    {
      title: "Dealer Pro System",
      subtitle: "Login, dashboard, leads, and management flow",
      image: dealerDashboard,
      link: "/login",
    },
    {
      title: "Business Growth Stack",
      subtitle: "Chat, payments, and premium conversion features",
      image: businessStack,
      link: "/book",
    },
  ];

  const contactLinks = {
    sms: "sms:+18647149923",
    call: "tel:+18647149923",
    whatsapp:
      "https://wa.me/18647149923?text=Hi%20I%20am%20interested%20in%20your%20services",
    messenger: "https://m.me/neoevo",
    email: "mailto:info@neoevo.io",
    instagram: "https://instagram.com/neoevo.io",
    booking: "/book",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await emailjs.sendForm(
        "service_p24wmf8",
        "template_fqxlctt",
        formRef.current,
        "GVcbG8IKCsgussbRL",
      );

      setSuccess(true);
      formRef.current.reset();
    } catch (error) {
      console.error("EmailJS FULL ERROR:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080C12]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="NeoEvo logo"
              className="h-16 w-auto object-contain md:h-20"
            />

            <div>
              <p className="text-xl font-semibold tracking-wide text-white md:text-2xl">
                NeoEvo
              </p>
              <p className="text-xs text-gray-400 md:text-sm">
                Digital Systems for Growing Businesses
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-gray-300 md:flex">
            <a href="#services" className="transition hover:text-white">
              Services
            </a>
            <a href="#offers" className="transition hover:text-white">
              Offers
            </a>
            <a href="#work" className="transition hover:text-white">
              Work
            </a>
            <a href="#contact" className="transition hover:text-white">
              Contact
            </a>
            <a
              href={contactLinks.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[#0A84FF]/20 bg-[#0A84FF] px-4 py-2 font-medium text-white shadow-md shadow-[#0A84FF]/20 transition hover:opacity-90"
            >
              WhatsApp
            </a>
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-xl border border-white/20 px-4 py-2 text-2xl font-bold text-white md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            ☰
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed left-0 right-0 top-[96px] z-50 border-b border-gray-200 bg-white px-6 py-5 shadow-xl md:hidden">
          <div className="flex flex-col gap-4 text-lg font-semibold text-[#111827]">
            <a href="#services" onClick={() => setMenuOpen(false)}>
              Services
            </a>

            <a href="#offers" onClick={() => setMenuOpen(false)}>
              Offers
            </a>

            <a href="#work" onClick={() => setMenuOpen(false)}>
              Work
            </a>

            <a href="#contact" onClick={() => setMenuOpen(false)}>
              Contact
            </a>

            <a
              href="https://nevodrive.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-[#0A84FF] px-4 py-3 text-center text-white"
            >
              🚗 Live Dealer Demo
            </a>

            <a
              href="/login"
              className="rounded-xl border border-[#0A84FF] px-4 py-3 text-center text-[#0A84FF]"
            >
              Portal
            </a>

            <a
              href="/book"
              className="rounded-xl bg-[#111827] px-4 py-3 text-center text-white"
            >
              Book Consultation
            </a>
          </div>
        </div>
      )}

      <main>
        <section
          className="relative min-h-[620px] overflow-hidden border-b border-gray-200 bg-cover bg-center bg-no-repeat md:min-h-[720px]"
          style={{
            backgroundImage: "url('/neoevo-office-banner.png')",
          }}
        >
          <div className="absolute inset-0 bg-black/55" />

          <div className="relative z-10 mx-auto flex min-h-[620px] max-w-7xl items-center justify-center px-6 py-20 text-center md:min-h-[720px]">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#0A84FF]">
                We build digital systems
              </p>

              <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-7xl">
                Digital Systems for Growing{" "}
                <span className="text-[#0A84FF]">Businesses.</span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-200 sm:text-lg md:text-xl">
                Websites, automation, and business systems designed to help you
                attract more customers, close more deals, and scale with
                confidence.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href="#offers"
                  className="w-full rounded-xl bg-[#0A84FF] px-7 py-3.5 font-semibold text-white shadow-lg shadow-[#0A84FF]/25 transition hover:-translate-y-0.5 hover:opacity-90 sm:w-auto"
                >
                  Explore Packages
                </a>

                <a
                  href={contactLinks.booking}
                  className="w-full rounded-xl border border-white/40 bg-black/35 px-7 py-3.5 font-semibold text-white transition hover:bg-white hover:text-[#111827] sm:w-auto"
                >
                  Book a Call
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.35em] text-[#0A84FF]">
              Services
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#111827] md:text-5xl">
              Built for businesses that want more than just a basic site.
            </h2>
            <p className="mt-5 text-lg text-[#6B7280]">
              Start with a clean online presence, then grow into systems that
              help you manage leads, inventory, payments, and customer
              communication.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className="rounded-3xl border border-gray-200 bg-white p-8 shadow-md"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A84FF]/15 text-xl font-bold text-[#0A84FF]">
                  +
                </div>
                <h3 className="text-2xl font-bold text-[#111827]">
                  {service.title}
                </h3>
                <p className="mt-4 text-[#6B7280]">{service.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="offers" className="border-y border-gray-200 bg-[#F8FAFC]">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.35em] text-[#0A84FF]">
                Offers
              </p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#111827] md:text-5xl">
                Choose the level of control you want.
              </h2>
              <p className="mt-5 text-lg text-[#6B7280]">
                NeoEvo is structured so businesses can start simple, then
                upgrade into more advanced systems when needed.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {offers.map((offer) => (
                <div
                  key={offer.name}
                  className={`rounded-3xl border p-8 ${
                    offer.featured
                      ? "border-[#0A84FF] bg-white shadow-xl shadow-[#0A84FF]/10"
                      : "border-gray-200 bg-white shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-[#111827]">
                      {offer.name}
                    </h3>

                    {offer.featured && (
                      <span className="rounded-full bg-[#0A84FF] px-3 py-1 text-xs font-semibold text-white">
                        Most Popular
                      </span>
                    )}
                  </div>

                  <p className="mt-5 text-4xl font-bold text-[#111827]">
                    {offer.price}
                  </p>

                  <ul className="mt-6 space-y-3 text-[#6B7280]">
                    {offer.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <span className="mt-1 text-[#0A84FF]">●</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#contact"
                    className={`mt-8 inline-flex rounded-xl px-5 py-3 font-semibold transition ${
                      offer.featured
                        ? "bg-[#0A84FF] text-white hover:opacity-90"
                        : "border border-gray-300 text-[#111827] hover:bg-gray-50"
                    }`}
                  >
                    Start Here
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="work" className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.35em] text-[#0A84FF]">
                Work
              </p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#111827] md:text-5xl">
                Demo systems built to open doors and close deals.
              </h2>
            </div>

            <p className="max-w-xl text-[#6B7280]">
              NeoEvo presents polished demos that help business owners quickly
              understand what’s possible before moving into custom setup.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.title}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-md"
              >
                <a
                  href={project.link}
                  target={project.link.startsWith("http") ? "_blank" : "_self"}
                  rel="noreferrer"
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    className="mb-5 aspect-[16/10] w-full rounded-2xl border border-gray-200 object-cover shadow-md transition duration-300 hover:scale-[1.02]"
                  />
                </a>

                <h3 className="text-2xl font-bold text-[#111827]">
                  {project.title}
                </h3>
                <p className="mt-3 text-[#6B7280]">{project.subtitle}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="border-t border-gray-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-[#0A84FF]">
                Contact
              </p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#111827] md:text-5xl">
                Let’s build something clean, modern, and profitable.
              </h2>
              <p className="mt-5 max-w-2xl text-lg text-[#6B7280]">
                Whether you need a simple website or a more advanced business
                system, NeoEvo is built to help you start strong and scale
                later.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-md">
              <form
                ref={formRef}
                className="grid gap-5"
                onSubmit={handleSubmit}
              >
                <input
                  name="name"
                  required
                  placeholder="Your name"
                  className="rounded-xl border border-gray-300 bg-[#F9FAFB] px-4 py-3 text-[#111827] placeholder:text-[#9CA3AF] outline-none"
                />

                <input
                  name="email"
                  required
                  placeholder="Business email"
                  className="rounded-xl border border-gray-300 bg-[#F9FAFB] px-4 py-3 text-[#111827] placeholder:text-[#9CA3AF] outline-none"
                />

                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder="Tell me about your business and what you want to build"
                  className="rounded-xl border border-gray-300 bg-[#F9FAFB] px-4 py-3 text-[#111827] placeholder:text-[#9CA3AF] outline-none"
                />

                <button
                  type="submit"
                  className="rounded-2xl bg-[#0A84FF] px-6 py-3 font-semibold text-white shadow-lg shadow-[#0A84FF]/25 transition hover:scale-[1.02] hover:opacity-90"
                >
                  {loading ? "Sending..." : "Submit Request"}
                </button>

                <div className="grid gap-3 sm:grid-cols-3">
                  <a
                    href={contactLinks.booking}
                    className="rounded-2xl bg-[#0A84FF] px-6 py-3 text-center font-semibold text-white shadow-lg shadow-[#0A84FF]/25 transition hover:scale-[1.02] hover:opacity-90"
                  >
                    Book Consultation
                  </a>

                  <a
                    href={contactLinks.sms}
                    className="rounded-2xl border border-gray-300 bg-white px-6 py-3 text-center font-semibold text-[#111827] transition hover:bg-gray-50"
                  >
                    Text Us
                  </a>

                  <a
                    href={contactLinks.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-[#0A84FF]/30 bg-[#0A84FF]/10 px-6 py-3 text-center font-semibold text-[#0A84FF] transition hover:bg-[#0A84FF] hover:text-white"
                  >
                    WhatsApp
                  </a>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[#6B7280]">
                  <a
                    href={contactLinks.messenger}
                    target="_blank"
                    rel="noreferrer"
                    className="transition hover:text-[#111827]"
                  >
                    Messenger
                  </a>

                  <a
                    href={contactLinks.email}
                    className="transition hover:text-[#111827]"
                  >
                    Email
                  </a>

                  <a
                    href={contactLinks.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="transition hover:text-[#111827]"
                  >
                    Instagram
                  </a>

                  <a
                    href={contactLinks.call}
                    className="transition hover:text-[#111827]"
                  >
                    Call
                  </a>
                </div>

                {success && (
                  <p className="text-center text-sm text-[#0A84FF]">
                    Request sent successfully 🚀
                  </p>
                )}

                <p className="text-center text-xs text-[#EF4444]">
                  Takes 15 minutes • No commitment • Limited build spots this
                  month
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-[#111827]">NeoEvo</p>
            <p className="mt-1 text-sm text-[#6B7280]">
              Modern websites and business systems for growing companies.
            </p>
          </div>

          <div className="text-sm text-[#6B7280]">neoevo.io</div>
        </div>
      </footer>

      <a
        href={contactLinks.whatsapp}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 rounded-full bg-[#EF4444] p-4 text-white shadow-xl shadow-[#EF4444]/20 transition hover:scale-110"
        aria-label="Open WhatsApp chat"
      >
        💬
      </a>
    </div>
  );
}
