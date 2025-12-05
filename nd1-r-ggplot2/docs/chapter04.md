# Chapter 4: Scatter Plots and Sensor Correlation Analysis

## Learning Objectives

By the end of this chapter, you will be able to:
- Create scatter plots to visualize relationships between different sensor types
- Analyze correlations between temperature, humidity, and CO2 sensors
- Add trend lines and confidence intervals to identify sensor dependencies
- Use color aesthetics to incorporate third variables (time, occupancy)
- Create correlation matrices with faceting for multi-sensor comparisons
- Identify sensor redundancy and validate backup sensors
- Analyze HVAC system performance through multi-variable relationships

## Introduction

In real-world IoT systems, sensors rarely operate in isolation. **Environmental variables are interconnected**: temperature affects humidity, occupancy influences CO2 levels, and HVAC systems create feedback loops between multiple measurements. As an IoT developer, understanding these **sensor correlations** is essential for:

- **System validation**: Verify sensors are responding consistently to environmental changes
- **Redundancy checking**: Confirm backup sensors correlate with primary sensors
- **Anomaly detection**: Identify when sensor relationships break down (sensor fault vs. real event)
- **Energy optimization**: Understand how HVAC controls affect multiple environmental parameters
- **Predictive maintenance**: Detect when sensor drift causes correlation degradation
- **System design**: Determine which sensors provide redundant vs. unique information

This chapter introduces **scatter plots** and **correlation analysis** for multi-variable IoT data. Unlike time series (Chapters 1-2) or distributions (Chapter 3), scatter plots reveal **relationships between pairs of sensors**—how changes in one sensor relate to changes in another.

### Key ggplot2 Concepts

Building on previous chapters, we'll introduce:

1. **geom_point()**: Scatter plots for bivariate sensor data
2. **geom_smooth()**: Trend lines showing correlation strength and direction
3. **method = "lm"**: Linear regression for quantifying relationships
4. **se = TRUE/FALSE**: Confidence intervals for trend uncertainty
5. **aes(color = ...)**: Third variable encoding (time, occupancy, zone)
6. **stat_ellipse()**: Correlation boundaries and confidence regions
7. **facet_grid()**: Correlation matrix visualization (multiple sensor pairs)
8. **geom_text()**: Adding correlation coefficients to plots
9. **scale_color_gradient()**: Continuous variable color mapping

## Dataset Description

### Scenario: Smart Building Multi-Sensor HVAC Analysis

You're analyzing a **smart building environmental control system** with synchronized sensors measuring three key variables that interact through HVAC operation:

- **Temperature sensors**: Room temperature (°C)
- **Humidity sensors**: Relative humidity (%)
- **CO2 sensors**: Carbon dioxide concentration (ppm)

These measurements are inherently correlated:
- **Temperature ↔ Humidity**: Negative correlation (warm air holds less relative humidity when absolute humidity constant)
- **CO2 ↔ Occupancy**: Strong positive correlation (people exhale CO2)
- **HVAC Response**: When cooling activates, temperature drops and humidity may change
- **Ventilation Impact**: Fresh air intake reduces CO2 and affects temperature

**Dataset Structure:**
- **timestamp**: Date and time of synchronized readings
- **temperature**: Temperature in °C (18-26°C range)
- **humidity**: Relative humidity percentage (30-70%)
- **co2**: CO2 concentration in ppm (400-1200 ppm)
- **occupancy**: Number of people in zone (0-50)
- **hvac_state**: System state (cooling, heating, ventilating, idle)
- **time_of_day**: Hour of day (0-23) for daily patterns
- **day_type**: Weekday vs. Weekend

**Realistic IoT Characteristics:**

1. **Temperature-Humidity Correlation**:
   - Negative correlation during HVAC cooling (typical r ≈ -0.6 to -0.8)
   - Physics-based relationship (psychrometric chart principles)
   - Scatter pattern shows HVAC operating envelope

2. **CO2-Occupancy Correlation**:
   - Strong positive correlation (typical r ≈ +0.7 to +0.9)
   - CO2 rises ~40-60 ppm per person in steady state
   - Delayed response (ventilation lag time)

3. **Temperature-CO2 Correlation**:
   - Weak indirect correlation through occupancy
   - High occupancy → body heat → higher temperature
   - HVAC response creates complex patterns

**Sample Size**: 500 hourly readings over ~3 weeks capturing diverse conditions

## Examples

### Example 1: Basic Scatter Plot - Temperature vs. Humidity

**Objective**: Visualize the fundamental relationship between temperature and humidity sensors.

**IoT Context**: Verify sensors show expected negative correlation based on HVAC physics.

**What's new**:
- `geom_point()` for bivariate scatter plot
- Two continuous variables on X and Y axes
- Basic relationship visualization

**Code**: See `chapter04.R` - Example 1

