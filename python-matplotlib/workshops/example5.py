"""
Example 5: Advanced Signal Visualization and Analysis

This example demonstrates advanced signal processing and visualization techniques:
- Multiple signal types (sine, square, sawtooth) with noise
- Combined time-domain and frequency-domain visualization
- Signal statistics and analysis
- Configurable parameters for easy experimentation
- Export capabilities for saving plots

Learning Objectives:
- Work with multiple signal types simultaneously
- Advanced matplotlib visualization techniques
- Signal statistics calculation
- Export plots to files
"""

import numpy as np
import matplotlib.pyplot as plt
import os

# ============================================================================
# CONFIGURABLE PARAMETERS - Modify these to experiment with different signals
# ============================================================================
SIGNAL_CONFIG = {
    'frequency': 2.0,      # Hz
    'amplitude': 1.0,      # Signal amplitude
    'duration': 2.0,       # seconds
    'sample_rate': 1000,   # samples per second
    'noise_level': 0.2,    # Standard deviation for noise
    'filter_window': 20,   # Moving average filter window size
}

# ============================================================================
# SIGNAL GENERATION FUNCTIONS
# ============================================================================

def generate_sine_wave(t, frequency, amplitude):
    """Generate a sine wave signal."""
    return amplitude * np.sin(2 * np.pi * frequency * t)

def generate_square_wave(t, frequency, amplitude):
    """Generate a square wave signal using numpy."""
    # Uses sign function on sine wave: positive values become +1, negative become -1
    return amplitude * np.sign(np.sin(2 * np.pi * frequency * t))

def generate_sawtooth_wave(t, frequency, amplitude):
    """Generate a sawtooth wave signal using numpy."""
    # Creates a repeating ramp that linearly increases from -1 to 1, then drops back
    # Uses modulo operation to create periodic waveform
    phase = (2 * np.pi * frequency * t) % (2 * np.pi)
    # Map phase from [0, 2π] to amplitude from [-1, 1]
    return amplitude * (phase / np.pi - 1)

def add_noise(signal, noise_level, seed=42):
    """Add Gaussian noise to a signal."""
    np.random.seed(seed)
    noise = np.random.normal(0, noise_level, len(signal))
    return signal + noise

def apply_filter(signal, window_size):
    """Apply moving average filter to reduce noise."""
    return np.convolve(signal, np.ones(window_size) / window_size, mode='same')

def calculate_snr(signal, noise):
    """Calculate Signal-to-Noise Ratio in dB."""
    signal_power = np.mean(signal ** 2)
    noise_power = np.mean(noise ** 2)
    if noise_power > 0:
        return 10 * np.log10(signal_power / noise_power)
    return np.inf

def calculate_statistics(signal, name):
    """Calculate and print signal statistics."""
    stats = {
        'mean': np.mean(signal),
        'std': np.std(signal),
        'min': np.min(signal),
        'max': np.max(signal),
        'rms': np.sqrt(np.mean(signal ** 2)),
    }
    print(f"\n{name} Statistics:")
    print(f"  Mean: {stats['mean']:.4f}")
    print(f"  Std Dev: {stats['std']:.4f}")
    print(f"  Min: {stats['min']:.4f}")
    print(f"  Max: {stats['max']:.4f}")
    print(f"  RMS: {stats['rms']:.4f}")
    return stats

# ============================================================================
# MAIN SCRIPT
# ============================================================================

