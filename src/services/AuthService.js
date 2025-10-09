// src/services/AuthService.js
import api from "./Api";
import Cookies from "js-cookie";

export function setAuthTokens({ token, refreshToken }) {
  if (token) Cookies.set("sr_token", token, { sameSite: "Lax" });
  if (refreshToken) Cookies.set("sr_refresh", refreshToken, { sameSite: "Lax" });
}

export function clearAuthTokens() {
  Cookies.remove("sr_token");
  Cookies.remove("sr_refresh");
}

export function getAuthToken() {
  return Cookies.get("sr_token") || null;
}

export async function refreshAuth() {
  const refreshToken = Cookies.get("sr_refresh");
  if (!refreshToken) throw new Error("no refresh token available");
  const res = await api.post("/auth/refresh", { refreshToken });
  const payload = res.data?.data || res.data;
  const newToken = payload?.token;
  const newRefresh = payload?.refreshToken;
  if (newToken) {
    setAuthTokens({ token: newToken, refreshToken: newRefresh });
    return newToken;
  }
  throw new Error("refresh failed");
}

async function login({ username, password }) {
  const res = await api.post("/auth/login", { username, password });
  const payload = res.data?.data || res.data;
  if (payload?.token) {
    setAuthTokens({ token: payload.token, refreshToken: payload.refreshToken });
  }
  return payload;
}

function logout() {
  clearAuthTokens();
}

const AuthService = { login, logout, setAuthTokens, clearAuthTokens, getAuthToken, refreshAuth };
export default AuthService;

