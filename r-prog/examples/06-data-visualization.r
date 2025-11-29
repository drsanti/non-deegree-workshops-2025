# Workshop 06: Data Visualization with ggplot2
# This script demonstrates data visualization using ggplot2

# Install and load required libraries
# Install packages if not already installed
if (!require(ggplot2, quietly = TRUE)) {
  cat("Installing ggplot2 package...\n")
  install.packages("ggplot2")
}

if (!require(dplyr, quietly = TRUE)) {
  cat("Installing dplyr package...\n")
  install.packages("dplyr")
}

# Load libraries
library(ggplot2)
library(dplyr)

# ============================================================================
# Setup: Create Sample Data
# ============================================================================

cat("=== Creating Sample Data ===\n")

set.seed(123)
# Create time series data
timestamps <- seq(as.POSIXct("2024-01-01 00:00:00"), by = "1 hour", length.out = 100)
time_data <- data.frame(
  timestamp = timestamps,
  temperature = 22 + 3 * sin(2 * pi * (1:100) / 24) + rnorm(100, 0, 1),
  device_id = rep(c("IoT-001", "IoT-002", "IoT-003"), length.out = 100)
)

# Create sensor data
sensor_data <- data.frame(
  device_id = rep(paste0("IoT-", sprintf("%03d", 1:5)), each = 20),
  temperature = round(rnorm(100, mean = 25, sd = 2), 2),
  humidity = round(runif(100, 40, 60), 1),
  pressure = round(rnorm(100, mean = 1013, sd = 5), 1),
  status = sample(c("online", "offline"), 100, replace = TRUE, prob = c(0.8, 0.2))
)

cat("Sample data created\n")
cat("Time data:", nrow(time_data), "rows\n")
cat("Sensor data:", nrow(sensor_data), "rows\n")

# ============================================================================
# 2. Scatter Plots
# ============================================================================

cat("\n=== Creating Scatter Plots ===\n")

# Basic scatter plot
p1 <- ggplot(sensor_data, aes(x = temperature, y = humidity)) +
  geom_point()
cat("Basic scatter plot created\n")

# Customized scatter plot
p2 <- ggplot(sensor_data, aes(x = temperature, y = humidity)) +
  geom_point(color = "steelblue", size = 2, alpha = 0.6) +
  labs(
    title = "Temperature vs Humidity",
    x = "Temperature (°C)",
    y = "Humidity (%)"
  ) +
  theme_minimal()
cat("Customized scatter plot created\n")

# Color by category
p3 <- ggplot(sensor_data, aes(x = temperature, y = humidity, color = status)) +
  geom_point(size = 2, alpha = 0.7) +
  labs(
    title = "Temperature vs Humidity by Status",
    x = "Temperature (°C)",
    y = "Humidity (%)",
    color = "Device Status"
  ) +
  theme_minimal()
cat("Scatter plot with color coding created\n")

# ============================================================================
# 3. Line Plots
# ============================================================================

cat("\n=== Creating Line Plots ===\n")

# Basic line plot
p4 <- ggplot(
  time_data[time_data$device_id == "IoT-001", ],
  aes(x = timestamp, y = temperature)
) +
  geom_line() +
  labs(
    title = "Temperature Over Time",
    x = "Time",
    y = "Temperature (°C)"
  ) +
  theme_minimal()
cat("Basic line plot created\n")

# Line plot with points
p5 <- ggplot(
  time_data[time_data$device_id == "IoT-001", ],
  aes(x = timestamp, y = temperature)
) +
  geom_line(color = "blue", alpha = 0.7) +
  geom_point(color = "red", size = 1) +
  labs(
    title = "Temperature Over Time",
    x = "Time",
    y = "Temperature (°C)"
  ) +
  theme_minimal()
cat("Line plot with points created\n")

# Multiple lines
p6 <- ggplot(time_data, aes(x = timestamp, y = temperature, color = device_id)) +
  geom_line(alpha = 0.7) +
  labs(
    title = "Temperature Over Time by Device",
    x = "Time",
    y = "Temperature (°C)",
    color = "Device ID"
  ) +
  theme_minimal()
cat("Multiple line plot created\n")

