# Example 3: Adding Noise to Signals

## Overview

This example demonstrates how to add different types of noise to clean signals and measure the impact using Signal-to-Noise Ratio (SNR). You'll learn to generate noise, combine it with signals, and visualize the effect of noise on signal quality.

## Learning Objectives

By the end of this example, you will be able to:
- Generate white noise and Gaussian noise using NumPy
- Add noise to clean signals
- Calculate and interpret Signal-to-Noise Ratio (SNR) in decibels
- Visualize clean vs noisy signals for comparison
- Understand the practical implications of noise in signal processing

## Key Concepts

### What is Noise?

**Noise** is an unwanted random variation in a signal. In real-world applications, signals are almost always contaminated by noise from various sources:
- Electronic noise in circuits
- Environmental interference
- Measurement errors
- Transmission channel interference

### Types of Noise

#### White Noise

White noise is a random signal with equal power at all frequencies. It's characterized by:
- **Zero mean**: The average value is zero
- **Constant power spectral density**: Equal energy at all frequencies
- **Gaussian distribution**: Values follow a normal (Gaussian) probability distribution

In practice, white noise is often generated using:
```python
noise = np.random.normal(mean, std_dev, size)
```

#### Gaussian Noise

Gaussian noise follows a normal probability distribution:
- **Bell-shaped distribution**: Most values cluster around the mean
- **Standard deviation (σ)**: Controls the spread of values
- **68-95-99.7 rule**: 
  - 68% of values within ±1σ
  - 95% of values within ±2σ
  - 99.7% of values within ±3σ

**Note**: In this example, both white noise and Gaussian noise use the same generation method (`np.random.normal()`). The distinction is often in how they're characterized (frequency content vs. distribution).

### Signal-to-Noise Ratio (SNR)

SNR measures the ratio of signal power to noise power. It quantifies signal quality:

```
SNR (linear) = Signal Power / Noise Power
SNR (dB) = 10 × log₁₀(Signal Power / Noise Power)
```

**Interpretation:**
- **Higher SNR** = Better signal quality (less noise)
- **Lower SNR** = Poor signal quality (more noise)
- **SNR in dB**: Logarithmic scale (every 10 dB = 10× power ratio)

**Practical SNR Values:**
- 20-30 dB: Good quality
- 10-20 dB: Acceptable
- 0-10 dB: Poor quality
- < 0 dB: Noise stronger than signal

## Code Walkthrough

### Generating Clean Signal

```python
clean_signal = amplitude * np.sin(2 * np.pi * frequency * t)
```

This is the same sine wave generation from Example 1. We'll use it as the "ideal" signal before noise is added.

### Generating Noise

```python
np.random.seed(42)  # For reproducibility
white_noise = np.random.normal(0, noise_level_white, len(t))
gaussian_noise = np.random.normal(0, noise_level_gaussian, len(t))
```

**Key Points:**
- `np.random.seed(42)`: Ensures reproducible results (same noise pattern every run)
- `np.random.normal(mean, std, size)`: Generates random numbers from a normal distribution
  - `mean = 0`: Zero-mean noise
  - `std = noise_level`: Standard deviation controls noise magnitude
  - `size = len(t)`: Number of samples matches signal length

**Noise Level Impact:**
- `noise_level = 0.1`: Small noise (high SNR)
- `noise_level = 0.5`: Large noise (low SNR)

### Adding Noise to Signal

```python
signal_with_white_noise = clean_signal + white_noise
signal_with_gaussian_noise = clean_signal + gaussian_noise
```

Simple addition! The noise is additive (signal + noise).

### Calculating Signal Power

```python
signal_power = np.mean(clean_signal ** 2)
white_noise_power = np.mean(white_noise ** 2)
gaussian_noise_power = np.mean(gaussian_noise ** 2)
```

**Power Calculation:**
- Power = mean of squared values
- For signals: measures energy/strength
- Independent of sign (squaring removes negative values)

### Calculating SNR in Decibels

```python
snr_white = 10 * np.log10(signal_power / white_noise_power) if white_noise_power > 0 else np.inf
snr_gaussian = 10 * np.log10(signal_power / gaussian_noise_power) if gaussian_noise_power > 0 else np.inf
```

**SNR Formula Breakdown:**
1. Calculate ratio: `signal_power / noise_power`
2. Take logarithm (base 10): `log10(...)`
3. Multiply by 10: Convert to decibels
4. Safety check: Prevent division by zero

**Why 10× log₁₀?**
- Logarithmic scale is more intuitive for power ratios
- dB scale compresses large ranges
- Standard unit in signal processing

### Visualizing Clean vs Noisy Signals

```python
axes[1].plot(t, signal_with_white_noise, 'r-', linewidth=1.5, alpha=0.7, label='Signal + White Noise')
axes[1].plot(t, clean_signal, 'b--', linewidth=1.5, alpha=0.5, label='Clean Signal (reference)')
```

**Plotting Strategy:**
- Overlay clean signal (dashed line) as reference
- Plot noisy signal (solid line) for comparison
- Use different colors and transparency (`alpha`) for clarity
- Show SNR in title for quick assessment

