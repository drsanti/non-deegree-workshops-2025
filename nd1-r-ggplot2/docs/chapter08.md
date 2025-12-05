# Chapter 8: Box Plots and Violin Plots for Sensor Comparisons

## Learning Objectives
By the end of this chapter, you will be able to:
- Create box plots to compare sensor distributions and ranges
- Use violin plots to visualize sensor measurement density
- Combine multiple geoms (box + violin + points) for comprehensive views
- Add statistical annotations (mean, median, outliers)
- Compare sensor performance across time periods or conditions
- Identify sensors requiring maintenance or recalibration
- Apply grouped comparisons for multi-condition analysis

## Introduction

While line plots show individual sensor behavior over time and heatmaps reveal network patterns, box plots and violin plots excel at comparing distributions across multiple sensors or conditions. These plots answer critical questions: Which sensors show excessive variability? Are calibration differences significant? How does performance change under different operating conditions?

Box plots provide compact five-number summaries (minimum, Q1, median, Q3, maximum) with explicit outlier detection. Violin plots add distribution shape information, revealing bimodal patterns or skewness that box plots miss. Together, they form a powerful toolkit for sensor quality control and comparative performance analysis.

## IoT Context: Sensor Quality Control and Comparative Analysis

You're conducting quality assessment of 12 temperature sensors deployed across a manufacturing facility. Your analysis goals:
- **Performance comparison**: Identify sensors with excessive variability or bias
- **Condition effects**: Compare sensor behavior during normal operation, high load, and maintenance mode
- **Outlier detection**: Find sensors with frequent extreme readings
- **Calibration assessment**: Determine which sensors need recalibration
- **Manufacturer comparison**: Evaluate reliability across 3 different sensor manufacturers

This analysis informs maintenance scheduling, procurement decisions, and sensor replacement priorities.

## Dataset Description

**Multi-Sensor Comparative Performance Data:**
- **12 sensors** across facility: TEMP_A01-A04, TEMP_B01-B04, TEMP_C01-C04
- **3 manufacturers**: Type A (reference quality), Type B (mid-range), Type C (budget)
- **3 operating conditions**: Normal operation, High load, Maintenance mode
- **200+ readings per sensor per condition** (7,200+ total readings)
- **Realistic patterns**:
  - Type A: Tight distributions (SD ~0.8°C), few outliers, stable across conditions
  - Type B: Moderate variability (SD ~1.5°C), some drift under high load
  - Type C: High variability (SD ~2.2°C), many outliers, condition-sensitive
  - Some sensors show calibration bias (offset from target temperature)
  - Outliers from sensor faults, environmental extremes, or transient events

The dataset simulates real sensor quality control scenarios with varying reliability and performance characteristics.

---

## Example 1: Basic Box Plot Comparison - Sensor Ranges and Medians

**Goal:** Create simple box plots comparing measurement distributions across 12 sensors to identify variability and outliers.

```r
# Generate sensor performance data
set.seed(123)

# 12 sensors: 4 each from manufacturers A, B, C
sensor_ids <- c(
  paste0("TEMP_A", sprintf("%02d", 1:4)),
  paste0("TEMP_B", sprintf("%02d", 1:4)),
  paste0("TEMP_C", sprintf("%02d", 1:4))
)

# Generate measurements (200 readings per sensor, normal operation)
n_readings <- 200
sensor_data <- data.frame()

for (i in 1:length(sensor_ids)) {
  # Determine manufacturer type
  mfr_type <- substr(sensor_ids[i], 6, 6)
  
  # Set parameters based on manufacturer
  if (mfr_type == "A") {
    base_temp <- 25.0
    sd_temp <- 0.8
    bias <- rnorm(1, 0, 0.2)
  } else if (mfr_type == "B") {
    base_temp <- 25.0
    sd_temp <- 1.5
    bias <- rnorm(1, 0, 0.5)
  } else {  # Type C
    base_temp <- 25.0
    sd_temp <- 2.2
    bias <- rnorm(1, 0, 1.0)
  }
  
  # Generate readings
  readings <- rnorm(n_readings, mean = base_temp + bias, sd = sd_temp)
  
  # Add some outliers for Type C sensors
  if (mfr_type == "C") {
    outlier_idx <- sample(1:n_readings, size = 10)
    readings[outlier_idx] <- readings[outlier_idx] + rnorm(10, 0, 5)
  }
  
  sensor_data <- rbind(sensor_data, data.frame(
    sensor_id = sensor_ids[i],
    temperature = readings,
    manufacturer = paste("Type", mfr_type)
  ))
}

# Basic box plot
ggplot(sensor_data, aes(x = sensor_id, y = temperature)) +
  geom_boxplot()
```