# ============================================================================
# 4. Bar Plots
# ============================================================================

cat("\n=== Creating Bar Plots ===\n")

# Calculate summary for bar plot
device_summary <- sensor_data %>%
  group_by(device_id) %>%
  summarize(avg_temp = mean(temperature))

# Basic bar plot
p7 <- ggplot(device_summary, aes(x = device_id, y = avg_temp)) +
  geom_bar(stat = "identity", fill = "steelblue") +
  labs(
    title = "Average Temperature by Device",
    x = "Device ID",
    y = "Average Temperature (°C)"
  ) +
  theme_minimal()
cat("Basic bar plot created\n")

# Horizontal bar plot
p8 <- ggplot(device_summary, aes(x = device_id, y = avg_temp)) +
  geom_bar(stat = "identity", fill = "steelblue") +
  coord_flip() +
  labs(
    title = "Average Temperature by Device",
    x = "Device ID",
    y = "Average Temperature (°C)"
  ) +
  theme_minimal()
cat("Horizontal bar plot created\n")

# Grouped bar plot
status_summary <- sensor_data %>%
  group_by(device_id, status) %>%
  summarize(count = n(), .groups = "drop")

p9 <- ggplot(status_summary, aes(x = device_id, y = count, fill = status)) +
  geom_bar(stat = "identity", position = "dodge") +
  labs(
    title = "Readings Count by Device and Status",
    x = "Device ID",
    y = "Count",
    fill = "Status"
  ) +
  theme_minimal()
cat("Grouped bar plot created\n")

# ============================================================================
# 5. Histograms and Density Plots
# ============================================================================

cat("\n=== Creating Histograms ===\n")

# Histogram
p10 <- ggplot(sensor_data, aes(x = temperature)) +
  geom_histogram(bins = 30, fill = "steelblue", color = "black", alpha = 0.7) +
  labs(
    title = "Temperature Distribution",
    x = "Temperature (°C)",
    y = "Frequency"
  ) +
  theme_minimal()
cat("Histogram created\n")

# Density plot
p11 <- ggplot(sensor_data, aes(x = temperature)) +
  geom_density(fill = "steelblue", alpha = 0.5) +
  labs(
    title = "Temperature Density",
    x = "Temperature (°C)",
    y = "Density"
  ) +
  theme_minimal()
cat("Density plot created\n")

# Multiple densities
p12 <- ggplot(sensor_data, aes(x = temperature, fill = status)) +
  geom_density(alpha = 0.5) +
  labs(
    title = "Temperature Distribution by Status",
    x = "Temperature (°C)",
    y = "Density",
    fill = "Status"
  ) +
  theme_minimal()
cat("Multiple density plot created\n")

# ============================================================================
# 6. Box Plots and Violin Plots
# ============================================================================

cat("\n=== Creating Box Plots ===\n")

# Box plot
p13 <- ggplot(sensor_data, aes(x = device_id, y = temperature)) +
  geom_boxplot(fill = "steelblue", alpha = 0.7) +
  labs(
    title = "Temperature by Device",
    x = "Device ID",
    y = "Temperature (°C)"
  ) +
  theme_minimal()
cat("Box plot created\n")

# Violin plot
p14 <- ggplot(sensor_data, aes(x = device_id, y = temperature, fill = device_id)) +
  geom_violin(alpha = 0.7) +
  labs(
    title = "Temperature Distribution by Device",
    x = "Device ID",
    y = "Temperature (°C)"
  ) +
  theme_minimal() +
  theme(legend.position = "none")
cat("Violin plot created\n")

# ============================================================================
# 7. Faceting
# ============================================================================

cat("\n=== Creating Faceted Plots ===\n")

# Facet by one variable
p15 <- ggplot(sensor_data, aes(x = temperature, y = humidity)) +
  geom_point(alpha = 0.6) +
  facet_wrap(~device_id) +
  labs(
    title = "Temperature vs Humidity by Device",
    x = "Temperature (°C)",
    y = "Humidity (%)"
  ) +
  theme_minimal()
cat("Faceted scatter plot created\n")

