# Script Execution Workflow

Complete step-by-step guide for running all CSV_TF scripts in the correct order.

## 📋 Overview

This guide shows the proper sequence for executing all scripts in the CSV_TF module. Follow these steps in order for a complete workflow from data generation to model evaluation.

## 🔄 Complete Workflow

```
┌─────────────────┐
│ 1. Generate     │  generate.py (not in list, but required first)
│    Dataset      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. Validate     │  validate.py
│    Dataset      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. Train        │  train_lstm.py OR train_features.py
│    Models       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. Verify       │  verify_models.py (optional but recommended)
│    Models       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5. Test         │  test_lstm.py OR test_features.py
│    Models       │
└─────────────────┘
```

## 📝 Step-by-Step Instructions

### Prerequisites

Before starting, ensure:
- Virtual environment is set up (see main project README)
- You're in the `csv_tf/` directory
- All dependencies are installed

### Step 1: Generate Dataset

**Script**: `generate.py` (not in your list, but required first)

```bash
# From csv_tf directory
../venv/Scripts/python.exe generate.py
```

**What it does**:
- Creates 160 CSV files (128 train + 32 test)
- Organizes by condition in subdirectories
- Each file contains 1000 time steps of 3-axis accelerometer data

**Output**:
- `train/normal/`, `train/bearing/`, `train/misalignment/`, `train/imbalance/`
- `test/normal/`, `test/bearing/`, `test/misalignment/`, `test/imbalance/`

**Time**: ~10-30 seconds

---

### Step 2: Validate Dataset

**Script**: `validate.py`

```bash
# Validate both train and test datasets
../venv/Scripts/python.exe validate.py validate
```

**What it does**:
- Checks dataset structure
- Verifies file counts per condition
- Validates data ranges
- Reports statistics

**Optional Commands**:
```bash
# Visualize a specific sample
../venv/Scripts/python.exe validate.py visualize normal 0

# Compare all conditions
../venv/Scripts/python.exe validate.py compare
```

**Output**:
- Console output with validation results
- Optional: `output/{condition}_sample_visualization.png`
- Optional: `output/condition_comparison.png`

**Time**: ~5-10 seconds

**📖 Documentation**: See [`validate.md`](validate.md)

---

### Step 3: Train Models

Choose one or both approaches:

#### Option A: Train LSTM Model

**Script**: `train_lstm.py`

```bash
../venv/Scripts/python.exe train_lstm.py
```

**What it does**:
- Loads training data from `train/` directory
- Uses full time-series sequences (1000 time steps × 3 features)
- Normalizes data
- Trains LSTM neural network
- Saves model and scaler

**Output**:
- `models/lstm_model.h5` (~97 KB)
- `models/lstm_scaler.pkl` (~0.66 KB)
- `output/lstm_training_history.png`
- `output/lstm_training_confusion_matrix.png`

**Time**: ~2-5 minutes

**📖 Documentation**: See [`train_lstm.md`](train_lstm.md)

#### Option B: Train Feature-Based Model

**Script**: `train_features.py`

```bash
../venv/Scripts/python.exe train_features.py
```

**What it does**:
- Loads training data from `train/` directory
- Extracts 18 statistical features per sample
- Normalizes features
- Trains dense neural network
- Saves model and scaler

**Output**:
- `models/features_model.h5` (~84 KB)
- `models/features_scaler.pkl` (~1.1 KB)
- `output/features_training_history.png`
- `output/features_training_confusion_matrix.png`

**Time**: ~30-60 seconds

**📖 Documentation**: See [`train_features.md`](train_features.md)

#### Option C: Train Both Models

```bash
# Train LSTM first
../venv/Scripts/python.exe train_lstm.py

# Then train feature-based
../venv/Scripts/python.exe train_features.py
```

**Total Time**: ~3-6 minutes

---

### Step 4: Verify Models (Optional but Recommended)

**Script**: `verify_models.py`

```bash
../venv/Scripts/python.exe verify_models.py
```

**What it does**:
- Checks if model files exist
- Verifies file sizes
- Loads and tests each model
- Tests scalers with dummy data
- Displays model architectures
- Shows directory contents