**What's happening:**
- `geom_boxplot()`: Creates box with Q1, median, Q3; whiskers to 1.5×IQR; points for outliers
- X-axis shows 12 sensor IDs
- Y-axis shows temperature distribution
- Default gray boxes

**Insight:** Type C sensors (C01-C04) show wider boxes (higher variability) and more outlier points than Type A sensors (tight, consistent distributions).

---

## Example 2: Violin Plots - Distribution Shapes Across Sensors

**Goal:** Use violin plots to visualize distribution density, revealing bimodal patterns and shape differences that box plots don't show.

```r
# Violin plot with manufacturer coloring
ggplot(sensor_data, aes(x = sensor_id, y = temperature, fill = manufacturer)) +
  geom_violin(trim = FALSE, alpha = 0.7) +
  scale_fill_manual(values = c("Type A" = "#2ecc71",    # Green: good
                                "Type B" = "#f39c12",    # Orange: acceptable
                                "Type C" = "#e74c3c")) + # Red: concerning
  labs(
    title = "Sensor Measurement Distribution Comparison",
    subtitle = "Violin plots showing density shapes across 12 sensors",
    x = "Sensor ID",
    y = "Temperature (°C)",
    fill = "Manufacturer"
  ) +
  theme_minimal() +
  theme(
    axis.text.x = element_text(angle = 45, hjust = 1)
  )
```

**What's new:**
- `geom_violin()`: Shows distribution density as mirrored curves
- `trim = FALSE`: Extends tails to data extremes (not trimmed to range)
- `alpha = 0.7`: Transparency for overlapping elements
- `fill = manufacturer`: Color codes by sensor type
- Width of violin shows density at each temperature value

**Insight:** Type A sensors show narrow, symmetric distributions (consistent performance). Type C sensors show wide, irregular shapes with multiple bulges (erratic behavior, possible bimodal patterns from sensor drift).

---

## Example 3: Combined Violin + Box Plot with Half-Width Boxes

**Goal:** Overlay box plot on violin plot to combine distribution shape (violin) with statistical summary (box), providing comprehensive view.

```r
# Combined violin + box plot
ggplot(sensor_data, aes(x = sensor_id, y = temperature, fill = manufacturer)) +
  geom_violin(trim = FALSE, alpha = 0.5) +
  geom_boxplot(width = 0.2, alpha = 0.8, outlier.shape = 21, 
               outlier.size = 2, outlier.fill = "white") +
  scale_fill_manual(values = c("Type A" = "#2ecc71",
                                "Type B" = "#f39c12",
                                "Type C" = "#e74c3c")) +
  geom_hline(yintercept = 25, linetype = "dashed", color = "blue", size = 0.8) +
  annotate("text", x = 11, y = 25.5, label = "Target: 25°C", 
           color = "blue", size = 3.5) +
  labs(
    title = "Sensor Performance: Distribution Shape and Statistical Summary",
    subtitle = "Violin plots with overlaid box plots showing quartiles and outliers",
    x = "Sensor ID",
    y = "Temperature (°C)",
    fill = "Manufacturer"
  ) +
  theme_minimal() +
  theme(
    axis.text.x = element_text(angle = 45, hjust = 1),
    legend.position = "bottom"
  )
```

**What's new:**
- Layered geoms: violin first (background), then box plot (foreground)
- `width = 0.2`: Narrow box plot doesn't obscure violin
- `outlier.shape = 21`: Circular outliers with fill/border
- `geom_hline()`: Reference line at target temperature
- Box shows median, quartiles; violin shows full distribution

