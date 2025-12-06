# ==============================================================================
# LSTM Model Testing
# Load trained LSTM model and evaluate on test dataset
# ==============================================================================

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import tensorflow as tf
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import seaborn as sns
import os
from pathlib import Path
import joblib

# Set seed for reproducibility
np.random.seed(42)
tf.random.set_seed(42)

# Create output directory
# Create output directory
os.makedirs("output", exist_ok=True)

# ==============================================================================
# DATA LOADING FUNCTIONS
# ==============================================================================

def load_csv_data(directory):
    """
    Load all CSV files from directory with condition subdirectories.
    
    Args:
        directory: Base directory (train/ or test/) containing condition subdirectories
    
    Returns:
        X: Array of shape (n_samples, time_steps, n_features) - time-series sequences
        y: Array of shape (n_samples,) - condition labels (0=normal, 1=bearing, 2=misalignment, 3=imbalance)
        condition_names: List of condition names
    """
    dataset = {}
    condition_mapping = {
        'normal': 0,
        'bearing': 1,
        'misalignment': 2,
        'imbalance': 3
    }
    
    if not os.path.exists(directory):
        raise ValueError(f"Directory {directory} does not exist!")
    
    base_path = Path(directory)
    condition_dirs = [d for d in base_path.iterdir() if d.is_dir()]
    
    if not condition_dirs:
        raise ValueError(f"No condition subdirectories found in {directory}")
    
    # Load all CSV files
    for condition_dir in sorted(condition_dirs):
        condition = condition_dir.name
        if condition not in condition_mapping:
            print(f"Warning: Unknown condition '{condition}', skipping...")
            continue
        
        csv_files = sorted(condition_dir.glob("*.csv"))
        sequences = []
        
        for filepath in csv_files:
            df = pd.read_csv(filepath)
            # Extract time-series features: ax, ay, az (exclude time and label)
            sequence = df[['ax', 'ay', 'az']].values  # Shape: (1000, 3)
            sequences.append(sequence)
        
        dataset[condition] = sequences
        print(f"Loaded {len(sequences)} samples from {condition} condition")
    
    # Combine all sequences and labels
    X_list = []
    y_list = []
    
    for condition, sequences in dataset.items():
        label = condition_mapping[condition]
        for seq in sequences:
            X_list.append(seq)
            y_list.append(label)
    
    X = np.array(X_list)  # Shape: (n_samples, 1000, 3)
    y = np.array(y_list)   # Shape: (n_samples,)
    
    condition_names = sorted(condition_mapping.keys())
    
    return X, y, condition_names


# ==============================================================================
# LOAD MODEL AND SCALER
# ==============================================================================

print("="*60)
print("Loading Trained LSTM Model")
print("="*60)

model_path = "models/lstm_model.h5"
scaler_path = "models/lstm_scaler.pkl"

if not os.path.exists(model_path):
    raise FileNotFoundError(f"Model file not found: {model_path}")
if not os.path.exists(scaler_path):
    raise FileNotFoundError(f"Scaler file not found: {scaler_path}")

# Load model
model = tf.keras.models.load_model(model_path)
print(f"Model loaded from: {model_path}")

# Load scaler
scaler = joblib.load(scaler_path)
print(f"Scaler loaded from: {scaler_path}")

# Display model summary
print("\nModel Architecture:")
model.summary()

# ==============================================================================
# LOAD TEST DATA
# ==============================================================================

print("\n" + "="*60)
print("Loading Test Data")
print("="*60)

X_test, y_test, condition_names = load_csv_data("test")

print(f"\nTest data shape: {X_test.shape}")
print(f"Labels shape: {y_test.shape}")

# Count samples per class
for i, name in enumerate(condition_names):
    count = np.sum(y_test == i)
    print(f"  {name}: {count} samples")

# ==============================================================================
# NORMALIZE TEST DATA
# ==============================================================================

print("\n" + "="*60)
print("Normalizing Test Data")
print("="*60)

