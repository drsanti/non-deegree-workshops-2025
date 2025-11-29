# Workshop 03: Data Generation and Simulation

**Duration:** 60-75 minutes  
**Level:** Beginner to Intermediate

## Introduction

In real-world scenarios, you often need to generate synthetic data for testing, simulation, or when actual data isn't available. This workshop teaches you how to generate realistic IoT sensor data, create time series data, and simulate various types of device readings. These skills are essential for data analysis, algorithm testing, and creating demonstrations.

## What You'll Learn

- Generating random numbers in R
- Creating synthetic IoT sensor data
- Simulating time series data
- Generating realistic device readings (temperature, humidity, pressure)
- Adding noise and variation to simulated data
- Creating datasets with multiple sensors

## Prerequisites

Before starting, you should have:
- Completed Workshop 01: R Programming Fundamentals
- Completed Workshop 02: Data Structures in R
- Understanding of vectors and data frames

## Step-by-Step Instructions

### Step 1: Random Number Generation

R provides several functions for generating random numbers:

```r
# Set seed for reproducibility
set.seed(123)

# Uniform distribution (between 0 and 1)
runif(10)

# Uniform distribution with range
runif(10, min = 20, max = 30)

# Normal distribution
rnorm(10, mean = 25, sd = 2)

# Other distributions
rbinom(10, size = 1, prob = 0.5)  # Binomial
rexp(10, rate = 0.5)  # Exponential
rpois(10, lambda = 5)  # Poisson
```

### Step 2: Generating Temperature Sensor Data

Create realistic temperature readings:

```r
# Generate temperature data with normal distribution
set.seed(123)
n_readings <- 100
base_temp <- 22
temp_sd <- 2

temperatures <- rnorm(n_readings, mean = base_temp, sd = temp_sd)

# Add some daily variation (simulate day/night cycle)
hours <- 1:n_readings
daily_variation <- 3 * sin(2 * pi * hours / 24)
temperatures_with_cycle <- base_temp + daily_variation + rnorm(n_readings, 0, 1)

# Create a data frame
temp_data <- data.frame(
  timestamp = 1:n_readings,
  temperature = temperatures_with_cycle
)
```

### Step 3: Generating Multiple Sensor Types

Create data for different sensor types:

```r
set.seed(123)
n <- 50

# Temperature (20-30 degrees, normal distribution)
temperature <- rnorm(n, mean = 25, sd = 2)
temperature <- pmax(20, pmin(30, temperature))  # Clamp between 20-30

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
```

### Step 4: Simulating Multiple IoT Devices

Generate data for multiple devices:

```r
set.seed(123)
n_devices <- 5
n_readings_per_device <- 20

# Create device IDs
device_ids <- paste0("IoT-", sprintf("%03d", 1:n_devices))

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
                    replace = TRUE, prob = c(0.9, 0.1))
  )
  
  all_data <- rbind(all_data, device_readings)
}
```

### Step 5: Time Series Data Generation

Create time-stamped data:

```r
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
  value = time_series_data
)
```

### Step 6: Adding Realistic Patterns

Create data with realistic patterns (seasonal, trends, anomalies):

```r
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
```

### Step 7: Correlated Sensor Data

Generate data where sensors are correlated (e.g., temperature and humidity):

```r
set.seed(123)
n <- 50

# Generate correlated data
temperature <- rnorm(n, mean = 25, sd = 2)

# Humidity inversely correlated with temperature
humidity <- 60 - 0.8 * (temperature - 25) + rnorm(n, 0, 3)
humidity <- pmax(30, pmin(70, humidity))  # Keep in reasonable range

correlated_data <- data.frame(
  reading_id = 1:n,
  temperature = round(temperature, 2),
  humidity = round(humidity, 1)
)

# Check correlation
cor(correlated_data$temperature, correlated_data$humidity)
```

## Exercises

1. **Basic Sensor Data:**
   - Generate 100 temperature readings between 20-30 degrees
   - Add a daily cycle (higher during day, lower at night)
   - Create a data frame with timestamp and temperature

2. **Multiple Devices:**
   - Generate data for 3 IoT devices
   - Each device should have 30 readings
   - Include: device_id, timestamp, temperature, humidity
   - Each device should have different base characteristics

3. **Time Series with Patterns:**
   - Create a 7-day hourly dataset (168 hours)
   - Include daily cycles and a weekly trend
   - Add 3 random anomalies
   - Visualize the data (basic plot)

4. **Correlated Sensors:**
   - Generate temperature and pressure data
   - Make pressure inversely correlated with temperature
   - Create a data frame and verify the correlation

## Summary

In this workshop, you've learned:
- How to generate random numbers using various distributions
- Creating synthetic IoT sensor data
- Simulating time series with patterns and trends
- Generating data for multiple devices
- Adding realistic variations and correlations
- Creating datasets ready for analysis

## Next Steps

- Review the example code in `examples/03-data-generation.r`
- Experiment with different distributions and parameters
- Move on to Workshop 04: Data Import and Export

## Additional Resources

- R Random Number Generation: https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Distributions.html
- Time Series in R: https://www.statmethods.net/advstats/timeseries.html
