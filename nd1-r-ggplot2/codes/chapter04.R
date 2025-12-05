# ==============================================================================
# Chapter 4: Scatter Plots and Sensor Correlation Analysis
# R Code for all examples
# ==============================================================================


# Load required libraries
library(ggplot2)

# Set seed for reproducibility
set.seed(42)

# ==============================================================================
# DATA GENERATION - Correlated Environmental Sensors
# ==============================================================================

# Generate synthetic data from smart building multi-sensor system
# Scenario: Synchronized temperature, humidity, and CO2 sensors
# Duration: 500 hourly readings (~3 weeks)
# Variables interact through HVAC operation and occupancy

generate_multisensor_correlation_data <- function() {
  n <- 500  # 500 hourly readings
  
  # Time features
  timestamps <- seq(
    from = as.POSIXct("2024-12-01 00:00:00", tz = "UTC"),
    by = "hour",
    length.out = n
  )
  
  hour_of_day <- as.numeric(format(timestamps, "%H"))  # 0-23
  day_of_week <- as.numeric(format(timestamps, "%u"))  # 1=Mon, 7=Sun
  is_weekend <- day_of_week >= 6
  is_business_hours <- (hour_of_day >= 8 & hour_of_day < 18) & !is_weekend
  
  # ===========================================================================
  # OCCUPANCY SIMULATION
  # ===========================================================================
  # Base occupancy pattern
  base_occupancy <- ifelse(is_business_hours, 30, 2)  # 30 people during work, 2 at night
  occupancy_noise <- rnorm(n, mean = 0, sd = 5)
  occupancy <- pmax(0, base_occupancy + occupancy_noise)  # No negative occupancy
  
  # Weekend is lower even during day
  occupancy <- ifelse(is_weekend & hour_of_day >= 8 & hour_of_day < 18, 
                      occupancy * 0.3, occupancy)
  
  # ===========================================================================
  # CO2 CONCENTRATION (ppm)
  # ===========================================================================
  # CO2 strongly correlated with occupancy
  # Background: 400-450 ppm (outdoor air)
  # Per person contribution: ~40-60 ppm in steady state
  
  co2_background <- 420
  co2_per_person <- 45
  co2_base <- co2_background + (occupancy * co2_per_person)
  
  # Ventilation effect (reduces CO2, time-lagged)
  ventilation_factor <- ifelse(is_business_hours, 0.85, 0.95)  # Better ventilation during work
  co2_base <- co2_base * ventilation_factor
  
  # Measurement noise
  co2_noise <- rnorm(n, mean = 0, sd = 30)
  co2 <- co2_base + co2_noise
  co2 <- pmax(400, pmin(1200, co2))  # Clamp to realistic range
  
  # ===========================================================================
  # TEMPERATURE (°C)
  # ===========================================================================
  # Base temperature with daily cycle
  temp_base <- 21  # Target setpoint
  
  # Daily cycle (HVAC setback at night)
  daily_cycle <- 2 * sin(2 * pi * (hour_of_day - 6) / 24)
  
  # Occupancy heat gain (~0.1°C per person)
  occupancy_heat <- occupancy * 0.08
  
  # HVAC response (tries to maintain setpoint, but lags)
  hvac_offset <- ifelse(is_business_hours, -1, 0.5)  # Cooler during day
  
  # Weekend setback (energy saving)
  weekend_offset <- ifelse(is_weekend, 1.5, 0)
  
  temperature <- temp_base + daily_cycle + occupancy_heat + hvac_offset + 
                 weekend_offset + rnorm(n, 0, 0.5)
  
  # Clamp to realistic range
  temperature <- pmax(18, pmin(26, temperature))
  
  # ===========================================================================
  # HUMIDITY (%)
  # ===========================================================================
  # Relative humidity inversely related to temperature (psychrometric effect)
  # When air is warmed, relative humidity drops (absolute humidity constant)
  
  # Base humidity
  humidity_base <- 50
  
  # Temperature effect (negative correlation: -2.5% RH per °C)
  temp_effect <- -2.5 * (temperature - 21)
  
  # Occupancy adds moisture
  occupancy_moisture <- occupancy * 0.15
  
  # HVAC dehumidification during cooling
  hvac_dehumid <- ifelse(is_business_hours, -3, 0)
  
  humidity <- humidity_base + temp_effect + occupancy_moisture + 
              hvac_dehumid + rnorm(n, 0, 3)
  
  # Clamp to realistic range
  humidity <- pmax(30, pmin(70, humidity))
  
  # ===========================================================================
  # HVAC STATE
  # ===========================================================================
  hvac_state <- rep("idle", n)
  hvac_state[temperature > 23 & is_business_hours] <- "cooling"
  hvac_state[temperature < 20 & is_business_hours] <- "heating"
  hvac_state[co2 > 800] <- "ventilating"
  hvac_state <- factor(hvac_state, levels = c("idle", "heating", "cooling", "ventilating"))
  
  # ===========================================================================
  # Create data frame
  # ===========================================================================
  data <- data.frame(
    timestamp = timestamps,
    hour = 1:n,
    hour_of_day = hour_of_day,
    day_of_week = day_of_week,
    is_weekend = is_weekend,
    is_business_hours = is_business_hours,
    temperature = temperature,
    humidity = humidity,
    co2 = co2,
    occupancy = round(occupancy, 1),
    hvac_state = hvac_state,
    stringsAsFactors = FALSE
  )
  
  return(data)
}

