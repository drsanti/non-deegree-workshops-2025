# Verify Models Script Documentation

**File**: `verify_models.py`  
**Purpose**: Verify that saved models and scalers are valid and can be loaded correctly

## Overview

This script checks the integrity and loadability of saved model and scaler files. It verifies file existence, loads models/scalers, displays architectures, and tests predictions/transforms with dummy data.

## Prerequisites

- Model files should exist (if trained):
  - `models/lstm_model.h5`
  - `models/lstm_scaler.pkl`
  - `models/features_model.h5`
  - `models/features_scaler.pkl`
- Virtual environment with required packages activated

## Usage

```bash
# From csv_tf directory
../venv/Scripts/python.exe verify_models.py
```

Or if virtual environment is activated:
```bash
python verify_models.py
```

## What It Does

1. **Checks LSTM Model**
   - Verifies file existence
   - Checks file size
   - Loads model
   - Displays architecture
   - Tests prediction with dummy data

2. **Checks LSTM Scaler**
   - Verifies file existence
   - Checks file size
   - Loads scaler
   - Tests transform with dummy data
   - Verifies normalization (mean≈0, std≈1)

3. **Checks Feature-Based Model**
   - Verifies file existence
   - Checks file size
   - Loads model
   - Displays architecture
   - Tests prediction with dummy data (18 features)

4. **Checks Feature-Based Scaler**
   - Verifies file existence
   - Checks file size
   - Loads scaler
   - Tests transform with dummy data (18 features)
   - Verifies normalization

5. **Summary**
   - Lists all files in `models/` directory
   - Shows file sizes
   - Provides verification status

## Console Output

The script prints detailed information for each model and scaler:

### For Each Model:
- `[OK]` or `[ERROR]` status
- File path and size
- Model type
- Architecture summary
- Prediction test results:
  - Input shape
  - Output shape
  - Output probabilities
  - Predicted class

### For Each Scaler:
- `[OK]` or `[ERROR]` status
- File path and size
- Scaler type
- Transform test results:
  - Input shape
  - Output shape
  - Mean (should be ~0)
  - Standard deviation (should be ~1)

### Summary:
- List of all files in `models/` directory
- File sizes (MB for .h5, KB for .pkl)

## Expected Output

### Successful Verification

```
============================================================
Model and Scaler Verification
============================================================

============================================================
Checking LSTM Model
============================================================
[OK] Model file exists: models/lstm_model.h5
  File size: 0.09 MB
[OK] Model loaded successfully
  Model type: <class 'tensorflow.python.keras.engine.sequential.Sequential'>

Model Architecture:
Model: "sequential"
...

[OK] Model prediction test successful
  Input shape: (1, 1000, 3)
  Output shape: (1, 4)
  Output (probabilities): [0.25 0.25 0.25 0.25]
  Predicted class: 0

[OK] Scaler file exists: models/lstm_scaler.pkl
  File size: 0.66 KB
[OK] Scaler loaded successfully
  Scaler type: <class 'sklearn.preprocessing._data.StandardScaler'>

[OK] Scaler transform test successful
  Input shape: (10, 3)
  Output shape: (10, 3)
  Mean (should be ~0): [-0.001  0.002 -0.001]
  Std (should be ~1): [1.001 0.999 1.002]

============================================================
Checking Feature-Based Model
============================================================
[OK] Model file exists: models/features_model.h5
  File size: 0.08 MB
...

============================================================
Verification Summary
============================================================

Files in models/ directory:
  features_model.h5                   0.08 MB
  features_scaler.pkl                 1.10 KB
  lstm_model.h5                       0.09 MB
  lstm_scaler.pkl                     0.66 KB
```

### Missing Files

```
[ERROR] Model file not found: models/lstm_model.h5
[ERROR] Scaler file not found: models/lstm_scaler.pkl
```

## Verification Checks

### File Existence
- Checks if model/scaler files exist
- Reports file paths

### File Size
- LSTM model: ~0.09 MB (97 KB)
- Feature-based model: ~0.08 MB (84 KB)
- Scalers: ~0.66-1.10 KB

### Model Loading
- Attempts to load model using TensorFlow
- Verifies model type
- Displays architecture summary

### Prediction Test
- **LSTM**: Tests with dummy input shape (1, 1000, 3)
- **Feature-based**: Tests with dummy input shape (1, 18)
- Verifies output shape and probabilities

### Scaler Loading
- Attempts to load scaler using joblib
- Verifies scaler type (StandardScaler)

### Transform Test
- **LSTM scaler**: Tests with dummy input shape (10, 3)
- **Feature-based scaler**: Tests with dummy input shape (10, 18)
- Verifies normalization:
  - Mean should be approximately 0
  - Standard deviation should be approximately 1

## Use Cases

### 1. After Training
Verify that models were saved correctly:
```bash
../venv/Scripts/python.exe verify_models.py
```

### 2. Before Testing
Ensure models exist before running test scripts:
```bash
../venv/Scripts/python.exe verify_models.py
# Then run test scripts
```

### 3. After Downloading
Verify models from another source are valid:
```bash
../venv/Scripts/python.exe verify_models.py
```

### 4. Troubleshooting
Check if model loading issues are due to corrupted files:
```bash
../venv/Scripts/python.exe verify_models.py
```

## Error Messages

### File Not Found
```
[ERROR] Model file not found: models/lstm_model.h5
```
**Solution**: Train the model first using `train_lstm.py`

### Loading Error
```
[ERROR] Error loading model: ...
```
**Possible Causes**:
- Corrupted file
- Incompatible TensorFlow version
- File format mismatch

**Solution**: Retrain the model

### Transform Error
```
[ERROR] Error loading scaler: ...
```
**Possible Causes**:
- Corrupted file
- Incompatible scikit-learn version
- File format mismatch

**Solution**: Retrain the model (scaler is saved during training)

## File Sizes Reference

| File | Expected Size | Format |
|------|--------------|--------|
| `lstm_model.h5` | ~0.09 MB (97 KB) | HDF5 |
| `lstm_scaler.pkl` | ~0.66 KB | Pickle |
| `features_model.h5` | ~0.08 MB (84 KB) | HDF5 |
| `features_scaler.pkl` | ~1.10 KB | Pickle |

**Total**: ~183 KB for all files

## Related Scripts

- **`train_lstm.py`**: Creates `lstm_model.h5` and `lstm_scaler.pkl`
- **`train_features.py`**: Creates `features_model.h5` and `features_scaler.pkl`
- **`test_lstm.py`**: Uses LSTM model and scaler
- **`test_features.py`**: Uses feature-based model and scaler

## Notes

- Does not require dataset to run (uses dummy data)
- Safe to run multiple times
- Provides comprehensive verification
- Helps identify issues before running test scripts
- Shows file sizes for disk space planning
- Tests both loading and functionality

## Troubleshooting

### Models Not Found
If models don't exist, train them first:
```bash
../venv/Scripts/python.exe train_lstm.py
../venv/Scripts/python.exe train_features.py
```

### Import Errors
Ensure virtual environment is activated and packages are installed:
```bash
../venv/Scripts/python.exe -c "import tensorflow; import joblib; print('OK')"
```

### Permission Errors
Check file permissions:
```bash
ls -la models/
```

### Corrupted Files
If files are corrupted, delete and retrain:
```bash
rm models/*.h5 models/*.pkl
../venv/Scripts/python.exe train_lstm.py
../venv/Scripts/python.exe train_features.py
```

