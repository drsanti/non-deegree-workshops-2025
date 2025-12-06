# CSV_TF Module Documentation

Welcome to the comprehensive documentation for the CSV_TF motor vibration dataset generator and machine learning training module.

## 📚 Documentation Overview

This directory contains detailed documentation for all scripts, visualizations, and workflows in the CSV_TF module. Use this guide to navigate to the information you need.

## 🚀 Getting Started

**New to CSV_TF?** Start here:
1. **[Workflow Guide](workflow.md)** - Step-by-step execution order for all scripts
2. **[Main README](../README.md)** - Overview and quick start
3. **[Visualizations Guide](visualizations.md)** - Understand the plots

## 📖 Available Documentation

### Workflow Documentation

- **[`workflow.md`](workflow.md)** - Complete step-by-step execution guide
  - Script execution order
  - Prerequisites and dependencies
  - Time estimates
  - Common mistakes to avoid
  - Quick reference commands

### Script Documentation

Detailed guides for each Python script:

#### Training Scripts
- **[`train_lstm.md`](train_lstm.md)** - Train LSTM time-series model
  - Full time-series sequence processing
  - Temporal pattern recognition
  - Model architecture and configuration
  - Training parameters and optimization

- **[`train_features.md`](train_features.md)** - Train feature-based model
  - Statistical feature extraction
  - Dense neural network architecture
  - Fast training approach
  - Feature engineering details

#### Testing Scripts
- **[`test_lstm.md`](test_lstm.md)** - Test LSTM model
  - Model evaluation on test set
  - Performance metrics
  - Confusion matrix generation
  - Probability distribution analysis

- **[`test_features.md`](test_features.md)** - Test feature-based model
  - Feature-based model evaluation
  - Classification performance
  - Comparison with LSTM approach

#### Utility Scripts
- **[`validate.md`](validate.md)** - Dataset validation and visualization
  - Dataset structure validation
  - Sample visualization
  - Condition comparison
  - Data quality checks

- **[`verify_models.md`](verify_models.md)** - Model and scaler verification
  - File integrity checks
  - Model loading verification
  - Scaler functionality tests
  - Troubleshooting guide

### Visualization Documentation

- **[`visualizations.md`](visualizations.md)** - Complete visualization guide
  - All plot types and their meanings
  - Training history plots
  - Confusion matrices
  - Probability distributions
  - Sample visualizations
  - Plot interpretation guidelines

## 🚀 Quick Start Guide

### 1. Generate Dataset
```bash
../venv/Scripts/python.exe generate.py
```

### 2. Validate Dataset
```bash
../venv/Scripts/python.exe validate.py validate
```

### 3. Train Models
```bash
# Train LSTM model
../venv/Scripts/python.exe train_lstm.py

# Train feature-based model
../venv/Scripts/python.exe train_features.py
```

### 4. Test Models
```bash
# Test LSTM model
../venv/Scripts/python.exe test_lstm.py

# Test feature-based model
../venv/Scripts/python.exe test_features.py
```

### 5. Verify Models
```bash
../venv/Scripts/python.exe verify_models.py
```

## 📋 Documentation by Task

### I Want To...

#### Generate and Validate Data
- **Generate dataset**: See main [`README.md`](../README.md)
- **Validate dataset structure**: See [`validate.md`](validate.md)
- **Visualize samples**: See [`validate.md`](validate.md) - Visualize Command
- **Compare conditions**: See [`validate.md`](validate.md) - Compare Command

#### Train Models
- **Train LSTM model**: See [`train_lstm.md`](train_lstm.md)
- **Train feature-based model**: See [`train_features.md`](train_features.md)
- **Understand model architectures**: See training documentation
- **Configure training parameters**: See training documentation

#### Evaluate Models
- **Test LSTM model**: See [`test_lstm.md`](test_lstm.md)
- **Test feature-based model**: See [`test_features.md`](test_features.md)
- **Understand evaluation metrics**: See testing documentation
- **Interpret results**: See [`visualizations.md`](visualizations.md)

#### Understand Visualizations
- **Training plots**: See [`visualizations.md`](visualizations.md) - Training Visualizations
- **Confusion matrices**: See [`visualizations.md`](visualizations.md) - Testing Visualizations
- **Probability distributions**: See [`visualizations.md`](visualizations.md) - Testing Visualizations
- **Sample visualizations**: See [`visualizations.md`](visualizations.md) - Validation Visualizations

#### Troubleshoot Issues
- **Verify model files**: See [`verify_models.md`](verify_models.md)
- **Check dataset structure**: See [`validate.md`](validate.md)
- **Common errors**: See individual script documentation
- **Performance issues**: See training documentation

## 🎯 Workflow Documentation

### Complete Workflow

1. **Data Generation** → See main [`README.md`](../README.md)
2. **Data Validation** → See [`validate.md`](validate.md)
3. **Model Training** → See [`train_lstm.md`](train_lstm.md) or [`train_features.md`](train_features.md)
4. **Model Verification** → See [`verify_models.md`](verify_models.md)
5. **Model Testing** → See [`test_lstm.md`](test_lstm.md) or [`test_features.md`](test_features.md)
6. **Result Analysis** → See [`visualizations.md`](visualizations.md)

