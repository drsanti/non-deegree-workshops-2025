/**
 * TypeScript type definitions for signal data
 */

export type SignalType = 'sine' | 'square' | 'sawtooth';

export interface SignalParams {
  frequency: number; // Hz
  amplitude: number;
  phase: number; // radians
  sampleRate: number; // samples per second
  duration: number; // seconds
}

export interface SignalDataPoint {
  time: number; // seconds
  value: number;
}

export interface SignalData {
  type: SignalType;
  params: SignalParams;
  dataPoints: SignalDataPoint[];
}

export interface SignalConfig {
  type: SignalType;
  params: SignalParams;
}

