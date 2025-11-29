# Workshop 03: Data Generation and Simulation
# This script demonstrates how to generate synthetic IoT sensor data

# ============================================================================
# 1. Random Number Generation
# ============================================================================

cat("=== Random Number Generation ===\n")

# Set seed for reproducibility
set.seed(123)

# Uniform distribution (between 0 and 1)
cat("Uniform (0-1):", runif(10), "\n")

# Uniform distribution with range
cat("Uniform (20-30):", runif(10, min = 20, max = 30), "\n")

# Normal distribution
cat("Normal (mean=25, sd=2):", rnorm(10, mean = 25, sd = 2), "\n")

# Other distributions
cat("Binomial:", rbinom(10, size = 1, prob = 0.5), "\n")
cat("Poisson:", rpois(10, lambda = 5), "\n")

# ============================================================================
# 2. Generating Temperature Sensor Data
# ============================================================================

cat("\n=== Temperature Sensor Data ===\n")

set.seed(123)
n_readings <- 100
base_temp <- 22
temp_sd <- 2

# Simple normal distribution
temperatures <- rnorm(n_readings, mean = base_temp, sd = temp_sd)
cat("First 10 temperatures:", temperatures[1:10], "\n")
cat("Mean:", mean(temperatures), "\n")
cat("SD:", sd(temperatures), "\n")

# Add daily variation (simulate day/night cycle)
hours <- 1:n_readings
daily_variation <- 3 * sin(2 * pi * hours / 24)
temperatures_with_cycle <- base_temp + daily_variation + rnorm(n_readings, 0, 1)

# Create a data frame
temp_data <- data.frame(
  timestamp = 1:n_readings,
  temperature = round(temperatures_with_cycle, 2)
)

cat("\nTemperature Data (first 10 rows):\n")
print(head(temp_data, 10))

# ============================================================================
# 3. Generating Multiple Sensor Types
# ============================================================================

cat("\n=== Multiple Sensor Types ===\n")

set.seed(123)
n <- 50

# Temperature (20-30 degrees, normal distribution)
temperature <- rnorm(n, mean = 25, sd = 2)
temperature <- pmax(20, pmin(30, temperature)) # Clamp between 20-30

# Humidity (40-60%, uniform distribution)
humidity <- runif(n, min = 40, max = 60)

# Pressure (1000-1020 hPa, normal distribution)
pressure <- rnorm(n, mean = 1013, sd = 5)
pressure <- pmax(1000, pmin(1020, pressure))

# Create sensor data frame
sensor_data <- data.frame(
  reading_id = 1:n,
  temperature = round(temperature, 2),
  humidity = round(humidity, 1),
  pressure = round(pressure, 1)
)

cat("Sensor Data (first 10 rows):\n")
print(head(sensor_data, 10))

cat("\nSummary Statistics:\n")
print(summary(sensor_data))

# ============================================================================
# 4. Simulating Multiple IoT Devices
# ============================================================================

cat("\n=== Multiple IoT Devices ===\n")

set.seed(123)
n_devices <- 5
n_readings_per_device <- 20

# Create device IDs
device_ids <- paste0("IoT-", sprintf("%03d", 1:n_devices))
cat("Device IDs:", device_ids, "\n")

# Generate data for each device
all_data <- data.frame()

for (device_id in device_ids) {
  # Each device has slightly different characteristics
  base_temp <- runif(1, 22, 26)

  device_readings <- data.frame(
    device_id = device_id,
    timestamp = 1:n_readings_per_device,
    temperature = rnorm(n_readings_per_device, mean = base_temp, sd = 1.5),
    humidity = runif(n_readings_per_device, 45, 55),
    status = sample(c("online", "offline"), n_readings_per_device,
      replace = TRUE, prob = c(0.9, 0.1)
    )
  )

  all_data <- rbind(all_data, device_readings)
}

cat("\nMulti-Device Data (first 15 rows):\n")
print(head(all_data, 15))

cat("\nDevice Summary:\n")
print(table(all_data$device_id, all_data$status))

# ============================================================================
# 5. Time Series Data Generation
# ============================================================================

cat("\n=== Time Series Data ===\n")

# Generate timestamps
start_time <- as.POSIXct("2024-01-01 00:00:00")
timestamps <- seq(start_time, by = "1 hour", length.out = 100)

# Generate time series with trend
set.seed(123)
trend <- seq(20, 25, length.out = 100)
noise <- rnorm(100, 0, 1)
time_series_data <- trend + noise

# Create time series data frame
ts_data <- data.frame(
  timestamp = timestamps,
  value = round(time_series_data, 2)
)

cat("Time Series Data (first 10 rows):\n")
print(head(ts_data, 10))

# ============================================================================
# 6. Adding Realistic Patterns
# ============================================================================

cat("\n=== Realistic Patterns ===\n")

set.seed(123)
n <- 100
hours <- 1:n

