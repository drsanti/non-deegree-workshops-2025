# Chapter 3: Sensor Calibration and Distribution Analysis

## Learning Objectives

By the end of this chapter, you will be able to:
- Visualize sensor calibration against reference standards using scatter plots
- Analyze sensor measurement distributions with histograms and density plots
- Compare distributions across multiple sensors to identify calibration issues
- Detect outliers and assess sensor quality using boxplots
- Calculate and interpret calibration metrics (bias, RMSE, correlation)
- Create comprehensive calibration dashboards for sensor quality control

## Introduction

In IoT systems, **sensor accuracy** is critical for reliable monitoring and decision-making. Even high-quality sensors can drift over time, develop systematic biases, or exhibit measurement variability that affects system performance. As an IoT developer, you need tools to:

- **Calibrate sensors**: Compare sensor readings against certified reference standards
- **Assess quality**: Quantify measurement noise and systematic errors
- **Monitor drift**: Detect when sensors need recalibration or replacement
- **Compare sensors**: Identify which sensors in an array need attention
- **Detect anomalies**: Find outliers that indicate sensor faults or environmental extremes

This chapter introduces **distribution analysis** and **calibration visualization** techniques. Unlike time series plots (Chapters 1-2), we'll focus on the **statistical properties** of sensor data—how measurements are distributed, what their central tendency and spread are, and how they compare to reference standards or other sensors.

### Key ggplot2 Concepts

Building on previous chapters, we'll introduce:

1. **geom_histogram()**: Visualize frequency distributions
2. **geom_density()**: Smooth distribution curves
3. **geom_boxplot()**: Show median, quartiles, and outliers
4. **geom_smooth()**: Fit calibration curves (linear regression)
5. **geom_abline()**: Add ideal reference lines (y = x)
6. **geom_vline()**: Mark thresholds and statistics (mean, limits)
7. **Overlapping distributions**: Transparency and color for multi-sensor comparison

## Dataset Description

### Scenario 1: Sensor Calibration

You're commissioning a **new temperature sensor** and need to verify its accuracy before deployment. The sensor is tested against a **certified reference standard** (traceable thermometer) across the expected operating range.

**Calibration Process:**
- Reference temperatures: 20°C to 30°C (typical operating range)
- Calibration points: 21 measurements at 0.5°C intervals
- Sensor shows systematic bias: +2°C offset (common calibration issue)
- Measurement noise: ±0.5°C (random error)

**Dataset Structure:**
- **actual_temp**: True temperature from certified reference
- **sensor_reading**: Reading from sensor being calibrated
- **sensor_id**: Sensor identifier (TEMP_UNCAL_001)
- **reference_id**: Reference standard used (REF_STANDARD_A)

### Scenario 2: Multi-Sensor Distribution Comparison

You're managing a **sensor array** with three temperature sensors monitoring the same environment. Over time, sensors can drift or develop different noise characteristics. You need to identify which sensors need recalibration or replacement.

**Sensor Characteristics:**

1. **Sensor A (TEMP_A_001)**: Reference quality
   - Mean: 25°C (accurate)
   - Standard deviation: 0.8°C (low noise)
   - Status: High precision, well-calibrated

2. **Sensor B (TEMP_B_002)**: Needs attention
   - Mean: 27°C (+2°C bias)
   - Standard deviation: 1.5°C (moderate noise)
   - Status: Requires recalibration

3. **Sensor C (TEMP_C_003)**: Degraded
   - Mean: 23°C (-2°C bias)
   - Standard deviation: 2.0°C (high noise)
   - Status: Consider replacement (aging sensor)

## Examples

### Example 1: Basic Sensor Calibration Plot

**Objective**: Visualize sensor accuracy against reference standard.

**IoT Context**: Initial calibration check to identify systematic bias before sensor deployment.

**What's new**:
- Scatter plot with `geom_point()` for calibration data points
- `geom_smooth(method = "lm")` for linear regression fit
- Comparing sensor readings vs. actual (reference) temperatures

**Code**: See `chapter03.R` - Example 1

