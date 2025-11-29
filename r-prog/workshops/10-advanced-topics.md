# Workshop 10: Advanced Topics and Best Practices

**Duration:** 90-120 minutes  
**Level:** Advanced

## Introduction

This final workshop covers advanced R programming topics and best practices. You'll learn to create custom functions, work effectively with packages, handle errors gracefully, organize your code, document your work, and optimize performance. These skills will help you write professional, maintainable R code.

## What You'll Learn

- Creating robust custom functions
- Working with R packages (installing, loading, managing)
- Error handling and debugging
- Code organization and project structure
- Documentation and comments
- Performance optimization
- Best practices for R programming
- Creating reproducible analyses

## Prerequisites

Before starting, you should have:
- Completed all previous workshops
- Good understanding of R fundamentals
- Experience with data manipulation and analysis

## Step-by-Step Instructions

### Step 1: Creating Custom Functions

Write reusable, well-documented functions:

```r
# Basic function
calculate_stats <- function(data, column) {
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
                                fill_na = TRUE) {
  # Function body
  result <- data
  
  if (fill_na) {
    result[[temp_col]][is.na(result[[temp_col]])] <- 
      median(result[[temp_col]], na.rm = TRUE)
  }
  
  if (remove_outliers) {
    Q1 <- quantile(result[[temp_col]], 0.25, na.rm = TRUE)
    Q3 <- quantile(result[[temp_col]], 0.75, na.rm = TRUE)
    IQR <- Q3 - Q1
    result <- result[result[[temp_col]] >= Q1 - 1.5*IQR & 
                     result[[temp_col]] <= Q3 + 1.5*IQR, ]
  }
  
  return(result)
}
```

### Step 2: Error Handling

Handle errors gracefully:

```r
# Try-catch for error handling
safe_divide <- function(a, b) {
  tryCatch({
    result <- a / b
    return(result)
  }, error = function(e) {
    warning("Error in division:", e$message)
    return(NA)
  }, warning = function(w) {
    warning("Warning:", w$message)
    return(NA)
  })
}

# Check conditions before execution
read_sensor_file <- function(filename) {
  if (!file.exists(filename)) {
    stop("File not found: ", filename)
  }
  
  if (file.size(filename) == 0) {
    stop("File is empty: ", filename)
  }
  
  tryCatch({
    data <- read.csv(filename)
    return(data)
  }, error = function(e) {
    stop("Error reading file: ", e$message)
  })
}

# Using stopifnot for assertions
validate_data <- function(data) {
  stopifnot(is.data.frame(data))
  stopifnot(nrow(data) > 0)
  stopifnot("temperature" %in% names(data))
  return(TRUE)
}
```

### Step 3: Working with Packages

Manage R packages effectively:

```r
# Check if package is installed
if (!require(dplyr)) {
  install.packages("dplyr")
  library(dplyr)
}

# Function to install if missing
load_or_install <- function(package) {
  if (!require(package, character.only = TRUE)) {
    install.packages(package)
    library(package, character.only = TRUE)
  }
}

# List installed packages
installed.packages()

# Update packages
update.packages()

# Check package version
packageVersion("dplyr")

# List loaded packages
search()
```

### Step 4: Code Organization

Structure your code professionally:

```r
# At the top: Libraries and setup
library(dplyr)
library(ggplot2)
set.seed(123)

# Configuration
DATA_FILE <- "sensor_data.csv"
OUTPUT_DIR <- "output/"

# Helper functions
calculate_mean <- function(x) mean(x, na.rm = TRUE)

# Main analysis
main_analysis <- function() {
  # Load data
  data <- read.csv(DATA_FILE)
  
  # Process data
  processed <- process_data(data)
  
  # Analyze
  results <- analyze_data(processed)
  
  # Save results
  save_results(results)
  
  return(results)
}

# Run analysis
results <- main_analysis()
```

### Step 5: Documentation and Comments

Document your code:

