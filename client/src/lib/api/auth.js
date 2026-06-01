import { apiRequest } from "./client";

export function getCurrentUser() {
  return apiRequest("/auth/me");
}

export function registerUser(email, password) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function verifyRegistration(email, password, code) {
  return apiRequest("/auth/verify", {
    method: "POST",
    body: JSON.stringify({ email, password, code }),
  });
}

export function loginUser(email, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logoutUser() {
  return apiRequest("/auth/logout", {
    method: "POST",
  });
}
