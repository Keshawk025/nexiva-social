import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("nexiva_token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("nexiva_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async login(credentials) {
        const data = await api.post("/auth/login", credentials);
        localStorage.setItem("nexiva_token", data.token);
        setUser(data.user);
      },
      async register(payload) {
        const data = await api.post("/auth/register", payload);
        localStorage.setItem("nexiva_token", data.token);
        setUser(data.user);
      },
      logout() {
        localStorage.removeItem("nexiva_token");
        setUser(null);
      },
      async refresh() {
        const data = await api.get("/auth/me");
        setUser(data.user);
      },
      setUser
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
