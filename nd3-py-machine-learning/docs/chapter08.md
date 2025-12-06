# Chapter 8: Binary Fault Classification with Neural Networks

## Overview

This chapter introduces deep learning using TensorFlow/Keras for binary fault classification. Neural networks can learn complex non-linear patterns and interactions between features, making them powerful tools for fault detection. We'll build a multi-layer neural network to classify sensor readings as normal or faulty.

## Learning Objectives

By the end of this chapter, you will:
- Understand neural network architecture
- Build multi-layer neural networks with TensorFlow/Keras
- Train neural networks for binary classification
- Evaluate model performance and interpret results
- Visualize training history and predictions
- Understand hyperparameters and their effects

## Neural Networks Fundamentals

### What is a Neural Network?

A neural network is composed of:
- **Input Layer**: Receives features
- **Hidden Layers**: Process information (one or more)
- **Output Layer**: Produces predictions
- **Neurons**: Basic processing units
- **Weights**: Learned parameters
- **Activation Functions**: Introduce non-linearity

### Architecture Components

**Dense (Fully Connected) Layers**:
- Each neuron connected to all neurons in previous layer
- Most common layer type
- Learns feature combinations

**Activation Functions**:
- **ReLU**: Rectified Linear Unit (common in hidden layers)
- **Sigmoid**: Outputs probability (0 to 1) for binary classification
- **Tanh**: Similar to sigmoid but range (-1 to 1)

**Loss Functions**:
- **Binary Crossentropy**: For binary classification
- Measures difference between predicted and actual probabilities

**Optimizers**:
- **Adam**: Adaptive learning rate (commonly used)
- Combines benefits of AdaGrad and RMSProp

## Code Implementation

The `chapter08.py` file demonstrates:

### 1. Data Generation

```python
# Normal operation
normal_features = np.random.rand(500, 4) * 10

# Fault data (shifted distribution)
fault_features = np.random.rand(200, 4) * 10 + 5
```

**Key Design**:
- 4 features per sample
- Fault data shifted to higher values
- Simulates real fault conditions

### 2. Model Architecture

```python
model = tf.keras.Sequential([
    tf.keras.layers.Dense(32, activation="relu", input_shape=(4,)),
    tf.keras.layers.Dense(16, activation="relu"),
    tf.keras.layers.Dense(8, activation="relu"),
    tf.keras.layers.Dense(1, activation="sigmoid")
])
```

**Architecture Details**:
- **Input**: 4 features
- **Hidden Layers**: 32 → 16 → 8 neurons
- **Output**: 1 neuron with sigmoid (probability)
- **Total Parameters**: Learned weights and biases

### 3. Model Compilation

```python
model.compile(
    optimizer="adam",
    loss="binary_crossentropy",
    metrics=["accuracy"]
)
```

**Components**:
- **Optimizer**: Adam (adaptive learning rate)
- **Loss**: Binary crossentropy (for binary classification)
- **Metrics**: Accuracy (for monitoring)

### 4. Training

```python
history = model.fit(
    X_train, y_train,
    epochs=50,
    batch_size=32,
    validation_split=0.2,
    verbose=1
)
```

**Parameters**:
- **epochs**: Number of training iterations
- **batch_size**: Samples per gradient update
- **validation_split**: Fraction for validation
- **verbose**: Training progress display

## Training Process

### Epochs

- One epoch = one pass through entire training data
- Multiple epochs needed for convergence
- Too many epochs can cause overfitting

### Batch Size

- Number of samples processed before updating weights
- Smaller = more updates, more noise
- Larger = fewer updates, more stable

### Validation Split

- Separate data for validation during training
- Monitors overfitting
- Doesn't affect final weights
- Used for early stopping

## Evaluation

### Test Performance

```python
test_loss, test_acc = model.evaluate(X_test, y_test)
```

**Metrics**:
- **Loss**: How well model fits data (lower is better)
- **Accuracy**: Proportion of correct predictions

### Predictions

```python
y_pred = model.predict(X_test)
y_pred_binary = (y_pred > 0.5).astype(int)
```

**Output**:
- Probabilities (0 to 1)
- Binary predictions (threshold at 0.5)

## Visualization

### Training History

**Loss Plot**:
- Training loss should decrease
- Validation loss should track training loss
- Divergence indicates overfitting

**Accuracy Plot**:
- Both should increase
- Validation accuracy shows generalization
- Gap indicates overfitting

### Probability Distribution

- Histogram of predicted probabilities
- Normal samples: Low probabilities
- Fault samples: High probabilities
- Overlap indicates classification difficulty

### Confusion Matrix

- Shows classification performance
- True positives, true negatives
- False positives, false negatives

## Feature Importance

### Permutation Importance

```python
perm_importance = permutation_importance(
    model, X_test, y_test, n_repeats=10
)
```

**Method**:
- Shuffle one feature at a time
- Measure accuracy drop
- Larger drop = more important feature

**Advantages**:
- Model-agnostic
- Easy to interpret
- Works with any model

## Key Concepts

### Overfitting

**Signs**:
- Training accuracy >> validation accuracy
- Training loss << validation loss
- Model memorizes training data

**Prevention**:
- Early stopping
- Dropout layers
- Regularization
- More training data

### Underfitting

**Signs**:
- Low training and validation accuracy
- Model too simple
- Not learning patterns

**Solutions**:
- Increase model capacity
- More training epochs
- Better features

### Hyperparameters

**Architecture**:
- Number of layers
- Neurons per layer
- Activation functions

**Training**:
- Learning rate
- Batch size
- Number of epochs

**Tuning**: Use validation set to find best values

## Best Practices

1. **Normalize Features**: Always scale before training
2. **Use Validation Set**: Monitor overfitting
3. **Start Simple**: Begin with small network
4. **Visualize Training**: Watch for overfitting
5. **Save Models**: Keep best model checkpoints

## Advantages

- Learns complex patterns
- Handles non-linear relationships
- Automatic feature learning
- Good generalization (when tuned)

## Limitations

- Requires more data
- Longer training time
- Less interpretable
- Hyperparameter tuning needed
- Can overfit easily

## Applications

Neural networks are useful for:
- **Complex Fault Detection**: Non-linear patterns
- **Multi-sensor Fusion**: Combine multiple sensors
- **High Accuracy Needs**: Production systems
- **Feature Learning**: Automatic feature extraction

## Next Steps

In the next chapter, we'll extend to multi-class fault detection, classifying different types of faults (bearing failure, misalignment, imbalance, etc.) using neural networks.

