# ==============================================================================
# Chapter 3: Sensor Calibration and Distribution Analysis
# R Code for all examples
# ==============================================================================

# Load required libraries
library(ggplot2)

# Set seed for reproducibility
set.seed(42)

# ==============================================================================
# DATA GENERATION - Sensor Calibration Dataset
# ==============================================================================

# Generate calibration data comparing sensor readings against reference standard
# Scenario: New temperature sensor needs calibration against certified reference
# Use case: Quality control, sensor commissioning, periodic recalibration

generate_calibration_data <- function() {
  # Reference standard temperatures (certified thermometer)
  # Calibration points: 20°C to 30°C in 0.5°C increments
  actual_temp <- seq(20, 30, by = 0.5)
  n_points <- length(actual_temp)
  
  # Sensor readings show systematic bias (+2°C offset) plus random error
  # This simulates a common calibration problem
  bias <- 2.0                           # Systematic offset
  measurement_noise <- rnorm(n_points, mean = 0, sd = 0.5)  # Random error
  
  sensor_readings <- actual_temp + bias + measurement_noise
  
  # Create calibration data frame
  calibration_data <- data.frame(
    actual_temp = actual_temp,
    sensor_reading = sensor_readings,
    sensor_id = "TEMP_UNCAL_001",
    reference_id = "REF_STANDARD_A"
  )
  
  return(calibration_data)
}

# Generate calibration data
calib_data <- generate_calibration_data()

# Display calibration data summary
cat("=== Sensor Calibration Data Generated ===\n")
head(calib_data, 10)
cat("\n")
cat("Reference temperatures:", min(calib_data$actual_temp), "to", 
    max(calib_data$actual_temp), "°C\n")
cat("Mean bias:", round(mean(calib_data$sensor_reading - calib_data$actual_temp), 2), "°C\n")
cat("Calibration points:", nrow(calib_data), "\n\n")


# ==============================================================================
# EXAMPLE 1: Basic Sensor Calibration Plot
# ==============================================================================
# Objective: Visualize sensor accuracy against reference standard
# New concepts: Scatter plot with regression line
# IoT Context: Identify systematic bias in sensor readings

example1 <- ggplot(calib_data, aes(x = actual_temp, y = sensor_reading)) +
  geom_point(size = 3, color = "#3498DB", alpha = 0.7) +
  geom_smooth(method = "lm", se = FALSE, color = "#E74C3C", linewidth = 1.2) +
  labs(
    title = "Sensor Calibration Analysis",
    subtitle = "Comparing sensor readings against reference standard",
    x = "Actual Temperature (°C) - Reference Standard",
    y = "Sensor Reading (°C)"
  ) +
  theme_minimal()

print(example1)

# Calculate calibration equation
calib_model <- lm(sensor_reading ~ actual_temp, data = calib_data)
cat("=== Calibration Model ===\n")
print(summary(calib_model))
cat("\nCalibration equation: Sensor = ", 
    round(coef(calib_model)[1], 3), " + ", 
    round(coef(calib_model)[2], 3), " × Actual\n\n")

# ==============================================================================
# DATA GENERATION - Multi-Sensor Distribution Data
# ==============================================================================

# Generate data from multiple sensors for distribution comparison
# Scenario: Three sensors monitoring the same environment
# Goal: Identify calibration differences and measurement variability

generate_multisensor_distribution_data <- function() {
  n_readings <- 200  # 200 readings per sensor
  
  # Sensor A: Well-calibrated, low noise (reference sensor)
  sensor_a <- data.frame(
    temperature = rnorm(n_readings, mean = 25, sd = 0.8),
    sensor_id = "TEMP_A_001",
    quality = "High precision"
  )
  
  # Sensor B: Slight positive bias, moderate noise
  sensor_b <- data.frame(
    temperature = rnorm(n_readings, mean = 27, sd = 1.5),
    sensor_id = "TEMP_B_002",
    quality = "Needs calibration"
  )
  
  # Sensor C: Negative bias, higher noise (aging sensor)
  sensor_c <- data.frame(
    temperature = rnorm(n_readings, mean = 23, sd = 2.0),
    sensor_id = "TEMP_C_003",
    quality = "Degraded"
  )
  
  # Combine all sensors
  all_sensors <- rbind(sensor_a, sensor_b, sensor_c)
  
  # Set factor levels for consistent ordering
  all_sensors$sensor_id <- factor(
    all_sensors$sensor_id,
    levels = c("TEMP_A_001", "TEMP_B_002", "TEMP_C_003")
  )
  
  return(all_sensors)
}

