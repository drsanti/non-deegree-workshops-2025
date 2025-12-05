# ==============================================================================
# Chapter 7: Heatmaps and Correlation Matrices for Sensor Networks
# R Code for all examples
# ==============================================================================

# Load required libraries
library(ggplot2)
library(tidyr)
library(dplyr)

# Set seed for reproducibility
set.seed(123)

# ==============================================================================
# DATA GENERATION
# ==============================================================================

# Define 15 sensors across building
sensor_names <- c(
  paste0("TEMP_", sprintf("%03d", 1:8)),
  paste0("HUM_", sprintf("%03d", 1:3)),
  paste0("PRES_", sprintf("%03d", 1:2)),
  paste0("CO2_", sprintf("%03d", 1:2))
)

n_sensors <- length(sensor_names)

# ------------------------------------------------------------------------------
# Dataset 1: Sensor Correlation Matrix
# ------------------------------------------------------------------------------
cat("Generating sensor correlation matrix...\n")

# Create realistic correlation matrix
# Same-zone sensors have high correlation, different zones moderate
cor_matrix <- matrix(0.2, nrow = n_sensors, ncol = n_sensors)
diag(cor_matrix) <- 1.0

# Zone 1 cluster: TEMP_001-002, HUM_001 (high correlation)
cor_matrix[1:2, 1:2] <- 0.85
cor_matrix[1:2, 9] <- 0.75
cor_matrix[9, 1:2] <- 0.75
cor_matrix[1, 2] <- 0.88
cor_matrix[2, 1] <- 0.88

# Zone 2 cluster: TEMP_003-004, HUM_002
cor_matrix[3:4, 3:4] <- 0.86
cor_matrix[3:4, 10] <- 0.78
cor_matrix[10, 3:4] <- 0.78
cor_matrix[3, 4] <- 0.90
cor_matrix[4, 3] <- 0.90

# Zone 3 cluster: TEMP_005-006, CO2_001
cor_matrix[5:6, 5:6] <- 0.82
cor_matrix[5:6, 14] <- 0.65
cor_matrix[14, 5:6] <- 0.65
cor_matrix[5, 6] <- 0.84
cor_matrix[6, 5] <- 0.84

# Additional moderate correlations
cor_matrix[7:8, 7:8] <- 0.70
cor_matrix[7, 8] <- 0.75
cor_matrix[8, 7] <- 0.75

# Add realistic noise
noise_matrix <- matrix(rnorm(n_sensors^2, 0, 0.05), n_sensors, n_sensors)
cor_matrix <- cor_matrix + noise_matrix
cor_matrix <- (cor_matrix + t(cor_matrix)) / 2  # Ensure symmetric
diag(cor_matrix) <- 1.0

# Constrain to valid correlation range
cor_matrix[cor_matrix > 1] <- 1.0
cor_matrix[cor_matrix < -1] <- -1.0

# Convert to long format for ggplot
cor_df <- as.data.frame(cor_matrix)
colnames(cor_df) <- sensor_names
cor_df$sensor1 <- sensor_names

cor_long <- cor_df %>%
  pivot_longer(cols = -sensor1, names_to = "sensor2", values_to = "correlation")

cat("Correlation matrix generated:", nrow(cor_long), "sensor pairs\n")

# ------------------------------------------------------------------------------
# Dataset 2: Time-Sensor Heatmap Data (30 days hourly)
# ------------------------------------------------------------------------------
cat("Generating 30-day time-sensor data...\n")

n_hours <- 24 * 30  # 30 days hourly
timestamps <- seq(from = as.POSIXct("2024-01-01 00:00:00"),
                  by = "hour",
                  length.out = n_hours)

# Generate realistic sensor readings with patterns
sensor_data_matrix <- matrix(NA, nrow = n_hours, ncol = n_sensors)

for (i in 1:n_sensors) {
  # Base temperature with daily cycles
  base_temp <- 20 + 3 * sin(2 * pi * (1:n_hours) / 24)
  
  # Weekly pattern (weekends slightly warmer)
  weekly <- 2 * sin(2 * pi * (1:n_hours) / (24 * 7))
  
  # Sensor-specific offset (different zones have different baselines)
  offset <- (i - 8) * 0.5
  
  # Random measurement noise
  noise <- rnorm(n_hours, 0, 1)
  
  # Combine all patterns
  sensor_data_matrix[, i] <- base_temp + weekly + offset + noise
  
  # Simulate sensor-specific issues
  if (i == 5) {
    # TEMP_005: gradual drift after day 15
    sensor_data_matrix[360:n_hours, i] <- sensor_data_matrix[360:n_hours, i] + 
      seq(0, 5, length.out = n_hours - 359)
  }
  
  if (i == 12) {
    # PRES_001: complete outage on days 10-12
    sensor_data_matrix[216:288, i] <- NA
  }
  
  if (i == 11) {
    # HUM_003: high noise/variability
    sensor_data_matrix[, i] <- sensor_data_matrix[, i] + rnorm(n_hours, 0, 2)
  }
}

