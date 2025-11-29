# Workshop 08: Time Series Analysis
# This script demonstrates time series analysis techniques

# Install and load required libraries
# Install packages if not already installed
required_packages <- c("lubridate", "zoo", "ggplot2")
for (pkg in required_packages) {
  if (!require(pkg, character.only = TRUE, quietly = TRUE)) {
    cat("Installing", pkg, "package...\n")
    install.packages(pkg)
  }
}

# Load libraries
library(lubridate)
library(zoo)
library(ggplot2)

# ============================================================================
# Setup: Create Sample Time Series Data
# ============================================================================

cat("=== Creating Sample Time Series Data ===\n")

set.seed(123)
# Create hourly data for 30 days
start_date <- ymd_hms("2024-01-01 00:00:00")
timestamps <- seq(start_date, by = "1 hour", length.out = 720)  # 30 days * 24 hours

# Generate temperature with trend and seasonality
n <- length(timestamps)
trend <- seq(20, 25, length.out = n)
daily_seasonal <- 3 * sin(2 * pi * (1:n) / 24)  # Daily cycle
weekly_seasonal <- 1 * sin(2 * pi * (1:n) / 168)  # Weekly cycle
noise <- rnorm(n, 0, 1)
temperature <- trend + daily_seasonal + weekly_seasonal + noise

ts_df <- data.frame(
  timestamp = timestamps,
  temperature = round(temperature, 2),
  humidity = round(50 - 0.5 * (temperature - 22.5) + rnorm(n, 0, 3), 1)
)

cat("Time series data created:", nrow(ts_df), "rows\n")
cat("Date range:", as.character(min(ts_df$timestamp)), "to", 
    as.character(max(ts_df$timestamp)), "\n")

# ============================================================================
# 1. Working with Dates and Times
# ============================================================================

cat("\n=== Working with Dates and Times ===\n")

# Parse dates
date1 <- as.Date("2024-01-15")
date2 <- ymd("2024-01-15")
cat("Date parsed:", as.character(date2), "\n")

# Parse date-time
datetime1 <- ymd_hms("2024-01-15 14:30:00")
cat("DateTime parsed:", as.character(datetime1), "\n")

# Extract components
cat("\nDate components:\n")
cat("Year:", year(date2), "\n")
cat("Month:", month(date2), "\n")
cat("Day:", day(date2), "\n")
cat("Hour:", hour(datetime1), "\n")
cat("Minute:", minute(datetime1), "\n")
cat("Day of week:", wday(date2, label = TRUE), "\n")

# Add date components to data frame
ts_df$year <- year(ts_df$timestamp)
ts_df$month <- month(ts_df$timestamp)
ts_df$day <- day(ts_df$timestamp)
ts_df$hour <- hour(ts_df$timestamp)
ts_df$day_of_week <- wday(ts_df$timestamp, label = TRUE)

cat("\nDate components added to data frame\n")
cat("First few rows:\n")
print(head(ts_df[, c("timestamp", "year", "month", "day", "hour", "day_of_week")], 5))

# ============================================================================
# 2. Creating Time Series Objects
# ============================================================================

cat("\n=== Creating Time Series Objects ===\n")

# Create time series from vector (hourly data, frequency = 24)
ts_data <- ts(ts_df$temperature, start = c(2024, 1), frequency = 24)
cat("Time series object created\n")
cat("Frequency:", frequency(ts_data), "\n")
cat("Start:", start(ts_data), "\n")
cat("End:", end(ts_data), "\n")

# Using zoo package
zoo_data <- zoo(ts_df$temperature, ts_df$timestamp)
cat("\nZoo object created:", length(zoo_data), "observations\n")

# Using xts (if available)
if (require(xts, quietly = TRUE)) {
  library(xts)
  xts_data <- xts(ts_df$temperature, ts_df$timestamp)
  cat("XTS object created:", length(xts_data), "observations\n")
} else {
  cat("xts package not installed (optional)\n")
}

# ============================================================================
# 3. Time Series Visualization
# ============================================================================

cat("\n=== Time Series Visualization ===\n")

# Basic time series plot
cat("Creating basic time series plot...\n")
plot(ts_data, main = "Temperature Time Series", ylab = "Temperature (°C)")

# Using ggplot2
p1 <- ggplot(ts_df[1:168, ], aes(x = timestamp, y = temperature)) +  # First week
  geom_line(color = "steelblue", size = 1) +
  labs(title = "Temperature Over Time (First Week)",
       x = "Time",
       y = "Temperature (°C)") +
  theme_minimal()
