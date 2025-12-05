# Chapter 5: Digital Filters - Part 1 (Low-Pass Filters)

## Overview

Digital filters are essential tools for signal processing that provide precise control over frequency content. Unlike simple moving averages, digital filters can be designed with specific frequency response characteristics. This chapter focuses on low-pass filters, which remove high-frequency noise while preserving low-frequency signal components.

## Learning Objectives

By the end of this chapter, you will:
- Understand digital filter fundamentals
- Learn about Butterworth low-pass filter design
- Implement simple RC low-pass filters
- Design filters with specific cutoff frequencies
- Compare filter performance characteristics
- Apply filters to sensor data
- Visualize frequency responses

## What is a Digital Filter?

A **digital filter** is a computational algorithm that processes discrete-time signals to:
- Remove unwanted frequency components (noise)
- Extract desired frequency bands
- Reshape signal spectrum
- Enhance specific features

### Filter Types by Frequency Response

1. **Low-Pass Filter (LPF)**: Passes low frequencies, attenuates high frequencies
2. **High-Pass Filter (HPF)**: Passes high frequencies, attenuates low frequencies (Chapter 6)
3. **Band-Pass Filter (BPF)**: Passes a specific frequency band (Chapter 6)
4. **Band-Stop Filter (Notch)**: Attenuates a specific frequency band (Chapter 6)

## Low-Pass Filter Applications

### IoT and Industrial Sensors

1. **Anti-Aliasing**: Remove frequencies above Nyquist before sampling
2. **Noise Reduction**: Eliminate high-frequency sensor noise
3. **Signal Smoothing**: Remove rapid fluctuations
4. **Measurement Conditioning**: Improve signal quality for control systems

### Common Use Cases

- Temperature sensors: Remove thermal noise
- Pressure sensors: Eliminate vibration-induced noise
- Accelerometers: Extract DC component (tilt)
- Current sensors: Remove switching noise
- Voltage sensors: Filter power line interference

## Filter Characteristics

### Key Parameters

#### 1. Cutoff Frequency (fc)
The frequency at which the filter response is -3 dB (0.707 or ~70.7% of passband).

```
fc = frequency where gain drops to 0.707
```

#### 2. Filter Order (n)
Determines the sharpness of the transition:
- **1st order**: 20 dB/decade rolloff
- **2nd order**: 40 dB/decade rolloff
- **4th order**: 80 dB/decade rolloff

Higher order = sharper transition but more computation.

#### 3. Passband
Frequency range where signals pass with minimal attenuation.

#### 4. Stopband
Frequency range where signals are significantly attenuated.

#### 5. Transition Band
Region between passband and stopband.

### Frequency Response

Describes how the filter affects different frequencies:

```
H(f) = Output amplitude / Input amplitude at frequency f
```

Measured in:
- **Linear scale**: 0 to 1
- **Decibels (dB)**: 20 × log₁₀(H(f))

### Phase Response

The delay introduced at each frequency. Low-pass filters always introduce phase lag.

## Butterworth Filter

The **Butterworth filter** is a classic filter design with:
- Maximally flat passband (no ripples)
- Smooth frequency response
- Monotonic rolloff in stopband

### Transfer Function

For a 1st order digital Butterworth filter:

```
H(z) = b₀ / (1 - a₁z⁻¹)
```

Where coefficients depend on cutoff frequency and sampling rate.

### Design Equations

For a 1st order low-pass Butterworth:

```
ωc = 2πfc / fs  (normalized cutoff frequency)
α = 1 / (1 + 2πfc/fs)

b₀ = (1 - α)
a₁ = α
```

The difference equation:
```
y[n] = b₀ × x[n] + a₁ × y[n-1]
```

### Higher Order Filters

- **2nd order**: Cascade two 1st order sections or use biquad
- **4th order**: Cascade two 2nd order sections
- **8th order**: Cascade four 2nd order sections

## Simple RC Low-Pass Filter

The digital equivalent of an analog RC (resistor-capacitor) circuit.

### Analog RC Filter

```
τ = R × C  (time constant)
fc = 1 / (2πRC)
```

### Digital Approximation

```
α = Δt / (RC + Δt)
y[n] = α × x[n] + (1 - α) × y[n-1]
```

Where Δt = 1/fs (sampling interval).

**Note**: This is identical to the Exponential Moving Average (EMA) from Chapter 4!

### Characteristics

- 1st order filter (20 dB/decade)
- Simple, efficient computation
- Good for general smoothing
- Similar to EMA with α = 1/(RC×fs + 1)

## Filter Design Process

### Step 1: Define Requirements

- What is the signal frequency range?
- What is the noise frequency range?
- Required attenuation in stopband?
- Acceptable passband ripple?

### Step 2: Choose Cutoff Frequency

