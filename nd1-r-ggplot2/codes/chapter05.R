# ==============================================================================
# Chapter 5: Faceting and Small Multiples for Sensor Arrays
# R Code for all examples
# ==============================================================================

# Load required libraries
library(ggplot2)
library(dplyr)

# Set seed for reproducibility
set.seed(42)

# ==============================================================================
# DATA GENERATION - Building-Wide Sensor Array
# ==============================================================================

# Generate synthetic data from 8-sensor building monitoring system
# Scenario: 2 floors × 4 zones = 8 temperature sensors
# Duration: 7 days (168 hours)
# Total: 1,344 readings

generate_sensor_array_data <- function() {
  # Time parameters
  hours <- 168  # 7 days
  
  # Create timestamp sequence
  timestamps <- seq(
    from = as.POSIXct("2024-12-01 00:00:00", tz = "UTC"),
    by = "hour",
    length.out = hours
  )
  
  # Time features
  hour_of_day <- as.numeric(format(timestamps, "%H"))
  day_of_week <- as.numeric(format(timestamps, "%u"))
  is_weekend <- day_of_week >= 6
  is_business_hours <- (hour_of_day >= 8 & hour_of_day < 18) & !is_weekend
  
  # Define sensor array structure
  floors <- c(0, 1)  # Ground floor and First floor
  zones <- c("Server", "Office", "Lab", "Common")
  
  # Initialize data frame
  all_data <- data.frame()
  
  # ===========================================================================
  # Generate data for each sensor
  # ===========================================================================
  
  for (floor in floors) {
    for (zone in zones) {
      
      # Sensor ID
      sensor_id <- paste0("TEMP_F", floor, "_", 
                         substr(zone, 1, 3) %>% toupper())
      
      # Base temperature by zone type
      if (zone == "Server") {
        base_temp <- 20
        noise_sd <- 0.3
        daily_amplitude <- 0.5
        weekend_setback <- 0
        occupancy_effect <- 0
        
      } else if (zone == "Office") {
        base_temp <- 22
        noise_sd <- 0.5
        daily_amplitude <- 2.0
        weekend_setback <- -2
        occupancy_effect <- 1.5
        
      } else if (zone == "Lab") {
        base_temp <- 21
        noise_sd <- 0.4
        daily_amplitude <- 1.0
        weekend_setback <- -1
        occupancy_effect <- 0.5
        
      } else {  # Common Area
        base_temp <- 20
        noise_sd <- 0.8
        daily_amplitude <- 2.5
        weekend_setback <- -1.5
        occupancy_effect <- 1.0
      }
      
      # Floor effect (upper floor slightly warmer)
      floor_effect <- floor * 0.5
      
      # Daily cycle
      daily_cycle <- daily_amplitude * sin(2 * pi * (hour_of_day - 6) / 24)
      
      # Weekend effect
      weekend_effect <- ifelse(is_weekend, weekend_setback, 0)
      
      # Occupancy heat gain (business hours only)
      occupancy_heat <- ifelse(is_business_hours, occupancy_effect, 0)
      
      # Base temperature calculation
      temperature <- base_temp + floor_effect + daily_cycle + 
                    weekend_effect + occupancy_heat + 
                    rnorm(hours, 0, noise_sd)
      
      # ===========================================================================
      # Add sensor-specific issues for realism
      # ===========================================================================
      
      # F0_COM: Calibration drift (+1.5°C bias)
      if (sensor_id == "TEMP_F0_COM") {
        temperature <- temperature + 1.5
      }
      
      # F1_OFF: Increased noise (aging sensor)
      if (sensor_id == "TEMP_F1_OFF") {
        temperature <- temperature + rnorm(hours, 0, 1.0)
      }
      
      # F0_LAB: Weekend HVAC failure on day 6 (Saturday)
      if (sensor_id == "TEMP_F0_LAB") {
        day_6_indices <- which(day_of_week == 6)
        temperature[day_6_indices] <- temperature[day_6_indices] + 3
      }
      
      # Create sensor data frame
      sensor_data <- data.frame(
        timestamp = timestamps,
        hour = 1:hours,
        sensor_id = sensor_id,
        floor = paste0("Floor ", floor),
        zone = zone,
        location = paste0("Floor ", floor, " - ", zone),
        temperature = temperature,
        stringsAsFactors = FALSE
      )
      
      # Append to all data
      all_data <- rbind(all_data, sensor_data)
    }
  }
  
  # Set factor levels for consistent ordering
  all_data$sensor_id <- factor(all_data$sensor_id)
  all_data$floor <- factor(all_data$floor, levels = c("Floor 0", "Floor 1"))
  all_data$zone <- factor(all_data$zone, 
                          levels = c("Server", "Office", "Lab", "Common"))
  
  return(all_data)
}