# Generate distribution data
dist_data <- generate_multisensor_distribution_data()

# Display distribution statistics
cat("=== Multi-Sensor Distribution Data ===\n")
cat("Total readings:", nrow(dist_data), "\n")
cat("Sensors:", length(unique(dist_data$sensor_id)), "\n\n")

cat("Temperature statistics by sensor:\n")
aggregate(temperature ~ sensor_id, data = dist_data, 
          FUN = function(x) c(mean = round(mean(x), 2), 
                              sd = round(sd(x), 2),
                              min = round(min(x), 2),
                              max = round(max(x), 2)))


# ==============================================================================
# EXAMPLE 2: Single Sensor Histogram
# ==============================================================================
# Objective: Visualize measurement distribution for one sensor
# New concepts: geom_histogram(), binwidth control
# IoT Context: Understand sensor noise and measurement variability

# Filter data for Sensor A only
sensor_a_data <- subset(dist_data, sensor_id == "TEMP_A_001")

example2 <- ggplot(sensor_a_data, aes(x = temperature)) +
  geom_histogram(binwidth = 0.5, fill = "#3498DB", color = "white", alpha = 0.8) +
  labs(
    title = "Sensor Measurement Distribution",
    subtitle = "TEMP_A_001 - Reference Sensor (200 readings)",
    x = "Temperature (°C)",
    y = "Frequency"
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(size = 14, face = "bold"),
    plot.subtitle = element_text(size = 10, color = "gray40")
  )

print(example2)


# ==============================================================================
# EXAMPLE 3: Density Plot with Statistics
# ==============================================================================
# Objective: Smooth distribution visualization with mean line
# New concepts: geom_density(), geom_vline() for reference lines
# IoT Context: Identify central tendency and spread of sensor readings

mean_temp <- mean(sensor_a_data$temperature)
sd_temp <- sd(sensor_a_data$temperature)

example3 <- ggplot(sensor_a_data, aes(x = temperature)) +
  geom_density(fill = "#2ECC71", alpha = 0.6, color = "#27AE60", linewidth = 1.2) +
  geom_vline(aes(xintercept = mean_temp), 
             color = "#E74C3C", linetype = "dashed", linewidth = 1.2) +
  annotate("text", x = mean_temp + 1, y = 0.4, 
           label = paste("Mean =", round(mean_temp, 2), "°C"),
           color = "#E74C3C", size = 4, hjust = 0) +
  annotate("text", x = mean_temp + 1, y = 0.35, 
           label = paste("SD =", round(sd_temp, 2), "°C"),
           color = "#E74C3C", size = 4, hjust = 0) +
  labs(
    title = "Sensor Reading Distribution with Statistics",
    subtitle = "Density plot showing measurement variability",
    x = "Temperature (°C)",
    y = "Density"
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(size = 14, face = "bold"),
    plot.subtitle = element_text(size = 10, color = "gray40")
  )

print(example3)


# ==============================================================================
# EXAMPLE 4: Multi-Sensor Distribution Comparison
# ==============================================================================
# Objective: Compare distributions across multiple sensors
# New concepts: Overlapping density plots, transparency, custom colors
# IoT Context: Identify calibration differences and sensor drift

