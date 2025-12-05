# ==============================================================================
# Chapter 1: Introduction to IoT Sensor Data Visualization
# R Code for all examples
# ==============================================================================

# Load required libraries
library(ggplot2)

# Set seed for reproducibility
set.seed(42)

# ==============================================================================
# DATA GENERATION - IoT Temperature Sensor
# ==============================================================================

# Generate synthetic IoT sensor data from a warehouse temperature monitor
# Scenario: Industrial facility with temperature monitoring
# Sensor ID: TEMP_WAREHOUSE_001
# Sampling rate: Every hour for 30 days (720 readings)

generate_sensor_data <- function() {
  # 30 days * 24 hours = 720 readings
  hours <- 720
  hour_sequence <- 1:hours
  
  # Create timestamp sequence starting from December 1, 2024
  timestamps <- seq(
    from = as.POSIXct("2024-12-01 00:00:00", tz = "UTC"),
    by = "hour",
    length.out = hours
  )
  
  # Extract day of week and hour of day for patterns
  day_of_week <- as.numeric(format(timestamps, "%u"))  # 1=Monday, 7=Sunday
  hour_of_day <- as.numeric(format(timestamps, "%H"))  # 0-23
  
  # Base temperature: 20°C (typical warehouse)
  base_temp <- 20
  
  # Daily cycle: +/- 3°C (HVAC load during work hours 8 AM - 6 PM)
  daily_cycle <- 3 * sin(2 * pi * (hour_of_day - 6) / 24)
  
  # Weekly pattern: cooler on weekends (less activity)
  weekend_effect <- ifelse(day_of_week >= 6, -2, 0)
  
  # Seasonal drift: slight warming trend over 30 days (+0.005°C/hour)
  drift <- 0.005 * hour_sequence
  
  # Sensor noise: ±0.5°C (typical measurement uncertainty)
  noise <- rnorm(hours, mean = 0, sd = 0.5)
  
  # Combine all components
  temperature <- base_temp + daily_cycle + weekend_effect + drift + noise
  
  # Create IoT data frame with sensor metadata
  data.frame(
    timestamp = timestamps,
    hour = hour_sequence,
    temperature = temperature,
    sensor_id = "TEMP_WAREHOUSE_001",
    location = "Warehouse Zone A",
    stringsAsFactors = FALSE
  )
}

# Generate the IoT sensor data
sensor_data <- generate_sensor_data()

# Quick look at the data
head(sensor_data, 10)
cat("\n=== Sensor Data Summary ===\n")
summary(sensor_data$temperature)
cat("\nSensor ID:", unique(sensor_data$sensor_id), "\n")
cat("Location:", unique(sensor_data$location), "\n")
cat("Duration:", nrow(sensor_data), "hours (", nrow(sensor_data)/24, "days)\n")
cat("Temperature range:", round(min(sensor_data$temperature), 1), "to", 
    round(max(sensor_data$temperature), 1), "°C\n")

# ==============================================================================
# EXAMPLE 1: Minimal Sensor Data Line Plot
# ==============================================================================
# Objective: Create the simplest possible sensor data visualization
# New concepts: ggplot(), aes(), geom_line()
# IoT Context: Quick check that sensor is operational and collecting data

example1 <- ggplot(sensor_data, aes(x = hour, y = temperature)) +
  geom_line()

# Display the plot
print(example1)

# Save the plot (optional)
# ggsave("figures/chapter01_example1.png", example1, width = 10, height = 5, dpi = 300)


# ==============================================================================
# EXAMPLE 2: Dashboard-Ready Plot with Sensor Metadata
# ==============================================================================
# Objective: Add essential labels and metadata for IoT monitoring dashboards
# New concepts: labs(), theme_minimal()
# IoT Context: Include sensor ID and location for multi-sensor systems

example2 <- ggplot(sensor_data, aes(x = hour, y = temperature)) +
  geom_line() +
  labs(
    title = paste("Temperature Sensor:", unique(sensor_data$sensor_id)),
    subtitle = paste("Location:", unique(sensor_data$location), "| 30-day monitoring period"),
    x = "Time (hours from start)",
    y = "Temperature (°C)",
    caption = "Data: Hourly readings from industrial temperature sensor"
  ) +
  theme_minimal()

print(example2)

# Save the plot (optional)
# ggsave("figures/chapter01_example2.png", example2, width = 10, height = 5, dpi = 300)


# ==============================================================================
# EXAMPLE 3: Customize Line Appearance for Sensor Visualization
# ==============================================================================
# Objective: Control visual appearance appropriate for IoT dashboards
# New concepts: color, size/linewidth, linetype parameters in geom_line()
# IoT Context: Use color coding consistent with monitoring systems (blue for normal)

