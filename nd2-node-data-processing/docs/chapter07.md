# Chapter 7: Fast Fourier Transform (FFT) Analysis

## Introduction to Fourier Analysis

The **Fast Fourier Transform (FFT)** is one of the most important algorithms in digital signal processing. It converts a time-domain signal into its frequency-domain representation, revealing which frequencies are present in the signal and their relative strengths.

### Why FFT Matters for IoT Sensor Data

In IoT and industrial applications, FFT analysis helps us:

- **Identify periodic patterns** that are not visible in time-domain plots
- **Detect specific frequencies** associated with machine components (motor speed, bearing frequencies, gear mesh frequencies)
- **Remove unwanted noise** by identifying interference frequencies (50/60 Hz power line noise)
- **Monitor equipment health** by tracking changes in frequency spectrum over time
- **Validate filter performance** by examining frequency response

## Time Domain vs Frequency Domain

### Time Domain
The time domain shows how a signal changes over time. This is the natural representation we're familiar with:
- X-axis: Time (seconds, milliseconds, etc.)
- Y-axis: Signal amplitude (voltage, temperature, acceleration, etc.)

**Example**: A temperature sensor reading showing how temperature varies throughout the day.

### Frequency Domain
The frequency domain shows which frequencies are present in the signal and their amplitudes:
- X-axis: Frequency (Hz)
- Y-axis: Magnitude or power (strength of each frequency component)

**Example**: FFT of vibration data showing peaks at motor rotation frequency and its harmonics.

### Why Both Views Are Important

Some phenomena are easier to understand in one domain:

- **Time Domain**: Better for seeing sudden changes, transients, outliers
- **Frequency Domain**: Better for identifying periodic components, resonances, interference

## The Fourier Transform Concept

### Mathematical Foundation

Any periodic signal can be decomposed into a sum of sine and cosine waves at different frequencies, amplitudes, and phases. This is the fundamental idea behind Fourier analysis.

For a discrete signal with N samples, the DFT (Discrete Fourier Transform) is:

$$
X[k] = \sum_{n=0}^{N-1} x[n] \cdot e^{-j2\pi kn/N}
$$

Where:
- $x[n]$ = time-domain samples
- $X[k]$ = frequency-domain coefficients
- $k$ = frequency bin index
- $N$ = total number of samples
- $j$ = imaginary unit

### FFT: The Fast Algorithm

The FFT is an efficient algorithm for computing the DFT. While a direct DFT calculation requires $O(N^2)$ operations, the FFT reduces this to $O(N \log N)$, making it practical for real-time applications.

**Key constraint**: FFT algorithms typically work best with input sizes that are powers of 2 (256, 512, 1024, 2048, etc.).

## Implementing FFT in TypeScript

### Using the fft.js Library

We'll use the `fft.js` library, which provides a clean TypeScript-compatible FFT implementation:

```typescript
import FFT from 'fft.js';

// Create FFT instance (size must be power of 2)
const size = 1024;
const fft = new FFT(size);

// Prepare input (real samples)
const input = new Array(size).fill(0);
// ... fill with your signal data ...

// Allocate output arrays
const out = fft.createComplexArray(); // [real0, imag0, real1, imag1, ...]

// Perform FFT
fft.realTransform(out, input);
fft.completeSpectrum(out); // Get full spectrum

// Calculate magnitudes
const magnitudes = new Array(size / 2);
for (let i = 0; i < size / 2; i++) {
  const real = out[2 * i];
  const imag = out[2 * i + 1];
  magnitudes[i] = Math.sqrt(real * real + imag * imag) / size;
}
```

### Frequency Bin Calculation

Each index in the FFT output corresponds to a specific frequency:

$$
f[k] = \frac{k \cdot f_s}{N}
$$

Where:
- $f[k]$ = frequency of bin k (Hz)
- $k$ = bin index (0 to N/2 for real signals)
- $f_s$ = sampling rate (Hz)
- $N$ = FFT size (number of samples)

**Example**: With sampling rate = 200 Hz and FFT size = 1024:
- Bin 0: 0 Hz (DC component)
- Bin 1: 0.195 Hz
- Bin 10: 1.95 Hz
- Bin 100: 19.5 Hz

### Frequency Resolution

The frequency resolution (spacing between bins) is:

$$
\Delta f = \frac{f_s}{N}
$$

**Trade-off**: Higher resolution requires more samples (longer time window).
- FFT size = 512, fs = 200 Hz → Δf = 0.39 Hz
- FFT size = 2048, fs = 200 Hz → Δf = 0.098 Hz

## Power Spectral Density (PSD)

The **Power Spectral Density** shows how the power of a signal is distributed across frequencies. It's calculated from the FFT magnitudes:

$$
PSD[k] = \frac{|X[k]|^2}{N \cdot f_s}
$$

Or in decibels (dB):

$$
PSD_{dB}[k] = 10 \cdot \log_{10}(PSD[k])
$$

### Interpreting PSD

- **High PSD values** indicate strong frequency components (peaks in spectrum)
- **Low PSD values** indicate weak or absent frequencies
- **dB scale** helps visualize wide dynamic ranges (e.g., -60 dB to 0 dB)

### Applications

1. **Vibration Analysis**: Identify machine operating frequencies and harmonics
2. **Noise Characterization**: Distinguish white noise (flat PSD) from colored noise
3. **Filter Design**: Verify that filters attenuate unwanted frequencies
4. **Quality Control**: Monitor frequency content changes over time

