"use client";

/**
 * Generates a square wave signal
 * @param points Number of data points to generate
 * @param cycles Number of complete cycles in the signal (default: 4)
 * @param amplitude Peak amplitude value (default: 1)
 * @returns Array of square wave values alternating between +amplitude and -amplitude
 */
export const generateSquareWave = (
  points: number,
  cycles: number = 4,
  amplitude: number = 1
): number[] => {
  const dataPoints: number[] = [];
  const pointsPerCycle = points / cycles;

  for (let i = 0; i < points; i++) {
    const positionInCycle = (i % pointsPerCycle) / pointsPerCycle;
    const value = positionInCycle < 0.5 ? amplitude : -amplitude;
    dataPoints.push(value);
  }
  return dataPoints;
};

/**
 * Generates a sine wave signal
 * @param points Number of data points to generate
 * @param cycles Number of complete cycles in the signal (default: 4)
 * @param amplitude Peak amplitude value (default: 1)
 * @param phase Phase offset in radians (default: 0)
 * @returns Array of sine wave values following sinusoidal oscillation
 */
export const generateSineWave = (
  points: number,
  cycles: number = 4,
  amplitude: number = 1,
  phase: number = 0
): number[] => {
  const dataPoints: number[] = [];
  const pointsPerCycle = points / cycles;

  for (let i = 0; i < points; i++) {
    const positionInCycle = (i % pointsPerCycle) / pointsPerCycle;
    const value = amplitude * Math.sin(2 * Math.PI * positionInCycle + phase);
    dataPoints.push(value);
  }
  return dataPoints;
};

/**
 * Generates a sawtooth wave signal
 * @param points Number of data points to generate
 * @param cycles Number of complete cycles in the signal (default: 4)
 * @param amplitude Peak amplitude value (default: 1)
 * @returns Array of sawtooth wave values with linear rise and instant drop
 */
export const generateSawtoothWave = (
  points: number,
  cycles: number = 4,
  amplitude: number = 1
): number[] => {
  const dataPoints: number[] = [];
  const pointsPerCycle = points / cycles;

  for (let i = 0; i < points; i++) {
    const positionInCycle = (i % pointsPerCycle) / pointsPerCycle;
    // Linear rise from -amplitude to +amplitude, then instant drop
    const value = amplitude * (2 * positionInCycle - 1);
    dataPoints.push(value);
  }
  return dataPoints;
};

/**
 * Generates a triangle wave signal
 * @param points Number of data points to generate
 * @param cycles Number of complete cycles in the signal (default: 4)
 * @param amplitude Peak amplitude value (default: 1)
 * @returns Array of triangle wave values with symmetric rise and fall
 */
export const generateTriangleWave = (
  points: number,
  cycles: number = 4,
  amplitude: number = 1
): number[] => {
  const dataPoints: number[] = [];
  const pointsPerCycle = points / cycles;

  for (let i = 0; i < points; i++) {
    const positionInCycle = (i % pointsPerCycle) / pointsPerCycle;
    // Symmetric triangle: rise then fall
    const value =
      positionInCycle < 0.5
        ? amplitude * (4 * positionInCycle - 1) // Rise from -amplitude to +amplitude
        : amplitude * (3 - 4 * positionInCycle); // Fall from +amplitude to -amplitude
    dataPoints.push(value);
  }
  return dataPoints;
};

/**
 * Generates a pulse wave signal
 * @param points Number of data points to generate
 * @param cycles Number of complete cycles in the signal (default: 4)
 * @param amplitude Peak amplitude value (default: 1)
 * @param dutyCycle Duty cycle ratio (0-1), portion of cycle at high value (default: 0.5)
 * @returns Array of pulse wave values with configurable duty cycle
 */
export const generatePulseWave = (
  points: number,
  cycles: number = 4,
  amplitude: number = 1,
  dutyCycle: number = 0.5
): number[] => {
  const dataPoints: number[] = [];
  const pointsPerCycle = points / cycles;

  for (let i = 0; i < points; i++) {
    const positionInCycle = (i % pointsPerCycle) / pointsPerCycle;
    // Pulse: high for dutyCycle portion, low for rest
    const value = positionInCycle < dutyCycle ? amplitude : 0;
    dataPoints.push(value);
  }
  return dataPoints;
};

// Noise Generation Functions

