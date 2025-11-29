# Workshop 09: Data Cleaning and Preprocessing
# This script demonstrates data cleaning and preprocessing techniques

# Install and load required libraries
# Install packages if not already installed
if (!require(dplyr, quietly = TRUE)) {
  cat("Installing dplyr package...\n")
  install.packages("dplyr")
}

# Load libraries
library(dplyr)

# ============================================================================
# Setup: Create Sample Data with Issues
# ============================================================================

cat("=== Creating Sample Data with Issues ===\n")

set.seed(123)
# Create data with missing values, outliers, and inconsistencies
n <- 100
sensor_data <- data.frame(
  device_id = c(rep(paste0("IoT-", sprintf("%03d", 1:5)), each = 20)),
  temperature = round(rnorm(n, mean = 25, sd = 2), 2),
  humidity = round(runif(n, 40, 60), 1),
  status = sample(c("online", "offline", "ONLINE", "Online", "OFFLINE"),
    n,
    replace = TRUE
  )
)

# Introduce missing values
sensor_data$temperature[sample(1:n, 5)] <- NA
sensor_data$humidity[sample(1:n, 3)] <- NA

# Introduce outliers
sensor_data$temperature[sample(1:n, 3)] <- c(35, 15, 40) # Extreme values

# Introduce duplicates
sensor_data <- rbind(sensor_data, sensor_data[1:2, ])

cat("Original data:", nrow(sensor_data), "rows\n")
cat("Missing values - Temperature:", sum(is.na(sensor_data$temperature)), "\n")
cat("Missing values - Humidity:", sum(is.na(sensor_data$humidity)), "\n")
cat("Duplicates:", sum(duplicated(sensor_data)), "\n")

# ============================================================================
# 1. Identifying Missing Values
# ============================================================================

cat("\n=== Identifying Missing Values ===\n")

# Check for missing values
cat("Missing values check:\n")
cat("Temperature:", sum(is.na(sensor_data$temperature)), "\n")
cat("Humidity:", sum(is.na(sensor_data$humidity)), "\n")

# Percentage of missing values
cat("\nPercentage missing:\n")
cat("Temperature:", round(mean(is.na(sensor_data$temperature)) * 100, 2), "%\n")
cat("Humidity:", round(mean(is.na(sensor_data$humidity)) * 100, 2), "%\n")

# Check by column
cat("\nMissing values by column:\n")
print(colSums(is.na(sensor_data)))

# Summary
cat("\nSummary with missing values:\n")
print(summary(sensor_data))

# ============================================================================
# 2. Handling Missing Values
# ============================================================================

cat("\n=== Handling Missing Values ===\n")

# Create a copy for cleaning
data_clean <- sensor_data

# Fill missing values with mean
mean_temp <- mean(data_clean$temperature, na.rm = TRUE)
data_clean$temperature[is.na(data_clean$temperature)] <- mean_temp
cat(
  "Filled", sum(is.na(sensor_data$temperature)),
  "missing temperature values with mean:", round(mean_temp, 2), "\n"
)

# Fill missing values with median
median_humidity <- median(data_clean$humidity, na.rm = TRUE)
data_clean$humidity[is.na(data_clean$humidity)] <- median_humidity
cat(
  "Filled", sum(is.na(sensor_data$humidity)),
  "missing humidity values with median:", round(median_humidity, 2), "\n"
)

# Alternative: Remove rows with any missing values
data_no_na <- na.omit(sensor_data)
cat("\nRows after removing all NAs:", nrow(data_no_na), "\n")
cat("Rows removed:", nrow(sensor_data) - nrow(data_no_na), "\n")

# Forward fill (if we had time series data)
if (require(zoo, quietly = TRUE)) {
  library(zoo)
  # This would work for time series
  # data_clean$temperature <- na.locf(data_clean$temperature)
  cat("Forward fill method available (zoo package)\n")
}

# ============================================================================
# 3. Detecting Outliers
# ============================================================================

cat("\n=== Detecting Outliers ===\n")

