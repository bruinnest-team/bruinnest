import { apiRequest } from "./client";

export function getCurrentUser() {
  return apiRequest("/auth/me");
}

export function register(email, password) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function verify(email, password, code) {
  return apiRequest("/auth/verify", {
    method: "POST",
    body: JSON.stringify({ email, password, code }),
  });
}

export function login(email, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return apiRequest("/auth/logout", {
    method: "POST",
  });
}
