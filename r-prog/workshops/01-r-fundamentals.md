# Workshop 01: R Programming Fundamentals

**Duration:** 45-60 minutes  
**Level:** Beginner

## Introduction

Welcome to R programming! In this workshop, you'll learn the fundamental building blocks of R programming. You'll understand how to work with variables, different data types, control program flow, and create basic functions. These concepts form the foundation for all advanced R programming tasks.

## What You'll Learn

- Understanding variables and data types in R
- Performing basic operations and arithmetic
- Controlling program flow with conditionals and loops
- Creating and using functions
- Best practices for R programming

## Prerequisites

Before starting, you should have:
- R installed on your computer (R 4.0 or higher recommended)
- RStudio or any R-compatible IDE installed
- Basic understanding of programming concepts (helpful but not required)

## Step-by-Step Instructions

### Step 1: Understanding Variables and Data Types

R is a dynamically typed language, meaning you don't need to declare variable types explicitly. Let's start by creating variables:

```r
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

# Check the type of a variable
class(age)
class(name)
class(is_active)
```

**Key Points:**
- Use `<-` or `=` for assignment (convention prefers `<-`)
- R is case-sensitive
- Variable names can contain letters, numbers, dots, and underscores
- Use `class()` to check the data type

### Step 2: Basic Operations and Arithmetic

R supports all standard arithmetic operations:

```r
# Arithmetic operations
a <- 10
b <- 3

sum_result <- a + b
diff_result <- a - b
prod_result <- a * b
div_result <- a / b
power_result <- a ^ b
mod_result <- a %% b  # Modulo (remainder)

# Print results
print(sum_result)
print(power_result)
```

**Practice:** Try creating variables for sensor readings and calculate their average.

### Step 3: Program Flow - Conditionals

Control the flow of your program using if/else statements:

```r
# Simple if statement
temperature <- 75

if (temperature > 70) {
  print("Temperature is high")
}

# If-else statement
device_status <- "online"

if (device_status == "online") {
  print("Device is connected")
} else {
  print("Device is offline")
}

# If-else-if chain
sensor_value <- 45

if (sensor_value < 30) {
  print("Low reading")
} else if (sensor_value < 60) {
  print("Normal reading")
} else {
  print("High reading")
}
```

### Step 4: Program Flow - Loops

Loops allow you to repeat operations:

```r
# For loop - iterate over a sequence
for (i in 1:5) {
  print(paste("Iteration", i))
}

# For loop with a vector
devices <- c("Device1", "Device2", "Device3")
for (device in devices) {
  print(paste("Processing", device))
}

# While loop
count <- 1
while (count <= 5) {
  print(paste("Count:", count))
  count <- count + 1
}

# Repeat loop with break
x <- 1
repeat {
  print(x)
  x <- x + 1
  if (x > 5) break
}
```

### Step 5: Creating Functions

Functions allow you to encapsulate reusable code:

```r
# Simple function
greet <- function(name) {
  paste("Hello,", name)
}

greet("Alice")

# Function with multiple parameters
calculate_area <- function(length, width) {
  area <- length * width
  return(area)
}

calculate_area(5, 3)

# Function with default parameters
sensor_reading <- function(device_id, value = 0) {
  paste("Device", device_id, "reading:", value)
}

sensor_reading("IoT-001")
sensor_reading("IoT-001", 75.5)
```

### Step 6: Working with Vectors

Vectors are fundamental in R - they're sequences of elements of the same type:

```r
# Create vectors
temperatures <- c(20, 22, 25, 23, 24)
device_names <- c("Sensor1", "Sensor2", "Sensor3")

# Vector operations
mean_temp <- mean(temperatures)
max_temp <- max(temperatures)
min_temp <- min(temperatures)

# Accessing vector elements (indexing starts at 1)
temperatures[1]  # First element
temperatures[1:3]  # First three elements
temperatures[c(1, 3, 5)]  # Specific elements
```

## Exercises

1. **Variable Practice:**
   - Create variables for 5 IoT sensor readings (temperature values)
   - Calculate and print the average temperature
   - Find and print the maximum and minimum values

2. **Conditional Logic:**
   - Create a function that checks if a temperature reading is within a safe range (20-30 degrees)
   - Return "Safe", "Too Low", or "Too High" based on the reading

3. **Loop Practice:**
   - Use a for loop to process 10 sensor readings
   - Print each reading with its index

4. **Function Creation:**
   - Create a function that converts Fahrenheit to Celsius
   - Formula: C = (F - 32) * 5/9
   - Test with values: 32, 68, 100

## Summary

In this workshop, you've learned:
- How to create and work with variables of different types
- Basic arithmetic and operations
- Control flow with if/else statements and loops
- Creating reusable functions
- Working with vectors

## Next Steps

- Review the example code in `examples/01-r-fundamentals.r`
- Practice the exercises above
- Move on to Workshop 02: Data Structures in R

## Additional Resources

- R Documentation: https://www.r-project.org/
- RStudio Cheat Sheets: https://www.rstudio.com/resources/cheatsheets/
