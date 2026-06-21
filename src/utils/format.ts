// ============================================================================
// Formatting Utilities — utils/format.ts
// ============================================================================
//
// Centralized formatting helpers for consistent display of values on frontend:
//   - Wallet Address Shortening
//   - SOL lamports formatting
//   - Time duration and timestamp formatting
//
// ============================================================================

const LAMPORTS_PER_SOL = 1_000_000_000;

/**
 * Shorten a wallet address to prefix...suffix format.
 *
 * @param addr - The public key address string
 * @param prefixChars - Number of characters to keep at start
 * @param suffixChars - Number of characters to keep at end
 * @returns Shortened address
 */
export function shortenAddress(addr: string, prefixChars = 4, suffixChars = 4): string {
  if (!addr) return "";
  if (addr.length <= prefixChars + suffixChars) return addr;
  return `${addr.slice(0, prefixChars)}...${addr.slice(-suffixChars)}`;
}

/**
 * Format SOL amount from lamports to decimal SOL string.
 *
 * @param lamports - The amount in lamports
 * @param decimals - Decimal places to output
 * @returns Formatted SOL string
 */
export function formatSol(lamports: number, decimals = 4): string {
  if (lamports === undefined || lamports === null || isNaN(lamports)) return "0.0000";
  return (lamports / LAMPORTS_PER_SOL).toFixed(decimals);
}

/**
 * Format relative time (e.g. 5m ago, 2d ago).
 *
 * @param ts - ISO timestamp string
 * @returns Relative time description
 */
export function formatRelativeTime(ts: string): string {
  if (!ts) return "";
  const date = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return "just now";
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins}m ago`;
  }
  if (diff < 86400000) {
    const hrs = Math.floor(diff / 3600000);
    return `${hrs}h ago`;
  }
  const days = Math.floor(diff / 86400000);
  return `${days}d ago`;
}

/**
 * Format absolute time details to readable string.
 *
 * @param ts - ISO timestamp string
 * @param includeSeconds - Whether to render seconds
 * @returns Absolute timestamp string
 */
export function formatAbsoluteTimestamp(ts: string, includeSeconds = false): string {
  if (!ts) return "";
  const date = new Date(ts);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...(includeSeconds ? { second: "2-digit" } : {})
  });
}

/**
 * Standard relative time format for profile streams (fallback to locale date).
 *
 * @param ts - ISO timestamp string
 * @returns General formatted date
 */
export function formatTimeDefault(ts: string): string {
  if (!ts) return "";
  const date = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

/**
 * Full relative time format including minutes for older items.
 *
 * @param ts - ISO timestamp string
 * @returns Formatted date with time
 */
export function formatTimeWithMinutes(ts: string): string {
  if (!ts) return "";
  const date = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
