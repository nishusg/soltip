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

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

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
  stream_id?: string;
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

/** Update the creator profile for the authenticated user */
export async function updateProfile(data: { name?: string; bio?: string; avatar_url?: string }) {
  return api("/creators/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ---------------------------------------------------------------------------
// Stream endpoints
// ---------------------------------------------------------------------------

/** Start a new livestream */
export async function createStream(data: { title: string; category?: string; description?: string }) {
  return api("/streams/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** End a livestream */
export async function endStream(id: string) {
  return api(`/streams/${id}/end`, { method: "POST" });
}

/** Update stream settings (slow mode, etc) */
export async function updateStreamSettings(id: string, settings: { slow_mode?: number, donation_goal?: number }) {
  return api(`/streams/${id}/settings`, {
    method: "PATCH",
    body: JSON.stringify(settings),
  });
}

/** Ban or unban a user */
export async function toggleBan(id: string, wallet_to_ban: string, action: "ban" | "unban") {
  return api(`/streams/${id}/ban`, {
    method: "POST",
    body: JSON.stringify({ wallet_to_ban, action }),
  });
}

/** Get details for a specific stream */
export async function getStream(id: string) {
  return api(`/streams/${id}`);
}

/** List all currently live streams */
export async function listActiveStreams() {
  return api("/streams/active");
}