# Facet by two variables
p16 <- ggplot(sensor_data, aes(x = temperature, y = humidity)) +
  geom_point(alpha = 0.6) +
  facet_grid(status ~ device_id) +
  labs(
    title = "Temperature vs Humidity by Status and Device",
    x = "Temperature (°C)",
    y = "Humidity (%)"
  ) +
  theme_minimal()
cat("Grid faceted plot created\n")

# ============================================================================
# 8. Customizing Aesthetics
# ============================================================================

cat("\n=== Customizing Aesthetics ===\n")

# Custom colors
p17 <- ggplot(sensor_data, aes(x = temperature, y = humidity, color = status)) +
  geom_point(size = 2, alpha = 0.7) +
  scale_color_manual(values = c("online" = "green", "offline" = "red")) +
  labs(
    title = "Temperature vs Humidity",
    x = "Temperature (°C)",
    y = "Humidity (%)",
    color = "Status"
  ) +
  theme_minimal()
cat("Plot with custom colors created\n")

# Custom scales
p18 <- ggplot(sensor_data, aes(x = temperature, y = humidity)) +
  geom_point() +
  scale_x_continuous(limits = c(20, 30), breaks = seq(20, 30, 2)) +
  scale_y_continuous(limits = c(40, 60), breaks = seq(40, 60, 5)) +
  labs(
    title = "Temperature vs Humidity (Custom Scales)",
    x = "Temperature (°C)",
    y = "Humidity (%)"
  ) +
  theme_minimal()
cat("Plot with custom scales created\n")

# Color gradients
p19 <- ggplot(sensor_data, aes(x = temperature, y = humidity, color = pressure)) +
  geom_point(size = 2) +
  scale_color_gradient(low = "blue", high = "red") +
  labs(
    title = "Temperature vs Humidity (Colored by Pressure)",
    x = "Temperature (°C)",
    y = "Humidity (%)",
    color = "Pressure"
  ) +
  theme_minimal()
cat("Plot with color gradient created\n")

# ============================================================================
# 9. Themes and Styling
# ============================================================================

cat("\n=== Applying Themes ===\n")

# Built-in themes
p20 <- ggplot(sensor_data, aes(x = temperature, y = humidity)) +
  geom_point() +
  theme_minimal() +
  labs(title = "Minimal Theme")
cat("Plot with minimal theme created\n")

p21 <- ggplot(sensor_data, aes(x = temperature, y = humidity)) +
  geom_point() +
  theme_bw() +
  labs(title = "Black and White Theme")
cat("Plot with B&W theme created\n")

# Custom theme
p22 <- ggplot(sensor_data, aes(x = temperature, y = humidity, color = status)) +
  geom_point(size = 2, alpha = 0.7) +
  labs(
    title = "Custom Styled Plot",
    x = "Temperature (°C)",
    y = "Humidity (%)",
    color = "Status"
  ) +
  theme(
    plot.title = element_text(size = 16, face = "bold", hjust = 0.5),
    axis.title = element_text(size = 12),
    axis.text = element_text(size = 10),
    legend.position = "bottom",
    panel.background = element_rect(fill = "white"),
    panel.grid.major = element_line(color = "gray90"),
    panel.grid.minor = element_line(color = "gray95")
  )
cat("Plot with custom theme created\n")

# ============================================================================
# 10. Combining Multiple Layers
# ============================================================================

cat("\n=== Creating Complex Plots ===\n")

# Multiple geoms
p23 <- ggplot(
  time_data[time_data$device_id == "IoT-001", ],
  aes(x = timestamp, y = temperature)
) +
  geom_line(color = "blue", alpha = 0.5, size = 1) +
  geom_point(color = "red", size = 1.5, alpha = 0.7) +
  geom_smooth(method = "loess", se = TRUE, color = "green", alpha = 0.3) +
  labs(
    title = "Temperature Over Time with Trend",
    x = "Time",
    y = "Temperature (°C)"
  ) +
  theme_minimal()
cat("Complex plot with multiple layers created\n")