**Key Points**:
- Each point represents a calibration measurement
- Blue line shows the fitted calibration curve
- Ideally, points should follow the y = x line (perfect accuracy)
- This sensor shows consistent positive bias (~2°C)
- Linear model quantifies the systematic error
- Calibration equation can be used to correct future readings

---

### Example 2: Single Sensor Histogram

**Objective**: Visualize measurement distribution for one sensor.

**IoT Context**: Assess sensor noise and measurement variability during quality control testing.

**What's new**:
- `geom_histogram()` with binwidth control
- Frequency distribution of sensor readings
- Understanding measurement repeatability

**Code**: See `chapter03.R` - Example 2

**Key Points**:
- Histogram shows how often each temperature range occurs
- Binwidth = 0.5°C provides good resolution for this data
- Distribution should be roughly bell-shaped (normal) for good sensors
- Width of distribution indicates measurement noise
- Central peak shows the most common reading
- Useful for comparing sensor specifications (e.g., ±0.5°C accuracy)

---

### Example 3: Density Plot with Statistics

**Objective**: Smooth distribution visualization with mean reference line.

**IoT Context**: Calculate and display key statistics for sensor quality assessment.

**What's new**:
- `geom_density()` for smooth distribution curve
- `geom_vline()` to mark mean value
- `annotate()` to display statistics on plot
- Calculating standard deviation

**Code**: See `chapter03.R` - Example 3

**Key Points**:
- Density plot is smoother than histogram, better for presentation
- Vertical dashed line marks the mean temperature
- Mean and SD annotated directly on plot for quick reference
- Low SD (0.8°C) indicates consistent, precise measurements
- Area under curve always equals 1 (probability distribution)
- Better for comparing multiple sensors than histograms

---

### Example 4: Multi-Sensor Distribution Comparison

**Objective**: Compare distributions across multiple sensors to identify calibration issues.

**IoT Context**: Sensor array quality control—which sensors need recalibration?

**What's new**:
- Overlapping density plots with transparency
- `scale_fill_manual()` and `scale_color_manual()` for custom colors
- Color coding by sensor quality status
- Multiple distributions on same axes

**Code**: See `chapter03.R` - Example 4

**Key Points**:
- Green (Sensor A): Reference quality, centered at 25°C, narrow spread
- Orange (Sensor B): Shifted right (+2°C bias), wider spread
- Red (Sensor C): Shifted left (-2°C bias), very wide spread (high noise)
- Transparency allows seeing all three distributions clearly
- Immediately identifies which sensors need attention
- Color coding matches traffic light convention (green = good, red = problem)
- Essential for sensor array maintenance scheduling

---

### Example 5: Boxplot for Outlier Detection

**Objective**: Identify outliers and compare sensor spreads.

**IoT Context**: Quality control and anomaly detection across sensor fleet.

**What's new**:
- `geom_boxplot()` showing median, quartiles, and outliers
- Side-by-side comparison of sensors
- Outlier highlighting in red
- Understanding interquartile range (IQR)

**Code**: See `chapter03.R` - Example 5

**Key Points**:
- **Box**: Interquartile range (IQR, middle 50% of data)
- **Line in box**: Median (not mean!)
- **Whiskers**: Extend to 1.5 × IQR (typical data range)
- **Red dots**: Outliers beyond whiskers (potential faults)
- Sensor A: Narrow box = low variability, high quality
- Sensor B: Medium box, some outliers
- Sensor C: Wide box = high variability, many outliers
- Outliers could indicate sensor faults or extreme environmental events

---

### Example 6 (BONUS): Combined Calibration Dashboard

**Objective**: Create comprehensive calibration visualization with confidence intervals.

**IoT Context**: Complete sensor quality assessment for certification or compliance.

**What's new**:
- `geom_smooth()` with confidence interval shading (`se = TRUE`)
- `geom_abline()` for ideal y = x reference line
- Combined annotations showing ideal vs. actual fit
- Calculating calibration quality metrics

**Code**: See `chapter03.R` - Example 6

**Key Points**:
- Gray dashed line shows ideal calibration (y = x, perfect accuracy)
- Red line shows actual sensor behavior (fitted model)
- Light red shading shows 95% confidence interval
- Gap between ideal and actual quantifies bias
- Narrow confidence interval indicates consistent bias (correctable)
- Wide confidence interval suggests variable error (harder to correct)
- Metrics displayed: MAE, RMSE, correlation coefficient
- This format suitable for calibration certificates and quality reports

