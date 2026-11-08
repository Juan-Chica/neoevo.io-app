import { useState, useEffect } from "react";
import ContactForm from "../Components/public/ContactForm";
import {services,projects,contactLinks,corporateAbout} from "../Components/public/publicContent";
import logo from "../assets/NeoEvo-logo-120.webp?no-inline";
import logoLarge from "../assets/NeoEvo-logo-240.webp";
import heroSmall from "../assets/neoevo-office-banner-1200.webp";
import hero from "../assets/neoevo-office-banner-1717.webp";

const logoSrcSet = `${logo} 120w, ${logoLarge} 240w`;
const projectImageSizes = "(min-width: 1280px) 344px, (min-width: 768px) calc(33.33vw - 82px), calc(100vw - 98px)";

export default function HomePage() {
  useEffect(() => {
    const revealSection = () => {
      const id = window.location.hash.slice(1);
      if (!['services', 'work', 'contact', 'about', 'offers'].includes(id)) return;
      const target = document.getElementById(id);
      target?.scrollIntoView({behavior: 'instant', block: 'start'});
      target?.focus({preventScroll: true});
    };
    revealSection();
    window.addEventListener('hashchange', revealSection);
    return () => window.removeEventListener('hashchange', revealSection);
  }, []);
  const [menuOpen, setMenuOpen] = useState(false);



  const offers = [
    {
      name: "Starter",
      price: "Contact for price",
      features: [
        "Modern website",
        "Mobile-friendly design",
        "Lead/contact setup",
        "Fast delivery",
      ],
    },
    {
      name: "Pro",
      price: "Contact for price",
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
      price: "Contact for price",
      features: [
        "Everything in Pro",
        "Chat experience",
        "Online reservation/payment flow",
        "Future automation ready",
      ],
    },
  ];






  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080C12]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:gap-4">
          <div className="flex items-center gap-4">
            <img
              src={logo}
              srcSet={logoSrcSet}
              sizes="(min-width: 768px) 120px, 96px"
              width={120}
              height={80}
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

          <nav aria-label="Main navigation" className="hidden shrink-0 items-center gap-3 whitespace-nowrap text-sm text-gray-300 md:flex lg:gap-5 xl:gap-8">
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
              href="/login"
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/25 px-3 py-2 font-medium text-gray-200 transition hover:border-white/50 hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#68B3FF]"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 5h6v14h-6M4 12h10m-4-4 4 4-4 4" />
              </svg>
              Client Portal
            </a>
            <a
              href={contactLinks.sms}
              className="rounded-full border border-[#0A84FF]/20 bg-[#0A84FF] px-4 py-2 font-medium text-white shadow-md shadow-[#0A84FF]/20 transition hover:opacity-90"
            >
              Message Us
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
          className="relative min-h-[620px] overflow-hidden border-b border-gray-200 bg-[#080C12] md:min-h-[720px]"
        >
          <img
            src={hero}
            srcSet={`${heroSmall} 1200w, ${hero} 1717w`}
            sizes="(max-width: 767px) 1163px, (max-width: 1349px) 1350px, 100vw"
            width={1717}
            height={916}
            fetchPriority="high"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
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

        <section id="services" tabIndex={-1} className="mx-auto max-w-7xl px-6 py-20">
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

        <section id="offers" tabIndex={-1} className="border-y border-gray-200 bg-[#F8FAFC]">
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

        <section id="work" tabIndex={-1} className="mx-auto max-w-7xl px-6 py-20">
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

          <a
            href="/office"
            className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-[#0A84FF]/25 bg-[#F8FAFC] px-5 py-4 transition hover:border-[#0A84FF] hover:bg-[#0A84FF]/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A84FF] sm:gap-6 sm:px-6"
          >
            <span>
              <span className="block font-semibold text-[#111827]">Explore Our 3D Office</span>
              <span className="mt-1 block text-sm text-[#6B7280]">
                Step inside and explore interactive demos of our websites, business systems and AI automation.
              </span>
            </span>
            <span aria-hidden="true" className="text-xl text-[#0A84FF]">→</span>
          </a>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
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
                    srcSet={project.imageSrcSet}
                    sizes={projectImageSizes}
                    width={800}
                    height={project.imageHeight}
                    loading="lazy"
                    decoding="async"
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

        <section id="contact" tabIndex={-1} className="border-t border-gray-200 bg-white">
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
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      <footer id="about" tabIndex={-1} className="border-t border-gray-200 bg-[#F8FAFC]">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4">
                <img
                  src={logo}
                  srcSet={logoSrcSet}
                  sizes="84px"
                  width={120}
                  height={80}
                  loading="lazy"
                  decoding="async"
                  alt="NeoEvo logo"
                  className="h-14 w-auto object-contain"
                />

                <div>
                  <p className="text-xl font-bold text-[#111827]">NeoEvo</p>

                  <p className="text-sm font-medium text-[#0A84FF]">
                    Digital Systems for Growing Businesses
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-xl text-sm leading-6 text-[#6B7280]">
                {corporateAbout}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={contactLinks.booking}
                  className="rounded-xl bg-[#0A84FF] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Book Consultation
                </a>

                <a
                  href={contactLinks.sms}
                  className="rounded-xl border border-[#0A84FF]/30 bg-white px-4 py-2.5 text-sm font-semibold text-[#0A84FF]"
                >
                  Message Us
                </a>
                
              </div>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#111827]">
                What We Build
              </p>

              <div className="mt-4 flex flex-col gap-3 text-sm text-[#6B7280]">
                <a href="#services" className="hover:text-[#0A84FF]">
                  Business Websites
                </a>

                <a href="#services" className="hover:text-[#0A84FF]">
                  Business Systems
                </a>

                <a href="#services" className="hover:text-[#0A84FF]">
                  AI & Automation
                </a>

                <a href="/office" className="hover:text-[#0A84FF]">3D Office</a>

                <a href="#work" className="hover:text-[#0A84FF]">
                  Dealer Solutions
                </a>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#111827]">
                Connect
              </p>

              <div className="mt-4 flex flex-col gap-3 text-sm text-[#6B7280]">
                <a href={contactLinks.email} className="hover:text-[#0A84FF]">
                  info@neoevo.io
                </a>

                <a href={contactLinks.call} className="hover:text-[#0A84FF]">
                  Call NeoEvo
                </a>

                <a
                  href={contactLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#0A84FF]"
                >
                  Instagram
                </a>

                <a
                  href={contactLinks.messenger}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#0A84FF]"
                >
                  Messenger
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-gray-200 pt-6 text-sm text-[#6B7280] sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 NeoEvo LLC. All rights reserved.</p>
            <p>neoevo.io</p>
          </div>
        </div>
      </footer>

      <a
        href={contactLinks.sms}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#0A84FF] text-2xl text-white shadow-xl shadow-[#0A84FF]/25 transition hover:scale-110"
        aria-label="Send NeoEvo a message"
      >
        💬
      </a>
    </div>
  );
}