**Key Points**:
- Each point represents one synchronized sensor reading
- Negative slope visible: as temperature increases, humidity decreases
- Scatter reveals HVAC operating envelope (not all combinations occur)
- Point density shows typical operating conditions
- Outliers might indicate sensor faults or unusual events
- Quick validation that sensors respond to same environmental changes

---

### Example 2: Add Linear Trend Line with Confidence Interval

**Objective**: Quantify the correlation strength with regression line.

**IoT Context**: Calculate expected humidity change per degree of temperature change.

**What's new**:
- `geom_smooth(method = "lm")` for linear regression
- `se = TRUE` for 95% confidence interval shading
- Statistical quantification of sensor relationship

**Code**: See `chapter04.R` - Example 2

**Key Points**:
- Blue line shows the best-fit linear relationship
- Shaded region shows uncertainty (narrower = more predictable relationship)
- Slope indicates sensitivity: ~2-3% humidity change per 1°C typically
- Strong linear pattern indicates sensors are responding consistently
- Wide confidence intervals suggest other factors at play (HVAC modes)
- Negative slope confirms expected physics-based correlation
- Can calculate correlation coefficient: `cor(temperature, humidity)`

---

### Example 3: Color Points by Third Variable (Time of Day)

**Objective**: Show how sensor relationships vary by time of day (occupancy patterns).

**IoT Context**: Understand if temperature-humidity relationship differs during occupied vs. unoccupied hours.

**What's new**:
- `aes(color = time_of_day)` for third variable encoding
- `scale_color_gradient()` for continuous color mapping
- Temporal patterns in sensor correlations

**Code**: See `chapter04.R` - Example 3

**Key Points**:
- Color gradient shows time progression (dark = night, light = day)
- Night hours (blue) cluster at different temperature-humidity combinations
- Day hours (yellow) spread more due to occupancy variation
- Reveals daily cycle in HVAC operation
- Can identify if correlation strength varies by time
- Useful for detecting time-dependent sensor behavior
- Different colors in different regions indicate HVAC schedule effects

---

### Example 4: CO2 vs. Occupancy with Trend Line

**Objective**: Validate CO2 sensor against occupancy counting.

**IoT Context**: Verify CO2 sensor can be used as proxy for occupancy detection.

**What's new**:
- Different sensor pair (CO2 vs. occupancy count)
- Strong positive correlation expected
- Sensor redundancy validation

**Code**: See `chapter04.R` - Example 4

**Key Points**:
- Strong positive correlation: more people → higher CO2
- Slope shows CO2 increase per person (~40-60 ppm/person typical)
- Can use this relationship to estimate occupancy from CO2 alone
- Scatter around line shows ventilation rate effects
- Zero occupancy baseline shows background CO2 (~400-450 ppm)
- Useful for validating occupancy sensors or using CO2 as backup
- Outliers indicate ventilation changes or sensor issues

---

### Example 5: Faceted Correlation Matrix

**Objective**: Compare multiple sensor pairs simultaneously.

**IoT Context**: Comprehensive view of all pairwise sensor relationships.

**What's new**:
- `facet_grid(sensor1 ~ sensor2)` for correlation matrix layout
- Multiple scatter plots in grid arrangement
- Systematic comparison of all sensor combinations

**Code**: See `chapter04.R` - Example 5

**Key Points**:
- Grid shows all pairwise comparisons (temperature-humidity, temperature-CO2, humidity-CO2)
- Diagonal would show sensor vs. itself (perfect correlation, not plotted)
- Symmetry: temp vs. humidity same as humidity vs. temp (transposed axes)
- Quickly identify which sensor pairs have strongest relationships
- Essential for understanding multi-sensor system behavior
- Helps identify redundant sensors (very high correlation → one may be sufficient)
- Professional format for sensor validation reports

---

### Example 6 (BONUS): Advanced Correlation with Ellipses and Annotations

**Objective**: Publication-quality correlation plot with statistical annotations.

**IoT Context**: Comprehensive sensor relationship analysis for system documentation.

**What's new**:
- `stat_ellipse()` for correlation confidence region
- `geom_text()` or `annotate()` for correlation coefficient
- Combined visualization with multiple layers
- Professional styling for reports

**Code**: See `chapter04.R` - Example 6

**Key Points**:
- Ellipse shows 95% confidence region for the correlation
- Narrow ellipse = strong correlation, circular = weak correlation
- Ellipse angle shows positive vs. negative correlation
- Annotated r value quantifies correlation strength (-1 to +1)
- r close to -1 or +1: strong linear relationship
- r close to 0: weak or no linear relationship
- P-value indicates if correlation is statistically significant
- Professional format suitable for technical documentation
- Can add regression equation: y = mx + b

---

## Summary

In this chapter, you learned to analyze **sensor correlations and relationships**:

