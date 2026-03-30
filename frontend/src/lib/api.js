export const apiProxyNote =
  "For local development, run the Flask API on port 5000 and Vite will proxy API requests automatically.";

export async function apiRequest(path, options = {}) {
  const config = {
    method: options.method || "GET",
    credentials: "include",
    headers: options.headers ? { ...options.headers } : {}
  };

  if (options.body instanceof FormData) {
    config.body = options.body;
  } else if (options.body !== undefined) {
    config.body = JSON.stringify(options.body);
    config.headers["Content-Type"] = "application/json";
  }

  const response = await fetch(path, config);

  if (options.responseType === "blob") {
    if (!response.ok) {
      throw new Error("Request failed");
    }
    return response.blob();
  }

  const text = await response.text();
  let payload = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.error || payload?.message || `Request failed with status ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}
