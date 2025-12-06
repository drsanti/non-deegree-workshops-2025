# ==============================================================================
# Chapter 1: Generate Synthetic Industrial Sensor Data
# Python Code for all examples
# ==============================================================================

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import os

# Set seed for reproducibility
np.random.seed(42)

# Create output directory if it doesn't exist
os.makedirs("output", exist_ok=True)

# ==============================================================================
# DATA GENERATION - Multiple Industrial Sensors
# ==============================================================================

# Synthetic time axis (100 seconds, sampled at 10 Hz)
time = np.arange(0, 100, 0.1)

# Temperature sensor with noise + natural oscillation
# Base temperature: 50°C with sinusoidal variation and noise
temperature = 50 + 0.5 * np.sin(time) + np.random.normal(0, 0.2, len(time))

# Vibration sensor with low noise
# Base vibration: 1.0 with higher frequency oscillation
vibration = 1 + 0.1 * np.sin(2*time) + np.random.normal(0, 0.05, len(time))

# Pressure sensor
# Base pressure: 100 PSI with slower oscillation
pressure = 100 + 5 * np.sin(0.5*time) + np.random.normal(0, 1, len(time))

# Current sensor
# Base current: 10 A with sinusoidal variation
current = 10 + 0.3 * np.sin(time) + np.random.normal(0, 0.1, len(time))

# Create DataFrame
df = pd.DataFrame({
    "time": time,
    "temperature": temperature,
    "vibration": vibration,
    "pressure": pressure,
    "current": current
})

# ==============================================================================
# VISUALIZATION - Multi-sensor Plot
# ==============================================================================

plt.figure(figsize=(12, 8))

plt.subplot(2, 2, 1)
plt.plot(time, temperature, label="Temperature", color='red', linewidth=1)
plt.xlabel("Time (s)")
plt.ylabel("Temperature (°C)")
plt.title("Temperature Sensor")
plt.grid(True, alpha=0.3)
plt.legend()

plt.subplot(2, 2, 2)
plt.plot(time, vibration, label="Vibration", color='blue', linewidth=1)
plt.xlabel("Time (s)")
plt.ylabel("Vibration (g)")
plt.title("Vibration Sensor")
plt.grid(True, alpha=0.3)
plt.legend()

plt.subplot(2, 2, 3)
plt.plot(time, pressure, label="Pressure", color='green', linewidth=1)
plt.xlabel("Time (s)")
plt.ylabel("Pressure (PSI)")
plt.title("Pressure Sensor")
plt.grid(True, alpha=0.3)
plt.legend()

plt.subplot(2, 2, 4)
plt.plot(time, current, label="Current", color='orange', linewidth=1)
plt.xlabel("Time (s)")
plt.ylabel("Current (A)")
plt.title("Current Sensor")
plt.grid(True, alpha=0.3)
plt.legend()

plt.tight_layout()
plt.savefig("output/chapter01-sensors.png", dpi=150, bbox_inches='tight')
plt.show()

# ==============================================================================
# DATA SUMMARY
# ==============================================================================

print("\n" + "="*60)
print("Sensor Data Summary")
print("="*60)
print(df.describe())
print("\nData shape:", df.shape)
print("Time range:", df["time"].min(), "to", df["time"].max(), "seconds")