**Output**:
- Console output with verification status
- `[OK]` or `[ERROR]` for each file
- Model architecture summaries
- Test results

**Time**: ~5-10 seconds

**When to run**:
- After training to verify models were saved correctly
- Before testing to ensure models are valid
- After downloading models from another source

**📖 Documentation**: See [`verify_models.md`](verify_models.md)

---

### Step 5: Test Models

Test the models you trained in Step 3:

#### Option A: Test LSTM Model

**Script**: `test_lstm.py`

```bash
../venv/Scripts/python.exe test_lstm.py
```

**Prerequisites**:
- Must have trained LSTM model (Step 3, Option A)
- `models/lstm_model.h5` must exist
- `models/lstm_scaler.pkl` must exist

**What it does**:
- Loads trained LSTM model and scaler
- Loads test data from `test/` directory
- Evaluates model performance
- Generates confusion matrix
- Creates probability distributions

**Output**:
- Console output with test metrics
- `output/lstm_test_confusion_matrix.png`
- `output/lstm_test_probability_distribution.png`

**Time**: ~10-20 seconds

**📖 Documentation**: See [`test_lstm.md`](test_lstm.md)

#### Option B: Test Feature-Based Model

**Script**: `test_features.py`

```bash
../venv/Scripts/python.exe test_features.py
```

**Prerequisites**:
- Must have trained feature-based model (Step 3, Option B)
- `models/features_model.h5` must exist
- `models/features_scaler.pkl` must exist

**What it does**:
- Loads trained feature-based model and scaler
- Loads test data and extracts features
- Evaluates model performance
- Generates confusion matrix
- Creates probability distributions

**Output**:
- Console output with test metrics
- `output/features_test_confusion_matrix.png`
- `output/features_test_probability_distribution.png`

**Time**: ~10-20 seconds

**📖 Documentation**: See [`test_features.md`](test_features.md)

#### Option C: Test Both Models

```bash
# Test LSTM
../venv/Scripts/python.exe test_lstm.py

# Test feature-based
../venv/Scripts/python.exe test_features.py
```

**Total Time**: ~20-40 seconds

---

## 🎯 Quick Reference: Complete Workflow

### Minimal Workflow (One Model)

```bash
# 1. Generate dataset
../venv/Scripts/python.exe generate.py

# 2. Validate dataset
../venv/Scripts/python.exe validate.py validate

# 3. Train model (choose one)
../venv/Scripts/python.exe train_lstm.py
# OR
../venv/Scripts/python.exe train_features.py

# 4. Verify model (optional)
../venv/Scripts/python.exe verify_models.py

# 5. Test model (match with training)
../venv/Scripts/python.exe test_lstm.py
# OR
../venv/Scripts/python.exe test_features.py
```

### Complete Workflow (Both Models)

```bash
# 1. Generate dataset
../venv/Scripts/python.exe generate.py

# 2. Validate dataset
../venv/Scripts/python.exe validate.py validate

# 3. Train both models
../venv/Scripts/python.exe train_lstm.py
../venv/Scripts/python.exe train_features.py

# 4. Verify models
../venv/Scripts/python.exe verify_models.py

# 5. Test both models
../venv/Scripts/python.exe test_lstm.py
../venv/Scripts/python.exe test_features.py
```

## ⏱️ Time Estimates

| Step | Script | Time |
|------|--------|------|
| 1. Generate | `generate.py` | ~10-30 sec |
| 2. Validate | `validate.py` | ~5-10 sec |
| 3. Train LSTM | `train_lstm.py` | ~2-5 min |
| 3. Train Features | `train_features.py` | ~30-60 sec |
| 4. Verify | `verify_models.py` | ~5-10 sec |
| 5. Test LSTM | `test_lstm.py` | ~10-20 sec |
| 5. Test Features | `test_features.py` | ~10-20 sec |

**Total Time**:
- **One Model**: ~3-6 minutes
- **Both Models**: ~4-7 minutes

## 🔍 Script Dependencies

### Dependency Graph