## Expected Output

When you run this example, you should see:

1. **Console Output**: 
   - Signal parameters
   - Noise parameters (standard deviations)
   - SNR values in decibels for both noise types

2. **Plot Window**: Three stacked subplots:
   - **Top**: Clean signal (smooth sine wave)
   - **Middle**: Signal with white noise + clean reference (shows noise impact)
   - **Bottom**: Signal with Gaussian noise + clean reference

3. **Visual Observations**:
   - Clean signal: Perfect, smooth sine wave
   - Noisy signals: Sine wave shape visible but "fuzzy" or "rough"
   - SNR values displayed in titles

## Understanding SNR Values

### Example SNR Calculations

For a signal with amplitude = 1.0 and noise_level = 0.2:

**Signal Power:**
- Signal: `y = sin(2πft)` with amplitude 1
- Power = mean(sin²) ≈ 0.5 (average of squared sine)

**Noise Power:**
- Noise standard deviation = 0.2
- Noise power = 0.2² = 0.04

**SNR:**
- Linear SNR = 0.5 / 0.04 = 12.5
- SNR (dB) = 10 × log₁₀(12.5) ≈ 10.97 dB

### SNR and Perceived Quality

| SNR (dB) | Quality | Visual Appearance |
|----------|---------|-------------------|
| > 30 | Excellent | Signal clearly visible |
| 20-30 | Good | Signal visible with minor noise |
| 10-20 | Acceptable | Signal shape recognizable |
| 0-10 | Poor | Signal barely visible |
| < 0 | Very Poor | Signal buried in noise |

## Exercises

1. **Vary noise levels**: Modify `noise_level_white` and `noise_level_gaussian` and observe how SNR changes. Try values like 0.05, 0.1, 0.3, 0.5.

2. **Calculate SNR manually**: Verify the SNR calculation by printing signal and noise powers separately.

3. **Different noise types**: Try uniform noise instead of Gaussian:
   ```python
   uniform_noise = np.random.uniform(-noise_level, noise_level, len(t))
   ```

4. **Signal amplitude effect**: Change signal amplitude and observe how SNR changes (signal power increases, but noise power stays the same).

5. **SNR vs noise level plot**: Create a plot showing SNR (dB) vs noise level to visualize the relationship.

## Parameters and Customization

### Noise Level Impact

```python
noise_level_white = 0.1    # Low noise (high SNR)
noise_level_white = 0.3    # Medium noise (medium SNR)
noise_level_white = 0.5    # High noise (low SNR)
```

**Observation**: Higher noise levels create lower SNR values and more visible distortion.

### Reproducibility

```python
np.random.seed(42)  # Same noise every run
# vs
# np.random.seed(None)  # Different noise every run
```

**When to use:**
- **Fixed seed**: For consistent demonstrations and debugging
- **Random seed**: For realistic simulations and statistical analysis

### Signal Frequency Effect

```python
frequency = 1.0   # Lower frequency: easier to see noise effect
frequency = 5.0   # Higher frequency: noise may be less apparent
```

**Observation**: Noise visibility depends on signal frequency and noise characteristics.

## Advanced Topics

### Additive vs Multiplicative Noise

**Additive Noise** (used in this example):
```
y_noisy(t) = y_clean(t) + n(t)
```

**Multiplicative Noise** (signal-dependent):
```python
signal_with_multiplicative_noise = clean_signal * (1 + noise)
```

### Colored Noise

Beyond white noise, there are colored noise types:
- **Pink noise**: Power decreases with frequency (1/f noise)
- **Brown noise**: Power decreases with frequency² (1/f² noise)

### SNR vs PSNR (Peak Signal-to-Noise Ratio)

**SNR**: Uses average signal power
**PSNR**: Uses peak signal power (useful for images/digital signals)

```python
psnr = 20 * np.log10(max_signal / noise_std)
```

## Common Pitfalls

1. **Division by zero**: Always check if noise power > 0 before calculating SNR.

2. **SNR units**: Remember that SNR in dB uses `10×log₁₀()`, not `20×log₁₀()` (which is used for amplitude ratios).

3. **Noise seed**: For reproducible results, always set the random seed before generating noise.

4. **Matching array sizes**: Ensure noise array length matches signal array length.

## Real-World Applications

### Communication Systems
- Radio transmission (interference from other signals)
- Digital communication (channel noise)

### Audio Processing
- Recording quality (background noise)
- Speech recognition (environmental noise)

### Sensor Data
- Temperature sensors (thermal noise)
- Accelerometers (vibration noise)
- Image sensors (pixel noise)

## Next Steps

After completing this example, proceed to:
- **Example 4**: Learn how to filter out noise using signal processing techniques
- **Example 5**: See advanced noise reduction and analysis methods

## Additional Resources

- [Signal-to-Noise Ratio](https://en.wikipedia.org/wiki/Signal-to-noise_ratio)
- [White Noise](https://en.wikipedia.org/wiki/White_noise)
- [Gaussian Noise](https://en.wikipedia.org/wiki/Gaussian_noise)
- [Noise in Electronics](https://en.wikipedia.org/wiki/Noise_(electronics))

