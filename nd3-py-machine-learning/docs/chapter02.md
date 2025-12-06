# Chapter 2: Preprocessing & Feature Engineering

## Overview

This chapter covers essential data preprocessing techniques for industrial sensor data. We'll learn how to clean noisy signals, create meaningful features, handle outliers, and normalize data for machine learning applications. These preprocessing steps are crucial for improving model performance and extracting valuable insights from raw sensor readings.

## Learning Objectives

By the end of this chapter, you will:
- Understand various smoothing techniques for noisy sensor data
- Learn how to create derived features (gradients, rolling statistics)
- Master outlier detection and removal methods
- Understand different normalization techniques (Min-Max, Standard scaling)
- Know when to apply each preprocessing technique

## Preprocessing Techniques

### 1. Smoothing - Rolling Average

**Purpose**: Reduce high-frequency noise while preserving signal trends

**Method**: Moving average over a sliding window

```python
df["temp_smooth"] = df["temperature"].rolling(window_size).mean()
```

**Key Parameters**:
- `window_size`: Number of samples in the rolling window (typically 10-20)
- Larger windows = more smoothing but slower response to changes
- Smaller windows = less smoothing but faster response

### 2. Feature Engineering

**Purpose**: Create new features that capture important signal characteristics

#### Gradient (Rate of Change)
```python
df["temp_grad"] = np.gradient(df["temperature"])
```
- Measures how quickly the signal is changing
- Useful for detecting sudden changes or trends
- High gradient values indicate rapid changes

#### Rolling Statistics
```python
df["temp_std"] = df["temperature"].rolling(20).std()
df["temp_max"] = df["temperature"].rolling(20).max()
df["temp_min"] = df["temperature"].rolling(20).min()
```
- **Standard Deviation**: Measures variability in a window
- **Max/Min**: Captures extreme values in a time window
- Useful for detecting anomalies and understanding signal variability

### 3. Outlier Detection and Removal

**Purpose**: Remove data points that are significantly different from the rest

**Method**: Z-score based outlier detection

```python
z_scores = np.abs(stats.zscore(df[sensor_cols]))
df_clean = df[(z_scores < 3).all(axis=1)]
```

**Key Concepts**:
- Z-score measures how many standard deviations a value is from the mean
- Threshold of 3 means we keep values within 3 standard deviations
- Removes approximately 0.3% of data (if normally distributed)

**When to Use**:
- When you have clear outliers that are measurement errors
- Before training machine learning models
- When outliers would significantly affect model performance

### 4. Normalization

**Purpose**: Scale features to a common range for machine learning

#### Min-Max Scaling (0 to 1)
```python
scaler = MinMaxScaler()
df_minmax = scaler.fit_transform(df_clean[sensor_cols])
```
- Scales all features to range [0, 1]
- Preserves original distribution shape
- Good when you know the data bounds

#### Standard Scaling (Mean=0, Std=1)
```python
scaler = StandardScaler()
df_standard = scaler.fit_transform(df_clean[sensor_cols])
```
- Centers data at 0 with unit variance
- Good for algorithms that assume normal distribution
- More robust to outliers than Min-Max

## Code Implementation

The `chapter02.py` file demonstrates:

1. **Smoothing**: Applying rolling averages to all sensor channels
2. **Feature Creation**: Generating gradients and rolling statistics
3. **Outlier Removal**: Using z-score method to clean data
4. **Normalization**: Applying both Min-Max and Standard scaling
5. **Visualization**: Comparing original vs processed data

## Visualization Examples

The chapter includes visualizations showing:
- **Original vs Smoothed**: Comparison of raw and smoothed signals
- **Gradient Analysis**: Rate of change over time
- **Rolling Statistics**: Variability and extremes in windows
- **Normalization Comparison**: Min-Max vs Standard scaling effects

## Best Practices

### When to Smooth
- High noise levels that obscure signal patterns
- Before feature extraction
- When preparing data for visualization

### When to Create Features
- When raw values don't capture important patterns
- For time-series analysis (gradients, trends)
- When domain knowledge suggests derived features

### When to Remove Outliers
- Clear measurement errors
- Before training models sensitive to outliers
- When outliers represent <1% of data

### When to Normalize
- **Always** before machine learning (most algorithms require it)
- When features have very different scales
- When using distance-based algorithms

## Impact on Machine Learning

Proper preprocessing significantly improves:
- **Model Accuracy**: Clean data leads to better predictions
- **Training Speed**: Normalized data trains faster
- **Feature Quality**: Engineered features capture important patterns
- **Generalization**: Outlier removal improves model robustness

## Common Pitfalls

1. **Over-smoothing**: Losing important signal details
2. **Removing valid outliers**: Some outliers are real faults!
3. **Data leakage**: Fitting scalers on test data
4. **Ignoring temporal order**: Shuffling time-series data incorrectly

## Next Steps

In the next chapter, we'll explore advanced visualization techniques and exploratory data analysis to better understand our sensor data before applying machine learning algorithms.