example3 <- ggplot(sensor_data, aes(x = hour, y = temperature)) +
  geom_line(color = "#3498DB",      # Professional blue for sensor data
            linewidth = 1.0,         # Medium line thickness
            linetype = "solid") +    # Solid line for continuous sensor readings
  labs(
    title = paste("Sensor", unique(sensor_data$sensor_id), "- Temperature Monitoring"),
    subtitle = "Customized visual appearance for dashboard display",
    x = "Time (hours)",
    y = "Temperature (°C)"
  ) +
  theme_minimal()

print(example3)

# Try different line styles for different sensor states:
# "solid" (normal), "dashed" (warning), "dotted" (degraded)", "dotdash" (maintenance)


# ==============================================================================
# EXAMPLE 4: Dashboard-Style Grid and Background
# ==============================================================================
# Objective: Create professional monitoring dashboard appearance
# New concepts: theme(), panel.grid, panel.background, element_line(), element_rect()
# IoT Context: Clean, readable grid for real-time monitoring displays

example4 <- ggplot(sensor_data, aes(x = hour, y = temperature)) +
  geom_line(color = "#2ECC71",      # Green for normal operating status
            linewidth = 1.1) +
  labs(
    title = "IoT Temperature Sensor - Live Monitoring Dashboard",
    subtitle = paste(unique(sensor_data$sensor_id), "|", unique(sensor_data$location)),
    x = "Time (hours)",
    y = "Temperature (°C)"
  ) +
  theme_minimal() +
  theme(
    # Major grid lines for easy value reading
    panel.grid.major = element_line(color = "gray75", linewidth = 0.5),
    
    # Minor grid lines for precision
    panel.grid.minor = element_line(color = "gray90", linewidth = 0.25),
    
    # Clean white plot area (monitoring screen style)
    panel.background = element_rect(fill = "white", color = NA),
    
    # Subtle background (matches typical dashboard designs)
    plot.background = element_rect(fill = "#F8F9FA", color = NA)
  )

print(example4)


# ==============================================================================
# EXAMPLE 5: Publication-Ready IoT Sensor Visualization
# ==============================================================================
# Objective: Create professional, polished plot for reports or presentations
# New concepts: Comprehensive theme() customization, element_text()
# IoT Context: Report-quality visualization with complete sensor metadata

example5 <- ggplot(sensor_data, aes(x = hour, y = temperature)) +
  geom_line(color = "#E67E22",      # Orange - good for print and screens
            linewidth = 1.2) +
  labs(
    title = "Industrial Temperature Monitoring System",
    subtitle = paste("Sensor:", unique(sensor_data$sensor_id), "| Location:", unique(sensor_data$location)),
    x = "Monitoring Duration (hours)",
    y = "Temperature (°C)",
    caption = "Data source: Industrial IoT sensor network | Sampling rate: 1 hour | Period: 30 days"
  ) +
  theme_minimal() +
  theme(
    # Professional title styling
    plot.title = element_text(size = 16, face = "bold", color = "gray20"),
    
    # Sensor metadata subtitle
    plot.subtitle = element_text(size = 11, color = "gray40", margin = margin(b = 10)),
    
    # Technical details caption
    plot.caption = element_text(size = 8, color = "gray50", hjust = 0, margin = margin(t = 10)),
    
    # Bold axis titles for clarity
    axis.title.x = element_text(size = 12, face = "bold", color = "gray30", margin = margin(t = 10)),
    axis.title.y = element_text(size = 12, face = "bold", color = "gray30", margin = margin(r = 10)),
    
    # Readable axis labels
    axis.text.x = element_text(size = 10, color = "gray40"),
    axis.text.y = element_text(size = 10, color = "gray40"),
    
    # Professional grid
    panel.grid.major = element_line(color = "gray80", linewidth = 0.5),
    panel.grid.minor = element_line(color = "gray90", linewidth = 0.25),
    
    # Clean backgrounds
    panel.background = element_rect(fill = "white", color = NA),
    plot.background = element_rect(fill = "#FAFAFA", color = NA),
    
    # Generous margins for professional appearance
    plot.margin = margin(20, 20, 20, 20)
  )

print(example5)


# ==============================================================================
# EXAMPLE 6 (BONUS): IoT Alert Thresholds and Operating Zones
# ==============================================================================
# Objective: Add operational thresholds and alert zones for sensor monitoring
# New concepts: geom_hline(), geom_rect(), annotate() for IoT thresholds
# IoT Context: Visual indicators for acceptable operating ranges and alerts

