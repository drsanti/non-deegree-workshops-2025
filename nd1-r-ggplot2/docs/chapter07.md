# Chapter 7: Heatmaps and Correlation Matrices for Sensor Networks

## Learning Objectives
By the end of this chapter, you will be able to:
- Create heatmaps for sensor correlation matrices
- Visualize sensor-to-sensor relationships across large arrays
- Use color gradients effectively for correlation strength
- Create time-based heatmaps showing sensor readings over time
- Identify sensor clusters and redundancy patterns
- Visualize missing data and data quality patterns
- Apply perceptually uniform color scales for accurate interpretation

## Introduction

As IoT sensor networks grow in size and complexity, understanding relationships between sensors becomes critical for system optimization. Which sensors are redundant? Which zones show similar patterns? Where are data quality issues concentrated? Heatmaps provide powerful 2D visualizations for these questions, using color intensity to represent values in matrices.

This chapter focuses on three key heatmap applications in sensor networks: correlation matrices (sensor-to-sensor relationships), time-sensor heatmaps (temporal patterns across arrays), and data quality visualization (identifying problem areas). These techniques are essential for large-scale sensor network analysis and optimization.

## IoT Context: Sensor Network Analysis

You're analyzing a building-wide sensor network with 15 environmental sensors (temperature, humidity, pressure, CO2) distributed across multiple floors and zones. Your analysis goals:
- **Correlation analysis**: Identify which sensors are redundant or show similar behavior
- **Temporal patterns**: Visualize 30 days of readings across all sensors simultaneously
- **Data quality assessment**: Identify sensors and time periods with missing or invalid data
- **Clustering**: Group sensors by behavior patterns for optimization
- **Redundancy planning**: Determine which sensors provide unique vs. duplicate information

Understanding these patterns helps optimize sensor placement, reduce redundancy, and improve maintenance planning.

## Dataset Description

**Large Sensor Network Data:**
- **15 sensors** across building: 8 temperature, 3 humidity, 2 pressure, 2 CO2
- **Sensor IDs**: TEMP_001-008, HUM_001-003, PRES_001-002, CO2_001-002
- **Locations**: 3 floors × 5 zones (offices, server rooms, common areas, labs, warehouses)
- **30 days** of hourly data (720 time points per sensor)
- **Correlation matrix**: 15 × 15 showing pairwise sensor relationships
- **Realistic patterns**:
  - Same-zone sensors: high correlation (0.7-0.9)
  - Same-type different-zone: moderate correlation (0.4-0.7)
  - Different-type sensors: low to negative correlation (-0.3 to 0.3)
  - Data quality issues: random missing data, sensor outages, connectivity problems

The dataset simulates a real operational sensor network with physical relationships, environmental effects, and operational challenges.

---

## Example 1: Basic Correlation Matrix Heatmap

**Goal:** Create a simple heatmap showing pairwise correlations between all 15 sensors to identify redundancy patterns.

```r
# Generate sensor correlation matrix
set.seed(123)

# Define 15 sensors
sensor_names <- c(
  paste0("TEMP_", sprintf("%03d", 1:8)),
  paste0("HUM_", sprintf("%03d", 1:3)),
  paste0("PRES_", sprintf("%03d", 1:2)),
  paste0("CO2_", sprintf("%03d", 1:2))
)

# Create realistic correlation matrix
# Same-zone sensors have high correlation, different zones moderate
n_sensors <- length(sensor_names)
cor_matrix <- matrix(0.2, nrow = n_sensors, ncol = n_sensors)
diag(cor_matrix) <- 1.0

# Zone clusters (high correlation within zones)
# Zone 1: TEMP_001-002, HUM_001
cor_matrix[1:2, 1:2] <- 0.85
cor_matrix[1:2, 9] <- 0.75
cor_matrix[9, 1:2] <- 0.75

# Zone 2: TEMP_003-004, HUM_002
cor_matrix[3:4, 3:4] <- 0.88
cor_matrix[3:4, 10] <- 0.78
cor_matrix[10, 3:4] <- 0.78

# Zone 3: TEMP_005-006, CO2_001
cor_matrix[5:6, 5:6] <- 0.82
cor_matrix[5:6, 14] <- 0.65
cor_matrix[14, 5:6] <- 0.65

# Add some realistic variations
cor_matrix <- cor_matrix + matrix(rnorm(n_sensors^2, 0, 0.05), n_sensors, n_sensors)
cor_matrix <- (cor_matrix + t(cor_matrix)) / 2  # Make symmetric
diag(cor_matrix) <- 1.0
cor_matrix[cor_matrix > 1] <- 1.0
cor_matrix[cor_matrix < -1] <- -1.0

# Convert to data frame for ggplot
library(tidyr)
cor_df <- as.data.frame(cor_matrix)
colnames(cor_df) <- sensor_names
cor_df$sensor1 <- sensor_names

cor_long <- cor_df %>%
  pivot_longer(cols = -sensor1, names_to = "sensor2", values_to = "correlation")

# Basic heatmap
ggplot(cor_long, aes(x = sensor1, y = sensor2, fill = correlation)) +
  geom_tile() +
  theme_minimal()
```

