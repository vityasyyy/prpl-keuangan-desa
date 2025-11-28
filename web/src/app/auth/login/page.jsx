"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }

      // fetch user info
      const me = await fetch(`${API_BASE_URL}/auth/me`, { credentials: "include" });
      if (!me.ok) throw new Error("Failed to fetch user info after login");
      const { user } = await me.json();

      // store user in auth context
      login({ token: null, user });

      router.push("/");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <form onSubmit={handleSubmit} className="w-[420px] p-6 border rounded">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="mb-3">
          <label className="block text-sm mb-1">Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border px-3 py-2" />
        </div>
        <div className="mb-3">
          <label className="block text-sm mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border px-3 py-2" />
        </div>
        <div className="flex items-center justify-between">
          <button className="px-4 py-2 bg-blue-600 rounded" disabled={loading}>
            {loading ? "Logging..." : "Login"}
          </button>
          <a className="text-sm text-blue-600" href="/auth/register">Register</a>
        </div>
      </form>
    </div>
  );
}