# Define operational thresholds (typical for warehouse/server room)
temp_optimal_min <- 18
temp_optimal_max <- 22
temp_warning_max <- 25
temp_critical_max <- 27

# Calculate statistics
mean_temp <- mean(sensor_data$temperature)

# Find temperature excursions
max_temp_idx <- which.max(sensor_data$temperature)
max_temp_hour <- sensor_data$hour[max_temp_idx]
max_temp_value <- sensor_data$temperature[max_temp_idx]

example6 <- ggplot(sensor_data, aes(x = hour, y = temperature)) +
  # Alert zones (draw first so they're behind the data line)
  # Optimal operating range (green zone)
  annotate("rect", 
           xmin = 0, xmax = max(sensor_data$hour),
           ymin = temp_optimal_min, ymax = temp_optimal_max,
           fill = "#2ECC71", alpha = 0.1) +
  
  # Warning zone (yellow)
  annotate("rect",
           xmin = 0, xmax = max(sensor_data$hour),
           ymin = temp_warning_max, ymax = temp_critical_max,
           fill = "#F39C12", alpha = 0.15) +
  
  # Critical zone (red)
  annotate("rect",
           xmin = 0, xmax = max(sensor_data$hour),
           ymin = temp_critical_max, ymax = 30,
           fill = "#E74C3C", alpha = 0.15) +
  
  # Main sensor data line
  geom_line(color = "#3498DB", linewidth = 1.2) +
  
  # Threshold lines
  geom_hline(yintercept = temp_optimal_max, 
             linetype = "solid", 
             color = "#27AE60", 
             linewidth = 0.8) +
  
  geom_hline(yintercept = temp_warning_max, 
             linetype = "dashed", 
             color = "#F39C12", 
             linewidth = 0.8) +
  
  geom_hline(yintercept = temp_critical_max, 
             linetype = "dashed", 
             color = "#E74C3C", 
             linewidth = 0.8) +
  
  # Mean temperature reference
  geom_hline(yintercept = mean_temp,
             linetype = "dotted",
             color = "gray30",
             linewidth = 0.6) +
  
  # Annotations for thresholds
  annotate("text", x = max(sensor_data$hour) * 0.85, y = temp_optimal_max + 0.3,
           label = paste0("Optimal: ≤", temp_optimal_max, "°C"),
           color = "#27AE60", size = 3.5, fontface = "bold") +
  
  annotate("text", x = max(sensor_data$hour) * 0.85, y = temp_warning_max + 0.3,
           label = paste0("Warning: ", temp_warning_max, "°C"),
           color = "#F39C12", size = 3.5, fontface = "bold") +
  
  annotate("text", x = max(sensor_data$hour) * 0.85, y = temp_critical_max + 0.3,
           label = paste0("Critical: ", temp_critical_max, "°C"),
           color = "#E74C3C", size = 3.5, fontface = "bold") +
  
  # Highlight max temperature event
  annotate("point", x = max_temp_hour, y = max_temp_value,
           color = "#E74C3C", size = 4, shape = 21, fill = NA, stroke = 2) +
  
  annotate("text", x = max_temp_hour, y = max_temp_value + 1,
           label = paste0("Peak: ", round(max_temp_value, 1), "°C"),
           color = "#E74C3C", size = 3, fontface = "bold") +
  
  # Labels
  labs(
    title = "IoT Sensor Monitoring with Alert Thresholds",
    subtitle = paste("Sensor:", unique(sensor_data$sensor_id), "| Operating zones: Green (optimal), Yellow (warning), Red (critical)"),
    x = "Time (hours)",
    y = "Temperature (°C)",
    caption = "Thresholds defined per facility specifications | Alert system monitors excursions"
  ) +
  
  theme_minimal() +
  theme(
    plot.title = element_text(size = 14, face = "bold", color = "gray20"),
    plot.subtitle = element_text(size = 9, color = "gray40", margin = margin(b = 10)),
    plot.caption = element_text(size = 8, color = "gray50", hjust = 0),
    axis.title = element_text(size = 11, face = "bold", color = "gray30"),
    axis.text = element_text(size = 9, color = "gray40"),
    panel.grid.major = element_line(color = "gray85", linewidth = 0.4),
    panel.grid.minor = element_blank(),
    plot.background = element_rect(fill = "white", color = NA)
  )

print(example6)


# ==============================================================================
# SUMMARY AND COMPARISON
# ==============================================================================

# Display all examples side by side (requires patchwork or gridExtra)
# Uncomment if you have patchwork installed:
# 
# library(patchwork)
# 
# combined_plot <- (example1 | example2) / (example3 | example4) / (example5 | example6)
# 
# print(combined_plot)

