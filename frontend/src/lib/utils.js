import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(input) {
  if (!input) {
    return "Just now";
  }

  const value = typeof input === "number" ? input : new Date(input).getTime();
  const delta = Math.round((Date.now() - value) / 1000);

  if (delta < 60) {
    return "Just now";
  }

  const units = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60]
  ];

  for (const [label, size] of units) {
    if (delta >= size) {
      const amount = Math.floor(delta / size);
      return `${amount} ${label}${amount === 1 ? "" : "s"} ago`;
    }
  }

  return "Just now";
}

export function formatShortDate(input) {
  if (!input) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(input));
}

export function extractPlainText(html = "") {
  if (!html) {
    return "";
  }

  if (typeof window === "undefined") {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  const holder = document.createElement("div");
  holder.innerHTML = html;
  return holder.textContent?.replace(/\s+/g, " ").trim() || "";
}

export function deriveRiskLevel(question = "", answer = "") {
  const text = `${question} ${answer}`.toLowerCase();
  const highSignals = ["arrest", "police", "unsafe", "eviction", "terminate", "assault", "harassment", "fraud", "threat"];
  const mediumSignals = ["contract", "lease", "salary", "privacy", "employment", "notice", "defamation"];

  if (highSignals.some((signal) => text.includes(signal))) {
    return "high";
  }

  if (mediumSignals.some((signal) => text.includes(signal))) {
    return "medium";
  }

  return "low";
}

export function deriveInterpretation(question = "", payload = {}) {
  const source = extractPlainText(payload.answer || "");
  const title = payload.title || "Legal intake summary";

  if (!source) {
    return `${title}: we parsed your request as a legal information query and prepared a recommended guidance workflow.`;
  }

  return `${title}: ${source.split(". ").slice(0, 2).join(". ")}.`;
}

export function estimateConfidence(payload = {}) {
  if (typeof payload.confidence === "number") {
    return Math.round(payload.confidence * 100);
  }

  const searchMethod = payload.search_method || "";
  if (searchMethod.includes("sbert")) {
    return 92;
  }
  if (payload.matched) {
    return 84;
  }
  return 61;
}

export function getRiskMeta(risk = "low") {
  const map = {
    low: { label: "Low risk", className: "border-success/20 bg-success/10 text-success-foreground" },
    medium: { label: "Medium risk", className: "border-warning/20 bg-warning/10 text-warning-foreground" },
    high: { label: "High risk", className: "border-danger/20 bg-danger/10 text-danger-foreground" }
  };

  return map[risk] || map.low;
}

export function storageGet(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

export function storageSet(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    return null;
  }

  return value;
}

export function initials(name = "LexGuard") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function compactNumber(value) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}
