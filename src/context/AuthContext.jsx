// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import AuthService from "../services/AuthService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try { return AuthService.getAuthToken(); } catch { return null; }
  });
  const [user, setUser] = useState(null);

  const login = useCallback(async (username, password) => {
    const payload = await AuthService.login({ username, password });
    const tokenFromPayload = payload?.token || payload?.data?.token;
    if (tokenFromPayload) {
      setToken(tokenFromPayload);
      setUser({ username: payload?.username || username, role: payload?.role || "USER" });
    }
    return payload;
  }, []);

  const logout = useCallback(() => {
    AuthService.logout();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
