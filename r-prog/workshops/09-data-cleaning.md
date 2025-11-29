# Workshop 09: Data Cleaning and Preprocessing

**Duration:** 90-120 minutes  
**Level:** Intermediate

## Introduction

Real-world data is rarely clean and ready for analysis. This workshop covers essential data cleaning techniques including handling missing values, detecting and treating outliers, data transformation, and normalization. These skills are crucial for preparing IoT sensor data and any real-world dataset for analysis.

## What You'll Learn

- Identifying and handling missing values
- Detecting outliers using various methods
- Treating outliers (removal, transformation, capping)
- Data transformation techniques
- Normalization and standardization
- Data type conversions
- Handling inconsistent data

## Prerequisites

Before starting, you should have:
- Completed Workshop 02: Data Structures in R
- Completed Workshop 05: Data Manipulation with dplyr
- Understanding of data frames

## Required Packages

```r
install.packages(c("dplyr", "tidyr", "outliers"))
library(dplyr)
library(tidyr)
```

## Step-by-Step Instructions

### Step 1: Identifying Missing Values

Detect missing data:

```r
# Check for missing values
is.na(data)
sum(is.na(data))
colSums(is.na(data))

# Percentage of missing values
mean(is.na(data$temperature)) * 100

# Visualize missing values
library(VIM)
aggr(data)

# Summary of missing values
summary(data)
```

### Step 2: Handling Missing Values

Deal with missing data:

```r
# Remove rows with any missing values
data_clean <- na.omit(data)

# Remove rows where specific column is missing
data_clean <- data[!is.na(data$temperature), ]

# Fill missing values with mean
data$temperature[is.na(data$temperature)] <- mean(data$temperature, na.rm = TRUE)

# Fill with median
data$temperature[is.na(data$temperature)] <- median(data$temperature, na.rm = TRUE)

# Forward fill (carry last observation forward)
library(zoo)
data$temperature <- na.locf(data$temperature)

# Fill with previous value
data$temperature <- ifelse(is.na(data$temperature), 
                          lag(data$temperature), 
                          data$temperature)
```

### Step 3: Detecting Outliers

Identify unusual values:

```r
# Using IQR method
Q1 <- quantile(temperature, 0.25, na.rm = TRUE)
Q3 <- quantile(temperature, 0.75, na.rm = TRUE)
IQR <- Q3 - Q1
lower_bound <- Q1 - 1.5 * IQR
upper_bound <- Q3 + 1.5 * IQR
outliers <- temperature < lower_bound | temperature > upper_bound

# Using Z-score method
z_scores <- abs(scale(temperature))
outliers <- z_scores > 3

# Using boxplot
boxplot(temperature)
outlier_values <- boxplot.stats(temperature)$out

# Visual detection
plot(temperature)
hist(temperature)
```

### Step 4: Treating Outliers

Handle outliers appropriately:

```r
# Remove outliers
data_clean <- data[!outliers, ]

# Cap outliers (winsorization)
data$temperature[data$temperature > upper_bound] <- upper_bound
data$temperature[data$temperature < lower_bound] <- lower_bound

# Transform to reduce outlier impact
data$temperature_log <- log(data$temperature)
data$temperature_sqrt <- sqrt(data$temperature)

# Replace with median
data$temperature[outliers] <- median(data$temperature, na.rm = TRUE)
```

### Step 5: Data Transformation

Transform variables:

```r
# Log transformation
data$log_temp <- log(data$temperature)

# Square root transformation
data$sqrt_temp <- sqrt(data$temperature)

# Box-Cox transformation
library(MASS)
bc <- boxcox(lm(temperature ~ 1, data = data))
lambda <- bc$x[which.max(bc$y)]
data$bc_temp <- (data$temperature^lambda - 1) / lambda

# Standardization (z-score)
data$temp_z <- scale(data$temperature)

# Min-Max normalization
data$temp_norm <- (data$temperature - min(data$temperature)) / 
                  (max(data$temperature) - min(data$temperature))
```