# Generate the correlation data
sensor_data <- generate_multisensor_correlation_data()

# Quick look at the data
cat("=== Multi-Sensor Correlation Data Generated ===\n")
head(sensor_data, 10)
cat("\n")

# Summary statistics
cat("=== Sensor Statistics ===\n")
cat("Temperature: ", round(mean(sensor_data$temperature), 2), "°C (SD:", 
    round(sd(sensor_data$temperature), 2), ")\n")
cat("Humidity: ", round(mean(sensor_data$humidity), 2), "% (SD:", 
    round(sd(sensor_data$humidity), 2), ")\n")
cat("CO2: ", round(mean(sensor_data$co2), 2), "ppm (SD:", 
    round(sd(sensor_data$co2), 2), ")\n")
cat("Occupancy: ", round(mean(sensor_data$occupancy), 2), "people (SD:", 
    round(sd(sensor_data$occupancy), 2), ")\n\n")

# Correlation matrix
cat("=== Correlation Matrix ===\n")
cor_vars <- sensor_data[, c("temperature", "humidity", "co2", "occupancy")]
cor_matrix <- cor(cor_vars)
print(round(cor_matrix, 3))
cat("\n")


# ==============================================================================
# EXAMPLE 1: Basic Scatter Plot - Temperature vs. Humidity
# ==============================================================================
# Objective: Visualize fundamental relationship between temp and humidity
# New concepts: geom_point() for scatter plot, bivariate data
# IoT Context: Verify sensors show expected negative correlation

example1 <- ggplot(sensor_data, aes(x = temperature, y = humidity)) +
  geom_point(alpha = 0.5, size = 2) +
  labs(
    title = "Temperature vs. Humidity Correlation",
    subtitle = "Smart Building Environmental Sensors - 500 hourly readings",
    x = "Temperature (°C)",
    y = "Relative Humidity (%)",
    caption = "Each point represents one synchronized sensor reading"
  ) +
  theme_minimal()

print(example1)

# Calculate correlation
cor_temp_humid <- cor(sensor_data$temperature, sensor_data$humidity)
cat("Temperature-Humidity Correlation: r =", round(cor_temp_humid, 3), "\n\n")


# ==============================================================================
# EXAMPLE 2: Add Linear Trend Line with Confidence Interval
# ==============================================================================
# Objective: Quantify correlation strength with regression
# New concepts: geom_smooth(method = "lm"), se for confidence interval
# IoT Context: Calculate humidity change per degree temperature change