cat("ggplot2 time series plot created\n")

# Multiple time series (if we had multiple devices)
# This is a placeholder for demonstration
cat("Multiple time series visualization code demonstrated\n")

# ============================================================================
# 4. Trend Analysis
# ============================================================================

cat("\n=== Trend Analysis ===\n")

# Simple moving average
ma_7 <- rollmean(ts_df$temperature, k = 7, align = "right", fill = NA)
ma_24 <- rollmean(ts_df$temperature, k = 24, align = "right", fill = NA)

cat("Moving averages calculated:\n")
cat("7-hour MA:", round(mean(ma_7, na.rm = TRUE), 2), "\n")
cat("24-hour MA:", round(mean(ma_24, na.rm = TRUE), 2), "\n")

# Linear trend
time_index <- 1:length(ts_df$temperature)
trend_model <- lm(temperature ~ time_index, data = ts_df)
trend_line <- predict(trend_model)

cat("\nLinear trend model:\n")
cat("Slope:", round(coef(trend_model)[2], 4), "\n")
cat("R-squared:", round(summary(trend_model)$r.squared, 3), "\n")

# Detrending
detrended <- ts_df$temperature - trend_line
cat("\nDetrended data mean:", round(mean(detrended), 2), "\n")

# Plot with trend
cat("Trend analysis plots created\n")

# ============================================================================
# 5. Seasonal Decomposition
# ============================================================================

cat("\n=== Seasonal Decomposition ===\n")

# Create time series object for decomposition
ts_object <- ts(ts_df$temperature, frequency = 24)  # Hourly data

# Decompose
decomp <- decompose(ts_object)
cat("Time series decomposed into components:\n")
cat("Trend range:", round(range(decomp$trend, na.rm = TRUE), 2), "\n")
cat("Seasonal range:", round(range(decomp$seasonal, na.rm = TRUE), 2), "\n")
cat("Random range:", round(range(decomp$random, na.rm = TRUE), 2), "\n")

# STL decomposition (more robust)
if (require(stats, quietly = TRUE)) {
  stl_decomp <- stl(ts_object, s.window = "periodic")
  cat("\nSTL decomposition completed\n")
  
  # Extract components
  trend_comp <- stl_decomp$time.series[, "trend"]
  seasonal_comp <- stl_decomp$time.series[, "seasonal"]
  remainder_comp <- stl_decomp$time.series[, "remainder"]
  
  cat("STL components extracted\n")
}

# ============================================================================
# 6. Time Series Aggregation
# ============================================================================

cat("\n=== Time Series Aggregation ===\n")

# Daily aggregation
ts_df$date <- date(ts_df$timestamp)
daily_avg <- aggregate(temperature ~ date, data = ts_df, FUN = mean)
cat("Daily averages calculated:", nrow(daily_avg), "days\n")
cat("First 5 daily averages:\n")
print(head(daily_avg, 5))

# Hourly averages (across all days)
hourly_avg <- aggregate(temperature ~ hour, data = ts_df, FUN = mean)
cat("\nHourly averages (across all days):\n")
print(head(hourly_avg, 5))

# Using dplyr for aggregation
if (require(dplyr, quietly = TRUE)) {
  library(dplyr)
  
  monthly_avg <- ts_df %>%
    mutate(month = floor_date(timestamp, "month")) %>%
    group_by(month) %>%
    summarize(avg_temp = mean(temperature), .groups = "drop")
  
  cat("\nMonthly averages:\n")
  print(monthly_avg)
}

# Using xts for aggregation (if available)
if (require(xts, quietly = TRUE)) {
  xts_data <- xts(ts_df$temperature, ts_df$timestamp)
  daily_xts <- apply.daily(xts_data, mean)
  cat("\nDaily aggregation using xts:", length(daily_xts), "days\n")
}

# ============================================================================
# 7. Lag Analysis
# ============================================================================

cat("\n=== Lag Analysis ===\n")

# Create lagged variables
lag1 <- c(NA, ts_df$temperature[-length(ts_df$temperature)])
lag2 <- c(NA, NA, ts_df$temperature[-(length(ts_df$temperature)-1):length(ts_df$temperature)])

cat("Lagged variables created\n")
cat("Correlation with lag 1:", round(cor(ts_df$temperature, lag1, use = "complete.obs"), 3), "\n")
cat("Correlation with lag 2:", round(cor(ts_df$temperature, lag2, use = "complete.obs"), 3), "\n")

