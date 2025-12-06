# ==============================================================================
# Chapter 9: Multi-class Fault Detection
# Python Code for all examples
# ==============================================================================

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import seaborn as sns
import os

# Set seed for reproducibility
np.random.seed(42)
tf.random.set_seed(42)

# Create output directory if it doesn't exist
os.makedirs("output", exist_ok=True)

# ==============================================================================
# GENERATE MULTI-CLASS FAULT DATA
# ==============================================================================

# Generate data for different fault types
n_samples_per_class = 200

# Normal operation
normal = np.random.rand(n_samples_per_class, 4) * 10

# Bearing failure (high vibration, moderate temperature)
bearing = np.random.rand(n_samples_per_class, 4) * 10
bearing[:, 0] += 3  # High vibration
bearing[:, 1] += 2  # Moderate temperature increase

# Misalignment (moderate vibration, high temperature)
misalignment = np.random.rand(n_samples_per_class, 4) * 10
misalignment[:, 0] += 2  # Moderate vibration
misalignment[:, 1] += 4  # High temperature

# Imbalance (very high vibration, normal temperature)
imbalance = np.random.rand(n_samples_per_class, 4) * 10
imbalance[:, 0] += 5  # Very high vibration
imbalance[:, 1] += 1  # Slight temperature increase

# Combine data
X = np.vstack([normal, bearing, misalignment, imbalance])
y = np.array([0]*n_samples_per_class + [1]*n_samples_per_class + 
             [2]*n_samples_per_class + [3]*n_samples_per_class)

class_names = ["Normal", "Bearing Failure", "Misalignment", "Imbalance"]

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

print(f"\nTraining samples: {len(X_train)}")
print(f"Test samples: {len(X_test)}")

# ==============================================================================
# BUILD MULTI-CLASS NEURAL NETWORK MODEL
# ==============================================================================

print("\n" + "="*60)
print("Neural Network Architecture")
print("="*60)

# Build model with softmax output for multi-class classification
model = tf.keras.Sequential([
    tf.keras.layers.Dense(64, activation="relu", input_shape=(4,)),
    tf.keras.layers.Dense(32, activation="relu"),
    tf.keras.layers.Dense(16, activation="relu"),
    tf.keras.layers.Dense(4, activation="softmax")  # 4 classes
])

# Compile model
model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",  # For integer labels
    metrics=["accuracy"]
)

# Display model summary
model.summary()

# ==============================================================================
# TRAIN MODEL
# ==============================================================================

print("\n" + "="*60)
print("Training Neural Network")
print("="*60)

# Train model
history = model.fit(
    X_train, y_train,
    epochs=50,
    batch_size=32,
    validation_split=0.2,
    verbose=1
)

# ==============================================================================
# EVALUATE MODEL
# ==============================================================================

# Evaluate on test set
test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)
print("\n" + "="*60)
print("Model Performance")
print("="*60)
print(f"Test Loss: {test_loss:.4f}")
print(f"Test Accuracy: {test_acc:.4f}")

# Make predictions
y_pred_proba = model.predict(X_test, verbose=0)
y_pred_classes = np.argmax(y_pred_proba, axis=1)

# Classification metrics
print("\n" + "="*60)
print("Classification Report")
print("="*60)
print(classification_report(y_test, y_pred_classes, target_names=class_names))

# ==============================================================================
# VISUALIZE TRAINING HISTORY
# ==============================================================================

fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Loss
axes[0].plot(history.history['loss'], label='Training Loss', linewidth=2)
axes[0].plot(history.history['val_loss'], label='Validation Loss', linewidth=2)
axes[0].set_xlabel('Epoch')
axes[0].set_ylabel('Loss')
axes[0].set_title('Model Loss')
axes[0].legend()
axes[0].grid(True, alpha=0.3)

# Accuracy
axes[1].plot(history.history['accuracy'], label='Training Accuracy', linewidth=2)
axes[1].plot(history.history['val_accuracy'], label='Validation Accuracy', linewidth=2)
axes[1].set_xlabel('Epoch')
axes[1].set_ylabel('Accuracy')
axes[1].set_title('Model Accuracy')
axes[1].legend()
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig("output/chapter09-training-history.png", dpi=150, bbox_inches='tight')
plt.show()

# ==============================================================================
# CONFUSION MATRIX
# ==============================================================================

cm = confusion_matrix(y_test, y_pred_classes)

plt.figure(figsize=(10, 8))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=class_names,
            yticklabels=class_names)
plt.ylabel('Actual')
plt.xlabel('Predicted')
plt.title('Multi-class Fault Detection Confusion Matrix')
plt.tight_layout()
plt.savefig("output/chapter09-confusion-matrix.png", dpi=150, bbox_inches='tight')
plt.show()

# ==============================================================================
# CLASS PROBABILITIES
# ==============================================================================

# Plot probability distributions for each class
fig, axes = plt.subplots(2, 2, figsize=(14, 10))
axes = axes.flatten()

for i, class_name in enumerate(class_names):
    class_mask = y_test == i
    if np.any(class_mask):
        probs = y_pred_proba[class_mask, i]
        axes[i].hist(probs, bins=20, alpha=0.7, color=plt.cm.tab10(i), edgecolor='black')
        axes[i].axvline(x=0.5, color='red', linestyle='--', linewidth=2)
        axes[i].set_xlabel('Predicted Probability')
        axes[i].set_ylabel('Frequency')
        axes[i].set_title(f'{class_name} - Probability Distribution')
        axes[i].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig("output/chapter09-probabilities.png", dpi=150, bbox_inches='tight')
plt.show()

# ==============================================================================
# PER-CLASS ACCURACY
# ==============================================================================

# Calculate per-class accuracy
per_class_acc = []
for i in range(len(class_names)):
    class_mask = y_test == i
    if np.any(class_mask):
        class_acc = accuracy_score(y_test[class_mask], y_pred_classes[class_mask])
        per_class_acc.append(class_acc)
    else:
        per_class_acc.append(0)

plt.figure(figsize=(10, 6))
bars = plt.bar(class_names, per_class_acc, color=plt.cm.tab10(range(len(class_names))), 
               edgecolor='black', alpha=0.7)
plt.ylabel('Accuracy')
plt.title('Per-Class Accuracy')
plt.ylim([0, 1])
plt.grid(True, alpha=0.3, axis='y')

# Add value labels on bars
for bar, acc in zip(bars, per_class_acc):
    plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
             f'{acc:.3f}', ha='center', va='bottom', fontweight='bold')

plt.tight_layout()
plt.savefig("output/chapter09-per-class-accuracy.png", dpi=150, bbox_inches='tight')
plt.show()

print("\n" + "="*60)
print("Per-Class Accuracy")
print("="*60)
for name, acc in zip(class_names, per_class_acc):
    print(f"  {name:20s}: {acc:.4f}")