**What's happening:**
- `geom_tile()`: Creates rectangular cells for each correlation value
- Matrix converted to long format for ggplot (sensor1, sensor2, correlation)
- Default blue gradient shows correlation strength
- Diagonal shows 1.0 (perfect self-correlation)

**Insight:** High correlation clusters visible along diagonal indicate sensor groups in same zones.

---

## Example 2: Diverging Color Scale for Correlation Strength

**Goal:** Apply a diverging color scale to clearly distinguish positive, negative, and zero correlations.

```r
# Enhanced correlation matrix with better color scale
ggplot(cor_long, aes(x = sensor1, y = sensor2, fill = correlation)) +
  geom_tile(color = "white", size = 0.5) +
  scale_fill_gradient2(
    low = "#3498db",      # Blue for negative
    mid = "white",        # White for zero
    high = "#e74c3c",     # Red for positive
    midpoint = 0,
    limits = c(-1, 1),
    name = "Correlation"
  ) +
  coord_fixed() +
  labs(
    title = "Sensor Network Correlation Matrix",
    subtitle = "15 environmental sensors across building",
    x = "Sensor ID",
    y = "Sensor ID"
  ) +
  theme_minimal() +
  theme(
    axis.text.x = element_text(angle = 45, hjust = 1, size = 9),
    axis.text.y = element_text(size = 9),
    panel.grid = element_blank()
  )
```

**What's new:**
- `scale_fill_gradient2()`: Diverging color scale with midpoint
- `color = "white"`: White borders between cells for clarity
- `coord_fixed()`: Square tiles (aspect ratio 1:1)
- Rotated x-axis labels for readability
- Removed grid lines (cleaner heatmap)

**Insight:** Red clusters show highly correlated sensors (same-zone), white shows independence, blue would show negative correlation (e.g., heating vs. cooling).

---

## Example 3: Add Correlation Coefficient Text Overlays

**Goal:** Display actual correlation values as text on heatmap for precise interpretation.

```r
# Add text labels showing correlation values
ggplot(cor_long, aes(x = sensor1, y = sensor2, fill = correlation)) +
  geom_tile(color = "white", size = 0.5) +
  geom_text(aes(label = sprintf("%.2f", correlation)), 
            size = 2.5, color = "black") +
  scale_fill_gradient2(
    low = "#3498db",
    mid = "white",
    high = "#e74c3c",
    midpoint = 0,
    limits = c(-1, 1),
    name = "Correlation"
  ) +
  coord_fixed() +
  labs(
    title = "Sensor Network Correlation Matrix with Values",
    subtitle = "Numerical correlation coefficients overlaid",
    x = "Sensor ID",
    y = "Sensor ID"
  ) +
  theme_minimal() +
  theme(
    axis.text.x = element_text(angle = 45, hjust = 1, size = 8),
    axis.text.y = element_text(size = 8),
    panel.grid = element_blank(),
    legend.position = "right"
  )
```

**What's new:**
- `geom_text()`: Overlays correlation values on each cell
- `sprintf("%.2f", correlation)`: Formats to 2 decimal places
- Smaller text size (2.5) to fit in cells
- Black text for visibility on light backgrounds

