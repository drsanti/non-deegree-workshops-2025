# Train LSTM Script Documentation

**File**: `train_lstm.py`  
**Purpose**: Train an LSTM neural network on full time-series motor vibration data for multi-class classification

## Overview

This script trains an LSTM (Long Short-Term Memory) neural network model for multi-class classification. It uses full time-series sequences (1000 time steps × 3 features) to capture temporal patterns in motor vibration data.

## Prerequisites

- Training dataset must exist in `train/` directory with condition subdirectories
- Virtual environment with required packages activated
- Sufficient disk space for model files (~97 KB)
- More memory and processing time than feature-based approach

## Usage

```bash
# From csv_tf directory
../venv/Scripts/python.exe train_lstm.py
```

Or if virtual environment is activated:
```bash
python train_lstm.py
```

## What It Does

1. **Loads Training Data**
   - Reads CSV files from `train/` directory
   - Extracts full time-series sequences (ax, ay, az)
   - Organizes data by condition (normal, bearing, misalignment, imbalance)

2. **Preprocesses Data**
   - Reshapes data to (n_samples, 1000, 3) format
   - Normalizes each feature (ax, ay, az) using StandardScaler
   - Shuffles data to avoid class ordering issues
   - Splits into training (80%) and validation (20%) sets with stratification

3. **Builds LSTM Model**
   - LSTM layer: 32 units with tanh activation
   - Dropout layers: 0.3 and 0.2 for regularization
   - Dense layers: 16 → 4 (output)
   - Softmax activation for multi-class classification

4. **Trains Model**
   - Optimizer: Adam (learning_rate=0.001)
   - Loss: sparse_categorical_crossentropy
   - Epochs: 100 (with early stopping, patience=15)
   - Batch size: 16

5. **Evaluates and Saves**
   - Evaluates on training and validation sets
   - Generates confusion matrix
   - Saves model to `models/lstm_model.h5`
   - Saves scaler to `models/lstm_scaler.pkl`

6. **Visualizes Results**
   - Training history plots (loss and accuracy)
   - Confusion matrix heatmap

## Output Files

### 1. Model Files
- **`models/lstm_model.h5`**: Trained LSTM model (~97 KB)
- **`models/lstm_scaler.pkl`**: StandardScaler for time-series normalization (~0.66 KB)

### 2. Visualization Files
- **`output/lstm_training_history.png`**: Training/validation loss and accuracy curves
- **`output/lstm_training_confusion_matrix.png`**: Training set confusion matrix

## Model Architecture

```
Input (1000 time steps × 3 features)
    ↓
LSTM(32, tanh, return_sequences=False)
    ↓
Dropout(0.3)
    ↓
Dense(16, relu)
    ↓
Dropout(0.2)
    ↓
Dense(4, softmax)  # 4 classes: normal, bearing, misalignment, imbalance
```

**Total Parameters**: ~5,204 trainable parameters

## Data Preprocessing

1. **Loading**: Reads CSV files and extracts ax, ay, az columns
2. **Reshaping**: Converts to (n_samples, 1000, 3) format
3. **Normalization**: 
   - Flattens to (n_samples * 1000, 3) for scaling
   - Applies StandardScaler (mean=0, std=1) per feature
   - Reshapes back to (n_samples, 1000, 3)
4. **Shuffling**: Randomizes order to avoid class ordering bias
5. **Splitting**: 80% training, 20% validation (stratified)

## Training Configuration

- **Optimizer**: Adam (learning_rate=0.001)
- **Loss Function**: sparse_categorical_crossentropy
- **Metrics**: Accuracy
- **Epochs**: 100
- **Batch Size**: 16 (smaller for small dataset)
- **Validation Split**: 20% (explicit split, stratified)
- **Early Stopping**: 
  - Monitor: validation loss
  - Patience: 15 epochs
  - Restore best weights: Yes

## Console Output

The script prints:

1. **Data Loading Information**
   - Training data shape: (n_samples, 1000, 3)
   - Number of samples per class
   - Label distribution

2. **Normalization Information**
   - Scaled data shape
   - Feature means and standard deviations
   - Data range verification

