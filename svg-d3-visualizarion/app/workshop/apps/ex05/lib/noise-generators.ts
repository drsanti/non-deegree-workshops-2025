import type { DataPoint } from "./types";

export function generateGaussianNoise(
  length: number,
  mean: number = 0,
  stdDev: number = 0.1
): number[] {
  const noise: number[] = [];
  for (let i = 0; i < length; i++) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    noise.push(mean + z0 * stdDev);
  }
  return noise;
}

export function addNoiseToSignal(
  signal: DataPoint[],
  noiseLevel: number = 0.1
): DataPoint[] {
  const noise = generateGaussianNoise(signal.length, 0, noiseLevel);
  return signal.map((point, i) => ({
    time: point.time,
    value: point.value + noise[i],
  }));
}
