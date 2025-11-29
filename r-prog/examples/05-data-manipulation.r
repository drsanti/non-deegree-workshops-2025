# Workshop 05: Data Manipulation with dplyr
# This script demonstrates data manipulation using dplyr

# Install and load required libraries
# Install packages if not already installed
if (!require(dplyr, quietly = TRUE)) {
  cat("Installing dplyr package...\n")
  install.packages("dplyr")
}

# Load libraries
library(dplyr)

# ============================================================================
# Setup: Create Sample Data
# ============================================================================

cat("=== Creating Sample Data ===\n")

set.seed(123)
sensor_data <- data.frame(
  device_id = rep(paste0("IoT-", sprintf("%03d", 1:5)), each = 10),
  timestamp = rep(1:10, 5),
  temperature = round(rnorm(50, mean = 25, sd = 2), 2),
  humidity = round(runif(50, 40, 60), 1),
  pressure = round(rnorm(50, mean = 1013, sd = 5), 1),
  status = sample(c("online", "offline"), 50, replace = TRUE, prob = c(0.8, 0.2))
)

cat("Sample Sensor Data (first 10 rows):\n")
print(head(sensor_data, 10))

# ============================================================================
# 2. Filtering Rows with filter()
# ============================================================================

cat("\n=== Filtering Rows ===\n")

# Filter rows where temperature > 23
high_temp <- filter(sensor_data, temperature > 23)
cat("Rows with temperature > 23:\n")
print(head(high_temp, 5))

# Multiple conditions (AND)
online_high_temp <- filter(sensor_data, status == "online", temperature > 23)
cat("\nOnline devices with temperature > 23:\n")
print(head(online_high_temp, 5))

# OR conditions
warm_or_humid <- filter(sensor_data, temperature > 24 | humidity > 55)
cat("\nDevices with temp > 24 OR humidity > 55:\n")
print(head(warm_or_humid, 5))

# Using %in% operator
selected_devices <- filter(sensor_data, device_id %in% c("IoT-001", "IoT-002", "IoT-003"))
cat("\nSelected devices (IoT-001, IoT-002, IoT-003):\n")
print(head(selected_devices, 5))

# ============================================================================
# 3. Selecting Columns with select()
# ============================================================================

cat("\n=== Selecting Columns ===\n")

# Select specific columns
temp_humidity <- select(sensor_data, device_id, temperature, humidity)
cat("Selected columns (device_id, temperature, humidity):\n")
print(head(temp_humidity, 5))

# Exclude columns
without_status <- select(sensor_data, -status)
cat("\nAll columns except status:\n")
print(head(without_status, 5))

# Select range of columns
first_three <- select(sensor_data, device_id:temperature)
cat("\nFirst three columns:\n")
print(head(first_three, 5))

# Rename while selecting
renamed <- select(sensor_data, device = device_id, temp = temperature)
cat("\nRenamed columns:\n")
print(head(renamed, 5))

# ============================================================================
# 4. Creating New Columns with mutate()
# ============================================================================

cat("\n=== Creating New Columns ===\n")

# Create new column
data_new <- mutate(sensor_data, temp_fahrenheit = temperature * 9/5 + 32)
cat("Data with Fahrenheit temperature:\n")
print(head(select(data_new, device_id, temperature, temp_fahrenheit), 5))

# Multiple new columns
data_new <- mutate(sensor_data,
                   temp_f = temperature * 9/5 + 32,
                   temp_category = ifelse(temperature > 24, "High", "Normal"))
cat("\nData with multiple new columns:\n")
print(head(select(data_new, device_id, temperature, temp_f, temp_category), 5))

# Conditional column creation
data_new <- mutate(sensor_data,
                   status_category = case_when(
                     temperature < 20 ~ "Cold",
                     temperature < 25 ~ "Normal",
                     TRUE ~ "Hot"
                   ))
cat("\nData with status category:\n")
print(head(select(data_new, device_id, temperature, status_category), 5))

# ============================================================================
# 5. Arranging Data with arrange()
# ============================================================================

cat("\n=== Arranging Data ===\n")

# Sort by temperature (ascending)
sorted <- arrange(sensor_data, temperature)
cat("Sorted by temperature (ascending):\n")
print(head(sorted, 5))

# Sort descending
sorted_desc <- arrange(sensor_data, desc(temperature))
cat("\nSorted by temperature (descending):\n")
print(head(sorted_desc, 5))

# Sort by multiple columns
sorted_multi <- arrange(sensor_data, status, desc(temperature))
cat("\nSorted by status, then temperature (descending):\n")
print(head(sorted_multi, 5))

# ============================================================================
# 6. Summarizing Data with summarize()
# ============================================================================

cat("\n=== Summarizing Data ===\n")

# Single summary statistic
summary_stats <- summarize(sensor_data,
                           mean_temp = mean(temperature),
                           max_temp = max(temperature),
                           min_temp = min(temperature))
cat("Summary statistics:\n")
print(summary_stats)

