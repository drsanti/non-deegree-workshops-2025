# Example 5: Advanced Signal Visualization and Analysis

## Overview

This example combines all the concepts from previous examples into a comprehensive signal analysis tool. You'll learn advanced matplotlib visualization techniques, modular function design, signal statistics calculation, and how to create publication-quality plots with multiple signal types, noise, filtering, and frequency analysis.

## Learning Objectives

By the end of this example, you will be able to:
- Design modular, reusable signal generation functions
- Create complex multi-panel visualizations using GridSpec
- Calculate and interpret signal statistics
- Perform comprehensive signal analysis across multiple signal types
- Export plots for presentations or publications
- Organize code into functions for better maintainability

## Key Concepts

### Modular Function Design

**Modularity** means breaking code into small, reusable functions. Benefits:
- **Reusability**: Functions can be called multiple times
- **Maintainability**: Easier to modify and debug
- **Readability**: Code is more organized and understandable
- **Testability**: Individual functions can be tested separately

### Advanced Plotting with GridSpec

**GridSpec** provides fine-grained control over subplot layout:
- Create irregular subplot arrangements
- Control spacing between subplots
- Create subplots that span multiple rows/columns
- More flexible than `plt.subplots()`

### Signal Statistics

Key statistical measures for signal analysis:

1. **Mean**: Average value (DC component)
2. **Standard Deviation**: Measure of signal variation
3. **Min/Max**: Signal range
4. **RMS (Root Mean Square)**: Effective signal strength
   ```
   RMS = √(mean(signal²))
   ```

## Code Walkthrough

### Configurable Parameters Dictionary

```python
SIGNAL_CONFIG = {
    'frequency': 2.0,
    'amplitude': 1.0,
    'duration': 2.0,
    'sample_rate': 1000,
    'noise_level': 0.2,
    'filter_window': 20,
}
```

**Benefits:**
- All parameters in one place
- Easy to modify for experimentation
- Can be saved/loaded for reproducibility
- Clear parameter documentation

### Signal Generation Functions

#### Sine Wave Function

```python
def generate_sine_wave(t, frequency, amplitude):
    """Generate a sine wave signal."""
    return amplitude * np.sin(2 * np.pi * frequency * t)
```

**Characteristics:**
- Pure function: output depends only on inputs
- Reusable: can be called with different parameters
- Testable: easy to verify correctness

#### Square Wave Function

```python
def generate_square_wave(t, frequency, amplitude):
    """Generate a square wave signal using numpy."""
    return amplitude * np.sign(np.sin(2 * np.pi * frequency * t))
```

**Design pattern**: Encapsulates signal generation logic, hides implementation details.

#### Sawtooth Wave Function

```python
def generate_sawtooth_wave(t, frequency, amplitude):
    """Generate a sawtooth wave signal using numpy."""
    phase = (2 * np.pi * frequency * t) % (2 * np.pi)
    return amplitude * (phase / np.pi - 1)
```

**Modularity**: Can be easily modified or replaced without affecting other code.

### Noise and Filtering Functions

#### Add Noise Function

```python
def add_noise(signal, noise_level, seed=42):
    """Add Gaussian noise to a signal."""
    np.random.seed(seed)
    noise = np.random.normal(0, noise_level, len(signal))
    return signal + noise
```