# Convert to long format
time_sensor_df <- data.frame(
  timestamp = rep(timestamps, times = n_sensors),
  sensor = rep(sensor_names, each = n_hours),
  reading = as.vector(sensor_data_matrix)
)

# Add date for aggregation
time_sensor_df$date <- as.Date(time_sensor_df$timestamp)

cat("Time-sensor data generated:", nrow(time_sensor_df), "readings\n")

# ------------------------------------------------------------------------------
# Dataset 3: Data Quality Status
# ------------------------------------------------------------------------------
cat("Generating data quality status...\n")

# Start with all Valid
time_sensor_df$quality <- "Valid"

# Simulate missing data patterns
# Random missing (network glitches)
random_missing <- sample(1:nrow(time_sensor_df), size = 500)
time_sensor_df$quality[random_missing] <- "Missing"

# PRES_001: connectivity outage days 10-12
pres_001_idx <- which(time_sensor_df$sensor == "PRES_001" & 
                      time_sensor_df$date >= as.Date("2024-01-10") &
                      time_sensor_df$date <= as.Date("2024-01-12"))
time_sensor_df$quality[pres_001_idx] <- "Missing"

# CO2_002: calibration issues (out of range) days 20-25
co2_002_idx <- which(time_sensor_df$sensor == "CO2_002" &
                     time_sensor_df$date >= as.Date("2024-01-20") &
                     time_sensor_df$date <= as.Date("2024-01-25"))
time_sensor_df$quality[co2_002_idx] <- "Out-of-Range"

# HUM_003: intermittent connectivity throughout period
hum_003_idx <- which(time_sensor_df$sensor == "HUM_003")
hum_003_missing <- sample(hum_003_idx, size = round(length(hum_003_idx) * 0.3))
time_sensor_df$quality[hum_003_missing] <- "Missing"

# Convert to factor with proper order
time_sensor_df$quality <- factor(time_sensor_df$quality,
                                 levels = c("Valid", "Out-of-Range", "Missing"))

# Calculate quality statistics
quality_summary <- time_sensor_df %>%
  group_by(quality) %>%
  summarize(count = n(), percentage = n() / nrow(time_sensor_df) * 100)

cat("Data quality summary:\n")
print(quality_summary)


# ==============================================================================
# EXAMPLE 1: Basic Correlation Matrix Heatmap
# ==============================================================================
cat("\n=== Example 1: Basic Correlation Matrix ===\n")

p1 <- ggplot(cor_long, aes(x = sensor1, y = sensor2, fill = correlation)) +
  geom_tile() +
  theme_minimal()

print(p1)

# Save plot
ggsave("chapter07_example1_basic_heatmap.png", p1, width = 10, height = 8, dpi = 300)
cat("Plot saved: chapter07_example1_basic_heatmap.png\n")


# ==============================================================================
# EXAMPLE 2: Diverging Color Scale for Correlation Strength
# ==============================================================================
cat("\n=== Example 2: Diverging Color Scale ===\n")

p2 <- ggplot(cor_long, aes(x = sensor1, y = sensor2, fill = correlation)) +
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

print(p2)

# Save plot
ggsave("chapter07_example2_diverging_scale.png", p2, width = 10, height = 9, dpi = 300)
cat("Plot saved: chapter07_example2_diverging_scale.png\n")


# ==============================================================================
# EXAMPLE 3: Add Correlation Coefficient Text Overlays
# ==============================================================================
cat("\n=== Example 3: Text Overlays ===\n")

p3 <- ggplot(cor_long, aes(x = sensor1, y = sensor2, fill = correlation)) +
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

print(p3)

# Save plot
ggsave("chapter07_example3_text_overlay.png", p3, width = 11, height = 9, dpi = 300)
cat("Plot saved: chapter07_example3_text_overlay.png\n")


