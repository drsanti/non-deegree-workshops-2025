# Workshop 10: Advanced Topics and Best Practices
# This script demonstrates advanced R programming techniques and best practices

# Install and load required libraries
# Install packages if not already installed
if (!require(dplyr, quietly = TRUE)) {
  cat("Installing dplyr package...\n")
  install.packages("dplyr")
}

if (!require(ggplot2, quietly = TRUE)) {
  cat("Installing ggplot2 package...\n")
  install.packages("ggplot2")
}

# Load libraries
library(dplyr)
library(ggplot2)

# ============================================================================
# Setup and Configuration
# ============================================================================

cat("=== Workshop 10: Advanced Topics ===\n\n")

# Set random seed for reproducibility
set.seed(123)

# Configuration
DATA_DIR <- "data"
OUTPUT_DIR <- "output"

# ============================================================================
# 1. Creating Custom Functions
# ============================================================================

cat("=== 1. Custom Functions ===\n")

# Basic function with documentation
#' Calculate statistics for a numeric column
#'
#' @param data Data frame
#' @param column Column name (character)
#' @return List with mean, median, and sd
calculate_stats <- function(data, column) {
  # Input validation
  if (!is.data.frame(data)) {
    stop("data must be a data frame")
  }
  
  if (!column %in% names(data)) {
    stop("Column '", column, "' not found in data")
  }
  
  # Calculate statistics
  mean_val <- mean(data[[column]], na.rm = TRUE)
  median_val <- median(data[[column]], na.rm = TRUE)
  sd_val <- sd(data[[column]], na.rm = TRUE)
  
  return(list(
    mean = mean_val,
    median = median_val,
    sd = sd_val
  ))
}

# Function with default parameters
process_sensor_data <- function(data, 
                                temp_col = "temperature",
                                remove_outliers = TRUE,
                                fill_na = TRUE,
                                outlier_method = "IQR") {
  result <- data
  
  # Fill missing values
  if (fill_na && temp_col %in% names(result)) {
    missing_count <- sum(is.na(result[[temp_col]]))
    if (missing_count > 0) {
      result[[temp_col]][is.na(result[[temp_col]])] <- 
        median(result[[temp_col]], na.rm = TRUE)
      cat("Filled", missing_count, "missing values\n")
    }
  }
  
  # Remove outliers
  if (remove_outliers && temp_col %in% names(result)) {
    if (outlier_method == "IQR") {
      Q1 <- quantile(result[[temp_col]], 0.25, na.rm = TRUE)
      Q3 <- quantile(result[[temp_col]], 0.75, na.rm = TRUE)
      IQR <- Q3 - Q1
      lower <- Q1 - 1.5 * IQR
      upper <- Q3 + 1.5 * IQR
      
      before <- nrow(result)
      result <- result[result[[temp_col]] >= lower & 
                      result[[temp_col]] <= upper, ]
      after <- nrow(result)
      cat("Removed", before - after, "outliers\n")
    }
  }
  
  return(result)
}

# Test the functions
test_data <- data.frame(
  device_id = paste0("D", 1:10),
  temperature = c(rnorm(8, 25, 2), NA, 35),  # One missing, one outlier
  humidity = runif(10, 40, 60)
)

cat("Test data created\n")
stats <- calculate_stats(test_data, "temperature")
cat("Statistics calculated:\n")
print(stats)

processed <- process_sensor_data(test_data, remove_outliers = TRUE, fill_na = TRUE)
cat("\nData processed\n")
cat("Original rows:", nrow(test_data), "\n")
cat("Processed rows:", nrow(processed), "\n")

# ============================================================================
# 2. Error Handling
# ============================================================================

cat("\n=== 2. Error Handling ===\n")

# Safe division function
safe_divide <- function(a, b) {
  tryCatch({
    if (b == 0) {
      stop("Division by zero")
    }
    result <- a / b
    return(result)
  }, error = function(e) {
    warning("Error in division: ", e$message)
    return(NA)
  })
}

cat("Safe division test:\n")
cat("10 / 2 =", safe_divide(10, 2), "\n")
cat("10 / 0 =", safe_divide(10, 0), "\n")

# Safe file reading function
read_sensor_file <- function(filename) {
  # Check if file exists
  if (!file.exists(filename)) {
    stop("File not found: ", filename)
  }
  
  # Check if file is empty
  if (file.size(filename) == 0) {
    stop("File is empty: ", filename)
  }
  
  # Try to read file
  tryCatch({
    data <- read.csv(filename, stringsAsFactors = FALSE)
    cat("Successfully read", nrow(data), "rows from", filename, "\n")
    return(data)
  }, error = function(e) {
    stop("Error reading file '", filename, "': ", e$message)
  })
}

# Validation function
validate_data <- function(data) {
  errors <- character()
  
  if (!is.data.frame(data)) {
    errors <- c(errors, "data must be a data frame")
  } else {
    if (nrow(data) == 0) {
      errors <- c(errors, "data has no rows")
    }
    if (!"temperature" %in% names(data)) {
      errors <- c(errors, "data must contain 'temperature' column")
    }
  }
  
  if (length(errors) > 0) {
    stop(paste(errors, collapse = "; "))
  }
  
  return(TRUE)
}