**Features:**
- Default parameter (`seed=42`) for reproducibility
- Returns new array (doesn't modify input)
- Handles array length automatically

#### Apply Filter Function

```python
def apply_filter(signal, window_size):
    """Apply moving average filter to reduce noise."""
    return np.convolve(signal, np.ones(window_size) / window_size, mode='same')
```

**Reusability**: Can filter any signal type.

### Statistics Functions

#### Calculate SNR Function

```python
def calculate_snr(signal, noise):
    """Calculate Signal-to-Noise Ratio in dB."""
    signal_power = np.mean(signal ** 2)
    noise_power = np.mean(noise ** 2)
    if noise_power > 0:
        return 10 * np.log10(signal_power / noise_power)
    return np.inf
```

**Error handling**: Prevents division by zero.

#### Calculate Statistics Function

```python
def calculate_statistics(signal, name):
    """Calculate and print signal statistics."""
    stats = {
        'mean': np.mean(signal),
        'std': np.std(signal),
        'min': np.min(signal),
        'max': np.max(signal),
        'rms': np.sqrt(np.mean(signal ** 2)),
    }
    # Print and return statistics
    return stats
```

**Returns dictionary**: Allows further processing of statistics.

### Advanced Visualization with GridSpec

```python
fig = plt.figure(figsize=(16, 12))
gs = fig.add_gridspec(4, 3, hspace=0.3, wspace=0.3)
```

**Layout:**
- 4 rows × 3 columns grid
- `hspace=0.3`: Vertical spacing between rows
- `wspace=0.3`: Horizontal spacing between columns

**Subplot Creation:**

```python
ax1 = fig.add_subplot(gs[0, 0])  # Row 0, Column 0
ax10 = fig.add_subplot(gs[3, :]) # Row 3, spans all columns
```

**Flexibility**: Can create complex layouts not possible with `plt.subplots()`.

### Plot Organization

**Row 1 (Clean Signals):**
- Sine, Square, Sawtooth waves
- Baseline for comparison

**Row 2 (Noisy Signals):**
- Same signals with noise added
- Shows noise impact

**Row 3 (Filtered Signals):**
- Filtered versions with clean reference
- Shows filter effectiveness

**Row 4 (Frequency Domain):**
- FFT comparison spanning full width
- Comprehensive frequency analysis

### Main Function Pattern

```python
def main():
    # Extract parameters
    # Generate signals
    # Process signals
    # Create visualization
    # Display results

if __name__ == "__main__":
    main()
```

**Benefits:**
- Code organization
- Easy testing (call `main()` from tests)
- Can be imported as module
- Standard Python pattern

## Expected Output

When you run this example, you should see:

1. **Console Output**: 
   - Comprehensive configuration summary
   - SNR values and improvements
   - Detailed statistics for each signal type:
     - Mean, Standard Deviation
     - Min, Max values
     - RMS (Root Mean Square)

2. **Plot Window**: Large figure (16×12 inches) with:
   - **Row 1**: Clean sine, square, sawtooth waves
   - **Row 2**: Noisy versions of all three signals
   - **Row 3**: Filtered versions with clean reference overlay
   - **Row 4**: Frequency domain comparison (FFT) spanning full width

3. **Visual Organization**: 
   - Color-coded signals (blue=sine, red=square, green=sawtooth)
   - Consistent styling across all subplots
   - Clear titles and labels
   - Professional appearance

## Signal Statistics Explained

### Mean (Average)
```
mean = (1/N) × Σ(signal[i])
```
- For clean sine wave: Near zero (balanced positive/negative)
- For noisy signal: Slightly offset from zero due to noise

### Standard Deviation
```
std = √(mean((signal - mean)²))
```
- Measures signal "spread"
- Clean signal: ~0.707 for amplitude=1 sine wave
- Noisy signal: Higher due to noise contribution

### RMS (Root Mean Square)
```
RMS = √(mean(signal²))
```
- Effective signal strength
- For sine wave: RMS = amplitude / √2 ≈ 0.707 × amplitude
- Useful for comparing signal magnitudes

### Min/Max
- Signal range
- Clean signal: [-amplitude, +amplitude]
- Noisy signal: Extended range beyond ±amplitude

## Exercises

1. **Modify signal parameters**: Change values in `SIGNAL_CONFIG` and observe the effects across all visualizations.

2. **Add new signal type**: Create a triangle wave function and integrate it into the visualization.

3. **Customize plot layout**: Modify GridSpec to create different arrangements (e.g., 2×2 grid with larger subplots).

4. **Export plots**: Uncomment the export code to save figures:
   ```python
   output_dir = "output"
   os.makedirs(output_dir, exist_ok=True)
   fig.savefig(output_path, dpi=300, bbox_inches='tight')
   ```

5. **Add more statistics**: Extend `calculate_statistics()` to include:
   - Peak-to-peak amplitude
   - Crest factor (peak/RMS)
   - Dynamic range

6. **Compare filter effectiveness**: Calculate SNR improvement for all three signal types and compare.

## Parameters and Customization

### Signal Configuration

```python
SIGNAL_CONFIG = {
    'frequency': 2.0,      # Try: 1.0, 5.0, 10.0
    'amplitude': 1.0,      # Try: 0.5, 2.0
    'duration': 2.0,       # Try: 1.0, 4.0
    'sample_rate': 1000,   # Try: 500, 2000
    'noise_level': 0.2,    # Try: 0.1, 0.3, 0.5
    'filter_window': 20,   # Try: 10, 30, 50
}
```

### GridSpec Layout

```python
gs = fig.add_gridspec(4, 3, hspace=0.3, wspace=0.3)
# Try: (3, 2, ...) for different layout
# Try: hspace=0.5 for more spacing
```

### Figure Size

```python
fig = plt.figure(figsize=(16, 12))
# Try: (12, 10) for smaller figure
# Try: (20, 15) for larger, detailed figure
```

## Advanced Topics

### Export Options

**High-resolution export:**
```python
fig.savefig('output.png', dpi=300, bbox_inches='tight')
```
- `dpi=300`: Publication quality (300 dots per inch)
- `bbox_inches='tight'`: Removes extra whitespace

**Multiple formats:**
```python
fig.savefig('output.pdf')  # Vector format (scalable)
fig.savefig('output.svg')  # Vector format (web-compatible)
```

### Interactive Plotting

Add interactive features:
```python
plt.ion()  # Turn on interactive mode
# Plots update dynamically
```

### Subplot Annotations

Add text annotations:
```python
ax1.text(0.5, 0.9, 'Annotation', transform=ax1.transAxes,
         fontsize=10, ha='center')
```

### Color Schemes

Use colormaps for multiple signals:
```python
colors = plt.cm.tab10(np.linspace(0, 1, 10))
ax.plot(x, y, color=colors[0])
```

## Code Organization Best Practices

1. **Function Documentation**: Always include docstrings
2. **Parameter Validation**: Check inputs in functions
3. **Error Handling**: Handle edge cases gracefully
4. **Naming Conventions**: Use descriptive names
5. **Code Comments**: Explain "why", not "what"

## Common Pitfalls

1. **Function scope**: Variables in functions don't affect global scope unless using `global`

2. **Array copying**: NumPy operations may create views, not copies:
   ```python
   filtered = signal.copy()  # Explicit copy if needed
   ```

3. **GridSpec indexing**: Remember it's [row, column], like matrix indexing

4. **Memory usage**: Large arrays (high sample rates, long duration) use significant memory

## Real-World Applications

### Research and Analysis
- Signal quality assessment
- Filter design validation
- Algorithm comparison

### Education
- Teaching signal processing concepts
- Visualization of theoretical concepts
- Interactive demonstrations

### Quality Control
- Product testing
- Performance evaluation
- Troubleshooting

### Publication
- Paper figures
- Presentation slides
- Documentation

## Performance Considerations

### Optimization Tips

1. **Vectorization**: Use NumPy operations (already done)
2. **Memory**: Consider processing signals in chunks for very long signals
3. **Plotting**: For many subplots, consider separate figures
4. **Export**: High DPI exports take longer and create larger files

## Next Steps

After completing this example, you have learned:
- ✅ Signal generation (sine, square, sawtooth)
- ✅ Noise addition and SNR calculation
- ✅ Signal filtering
- ✅ Frequency domain analysis (FFT)
- ✅ Advanced visualization techniques
- ✅ Modular code design
- ✅ Signal statistics

**Further Exploration:**
- Explore scipy.signal for advanced filters
- Learn about windowing functions for FFT
- Study digital filter design
- Experiment with different noise types
- Create interactive visualizations

## Additional Resources

- [Matplotlib GridSpec](https://matplotlib.org/stable/tutorials/intermediate/gridspec.html)
- [NumPy Best Practices](https://numpy.org/doc/stable/user/basics.broadcasting.html)
- [Signal Processing](https://en.wikipedia.org/wiki/Digital_signal_processing)
- [Function Design](https://docs.python.org/3/tutorial/controlflow.html#defining-functions)