```
fc should be:
- Above highest signal frequency
- Below lowest noise frequency
- Consider transition band width
```

**Rule of Thumb**:
```
fc ≈ 0.1 to 0.5 × sampling_rate
```

### Step 3: Select Filter Order

- **1st order**: Simple, low computation
- **2nd order**: Good transition, moderate computation
- **4th order**: Sharp transition, higher computation

### Step 4: Implement and Test

- Apply to test signals
- Check frequency response
- Verify phase lag is acceptable
- Measure noise reduction

## Filter Performance Metrics

### 1. Attenuation

Reduction in amplitude at specific frequencies:
```
Attenuation (dB) = 20 × log₁₀(H(f))
```

### 2. Rolloff Rate

How quickly the filter attenuates beyond cutoff:
```
Rolloff = -20n dB/decade

n = filter order
```

### 3. Group Delay

Average delay across frequencies:
```
Lower order filters have less delay
```

### 4. Noise Reduction

Ratio of noise power before/after filtering:
```
SNR improvement (dB) = 10 × log₁₀(Noise_before / Noise_after)
```

## Practical Considerations

### Sampling Rate Requirements

For accurate filter performance:
```
fs ≥ 10 × fc  (minimum)
fs ≥ 20 × fc  (recommended)
```

### Initial Conditions

- First output samples may have transients
- Allow for "warm-up" period
- Initialize with first input value or zero

### Real-Time Implementation

**Advantages**:
- Causal (only uses past data)
- Constant computational load
- Low memory requirements

**Disadvantages**:
- Introduces delay
- Cannot look ahead
- Phase distortion

### Frequency Domain vs. Time Domain

**Time Domain** (this chapter):
- Direct difference equations
- Efficient for real-time
- Easy to implement

**Frequency Domain** (FFT-based):
- Better for batch processing
- Can achieve zero phase
- More complex implementation

## Butterworth vs. Other Filters

| Filter Type | Passband | Transition | Phase | Best For |
|-------------|----------|------------|-------|----------|
| Butterworth | Flat | Moderate | Nonlinear | General purpose |
| Chebyshev | Ripples | Sharp | Nonlinear | Steep cutoff needed |
| Bessel | Slightly droopy | Gradual | Linear | Preserve waveform |
| Elliptic | Ripples | Very sharp | Nonlinear | Minimum order |

## Common Mistakes to Avoid

1. **Cutoff frequency too low**: Over-smoothing, signal distortion
2. **Cutoff frequency too high**: Insufficient noise reduction
3. **Filter order too high**: Excessive phase lag, instability
4. **Ignoring sampling rate**: Incorrect filter behavior
5. **No transient handling**: Artifacts at start of data
6. **Cascading too many filters**: Cumulative phase distortion

## Code Implementation

The `chapter05.ts` file demonstrates:
- 1st, 2nd, and 4th order Butterworth filters
- Simple RC low-pass filter
- Frequency response calculation
- Filter design for different cutoff frequencies
- Application to sensor data with noise
- Performance comparison

## Visualizations

We create plots showing:
1. **Frequency Response**: Magnitude and phase plots
2. **Time Domain Filtering**: Before/after comparison
3. **Filter Order Comparison**: 1st vs 2nd vs 4th order
4. **Cutoff Frequency Effects**: Different fc values
5. **Sensor Application**: Real-world scenario

## Key Takeaways

1. **Low-pass filters remove high-frequency noise**
2. **Cutoff frequency is the key design parameter**
3. **Higher order = sharper transition but more lag**
4. **Butterworth provides flat passband response**
5. **RC filter is simple and effective for basic smoothing**
6. **Sampling rate must be sufficiently high**
7. **All filters introduce phase lag**
8. **Design based on signal and noise frequencies**

## Comparison with Moving Averages

| Aspect | Moving Average | Low-Pass Filter |
|--------|----------------|-----------------|
| Design | Window size | Cutoff frequency |
| Frequency Response | Irregular | Smooth, predictable |
| Phase | Linear | Nonlinear |
| Computation | Simple | Moderate |
| Control | Limited | Precise |

**When to use which**:
- **Moving Average**: Quick smoothing, simple implementation
- **Digital Filter**: Precise frequency control, better performance

## Next Steps

In Chapter 6, we'll explore high-pass and band-pass filters, which allow us to extract specific frequency ranges and remove drift and DC offsets.

## Running the Code

```bash
# Using npm script
npm run chapter05

# Or directly with tsx
tsx codes/chapter05.ts
```

The output visualizations will be saved to:
- `outputs/chapter05/frequency-response.svg` and `.html`
- `outputs/chapter05/time-domain-filtering.svg` and `.html`
- `outputs/chapter05/filter-order-comparison.svg` and `.html`