cat("\nValidation test:\n")
validate_data(test_data)
cat("Validation passed\n")

# ============================================================================
# 3. Working with Packages
# ============================================================================

cat("\n=== 3. Working with Packages ===\n")

# Function to load or install package
load_or_install <- function(package) {
  if (!require(package, character.only = TRUE, quietly = TRUE)) {
    cat("Installing package:", package, "\n")
    install.packages(package)
    library(package, character.only = TRUE)
  } else {
    cat("Package", package, "already loaded\n")
  }
}

# Check package version
check_package_version <- function(package) {
  if (require(package, character.only = TRUE, quietly = TRUE)) {
    version <- as.character(packageVersion(package))
    cat("Package", package, "version:", version, "\n")
    return(version)
  } else {
    cat("Package", package, "not installed\n")
    return(NA)
  }
}

cat("Package management:\n")
check_package_version("base")
if (require(dplyr, quietly = TRUE)) {
  check_package_version("dplyr")
} else {
  cat("dplyr not installed (optional for this demo)\n")
}

# ============================================================================
# 4. Code Organization
# ============================================================================

cat("\n=== 4. Code Organization ===\n")

# Helper functions section
calculate_mean <- function(x, na.rm = TRUE) {
  mean(x, na.rm = na.rm)
}

calculate_median <- function(x, na.rm = TRUE) {
  median(x, na.rm = na.rm)
}

# Main analysis function
main_analysis <- function(data) {
  cat("Starting main analysis...\n")
  
  # Step 1: Validate data
  validate_data(data)
  
  # Step 2: Process data
  processed <- process_sensor_data(data)
  
  # Step 3: Calculate statistics
  stats <- calculate_stats(processed, "temperature")
  
  # Step 4: Return results
  cat("Analysis completed\n")
  return(list(
    original_rows = nrow(data),
    processed_rows = nrow(processed),
    statistics = stats
  ))
}

# Run analysis
cat("Running main analysis:\n")
results <- main_analysis(test_data)
cat("\nResults:\n")
print(results)

# ============================================================================
# 5. Documentation and Comments
# ============================================================================

cat("\n=== 5. Documentation ===\n")

#' Process IoT sensor data with comprehensive cleaning
#'
#' This function performs comprehensive data cleaning including
#' missing value imputation, outlier removal, and data validation.
#'
#' @param data Data frame containing sensor readings
#' @param temp_col Name of temperature column (default: "temperature")
#' @param remove_outliers Logical, remove outliers? (default: TRUE)
#' @param fill_na Logical, fill missing values? (default: TRUE)
#' @param outlier_method Method for outlier detection: "IQR" or "Z-score"
#'
#' @return Cleaned data frame
#'
#' @examples
#' data <- data.frame(temperature = c(22, 24, NA, 35, 23))
#' cleaned <- clean_sensor_data(data)
#'
#' @export
clean_sensor_data <- function(data, 
                              temp_col = "temperature",
                              remove_outliers = TRUE,
                              fill_na = TRUE,
                              outlier_method = "IQR") {
  # Input validation
  if (!is.data.frame(data)) {
    stop("Input must be a data frame")
  }
  
  if (!temp_col %in% names(data)) {
    stop("Temperature column '", temp_col, "' not found")
  }
  
  result <- data
  
  # Fill missing values with median
  if (fill_na) {
    na_count <- sum(is.na(result[[temp_col]]))
    if (na_count > 0) {
      median_val <- median(result[[temp_col]], na.rm = TRUE)
      result[[temp_col]][is.na(result[[temp_col]])] <- median_val
    }
  }
  
  # Remove outliers
  if (remove_outliers) {
    if (outlier_method == "IQR") {
      Q1 <- quantile(result[[temp_col]], 0.25, na.rm = TRUE)
      Q3 <- quantile(result[[temp_col]], 0.75, na.rm = TRUE)
      IQR <- Q3 - Q1
      lower <- Q1 - 1.5 * IQR
      upper <- Q3 + 1.5 * IQR
      result <- result[result[[temp_col]] >= lower & 
                      result[[temp_col]] <= upper, ]
    }
  }
  
  return(result)
}

cat("Documented function created\n")
cat("Function name: clean_sensor_data\n")

# ============================================================================
# 6. Performance Optimization
# ============================================================================

cat("\n=== 6. Performance Optimization ===\n")

# Compare loop vs vectorization
n <- 10000
test_vector <- rnorm(n)

# Slow: loop
cat("Timing loop approach...\n")
start_time <- Sys.time()
result_loop <- numeric(n)
for (i in 1:n) {
  result_loop[i] <- test_vector[i] * 2
}
loop_time <- Sys.time() - start_time
cat("Loop time:", as.numeric(loop_time), "seconds\n")

# Fast: vectorization
cat("Timing vectorized approach...\n")
start_time <- Sys.time()
result_vector <- test_vector * 2
vector_time <- Sys.time() - start_time
cat("Vectorized time:", as.numeric(vector_time), "seconds\n")
cat("Speedup:", round(as.numeric(loop_time) / as.numeric(vector_time), 2), "x\n")

