"""
NiceGUI Signal Visualization Application

A comprehensive web-based GUI for interactive signal visualization that combines
all signal processing examples into one unified interface.

Features:
- Interactive parameter controls (frequency, amplitude, duration, noise, filter)
- Real-time plot updates
- Multiple signal types (sine, square, sawtooth)
- Time-domain and frequency-domain visualization
- Statistics display (SNR, mean, std, min, max, RMS)
- Export functionality
"""

import numpy as np
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend for web
from nicegui import ui
import io
import base64
import os
from datetime import datetime

# ============================================================================
# SIGNAL GENERATION FUNCTIONS
# ============================================================================

def generate_sine_wave(t, frequency, amplitude):
    """Generate a sine wave signal."""
    return amplitude * np.sin(2 * np.pi * frequency * t)

def generate_square_wave(t, frequency, amplitude):
    """Generate a square wave signal using numpy."""
    return amplitude * np.sign(np.sin(2 * np.pi * frequency * t))

def generate_sawtooth_wave(t, frequency, amplitude):
    """Generate a sawtooth wave signal using numpy."""
    phase = (2 * np.pi * frequency * t) % (2 * np.pi)
    return amplitude * (phase / np.pi - 1)

def add_noise(signal, noise_level, seed=None):
    """Add Gaussian noise to a signal."""
    if seed is not None:
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

def calculate_statistics(signal):
    """Calculate signal statistics."""
    return {
        'mean': np.mean(signal),
        'std': np.std(signal),
        'min': np.min(signal),
        'max': np.max(signal),
        'rms': np.sqrt(np.mean(signal ** 2)),
    }

# ============================================================================
# DEFAULT PARAMETERS
# ============================================================================

DEFAULT_PARAMS = {
    'signal_type': 'Sine',
    'frequency': 2.0,
    'amplitude': 1.0,
    'duration': 2.0,
    'sample_rate': 1000,
    'noise_enabled': True,
    'noise_level': 0.2,
    'filter_enabled': True,
    'filter_window': 20,
}

# ============================================================================
# GUI APPLICATION
# ============================================================================

# Global variables for UI elements
time_plot = None
freq_plot = None
stats_label = None

def create_time_domain_plot(time, clean_signal, noisy_signal, filtered_signal, 
                           signal_type, noise_enabled, filter_enabled):
    """Create time-domain matplotlib plot."""
    fig, ax = plt.subplots(figsize=(10, 5))
    
    # Plot clean signal
    ax.plot(time, clean_signal, 'b-', linewidth=2, label='Clean Signal', alpha=0.8)
    
    # Plot noisy signal if enabled
    if noise_enabled:
        ax.plot(time, noisy_signal, 'r-', linewidth=1.5, label='Noisy Signal', alpha=0.7)
    
    # Plot filtered signal if enabled
    if filter_enabled and noise_enabled:
        ax.plot(time, filtered_signal, 'g-', linewidth=2, label='Filtered Signal', alpha=0.8)
    
    ax.set_xlabel('Time (seconds)', fontsize=12)
    ax.set_ylabel('Amplitude', fontsize=12)
    ax.set_title(f'Time Domain: {signal_type} Wave Signal', fontsize=14, fontweight='bold')
    ax.grid(True, alpha=0.3)
    ax.legend(fontsize=10)
    plt.tight_layout()
    
    return fig

def create_frequency_domain_plot(freqs_positive, clean_fft, noisy_fft, filtered_fft,
                                signal_type, frequency, noise_enabled, filter_enabled):
    """Create frequency-domain matplotlib plot."""
    fig, ax = plt.subplots(figsize=(10, 5))
    
    # Plot clean signal FFT
    ax.plot(freqs_positive, clean_fft, 'b-', linewidth=2, label='Clean Signal', alpha=0.7)
    
    # Plot noisy signal FFT if enabled
    if noise_enabled:
        ax.plot(freqs_positive, noisy_fft, 'r-', linewidth=1.5, label='Noisy Signal', alpha=0.7)
    
    # Plot filtered signal FFT if enabled
    if filter_enabled and noise_enabled:
        ax.plot(freqs_positive, filtered_fft, 'g-', linewidth=2, label='Filtered Signal', alpha=0.8)
    
    # Mark signal frequency
    ax.axvline(x=frequency, color='k', linestyle='--', alpha=0.5, 
               label=f'Signal Frequency ({frequency} Hz)')
    
    ax.set_xlabel('Frequency (Hz)', fontsize=12)
    ax.set_ylabel('Magnitude', fontsize=12)
    ax.set_title(f'Frequency Domain: {signal_type} Wave (FFT)', fontsize=14, fontweight='bold')
    ax.set_xlim([0, min(10, max(5, frequency * 3))])
    ax.legend(fontsize=10)
    ax.grid(True, alpha=0.3)
    plt.tight_layout()
    
    return fig