**Insight:** Values 0.85-0.90 in TEMP_001-002 cluster confirm high redundancy; values 0.20-0.30 show weak cross-zone relationships.

---

## Example 4: Time-Sensor Heatmap - 30 Days of Readings

**Goal:** Visualize 30 days of sensor readings across all 15 sensors simultaneously to identify temporal patterns and anomalies.

```r
# Generate time-sensor heatmap data
set.seed(456)
n_hours <- 24 * 30  # 30 days hourly
timestamps <- seq(from = as.POSIXct("2024-01-01 00:00:00"),
                  by = "hour",
                  length.out = n_hours)

# Generate realistic sensor readings with patterns
sensor_data_matrix <- matrix(NA, nrow = n_hours, ncol = n_sensors)

for (i in 1:n_sensors) {
  # Base temperature with daily cycles
  base_temp <- 20 + 3 * sin(2 * pi * (1:n_hours) / 24)
  
  # Weekly pattern (weekends warmer)
  weekly <- 2 * sin(2 * pi * (1:n_hours) / (24 * 7))
  
  # Sensor-specific offset
  offset <- (i - 8) * 0.5
  
  # Random noise
  noise <- rnorm(n_hours, 0, 1)
  
  # Combine patterns
  sensor_data_matrix[, i] <- base_temp + weekly + offset + noise
  
  # Simulate sensor issues
  if (i == 5) {
    # TEMP_005: gradual drift after day 15
    sensor_data_matrix[360:n_hours, i] <- sensor_data_matrix[360:n_hours, i] + 
      seq(0, 5, length.out = n_hours - 359)
  }
  if (i == 12) {
    # PRES_001: outage on days 10-12
    sensor_data_matrix[216:288, i] <- NA
  }
}

# Convert to long format
time_sensor_df <- data.frame(
  timestamp = rep(timestamps, times = n_sensors),
  sensor = rep(sensor_names, each = n_hours),
  reading = as.vector(sensor_data_matrix)
)

# Create date for x-axis grouping
time_sensor_df$date <- as.Date(time_sensor_df$timestamp)

# Time-sensor heatmap
ggplot(time_sensor_df, aes(x = date, y = sensor, fill = reading)) +
  geom_tile() +
  scale_fill_viridis_c(option = "plasma", name = "Reading (°C)") +
  labs(
    title = "30-Day Sensor Network Heatmap",
    subtitle = "Hourly readings across 15 sensors (aggregated by day)",
    x = "Date",
    y = "Sensor ID"
  ) +
  theme_minimal() +
  theme(
    axis.text.y = element_text(size = 9),
    panel.grid = element_blank()
  )
```

**What's new:**
- `scale_fill_viridis_c()`: Perceptually uniform color scale (plasma palette)
- Time on x-axis, sensors on y-axis, readings as color
- Long format data (timestamp, sensor, reading)
- Aggregated hourly to daily for visualization

**Insight:** TEMP_005 shows warming trend after day 15 (drift), PRES_001 shows gap days 10-12 (outage), daily cycles visible as vertical banding.

---

## Example 5: Data Quality Heatmap - Missing and Invalid Readings

**Goal:** Visualize data quality patterns showing where missing, valid, and invalid readings occur across sensors and time.