# Using IQR method
Q1 <- quantile(data_clean$temperature, 0.25, na.rm = TRUE)
Q3 <- quantile(data_clean$temperature, 0.75, na.rm = TRUE)
IQR <- Q3 - Q1
lower_bound <- Q1 - 1.5 * IQR
upper_bound <- Q3 + 1.5 * IQR

cat("IQR Method:\n")
cat("Q1:", Q1, "\n")
cat("Q3:", Q3, "\n")
cat("IQR:", IQR, "\n")
cat("Lower bound:", lower_bound, "\n")
cat("Upper bound:", upper_bound, "\n")

outliers_iqr <- data_clean$temperature < lower_bound |
  data_clean$temperature > upper_bound
cat("Outliers detected:", sum(outliers_iqr), "\n")
cat("Outlier values:", data_clean$temperature[outliers_iqr], "\n")

# Using Z-score method
z_scores <- abs(scale(data_clean$temperature))
outliers_z <- z_scores > 3
cat("\nZ-score method (|z| > 3):\n")
cat("Outliers detected:", sum(outliers_z, na.rm = TRUE), "\n")

# Using boxplot
boxplot_stats <- boxplot.stats(data_clean$temperature)
cat("\nBoxplot method:\n")
cat("Outliers:", boxplot_stats$out, "\n")

# Visual detection
cat("\nTemperature range:", range(data_clean$temperature, na.rm = TRUE), "\n")
cat("Mean:", round(mean(data_clean$temperature, na.rm = TRUE), 2), "\n")
cat("SD:", round(sd(data_clean$temperature, na.rm = TRUE), 2), "\n")

# ============================================================================
# 4. Treating Outliers
# ============================================================================

cat("\n=== Treating Outliers ===\n")

# Create a copy for outlier treatment
data_outlier_treated <- data_clean

# Method 1: Remove outliers
data_no_outliers <- data_outlier_treated[!outliers_iqr, ]
cat("Method 1 - Remove outliers:\n")
cat("Original rows:", nrow(data_outlier_treated), "\n")
cat("Rows after removal:", nrow(data_no_outliers), "\n")
cat("Rows removed:", sum(outliers_iqr), "\n")

# Method 2: Cap outliers (winsorization)
data_capped <- data_outlier_treated
data_capped$temperature[data_capped$temperature > upper_bound] <- upper_bound
data_capped$temperature[data_capped$temperature < lower_bound] <- lower_bound
cat("\nMethod 2 - Cap outliers:\n")
cat(
  "Temperature range after capping:",
  range(data_capped$temperature, na.rm = TRUE), "\n"
)

# Method 3: Replace with median
data_median_replace <- data_outlier_treated
data_median_replace$temperature[outliers_iqr] <-
  median(data_median_replace$temperature, na.rm = TRUE)
cat("\nMethod 3 - Replace with median:\n")
cat("Outliers replaced:", sum(outliers_iqr), "\n")

# ============================================================================
# 5. Data Transformation
# ============================================================================

cat("\n=== Data Transformation ===\n")

# Log transformation
data_clean$log_temp <- log(data_clean$temperature)
cat("Log transformation applied\n")
cat("Original mean:", round(mean(data_clean$temperature, na.rm = TRUE), 2), "\n")
cat("Log mean:", round(mean(data_clean$log_temp, na.rm = TRUE), 2), "\n")

# Square root transformation
data_clean$sqrt_temp <- sqrt(data_clean$temperature)
cat("\nSquare root transformation applied\n")

# Standardization (z-score)
data_clean$temp_z <- scale(data_clean$temperature)
cat("\nStandardization applied\n")
cat("Standardized mean:", round(mean(data_clean$temp_z, na.rm = TRUE), 2), "\n")
cat("Standardized SD:", round(sd(data_clean$temp_z, na.rm = TRUE), 2), "\n")

# Min-Max normalization
min_temp <- min(data_clean$temperature, na.rm = TRUE)
max_temp <- max(data_clean$temperature, na.rm = TRUE)
data_clean$temp_norm <- (data_clean$temperature - min_temp) / (max_temp - min_temp)
cat("\nMin-Max normalization applied\n")
cat("Normalized range:", range(data_clean$temp_norm, na.rm = TRUE), "\n")

