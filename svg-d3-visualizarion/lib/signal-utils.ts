/**
 * Signal generation and utility functions
 */

import type { SignalType, SignalParams, SignalDataPoint } from '@/types/signal';

/**
 * Generate a sine wave signal
 */
function generateSineWave(params: SignalParams): SignalDataPoint[] {
  const { frequency, amplitude, phase, sampleRate, duration } = params;
  const dataPoints: SignalDataPoint[] = [];
  const numSamples = Math.floor(sampleRate * duration);
  const timeStep = 1 / sampleRate;

  for (let i = 0; i < numSamples; i++) {
    const time = i * timeStep;
    const value = amplitude * Math.sin(2 * Math.PI * frequency * time + phase);
    dataPoints.push({ time, value });
  }

  return dataPoints;
}

/**
 * Generate a square wave signal
 */
function generateSquareWave(params: SignalParams): SignalDataPoint[] {
  const { frequency, amplitude, phase, sampleRate, duration } = params;
  const dataPoints: SignalDataPoint[] = [];
  const numSamples = Math.floor(sampleRate * duration);
  const timeStep = 1 / sampleRate;

  for (let i = 0; i < numSamples; i++) {
    const time = i * timeStep;
    const sineValue = Math.sin(2 * Math.PI * frequency * time + phase);
    const value = amplitude * Math.sign(sineValue);
    dataPoints.push({ time, value });
  }

  return dataPoints;
}

/**
 * Generate a sawtooth wave signal
 */
function generateSawtoothWave(params: SignalParams): SignalDataPoint[] {
  const { frequency, amplitude, phase, sampleRate, duration } = params;
  const dataPoints: SignalDataPoint[] = [];
  const numSamples = Math.floor(sampleRate * duration);
  const timeStep = 1 / sampleRate;

  for (let i = 0; i < numSamples; i++) {
    const time = i * timeStep;
    const normalizedTime = (time * frequency + phase / (2 * Math.PI)) % 1;
    const value = amplitude * (2 * normalizedTime - 1);
    dataPoints.push({ time, value });
  }

  return dataPoints;
}

/**
 * Generate signal data based on type
 */
export function generateSignal(
  type: SignalType,
  params: SignalParams
): SignalDataPoint[] {
  switch (type) {
    case 'sine':
      return generateSineWave(params);
    case 'square':
      return generateSquareWave(params);
    case 'sawtooth':
      return generateSawtoothWave(params);
    default:
      throw new Error(`Unknown signal type: ${type}`);
  }
}

/**
 * Get default parameters for a signal type
 */
export function getDefaultParams(type: SignalType): SignalParams {
  const baseParams: SignalParams = {
    frequency: 1,
    amplitude: 1,
    phase: 0,
    sampleRate: 100,
    duration: 2,
  };

  // Type-specific defaults
  switch (type) {
    case 'sine':
      return { ...baseParams, frequency: 1, amplitude: 1 };
    case 'square':
      return { ...baseParams, frequency: 1, amplitude: 1 };
    case 'sawtooth':
      return { ...baseParams, frequency: 1, amplitude: 1 };
    default:
      return baseParams;
  }
}

/**
 * Validate signal parameters
 */
export function validateParams(params: SignalParams): boolean {
  return (
    params.frequency > 0 &&
    params.amplitude > 0 &&
    params.sampleRate > 0 &&
    params.duration > 0 &&
    Number.isFinite(params.phase)
  );
}

/**
 * Convert phase from degrees to radians
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert phase from radians to degrees
 */
export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

