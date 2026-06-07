// ============================================================================
// API Service — services/api.ts
// ============================================================================
//
// Centralized HTTP client for the backend API.
//
// All requests go through the `api` helper which:
//   - Prefixes the base URL
//   - Attaches the JWT access token from localStorage (if present)
//   - Sends credentials (cookies) for refresh token flow
//   - Parses JSON responses
//   - On 401, silently refreshes the access token and retries once
//   - Handles errors consistently
//
// Each function maps to a specific backend endpoint.
// ============================================================================

import { API_BASE } from "../shared/constants";

// ---------------------------------------------------------------------------
// Silent Refresh — get a new access token using the HttpOnly refresh cookie
// ---------------------------------------------------------------------------

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Attempt to silently refresh the access token using the HttpOnly
 * refresh cookie. Returns the new token or null if refresh fails.
 */
async function silentRefresh(): Promise<string | null> {
  // Deduplicate concurrent refresh attempts
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include", // Send the HttpOnly refresh cookie
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) return null;

      const data = await res.json();
      if (data.token) {
        localStorage.setItem("superchat_token", data.token);
        return data.token;
      }
      return null;
    } catch {
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ---------------------------------------------------------------------------
// Generic fetch wrapper
// ---------------------------------------------------------------------------

/**
 * Make an authenticated API request.
 *
 * @param endpoint — API path (e.g. "/auth/nonce")
 * @param options — fetch options (method, body, etc.)
 * @param isRetry — internal flag to prevent infinite retry loops
 * @returns parsed JSON response
 * @throws Error with message from backend
 */
async function api(endpoint: string, options: RequestInit = {}, isRetry = false) {
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
    credentials: "include", // Always send cookies for refresh token
  });

  const contentType = res.headers.get("content-type");
  let data: any = {};
  let parseError = false;

  if (contentType && contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch (e) {
      parseError = true;
    }
  } else {
    parseError = true;
  }

  if (!res.ok) {
    // On 401, try silent refresh before giving up (but only once)
    if (res.status === 401 && !isRetry) {
      const newToken = await silentRefresh();
      if (newToken) {
        // Retry the original request with the new access token
        return api(endpoint, options, true);
      }
      // Refresh failed — session is truly expired
      window.dispatchEvent(new CustomEvent("auth:expired"));
    }

    const errorMessage = parseError 
      ? `HTTP error ${res.status}: ${res.statusText}`
      : (data.error || "API request failed");
    throw new Error(errorMessage);
  }

  if (parseError) {
    throw new Error("Invalid response format received from server");
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

/** Refresh the access token using the HttpOnly refresh cookie */
export async function refreshToken() {
  return silentRefresh();
}

/** Logout — clear the refresh cookie on the server */
export async function logoutFromServer() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Best-effort — even if the call fails, we clear local state
  }
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

/** List recent transactions for a wallet with pagination and tab filter */
export async function listTransactions(wallet: string, page: number = 1, limit: number = 50, tab: string = "all") {
  const queryParams = new URLSearchParams();
  queryParams.append("wallet", wallet);
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());
  queryParams.append("tab", tab);
  return api(`/tx/list?${queryParams.toString()}`);
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
export async function getDashboardData(page: number = 1, limit: number = 5, date?: string) {
  const queryParams = new URLSearchParams();
  queryParams.append("page", String(page));
  queryParams.append("limit", String(limit));
  if (date) queryParams.append("date", date);

  return api(`/stats/dashboard?${queryParams.toString()}`);
}

/** Get creator leaderboard with optional timeframe, page, limit, and search query */
export async function getLeaderboard(timeframe?: string, page: number = 1, limit: number = 10, search: string = "") {
  const queryParams = new URLSearchParams();
  if (timeframe) queryParams.append("timeframe", timeframe);
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());
  if (search.trim()) queryParams.append("search", search.trim());
  return api(`/stats/leaderboard?${queryParams.toString()}`);
}


/** Get a user's profile and recent tips with optional pagination and tab filter */
export async function getUserProfile(wallet: string, page: number = 1, limit: number = 5, tab: string = "received") {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());
  queryParams.append("tab", tab);
  return api(`/stats/user/${wallet}?${queryParams.toString()}`);
}

/** Get a public creator's profile by their unique username slug with pagination and search filters */
export async function getPublicProfileByUsername(username: string, page: number = 1, limit: number = 5, search: string = "", filter: string = "all") {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());
  if (search.trim()) queryParams.append("search", search.trim());
  queryParams.append("filter", filter);
  return api(`/stats/username/${username}?${queryParams.toString()}`);
}

/** Update the creator profile for the authenticated user */
export async function updateProfile(data: {
  name?: string;
  bio?: string;
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

/** Search creators in the database by query string with optional pagination */
export async function searchCreators(query: string, page: number = 1, limit: number = 6) {
  return api(`/stats/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
}
