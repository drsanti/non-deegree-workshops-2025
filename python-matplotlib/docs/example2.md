# Example 2: Multiple Signal Types

## Overview

This example demonstrates how to generate three different types of periodic signals: sine waves, square waves, and sawtooth waves. You'll learn to create each waveform type using NumPy and visualize them together using subplots for easy comparison.

## Learning Objectives

By the end of this example, you will be able to:
- Generate different signal types using NumPy (without external libraries)
- Create and organize subplots for comparing multiple signals
- Understand the mathematical properties and characteristics of different waveforms
- Implement square and sawtooth waves from basic mathematical principles

## Key Concepts

### Signal Types Comparison

| Signal Type | Characteristics | Applications |
|------------|----------------|--------------|
| **Sine Wave** | Smooth, continuous, periodic | Audio signals, AC power, vibrations |
| **Square Wave** | Alternates between two values | Digital circuits, clock signals, PWM |
| **Sawtooth Wave** | Linear ramp with instant reset | Oscilloscope sweeps, music synthesis |

### Waveform Mathematics

#### 1. Sine Wave
```
y(t) = A × sin(2π × f × t)
```
- Smooth, continuous curve
- Infinite differentiability
- Single frequency component

#### 2. Square Wave
```
y(t) = A × sign(sin(2π × f × t))
```
Where `sign(x)` returns:
- +1 if x > 0
- -1 if x < 0
- 0 if x = 0

- Discontinuous waveform
- Contains infinite harmonics
- Used in digital systems

#### 3. Sawtooth Wave
```
y(t) = A × (φ(t) / π - 1)
where φ(t) = (2π × f × t) mod 2π
```
- Linear increase from -A to +A
- Instant drop back to -A
- Contains all harmonic frequencies
- Used in signal generation and synthesis

## Code Walkthrough

### Sine Wave Generation

```python
sine_signal = amplitude * np.sin(2 * np.pi * frequency * t)
```

This is the standard sine wave formula from Example 1. It produces a smooth, continuous waveform.

### Square Wave Generation

```python
square_signal = amplitude * np.sign(np.sin(2 * np.pi * frequency * t))
```

**How it works:**
1. First, generate a sine wave: `np.sin(2 * np.pi * frequency * t)`
2. Apply the sign function: `np.sign(...)` converts all positive values to +1 and all negative values to -1
3. Scale by amplitude: Multiply by the desired amplitude

**Visual Result**: A waveform that alternates between +A and -A at the zero-crossings of the sine wave.

### Sawtooth Wave Generation

```python
phase = (2 * np.pi * frequency * t) % (2 * np.pi)
sawtooth_signal = amplitude * (phase / np.pi - 1)
```

**How it works:**
1. **Calculate phase**: `(2 * np.pi * frequency * t) % (2 * np.pi)` wraps the phase to [0, 2π]
   - The modulo operator `%` ensures the phase resets every cycle
2. **Map to amplitude range**: `phase / np.pi - 1` maps:
   - When phase = 0: value = -1
   - When phase = π: value = 0
   - When phase = 2π: value = 1 (wraps back to -1)

**Visual Result**: A waveform that linearly increases from -A to +A, then instantly drops back to -A.

### Creating Subplots

```python
fig, axes = plt.subplots(3, 1, figsize=(12, 10))
```

**Understanding subplots:**
- `plt.subplots(3, 1)`: Creates 3 rows, 1 column of subplots
- Returns a figure object (`fig`) and an array of axes (`axes`)
- `axes[0]`, `axes[1]`, `axes[2]` refer to the top, middle, and bottom subplots

### Customizing Each Subplot

```python
axes[0].plot(t, sine_signal, 'b-', linewidth=2)
axes[0].set_ylabel('Amplitude', fontsize=11)
axes[0].set_title('Sine Wave', fontsize=12, fontweight='bold')
axes[0].grid(True, alpha=0.3)
axes[0].set_ylim([-1.2 * amplitude, 1.2 * amplitude])
```

Each subplot is customized individually:
- Color coding: blue for sine, red for square, green for sawtooth
- Consistent y-limits for easy comparison
- Only the bottom subplot gets an x-label (to avoid clutter)

### Overall Figure Title

```python
fig.suptitle('Example 2: Multiple Signal Types', fontsize=16, fontweight='bold')
```

