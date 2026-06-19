import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function fetchSettings() {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      console.error(error);
      setMessage(error.message);
    } else {
      setSettings(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  function handleChange(e) {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
  }

  async function saveSettings() {
    setMessage("");

    const { error } = await supabase
      .from("settings")
      .update({
        business_name: settings.business_name,
        contact_email: settings.contact_email,
        phone: settings.phone,
        website: settings.website,
        meeting_link: settings.meeting_link,
        address: settings.address,
      })
      .eq("id", settings.id);

    if (error) {
      console.error(error);
      setMessage(error.message);
      return;
    }

    setMessage("Settings updated successfully.");
  }

  if (loading) return <div className="p-10">Loading settings...</div>;

  return (
    <div className="p-6 md:p-10">
      <div className="mb-10">
        <p className="text-green-400 font-semibold">NeoEvo Admin</p>
        <h1 className="mt-2 text-4xl font-bold">Settings</h1>
        <p className="mt-2 text-gray-400">
          Manage business information used by your booking system.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-green-400/20 bg-green-400/10 px-4 py-3 text-green-300">
          {message}
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-[#0f1c24] p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="business_name"
            value={settings.business_name || ""}
            onChange={handleChange}
            placeholder="Business Name"
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
          />

          <input
            name="contact_email"
            value={settings.contact_email || ""}
            onChange={handleChange}
            placeholder="Contact Email"
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
          />

          <input
            name="phone"
            value={settings.phone || ""}
            onChange={handleChange}
            placeholder="Phone"
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
          />

          <input
            name="website"
            value={settings.website || ""}
            onChange={handleChange}
            placeholder="Website"
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white"
          />

          <input
            name="meeting_link"
            value={settings.meeting_link || ""}
            onChange={handleChange}
            placeholder="Meeting Link"
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white md:col-span-2"
          />

          <textarea
            name="address"
            value={settings.address || ""}
            onChange={handleChange}
            placeholder="Business Address"
            rows="3"
            className="rounded-xl border border-white/10 bg-[#071017] px-4 py-3 text-white md:col-span-2"
          />
        </div>

        <button
          onClick={saveSettings}
          className="mt-6 rounded-lg bg-green-400 px-5 py-2 font-semibold text-black"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}