## Practical Considerations

### 1. Windowing

When analyzing finite-length signals, **windowing** reduces spectral leakage (frequency spreading):

**Common windows**:
- **Rectangular** (no window): Best frequency resolution, worst leakage
- **Hann**: Good general-purpose window
- **Hamming**: Similar to Hann, slightly different side lobes
- **Blackman**: Excellent leakage suppression, reduced resolution

```typescript
// Hann window
function hannWindow(n: number, N: number): number {
  return 0.5 * (1 - Math.cos((2 * Math.PI * n) / (N - 1)));
}

// Apply window to signal
for (let i = 0; i < signal.length; i++) {
  signal[i] *= hannWindow(i, signal.length);
}
```

### 2. Zero Padding

Adding zeros to the end of a signal increases FFT size without collecting more data:
- **Does NOT** improve frequency resolution
- **Does** provide smoother frequency plots (interpolation effect)

### 3. Nyquist Frequency

The maximum frequency that can be detected is:

$$
f_{Nyquist} = \frac{f_s}{2}
$$

**Aliasing** occurs when signal frequencies exceed the Nyquist frequency—they appear as lower frequencies.

**Example**: Sampling at 100 Hz can only detect frequencies up to 50 Hz.

### 4. DC Component

- **Bin 0** of the FFT represents the DC component (average value)
- For AC-coupled signals or signals with zero mean, this should be near zero
- Large DC components can mask other frequency content

## Workflow for FFT Analysis

1. **Generate or acquire signal** at known sampling rate
2. **Remove DC offset** if needed (subtract mean)
3. **Apply window function** to reduce leakage
4. **Pad to power of 2** if needed (zero padding)
5. **Perform FFT** using library
6. **Calculate magnitudes** from complex output
7. **Compute frequencies** for each bin
8. **Plot results** in frequency domain
9. **Calculate PSD** if power analysis is needed
10. **Identify peaks** for dominant frequencies

## Example Applications

### Motor Vibration Analysis

A motor running at 1500 RPM = 25 Hz will show:
- **Fundamental**: 25 Hz (rotation frequency)
- **Harmonics**: 50 Hz (2×), 75 Hz (3×), 100 Hz (4×)
- **Bearing frequencies**: Calculated from bearing geometry
- **Misalignment**: Side bands around fundamental

### Power Line Interference

- **50 Hz** (Europe, Asia) or **60 Hz** (Americas)
- **Harmonics**: 120 Hz, 180 Hz, 240 Hz, etc.
- **Detection**: Sharp peaks at these frequencies
- **Removal**: Notch filter after identifying exact frequency

### Temperature Sensor Drift

- **Low-frequency content** (< 0.1 Hz) indicates drift
- **High-frequency noise** (> cutoff) can be filtered
- **FFT validates filter design**: Should show attenuation at high frequencies

## Visualization Best Practices

### Time Domain Plot
- Show sufficient cycles for periodic signals
- Label axes clearly: "Time (s)" and "Amplitude (units)"
- Use appropriate time window (not too short, not too long)

### Frequency Domain Plot
- **Linear scale**: Good for seeing overall distribution
- **Log scale** (dB): Better for wide dynamic ranges
- **X-axis**: Usually 0 to Nyquist frequency
- **Mark important frequencies**: Motor speed, power line, etc.
- **Use log X-axis** if covering wide frequency range

### PSD Plot
- Always use dB scale for PSD
- Label units: "Power Spectral Density (dB/Hz)"
- Compare multiple signals on same plot
- Show frequency range of interest (may not need 0 to Nyquist)

## Summary

The Fast Fourier Transform is an essential tool for IoT sensor data analysis:

- **Transforms** time-domain signals into frequency-domain representation
- **Reveals** periodic patterns and frequency components
- **Enables** filter design validation and optimization
- **Supports** predictive maintenance through vibration analysis
- **Requires** proper sampling rate, windowing, and interpretation

In the next chapter, we'll apply FFT analysis to vibration data for predictive maintenance, identifying machine faults from their frequency signatures.

## Key Concepts

| Concept | Description | Formula |
|---------|-------------|---------|
| **FFT Size** | Number of samples (power of 2) | N = 256, 512, 1024, 2048, ... |
| **Frequency Resolution** | Spacing between frequency bins | Δf = fs / N |
| **Nyquist Frequency** | Maximum detectable frequency | fNyquist = fs / 2 |
| **Frequency Bin** | Frequency for bin k | f[k] = k × fs / N |
| **Magnitude** | Strength of frequency component | |X[k]| = √(real² + imag²) |
| **PSD** | Power per unit frequency | PSD = |X[k]|² / (N × fs) |

## Further Reading

- **Cooley-Tukey Algorithm**: The original FFT algorithm (1965)
- **Window Functions**: Detailed comparison of different windows
- **Spectral Leakage**: Understanding and mitigation techniques
- **Short-Time Fourier Transform (STFT)**: For time-varying frequencies
- **Welch's Method**: Improved PSD estimation with overlapping windows

## Running the Code

```bash
# Using npm script
npm run chapter07

# Or directly with tsx
tsx codes/chapter07.ts
```

The output visualizations will be saved to:
- `outputs/chapter07/time-domain.svg` and `.html`
- `outputs/chapter07/frequency-domain.svg` and `.html`
- `outputs/chapter07/power-spectral-density.svg` and `.html`