example2 <- ggplot(sensor_data, aes(x = temperature, y = humidity)) +
  geom_point(alpha = 0.4, size = 2, color = "gray50") +
  geom_smooth(method = "lm", se = TRUE, color = "#2E86C1", fill = "#2E86C1", 
              alpha = 0.2, linewidth = 1.2) +
  labs(
    title = "Temperature-Humidity Correlation with Linear Regression",
    subtitle = paste("Correlation coefficient: r =", round(cor_temp_humid, 3)),
    x = "Temperature (°C)",
    y = "Relative Humidity (%)",
    caption = "Blue line: linear regression | Shaded area: 95% confidence interval"
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(size = 14, face = "bold"),
    plot.subtitle = element_text(size = 11, color = "gray40")
  )

print(example2)

# Regression model
model_temp_humid <- lm(humidity ~ temperature, data = sensor_data)
cat("=== Linear Regression: Humidity ~ Temperature ===\n")
print(summary(model_temp_humid))
cat("\n")


# ==============================================================================
# EXAMPLE 3: Color Points by Third Variable (Time of Day)
# ==============================================================================
# Objective: Show how correlation varies by time of day
# New concepts: aes(color = ...), scale_color_gradient()
# IoT Context: Understand if relationship differs during occupied hours

example3 <- ggplot(sensor_data, aes(x = temperature, y = humidity, color = hour_of_day)) +
  geom_point(alpha = 0.6, size = 2.5) +
  geom_smooth(method = "lm", se = FALSE, color = "black", linetype = "dashed", linewidth = 1) +
  scale_color_gradient(low = "#2C3E50", high = "#F39C12", 
                       name = "Hour of Day",
                       breaks = c(0, 6, 12, 18, 23),
                       labels = c("Midnight", "6 AM", "Noon", "6 PM", "11 PM")) +
  labs(
    title = "Temperature-Humidity Correlation by Time of Day",
    subtitle = "Dark points = night (unoccupied) | Light points = day (occupied)",
    x = "Temperature (°C)",
    y = "Relative Humidity (%)"
  ) +
  theme_minimal() +
  theme(
    legend.position = "right",
    plot.title = element_text(size = 14, face = "bold")
  )

print(example3)


# ==============================================================================
# EXAMPLE 4: CO2 vs. Occupancy with Trend Line
# ==============================================================================
# Objective: Validate CO2 sensor against occupancy counting
# New concepts: Different sensor pair, strong positive correlation
# IoT Context: Verify CO2 can be used as occupancy proxy

example4 <- ggplot(sensor_data, aes(x = occupancy, y = co2)) +
  geom_point(alpha = 0.5, size = 2.5, color = "#27AE60") +
  geom_smooth(method = "lm", se = TRUE, color = "#E74C3C", fill = "#E74C3C",
              alpha = 0.2, linewidth = 1.2) +
  labs(
    title = "CO2 vs. Occupancy - Sensor Validation",
    subtitle = paste("Strong positive correlation: r =", 
                     round(cor(sensor_data$occupancy, sensor_data$co2), 3)),
    x = "Occupancy (number of people)",
    y = "CO2 Concentration (ppm)",
    caption = "Slope indicates CO2 increase per person | Useful for occupancy estimation"
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(size = 14, face = "bold"),
    plot.subtitle = element_text(size = 11, color = "gray40")
  )

print(example4)

# Regression model
model_co2_occ <- lm(co2 ~ occupancy, data = sensor_data)
cat("=== Linear Regression: CO2 ~ Occupancy ===\n")
cat("CO2 increase per person:", round(coef(model_co2_occ)[2], 1), "ppm\n")
cat("Background CO2:", round(coef(model_co2_occ)[1], 1), "ppm\n\n")


