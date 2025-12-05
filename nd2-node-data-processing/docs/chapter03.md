# Chapter 3: Noise and Signal Characteristics

## Overview

All real-world sensor signals contain noise - random variations that obscure the true signal. Understanding noise characteristics is crucial for designing effective signal processing systems and interpreting sensor data correctly. This chapter explores different types of noise, their sources, and methods for characterizing signal quality.

## Learning Objectives

By the end of this chapter, you will:
- Understand different types of noise in sensor systems
- Learn about Signal-to-Noise Ratio (SNR)
- Generate realistic noisy signals
- Detect and characterize outliers
- Measure noise properties statistically
- Visualize noise characteristics and their effects on signals

## Types of Noise

### 1. White Noise (Gaussian Noise)

**Characteristics**:
- Constant power spectral density across all frequencies
- Normal (Gaussian) distribution
- Mean = 0, variance = σ²
- Most common in electronic circuits

**Sources**:
- Thermal noise (Johnson-Nyquist noise)
- Shot noise in semiconductors
- Amplifier noise

**Mathematical Model**:
```
n(t) ~ N(0, σ²)
```

### 2. Pink Noise (1/f Noise)

**Characteristics**:
- Power spectral density inversely proportional to frequency
- More energy at low frequencies
- Common in natural phenomena

**Sources**:
- Electronic components (resistors, transistors)
- Biological systems
- Environmental variations

**Properties**:
- Equal energy per octave
- Frequency spectrum: S(f) ∝ 1/f^α where α ≈ 1

### 3. Uniform Noise

**Characteristics**:
- All values in a range equally likely
- Flat probability distribution
- Bounded by [a, b]

**Sources**:
- Quantization noise in ADC
- Rounding errors
- Discretization effects

**Mathematical Model**:
```
n(t) ~ U(a, b)
Mean = (a + b) / 2
Variance = (b - a)² / 12
```

### 4. Impulse Noise (Salt-and-Pepper Noise)

**Characteristics**:
- Sporadic, large-amplitude spikes
- Rare occurrences
- Often symmetric (positive and negative)

**Sources**:
- Electromagnetic interference (EMI)
- Power line transients
- Sensor glitches
- Communication errors

### 5. Drift Noise

**Characteristics**:
- Slow, continuous change in baseline
- Low-frequency component
- Non-stationary

**Sources**:
- Temperature changes
- Component aging
- Sensor calibration drift
- Environmental factors

## Signal-to-Noise Ratio (SNR)

### Definition

SNR quantifies the ratio of signal power to noise power:

```
SNR = P_signal / P_noise
SNR_dB = 10 × log₁₀(P_signal / P_noise)
```

For voltage/amplitude signals:
```
SNR_dB = 20 × log₁₀(A_signal / A_noise)
```

### Interpretation

| SNR (dB) | Quality | Description |
|----------|---------|-------------|
| > 40 dB | Excellent | Noise barely noticeable |
| 30-40 dB | Good | Acceptable for most applications |
| 20-30 dB | Fair | Noise visible but manageable |
| 10-20 dB | Poor | Significant noise interference |
| < 10 dB | Very Poor | Signal buried in noise |

### Practical Implications

- **High SNR**: Easy signal processing, accurate measurements
- **Low SNR**: Requires advanced filtering, may limit accuracy
- **Sensor Selection**: Consider SNR specifications
- **System Design**: Minimize noise sources, optimize signal amplification

## Noise Statistics

### Key Metrics

1. **Mean (μ)**: Average value (should be ≈ 0 for pure noise)
2. **Standard Deviation (σ)**: Measure of noise amplitude
3. **Variance (σ²)**: Power of noise
4. **RMS (Root Mean Square)**: Effective noise level
5. **Peak-to-Peak**: Maximum noise excursion

### Probability Distributions

- **Gaussian**: Bell curve, 68-95-99.7 rule
- **Uniform**: Flat, predictable bounds
- **Exponential**: Waiting times, decay processes
- **Rayleigh**: Magnitude of complex Gaussian

## Outlier Detection

### What are Outliers?

Data points that deviate significantly from the normal pattern:
- Measurement errors
- Sensor malfunctions
- Genuine extreme events
- Interference/glitches

### Detection Methods

#### 1. Standard Deviation Method
```
Outlier if: |x - μ| > k × σ
Common threshold: k = 3 (3-sigma rule)
```

#### 2. Interquartile Range (IQR) Method
```
Q1 = 25th percentile
Q3 = 75th percentile
IQR = Q3 - Q1
Outlier if: x < Q1 - 1.5×IQR or x > Q3 + 1.5×IQR
```

#### 3. Z-Score Method
```
z = (x - μ) / σ
Outlier if: |z| > threshold (typically 3)
```

## Noise Sources in IoT Sensors

### Environmental Noise
- Temperature fluctuations
- Humidity changes
- Vibrations
- Electromagnetic interference

### Sensor-Specific Noise
- **Temperature sensors**: Thermal noise, self-heating
- **Accelerometers**: Mechanical noise, bias instability
- **Pressure sensors**: Hysteresis, drift
- **Current sensors**: Magnetic interference, aliasing

### System-Level Noise
- Power supply noise
- Ground loops
- Cable capacitance
- Digital switching noise

## Practical Considerations

### Noise Reduction Strategies

1. **Hardware**:
   - Shielding and grounding
   - Twisted-pair cables
   - Low-noise amplifiers
   - Proper PCB layout

2. **Software**:
   - Digital filtering
   - Averaging
   - Outlier rejection
   - Adaptive algorithms

3. **Operational**:
   - Regular calibration
   - Environmental control
   - Proper sensor placement
   - Maintenance schedules

## Code Implementation

The `chapter03.ts` file demonstrates:
- Generating signals with different noise types
- Calculating SNR for various noise levels
- Statistical noise analysis
- Outlier detection algorithms
- Adding realistic noise to sensor signals
- Comprehensive noise visualization

## Visualizations

We create plots showing:
1. **Different Noise Types**: White, pink, uniform, impulse
2. **SNR Comparison**: Same signal with varying noise levels
3. **Noise Histograms**: Distribution analysis
4. **Outlier Detection**: Highlighting anomalous points
5. **Time-Domain Analysis**: Noise effects on sensor readings

## Key Takeaways

1. **All Real Signals Have Noise**: Design systems to handle it
2. **SNR is Critical**: Determines measurement accuracy
3. **Know Your Noise**: Different types require different approaches
4. **Statistics Matter**: Use proper metrics to characterize noise
5. **Outliers Need Attention**: Detect and handle appropriately
6. **Prevention > Cure**: Good hardware design reduces noise

## Common Mistakes to Avoid

1. **Ignoring noise in simulations**: Real systems behave differently
2. **Assuming Gaussian noise**: Other distributions exist
3. **Over-filtering**: Can distort the signal
4. **Under-estimating drift**: Can accumulate over time
5. **Not validating outlier removal**: May remove valid data
6. **Treating all spikes as outliers**: Some may be real events

## Next Steps

In Chapter 4, we'll explore moving averages and basic smoothing techniques to reduce noise while preserving signal features.

## Running the Code

```bash
# Using npm script
npm run chapter03

# Or directly with tsx
tsx codes/chapter03.ts
```

The output visualizations will be saved to:
- `outputs/chapter03/noise-types.svg` and `.html`
- `outputs/chapter03/snr-comparison.svg` and `.html`
- `outputs/chapter03/outlier-detection.svg` and `.html`
