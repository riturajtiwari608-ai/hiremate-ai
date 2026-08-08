const AUTH_KEYS = ["token", "role", "full_name"];

export function clearAuth() {
  AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
}

export function hasValidSession() {
  const token = localStorage.getItem("token");

  if (!token) return false;

  try {
    const encodedPayload = token
      .split(".")[1]
      ?.replace(/-/g, "+")
      .replace(/_/g, "/");
    const paddedPayload = encodedPayload?.padEnd(
      encodedPayload.length + ((4 - (encodedPayload.length % 4)) % 4),
      "="
    );
    const payload = JSON.parse(atob(paddedPayload));

    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
