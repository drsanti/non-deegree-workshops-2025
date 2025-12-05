# ==============================================================================
# Chapter 2: Multi-Sensor IoT Data Visualization
# R Code for all examples
# ==============================================================================

# Load required libraries
library(ggplot2)

# Set seed for reproducibility
set.seed(123)

# ==============================================================================
# DATA GENERATION - Multi-Sensor IoT System
# ==============================================================================

# Generate synthetic data from 3 temperature sensors in a smart building
# Scenario: Environmental monitoring across different zones
# Duration: 7 days (168 hours) per sensor
# Total: 504 readings (3 sensors × 168 hours)

generate_multisensor_data <- function() {
  # Time parameters
  hours <- 168  # 7 days × 24 hours
  hour_sequence <- 1:hours
  
  # Create timestamp sequence starting from Monday, December 2, 2024
  timestamps <- seq(
    from = as.POSIXct("2024-12-02 00:00:00", tz = "UTC"),
    by = "hour",
    length.out = hours
  )
  
  # Extract time features for patterns
  day_of_week <- as.numeric(format(timestamps, "%u"))  # 1=Mon, 7=Sun
  hour_of_day <- as.numeric(format(timestamps, "%H"))  # 0-23
  
  # Is it business hours? (9 AM - 5 PM, Monday-Friday)
  is_business_hours <- (hour_of_day >= 9 & hour_of_day < 17) & (day_of_week <= 5)
  is_weekend <- day_of_week >= 6
  
  # ===========================================================================
  # SENSOR 1: Server Room - TEMP_SRV_001
  # ===========================================================================
  # Tight temperature control, critical for equipment
  
  srv_base_temp <- 20
  srv_noise <- rnorm(hours, mean = 0, sd = 0.3)  # Very low noise
  srv_daily_cycle <- 0.5 * sin(2 * pi * hour_of_day / 24)  # Minimal cycle
  
  srv_temperature <- srv_base_temp + srv_daily_cycle + srv_noise
  
  srv_data <- data.frame(
    timestamp = timestamps,
    hour = hour_sequence,
    temperature = srv_temperature,
    sensor_id = "TEMP_SRV_001",
    location = "Server Room",
    zone_type = "server_room",
    stringsAsFactors = FALSE
  )
  
  # ===========================================================================
  # SENSOR 2: Office Area - TEMP_OFF_002
  # ===========================================================================
  # Moderate control, comfort-focused, responds to occupancy
  
  off_base_temp <- 22
  off_noise <- rnorm(hours, mean = 0, sd = 0.5)
  
  # Warmer during business hours (people and equipment heat)
  off_business_effect <- ifelse(is_business_hours, 2, 0)
  
  # Cooler on weekends (HVAC setback)
  off_weekend_effect <- ifelse(is_weekend, -1.5, 0)
  
  # Daily cycle
  off_daily_cycle <- 1.5 * sin(2 * pi * (hour_of_day - 6) / 24)
  
  off_temperature <- off_base_temp + off_daily_cycle + 
                     off_business_effect + off_weekend_effect + off_noise
  
  off_data <- data.frame(
    timestamp = timestamps,
    hour = hour_sequence,
    temperature = off_temperature,
    sensor_id = "TEMP_OFF_002",
    location = "Open Office",
    zone_type = "office",
    stringsAsFactors = FALSE
  )
  
  # ===========================================================================
  # SENSOR 3: Warehouse - TEMP_WH_003
  # ===========================================================================
  # Loose control, more affected by external conditions
  
  wh_base_temp <- 18
  wh_noise <- rnorm(hours, mean = 0, sd = 0.8)
  
  # Larger daily temperature swing
  wh_daily_cycle <- 2.5 * sin(2 * pi * (hour_of_day - 8) / 24)
  
  # Weather simulation (gradual warming trend over the week)
  wh_weather_trend <- 0.01 * hour_sequence
  
  # Weekend effect (less activity, slightly cooler)
  wh_weekend_effect <- ifelse(is_weekend, -1, 0)
  
  wh_temperature <- wh_base_temp + wh_daily_cycle + 
                    wh_weather_trend + wh_weekend_effect + wh_noise
  
  wh_data <- data.frame(
    timestamp = timestamps,
    hour = hour_sequence,
    temperature = wh_temperature,
    sensor_id = "TEMP_WH_003",
    location = "Warehouse",
    zone_type = "warehouse",
    stringsAsFactors = FALSE
  )
  
  # ===========================================================================
  # Combine all sensor data
  # ===========================================================================
  
  all_sensors <- rbind(srv_data, off_data, wh_data)
  
  # Set factor levels for consistent ordering
  all_sensors$sensor_id <- factor(
    all_sensors$sensor_id,
    levels = c("TEMP_SRV_001", "TEMP_OFF_002", "TEMP_WH_003")
  )
  
  all_sensors$location <- factor(
    all_sensors$location,
    levels = c("Server Room", "Open Office", "Warehouse")
  )
  
  return(all_sensors)
}

