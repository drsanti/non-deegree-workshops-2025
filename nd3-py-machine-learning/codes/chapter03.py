# ==============================================================================
# Chapter 3: Advanced Visualization & Exploratory Data Analysis
# Python Code for all examples
# ==============================================================================

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
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
# CORRELATION ANALYSIS
# ==============================================================================

# Calculate correlation matrix
sensor_cols = ["temperature", "vibration", "pressure", "current"]
corr = df[sensor_cols].corr()

# Heatmap
plt.figure(figsize=(8, 6))
sns.heatmap(corr, annot=True, cmap="coolwarm", center=0, 
            square=True, fmt='.3f', cbar_kws={"shrink": 0.8})
plt.title("Sensor Correlation Matrix", fontsize=14, fontweight='bold')
plt.tight_layout()
plt.savefig("output/chapter03-correlation.png", dpi=150, bbox_inches='tight')
plt.show()

# ==============================================================================
# DISTRIBUTION PLOTS
# ==============================================================================

fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# Temperature distribution
axes[0, 0].hist(df["temperature"], bins=30, color='red', alpha=0.7, edgecolor='black')
axes[0, 0].set_xlabel("Temperature (°C)")
axes[0, 0].set_ylabel("Frequency")
axes[0, 0].set_title("Temperature Distribution")
axes[0, 0].grid(True, alpha=0.3)
axes[0, 0].axvline(df["temperature"].mean(), color='darkred', 
                   linestyle='--', linewidth=2, label=f'Mean: {df["temperature"].mean():.2f}')
axes[0, 0].legend()

# Vibration distribution
axes[0, 1].hist(df["vibration"], bins=30, color='blue', alpha=0.7, edgecolor='black')
axes[0, 1].set_xlabel("Vibration (g)")
axes[0, 1].set_ylabel("Frequency")
axes[0, 1].set_title("Vibration Distribution")
axes[0, 1].grid(True, alpha=0.3)
axes[0, 1].axvline(df["vibration"].mean(), color='darkblue', 
                   linestyle='--', linewidth=2, label=f'Mean: {df["vibration"].mean():.2f}')
axes[0, 1].legend()

# Pressure distribution
axes[1, 0].hist(df["pressure"], bins=30, color='green', alpha=0.7, edgecolor='black')
axes[1, 0].set_xlabel("Pressure (PSI)")
axes[1, 0].set_ylabel("Frequency")
axes[1, 0].set_title("Pressure Distribution")
axes[1, 0].grid(True, alpha=0.3)
axes[1, 0].axvline(df["pressure"].mean(), color='darkgreen', 
                   linestyle='--', linewidth=2, label=f'Mean: {df["pressure"].mean():.2f}')
axes[1, 0].legend()

# Current distribution
axes[1, 1].hist(df["current"], bins=30, color='orange', alpha=0.7, edgecolor='black')
axes[1, 1].set_xlabel("Current (A)")
axes[1, 1].set_ylabel("Frequency")
axes[1, 1].set_title("Current Distribution")
axes[1, 1].grid(True, alpha=0.3)
axes[1, 1].axvline(df["current"].mean(), color='darkorange', 
                   linestyle='--', linewidth=2, label=f'Mean: {df["current"].mean():.2f}')
axes[1, 1].legend()

plt.tight_layout()
plt.savefig("output/chapter03-distributions.png", dpi=150, bbox_inches='tight')
plt.show()

# ==============================================================================
# PAIRWISE SCATTER PLOTS
# ==============================================================================

# Create pair plot
pair_df = df[sensor_cols].sample(n=500, random_state=42)  # Sample for clarity
sns.pairplot(pair_df, diag_kind='kde', plot_kws={'alpha': 0.5})
plt.suptitle("Pairwise Sensor Relationships", y=1.02, fontsize=14, fontweight='bold')
plt.savefig("output/chapter03-pairplot.png", dpi=150, bbox_inches='tight')
plt.show()

# ==============================================================================
# BOX PLOTS
# ==============================================================================

plt.figure(figsize=(10, 6))
box_data = [df["temperature"], df["vibration"], df["pressure"], df["current"]]
plt.boxplot(box_data, labels=["Temperature", "Vibration", "Pressure", "Current"])
plt.ylabel("Normalized Value")
plt.title("Sensor Data Box Plots (Outlier Detection)")
plt.grid(True, alpha=0.3, axis='y')
plt.tight_layout()
plt.savefig("output/chapter03-boxplots.png", dpi=150, bbox_inches='tight')
plt.show()

# ==============================================================================
# TIME SERIES COMPARISON
# ==============================================================================

# Normalize for comparison
from sklearn.preprocessing import MinMaxScaler
scaler = MinMaxScaler()
df_normalized = pd.DataFrame(
    scaler.fit_transform(df[sensor_cols]),
    columns=sensor_cols,
    index=df.index
)

plt.figure(figsize=(12, 6))
for col in sensor_cols:
    plt.plot(df["time"], df_normalized[col], label=col.capitalize(), linewidth=1.5, alpha=0.8)
plt.xlabel("Time (s)")
plt.ylabel("Normalized Value (0-1)")
plt.title("Normalized Sensor Readings Over Time")
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig("output/chapter03-timeseries.png", dpi=150, bbox_inches='tight')
plt.show()

# ==============================================================================
# STATISTICAL SUMMARY
# ==============================================================================

print("\n" + "="*60)
print("Statistical Summary")
print("="*60)
print(df[sensor_cols].describe())
print("\n" + "="*60)
print("Correlation Matrix")
print("="*60)
print(corr)
print("\n" + "="*60)
print("Key Insights")
print("="*60)
print(f"Temperature range: {df['temperature'].min():.2f} to {df['temperature'].max():.2f} °C")
print(f"Vibration range: {df['vibration'].min():.2f} to {df['vibration'].max():.2f} g")
print(f"Pressure range: {df['pressure'].min():.2f} to {df['pressure'].max():.2f} PSI")
print(f"Current range: {df['current'].min():.2f} to {df['current'].max():.2f} A")