def matplotlib_to_base64(fig):
    """Convert matplotlib figure to base64 string for web display."""
    buf = io.BytesIO()
    fig.savefig(buf, format='png', dpi=100, bbox_inches='tight')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    return img_base64

def update_plots():
    """Update all plots and statistics based on current parameters."""
    global time_plot, freq_plot, stats_label
    
    # Get current parameter values
    signal_type = signal_type_select.value
    frequency = frequency_slider.value
    amplitude = amplitude_slider.value
    duration = duration_slider.value
    sample_rate = int(sample_rate_input.value)
    noise_enabled = noise_switch.value
    noise_level = noise_slider.value
    filter_enabled = filter_switch.value
    filter_window = int(filter_window_slider.value)
    
    # Generate time array
    t = np.linspace(0, duration, int(sample_rate * duration))
    n_samples = len(t)
    
    # Generate clean signal based on type
    if signal_type == 'Sine':
        clean_signal = generate_sine_wave(t, frequency, amplitude)
    elif signal_type == 'Square':
        clean_signal = generate_square_wave(t, frequency, amplitude)
    else:  # Sawtooth
        clean_signal = generate_sawtooth_wave(t, frequency, amplitude)
    
    # Add noise if enabled
    if noise_enabled:
        noisy_signal = add_noise(clean_signal, noise_level, seed=42)
    else:
        noisy_signal = clean_signal.copy()
    
    # Apply filter if enabled
    if filter_enabled and noise_enabled:
        filtered_signal = apply_filter(noisy_signal, filter_window)
    else:
        filtered_signal = clean_signal.copy()
    
    # Frequency domain analysis
    freqs = np.fft.fftfreq(n_samples, 1/sample_rate)
    positive_freq_idx = freqs >= 0
    freqs_positive = freqs[positive_freq_idx]
    
    # Compute FFT
    clean_fft = np.abs(np.fft.fft(clean_signal))[positive_freq_idx]
    noisy_fft = np.abs(np.fft.fft(noisy_signal))[positive_freq_idx]
    filtered_fft = np.abs(np.fft.fft(filtered_signal))[positive_freq_idx]
    
    # Calculate statistics
    stats_clean = calculate_statistics(clean_signal)
    stats_noisy = calculate_statistics(noisy_signal) if noise_enabled else None
    stats_filtered = calculate_statistics(filtered_signal) if (filter_enabled and noise_enabled) else None
    
    # Calculate SNR
    if noise_enabled:
        noise = noisy_signal - clean_signal
        snr_noisy = calculate_snr(clean_signal, noise)
        if filter_enabled:
            noise_filtered = filtered_signal - clean_signal
            snr_filtered = calculate_snr(clean_signal, noise_filtered)
        else:
            snr_filtered = None
    else:
        snr_noisy = None
        snr_filtered = None
    
    # Create plots
    fig_time = create_time_domain_plot(t, clean_signal, noisy_signal, filtered_signal,
                                      signal_type, noise_enabled, filter_enabled)
    fig_freq = create_frequency_domain_plot(freqs_positive, clean_fft, noisy_fft, filtered_fft,
                                           signal_type, frequency, noise_enabled, filter_enabled)
    
    # Convert to base64 and update UI
    time_img = matplotlib_to_base64(fig_time)
    freq_img = matplotlib_to_base64(fig_freq)
    
    time_plot.content = f'<img src="data:image/png;base64,{time_img}" style="width: 100%; max-width: 1000px;">'
    freq_plot.content = f'<img src="data:image/png;base64,{freq_img}" style="width: 100%; max-width: 1000px;">'
    
    # Update statistics
    stats_text = f"""
    <div style="font-family: monospace; line-height: 1.8;">
    <h3 style="margin-top: 0;">Signal Statistics</h3>
    <p><strong>Clean Signal:</strong></p>
    <ul style="margin: 0; padding-left: 20px;">
        <li>Mean: {stats_clean['mean']:.4f}</li>
        <li>Std Dev: {stats_clean['std']:.4f}</li>
        <li>Min: {stats_clean['min']:.4f}</li>
        <li>Max: {stats_clean['max']:.4f}</li>
        <li>RMS: {stats_clean['rms']:.4f}</li>
    </ul>
    """
    
    if stats_noisy:
        stats_text += f"""
    <p style="margin-top: 10px;"><strong>Noisy Signal:</strong></p>
    <ul style="margin: 0; padding-left: 20px;">
        <li>Mean: {stats_noisy['mean']:.4f}</li>
        <li>Std Dev: {stats_noisy['std']:.4f}</li>
        <li>Min: {stats_noisy['min']:.4f}</li>
        <li>Max: {stats_noisy['max']:.4f}</li>
        <li>RMS: {stats_noisy['rms']:.4f}</li>
        <li>SNR: {snr_noisy:.2f} dB</li>
    </ul>
    """
    
    if stats_filtered:
        stats_text += f"""
    <p style="margin-top: 10px;"><strong>Filtered Signal:</strong></p>
    <ul style="margin: 0; padding-left: 20px;">
        <li>Mean: {stats_filtered['mean']:.4f}</li>
        <li>Std Dev: {stats_filtered['std']:.4f}</li>
        <li>Min: {stats_filtered['min']:.4f}</li>
        <li>Max: {stats_filtered['max']:.4f}</li>
        <li>RMS: {stats_filtered['rms']:.4f}</li>
        <li>SNR: {snr_filtered:.2f} dB</li>
    </ul>
    """
    
    if snr_noisy and snr_filtered:
        snr_improvement = snr_filtered - snr_noisy
        stats_text += f"""
    <p style="margin-top: 10px;"><strong>SNR Improvement:</strong> {snr_improvement:.2f} dB</p>
    """
    
    stats_text += "</div>"
    stats_label.content = stats_text

