# ==============================================================================
# Chapter 4: Linear Regression for Sensor Value Prediction
# Python Code for all examples
# ==============================================================================

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.preprocessing import StandardScaler
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
# PREPARE DATA FOR REGRESSION
# ==============================================================================

# Predict temperature from other sensors and time
X = df[["time", "vibration", "pressure", "current"]].values
y = df["temperature"].values

# Normalize features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42
)

print(f"Training samples: {len(X_train)}")
print(f"Test samples: {len(X_test)}")

# ==============================================================================
# TRAIN LINEAR REGRESSION MODEL
# ==============================================================================

# Create and train model
model = LinearRegression()
model.fit(X_train, y_train)

# Make predictions
y_train_pred = model.predict(X_train)
y_test_pred = model.predict(X_test)

# ==============================================================================
# EVALUATE MODEL
# ==============================================================================

# Training metrics
train_mse = mean_squared_error(y_train, y_train_pred)
train_rmse = np.sqrt(train_mse)
train_mae = mean_absolute_error(y_train, y_train_pred)
train_r2 = r2_score(y_train, y_train_pred)

# Test metrics
test_mse = mean_squared_error(y_test, y_test_pred)
test_rmse = np.sqrt(test_mse)
test_mae = mean_absolute_error(y_test, y_test_pred)
test_r2 = r2_score(y_test, y_test_pred)

print("\n" + "="*60)
print("Model Performance")
print("="*60)
print(f"\nTraining Set:")
print(f"  MSE:  {train_mse:.4f}")
print(f"  RMSE: {train_rmse:.4f}")
print(f"  MAE:  {train_mae:.4f}")
print(f"  R²:   {train_r2:.4f}")

print(f"\nTest Set:")
print(f"  MSE:  {test_mse:.4f}")
print(f"  RMSE: {test_rmse:.4f}")
print(f"  MAE:  {test_mae:.4f}")
print(f"  R²:   {test_r2:.4f}")

# Feature coefficients
print("\n" + "="*60)
print("Feature Coefficients")
print("="*60)
feature_names = ["time", "vibration", "pressure", "current"]
for name, coef in zip(feature_names, model.coef_):
    print(f"  {name:12s}: {coef:8.4f}")
print(f"  {'Intercept':12s}: {model.intercept_:8.4f}")

# ==============================================================================
# VISUALIZATION
# ==============================================================================

fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# Actual vs Predicted (Test Set)
axes[0].scatter(y_test, y_test_pred, alpha=0.5, s=20)
axes[0].plot([y_test.min(), y_test.max()], 
             [y_test.min(), y_test.max()], 
             'r--', lw=2, label='Perfect Prediction')
axes[0].set_xlabel("Actual Temperature (°C)")
axes[0].set_ylabel("Predicted Temperature (°C)")
axes[0].set_title(f"Linear Regression: Actual vs Predicted\n(R² = {test_r2:.4f})")
axes[0].legend()
axes[0].grid(True, alpha=0.3)

# Residuals plot
residuals = y_test - y_test_pred
axes[1].scatter(y_test_pred, residuals, alpha=0.5, s=20)
axes[1].axhline(y=0, color='r', linestyle='--', linewidth=2)
axes[1].set_xlabel("Predicted Temperature (°C)")
axes[1].set_ylabel("Residuals (°C)")
axes[1].set_title("Residuals Plot")
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig("output/chapter04-regression.png", dpi=150, bbox_inches='tight')
plt.show()

# ==============================================================================
# PREDICTION ON NEW DATA
# ==============================================================================

# Generate new time points
new_time = np.arange(100, 110, 0.1)
new_vibration = 1 + 0.1 * np.sin(2*new_time) + np.random.normal(0, 0.05, len(new_time))
new_pressure = 100 + 5 * np.sin(0.5*new_time) + np.random.normal(0, 1, len(new_time))
new_current = 10 + 0.3 * np.sin(new_time) + np.random.normal(0, 0.1, len(new_time))

# Actual temperature (for comparison)
new_temperature_actual = 50 + 0.5 * np.sin(new_time) + np.random.normal(0, 0.2, len(new_time))

# Prepare features
X_new = np.column_stack([new_time, new_vibration, new_pressure, new_current])
X_new_scaled = scaler.transform(X_new)

# Predict
new_temperature_pred = model.predict(X_new_scaled)

# Plot predictions
plt.figure(figsize=(12, 6))
plt.plot(new_time, new_temperature_actual, label="Actual", linewidth=2, alpha=0.7)
plt.plot(new_time, new_temperature_pred, label="Predicted", linewidth=2, linestyle='--')
plt.xlabel("Time (s)")
plt.ylabel("Temperature (°C)")
plt.title("Temperature Prediction on New Data")
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig("output/chapter04-prediction.png", dpi=150, bbox_inches='tight')
plt.show()

