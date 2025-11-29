import type { SignalParams } from "./types";

export function getDefaultParams(): SignalParams {
  return {
    frequency: 1,
    amplitude: 1,
    phase: 0,
    sampleRate: 100,
    duration: 2,
    noiseLevel: 0.2,
  };
}

export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

export const signalColors: Record<string, string> = {
  sine: "#3b82f6",
  square: "#ef4444",
  sawtooth: "#10b981",
};