# Generate the sensor array data
sensor_data <- generate_sensor_array_data()

# Quick look at the data
cat("=== Building-Wide Sensor Array Data Generated ===\n")
head(sensor_data, 12)
cat("\n")

# Summary by sensor
cat("=== Temperature Statistics by Sensor ===\n")
sensor_summary <- sensor_data %>%
  group_by(sensor_id, location) %>%
  summarise(
    mean_temp = round(mean(temperature), 2),
    sd_temp = round(sd(temperature), 2),
    min_temp = round(min(temperature), 2),
    max_temp = round(max(temperature), 2),
    .groups = "drop"
  )
print(sensor_summary)
cat("\n")

cat("Total sensors:", length(unique(sensor_data$sensor_id)), "\n")
cat("Total readings:", nrow(sensor_data), "\n")
cat("Readings per sensor:", nrow(sensor_data) / length(unique(sensor_data$sensor_id)), "\n\n")


# ==============================================================================
# EXAMPLE 1: Basic Faceted View - All Sensors with Shared Axis
# ==============================================================================
# Objective: Visualize all 8 sensors to identify outliers
# New concepts: facet_wrap(), shared Y-axis for comparison
# IoT Context: Quick health check - which sensors need attention?

example1 <- ggplot(sensor_data, aes(x = hour, y = temperature)) +
  geom_line(color = "#3498DB", linewidth = 0.8) +
  facet_wrap(~ sensor_id, ncol = 4) +
  labs(
    title = "Building-Wide Sensor Array - 7 Day Monitoring",
    subtitle = "8 temperature sensors across 2 floors × 4 zones",
    x = "Time (hours)",
    y = "Temperature (°C)",
    caption = "Shared Y-axis allows direct comparison of absolute temperatures"
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(size = 14, face = "bold"),
    plot.subtitle = element_text(size = 11, color = "gray40"),
    strip.text = element_text(size = 9, face = "bold")
  )

print(example1)


# ==============================================================================
# EXAMPLE 2: Free Y-Scales for Different Sensor Ranges
# ==============================================================================
# Objective: Optimize each panel to see detail within sensor's range
# New concepts: scales = "free_y"
# IoT Context: Focus on patterns rather than absolute comparison

example2 <- ggplot(sensor_data, aes(x = hour, y = temperature)) +
  geom_line(color = "#E67E22", linewidth = 0.8) +
  facet_wrap(~ sensor_id, ncol = 4, scales = "free_y") +
  labs(
    title = "Sensor Array with Optimized Y-Axes",
    subtitle = "Each sensor's Y-axis spans only its data range - better for pattern detection",
    x = "Time (hours)",
    y = "Temperature (°C)",
    caption = "Free Y-scales reveal patterns that were compressed with shared axes"
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(size = 14, face = "bold"),
    plot.subtitle = element_text(size = 10, color = "gray40"),
    strip.text = element_text(size = 9, face = "bold")
  )

print(example2)


# ==============================================================================
# EXAMPLE 3: Hierarchical Faceting by Floor and Zone
# ==============================================================================
# Objective: Organize sensors in 2D grid matching building structure
# New concepts: facet_grid(rows ~ cols)
# IoT Context: Compare performance across floors and zone types

example3 <- ggplot(sensor_data, aes(x = hour, y = temperature)) +
  geom_line(aes(color = zone), linewidth = 0.9) +
  facet_grid(floor ~ zone) +
  scale_color_manual(
    values = c(
      "Server" = "#E74C3C",
      "Office" = "#3498DB",
      "Lab" = "#2ECC71",
      "Common" = "#F39C12"
    )
  ) +
  labs(
    title = "Hierarchical Sensor Organization - Floor × Zone",
    subtitle = "Rows = Floors | Columns = Zones | Compare vertically and horizontally",
    x = "Time (hours)",
    y = "Temperature (°C)",
    color = "Zone Type"
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(size = 14, face = "bold"),
    plot.subtitle = element_text(size = 10, color = "gray40"),
    strip.text = element_text(size = 10, face = "bold"),
    legend.position = "top"
  )

