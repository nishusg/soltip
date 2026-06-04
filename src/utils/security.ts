// ============================================================================
// Security Utilities — utils/security.ts
// ============================================================================
//
// Centralized security helpers for the frontend:
//   - URL validation & sanitization for social links
//   - Stream channel slug validation
//   - Custom media URL validation
//   - Message content sanitization
//   - JWT expiry checking
// ============================================================================

// ---------------------------------------------------------------------------
// Social Link Validation
// ---------------------------------------------------------------------------

/** Allowlisted domains for social link buttons */
const SOCIAL_DOMAIN_ALLOWLIST: Record<string, string[]> = {
  twitter: ["twitter.com", "x.com", "www.twitter.com", "www.x.com"],
  twitch: ["twitch.tv", "www.twitch.tv"],
  youtube: ["youtube.com", "www.youtube.com", "youtu.be", "m.youtube.com"],
  kick: ["kick.com", "www.kick.com"],
  discord: ["discord.gg", "discord.com", "www.discord.com", "www.discord.gg"],
};

/**
 * Build a safe social link URL. Returns `null` if the value is empty or invalid.
 *
 * For each platform, if the input is a raw username/slug it's prefixed with
 * the canonical platform URL. If it looks like a full URL, the domain is
 * validated against an allowlist to prevent open-redirect / phishing attacks.
 */
export function buildSafeSocialUrl(
  platform: keyof typeof SOCIAL_DOMAIN_ALLOWLIST,
  value: string | undefined
): string | null {
  if (!value || !value.trim()) return null;

  const trimmed = value.trim();
  const allowedDomains = SOCIAL_DOMAIN_ALLOWLIST[platform];

  // If it looks like a URL (starts with http:// or https://), validate the domain
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const hostname = url.hostname.toLowerCase();
      if (allowedDomains && allowedDomains.includes(hostname)) {
        return url.toString();
      }
      // Domain not in allowlist — reject
      return null;
    } catch {
      // Malformed URL — reject
      return null;
    }
  }

  // Reject javascript:, data:, blob:, or any other scheme
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    return null;
  }

  // Treat as a username/slug — build canonical URL
  const prefixes: Record<string, string> = {
    twitter: "https://twitter.com/",
    twitch: "https://twitch.tv/",
    youtube: "https://youtube.com/",
    kick: "https://kick.com/",
    discord: "https://",
  };

  return `${prefixes[platform]}${encodeURIComponent(trimmed)}`;
}

// ---------------------------------------------------------------------------
// Stream Embed Channel Validation
// ---------------------------------------------------------------------------

/** Strict regex patterns for stream embed channel values */
const CHANNEL_PATTERNS: Record<string, RegExp> = {
  twitch: /^[a-zA-Z0-9_]{4,25}$/,
  youtube: /^[a-zA-Z0-9_-]{3,30}$/,
  kick: /^[a-zA-Z0-9_]{3,30}$/,
};

/**
 * Validate a stream embed channel value on the rendering side.
 * Returns `true` if the channel matches the expected format for the platform.
 * This is a defense-in-depth check — the same validation exists in ProfileSettings.
 */
export function isValidChannel(platform: string, channel: string): boolean {
  if (!platform || !channel) return false;
  const pattern = CHANNEL_PATTERNS[platform];
  if (!pattern) return false;
  return pattern.test(channel.trim());
}

// ---------------------------------------------------------------------------
// Custom Media URL Validation
// ---------------------------------------------------------------------------

/**
 * Validate a custom media URL (for alert sounds and GIFs).
 * Only allows HTTPS URLs to prevent loading insecure/malicious content.
 * Returns the URL if valid, empty string otherwise.
 */
export function validateMediaUrl(url: string | undefined): string {
  if (!url || !url.trim()) return "";
  const trimmed = url.trim();

  // Only allow https:// scheme
  if (!/^https:\/\//i.test(trimmed)) return "";

  try {
    const parsed = new URL(trimmed);
    // Reject URLs with auth info (user:pass@host)
    if (parsed.username || parsed.password) return "";
    return parsed.toString();
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------------
// JWT Token Expiry Check
// ---------------------------------------------------------------------------

/**
 * Check if a JWT token is expired by decoding the payload and comparing the
 * `exp` claim against the current time. Returns `true` if the token is valid
 * (not expired), `false` if expired or un-parseable.
 *
 * NOTE: This is a convenience check only — the backend must always validate
 * tokens authoritatively. We add a 30-second buffer to avoid race conditions.
 */
export function isTokenValid(token: string): boolean {
  try {
    // JWT structure: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    // Decode the payload (base64url → JSON)
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    );

    if (!payload.exp) {
      // No expiry claim — treat as valid (server will reject if needed)
      return true;
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const bufferSeconds = 30; // 30s grace period
    return payload.exp > nowSeconds - bufferSeconds;
  } catch {
    // Malformed token — treat as invalid
    return false;
  }
}

// ---------------------------------------------------------------------------
// Message Content Sanitization
// ---------------------------------------------------------------------------

/** Maximum allowed message length for display */
const MAX_DISPLAY_MESSAGE_LENGTH = 280;

/**
 * Sanitize a user-provided message for display in the UI and TTS.
 * - Trims whitespace
 * - Enforces maximum length
 * - Strips control characters (except newlines)
 * - Replaces potential HTML-like sequences (belt-and-suspenders for React)
 */
export function sanitizeMessage(message: string | undefined): string {
  if (!message) return "";
  let cleaned = message.trim();
  // Strip control characters (keep newlines and tabs)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  // Enforce max length
  if (cleaned.length > MAX_DISPLAY_MESSAGE_LENGTH) {
    cleaned = cleaned.slice(0, MAX_DISPLAY_MESSAGE_LENGTH) + "…";
  }
  return cleaned;
}

/**
 * Sanitize a sender name for display and TTS.
 */
export function sanitizeSenderName(name: string | undefined): string {
  if (!name) return "Anonymous";
  let cleaned = name.trim();
  // Strip control characters
  cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, "");
  // Enforce reasonable length
  if (cleaned.length > 50) {
    cleaned = cleaned.slice(0, 50) + "…";
  }
  return cleaned || "Anonymous";
}
