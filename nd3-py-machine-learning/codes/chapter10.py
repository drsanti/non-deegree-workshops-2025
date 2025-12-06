# ==============================================================================
# Chapter 10: Time-series Fault Prediction with LSTM
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
# GENERATE TIME-SERIES DATA WITH FAULT PROGRESSION
# ==============================================================================

time_steps = 1000
sequence_length = 20  # Use 20 time steps to predict next

print(f"Generating time-series data...")
print(f"Sequence length: {sequence_length} time steps")
print(f"Total samples: {time_steps}")

# Normal operation sequences
normal_seq = []
for i in range(500):
    # Normal: stable with small variations
    seq = 50 + 2 * np.sin(np.arange(i, i+sequence_length) * 0.1) + \
          np.random.normal(0, 0.5, sequence_length)
    normal_seq.append(seq)

# Fault progression sequences (gradual increase)
fault_seq = []
for i in range(500):
    # Fault: gradual trend + oscillation + noise
    trend = np.linspace(0, 5, sequence_length)  # Gradual fault development
    seq = 50 + 2 * np.sin(np.arange(i, i+sequence_length) * 0.1) + trend + \
          np.random.normal(0, 0.5, sequence_length)
    fault_seq.append(seq)

# Combine sequences
X = np.array(normal_seq + fault_seq)
y = np.array([0]*500 + [1]*500)  # 0=normal, 1=fault

print(f"Normal sequences: {500}")
print(f"Fault sequences: {500}")

# Reshape for LSTM: (samples, time_steps, features)
X = X.reshape((X.shape[0], X.shape[1], 1))

print(f"\nInput shape: {X.shape}")

# ==============================================================================
# PREPARE DATA
# ==============================================================================

# Normalize sequences (fit on flattened data, then reshape)
scaler = StandardScaler()
X_flat = X.reshape(-1, 1)
X_scaled_flat = scaler.fit_transform(X_flat)
X_scaled = X_scaled_flat.reshape(X.shape)

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\nTraining samples: {len(X_train)}")
print(f"Test samples: {len(X_test)}")

# ==============================================================================
# BUILD LSTM MODEL
# ==============================================================================

print("\n" + "="*60)
print("LSTM Neural Network Architecture")
print("="*60)

# Build LSTM model
model = tf.keras.Sequential([
    tf.keras.layers.LSTM(50, activation="relu", input_shape=(sequence_length, 1)),
    tf.keras.layers.Dense(25, activation="relu"),
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
print("Training LSTM Neural Network")
print("="*60)

# Train model
history = model.fit(
    X_train, y_train,
    epochs=30,
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
y_pred_binary = (y_pred_proba > 0.5).astype(int).flatten()

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
axes[0].set_title('LSTM Model Loss')
axes[0].legend()
axes[0].grid(True, alpha=0.3)

# Accuracy
axes[1].plot(history.history['accuracy'], label='Training Accuracy', linewidth=2)
axes[1].plot(history.history['val_accuracy'], label='Validation Accuracy', linewidth=2)
axes[1].set_xlabel('Epoch')
axes[1].set_ylabel('Accuracy')
axes[1].set_title('LSTM Model Accuracy')
axes[1].legend()
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig("output/chapter10-training-history.png", dpi=150, bbox_inches='tight')
plt.show()

# ==============================================================================
# VISUALIZE SEQUENCES AND PREDICTIONS
# ==============================================================================

# Plot sample sequences with predictions
fig, axes = plt.subplots(2, 2, figsize=(14, 10))
axes = axes.flatten()

# Select random samples from test set
sample_indices = np.random.choice(len(X_test), 4, replace=False)

for idx, ax in zip(sample_indices, axes):
    # Get sequence (denormalize for visualization)
    seq = X_test[idx].flatten()
    seq_denorm = scaler.inverse_transform(seq.reshape(-1, 1)).flatten()
    
    # Plot sequence
    ax.plot(seq_denorm, linewidth=2, alpha=0.7, label='Sequence')
    ax.axhline(y=scaler.inverse_transform([[0.5]])[0, 0], 
               color='r', linestyle='--', linewidth=2, label='Threshold')
    
    # Get prediction
    actual = y_test[idx]
    predicted = y_pred_binary[idx]
    proba = y_pred_proba[idx][0]
    
    ax.set_title(f'Actual: {"Fault" if actual else "Normal"}, '
                f'Predicted: {"Fault" if predicted else "Normal"}\n'
                f'Probability: {proba:.3f}')
    ax.set_xlabel('Time Step')
    ax.set_ylabel('Sensor Value')
    ax.legend()
    ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig("output/chapter10-sequences.png", dpi=150, bbox_inches='tight')
plt.show()

# ==============================================================================
# PROBABILITY DISTRIBUTION
# ==============================================================================

plt.figure(figsize=(10, 6))
plt.hist(y_pred_proba[y_test==0], bins=20, alpha=0.6, label="Normal", color='blue')
plt.hist(y_pred_proba[y_test==1], bins=20, alpha=0.6, label="Fault", color='red')
plt.axvline(x=0.5, color='black', linestyle='--', linewidth=2, label='Decision Threshold')
plt.xlabel("Predicted Probability of Fault")
plt.ylabel("Frequency")
plt.title("LSTM Probability Distribution for Test Set")
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig("output/chapter10-probability.png", dpi=150, bbox_inches='tight')
plt.show()

# ==============================================================================
# CONFUSION MATRIX
# ==============================================================================

plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=['Normal', 'Fault'],
            yticklabels=['Normal', 'Fault'])
plt.ylabel('Actual')
plt.xlabel('Predicted')
plt.title('LSTM Confusion Matrix')
plt.tight_layout()
plt.savefig("output/chapter10-confusion-matrix.png", dpi=150, bbox_inches='tight')
plt.show()

# ==============================================================================
# TIME-SERIES PREDICTION VISUALIZATION
# ==============================================================================

# Create a longer sequence to show fault progression
long_sequence = []
for i in range(100):
    if i < 50:
        # Normal
        seq = 50 + 2 * np.sin(np.arange(i, i+sequence_length) * 0.1) + \
              np.random.normal(0, 0.5, sequence_length)
    else:
        # Fault progression
        trend = np.linspace(0, 5, sequence_length)
        seq = 50 + 2 * np.sin(np.arange(i, i+sequence_length) * 0.1) + trend + \
              np.random.normal(0, 0.5, sequence_length)
    long_sequence.append(seq)

X_long = np.array(long_sequence).reshape(-1, sequence_length, 1)
X_long_scaled_flat = scaler.transform(X_long.reshape(-1, 1))
X_long_scaled = X_long_scaled_flat.reshape(X_long.shape)

# Predict on long sequence
y_long_pred = model.predict(X_long_scaled, verbose=0)

# Plot
plt.figure(figsize=(14, 6))
time_axis = np.arange(len(y_long_pred))
plt.plot(time_axis, y_long_pred, linewidth=2, label='Fault Probability', color='red')
plt.axhline(y=0.5, color='black', linestyle='--', linewidth=2, label='Threshold')
plt.axvline(x=50, color='green', linestyle='--', linewidth=2, label='Fault Start')
plt.xlabel('Sequence Index')
plt.ylabel('Fault Probability')
plt.title('LSTM Fault Prediction Over Time')
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig("output/chapter10-fault-progression.png", dpi=150, bbox_inches='tight')
plt.show()

print("\n" + "="*60)
print("Time-series Fault Prediction Complete")
print("="*60)