---

## Summary

In this chapter, you learned to assess **sensor quality and calibration**:

1. **Calibration analysis**: Scatter plots with regression to quantify bias
2. **Distribution visualization**: Histograms and density plots for variability
3. **Multi-sensor comparison**: Overlapping distributions to identify issues
4. **Outlier detection**: Boxplots for quality control
5. **Statistical assessment**: Mean, SD, RMSE, correlation metrics
6. **Dashboard creation**: Combined visualizations for comprehensive reports

### ggplot2 Functions Introduced

| Function | Purpose |
|----------|---------|
| `geom_histogram()` | Frequency distribution bars |
| `geom_density()` | Smooth probability distribution curve |
| `geom_boxplot()` | Median, quartiles, outliers |
| `geom_smooth()` | Fit regression lines with confidence intervals |
| `geom_abline()` | Add reference lines (y = x ideal calibration) |
| `geom_vline()` | Vertical reference lines (mean, thresholds) |
| `annotate()` | Add text labels with statistics |
| `scale_fill_manual()` | Custom fill colors for categories |
| `scale_color_manual()` | Custom outline colors for categories |

### Calibration vs. Distribution Analysis

| Approach | Best For | Output |
|----------|----------|--------|
| **Calibration plot** | Systematic bias detection | Correction equation |
| **Histogram** | Visualize measurement frequency | Binned counts |
| **Density plot** | Smooth distribution comparison | Probability curve |
| **Boxplot** | Outlier detection, spread comparison | Quartiles, outliers |

### Sensor Quality Metrics

| Metric | Meaning | Good Sensor | Poor Sensor |
|--------|---------|-------------|-------------|
| **Bias** | Systematic offset from reference | Near 0°C | >1°C |
| **SD** | Random measurement variability | <0.5°C | >2°C |
| **RMSE** | Overall error magnitude | <0.5°C | >2°C |
| **Correlation** | Agreement with reference | >0.99 | <0.95 |

## Practice Exercises

Try modifying the code to deepen your understanding:

1. **Calibration Analysis**:
   - Generate calibration data with negative bias (-1.5°C)
   - Calculate the correction factor to fix the sensor
   - Plot "before" and "after" calibration distributions

2. **Distribution Comparison**:
   - Add a fourth sensor with even higher noise (SD = 3.0°C)
   - Create faceted density plots using `facet_wrap(~ sensor_id)`
   - Calculate coefficient of variation (CV = SD/mean) for each sensor

3. **Outlier Detection**:
   - Artificially add 5 outlier readings (±10°C) to one sensor
   - Use boxplot to identify them visually
   - Calculate how many readings fall outside 2 standard deviations

4. **Acceptable Range Visualization**:
   - Define acceptable range: 24-26°C
   - Add vertical lines at these thresholds using `geom_vline()`
   - Shade the acceptable zone with `geom_rect()`
   - Calculate percentage of readings within spec for each sensor

5. **Advanced Calibration**:
   - Try polynomial regression: `geom_smooth(method = "lm", formula = y ~ poly(x, 2))`
   - Compare linear vs. quadratic calibration curves
   - Calculate which model has lower RMSE

6. **Color Palette Exploration**:
   - Try `scale_fill_brewer(palette = "Set2")` for professional colors
   - Use colorblind-friendly palettes from viridis: `scale_fill_viridis_d()`

## Next Chapter Preview

In Chapter 4, we'll explore **scatter plots and correlation analysis**:
- Visualizing relationships between different sensor types (temperature vs. humidity)
- Correlation matrices for sensor networks
- Time-lagged correlations (identifying cause and effect)
- Sensor redundancy validation
- HVAC system performance analysis (temperature, humidity, energy)

These techniques help you understand **multi-variable** IoT systems where sensors interact and influence each other.

---

**Files for this chapter**:
- 📄 `docs/chapter03.md` - This documentation
- 💻 `codes/chapter03.R` - Executable R code with all examples