# Alternative: view them sequentially
cat("\n=== All IoT Sensor Visualization Examples Created! ===\n")
cat("Example 1: Minimal sensor data plot\n")
cat("Example 2: Dashboard-ready with sensor metadata\n")
cat("Example 3: Customized line appearance\n")
cat("Example 4: Dashboard-style grid and background\n")
cat("Example 5: Publication-ready sensor visualization\n")
cat("Example 6: IoT alert thresholds and operating zones\n")
cat("\nUse print(example1), print(example2), etc. to view each plot\n")


# ==============================================================================
# PRACTICE EXERCISES FOR IOT DEVELOPERS (Try these!)
# ==============================================================================

# Exercise 1: Create a sensor plot with red color for alert condition
exercise1 <- ggplot(sensor_data, aes(x = hour, y = temperature)) +
  geom_line(color = "#E74C3C", linewidth = 1.1, linetype = "solid") +
  labs(
    title = "Exercise 1: Alert Condition Visualization",
    subtitle = "Red color indicates sensor alert state",
    x = "Time (hours)",
    y = "Temperature (°C)"
  ) +
  theme_minimal()

# Exercise 2: Add your own custom temperature threshold at 24°C
exercise2 <- ggplot(sensor_data, aes(x = hour, y = temperature)) +
  geom_line(color = "#3498DB", linewidth = 1.0) +
  geom_hline(yintercept = 24, linetype = "dashed", color = "#F39C12", linewidth = 0.8) +
  annotate("text", x = 100, y = 24.5, 
           label = "Custom Threshold: 24°C", 
           color = "#F39C12", fontface = "bold") +
  labs(
    title = "Exercise 2: Custom Sensor Threshold",
    x = "Time (hours)",
    y = "Temperature (°C)"
  ) +
  theme_minimal()

# Exercise 3: Use theme_bw() for high-contrast monitoring display
exercise3 <- ggplot(sensor_data, aes(x = hour, y = temperature)) +
  geom_line(color = "#2ECC71", linewidth = 1.2) +
  labs(
    title = paste("Sensor", unique(sensor_data$sensor_id), "- High Contrast Display"),
    subtitle = unique(sensor_data$location),
    x = "Time (hours)",
    y = "Temperature (°C)"
  ) +
  theme_bw() +
  theme(
    plot.title = element_text(face = "bold"),
    panel.border = element_rect(color = "black", linewidth = 1)
  )

# Exercise 4: Highlight weekend periods (assuming data starts on Monday)
# Days 1-5 are weekdays, 6-7 are weekend, repeating
weekend_starts <- seq(6*24, max(sensor_data$hour), by = 7*24)  # Start of Saturdays
weekend_ends <- weekend_starts + 48  # 48 hours = weekend

exercise4 <- ggplot(sensor_data, aes(x = hour, y = temperature)) +
  # Shade weekend periods
  annotate("rect", 
           xmin = weekend_starts[1], xmax = weekend_ends[1],
           ymin = -Inf, ymax = Inf,
           fill = "gray80", alpha = 0.3) +
  annotate("rect", 
           xmin = weekend_starts[2], xmax = weekend_ends[2],
           ymin = -Inf, ymax = Inf,
           fill = "gray80", alpha = 0.3) +
  annotate("rect", 
           xmin = weekend_starts[3], xmax = weekend_ends[3],
           ymin = -Inf, ymax = Inf,
           fill = "gray80", alpha = 0.3) +
  annotate("rect", 
           xmin = weekend_starts[4], xmax = min(weekend_ends[4], max(sensor_data$hour)),
           ymin = -Inf, ymax = Inf,
           fill = "gray80", alpha = 0.3) +
  geom_line(color = "#3498DB", linewidth = 1.0) +
  labs(
    title = "Exercise 4: Highlight Weekend Periods",
    subtitle = "Gray zones indicate reduced facility operation (weekends)",
    x = "Time (hours)",
    y = "Temperature (°C)"
  ) +
  theme_minimal()

# Print exercises (uncomment to view)
# print(exercise1)
# print(exercise2)
# print(exercise3)
# print(exercise4)

cat("\n=== Chapter 1 Complete! ===\n")
cat("You've learned IoT sensor data visualization basics with ggplot2.\n")
cat("Key skills acquired:\n")
cat("  - Loading and visualizing time series sensor data\n")
cat("  - Adding sensor metadata and labels\n")
cat("  - Customizing plots for monitoring dashboards\n")
cat("  - Implementing alert thresholds and operating zones\n")
cat("\nProceed to Chapter 2 to learn about multi-sensor systems!\n")

