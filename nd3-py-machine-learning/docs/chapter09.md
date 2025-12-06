# Chapter 9: Multi-class Fault Detection

## Overview

This chapter extends neural network classification to multiple fault types. Instead of just normal vs fault, we'll classify different types of faults: normal operation, bearing failure, misalignment, and imbalance. This requires changes to the network architecture and loss function to handle multiple classes.

## Learning Objectives

By the end of this chapter, you will:
- Understand multi-class classification
- Build neural networks for multiple classes
- Use softmax activation for multi-class output
- Evaluate multi-class models with confusion matrices
- Analyze per-class performance
- Visualize class probabilities

## Multi-class vs Binary Classification

### Binary Classification (Previous Chapter)
- **Classes**: 2 (normal, fault)
- **Output**: 1 neuron with sigmoid
- **Loss**: Binary crossentropy
- **Output**: Probability of one class

### Multi-class Classification (This Chapter)
- **Classes**: 4+ (normal, fault type 1, 2, 3, ...)
- **Output**: N neurons (one per class) with softmax
- **Loss**: Sparse categorical crossentropy
- **Output**: Probabilities for all classes

## Neural Network Architecture

### Output Layer Changes

**Binary**:
```python
tf.keras.layers.Dense(1, activation="sigmoid")
```

**Multi-class**:
```python
tf.keras.layers.Dense(4, activation="softmax")  # 4 classes
```

### Softmax Activation

**What is Softmax?**
- Converts raw scores to probabilities
- Ensures probabilities sum to 1
- Largest score gets highest probability

**Formula**:
```
P(class_i) = e^(score_i) / Σ e^(score_j)
```

**Properties**:
- All probabilities sum to 1
- Largest input gets highest probability
- Smooth, differentiable

## Code Implementation

The `chapter09.py` file demonstrates:

### 1. Multi-class Data Generation

```python
# Normal operation
normal = np.random.rand(200, 4) * 10

# Bearing failure (high vibration, moderate temperature)
bearing = normal.copy()
bearing[:, 0] += 3  # High vibration
bearing[:, 1] += 2  # Moderate temperature

# Misalignment (moderate vibration, high temperature)
misalignment = normal.copy()
misalignment[:, 0] += 2  # Moderate vibration
misalignment[:, 1] += 4  # High temperature

# Imbalance (very high vibration, normal temperature)
imbalance = normal.copy()
imbalance[:, 0] += 5  # Very high vibration
imbalance[:, 1] += 1  # Slight temperature
```

**Key Design**:
- Each fault type has distinct pattern
- Realistic industrial scenarios
- Separable classes

### 2. Model Architecture

```python
model = tf.keras.Sequential([
    tf.keras.layers.Dense(64, activation="relu", input_shape=(4,)),
    tf.keras.layers.Dense(32, activation="relu"),
    tf.keras.layers.Dense(16, activation="relu"),
    tf.keras.layers.Dense(4, activation="softmax")  # 4 classes
])
```

**Differences from Binary**:
- Larger hidden layers (more complexity)
- 4 output neurons (one per class)
- Softmax instead of sigmoid

### 3. Model Compilation

```python
model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)
```

**Loss Function**:
- **Sparse categorical crossentropy**: For integer labels (0, 1, 2, 3)
- Alternative: Categorical crossentropy (for one-hot encoded labels)

### 4. Predictions

```python
y_pred_proba = model.predict(X_test)
y_pred_classes = np.argmax(y_pred_proba, axis=1)
```

**Process**:
- Get probabilities for all classes
- Choose class with highest probability
- `argmax` finds index of maximum value

## Evaluation

### Overall Accuracy

```python
test_acc = model.evaluate(X_test, y_test)
```

- Proportion of correct predictions
- Good overall metric
- May hide per-class issues

### Confusion Matrix

```python
cm = confusion_matrix(y_test, y_pred_classes)
sns.heatmap(cm, annot=True, ...)
```

**Interpretation**:
- Diagonal: Correct predictions
- Off-diagonal: Misclassifications
- Shows which classes are confused

**Example**:
- Normal confused with Bearing: May indicate early fault
- Bearing confused with Imbalance: Similar vibration patterns

### Classification Report

Provides per-class metrics:
- **Precision**: Of predicted class X, how many are actually X?
- **Recall**: Of actual class X, how many were detected?
- **F1-score**: Harmonic mean
- **Support**: Number of samples

### Per-Class Accuracy

```python
for i in range(len(class_names)):
    class_mask = y_test == i
    class_acc = accuracy_score(y_test[class_mask], y_pred_classes[class_mask])
```

**Benefits**:
- Identifies problematic classes
- Shows class-specific performance
- Helps with imbalanced classes

## Visualization

### Training History

- Loss and accuracy plots
- Monitor overfitting
- Track convergence

### Confusion Matrix Heatmap

- Color-coded matrix
- Easy to spot patterns
- Identifies class confusions

### Probability Distributions

- Histogram for each class
- Shows prediction confidence
- Identifies uncertain predictions

### Per-Class Accuracy Bar Chart

- Visual comparison
- Identifies weak classes
- Guides improvement efforts

## Key Concepts

### Class Imbalance

**Problem**: Some classes have fewer samples

**Solutions**:
- Use `class_weight` parameter
- Oversample minority classes
- Use different evaluation metrics
- Focus on per-class metrics

### One-vs-Rest vs Softmax

**One-vs-Rest**:
- Train separate binary classifier per class
- More models, simpler each

**Softmax (This Chapter)**:
- Single model for all classes
- Probabilities sum to 1
- More efficient

### Label Encoding

**Integer Labels** (This Chapter):
```python
y = [0, 1, 2, 3]  # Normal, Bearing, Misalignment, Imbalance
```

**One-Hot Encoding** (Alternative):
```python
y = [[1,0,0,0], [0,1,0,0], [0,0,1,0], [0,0,0,1]]
```

## Best Practices

1. **Balance Classes**: Ensure sufficient samples per class
2. **Use Per-Class Metrics**: Don't rely only on overall accuracy
3. **Visualize Confusion Matrix**: Understand misclassifications
4. **Check Probabilities**: Look at prediction confidence
5. **Tune Architecture**: Adjust for number of classes

## Common Issues

### Class Confusion

**Problem**: Model confuses similar classes

**Solutions**:
- Add more distinguishing features
- Collect more training data
- Adjust class weights

### Low Per-Class Accuracy

**Problem**: One class performs poorly

**Solutions**:
- Oversample that class
- Use class weights
- Check data quality

## Applications

Multi-class fault detection is useful for:
- **Fault Diagnosis**: Identify specific fault types
- **Predictive Maintenance**: Different maintenance actions per fault
- **Quality Control**: Multiple defect types
- **Medical Diagnosis**: Multiple disease types

## Real-World Considerations

### Fault Severity

- Some faults more critical than others
- Weight classes by importance
- Focus on high-priority faults

### Cost of Misclassification

- False negative (missed fault) vs false positive (false alarm)
- Different costs per class
- Optimize for business needs

## Next Steps

In the final chapter, we'll explore time-series fault prediction using LSTM networks, which can learn from sequences of sensor readings to predict faults before they occur.

