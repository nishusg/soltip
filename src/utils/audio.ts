import { logger } from "./logger";

/**
 * Synthesizes browser-native sounds using oscillators and gains.
 * Supports presets: "ding", "swoosh", "chime", "fanfare", "laser", "retro_game"
 */
export function playSyntheticSound(presetName: string, volume: number): void {
  try {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxClass) {
      logger.warn("Web Audio API is not supported in this browser environment.");
      return;
    }
    const ctx = new AudioCtxClass();
    const now = ctx.currentTime;

    if (presetName === "ding") {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now); // A5

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1200, now); // Metallic overtone

      gainNode.gain.setValueAtTime(volume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(now + 1.2);
      osc2.stop(now + 1.2);
    } else if (presetName === "swoosh") {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.6);

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(now + 0.6);
    } else if (presetName === "chime") {
      const playNote = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        gainNode.gain.setValueAtTime(volume, start);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration - 0.02);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };
      playNote(523.25, now, 0.15); // C5
      playNote(659.25, now + 0.12, 0.15); // E5
      playNote(783.99, now + 0.24, 0.15); // G5
      playNote(1046.50, now + 0.36, 0.4); // C6
    } else if (presetName === "fanfare") {
      const playNote = (freq: number, start: number, duration: number, type: OscillatorType = "triangle") => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        gainNode.gain.setValueAtTime(volume * 0.4, start);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration - 0.05);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };
      playNote(587.33, now, 0.25); // D5
      playNote(659.25, now + 0.25, 0.25); // E5
      playNote(783.99, now + 0.5, 0.25); // G5
      playNote(987.77, now + 0.75, 0.8, "sine"); // B5
      playNote(1174.66, now + 0.75, 0.8, "sine"); // D6
      playNote(1318.51, now + 0.75, 0.8, "triangle"); // E6
    } else if (presetName === "laser") {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(1500, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.4);
      gainNode.gain.setValueAtTime(volume * 0.4, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.4);
    } else if (presetName === "retro_game") {
      const playCoinNote = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, start);
        gainNode.gain.setValueAtTime(volume * 0.3, start);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration - 0.01);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };
      playCoinNote(987.77, now, 0.08); // B5
      playCoinNote(1318.51, now + 0.08, 0.35); // E6
    }
  } catch (e) {
    logger.error("Sound synthesis playback error:", e);
  }
}
