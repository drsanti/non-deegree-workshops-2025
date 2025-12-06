# Chapter 3: Advanced Visualization & Exploratory Data Analysis

## Overview

This chapter focuses on advanced visualization techniques and exploratory data analysis (EDA) for industrial sensor data. We'll learn how to create correlation heatmaps, distribution plots, pairwise relationships, and statistical summaries that help us understand our data before applying machine learning algorithms.

## Learning Objectives

By the end of this chapter, you will:
- Create correlation heatmaps to understand sensor relationships
- Visualize data distributions using histograms
- Generate pairwise scatter plots to identify relationships
- Use box plots for outlier detection
- Create normalized time-series comparisons
- Generate comprehensive statistical summaries

## Visualization Techniques

### 1. Correlation Analysis

**Purpose**: Understand relationships between different sensors

**Method**: Pearson correlation coefficient

```python
corr = df[sensor_cols].corr()
sns.heatmap(corr, annot=True, cmap="coolwarm")
```

**Key Insights**:
- Values close to +1: Strong positive correlation
- Values close to -1: Strong negative correlation
- Values close to 0: No linear relationship

**Applications**:
- Feature selection (remove highly correlated features)
- Understanding system behavior
- Detecting sensor dependencies

### 2. Distribution Plots

**Purpose**: Understand the statistical distribution of each sensor

**Method**: Histograms with statistical markers

```python
plt.hist(df["temperature"], bins=30)
plt.axvline(df["temperature"].mean(), color='red', linestyle='--')
```

**Key Information**:
- **Mean**: Central tendency
- **Standard Deviation**: Spread of data
- **Skewness**: Asymmetry in distribution
- **Outliers**: Values far from the mean

### 3. Pairwise Scatter Plots

**Purpose**: Visualize relationships between all sensor pairs

**Method**: Pair plot (scatter matrix)

```python
sns.pairplot(df[sensor_cols])
```

**Benefits**:
- Identify linear and non-linear relationships
- Detect clusters or groups in data
- Spot outliers across multiple dimensions

### 4. Box Plots

**Purpose**: Detect outliers and understand data spread

**Method**: Box and whisker plots

```python
plt.boxplot([df["temperature"], df["vibration"], ...])
```

**Components**:
- **Box**: Interquartile range (IQR)
- **Median Line**: Middle value
- **Whiskers**: 1.5 × IQR from quartiles
- **Outliers**: Points beyond whiskers

### 5. Normalized Time-Series Comparison

**Purpose**: Compare sensors on the same scale

**Method**: Normalize all sensors to [0,1] range

```python
scaler = MinMaxScaler()
df_normalized = scaler.fit_transform(df[sensor_cols])
```

**Benefits**:
- Compare patterns across different scales
- Identify synchronized behaviors
- Detect phase relationships

## Code Implementation

The `chapter03.py` file demonstrates:

1. **Correlation Matrix**: Heatmap showing all sensor correlations
2. **Distribution Plots**: Histograms for each sensor with mean markers
3. **Pair Plot**: Scatter matrix showing all pairwise relationships
4. **Box Plots**: Outlier detection across all sensors
5. **Normalized Comparison**: Time-series plot with all sensors on same scale
6. **Statistical Summary**: Comprehensive statistics table

## Statistical Summary

The code generates a comprehensive statistical summary including:

- **Count**: Number of data points
- **Mean**: Average value
- **Std**: Standard deviation
- **Min/Max**: Extreme values
- **Quartiles**: 25%, 50% (median), 75%

## Key Insights from EDA

### Correlation Insights
- High correlation between sensors may indicate:
  - Physical coupling (e.g., temperature affects pressure)
  - Common external factors
  - Redundant information

### Distribution Insights
- Normal distributions: Expected for well-behaved sensors
- Skewed distributions: May indicate:
  - Sensor drift
  - Operating regime changes
  - Fault conditions

### Outlier Insights
- Outliers may represent:
  - Measurement errors (remove)
  - Fault conditions (investigate)
  - Rare but valid events (keep)

## Best Practices

### Correlation Analysis
- Look for correlations > 0.7 or < -0.7
- Consider removing highly correlated features
- Understand physical relationships

### Distribution Analysis
- Check for normality (important for some ML algorithms)
- Identify skewness (may need transformation)
- Note any multi-modal distributions

### Outlier Analysis
- Distinguish between errors and valid anomalies
- Document outlier handling decisions
- Consider domain knowledge

## Visualization Guidelines

1. **Choose Appropriate Scales**: Use log scales for wide ranges
2. **Add Context**: Include reference lines, thresholds
3. **Color Coding**: Use consistent colors across plots
4. **Clear Labels**: Always label axes and include units
5. **Legends**: Include legends for multi-series plots

## Applications

EDA helps with:
- **Feature Selection**: Identify important features
- **Data Quality**: Detect missing values, outliers
- **Model Selection**: Understand data characteristics
- **Domain Understanding**: Learn system behavior

## Common Patterns to Look For

1. **Cyclical Patterns**: Regular oscillations (e.g., daily cycles)
2. **Trends**: Gradual increases/decreases over time
3. **Step Changes**: Sudden shifts in values
4. **Clusters**: Groups of similar data points
5. **Anomalies**: Unusual patterns or outliers

## Next Steps

After understanding our data through EDA, we're ready to apply machine learning algorithms. In the next chapter, we'll start with linear regression to predict sensor values.