# Autocorrelation
if (require(stats, quietly = TRUE)) {
  acf_result <- acf(ts_df$temperature, lag.max = 48, plot = FALSE)
  cat("\nAutocorrelation at lag 1:", round(acf_result$acf[2], 3), "\n")
  cat("Autocorrelation at lag 24:", round(acf_result$acf[25], 3), "\n")
  cat("ACF plot created\n")
}

# ============================================================================
# 8. Basic Forecasting
# ============================================================================

cat("\n=== Basic Forecasting ===\n")

# Simple exponential smoothing
if (require(forecast, quietly = TRUE)) {
  library(forecast)
  
  # Use first 600 observations for training
  train_data <- ts(ts_df$temperature[1:600], frequency = 24)
  
  # Simple exponential smoothing
  ses_model <- ses(train_data, h = 24)
  cat("Simple exponential smoothing forecast created\n")
  cat("Forecast for next 24 hours:\n")
  print(round(ses_model$mean[1:5], 2))
  
  # Holt-Winters
  hw_model <- hw(train_data, seasonal = "additive", h = 24)
  cat("\nHolt-Winters forecast created\n")
  
  # ARIMA model
  arima_model <- auto.arima(train_data)
  forecast_result <- forecast(arima_model, h = 24)
  cat("\nARIMA forecast created\n")
  cat("ARIMA model:", arima_model$arma, "\n")
  
} else {
  cat("forecast package not installed (optional)\n")
  cat("Install with: install.packages('forecast')\n")
}

# ============================================================================
# Exercise Solutions
# ============================================================================

cat("\n=== Exercise 1: Date Handling ===\n")
# Create hourly timestamps for one week
week_start <- ymd_hms("2024-01-01 00:00:00")
week_timestamps <- seq(week_start, by = "1 hour", length.out = 168)  # 7 days * 24 hours

exercise1_df <- data.frame(
  timestamp = week_timestamps,
  day_of_week = wday(week_timestamps, label = TRUE),
  hour = hour(week_timestamps)
)

cat("One week of hourly timestamps created:\n")
print(head(exercise1_df, 10))

cat("\n=== Exercise 2: Time Series Creation ===\n")
# Create time series for demonstration
ts_exercise <- ts(ts_df$temperature, frequency = 24)
cat("Time series object created\n")
cat("Frequency:", frequency(ts_exercise), "\n")
cat("Length:", length(ts_exercise), "\n")

cat("\n=== Exercise 3: Trend Analysis ===\n")
# Calculate moving averages
ma_7_ex <- rollmean(ts_df$temperature, k = 7, align = "right", fill = NA)
ma_24_ex <- rollmean(ts_df$temperature, k = 24, align = "right", fill = NA)

# Fit linear trend
trend_model_ex <- lm(temperature ~ time_index, data = ts_df)
trend_line_ex <- predict(trend_model_ex)

cat("7-hour MA mean:", round(mean(ma_7_ex, na.rm = TRUE), 2), "\n")
cat("24-hour MA mean:", round(mean(ma_24_ex, na.rm = TRUE), 2), "\n")
cat("Linear trend slope:", round(coef(trend_model_ex)[2], 4), "\n")

cat("\n=== Exercise 4: Seasonal Decomposition ===\n")
decomp_ex <- decompose(ts_object)
cat("Decomposition completed\n")
cat("Trend component range:", round(range(decomp_ex$trend, na.rm = TRUE), 2), "\n")
cat("Seasonal component range:", round(range(decomp_ex$seasonal, na.rm = TRUE), 2), "\n")
cat("Random component range:", round(range(decomp_ex$random, na.rm = TRUE), 2), "\n")

# Identify dominant pattern
seasonal_strength <- var(decomp_ex$seasonal, na.rm = TRUE) / 
                     var(decomp_ex$trend + decomp_ex$seasonal, na.rm = TRUE)
cat("Seasonal strength:", round(seasonal_strength, 3), "\n")

cat("\n=== Summary ===\n")
cat("Time series analysis completed successfully!\n")
cat("Key techniques demonstrated:\n")
cat("- Date/time handling with lubridate\n")
cat("- Time series object creation\n")
cat("- Trend analysis\n")
cat("- Seasonal decomposition\n")
cat("- Time series aggregation\n")
cat("- Lag analysis\n")