3. **Model Architecture**
   - Layer-by-layer summary
   - Total parameters

4. **Training Progress**
   - Loss and accuracy per epoch
   - Validation metrics
   - Early stopping notifications

5. **Evaluation Results**
   - Training and validation loss/accuracy
   - Classification report
   - Confusion matrix

6. **File Saving Confirmation**
   - Model and scaler file paths

## Expected Results

### With Synthetic Data
- **Training Accuracy**: 100% (perfect classification)
- **Validation Accuracy**: 100%
- **Training Time**: ~2-5 minutes (CPU)
- **Confusion Matrix**: Perfect diagonal (all correct)

### With Real-World Data
- **Training Accuracy**: 90-95%
- **Validation Accuracy**: 85-90%
- **Training Time**: Similar (~2-5 minutes)
- **Confusion Matrix**: Mostly diagonal with some errors

## Advantages of LSTM Approach

1. **Temporal Patterns**: Captures long-term dependencies
2. **Sequence Information**: Preserves time-series structure
3. **High Accuracy**: Often achieves better performance
4. **No Feature Engineering**: Learns patterns automatically

## Disadvantages

1. **Slower Training**: ~2-5 minutes vs ~30-60 seconds
2. **Higher Memory**: 3000 values vs 18 features
3. **Less Interpretable**: Black box model
4. **More Data Needed**: Requires larger datasets for generalization

## Comparison with Feature-Based

| Aspect | LSTM | Feature-Based |
|--------|------|---------------|
| **Input Size** | 3000 values (1000×3) | 18 features |
| **Training Time** | ~2-5 min | ~30-60 sec |
| **Memory** | Higher | Lower |
| **Temporal Info** | Preserved | Lost |
| **Accuracy** | Very High (100%) | High (95-100%) |
| **Interpretability** | Lower | Higher |

## Key Implementation Details

### Data Shuffling
- Shuffles data before splitting to avoid class ordering bias
- Ensures random distribution across train/validation sets

### Stratified Splitting
- Maintains class balance in train/validation sets
- Prevents one class from being over/under-represented

### Early Stopping
- Monitors validation loss
- Stops training if no improvement for 15 epochs
- Restores best weights automatically

### Normalization
- Normalizes each feature (ax, ay, az) independently
- Uses StandardScaler (mean=0, std=1)
- Must use same scaler for inference

## Error Handling

The script will raise errors if:
- Training directory doesn't exist: `ValueError`
- No CSV files found: `ValueError`
- Insufficient memory: System error
- Disk full: IOError when saving

## Example Output

```
============================================================
Loading Training Data
============================================================
Loaded 32 samples from bearing condition
Loaded 32 samples from imbalance condition
Loaded 32 samples from misalignment condition
Loaded 32 samples from normal condition

Training data shape: (128, 1000, 3)
Labels shape: (128,)
Number of classes: 4
Classes: ['bearing', 'imbalance', 'misalignment', 'normal']
  bearing: 32 samples
  imbalance: 32 samples
  misalignment: 32 samples
  normal: 32 samples

============================================================
Training LSTM Neural Network
============================================================
Epoch 1/100
7/7 [==============================] - 2s 250ms/step - loss: 1.2345 - accuracy: 0.3750 - val_loss: 1.1234 - val_accuracy: 0.5000
...
Epoch 25/100
7/7 [==============================] - 1s 180ms/step - loss: 0.0123 - accuracy: 1.0000 - val_loss: 0.0099 - val_accuracy: 1.0000
Epoch 00025: early stopping
Restoring model weights from the end of the best epoch.
```

## Related Scripts

- **`test_lstm.py`**: Test the trained LSTM model
- **`train_features.py`**: Train the feature-based model
- **`validate.py`**: Validate dataset structure

## Notes

- Model is saved in HDF5 format (`.h5`)
- Scaler must be saved and used for inference (same normalization)
- Training uses stratified splitting to maintain class balance
- Early stopping prevents overfitting
- Data shuffling ensures random distribution
- Plots are saved and displayed in windows
- LSTM captures temporal patterns that feature-based models miss