# Generate the multi-sensor data
sensor_data <- generate_multisensor_data()

# Quick look at the data
cat("=== Multi-Sensor IoT Data Generated ===\n")
head(sensor_data, 12)
cat("\n")

# Summary statistics by sensor
cat("=== Temperature Statistics by Sensor ===\n")
aggregate(temperature ~ sensor_id + location, data = sensor_data, 
          FUN = function(x) c(mean = round(mean(x), 2), 
                              sd = round(sd(x), 2),
                              min = round(min(x), 2),
                              max = round(max(x), 2)))

cat("\n=== Data Structure ===\n")
cat("Total readings:", nrow(sensor_data), "\n")
cat("Sensors:", length(unique(sensor_data$sensor_id)), "\n")
cat("Duration:", max(sensor_data$hour), "hours (", 
    max(sensor_data$hour)/24, "days)\n")
cat("Readings per sensor:", nrow(sensor_data) / length(unique(sensor_data$sensor_id)), "\n\n")


# ==============================================================================
# EXAMPLE 1: Basic Multi-Sensor Line Plot
# ==============================================================================
# Objective: Plot all sensors with automatic color coding
# New concepts: aes(color = sensor_id), automatic legend
# IoT Context: Quick comparison of all sensors

example1 <- ggplot(sensor_data, aes(x = hour, y = temperature, color = sensor_id)) +
  geom_line(linewidth = 1.0) +
  labs(
    title = "Multi-Sensor Temperature Monitoring",
    subtitle = "Smart Building - 3 Zones, 7 Days",
    x = "Time (hours)",
    y = "Temperature (°C)"
  ) +
  theme_minimal()

print(example1)

# Save plot (optional)
# ggsave("figures/chapter02_example1.png", example1, width = 12, height = 6, dpi = 300)


# ==============================================================================
# EXAMPLE 2: Custom Colors and Legend Positioning
# ==============================================================================
# Objective: Assign meaningful colors and optimize legend
# New concepts: scale_color_manual(), theme(legend.position), custom legend title
# IoT Context: Use color coding that matches monitoring system conventions

example2 <- ggplot(sensor_data, aes(x = hour, y = temperature, color = sensor_id)) +
  geom_line(linewidth = 1.1) +
  scale_color_manual(
    values = c(
      "TEMP_SRV_001" = "#E74C3C",  # Red for critical server room
      "TEMP_OFF_002" = "#2ECC71",  # Green for comfortable office
      "TEMP_WH_003" = "#3498DB"    # Blue for cool warehouse
    ),
    labels = c(
      "TEMP_SRV_001" = "Server Room (Critical)",
      "TEMP_OFF_002" = "Open Office (Comfort)",
      "TEMP_WH_003" = "Warehouse (Storage)"
    )
  ) +
  labs(
    title = "Smart Building Environmental Monitoring",
    subtitle = "Temperature sensors across three zones | 7-day monitoring period",
    x = "Time (hours from start)",
    y = "Temperature (°C)",
    color = "Sensor Location",
    caption = "Color coding: Red (critical), Green (comfort), Blue (storage)"
  ) +
  theme_minimal() +
  theme(
    legend.position = "top",
    legend.direction = "horizontal",
    legend.title = element_text(face = "bold", size = 11),
    legend.text = element_text(size = 9),
    plot.title = element_text(size = 14, face = "bold"),
    plot.subtitle = element_text(size = 10, color = "gray40"),
    plot.caption = element_text(size = 8, color = "gray50", hjust = 0)
  )

print(example2)


# ==============================================================================
# EXAMPLE 3: Add Data Points to Show Readings
# ==============================================================================
# Objective: Combine lines and points to visualize sampling
# New concepts: geom_point(), layering, alpha transparency
# IoT Context: Show actual measurement times, identify gaps

example3 <- ggplot(sensor_data, aes(x = hour, y = temperature, color = sensor_id)) +
  geom_line(linewidth = 0.8) +
  geom_point(size = 1.5, alpha = 0.6) +
  scale_color_manual(
    values = c(
      "TEMP_SRV_001" = "#E74C3C",
      "TEMP_OFF_002" = "#2ECC71",
      "TEMP_WH_003" = "#3498DB"
    ),
    labels = c(
      "TEMP_SRV_001" = "Server Room",
      "TEMP_OFF_002" = "Open Office",
      "TEMP_WH_003" = "Warehouse"
    )
  ) +
  labs(
    title = "Hourly Sensor Readings - Lines and Points",
    subtitle = "Points show actual measurement times | Useful for identifying data gaps",
    x = "Time (hours)",
    y = "Temperature (°C)",
    color = "Location"
  ) +
  theme_minimal() +
  theme(
    legend.position = "right",
    plot.title = element_text(face = "bold", size = 13)
  )

