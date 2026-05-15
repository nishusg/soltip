/**
 * Polyfills for Solana libraries.
 * 
 * vite-plugin-node-polyfills handles most of this, but we ensure
 * Buffer is available globally as a safety net.
 */
import { Buffer } from "buffer";

if (typeof window !== "undefined") {
  (window as any).Buffer = (window as any).Buffer || Buffer;
}