print(example3)


# ==============================================================================
# EXAMPLE 4: Custom Facet Labels with Sensor Metadata
# ==============================================================================
# Objective: Replace sensor IDs with descriptive names
# New concepts: labeller with custom labels
# IoT Context: Readable dashboards for facility managers

# Create custom labeller - convert to named vector
location_labels <- sensor_data %>%
  select(sensor_id, location) %>%
  distinct()

# Convert to named vector manually
location_labels <- setNames(location_labels$location, location_labels$sensor_id)

example4 <- ggplot(sensor_data, aes(x = hour, y = temperature)) +
  geom_line(color = "#9B59B6", linewidth = 0.8) +
  facet_wrap(~ sensor_id, ncol = 4,
             labeller = labeller(sensor_id = location_labels)) +
  labs(
    title = "Sensor Array with Descriptive Location Labels",
    subtitle = "Human-readable labels improve dashboard usability",
    x = "Time (hours)",
    y = "Temperature (°C)"
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(size = 14, face = "bold"),
    plot.subtitle = element_text(size = 10, color = "gray40"),
    strip.text = element_text(size = 8.5, face = "bold")
  )

print(example4)


# ==============================================================================
# EXAMPLE 5: Styled Facet Headers for Professional Dashboards
# ==============================================================================
# Objective: Create polished dashboard with colored zone indicators
# New concepts: strip.background, strip.text theme customization
# IoT Context: Production monitoring dashboard

example5 <- ggplot(sensor_data, aes(x = hour, y = temperature)) +
  geom_line(aes(color = zone), linewidth = 1.0) +
  facet_wrap(~ sensor_id, ncol = 4,
             labeller = labeller(sensor_id = location_labels)) +
  scale_color_manual(
    values = c(
      "Server" = "#E74C3C",
      "Office" = "#3498DB",
      "Lab" = "#2ECC71",
      "Common" = "#F39C12"
    ),
    guide = "none"  # Hide legend since color is in facet context
  ) +
  labs(
    title = "Professional Sensor Monitoring Dashboard",
    subtitle = "Styled facet headers with zone-specific colors | 7-day continuous monitoring",
    x = "Time (hours)",
    y = "Temperature (°C)",
    caption = "Color coding: Red = Server | Blue = Office | Green = Lab | Orange = Common"
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(size = 15, face = "bold", color = "gray20"),
    plot.subtitle = element_text(size = 10, color = "gray40", margin = margin(b = 10)),
    plot.caption = element_text(size = 8, hjust = 0, color = "gray50"),
    
    # Styled facet headers
    strip.text = element_text(size = 9, face = "bold", color = "white"),
    strip.background = element_rect(fill = "gray30", color = "gray20", linewidth = 0.5),
    
    # Panel styling
    panel.border = element_rect(color = "gray80", fill = NA, linewidth = 0.5),
    panel.grid.minor = element_blank()
  )

print(example5)


# ==============================================================================
# EXAMPLE 6 (BONUS): Faceted Distributions for Variability Comparison
# ==============================================================================
# Objective: Compare sensor quality using distributions
# New concepts: Faceting with histograms/density instead of time series
# IoT Context: Sensor calibration assessment

example6 <- ggplot(sensor_data, aes(x = temperature)) +
  geom_histogram(aes(fill = zone), bins = 20, alpha = 0.8, color = "white") +
  geom_vline(aes(xintercept = mean(temperature)), 
             color = "red", linetype = "dashed", linewidth = 0.8) +
  facet_wrap(~ sensor_id, ncol = 4, scales = "free_x",
             labeller = labeller(sensor_id = location_labels)) +
  scale_fill_manual(
    values = c(
      "Server" = "#E74C3C",
      "Office" = "#3498DB",
      "Lab" = "#2ECC71",
      "Common" = "#F39C12"
    )
  ) +
  labs(
    title = "Sensor Variability Analysis - Distribution Comparison",
    subtitle = "Narrow = tight control | Wide = high variability | Shifted = calibration drift",
    x = "Temperature (°C)",
    y = "Frequency",
    fill = "Zone Type",
    caption = "Red dashed line = mean temperature per sensor"
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(size = 14, face = "bold"),
    plot.subtitle = element_text(size = 10, color = "gray40"),
    strip.text = element_text(size = 8.5, face = "bold"),
    legend.position = "top"
  )

