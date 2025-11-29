"""
Example 1: Basic Sine Wave Generation and Visualization

This example demonstrates how to generate a simple sine wave signal
and visualize it using matplotlib.

Learning Objectives:
- Generate a sine wave using numpy
- Create a basic time-domain plot
- Customize plot appearance (labels, title, grid)
"""

import numpy as np
import matplotlib.pyplot as plt

# Signal parameters
frequency = 2.0  # Hz (cycles per second)
amplitude = 1.0  # Signal amplitude
duration = 2.0   # seconds
sample_rate = 1000  # samples per second

# Generate time array
t = np.linspace(0, duration, int(sample_rate * duration))

# Generate sine wave signal
# Formula: y = A * sin(2 * π * f * t)
signal = amplitude * np.sin(2 * np.pi * frequency * t)

# Create the plot
plt.figure(figsize=(12, 6))
plt.plot(t, signal, 'b-', linewidth=2, label=f'Sine wave (f={frequency} Hz)')
plt.xlabel('Time (seconds)', fontsize=12)
plt.ylabel('Amplitude', fontsize=12)
plt.title('Example 1: Basic Sine Wave Signal', fontsize=14, fontweight='bold')
plt.grid(True, alpha=0.3)
plt.legend(fontsize=10)
plt.tight_layout()

# Display the plot
plt.show()

# Print signal information
print(f"Signal Parameters:")
print(f"  Frequency: {frequency} Hz")
print(f"  Amplitude: {amplitude}")
print(f"  Duration: {duration} seconds")
print(f"  Sample Rate: {sample_rate} Hz")
print(f"  Number of Samples: {len(signal)}")