/**
 * Generates Gaussian (white) noise using Box-Muller transform
 * @param length Number of noise samples to generate
 * @param mean Mean value of the noise (default: 0)
 * @param stdDev Standard deviation of the noise (default: 0.1)
 * @returns Array of noise values following normal distribution
 */
export const generateGaussianNoise = (
  length: number,
  mean: number = 0,
  stdDev: number = 0.1
): number[] => {
  const noise: number[] = [];
  for (let i = 0; i < length; i++) {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    noise.push(mean + z0 * stdDev);
  }
  return noise;
};

/**
 * Generates uniform noise (white noise with uniform distribution)
 * @param length Number of noise samples to generate
 * @param min Minimum value (default: -1)
 * @param max Maximum value (default: 1)
 * @returns Array of noise values following uniform distribution
 */
export const generateUniformNoise = (
  length: number,
  min: number = -1,
  max: number = 1
): number[] => {
  const noise: number[] = [];
  const range = max - min;
  for (let i = 0; i < length; i++) {
    noise.push(min + Math.random() * range);
  }
  return noise;
};

/**
 * Generates pink noise (1/f noise) - noise with power spectral density inversely proportional to frequency
 * @param length Number of noise samples to generate
 * @param amplitude Amplitude scaling factor (default: 1)
 * @returns Array of pink noise values
 */
export const generatePinkNoise = (
  length: number,
  amplitude: number = 1
): number[] => {
  const noise: number[] = [];
  let b0 = 0,
    b1 = 0,
    b2 = 0,
    b3 = 0,
    b4 = 0,
    b5 = 0,
    b6 = 0;

  for (let i = 0; i < length; i++) {
    // Pink noise filter (Paul Kellet's method)
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    b6 = white * 0.115926;
    noise.push(pink * amplitude);
  }
  return noise;
};

/**
 * Generates brown noise (1/f² noise) - noise with power spectral density inversely proportional to frequency squared
 * @param length Number of noise samples to generate
 * @param amplitude Amplitude scaling factor (default: 1)
 * @returns Array of brown noise values
 */
export const generateBrownNoise = (
  length: number,
  amplitude: number = 1
): number[] => {
  const noise: number[] = [];
  let lastValue = 0;

  for (let i = 0; i < length; i++) {
    // Brown noise: integrate white noise
    const white = (Math.random() * 2 - 1) * amplitude;
    lastValue = lastValue * 0.99 + white * 0.1;
    noise.push(lastValue);
  }
  return noise;
};

/**
 * Adds noise to a signal array
 * @param signal Original signal array
 * @param noise Noise array to add (must be same length as signal)
 * @param noiseLevel Scaling factor for noise (default: 1)
 * @returns Signal array with noise added
 */
export const addNoiseToSignal = (
  signal: number[],
  noise: number[],
  noiseLevel: number = 1
): number[] => {
  if (signal.length !== noise.length) {
    throw new Error("Signal and noise arrays must have the same length");
  }
  return signal.map((value, i) => value + noise[i] * noiseLevel);
};

/**
 * Generates noise and adds it to a signal in one step
 * @param signal Original signal array
 * @param noiseType Type of noise to generate ('gaussian', 'uniform', 'pink', 'brown')
 * @param noiseLevel Noise level/amplitude (default: 0.1)
 * @param options Additional options for noise generation
 * @returns Signal array with noise added
 */
export const addNoiseToSignalByType = (
  signal: number[],
  noiseType: "gaussian" | "uniform" | "pink" | "brown" = "gaussian",
  noiseLevel: number = 0.1,
  options?: {
    mean?: number;
    stdDev?: number;
    min?: number;
    max?: number;
  }
): number[] => {
  let noise: number[];

  switch (noiseType) {
    case "gaussian":
      noise = generateGaussianNoise(
        signal.length,
        options?.mean ?? 0,
        options?.stdDev ?? noiseLevel
      );
      break;
    case "uniform":
      noise = generateUniformNoise(
        signal.length,
        options?.min ?? -noiseLevel,
        options?.max ?? noiseLevel
      );
      break;
    case "pink":
      noise = generatePinkNoise(signal.length, noiseLevel);
      break;
    case "brown":
      noise = generateBrownNoise(signal.length, noiseLevel);
      break;
    default:
      noise = generateGaussianNoise(signal.length, 0, noiseLevel);
  }

  return addNoiseToSignal(signal, noise, 1);
};
