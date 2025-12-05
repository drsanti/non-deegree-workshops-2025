# Chapter 4: Moving Averages and Basic Smoothing

## Overview

Noise reduction is a fundamental task in sensor data processing. Moving averages are among the simplest yet most effective smoothing techniques for reducing high-frequency noise while preserving signal trends. This chapter explores various moving average methods and their applications in IoT sensor systems.

## Learning Objectives

By the end of this chapter, you will:
- Understand different types of moving averages
- Implement Simple, Weighted, and Exponential Moving Averages
- Learn how to select appropriate window sizes
- Compare smoothing effectiveness vs. responsiveness
- Apply moving averages to real-world sensor scenarios
- Visualize the trade-offs between noise reduction and signal delay

## What is Smoothing?

**Smoothing** is the process of reducing noise and short-term variations in data to reveal underlying trends and patterns. It's a form of low-pass filtering that:
- Removes high-frequency noise
- Preserves low-frequency signal components
- Makes trends more visible
- Reduces data variability

## Types of Moving Averages

### 1. Simple Moving Average (SMA)

The most basic form - average of the last N data points.

**Formula**:
```
y[n] = (x[n] + x[n-1] + x[n-2] + ... + x[n-N+1]) / N
```

**Characteristics**:
- Equal weight to all points in the window
- Easy to implement and understand
- Good for smooth, gradual changes
- Introduces lag proportional to window size

**Advantages**:
- Simple calculation
- Uniform weighting
- Good noise reduction for larger windows

**Disadvantages**:
- Significant lag with large windows
- Less responsive to recent changes
- Edge effects at boundaries

### 2. Weighted Moving Average (WMA)

Assigns different weights to data points, typically more weight to recent data.

**Formula**:
```
y[n] = (w₁×x[n] + w₂×x[n-1] + ... + wₙ×x[n-N+1]) / Σwᵢ
```

**Linear Weights Example**:
```
Weights: [1, 2, 3, 4, 5] (most recent has weight 5)
```

**Characteristics**:
- More responsive than SMA
- Recent data has more influence
- Reduced lag compared to SMA
- Customizable weighting schemes

**Advantages**:
- Better responsiveness
- Reduced phase lag
- Flexible weighting

**Disadvantages**:
- More complex calculation
- Requires weight selection
- Still has some lag

### 3. Exponential Moving Average (EMA)

Applies exponentially decreasing weights to older data points.

**Formula**:
```
y[n] = α × x[n] + (1 - α) × y[n-1]
```

Where α is the smoothing factor (0 < α < 1):
```
α = 2 / (N + 1)  or  α = 1 / N
```

**Characteristics**:
- Infinite impulse response (IIR) filter
- Only needs current value and previous output
- Very efficient computation
- Exponentially decaying weights

**Advantages**:
- Minimal memory requirements
- Very efficient calculation
- Good responsiveness
- Smooth continuous output

**Disadvantages**:
- Requires initial condition
- Less intuitive parameter selection
- Can overshoot on rapid changes

## Window Size Selection

### Trade-offs

**Small Window (N = 3-10)**:
- Fast response to changes
- Less noise reduction
- Better for tracking rapid variations
- Suitable for dynamic signals

**Medium Window (N = 10-50)**:
- Balanced approach
- Good noise reduction
- Moderate lag
- Suitable for most applications

**Large Window (N = 50-200)**:
- Maximum noise reduction
- Significant lag
- Poor response to changes
- Suitable for trend analysis

### Selection Guidelines

| Sensor Type | Update Rate | Recommended N | Reason |
|-------------|-------------|---------------|--------|
| Temperature | Slow (< 1 Hz) | 5-20 | Slow changes, smooth trends |
| Humidity | Slow (< 1 Hz) | 5-15 | Gradual variations |
| Pressure | Medium (10 Hz) | 10-30 | Balance speed and smoothness |
| Vibration | Fast (> 100 Hz) | 20-100 | High noise, need averaging |
| Current | Medium (10 Hz) | 5-20 | Dynamic but noisy |

### Practical Formula

A good starting point:
```
N ≈ sampling_rate × time_constant

Where time_constant is how long features should be averaged
```

## Phase Lag and Group Delay

**Phase Lag**: The time delay introduced by smoothing.

```
Lag (samples) ≈ (N - 1) / 2  for SMA
Lag (samples) ≈ (N - 1) / 3  for WMA
Lag (samples) ≈ (1 - α) / α  for EMA
```

**Impact**:
- SMA: Maximum lag
- WMA: Reduced lag
- EMA: Minimal lag for same smoothing

## Comparison of Methods

| Method | Complexity | Memory | Lag | Responsiveness | Smoothness |
|--------|-----------|---------|-----|----------------|------------|
| SMA | Low | O(N) | High | Low | High |
| WMA | Medium | O(N) | Medium | Medium | Medium-High |
| EMA | Low | O(1) | Low | High | Medium |

## Practical Applications

### 1. Temperature Sensor Smoothing
- Use SMA with N=10-20
- Removes sensor noise
- Reveals temperature trends

### 2. Vibration Analysis Preprocessing
- Use EMA with small α
- Quick response to changes
- Reduces measurement noise

### 3. Power Consumption Monitoring
- Use WMA with linear weights
- Recent data more important
- Smooth but responsive

### 4. Real-time Control Systems
- Use EMA for minimal lag
- Fast response needed
- Limited memory

## Implementation Considerations

### Edge Effects

At the beginning of data:
- Not enough historical points
- Options: zero-padding, forward-only smoothing, or skip initial points

### Real-time vs. Batch Processing

**Real-time**:
- Can only use past data (causal filter)
- EMA preferred for efficiency
- Circular buffers for SMA/WMA

**Batch Processing**:
- Can use centered windows
- Better smoothing quality
- No real-time constraints

### Computational Efficiency

**SMA**: O(N) per output point
**WMA**: O(N) per output point
**EMA**: O(1) per output point (most efficient!)

## Code Implementation

The `chapter04.ts` file demonstrates:
- Three moving average implementations
- Multiple window sizes comparison
- Different sensor signal smoothing
- Performance metrics (lag, smoothness)
- Interactive visualizations

## Visualizations

We create plots showing:
1. **Moving Average Comparison**: SMA, WMA, EMA side-by-side
2. **Window Size Effects**: Small vs. medium vs. large windows
3. **Sensor Application Examples**: Real-world scenarios
4. **Lag Demonstration**: Phase delay visualization

## Key Takeaways

1. **Moving Averages Trade Noise for Lag**: Can't have both perfect smoothing and instant response
2. **Window Size is Critical**: Choose based on signal dynamics and noise level
3. **EMA is Most Efficient**: Best for real-time systems with memory constraints
4. **SMA is Most Intuitive**: Easier to understand and tune
5. **WMA Offers Balance**: Middle ground between SMA and EMA
6. **Context Matters**: Different applications need different approaches

## When NOT to Use Moving Averages

1. **Preserving Sharp Edges**: Use median filters instead
2. **Frequency-Specific Filtering**: Use digital filters (next chapters)
3. **Outlier Removal**: Use statistical methods first
4. **Phase-Critical Applications**: Moving averages always introduce delay

## Next Steps

In Chapter 5, we'll explore digital filters, specifically low-pass filters like Butterworth, which provide better frequency-domain control than simple moving averages.

## Running the Code

```bash
# Using npm script
npm run chapter04

# Or directly with tsx
tsx codes/chapter04.ts
```

The output visualizations will be saved to:
- `outputs/chapter04/ma-methods-comparison.svg` and `.html`
- `outputs/chapter04/window-size-comparison.svg` and `.html`