```r
# Generate data quality heatmap
set.seed(789)

# Create quality status for each reading
time_sensor_df$quality <- "Valid"

# Simulate missing data patterns
# Random missing
random_missing <- sample(1:nrow(time_sensor_df), size = 500)
time_sensor_df$quality[random_missing] <- "Missing"

# Sensor-specific issues
# PRES_001 (sensor 12): connectivity outage days 10-12
pres_001_idx <- which(time_sensor_df$sensor == "PRES_001" & 
                      time_sensor_df$date >= as.Date("2024-01-10") &
                      time_sensor_df$date <= as.Date("2024-01-12"))
time_sensor_df$quality[pres_001_idx] <- "Missing"

# CO2_002 (sensor 15): calibration issues (out of range) days 20-25
co2_002_idx <- which(time_sensor_df$sensor == "CO2_002" &
                     time_sensor_df$date >= as.Date("2024-01-20") &
                     time_sensor_df$date <= as.Date("2024-01-25"))
time_sensor_df$quality[co2_002_idx] <- "Out-of-Range"

# HUM_003 (sensor 11): intermittent connectivity entire period
hum_003_idx <- which(time_sensor_df$sensor == "HUM_003")
hum_003_missing <- sample(hum_003_idx, size = length(hum_003_idx) * 0.3)
time_sensor_df$quality[hum_003_missing] <- "Missing"

# Convert to factor with proper order
time_sensor_df$quality <- factor(time_sensor_df$quality,
                                 levels = c("Valid", "Out-of-Range", "Missing"))

# Data quality heatmap
ggplot(time_sensor_df, aes(x = date, y = sensor, fill = quality)) +
  geom_tile(color = "gray90", size = 0.1) +
  scale_fill_manual(
    values = c("Valid" = "#2ecc71",           # Green
               "Out-of-Range" = "#f39c12",    # Orange
               "Missing" = "#e74c3c"),        # Red
    name = "Data Quality"
  ) +
  labs(
    title = "Sensor Network Data Quality Assessment",
    subtitle = "30-day data quality status across 15 sensors",
    x = "Date",
    y = "Sensor ID"
  ) +
  theme_minimal() +
  theme(
    axis.text.y = element_text(size = 9),
    panel.grid = element_blank(),
    legend.position = "bottom"
  )
```

**What's new:**
- Categorical heatmap (quality status, not continuous values)
- `scale_fill_manual()`: Custom colors for quality categories
- Green/orange/red traffic light scheme
- Thin gray borders between days

**Insight:** HUM_003 shows scattered missing data (connectivity issues), PRES_001 complete outage mid-month, CO2_002 calibration problems late month. Overall 85%+ valid data (mostly green).

---

## Example 6 (Bonus): Hierarchically Clustered Correlation Matrix

**Goal:** Apply hierarchical clustering to reorder sensors by similarity, revealing natural sensor groupings and redundancy patterns.

```r
# Perform hierarchical clustering on correlation matrix
sensor_dist <- as.dist(1 - cor_matrix)  # Convert correlation to distance
sensor_hclust <- hclust(sensor_dist, method = "ward.D2")
sensor_order <- sensor_names[sensor_hclust$order]

# Reorder correlation data by clustering
cor_long$sensor1 <- factor(cor_long$sensor1, levels = sensor_order)
cor_long$sensor2 <- factor(cor_long$sensor2, levels = sensor_order)

# Clustered correlation heatmap
p_clustered <- ggplot(cor_long, aes(x = sensor1, y = sensor2, fill = correlation)) +
  geom_tile(color = "white", size = 0.5) +
  scale_fill_gradient2(
    low = "#3498db",
    mid = "white",
    high = "#e74c3c",
    midpoint = 0,
    limits = c(-1, 1),
    name = "Correlation"
  ) +
  coord_fixed() +
  labs(
    title = "Hierarchically Clustered Sensor Correlation Matrix",
    subtitle = "Sensors reordered by similarity (Ward's method)",
    x = "Sensor ID",
    y = "Sensor ID"
  ) +
  theme_minimal() +
  theme(
    axis.text.x = element_text(angle = 45, hjust = 1, size = 9),
    axis.text.y = element_text(size = 9),
    panel.grid = element_blank()
  )

# Add cluster boundary boxes
# Identify 3 major clusters from dendrogram
cluster_groups <- cutree(sensor_hclust, k = 3)
cluster_df <- data.frame(
  sensor = sensor_names,
  cluster = cluster_groups
)

# Add cluster annotations
p_clustered <- p_clustered +
  annotate("rect", xmin = 0.5, xmax = 5.5, ymin = 0.5, ymax = 5.5,
           fill = NA, color = "black", size = 1.5, linetype = "dashed") +
  annotate("rect", xmin = 5.5, xmax = 10.5, ymin = 5.5, ymax = 10.5,
           fill = NA, color = "black", size = 1.5, linetype = "dashed") +
  annotate("rect", xmin = 10.5, xmax = 15.5, ymin = 10.5, ymax = 15.5,
           fill = NA, color = "black", size = 1.5, linetype = "dashed") +
  annotate("text", x = 3, y = 16, label = "Cluster 1", 
           fontface = "bold", size = 4) +
  annotate("text", x = 8, y = 16, label = "Cluster 2", 
           fontface = "bold", size = 4) +
  annotate("text", x = 13, y = 16, label = "Cluster 3", 
           fontface = "bold", size = 4)

print(p_clustered)
```