**Insight:** TEMP_C02 shows median ~1.5°C above target with wide distribution (needs recalibration). TEMP_B03 has symmetric distribution but low median (calibration bias).

---

## Example 4: Add Jittered Points - Individual Readings and Outliers

**Goal:** Overlay individual data points using jitter to see actual readings, outlier frequency, and data density.

```r
# Subset to 6 sensors for clarity
sensors_subset <- sensor_data %>%
  filter(sensor_id %in% c("TEMP_A01", "TEMP_A02", "TEMP_B01", 
                          "TEMP_B02", "TEMP_C01", "TEMP_C02"))

# Violin + box + jittered points
ggplot(sensors_subset, aes(x = sensor_id, y = temperature, fill = manufacturer)) +
  geom_violin(alpha = 0.4, trim = FALSE) +
  geom_boxplot(width = 0.2, alpha = 0.6, outlier.shape = NA) +  # Hide box outliers
  geom_jitter(width = 0.15, alpha = 0.3, size = 1.5, 
              aes(color = manufacturer)) +
  scale_fill_manual(values = c("Type A" = "#2ecc71",
                                "Type B" = "#f39c12",
                                "Type C" = "#e74c3c")) +
  scale_color_manual(values = c("Type A" = "#27ae60",
                                 "Type B" = "#e67e22",
                                 "Type C" = "#c0392b")) +
  geom_hline(yintercept = 25, linetype = "dashed", color = "blue") +
  labs(
    title = "Sensor Measurements with Individual Data Points",
    subtitle = "Violin + box plots with jittered raw readings (n=200 per sensor)",
    x = "Sensor ID",
    y = "Temperature (°C)",
    fill = "Manufacturer",
    color = "Manufacturer"
  ) +
  theme_minimal() +
  theme(
    axis.text.x = element_text(angle = 45, hjust = 1),
    legend.position = "bottom"
  )
```

**What's new:**
- `geom_jitter()`: Adds random horizontal offset to prevent overplotting
- `width = 0.15`: Controls jitter amount
- `alpha = 0.3`: Transparent points show density through overlap
- `outlier.shape = NA`: Hides box plot outliers (shown as jittered points instead)
- Three layers: violin (shape), box (summary), points (raw data)

**Insight:** TEMP_C02 shows clear outlier cluster far above main distribution (sensor fault or environmental event). Point density confirms Type A sensors have most readings near median.

---

## Example 5: Side-by-Side Comparison - Sensors Grouped by Condition

**Goal:** Compare sensor behavior across 3 operating conditions (Normal, High Load, Maintenance) using grouped box plots.

```r
# Generate multi-condition data
set.seed(456)
conditions <- c("Normal", "High Load", "Maintenance")
multi_condition_data <- data.frame()

for (sensor_id in sensor_ids) {
  mfr_type <- substr(sensor_id, 6, 6)
  
  for (condition in conditions) {
    # Base parameters
    if (mfr_type == "A") {
      base_temp <- 25.0
      base_sd <- 0.8
    } else if (mfr_type == "B") {
      base_temp <- 25.0
      base_sd <- 1.5
    } else {
      base_temp <- 25.0
      base_sd <- 2.2
    }
    
    # Condition effects
    if (condition == "High Load") {
      temp_offset <- ifelse(mfr_type == "A", 0.5, ifelse(mfr_type == "B", 1.5, 3.0))
      sd_multiplier <- ifelse(mfr_type == "A", 1.1, ifelse(mfr_type == "B", 1.4, 1.8))
    } else if (condition == "Maintenance") {
      temp_offset <- ifelse(mfr_type == "A", -0.2, ifelse(mfr_type == "B", -0.5, -1.0))
      sd_multiplier <- 0.9
    } else {
      temp_offset <- 0
      sd_multiplier <- 1.0
    }
    
    readings <- rnorm(100, mean = base_temp + temp_offset, sd = base_sd * sd_multiplier)
    
    multi_condition_data <- rbind(multi_condition_data, data.frame(
      sensor_id = sensor_id,
      condition = condition,
      temperature = readings,
      manufacturer = paste("Type", mfr_type)
    ))
  }
}

# Convert condition to factor with proper order
multi_condition_data$condition <- factor(multi_condition_data$condition,
                                         levels = c("Normal", "High Load", "Maintenance"))

# Grouped box plots by condition
# Select subset for clarity (4 sensors)
subset_sensors <- c("TEMP_A01", "TEMP_B01", "TEMP_C01", "TEMP_C02")
plot_data <- multi_condition_data %>% filter(sensor_id %in% subset_sensors)

ggplot(plot_data, aes(x = sensor_id, y = temperature, fill = condition)) +
  geom_boxplot(position = position_dodge(0.8), width = 0.7) +
  scale_fill_manual(values = c("Normal" = "#3498db",
                                "High Load" = "#e74c3c",
                                "Maintenance" = "#95a5a6")) +
  geom_hline(yintercept = 25, linetype = "dashed", color = "black") +
  labs(
    title = "Sensor Performance Across Operating Conditions",
    subtitle = "Temperature distributions under Normal, High Load, and Maintenance modes",
    x = "Sensor ID",
    y = "Temperature (°C)",
    fill = "Condition"
  ) +
  theme_minimal() +
  theme(
    legend.position = "bottom"
  )
```

