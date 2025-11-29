# Workshop 02: Data Structures in R
# This script demonstrates various data structures in R

# ============================================================================
# 1. Vectors - The Foundation
# ============================================================================

cat("=== Vectors ===\n")

# Creating vectors
numeric_vec <- c(1, 2, 3, 4, 5)
character_vec <- c("Sensor1", "Sensor2", "Sensor3")
logical_vec <- c(TRUE, FALSE, TRUE)

cat("Numeric vector:", numeric_vec, "\n")
cat("Character vector:", character_vec, "\n")
cat("Logical vector:", logical_vec, "\n")

# Using sequence operator
seq_vec <- 1:10
seq_vec2 <- seq(1, 10, by = 2)
cat("Sequence 1:10:", seq_vec, "\n")
cat("Sequence by 2:", seq_vec2, "\n")

# Vector operations
vec1 <- c(1, 2, 3)
vec2 <- c(4, 5, 6)
vec_sum <- vec1 + vec2
vec_prod <- vec1 * vec2

cat("Vector sum:", vec_sum, "\n")
cat("Vector product:", vec_prod, "\n")

# Vector functions
cat("Length:", length(numeric_vec), "\n")
cat("Sum:", sum(numeric_vec), "\n")
cat("Mean:", mean(numeric_vec), "\n")

# ============================================================================
# 2. Lists - Heterogeneous Collections
# ============================================================================

cat("\n=== Lists ===\n")

# Creating a list
device_info <- list(
  device_id = "IoT-001",
  temperature = 25.5,
  is_active = TRUE,
  sensors = c("temp", "humidity", "pressure")
)

cat("Device ID:", device_info$device_id, "\n")
cat("Temperature:", device_info$temperature, "\n")
cat("Sensors:", device_info$sensors, "\n")

# Nested lists
nested_list <- list(
  device1 = list(id = "D001", status = "online", temp = 22.5),
  device2 = list(id = "D002", status = "offline", temp = NA)
)

cat("Device 1 ID:", nested_list$device1$id, "\n")
cat("Device 1 Status:", nested_list$device1$status, "\n")

# ============================================================================
# 3. Matrices - Two-Dimensional Arrays
# ============================================================================

cat("\n=== Matrices ===\n")

# Creating matrices
matrix1 <- matrix(1:12, nrow = 3, ncol = 4)
cat("Matrix 1:\n")
print(matrix1)

matrix2 <- matrix(1:12, nrow = 3, ncol = 4, byrow = TRUE)
cat("\nMatrix 2 (byrow=TRUE):\n")
print(matrix2)

# Matrix with row and column names
sensor_data <- matrix(
  c(22, 24, 23, 25, 21, 22),
  nrow = 2,
  ncol = 3,
  dimnames = list(
    c("Morning", "Evening"),
    c("Sensor1", "Sensor2", "Sensor3")
  )
)

cat("\nSensor Data Matrix:\n")
print(sensor_data)

# Accessing matrix elements
cat("Morning, Sensor2:", sensor_data[1, 2], "\n")
cat("Morning row:", sensor_data[1, ], "\n")
cat("Sensor2 column:", sensor_data[, 2], "\n")

# Matrix operations
cat("\nMatrix addition:\n")
print(matrix1 + matrix2)

# ============================================================================
# 4. Arrays - Multi-Dimensional Structures
# ============================================================================

cat("\n=== Arrays ===\n")

# Creating a 3D array
array_data <- array(1:24, dim = c(2, 3, 4))
cat("Array dimensions:", dim(array_data), "\n")
cat("Array element [1,2,3]:", array_data[1, 2, 3], "\n")

# ============================================================================
# 5. Data Frames - The Workhorse of R
# ============================================================================

cat("\n=== Data Frames ===\n")

# Creating a data frame
iot_data <- data.frame(
  device_id = c("D001", "D002", "D003", "D004"),
  temperature = c(22.5, 24.3, 21.8, 25.1),
  humidity = c(45, 52, 48, 55),
  status = c("online", "online", "offline", "online"),
  stringsAsFactors = FALSE
)

cat("IoT Data Frame:\n")
print(iot_data)

cat("\nData Frame Structure:\n")
str(iot_data)