# ==============================================================================
# EXAMPLE 4: Time-Sensor Heatmap - 30 Days of Readings
# ==============================================================================
cat("\n=== Example 4: Time-Sensor Heatmap ===\n")

p4 <- ggplot(time_sensor_df, aes(x = date, y = sensor, fill = reading)) +
  geom_tile() +
  scale_fill_viridis_c(option = "plasma", name = "Reading (°C)") +
  labs(
    title = "30-Day Sensor Network Heatmap",
    subtitle = "Hourly readings across 15 sensors",
    x = "Date",
    y = "Sensor ID"
  ) +
  theme_minimal() +
  theme(
    axis.text.y = element_text(size = 9),
    panel.grid = element_blank()
  )

print(p4)

# Save plot
ggsave("chapter07_example4_time_sensor.png", p4, width = 12, height = 8, dpi = 300)
cat("Plot saved: chapter07_example4_time_sensor.png\n")


# ==============================================================================
# EXAMPLE 5: Data Quality Heatmap
# ==============================================================================
cat("\n=== Example 5: Data Quality Heatmap ===\n")

p5 <- ggplot(time_sensor_df, aes(x = date, y = sensor, fill = quality)) +
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

print(p5)

# Save plot
ggsave("chapter07_example5_data_quality.png", p5, width = 12, height = 8, dpi = 300)
cat("Plot saved: chapter07_example5_data_quality.png\n")


# ==============================================================================
# EXAMPLE 6 (BONUS): Hierarchically Clustered Correlation Matrix
# ==============================================================================
cat("\n=== Example 6: Hierarchical Clustering ===\n")

# Perform hierarchical clustering
sensor_dist <- as.dist(1 - cor_matrix)  # Convert correlation to distance
sensor_hclust <- hclust(sensor_dist, method = "ward.D2")
sensor_order <- sensor_names[sensor_hclust$order]

# Reorder correlation data by clustering
cor_long_clustered <- cor_long
cor_long_clustered$sensor1 <- factor(cor_long_clustered$sensor1, levels = sensor_order)
cor_long_clustered$sensor2 <- factor(cor_long_clustered$sensor2, levels = sensor_order)

# Identify cluster groups
cluster_groups <- cutree(sensor_hclust, k = 3)

cat("Cluster assignments:\n")
cluster_df <- data.frame(
  sensor = sensor_names,
  cluster = cluster_groups
)
print(cluster_df[order(cluster_df$cluster), ])

# Clustered correlation heatmap
p6 <- ggplot(cor_long_clustered, aes(x = sensor1, y = sensor2, fill = correlation)) +
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
    subtitle = "Sensors reordered by similarity (Ward's method, k=3 clusters)",
    x = "Sensor ID",
    y = "Sensor ID"
  ) +
  theme_minimal() +
  theme(
    axis.text.x = element_text(angle = 45, hjust = 1, size = 9),
    axis.text.y = element_text(size = 9),
    panel.grid = element_blank()
  )

print(p6)

# Save plot
ggsave("chapter07_example6_clustered.png", p6, width = 11, height = 9, dpi = 300)
cat("Plot saved: chapter07_example6_clustered.png\n")


# ==============================================================================
# SUMMARY STATISTICS
# ==============================================================================
cat("\n=== Chapter 7 Summary Statistics ===\n")

cat("\nCorrelation Matrix Statistics:\n")
cat("Mean correlation (off-diagonal):", 
    mean(cor_matrix[lower.tri(cor_matrix)]), "\n")
cat("High correlation pairs (>0.7):", 
    sum(cor_matrix[lower.tri(cor_matrix)] > 0.7), "out of", 
    sum(lower.tri(cor_matrix)), "\n")

cat("\nTime-Sensor Data Summary:\n")
cat("Total readings:", nrow(time_sensor_df), "\n")
cat("Date range:", min(time_sensor_df$date), "to", max(time_sensor_df$date), "\n")
cat("Sensors:", n_sensors, "\n")

cat("\nData Quality Summary:\n")
print(quality_summary)

cat("\nSensor-Specific Quality Issues:\n")
sensor_quality <- time_sensor_df %>%
  group_by(sensor, quality) %>%
  summarize(count = n(), .groups = "drop") %>%
  group_by(sensor) %>%
  mutate(percentage = count / sum(count) * 100) %>%
  filter(quality != "Valid") %>%
  arrange(desc(percentage))

print(head(sensor_quality, 10))

cat("\nCluster Sizes:\n")
print(table(cluster_groups))

cat("\n=== All examples completed successfully ===\n")