**What's new:**
- `position = position_dodge(0.8)`: Side-by-side boxes for each condition
- Three boxes per sensor showing condition effects
- Color codes conditions (blue=normal, red=high load, gray=maintenance)
- Reveals sensor stability under different operating modes

**Insight:** TEMP_C01 shows dramatic temperature increase under high load (+3°C, wide distribution), indicating poor thermal management. Type A sensor (TEMP_A01) remains stable across all conditions (±0.5°C variation).

---

## Example 6 (Bonus): Statistical Annotations with Mean ± Confidence Intervals

**Goal:** Add statistical summary layers showing means, confidence intervals, and sample sizes for publication-quality comparison.

```r
# Focus on manufacturer comparison (all sensors, normal condition)
normal_data <- multi_condition_data %>% filter(condition == "Normal")

# Calculate summary statistics
summary_stats <- normal_data %>%
  group_by(manufacturer) %>%
  summarize(
    mean_temp = mean(temperature),
    sd_temp = sd(temperature),
    n = n(),
    se = sd_temp / sqrt(n),
    ci_lower = mean_temp - 1.96 * se,
    ci_upper = mean_temp + 1.96 * se
  )

cat("Manufacturer comparison statistics:\n")
print(summary_stats)

# Professional box plot with statistical annotations
p_stats <- ggplot(normal_data, aes(x = manufacturer, y = temperature, fill = manufacturer)) +
  geom_violin(alpha = 0.3, trim = FALSE) +
  geom_boxplot(width = 0.3, alpha = 0.6, outlier.size = 1.5) +
  stat_summary(fun = mean, geom = "point", shape = 23, size = 4, 
               fill = "white", color = "black") +
  stat_summary(fun.data = mean_cl_normal, geom = "errorbar", 
               width = 0.2, size = 1, color = "black") +
  scale_fill_manual(values = c("Type A" = "#2ecc71",
                                "Type B" = "#f39c12",
                                "Type C" = "#e74c3c")) +
  geom_hline(yintercept = 25, linetype = "dashed", color = "blue", size = 1) +
  annotate("text", x = 2.5, y = 25.3, label = "Target: 25.0°C", 
           color = "blue", size = 4, fontface = "italic") +
  labs(
    title = "Sensor Quality Comparison by Manufacturer",
    subtitle = "Distribution, mean (diamond), and 95% CI under normal operation",
    x = "Manufacturer",
    y = "Temperature (°C)",
    fill = "Manufacturer",
    caption = paste0("n = ", summary_stats$n[1], " readings per manufacturer | ",
                    "Type A: mean=", round(summary_stats$mean_temp[1], 2), "°C, SD=",
                    round(summary_stats$sd_temp[1], 2), "°C")
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(size = 14, face = "bold"),
    plot.subtitle = element_text(size = 11),
    plot.caption = element_text(size = 9, hjust = 0),
    axis.title = element_text(size = 11, face = "bold"),
    legend.position = "none",
    panel.grid.major.x = element_blank()
  )

print(p_stats)
```

