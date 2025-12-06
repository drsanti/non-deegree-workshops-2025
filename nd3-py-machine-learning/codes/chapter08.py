# ==============================================================================
# Chapter 8: Binary Fault Classification with Neural Networks
# Python Code for all examples
# ==============================================================================

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import os

# Set seed for reproducibility
np.random.seed(42)
tf.random.set_seed(42)

# Create output directory if it doesn't exist
os.makedirs("output", exist_ok=True)

# ==============================================================================
# GENERATE FAULT DATA
# ==============================================================================

# Generate normal operation data
np.random.seed(42)
normal_features = np.random.rand(500, 4) * 10

# Generate fault data (shifted distribution)
fault_features = np.random.rand(200, 4) * 10 + 5  # Shifted to higher values

# Combine data
X = np.vstack([normal_features, fault_features])
y = np.array([0]*500 + [1]*200)  # 0=normal, 1=fault

print(f"Normal samples: {500}")
print(f"Fault samples: {200}")
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
# BUILD NEURAL NETWORK MODEL
# ==============================================================================

print("\n" + "="*60)
print("Neural Network Architecture")
print("="*60)

# Build model
model = tf.keras.Sequential([
    tf.keras.layers.Dense(32, activation="relu", input_shape=(4,)),
    tf.keras.layers.Dense(16, activation="relu"),
    tf.keras.layers.Dense(8, activation="relu"),
    tf.keras.layers.Dense(1, activation="sigmoid")
])

# Compile model
model.compile(
    optimizer="adam",
    loss="binary_crossentropy",
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
y_pred = model.predict(X_test, verbose=0)
y_pred_binary = (y_pred > 0.5).astype(int).flatten()

# Classification metrics
print("\n" + "="*60)
print("Classification Report")
print("="*60)
print(classification_report(y_test, y_pred_binary, 
                            target_names=['Normal', 'Fault']))

# Confusion matrix
cm = confusion_matrix(y_test, y_pred_binary)
print("\n" + "="*60)
print("Confusion Matrix")
print("="*60)
print(f"\n                Predicted")
print(f"              Normal  Fault")
print(f"Actual Normal    {cm[0,0]:4d}     {cm[0,1]:4d}")
print(f"       Fault     {cm[1,0]:4d}     {cm[1,1]:4d}")

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
plt.savefig("output/chapter08-training-history.png", dpi=150, bbox_inches='tight')
plt.show()

# ==============================================================================
# VISUALIZE PREDICTIONS
# ==============================================================================

# Probability distribution
plt.figure(figsize=(10, 6))
plt.hist(y_pred[y_test==0], bins=20, alpha=0.6, label="Normal", color='blue')
plt.hist(y_pred[y_test==1], bins=20, alpha=0.6, label="Fault", color='red')
plt.axvline(x=0.5, color='black', linestyle='--', linewidth=2, label='Decision Threshold')
plt.xlabel("Predicted Probability of Fault")
plt.ylabel("Frequency")
plt.title("Probability Distribution for Test Set")
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig("output/chapter08-probability.png", dpi=150, bbox_inches='tight')
plt.show()

# Confusion matrix heatmap
import seaborn as sns
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=['Normal', 'Fault'],
            yticklabels=['Normal', 'Fault'])
plt.ylabel('Actual')
plt.xlabel('Predicted')
plt.title('Confusion Matrix')
plt.tight_layout()
plt.savefig("output/chapter08-confusion-matrix.png", dpi=150, bbox_inches='tight')
plt.show()

# ==============================================================================
# FEATURE IMPORTANCE (using permutation importance)
# ==============================================================================

from sklearn.inspection import permutation_importance

# Create a wrapper function to convert probabilities to binary predictions
def model_predict_binary(X):
    """Wrapper to convert model probabilities to binary predictions"""
    proba = model.predict(X, verbose=0)
    return (proba > 0.5).astype(int).flatten()

# Create a simple wrapper class for sklearn compatibility
class ModelWrapper:
    def __init__(self, model):
        self.model = model
    
    def fit(self, X, y):
        """Fit method required by sklearn (model is already trained, so just return self)"""
        return self
    
    def predict(self, X):
        """Predict binary classes from probabilities"""
        proba = self.model.predict(X, verbose=0)
        return (proba > 0.5).astype(int).flatten()

# Calculate permutation importance
wrapped_model = ModelWrapper(model)
perm_importance = permutation_importance(
    wrapped_model, X_test, y_test, n_repeats=10, random_state=42, scoring='accuracy'
)

feature_names = ["Feature 1", "Feature 2", "Feature 3", "Feature 4"]

plt.figure(figsize=(10, 6))
plt.barh(feature_names, perm_importance.importances_mean, 
         xerr=perm_importance.importances_std, color='skyblue', edgecolor='black')
plt.xlabel("Importance")
plt.title("Feature Importance (Permutation)")
plt.grid(True, alpha=0.3, axis='x')
plt.tight_layout()
plt.savefig("output/chapter08-feature-importance.png", dpi=150, bbox_inches='tight')
plt.show()

print("\n" + "="*60)
print("Feature Importance")
print("="*60)
for name, imp, std in zip(feature_names, perm_importance.importances_mean, 
                          perm_importance.importances_std):
    print(f"  {name:12s}: {imp:8.4f} (+/- {std:.4f})")

