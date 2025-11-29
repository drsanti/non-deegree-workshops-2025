# Workshop 01: R Programming Fundamentals
# This script demonstrates basic R programming concepts

# ============================================================================
# 1. Variables and Data Types
# ============================================================================

# Numeric variables
age <- 25
temperature <- 98.6
height <- 175.5

# Character (string) variables
name <- "John Doe"
device_id <- "IoT-001"

# Logical (boolean) variables
is_active <- TRUE
is_connected <- FALSE

# Check the type of variables
cat("Type of age:", class(age), "\n")
cat("Type of name:", class(name), "\n")
cat("Type of is_active:", class(is_active), "\n")

# ============================================================================
# 2. Basic Operations and Arithmetic
# ============================================================================

a <- 10
b <- 3

sum_result <- a + b
diff_result <- a - b
prod_result <- a * b
div_result <- a / b
power_result <- a^b
mod_result <- a %% b # Modulo (remainder)

cat("\nArithmetic Operations:\n")
cat("Sum:", sum_result, "\n")
cat("Difference:", diff_result, "\n")
cat("Product:", prod_result, "\n")
cat("Division:", div_result, "\n")
cat("Power:", power_result, "\n")
cat("Modulo:", mod_result, "\n")

# ============================================================================
# 3. Program Flow - Conditionals
# ============================================================================

cat("\n=== Conditionals ===\n")

temperature <- 75
if (temperature > 70) {
  cat("Temperature is high:", temperature, "\n")
}

device_status <- "online"
if (device_status == "online") {
  cat("Device is connected\n")
} else {
  cat("Device is offline\n")
}

sensor_value <- 45
if (sensor_value < 30) {
  cat("Low reading\n")
} else if (sensor_value < 60) {
  cat("Normal reading\n")
} else {
  cat("High reading\n")
}

# ============================================================================
# 4. Program Flow - Loops
# ============================================================================

cat("\n=== For Loop ===\n")
for (i in 1:5) {
  cat("Iteration", i, "\n")
}

cat("\n=== For Loop with Vector ===\n")
devices <- c("Device1", "Device2", "Device3")
for (device in devices) {
  cat("Processing", device, "\n")
}

cat("\n=== While Loop ===\n")
count <- 1
while (count <= 5) {
  cat("Count:", count, "\n")
  count <- count + 1
}

cat("\n=== Repeat Loop ===\n")
x <- 1
repeat {
  cat("Value:", x, "\n")
  x <- x + 1
  if (x > 5) break
}

# ============================================================================
# 5. Creating Functions
# ============================================================================

cat("\n=== Functions ===\n")

# Simple function
greet <- function(name) {
  paste("Hello,", name)
}

cat(greet("Alice"), "\n")

# Function with multiple parameters
calculate_area <- function(length, width) {
  area <- length * width
  return(area)
}

cat("Area of 5x3 rectangle:", calculate_area(5, 3), "\n")

# Function with default parameters
sensor_reading <- function(device_id, value = 0) {
  paste("Device", device_id, "reading:", value)
}

cat(sensor_reading("IoT-001"), "\n")
cat(sensor_reading("IoT-001", 75.5), "\n")

# Temperature conversion function
fahrenheit_to_celsius <- function(fahrenheit) {
  celsius <- (fahrenheit - 32) * 5 / 9
  return(celsius)
}

cat("\nTemperature Conversions:\n")
cat("32°F =", fahrenheit_to_celsius(32), "°C\n")
cat("68°F =", fahrenheit_to_celsius(68), "°C\n")
cat("100°F =", fahrenheit_to_celsius(100), "°C\n")

# ============================================================================
# 6. Working with Vectors
# ============================================================================

cat("\n=== Vectors ===\n")

# Create vectors
temperatures <- c(20, 22, 25, 23, 24)
device_names <- c("Sensor1", "Sensor2", "Sensor3")

cat("Temperatures:", temperatures, "\n")
cat("Mean temperature:", mean(temperatures), "\n")
cat("Max temperature:", max(temperatures), "\n")
cat("Min temperature:", min(temperatures), "\n")

# Vector indexing (starts at 1)
cat("First temperature:", temperatures[1], "\n")
cat("First three temperatures:", temperatures[1:3], "\n")
cat("Specific temperatures:", temperatures[c(1, 3, 5)], "\n")

# ============================================================================
# Exercise Solutions
# ============================================================================

cat("\n=== Exercise 1: Sensor Readings ===\n")
sensor_readings <- c(22.5, 24.3, 21.8, 25.1, 23.7)
cat("Readings:", sensor_readings, "\n")
cat("Average:", mean(sensor_readings), "\n")
cat("Maximum:", max(sensor_readings), "\n")
cat("Minimum:", min(sensor_readings), "\n")

cat("\n=== Exercise 2: Temperature Safety Check ===\n")
check_temperature <- function(temp) {
  if (temp < 20) {
    return("Too Low")
  } else if (temp > 30) {
    return("Too High")
  } else {
    return("Safe")
  }
}

test_temps <- c(15, 25, 35)
for (temp in test_temps) {
  cat("Temperature", temp, "is", check_temperature(temp), "\n")
}

cat("\n=== Exercise 3: Processing Sensor Readings ===\n")
readings <- c(22.1, 23.5, 24.8, 21.3, 25.2, 22.9, 23.7, 24.1, 22.6, 23.9)
for (i in 1:length(readings)) {
  cat("Reading", i, ":", readings[i], "\n")
}