**What's new:**
- `hclust()`: Hierarchical clustering based on correlation distance
- `as.dist(1 - cor_matrix)`: Convert correlation to distance metric
- Factor reordering by cluster result
- `annotate("rect")`: Add cluster boundary boxes
- Ward's method for clustering (minimizes within-cluster variance)

**Advanced insights:**
- Cluster 1: Same-zone temperature sensors (high redundancy)
- Cluster 2: Humidity and pressure sensors (environmental grouping)
- Cluster 3: CO2 and cross-zone temperature (occupancy-related)
- Blocks along diagonal show within-cluster high correlation
- Off-diagonal blocks show between-cluster relationships

**Practical application:** Cluster 1 sensors could be reduced from 5 to 2 without information loss (85%+ correlation = redundancy).

---

## Summary

In this chapter, you learned to create heatmaps for sensor network analysis:

1. **Basic correlation heatmap** (`geom_tile()`) for sensor relationships
2. **Diverging color scales** (`scale_fill_gradient2()`) for correlation strength
3. **Text overlays** (`geom_text()`) for precise correlation values
4. **Time-sensor heatmaps** with perceptually uniform colors (`scale_fill_viridis_c()`)
5. **Data quality visualization** using categorical color schemes
6. **Hierarchical clustering** for revealing natural sensor groupings

**Key ggplot2 functions:**
- `geom_tile()` / `geom_raster()`: Create heatmap cells
- `scale_fill_gradient2()`: Diverging color scale (negative/zero/positive)
- `scale_fill_viridis_c()`: Perceptually uniform continuous colors
- `scale_fill_manual()`: Custom categorical colors
- `coord_fixed()`: Square aspect ratio for matrices
- `pivot_longer()`: Convert matrices to long format for ggplot

**Color scale selection:**
- **Correlation matrices**: Diverging (blue-white-red) for -1 to +1
- **Temperature/readings**: Sequential or viridis (plasma, viridis, inferno)
- **Data quality**: Categorical (green/orange/red traffic lights)
- **Avoid**: Rainbow/jet scales (perceptually non-uniform)

**IoT Applications:**
- Identifying redundant sensors for cost optimization
- Detecting sensor clusters and zone relationships
- Visualizing temporal patterns across large sensor arrays
- Monitoring data quality and connectivity issues
- Planning sensor network expansion or reduction

Heatmaps are essential for understanding complex relationships in large sensor networks, enabling data-driven decisions about sensor placement, redundancy, and maintenance priorities.

---

## Practice Exercises

1. **Correlation Threshold**: Modify the correlation matrix heatmap to only show correlations above 0.7 (mask low correlations as gray). How many sensor pairs show high correlation?

2. **Hourly Patterns**: Create a 24-hour × 7-day heatmap showing average sensor readings by hour of day and day of week. Identify when HVAC systems are most active.

3. **Missing Data Analysis**: Generate a summary heatmap showing percentage of missing data per sensor per week. Which sensor-week combinations need attention?

4. **Multi-Variable Heatmap**: Create a faceted heatmap comparing correlation matrices for temperature, humidity, and pressure sensors separately.

5. **Anomaly Detection**: Build a heatmap highlighting time periods where readings deviate >2 standard deviations from sensor mean (red for high, blue for low).

6. **Advanced Clustering**: Apply k-means clustering (k=4) to sensors based on temporal patterns, then visualize cluster membership as a heatmap with time on x-axis and sensors grouped by cluster on y-axis.

**Challenge:** Create an interactive dashboard combining three heatmaps: (1) real-time correlation matrix, (2) 7-day rolling time-sensor readings, (3) data quality status. Update automatically as new data arrives.