1. **Scatter plots**: Visualizing bivariate sensor data with `geom_point()`
2. **Trend lines**: Quantifying relationships with `geom_smooth(method = "lm")`
3. **Confidence intervals**: Showing uncertainty in sensor correlations
4. **Multi-variable encoding**: Using color for third variables (time, occupancy)
5. **Correlation matrices**: Comparing multiple sensor pairs with faceting
6. **Statistical annotations**: Adding correlation coefficients and significance
7. **HVAC analysis**: Understanding system behavior through sensor relationships

### ggplot2 Functions Introduced

| Function | Purpose |
|----------|---------|
| `geom_point()` | Create scatter plots for bivariate data |
| `geom_smooth()` | Add trend lines and smoothing |
| `method = "lm"` | Linear regression for correlation lines |
| `se = TRUE/FALSE` | Show/hide confidence interval shading |
| `stat_ellipse()` | Draw correlation confidence ellipses |
| `scale_color_gradient()` | Color mapping for continuous variables |
| `scale_color_gradient2()` | Diverging color scales |
| `geom_text()` | Add text labels for statistics |
| `annotate()` | Add single annotations (r values, equations) |
| `facet_grid()` | Create correlation matrix layouts |
| `coord_fixed()` | Equal scaling for both axes |

### Correlation Analysis Guidelines

| Correlation (r) | Interpretation | IoT Meaning |
|-----------------|----------------|-------------|
| **r = +0.9 to +1.0** | Very strong positive | Highly redundant sensors, excellent for validation |
| **r = +0.7 to +0.9** | Strong positive | Good correlation, useful for backup/estimation |
| **r = +0.4 to +0.7** | Moderate positive | Related but independent information |
| **r = -0.4 to +0.4** | Weak/No correlation | Independent sensors, unique information |
| **r = -0.7 to -0.4** | Moderate negative | Physics-based inverse relationship |
| **r = -0.9 to -0.7** | Strong negative | Consistent inverse relationship (temp-humidity) |
| **r = -1.0 to -0.9** | Very strong negative | Highly predictable inverse relationship |

### Sensor Relationship Types

| Relationship | Example | Visualization Approach |
|--------------|---------|----------------------|
| **Linear positive** | CO2 vs. occupancy | Scatter + lm trend, r > 0.7 |
| **Linear negative** | Temperature vs. humidity | Scatter + lm trend, r < -0.7 |
| **Non-linear** | Energy vs. temperature (U-shape) | Scatter + loess smoothing |
| **Conditional** | Different by HVAC mode | Facet by mode or color by state |
| **Time-lagged** | Ventilation → CO2 drop | Time-shifted scatter plot |
| **No relationship** | Independent sensors | Random scatter, r ≈ 0 |

## Practice Exercises

Try modifying the code to deepen your understanding:

1. **Calculate Correlation Coefficients**:
   - Use `cor(data$temp, data$humidity)` to calculate r
   - Test significance with `cor.test()`
   - Add r value to plot title or as annotation

2. **Compare HVAC Modes**:
   - Color points by `hvac_state` (cooling, heating, idle)
   - Add separate trend lines per mode with `geom_smooth(aes(color = hvac_state))`
   - Does correlation differ between modes?

3. **Time-Lagged Correlation**:
   - Create lagged CO2 variable: `co2_lag1 = lag(co2, 1)`
   - Plot occupancy vs. lagged CO2 (effect with delay)
   - Compare correlation strength with and without lag

4. **Residual Analysis**:
   - Fit linear model: `model <- lm(humidity ~ temperature)`
   - Calculate residuals: `resid <- residuals(model)`
   - Plot residuals vs. fitted values to check assumptions

5. **Sensor Redundancy Analysis**:
   - If you have two temperature sensors, plot temp1 vs. temp2
   - Calculate correlation (should be r > 0.95 for good sensors)
   - Identify which sensor is drifting if r is lower

6. **Custom Correlation Matrix**:
   - Create all pairwise plots for 4+ sensors
   - Add correlation coefficients in upper triangle
   - Use different colors for positive vs. negative correlations

7. **Interactive Exploration** (if using plotly):
   - Convert ggplot to interactive with `ggplotly()`
   - Hover over points to see timestamp and values
   - Identify specific anomaly events

## Next Chapter Preview

In Chapter 5, we'll explore **faceting and small multiples** for large sensor arrays:
- Visualizing 8-12 sensors simultaneously with `facet_wrap()`
- Hierarchical layouts with `facet_grid(floor ~ zone)`
- Free vs. fixed scales for sensors with different ranges
- Custom facet labels with sensor metadata
- Creating comprehensive monitoring dashboards with multiple panels
- Comparing sensor performance across locations and time periods

These techniques let you scale from analyzing 2-3 sensors (Chapter 4) to monitoring entire sensor networks with dozens of devices.

---

**Files for this chapter**:
- 📄 `docs/chapter04.md` - This documentation
- 💻 `codes/chapter04.R` - Executable R code with all examples