```r
#' Calculate sensor statistics
#'
#' This function calculates mean, median, and standard deviation
#' for a specified column in a data frame.
#'
#' @param data A data frame containing sensor data
#' @param column Character string specifying the column name
#' @param na.rm Logical, whether to remove NA values (default: TRUE)
#'
#' @return A list containing mean, median, and sd
#'
#' @examples
#' data <- data.frame(temperature = rnorm(100, 25, 2))
#' stats <- calculate_sensor_stats(data, "temperature")
#'
#' @export
calculate_sensor_stats <- function(data, column, na.rm = TRUE) {
  # Validate input
  if (!is.data.frame(data)) {
    stop("data must be a data frame")
  }
  
  if (!column %in% names(data)) {
    stop("Column not found in data")
  }
  
  # Calculate statistics
  mean_val <- mean(data[[column]], na.rm = na.rm)
  median_val <- median(data[[column]], na.rm = na.rm)
  sd_val <- sd(data[[column]], na.rm = na.rm)
  
  # Return results
  return(list(
    mean = mean_val,
    median = median_val,
    sd = sd_val
  ))
}
```

### Step 6: Performance Optimization

Write efficient code:

```r
# Vectorization instead of loops
# Slow:
result <- numeric(length(temperature))
for (i in 1:length(temperature)) {
  result[i] <- temperature[i] * 2
}

# Fast:
result <- temperature * 2

# Pre-allocate vectors
n <- 10000
result <- numeric(n)  # Pre-allocate
for (i in 1:n) {
  result[i] <- i^2
}

# Use apply family instead of loops
# Instead of:
means <- numeric(ncol(data))
for (i in 1:ncol(data)) {
  means[i] <- mean(data[, i])
}

# Use:
means <- sapply(data, mean)

# Use data.table for large datasets
library(data.table)
dt <- as.data.table(data)
dt[, mean_temp := mean(temperature), by = device_id]
```

### Step 7: Reproducible Analysis

Make your analysis reproducible:

```r
# Set random seed
set.seed(123)

# Record session info
sessionInfo()

# Save environment
save.image("workspace.RData")

# Use relative paths
DATA_PATH <- file.path("data", "sensor_data.csv")

# Document versions
R_VERSION <- R.version.string
PACKAGE_VERSIONS <- sapply(c("dplyr", "ggplot2"), 
                           function(p) as.character(packageVersion(p)))

# Create reproducible script structure
# 1. Load libraries
# 2. Set seed
# 3. Load data
# 4. Process data
# 5. Analyze
# 6. Save results
```

### Step 8: Best Practices Summary

Follow these guidelines:

```r
# 1. Use meaningful variable names
temperature_readings <- c(22, 24, 23)  # Good
temp <- c(22, 24, 23)  # Less clear

# 2. Comment complex logic
# Calculate IQR-based outliers
Q1 <- quantile(data, 0.25)
Q3 <- quantile(data, 0.75)
IQR <- Q3 - Q1
outliers <- data < (Q1 - 1.5*IQR) | data > (Q3 + 1.5*IQR)

# 3. Use functions for repeated code
# Instead of repeating code, create a function

# 4. Handle errors gracefully
# Always check for potential errors

# 5. Keep functions focused
# One function should do one thing well

# 6. Test your code
# Test with sample data before using real data

# 7. Document your work
# Write clear comments and documentation
```

## Exercises

1. **Custom Function:**
   - Create a function that processes IoT sensor data
   - Include parameters for outlier removal and missing value handling
   - Add error checking and meaningful error messages
   - Document the function with comments

2. **Error Handling:**
   - Create a function that reads a CSV file safely
   - Handle cases where file doesn't exist
   - Handle cases where file is empty or corrupted
   - Return meaningful error messages

3. **Code Organization:**
   - Organize a complete analysis script
   - Separate into sections: setup, functions, main analysis
   - Add clear comments and documentation
   - Make it reproducible

4. **Performance:**
   - Compare loop vs vectorized operations
   - Measure execution time for different approaches
   - Optimize a slow piece of code

## Summary

In this workshop, you've learned:
- How to create robust custom functions
- Error handling and debugging techniques
- Working with R packages effectively
- Code organization and structure
- Documentation best practices
- Performance optimization
- Reproducible analysis practices
- R programming best practices

## Next Steps

- Review the example code in `examples/10-advanced-topics.r`
- Apply these practices to your own projects
- Continue learning and practicing R programming
- Explore advanced R topics: Shiny apps, R Markdown, package development

## Additional Resources

- Advanced R: https://adv-r.hadley.nz/
- R Style Guide: https://style.tidyverse.org/
- R Packages: https://r-pkgs.org/
- R Markdown: https://rmarkdown.rstudio.com/
