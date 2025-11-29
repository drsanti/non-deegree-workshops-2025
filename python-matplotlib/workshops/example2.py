"""
Example 2: Multiple Signal Types

This example demonstrates how to generate three different types of signals:
- Sine wave
- Square wave
- Sawtooth wave

All signals are plotted in separate subplots for comparison.

Learning Objectives:
- Generate different signal types using numpy
- Create subplots for comparing multiple signals
- Understand the characteristics of different waveforms
"""

import numpy as np
import matplotlib.pyplot as plt

# Signal parameters
frequency = 2.0  # Hz
amplitude = 1.0  # Signal amplitude
duration = 2.0   # seconds
sample_rate = 1000  # samples per second

# Generate time array
t = np.linspace(0, duration, int(sample_rate * duration))

# Generate three different signal types
# 1. Sine wave
sine_signal = amplitude * np.sin(2 * np.pi * frequency * t)

# 2. Square wave (using numpy)
# Uses sign function on sine wave: positive values become +1, negative become -1
square_signal = amplitude * np.sign(np.sin(2 * np.pi * frequency * t))

# 3. Sawtooth wave (using numpy)
# Creates a repeating ramp that linearly increases from -1 to 1, then drops back
# Uses modulo operation to create periodic waveform
phase = (2 * np.pi * frequency * t) % (2 * np.pi)
# Map phase from [0, 2π] to amplitude from [-1, 1]
sawtooth_signal = amplitude * (phase / np.pi - 1)

# Create figure with subplots
fig, axes = plt.subplots(3, 1, figsize=(12, 10))
fig.suptitle('Example 2: Multiple Signal Types', fontsize=16, fontweight='bold')

# Plot sine wave
axes[0].plot(t, sine_signal, 'b-', linewidth=2)
axes[0].set_ylabel('Amplitude', fontsize=11)
axes[0].set_title('Sine Wave', fontsize=12, fontweight='bold')
axes[0].grid(True, alpha=0.3)
axes[0].set_ylim([-1.2 * amplitude, 1.2 * amplitude])

# Plot square wave
axes[1].plot(t, square_signal, 'r-', linewidth=2)
axes[1].set_ylabel('Amplitude', fontsize=11)
axes[1].set_title('Square Wave', fontsize=12, fontweight='bold')
axes[1].grid(True, alpha=0.3)
axes[1].set_ylim([-1.2 * amplitude, 1.2 * amplitude])

# Plot sawtooth wave
axes[2].plot(t, sawtooth_signal, 'g-', linewidth=2)
axes[2].set_xlabel('Time (seconds)', fontsize=11)
axes[2].set_ylabel('Amplitude', fontsize=11)
axes[2].set_title('Sawtooth Wave', fontsize=12, fontweight='bold')
axes[2].grid(True, alpha=0.3)
axes[2].set_ylim([-1.2 * amplitude, 1.2 * amplitude])

plt.tight_layout()
plt.show()

# Print signal information
print("Signal Parameters:")
print(f"  Frequency: {frequency} Hz")
print(f"  Amplitude: {amplitude}")
print(f"  Duration: {duration} seconds")
print(f"  Sample Rate: {sample_rate} Hz")
print("\nSignal Types Generated:")
print("  1. Sine Wave - Smooth, continuous waveform")
print("  2. Square Wave - Alternates between two values")
print("  3. Sawtooth Wave - Linear rise followed by sudden drop")