def main():
    # Extract parameters
    freq = SIGNAL_CONFIG['frequency']
    amp = SIGNAL_CONFIG['amplitude']
    duration = SIGNAL_CONFIG['duration']
    sample_rate = SIGNAL_CONFIG['sample_rate']
    noise_level = SIGNAL_CONFIG['noise_level']
    filter_window = SIGNAL_CONFIG['filter_window']
    
    # Generate time array
    t = np.linspace(0, duration, int(sample_rate * duration))
    n_samples = len(t)
    
    # Generate clean signals
    clean_sine = generate_sine_wave(t, freq, amp)
    clean_square = generate_square_wave(t, freq, amp)
    clean_sawtooth = generate_sawtooth_wave(t, freq, amp)
    
    # Add noise to signals
    noisy_sine = add_noise(clean_sine, noise_level)
    noisy_square = add_noise(clean_square, noise_level)
    noisy_sawtooth = add_noise(clean_sawtooth, noise_level)
    
    # Apply filtering
    filtered_sine = apply_filter(noisy_sine, filter_window)
    filtered_square = apply_filter(noisy_square, filter_window)
    filtered_sawtooth = apply_filter(noisy_sawtooth, filter_window)
    
    # Frequency domain analysis
    freqs = np.fft.fftfreq(n_samples, 1/sample_rate)
    positive_freq_idx = freqs >= 0
    freqs_positive = freqs[positive_freq_idx]
    
    # Compute FFT for sine wave signals
    clean_sine_fft = np.abs(np.fft.fft(clean_sine))
    noisy_sine_fft = np.abs(np.fft.fft(noisy_sine))
    filtered_sine_fft = np.abs(np.fft.fft(filtered_sine))
    
    # Calculate SNR
    noise_sine = noisy_sine - clean_sine
    noise_filtered_sine = filtered_sine - clean_sine
    snr_noisy = calculate_snr(clean_sine, noise_sine)
    snr_filtered = calculate_snr(clean_sine, noise_filtered_sine)
    
    # Create comprehensive visualization
    fig = plt.figure(figsize=(16, 12))
    gs = fig.add_gridspec(4, 3, hspace=0.3, wspace=0.3)
    fig.suptitle('Example 5: Advanced Signal Visualization and Analysis', 
                 fontsize=18, fontweight='bold')
    
    # Time domain plots - Row 1: Clean signals
    ax1 = fig.add_subplot(gs[0, 0])
    ax1.plot(t, clean_sine, 'b-', linewidth=2)
    ax1.set_title('Sine Wave (Clean)', fontweight='bold')
    ax1.set_ylabel('Amplitude')
    ax1.grid(True, alpha=0.3)
    ax1.set_ylim([-1.2*amp, 1.2*amp])
    
    ax2 = fig.add_subplot(gs[0, 1])
    ax2.plot(t, clean_square, 'r-', linewidth=2)
    ax2.set_title('Square Wave (Clean)', fontweight='bold')
    ax2.grid(True, alpha=0.3)
    ax2.set_ylim([-1.2*amp, 1.2*amp])
    
    ax3 = fig.add_subplot(gs[0, 2])
    ax3.plot(t, clean_sawtooth, 'g-', linewidth=2)
    ax3.set_title('Sawtooth Wave (Clean)', fontweight='bold')
    ax3.grid(True, alpha=0.3)
    ax3.set_ylim([-1.2*amp, 1.2*amp])
    
    # Time domain plots - Row 2: Noisy signals
    ax4 = fig.add_subplot(gs[1, 0])
    ax4.plot(t, noisy_sine, 'b-', linewidth=1, alpha=0.7)
    ax4.set_title(f'Sine Wave (Noisy, SNR={snr_noisy:.1f} dB)', fontweight='bold')
    ax4.set_ylabel('Amplitude')
    ax4.grid(True, alpha=0.3)
    ax4.set_ylim([-1.5*amp, 1.5*amp])
    
    ax5 = fig.add_subplot(gs[1, 1])
    ax5.plot(t, noisy_square, 'r-', linewidth=1, alpha=0.7)
    ax5.set_title('Square Wave (Noisy)', fontweight='bold')
    ax5.grid(True, alpha=0.3)
    ax5.set_ylim([-1.5*amp, 1.5*amp])
    
    ax6 = fig.add_subplot(gs[1, 2])
    ax6.plot(t, noisy_sawtooth, 'g-', linewidth=1, alpha=0.7)
    ax6.set_title('Sawtooth Wave (Noisy)', fontweight='bold')
    ax6.grid(True, alpha=0.3)
    ax6.set_ylim([-1.5*amp, 1.5*amp])
    
    # Time domain plots - Row 3: Filtered signals
    ax7 = fig.add_subplot(gs[2, 0])
    ax7.plot(t, filtered_sine, 'g-', linewidth=2, label='Filtered')
    ax7.plot(t, clean_sine, 'b--', linewidth=1.5, alpha=0.5, label='Clean')
    ax7.set_title(f'Sine Wave (Filtered, SNR={snr_filtered:.1f} dB)', fontweight='bold')
    ax7.set_ylabel('Amplitude')
    ax7.legend()
    ax7.grid(True, alpha=0.3)
    ax7.set_ylim([-1.5*amp, 1.5*amp])
    
    ax8 = fig.add_subplot(gs[2, 1])
    ax8.plot(t, filtered_square, 'g-', linewidth=2)
    ax8.plot(t, clean_square, 'r--', linewidth=1.5, alpha=0.5)
    ax8.set_title('Square Wave (Filtered)', fontweight='bold')
    ax8.grid(True, alpha=0.3)
    ax8.set_ylim([-1.5*amp, 1.5*amp])
    
    ax9 = fig.add_subplot(gs[2, 2])
    ax9.plot(t, filtered_sawtooth, 'g-', linewidth=2)
    ax9.plot(t, clean_sawtooth, 'g--', linewidth=1.5, alpha=0.5)
    ax9.set_title('Sawtooth Wave (Filtered)', fontweight='bold')
    ax9.grid(True, alpha=0.3)
    ax9.set_ylim([-1.5*amp, 1.5*amp])
    
    # Frequency domain plot - Row 4: FFT comparison
    ax10 = fig.add_subplot(gs[3, :])
    ax10.plot(freqs_positive, clean_sine_fft[positive_freq_idx], 'b-', 
              linewidth=2, label='Clean Signal', alpha=0.7)
    ax10.plot(freqs_positive, noisy_sine_fft[positive_freq_idx], 'r-', 
              linewidth=1.5, label='Noisy Signal', alpha=0.7)
    ax10.plot(freqs_positive, filtered_sine_fft[positive_freq_idx], 'g-', 
              linewidth=2, label='Filtered Signal', alpha=0.8)
    ax10.set_xlabel('Frequency (Hz)', fontsize=12)
    ax10.set_ylabel('Magnitude', fontsize=12)
    ax10.set_title('Frequency Domain: Sine Wave Comparison (FFT)', 
                   fontsize=14, fontweight='bold')
    ax10.legend(fontsize=10)
    ax10.grid(True, alpha=0.3)
    ax10.set_xlim([0, 10])
    ax10.axvline(x=freq, color='k', linestyle='--', alpha=0.5, 
                 label=f'Signal Frequency ({freq} Hz)')
    ax10.legend()
    
    plt.show()
    
    # Print statistics
    print("=" * 60)
    print("SIGNAL ANALYSIS RESULTS")
    print("=" * 60)
    print(f"\nConfiguration:")
    print(f"  Frequency: {freq} Hz")
    print(f"  Amplitude: {amp}")
    print(f"  Duration: {duration} seconds")
    print(f"  Sample Rate: {sample_rate} Hz")
    print(f"  Noise Level: {noise_level}")
    print(f"  Filter Window: {filter_window} samples")
    
    print(f"\nSignal-to-Noise Ratio:")
    print(f"  Noisy Signal SNR: {snr_noisy:.2f} dB")
    print(f"  Filtered Signal SNR: {snr_filtered:.2f} dB")
    print(f"  SNR Improvement: {snr_filtered - snr_noisy:.2f} dB")
    
    # Calculate statistics for each signal type
    calculate_statistics(clean_sine, "Clean Sine Wave")
    calculate_statistics(noisy_sine, "Noisy Sine Wave")
    calculate_statistics(filtered_sine, "Filtered Sine Wave")
    
    # Export option (commented out by default)
    # Uncomment the following lines to save the plot
    # output_dir = "output"
    # os.makedirs(output_dir, exist_ok=True)
    # output_path = os.path.join(output_dir, "example5_signal_analysis.png")
    # fig.savefig(output_path, dpi=300, bbox_inches='tight')
    # print(f"\nPlot saved to: {output_path}")

if __name__ == "__main__":
    main()

