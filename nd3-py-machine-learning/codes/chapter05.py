# ==============================================================================
# Chapter 5: Logistic Regression for Binary Classification
# Python Code for all examples
# ==============================================================================

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
from sklearn.preprocessing import StandardScaler
import os

# Set seed for reproducibility
np.random.seed(42)

# Create output directory if it doesn't exist
os.makedirs("output", exist_ok=True)

# ==============================================================================
# GENERATE CLASSIFICATION DATA
# ==============================================================================

# Normal operation data
n_normal = 500
normal_vibration = np.random.normal(1.0, 0.1, n_normal)
normal_temp = np.random.normal(50, 2, n_normal)
normal_pressure = np.random.normal(100, 5, n_normal)
normal_current = np.random.normal(10, 0.5, n_normal)

# Abnormal operation data (e.g., bearing failure)
n_abnormal = 150
abnormal_vibration = np.random.normal(1.6, 0.2, n_abnormal)  # Higher vibration
abnormal_temp = np.random.normal(55, 3, n_abnormal)  # Higher temperature
abnormal_pressure = np.random.normal(105, 6, n_abnormal)  # Slightly higher pressure
abnormal_current = np.random.normal(11, 0.7, n_abnormal)  # Higher current

# Combine features
X = np.column_stack([
    np.concatenate([normal_vibration, abnormal_vibration]),
    np.concatenate([normal_temp, abnormal_temp]),
    np.concatenate([normal_pressure, abnormal_pressure]),
    np.concatenate([normal_current, abnormal_current])
])

# Labels: 0=normal, 1=abnormal
y = np.array([0]*n_normal + [1]*n_abnormal)

print(f"Normal samples: {n_normal}")
print(f"Abnormal samples: {n_abnormal}")
print(f"Total samples: {len(y)}")

# ==============================================================================
# PREPARE DATA
# ==============================================================================

# Normalize features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\nTraining samples: {len(X_train)}")
print(f"Test samples: {len(X_test)}")

# ==============================================================================
# TRAIN LOGISTIC REGRESSION MODEL
# ==============================================================================

# Create and train model
clf = LogisticRegression(max_iter=1000, random_state=42)
clf.fit(X_train, y_train)

# Make predictions
y_train_pred = clf.predict(X_train)
y_test_pred = clf.predict(X_test)
y_test_proba = clf.predict_proba(X_test)[:, 1]  # Probability of class 1

# ==============================================================================
# EVALUATE MODEL
# ==============================================================================

# Training accuracy
train_acc = accuracy_score(y_train, y_train_pred)
print("\n" + "="*60)
print("Model Performance")
print("="*60)
print(f"\nTraining Accuracy: {train_acc:.4f}")

# Test accuracy
test_acc = accuracy_score(y_test, y_test_pred)
print(f"Test Accuracy: {test_acc:.4f}")

# Confusion matrix
cm = confusion_matrix(y_test, y_test_pred)
print("\n" + "="*60)
print("Confusion Matrix")
print("="*60)
print(f"\n                Predicted")
print(f"              Normal  Abnormal")
print(f"Actual Normal    {cm[0,0]:4d}     {cm[0,1]:4d}")
print(f"       Abnormal  {cm[1,0]:4d}     {cm[1,1]:4d}")

# Classification report
print("\n" + "="*60)
print("Classification Report")
print("="*60)
print(classification_report(y_test, y_test_pred, 
                            target_names=['Normal', 'Abnormal']))

# Feature coefficients
print("\n" + "="*60)
print("Feature Coefficients")
print("="*60)
feature_names = ["Vibration", "Temperature", "Pressure", "Current"]
for name, coef in zip(feature_names, clf.coef_[0]):
    print(f"  {name:12s}: {coef:8.4f}")
print(f"  {'Intercept':12s}: {clf.intercept_[0]:8.4f}")

# ==============================================================================
# VISUALIZATION - 2D Decision Boundary
# ==============================================================================

# Use first two features for visualization
X_2d = X[:, [0, 1]]  # Vibration and Temperature
X_2d_scaled = scaler.fit_transform(X_2d)

# Train on 2D data
clf_2d = LogisticRegression(max_iter=1000, random_state=42)
clf_2d.fit(X_2d_scaled, y)

# Create mesh for decision boundary
xx, yy = np.meshgrid(
    np.linspace(X_2d_scaled[:, 0].min()-0.5, X_2d_scaled[:, 0].max()+0.5, 100),
    np.linspace(X_2d_scaled[:, 1].min()-0.5, X_2d_scaled[:, 1].max()+0.5, 100)
)
Z = clf_2d.predict_proba(np.c_[xx.ravel(), yy.ravel()])[:, 1]
Z = Z.reshape(xx.shape)

# Plot
plt.figure(figsize=(10, 8))
contour = plt.contourf(xx, yy, Z, levels=20, alpha=0.6, cmap='RdYlBu')
plt.colorbar(contour, label='Probability of Abnormal')
plt.contour(xx, yy, Z, levels=[0.5], colors='black', linewidths=2, linestyles='--')

# Scatter plot
plt.scatter(X_2d_scaled[y==0, 0], X_2d_scaled[y==0, 1], 
           label="Normal", alpha=0.6, s=30, edgecolors='black', linewidths=0.5)
plt.scatter(X_2d_scaled[y==1, 0], X_2d_scaled[y==1, 1], 
           label="Abnormal", alpha=0.6, s=30, edgecolors='black', linewidths=0.5)

plt.xlabel("Vibration (normalized)")
plt.ylabel("Temperature (normalized)")
plt.title("Logistic Regression Decision Boundary\n(2D projection)")
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig("output/chapter05-decision-boundary.png", dpi=150, bbox_inches='tight')
plt.show()

# ==============================================================================
# PROBABILITY DISTRIBUTION
# ==============================================================================

plt.figure(figsize=(10, 6))
plt.hist(y_test_proba[y_test==0], bins=20, alpha=0.6, label="Normal", color='blue')
plt.hist(y_test_proba[y_test==1], bins=20, alpha=0.6, label="Abnormal", color='red')
plt.axvline(x=0.5, color='black', linestyle='--', linewidth=2, label='Decision Threshold')
plt.xlabel("Predicted Probability of Abnormal")
plt.ylabel("Frequency")
plt.title("Probability Distribution for Test Set")
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig("output/chapter05-probability.png", dpi=150, bbox_inches='tight')
plt.show()

