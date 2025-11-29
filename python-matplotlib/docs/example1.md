# Example 1: Basic Sine Wave Generation and Visualization

## Overview

This example introduces the fundamentals of signal generation and visualization using Python's NumPy and Matplotlib libraries. You'll learn how to generate a simple sine wave signal and display it in a time-domain plot.

## Learning Objectives

By the end of this example, you will be able to:
- Generate a sine wave signal using NumPy
- Create a basic time-domain plot using Matplotlib
- Customize plot appearance (labels, title, grid)
- Understand key signal parameters: frequency, amplitude, duration, and sample rate

## Key Concepts

### Sine Wave Mathematics

A sine wave is a periodic oscillating signal described by the mathematical formula:

```
y(t) = A × sin(2π × f × t)
```

Where:
- **A** (amplitude): The peak value of the signal
- **f** (frequency): The number of complete cycles per second, measured in Hertz (Hz)
- **t** (time): The time variable
- **2π**: Converts frequency to angular frequency (radians per second)

### Signal Parameters

1. **Frequency (f)**: Determines how many complete cycles occur in one second
   - Higher frequency = more cycles per second = shorter period
   - Lower frequency = fewer cycles per second = longer period

2. **Amplitude (A)**: The maximum displacement from zero
   - Determines the "height" of the wave
   - Measured in the same units as the signal

3. **Duration**: The total length of time the signal is generated
   - Determines how many cycles are displayed

4. **Sample Rate**: The number of data points per second
   - Higher sample rate = smoother visualization
   - Must be at least 2× the frequency (Nyquist theorem)
   - Typical values: 1000 Hz for smooth plots

## Code Walkthrough

### Importing Libraries

```python
import numpy as np
import matplotlib.pyplot as plt
```

- **numpy**: Provides array operations and mathematical functions
- **matplotlib.pyplot**: Provides plotting functionality

### Setting Signal Parameters

```python
frequency = 2.0  # Hz (cycles per second)
amplitude = 1.0  # Signal amplitude
duration = 2.0   # seconds
sample_rate = 1000  # samples per second
```

These parameters define the characteristics of the signal. Try modifying them to see how they affect the plot!

### Generating Time Array

```python
t = np.linspace(0, duration, int(sample_rate * duration))
```

- `np.linspace()` creates evenly spaced time points from 0 to `duration`
- The number of points equals `sample_rate × duration`
- For example: 1000 Hz × 2 seconds = 2000 data points

### Generating the Sine Wave

```python
signal = amplitude * np.sin(2 * np.pi * frequency * t)
```

This implements the sine wave formula:
- `2 * np.pi * frequency * t` converts time to angular frequency
- `np.sin()` computes the sine function for all time points simultaneously
- `amplitude * ...` scales the result

### Creating the Plot

```python
plt.figure(figsize=(12, 6))
plt.plot(t, signal, 'b-', linewidth=2, label=f'Sine wave (f={frequency} Hz)')
plt.xlabel('Time (seconds)', fontsize=12)
plt.ylabel('Amplitude', fontsize=12)
plt.title('Example 1: Basic Sine Wave Signal', fontsize=14, fontweight='bold')
plt.grid(True, alpha=0.3)
plt.legend(fontsize=10)
plt.tight_layout()
plt.show()
```

**Key Plotting Elements:**
- `figsize=(12, 6)`: Sets figure dimensions (width, height in inches)
- `'b-'`: Blue solid line style
- `linewidth=2`: Makes the line thicker and more visible
- `label`: Text displayed in the legend
- `grid(True, alpha=0.3)`: Adds a semi-transparent grid for easier reading
- `tight_layout()`: Automatically adjusts spacing to prevent label cutoff

## Expected Output

When you run this example, you should see:
1. **Console Output**: Signal parameters printed to the terminal
2. **Plot Window**: A figure showing:
   - X-axis: Time (0 to 2 seconds)
   - Y-axis: Amplitude (-1 to 1)
   - A smooth blue sine wave with 4 complete cycles (2 Hz × 2 seconds = 4 cycles)

## Parameters and Customization

### Experimenting with Frequency

```python
frequency = 1.0   # Lower frequency: fewer cycles
frequency = 5.0   # Higher frequency: more cycles
```

**Observation**: Increasing frequency creates more cycles in the same time period.

### Experimenting with Amplitude

```python
amplitude = 0.5   # Smaller wave
amplitude = 2.0   # Larger wave
```

**Observation**: Amplitude scales the vertical size of the wave.

### Experimenting with Duration

```python
duration = 1.0    # Shows 2 cycles (2 Hz × 1 sec)
duration = 4.0    # Shows 8 cycles (2 Hz × 4 sec)
```

**Observation**: Longer duration displays more complete cycles.

### Experimenting with Sample Rate

```python
sample_rate = 100   # Lower sample rate: fewer points, less smooth
sample_rate = 5000  # Higher sample rate: more points, smoother
```

**Observation**: Lower sample rates may show jagged lines; higher rates create smoother curves but use more memory.

## Exercises

1. **Modify the frequency** to 5 Hz and observe the change in the number of cycles.

2. **Change the amplitude** to 0.5 and verify the wave now ranges from -0.5 to 0.5.

3. **Reduce the sample rate** to 50 Hz and notice how the signal becomes less smooth (aliasing effect).

4. **Create a cosine wave** by replacing `np.sin()` with `np.cos()` and compare the result.

5. **Plot multiple signals** on the same axes:
   ```python
   signal2 = amplitude * np.sin(2 * np.pi * 4.0 * t)  # 4 Hz wave
   plt.plot(t, signal, 'b-', label='2 Hz')
   plt.plot(t, signal2, 'r-', label='4 Hz')
   ```

## Common Pitfalls

1. **Aliasing**: Using a sample rate less than 2× the frequency can cause incorrect representation of high-frequency signals.

2. **Array Size Mismatch**: Ensure `t` and `signal` have the same length when plotting.

3. **Missing `plt.show()`**: In non-interactive environments, `plt.show()` is required to display the plot.

## Mathematical Notes

### Period and Frequency Relationship

```
Period (T) = 1 / Frequency (f)
```

For a 2 Hz signal:
- Period = 1/2 = 0.5 seconds per cycle

### Angular Frequency

```
ω = 2π × f
```

Where ω (omega) is the angular frequency in radians per second.

## Next Steps

After completing this example, proceed to:
- **Example 2**: Learn about different signal types (square and sawtooth waves)
- **Example 3**: Discover how to add noise to signals
- **Example 4**: Explore frequency domain analysis using FFT

## Additional Resources

- [NumPy Documentation](https://numpy.org/doc/stable/)
- [Matplotlib Documentation](https://matplotlib.org/stable/contents.html)
- [Signal Processing Basics](https://en.wikipedia.org/wiki/Signal_processing)

