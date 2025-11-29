"""
Basic Matplotlib Example

This script demonstrates a simple line plot using matplotlib.
Run this to verify your matplotlib installation is working correctly.

This example shows:
- Generating a sine wave signal
- Adding noise to the signal
- Visualizing clean and noisy signals
"""

import matplotlib.pyplot as plt
import numpy as np


def create_sine_wave(time, frequency=1.0, amplitude=1.0):
    """
    Create a sine wave signal.
    
    Parameters:
    -----------
    time : array-like
        Time array for the signal
    frequency : float, optional
        Frequency of the sine wave in Hz (default: 1.0)
    amplitude : float, optional
        Amplitude of the sine wave (default: 1.0)
    
    Returns:
    --------
    signal : ndarray
        Sine wave signal values
    """
    return amplitude * np.sin(2 * np.pi * frequency * time)


def create_noise(size, noise_level=0.1, seed=42):
    """
    Create Gaussian noise.
    
    Parameters:
    -----------
    size : int
        Number of noise samples to generate
    noise_level : float, optional
        Standard deviation of the noise (default: 0.1)
    seed : int, optional
        Random seed for reproducibility (default: 42)
    
    Returns:
    --------
    noise : ndarray
        Noise values following a normal distribution
    """
    np.random.seed(seed)
    return np.random.normal(0, noise_level, size)


def add_signal_and_noise(signal, noise):
    """
    Add noise to a clean signal.
    
    Parameters:
    -----------
    signal : array-like
        Clean signal values
    noise : array-like
        Noise values to add
    
    Returns:
    --------
    noisy_signal : ndarray
        Signal with noise added
    """
    return signal + noise


def plot_signals(time, clean_signal, noisy_signal=None):
    """
    Plot signals using matplotlib.
    
    Parameters:
    -----------
    time : array-like
        Time array for the x-axis
    clean_signal : array-like
        Clean signal to plot
    noisy_signal : array-like, optional
        Noisy signal to plot for comparison (default: None)
    """
    plt.figure(figsize=(12, 6))
    
    # Plot clean signal
    plt.plot(time, clean_signal, 'b-', linewidth=2, label='Clean Signal', alpha=0.8)
    
    # Plot noisy signal if provided
    if noisy_signal is not None:
        plt.plot(time, noisy_signal, 'r-', linewidth=1.5, label='Noisy Signal', alpha=0.7)
    
    plt.xlabel('Time (seconds)', fontsize=12)
    plt.ylabel('Amplitude', fontsize=12)
    plt.title('Basic Matplotlib Example: Sine Wave Signal', fontsize=14, fontweight='bold')
    plt.grid(True, alpha=0.3)
    plt.legend(fontsize=10)
    plt.tight_layout()
    
    # Display the plot
    plt.show()


def main():
    """
    Main function to run the example.
    """
    # Signal parameters
    frequency = 4.0  # Hz
    amplitude = 1.0
    duration = 1.0  # seconds
    sample_rate = 500  # samples per second
    noise_level = 0.2  # Standard deviation of noise
    
    # Generate time array
    time = np.linspace(0, duration, int(sample_rate * duration))
    
    # Create clean sine wave signal
    clean_signal = create_sine_wave(time, frequency, amplitude)
    
    # Create noise
    noise = create_noise(len(time), noise_level)
    
    # Add noise to signal
    noisy_signal = add_signal_and_noise(clean_signal, noise)
    
    # Plot the signals
    plot_signals(time, clean_signal, noisy_signal)
    
    # Print status
    print("Matplotlib is working correctly! ✓")
    print(f"Generated signal with {len(time)} samples")
    print(f"Frequency: {frequency} Hz, Amplitude: {amplitude}")


if __name__ == "__main__":
    main()

