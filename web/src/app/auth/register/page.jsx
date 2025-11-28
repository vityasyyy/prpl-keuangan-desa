"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("kaur_keuangan");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, full_name: fullName, role }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      router.push("/auth/login");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <form onSubmit={handleSubmit} className="w-[480px] p-6 border rounded">
        <h2 className="text-xl font-bold mb-4">Register</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="mb-3">
          <label className="block text-sm mb-1">Full name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border px-3 py-2" />
        </div>
        <div className="mb-3">
          <label className="block text-sm mb-1">Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border px-3 py-2" />
        </div>
        <div className="mb-3">
          <label className="block text-sm mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border px-3 py-2" />
        </div>
        <div className="mb-3">
          <label className="block text-sm mb-1">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border px-3 py-2">
            <option value="kaur_keuangan">kaur_keuangan</option>
            <option value="sekretaris_desa">sekretaris_desa</option>
            <option value="kepala_desa">kepala_desa</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <button className="px-4 py-2 bg-green-600 text-white rounded" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>
          <a className="text-sm text-blue-600" href="/auth/login">Login</a>
        </div>
      </form>
    </div>
  );
}
