// ============================================================================
// API Service — services/api.ts
// ============================================================================
//
// Centralized HTTP client for the backend API.
//
// All requests go through the `api` helper which:
//   - Prefixes the base URL
//   - Attaches the JWT token from localStorage (if present)
//   - Parses JSON responses
//   - Handles errors consistently
//
// Each function maps to a specific backend endpoint.
// ============================================================================

import { API_BASE } from "../shared/constants";

// ---------------------------------------------------------------------------
// Generic fetch wrapper
// ---------------------------------------------------------------------------

/**
 * Make an authenticated API request.
 *
 * @param endpoint — API path (e.g. "/auth/nonce")
 * @param options — fetch options (method, body, etc.)
 * @returns parsed JSON response
 * @throws Error with message from backend
 */
async function api(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("superchat_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  // Attach JWT if available
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent("auth:expired"));
    }
    throw new Error(data.error || "API request failed");
  }

  return data;
}

// ---------------------------------------------------------------------------
// Auth endpoints
// ---------------------------------------------------------------------------

/** Request a nonce for wallet-based login */
export async function getNonce(wallet: string) {
  return api(`/auth/nonce?wallet=${wallet}`);
}

/** Verify a signed nonce and receive a JWT */
export async function verifySignature(wallet: string, signature: string) {
  return api("/auth/verify", {
    method: "POST",
    body: JSON.stringify({ wallet, signature }),
  });
}

// ---------------------------------------------------------------------------
// Transaction endpoints
// ---------------------------------------------------------------------------

/** Verify a tip transaction on-chain and store it */
export async function verifyAndStoreTransaction(data: {
  tx_hash: string;
  sender_wallet: string;
  creator_wallet: string;
  message?: string;
}) {
  return api("/tx/verify", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** List recent transactions for a wallet */
export async function listTransactions(wallet: string) {
  return api(`/tx/list?wallet=${wallet}`);
}

/** Get the verification status of a specific transaction */
export async function getTransactionStatus(tx_hash: string) {
  return api(`/tx/status/${tx_hash}`);
}

/** Request a refund for a transaction (creator auth required) */
// export async function refundTransaction(txId: string) {
//   return api(`/tx/${txId}/refund`, { method: "POST" });
// }

// ---------------------------------------------------------------------------
// Stats endpoints
// ---------------------------------------------------------------------------

/** Get daily tip statistics */
export async function getDailyStats() {
  return api("/stats/daily");
}

/** Get creator dashboard statistics (authenticated) */
export async function getDashboardData() {
  return api("/stats/dashboard");
}

/** Get a user's profile and recent tips (both sent and received) */
export async function getUserProfile(wallet: string) {
  return api(`/stats/user/${wallet}`);
}

/** Get a public creator's profile by their unique username slug */
export async function getPublicProfileByUsername(username: string) {
  return api(`/stats/username/${username}`);
}

/** Update the creator profile for the authenticated user */
export async function updateProfile(data: {
  name?: string;
  bio?: string;
  avatar_url?: string;
  username?: string;
  socials?: {
    twitter?: string;
    twitch?: string;
    youtube?: string;
    kick?: string;
    discord?: string;
  };
  stream_embed?: {
    platform?: string;
    channel?: string;
  };
}) {
  return api("/creators/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/** Get the current authenticated user's profile */
export async function getMe() {
  return api("/creators/me");
}

/** Activate premium subscription after verifying payment */
export async function activateSubscription(tx_hash: string) {
  return api("/subscription/activate", {
    method: "POST",
    body: JSON.stringify({ tx_hash }),
  });
}

/** Update the user's selected premium theme */
export async function updateTheme(theme: string) {
  return api("/creators/theme", {
    method: "PUT",
    body: JSON.stringify({ theme }),
  });
}

// ---------------------------------------------------------------------------
// Overlay token endpoints
// ---------------------------------------------------------------------------

/** Get the current overlay token (auth required) */
export async function getOverlayToken() {
  return api("/creators/overlay-token");
}

/** Generate or regenerate the overlay token (auth required) */
export async function generateOverlayToken() {
  return api("/creators/overlay-token", { method: "POST" });
}

/** Trigger a test overlay alert (auth required) */
export async function sendTestAlert() {
  return api("/creators/overlay-test", { method: "POST" });
}

/** Update the creator's overlay settings (auth required) */
export async function saveOverlaySettings(settings: {
  tts_enabled?: boolean;
  tts_min_amount?: number;
  tts_voice?: string;
  alert_duration?: number;
  alert_gif_preset?: string;
  alert_gif_url?: string;
  alert_sound_preset?: string;
  alert_sound_url?: string;
  sound_volume?: number;
  theme_color?: string;
  font_family?: string;
  theme?: string;
  alert_animation?: string;
  queue_system_enabled?: boolean;
  font_size?: number;
}) {
  return api("/creators/overlay-settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}

