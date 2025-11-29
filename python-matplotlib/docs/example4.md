# Example 4: Signal Filtering and Frequency Domain Analysis

## Overview

This example introduces two fundamental signal processing concepts: **filtering** (removing noise) and **frequency domain analysis** using the Fast Fourier Transform (FFT). You'll learn to apply a simple filter to noisy signals and visualize signals in both time and frequency domains.

## Learning Objectives

By the end of this example, you will be able to:
- Apply a moving average filter to reduce noise
- Understand frequency domain representation using FFT
- Compare signals in both time and frequency domains
- Evaluate filter effectiveness using SNR improvement
- Interpret FFT plots and identify frequency components

## Key Concepts

### Signal Filtering

**Filtering** is the process of removing unwanted components (like noise) from a signal while preserving desired components.

#### Moving Average Filter

A moving average filter is a simple low-pass filter that smooths a signal by averaging nearby values:

```
y_filtered[n] = (1/N) × Σ(x[n-k]) for k = 0 to N-1
```

Where:
- **N**: Window size (number of samples to average)
- **x[n]**: Input signal at sample n
- **y_filtered[n]**: Filtered output

**Characteristics:**
- Simple to implement
- Reduces high-frequency noise
- May blur sharp transitions
- Acts as a low-pass filter (passes low frequencies, attenuates high frequencies)

**Trade-offs:**
- Larger window = more smoothing but may blur signal details
- Smaller window = less smoothing but better preserves signal shape

### Frequency Domain Analysis

#### Time Domain vs Frequency Domain

**Time Domain**: Signal amplitude vs time
- Shows how signal changes over time
- Example: sine wave oscillating up and down

**Frequency Domain**: Signal magnitude vs frequency
- Shows what frequency components are present
- Example: single peak at the signal's frequency

#### Fast Fourier Transform (FFT)

The FFT converts a time-domain signal into its frequency-domain representation:

```
X[k] = Σ(x[n] × e^(-j2πkn/N)) for n = 0 to N-1
```

**What FFT reveals:**
- Which frequencies are present in the signal
- How much energy is at each frequency
- Can identify noise components vs signal components

**Key FFT Properties:**
- **Input**: N time-domain samples
- **Output**: N frequency bins (N/2 unique positive frequencies)
- **Frequency Resolution**: `sample_rate / N` Hz per bin

## Code Walkthrough

### Applying Moving Average Filter

```python
filtered_signal = np.convolve(noisy_signal, np.ones(filter_window_size) / filter_window_size, mode='same')
```

**How it works:**
1. **Kernel creation**: `np.ones(filter_window_size) / filter_window_size` creates an array of 1/N values
   - Example: window_size=15 → `[1/15, 1/15, ..., 1/15]` (15 elements)
2. **Convolution**: `np.convolve()` slides the kernel over the signal
   - Each output point = average of nearby input points
3. **Mode 'same'**: Output length matches input length (uses zero-padding)

**Visual Effect**: Smoothes the signal by averaging out rapid fluctuations (noise).

### Frequency Domain Analysis Setup

```python
freqs = np.fft.fftfreq(n_samples, 1/sample_rate)
```

**Frequency bins calculation:**
- `n_samples`: Number of time-domain samples
- `1/sample_rate`: Time step between samples
- Returns array of frequency values (including negative frequencies)

**Frequency range:**
- Positive frequencies: 0 to `sample_rate/2` (Nyquist frequency)
- Negative frequencies: -`sample_rate/2` to 0 (mirror of positive)

### Computing FFT

```python
clean_fft = np.abs(np.fft.fft(clean_signal))
noisy_fft = np.abs(np.fft.fft(noisy_signal))
filtered_fft = np.abs(np.fft.fft(filtered_signal))
```

**Steps:**
1. **FFT**: `np.fft.fft()` computes the complex frequency spectrum
2. **Magnitude**: `np.abs()` takes absolute value (ignores phase)
3. **Result**: Amplitude at each frequency

**Why magnitude?**
- FFT output is complex (has real and imaginary parts)
- Magnitude shows signal strength at each frequency
- Phase information is less intuitive for visualization

### Filtering Positive Frequencies

```python
positive_freq_idx = freqs >= 0
freqs_positive = freqs[positive_freq_idx]
```

**Why only positive frequencies?**
- For real signals, negative frequencies are mirror images
- Plotting both creates redundant information
- Positive frequencies contain all unique information

### Creating 2×2 Subplot Layout

```python
fig, axes = plt.subplots(2, 2, figsize=(14, 10))
```

**Layout:**
- **Top left**: Clean signal (time domain)
- **Top right**: Noisy vs filtered (time domain)
- **Bottom left**: Clean signal FFT (frequency domain)
- **Bottom right**: Noisy vs filtered FFT (frequency domain)

### Frequency Domain Plotting

```python
axes[1, 0].plot(freqs_positive, clean_fft[positive_freq_idx], 'b-', linewidth=2)
axes[1, 0].set_xlim([0, 10])  # Focus on low frequencies
axes[1, 0].axvline(x=frequency, color='r', linestyle='--', alpha=0.5, 
                   label=f'Signal Frequency ({frequency} Hz)')
```

**Key elements:**
- X-axis: Frequency (Hz)
- Y-axis: Magnitude (signal strength)
- Vertical line: Marks the signal frequency for reference
- X-limit: Focus on relevant frequency range (0-10 Hz)

## Expected Output

When you run this example, you should see:

1. **Console Output**: 
   - Signal parameters
   - Filter parameters (window size)
   - SNR values: noisy signal vs filtered signal
   - SNR improvement (how much the filter helped)