## 📊 Model Comparison

### LSTM vs Feature-Based

| Aspect | LSTM | Feature-Based |
|--------|------|---------------|
| **Documentation** | [`train_lstm.md`](train_lstm.md) | [`train_features.md`](train_features.md) |
| **Input** | Full time-series (1000, 3) | Statistical features (18,) |
| **Training Time** | ~2-5 minutes | ~30-60 seconds |
| **Memory Usage** | Higher | Lower |
| **Temporal Info** | Preserved | Lost |
| **Accuracy** | Very High (100%) | High (95-100%) |
| **Best For** | Temporal patterns | Statistical properties |

## 🔍 Understanding Outputs

### Model Files
- **Location**: `models/` directory
- **Formats**: `.h5` (models), `.pkl` (scalers)
- **Verification**: See [`verify_models.md`](verify_models.md)

### Visualization Files
- **Location**: `output/` directory
- **Types**: Training history, confusion matrices, probability distributions
- **Guide**: See [`visualizations.md`](visualizations.md)

### Dataset Files
- **Location**: `train/` and `test/` directories
- **Structure**: Condition subdirectories (normal, bearing, misalignment, imbalance)
- **Validation**: See [`validate.md`](validate.md)

## 📝 Documentation Structure

```
docs/
├── README.md                 # This file - main documentation index
├── train_lstm.md            # LSTM training guide
├── train_features.md        # Feature-based training guide
├── test_lstm.md             # LSTM testing guide
├── test_features.md         # Feature-based testing guide
├── validate.md              # Dataset validation guide
├── verify_models.md         # Model verification guide
└── visualizations.md        # Complete visualization guide
```

## 🎓 Learning Path

### Beginner
1. Start with main [`README.md`](../README.md) for overview
2. Read [`validate.md`](validate.md) to understand data structure
3. Follow [`train_features.md`](train_features.md) for first model (easier)
4. Review [`visualizations.md`](visualizations.md) to understand plots

### Intermediate
1. Compare approaches: [`train_lstm.md`](train_lstm.md) vs [`train_features.md`](train_features.md)
2. Understand evaluation: [`test_lstm.md`](test_lstm.md) and [`test_features.md`](test_features.md)
3. Deep dive into visualizations: [`visualizations.md`](visualizations.md)

### Advanced
1. Model verification: [`verify_models.md`](verify_models.md)
2. Customization: See individual script documentation
3. Troubleshooting: See error handling sections

## 🔗 Related Documentation

- **Main Module README**: [`../README.md`](../README.md)
- **Main Project Documentation**: [`../../docs/`](../../docs/)
- **Visualization Guide (Main Project)**: [`../../docs/visualizations.md`](../../docs/visualizations.md)

## 💡 Tips for Using This Documentation

1. **Start with the main README**: [`../README.md`](../README.md) provides the big picture
2. **Use task-based navigation**: Find what you want to do in the "I Want To..." section above
3. **Follow the workflow**: Use the Complete Workflow section for step-by-step guidance
4. **Reference visualizations**: Check [`visualizations.md`](visualizations.md) when interpreting plots
5. **Troubleshoot systematically**: Use [`verify_models.md`](verify_models.md) and [`validate.md`](validate.md)

## 📞 Getting Help

### Documentation Issues
- Check the relevant script documentation
- Review the troubleshooting sections
- Consult the visualization guide for plot interpretation

### Technical Issues
- Verify models: [`verify_models.md`](verify_models.md)
- Validate dataset: [`validate.md`](validate.md)
- Check error messages in script documentation

### Understanding Results
- Visualization guide: [`visualizations.md`](visualizations.md)
- Testing documentation: [`test_lstm.md`](test_lstm.md), [`test_features.md`](test_features.md)

## 🎯 Key Concepts

### Data Structure
- **Time-series**: 1000 time steps × 3 features (ax, ay, az)
- **Conditions**: normal, bearing, misalignment, imbalance
- **Features**: Statistical measures (mean, std, min, max, RMS, peak-to-peak)

### Model Types
- **LSTM**: Preserves temporal patterns, slower training
- **Feature-based**: Uses statistics, faster training

### Evaluation Metrics
- **Accuracy**: Overall classification performance
- **Confusion Matrix**: Per-class performance
- **Probability Distribution**: Model confidence

## 📚 Additional Resources

- **Code Examples**: See individual script files in `../`
- **Output Examples**: See `../output/` directory
- **Model Files**: See `../models/` directory
- **Dataset**: See `../train/` and `../test/` directories

## 🔄 Documentation Updates

This documentation is maintained alongside the code. If you find:
- Missing information
- Unclear explanations
- Outdated content
- Errors or typos

Please update the relevant documentation file or report the issue.

---

**Last Updated**: Documentation reflects the current state of the CSV_TF module as of the latest commit.

**Quick Links**:
- [Main Module README](../README.md) | [Visualizations Guide](visualizations.md) | [Training Guide](train_lstm.md) | [Testing Guide](test_lstm.md)