# Multiple statistics
summary_stats <- summarize(sensor_data,
                           count = n(),
                           mean_temp = mean(temperature, na.rm = TRUE),
                           sd_temp = sd(temperature, na.rm = TRUE),
                           median_temp = median(temperature, na.rm = TRUE))
cat("\nDetailed summary statistics:\n")
print(summary_stats)

# ============================================================================
# 7. Grouping Operations with group_by()
# ============================================================================

cat("\n=== Grouping Operations ===\n")

# Group by device_id
grouped <- group_by(sensor_data, device_id)

# Summarize by group
device_summary <- sensor_data %>%
  group_by(device_id) %>%
  summarize(
    count = n(),
    mean_temp = mean(temperature),
    max_temp = max(temperature),
    min_temp = min(temperature)
  )
cat("Summary by device:\n")
print(device_summary)

# Group by multiple variables
status_summary <- sensor_data %>%
  group_by(status, device_id) %>%
  summarize(avg_temp = mean(temperature), .groups = "drop")
cat("\nSummary by status and device:\n")
print(status_summary)

# ============================================================================
# 8. Using the Pipe Operator %>%
# ============================================================================

cat("\n=== Using Pipe Operator ===\n")

# Without pipe (nested) - hard to read
result_nested <- summarize(
  group_by(
    filter(sensor_data, status == "online"),
    device_id
  ),
  mean_temp = mean(temperature)
)

# With pipe (readable)
result_pipe <- sensor_data %>%
  filter(status == "online") %>%
  group_by(device_id) %>%
  summarize(mean_temp = mean(temperature))

cat("Result using pipe operator:\n")
print(result_pipe)

# ============================================================================
# 9. Joining Datasets
# ============================================================================

cat("\n=== Joining Datasets ===\n")

# Create device metadata
device_metadata <- data.frame(
  device_id = paste0("IoT-", sprintf("%03d", 1:5)),
  location = c("Room1", "Room2", "Room3", "Room4", "Room5"),
  installation_date = as.Date(c("2024-01-01", "2024-01-15", "2024-02-01", 
                                 "2024-02-15", "2024-03-01"))
)

cat("Device Metadata:\n")
print(device_metadata)

# Left join (keep all rows from left)
joined <- left_join(sensor_data, device_metadata, by = "device_id")
cat("\nLeft join result (first 5 rows):\n")
print(head(joined, 5))

# Inner join (only matching rows)
inner_joined <- inner_join(sensor_data, device_metadata, by = "device_id")
cat("\nInner join (same result in this case):\n")
print(head(inner_joined, 5))

# ============================================================================
# 10. Combining Operations
# ============================================================================

cat("\n=== Complex Pipeline ===\n")

# Complex data manipulation pipeline
result <- sensor_data %>%
  filter(status == "online") %>%
  select(device_id, temperature, humidity) %>%
  mutate(temp_category = ifelse(temperature > 24, "High", "Normal")) %>%
  group_by(device_id, temp_category) %>%
  summarize(
    count = n(),
    avg_temp = mean(temperature),
    avg_humidity = mean(humidity),
    .groups = "drop"
  ) %>%
  arrange(desc(avg_temp))

cat("Complex pipeline result:\n")
print(result)

# ============================================================================
# Exercise Solutions
# ============================================================================

cat("\n=== Exercise 1: Basic Filtering and Selection ===\n")
exercise1 <- sensor_data %>%
  filter(status == "online", temperature > 23) %>%
  select(device_id, temperature, humidity)
cat("Online devices with temp > 23:\n")
print(head(exercise1, 5))

cat("\n=== Exercise 2: Data Transformation ===\n")
exercise2 <- sensor_data %>%
  mutate(
    temp_category = case_when(
      temperature < 22 ~ "Low",
      temperature <= 25 ~ "Normal",
      TRUE ~ "High"
    ),
    temp_fahrenheit = temperature * 9/5 + 32,
    temperature = round(temperature, 1),
    humidity = round(humidity, 1),
    pressure = round(pressure, 1)
  )
cat("Data with transformations:\n")
print(head(select(exercise2, device_id, temperature, temp_fahrenheit, temp_category), 5))

cat("\n=== Exercise 3: Grouping and Summarizing ===\n")
exercise3 <- sensor_data %>%
  group_by(device_id) %>%
  summarize(
    mean_temp = mean(temperature),
    min_temp = min(temperature),
    max_temp = max(temperature),
    .groups = "drop"
  ) %>%
  arrange(desc(mean_temp))

cat("Summary by device:\n")
print(exercise3)
cat("\nDevice with highest average temperature:", exercise3$device_id[1], "\n")

cat("\n=== Exercise 4: Complex Pipeline ===\n")
exercise4 <- sensor_data %>%
  filter(status == "online") %>%
  group_by(device_id) %>%
  summarize(
    mean_temp = mean(temperature),
    max_temp = max(temperature),
    min_temp = min(temperature),
    mean_humidity = mean(humidity),
    max_humidity = max(humidity),
    min_humidity = min(humidity),
    .groups = "drop"
  ) %>%
  arrange(desc(mean_temp)) %>%
  head(5)

cat("Top 5 devices by mean temperature:\n")
print(exercise4)