# ============================================================================
# 6. Normalization and Standardization
# ============================================================================

cat("\n=== Normalization and Standardization ===\n")

# Standardization
standardized <- scale(data_clean$temperature)
cat("Standardized values:\n")
cat("Mean:", round(mean(standardized, na.rm = TRUE), 2), "\n")
cat("SD:", round(sd(standardized, na.rm = TRUE), 2), "\n")

# Min-Max normalization
normalized <- (data_clean$temperature - min(data_clean$temperature, na.rm = TRUE)) /
  (max(data_clean$temperature, na.rm = TRUE) -
    min(data_clean$temperature, na.rm = TRUE))
cat("\nNormalized values:\n")
cat("Range:", range(normalized, na.rm = TRUE), "\n")

# Robust standardization (using median and MAD)
robust_z <- (data_clean$temperature - median(data_clean$temperature, na.rm = TRUE)) /
  mad(data_clean$temperature, na.rm = TRUE)
cat("\nRobust standardization:\n")
cat("Median:", round(median(robust_z, na.rm = TRUE), 2), "\n")
cat("MAD:", round(mad(robust_z, na.rm = TRUE), 2), "\n")

# ============================================================================
# 7. Data Type Conversions
# ============================================================================

cat("\n=== Data Type Conversions ===\n")

# Check current types
cat("Current data types:\n")
print(sapply(data_clean, class))

# Convert status to factor
data_clean$status <- as.factor(data_clean$status)
cat("\nStatus converted to factor\n")
cat("Levels:", levels(data_clean$status), "\n")

# Convert device_id to character (if needed)
data_clean$device_id <- as.character(data_clean$device_id)
cat("Device ID converted to character\n")

# ============================================================================
# 8. Handling Inconsistent Data
# ============================================================================

cat("\n=== Handling Inconsistent Data ===\n")

# Remove duplicates
data_unique <- distinct(data_clean)
cat("Duplicates removed:\n")
cat("Original rows:", nrow(data_clean), "\n")
cat("Rows after removing duplicates:", nrow(data_unique), "\n")
cat("Duplicates found:", nrow(data_clean) - nrow(data_unique), "\n")

# Fix inconsistent capitalization in status
data_clean$status <- tolower(data_clean$status)
cat("\nStatus standardized to lowercase\n")
cat("Unique status values:", unique(data_clean$status), "\n")

# Fix inconsistent formats
data_clean$status[data_clean$status %in% c("online", "on")] <- "online"
data_clean$status[data_clean$status %in% c("offline", "off")] <- "offline"
cat("\nStatus values standardized\n")
cat("Unique status values:", unique(data_clean$status), "\n")

# ============================================================================
# 9. Complete Data Cleaning Pipeline
# ============================================================================

cat("\n=== Complete Data Cleaning Pipeline ===\n")

clean_data <- function(data) {
  cat("Starting data cleaning...\n")

  # Remove duplicates
  data <- distinct(data)
  cat("Duplicates removed\n")

  # Standardize status values
  if ("status" %in% names(data)) {
    data$status <- tolower(trimws(data$status))
    data$status[data$status %in% c("online", "on")] <- "online"
    data$status[data$status %in% c("offline", "off")] <- "offline"
    cat("Status standardized\n")
  }

  # Handle missing values
  numeric_cols <- sapply(data, is.numeric)
  for (col in names(data)[numeric_cols]) {
    missing_count <- sum(is.na(data[[col]]))
    if (missing_count > 0) {
      data[[col]][is.na(data[[col]])] <- median(data[[col]], na.rm = TRUE)
      cat("Filled", missing_count, "missing values in", col, "\n")
    }
  }

  # Remove outliers using IQR method
  for (col in names(data)[numeric_cols]) {
    Q1 <- quantile(data[[col]], 0.25, na.rm = TRUE)
    Q3 <- quantile(data[[col]], 0.75, na.rm = TRUE)
    IQR <- Q3 - Q1
    lower <- Q1 - 1.5 * IQR
    upper <- Q3 + 1.5 * IQR

    outliers <- data[[col]] < lower | data[[col]] > upper
    if (sum(outliers) > 0) {
      # Cap outliers instead of removing
      data[[col]][data[[col]] > upper] <- upper
      data[[col]][data[[col]] < lower] <- lower
      cat("Capped outliers in", col, "\n")
    }
  }

  cat("Data cleaning completed!\n")
  return(data)
}

