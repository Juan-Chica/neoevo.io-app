import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const emptyService = {
  name: "",
  description: "",
  price_starting: "",
  duration_minutes: 30,
  active: true,
};

export default function Services() {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState(emptyService);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function fetchServices() {
    setLoading(true);

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      setMessage(error.message);
    } else {
      setServices(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchServices();
  }, []);

  function updateLocalService(id, field, value) {
    setServices((current) =>
      current.map((service) =>
        service.id === id ? { ...service, [field]: value } : service
      )
    );
  }

  async function saveService(service) {
    setMessage("");

    const { error } = await supabase
      .from("services")
      .update({
        name: service.name,
        description: service.description,
        price_starting:
          service.price_starting === "" ? null : Number(service.price_starting),
        duration_minutes: Number(service.duration_minutes),
        active: service.active,
      })
      .eq("id", service.id);

    if (error) {
      console.error(error);
      setMessage(error.message);
      return;
    }

    setMessage("Service updated successfully.");
    fetchServices();
  }

  async function addService(e) {
    e.preventDefault();
    setMessage("");

    const { error } = await supabase.from("services").insert([
      {
        name: newService.name,
        description: newService.description,
        price_starting:
          newService.price_starting === ""
            ? null
            : Number(newService.price_starting),
        duration_minutes: Number(newService.duration_minutes),
        active: newService.active,
      },
    ]);

    if (error) {
      console.error(error);
      setMessage(error.message);
      return;
    }

    setNewService(emptyService);
    setMessage("Service added successfully.");
    fetchServices();
  }

  async function deleteService(id) {
    const confirmDelete = window.confirm("Delete this service?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("services").delete().eq("id", id);

    if (error) {
      console.error(error);
      setMessage(error.message);
      return;
    }

    setMessage("Service deleted.");
    fetchServices();
  }

  if (loading) return <div className="p-10">Loading services...</div>;

  return (
    <div className="p-6 md:p-10">
      <div className="mb-10">
        <p className="text-green-400 font-semibold">NeoEvo Admin</p>
        <h1 className="mt-2 text-4xl font-bold">Services</h1>
        <p className="mt-2 text-gray-400">
          Manage booking services, prices, duration, and visibility.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-green-400/20 bg-green-400/10 px-4 py-3 text-green-300">
          {message}
        </div>
      )}

      <form
        onSubmit={addService}
        className="mb-8 rounded-2xl border border-white/10 bg-[#0f1c24] p-6"
      >
        <h2 className="mb-5 text-2xl font-bold">Add New Service</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            required
            placeholder="Service name"
            value={newService.name}
            onChange={(e) =>
              setNewService({ ...newService, name: e.target.value })
            }
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
          />

          <input
            type="number"
            placeholder="Starting price"
            value={newService.price_starting}
            onChange={(e) =>
              setNewService({
                ...newService,
                price_starting: e.target.value,
              })
            }
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
          />

          <input
            type="number"
            placeholder="Duration minutes"
            value={newService.duration_minutes}
            onChange={(e) =>
              setNewService({
                ...newService,
                duration_minutes: e.target.value,
              })
            }
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
          />

          <select
            value={newService.active ? "active" : "inactive"}
            onChange={(e) =>
              setNewService({
                ...newService,
                active: e.target.value === "active",
              })
            }
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <textarea
            placeholder="Description"
            value={newService.description}
            onChange={(e) =>
              setNewService({
                ...newService,
                description: e.target.value,
              })
            }
            className="md:col-span-2 rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
          />
        </div>

        <button className="mt-5 rounded-lg bg-green-400 px-5 py-2 font-semibold text-black">
          Add Service
        </button>
      </form>

      <div className="grid gap-5">
        {services.map((service) => (
          <div
            key={service.id}
            className="rounded-2xl border border-white/10 bg-[#0f1c24] p-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={service.name}
                onChange={(e) =>
                  updateLocalService(service.id, "name", e.target.value)
                }
                className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
              />

              <input
                type="number"
                value={service.price_starting ?? ""}
                onChange={(e) =>
                  updateLocalService(
                    service.id,
                    "price_starting",
                    e.target.value
                  )
                }
                className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
              />

              <input
                type="number"
                value={service.duration_minutes ?? 30}
                onChange={(e) =>
                  updateLocalService(
                    service.id,
                    "duration_minutes",
                    e.target.value
                  )
                }
                className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
              />

              <select
                value={service.active ? "active" : "inactive"}
                onChange={(e) =>
                  updateLocalService(
                    service.id,
                    "active",
                    e.target.value === "active"
                  )
                }
                className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <textarea
                value={service.description || ""}
                onChange={(e) =>
                  updateLocalService(
                    service.id,
                    "description",
                    e.target.value
                  )
                }
                className="md:col-span-2 rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
              />
            </div>

            <div className="mt-5 flex justify-between">
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  service.active
                    ? "bg-green-400/10 text-green-300"
                    : "bg-red-400/10 text-red-300"
                }`}
              >
                {service.active ? "Active" : "Inactive"}
              </span>

              <div className="flex gap-3">
                <button
                  onClick={() => saveService(service)}
                  className="rounded-lg bg-green-400 px-5 py-2 font-semibold text-black"
                >
                  Save
                </button>

                <button
                  onClick={() => deleteService(service.id)}
                  className="rounded-lg bg-red-500 px-5 py-2 font-semibold text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}