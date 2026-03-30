import { sampleHistory } from "@/data/mock";
import { deriveInterpretation, deriveRiskLevel, estimateConfidence, extractPlainText } from "@/lib/utils";

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

export async function getSessionPayload() {
  return apiRequest("/api/session");
}

export async function loginUser(credentials) {
  return apiRequest("/api/login", {
    method: "POST",
    body: credentials
  });
}

export async function registerUser(payload) {
  return apiRequest("/api/register", {
    method: "POST",
    body: payload
  });
}

export async function logoutUser() {
  try {
    return await apiRequest("/api/logout", {
      method: "POST"
    });
  } catch (error) {
    return { success: false };
  }
}

export async function fetchSettings() {
  return apiRequest("/api/settings");
}

export async function updateSettings(payload) {
  return apiRequest("/api/settings", {
    method: "PUT",
    body: payload
  });
}

export async function sendLegalQuery(question) {
  const payload = await apiRequest("/api/legal", {
    method: "POST",
    body: { question }
  });

  return normaliseLegalResponse(question, payload);
}

export async function submitForReview(question) {
  return apiRequest("/api/review-advice", {
    method: "POST",
    body: { question }
  });
}

export async function fetchReviewHistory() {
  try {
    const payload = await apiRequest("/api/user-reviews");
    return payload?.reviews || [];
  } catch (error) {
    return sampleHistory;
  }
}

export async function fetchReviewQueue() {
  try {
    return await apiRequest("/api/review-queue");
  } catch (error) {
    return {
      pending: [],
      approved: []
    };
  }
}

export async function searchCases(query, year, court) {
  return apiRequest("/api/cases", {
    method: "POST",
    body: { query, year, court }
  });
}

export async function searchLawyers(city, specialization) {
  return apiRequest("/api/lawyers", {
    method: "POST",
    body: { city, specialization }
  });
}

export async function uploadContractFile(file) {
  const form = new FormData();
  form.append("file", file);
  return apiRequest("/api/scan", {
    method: "POST",
    body: form
  });
}

export async function lookupCase(payload) {
  return apiRequest("/submit-case", {
    method: "POST",
    body: payload
  });
}

export async function activateProtectMode(keyword) {
  return apiRequest("/api/protect", {
    method: "POST",
    body: { keyword }
  });
}

export async function sendSosSignal(coords) {
  return apiRequest("/api/send-sos", {
    method: "POST",
    body: coords
  });
}

export function normaliseLegalResponse(question, payload = {}) {
  const answerText = extractPlainText(payload.answer || "");
  const risk = deriveRiskLevel(question, answerText);
  const confidence = estimateConfidence(payload);

  return {
    ...payload,
    risk,
    confidence,
    interpretation: deriveInterpretation(question, payload),
    actions: payload.what_next || [],
    answerText,
    title: payload.title || "Legal guidance",
    laws: payload.law_reference || [],
    matched: Boolean(payload.matched)
  };
}
