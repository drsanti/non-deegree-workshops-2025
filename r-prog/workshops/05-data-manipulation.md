# Workshop 05: Data Manipulation with dplyr

**Duration:** 75-90 minutes  
**Level:** Intermediate

## Introduction

The `dplyr` package is one of the most powerful tools in R for data manipulation. It provides an intuitive grammar for data manipulation, making it easy to filter, select, transform, and summarize data. This workshop covers the core dplyr functions and how to use them together with the pipe operator (`%>%`) for efficient data analysis workflows.

## What You'll Learn

- Filtering rows with `filter()`
- Selecting columns with `select()`
- Creating new columns with `mutate()`
- Arranging data with `arrange()`
- Summarizing data with `summarize()`
- Grouping operations with `group_by()`
- Joining datasets with `*_join()` functions
- Using the pipe operator `%>%` for chaining operations

## Prerequisites

Before starting, you should have:
- Completed Workshop 02: Data Structures in R
- Completed Workshop 04: Data Import and Export
- Understanding of data frames

## Required Packages

```r
install.packages("dplyr")
library(dplyr)
```

## Step-by-Step Instructions

### Step 1: Introduction to dplyr

dplyr provides a consistent set of verbs for data manipulation:

```r
library(dplyr)

# Load sample data
data <- read.csv("sensor_data.csv")
```

### Step 2: Filtering Rows with `filter()`

Select rows that meet certain conditions:

```r
# Filter rows where temperature > 23
high_temp <- filter(data, temperature > 23)

# Multiple conditions (AND)
online_high_temp <- filter(data, status == "online", temperature > 23)

# OR conditions
warm_or_humid <- filter(data, temperature > 24 | humidity > 55)

# Using %in% operator
selected_devices <- filter(data, device_id %in% c("IoT-001", "IoT-002", "IoT-003"))
```

### Step 3: Selecting Columns with `select()`

Choose specific columns:

```r
# Select specific columns
temp_humidity <- select(data, device_id, temperature, humidity)

# Select columns by name pattern
sensor_cols <- select(data, starts_with("sensor"))

# Exclude columns
without_status <- select(data, -status)

# Select range of columns
first_three <- select(data, device_id:temperature)

# Rename while selecting
renamed <- select(data, device = device_id, temp = temperature)
```

### Step 4: Creating New Columns with `mutate()`

Add new columns or modify existing ones:

```r
# Create new column
data_new <- mutate(data, temp_fahrenheit = temperature * 9/5 + 32)

# Multiple new columns
data_new <- mutate(data,
                   temp_f = temperature * 9/5 + 32,
                   temp_category = ifelse(temperature > 24, "High", "Normal"))

# Modify existing column
data_new <- mutate(data, temperature = round(temperature, 1))

# Conditional column creation
data_new <- mutate(data,
                   status_category = case_when(
                     temperature < 20 ~ "Cold",
                     temperature < 25 ~ "Normal",
                     TRUE ~ "Hot"
                   ))
```

### Step 5: Arranging Data with `arrange()`

Sort data by one or more columns:

```r
# Sort by temperature (ascending)
sorted <- arrange(data, temperature)

# Sort descending
sorted_desc <- arrange(data, desc(temperature))

# Sort by multiple columns
sorted_multi <- arrange(data, status, desc(temperature))
```

### Step 6: Summarizing Data with `summarize()`

Calculate summary statistics:

```r
# Single summary statistic
summary_stats <- summarize(data,
                           mean_temp = mean(temperature),
                           max_temp = max(temperature),
                           min_temp = min(temperature))

# Multiple statistics
summary_stats <- summarize(data,
                           count = n(),
                           mean_temp = mean(temperature, na.rm = TRUE),
                           sd_temp = sd(temperature, na.rm = TRUE),
                           median_temp = median(temperature, na.rm = TRUE))
```

### Step 7: Grouping Operations with `group_by()`

Perform operations on groups:

```r
# Group by device_id
grouped <- group_by(data, device_id)

# Summarize by group
device_summary <- data %>%
  group_by(device_id) %>%
  summarize(
    count = n(),
    mean_temp = mean(temperature),
    max_temp = max(temperature)
  )

# Group by multiple variables
status_summary <- data %>%
  group_by(status, device_id) %>%
  summarize(avg_temp = mean(temperature))
```

### Step 8: Using the Pipe Operator `%>%`

Chain operations together for readable code:

```r
# Without pipe (nested)
result <- summarize(
  group_by(
    filter(data, status == "online"),
    device_id
  ),
  mean_temp = mean(temperature)
)

# With pipe (readable)
result <- data %>%
  filter(status == "online") %>%
  group_by(device_id) %>%
  summarize(mean_temp = mean(temperature))
```

### Step 9: Joining Datasets

Combine data from multiple sources:

```r
# Left join (keep all rows from left)
joined <- left_join(data1, data2, by = "device_id")

# Inner join (only matching rows)
joined <- inner_join(data1, data2, by = "device_id")

# Full join (all rows from both)
joined <- full_join(data1, data2, by = "device_id")

# Join by multiple columns
joined <- left_join(data1, data2, by = c("device_id", "timestamp"))
```

### Step 10: Combining Operations

Put it all together:

```r
# Complex data manipulation pipeline
result <- data %>%
  filter(status == "online") %>%
  select(device_id, temperature, humidity) %>%
  mutate(temp_category = ifelse(temperature > 24, "High", "Normal")) %>%
  group_by(device_id, temp_category) %>%
  summarize(
    count = n(),
    avg_temp = mean(temperature),
    avg_humidity = mean(humidity)
  ) %>%
  arrange(desc(avg_temp))
```

## Exercises

1. **Basic Filtering and Selection:**
   - Load your sensor data
   - Filter for online devices with temperature > 23
   - Select only device_id, temperature, and humidity columns

2. **Data Transformation:**
   - Add a new column that categorizes temperature (Low: <22, Normal: 22-25, High: >25)
   - Convert temperature to Fahrenheit
   - Round all numeric columns to 1 decimal place

3. **Grouping and Summarizing:**
   - Group data by device_id
   - Calculate mean, min, and max temperature for each device
   - Find the device with the highest average temperature

4. **Complex Pipeline:**
   - Filter for online devices
   - Group by device_id
   - Calculate daily statistics (mean, max, min) for temperature and humidity
   - Sort by mean temperature descending
   - Select top 5 devices

## Summary

In this workshop, you've learned:
- How to filter rows with `filter()`
- Selecting columns with `select()`
- Creating and modifying columns with `mutate()`
- Sorting data with `arrange()`
- Summarizing data with `summarize()`
- Grouping operations with `group_by()`
- Joining datasets with `*_join()` functions
- Using the pipe operator for readable code

## Next Steps

- Review the example code in `examples/05-data-manipulation.r`
- Practice with your own datasets
- Move on to Workshop 06: Data Visualization with ggplot2

## Additional Resources

- dplyr documentation: https://dplyr.tidyverse.org/
- dplyr cheatsheet: https://www.rstudio.com/resources/cheatsheets/
- Tidyverse: https://www.tidyverse.org/
