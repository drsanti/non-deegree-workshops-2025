# ==============================================================================
# Feature-Based Multi-Class Model Training
# Train dense neural network on extracted statistical features from time-series
# ==============================================================================

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import tensorflow as tf
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import seaborn as sns
import os
from pathlib import Path
import joblib

# Set seed for reproducibility
np.random.seed(42)
tf.random.set_seed(42)

# Create output directories
# Create output directories
os.makedirs("output", exist_ok=True)
os.makedirs("models", exist_ok=True)

# ==============================================================================
# FEATURE EXTRACTION FUNCTIONS
# ==============================================================================

def extract_features_from_sequence(sequence):
    """
    Extract statistical features from a time-series sequence.
    
    Args:
        sequence: Array of shape (time_steps, n_features) - e.g., (1000, 3) for ax, ay, az
    
    Returns:
        features: Array of shape (n_features_extracted,)
    """
    features = []
    
    # For each axis (ax, ay, az)
    for axis_idx in range(sequence.shape[1]):
        axis_data = sequence[:, axis_idx]
        
        # Basic statistics
        features.append(np.mean(axis_data))      # Mean
        features.append(np.std(axis_data))       # Standard deviation
        features.append(np.min(axis_data))       # Minimum
        features.append(np.max(axis_data))       # Maximum
        
        # RMS (Root Mean Square)
        features.append(np.sqrt(np.mean(axis_data**2)))
        
        # Peak-to-peak
        features.append(np.max(axis_data) - np.min(axis_data))
    
    return np.array(features)


def load_csv_data_with_features(directory):
    """
    Load CSV files and extract features from each file.
    
    Args:
        directory: Base directory (train/ or test/) containing condition subdirectories
    
    Returns:
        X: Array of shape (n_samples, n_features) - extracted features
        y: Array of shape (n_samples,) - condition labels (0=normal, 1=bearing, 2=misalignment, 3=imbalance)
        condition_names: List of condition names
    """
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
    
    X_list = []
    y_list = []
    
    # Load all CSV files and extract features
    for condition_dir in sorted(condition_dirs):
        condition = condition_dir.name
        if condition not in condition_mapping:
            print(f"Warning: Unknown condition '{condition}', skipping...")
            continue
        
        csv_files = sorted(condition_dir.glob("*.csv"))
        label = condition_mapping[condition]
        
        for filepath in csv_files:
            df = pd.read_csv(filepath)
            # Extract time-series features: ax, ay, az
            sequence = df[['ax', 'ay', 'az']].values  # Shape: (1000, 3)
            
            # Extract statistical features
            features = extract_features_from_sequence(sequence)
            X_list.append(features)
            y_list.append(label)
        
        print(f"Extracted features from {len(csv_files)} samples in {condition} condition")
    
    X = np.array(X_list)  # Shape: (n_samples, n_features)
    y = np.array(y_list)   # Shape: (n_samples,)
    
    condition_names = sorted(condition_mapping.keys())
    
    return X, y, condition_names


# ==============================================================================
# LOAD TRAINING DATA
# ==============================================================================

print("="*60)
print("Loading Training Data and Extracting Features")
print("="*60)

X_train, y_train, condition_names = load_csv_data_with_features("train")

print(f"\nFeature matrix shape: {X_train.shape}")
print(f"Labels shape: {y_train.shape}")
print(f"Number of features per sample: {X_train.shape[1]}")
print(f"Number of classes: {len(condition_names)}")
print(f"Classes: {condition_names}")

# Count samples per class
for i, name in enumerate(condition_names):
    count = np.sum(y_train == i)
    print(f"  {name}: {count} samples")

# ==============================================================================
# NORMALIZE FEATURES
# ==============================================================================

print("\n" + "="*60)
print("Normalizing Features")
print("="*60)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)

print(f"Scaled data shape: {X_train_scaled.shape}")
print(f"Feature means (after scaling): {X_train_scaled.mean(axis=0)[:6]}")  # First 6 features
print(f"Feature stds (after scaling): {X_train_scaled.std(axis=0)[:6]}")   # First 6 features

