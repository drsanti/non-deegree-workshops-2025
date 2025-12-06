# ==============================================================================
# Model Verification Script
# Check if saved models and scalers are valid and can be loaded
# ==============================================================================

import os
import tensorflow as tf
import joblib
import numpy as np
from pathlib import Path

print("="*60)
print("Model and Scaler Verification")
print("="*60)

# ==============================================================================
# Check LSTM Model
# ==============================================================================

print("\n" + "="*60)
print("Checking LSTM Model")
print("="*60)

lstm_model_path = "models/lstm_model.h5"
lstm_scaler_path = "models/lstm_scaler.pkl"

# Check if files exist
if os.path.exists(lstm_model_path):
    file_size = os.path.getsize(lstm_model_path) / (1024 * 1024)  # Size in MB
    print(f"[OK] Model file exists: {lstm_model_path}")
    print(f"  File size: {file_size:.2f} MB")
    
    try:
        # Try to load the model
        model = tf.keras.models.load_model(lstm_model_path)
        print(f"[OK] Model loaded successfully")
        print(f"  Model type: {type(model)}")
        
        # Display model summary
        print("\nModel Architecture:")
        model.summary()
        
        # Test with dummy data
        dummy_input = np.random.randn(1, 1000, 3)
        prediction = model.predict(dummy_input, verbose=0)
        print(f"\n[OK] Model prediction test successful")
        print(f"  Input shape: {dummy_input.shape}")
        print(f"  Output shape: {prediction.shape}")
        print(f"  Output (probabilities): {prediction[0]}")
        print(f"  Predicted class: {np.argmax(prediction[0])}")
        
    except Exception as e:
        print(f"[ERROR] Error loading model: {e}")
else:
    print(f"[ERROR] Model file not found: {lstm_model_path}")

# Check scaler
if os.path.exists(lstm_scaler_path):
    file_size = os.path.getsize(lstm_scaler_path) / 1024  # Size in KB
    print(f"\n[OK] Scaler file exists: {lstm_scaler_path}")
    print(f"  File size: {file_size:.2f} KB")
    
    try:
        # Try to load the scaler
        scaler = joblib.load(lstm_scaler_path)
        print(f"[OK] Scaler loaded successfully")
        print(f"  Scaler type: {type(scaler)}")
        
        # Test with dummy data
        dummy_data = np.random.randn(10, 3)
        scaled_data = scaler.transform(dummy_data)
        print(f"\n[OK] Scaler transform test successful")
        print(f"  Input shape: {dummy_data.shape}")
        print(f"  Output shape: {scaled_data.shape}")
        print(f"  Mean (should be ~0): {scaled_data.mean(axis=0)}")
        print(f"  Std (should be ~1): {scaled_data.std(axis=0)}")
        
    except Exception as e:
        print(f"[ERROR] Error loading scaler: {e}")
else:
    print(f"[ERROR] Scaler file not found: {lstm_scaler_path}")

# ==============================================================================
# Check Feature-Based Model
# ==============================================================================

print("\n" + "="*60)
print("Checking Feature-Based Model")
print("="*60)

features_model_path = "models/features_model.h5"
features_scaler_path = "models/features_scaler.pkl"

# Check if files exist
if os.path.exists(features_model_path):
    file_size = os.path.getsize(features_model_path) / (1024 * 1024)  # Size in MB
    print(f"[OK] Model file exists: {features_model_path}")
    print(f"  File size: {file_size:.2f} MB")
    
    try:
        # Try to load the model
        model = tf.keras.models.load_model(features_model_path)
        print(f"[OK] Model loaded successfully")
        print(f"  Model type: {type(model)}")
        
        # Display model summary
        print("\nModel Architecture:")
        model.summary()
        
        # Test with dummy data (18 features)
        dummy_input = np.random.randn(1, 18)
        prediction = model.predict(dummy_input, verbose=0)
        print(f"\n[OK] Model prediction test successful")
        print(f"  Input shape: {dummy_input.shape}")
        print(f"  Output shape: {prediction.shape}")
        print(f"  Output (probabilities): {prediction[0]}")
        print(f"  Predicted class: {np.argmax(prediction[0])}")
        
    except Exception as e:
        print(f"[ERROR] Error loading model: {e}")
else:
    print(f"[ERROR] Model file not found: {features_model_path}")

# Check scaler
if os.path.exists(features_scaler_path):
    file_size = os.path.getsize(features_scaler_path) / 1024  # Size in KB
    print(f"\n[OK] Scaler file exists: {features_scaler_path}")
    print(f"  File size: {file_size:.2f} KB")
    
    try:
        # Try to load the scaler
        scaler = joblib.load(features_scaler_path)
        print(f"[OK] Scaler loaded successfully")
        print(f"  Scaler type: {type(scaler)}")
        
        # Test with dummy data (18 features)
        dummy_data = np.random.randn(10, 18)
        scaled_data = scaler.transform(dummy_data)
        print(f"\n[OK] Scaler transform test successful")
        print(f"  Input shape: {dummy_data.shape}")
        print(f"  Output shape: {scaled_data.shape}")
        print(f"  Mean (should be ~0): {scaled_data.mean(axis=0)[:5]}")  # First 5 features
        print(f"  Std (should be ~1): {scaled_data.std(axis=0)[:5]}")   # First 5 features
        
    except Exception as e:
        print(f"[ERROR] Error loading scaler: {e}")
else:
    print(f"[ERROR] Scaler file not found: {features_scaler_path}")

# ==============================================================================
# Summary
# ==============================================================================

print("\n" + "="*60)
print("Verification Summary")
print("="*60)

models_dir = Path("models")
if models_dir.exists():
    files = list(models_dir.glob("*"))
    print(f"\nFiles in models/ directory:")
    for file in sorted(files):
        if file.is_file():
            size = file.stat().st_size
            if file.suffix == '.h5':
                size_str = f"{size / (1024*1024):.2f} MB"
            else:
                size_str = f"{size / 1024:.2f} KB"
            print(f"  {file.name:30s} {size_str:>10s}")
else:
    print("[ERROR] models/ directory does not exist")

print("\n" + "="*60)
print("Verification Complete!")
print("="*60)