# Annotations
p24 <- ggplot(sensor_data, aes(x = temperature, y = humidity)) +
  geom_point(alpha = 0.6) +
  annotate("text",
    x = 25, y = 55, label = "Normal Range",
    color = "blue", size = 4, fontface = "bold"
  ) +
  geom_hline(yintercept = 50, linetype = "dashed", color = "red", size = 1) +
  geom_vline(xintercept = 24, linetype = "dashed", color = "red", size = 1) +
  labs(
    title = "Temperature vs Humidity with Reference Lines",
    x = "Temperature (°C)",
    y = "Humidity (%)"
  ) +
  theme_minimal()
cat("Plot with annotations created\n")

# ============================================================================
# 11. Saving Plots
# ============================================================================

cat("\n=== Saving Plots ===\n")

# Save a sample plot
sample_plot <- ggplot(sensor_data, aes(x = temperature, y = humidity, color = status)) +
  geom_point(size = 2, alpha = 0.7) +
  labs(
    title = "Temperature vs Humidity by Status",
    x = "Temperature (°C)",
    y = "Humidity (%)",
    color = "Status"
  ) +
  theme_minimal()

# Uncomment to save (commented to avoid file creation during demo)
# ggsave("temperature_humidity_plot.png", plot = sample_plot,
#        width = 10, height = 6, dpi = 300)
cat("Plot saving code demonstrated (commented out)\n")
cat("Use: ggsave('filename.png', plot = p, width = 10, height = 6, dpi = 300)\n")

# ============================================================================
# Exercise Solutions
# ============================================================================

cat("\n=== Exercise 1: Basic Visualization ===\n")
ex1 <- ggplot(sensor_data, aes(x = temperature, y = humidity, color = status)) +
  geom_point(size = 2, alpha = 0.7) +
  labs(
    title = "Temperature vs Humidity by Device Status",
    x = "Temperature (°C)",
    y = "Humidity (%)",
    color = "Status"
  ) +
  theme_minimal()
cat("Exercise 1 plot created\n")

cat("\n=== Exercise 2: Time Series Plot ===\n")
ex2 <- ggplot(time_data, aes(x = timestamp, y = temperature, color = device_id)) +
  geom_line(alpha = 0.7, size = 1) +
  geom_smooth(method = "loess", se = TRUE, alpha = 0.2) +
  labs(
    title = "Temperature Over Time by Device",
    x = "Time",
    y = "Temperature (°C)",
    color = "Device ID"
  ) +
  theme_minimal()
cat("Exercise 2 plot created\n")

cat("\n=== Exercise 3: Comparative Visualization ===\n")
ex3 <- ggplot(sensor_data, aes(x = device_id, y = temperature)) +
  geom_boxplot(fill = "steelblue", alpha = 0.7) +
  facet_wrap(~status) +
  labs(
    title = "Temperature Distribution by Device and Status",
    x = "Device ID",
    y = "Temperature (°C)"
  ) +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1))
cat("Exercise 3 plot created\n")

cat("\n=== Exercise 4: Publication-Ready Plot ===\n")
ex4 <- ggplot(sensor_data, aes(x = temperature, y = humidity, color = status)) +
  geom_point(size = 2.5, alpha = 0.7) +
  geom_smooth(method = "lm", se = TRUE, alpha = 0.2) +
  scale_color_manual(
    values = c("online" = "#2E8B57", "offline" = "#DC143C"),
    labels = c("Online", "Offline")
  ) +
  labs(
    title = "Relationship Between Temperature and Humidity",
    subtitle = "Grouped by Device Status",
    x = "Temperature (°C)",
    y = "Humidity (%)",
    color = "Device Status",
    caption = "Data from IoT sensors"
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(size = 16, face = "bold", hjust = 0.5),
    plot.subtitle = element_text(size = 12, hjust = 0.5),
    axis.title = element_text(size = 12),
    axis.text = element_text(size = 10),
    legend.position = "bottom",
    legend.title = element_text(face = "bold"),
    panel.grid.minor = element_blank()
  )
cat("Exercise 4 publication-ready plot created\n")

cat("\n=== Summary ===\n")
cat("All visualization examples created successfully!\n")
cat("To view plots, use: print(p1), print(p2), etc.\n")
cat("To save plots, use: ggsave('filename.png', plot = p1, width = 10, height = 6)\n")