# ==============================================================================
# EXAMPLE 5: Faceted Correlation Matrix
# ==============================================================================
# Objective: Compare multiple sensor pairs simultaneously
# New concepts: facet_grid() for correlation matrix layout
# IoT Context: Comprehensive view of all pairwise relationships

# Prepare data in long format for faceting
library(tidyr)
library(dplyr)

# Create all pairwise combinations
sensor_pairs <- sensor_data %>%
  select(hour, temperature, humidity, co2) %>%
  pivot_longer(cols = c(temperature, humidity, co2), 
               names_to = "variable", 
               values_to = "value")

# Create second set for pairing
sensor_pairs2 <- sensor_data %>%
  select(hour, temperature, humidity, co2) %>%
  pivot_longer(cols = c(temperature, humidity, co2), 
               names_to = "variable2", 
               values_to = "value2")

# Combine
sensor_matrix <- expand.grid(
  temp = sensor_data$temperature,
  humid = sensor_data$humidity,
  co2_val = sensor_data$co2
)

# Create faceted plot (simplified version - 3 key pairs)
example5_data <- data.frame(
  x = c(sensor_data$temperature, sensor_data$temperature, sensor_data$humidity),
  y = c(sensor_data$humidity, sensor_data$co2, sensor_data$co2),
  pair = factor(rep(c("Temp vs Humidity", "Temp vs CO2", "Humidity vs CO2"), 
                    each = nrow(sensor_data)))
)

example5 <- ggplot(example5_data, aes(x = x, y = y)) +
  geom_point(alpha = 0.3, size = 1.5, color = "#3498DB") +
  geom_smooth(method = "lm", se = FALSE, color = "#E74C3C", linewidth = 1) +
  facet_wrap(~ pair, scales = "free", ncol = 3) +
  labs(
    title = "Sensor Correlation Matrix - All Pairwise Relationships",
    subtitle = "Comprehensive view of environmental sensor interactions",
    x = "Sensor 1",
    y = "Sensor 2"
  ) +
  theme_minimal() +
  theme(
    strip.background = element_rect(fill = "gray90", color = NA),
    strip.text = element_text(face = "bold", size = 10),
    plot.title = element_text(size = 14, face = "bold")
  )

print(example5)


# ==============================================================================
# EXAMPLE 6 (BONUS): Advanced Correlation with Ellipses and Annotations
# ==============================================================================
# Objective: Publication-quality correlation plot with statistics
# New concepts: stat_ellipse(), annotate() for correlation coefficient
# IoT Context: Professional sensor relationship documentation

# Calculate correlation and p-value
cor_test_result <- cor.test(sensor_data$temperature, sensor_data$humidity)
r_value <- cor_test_result$estimate
p_value <- cor_test_result$p.value

example6 <- ggplot(sensor_data, aes(x = temperature, y = humidity)) +
  geom_point(alpha = 0.4, size = 2, color = "gray40") +
  geom_smooth(method = "lm", se = TRUE, color = "#2E86C1", fill = "#2E86C1",
              alpha = 0.15, linewidth = 1.3) +
  stat_ellipse(level = 0.95, color = "#E74C3C", linewidth = 1.2, linetype = "dashed") +
  annotate("text", x = 24.5, y = 65, 
           label = paste("r =", round(r_value, 3)), 
           size = 5, fontface = "bold", color = "#2E86C1") +
  annotate("text", x = 24.5, y = 62, 
           label = paste("p <", format.pval(p_value, digits = 2)), 
           size = 4, color = "gray30") +
  annotate("text", x = 24.5, y = 59, 
           label = "95% CI ellipse", 
           size = 3.5, color = "#E74C3C") +
  labs(
    title = "Temperature-Humidity Correlation Analysis",
    subtitle = "Smart Building HVAC System Performance",
    x = "Temperature (°C)",
    y = "Relative Humidity (%)",
    caption = "Statistical significance: p < 0.001 | Strong negative correlation confirms HVAC physics"
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(size = 14, face = "bold"),
    plot.subtitle = element_text(size = 11, color = "gray40"),
    plot.caption = element_text(size = 9, hjust = 0, color = "gray50")
  )