print(example3)


# ==============================================================================
# EXAMPLE 4: Multiple Visual Channels (Color + Linetype)
# ==============================================================================
# Objective: Add linetype for accessibility (color-blind friendly)
# New concepts: aes(linetype = sensor_id), scale_linetype_manual()
# IoT Context: Accessible monitoring for all users, grayscale compatibility

example4 <- ggplot(sensor_data, aes(x = hour, y = temperature, 
                                     color = sensor_id, linetype = sensor_id)) +
  geom_line(linewidth = 1.0) +
  scale_color_manual(
    values = c(
      "TEMP_SRV_001" = "#E74C3C",
      "TEMP_OFF_002" = "#2ECC71",
      "TEMP_WH_003" = "#3498DB"
    ),
    labels = c(
      "TEMP_SRV_001" = "Server Room",
      "TEMP_OFF_002" = "Open Office",
      "TEMP_WH_003" = "Warehouse"
    )
  ) +
  scale_linetype_manual(
    values = c(
      "TEMP_SRV_001" = "solid",     # Critical sensor - solid line
      "TEMP_OFF_002" = "dashed",    # Office - dashed
      "TEMP_WH_003" = "dotted"      # Warehouse - dotted
    ),
    labels = c(
      "TEMP_SRV_001" = "Server Room",
      "TEMP_OFF_002" = "Open Office",
      "TEMP_WH_003" = "Warehouse"
    )
  ) +
  labs(
    title = "Accessible Multi-Sensor Visualization",
    subtitle = "Color + Linetype encoding for accessibility compliance",
    x = "Time (hours)",
    y = "Temperature (°C)",
    color = "Location",
    linetype = "Location",
    caption = "Design note: Works in grayscale and for color-blind users"
  ) +
  theme_minimal() +
  theme(
    legend.position = "top",
    plot.title = element_text(face = "bold")
  )

print(example4)


# ==============================================================================
# EXAMPLE 5: Highlight Working Hours and Events
# ==============================================================================
# Objective: Add context with business hours and maintenance events
# New concepts: geom_rect() for time periods, vertical lines for events
# IoT Context: Explain temperature variations with building operations

# Calculate business hours rectangles (9 AM - 5 PM, weekdays)
# Days: Mon-Fri of first week, Mon-Fri of second week (partial)
business_periods <- data.frame(
  xmin = c(9, 33, 57, 81, 105, 129, 153),      # Start hours (Mon-Fri)
  xmax = c(17, 41, 65, 89, 113, 137, 161),     # End hours
  label = c("Mon", "Tue", "Wed", "Thu", "Fri", "Mon", "Tue")
)

# Maintenance event on Wednesday afternoon
maintenance_hour <- 62  # Wednesday, 2 PM

example5 <- ggplot(sensor_data, aes(x = hour, y = temperature, color = sensor_id)) +
  # Add business hours shading (behind everything)
  geom_rect(data = business_periods,
            aes(xmin = xmin, xmax = xmax, ymin = -Inf, ymax = Inf),
            fill = "gray85", alpha = 0.4, inherit.aes = FALSE) +
  
  # Vertical line for maintenance event
  geom_vline(xintercept = maintenance_hour, 
             linetype = "dashed", 
             color = "#E67E22", 
             linewidth = 1.0) +
  
  # Sensor data lines
  geom_line(linewidth = 1.0) +
  
  # Annotation for maintenance
  annotate("text", x = maintenance_hour + 2, y = 25,
           label = "HVAC Maintenance",
           angle = 90, vjust = -0.5,
           color = "#E67E22", size = 3.5, fontface = "bold") +
  
  # Custom colors
  scale_color_manual(
    values = c(
      "TEMP_SRV_001" = "#E74C3C",
      "TEMP_OFF_002" = "#2ECC71",
      "TEMP_WH_003" = "#3498DB"
    ),
    labels = c(
      "TEMP_SRV_001" = "Server Room",
      "TEMP_OFF_002" = "Open Office",
      "TEMP_WH_003" = "Warehouse"
    )
  ) +
  
  labs(
    title = "Temperature Monitoring with Operational Context",
    subtitle = "Gray zones = Business hours (9 AM - 5 PM) | Orange line = Maintenance event",
    x = "Time (hours)",
    y = "Temperature (°C)",
    color = "Location",
    caption = "Note: Office temperature increases during business hours due to occupancy"
  ) +
  
  theme_minimal() +
  theme(
    legend.position = "top",
    plot.title = element_text(face = "bold", size = 13),
    plot.subtitle = element_text(size = 9, color = "gray40"),
    panel.grid.minor = element_blank()
  )

