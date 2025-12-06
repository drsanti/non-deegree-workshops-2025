# Motor Vibration CSV Dataset Generator

Generate synthetic motor vibration datasets with 3-axis accelerometer data for machine learning model training. This tool provides a complete workflow from data generation to model training and evaluation.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Dataset Structure](#dataset-structure)
- [Usage](#usage)
  - [Generate Dataset](#generate-dataset)
  - [Validate Dataset](#validate-dataset)
  - [Train Models](#train-models)
  - [Test Models](#test-models)
- [Configuration](#configuration)
- [Data Characteristics](#data-characteristics)
- [Model Training Approaches](#model-training-approaches)
- [Saved Models](#saved-models)
- [Output Files](#output-files)
- [Complete Workflow](#complete-workflow)
- [Dataset Statistics](#dataset-statistics)
- [Verifying Saved Models](#verifying-saved-models)
- [Troubleshooting](#troubleshooting)
- [File Formats](#file-formats)
- [Advanced Usage](#advanced-usage)

## Overview

This tool generates time-series CSV files containing 3-axis accelerometer data (ax, ay, az) for 4 motor conditions:
- **Normal**: Healthy motor operation
- **Bearing**: Bearing failure
- **Misalignment**: Shaft misalignment
- **Imbalance**: Rotor imbalance

The generated dataset can be used to train and evaluate two types of machine learning models:
1. **LSTM Time-Series Model**: Uses full temporal sequences for classification
2. **Feature-Based Model**: Uses extracted statistical features for classification

## Prerequisites

- **Python 3.11.9** (required for TensorFlow compatibility)
- Virtual environment activated (see main project README for setup)
- All dependencies installed from `requirements.txt`:
  - numpy, pandas, matplotlib, seaborn
  - scikit-learn, joblib
  - tensorflow>=2.8.0
  - scipy

## Quick Start

```bash
# 1. Generate dataset
python generate.py

# 2. Validate dataset
python validate.py validate

# 3. Train LSTM model
python train_lstm.py

# 4. Test LSTM model
python test_lstm.py
```

## Dataset Structure

### CSV File Format

Each CSV file contains time-series data with the following columns:
- `time`: Time in seconds (0.0 to 10.0)
- `ax`: Axial acceleration (along motor shaft)
- `ay`: Radial horizontal acceleration
- `az`: Radial vertical acceleration
- `label`: Condition label (normal, bearing, misalignment, imbalance)

### File Organization

```
csv_tf/
├── train/              # Training dataset (80% of data)
│   ├── normal/
│   │   ├── 001.csv
│   │   ├── 002.csv
│   │   └── ...
│   ├── bearing/
│   │   ├── 001.csv
│   │   ├── 002.csv
│   │   └── ...
│   ├── misalignment/
│   │   ├── 001.csv
│   │   └── ...
│   └── imbalance/
│       ├── 001.csv
│       └── ...
├── test/               # Test dataset (20% of data)
│   ├── normal/
│   │   ├── 001.csv
│   │   └── ...
│   ├── bearing/
│   │   ├── 001.csv
│   │   └── ...
│   ├── misalignment/
│   │   └── ...
│   └── imbalance/
│       └── ...
├── generate.py         # Dataset generation script
├── validate.py         # Validation and testing utilities
├── train_lstm.py       # LSTM time-series model training
├── train_features.py   # Feature-based model training
├── test_lstm.py        # LSTM model testing
├── test_features.py    # Feature-based model testing
├── verify_models.py    # Verify saved models and scalers
├── models/             # Saved trained models and scalers
└── output/             # Training plots and evaluation results
```

## Usage

### Generate Dataset

```bash
# Activate virtual environment first
cd ../../
source venv/Scripts/activate  # Windows Git Bash
# or: venv\Scripts\activate  # Windows CMD

# Generate dataset
cd csv_tf
python generate.py
```

This will create:
- 32 training files per condition (128 total)
- 8 test files per condition (32 total)
- 160 CSV files total

### Validate Dataset

```bash
# Validate both train and test datasets
python validate.py validate

# Visualize a specific condition
python validate.py visualize normal 0

# Compare all conditions
python validate.py compare
```

### Train Models

Two training approaches are available:

#### 1. LSTM Time-Series Model

Trains an LSTM neural network using full time-series sequences:

```bash
python train_lstm.py
```

This will:
- Load all CSV files from `train/` directory
- Use full time-series sequences (1000 time steps × 3 features)
- Normalize data using StandardScaler
- Shuffle and split data (80% train, 20% validation with stratification)
- Train LSTM model for multi-class classification
- Save model to `models/lstm_model.h5`
- Save scaler to `models/lstm_scaler.pkl`
- Generate training history plots in `output/`

**Model Architecture:**
- Input: (1000, 3) - 1000 time steps, 3 features (ax, ay, az)
- LSTM layer: 32 units with tanh activation
- Dropout: 0.3
- Dense layer: 16 units with ReLU activation
- Dropout: 0.2
- Output: 4 units with softmax activation (4 classes)

**Training Parameters:**
- Optimizer: Adam (learning_rate=0.001)
- Loss: sparse_categorical_crossentropy
- Epochs: 100 (with early stopping, patience=15)
- Batch size: 16
- Validation split: 20% (stratified)

**Expected Performance:**
- Training accuracy: ~100% (synthetic data with clear patterns)
- Validation accuracy: ~100%
- Training time: ~2-5 minutes on CPU

#### 2. Feature-Based Model

Trains a dense neural network using extracted statistical features:

```bash
python train_features.py
```

This will:
- Load all CSV files from `train/` directory
- Extract statistical features from each time-series (mean, std, min, max, RMS, peak-to-peak for each axis)
- Normalize features using StandardScaler
- Split data (80% train, 20% validation with stratification)
- Train dense neural network for multi-class classification
- Save model to `models/features_model.h5`
- Save scaler to `models/features_scaler.pkl`
- Generate training history plots in `output/`

**Feature Extraction:**
For each CSV file (1000 time steps), extract 18 features:
- **Per axis (ax, ay, az)**: mean, std, min, max, RMS, peak-to-peak
- Total: 6 features × 3 axes = 18 features per sample

**Model Architecture:**
- Input: (18,) - 18 statistical features
- Dense layer: 64 units with ReLU activation
- Dense layer: 32 units with ReLU activation
- Dropout: 0.3
- Dense layer: 16 units with ReLU activation
- Dropout: 0.2
- Output: 4 units with softmax activation (4 classes)

**Training Parameters:**
- Optimizer: Adam (learning_rate=0.001)
- Loss: sparse_categorical_crossentropy
- Epochs: 50 (with early stopping, patience=10)
- Batch size: 32
- Validation split: 20% (stratified)

**Expected Performance:**
- Training accuracy: ~95-100%
- Validation accuracy: ~95-100%
- Training time: ~30 seconds to 1 minute on CPU

### Test Models

Evaluate trained models on the test dataset:

```bash
# Test LSTM model
python test_lstm.py

# Test feature-based model
python test_features.py
```

Both test scripts will:
- Load the trained model and scaler
- Load test data from `test/` directory
- Evaluate model performance
- Generate confusion matrices and probability distributions
- Save results to `output/`

## Configuration

Edit `generate.py` to customize:

```python
SAMPLES_PER_CONDITION = 40  # Number of CSV files per condition
TRAIN_RATIO = 0.8           # Train/test split (80/20)
DURATION = 10               # Seconds per sample
SAMPLING_RATE = 100         # Hz (samples per second)
MOTOR_RPM = 1500           # Motor speed
```

## Data Characteristics

### Normal Condition
- Balanced vibration across all axes
- Low amplitude oscillations
- Regular patterns

### Bearing Failure
- Increased vibration, especially in radial axes (ay, az)
- Higher noise levels
- Moderate amplitude increase

### Misalignment
- Asymmetric vibration patterns
- Phase differences between axes
- Moderate amplitude increase

### Imbalance
- Very high amplitude in radial directions
- Rotational patterns
- Highest vibration levels

## Example CSV File

```csv
time,ax,ay,az,label
0.0,0.002,0.240,0.327,normal
0.01,0.299,0.125,-0.081,normal
0.02,0.003,-0.120,-0.174,normal
...
```

## Model Training Approaches

### LSTM Time-Series Approach

Uses the full time-series sequences (1000 time steps) from each CSV file:
- **Input shape**: (n_samples, 1000, 3) - samples × time steps × features
- **Model**: LSTM layers followed by dense layers
- **Advantages**: 
  - Captures temporal patterns and sequences
  - Learns long-term dependencies
  - Preserves time-series structure
- **Disadvantages**:
  - Slower training
  - More memory intensive
  - Requires more data for generalization
- **Best for**: When temporal relationships and sequence patterns are important

### Feature-Based Approach

Extracts statistical features from each time-series file:
- **Features per sample**: 18 features (6 per axis: mean, std, min, max, RMS, peak-to-peak)
- **Input shape**: (n_samples, 18)
- **Model**: Dense neural network
- **Advantages**: 
  - Faster training and inference
  - Interpretable features
  - Lower memory requirements
  - Works well with small datasets
- **Disadvantages**:
  - Loses temporal sequence information
  - Requires feature engineering
- **Best for**: When statistical properties are sufficient, or when computational resources are limited

### Comparison

| Aspect | LSTM | Feature-Based |
|--------|------|---------------|
| Training Time | ~2-5 min | ~30-60 sec |
| Model Size | Larger | Smaller |
| Temporal Info | Preserved | Lost |
| Interpretability | Lower | Higher |
| Memory Usage | Higher | Lower |
| Best Accuracy | Very High | High |

## Saved Models

Trained models are saved in the `models/` directory:
- `lstm_model.h5` - LSTM time-series model (~97 KB)
- `lstm_scaler.pkl` - Scaler for LSTM input normalization (~0.66 KB)
- `features_model.h5` - Feature-based model (~84 KB)
- `features_scaler.pkl` - Scaler for feature normalization (~1.1 KB)

**Total models directory size**: ~183 KB

**Note**: Model files are saved in HDF5 format (`.h5`). To load a model:
```python
import tensorflow as tf
model = tf.keras.models.load_model("models/lstm_model.h5")
```

## Output Files

Training and testing generate visualization files in `output/`:

### Training Outputs
- `lstm_training_history.png` - LSTM training/validation loss and accuracy curves
- `lstm_training_confusion_matrix.png` - LSTM training set confusion matrix
- `features_training_history.png` - Feature-based model training/validation curves
- `features_training_confusion_matrix.png` - Feature-based model training confusion matrix

### Testing Outputs
- `lstm_test_confusion_matrix.png` - LSTM test set confusion matrix
- `lstm_test_probability_distribution.png` - LSTM prediction probability distributions
- `features_test_confusion_matrix.png` - Feature-based model test confusion matrix
- `features_test_probability_distribution.png` - Feature-based model probability distributions

**Note**: All visualizations are saved as PNG files with 150 DPI resolution for high quality.

## Complete Workflow

1. **Generate Dataset** (`generate.py`)
   - Creates 160 CSV files (128 train + 32 test)
   - Organizes by condition in subdirectories
   - Each file: 1000 time steps (10 seconds at 100 Hz)

2. **Validate Dataset** (`validate.py`)
   - Check data structure and quality
   - Visualize sample data
   - Compare conditions

3. **Train Model** (`train_lstm.py` or `train_features.py`)
   - Loads training data
   - Preprocesses and normalizes
   - Trains neural network
   - Saves model and scaler

4. **Test Model** (`test_lstm.py` or `test_features.py`)
   - Loads trained model
   - Evaluates on test set
   - Generates performance metrics and visualizations

## Dataset Statistics

- **Total files**: 160 CSV files
- **Training files**: 128 (32 per condition)
- **Test files**: 32 (8 per condition)
- **Samples per file**: 1000 time steps
- **Features per sample**: 3 (ax, ay, az)
- **Time duration**: 10 seconds per file
- **Sampling rate**: 100 Hz
- **File size**: ~50-60 KB per CSV file
- **Total dataset size**: ~8-10 MB

## Troubleshooting

### Model Not Learning (Low Accuracy)

If training accuracy is stuck at ~25% (random guessing):
- **Check data shuffling**: Ensure data is shuffled before training
- **Check class balance**: Verify all classes have similar sample counts
- **Reduce model complexity**: Try simpler architecture
- **Adjust learning rate**: Try lower learning rate (0.0001)
- **Increase epochs**: Allow more training time

### Validation Accuracy is 0

- **Check stratified split**: Ensure validation set has all classes
- **Verify data loading**: Check that all condition directories exist
- **Check normalization**: Ensure scaler is fitted correctly

### Out of Memory Errors

- **Reduce batch size**: Use smaller batch_size (8 or 4)
- **Use feature-based model**: Requires less memory than LSTM
- **Reduce sequence length**: Modify data generation to shorter sequences

### Model File Not Found

- **Train model first**: Run `train_lstm.py` or `train_features.py` before testing
- **Check file paths**: Ensure models are saved in `models/` directory
- **Verify file names**: Check for `lstm_model.h5` or `features_model.h5`

## File Formats

### CSV Files
- **Format**: Standard CSV with headers
- **Encoding**: UTF-8
- **Delimiter**: Comma
- **Headers**: time, ax, ay, az, label

### Model Files
- **Format**: HDF5 (`.h5`) - Keras/TensorFlow format
- **Alternative**: Can be saved as SavedModel format (use `model.save('model')` instead)
- **Size**: 
  - LSTM model: ~97 KB
  - Feature-based model: ~84 KB
- **Loading**: Use `tf.keras.models.load_model('path/to/model.h5')`

### Scaler Files
- **Format**: Pickle (`.pkl`) via joblib
- **Contains**: StandardScaler object with fitted parameters (mean, scale)
- **Size**: 
  - LSTM scaler: ~0.66 KB
  - Feature-based scaler: ~1.1 KB
- **Loading**: Use `joblib.load('path/to/scaler.pkl')`

## Performance Results

Based on training with the default dataset:

### LSTM Model
- **Training Accuracy**: 100%
- **Validation Accuracy**: 100%
- **Test Accuracy**: Typically 100% (on synthetic data)
- **Training Time**: ~2-5 minutes (CPU)
- **Model Parameters**: 5,204 trainable parameters

### Feature-Based Model
- **Training Accuracy**: ~95-100%
- **Validation Accuracy**: ~95-100%
- **Test Accuracy**: Typically 95-100%
- **Training Time**: ~30-60 seconds (CPU)
- **Model Parameters**: 3,892 trainable parameters

**Note**: These high accuracies are expected with synthetic data that has clear, distinct patterns. Real-world data will likely show lower accuracy and require more training data and potentially different architectures.

## Notes

- All data is synthetically generated (no real sensor data required)
- Data includes realistic noise and patterns
- Reproducible with fixed random seed (42)
- Each file contains 1000 time steps (10 seconds at 100 Hz)
- Models achieve high accuracy due to clear patterns in synthetic data
- For real-world data, expect lower accuracy and may need more training data
- All scripts use consistent random seeds for reproducibility

## Verifying Saved Models

To verify that models and scalers are saved correctly:

```bash
python verify_models.py
```

This script will:
- Check if model files (`.h5`) and scaler files (`.pkl`) exist
- Load and test each model
- Display model architecture
- Test predictions with dummy data
- Verify scalers work correctly
- Show file sizes and directory contents

### Manual Verification

You can also manually check files:

```python
import tensorflow as tf
import joblib
import os

# Check file existence
print(os.path.exists("models/lstm_model.h5"))
print(os.path.exists("models/lstm_scaler.pkl"))

# Load and inspect model
model = tf.keras.models.load_model("models/lstm_model.h5")
model.summary()

# Load and inspect scaler
scaler = joblib.load("models/lstm_scaler.pkl")
print(type(scaler))
```

## Advanced Usage

### Custom Model Architecture

Edit the model definition in training scripts:

```python
# In train_lstm.py or train_features.py
model = tf.keras.Sequential([
    # Add your custom layers here
    tf.keras.layers.LSTM(64, ...),
    # ...
])
```

### Custom Features

Modify `extract_features_from_sequence()` in `train_features.py` to add:
- Frequency domain features (FFT)
- Wavelet features
- Domain-specific features

### Hyperparameter Tuning

Adjust in training scripts:
- Learning rate: `learning_rate=0.001`
- Batch size: `batch_size=16`
- Epochs: `epochs=100`
- Dropout rates: `Dropout(0.3)`
- Early stopping patience: `patience=15`