# Normalize using the same scaler as training
n_samples, time_steps, n_features = X_test.shape
X_test_flat = X_test.reshape(-1, n_features)
X_test_scaled_flat = scaler.transform(X_test_flat)
X_test_scaled = X_test_scaled_flat.reshape(n_samples, time_steps, n_features)

print(f"Scaled test data shape: {X_test_scaled.shape}")

# ==============================================================================
# EVALUATE MODEL
# ==============================================================================

print("\n" + "="*60)
print("Evaluating Model on Test Set")
print("="*60)

# Evaluate on test set
test_loss, test_acc = model.evaluate(X_test_scaled, y_test, verbose=0)
print(f"Test Loss: {test_loss:.4f}")
print(f"Test Accuracy: {test_acc:.4f}")

# Make predictions
print("\nMaking predictions...")
y_test_pred_proba = model.predict(X_test_scaled, verbose=0)
y_test_pred = np.argmax(y_test_pred_proba, axis=1)

# Classification report
print("\n" + "="*60)
print("Classification Report")
print("="*60)
print(classification_report(y_test, y_test_pred, target_names=condition_names))

# Confusion matrix
cm = confusion_matrix(y_test, y_test_pred)
print("\n" + "="*60)
print("Confusion Matrix")
print("="*60)
print(f"\n{'':<15}", end="")
for name in condition_names:
    print(f"{name[:10]:<12}", end="")
print()
for i, name in enumerate(condition_names):
    print(f"{name[:14]:<15}", end="")
    for j in range(len(condition_names)):
        print(f"{cm[i,j]:<12}", end="")
    print()

# Per-class accuracy
print("\nPer-Class Accuracy:")
for i, name in enumerate(condition_names):
    class_mask = y_test == i
    if np.sum(class_mask) > 0:
        class_acc = accuracy_score(y_test[class_mask], y_test_pred[class_mask])
        print(f"  {name}: {class_acc:.4f}")

# ==============================================================================
# VISUALIZE RESULTS
# ==============================================================================

print("\n" + "="*60)
print("Saving Visualization Plots")
print("="*60)

# Confusion matrix heatmap
plt.figure(figsize=(10, 8))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=condition_names, yticklabels=condition_names)
plt.title('LSTM Model - Test Set Confusion Matrix', fontsize=14, fontweight='bold')
plt.ylabel('True Label', fontsize=12)
plt.xlabel('Predicted Label', fontsize=12)
plt.tight_layout()
plt.savefig("output/lstm_test_confusion_matrix.png", dpi=150, bbox_inches='tight')
plt.show()
print("Confusion matrix saved to output/lstm_test_confusion_matrix.png")

# Prediction probabilities distribution
fig, axes = plt.subplots(2, 2, figsize=(14, 10))
axes = axes.flatten()

for i, name in enumerate(condition_names):
    class_mask = y_test == i
    if np.sum(class_mask) > 0:
        class_probs = y_test_pred_proba[class_mask, i]
        axes[i].hist(class_probs, bins=20, alpha=0.7, edgecolor='black')
        axes[i].set_xlabel('Predicted Probability', fontsize=10)
        axes[i].set_ylabel('Frequency', fontsize=10)
        axes[i].set_title(f'{name.capitalize()} - Probability Distribution', fontsize=12, fontweight='bold')
        axes[i].grid(True, alpha=0.3)
        axes[i].axvline(x=0.5, color='r', linestyle='--', linewidth=2, label='Threshold')
        axes[i].legend()

plt.tight_layout()
plt.savefig("output/lstm_test_probability_distribution.png", dpi=150, bbox_inches='tight')
plt.show()
print("Probability distribution saved to output/lstm_test_probability_distribution.png")

print("\n" + "="*60)
print("Testing Complete!")
print("="*60)
print(f"Test accuracy: {test_acc:.4f}")
print(f"Test loss: {test_loss:.4f}")
print("="*60)