print(example5)


# ==============================================================================
# EXAMPLE 6 (BONUS): Faceted Sensor Comparison
# ==============================================================================
# Objective: Separate panels for each sensor (preview of Chapter 5)
# New concepts: facet_wrap(), scales parameter
# IoT Context: Detailed individual sensor analysis

example6 <- ggplot(sensor_data, aes(x = hour, y = temperature)) +
  geom_line(aes(color = sensor_id), linewidth = 1.0, show.legend = FALSE) +
  geom_point(aes(color = sensor_id), size = 1, alpha = 0.4, show.legend = FALSE) +
  
  # Facet by sensor
  facet_wrap(~ location, ncol = 1, scales = "free_y") +
  
  # Custom colors
  scale_color_manual(
    values = c(
      "TEMP_SRV_001" = "#E74C3C",
      "TEMP_OFF_002" = "#2ECC71",
      "TEMP_WH_003" = "#3498DB"
    )
  ) +
  
  labs(
    title = "Faceted Sensor Analysis - Individual Panels",
    subtitle = "Each sensor in separate panel for detailed inspection | Preview of Chapter 5",
    x = "Time (hours)",
    y = "Temperature (°C)",
    caption = "Note: Y-axis scales are independent (scales = 'free_y') for better detail"
  ) +
  
  theme_minimal() +
  theme(
    plot.title = element_text(face = "bold", size = 13),
    plot.subtitle = element_text(size = 9, color = "gray40"),
    strip.text = element_text(face = "bold", size = 11),
    strip.background = element_rect(fill = "gray90", color = NA)
  )

print(example6)


# ==============================================================================
# SUMMARY AND COMPARISON
# ==============================================================================

cat("\n=== Chapter 2: All Examples Complete! ===\n")
cat("Example 1: Basic multi-sensor plot with automatic colors\n")
cat("Example 2: Custom colors and optimized legend\n")
cat("Example 3: Combined lines and points\n")
cat("Example 4: Accessible visualization (color + linetype)\n")
cat("Example 5: Contextual highlighting (business hours, events)\n")
cat("Example 6: Faceted comparison (preview)\n")
cat("\nUse print(example1), print(example2), etc. to view plots\n\n")


# ==============================================================================
# PRACTICE EXERCISES FOR IOT DEVELOPERS
# ==============================================================================

# Exercise 1: Add a 4th sensor and plot all four
cat("=== Practice Exercises ===\n")
cat("Exercise 1: Add a 4th sensor (hint: create new data and rbind)\n")
cat("Exercise 2: Use scale_color_brewer() with palette 'Set1'\n")
cat("Exercise 3: Highlight weekend periods instead of business hours\n")
cat("Exercise 4: Add threshold lines specific to each zone\n")
cat("Exercise 5: Create an alert visualization showing out-of-range sensors\n\n")

# Exercise 2: Use Brewer color palette
exercise2 <- ggplot(sensor_data, aes(x = hour, y = temperature, color = sensor_id)) +
  geom_line(linewidth = 1.0) +
  scale_color_brewer(palette = "Set1",
                     labels = c("Server Room", "Open Office", "Warehouse")) +
  labs(
    title = "Exercise 2: Using Brewer Color Palette",
    x = "Time (hours)",
    y = "Temperature (°C)",
    color = "Location"
  ) +
  theme_minimal()

# print(exercise2)

# Exercise 3: Highlight weekends
weekend_periods <- data.frame(
  xmin = c(5*24, 12*24),   # Start of Saturdays
  xmax = c(7*24, 14*24)    # End of Sundays
)

exercise3 <- ggplot(sensor_data, aes(x = hour, y = temperature, color = sensor_id)) +
  geom_rect(data = weekend_periods,
            aes(xmin = xmin, xmax = xmax, ymin = -Inf, ymax = Inf),
            fill = "lightblue", alpha = 0.2, inherit.aes = FALSE) +
  geom_line(linewidth = 1.0) +
  scale_color_manual(
    values = c("#E74C3C", "#2ECC71", "#3498DB"),
    labels = c("Server Room", "Open Office", "Warehouse")
  ) +
  labs(
    title = "Exercise 3: Highlighted Weekend Periods",
    subtitle = "Blue zones indicate weekends",
    x = "Time (hours)",
    y = "Temperature (°C)",
    color = "Location"
  ) +
  theme_minimal()

# print(exercise3)

cat("Chapter 2 Complete!\n")
cat("You've mastered multi-sensor visualization techniques.\n")
cat("Proceed to Chapter 3 for histogram and distribution analysis!\n")
