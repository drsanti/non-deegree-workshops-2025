# Chapter 6: Digital Filters - Part 2 (High-Pass and Band-Pass)

## Overview

In Chapter 5, we explored low-pass filters for removing high-frequency noise. In this chapter, we'll study **high-pass** and **band-pass** filters, which are essential for:

- **High-pass filters**: Removing DC offset, low-frequency drift, and baseline wander
- **Band-pass filters**: Isolating specific frequency ranges of interest
- **Notch filters**: Eliminating specific unwanted frequencies (e.g., 50/60 Hz power line interference)

These filters are crucial for industrial sensor applications where signals may contain unwanted low-frequency trends or specific interference frequencies.

## High-Pass Filters

### What Do High-Pass Filters Do?

High-pass filters **allow high frequencies to pass** while **attenuating low frequencies** below the cutoff frequency. They are the inverse of low-pass filters.

**Common applications:**
- Removing DC offset from AC signals
- Eliminating sensor drift (slow baseline changes)
- Removing low-frequency vibrations from accelerometer data
- AC coupling in signal processing

### Butterworth High-Pass Filter Design

A high-pass Butterworth filter can be designed by transforming a low-pass prototype:

**1st Order High-Pass Transfer Function:**
```
H(s) = s / (s + ωc)
```

Where:
- `s` = complex frequency variable
- `ωc` = cutoff angular frequency (2πfc)

**Using Bilinear Transform for Digital Implementation:**

For a 1st order high-pass filter at cutoff frequency `fc`:

```typescript
const wc = tan(π * fc / fs)
const k = 1 + wc

b0 = 1 / k
b1 = -1 / k
a1 = (wc - 1) / k
```

**2nd Order High-Pass Filter:**

Similar to low-pass but with high-pass transformation:

```typescript
const wc = tan(π * fc / fs)
const wc2 = wc²
const √2 = sqrt(2)
const k = 1 + √2 * wc + wc2

b0 = 1 / k
b1 = -2 / k
b2 = 1 / k
a1 = (2 * wc2 - 2) / k
a2 = (1 - √2 * wc + wc2) / k
```

### When to Use High-Pass Filters

| Application | Cutoff Frequency | Reason |
|-------------|------------------|---------|
| DC removal | 0.1 - 1 Hz | Remove constant offset |
| Baseline drift | 0.01 - 0.1 Hz | Remove slow wandering |
| Accelerometer processing | 0.5 - 5 Hz | Remove gravity component |
| ECG signal processing | 0.5 Hz | Remove baseline wander |
| AC coupling | 10 - 100 Hz | Block DC, pass AC |

## Band-Pass Filters

### What Do Band-Pass Filters Do?

Band-pass filters **allow a specific range of frequencies to pass** while attenuating frequencies both below and above this range.

**Key parameters:**
- **Lower cutoff frequency (f1)**: Lower bound of passband
- **Upper cutoff frequency (f2)**: Upper bound of passband
- **Center frequency (fc)**: fc = √(f1 × f2)
- **Bandwidth (BW)**: BW = f2 - f1
- **Quality factor (Q)**: Q = fc / BW

### Designing Band-Pass Filters

**Method 1: Cascade Low-Pass and High-Pass**

The simplest approach is to cascade a high-pass filter (with cutoff f1) and a low-pass filter (with cutoff f2):

```
Signal → High-Pass (f1) → Low-Pass (f2) → Output
```

**Method 2: Direct Band-Pass Design**

For a 2nd order band-pass filter:

```typescript
const fc = sqrt(f1 * f2)  // Center frequency
const BW = f2 - f1         // Bandwidth
const Q = fc / BW          // Quality factor

const wc = tan(π * fc / fs)
const k = 1 + wc/Q + wc²

b0 = (wc / Q) / k
b1 = 0
b2 = -(wc / Q) / k
a1 = (2 * wc² - 2) / k
a2 = (1 - wc/Q + wc²) / k
```

### Band-Pass Filter Applications

| Application | Frequency Range | Purpose |
|-------------|-----------------|---------|
| Voice processing | 300 - 3400 Hz | Telephone quality audio |
| Bearing fault detection | 500 - 5000 Hz | Detect bearing defects |
| Power quality | 45 - 65 Hz | Isolate 50/60 Hz signal |
| Vibration monitoring | 10 - 1000 Hz | Machine health monitoring |
| Biomedical signals | 0.5 - 40 Hz | EEG/EMG processing |

## Notch Filters

### What Do Notch Filters Do?

Notch filters (also called band-stop or band-reject filters) **remove a narrow band of frequencies** while passing all other frequencies. They are the inverse of band-pass filters.

**Primary use case: Power Line Interference Removal**
- Remove 50 Hz (Europe, Asia, Africa)
- Remove 60 Hz (Americas)
- Remove harmonics (100 Hz, 120 Hz, etc.)

### 2nd Order Notch Filter Design

For a notch filter at frequency `fn` with Q factor:

