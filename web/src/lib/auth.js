"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      if (typeof window === "undefined" || !window.localStorage) return null;
      const raw = localStorage.getItem("pkd_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    try {
      if (typeof window === "undefined" || !window.localStorage) return null;
      return localStorage.getItem("pkd_token") || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.localStorage) return;
    if (user) localStorage.setItem("pkd_user", JSON.stringify(user));
    else localStorage.removeItem("pkd_user");
  }, [user]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.localStorage) return;
    if (token) localStorage.setItem("pkd_token", token);
    else localStorage.removeItem("pkd_token");
  }, [token]);

  // If no user in context but cookies may exist, try fetching /auth/me
  useEffect(() => {
    async function tryFetchMe() {
      if (!user) {
        try {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
          const res = await fetch(`${API_BASE_URL}/auth/me`, { credentials: "include" });
          if (res.ok) {
            const j = await res.json();
            if (j?.user) setUser(j.user);
          }
        } catch (e) {
          // ignore
        }
      }
    }
    tryFetchMe();
  }, [user]);

  const login = ({ token, user }) => {
    setToken(token);
    setUser(user);
  };
  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