`suptitle()` creates a title for the entire figure, above all subplots.

## Expected Output

When you run this example, you should see:

1. **Console Output**: Signal parameters and descriptions of each waveform type

2. **Plot Window**: A figure with three stacked subplots:
   - **Top**: Blue sine wave - smooth, continuous
   - **Middle**: Red square wave - alternating between +1 and -1
   - **Bottom**: Green sawtooth wave - linear ramp with instant drop

All three signals have the same frequency (2 Hz) and amplitude (1.0) for easy comparison.

## Signal Characteristics

### Frequency Content

- **Sine Wave**: Contains only one frequency component (the fundamental frequency)
- **Square Wave**: Contains the fundamental frequency plus all odd harmonics (3f, 5f, 7f, ...)
- **Sawtooth Wave**: Contains the fundamental frequency plus all harmonics (2f, 3f, 4f, ...)

This will become important in Example 4 when we examine signals in the frequency domain.

### Time Domain Properties

| Property | Sine Wave | Square Wave | Sawtooth Wave |
|----------|-----------|-------------|---------------|
| Continuity | Continuous | Discontinuous | Continuous |
| Differentiability | Everywhere | Not differentiable at transitions | Not differentiable at reset |
| Maximum Rate of Change | Smooth | Infinite (at transitions) | Constant (linear rise) |
| Symmetry | Odd symmetry | Odd symmetry | No symmetry |

## Exercises

1. **Modify the square wave duty cycle**: Create a function that allows you to change the duty cycle (percentage of time at +A vs -A).

2. **Create a triangle wave**: Modify the sawtooth wave code to create a symmetric triangle wave (rises linearly, then falls linearly).

3. **Compare different frequencies**: Generate all three signal types at different frequencies and plot them together.

4. **Add phase shift**: Modify one of the signals to add a phase shift and observe the difference.

5. **Create a pulse train**: Modify the square wave to create pulses with specific widths.

## Advanced: Implementing Triangle Wave

To create a triangle wave from the sawtooth wave:

```python
phase = (2 * np.pi * frequency * t) % (2 * np.pi)
# First half: rising edge
triangle = np.where(phase < np.pi, 
                    amplitude * (phase / np.pi - 1),
                    # Second half: falling edge
                    amplitude * (3 - phase / np.pi))
```

## Parameters and Customization

### Changing Signal Frequency

```python
frequency = 1.0   # Slower oscillations
frequency = 5.0   # Faster oscillations
```

**Observation**: All three waveforms maintain their shape but oscillate at different rates.

### Changing Signal Amplitude

```python
amplitude = 0.5   # Smaller waveforms
amplitude = 2.0   # Larger waveforms
```

**Observation**: Amplitude affects the vertical scale of all waveforms proportionally.

### Adjusting Subplot Layout

```python
fig, axes = plt.subplots(1, 3, figsize=(15, 5))  # Horizontal layout
```

**Observation**: Changes layout from vertical stack to horizontal row.

## Common Pitfalls

1. **Phase wrapping**: Ensure the modulo operation correctly wraps the phase for periodic signals.

2. **Square wave transitions**: The `np.sign()` function may not produce perfect square waves at very low sample rates.

3. **Subplot indexing**: Remember that `axes` is a 1D array when using `subplots(3, 1)`, not a 2D array.

## Mathematical Insights

### Fourier Series Representation

Each periodic signal can be represented as a sum of sine waves:

- **Square Wave**: `y(t) = (4A/π) × [sin(2πft) + (1/3)sin(6πft) + (1/5)sin(10πft) + ...]`
- **Sawtooth Wave**: `y(t) = (2A/π) × [sin(2πft) - (1/2)sin(4πft) + (1/3)sin(6πft) - ...]`

This explains why square and sawtooth waves appear "sharp" - they contain high-frequency components.

## Next Steps

After completing this example, proceed to:
- **Example 3**: Learn how to add noise to these signals
- **Example 4**: Explore how these signals appear in the frequency domain using FFT
- **Example 5**: Combine multiple signal types with noise and filtering

## Additional Resources

- [Periodic Signals](https://en.wikipedia.org/wiki/Periodic_function)
- [Fourier Series](https://en.wikipedia.org/wiki/Fourier_series)
- [Signal Synthesis](https://en.wikipedia.org/wiki/Sound_synthesis)