# Base temperature with daily cycle
base_temp <- 22
daily_cycle <- 3 * sin(2 * pi * hours / 24)

# Weekly trend (slight increase)
weekly_trend <- 0.02 * hours

# Random noise
noise <- rnorm(n, 0, 1)

# Combine all components
temperature <- base_temp + daily_cycle + weekly_trend + noise

# Add occasional anomalies (outliers)
anomaly_indices <- sample(1:n, 5)
temperature[anomaly_indices] <- temperature[anomaly_indices] + sample(c(-5, 5), 5, replace = TRUE)

# Create final dataset
realistic_data <- data.frame(
  hour = hours,
  temperature = round(temperature, 2),
  is_anomaly = 1:n %in% anomaly_indices
)

cat("Realistic Data (first 10 rows):\n")
print(head(realistic_data, 10))

cat("\nAnomalies detected at hours:", realistic_data$hour[realistic_data$is_anomaly], "\n")

# ============================================================================
# 7. Correlated Sensor Data
# ============================================================================

cat("\n=== Correlated Sensor Data ===\n")

set.seed(123)
n <- 50

# Generate correlated data
temperature <- rnorm(n, mean = 25, sd = 2)

# Humidity inversely correlated with temperature
humidity <- 60 - 0.8 * (temperature - 25) + rnorm(n, 0, 3)
humidity <- pmax(30, pmin(70, humidity)) # Keep in reasonable range

correlated_data <- data.frame(
  reading_id = 1:n,
  temperature = round(temperature, 2),
  humidity = round(humidity, 1)
)

cat("Correlated Data (first 10 rows):\n")
print(head(correlated_data, 10))

# Check correlation
correlation <- cor(correlated_data$temperature, correlated_data$humidity)
cat("\nCorrelation between temperature and humidity:", round(correlation, 3), "\n")

# ============================================================================
# Exercise Solutions
# ============================================================================

cat("\n=== Exercise 1: Basic Sensor Data ===\n")
set.seed(123)
n <- 100
hours <- 1:n
daily_cycle <- 3 * sin(2 * pi * hours / 24)
base_temp <- 25
temperatures <- base_temp + daily_cycle + rnorm(n, 0, 1)
temperatures <- pmax(20, pmin(30, temperatures))

exercise1_data <- data.frame(
  timestamp = seq(as.POSIXct("2024-01-01 00:00:00"), by = "1 hour", length.out = n),
  temperature = round(temperatures, 2)
)

cat("Exercise 1 Data (first 10 rows):\n")
print(head(exercise1_data, 10))

cat("\n=== Exercise 2: Multiple Devices ===\n")
set.seed(123)
devices <- c("IoT-001", "IoT-002", "IoT-003")
exercise2_data <- data.frame()

for (device in devices) {
  base_temp <- runif(1, 22, 26)
  base_humidity <- runif(1, 45, 55)

  device_data <- data.frame(
    device_id = device,
    timestamp = 1:30,
    temperature = round(rnorm(30, mean = base_temp, sd = 1.5), 2),
    humidity = round(runif(30, base_humidity - 5, base_humidity + 5), 1)
  )

  exercise2_data <- rbind(exercise2_data, device_data)
}

cat("Exercise 2 Data (first 15 rows):\n")
print(head(exercise2_data, 15))

cat("\n=== Exercise 3: Time Series with Patterns ===\n")
set.seed(123)
n <- 168 # 7 days * 24 hours
hours <- 1:n
daily_cycle <- 3 * sin(2 * pi * hours / 24)
weekly_trend <- seq(20, 23, length.out = n)
noise <- rnorm(n, 0, 1)
values <- weekly_trend + daily_cycle + noise

# Add anomalies
anomaly_indices <- sample(1:n, 3)
values[anomaly_indices] <- values[anomaly_indices] + sample(c(-6, 6), 3, replace = TRUE)

exercise3_data <- data.frame(
  hour = hours,
  value = round(values, 2),
  is_anomaly = 1:n %in% anomaly_indices
)

cat("Exercise 3 Data (first 10 rows):\n")
print(head(exercise3_data, 10))
cat("Anomalies at hours:", exercise3_data$hour[exercise3_data$is_anomaly], "\n")

cat("\n=== Exercise 4: Correlated Sensors ===\n")
set.seed(123)
n <- 50
temperature <- rnorm(n, mean = 25, sd = 2)
pressure <- 1013 - 0.5 * (temperature - 25) + rnorm(n, 0, 2)
pressure <- pmax(1000, pmin(1020, pressure))

exercise4_data <- data.frame(
  reading_id = 1:n,
  temperature = round(temperature, 2),
  pressure = round(pressure, 1)
)

correlation <- cor(exercise4_data$temperature, exercise4_data$pressure)
cat("Temperature-Pressure Correlation:", round(correlation, 3), "\n")
cat("Exercise 4 Data (first 10 rows):\n")
print(head(exercise4_data, 10))
