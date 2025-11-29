# Workshop 08: Time Series Analysis

**Duration:** 90-120 minutes  
**Level:** Intermediate to Advanced

## Introduction

Time series analysis is essential for IoT sensor data, which is collected over time. This workshop covers working with dates and times, creating time series objects, analyzing trends, detecting seasonality, and forecasting. You'll learn to handle temporal data effectively and extract meaningful insights.

## What You'll Learn

- Working with dates and times using lubridate
- Creating and manipulating time series objects
- Trend analysis and decomposition
- Seasonal decomposition
- Time series visualization
- Basic forecasting techniques
- Handling time-based data from IoT sensors

## Prerequisites

Before starting, you should have:
- Completed Workshop 02: Data Structures in R
- Completed Workshop 06: Data Visualization with ggplot2
- Understanding of data frames

## Required Packages

```r
install.packages(c("lubridate", "zoo", "xts", "forecast"))
library(lubridate)
library(zoo)
library(xts)
library(forecast)
```

## Step-by-Step Instructions

### Step 1: Working with Dates and Times

Handle temporal data:

```r
library(lubridate)

# Parse dates
date1 <- as.Date("2024-01-15")
date2 <- ymd("2024-01-15")
date3 <- dmy("15-01-2024")

# Parse date-time
datetime1 <- ymd_hms("2024-01-15 14:30:00")
datetime2 <- as.POSIXct("2024-01-15 14:30:00")

# Extract components
year(date1)
month(date1)
day(date1)
hour(datetime1)
minute(datetime1)

# Create sequences
dates <- seq(as.Date("2024-01-01"), as.Date("2024-12-31"), by = "day")
hours <- seq(ymd_hms("2024-01-01 00:00:00"), 
             ymd_hms("2024-01-01 23:00:00"), 
             by = "1 hour")
```

### Step 2: Creating Time Series Objects

Convert data to time series format:

```r
# Create time series from vector
ts_data <- ts(temperature, start = c(2024, 1), frequency = 24)

# Create time series from data frame
ts_df <- data.frame(
  timestamp = seq(ymd_hms("2024-01-01 00:00:00"), 
                  by = "1 hour", length.out = 100),
  temperature = rnorm(100, 25, 2)
)

# Using zoo package
library(zoo)
zoo_data <- zoo(ts_df$temperature, ts_df$timestamp)

# Using xts package
library(xts)
xts_data <- xts(ts_df$temperature, ts_df$timestamp)
```

### Step 3: Time Series Visualization

Plot temporal patterns:

```r
# Basic time series plot
plot(ts_data)

# Using ggplot2
library(ggplot2)
ggplot(ts_df, aes(x = timestamp, y = temperature)) +
  geom_line() +
  labs(title = "Temperature Over Time",
       x = "Time",
       y = "Temperature (°C)")

# Multiple time series
ggplot(ts_df, aes(x = timestamp, y = value, color = device_id)) +
  geom_line() +
  facet_wrap(~ device_id)
```

### Step 4: Trend Analysis

Identify trends in data:

```r
# Simple moving average
library(zoo)
ma <- rollmean(temperature, k = 7, align = "right")

# Linear trend
time_index <- 1:length(temperature)
trend_model <- lm(temperature ~ time_index)
trend_line <- predict(trend_model)

# Detrending
detrended <- temperature - trend_line

# Plot with trend
plot(temperature, type = "l")
lines(ma, col = "red", lwd = 2)
lines(trend_line, col = "blue", lwd = 2)
```

### Step 5: Seasonal Decomposition

Decompose time series into components:

```r
# Create time series object
ts_object <- ts(temperature, frequency = 24)  # Hourly data

# Decompose
decomp <- decompose(ts_object)
plot(decomp)

# STL decomposition (more robust)
stl_decomp <- stl(ts_object, s.window = "periodic")
plot(stl_decomp)

# Extract components
trend <- decomp$trend
seasonal <- decomp$seasonal
random <- decomp$random
```

### Step 6: Time Series Aggregation

Aggregate data by time periods:

```r
# Daily aggregation
daily_avg <- aggregate(temperature ~ date(timestamp), 
                       data = ts_df, FUN = mean)

# Monthly aggregation
monthly_avg <- ts_df %>%
  mutate(month = floor_date(timestamp, "month")) %>%
  group_by(month) %>%
  summarize(avg_temp = mean(temperature))

# Using xts for aggregation
daily_xts <- apply.daily(xts_data, mean)
monthly_xts <- apply.monthly(xts_data, mean)
```

### Step 7: Lag Analysis

Examine relationships with past values:

```r
# Create lagged variables
lag1 <- lag(temperature, 1)
lag2 <- lag(temperature, 2)

# Autocorrelation
acf(temperature)
pacf(temperature)

# Cross-correlation
ccf(temperature, humidity)
```

### Step 8: Basic Forecasting

Simple forecasting methods:

```r
library(forecast)

# Simple exponential smoothing
ses_model <- ses(temperature)
plot(ses_model)

# Holt-Winters
hw_model <- hw(temperature, seasonal = "additive")
plot(hw_model)

# ARIMA model
arima_model <- auto.arima(temperature)
forecast_result <- forecast(arima_model, h = 24)
plot(forecast_result)
```

## Exercises

1. **Date Handling:**
   - Create a sequence of hourly timestamps for one week
   - Extract day of week and hour of day
   - Create a data frame with these components

2. **Time Series Creation:**
   - Convert sensor data to time series format
   - Create separate time series for each device
   - Visualize all devices on one plot

3. **Trend Analysis:**
   - Calculate moving averages (7-day and 30-day)
   - Fit a linear trend
   - Visualize original data with trend lines

4. **Seasonal Decomposition:**
   - Decompose hourly temperature data
   - Extract and plot trend, seasonal, and random components
   - Identify the dominant seasonal pattern

## Summary

In this workshop, you've learned:
- How to work with dates and times using lubridate
- Creating time series objects
- Visualizing temporal data
- Analyzing trends and seasonality
- Decomposing time series
- Basic forecasting techniques

## Next Steps

- Review the example code in `examples/08-time-series.r`
- Practice with your own time series data
- Move on to Workshop 09: Data Cleaning and Preprocessing

## Additional Resources

- lubridate documentation: https://lubridate.tidyverse.org/
- Time Series in R: https://www.statmethods.net/advstats/timeseries.html
- Forecasting: https://otexts.com/fpp3/
