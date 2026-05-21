// ============================================================================
// Logger Utility — utils/logger.ts
// ============================================================================
//
// Centralized logging utility that suppresses verbose output in production
// while preserving error reporting. Use this instead of raw `console.*` calls.
//
// Usage:
//   import { logger } from "../utils/logger";
//   logger.log("Debug info");        // Only shows in dev
//   logger.warn("Heads up");         // Only shows in dev
//   logger.error("Something broke"); // Always shows
// ============================================================================

const isDev = import.meta.env.DEV;

export const logger = {
  /** Debug-level logging — suppressed in production builds */
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },

  /** Warning-level logging — suppressed in production builds */
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },

  /** Error-level logging — always shown, even in production */
  error: (...args: unknown[]) => {
    console.error(...args);
  },
};
