# Chapter 2: Data Sampling and Time-Series Fundamentals

## Overview

This chapter explores the critical concepts of data sampling and time-series fundamentals in IoT sensor systems. Understanding sampling theory is essential for collecting, processing, and interpreting sensor data correctly.

## Learning Objectives

By the end of this chapter, you will:
- Understand the Nyquist-Shannon sampling theorem
- Learn about aliasing and how to prevent it
- Explore different sampling rates for various sensor types
- Compare regular vs. irregular sampling
- Understand the trade-offs between sampling rate, data volume, and accuracy
- Visualize the effects of different sampling rates

## Sampling Theory Fundamentals

### What is Sampling?

Sampling is the process of converting a continuous-time signal into a discrete-time signal by measuring the signal at specific time intervals. In IoT systems, sensors continuously measure physical phenomena, but we can only store and process discrete measurements.

### The Nyquist-Shannon Sampling Theorem

**Key Principle**: To accurately reconstruct a signal, you must sample at a rate **at least twice** the highest frequency component in the signal.

```
fs >= 2 × fmax
```

Where:
- `fs` = Sampling frequency (Hz)
- `fmax` = Maximum frequency in the signal (Hz)
- `2 × fmax` = Nyquist rate

### Aliasing

**Aliasing** occurs when a signal is sampled at a rate lower than the Nyquist rate, causing high-frequency components to appear as lower frequencies in the sampled data.

**Consequences**:
- Loss of information
- Misinterpretation of signal characteristics
- False patterns in data

**Prevention**:
- Sample at rates above the Nyquist rate
- Use anti-aliasing filters before sampling
- Know your signal's frequency content

## Sampling Rates for Different Sensors

### Slow-Varying Signals (0.01 - 1 Hz)
**Sensors**: Temperature, humidity, barometric pressure
- **Typical Sampling Rate**: 0.1 - 10 Hz
- **Rationale**: These phenomena change slowly
- **Example**: Room temperature might change by 1°C per hour

### Medium-Speed Signals (1 - 100 Hz)
**Sensors**: Pressure transducers, flow meters, current sensors
- **Typical Sampling Rate**: 10 - 1000 Hz
- **Rationale**: Process dynamics operate at these speeds
- **Example**: Pneumatic valve operations, motor load changes

### Fast-Varying Signals (100 - 10,000 Hz)
**Sensors**: Vibration sensors, accelerometers, acoustic sensors
- **Typical Sampling Rate**: 1 kHz - 100 kHz
- **Rationale**: Mechanical vibrations occur at these frequencies
- **Example**: Motor bearing vibrations, machine tool chatter

## Regular vs. Irregular Sampling

### Regular (Uniform) Sampling
- Fixed time intervals between samples
- Easier to process (FFT, filters)
- Predictable data volume
- Most common in industrial applications

### Irregular (Non-uniform) Sampling
- Variable time intervals between samples
- Event-driven or adaptive sampling
- Reduces data volume for slow-changing signals
- Requires more complex processing

## Time-Series Data Structures

### Essential Components

1. **Timestamp**: Absolute or relative time reference
2. **Value**: Measured quantity
3. **Metadata**: Sensor ID, quality flags, units

### Time Representation

- **Unix Timestamp**: Milliseconds since epoch (1970-01-01)
- **ISO 8601**: Human-readable format (YYYY-MM-DDTHH:mm:ss.sssZ)
- **Relative Time**: Seconds from start of measurement

## Practical Considerations

### Data Volume vs. Information

**Example**: Temperature sensor
- At 1 Hz: 86,400 samples/day
- At 0.1 Hz: 8,640 samples/day (10× reduction)
- Information loss: Minimal for slow-changing temperature

### Timing Accuracy

- **Jitter**: Variation in sample timing
- **Drift**: Clock drift over time
- **Synchronization**: Multiple sensors need time sync

### Buffer Management

- **Real-time Systems**: Circular buffers
- **Batch Processing**: Fixed-size arrays
- **Streaming**: Sliding windows

## Code Implementation

The `chapter02.ts` file demonstrates:
- Generating signals with different frequency components
- Sampling at various rates (under-sampling, Nyquist rate, over-sampling)
- Visualizing aliasing effects
- Comparing regular vs. irregular sampling
- Analyzing time-series properties
- Creating comprehensive visualizations

## Visualizations

We create multiple plots showing:
1. **Original Signal vs. Sampling Rates**: Demonstrating aliasing
2. **Spectrum Analysis**: Frequency content of sampled signals
3. **Regular vs. Irregular Sampling**: Comparison of approaches
4. **Reconstruction Quality**: Effect of sampling rate on signal recovery

## Key Takeaways

1. **Nyquist Theorem is Critical**: Always sample at ≥2× the maximum frequency
2. **Know Your Signal**: Understand frequency content before choosing sampling rate
3. **Aliasing is Real**: Under-sampling creates false patterns
4. **Balance Trade-offs**: Higher rates mean more data but better accuracy
5. **Time Accuracy Matters**: Precise timestamps are essential for analysis
6. **Buffer Strategy**: Choose appropriate buffering for your application

## Common Mistakes to Avoid

1. **Under-sampling vibration data**: Missing critical frequency components
2. **Over-sampling temperature**: Wasting storage on redundant data
3. **Ignoring jitter**: Assuming perfect timing intervals
4. **No anti-aliasing filter**: Allowing high frequencies to alias
5. **Poor time synchronization**: Multi-sensor analysis becomes impossible

## Next Steps

In Chapter 3, we'll explore noise characteristics in sensor signals and learn techniques for noise analysis and characterization.

## Running the Code

```bash
# Using npm script
npm run chapter02

# Or directly with tsx
tsx codes/chapter02.ts
```

The output visualizations will be saved to:
- `outputs/chapter02/chapter02-sampling-rates.svg` and `.html`
- `outputs/chapter02/chapter02-aliasing-demo.svg` and `.html`
- `outputs/chapter02/chapter02-irregular-sampling.svg` and `.html`
