# ==============================================================================
# Chapter 6: Decision Trees and Random Forest for Multi-feature Classification
# Python Code for all examples
# ==============================================================================

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
from sklearn.preprocessing import StandardScaler
import os

# Set seed for reproducibility
np.random.seed(42)

# Create output directory if it doesn't exist
os.makedirs("output", exist_ok=True)

# ==============================================================================
# GENERATE MULTI-FEATURE CLASSIFICATION DATA
# ==============================================================================

# Generate synthetic data with multiple fault conditions
n_samples_per_class = 200

# Normal operation
normal = np.random.rand(n_samples_per_class, 4) * 10

# Fault type 1: High vibration, normal temperature
fault1 = np.random.rand(n_samples_per_class, 4) * 10
fault1[:, 0] += 3  # High vibration
fault1[:, 1] += 0  # Normal temperature

# Fault type 2: Normal vibration, high temperature
fault2 = np.random.rand(n_samples_per_class, 4) * 10
fault2[:, 0] += 0  # Normal vibration
fault2[:, 1] += 4  # High temperature

# Fault type 3: High vibration, high temperature
fault3 = np.random.rand(n_samples_per_class, 4) * 10
fault3[:, 0] += 3  # High vibration
fault3[:, 1] += 4  # High temperature

# Combine data
X = np.vstack([normal, fault1, fault2, fault3])
y = np.array([0]*n_samples_per_class + [1]*n_samples_per_class + 
             [2]*n_samples_per_class + [3]*n_samples_per_class)

class_names = ["Normal", "Fault Type 1", "Fault Type 2", "Fault Type 3"]

print(f"Total samples: {len(y)}")
print(f"Classes: {len(class_names)}")
for i, name in enumerate(class_names):
    print(f"  {name}: {np.sum(y == i)} samples")

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

# ==============================================================================
# DECISION TREE CLASSIFIER
# ==============================================================================

print("\n" + "="*60)
print("Decision Tree Classifier")
print("="*60)

# Create and train model
dt = DecisionTreeClassifier(max_depth=5, random_state=42)
dt.fit(X_train, y_train)

# Predictions
dt_train_pred = dt.predict(X_train)
dt_test_pred = dt.predict(X_test)

# Evaluate
dt_train_acc = accuracy_score(y_train, dt_train_pred)
dt_test_acc = accuracy_score(y_test, dt_test_pred)

print(f"\nTraining Accuracy: {dt_train_acc:.4f}")
print(f"Test Accuracy: {dt_test_acc:.4f}")

# ==============================================================================
# RANDOM FOREST CLASSIFIER
# ==============================================================================

print("\n" + "="*60)
print("Random Forest Classifier")
print("="*60)

# Create and train model
rf = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
rf.fit(X_train, y_train)

# Predictions
rf_train_pred = rf.predict(X_train)
rf_test_pred = rf.predict(X_test)

# Evaluate
rf_train_acc = accuracy_score(y_train, rf_train_pred)
rf_test_acc = accuracy_score(y_test, rf_test_pred)

print(f"\nTraining Accuracy: {rf_train_acc:.4f}")
print(f"Test Accuracy: {rf_test_acc:.4f}")

# ==============================================================================
# COMPARISON
# ==============================================================================

print("\n" + "="*60)
print("Model Comparison")
print("="*60)
print(f"\n{'Model':<20} {'Train Acc':<12} {'Test Acc':<12}")
print("-" * 44)
print(f"{'Decision Tree':<20} {dt_train_acc:<12.4f} {dt_test_acc:<12.4f}")
print(f"{'Random Forest':<20} {rf_train_acc:<12.4f} {rf_test_acc:<12.4f}")

# Classification report for Random Forest
print("\n" + "="*60)
print("Random Forest Classification Report")
print("="*60)
print(classification_report(y_test, rf_test_pred, target_names=class_names))

# ==============================================================================
# FEATURE IMPORTANCE
# ==============================================================================

feature_names = ["Vibration", "Temperature", "Pressure", "Current"]

# Decision Tree feature importance
dt_importances = dt.feature_importances_

# Random Forest feature importance
rf_importances = rf.feature_importances_

# Plot feature importance
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# Decision Tree
axes[0].barh(feature_names, dt_importances, color='skyblue', edgecolor='black')
axes[0].set_xlabel("Importance")
axes[0].set_title("Decision Tree Feature Importance")
axes[0].grid(True, alpha=0.3, axis='x')

# Random Forest
axes[1].barh(feature_names, rf_importances, color='lightcoral', edgecolor='black')
axes[1].set_xlabel("Importance")
axes[1].set_title("Random Forest Feature Importance")
axes[1].grid(True, alpha=0.3, axis='x')

plt.tight_layout()
plt.savefig("output/chapter06-feature-importance.png", dpi=150, bbox_inches='tight')
plt.show()

# Print feature importance
print("\n" + "="*60)
print("Feature Importance")
print("="*60)
print(f"\n{'Feature':<15} {'Decision Tree':<15} {'Random Forest':<15}")
print("-" * 45)
for name, dt_imp, rf_imp in zip(feature_names, dt_importances, rf_importances):
    print(f"{name:<15} {dt_imp:<15.4f} {rf_imp:<15.4f}")

# ==============================================================================
# CONFUSION MATRICES
# ==============================================================================

import seaborn as sns

fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# Decision Tree confusion matrix
cm_dt = confusion_matrix(y_test, dt_test_pred)
sns.heatmap(cm_dt, annot=True, fmt='d', cmap='Blues', ax=axes[0],
            xticklabels=class_names, yticklabels=class_names)
axes[0].set_ylabel('Actual')
axes[0].set_xlabel('Predicted')
axes[0].set_title('Decision Tree Confusion Matrix')

# Random Forest confusion matrix
cm_rf = confusion_matrix(y_test, rf_test_pred)
sns.heatmap(cm_rf, annot=True, fmt='d', cmap='Greens', ax=axes[1],
            xticklabels=class_names, yticklabels=class_names)
axes[1].set_ylabel('Actual')
axes[1].set_xlabel('Predicted')
axes[1].set_title('Random Forest Confusion Matrix')

plt.tight_layout()
plt.savefig("output/chapter06-confusion-matrices.png", dpi=150, bbox_inches='tight')
plt.show()

