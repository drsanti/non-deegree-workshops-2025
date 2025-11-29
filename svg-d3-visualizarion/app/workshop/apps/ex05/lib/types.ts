export interface DataPoint {
  time: number;
  value: number;
}

export type SignalType = "sine" | "square" | "sawtooth";

export interface SignalParams {
  frequency: number;
  amplitude: number;
  phase: number;
  sampleRate: number;
  duration: number;
  noiseLevel: number;
}
