"""
Example 3: Adding Noise to Signals

This example demonstrates how to add different types of noise to a clean signal
and visualize the effect. It also calculates the Signal-to-Noise Ratio (SNR).

Learning Objectives:
- Generate clean signals
- Add white noise and Gaussian noise
- Calculate and understand SNR
- Visualize clean vs noisy signals
"""

import numpy as np
import matplotlib.pyplot as plt

# Signal parameters
frequency = 2.0  # Hz
amplitude = 1.0  # Signal amplitude
duration = 2.0   # seconds
sample_rate = 1000  # samples per second

# Noise parameters
noise_level_white = 0.2  # Standard deviation for white noise
noise_level_gaussian = 0.15  # Standard deviation for Gaussian noise

# Generate time array
t = np.linspace(0, duration, int(sample_rate * duration))

# Generate clean sine wave signal
clean_signal = amplitude * np.sin(2 * np.pi * frequency * t)

# Generate noise
# White noise: random values with zero mean and specified standard deviation
np.random.seed(42)  # For reproducibility
white_noise = np.random.normal(0, noise_level_white, len(t))

# Gaussian noise: similar to white noise but can have different characteristics
gaussian_noise = np.random.normal(0, noise_level_gaussian, len(t))

# Add noise to clean signal
signal_with_white_noise = clean_signal + white_noise
signal_with_gaussian_noise = clean_signal + gaussian_noise

# Calculate Signal-to-Noise Ratio (SNR) in dB
# SNR = 20 * log10(signal_power / noise_power)
signal_power = np.mean(clean_signal ** 2)
white_noise_power = np.mean(white_noise ** 2)
gaussian_noise_power = np.mean(gaussian_noise ** 2)

snr_white = 10 * np.log10(signal_power / white_noise_power) if white_noise_power > 0 else np.inf
snr_gaussian = 10 * np.log10(signal_power / gaussian_noise_power) if gaussian_noise_power > 0 else np.inf

# Create figure with subplots
fig, axes = plt.subplots(3, 1, figsize=(12, 10))
fig.suptitle('Example 3: Signal with Noise', fontsize=16, fontweight='bold')

# Plot clean signal
axes[0].plot(t, clean_signal, 'b-', linewidth=2, label='Clean Signal')
axes[0].set_ylabel('Amplitude', fontsize=11)
axes[0].set_title('Clean Signal (No Noise)', fontsize=12, fontweight='bold')
axes[0].grid(True, alpha=0.3)
axes[0].legend()
axes[0].set_ylim([-1.5 * amplitude, 1.5 * amplitude])

# Plot signal with white noise
axes[1].plot(t, signal_with_white_noise, 'r-', linewidth=1.5, alpha=0.7, label='Signal + White Noise')
axes[1].plot(t, clean_signal, 'b--', linewidth=1.5, alpha=0.5, label='Clean Signal (reference)')
axes[1].set_ylabel('Amplitude', fontsize=11)
axes[1].set_title(f'Signal with White Noise (SNR = {snr_white:.2f} dB)', fontsize=12, fontweight='bold')
axes[1].grid(True, alpha=0.3)
axes[1].legend()
axes[1].set_ylim([-1.5 * amplitude, 1.5 * amplitude])

# Plot signal with Gaussian noise
axes[2].plot(t, signal_with_gaussian_noise, 'g-', linewidth=1.5, alpha=0.7, label='Signal + Gaussian Noise')
axes[2].plot(t, clean_signal, 'b--', linewidth=1.5, alpha=0.5, label='Clean Signal (reference)')
axes[2].set_xlabel('Time (seconds)', fontsize=11)
axes[2].set_ylabel('Amplitude', fontsize=11)
axes[2].set_title(f'Signal with Gaussian Noise (SNR = {snr_gaussian:.2f} dB)', fontsize=12, fontweight='bold')
axes[2].grid(True, alpha=0.3)
axes[2].legend()
axes[2].set_ylim([-1.5 * amplitude, 1.5 * amplitude])

plt.tight_layout()
plt.show()

# Print signal information
print("Signal Parameters:")
print(f"  Frequency: {frequency} Hz")
print(f"  Amplitude: {amplitude}")
print(f"  Duration: {duration} seconds")
print(f"\nNoise Parameters:")
print(f"  White Noise Level (std): {noise_level_white}")
print(f"  Gaussian Noise Level (std): {noise_level_gaussian}")
print(f"\nSignal-to-Noise Ratio (SNR):")
print(f"  SNR (White Noise): {snr_white:.2f} dB")
print(f"  SNR (Gaussian Noise): {snr_gaussian:.2f} dB")
print(f"\nNote: Higher SNR values indicate better signal quality.")

