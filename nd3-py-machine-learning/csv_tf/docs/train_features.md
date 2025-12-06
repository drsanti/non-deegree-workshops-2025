# Train Features Script Documentation

**File**: `train_features.py`  
**Purpose**: Train a dense neural network on extracted statistical features from motor vibration time-series data

## Overview

This script trains a feature-based neural network model for multi-class classification. Instead of using full time-series sequences, it extracts statistical features (mean, std, min, max, RMS, peak-to-peak) from each axis, resulting in 18 features per sample.

## Prerequisites

- Training dataset must exist in `train/` directory with condition subdirectories
- Virtual environment with required packages activated
- Sufficient disk space for model files (~84 KB)

## Usage

```bash
# From csv_tf directory
../venv/Scripts/python.exe train_features.py
```

Or if virtual environment is activated:
```bash
python train_features.py
```

## What It Does

1. **Loads Training Data**
   - Reads CSV files from `train/` directory
   - Extracts statistical features from each time-series file
   - Organizes data by condition (normal, bearing, misalignment, imbalance)

2. **Extracts Features**
   - For each CSV file (1000 time steps), extracts 18 features:
     - Per axis (ax, ay, az): mean, std, min, max, RMS, peak-to-peak
     - Total: 6 features × 3 axes = 18 features per sample

3. **Preprocesses Data**
   - Normalizes features using StandardScaler (mean=0, std=1)
   - Splits data into training (80%) and validation (20%) sets
   - Uses stratified splitting to maintain class balance

4. **Builds Neural Network**
   - Dense layers: 64 → 32 → 16 → 4 (output)
   - Dropout layers: 0.3 and 0.2 for regularization
   - Softmax activation for multi-class classification

5. **Trains Model**
   - Optimizer: Adam (default learning rate)
   - Loss: sparse_categorical_crossentropy
   - Epochs: 50 (with early stopping, patience=10)
   - Batch size: 32

6. **Evaluates and Saves**
   - Evaluates on training set
   - Generates confusion matrix
   - Saves model to `models/features_model.h5`
   - Saves scaler to `models/features_scaler.pkl`

7. **Visualizes Results**
   - Training history plots (loss and accuracy)
   - Confusion matrix heatmap

## Output Files

### 1. Model Files
- **`models/features_model.h5`**: Trained neural network model (~84 KB)
- **`models/features_scaler.pkl`**: StandardScaler for feature normalization (~1.1 KB)

### 2. Visualization Files
- **`output/features_training_history.png`**: Training/validation loss and accuracy curves
- **`output/features_training_confusion_matrix.png`**: Training set confusion matrix

## Model Architecture

```
Input (18 features)
    ↓
Dense(64, relu)
    ↓
Dense(32, relu)
    ↓
Dropout(0.3)
    ↓
Dense(16, relu)
    ↓
Dropout(0.2)
    ↓
Dense(4, softmax)  # 4 classes: normal, bearing, misalignment, imbalance
```

**Total Parameters**: ~3,892 trainable parameters

## Feature Extraction Details

For each CSV file with 1000 time steps:

**Per Axis (ax, ay, az)**:
1. **Mean**: Average value
2. **Standard Deviation**: Variability measure
3. **Minimum**: Lowest value
4. **Maximum**: Highest value
5. **RMS**: Root Mean Square (energy measure)
6. **Peak-to-Peak**: Range (max - min)

**Total**: 6 features × 3 axes = 18 features per sample

## Training Configuration

- **Optimizer**: Adam (adaptive learning rate)
- **Loss Function**: sparse_categorical_crossentropy
- **Metrics**: Accuracy
- **Epochs**: 50
- **Batch Size**: 32
- **Validation Split**: 20% (stratified)
- **Early Stopping**: Patience=10 (monitors validation loss)

## Console Output

The script prints:

1. **Data Loading Information**
   - Feature matrix shape
   - Number of samples per class
   - Number of features per sample

2. **Normalization Information**
   - Scaled data shape
   - Feature means and standard deviations

3. **Model Architecture**
   - Layer-by-layer summary
   - Total parameters

4. **Training Progress**
   - Loss and accuracy per epoch
   - Validation metrics

5. **Evaluation Results**
   - Training loss and accuracy
   - Classification report
   - Confusion matrix

6. **File Saving Confirmation**
   - Model and scaler file paths

## Expected Results

### With Synthetic Data
- **Training Accuracy**: 95-100%
- **Validation Accuracy**: 95-100%
- **Training Time**: ~30-60 seconds (CPU)
- **Confusion Matrix**: Mostly diagonal (correct predictions)

### With Real-World Data
- **Training Accuracy**: 85-95%
- **Validation Accuracy**: 80-90%
- **Training Time**: Similar (~30-60 seconds)
- **Confusion Matrix**: Some off-diagonal values

## Advantages of Feature-Based Approach

1. **Fast Training**: ~30-60 seconds vs ~2-5 minutes for LSTM
2. **Lower Memory**: 18 features vs 3000 time-series values
3. **Interpretable**: Features have physical meaning
4. **Efficient**: Works well with small datasets

## Disadvantages

1. **Lost Temporal Info**: No sequence information
2. **Feature Engineering**: Requires domain knowledge
3. **Limited Patterns**: May miss complex temporal relationships

## Comparison with LSTM

| Aspect | Feature-Based | LSTM |
|--------|--------------|------|
| **Input Size** | 18 features | 3000 values (1000×3) |
| **Training Time** | ~30-60 sec | ~2-5 min |
| **Memory** | Lower | Higher |
| **Temporal Info** | Lost | Preserved |
| **Accuracy** | High (95-100%) | Very High (100%) |
| **Interpretability** | Higher | Lower |

## Error Handling

The script will raise errors if:
- Training directory doesn't exist: `ValueError`
- No CSV files found: `ValueError`
- Insufficient memory: System error
- Disk full: IOError when saving

## Example Output

```
============================================================
Loading Training Data and Extracting Features
============================================================
Extracted features from 32 samples in bearing condition
Extracted features from 32 samples in imbalance condition
Extracted features from 32 samples in misalignment condition
Extracted features from 32 samples in normal condition

Feature matrix shape: (128, 18)
Labels shape: (128,)
Number of features per sample: 18
Number of classes: 4
Classes: ['bearing', 'imbalance', 'misalignment', 'normal']
  bearing: 32 samples
  imbalance: 32 samples
  misalignment: 32 samples
  normal: 32 samples

============================================================
Training Neural Network
============================================================
Epoch 1/50
4/4 [==============================] - 0s 15ms/step - loss: 1.2345 - accuracy: 0.3750 - val_loss: 1.1234 - val_accuracy: 0.5000
...
Epoch 50/50
4/4 [==============================] - 0s 12ms/step - loss: 0.0123 - accuracy: 1.0000 - val_loss: 0.0234 - val_accuracy: 1.0000

============================================================
Training Set Evaluation
============================================================
Training Loss: 0.0123
Training Accuracy: 1.0000
```

## Related Scripts

- **`test_features.py`**: Test the trained feature-based model
- **`train_lstm.py`**: Train the LSTM time-series model
- **`validate.py`**: Validate dataset structure

## Notes

- Model is saved in HDF5 format (`.h5`)
- Scaler must be saved and used for inference (same normalization)
- Training uses stratified splitting to maintain class balance
- Early stopping prevents overfitting
- Plots are saved and displayed in windows

