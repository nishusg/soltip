// ============================================================================
// Shared Type Definitions — types/index.ts
// ============================================================================
//
// Centralized TypeScript interfaces used across the frontend.
// All API response shapes, state models, and shared data structures live here
// to ensure type consistency and eliminate `any` usage.
// ============================================================================

// ---------------------------------------------------------------------------
// User / Creator types
// ---------------------------------------------------------------------------

/** Social media link configuration for a creator profile */
export interface UserSocials {
  twitter?: string;
  twitch?: string;
  youtube?: string;
  kick?: string;
  discord?: string;
}

/** Stream embed configuration for a creator's public profile */
export interface StreamEmbed {
  platform?: string;
  channel?: string;
}

/** Authenticated user returned by GET /creators/me */
export interface User {
  wallet_address: string;
  name?: string;
  username?: string;
  bio?: string;
  is_premium?: boolean;
  selected_theme?: string;
  total_received: number;
  total_sent: number;
  socials?: UserSocials;
  stream_embed?: StreamEmbed;
  overlay_settings?: Partial<OverlaySettings>;
}

// ---------------------------------------------------------------------------
// Tip / Transaction types
// ---------------------------------------------------------------------------

/** A single tip transaction record */
export interface Tip {
  _id?: string;
  tx_hash: string;
  sender_wallet: string;
  creator_wallet: string;
  sender_name?: string;
  creator_name?: string;
  amount: number;
  fee: number;
  message: string;
  timestamp: string;
  status: string;
}

// ---------------------------------------------------------------------------
// Dashboard types
// ---------------------------------------------------------------------------

/** Daily earnings aggregate returned by the dashboard API */
export interface DailyEarning {
  _id: string;
  total_earned: number;
  tips_count: number;
}

/** Full dashboard response from GET /stats/dashboard */
export interface DashboardData {
  user: User;
  recentTips: Tip[];
  dailyEarnings: DailyEarning[];
}

// ---------------------------------------------------------------------------
// Overlay Settings types
// ---------------------------------------------------------------------------

/** OBS overlay configuration persisted per creator */
export interface OverlaySettings {
  tts_enabled: boolean;
  tts_min_amount: number;
  tts_voice?: string;
  alert_duration: number;
  alert_gif_preset: string;
  alert_gif_url: string;
  alert_sound_preset: string;
  alert_sound_url: string;
  sound_volume: number;
  theme_color: string;
  font_family: string;
  theme: string;
  alert_animation: string;
  queue_system_enabled: boolean;
  font_size: number;
  text_effect?: string;
  goal_enabled?: boolean;
  goal_title?: string;
  goal_target?: number;
  goal_current?: number;
  special_alert_theme?: string;
  special_alert_threshold?: number;
  blocked_words?: string[];
}