# Test the cleaning function
cleaned_data <- clean_data(sensor_data)
cat("\nCleaning summary:\n")
cat("Original rows:", nrow(sensor_data), "\n")
cat("Cleaned rows:", nrow(cleaned_data), "\n")
cat("Missing values in cleaned data:", sum(is.na(cleaned_data)), "\n")

# ============================================================================
# Exercise Solutions
# ============================================================================

cat("\n=== Exercise 1: Missing Values ===\n")
# Create data with missing values
ex1_data <- data.frame(
  device_id = paste0("D", 1:20),
  temperature = c(rnorm(15, 25, 2), rep(NA, 5)),
  humidity = c(runif(18, 40, 60), rep(NA, 2))
)

cat("Original missing values:\n")
print(colSums(is.na(ex1_data)))

# Fill missing values
ex1_data$temperature[is.na(ex1_data$temperature)] <-
  mean(ex1_data$temperature, na.rm = TRUE)
ex1_data$humidity[is.na(ex1_data$humidity)] <-
  median(ex1_data$humidity, na.rm = TRUE)

cat("\nAfter filling:\n")
cat("Missing values:", sum(is.na(ex1_data)), "\n")

cat("\n=== Exercise 2: Outlier Detection ===\n")
# Detect outliers
Q1_ex <- quantile(cleaned_data$temperature, 0.25)
Q3_ex <- quantile(cleaned_data$temperature, 0.75)
IQR_ex <- Q3_ex - Q1_ex
outliers_ex <- cleaned_data$temperature < (Q1_ex - 1.5 * IQR_ex) |
  cleaned_data$temperature > (Q3_ex + 1.5 * IQR_ex)

cat("Outliers detected:", sum(outliers_ex), "\n")
cat("Outlier percentage:", round(mean(outliers_ex) * 100, 2), "%\n")

# Cap outliers
cleaned_data_capped <- cleaned_data
cleaned_data_capped$temperature[cleaned_data_capped$temperature > Q3_ex + 1.5 * IQR_ex] <-
  Q3_ex + 1.5 * IQR_ex
cleaned_data_capped$temperature[cleaned_data_capped$temperature < Q1_ex - 1.5 * IQR_ex] <-
  Q1_ex - 1.5 * IQR_ex

cat("\nAfter capping:\n")
cat("Temperature range:", range(cleaned_data_capped$temperature), "\n")

cat("\n=== Exercise 3: Data Transformation ===\n")
# Apply transformations
cleaned_data$log_temp <- log(cleaned_data$temperature)
cleaned_data$temp_std <- scale(cleaned_data$temperature)
cleaned_data$humidity_norm <- (cleaned_data$humidity - min(cleaned_data$humidity)) /
  (max(cleaned_data$humidity) - min(cleaned_data$humidity))

cat("Transformations applied:\n")
cat("Log temp mean:", round(mean(cleaned_data$log_temp), 2), "\n")
cat("Std temp mean:", round(mean(cleaned_data$temp_std), 2), "\n")
cat("Norm humidity range:", range(cleaned_data$humidity_norm), "\n")

cat("\n=== Exercise 4: Complete Pipeline ===\n")
# Use the cleaning function
final_cleaned <- clean_data(sensor_data)
cat("\nFinal cleaned data summary:\n")
print(summary(final_cleaned[, c("temperature", "humidity", "status")]))

cat("\n=== Summary ===\n")
cat("Data cleaning completed successfully!\n")
cat("Key techniques demonstrated:\n")
cat("- Missing value identification and handling\n")
cat("- Outlier detection and treatment\n")
cat("- Data transformation\n")
cat("- Normalization and standardization\n")
cat("- Complete cleaning pipeline\n")
