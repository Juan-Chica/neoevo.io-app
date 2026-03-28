import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import logo from "./assets/NeoEvo-logo.png";

export default function NeoEvoWebsite() {
  const formRef = useRef(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

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
      price: "$400+",
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
    },
    {
      title: "Dealer Pro System",
      subtitle: "Login, dashboard, leads, and management flow",
    },
    {
      title: "Business Growth Stack",
      subtitle: "Chat, payments, and premium conversion features",
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
    calendly: "https://calendly.com/neoevo-info/15-minute-quick-demo",
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
    <div className="min-h-screen bg-[#FFFFFF] text-[#111827]">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="NeoEvo logo"
              className="h-16 w-auto object-contain md:h-20"
            />

            <div>
              <p className="text-xl font-semibold tracking-wide text-[#111827] md:text-2xl">
                NeoEvo
              </p>
              <p className="text-xs text-[#6B7280] md:text-sm">
                Digital Systems for Growing Businesses
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-[#6B7280] md:flex">
            <a href="#services" className="transition hover:text-[#111827]">
              Services
            </a>
            <a href="#offers" className="transition hover:text-[#111827]">
              Offers
            </a>
            <a href="#work" className="transition hover:text-[#111827]">
              Work
            </a>
            <a href="#contact" className="transition hover:text-[#111827]">
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
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-gray-200 bg-[#FFFFFF]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(10,132,255,0.15),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(239,68,68,0.08),transparent_40%)]" />

          <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
            <div className="grid items-center gap-14 lg:grid-cols-2">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-[#0A84FF]">
                  NEOEVO.IO
                </p>

                <h1 className="mt-5 max-w-3xl text-5xl font-bold leading-[0.95] tracking-tight text-[#111827] md:text-7xl">
                  Websites and systems built to make businesses look modern and
                  grow faster.
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6B7280] md:text-xl">
                  NeoEvo helps service-based businesses launch professional
                  websites, organize customer leads, and unlock smarter digital
                  tools over time.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <a
                    href="#offers"
                    className="rounded-xl bg-[#0A84FF] px-6 py-3 font-semibold text-white shadow-lg shadow-[#0A84FF]/20 transition hover:-translate-y-0.5 hover:opacity-90"
                  >
                    Start Your Website
                  </a>

                  <a
                    href={contactLinks.calendly}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-[#111827] shadow-sm transition hover:bg-gray-50"
                  >
                    Book 1:1 Demo
                  </a>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md">
                    <p className="text-2xl font-bold text-[#0A84FF]">Fast</p>
                    <p className="mt-2 text-sm text-[#6B7280]]">
                      Launch quickly with clean, high-conversion websites.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md">
                    <p className="text-2xl font-bold text-[#0A84FF]">
                      Scalable
                    </p>
                    <p className="mt-2 text-sm text-[#6B7280]">
                      Start simple and expand into systems, payments, and
                      automation.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md">
                    <p className="text-2xl font-bold text-[#0A84FF]">Focused</p>
                    <p className="mt-2 text-sm text-[#6B7280]]">
                      Built for businesses that want more leads and more
                      control.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-gray-200 bg-white/90 p-5 shadow-xl shadow-[#0A84FF]/10 backdrop-blur-2xl">
                <div className="rounded-[1.5rem] border border-gray-200 bg-[#F9FAFB] p-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-[#6B7280]">
                        Featured System
                      </p>
                      <h2 className="mt-2 text-2xl font-bold text-[#111827]">
                        Dealer Pro Dashboard
                      </h2>
                    </div>

                    <div className="rounded-xl bg-[#0A84FF] px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-[#0A84FF]/25">
                      Live Demo
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                      <p className="text-sm text-[#6B7280]">Vehicles</p>
                      <p className="mt-2 text-3xl font-bold text-[#111827]">
                        24
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                      <p className="text-sm text-[#6B7280]">Leads</p>
                      <p className="mt-2 text-3xl font-bold text-[#111827]">
                        12
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                      <p className="text-sm text-[#6B7280]">Updates</p>
                      <p className="mt-2 text-3xl font-bold text-[#111827]">
                        3
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-lg font-semibold text-[#111827]">
                        Inventory Preview
                      </p>
                      <span className="text-sm text-[#0A84FF]">Manage</span>
                    </div>

                    <div className="space-y-3">
                      {[
                        ["2018 BMW 430i", "$22,500", "Active"],
                        ["2017 Honda Civic", "$15,900", "Active"],
                        ["2019 Toyota Camry", "$19,800", "Active"],
                      ].map(([vehicle, price, status]) => (
                        <div
                          key={vehicle}
                          className="flex items-center justify-between rounded-xl border border-gray-200 bg-[#F9FAFB] px-4 py-3"
                        >
                          <div>
                            <p className="font-medium text-[#111827]">
                              {vehicle}
                            </p>
                            <p className="text-sm text-[#6B7280]">
                              Inventory item
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold text-[#111827]">
                              {price}
                            </p>
                            <p className="text-sm text-[#0A84FF]">{status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
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
                <div className="mb-5 aspect-[16/10] rounded-2xl border border-gray-200 bg-gradient-to-br from-[#F8FAFC] via-[#EEF4FF] to-[#FFF5F5] p-5">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-white/10 p-3" />
                    <div className="rounded-xl bg-white/10 p-3" />
                    <div className="rounded-xl bg-white/10 p-3" />
                  </div>

                  <div className="mt-4 rounded-2xl bg-white/5 p-4">
                    <div className="h-4 w-2/3 rounded bg-white/10" />
                    <div className="mt-3 h-20 rounded-xl bg-white/10" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-[#111827]">
                  {project.title}
                </h3>
                <p className="mt-3 text-[#6B7280]">{project.subtitle}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="border-t border-gray-200 bg-[#FFFFFF]">
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
                    href={contactLinks.calendly}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl bg-[#0A84FF] px-6 py-3 text-center font-semibold text-white shadow-lg shadow-[#0A84FF]/25 transition hover:scale-[1.02] hover:opacity-90"
                  >
                    Book a Demo
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

      <footer className="border-t border-gray-200 bg-[#FFFFFF]">
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
      >
        💬
      </a>
    </div>
  );
}
