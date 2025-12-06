# Test Features Script Documentation

**File**: `test_features.py`  
**Purpose**: Load and evaluate the trained feature-based neural network model on the test dataset

## Overview

This script loads a pre-trained feature-based model (dense neural network) and evaluates its performance on unseen test data. It extracts statistical features from time-series data and uses them for multi-class classification of motor vibration conditions.

## Prerequisites

- Trained feature-based model must exist: `models/features_model.h5`
- Scaler must exist: `models/features_scaler.pkl`
- Test dataset must exist in `test/` directory with condition subdirectories
- Virtual environment with required packages activated

## Usage

```bash
# From csv_tf directory
../venv/Scripts/python.exe test_features.py
```

Or if virtual environment is activated:
```bash
python test_features.py
```

## What It Does

1. **Loads Trained Model and Scaler**
   - Loads `models/features_model.h5` (feature-based neural network)
   - Loads `models/features_scaler.pkl` (StandardScaler for feature normalization)

2. **Loads Test Data**
   - Reads CSV files from `test/` directory
   - Extracts statistical features from each time-series file
   - Organizes data by condition (normal, bearing, misalignment, imbalance)

3. **Preprocesses Data**
   - Extracts 18 statistical features per sample:
     - Per axis (ax, ay, az): mean, std, min, max, RMS, peak-to-peak
     - Total: 6 features × 3 axes = 18 features
   - Normalizes features using the same scaler from training

4. **Evaluates Model**
   - Computes test loss and accuracy
   - Generates predictions for all test samples
   - Creates classification report with precision, recall, F1-score
   - Generates confusion matrix

5. **Visualizes Results**
   - Confusion matrix heatmap
   - Probability distribution plots for each class

## Output Files

### 1. Confusion Matrix
**File**: `output/features_test_confusion_matrix.png`

- **Type**: 4×4 heatmap
- **Classes**: bearing, imbalance, misalignment, normal
- **Rows**: True labels (actual conditions)
- **Columns**: Predicted labels (model predictions)
- **Purpose**: Shows classification performance on test set

### 2. Probability Distribution
**File**: `output/features_test_probability_distribution.png`

- **Type**: 2×2 subplot grid
- **Content**: Histogram of predicted probabilities for each class
- **Purpose**: Shows model confidence for each condition

## Console Output

The script prints:

1. **Model Loading Information**
   - Model file path
   - Scaler file path
   - Model architecture summary

2. **Test Data Information**
   - Feature matrix shape
   - Number of samples per class
   - Label distribution

3. **Evaluation Metrics**
   - Test loss
   - Test accuracy
   - Classification report (precision, recall, F1-score per class)
   - Confusion matrix (text format)
   - Per-class accuracy

4. **Visualization Status**
   - Confirmation of saved plots

## Expected Results

### With Synthetic Data
- **Test Accuracy**: Typically 95-100%
- **Confusion Matrix**: Mostly diagonal (correct predictions)
- **Probability Distributions**: High confidence (>0.8) for correct class

### With Real-World Data
- **Test Accuracy**: Usually 85-95% (lower than synthetic)
- **Confusion Matrix**: Some off-diagonal values (misclassifications)
- **Probability Distributions**: More variability, lower confidence

## Model Architecture

The feature-based model expects:
- **Input**: 18 statistical features (1D array)
- **Output**: 4 class probabilities (softmax)

**Architecture**:
```
Dense(64, relu) → Dense(32, relu) → Dropout(0.3) → 
Dense(16, relu) → Dropout(0.2) → Dense(4, softmax)
```

## Feature Extraction

For each CSV file (1000 time steps), extracts:

**Per Axis (ax, ay, az)**:
1. Mean
2. Standard deviation
3. Minimum
4. Maximum
5. RMS (Root Mean Square)
6. Peak-to-peak

**Total**: 6 features × 3 axes = 18 features per sample

## Error Handling

The script will raise errors if:
- Model file not found: `FileNotFoundError`
- Scaler file not found: `FileNotFoundError`
- Test directory doesn't exist: `ValueError`
- No CSV files found: `ValueError`

## Example Output

```
============================================================
Loading Trained Feature-Based Model
============================================================
Model loaded from: models/features_model.h5
Scaler loaded from: models/features_scaler.pkl

Model Architecture:
Model: "sequential"
...

============================================================
Loading Test Data and Extracting Features
============================================================
Extracted features from 8 samples in bearing condition
Extracted features from 8 samples in imbalance condition
Extracted features from 8 samples in misalignment condition
Extracted features from 8 samples in normal condition

Test feature matrix shape: (32, 18)
Labels shape: (32,)
  bearing: 8 samples
  imbalance: 8 samples
  misalignment: 8 samples
  normal: 8 samples

============================================================
Evaluating Model on Test Set
============================================================
Test Loss: 0.0123
Test Accuracy: 1.0000

Classification Report:
              precision    recall  f1-score   support
     bearing       1.00      1.00      1.00         8
   imbalance       1.00      1.00      1.00         8
misalignment       1.00      1.00      1.00         8
      normal       1.00      1.00      1.00         8
```

## Related Scripts

- **`train_features.py`**: Train the feature-based model
- **`test_lstm.py`**: Test the LSTM time-series model
- **`validate.py`**: Validate dataset structure

## Notes

- Uses the same feature extraction function as `train_features.py`
- Normalization must match training (uses saved scaler)
- Test set should be separate from training set
- Plots are saved and displayed in windows