example4 <- ggplot(dist_data, aes(x = temperature, fill = sensor_id, color = sensor_id)) +
  geom_density(alpha = 0.4, linewidth = 1.1) +
  scale_fill_manual(
    values = c(
      "TEMP_A_001" = "#2ECC71",  # Green - good sensor
      "TEMP_B_002" = "#F39C12",  # Orange - needs attention
      "TEMP_C_003" = "#E74C3C"   # Red - problematic
    ),
    labels = c(
      "TEMP_A_001" = "Sensor A (Reference)",
      "TEMP_B_002" = "Sensor B (Bias +2°C)",
      "TEMP_C_003" = "Sensor C (High noise)"
    )
  ) +
  scale_color_manual(
    values = c(
      "TEMP_A_001" = "#27AE60",
      "TEMP_B_002" = "#E67E22",
      "TEMP_C_003" = "#C0392B"
    ),
    labels = c(
      "TEMP_A_001" = "Sensor A (Reference)",
      "TEMP_B_002" = "Sensor B (Bias +2°C)",
      "TEMP_C_003" = "Sensor C (High noise)"
    )
  ) +
  labs(
    title = "Multi-Sensor Distribution Comparison",
    subtitle = "Identifying calibration differences across sensor array",
    x = "Temperature (°C)",
    y = "Density",
    fill = "Sensor",
    color = "Sensor"
  ) +
  theme_minimal() +
  theme(
    legend.position = "top",
    legend.title = element_text(face = "bold"),
    plot.title = element_text(size = 14, face = "bold"),
    plot.subtitle = element_text(size = 10, color = "gray40")
  )

print(example4)


# ==============================================================================
# EXAMPLE 5: Boxplot for Outlier Detection
# ==============================================================================
# Objective: Identify outliers and compare sensor spreads
# New concepts: geom_boxplot(), coord_flip()
# IoT Context: Quality control, anomaly detection

example5 <- ggplot(dist_data, aes(x = sensor_id, y = temperature, fill = sensor_id)) +
  geom_boxplot(alpha = 0.7, outlier.color = "#E74C3C", outlier.size = 3) +
  scale_fill_manual(
    values = c(
      "TEMP_A_001" = "#2ECC71",
      "TEMP_B_002" = "#F39C12",
      "TEMP_C_003" = "#E74C3C"
    )
  ) +
  labs(
    title = "Sensor Outlier Detection and Spread Analysis",
    subtitle = "Boxplots showing median, quartiles, and outliers",
    x = "Sensor ID",
    y = "Temperature (°C)"
  ) +
  theme_minimal() +
  theme(
    legend.position = "none",
    plot.title = element_text(size = 14, face = "bold"),
    plot.subtitle = element_text(size = 10, color = "gray40"),
    axis.text.x = element_text(angle = 0, hjust = 0.5)
  )

print(example5)


# ==============================================================================
# EXAMPLE 6 (BONUS): Combined Calibration Dashboard
# ==============================================================================
# Objective: Create comprehensive calibration visualization
# New concepts: Combining calibration plot with distribution
# IoT Context: Complete sensor quality assessment

# Enhanced calibration plot with confidence interval
example6_calib <- ggplot(calib_data, aes(x = actual_temp, y = sensor_reading)) +
  geom_point(size = 3, color = "#3498DB", alpha = 0.7) +
  geom_smooth(method = "lm", se = TRUE, color = "#E74C3C", 
              fill = "#E74C3C", alpha = 0.2, linewidth = 1.2) +
  geom_abline(intercept = 0, slope = 1, linetype = "dashed", 
              color = "gray40", linewidth = 1) +
  annotate("text", x = 22, y = 30, label = "Ideal (y = x)", 
           color = "gray40", size = 3.5) +
  annotate("text", x = 22, y = 29, label = "Actual fit", 
           color = "#E74C3C", size = 3.5) +
  labs(
    title = "Sensor Calibration Analysis - Complete Assessment",
    subtitle = paste("Sensor:", unique(calib_data$sensor_id), 
                     "| Reference:", unique(calib_data$reference_id)),
    x = "Reference Temperature (°C)",
    y = "Sensor Reading (°C)"
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(size = 14, face = "bold"),
    plot.subtitle = element_text(size = 10, color = "gray40")
  )