print(example6)


# ==============================================================================
# SUMMARY AND KEY TAKEAWAYS
# ==============================================================================

cat("\n=== Chapter 4 Summary ===\n")
cat("Topics covered:\n")
cat("1. Scatter plots for bivariate sensor relationships\n")
cat("2. Linear regression and trend lines for correlation quantification\n")
cat("3. Multi-variable visualization with color aesthetics\n")
cat("4. Correlation matrices for comprehensive sensor analysis\n")
cat("5. Statistical annotations and confidence regions\n\n")

cat("Key correlations found:\n")
cat("- Temperature vs Humidity: r =", round(cor(sensor_data$temperature, sensor_data$humidity), 3), 
    "(negative, physics-based)\n")
cat("- CO2 vs Occupancy: r =", round(cor(sensor_data$co2, sensor_data$occupancy), 3), 
    "(strong positive, occupancy proxy)\n")
cat("- Temperature vs CO2: r =", round(cor(sensor_data$temperature, sensor_data$co2), 3), 
    "(weak, indirect through occupancy)\n\n")

cat("ggplot2 functions introduced:\n")
cat("- geom_point(): Scatter plots\n")
cat("- geom_smooth(method = 'lm'): Linear regression lines\n")
cat("- stat_ellipse(): Correlation confidence regions\n")
cat("- scale_color_gradient(): Continuous variable color mapping\n")
cat("- facet_wrap(): Correlation matrix layouts\n")
cat("- annotate(): Statistical annotations\n\n")


# ==============================================================================
# PRACTICE EXERCISES
# ==============================================================================

cat("=== Practice Exercises ===\n")
cat("Try these to deepen your understanding:\n\n")

cat("1. CORRELATION CALCULATIONS:\n")
cat("   - Calculate all pairwise correlations with cor()\n")
cat("   - Test significance with cor.test()\n")
cat("   - Create a correlation coefficient matrix visualization\n\n")

cat("2. HVAC MODE COMPARISON:\n")
cat("   - Color points by hvac_state (cooling, heating, idle)\n")
cat("   - Add separate trend lines per mode\n")
cat("   - Does temp-humidity correlation differ by mode?\n\n")

cat("3. TIME-LAGGED CORRELATION:\n")
cat("   - Create lagged CO2: co2_lag1 <- lag(sensor_data$co2, 1)\n")
cat("   - Plot occupancy vs lagged CO2\n")
cat("   - Compare correlation with and without lag\n\n")

cat("4. RESIDUAL ANALYSIS:\n")
cat("   - Fit model: model <- lm(humidity ~ temperature)\n")
cat("   - Plot residuals vs fitted values\n")
cat("   - Check for heteroscedasticity or patterns\n\n")

cat("5. SENSOR REDUNDANCY:\n")
cat("   - If two temp sensors available, plot temp1 vs temp2\n")
cat("   - r > 0.95 indicates good sensor agreement\n")
cat("   - Identify drift if correlation drops\n\n")


# ==============================================================================
# NEXT CHAPTER PREVIEW
# ==============================================================================

cat("\n=== Coming in Chapter 5 ===\n")
cat("Faceting and small multiples for large sensor arrays:\n")
cat("- Visualizing 8-12 sensors with facet_wrap()\n")
cat("- Hierarchical layouts with facet_grid(floor ~ zone)\n")
cat("- Free vs fixed scales for different sensor ranges\n")
cat("- Custom facet labels with sensor metadata\n")
cat("- Multi-panel monitoring dashboards\n\n")

cat("Files for this chapter:\n")
cat("- docs/chapter04.md: Documentation and explanations\n")
cat("- codes/chapter04.R: This executable code file\n\n")