```
generate.py
    │
    ▼
validate.py (optional, but recommended)
    │
    ▼
train_lstm.py ──┐
                ├──► verify_models.py (optional)
train_features.py ─┘
    │
    ▼
test_lstm.py (requires train_lstm.py)
test_features.py (requires train_features.py)
```

### Prerequisites Table

| Script | Requires | Creates |
|--------|----------|---------|
| `generate.py` | None | Dataset files |
| `validate.py` | Dataset files | Validation reports, plots |
| `train_lstm.py` | Dataset files | `lstm_model.h5`, `lstm_scaler.pkl` |
| `train_features.py` | Dataset files | `features_model.h5`, `features_scaler.pkl` |
| `verify_models.py` | Model files | Verification report |
| `test_lstm.py` | `lstm_model.h5`, `lstm_scaler.pkl` | Test results, plots |
| `test_features.py` | `features_model.h5`, `features_scaler.pkl` | Test results, plots |

## ⚠️ Common Mistakes

### ❌ Wrong Order

```bash
# DON'T: Test before training
../venv/Scripts/python.exe test_lstm.py  # Will fail - no model exists
```

### ✅ Correct Order

```bash
# DO: Train first, then test
../venv/Scripts/python.exe train_lstm.py
../venv/Scripts/python.exe test_lstm.py
```

### ❌ Missing Prerequisites

```bash
# DON'T: Train without dataset
../venv/Scripts/python.exe train_lstm.py  # Will fail - no data
```

### ✅ Correct Order

```bash
# DO: Generate dataset first
../venv/Scripts/python.exe generate.py
../venv/Scripts/python.exe train_lstm.py
```

## 🔄 Iterative Workflow

### Re-training Models

If you want to retrain with different parameters:

```bash
# 1. Models already exist, so skip generation
# 2. Optionally validate again
../venv/Scripts/python.exe validate.py validate

# 3. Retrain (overwrites existing models)
../venv/Scripts/python.exe train_lstm.py

# 4. Verify new models
../venv/Scripts/python.exe verify_models.py

# 5. Test new models
../venv/Scripts/python.exe test_lstm.py
```

### Testing Different Models

```bash
# After training both models, test them separately
../venv/Scripts/python.exe test_lstm.py
../venv/Scripts/python.exe test_features.py

# Compare results in output/ directory
```

## 📊 Output Summary

After completing all steps, you'll have:

### Models Directory
```
models/
├── lstm_model.h5 (~97 KB)
├── lstm_scaler.pkl (~0.66 KB)
├── features_model.h5 (~84 KB)
└── features_scaler.pkl (~1.1 KB)
```

### Output Directory
```
output/
├── lstm_training_history.png
├── lstm_training_confusion_matrix.png
├── lstm_test_confusion_matrix.png
├── lstm_test_probability_distribution.png
├── features_training_history.png
├── features_training_confusion_matrix.png
├── features_test_confusion_matrix.png
├── features_test_probability_distribution.png
├── {condition}_sample_visualization.png (if validated)
└── condition_comparison.png (if validated)
```

## 🎓 Learning Path

### Beginner
1. Generate dataset
2. Validate dataset
3. Train feature-based model (easier, faster)
4. Test feature-based model
5. Review results

### Intermediate
1. Complete beginner workflow
2. Train LSTM model
3. Test LSTM model
4. Compare both approaches

### Advanced
1. Complete intermediate workflow
2. Verify models
3. Analyze visualizations
4. Experiment with hyperparameters
5. Customize features/architecture

## 📚 Related Documentation

- **Individual Script Guides**: See [`docs/`](README.md) for detailed documentation
- **Visualizations**: See [`visualizations.md`](visualizations.md) for plot interpretation
- **Main README**: See [`../README.md`](../README.md) for overview

## 💡 Tips

1. **Always validate first**: Catch data issues before training
2. **Verify after training**: Ensure models saved correctly
3. **Test immediately**: Don't wait - test while training is fresh
4. **Save outputs**: Keep plots for comparison
5. **Document parameters**: Note any changes you make

---

**Last Updated**: Reflects current script versions and workflow