2. **Plot Window**: 2×2 grid of subplots:
   - **Top left**: Clean sine wave (smooth, perfect)
   - **Top right**: Comparison of noisy (red) vs filtered (green) vs clean (dashed blue)
   - **Bottom left**: FFT of clean signal (single peak at 2 Hz)
   - **Bottom right**: FFT comparison showing noise spread across frequencies

3. **Visual Observations**:
   - **Time domain**: Filtered signal is smoother than noisy signal
   - **Frequency domain**: 
     - Clean signal: Sharp peak at signal frequency
     - Noisy signal: Peak + noise floor (spread across frequencies)
     - Filtered signal: Peak preserved, noise reduced

## Understanding FFT Plots

### Clean Signal FFT
- **Single peak**: All energy at the signal frequency (2 Hz)
- **Sharp spike**: No energy at other frequencies
- **Height**: Related to signal amplitude

### Noisy Signal FFT
- **Signal peak**: Still visible at 2 Hz
- **Noise floor**: Energy spread across all frequencies
- **Random variations**: Noise creates irregular pattern

### Filtered Signal FFT
- **Signal peak**: Preserved (signal frequency maintained)
- **Reduced noise**: Lower noise floor
- **Smoother**: Less random variation

## SNR Improvement

### Calculating SNR Improvement

```python
snr_noisy = 10 * np.log10(signal_power / noise_power)
snr_filtered = 10 * np.log10(signal_power / filtered_noise_power)
snr_improvement = snr_filtered - snr_noisy
```

**Interpretation:**
- Positive improvement: Filter successfully reduced noise
- Improvement in dB: Logarithmic scale
  - +3 dB = 2× better
  - +6 dB = 4× better
  - +10 dB = 10× better

### Typical Results

For a moving average filter with window_size=15:
- SNR improvement: ~10-15 dB (varies with noise level)
- Trade-off: Some signal smoothing occurs

## Exercises

1. **Vary filter window size**: Try window sizes of 5, 10, 20, 50 and observe:
   - SNR improvement
   - Signal smoothing effect
   - Frequency domain changes

2. **Different noise levels**: Change `noise_level` and observe how filter effectiveness changes.

3. **Multiple frequency components**: Generate a signal with multiple frequencies and see how the filter affects each:
   ```python
   signal = np.sin(2*np.pi*2*t) + 0.5*np.sin(2*np.pi*10*t)
   ```

4. **Frequency domain zoom**: Adjust `set_xlim()` to zoom into different frequency ranges.

5. **Compare filter types**: Implement a median filter and compare with moving average.

## Parameters and Customization

### Filter Window Size

```python
filter_window_size = 5    # Small window: less smoothing, faster response
filter_window_size = 15   # Medium window: balanced
filter_window_size = 50   # Large window: more smoothing, slower response
```

**Observation**: Larger windows create smoother signals but may blur details.

### Frequency Range Display

```python
axes[1, 0].set_xlim([0, 5])   # Zoom in: focus on signal frequency
axes[1, 0].set_xlim([0, 50])  # Zoom out: see more frequency range
```

**Observation**: Adjusting x-limits helps focus on relevant frequency ranges.

### Noise Level

```python
noise_level = 0.1   # Low noise: filter effect less visible
noise_level = 0.5   # High noise: filter effect more dramatic
```

**Observation**: Higher noise levels show more dramatic filter improvements.

## Advanced Topics

### Filter Types

Beyond moving average, other filter types include:

1. **Median Filter**: Replaces each point with median of neighbors
   - Better for impulse noise
   - Preserves edges better

2. **Gaussian Filter**: Uses Gaussian-weighted average
   - Smoother than moving average
   - Better frequency response

3. **Butterworth Filter**: Ideal frequency response
   - Sharp cutoff
   - More complex implementation

### Frequency Resolution

**Frequency bin width**: `sample_rate / n_samples`

Example:
- sample_rate = 1000 Hz
- n_samples = 2000
- Frequency resolution = 1000/2000 = 0.5 Hz per bin

**To improve resolution**: Increase signal duration (more samples).

### Windowing Functions

For better FFT results, apply windowing before FFT:
- **Hamming window**: Reduces spectral leakage
- **Hanning window**: Similar to Hamming
- **Blackman window**: Stronger sidelobe suppression

```python
windowed_signal = signal * np.hamming(len(signal))
fft_result = np.fft.fft(windowed_signal)
```

## Common Pitfalls

1. **Aliasing**: Ensure sample rate > 2× maximum frequency (Nyquist theorem).

2. **Frequency bin indexing**: Remember to filter positive frequencies only for real signals.

3. **FFT normalization**: `np.fft.fft()` doesn't normalize; divide by N if needed for power spectrum.

4. **Filter edge effects**: Moving average may have artifacts near signal edges.

## Real-World Applications

### Audio Processing
- Noise reduction in recordings
- Equalization (frequency filtering)
- Speech enhancement

### Image Processing
- Blur reduction
- Edge detection
- Denoising

### Sensor Data
- Filtering sensor noise
- Signal conditioning
- Data smoothing

### Communications
- Channel equalization
- Interference rejection
- Signal recovery

## Next Steps

After completing this example, proceed to:
- **Example 5**: Advanced visualization with multiple signals, comprehensive analysis, and export capabilities

## Additional Resources

- [Fast Fourier Transform](https://en.wikipedia.org/wiki/Fast_Fourier_transform)
- [Digital Filter](https://en.wikipedia.org/wiki/Digital_filter)
- [Moving Average](https://en.wikipedia.org/wiki/Moving_average)
- [Frequency Domain](https://en.wikipedia.org/wiki/Frequency_domain)

