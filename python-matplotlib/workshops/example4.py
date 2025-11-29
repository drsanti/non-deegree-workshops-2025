"""
Example 4: Signal Filtering and Frequency Domain Analysis

This example demonstrates:
- Adding noise to a signal
- Applying a simple moving average filter to reduce noise
- Frequency domain analysis using FFT (Fast Fourier Transform)
- Comparing original, noisy, and filtered signals in both time and frequency domains

Learning Objectives:
- Understand basic signal filtering concepts
- Learn frequency domain representation using FFT
- Compare signals in time and frequency domains
"""

import numpy as np
import matplotlib.pyplot as plt

# Signal parameters
frequency = 2.0  # Hz
amplitude = 1.0  # Signal amplitude
duration = 2.0   # seconds
sample_rate = 1000  # samples per second

# Noise parameters
noise_level = 0.3  # Standard deviation for noise

# Filter parameters
filter_window_size = 15  # Moving average window size

# Generate time array
t = np.linspace(0, duration, int(sample_rate * duration))
n_samples = len(t)

# Generate clean sine wave signal
clean_signal = amplitude * np.sin(2 * np.pi * frequency * t)

# Generate noise and add to signal
np.random.seed(42)  # For reproducibility
noise = np.random.normal(0, noise_level, n_samples)
noisy_signal = clean_signal + noise

# Apply moving average filter (simple low-pass filter)
# This creates a smoothed version of the signal
filtered_signal = np.convolve(noisy_signal, np.ones(filter_window_size) / filter_window_size, mode='same')

# Frequency domain analysis using FFT
# Calculate frequency bins
freqs = np.fft.fftfreq(n_samples, 1/sample_rate)

# Compute FFT for each signal
clean_fft = np.abs(np.fft.fft(clean_signal))
noisy_fft = np.abs(np.fft.fft(noisy_signal))
filtered_fft = np.abs(np.fft.fft(filtered_signal))

# Only plot positive frequencies
positive_freq_idx = freqs >= 0
freqs_positive = freqs[positive_freq_idx]

# Create figure with subplots: 2 rows, 2 columns
fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle('Example 4: Signal Filtering and Frequency Domain Analysis', fontsize=16, fontweight='bold')

# Time domain plots
# Top left: Clean signal
axes[0, 0].plot(t, clean_signal, 'b-', linewidth=2, label='Clean Signal')
axes[0, 0].set_ylabel('Amplitude', fontsize=11)
axes[0, 0].set_title('Time Domain: Clean Signal', fontsize=12, fontweight='bold')
axes[0, 0].grid(True, alpha=0.3)
axes[0, 0].legend()
axes[0, 0].set_ylim([-1.5 * amplitude, 1.5 * amplitude])

# Top right: Noisy and filtered signals
axes[0, 1].plot(t, noisy_signal, 'r-', linewidth=1, alpha=0.6, label='Noisy Signal')
axes[0, 1].plot(t, filtered_signal, 'g-', linewidth=2, label='Filtered Signal')
axes[0, 1].plot(t, clean_signal, 'b--', linewidth=1.5, alpha=0.7, label='Clean Signal (reference)')
axes[0, 1].set_ylabel('Amplitude', fontsize=11)
axes[0, 1].set_title('Time Domain: Noisy vs Filtered', fontsize=12, fontweight='bold')
axes[0, 1].grid(True, alpha=0.3)
axes[0, 1].legend()
axes[0, 1].set_ylim([-1.5 * amplitude, 1.5 * amplitude])

# Frequency domain plots
# Bottom left: Clean signal FFT
axes[1, 0].plot(freqs_positive, clean_fft[positive_freq_idx], 'b-', linewidth=2, label='Clean Signal')
axes[1, 0].set_xlabel('Frequency (Hz)', fontsize=11)
axes[1, 0].set_ylabel('Magnitude', fontsize=11)
axes[1, 0].set_title('Frequency Domain: Clean Signal', fontsize=12, fontweight='bold')
axes[1, 0].grid(True, alpha=0.3)
axes[1, 0].legend()
axes[1, 0].set_xlim([0, 10])  # Focus on low frequencies
axes[1, 0].axvline(x=frequency, color='r', linestyle='--', alpha=0.5, label=f'Signal Frequency ({frequency} Hz)')
axes[1, 0].legend()

# Bottom right: Noisy and filtered FFT
axes[1, 1].plot(freqs_positive, noisy_fft[positive_freq_idx], 'r-', linewidth=1, alpha=0.6, label='Noisy Signal')
axes[1, 1].plot(freqs_positive, filtered_fft[positive_freq_idx], 'g-', linewidth=2, label='Filtered Signal')
axes[1, 1].plot(freqs_positive, clean_fft[positive_freq_idx], 'b--', linewidth=1.5, alpha=0.7, label='Clean Signal (reference)')
axes[1, 1].set_xlabel('Frequency (Hz)', fontsize=11)
axes[1, 1].set_ylabel('Magnitude', fontsize=11)
axes[1, 1].set_title('Frequency Domain: Noisy vs Filtered', fontsize=12, fontweight='bold')
axes[1, 1].grid(True, alpha=0.3)
axes[1, 1].legend()
axes[1, 1].set_xlim([0, 10])  # Focus on low frequencies
axes[1, 1].axvline(x=frequency, color='r', linestyle='--', alpha=0.5, label=f'Signal Frequency ({frequency} Hz)')
axes[1, 1].legend()

plt.tight_layout()
plt.show()

# Calculate SNR improvement
signal_power = np.mean(clean_signal ** 2)
noise_power = np.mean(noise ** 2)
filtered_noise_power = np.mean((filtered_signal - clean_signal) ** 2)

snr_noisy = 10 * np.log10(signal_power / noise_power) if noise_power > 0 else np.inf
snr_filtered = 10 * np.log10(signal_power / filtered_noise_power) if filtered_noise_power > 0 else np.inf

# Print signal information
print("Signal Parameters:")
print(f"  Frequency: {frequency} Hz")
print(f"  Amplitude: {amplitude}")
print(f"  Duration: {duration} seconds")
print(f"  Sample Rate: {sample_rate} Hz")
print(f"\nFilter Parameters:")
print(f"  Filter Type: Moving Average")
print(f"  Window Size: {filter_window_size} samples")
print(f"\nSignal-to-Noise Ratio (SNR):")
print(f"  SNR (Noisy Signal): {snr_noisy:.2f} dB")
print(f"  SNR (Filtered Signal): {snr_filtered:.2f} dB")
print(f"  SNR Improvement: {snr_filtered - snr_noisy:.2f} dB")
print(f"\nNote: The filter reduces noise but may also slightly smooth the signal.")