# Using apply family
cat("\nComparing apply functions:\n")
test_df <- data.frame(
  col1 = rnorm(1000),
  col2 = rnorm(1000),
  col3 = rnorm(1000)
)

start_time <- Sys.time()
means_apply <- sapply(test_df, mean)
apply_time <- Sys.time() - start_time
cat("sapply time:", as.numeric(apply_time), "seconds\n")

# ============================================================================
# 7. Reproducible Analysis
# ============================================================================

cat("\n=== 7. Reproducible Analysis ===\n")

# Record session information
cat("R Version:\n")
cat(R.version.string, "\n")

# Record package versions
if (require(dplyr, quietly = TRUE)) {
  cat("\nPackage versions:\n")
  packages <- c("base", "dplyr")
  versions <- sapply(packages, function(p) {
    if (p == "base") {
      return(R.version.string)
    } else {
      return(as.character(packageVersion(p)))
    }
  })
  print(versions)
}

# Create reproducible script structure
create_reproducible_script <- function() {
  script <- '
# Reproducible Analysis Script
# Date: 2024-01-01
# Author: Your Name

# 1. Load libraries
library(dplyr)
library(ggplot2)

# 2. Set random seed
set.seed(123)

# 3. Configuration
DATA_FILE <- "data/sensor_data.csv"
OUTPUT_DIR <- "output/"

# 4. Load data
data <- read.csv(DATA_FILE)

# 5. Process data
processed <- process_sensor_data(data)

# 6. Analyze
results <- analyze_data(processed)

# 7. Save results
write.csv(results, file.path(OUTPUT_DIR, "results.csv"))
'
  return(script)
}

cat("Reproducible script template created\n")

# ============================================================================
# 8. Best Practices Summary
# ============================================================================

cat("\n=== 8. Best Practices Summary ===\n")

cat("Best Practices Demonstrated:\n")
cat("1. Meaningful variable names\n")
cat("2. Comprehensive error handling\n")
cat("3. Function documentation\n")
cat("4. Code organization\n")
cat("5. Performance optimization\n")
cat("6. Reproducible analysis\n")
cat("7. Input validation\n")
cat("8. Clear comments\n")

# ============================================================================
# Exercise Solutions
# ============================================================================

cat("\n=== Exercise Solutions ===\n")

cat("\n=== Exercise 1: Custom Function ===\n")
#' Process IoT sensor data with comprehensive options
#'
#' @param data Data frame with sensor data
#' @param temp_col Temperature column name
#' @param remove_outliers Remove outliers? (default: TRUE)
#' @param fill_na Fill missing values? (default: TRUE)
#' @return Processed data frame
process_iot_data <- function(data, 
                              temp_col = "temperature",
                              remove_outliers = TRUE,
                              fill_na = TRUE) {
  # Error checking
  if (!is.data.frame(data)) {
    stop("data must be a data frame")
  }
  
  if (!temp_col %in% names(data)) {
    stop("Column '", temp_col, "' not found")
  }
  
  result <- data
  
  # Fill missing values
  if (fill_na) {
    na_count <- sum(is.na(result[[temp_col]]))
    if (na_count > 0) {
      result[[temp_col]][is.na(result[[temp_col]])] <- 
        median(result[[temp_col]], na.rm = TRUE)
    }
  }
  
  # Remove outliers
  if (remove_outliers) {
    Q1 <- quantile(result[[temp_col]], 0.25, na.rm = TRUE)
    Q3 <- quantile(result[[temp_col]], 0.75, na.rm = TRUE)
    IQR <- Q3 - Q1
    result <- result[result[[temp_col]] >= Q1 - 1.5*IQR & 
                     result[[temp_col]] <= Q3 + 1.5*IQR, ]
  }
  
  return(result)
}

cat("Custom function created: process_iot_data\n")

cat("\n=== Exercise 2: Error Handling ===\n")
safe_read_csv <- function(filename) {
  # Check file exists
  if (!file.exists(filename)) {
    stop("Error: File '", filename, "' does not exist")
  }
  
  # Check file is not empty
  if (file.size(filename) == 0) {
    stop("Error: File '", filename, "' is empty")
  }
  
  # Try to read
  tryCatch({
    data <- read.csv(filename, stringsAsFactors = FALSE)
    return(data)
  }, error = function(e) {
    stop("Error reading file '", filename, "': ", e$message)
  })
}

cat("Safe CSV reader function created\n")

cat("\n=== Exercise 3: Code Organization ===\n")
# Complete organized script structure demonstrated above
cat("Code organization demonstrated in main_analysis function\n")

cat("\n=== Exercise 4: Performance ===\n")
# Performance comparison demonstrated above
cat("Performance optimization demonstrated with timing comparisons\n")

cat("\n=== Summary ===\n")
cat("Advanced topics workshop completed!\n")
cat("All best practices demonstrated:\n")
cat("- Custom functions with documentation\n")
cat("- Comprehensive error handling\n")
cat("- Package management\n")
cat("- Code organization\n")
cat("- Performance optimization\n")
cat("- Reproducible analysis\n")