```typescript
const wn = tan(π * fn / fs)
const wn2 = wn²
const k = 1 + wn/Q + wn2

b0 = (1 + wn2) / k
b1 = (2 * wn2 - 2) / k
b2 = (1 + wn2) / k
a1 = (2 * wn2 - 2) / k
a2 = (1 - wn/Q + wn2) / k
```

**Q Factor Selection:**
- **High Q (e.g., 30)**: Very narrow notch, precise frequency removal
- **Low Q (e.g., 5)**: Wider notch, more aggressive removal but affects nearby frequencies

### Notch Filter Applications

| Interference Source | Frequency | Solution |
|---------------------|-----------|----------|
| AC power line | 50/60 Hz | Notch filter at fundamental |
| Power harmonics | 100/120/150/180 Hz | Multiple notch filters |
| Equipment resonance | Variable | Adaptive notch filter |
| Radio interference | Specific frequency | Targeted notch |

## Filter Selection Guide

### Which Filter Should You Use?

```
Problem: Signal has DC offset or slow drift
→ Solution: HIGH-PASS filter (fc = 0.1 - 1 Hz)

Problem: Need to isolate specific frequency range
→ Solution: BAND-PASS filter (f1 to f2)

Problem: 50/60 Hz power line noise
→ Solution: NOTCH filter at 50 or 60 Hz

Problem: High-frequency noise
→ Solution: LOW-PASS filter (Chapter 5)
```

## Filter Cascade Considerations

When cascading multiple filters:

1. **Order matters** (usually): High-pass before low-pass for band-pass
2. **Phase accumulation**: Each filter adds phase delay
3. **Amplitude effects**: Attenuation multiplies
4. **Computational cost**: Each filter adds processing time
5. **Numerical stability**: More filters = more potential for instability

## Practical Implementation Tips

### 1. Cutoff Frequency Selection

```typescript
// Too low: Removes desired signal
// Too high: Doesn't remove interference
// Rule of thumb: Set 2-3x away from signal frequencies
```

### 2. Filter Order Selection

- **1st order**: Gentle rolloff, minimal phase distortion
- **2nd order**: Good balance, commonly used
- **4th order**: Sharp rolloff, more phase delay

### 3. Quality Factor for Band-Pass/Notch

- **Q = 1-5**: Wide band, general purpose
- **Q = 10-30**: Narrow band, precise targeting
- **Q > 30**: Very selective, but sensitive to frequency variations

## Common Mistakes to Avoid

❌ **Mistake 1**: Using high-pass filter with cutoff too high
- Removes important low-frequency signal components

❌ **Mistake 2**: Not considering filter phase response
- Can distort signal timing (important for vibration analysis)

❌ **Mistake 3**: Using narrow notch with drifting power frequency
- Power line frequency can vary (49.5-50.5 Hz), notch may miss

❌ **Mistake 4**: Cascading too many filters
- Accumulates phase delay and processing overhead

✅ **Best Practice**: Test filters on real or realistic simulated data before deployment

## Frequency Response Characteristics

### High-Pass Filter Response

```
Magnitude (dB)
     0 |           ___________
       |         /
    -20|       /
       |     /
    -40|   /
       | /
    -60|/___________________
        fc               Frequency →
```

### Band-Pass Filter Response

```
Magnitude (dB)
     0 |      _____
       |    /       \
    -20|  /           \
       |/               \
    -40|                 \
       |                   \
    -60|_____________________\____
       f1   fc            f2      →
```

### Notch Filter Response

```
Magnitude (dB)
     0 |___         ___
       |    \     /
    -20|      \ /
       |       X
    -40|      / \
       |    /     \
    -60|___         ___
           fn           →
```

## Performance Metrics

When evaluating these filters:

1. **Attenuation in stopband**: How much unwanted frequencies are reduced
2. **Passband ripple**: Variation in passband gain (should be < 0.5 dB)
3. **Transition width**: How quickly filter transitions from pass to stop
4. **Phase linearity**: Important for preserving signal shape
5. **Group delay**: Time delay introduced by filter

## Summary

In this chapter, we learned:

✓ **High-pass filters** remove DC offset and low-frequency drift
✓ **Band-pass filters** isolate specific frequency ranges
✓ **Notch filters** eliminate specific interference frequencies
✓ **Filter design** involves tradeoffs between selectivity and phase distortion
✓ **Practical considerations** include cutoff selection, Q factor, and cascade effects

## Running the Code

```bash
# Using npm script
npm run chapter06

# Or directly with tsx
tsx codes/chapter06.ts
```

The output visualizations will be saved to:
- `outputs/chapter06/filter-responses.svg` and `.html`
- `outputs/chapter06/time-domain-comparison.svg` and `.html`
- `outputs/chapter06/notch-filter-analysis.svg` and `.html`

**Next Chapter**: We'll explore **Fast Fourier Transform (FFT)** for analyzing signals in the frequency domain, which helps us understand what frequencies are present and guide filter design decisions.

## Further Reading

- "Digital Signal Processing" by Proakis & Manolakis
- "The Scientist and Engineer's Guide to Digital Signal Processing" by Steven W. Smith
- Online filter design tools: http://www.micromodeler.com/dsp/