# Save scaler for later use
joblib.dump(scaler, "models/features_scaler.pkl")
print("\nScaler saved to models/features_scaler.pkl")

# ==============================================================================
# BUILD NEURAL NETWORK MODEL
# ==============================================================================

print("\n" + "="*60)
print("Neural Network Architecture")
print("="*60)

n_features = X_train_scaled.shape[1]

# Build dense neural network for multi-class classification
model = tf.keras.Sequential([
    tf.keras.layers.Dense(64, activation="relu", input_shape=(n_features,)),
    tf.keras.layers.Dense(32, activation="relu"),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(16, activation="relu"),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(len(condition_names), activation="softmax")  # 4 classes
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
    X_train_scaled, y_train,
    epochs=50,
    batch_size=32,
    validation_split=0.2,
    verbose=1
)

# ==============================================================================
# SAVE MODEL
# ==============================================================================

print("\n" + "="*60)
print("Saving Model")
print("="*60)

model.save("models/features_model.h5")
print("Model saved to models/features_model.h5")

# ==============================================================================
# EVALUATE ON TRAINING SET
# ==============================================================================

print("\n" + "="*60)
print("Training Set Evaluation")
print("="*60)

# Evaluate on training set
train_loss, train_acc = model.evaluate(X_train_scaled, y_train, verbose=0)
print(f"Training Loss: {train_loss:.4f}")
print(f"Training Accuracy: {train_acc:.4f}")

# Make predictions
y_train_pred_proba = model.predict(X_train_scaled, verbose=0)
y_train_pred = np.argmax(y_train_pred_proba, axis=1)

# Classification report
print("\nClassification Report:")
print(classification_report(y_train, y_train_pred, target_names=condition_names))

# Confusion matrix
cm = confusion_matrix(y_train, y_train_pred)
print("\nConfusion Matrix:")
print(f"\n{'':<15}", end="")
for name in condition_names:
    print(f"{name[:10]:<12}", end="")
print()
for i, name in enumerate(condition_names):
    print(f"{name[:14]:<15}", end="")
    for j in range(len(condition_names)):
        print(f"{cm[i,j]:<12}", end="")
    print()

# ==============================================================================
# VISUALIZE TRAINING HISTORY
# ==============================================================================

print("\n" + "="*60)
print("Saving Training History Plots")
print("="*60)

fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Plot loss
axes[0].plot(history.history['loss'], label='Training Loss', linewidth=2)
axes[0].plot(history.history['val_loss'], label='Validation Loss', linewidth=2)
axes[0].set_xlabel('Epoch', fontsize=12)
axes[0].set_ylabel('Loss', fontsize=12)
axes[0].set_title('Model Loss', fontsize=14, fontweight='bold')
axes[0].legend()
axes[0].grid(True, alpha=0.3)

# Plot accuracy
axes[1].plot(history.history['accuracy'], label='Training Accuracy', linewidth=2)
axes[1].plot(history.history['val_accuracy'], label='Validation Accuracy', linewidth=2)
axes[1].set_xlabel('Epoch', fontsize=12)
axes[1].set_ylabel('Accuracy', fontsize=12)
axes[1].set_title('Model Accuracy', fontsize=14, fontweight='bold')
axes[1].legend()
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig("output/features_training_history.png", dpi=150, bbox_inches='tight')
plt.show()
print("Training history saved to output/features_training_history.png")

# Confusion matrix heatmap
plt.figure(figsize=(10, 8))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=condition_names, yticklabels=condition_names)
plt.title('Feature-Based Model - Training Confusion Matrix', fontsize=14, fontweight='bold')
plt.ylabel('True Label', fontsize=12)
plt.xlabel('Predicted Label', fontsize=12)
plt.tight_layout()
plt.savefig("output/features_training_confusion_matrix.png", dpi=150, bbox_inches='tight')
plt.show()
print("Confusion matrix saved to output/features_training_confusion_matrix.png")

print("\n" + "="*60)
print("Training Complete!")
print("="*60)
print(f"Model saved to: models/features_model.h5")
print(f"Scaler saved to: models/features_scaler.pkl")
print(f"Training accuracy: {train_acc:.4f}")
print("="*60)

