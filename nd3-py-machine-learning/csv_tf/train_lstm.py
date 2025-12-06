# ==============================================================================
# LSTM Time-Series Model Training
# Train LSTM neural network on motor vibration time-series data
# ==============================================================================

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import tensorflow as tf
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
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
# LOAD TRAINING DATA
# ==============================================================================

print("="*60)
print("Loading Training Data")
print("="*60)

X_train, y_train, condition_names = load_csv_data("train")

print(f"\nTraining data shape: {X_train.shape}")
print(f"Labels shape: {y_train.shape}")
print(f"Number of classes: {len(condition_names)}")
print(f"Classes: {condition_names}")

# Count samples per class
for i, name in enumerate(condition_names):
    count = np.sum(y_train == i)
    print(f"  {name}: {count} samples")

# ==============================================================================
# NORMALIZE DATA
# ==============================================================================

print("\n" + "="*60)
print("Normalizing Time-Series Data")
print("="*60)

# Normalize each feature (ax, ay, az) independently
# Reshape to (n_samples * time_steps, n_features) for scaling
n_samples, time_steps, n_features = X_train.shape
X_train_flat = X_train.reshape(-1, n_features)

scaler = StandardScaler()
X_train_scaled_flat = scaler.fit_transform(X_train_flat)
X_train_scaled = X_train_scaled_flat.reshape(n_samples, time_steps, n_features)

print(f"Scaled data shape: {X_train_scaled.shape}")
print(f"Feature means (after scaling): {X_train_scaled.mean(axis=(0,1))}")
print(f"Feature stds (after scaling): {X_train_scaled.std(axis=(0,1))}")

# Verify data ranges
print(f"\nData range check:")
print(f"  Min values: {X_train_scaled.min(axis=(0,1))}")
print(f"  Max values: {X_train_scaled.max(axis=(0,1))}")
print(f"  Label distribution: {np.bincount(y_train)}")

# Shuffle data before splitting
print("\nShuffling data...")
indices = np.arange(len(y_train))
np.random.shuffle(indices)
X_train_scaled = X_train_scaled[indices]
y_train = y_train[indices]

# Split into train and validation sets with stratification
X_train_final, X_val, y_train_final, y_val = train_test_split(
    X_train_scaled, y_train,
    test_size=0.2,
    random_state=42,
    stratify=y_train
)

print(f"\nFinal training samples: {len(X_train_final)}")
print(f"Validation samples: {len(X_val)}")
print(f"Training label distribution: {np.bincount(y_train_final)}")
print(f"Validation label distribution: {np.bincount(y_val)}")

# Save scaler for later use
joblib.dump(scaler, "models/lstm_scaler.pkl")
print("\nScaler saved to models/lstm_scaler.pkl")

# ==============================================================================
# BUILD LSTM MODEL
# ==============================================================================

print("\n" + "="*60)
print("LSTM Neural Network Architecture")
print("="*60)

# Build LSTM model for multi-class classification (simplified)
model = tf.keras.Sequential([
    tf.keras.layers.LSTM(32, activation="tanh", return_sequences=False, input_shape=(time_steps, n_features)),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(16, activation="relu"),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(len(condition_names), activation="softmax")  # 4 classes
])

# Compile model
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),  # Explicit learning rate
    loss="sparse_categorical_crossentropy",  # For integer labels
    metrics=["accuracy"]
)

# Display model summary
model.summary()

# ==============================================================================
# TRAIN MODEL
# ==============================================================================

print("\n" + "="*60)
print("Training LSTM Neural Network")
print("="*60)

# Train model
history = model.fit(
    X_train_final, y_train_final,
    epochs=100,  # More epochs for better convergence
    batch_size=16,  # Smaller batch size for small dataset
    validation_data=(X_val, y_val),  # Use explicit validation set
    verbose=1,
    callbacks=[
        tf.keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=15,
            restore_best_weights=True,
            verbose=1
        )
    ]
)

# ==============================================================================
# SAVE MODEL
# ==============================================================================

print("\n" + "="*60)
print("Saving Model")
print("="*60)

model.save("models/lstm_model.h5")
print("Model saved to models/lstm_model.h5")

# ==============================================================================
# EVALUATE ON TRAINING SET
# ==============================================================================

print("\n" + "="*60)
print("Training Set Evaluation")
print("="*60)

# Evaluate on training set
train_loss, train_acc = model.evaluate(X_train_final, y_train_final, verbose=0)
val_loss, val_acc = model.evaluate(X_val, y_val, verbose=0)
print(f"Training Loss: {train_loss:.4f}")
print(f"Training Accuracy: {train_acc:.4f}")
print(f"Validation Loss: {val_loss:.4f}")
print(f"Validation Accuracy: {val_acc:.4f}")

# Make predictions on training set
y_train_pred_proba = model.predict(X_train_final, verbose=0)
y_train_pred = np.argmax(y_train_pred_proba, axis=1)

# Classification report
print("\nTraining Set Classification Report:")
print(classification_report(y_train_final, y_train_pred, target_names=condition_names))

# Confusion matrix
cm = confusion_matrix(y_train_final, y_train_pred)
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
plt.savefig("output/lstm_training_history.png", dpi=150, bbox_inches='tight')
plt.show()
print("Training history saved to output/lstm_training_history.png")

# Confusion matrix heatmap
plt.figure(figsize=(10, 8))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=condition_names, yticklabels=condition_names)
plt.title('LSTM Model - Training Confusion Matrix', fontsize=14, fontweight='bold')
plt.ylabel('True Label', fontsize=12)
plt.xlabel('Predicted Label', fontsize=12)
plt.tight_layout()
plt.savefig("output/lstm_training_confusion_matrix.png", dpi=150, bbox_inches='tight')
plt.show()
print("Confusion matrix saved to output/lstm_training_confusion_matrix.png")

print("\n" + "="*60)
print("Training Complete!")
print("="*60)
print(f"Model saved to: models/lstm_model.h5")
print(f"Scaler saved to: models/lstm_scaler.pkl")
print(f"Training accuracy: {train_acc:.4f}")
print("="*60)

