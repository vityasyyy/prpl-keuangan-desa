"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Icons
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const BadgeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
  </svg>
);

const InputField = ({ label, id, type = "text", value, onChange, placeholder = "", required = false, icon }) => (
  <div className="flex flex-col gap-2 w-full">
    <label htmlFor={id} className="font-[var(--font-inter)] font-semibold text-sm text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="bg-white border border-gray-300 rounded-lg w-full overflow-hidden focus-within:border-[#099250] focus-within:ring-2 focus-within:ring-[#099250]/20 transition-all">
      <div className="flex items-center px-4 py-3 gap-3">
        {icon && <div className="shrink-0 text-gray-400">{icon}</div>}
        <input
          type={type}
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full text-base text-gray-900 placeholder-gray-400 outline-none bg-transparent"
        />
      </div>
    </div>
  </div>
);

const SelectField = ({ label, id, value, onChange, options, required = false, icon }) => (
  <div className="flex flex-col gap-2 w-full">
    <label htmlFor={id} className="font-[var(--font-inter)] font-semibold text-sm text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="bg-white border border-gray-300 rounded-lg w-full overflow-hidden focus-within:border-[#099250] focus-within:ring-2 focus-within:ring-[#099250]/20 transition-all">
      <div className="flex items-center px-4 py-3 gap-3">
        {icon && <div className="shrink-0 text-gray-400">{icon}</div>}
        <select
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full text-base text-gray-900 outline-none bg-transparent cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
);

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("kaur_keuangan");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const roleOptions = [
    { value: "kaur_keuangan", label: "Kaur Keuangan" },
    { value: "sekretaris_desa", label: "Sekretaris Desa" },
    { value: "kepala_desa", label: "Kepala Desa" },
  ];

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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md px-4">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#099250]/10 rounded-full mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#099250" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" x2="19" y1="8" y2="14" />
                <line x1="22" x2="16" y1="11" y2="11" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-[var(--font-plus-jakarta-sans)]">
              Daftar Akun Baru
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Buat akun untuk mengakses sistem
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              label="Nama Lengkap"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Masukkan nama lengkap"
              required
              icon={<UserIcon />}
            />

            <InputField
              label="Username"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              required
              icon={<UserIcon />}
            />

            <InputField
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
              icon={<LockIcon />}
            />

            <SelectField
              label="Role"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={roleOptions}
              required
              icon={<BadgeIcon />}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#099250] text-white font-semibold rounded-lg shadow-sm hover:brightness-95 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#099250]/40 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Mendaftar...</span>
                </>
              ) : (
                "Daftar"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Sudah punya akun?{" "}
              <a href="/auth/login" className="text-[#099250] font-medium hover:underline">
                Masuk
              </a>
            </p>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-gray-400 text-xs mt-6">
          ┬⌐ 2025 Desa Banguntapan
        </p>
      </div>
    </div>
  );
}
