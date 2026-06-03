const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "/api";

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.error?.message ?? "Request failed";
    throw new Error(message);
  }

  return data;
}

export async function apiUpload(path, formData) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    credentials: "include",
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.error?.message ?? "Upload failed";
    throw new Error(message);
  }

  return data;
}