print(example6_calib)

# Calculate and display calibration metrics
cat("\n=== Calibration Assessment Summary ===\n")
cat("Sensor ID:", unique(calib_data$sensor_id), "\n")
cat("Mean absolute error:", round(mean(abs(calib_data$sensor_reading - calib_data$actual_temp)), 3), "°C\n")
cat("Root mean square error:", 
    round(sqrt(mean((calib_data$sensor_reading - calib_data$actual_temp)^2)), 3), "°C\n")
cat("Correlation:", round(cor(calib_data$actual_temp, calib_data$sensor_reading), 4), "\n")



# ==============================================================================
# SUMMARY AND KEY TAKEAWAYS
# ==============================================================================

cat("\n=== Chapter 3 Summary ===\n")
cat("Topics covered:\n")
cat("1. Sensor calibration against reference standards\n")
cat("2. Distribution analysis with histograms and density plots\n")
cat("3. Multi-sensor comparison for identifying calibration issues\n")
cat("4. Outlier detection using boxplots\n")
cat("5. Statistical assessment of sensor quality\n\n")

cat("ggplot2 functions introduced:\n")
cat("- geom_histogram(): Frequency distribution visualization\n")
cat("- geom_density(): Smooth distribution curves\n")
cat("- geom_boxplot(): Outlier detection and spread visualization\n")
cat("- geom_smooth(): Regression lines for calibration\n")
cat("- geom_vline(): Reference lines for thresholds\n")
cat("- geom_abline(): Ideal calibration line (y = x)\n\n")

# ==============================================================================
# PRACTICE EXERCISES
# ==============================================================================

cat("=== Practice Exercises ===\n")
cat("Try these modifications to deepen your understanding:\n\n")

cat("1. CALIBRATION ANALYSIS:\n")
cat("   - Generate calibration data with a different bias (e.g., -1.5°C)\n")
cat("   - Calculate the correction factor needed to fix the sensor\n")
cat("   - Plot 'before' and 'after' calibration distributions\n\n")

cat("2. DISTRIBUTION COMPARISON:\n")
cat("   - Add a fourth sensor with even higher noise (sd = 3.0)\n")
cat("   - Create faceted density plots (one panel per sensor)\n")
cat("   - Calculate and display CV (coefficient of variation) for each sensor\n\n")

cat("3. OUTLIER DETECTION:\n")
cat("   - Artificially add 5 outlier readings to one sensor\n")
cat("   - Use boxplot to identify them\n")
cat("   - Calculate how many readings fall outside 2 standard deviations\n\n")

cat("4. ACCEPTABLE RANGE VISUALIZATION:\n")
cat("   - Define acceptable range: 24-26°C\n")
cat("   - Add vertical lines (geom_vline) at these thresholds\n")
cat("   - Shade the acceptable zone using geom_rect()\n")
cat("   - Calculate percentage of readings within spec for each sensor\n\n")

cat("5. ADVANCED CALIBRATION:\n")
cat("   - Try polynomial regression: method = 'lm', formula = y ~ poly(x, 2)\n")
cat("   - Compare linear vs quadratic calibration curves\n")
cat("   - Calculate which model has lower RMSE\n\n")

# ==============================================================================
# NEXT CHAPTER PREVIEW
# ==============================================================================

cat("=== Coming in Chapter 4 ===\n")
cat("We'll explore scatter plots and correlation analysis:\n")
cat("- Visualizing relationships between sensor types (temp vs humidity)\n")
cat("- Correlation matrices for sensor networks\n")
cat("- Time-lagged correlations (cause and effect)\n")
cat("- Sensor redundancy validation\n")
cat("- HVAC system performance analysis\n\n")

cat("Files for this chapter:\n")
cat("- docs/chapter03.md: Documentation and explanations\n")
cat("- codes/chapter03.R: This executable code file\n\n")