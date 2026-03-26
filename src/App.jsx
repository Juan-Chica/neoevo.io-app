import { useRef, useState } from "react"
import emailjs from "@emailjs/browser"

export default function NeoEvoWebsite() {
  const formRef = useRef(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

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
  ]

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
      features: [
        "Everything in Starter",
        "Login + dashboard demo",
        "Inventory management flow",
        "Lead organization",
      ],
      featured: true,
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
  ]

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
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      await emailjs.sendForm(
        "service_p24wmf8",
        "template_fqxlctt",
        formRef.current,
        "GVcbG8IKCsgussbRL"
      )

      setSuccess(true)
      formRef.current.reset()
    } catch (error) {
      console.error("EmailJS FULL ERROR:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#071017] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#071017]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3DDB61] text-black font-bold shadow-lg shadow-[#3DDB61]/20">
              NE
            </div>
            <div>
              <p className="text-lg font-semibold tracking-wide">NeoEvo</p>
              <p className="text-xs text-white/60">Digital Systems for Growing Businesses</p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-white/75 md:flex">
            <a href="#services" className="transition hover:text-white">Services</a>
            <a href="#offers" className="transition hover:text-white">Offers</a>
            <a href="#work" className="transition hover:text-white">Work</a>
            <a href="#contact" className="transition hover:text-white">Contact</a>
            <a
              href="https://wa.me/18647149926"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[#3DDB61]/30 bg-[#3DDB61]/10 px-4 py-2 font-medium text-[#3DDB61] transition hover:bg-[#3DDB61] hover:text-black"
            >
              WhatsApp
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(61,219,97,0.18),transparent_45%),radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.18),transparent_35%)]" />
          <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
            <div className="grid items-center gap-14 lg:grid-cols-2">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-[#3DDB61]">NeoEvo.io</p>
                <h1 className="mt-5 max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
                  Websites and systems built to make businesses look modern and grow faster.
                </h1>
                <p className="mt-6 max-w-2xl text-lg text-white/70">
                  NeoEvo helps service-based businesses launch professional websites, organize customer leads,
                  and unlock smarter digital tools over time.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <a
                    href="#offers"
                    className="rounded-xl bg-[#3DDB61] px-6 py-3 font-semibold text-black transition hover:opacity-90"
                  >
                    Start Your Website
                  </a>
                  <a
                    href="https://wa.me/18647149926"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-[#3DDB61]/30 bg-[#3DDB61]/10 px-4 py-2 font-medium text-[#3DDB61] transition hover:bg-[#3DDB61] hover:text-black"
                  >
                    WhatsApp
                  </a>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <p className="text-2xl font-bold text-[#3DDB61]">Fast</p>
                    <p className="mt-2 text-sm text-white/65">Launch quickly with clean, high-conversion websites.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <p className="text-2xl font-bold text-[#3DDB61]">Scalable</p>
                    <p className="mt-2 text-sm text-white/65">Start simple and expand into systems, payments, and automation.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <p className="text-2xl font-bold text-[#3DDB61]">Focused</p>
                    <p className="mt-2 text-sm text-white/65">Built for businesses that want more leads and more control.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                <div className="rounded-[1.5rem] border border-white/10 bg-[#0b1620] p-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-white/45">Featured System</p>
                      <h2 className="mt-2 text-2xl font-bold">Dealer Pro Dashboard</h2>
                    </div>
                    <div className="rounded-xl bg-[#3DDB61] px-3 py-2 text-sm font-semibold text-black">Live Demo</div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-white/60">Vehicles</p>
                      <p className="mt-2 text-3xl font-bold">24</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-white/60">Leads</p>
                      <p className="mt-2 text-3xl font-bold">12</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-white/60">Updates</p>
                      <p className="mt-2 text-3xl font-bold">3</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-lg font-semibold">Inventory Preview</p>
                      <span className="text-sm text-[#3DDB61]">Manage</span>
                    </div>
                    <div className="space-y-3">
                      {[
                        ["2018 BMW 430i", "$22,500", "Active"],
                        ["2017 Honda Civic", "$15,900", "Active"],
                        ["2019 Toyota Camry", "$19,800", "Active"],
                      ].map(([vehicle, price, status]) => (
                        <div key={vehicle} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                          <div>
                            <p className="font-medium">{vehicle}</p>
                            <p className="text-sm text-white/50">Inventory item</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{price}</p>
                            <p className="text-sm text-[#3DDB61]">{status}</p>
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
            <p className="text-sm uppercase tracking-[0.35em] text-[#3DDB61]">Services</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">Built for businesses that want more than just a basic site.</h2>
            <p className="mt-5 text-lg text-white/65">
              Start with a clean online presence, then grow into systems that help you manage leads,
              inventory, payments, and customer communication.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <div key={service.title} className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3DDB61]/15 text-xl font-bold text-[#3DDB61]">
                  +
                </div>
                <h3 className="text-2xl font-bold">{service.title}</h3>
                <p className="mt-4 text-white/65">{service.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="offers" className="border-y border-white/10 bg-white/5">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.35em] text-[#3DDB61]">Offers</p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">Choose the level of control you want.</h2>
              <p className="mt-5 text-lg text-white/65">
                NeoEvo is structured so businesses can start simple, then upgrade into more advanced systems when needed.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {offers.map((offer) => (
                <div
                  key={offer.name}
                  className={`rounded-3xl border p-8 ${offer.featured ? "border-[#3DDB61] bg-[#3DDB61]/8 shadow-xl shadow-[#3DDB61]/10" : "border-white/10 bg-[#071017]"}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">{offer.name}</h3>
                    {offer.featured && (
                      <span className="rounded-full bg-[#3DDB61] px-3 py-1 text-xs font-semibold text-black">Most Popular</span>
                    )}
                  </div>
                  <p className="mt-5 text-4xl font-bold">{offer.price}</p>
                  <ul className="mt-6 space-y-3 text-white/70">
                    {offer.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <span className="mt-1 text-[#3DDB61]">●</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#contact"
                    className={`mt-8 inline-flex rounded-xl px-5 py-3 font-semibold transition ${offer.featured ? "bg-[#3DDB61] text-black hover:opacity-90" : "border border-white/15 text-white hover:bg-white hover:text-black"}`}
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
              <p className="text-sm uppercase tracking-[0.35em] text-[#3DDB61]">Work</p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">Demo systems built to open doors and close deals.</h2>
            </div>
            <p className="max-w-xl text-white/65">
              NeoEvo presents polished demos that help business owners quickly understand what’s possible before moving into custom setup.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {projects.map((project) => (
              <div key={project.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className="mb-5 aspect-[16/10] rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f181a] via-[#101a25] to-[#071017] p-5">
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
                <h3 className="text-2xl font-bold">{project.title}</h3>
                <p className="mt-3 text-white/65">{project.subtitle}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="border-t border-white/10 bg-[#050b10]">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-[#3DDB61]">Contact</p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">Let’s build something clean, modern, and profitable.</h2>
              <p className="mt-5 max-w-2xl text-lg text-white/65">
                Whether you need a simple website or a more advanced business system, NeoEvo is built to help you start strong and scale later.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <form ref={formRef} className="grid gap-5" onSubmit={handleSubmit}>
                <input
                  name="name"
                  placeholder="Your name"
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/35 outline-none"
                />
                <input
                  name="email"
                  placeholder="Business email"
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/35 outline-none"
                />
                <textarea
                  name="message"
                  rows={5}
                  placeholder="Tell me about your business and what you want to build"
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/35 outline-none"
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-[#3DDB61] px-6 py-3 font-semibold text-black transition hover:scale-[1.02] hover:opacity-90"
                >
                  {loading ? "Sending..." : "Submit Request"}
                </button>
                <a
                  href="https://calendly.com/neoevo-info/15-minute-quick-demo"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl bg-[#3DDB61] px-6 py-3 text-center font-semibold text-black"
                >
                  Book a Demo Call
                </a>
                {success && (
                  <p className="text-center text-sm text-green-400">
                    Request sent successfully 🚀
                  </p>
                )}
                <p className="text-center text-xs text-white/40">
                  Takes 15 minutes • No commitment • Limited build spots this month
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#050b10]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-[#3DDB61]">NeoEvo</p>
            <p className="mt-1 text-sm text-white/50">Modern websites and business systems for growing companies.</p>
          </div>
          <div className="text-sm text-white/55">
            neoevo.io
          </div>
        </div>
      </footer>

      <a
        href="https://wa.me/18647149926"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 rounded-full bg-[#3DDB61] p-4 shadow-xl shadow-[#3DDB61]/30 transition hover:scale-110"
      >
        💬
      </a>
    </div>
  )
}