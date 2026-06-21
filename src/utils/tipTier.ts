/**
 * Canonical tip tier configuration based on SOL amount.
 *
 * Thresholds (in SOL):
 *   >= 5.0  → Legendary  (#ff2d55 red/pink)
 *   >= 1.0  → Epic       (#ff9500 orange)
 *   >= 0.5  → Premium    (#ffcc00 gold)
 *   >= 0.1  → Standard   (#14F195 cyan)
 *   <  0.1  → Starter    (grey)
 */
export interface TipTierConfig {
  /** Display name of the tier */
  name: "Legendary" | "Epic" | "Premium" | "Standard" | "Starter";
  /** Primary accent color hex */
  color: string;
  /** Box-shadow glow string, or "none" */
  glow: string;
  /** Full badge label with emoji */
  badge: string;
  /** Card background gradient */
  bg: string;
  /** Card border color */
  borderColor: string;
}

const TIERS: { threshold: number; config: TipTierConfig }[] = [
  {
    threshold: 5.0,
    config: {
      name: "Legendary",
      color: "#ff2d55",
      glow: "0 0 30px rgba(255, 45, 85, 0.5)",
      badge: "🏆 Legendary Support",
      bg: "linear-gradient(135deg, rgba(255, 45, 85, 0.08) 0%, rgba(11, 15, 23, 0.95) 100%)",
      borderColor: "rgba(255, 45, 85, 0.45)",
    },
  },
  {
    threshold: 1.0,
    config: {
      name: "Epic",
      color: "#ff9500",
      glow: "0 0 24px rgba(255, 149, 0, 0.4)",
      badge: "💎 Epic Support",
      bg: "linear-gradient(135deg, rgba(255, 149, 0, 0.06) 0%, rgba(11, 15, 23, 0.95) 100%)",
      borderColor: "rgba(255, 149, 0, 0.35)",
    },
  },
  {
    threshold: 0.5,
    config: {
      name: "Premium",
      color: "#ffcc00",
      glow: "0 0 18px rgba(255, 204, 0, 0.35)",
      badge: "⭐ Premium Support",
      bg: "linear-gradient(135deg, rgba(255, 204, 0, 0.04) 0%, rgba(11, 15, 23, 0.95) 100%)",
      borderColor: "rgba(255, 204, 0, 0.25)",
    },
  },
  {
    threshold: 0.1,
    config: {
      name: "Standard",
      color: "#14F195",
      glow: "0 0 14px rgba(20, 241, 149, 0.25)",
      badge: "⚡ Standard Support",
      bg: "rgba(255, 255, 255, 0.015)",
      borderColor: "rgba(20, 241, 149, 0.2)",
    },
  },
];

const STARTER_TIER: TipTierConfig = {
  name: "Starter",
  color: "rgba(255, 255, 255, 0.15)",
  glow: "none",
  badge: "🌱 Starter Support",
  bg: "rgba(255, 255, 255, 0.015)",
  borderColor: "rgba(255, 255, 255, 0.04)",
};

/**
 * Returns the full tier configuration for a given SOL amount.
 * @param amountSol - Tip amount in SOL (not lamports)
 */
export function getTipTierConfig(amountSol: number): TipTierConfig {
  if (isNaN(amountSol) || amountSol <= 0) return STARTER_TIER;
  for (const { threshold, config } of TIERS) {
    if (amountSol >= threshold) return config;
  }
  return STARTER_TIER;
}

/**
 * Returns the primary accent color for a given SOL amount.
 * Convenience wrapper used for OBS overlay alert borders.
 * @param amountSol - Tip amount in SOL (not lamports)
 */
export function getTierColor(amountSol: number): string {
  return getTipTierConfig(amountSol).color;
}
