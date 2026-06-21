/**
 * Shared overlay URL builders.
 *
 * Both Dashboard and AlertCustomizer construct the same OBS Browser Source
 * URL format. Centralising here ensures the URL schema never drifts.
 *
 * URL format:  <origin>/overlay/<walletAddress>#key=<overlayToken>
 * Goal format: <origin>/overlay/<walletAddress>?widget=goal#key=<overlayToken>
 */

/**
 * Builds the tip-alert OBS overlay URL for a creator.
 * Returns null if either required argument is missing.
 */
export function buildOverlayUrl(
  walletAddress: string | null | undefined,
  overlayToken: string | null | undefined
): string | null {
  if (!walletAddress || !overlayToken) return null;
  return `${window.location.origin}/overlay/${encodeURIComponent(walletAddress)}#key=${encodeURIComponent(overlayToken)}`;
}

/**
 * Builds the tipping-goal widget OBS overlay URL for a creator.
 * Returns null if either required argument is missing.
 */
export function buildGoalOverlayUrl(
  walletAddress: string | null | undefined,
  overlayToken: string | null | undefined
): string | null {
  if (!walletAddress || !overlayToken) return null;
  return `${window.location.origin}/overlay/${encodeURIComponent(walletAddress)}?widget=goal#key=${encodeURIComponent(overlayToken)}`;
}