def export_plot():
    """Export current plots to PNG files."""
    # Get current parameter values
    signal_type = signal_type_select.value
    frequency = frequency_slider.value
    amplitude = amplitude_slider.value
    duration = duration_slider.value
    sample_rate = int(sample_rate_input.value)
    noise_enabled = noise_switch.value
    noise_level = noise_slider.value
    filter_enabled = filter_switch.value
    filter_window = int(filter_window_slider.value)
    
    # Generate time array
    t = np.linspace(0, duration, int(sample_rate * duration))
    n_samples = len(t)
    
    # Generate signals
    if signal_type == 'Sine':
        clean_signal = generate_sine_wave(t, frequency, amplitude)
    elif signal_type == 'Square':
        clean_signal = generate_square_wave(t, frequency, amplitude)
    else:
        clean_signal = generate_sawtooth_wave(t, frequency, amplitude)
    
    if noise_enabled:
        noisy_signal = add_noise(clean_signal, noise_level, seed=42)
    else:
        noisy_signal = clean_signal.copy()
    
    if filter_enabled and noise_enabled:
        filtered_signal = apply_filter(noisy_signal, filter_window)
    else:
        filtered_signal = clean_signal.copy()
    
    # Frequency domain
    freqs = np.fft.fftfreq(n_samples, 1/sample_rate)
    positive_freq_idx = freqs >= 0
    freqs_positive = freqs[positive_freq_idx]
    
    clean_fft = np.abs(np.fft.fft(clean_signal))[positive_freq_idx]
    noisy_fft = np.abs(np.fft.fft(noisy_signal))[positive_freq_idx]
    filtered_fft = np.abs(np.fft.fft(filtered_signal))[positive_freq_idx]
    
    # Create combined figure
    fig = plt.figure(figsize=(14, 10))
    gs = fig.add_gridspec(2, 1, hspace=0.3)
    
    # Time domain
    ax1 = fig.add_subplot(gs[0])
    ax1.plot(t, clean_signal, 'b-', linewidth=2, label='Clean Signal', alpha=0.8)
    if noise_enabled:
        ax1.plot(t, noisy_signal, 'r-', linewidth=1.5, label='Noisy Signal', alpha=0.7)
    if filter_enabled and noise_enabled:
        ax1.plot(t, filtered_signal, 'g-', linewidth=2, label='Filtered Signal', alpha=0.8)
    ax1.set_xlabel('Time (seconds)', fontsize=12)
    ax1.set_ylabel('Amplitude', fontsize=12)
    ax1.set_title(f'Time Domain: {signal_type} Wave Signal', fontsize=14, fontweight='bold')
    ax1.grid(True, alpha=0.3)
    ax1.legend(fontsize=10)
    
    # Frequency domain
    ax2 = fig.add_subplot(gs[1])
    ax2.plot(freqs_positive, clean_fft, 'b-', linewidth=2, label='Clean Signal', alpha=0.7)
    if noise_enabled:
        ax2.plot(freqs_positive, noisy_fft, 'r-', linewidth=1.5, label='Noisy Signal', alpha=0.7)
    if filter_enabled and noise_enabled:
        ax2.plot(freqs_positive, filtered_fft, 'g-', linewidth=2, label='Filtered Signal', alpha=0.8)
    ax2.axvline(x=frequency, color='k', linestyle='--', alpha=0.5, 
                label=f'Signal Frequency ({frequency} Hz)')
    ax2.set_xlabel('Frequency (Hz)', fontsize=12)
    ax2.set_ylabel('Magnitude', fontsize=12)
    ax2.set_title(f'Frequency Domain: {signal_type} Wave (FFT)', fontsize=14, fontweight='bold')
    ax2.set_xlim([0, min(10, max(5, frequency * 3))])
    ax2.legend(fontsize=10)
    ax2.grid(True, alpha=0.3)
    
    plt.suptitle(f'Signal Visualization: {signal_type} Wave (f={frequency} Hz)', 
                 fontsize=16, fontweight='bold', y=0.995)
    
    # Save figure
    output_dir = "output"
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"signal_plot_{signal_type.lower()}_{timestamp}.png"
    output_path = os.path.join(output_dir, filename)
    fig.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close(fig)
    
    ui.notify(f'Plot exported to: {output_path}', type='positive')

