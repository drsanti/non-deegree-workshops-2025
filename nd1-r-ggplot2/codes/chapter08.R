# ==============================================================================
# Chapter 8: Box Plots and Violin Plots for Sensor Comparisons
# R Code for all examples
# ==============================================================================

# Load required libraries
library(ggplot2)
library(dplyr)

# Set seed for reproducibility
set.seed(123)

# ==============================================================================
# DATA GENERATION
# ==============================================================================

# Define 12 sensors: 4 each from manufacturers A, B, C
sensor_ids <- c(
  paste0("TEMP_A", sprintf("%02d", 1:4)),
  paste0("TEMP_B", sprintf("%02d", 1:4)),
  paste0("TEMP_C", sprintf("%02d", 1:4))
)

cat("Generating sensor performance data...\n")
cat("12 sensors:", paste(sensor_ids, collapse=", "), "\n")

# ------------------------------------------------------------------------------
# Dataset 1: Basic Sensor Measurements (Normal Operation)
# ------------------------------------------------------------------------------
n_readings <- 200
sensor_data <- data.frame()

for (i in 1:length(sensor_ids)) {
  # Determine manufacturer type
  mfr_type <- substr(sensor_ids[i], 6, 6)
  
  # Set parameters based on manufacturer quality
  if (mfr_type == "A") {
    # Type A: Reference quality
    base_temp <- 25.0
    sd_temp <- 0.8
    bias <- rnorm(1, 0, 0.2)
  } else if (mfr_type == "B") {
    # Type B: Mid-range quality
    base_temp <- 25.0
    sd_temp <- 1.5
    bias <- rnorm(1, 0, 0.5)
  } else {
    # Type C: Budget quality
    base_temp <- 25.0
    sd_temp <- 2.2
    bias <- rnorm(1, 0, 1.0)
  }
  
  # Generate measurements
  readings <- rnorm(n_readings, mean = base_temp + bias, sd = sd_temp)
  
  # Add outliers for Type C sensors (lower quality control)
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

cat("Generated", nrow(sensor_data), "normal operation readings\n")

# ------------------------------------------------------------------------------
# Dataset 2: Multi-Condition Data
# ------------------------------------------------------------------------------
cat("Generating multi-condition data...\n")

set.seed(456)
conditions <- c("Normal", "High Load", "Maintenance")
multi_condition_data <- data.frame()

for (sensor_id in sensor_ids) {
  mfr_type <- substr(sensor_id, 6, 6)
  
  for (condition in conditions) {
    # Base parameters by manufacturer
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
    
    # Condition-specific effects
    if (condition == "High Load") {
      # High load increases temperature and variability
      # Type A handles load well, Type C struggles
      temp_offset <- ifelse(mfr_type == "A", 0.5, 
                           ifelse(mfr_type == "B", 1.5, 3.0))
      sd_multiplier <- ifelse(mfr_type == "A", 1.1, 
                             ifelse(mfr_type == "B", 1.4, 1.8))
    } else if (condition == "Maintenance") {
      # Maintenance mode: reduced load, cooler, more stable
      temp_offset <- ifelse(mfr_type == "A", -0.2, 
                           ifelse(mfr_type == "B", -0.5, -1.0))
      sd_multiplier <- 0.9
    } else {  # Normal
      temp_offset <- 0
      sd_multiplier <- 1.0
    }
    
    # Generate readings (100 per condition)
    readings <- rnorm(100, mean = base_temp + temp_offset, 
                     sd = base_sd * sd_multiplier)
    
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

cat("Generated", nrow(multi_condition_data), "multi-condition readings\n")


# ==============================================================================
# EXAMPLE 1: Basic Box Plot Comparison
# ==============================================================================
cat("\n=== Example 1: Basic Box Plot ===\n")

p1 <- ggplot(sensor_data, aes(x = sensor_id, y = temperature)) +
  geom_boxplot()

print(p1)

# Save plot
ggsave("chapter08_example1_basic_boxplot.png", p1, width = 10, height = 6, dpi = 300)
cat("Plot saved: chapter08_example1_basic_boxplot.png\n")


# ==============================================================================
# EXAMPLE 2: Violin Plots - Distribution Shapes
# ==============================================================================
cat("\n=== Example 2: Violin Plots ===\n")

p2 <- ggplot(sensor_data, aes(x = sensor_id, y = temperature, fill = manufacturer)) +
  geom_violin(trim = FALSE, alpha = 0.7) +
  scale_fill_manual(values = c("Type A" = "#2ecc71",
                                "Type B" = "#f39c12",
                                "Type C" = "#e74c3c")) +
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

print(p2)

# Save plot
ggsave("chapter08_example2_violin.png", p2, width = 10, height = 6, dpi = 300)
cat("Plot saved: chapter08_example2_violin.png\n")


# ==============================================================================
# EXAMPLE 3: Combined Violin + Box Plot
# ==============================================================================
cat("\n=== Example 3: Combined Violin + Box ===\n")

p3 <- ggplot(sensor_data, aes(x = sensor_id, y = temperature, fill = manufacturer)) +
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

print(p3)

# Save plot
ggsave("chapter08_example3_violin_box.png", p3, width = 12, height = 7, dpi = 300)
cat("Plot saved: chapter08_example3_violin_box.png\n")


# ==============================================================================
# EXAMPLE 4: Add Jittered Points
# ==============================================================================
cat("\n=== Example 4: Jittered Points ===\n")

# Subset to 6 sensors for clarity
sensors_subset <- sensor_data %>%
  filter(sensor_id %in% c("TEMP_A01", "TEMP_A02", "TEMP_B01", 
                          "TEMP_B02", "TEMP_C01", "TEMP_C02"))

p4 <- ggplot(sensors_subset, aes(x = sensor_id, y = temperature, fill = manufacturer)) +
  geom_violin(alpha = 0.4, trim = FALSE) +
  geom_boxplot(width = 0.2, alpha = 0.6, outlier.shape = NA) +
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

print(p4)

# Save plot
ggsave("chapter08_example4_jitter.png", p4, width = 10, height = 7, dpi = 300)
cat("Plot saved: chapter08_example4_jitter.png\n")


# ==============================================================================
# EXAMPLE 5: Side-by-Side Comparison by Condition
# ==============================================================================
cat("\n=== Example 5: Grouped by Condition ===\n")

# Select subset of sensors for clarity
subset_sensors <- c("TEMP_A01", "TEMP_B01", "TEMP_C01", "TEMP_C02")
plot_data <- multi_condition_data %>% filter(sensor_id %in% subset_sensors)

p5 <- ggplot(plot_data, aes(x = sensor_id, y = temperature, fill = condition)) +
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

print(p5)

# Save plot
ggsave("chapter08_example5_conditions.png", p5, width = 10, height = 6, dpi = 300)
cat("Plot saved: chapter08_example5_conditions.png\n")


# ==============================================================================
# EXAMPLE 6 (BONUS): Statistical Annotations
# ==============================================================================
cat("\n=== Example 6: Statistical Annotations ===\n")

# Focus on manufacturer comparison (normal condition only)
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
    ci_upper = mean_temp + 1.96 * se,
    .groups = "drop"
  )

cat("\nManufacturer comparison statistics:\n")
print(summary_stats)

# Professional box plot with statistical annotations
p6 <- ggplot(normal_data, aes(x = manufacturer, y = temperature, fill = manufacturer)) +
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
    caption = paste0("Each manufacturer: n = 400 readings (4 sensors × 100 readings) | ",
                    "Diamond = mean, Error bars = 95% CI")
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

print(p6)

# Save plot
ggsave("chapter08_example6_statistics.png", p6, width = 10, height = 7, dpi = 300)
cat("Plot saved: chapter08_example6_statistics.png\n")


# ==============================================================================
# SUMMARY STATISTICS
# ==============================================================================
cat("\n=== Chapter 8 Summary Statistics ===\n")

cat("\nBasic sensor data summary:\n")
sensor_summary <- sensor_data %>%
  group_by(manufacturer) %>%
  summarize(
    sensors = n_distinct(sensor_id),
    readings = n(),
    mean_temp = mean(temperature),
    sd_temp = sd(temperature),
    min_temp = min(temperature),
    max_temp = max(temperature),
    .groups = "drop"
  )
print(sensor_summary)

cat("\nOutlier counts by manufacturer:\n")
# Calculate outliers (>1.5*IQR from quartiles)
outlier_counts <- sensor_data %>%
  group_by(manufacturer, sensor_id) %>%
  summarize(
    q1 = quantile(temperature, 0.25),
    q3 = quantile(temperature, 0.75),
    iqr = q3 - q1,
    outliers = sum(temperature < (q1 - 1.5*iqr) | temperature > (q3 + 1.5*iqr)),
    total = n(),
    outlier_pct = outliers / total * 100,
    .groups = "drop"
  )

outlier_summary <- outlier_counts %>%
  group_by(manufacturer) %>%
  summarize(
    total_outliers = sum(outliers),
    mean_outlier_pct = mean(outlier_pct),
    .groups = "drop"
  )
print(outlier_summary)

cat("\nCondition effects summary:\n")
condition_summary <- multi_condition_data %>%
  group_by(manufacturer, condition) %>%
  summarize(
    mean_temp = mean(temperature),
    sd_temp = sd(temperature),
    .groups = "drop"
  )
print(condition_summary)

cat("\nType C sensors under high load (concerning performance):\n")
type_c_highload <- multi_condition_data %>%
  filter(manufacturer == "Type C", condition == "High Load") %>%
  group_by(sensor_id) %>%
  summarize(
    mean_temp = mean(temperature),
    sd_temp = sd(temperature),
    temp_increase = mean_temp - 25.0,
    .groups = "drop"
  )
print(type_c_highload)

cat("\n=== All examples completed successfully ===\n")