print(example6)


# ==============================================================================
# SUMMARY AND KEY TAKEAWAYS
# ==============================================================================

cat("\n=== Chapter 5 Summary ===\n")
cat("Topics covered:\n")
cat("1. facet_wrap() for creating grid layouts from one variable\n")
cat("2. facet_grid() for hierarchical 2D organization\n")
cat("3. Scale control (fixed vs. free) for different analysis goals\n")
cat("4. Custom facet labels for human-readable dashboards\n")
cat("5. Professional styling with strip.text and strip.background\n")
cat("6. Faceted distributions for sensor quality assessment\n\n")

cat("Key sensor observations:\n")
cat("- Server rooms show tightest control (low variability)\n")
cat("- F0_COM shows calibration drift (+1.5°C bias)\n")
cat("- F1_OFF shows increased noise (aging sensor)\n")
cat("- F0_LAB experienced HVAC failure on day 6\n")
cat("- All offices show clear weekend setback patterns\n\n")

cat("ggplot2 functions introduced:\n")
cat("- facet_wrap(~ variable): Grid from one categorical variable\n")
cat("- facet_grid(rows ~ cols): 2D grid from two variables\n")
cat("- scales = 'free_y': Independent Y-axes per panel\n")
cat("- labeller(): Custom facet labels\n")
cat("- strip.text: Facet header text styling\n")
cat("- strip.background: Facet header background styling\n\n")


# ==============================================================================
# PRACTICE EXERCISES
# ==============================================================================

cat("=== Practice Exercises ===\n")
cat("Try these to deepen your understanding:\n\n")

cat("1. EXPAND SENSOR ARRAY:\n")
cat("   - Modify generation to create 12 sensors (3 floors × 4 zones)\n")
cat("   - Adjust ncol in facet_wrap to maintain 4 columns\n")
cat("   - Observe how layout scales\n\n")

cat("2. COLOR BY HEALTH STATUS:\n")
cat("   - Add 'health_status' column (Normal/Warning/Critical)\n")
cat("   - Color sensor lines by health status\n")
cat("   - Use red/yellow/green with scale_color_manual()\n\n")

cat("3. HIGHLIGHT PROBLEM PERIODS:\n")
cat("   - Add geom_rect() to shade weekend periods\n")
cat("   - Apply across all facets\n")
cat("   - Shows HVAC setback schedule building-wide\n\n")

cat("4. THRESHOLD LINES:\n")
cat("   - Add geom_hline() with zone-specific thresholds\n")
cat("   - Server: ±1°C | Office: ±2°C | Lab: ±1.5°C | Common: ±3°C\n")
cat("   - Use data frame with zone-specific limits\n\n")

cat("5. MIXED VISUALIZATION:\n")
cat("   - Combine time series and distributions\n")
cat("   - Use facet_grid(plot_type ~ sensor_id)\n")
cat("   - Temporal and statistical views together\n\n")

cat("6. DYNAMIC LABELS:\n")
cat("   - Create labeller including current temperature\n")
cat("   - Format: 'Server Room (Current: 20.5°C)'\n")
cat("   - Update with latest sensor reading\n\n")


# ==============================================================================
# NEXT CHAPTER PREVIEW
# ==============================================================================

cat("\n=== Coming in Chapter 6 ===\n")
cat("Bar charts and categorical sensor data:\n")
cat("- Visualizing sensor states (ON/OFF, Normal/Warning/Critical)\n")
cat("- Alert frequency and downtime statistics\n")
cat("- Grouped and stacked bars for multi-category comparisons\n")
cat("- Horizontal bars for sensor ranking by performance\n")
cat("- Sensor fleet operational metrics\n")
cat("- Status dashboards with counts and percentages\n\n")

cat("Files for this chapter:\n")
cat("- docs/chapter05.md: Documentation and explanations\n")
cat("- codes/chapter05.R: This executable code file\n\n")
