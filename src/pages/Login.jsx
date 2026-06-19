import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    navigate("/dashboard/bookings");
  }

  return (
    <div className="min-h-screen bg-[#071017] text-white flex items-center justify-center px-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1c24] p-8"
      >
        <h1 className="text-3xl font-bold">NeoEvo Login</h1>
        <p className="mt-2 text-gray-400">Access your admin dashboard.</p>

        <input
          type="email"
          placeholder="Email"
          className="mt-6 w-full rounded-xl bg-[#071017] border border-white/10 px-4 py-3 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="mt-4 w-full rounded-xl bg-[#071017] border border-white/10 px-4 py-3 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="mt-6 w-full rounded-xl bg-green-400 px-4 py-3 font-semibold text-black">
          Login
        </button>

        {message && <p className="mt-4 text-red-400">{message}</p>}
      </form>
    </div>
  );
}