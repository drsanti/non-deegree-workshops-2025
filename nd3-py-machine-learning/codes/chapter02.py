# ==============================================================================
# Chapter 2: Preprocessing & Feature Engineering
# Python Code for all examples
# ==============================================================================

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from scipy import stats
import os

# Set seed for reproducibility
np.random.seed(42)

# Create output directory if it doesn't exist
os.makedirs("output", exist_ok=True)

# ==============================================================================
# GENERATE DATA (from Chapter 1)
# ==============================================================================

time = np.arange(0, 100, 0.1)
temperature = 50 + 0.5 * np.sin(time) + np.random.normal(0, 0.2, len(time))
vibration = 1 + 0.1 * np.sin(2*time) + np.random.normal(0, 0.05, len(time))
pressure = 100 + 5 * np.sin(0.5*time) + np.random.normal(0, 1, len(time))
current = 10 + 0.3 * np.sin(time) + np.random.normal(0, 0.1, len(time))

df = pd.DataFrame({
    "time": time,
    "temperature": temperature,
    "vibration": vibration,
    "pressure": pressure,
    "current": current
})

# ==============================================================================
# SMOOTHING - Rolling Average
# ==============================================================================

# Rolling average to smooth noise
window_size = 10
df["temp_smooth"] = df["temperature"].rolling(window_size).mean()
df["vib_smooth"] = df["vibration"].rolling(window_size).mean()
df["press_smooth"] = df["pressure"].rolling(window_size).mean()
df["curr_smooth"] = df["current"].rolling(window_size).mean()

# ==============================================================================
# FEATURE ENGINEERING
# ==============================================================================

# Gradient (rate of change)
df["temp_grad"] = np.gradient(df["temperature"])
df["vib_grad"] = np.gradient(df["vibration"])
df["press_grad"] = np.gradient(df["pressure"])
df["curr_grad"] = np.gradient(df["current"])

# Rolling statistics
df["temp_std"] = df["temperature"].rolling(20).std()
df["vib_std"] = df["vibration"].rolling(20).std()
df["press_std"] = df["pressure"].rolling(20).std()
df["curr_std"] = df["current"].rolling(20).std()

# Rolling maximum and minimum
df["temp_max"] = df["temperature"].rolling(20).max()
df["temp_min"] = df["temperature"].rolling(20).min()

# ==============================================================================
# OUTLIER REMOVAL
# ==============================================================================

# Remove outliers using z-score (threshold = 3)
sensor_cols = ["temperature", "vibration", "pressure", "current"]
z_scores = np.abs(stats.zscore(df[sensor_cols]))
df_clean = df[(z_scores < 3).all(axis=1)].copy()

print(f"Original data points: {len(df)}")
print(f"After outlier removal: {len(df_clean)}")
print(f"Removed: {len(df) - len(df_clean)} outliers")

# ==============================================================================
# NORMALIZATION
# ==============================================================================

# Min-Max Scaling (0 to 1)
scaler_minmax = MinMaxScaler()
df_minmax = pd.DataFrame(
    scaler_minmax.fit_transform(df_clean[sensor_cols]),
    columns=[col + "_minmax" for col in sensor_cols],
    index=df_clean.index
)

# Standard Scaling (mean=0, std=1)
scaler_std = StandardScaler()
df_standard = pd.DataFrame(
    scaler_std.fit_transform(df_clean[sensor_cols]),
    columns=[col + "_standard" for col in sensor_cols],
    index=df_clean.index
)

# Combine with original data
df_processed = pd.concat([df_clean[["time"]], df_minmax, df_standard], axis=1)

# ==============================================================================
# VISUALIZATION
# ==============================================================================

fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# Original vs Smoothed Temperature
axes[0, 0].plot(df["time"], df["temperature"], label="Original", alpha=0.5, linewidth=1)
axes[0, 0].plot(df["time"], df["temp_smooth"], label="Smoothed", linewidth=2)
axes[0, 0].set_xlabel("Time (s)")
axes[0, 0].set_ylabel("Temperature (°C)")
axes[0, 0].set_title("Original vs Smoothed Temperature")
axes[0, 0].legend()
axes[0, 0].grid(True, alpha=0.3)

# Gradient
axes[0, 1].plot(df["time"], df["temp_grad"], label="Temperature Gradient", linewidth=1)
axes[0, 1].set_xlabel("Time (s)")
axes[0, 1].set_ylabel("Gradient")
axes[0, 1].set_title("Temperature Gradient (Rate of Change)")
axes[0, 1].grid(True, alpha=0.3)
axes[0, 1].legend()

# Rolling Statistics
axes[1, 0].plot(df["time"], df["temperature"], label="Temperature", alpha=0.3, linewidth=1)
axes[1, 0].plot(df["time"], df["temp_std"], label="Rolling Std", linewidth=2)
axes[1, 0].set_xlabel("Time (s)")
axes[1, 0].set_ylabel("Value")
axes[1, 0].set_title("Rolling Standard Deviation")
axes[1, 0].legend()
axes[1, 0].grid(True, alpha=0.3)

# Normalized Data Comparison
axes[1, 1].plot(df_processed["time"], df_processed["temperature_minmax"], 
                label="Min-Max Scaled", linewidth=1)
axes[1, 1].plot(df_processed["time"], df_processed["temperature_standard"], 
                label="Standard Scaled", linewidth=1)
axes[1, 1].set_xlabel("Time (s)")
axes[1, 1].set_ylabel("Normalized Value")
axes[1, 1].set_title("Normalization Comparison")
axes[1, 1].legend()
axes[1, 1].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig("output/chapter02-preprocessing.png", dpi=150, bbox_inches='tight')
plt.show()

# ==============================================================================
# SUMMARY
# ==============================================================================

print("\n" + "="*60)
print("Feature Engineering Summary")
print("="*60)
print("\nNew features created:")
print("- Smoothed values (rolling mean)")
print("- Gradients (rate of change)")
print("- Rolling statistics (std, max, min)")
print("- Normalized values (Min-Max and Standard scaling)")

