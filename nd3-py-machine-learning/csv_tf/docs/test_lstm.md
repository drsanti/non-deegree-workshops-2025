# Test LSTM Script Documentation

**File**: `test_lstm.py`  
**Purpose**: Load and evaluate the trained LSTM time-series model on the test dataset

## Overview

This script loads a pre-trained LSTM model and evaluates its performance on unseen test data. It uses full time-series sequences (1000 time steps × 3 features) for multi-class classification of motor vibration conditions.

## Prerequisites

- Trained LSTM model must exist: `models/lstm_model.h5`
- Scaler must exist: `models/lstm_scaler.pkl`
- Test dataset must exist in `test/` directory with condition subdirectories
- Virtual environment with required packages activated

## Usage

```bash
# From csv_tf directory
../venv/Scripts/python.exe test_lstm.py
```

Or if virtual environment is activated:
```bash
python test_lstm.py
```

## What It Does

1. **Loads Trained Model and Scaler**
   - Loads `models/lstm_model.h5` (LSTM neural network)
   - Loads `models/lstm_scaler.pkl` (StandardScaler for time-series normalization)

2. **Loads Test Data**
   - Reads CSV files from `test/` directory
   - Extracts full time-series sequences (ax, ay, az)
   - Organizes data by condition (normal, bearing, misalignment, imbalance)

3. **Preprocesses Data**
   - Reshapes data to (n_samples, 1000, 3) format
   - Normalizes each feature (ax, ay, az) using the same scaler from training
   - Maintains temporal structure for LSTM processing

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
**File**: `output/lstm_test_confusion_matrix.png`

- **Type**: 4×4 heatmap
- **Classes**: bearing, imbalance, misalignment, normal
- **Rows**: True labels (actual conditions)
- **Columns**: Predicted labels (model predictions)
- **Purpose**: Shows classification performance on test set

### 2. Probability Distribution
**File**: `output/lstm_test_probability_distribution.png`

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
   - Data shape: (n_samples, 1000, 3)
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
- **Test Accuracy**: Typically 100% (perfect classification)
- **Confusion Matrix**: Perfect diagonal (all correct predictions)
- **Probability Distributions**: Very high confidence (>0.9) for correct class

### With Real-World Data
- **Test Accuracy**: Usually 85-95% (lower than synthetic)
- **Confusion Matrix**: Some off-diagonal values (misclassifications)
- **Probability Distributions**: More variability, lower confidence

## Model Architecture

The LSTM model expects:
- **Input**: Time-series sequences of shape (1000, 3)
  - 1000 time steps
  - 3 features: ax, ay, az
- **Output**: 4 class probabilities (softmax)

**Architecture**:
```
LSTM(32, tanh) → Dropout(0.3) → Dense(16, relu) → 
Dropout(0.2) → Dense(4, softmax)
```

## Data Preprocessing

1. **Loading**: Reads CSV files and extracts ax, ay, az columns
2. **Reshaping**: Converts to (n_samples, 1000, 3) format
3. **Normalization**: 
   - Flattens to (n_samples * 1000, 3) for scaling
   - Applies StandardScaler (mean=0, std=1)
   - Reshapes back to (n_samples, 1000, 3)
4. **Purpose**: Maintains temporal structure while normalizing features

## Error Handling

The script will raise errors if:
- Model file not found: `FileNotFoundError`
- Scaler file not found: `FileNotFoundError`
- Test directory doesn't exist: `ValueError`
- No CSV files found: `ValueError`

## Example Output

```
============================================================
Loading Trained LSTM Model
============================================================
Model loaded from: models/lstm_model.h5
Scaler loaded from: models/lstm_scaler.pkl

Model Architecture:
Model: "sequential"
...

============================================================
Loading Test Data
============================================================
Loaded 8 samples from bearing condition
Loaded 8 samples from imbalance condition
Loaded 8 samples from misalignment condition
Loaded 8 samples from normal condition

Test data shape: (32, 1000, 3)
Labels shape: (32,)
  bearing: 8 samples
  imbalance: 8 samples
  misalignment: 8 samples
  normal: 8 samples

============================================================
Evaluating Model on Test Set
============================================================
Test Loss: 0.0099
Test Accuracy: 1.0000

Classification Report:
              precision    recall  f1-score   support
     bearing       1.00      1.00      1.00         8
   imbalance       1.00      1.00      1.00         8
misalignment       1.00      1.00      1.00         8
      normal       1.00      1.00      1.00         8
```

## Comparison with Feature-Based Model

| Aspect | LSTM | Feature-Based |
|--------|------|---------------|
| **Input** | Full time-series (1000, 3) | Statistical features (18,) |
| **Temporal Info** | Preserved | Lost |
| **Training Time** | ~2-5 minutes | ~30-60 seconds |
| **Memory Usage** | Higher | Lower |
| **Accuracy** | Very High (100%) | High (95-100%) |
| **Best For** | Temporal patterns | Statistical properties |

## Related Scripts

- **`train_lstm.py`**: Train the LSTM model
- **`test_features.py`**: Test the feature-based model
- **`validate.py`**: Validate dataset structure

## Notes

- Uses full time-series sequences (preserves temporal patterns)
- Normalization must match training (uses saved scaler)
- Test set should be separate from training set
- Plots are saved and displayed in windows
- LSTM captures long-term dependencies in vibration patterns