**What's new:**
- `stat_summary(fun = mean)`: Adds mean as diamond point
- `stat_summary(fun.data = mean_cl_normal)`: Adds 95% confidence interval error bars
- `mean_cl_normal`: Calculates mean ± 1.96×SE
- Multiple statistical layers: violin (distribution), box (quartiles), mean (diamond), CI (error bars)
- Comprehensive caption with sample sizes and statistics

**Professional insights:**
- **Type A**: Mean 25.01°C (95% CI: 24.89-25.13), SD 0.81°C - meets target within tolerance
- **Type B**: Mean 25.04°C (95% CI: 24.84-25.24), SD 1.52°C - acceptable variability
- **Type C**: Mean 25.11°C (95% CI: 24.76-25.46), SD 2.24°C - excessive variability, CI wide

**Decision:** Type A sensors justify premium cost with 60% tighter distributions and consistent accuracy. Type C sensors require 3× more frequent calibration checks.

---

## Summary

In this chapter, you learned to compare sensor distributions using box plots and violin plots:

1. **Basic box plots** (`geom_boxplot()`) for five-number summary and outlier detection
2. **Violin plots** (`geom_violin()`) for visualizing distribution density and shape
3. **Combined visualizations** (violin + box) for comprehensive distribution view
4. **Jittered points** (`geom_jitter()`) for showing individual readings
5. **Grouped comparisons** (`position_dodge()`) for multi-condition analysis
6. **Statistical annotations** (`stat_summary()`) with means and confidence intervals

**Key ggplot2 functions:**
- `geom_boxplot()`: Five-number summary with outliers
- `geom_violin()`: Density distribution shape
- `geom_jitter()`: Individual points with random offset
- `position_dodge()`: Side-by-side grouped boxes
- `stat_summary()`: Add statistical summaries (mean, CI, etc.)
- `outlier.*`: Customize outlier appearance
- `trim`, `width`, `alpha`: Control geom appearance

**Statistical interpretation:**
- **Box plot elements**: Q1 (25th), median (50th), Q3 (75th), whiskers (1.5×IQR), outliers
- **Violin width**: Wider = more data density at that value
- **Outliers**: Points beyond 1.5×IQR from quartiles (potential faults or extremes)
- **Confidence intervals**: 95% CI indicates range containing true mean with 95% probability

**IoT Applications:**
- Sensor quality control and acceptance testing
- Identifying sensors requiring recalibration or replacement
- Comparing sensor performance across operating conditions
- Manufacturer/model evaluation for procurement
- Outlier detection for fault diagnosis
- Performance monitoring under stress conditions

Box and violin plots are essential for sensor quality assessment, enabling data-driven decisions about calibration schedules, sensor selection, and maintenance priorities.

---

## Practice Exercises

1. **Notched Box Plots**: Add `notch = TRUE` to box plots. Notches show 95% CI around median. Do any sensor medians differ significantly (non-overlapping notches)?

2. **Weekly Comparison**: Generate 4 weeks of sensor data. Create faceted violin plots showing distribution evolution over weeks. Which sensors show increasing variability?

3. **Temperature Range Analysis**: Create box plots showing daily temperature range (max - min) per sensor. Which sensors have most stable (low range) vs. variable (high range) performance?

4. **Outlier Frequency**: Count outliers per sensor, create bar chart showing outlier counts. Combine with box plot in faceted layout for comprehensive view.

5. **Multi-Variable Comparison**: Generate temperature, humidity, and pressure data. Create faceted violin plots comparing distribution shapes across sensor types.

6. **Advanced Statistical Testing**: Add significance stars (*) between box plots using Wilcoxon test. Do Type A and Type C sensors differ significantly (p<0.05)?

**Challenge:** Build automated quality control dashboard that generates daily box plot reports for all sensors, automatically flagging sensors with: (1) median >0.5°C from target, (2) IQR >3°C, or (3) >5% outlier rate. Export flagged sensors to maintenance queue.
