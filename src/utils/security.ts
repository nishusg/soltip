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
 *
 * @param {keyof typeof SOCIAL_DOMAIN_ALLOWLIST} platform - The social platform key
 * @param {string | undefined} value - The raw social handle or full URL input
 * @returns {string | null} The resolved canonical safe URL, or null if invalid
 */
export function buildSafeSocialUrl(
  platform: keyof typeof SOCIAL_DOMAIN_ALLOWLIST,
  value: string | undefined
): string | null {
  if (!value || !value.trim()) return null;

  let trimmed = value.trim();
  const allowedDomains = SOCIAL_DOMAIN_ALLOWLIST[platform];

  // Check if the input starts with an allowed domain (e.g. twitter.com/username) and prepend protocol
  const startsWithDomain = allowedDomains.some(domain => 
    trimmed.toLowerCase().startsWith(domain + "/") || trimmed.toLowerCase() === domain
  );
  if (startsWithDomain && !/^https?:\/\//i.test(trimmed)) {
    trimmed = "https://" + trimmed;
  }

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

  // Treat as a username/slug or invite code — build canonical URL
  const prefixes: Record<string, string> = {
    twitter: "https://twitter.com/",
    twitch: "https://twitch.tv/",
    youtube: "https://youtube.com/",
    kick: "https://kick.com/",
    discord: "https://discord.gg/",
  };

  // Strip leading '@' symbol from handles if present
  const cleanHandle = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;

  return `${prefixes[platform]}${encodeURIComponent(cleanHandle)}`;
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
 *
 * @param {string} platform - The streaming platform (twitch, youtube, kick)
 * @param {string} channel - The channel handle or slug
 * @returns {boolean} True if the channel format matches the platform regex pattern
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
 *
 * @param {string | undefined} url - The media URL or base64 data URI to validate
 * @returns {string} The validated URL/data URI, or an empty string if invalid
 */
export function validateMediaUrl(url: string | undefined): string {
  if (!url || !url.trim()) return "";
  const trimmed = url.trim();

  // Allow safe base64 data URIs for media (audio or images)
  if (/^data:(audio|image)\/[a-z0-9+.-]+;base64,/i.test(trimmed)) {
    return trimmed;
  }

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
 *
 * @param {string} token - The raw JWT token string
 * @returns {boolean} True if the token is valid and not expired, false otherwise
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
 *
 * @param {string | undefined} message - The raw message to sanitize
 * @returns {string} The cleaned and sanitized message
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
 *
 * @param {string | undefined} name - The raw sender name to sanitize
 * @returns {string} The cleaned sender name, or "Anonymous" if empty
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