### Step 6: Normalization and Standardization

Scale your data:

```r
# Standardization (mean = 0, SD = 1)
standardized <- scale(data$temperature)

# Min-Max normalization (0 to 1)
normalized <- (data$temperature - min(data$temperature)) / 
              (max(data$temperature) - min(data$temperature))

# Robust standardization (using median and MAD)
robust_z <- (data$temperature - median(data$temperature)) / 
            mad(data$temperature)

# Using dplyr
data <- data %>%
  mutate(
    temp_std = scale(temperature),
    temp_norm = (temperature - min(temperature)) / 
                (max(temperature) - min(temperature))
  )
```

### Step 7: Data Type Conversions

Fix data types:

```r
# Convert to numeric
data$temperature <- as.numeric(data$temperature)

# Convert to factor
data$status <- as.factor(data$status)

# Convert to date
data$timestamp <- as.Date(data$timestamp)
data$timestamp <- ymd(data$timestamp)  # Using lubridate

# Convert to character
data$device_id <- as.character(data$device_id)

# Check data types
str(data)
sapply(data, class)
```

### Step 8: Handling Inconsistent Data

Clean inconsistent entries:

```r
# Remove duplicates
data_unique <- unique(data)
data_unique <- distinct(data)

# Fix inconsistent capitalization
data$status <- tolower(data$status)
data$status <- toupper(data$status)

# Trim whitespace
data$device_id <- trimws(data$device_id)

# Fix inconsistent formats
data$status[data$status %in% c("ON", "On", "on")] <- "online"
data$status[data$status %in% c("OFF", "Off", "off")] <- "offline"

# Using stringr for advanced string operations
library(stringr)
data$device_id <- str_trim(data$device_id)
data$status <- str_to_lower(data$status)
```

### Step 9: Complete Data Cleaning Pipeline

Put it all together:

```r
# Complete cleaning function
clean_data <- function(data) {
  # Remove duplicates
  data <- distinct(data)
  
  # Handle missing values
  data$temperature[is.na(data$temperature)] <- 
    median(data$temperature, na.rm = TRUE)
  
  # Remove outliers
  Q1 <- quantile(data$temperature, 0.25, na.rm = TRUE)
  Q3 <- quantile(data$temperature, 0.75, na.rm = TRUE)
  IQR <- Q3 - Q1
  data <- data[data$temperature >= Q1 - 1.5*IQR & 
               data$temperature <= Q3 + 1.5*IQR, ]
  
  # Standardize
  data$temperature_std <- scale(data$temperature)
  
  return(data)
}
```

## Exercises

1. **Missing Values:**
   - Create a dataset with missing values
   - Identify all missing values
   - Fill missing values using appropriate method
   - Compare before and after

2. **Outlier Detection:**
   - Detect outliers using IQR method
   - Visualize outliers using boxplot
   - Cap outliers instead of removing them
   - Compare distributions before and after

3. **Data Transformation:**
   - Apply log transformation to skewed data
   - Standardize temperature values
   - Normalize humidity to 0-1 range
   - Compare original and transformed data

4. **Complete Pipeline:**
   - Create a function that cleans sensor data
   - Handle missing values, outliers, and inconsistencies
   - Return cleaned and standardized data
   - Test with sample data

## Summary

In this workshop, you've learned:
- How to identify and handle missing values
- Detecting outliers using various methods
- Treating outliers appropriately
- Data transformation techniques
- Normalization and standardization
- Data type conversions
- Building complete cleaning pipelines

## Next Steps

- Review the example code in `examples/09-data-cleaning.r`
- Practice with your own messy datasets
- Move on to Workshop 10: Advanced Topics and Best Practices

## Additional Resources

- Data Cleaning in R: https://www.r-bloggers.com/2020/04/data-cleaning-in-r/
- tidyr documentation: https://tidyr.tidyverse.org/
