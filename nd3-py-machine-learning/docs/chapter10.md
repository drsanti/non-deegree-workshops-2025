# Chapter 10: Time-series Fault Prediction with LSTM

## Overview

This final chapter introduces Long Short-Term Memory (LSTM) networks for time-series fault prediction. Unlike previous chapters that used individual sensor readings, LSTMs can learn from sequences of data, making them ideal for predicting faults based on temporal patterns and trends in sensor data.

## Learning Objectives

By the end of this chapter, you will:
- Understand time-series data and sequences
- Learn how LSTM networks work
- Build LSTM models for fault prediction
- Prepare sequential data for LSTM training
- Evaluate time-series predictions
- Visualize fault progression over time

## Time-series Data

### What is Time-series Data?

Data points collected over time with temporal ordering:
- **Order matters**: Sequence contains information
- **Dependencies**: Current value depends on previous values
- **Trends**: Patterns that evolve over time

### Why Special Handling?

Traditional ML treats samples independently:
- Ignores temporal relationships
- Loses sequence information
- Can't capture trends

LSTM networks:
- Remember previous information
- Learn temporal patterns
- Predict based on sequences

## LSTM Networks

### What is LSTM?

Long Short-Term Memory - a type of Recurrent Neural Network (RNN):
- **Memory cells**: Store information over time
- **Gates**: Control information flow
- **Sequential processing**: Processes one time step at a time

### Key Components

**Forget Gate**: Decides what to forget from previous state
**Input Gate**: Decides what new information to store
**Output Gate**: Decides what to output

### Advantages

- Learns long-term dependencies
- Handles variable-length sequences
- Good for time-series data
- Can predict future values

### Architecture

```
Input Sequence → LSTM Layer → Dense Layers → Prediction
(time_steps, features) → (hidden_units) → (output_size)
```

## Code Implementation

The `chapter10.py` file demonstrates:

### 1. Generate Time-series Data

```python
sequence_length = 20  # Use 20 time steps

# Normal sequences
normal_seq = []
for i in range(500):
    seq = 50 + 2 * np.sin(np.arange(i, i+sequence_length) * 0.1) + \
          np.random.normal(0, 0.5, sequence_length)
    normal_seq.append(seq)

# Fault sequences (gradual increase)
fault_seq = []
for i in range(500):
    trend = np.linspace(0, 5, sequence_length)  # Gradual fault
    seq = 50 + 2 * np.sin(np.arange(i, i+sequence_length) * 0.1) + trend + \
          np.random.normal(0, 0.5, sequence_length)
    fault_seq.append(seq)
```

**Key Design**:
- **Sequence Length**: 20 time steps
- **Normal**: Stable with small variations
- **Fault**: Gradual trend (fault progression)
- **Temporal Pattern**: LSTM learns the trend

### 2. Data Reshaping

```python
X = np.array(normal_seq + fault_seq)
X = X.reshape((X.shape[0], X.shape[1], 1))
```

**Shape Requirements**:
- **(samples, time_steps, features)**
- Samples: Number of sequences
- Time_steps: Length of each sequence
- Features: Number of features per time step (1 in our case)

### 3. Model Architecture

```python
model = tf.keras.Sequential([
    tf.keras.layers.LSTM(50, activation="relu", input_shape=(sequence_length, 1)),
    tf.keras.layers.Dense(25, activation="relu"),
    tf.keras.layers.Dense(1, activation="sigmoid")
])
```

**Components**:
- **LSTM Layer**: 50 hidden units, processes sequences
- **Dense Layers**: Process LSTM output
- **Output**: Binary classification (normal/fault)

### 4. Training

```python
history = model.fit(
    X_train, y_train,
    epochs=30,
    batch_size=32,
    validation_split=0.2
)
```

**Considerations**:
- Fewer epochs may be needed (LSTM learns faster)
- Batch size affects memory usage
- Validation monitors overfitting

## Sequence Preparation

### Sliding Window

**Concept**: Create sequences from time-series:
- Window size: Number of time steps
- Slide window along time series
- Each window = one training sample

**Example**:
```
Time:  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
Window 1: [1, 2, 3, 4, 5] → Label: 6
Window 2: [2, 3, 4, 5, 6] → Label: 7
```

### Normalization

**Critical for LSTM**:
- Scale sequences to similar ranges
- Prevents gradient issues
- Improves training stability

```python
scaler = StandardScaler()
X_flat = X.reshape(-1, 1)
X_scaled_flat = scaler.fit_transform(X_flat)
X_scaled = X_scaled_flat.reshape(X.shape)
```

## Evaluation

### Test Performance

```python
test_loss, test_acc = model.evaluate(X_test, y_test)
```

### Predictions

```python
y_pred_proba = model.predict(X_test)
y_pred_binary = (y_pred_proba > 0.5).astype(int)
```

## Visualization

### Training History

- Loss and accuracy over epochs
- Monitor convergence
- Check for overfitting

### Sequence Visualization

- Plot sample sequences
- Show actual vs predicted labels
- Display prediction probabilities
- Helps understand model behavior

### Probability Distribution

- Histogram of predicted probabilities
- Normal vs fault distributions
- Shows prediction confidence

### Fault Progression

- Long sequence with fault development
- Plot fault probability over time
- Shows when model detects fault
- Useful for predictive maintenance

## Key Concepts

### Sequence Length

**Choosing Length**:
- Too short: Misses long-term patterns
- Too long: More computation, may overfit
- Typical: 10-50 time steps
- Domain knowledge helps

### LSTM Units

**Number of Units**:
- More units = more capacity
- Too many = overfitting
- Start with 32-128
- Tune based on performance

### Gradient Issues

**Vanishing Gradients**:
- Problem in deep RNNs
- LSTM designed to mitigate
- Still can occur with very long sequences

**Exploding Gradients**:
- Gradient clipping helps
- Normalize inputs
- Use appropriate learning rate

## Best Practices

1. **Normalize Sequences**: Critical for LSTM
2. **Choose Appropriate Length**: Balance pattern capture vs computation
3. **Monitor Training**: Watch for overfitting
4. **Visualize Sequences**: Understand what model sees
5. **Test on Long Sequences**: Verify generalization

## Applications

LSTM for time-series is useful for:
- **Predictive Maintenance**: Predict faults before they occur
- **Anomaly Detection**: Find unusual patterns in sequences
- **Forecasting**: Predict future sensor values
- **Pattern Recognition**: Identify recurring patterns

## Real-World Considerations

### Online Prediction

**Challenge**: Predict in real-time as data arrives

**Solutions**:
- Use sliding window
- Update predictions continuously
- Handle variable-length sequences

### Computational Cost

**Considerations**:
- LSTM slower than feedforward networks
- Sequence length affects speed
- May need optimization for production

### Data Requirements

**Needs**:
- Sufficient sequences for training
- Representative fault patterns
- Temporal relationships present

## Advantages

- Learns temporal patterns
- Handles sequences of varying importance
- Good for fault progression
- Can predict before full fault

## Limitations

- More complex than feedforward networks
- Requires sequential data
- Slower training and inference
- More hyperparameters to tune

## Comparison with Previous Methods

### Feedforward Networks (Chapters 8-9)
- Single time point
- No temporal memory
- Faster training

### LSTM (This Chapter)
- Multiple time points
- Temporal memory
- Better for sequences

## Next Steps

You've completed the full tutorial! You now understand:
- Data generation and preprocessing
- Traditional ML algorithms
- Deep learning with neural networks
- Time-series analysis with LSTM

Continue exploring:
- More complex architectures
- Real sensor data
- Production deployment
- Advanced techniques

