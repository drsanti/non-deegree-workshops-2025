import type { DataPoint, SignalType, SignalParams } from "./types";

export function generateSineWave(params: SignalParams): DataPoint[] {
  const { frequency, amplitude, phase, sampleRate, duration } = params;
  const dataPoints: DataPoint[] = [];
  const numSamples = Math.floor(sampleRate * duration);
  const timeStep = 1 / sampleRate;

  for (let i = 0; i < numSamples; i++) {
    const time = i * timeStep;
    const value = amplitude * Math.sin(2 * Math.PI * frequency * time + phase);
    dataPoints.push({ time, value });
  }

  return dataPoints;
}

export function generateSquareWave(params: SignalParams): DataPoint[] {
  const { frequency, amplitude, phase, sampleRate, duration } = params;
  const dataPoints: DataPoint[] = [];
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

export function generateSawtoothWave(params: SignalParams): DataPoint[] {
  const { frequency, amplitude, phase, sampleRate, duration } = params;
  const dataPoints: DataPoint[] = [];
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

export function generateSignal(
  type: SignalType,
  params: SignalParams
): DataPoint[] {
  switch (type) {
    case "sine":
      return generateSineWave(params);
    case "square":
      return generateSquareWave(params);
    case "sawtooth":
      return generateSawtoothWave(params);
  }
}