cat("\nSummary Statistics:\n")
print(summary(iot_data))

# Accessing columns
cat("\nTemperature column:\n")
print(iot_data$temperature)

cat("\nHumidity column:\n")
print(iot_data[["humidity"]])

# Accessing rows
cat("\nFirst row:\n")
print(iot_data[1, ])

cat("\nFirst three rows:\n")
print(iot_data[1:3, ])

# Adding new columns
iot_data$pressure <- c(1013, 1015, 1012, 1014)
cat("\nData Frame with Pressure:\n")
print(iot_data)

# Subsetting data frames
cat("\nOnline devices:\n")
print(subset(iot_data, status == "online"))

cat("\nHigh temperature devices:\n")
print(iot_data[iot_data$temperature > 23, ])

# ============================================================================
# 6. Factors - Categorical Data
# ============================================================================

cat("\n=== Factors ===\n")

# Creating factors
device_status <- factor(c("online", "offline", "online", "online"))
cat("Device Status Factor:\n")
print(device_status)
cat("Levels:", levels(device_status), "\n")

# Ordered factors
priority <- factor(
  c("low", "medium", "high", "medium"),
  levels = c("low", "medium", "high"),
  ordered = TRUE
)

cat("\nPriority Factor:\n")
print(priority)
cat("Is ordered:", is.ordered(priority), "\n")

# Converting factors
cat("\nAs character:", as.character(device_status), "\n")
cat("As numeric:", as.numeric(device_status), "\n")

# ============================================================================
# 7. Advanced Indexing and Subsetting
# ============================================================================

cat("\n=== Advanced Indexing ===\n")

temperatures <- c(22, 24, 23, 25, 21)
cat("Temperatures:", temperatures, "\n")

# Logical indexing
high_temp <- temperatures[temperatures > 23]
cat("High temperatures (>23):", high_temp, "\n")

# Using which()
indices <- which(temperatures > 23)
cat("Indices of high temps:", indices, "\n")

# Subsetting data frames with conditions
cat("\nOnline devices with temp > 23:\n")
print(iot_data[iot_data$temperature > 23 & iot_data$status == "online", ])

# Using subset() function
cat("\nSubset with select:\n")
print(subset(iot_data, temperature > 23, select = c(device_id, temperature)))

# ============================================================================
# Exercise Solutions
# ============================================================================

cat("\n=== Exercise 1: Vector Operations ===\n")
temp_readings <- c(22, 24, 26, 23, 27, 25, 28, 21, 29, 24)
cat("Readings:", temp_readings, "\n")
cat("Mean:", mean(temp_readings), "\n")
cat("SD:", sd(temp_readings), "\n")
cat("Above 25:", temp_readings[temp_readings > 25], "\n")

cat("\n=== Exercise 2: Data Frame Creation ===\n")
devices_df <- data.frame(
  device_id = c("D001", "D002", "D003", "D004", "D005"),
  location = c("Room1", "Room2", "Room3", "Room4", "Room5"),
  temperature = c(22.5, 24.3, 21.8, 25.1, 23.7),
  humidity = c(45, 52, 48, 55, 50),
  status = c("online", "online", "offline", "online", "online"),
  stringsAsFactors = FALSE
)
print(devices_df)

cat("\n=== Exercise 3: Subsetting Practice ===\n")
online_devices <- devices_df[devices_df$status == "online", ]
cat("Online devices:\n")
print(online_devices)

high_temp_devices <- devices_df[devices_df$temperature > 23, ]
cat("\nHigh temperature devices:\n")
print(high_temp_devices)

subset_df <- devices_df[, c("device_id", "temperature")]
cat("\nSubset with device_id and temperature:\n")
print(subset_df)

cat("\n=== Exercise 4: List Operations ===\n")
devices_list <- list(
  device1 = list(id = "D001", readings = c(22, 23, 24, 23, 22), status = "online"),
  device2 = list(id = "D002", readings = c(25, 26, 25, 27, 26), status = "online"),
  device3 = list(id = "D003", readings = c(20, 21, 20, 19, 20), status = "offline")
)

cat("Device 2 readings:", devices_list$device2$readings, "\n")
cat("Device 2 mean:", mean(devices_list$device2$readings), "\n")