def reset_to_defaults():
    """Reset all parameters to default values."""
    signal_type_select.value = DEFAULT_PARAMS['signal_type']
    frequency_slider.value = DEFAULT_PARAMS['frequency']
    amplitude_slider.value = DEFAULT_PARAMS['amplitude']
    duration_slider.value = DEFAULT_PARAMS['duration']
    sample_rate_input.value = str(DEFAULT_PARAMS['sample_rate'])
    noise_switch.value = DEFAULT_PARAMS['noise_enabled']
    noise_slider.value = DEFAULT_PARAMS['noise_level']
    filter_switch.value = DEFAULT_PARAMS['filter_enabled']
    filter_window_slider.value = DEFAULT_PARAMS['filter_window']
    update_plots()

# ============================================================================
# CREATE UI
# ============================================================================

@ui.page('/')
def main_page():
    global time_plot, freq_plot, stats_label, signal_type_select
    global frequency_slider, amplitude_slider, duration_slider, sample_rate_input
    global noise_switch, noise_slider, filter_switch, filter_window_slider
    
    ui.page_title('Signal Visualization')
    
    with ui.header(elevated=True).style('background-color: #1976d2').classes('items-center justify-between'):
        ui.label('Signal Visualization Application').style('color: white; font-size: 1.5em; font-weight: bold')
        ui.label('Interactive Signal Processing & Analysis').style('color: white; font-size: 1em')
    
    with ui.row().classes('w-full gap-4 p-4'):
        # Left Panel: Controls
        with ui.column().classes('w-80 gap-4'):
            with ui.card().classes('w-full'):
                ui.label('Signal Parameters').style('font-size: 1.2em; font-weight: bold; margin-bottom: 10px')
                
                ui.label('Signal Type:')
                signal_type_select = ui.select(
                    ['Sine', 'Square', 'Sawtooth'],
                    value=DEFAULT_PARAMS['signal_type']
                ).classes('w-full').on('update:model-value', lambda e: update_plots())
                
                ui.label('Frequency (Hz):')
                frequency_slider = ui.slider(
                    min=0.1, max=10.0, step=0.1, value=DEFAULT_PARAMS['frequency']
                ).classes('w-full').on('update:model-value', lambda e: update_plots())
                
                ui.label('Amplitude:')
                amplitude_slider = ui.slider(
                    min=0.1, max=2.0, step=0.1, value=DEFAULT_PARAMS['amplitude']
                ).classes('w-full').on('update:model-value', lambda e: update_plots())
                
                ui.label('Duration (seconds):')
                duration_slider = ui.slider(
                    min=0.5, max=5.0, step=0.1, value=DEFAULT_PARAMS['duration']
                ).classes('w-full').on('update:model-value', lambda e: update_plots())
                
                ui.label('Sample Rate (Hz):')
                sample_rate_input = ui.number(
                    label='', value=DEFAULT_PARAMS['sample_rate'], min=100, max=10000, step=100
                ).classes('w-full').on('update:model-value', lambda e: update_plots())
            
            with ui.card().classes('w-full'):
                ui.label('Noise Controls').style('font-size: 1.2em; font-weight: bold; margin-bottom: 10px')
                
                noise_switch = ui.switch(
                    'Enable Noise', value=DEFAULT_PARAMS['noise_enabled']
                ).classes('w-full').on('update:model-value', lambda e: update_plots())
                
                ui.label('Noise Level:')
                noise_slider = ui.slider(
                    min=0.0, max=0.5, step=0.01, value=DEFAULT_PARAMS['noise_level']
                ).classes('w-full').on('update:model-value', lambda e: update_plots())
            
            with ui.card().classes('w-full'):
                ui.label('Filter Controls').style('font-size: 1.2em; font-weight: bold; margin-bottom: 10px')
                
                filter_switch = ui.switch(
                    'Enable Filter', value=DEFAULT_PARAMS['filter_enabled']
                ).classes('w-full').on('update:model-value', lambda e: update_plots())
                
                ui.label('Filter Window Size:')
                filter_window_slider = ui.slider(
                    min=5, max=50, step=1, value=DEFAULT_PARAMS['filter_window']
                ).classes('w-full').on('update:model-value', lambda e: update_plots())
            
            with ui.card().classes('w-full'):
                ui.label('Actions').style('font-size: 1.2em; font-weight: bold; margin-bottom: 10px')
                
                ui.button('Update Plot', on_click=update_plots, icon='refresh').classes('w-full')
                ui.button('Export Plot', on_click=export_plot, icon='download').classes('w-full')
                ui.button('Reset to Defaults', on_click=reset_to_defaults, icon='restart_alt').classes('w-full')
        
        # Right Panel: Visualizations
        with ui.column().classes('flex-1 gap-4'):
            with ui.card().classes('w-full'):
                ui.label('Time Domain Visualization').style('font-size: 1.2em; font-weight: bold; margin-bottom: 10px')
                time_plot = ui.html('', sanitize=False).classes('w-full')
            
            with ui.card().classes('w-full'):
                ui.label('Frequency Domain Visualization (FFT)').style('font-size: 1.2em; font-weight: bold; margin-bottom: 10px')
                freq_plot = ui.html('', sanitize=False).classes('w-full')
            
            with ui.card().classes('w-full'):
                stats_label = ui.html('', sanitize=False).classes('w-full')
    
    # Initial plot update after a short delay to ensure UI is ready
    ui.timer(0.1, update_plots, once=True)

if __name__ in {"__main__", "__mp_main__"}:
    import socket
    import sys
    
    def find_free_port(start_port=3030, max_attempts=10):
        """Find a free port starting from start_port."""
        for i in range(max_attempts):
            port = start_port + i
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                try:
                    s.bind(('127.0.0.1', port))
                    return port
                except OSError:
                    continue
        return None
    
    # Try to find a free port
    port = find_free_port(3030)
    if port is None:
        print("Warning: Could not find a free port in range 3030-3039.")
        print("Trying port 3030 anyway...")
        port = 3030
    
    try:
        print(f"Starting Signal Visualization application on http://localhost:{port}")
        print("Press Ctrl+C to stop the server")
        ui.run(port=port, title='Signal Visualization', favicon='📊', show=True)
    except OSError as e:
        if "10013" in str(e) or "permission" in str(e).lower() or "forbidden" in str(e).lower():
            print(f"\nError: Port {port} is not accessible (WinError 10013).")
            print("Possible solutions:")
            print(f"1. Close any application using port {port}")
            print("2. Run as administrator")
            print("3. Try a different port by modifying the start_port in find_free_port()")
            print("4. Check Windows Firewall settings")
            sys.exit(1)
        else:
            raise

